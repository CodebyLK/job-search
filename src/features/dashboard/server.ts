"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
    const [totalApplications, activeInterviews, offers, recentApplications] = await Promise.all([
        // 1. Count ALL real applications (ignoring drafts)
        prisma.application.count({
            where: { status: { notIn: ["DRAFT", "Draft", "draft"] } }
        }),

        // 2. 💡 THE FIX: Count Applications that are currently in the "INTERVIEWING" stage
        prisma.application.count({
            where: { status: { in: ["INTERVIEWING", "Interviewing", "interviewing"] } }
        }),

        // 3. Count Applications with Offers
        prisma.application.count({
            where: { status: { in: ["OFFER", "Offer", "offer"] } }
        }),

        // 4. Fetch the 5 most recent real applications for the UI list
        prisma.application.findMany({
            where: { status: { notIn: ["DRAFT", "Draft", "draft"] } },
            orderBy: { updatedAt: "desc" },
            take: 5,
        })
    ]);

    // Calculate Response Rate: ((Interviews + Offers) / Total Applications) * 100
    // (We include Offers here because an offer implies a successful response!)
    const responseRate = totalApplications > 0
        ? Math.round(((activeInterviews + offers) / totalApplications) * 100)
        : 0;

    return {
        totalApplications,
        activeInterviews,
        offers,
        responseRate,
        recentApplications,
    };
}