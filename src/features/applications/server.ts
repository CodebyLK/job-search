"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// FETCH: Get all applications sorted by most recently updated
export async function getApplications() {
    return await prisma.application.findMany({
        orderBy: { updatedAt: "desc" },
    });
}

// ACTION: We will wire this up to a form later
export async function createApplication(data: {
    company: string;
    role: string;
    status: string;
    postUrl?: string;
}) {
    await prisma.application.create({
        data: {
            company: data.company,
            role: data.role,
            status: data.status,
            postUrl: data.postUrl,
        },
    });

    // Instantly refresh the UI
    revalidatePath("/applications");
}

// FETCH: Get a single application by ID
export async function getApplicationById(id: string) {
    return await prisma.application.findUnique({
        where: { id },
    });
}