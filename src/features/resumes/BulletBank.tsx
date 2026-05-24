"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Plus, Trash2, Check } from "lucide-react";

export function BulletBank() {
    const [bullets, setBullets] = useState<string[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Load from local storage and split into individual rows
    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("master_bullets");
        if (saved) {
            // Split by newline and remove any empty rows
            setBullets(saved.split("\n").filter(b => b.trim() !== ""));
        } else {
            setBullets([
                "- Analyzed synthesized compounds for purity and maintained strict regulatory documentation for compliance.",
                "- Built a data engineering pipeline using Python and Pandas to extract WNBA stats from the NBA API.",
                "- Developed 'The Herd', an Android mobile application featuring community boards and study guides.",
                "- Created 'Molecular Mixology', a full-stack application bridging chemistry and software principles."
            ]);
        }
    }, []);

    function handleSave() {
        // Join the array back into a single block of text for the AI
        const textToSave = bullets.join("\n");
        localStorage.setItem("master_bullets", textToSave);

        toast.success("Saved to Bullet Bank", {
            description: "Your master experience is ready for AI tailoring.",
        });

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    }

    function updateBullet(index: number, newValue: string) {
        const newBullets = [...bullets];
        newBullets[index] = newValue;
        setBullets(newBullets);
    }

    function removeBullet(index: number) {
        const newBullets = bullets.filter((_, i) => i !== index);
        setBullets(newBullets);
    }

    function addBullet() {
        setBullets([...bullets, "- "]);
    }

    if (!isMounted) return null;

    return (
        <div className="space-y-4 max-w-4xl mx-auto mt-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Master Bullet Bank</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add, edit, or remove your raw experience here. The AI will pull from this repository to generate targeted resumes.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    className={`w-32 transition-all ${isSaved ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
                >
                    {isSaved ? (
                        <><Check className="mr-2 h-4 w-4" /> Saved!</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Save Bank</>
                    )}
                </Button>
            </div>

            <div className="space-y-3 mt-4">
                {bullets.map((bullet, index) => (
                    <div key={index} className="flex gap-2 items-start group">
                        <Textarea
                            value={bullet}
                            onChange={(e) => updateBullet(index, e.target.value)}
                            className="min-h-[60px] bg-[#1e1e1e] border-gray-800 text-gray-300 font-mono text-sm focus-visible:ring-1 focus-visible:ring-blue-500 resize-y p-3 leading-relaxed"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeBullet(index)}
                            className="h-[60px] border-gray-800 hover:bg-red-950 hover:text-red-400 hover:border-red-900 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <Button
                variant="outline"
                onClick={addBullet}
                className="w-full mt-4 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
            >
                <Plus className="mr-2 h-4 w-4" /> Add New Bullet
            </Button>
        </div>
    );
}