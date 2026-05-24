import { ApplicationTable } from "@/features/applications/ApplicationTable";
import { ApplicationSheet } from "@/features/applications/ApplicationSheet";
import { getApplications } from "@/features/applications/server";
import { getResumeOptions } from "@/features/resumes/server"; // 1. Import the fetcher

export default async function ApplicationsPage() {
    // 2. Fetch both datasets concurrently for better performance
    const [applications, resumeOptions] = await Promise.all([
        getApplications(),
        getResumeOptions()
    ]);

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your active pipeline and job drafts.
                    </p>
                </div>

                {/* 3. Pass the fetched resumes into the sheet */}
                <ApplicationSheet resumes={resumeOptions} />
            </div>

            <ApplicationTable data={applications} />
        </div>
    );
}