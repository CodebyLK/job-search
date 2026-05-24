"use server";

import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

export async function generateFitScore(applicationId: string) {
    try {
        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { resume: true }
        });

        if (!app || !app.jobDescription || !app.resume?.filePath) {
            return { success: false, error: "Missing Job Description or attached Resume." };
        }

        // 1. Read the raw PDF file exactly as it is saved on your hard drive
        const safeFilename = path.basename(app.resume.filePath);
        const filePath = path.join(process.cwd(), "storage", safeFilename);
        const dataBuffer = await fs.readFile(filePath);

        // 2. Define the exact JSON structure we want back
        const analysisSchema = z.object({
            fitScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how well the candidate's resume matches the job description."),
            aiAnalysis: z.string().describe("A concise 3-sentence analysis highlighting matches and gaps, acknowledging the candidate's transition from Chemistry to Software Engineering."),
        });

        // 3. Pass the raw file directly into Gemini's vision engine
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: analysisSchema,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `You are an expert technical recruiter and Applicant Tracking System (ATS).
                            Evaluate this candidate based on the provided Job Description and their attached Resume.
                            
                            Job Description:
                            ${app.jobDescription}`
                        },
                        {
                            type: "file",
                            data: dataBuffer,
                            mediaType: "application/pdf"
                        }
                    ]
                }
            ]
        });

        // 4. Save the results back to the database
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                fitScore: object.fitScore,
                aiAnalysis: object.aiAnalysis,
            },
        });

        revalidatePath(`/applications/${applicationId}`);
        return { success: true, score: object.fitScore };

    } catch (error) {
        console.error("AI Analysis failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

// 👇 Now accepts profileContext as the third argument
export async function generateTailoredResume(jobDescription: string, masterBullets: string, profileContext: string) {
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                fullName: z.string().describe("Leave blank or use a placeholder like '[Your Name]' if unknown."),
                contactInfo: z.string().describe("Placeholder format: City, State | Phone | Email | LinkedIn/GitHub"),
                summary: z.string().describe("A powerful 2-3 sentence professional summary tailored to the job description, framing the candidate's overarching narrative."),
                skills: z.array(z.string()).describe("A list of 8-12 core technical and soft skills relevant to the role."),
                experience: z.array(z.object({
                    company: z.string().describe("Use '[Company Name]' if not explicitly stated in the bullets."),
                    role: z.string().describe("Use a logical role title based on the bullet, or '[Role]'."),
                    dates: z.string().describe("Use '[Dates]' if unknown."),
                    bullets: z.array(z.string())
                })),
                education: z.array(z.object({
                    degree: z.string(),
                    school: z.string(),
                    dates: z.string()
                }))
            }),
            system: `You are an expert technical recruiter and ATS-optimization specialist. 
            Your goal is to generate a complete, tailored, structured resume for the provided job description using the candidate's master experience bullets.
            
            CRITICAL CANDIDATE CONTEXT & EDUCATION:
            ${profileContext}
            
            RULES:
            1. Write a compelling summary that bridges their unique background into the requirements of this specific role.
            2. Extract and match core technical skills requested in the job description.
            3. Group the master bullets logically into the experience timeline. Adapt them slightly to highlight keywords from the job description.
            4. Do not invent fake metrics. If exact companies or dates are missing for the experience section, use bracketed placeholders (e.g., "[Company Name]") so the user can fill them in later.`,
            prompt: `
            JOB DESCRIPTION:
            ${jobDescription}

            CANDIDATE'S MASTER BULLETS:
            ${masterBullets}
            `
        });

        return {
            success: true,
            resume: object
        };

    } catch (error) {
        console.error("AI Tailoring failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}