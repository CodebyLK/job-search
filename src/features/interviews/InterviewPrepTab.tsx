"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateInterviewPrep } from "./server";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function InterviewPrepTab({ applicationId, jobDescription }: { applicationId: string, jobDescription: string | null }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [questions, setQuestions] = useState<{category: string, question: string, hint: string}[] | null>(null);

    // 💡 This is the ONLY handleGenerate function!
    const handleGenerate = async () => {
        setIsGenerating(true);

        try {
            const result = await generateInterviewPrep(applicationId);

            if (result.success && result.questions) {
                setQuestions(result.questions);
                toast.success("Questions generated successfully!");
            } else {
                toast.error(result.error || "Failed to generate questions.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to reach the server.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!questions) {
        return (
            <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-12 flex flex-col items-center justify-center min-h-[500px] shadow-sm text-center">
                <Sparkles className="h-12 w-12 text-purple-500 mb-4 opacity-80" />
                <h3 className="text-xl font-bold text-gray-200 mb-2">Generate Practice Questions</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                    Our AI will cross-reference your resume with this specific job description to generate highly targeted practice questions.
                </p>
                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !jobDescription}
                    className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-8"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Profile...
                        </>
                    ) : (
                        "Generate Questions"
                    )}
                </Button>
                {!jobDescription && (
                    <p className="text-red-400 text-xs mt-4">A job description is required to generate questions.</p>
                )}
            </div>
        );
    }

    return (
        <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-200">Targeted Practice Questions</h3>
                <Button variant="outline" size="sm" onClick={() => setQuestions(null)} className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800">
                    Reset
                </Button>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {questions.map((q, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-gray-800 rounded-lg bg-[#121212] px-4">
                        <AccordionTrigger className="hover:no-underline py-4 text-left">
                            <div className="flex flex-col gap-1 pr-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-purple-500">{q.category}</span>
                                <span className="text-sm font-medium text-gray-200 leading-snug">{q.question}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-400 pt-2 pb-4">
                            <div className="bg-purple-900/10 border border-purple-900/30 rounded-md p-4 flex gap-3">
                                <Lightbulb className="h-5 w-5 text-purple-400 shrink-0" />
                                <p className="text-[13px] leading-relaxed">
                                    <strong className="text-purple-300">Strategy:</strong> {q.hint}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}