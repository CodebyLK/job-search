"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
    const [totalApplications, activeInterviews, offers] = await Promise.all([
        prisma.application.count(),
        prisma.interview.count({ where: { status: "Scheduled" } }), // Now this works!
        prisma.application.count({ where: { status: "Offer" } }),
    ]);

    // Calculate Response Rate: (Interviews / Total Applications) * 100
    // Handle division by zero
    const responseRate = totalApplications > 0
        ? Math.round((activeInterviews / totalApplications) * 100)
        : 0;

    return {
        totalApplications,
        activeInterviews,
        offers,
        responseRate,
    };
}