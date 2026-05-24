"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
    ExternalLink,
    MoreHorizontal,
    FileText,
    Trash,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { deleteApplication } from "./server";

// Type inferred from our Prisma Schema
type Application = {
    id: string;
    company: string;
    role: string;
    status: string;
    postUrl: string | null;
    updatedAt: Date;
    resume: { id: string; name: string } | null;
};

export function ApplicationTable({ data }: { data: Application[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // 💡 NEW: State to track which application we are trying to delete
    const [appToDelete, setAppToDelete] = useState<string | null>(null);

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

    // 💡 NEW: The function that actually fires when you click "Delete" inside the modal
    const confirmDelete = () => {
        if (!appToDelete) return;

        startTransition(async () => {
            const result = await deleteApplication(appToDelete);
            if (result.success) {
                toast.success("Application deleted successfully.");
            } else {
                toast.error("Failed to delete application.");
            }
            setAppToDelete(null); // Close the modal
        });
    };

    return (
        <>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[200px] h-9 text-xs uppercase tracking-wider">Company</TableHead>
                            <TableHead className="h-9 text-xs uppercase tracking-wider">Role</TableHead>
                            <TableHead className="h-9 text-xs uppercase tracking-wider">Resume</TableHead>
                            <TableHead className="h-9 text-xs uppercase tracking-wider">Status</TableHead>
                            <TableHead className="h-9 text-xs uppercase tracking-wider">Last Updated</TableHead>
                            <TableHead className="w-[100px] h-9 text-xs uppercase tracking-wider text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
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
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                    </a>
                                                </Button>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-white hover:bg-gray-800"
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={isPending && appToDelete === app.id}
                                                    >
                                                        {isPending && appToDelete === app.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                                        ) : (
                                                            <>
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-gray-800 text-gray-200 min-w-[200px]">
                                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 py-2.5">
                                                        <Link href={`/applications/${app.id}`} className="flex items-center w-full">
                                                            <ExternalLink className="mr-2 h-4 w-4 text-gray-400" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="bg-gray-800" />

                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 py-2.5"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setAppToDelete(app.id); // Opens the sleek modal instead of the old browser alert
                                                        }}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete Application
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 💡 NEW: The Shadcn Alert Dialog Modal */}
            <AlertDialog open={!!appToDelete} onOpenChange={(open) => !open && setAppToDelete(null)}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()} className="bg-[#1e1e1e] border-gray-800 text-gray-200 sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete this application record and remove the data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                            disabled={isPending}
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}