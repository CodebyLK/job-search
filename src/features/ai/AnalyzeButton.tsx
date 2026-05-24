"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2 } from "lucide-react";
import { generateFitScore } from "./actions";
import { toast } from "sonner";

export function AnalyzeButton({
                                  applicationId,
                                  hasResume,
                                  hasJobDescription
                              }: {
    applicationId: string;
    hasResume: boolean;
    hasJobDescription: boolean;
}) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    async function handleAnalysis() {
        setIsAnalyzing(true);

        try {
            const result = await generateFitScore(applicationId);

            if (result.success) {
                toast.success("Analysis Complete", {
                    description: `Your AI Fit Score is ${result.score}/100.`,
                });
            } else {
                toast.error("Analysis Failed", {
                    description: result.error || "Could not generate score.",
                });
            }
        } catch (error) {
            console.error("AI Analysis failed:", error);
            toast.error("System Error", {
                description: "Check your terminal for connection issues.",
            });
        } finally {
            setIsAnalyzing(false);
        }
    }

    return (
        <Button
            className="w-full"
            onClick={handleAnalysis}
            // 👇 The safety lock is fully engaged!
            disabled={isAnalyzing || !hasResume || !hasJobDescription}
        >
            {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? "Analyzing..." : "Generate Analysis"}
        </Button>
    );
}