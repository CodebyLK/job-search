"use client";

import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MoreHorizontal, FileText } from "lucide-react"; // <-- Added FileText
import { format } from "date-fns";

// Type inferred from our Prisma Schema
type Application = {
    id: string;
    company: string;
    role: string;
    status: string;
    postUrl: string | null;
    updatedAt: Date;
    resume: { id: string; name: string } | null; // <-- Added the nested resume data
};

export function ApplicationTable({ data }: { data: Application[] }) {
    const router = useRouter(); // Initialize the router

    // Simple helper to color-code statuses
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "draft": return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
            case "applied": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
            case "interviewing": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
            case "rejected": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
            case "offer": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
            default: return "bg-gray-500/10 text-gray-500";
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px] h-9 text-xs uppercase tracking-wider">Company</TableHead>
                        <TableHead className="h-9 text-xs uppercase tracking-wider">Role</TableHead>
                        {/* Added Resume Column Header */}
                        <TableHead className="h-9 text-xs uppercase tracking-wider">Resume</TableHead>
                        <TableHead className="h-9 text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="h-9 text-xs uppercase tracking-wider">Last Updated</TableHead>
                        <TableHead className="w-[100px] h-9 text-xs uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            {/* Updated colSpan from 5 to 6 to account for the new column */}
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No applications tracked yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((app) => (
                            <TableRow
                                key={app.id}
                                className="group transition-colors hover:bg-muted/50 cursor-pointer"
                                onClick={() => router.push(`/applications/${app.id}`)}
                            >
                                <TableCell className="py-2 font-medium">{app.company}</TableCell>
                                <TableCell className="py-2">{app.role}</TableCell>

                                {/* Added Resume Cell */}
                                <TableCell className="py-2">
                                    {app.resume ? (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <FileText className="h-3.5 w-3.5" />
                                            <span className="truncate max-w-[150px]">{app.resume.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground/50 text-sm">—</span>
                                    )}
                                </TableCell>

                                <TableCell className="py-2">
                                    <Badge variant="secondary" className={`text-xs font-medium border-0 ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-2 text-muted-foreground text-sm">
                                    {format(app.updatedAt, "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="py-2 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {app.postUrl && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <a
                                                    href={app.postUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()} // Prevents row click
                                                >
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                </a>
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => e.stopPropagation()} // Prevents row click
                                        >
                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}