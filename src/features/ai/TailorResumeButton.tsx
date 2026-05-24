"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateTailoredBullets } from "./actions";

export function TailorResumeButton({
                                       applicationId,
                                       jobDescription
                                   }: {
    applicationId: string;
    jobDescription: string | null;
}) {
    const [isTailoring, setIsTailoring] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [tailoredResult, setTailoredResult] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    // 💡 UPGRADE 1: This now splits the text by newlines and wraps each bullet in its own HTML block
    function renderRichText(text: string) {
        return text.split('\n').map((line, lineIndex) => {
            if (!line.trim()) return null; // Skip blank empty lines

            const parts = line.split("**");
            return (
                <div key={lineIndex} className="mb-3">
                    {parts.map((part, index) => {
                        if (index % 2 === 1) {
                            return <strong key={index} className="text-white font-bold">{part}</strong>;
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </div>
            );
        });
    }

    async function handleTailor() {
        if (!jobDescription) {
            toast.error("Missing Job Description", { description: "You need a job description to tailor against." });
            return;
        }

        const masterBullets = localStorage.getItem("master_bullets");
        if (!masterBullets) {
            toast.error("Empty Bullet Bank", { description: "Please add your experience to the Bullet Bank first." });
            return;
        }

        setIsTailoring(true);
        try {
            const result = await generateTailoredBullets(jobDescription, masterBullets);

            if (result.success && result.text) {
                setTailoredResult(result.text);
                setIsOpen(true);
                toast.success("Resume Tailored successfully!");
            } else {
                toast.error("Generation Failed", { description: result.error || "No text returned." });
            }
        } catch (error) {
            console.error(error);
            toast.error("System Error");
        } finally {
            setIsTailoring(false);
        }
    }

    async function handleCopy() {
        try {
            // 💡 UPGRADE 2: Adds <br/> tags to the clipboard so Microsoft Word respects the spacing!
            const htmlText = tailoredResult
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>'); // Converts raw enters into HTML line breaks

            const plainText = tailoredResult.replace(/\*\*/g, '');

            const clipboardItem = new ClipboardItem({
                "text/plain": new Blob([plainText], { type: "text/plain" }),
                "text/html": new Blob([htmlText], { type: "text/html" }),
            });

            await navigator.clipboard.write([clipboardItem]);

            setIsCopied(true);
            toast.success("Copied rich text to clipboard!");
            setTimeout(() => setIsCopied(false), 2000);

        } catch (err) {
            await navigator.clipboard.writeText(tailoredResult.replace(/\*\*/g, ''));
            toast.success("Copied as plain text (Browser Fallback)");
        }
    }

    return (
        <>
            <Button
                variant="outline"
                className="w-full border-blue-600/30 hover:bg-blue-600/10 text-blue-400"
                onClick={handleTailor}
                disabled={isTailoring || !jobDescription}
            >
                {isTailoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {isTailoring ? "Tailoring..." : "Tailor Resume"}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-3xl bg-[#1e1e1e] text-gray-200 border-gray-800">
                    <DialogHeader className="flex flex-row items-center justify-between pr-8">
                        <DialogTitle>Tailored Resume Bullets</DialogTitle>
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-white">
                            {isCopied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                            {isCopied ? "Copied!" : "Copy All"}
                        </Button>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">
                            The AI specifically targeted these bolded keywords to beat the ATS. Highlight and copy this text directly into your master template.
                        </p>

                        <div className="h-96 overflow-y-auto font-mono text-[13px] bg-[#121212] border border-gray-800 focus-visible:ring-0 text-gray-400 p-6 rounded-md select-text leading-relaxed">
                            {renderRichText(tailoredResult)}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}