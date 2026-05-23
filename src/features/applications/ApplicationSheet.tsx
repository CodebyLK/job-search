"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createApplication } from "./server";

export function ApplicationSheet() {
    const [isOpen, setIsOpen] = useState(false);

    // This function intercepts the form submission, sends data to the server, and closes the sheet
    async function onSubmit(formData: FormData) {
        const data = {
            company: formData.get("company") as string,
            role: formData.get("role") as string,
            status: "Draft", // New applications start as drafts until you formally apply
            postUrl: formData.get("postUrl") as string,
        };

        await createApplication(data);
        setIsOpen(false); // Close the slide-out on success
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            {/* The Button that lives on your page */}
            <SheetTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Application
                </Button>
            </SheetTrigger>

            {/* The Slide-Out Panel */}
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>New Application Draft</SheetTitle>
                    <SheetDescription>
                        Paste the job details here. We will use the description for AI analysis later.
                    </SheetDescription>
                </SheetHeader>

                <form action={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company Name</Label>
                            <Input id="company" name="company" placeholder="e.g., Microsoft" required autoFocus />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role / Title</Label>
                            <Input id="role" name="role" placeholder="e.g., Software Engineer" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postUrl">Job Posting URL (Optional)</Label>
                        <Input id="postUrl" name="postUrl" type="url" placeholder="https://linkedin.com/..." />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="jobDescription">Raw Job Description</Label>
                            <span className="text-xs text-muted-foreground">Required for AI Analysis</span>
                        </div>
                        <Textarea
                            id="jobDescription"
                            name="jobDescription"
                            placeholder="Paste the entire text of the job posting here..."
                            className="h-64 font-mono text-xs resize-none" // Monospace font makes dense text easier to scan
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Draft</Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}