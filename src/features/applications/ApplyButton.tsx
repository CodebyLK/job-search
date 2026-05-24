"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateApplicationStatus } from "./server";
import {
    CheckCircle2,
    ChevronDown,
    Loader2,
    FileEdit,
    XCircle,
    Users,
    Award
} from "lucide-react";

// The different stages of your job hunt pipeline
const pipelineStatuses = [
    { label: "Draft", value: "DRAFT", icon: FileEdit, color: "text-gray-400" },
    { label: "Applied", value: "APPLIED", icon: CheckCircle2, color: "text-blue-500" },
    { label: "Interviewing", value: "INTERVIEWING", icon: Users, color: "text-purple-500" },
    { label: "Offer Received", value: "OFFER", icon: Award, color: "text-green-500" },
    { label: "Rejected", value: "REJECTED", icon: XCircle, color: "text-red-500" },
];

export function ApplyButton({
                                applicationId,
                                status
                            }: {
    applicationId: string;
    status: string;
}) {
    const [isPending, startTransition] = useTransition();

    // Find the current status object so we know which icon/label to show
    const currentStatus = pipelineStatuses.find(s => s.value.toUpperCase() === status?.toUpperCase()) || pipelineStatuses[0];
    const StatusIcon = currentStatus.icon;

    function handleStatusChange(newStatus: string) {
        if (newStatus.toUpperCase() === status?.toUpperCase()) return; // Don't update if it's the same

        startTransition(async () => {
            const result = await updateApplicationStatus(applicationId, newStatus);

            if (result.success) {
                toast.success(`Moved to ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}`, {
                    description: "Pipeline updated successfully."
                });
            } else {
                toast.error("Failed to update status");
            }
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default"
                    disabled={isPending}
                    className="w-full bg-[#1e1e1e] border border-gray-700 hover:bg-gray-800 text-white flex justify-between items-center"
                >
                    <div className="flex items-center gap-2">
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                            <StatusIcon className={`h-4 w-4 ${currentStatus.color}`} />
                        )}
                        <span>{isPending ? "Updating..." : currentStatus.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-full min-w-[200px] bg-[#1e1e1e] border-gray-800 text-gray-200">
                {pipelineStatuses.map((s) => {
                    const Icon = s.icon;
                    return (
                        <DropdownMenuItem
                            key={s.value}
                            onClick={() => handleStatusChange(s.value)}
                            className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 flex items-center gap-2 py-2.5"
                        >
                            <Icon className={`h-4 w-4 ${s.color}`} />
                            <span className="font-medium">{s.label}</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}