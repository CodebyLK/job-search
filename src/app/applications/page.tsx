import { ApplicationTable } from "@/features/applications/ApplicationTable";
import { ApplicationSheet } from "@/features/applications/ApplicationSheet"; // <-- Import added
import { getApplications } from "@/features/applications/server";

export default async function ApplicationsPage() {
    const applications = await getApplications();

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your active pipeline and job drafts.
                    </p>
                </div>

                {/* Replace the static button with your new Sheet component */}
                <ApplicationSheet />
            </div>

            <ApplicationTable data={applications} />
        </div>
    );
}