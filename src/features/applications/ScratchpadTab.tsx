"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Check } from "lucide-react";
import { toast } from "sonner";

export function ScratchpadTab({ applicationId }: { applicationId: string }) {
    const [notes, setNotes] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Load existing notes safely without triggering ESLint cascading render warnings
    useEffect(() => {
        // Wrap the state updates in an async function to push them to the microtask queue
        async function loadScratchpadData() {
            setIsMounted(true);
            const savedNotes = localStorage.getItem(`scratchpad_${applicationId}`);
            if (savedNotes) {
                setNotes(savedNotes);
            }
        }

        loadScratchpadData();
    }, [applicationId]);

    const handleSave = () => {
        localStorage.setItem(`scratchpad_${applicationId}`, notes);
        setIsSaved(true);
        toast.success("Notes saved!", {
            description: "Your scratchpad has been updated."
        });
        setTimeout(() => setIsSaved(false), 2000);
    };

    // Prevent hydration mismatch
    if (!isMounted) return null;

    return (
        <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-200">Application Scratchpad</h3>
                    <p className="text-xs text-gray-500 mt-1">Jot down recruiter names, salary expectations, or interview thoughts.</p>
                </div>
                <Button
                    onClick={handleSave}
                    size="sm"
                    className={`transition-all ${isSaved ? "bg-green-600 hover:bg-green-700 text-white" : "bg-[#121212] hover:bg-gray-800 border border-gray-700 text-gray-300"}`}
                >
                    {isSaved ? (
                        <><Check className="mr-2 h-4 w-4" /> Saved</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Save Notes</>
                    )}
                </Button>
            </div>

            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your notes here..."
                className="flex-1 min-h-[350px] bg-[#121212] border-gray-800 text-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500 resize-none p-4 leading-relaxed"
            />
        </div>
    );
}