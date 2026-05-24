"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Plus, Trash2, Check, UserCircle, Briefcase, Code, GraduationCap, Minus, Wrench, Trophy } from "lucide-react";

interface ResumeItem {
    id: string;
    content: string;
}

interface ResumeSection {
    id: string;
    type: 'experience' | 'projects' | 'education' | 'skills' | 'awards';
    title: string;
    subtitle?: string;
    items: ResumeItem[];
}

export function BulletBank() {
    // Initializing state with a function to prevent cascading renders
    const [profileContext, setProfileContext] = useState<string>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("master_resume_data");
            return saved ? JSON.parse(saved).context : "";
        }
        return "";
    });

    const [sections, setSections] = useState<ResumeSection[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("master_resume_data");
            return saved ? JSON.parse(saved).sections : [];
        }
        return [];
    });

    const [isSaved, setIsSaved] = useState(false);

    function handleSave() {
        localStorage.setItem("master_resume_data", JSON.stringify({ context: profileContext, sections }));
        setIsSaved(true);
        toast.success("Resume structure saved!");
        setTimeout(() => setIsSaved(false), 2000);
    }

    function addSection(type: ResumeSection['type'], title: string) {
        setSections([...sections, {
            id: Date.now().toString(),
            type,
            title,
            subtitle: (type === 'skills' || type === 'awards') ? undefined : "Company/Detail",
            items: [{ id: Date.now().toString(), content: (type === 'skills' || type === 'awards') ? "" : "- New detail" }]
        }]);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6 mt-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-semibold">Master Resume Builder</h2>
                <Button onClick={handleSave} className={isSaved ? "bg-green-600" : "bg-blue-600"}>
                    {isSaved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Save All
                </Button>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2"><UserCircle className="text-purple-400" /> Narrative & Education</h3>
                <Textarea value={profileContext} onChange={(e) => setProfileContext(e.target.value)} className="min-h-[100px] bg-[#121212]" />
            </div>

            <div className="space-y-6">
                {sections.map((section, sIdx) => (
                    <div key={section.id} className="p-4 border border-gray-800 rounded-lg bg-[#1e1e1e] space-y-3">
                        <div className="flex gap-2 items-center">
                            {section.type === 'experience' && <Briefcase className="text-blue-400" />}
                            {section.type === 'projects' && <Code className="text-green-400" />}
                            {section.type === 'education' && <GraduationCap className="text-yellow-400" />}
                            {section.type === 'skills' && <Wrench className="text-red-400" />}
                            {section.type === 'awards' && <Trophy className="text-amber-400" />}
                            <input className="bg-transparent font-bold w-full outline-none" value={section.title} onChange={(e) => { const n = [...sections]; n[sIdx].title = e.target.value; setSections(n); }} />
                            {(section.type !== 'skills' && section.type !== 'awards') && (
                                <input className="bg-transparent text-gray-400 w-full outline-none" value={section.subtitle || ""} onChange={(e) => { const n = [...sections]; n[sIdx].subtitle = e.target.value; setSections(n); }} />
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setSections(sections.filter((_, i) => i !== sIdx))}><Trash2 className="text-red-500" size={16}/></Button>
                        </div>
                        {section.items.map((item, iIdx) => (
                            <div key={item.id} className="flex gap-2">
                                <Textarea value={item.content} onChange={(e) => { const n = [...sections]; n[sIdx].items[iIdx].content = e.target.value; setSections(n); }} className="bg-[#121212]" />
                                <Button variant="ghost" size="icon" onClick={() => { const n = [...sections]; n[sIdx].items.splice(iIdx, 1); setSections(n); }}><Minus size={16}/></Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => { const n = [...sections]; n[sIdx].items.push({ id: Date.now().toString(), content: "- " }); setSections(n); }}><Plus size={16} className="mr-2"/> Add Item</Button>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-6">
                <Button variant="outline" onClick={() => addSection('experience', 'New Experience')}><Briefcase className="mr-2" size={16}/> Add Experience</Button>
                <Button variant="outline" onClick={() => addSection('projects', 'New Project')}><Code className="mr-2" size={16}/> Add Project</Button>
                <Button variant="outline" onClick={() => addSection('skills', 'Skills')}><Wrench className="mr-2" size={16}/> Add Skills</Button>
                <Button variant="outline" onClick={() => addSection('education', 'Education')}><GraduationCap className="mr-2" size={16}/> Add Education</Button>
                <Button variant="outline" onClick={() => addSection('awards', 'Awards & Achievements')}><Trophy className="mr-2" size={16}/> Add Awards</Button>
            </div>
        </div>
    );
}