"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// FETCH: Get all applications sorted by most recently updated
export async function getApplications() {
    return await prisma.application.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            resume: true, // This pulls in the linked ResumeVariant data! (Make sure this matches your Prisma schema relation name, it might be 'resumeVariant')
        }
    });
}

// ACTION: Create a new application (defaults to Draft)
export async function createApplication(data: {
    company: string;
    role: string;
    status: string;
    postUrl?: string;
    jobDescription?: string;
    resumeId?: string | null;
}) {

    // ✅ THE FIX: Coerce empty strings into a true null so SQL Server doesn't panic
    const safeResumeId = data.resumeId?.trim() ? data.resumeId : null;

    await prisma.application.create({
        data: {
            company: data.company,
            role: data.role,
            status: data.status,
            postUrl: data.postUrl,
            jobDescription: data.jobDescription,
            resumeId: safeResumeId, // Pass the sanitized variable here
        },
    });

    revalidatePath("/applications");
}

// ACTION: Update the status of an application (e.g., Draft -> Applied)
export async function updateApplicationStatus(id: string, status: string) {
    try {
        await prisma.application.update({
            where: { id },
            data: { status },
        });

        // Refresh both the list and the detail page
        revalidatePath("/applications");
        revalidatePath(`/applications/${id}`);

        // 💡 NEW: We must return this so the ApplyButton knows it worked!
        return { success: true };

    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// FETCH: Get a single application by ID
export async function getApplicationById(id: string) {
    return await prisma.application.findUnique({
        where: { id },
    });
}


export async function updateApplicationResume(applicationId: string, resumeId: string | null) {
    await prisma.application.update({
        where: { id: applicationId },
        data: { resumeId: resumeId },
    });
    revalidatePath(`/applications/${applicationId}`);
}

// ACTION: Delete an application permanently
export async function deleteApplication(id: string) {
    try {
        await prisma.application.delete({
            where: { id },
        });

        // Instantly refresh the table to remove the deleted row
        revalidatePath("/applications");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete application:", error);
        return { success: false, error: "Failed to delete application" };
    }
}