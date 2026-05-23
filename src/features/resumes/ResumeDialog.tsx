"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createResumeVariant } from "./server";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

export function ResumeDialog() {
    const [open, setOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsUploading(true);
        try {
            const file = formData.get("file") as File;

            // 1. Upload the file to your local API route
            const uploadData = new FormData();
            uploadData.append("file", file);

            const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const { filename } = await uploadRes.json();

            // 2. Save the metadata (name, notes, path) to your DB
            await createResumeVariant({
                name: formData.get("name") as string,
                notes: formData.get("notes") as string,
                filePath: filename
            });

            setOpen(false);
        } catch (error) {
            console.error("Failed to add resume:", error);
            toast.error("Upload failed", {
                description: "Something went wrong while saving your resume. Please try again.",
            });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Resume Variant</Button>
            </DialogTrigger>

            {/* Added manual aria-describedby link here to resolve the accessibility warning */}
            <DialogContent aria-describedby="resume-dialog-description">
                <DialogHeader>
                    <DialogTitle>Add Resume Variant</DialogTitle>
                    {/* Added ID here to link with DialogContent */}
                    <DialogDescription id="resume-dialog-description">
                        Upload a PDF version of your resume to your local storage. This will be linked to your job applications.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Resume Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Python / Data Engineering" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">File (PDF)</Label>
                        <Input id="file" name="file" type="file" accept=".pdf" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" placeholder="Any specific notes about this version?" />
                    </div>

                    <Button type="submit" className="w-full" disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Create Variant"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}