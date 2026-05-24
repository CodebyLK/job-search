import { getResumes } from "@/features/resumes/server";
import { ResumeDialog } from "@/features/resumes/ResumeDialog";
import { BulletBank } from "@/features/resumes/BulletBank"; // 👈 New Import
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, BarChart, Download } from "lucide-react";
import { Prisma } from "@prisma/client";

// Preserving your strong typing for the application count
type ResumeWithApps = Prisma.ResumeVariantGetPayload<{
    include: { applications: true }
}>;

export default async function ResumesPage() {
    const resumes: ResumeWithApps[] = await getResumes();

    return (
        <div className="p-8 space-y-12 max-w-6xl mx-auto">
            {/* TOP SECTION: PDF Vault */}
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Resume Vault</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage and download your tailored resume variations.
                        </p>
                    </div>
                    <ResumeDialog />
                </div>

                <div className="border rounded-md bg-card">
                    <Table>
                        <TableCaption>A list of your uploaded resumes.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px]">Name</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="w-[120px]">Usage</TableHead>
                                <TableHead className="w-[150px]">Updated</TableHead>
                                <TableHead className="text-right w-[100px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resumes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No resumes uploaded yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resumes.map((resume: ResumeWithApps) => (
                                    <TableRow key={resume.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            {resume.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-[250px]">
                                            {resume.notes || "—"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm font-medium">
                                                <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {resume.applications.length} apps
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(resume.updatedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* Download button wired to the API route */}
                                            <Button variant="ghost" size="icon" title="Download PDF" asChild>
                                                <a
                                                    href={`/api/download?filename=${resume.filePath}`}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only">Download {resume.name}</span>
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* BOTTOM SECTION: AI Tailoring Master Data */}
            <div className="pt-8 border-t border-border">
                <BulletBank />
            </div>
        </div>
    );
}