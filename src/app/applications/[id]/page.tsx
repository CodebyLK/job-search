import { getApplicationById } from "@/features/applications/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Sparkles } from "lucide-react";
import { AnalyzeButton } from "@/features/ai/AnalyzeButton";
import { ApplyButton } from "@/features/applications/ApplyButton";
import { TailorResumeButton } from "@/features/ai/TailorResumeButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// 💡 UPGRADED: The Heuristic Parser now recognizes headers and metadata
function parseJobDescription(rawText: string | null) {
    if (!rawText) return { keywords: [], paragraphs: [] };

    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const keywords: string[] = [];
    const paragraphs: string[] = [];

    // Phrases that look like tags but are actually section headers or metadata
    const excludedPhrases = [
        "summary", "what you'll do", "what we look for", "requirements",
        "qualifications", "responsibilities", "benefits", "skills",
        "job details", "the role", "about the role", "about us",
        "who you are", "what you bring", "nice to have", "bonus",
        "pay grade", "equity", "dice id", "posted", "description",
        "about affirmative", "affirm" // Added company specific ones just in case
    ];

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();

        // Check if the line contains any of our excluded phrases
        const isHeaderOrMeta = excludedPhrases.some(phrase => lowerLine.includes(phrase));
        // Check if it ends in a colon (standard for headers)
        const endsWithColon = line.endsWith(':');
        // Check if it's a hashtag like #LI-Remote
        const isHashtag = line.startsWith('#');

        if (
            line.length < 40 &&
            line.split(' ').length <= 4 &&
            !line.match(/[.!?]$/) &&
            !isHeaderOrMeta &&
            !endsWithColon &&
            !isHashtag
        ) {
            keywords.push(line);
        } else {
            paragraphs.push(line);
        }
    });

    return { keywords, paragraphs };
}

export default async function ApplicationDashboard({
                                                       params
                                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const application = await getApplicationById(id);

    if (!application) notFound();

    const { keywords, paragraphs } = parseJobDescription(application.jobDescription);

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* 👈 LEFT COLUMN: Tabbed Interface */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="details" className="w-full">

                        {/* 💡 THE FIX: Swapped hardcoded hex colors for Shadcn native utility classes */}
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="details" className="rounded-lg">Job Details</TabsTrigger>
                            <TabsTrigger value="prep" className="rounded-lg">Interview Prep</TabsTrigger>
                            <TabsTrigger value="notes" className="rounded-lg">Scratchpad</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="mt-4">
                            <div className="bg-card rounded-xl border p-6 shadow-sm min-h-[500px] flex flex-col gap-8">

                                {keywords.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-widest mb-4">Extracted Tags & Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {keywords.map((kw, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 py-1 px-3 font-medium"
                                                >
                                                    {kw}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-widest mb-4">Role Description</h3>
                                    <div className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-card-foreground/80">
                                        {paragraphs.length > 0 ? paragraphs.join('\n\n') : "No detailed description provided."}
                                    </div>
                                </div>

                            </div>
                        </TabsContent>

                        <TabsContent value="prep" className="mt-4">
                            <div className="bg-card rounded-xl border p-6 flex items-center justify-center min-h-[500px] text-muted-foreground shadow-sm">
                                AI Interview Generation Tool coming soon...
                            </div>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-4">
                            <div className="bg-card rounded-xl border p-6 flex items-center justify-center min-h-[500px] text-muted-foreground shadow-sm">
                                Scratchpad notes coming soon...
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* 👉 RIGHT COLUMN: The Sticky Sidebar */}
                <div className="space-y-6 sticky top-6">
                    <div className="rounded-xl border bg-card p-6 text-center space-y-4 shadow-sm">
                        {application.fitScore ? (
                            <div className="flex flex-col items-center">
                                <div className="text-6xl font-black text-indigo-600 mb-1">{application.fitScore}</div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Match Score</div>
                            </div>
                        ) : (
                            <div className="py-4">
                                <BrainCircuit className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground">No score generated yet.</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mt-4">
                            <AnalyzeButton
                                applicationId={application.id}
                                hasResume={!!application.resumeId}
                                hasJobDescription={!!application.jobDescription}
                            />

                            <TailorResumeButton
                                applicationId={application.id}
                                jobDescription={application.jobDescription}
                            />

                            <ApplyButton
                                applicationId={application.id}
                                status={application.status}
                            />
                        </div>
                    </div>

                    {application.aiAnalysis && (
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="font-bold flex items-center mb-4 text-indigo-900 text-sm">
                                <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                                AI Recruiter Notes
                            </h3>
                            <div className="text-[13px] text-muted-foreground leading-relaxed">
                                {application.aiAnalysis}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}