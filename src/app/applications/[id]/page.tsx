import { getApplicationById } from "@/features/applications/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalyzeButton } from "@/features/ai/AnalyzeButton";
// 1. Import your new component
import { ApplyButton } from "@/features/applications/ApplyButton";

export default async function ApplicationDashboard({
                                                       params
                                                   }: {
    params: Promise<{ id: string }> // 1. Update the type definition
}) {
    // 2. Await the params before using them
    const { id } = await params;

    // 3. Now use the 'id' variable
    const application = await getApplicationById(id);

    if (!application) notFound();

    const missingKeywords = application.aiAnalysis
        ? JSON.parse(application.aiAnalysis) as string[]
        : [];

    return (
        <div className="flex flex-col h-full space-y-6 p-6">
            {/* ... (Keep your existing Header/Top section the same) ... */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-muted/30 rounded-lg border p-6 overflow-y-auto">
                    {application.jobDescription || "No description."}
                </div>

                <div className="space-y-6">
                    {/* The Right Column */}
                    <div className="rounded-xl border bg-card p-6 text-center space-y-3">
                        {application.fitScore ? (
                            <div className="text-5xl font-bold mb-2">{application.fitScore}%</div>
                        ) : <BrainCircuit className="h-8 w-8 mx-auto mb-2" />}

                        <AnalyzeButton applicationId={application.id} jobDescription={application.jobDescription} />

                        {/* 2. Add the Apply Button here */}
                        <ApplyButton applicationId={application.id} status={application.status} />
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h3 className="font-semibold flex items-center mb-4">
                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" /> Keyword Gaps
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {missingKeywords.map((k, i) => <Badge key={i} variant="outline">{k}</Badge>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}