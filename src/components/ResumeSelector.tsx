"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateApplicationResume } from "@/features/applications/server";
// Import the actual database model type
import { ResumeVariant } from "@prisma/client";

interface ResumeSelectorProps {
    applicationId: string;
    resumes: ResumeVariant[]; // Use the real type instead of any[]
    currentResumeId?: string | null;
}

export function ResumeSelector({ applicationId, resumes, currentResumeId }: ResumeSelectorProps) {

    // Explicitly type 'val' as string
    const handleValueChange = (val: string) => {
        updateApplicationResume(applicationId, val === "none" ? null : val);
    };

    return (
        <Select
            defaultValue={currentResumeId || "none"}
            onValueChange={handleValueChange}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a resume..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">No resume selected</SelectItem>
                {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                        {r.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}