import { getDashboardMetrics } from "@/features/dashboard/server";
import { Briefcase, Calendar, CheckCircle2, TrendingUp } from "lucide-react";

// Changed to 'async' to allow us to await the database call
export default async function DashboardPage() {
    // This fetches the data directly from your SQL Server
    const metrics = await getDashboardMetrics();

    return (
        <div className="space-y-8 flex flex-col h-full">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Your job search overview and active pipeline.
                </p>
            </div>

            {/* Top Level Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Applications */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Applications</h3>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{metrics.totalApplications}</div>
                </div>

                {/* Active Interviews */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Active Interviews</h3>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{metrics.activeInterviews}</div>
                </div>

                {/* Offers */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Offers</h3>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{metrics.offers}</div>
                </div>

                {/* Response Rate */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Response Rate</h3>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{metrics.responseRate}%</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1">
                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Recent Applications</h3>
                    <div className="text-sm text-muted-foreground flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                        No applications found. Time to apply!
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-3 p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Upcoming Interviews</h3>
                    <div className="text-sm text-muted-foreground flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                        No interviews scheduled.
                    </div>
                </div>
            </div>
        </div>
    );
}