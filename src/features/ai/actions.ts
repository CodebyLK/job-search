"use server";

import { generateObject } from "ai";
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
                            mediaType: "application/pdf" // 👈 The fix is right here!
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
            // ✅ THE FIX: Safely extract the message without using 'any'
            error: error instanceof Error ? error.message : String(error)
        };
    }

}