import { getApplicationById } from "@/features/applications/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalyzeButton } from "@/features/ai/AnalyzeButton";

export default async function ApplicationDashboard({ params }: { params: { id: string } }) {
    const application = await getApplicationById(params.id);

    if (!application) notFound();

    const missingKeywords = application.aiAnalysis
        ? JSON.parse(application.aiAnalysis) as string[]
        : [];

    return (
        <div className="flex flex-col h-full space-y-6 p-6">
            <div className="flex items-start justify-between border-b pb-6">
                <div>
                    <Link href="/applications" className="text-sm text-muted-foreground flex items-center mb-4">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back
                    </Link>
                    <h1 className="text-3xl font-bold">{application.company}</h1>
                    <p className="text-lg text-muted-foreground">{application.role}</p>
                </div>
                {application.postUrl && (
                    <Button variant="outline" asChild>
                        <a href={application.postUrl} target="_blank">View Post <ExternalLink className="ml-2 h-4 w-4" /></a>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-muted/30 rounded-lg border p-6 overflow-y-auto">
                    {application.jobDescription || "No description."}
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border bg-card p-6 text-center">
                        {application.fitScore ? (
                            <div className="text-5xl font-bold mb-2">{application.fitScore}%</div>
                        ) : <BrainCircuit className="h-8 w-8 mx-auto mb-2" />}
                        <AnalyzeButton applicationId={application.id} jobDescription={application.jobDescription} />
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