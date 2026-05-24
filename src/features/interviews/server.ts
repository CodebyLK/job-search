"use server";

import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google"; // 👈 Swapped to Google
import { z } from "zod";
import { buildInterviewPrepPrompt } from "@/features/ai/prompts";

// Explicitly tell the SDK to use your Gemini environment variable
const customGoogle = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

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
            model: customGoogle("gemini-2.5-flash"), // 👈 Update this exact string!
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