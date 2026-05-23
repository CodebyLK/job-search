import { getResumes } from "@/features/resumes/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeDialog } from "@/features/resumes/ResumeDialog"; // 1. Import the Dialog
import { FileText, BarChart } from "lucide-react";
import { Prisma } from "@prisma/client";

type ResumeWithApps = Prisma.ResumeVariantGetPayload<{
    include: { applications: true }
}>;

export default async function ResumesPage() {
    const resumes: ResumeWithApps[] = await getResumes();

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Resume Vault</h1>
                {/* 2. USE THE DIALOG COMPONENT HERE */}
                <ResumeDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {resumes.map((resume: ResumeWithApps) => (
                    <Card key={resume.id} className="hover:border-primary transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold">{resume.name}</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground mb-4">
                                {resume.notes || "No notes added."}
                            </div>
                            <div className="flex items-center text-sm font-medium text-primary">
                                <BarChart className="mr-2 h-4 w-4" />
                                {resume.applications.length} applications used
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}