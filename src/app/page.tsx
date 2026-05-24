import { getDashboardMetrics } from "@/features/dashboard/server";
import { Briefcase, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
    const metrics = await getDashboardMetrics();

    // Helper to color-code the mini badges
    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "APPLIED": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
            case "INTERVIEWING": return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
            case "OFFER": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
            case "REJECTED": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
            default: return "bg-gray-500/10 text-gray-500";
        }
    };

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
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-gray-400">Total Applications</h3>
                        <Briefcase className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-100">{metrics.totalApplications}</div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-gray-400">Active Interviews</h3>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-100">{metrics.activeInterviews}</div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-gray-400">Offers</h3>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-100">{metrics.offers}</div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-gray-400">Response Rate</h3>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-100">{metrics.responseRate}%</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1">
                {/* 💡 UPGRADED: Dynamic Recent Applications List */}
                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-6">Recent Applications</h3>

                    {metrics.recentApplications.length === 0 ? (
                        <div className="text-sm text-muted-foreground flex items-center justify-center h-48 border-2 border-dashed border-gray-800 rounded-lg">
                            No active applications found. Time to apply!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {metrics.recentApplications.map((app) => (
                                <div key={app.id} className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-sm text-gray-200">{app.company}</p>
                                        <p className="text-xs text-gray-500 mt-1">{app.role}</p>
                                    </div>
                                    <Badge variant="secondary" className={`text-[10px] font-medium border-0 uppercase ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow col-span-3 p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Upcoming Interviews</h3>
                    <div className="text-sm text-muted-foreground flex items-center justify-center h-48 border-2 border-dashed border-gray-800 rounded-lg">
                        No interviews scheduled.
                    </div>
                </div>
            </div>
        </div>
    );
}