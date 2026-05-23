"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2 } from "lucide-react";
import { analyzeJobApplication } from "./actions";

export function AnalyzeButton({
                                  applicationId,
                                  jobDescription
                              }: {
    applicationId: string,
    jobDescription: string | null
}) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    async function handleAnalysis() {
        if (!jobDescription) return;
        setIsAnalyzing(true);
        try {
            await analyzeJobApplication(applicationId, jobDescription);
        } catch (error) {
            console.error("AI Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    }

    return (
        <Button
            className="w-full"
            onClick={handleAnalysis}
            disabled={isAnalyzing || !jobDescription}
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