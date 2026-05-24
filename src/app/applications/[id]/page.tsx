import { getApplicationById } from "@/features/applications/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, AlertTriangle, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyzeButton } from "@/features/ai/AnalyzeButton";
import { ApplyButton } from "@/features/applications/ApplyButton";

export default async function ApplicationDashboard({
                                                       params
                                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const application = await getApplicationById(id);

    if (!application) notFound();

    return (
        <div className="flex flex-col h-full space-y-6 p-6 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/applications" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Pipeline
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{application.role}</h1>
                    <p className="text-muted-foreground text-lg">{application.company}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Job Description */}
                <div className="lg:col-span-2 bg-muted/20 rounded-xl border p-6 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed shadow-sm">
                    {application.jobDescription || "No job description provided."}
                </div>

                {/* Right Column: AI Analysis & Actions */}
                <div className="space-y-6">
                    {/* Action Hub */}
                    <div className="rounded-xl border bg-card p-6 text-center space-y-4 shadow-sm">
                        {application.fitScore ? (
                            <div className="flex flex-col items-center">
                                <div className="text-6xl font-black text-indigo-600 mb-1">{application.fitScore}</div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Match Score</div>
                            </div>
                        ) : (
                            <div className="py-4">
                                <BrainCircuit className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground">No score generated yet.</p>
                            </div>
                        )}

                        {/* ✅ FIXED: Removed jobDescription prop */}
                        <AnalyzeButton applicationId={application.id} />
                        <ApplyButton applicationId={application.id} status={application.status} />
                    </div>

                    {/* ✅ FIXED: Now safely displays the AI paragraph without trying to JSON.parse it */}
                    {application.aiAnalysis && (
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="font-bold flex items-center mb-4 text-indigo-900">
                                <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                                AI Recruiter Notes
                            </h3>
                            <div className="text-sm text-muted-foreground leading-relaxed">
                                {application.aiAnalysis}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}