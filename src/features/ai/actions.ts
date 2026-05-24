"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

// 1. Centralized Persona Strategy
const RESUME_SYSTEM_PROMPT = `You are a Principal Technical Recruiter. 
Your goal is to highlight the candidate as a seasoned Software Engineer who leverages their background in Pharmaceutical Chemistry as a powerful engineering differentiator.

STRATEGIC FRAMING RULES:
- Never use "transitioning," "moving from," or "pivot."
- Present their profile as: "Software Engineer with a deep foundation in Pharmaceutical Chemistry and Analytical Systems."
- The Chemistry background must be framed as a "Technical Specialization" that provides superior skills in:
  - Regulatory-grade documentation and process integrity.
  - Scientific rigor in debugging and hypothesis-driven problem solving.
  - Precision-focused system architecture.

SUMMARY FORMAT:
- Sentence 1: Professional identity (Software Engineer + Chemistry background).
- Sentence 2: The "Bridge" (How Chemistry experience makes their code/systems more precise, reliable, or secure).
- Sentence 3: Target-role alignment (Solving the specific technical challenges mentioned in the JD).`;

export async function generateFitScore(applicationId: string) {
    try {
        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { resume: true }
        });

        if (!app || !app.jobDescription || !app.resume?.filePath) {
            return { success: false, error: "Missing Job Description or attached Resume." };
        }

        // 1. Read the raw PDF file
        const safeFilename = path.basename(app.resume.filePath);
        const filePath = path.join(process.cwd(), "storage", safeFilename);
        const dataBuffer = await fs.readFile(filePath);

        // 2. Define the exact JSON structure
        const analysisSchema = z.object({
            fitScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how well the candidate's resume matches the job description."),
            aiAnalysis: z.string().describe("A concise 3-sentence analysis highlighting matches and gaps, acknowledging the candidate's transition from Chemistry to Software Engineering."),
        });

        // 3. Pass the raw file directly into Gemini
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

export async function generateTailoredResume(jobDescription: string, masterBullets: string, profileContext: string) {
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                fullName: z.string().describe("Leave blank or use placeholder '[Your Name]'."),
                contactInfo: z.string().describe("Format: City, State | Phone | Email | LinkedIn/GitHub"),
                summary: z.string().describe("A powerful 3-sentence professional summary using the Bridge Technique."),
                skills: z.array(z.string()).describe("8-12 core technical and soft skills relevant to the role."),
                experience: z.array(z.object({
                    company: z.string(),
                    role: z.string(),
                    dates: z.string(),
                    bullets: z.array(z.string())
                })),
                education: z.array(z.object({
                    degree: z.string(),
                    school: z.string(),
                    dates: z.string()
                }))
            }),
            system: `${RESUME_SYSTEM_PROMPT}

            CRITICAL CANDIDATE CONTEXT:
            ${profileContext}`,

            prompt: `
            JOB DESCRIPTION:
            ${jobDescription}

            CANDIDATE'S MASTER EXPERIENCE DATA:
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