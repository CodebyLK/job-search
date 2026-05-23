"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// FETCH: Get all applications sorted by most recently updated
export async function getApplications() {
    return await prisma.application.findMany({
        orderBy: { updatedAt: "desc" },
    });
}

// ACTION: Create a new application (defaults to Draft)
export async function createApplication(data: {
    company: string;
    role: string;
    status: string;
    postUrl?: string;
    jobDescription?: string;
}) {
    await prisma.application.create({
        data: {
            company: data.company,
            role: data.role,
            status: data.status, // Should be "Draft" when creating from your form
            postUrl: data.postUrl,
            jobDescription: data.jobDescription,
        },
    });

    revalidatePath("/applications");
}

// ACTION: Update the status of an application (e.g., Draft -> Applied)
export async function updateApplicationStatus(id: string, status: string) {
    await prisma.application.update({
        where: { id },
        data: { status },
    });

    // Refresh both the list and the detail page
    revalidatePath("/applications");
    revalidatePath(`/applications/${id}`);
}

// FETCH: Get a single application by ID
export async function getApplicationById(id: string) {
    return await prisma.application.findUnique({
        where: { id },
    });
}