"use client";

import { useEffect, useState, useCallback } from "react";
import { getMasterStories, saveMasterStory, deleteMasterStory, generateStorySuggestion, polishStarStory } from "./server";
import { Plus, Edit2, Trash2, BookOpen, Sparkles, Wand2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface MasterStory {
    id: string; title: string; category: string;
    situation: string; task: string; action: string; result: string;
}

export function MasterBank() {
    const [stories, setStories] = useState<MasterStory[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [editId, setEditId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Leadership");
    const [situation, setSituation] = useState("");
    const [task, setTask] = useState("");
    const [action, setAction] = useState("");
    const [result, setResult] = useState("");

    // AI Loading States
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isPolishing, setIsPolishing] = useState(false);

    const fetchStories = useCallback(async () => {
        const res = await getMasterStories();
        if (res.success && res.stories) setStories(res.stories);
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchStories();
        };
        init();
    }, [fetchStories]);

    const resetForm = () => {
        setEditId(null); setTitle(""); setCategory("Leadership");
        setSituation(""); setTask(""); setAction(""); setResult("");
    };

    const handleOpenEdit = (story: MasterStory) => {
        setEditId(story.id); setTitle(story.title); setCategory(story.category);
        setSituation(story.situation); setTask(story.task); setAction(story.action); setResult(story.result);
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this story?")) return;
        const res = await deleteMasterStory(id);
        if (res.success) { toast.success("Story deleted"); fetchStories(); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !situation || !action || !result) return toast.error("Please fill out the core STAR fields.");

        const res = await saveMasterStory({ id: editId || undefined, title, category, situation, task, action, result });
        if (res.success) {
            toast.success("Story saved to Master Bank!");
            setIsOpen(false); resetForm(); fetchStories();
        } else { toast.error("Failed to save story."); }
    };

    // --- AI Handler Functions ---
    const handleSuggest = async () => {
        setIsSuggesting(true);
        const res = await generateStorySuggestion(category);
        if (res.success && res.suggestion) {
            setTitle(res.suggestion.title);
            setSituation(res.suggestion.situation);
            setTask(res.suggestion.task);
            setAction(res.suggestion.action);
            setResult(res.suggestion.result);
            toast.success("AI drafted a suggestion based on your resume!");
        } else {
            toast.error(res.error || "AI is currently taking a nap (Quota likely exceeded).");
        }
        setIsSuggesting(false);
    };

    const handlePolish = async () => {
        setIsPolishing(true);
        const rawDump = `Situation: ${situation}\nTask: ${task}\nAction: ${action}\nResult: ${result}`;
        const res = await polishStarStory(category, rawDump);

        if (res.success && res.polished) {
            setSituation(res.polished.situation);
            setTask(res.polished.task);
            setAction(res.polished.action);
            setResult(res.polished.result);
            toast.success("Story polished by AI into perfect STAR format!");
        } else {
            toast.error(res.error || "AI Polish failed. Quota likely exceeded.");
        }
        setIsPolishing(false);
    };

    return (
        <div className="space-y-6 pt-12 mt-12 border-t border-gray-800">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-purple-400" /> Master Story Bank
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Your core STAR behavioral answers.</p>
                </div>

                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                            <Plus className="h-4 w-4" /> Add Story
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a1a1a] border border-gray-800 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{editId ? "Edit Story" : "New STAR Story"}</DialogTitle></DialogHeader>

                        <form onSubmit={handleSave} className="space-y-4 mt-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Question / Title</Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., A time I failed..." className="bg-black/50 border-gray-800" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="bg-black/50 border-gray-800"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                                            <SelectItem value="Leadership">Leadership</SelectItem>
                                            <SelectItem value="Conflict">Conflict</SelectItem>
                                            <SelectItem value="Failure/Growth">Failure/Growth</SelectItem>
                                            <SelectItem value="Technical Challenge">Tech Challenge</SelectItem>
                                            <SelectItem value="Teamwork">Teamwork</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* AI Suggest Button */}
                            <div className="flex justify-end border-b border-gray-800 pb-4">
                                <Button type="button" variant="outline" onClick={handleSuggest} disabled={isSuggesting} className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 gap-2 h-8 text-xs">
                                    {isSuggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    Suggest Story for Category
                                </Button>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label className="text-blue-400">Situation</Label>
                                <Textarea value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Set the scene..." className="bg-black/50 border-gray-800 min-h-[60px]" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-orange-400">Task</Label>
                                <Textarea value={task} onChange={(e) => setTask(e.target.value)} placeholder="What was your specific responsibility?" className="bg-black/50 border-gray-800 min-h-[60px]" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-green-400">Action (The most important part)</Label>
                                <Textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="What specific steps did YOU take?" className="bg-black/50 border-gray-800 min-h-[100px]" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-purple-400">Result</Label>
                                <Textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="What was the measurable outcome?" className="bg-black/50 border-gray-800 min-h-[60px]" />
                            </div>

                            <div className="pt-4 flex justify-between items-center border-t border-gray-800 mt-4">
                                {/* AI Polish Button */}
                                <Button type="button" variant="ghost" onClick={handlePolish} disabled={isPolishing} className="text-gray-400 hover:text-white hover:bg-white/5 gap-2 text-xs">
                                    {isPolishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                    Polish with AI
                                </Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Save Story</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {stories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[20vh] border border-dashed border-gray-800 rounded-lg text-gray-500">
                    <p className="text-sm mt-2">Your story bank is empty. Add your first STAR response!</p>
                </div>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {stories.map((story) => (
                        <AccordionItem key={story.id} value={story.id} className="border border-gray-800 rounded-lg bg-[#1a1a1a] px-4">
                            <AccordionTrigger className="hover:no-underline text-left">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-gray-200">{story.title}</span>
                                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full">{story.category}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 border-t border-gray-800 text-gray-300 pb-6 relative">
                                <div className="absolute top-4 right-0 flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(story)} className="h-8 w-8 p-0 text-gray-400 hover:text-white"><Edit2 className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(story.id)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-12">
                                    <div><h4 className="text-xs font-bold uppercase text-blue-400 mb-1">Situation</h4><p className="text-sm leading-relaxed">{story.situation}</p></div>
                                    <div><h4 className="text-xs font-bold uppercase text-orange-400 mb-1">Task</h4><p className="text-sm leading-relaxed">{story.task}</p></div>
                                    <div className="md:col-span-2"><h4 className="text-xs font-bold uppercase text-green-400 mb-1">Action</h4><p className="text-sm leading-relaxed">{story.action}</p></div>
                                    <div className="md:col-span-2"><h4 className="text-xs font-bold uppercase text-purple-400 mb-1">Result</h4><p className="text-sm leading-relaxed">{story.result}</p></div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}