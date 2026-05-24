"use server";

import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { buildInterviewPrepPrompt, buildStorySuggestionPrompt, buildStarRefinementPrompt } from "@/features/ai/prompts";


// Explicitly tell the SDK to use your Gemini environment variable
const customGoogle = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// --- UI Dashboard Fetching ---
export async function getInterviews() {
    try {
        const interviews = await prisma.interview.findMany({
            orderBy: {
                scheduledFor: 'asc'
            },
            include: {
                application: {
                    select: {
                        company: true,
                        role: true,
                    }
                }
            }
        });

        return { success: true, interviews };
    } catch (error) {
        console.error("Failed to fetch interviews:", error);
        return { success: false, error: "Failed to load interview pipeline." };
    }
}

// --- AI Coach Generation ---
export async function generateInterviewPrep(applicationId: string) {
    try {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { resume: true }
        });

        if (!application || !application.jobDescription) {
            return { success: false, error: "Missing job description." };
        }

        const resumeText = application.resume?.notes || "No resume attached.";

        // Call Gemini to generate the structured JSON
        const { object } = await generateObject({
            model: customGoogle("gemini-2.5-flash"),
            schema: z.object({
                questions: z.array(z.object({
                    category: z.string(),
                    question: z.string(),
                    hint: z.string()
                }))
            }),
            prompt: buildInterviewPrepPrompt(
                application.role,
                application.company,
                application.jobDescription,
                resumeText
            )
        });

        return { success: true, questions: object.questions };

    } catch (error) {
        console.error("Failed to generate questions:", error);
        return { success: false, error: "Failed to generate interview prep." };
    }
}

// Add to src/features/interviews/server.ts

export async function getActiveApplications() {
    try {
        const apps = await prisma.application.findMany({
            // Assuming you don't want to schedule interviews for rejected jobs
            where: { status: { not: "Rejected" } },
            select: { id: true, company: true, role: true },
            orderBy: { company: 'asc' }
        });
        return { success: true, applications: apps };
    } catch (error) {
        console.error("Failed to fetch apps:", error);
        return { success: false, error: "Failed to fetch applications." };
    }
}

export async function createInterview(data: { applicationId: string; round: number; type: string; scheduledFor: Date }) {
    try {
        await prisma.interview.create({
            data: {
                applicationId: data.applicationId,
                round: data.round,
                type: data.type,
                scheduledFor: data.scheduledFor,
                status: "Scheduled"
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to create interview:", error);
        return { success: false, error: "Failed to create interview." };
    }
}

export async function deleteInterview(id: string) {
    try {
        await prisma.interview.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete interview:", error);
        return { success: false, error: "Failed to delete interview." };
    }
}

export async function updateInterview(id: string, data: { applicationId: string; round: number; type: string; scheduledFor: Date }) {
    try {
        await prisma.interview.update({
            where: { id },
            data: {
                applicationId: data.applicationId,
                round: data.round,
                type: data.type,
                scheduledFor: data.scheduledFor
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to update interview:", error);
        return { success: false, error: "Failed to update interview." };
    }
}

export async function logReflection(
    id: string,
    data: { notes: string; stumpers: string; bridgeEffectiveness: number }
) {
    try {
        await prisma.interview.update({
            where: { id },
            data: {
                status: "Completed",
                notes: data.notes,
                stumpers: data.stumpers,
                bridgeEffectiveness: data.bridgeEffectiveness
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to log reflection:", error);
        return { success: false, error: "Failed to save reflection." };
    }
}

// --- MASTER BANK ACTIONS ---

export async function getMasterStories() {
    try {
        const stories = await prisma.masterStory.findMany({
            orderBy: { category: 'asc' }
        });
        return { success: true, stories };
    } catch (error) {
        console.error("Failed to fetch stories:", error);
        return { success: false, error: "Failed to load Master Bank." };
    }
}

export async function saveMasterStory(data: { id?: string; title: string; category: string; situation: string; task: string; action: string; result: string }) {
    try {
        if (data.id) {
            await prisma.masterStory.update({ where: { id: data.id }, data });
        } else {
            await prisma.masterStory.create({ data });
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to save story:", error);
        return { success: false, error: "Failed to save story." };
    }
}

export async function deleteMasterStory(id: string) {
    try {
        await prisma.masterStory.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete story:", error);
        return { success: false, error: "Failed to delete story." };
    }
}

// --- AI MASTER BANK ACTIONS ---

export async function generateStorySuggestion(category: string) {
    try {
        // Grab the most recent resume variant for context
        const resume = await prisma.resumeVariant.findFirst({
            orderBy: { updatedAt: 'desc' }
        });
        const resumeText = resume?.notes || "No resume data available.";

        const { object } = await generateObject({
            model: customGoogle("gemini-2.5-flash"),
            schema: z.object({
                title: z.string().describe("A catchy, short title for the story"),
                situation: z.string().describe("A 1-2 sentence setup of the context"),
                task: z.string().describe("The specific challenge or responsibility"),
                action: z.string().describe("The core steps the candidate took"),
                result: z.string().describe("The final outcome or business impact")
            }),
            prompt: buildStorySuggestionPrompt(category, resumeText)
        });

        return { success: true, suggestion: object };
    } catch (error) {
        console.error("Failed to suggest story:", error);
        return { success: false, error: "Failed to generate suggestion." };
    }
}

export async function polishStarStory(category: string, rawInput: string) {
    try {
        const { object } = await generateObject({
            model: customGoogle("gemini-2.5-flash"),
            schema: z.object({
                situation: z.string(),
                task: z.string(),
                action: z.string(),
                result: z.string()
            }),
            prompt: buildStarRefinementPrompt(category, rawInput)
        });

        return { success: true, polished: object };
    } catch (error) {
        console.error("Failed to polish story:", error);
        return { success: false, error: "Failed to polish story." };
    }
}