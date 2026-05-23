"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getResumes() {
    return await prisma.resumeVariant.findMany({
        include: {
            applications: true, // This lets us count how many apps used this resume
        },
        orderBy: { updatedAt: "desc" },
    });
}

export async function createResumeVariant(data: { name: string; notes?: string }) {
    await prisma.resumeVariant.create({
        data: {
            name: data.name,
            notes: data.notes,
        },
    });
    revalidatePath("/resumes");
}