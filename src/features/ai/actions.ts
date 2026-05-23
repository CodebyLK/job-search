"use server";

// 1. Core library for the function
import { generateObject } from "ai";
// 2. Google provider for the model
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function analyzeJobApplication(applicationId: string, jobDescription: string) {
    const analysisSchema = z.object({
        fitScore: z.number().min(0).max(100).describe("A percentage score of how well a software engineering profile fits this role."),
        missingKeywords: z.array(z.string()).describe("A list of 3 to 5 mandatory technical skills or tools mentioned in the job description."),
    });

    const { object } = await generateObject({
        model: google("gemini-1.5-flash"), // Pass the provider's model here
        schema: analysisSchema,
        prompt: `Analyze the following software engineering job description. Extract the core required technical skills and evaluate a generic fit score.\n\nJob Description:\n${jobDescription}`,
    });

    await prisma.application.update({
        where: { id: applicationId },
        data: {
            fitScore: object.fitScore,
            aiAnalysis: JSON.stringify(object.missingKeywords),
        },
    });

    revalidatePath(`/applications/${applicationId}`);
}