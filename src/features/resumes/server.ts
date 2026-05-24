"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Heavy fetcher: Used for the main Resume Vault page
export async function getResumes() {
    return await prisma.resumeVariant.findMany({
        include: {
            applications: true,
        },
        orderBy: { updatedAt: "desc" },
    });
}

// 2. NEW: Lightweight fetcher used for the Application Form dropdown
export async function getResumeOptions() {
    return await prisma.resumeVariant.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: { updatedAt: "desc" }, // Most recently updated at the top
    });
}

// 3. Mutation: Handles uploading new resumes
export async function createResumeVariant(data: {
    name: string;
    notes?: string;
    filePath?: string | null;
}) {
    await prisma.resumeVariant.create({
        data: {
            name: data.name,
            notes: data.notes,
            filePath: data.filePath,
        },
    });
    revalidatePath("/resumes");
}