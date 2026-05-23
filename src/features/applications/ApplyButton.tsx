"use client";

import { Button } from "@/components/ui/button";
import { updateApplicationStatus } from "./server";
import { Send } from "lucide-react";

export function ApplyButton({ applicationId, status }: { applicationId: string, status: string }) {
    if (status !== "Draft") return null;

    return (
        <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => updateApplicationStatus(applicationId, "Applied")}
        >
            <Send className="mr-2 h-4 w-4" />
            Mark as Applied
        </Button>
    );
}