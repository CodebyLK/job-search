"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateTailoredResume } from "./actions";

// Interfaces for our modular data structure
export interface ResumeItem {
    id: string;
    content: string;
}

export interface ResumeSection {
    id: string;
    type: 'experience' | 'projects' | 'education' | 'skills' | 'awards';
    title: string;
    subtitle?: string;
    items: ResumeItem[];
}

export interface TailoredResume {
    fullName: string;
    contactInfo: string;
    summary: string;
    skills: string[];
    experience: {
        company: string;
        role: string;
        dates: string;
        bullets: string[];
    }[];
    education: {
        degree: string;
        school: string;
        dates: string;
    }[];
}

export function TailorResumeButton({
                                       applicationId,
                                       jobDescription
                                   }: {
    applicationId: string;
    jobDescription: string | null;
}) {
    const [isTailoring, setIsTailoring] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [resumeData, setResumeData] = useState<TailoredResume | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    async function handleTailor() {
        if (!jobDescription) {
            toast.error("Missing job description.");
            return;
        }

        const rawData = localStorage.getItem("master_resume_data");
        const masterData = rawData ? JSON.parse(rawData) : { context: "", sections: [] as ResumeSection[] };

        // ✅ FIXED: Now mapping over 'sections' instead of non-existent 'experience'
        // We filter for 'experience' or 'projects' to give the AI relevant work history
        const relevantSections = (masterData.sections || []).filter(
            (s: ResumeSection) => s.type === 'experience' || s.type === 'projects'
        );

        const formattedExperience = relevantSections.map((sec: ResumeSection) =>
            `SECTION: ${sec.title}\n${sec.items.map(item => item.content).join("\n")}`
        ).join("\n\n");

        setIsTailoring(true);
        try {
            const result = await generateTailoredResume(
                jobDescription,
                formattedExperience,
                masterData.context || ""
            );

            if (result.success && result.resume) {
                setResumeData(result.resume as TailoredResume);
                setIsOpen(true);
            } else {
                toast.error("Generation Failed: " + (result.error || "Unknown error"));
            }
        } finally {
            setIsTailoring(false);
        }
    }

    async function handleCopy() {
        if (!resumeData) return;

        const text = `
${resumeData.fullName}
${resumeData.contactInfo}

PROFESSIONAL SUMMARY
${resumeData.summary}

TECHNICAL SKILLS
${resumeData.skills.join(" • ")}

EXPERIENCE
${resumeData.experience.map(e => `${e.role} | ${e.company} | ${e.dates}\n${e.bullets.join("\n")}`).join("\n\n")}

EDUCATION
${resumeData.education.map(e => `${e.school}, ${e.degree} (${e.dates})`).join("\n")}
        `.trim();

        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }

    return (
        <>
            <Button onClick={handleTailor} disabled={isTailoring} variant="outline" className="w-full border-blue-600/30 hover:bg-blue-600/10 text-blue-400">
                {isTailoring ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {isTailoring ? "Generating..." : "Tailor Full Resume"}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-4xl bg-[#1e1e1e] text-gray-200 border-gray-800">
                    <DialogHeader>
                        <div className="flex flex-row items-center justify-between">
                            <DialogTitle>Tailored Resume Preview</DialogTitle>
                            <Button variant="ghost" size="sm" onClick={handleCopy} className="flex items-center gap-2 text-gray-400 hover:text-white">
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                {isCopied ? "Copied!" : "Copy to Word/Docs"}
                            </Button>
                        </div>
                    </DialogHeader>

                    {resumeData && (
                        <div className="h-[600px] overflow-y-auto bg-white text-black p-8 rounded-md font-sans border shadow-inner">
                            <h1 className="text-2xl font-bold text-center uppercase tracking-wide">{resumeData.fullName}</h1>
                            <p className="text-center text-sm mb-6">{resumeData.contactInfo}</p>

                            <h2 className="font-bold border-b border-black uppercase text-xs mb-2">Professional Summary</h2>
                            <p className="text-sm mb-4 leading-relaxed">{resumeData.summary}</p>

                            <h2 className="font-bold border-b border-black uppercase text-xs mb-2">Technical Skills</h2>
                            <p className="text-sm mb-4 font-medium">{resumeData.skills.join(" • ")}</p>

                            <h2 className="font-bold border-b border-black uppercase text-xs mb-2">Experience</h2>
                            {resumeData.experience.map((exp, i) => (
                                <div key={i} className="mb-4">
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>{exp.role}</span>
                                        <span>{exp.dates}</span>
                                    </div>
                                    <div className="italic text-sm text-gray-700">{exp.company}</div>
                                    <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                                        {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                                    </ul>
                                </div>
                            ))}

                            <h2 className="font-bold border-b border-black uppercase text-xs mb-2">Education</h2>
                            {resumeData.education.map((edu, i) => (
                                <div key={i} className="flex justify-between text-sm mb-1">
                                    <span><strong>{edu.school}</strong>, {edu.degree}</span>
                                    <span>{edu.dates}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}