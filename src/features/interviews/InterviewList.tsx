"use client";

import { useEffect, useState, useCallback } from "react";
import { getInterviews, getActiveApplications, createInterview, deleteInterview, updateInterview, logReflection } from "./server";
import { Calendar, Clock, Building2, Briefcase, ChevronRight, Plus, MoreVertical, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface Application {
    id: string;
    company: string;
    role: string;
}

interface InterviewData {
    id: string;
    status: string;
    round: number;
    type: string;
    scheduledFor: Date;
    applicationId: string;
    application: {
        company: string;
        role: string;
    };
    notes?: string;
    stumpers?: string;
    bridgeEffectiveness?: number;
}

export function InterviewList() {
    const [interviews, setInterviews] = useState<InterviewData[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal Visibility State
    const [isOpen, setIsOpen] = useState(false);
    const [reflectionId, setReflectionId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Schedule Form State
    const [editId, setEditId] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState("");
    const [round, setRound] = useState("1");
    const [type, setType] = useState("Phone Screen");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // Reflection Form State
    const [notes, setNotes] = useState("");
    const [stumpers, setStumpers] = useState("");
    const [bridgeScore, setBridgeScore] = useState([3]);

    const refreshPipeline = useCallback(async () => {
        const result = await getInterviews();
        if (result.success && result.interviews) {
            setInterviews(result.interviews as unknown as InterviewData[]);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            const appsRes = await getActiveApplications();
            if (isMounted && appsRes.success && appsRes.applications) {
                setApplications(appsRes.applications);
            }
            await refreshPipeline();
            if (isMounted) setIsLoading(false);
        }

        fetchData();

        return () => {
            isMounted = false; // Cleanup function to prevent state updates if unmounted
        };
    }, [refreshPipeline]);

    const resetScheduleForm = () => {
        setEditId(null);
        setSelectedApp("");
        setRound("1");
        setType("Phone Screen");
        setDate("");
        setTime("");
    };

    const handleOpenCreate = () => {
        resetScheduleForm();
        setIsOpen(true);
    };

    const handleOpenEdit = (interview: InterviewData) => {
        const d = new Date(interview.scheduledFor);
        setEditId(interview.id);
        setSelectedApp(interview.applicationId);
        setRound(interview.round.toString());
        setType(interview.type);
        setDate(d.toISOString().split('T')[0]);
        setTime(d.toTimeString().slice(0, 5));
        setIsOpen(true);
    };

    const handleOpenReflection = (interview: InterviewData) => {
        setReflectionId(interview.id);
        setNotes(interview.notes || "");
        setStumpers(interview.stumpers || "");
        setBridgeScore([interview.bridgeEffectiveness || 3]);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        const result = await deleteInterview(deleteId);
        if (result.success) {
            toast.success("Interview deleted.");
            refreshPipeline();
        } else {
            toast.error(result.error || "Failed to delete.");
        }
        setDeleteId(null);
    };

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedApp || !date || !time) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const scheduledFor = new Date(`${date}T${time}`);
        const payload = { applicationId: selectedApp, round: parseInt(round), type, scheduledFor };

        let result;
        if (editId) {
            result = await updateInterview(editId, payload);
        } else {
            result = await createInterview(payload);
        }

        if (result.success) {
            toast.success(editId ? "Interview updated!" : "Interview scheduled!");
            setIsOpen(false);
            refreshPipeline();
            resetScheduleForm();
        } else {
            toast.error(result.error || "Failed to save interview.");
        }
    };

    const handleSaveReflection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reflectionId) return;

        const result = await logReflection(reflectionId, { notes, stumpers, bridgeEffectiveness: bridgeScore[0] });
        if (result.success) {
            toast.success("Reflection logged. Round complete!");
            setReflectionId(null);
            refreshPipeline();
        } else {
            toast.error(result.error || "Failed to save reflection.");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-gray-400 animate-pulse">Loading command center...</div>;
    }

    const activeInterviews = interviews.filter(i => i.status !== "Completed");
    const completedInterviews = interviews.filter(i => i.status === "Completed");

    return (
        <div className="space-y-12">
            {/* ACTIVE PIPELINE SECTION */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Upcoming Interviews</h2>

                    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetScheduleForm(); }}>
                        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="h-4 w-4" /> Schedule Interview
                        </Button>
                        <DialogContent className="bg-[#1a1a1a] border border-gray-800 text-white sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editId ? "Edit Interview" : "Schedule New Interview"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveSchedule} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Application</Label>
                                    <Select value={selectedApp} onValueChange={setSelectedApp}>
                                        <SelectTrigger className="bg-black/50 border-gray-800">
                                            <SelectValue placeholder="Select a job..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                                            {applications.map(app => (
                                                <SelectItem key={app.id} value={app.id}>
                                                    {app.company} - {app.role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Round</Label>
                                        <Input
                                            type="number" min="1" value={round}
                                            onChange={(e) => setRound(e.target.value)}
                                            className="bg-black/50 border-gray-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={type} onValueChange={setType}>
                                            <SelectTrigger className="bg-black/50 border-gray-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                                                <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                                                <SelectItem value="Technical Screen">Technical Screen</SelectItem>
                                                <SelectItem value="Take-home Review">Take-home Review</SelectItem>
                                                <SelectItem value="Onsite">Onsite</SelectItem>
                                                <SelectItem value="Behavioral">Behavioral</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date" value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="bg-black/50 border-gray-800 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Time</Label>
                                        <Input
                                            type="time" value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="bg-black/50 border-gray-800 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        {editId ? "Update Interview" : "Save Interview"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {activeInterviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[30vh] border border-dashed border-gray-800 rounded-lg text-gray-500">
                        <Calendar className="h-12 w-12 mb-4 text-gray-700" />
                        <h3 className="text-xl font-medium text-gray-300">No Active Interviews</h3>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeInterviews.map((interview) => (
                            <div key={interview.id} className="p-6 rounded-xl border border-gray-800 bg-[#1a1a1a] hover:border-blue-500/50 transition-all group relative">
                                <div className="absolute top-4 right-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-gray-200">
                                            <DropdownMenuItem onClick={() => handleOpenReflection(interview)} className="cursor-pointer text-green-400 hover:bg-green-400/10 hover:text-green-300">
                                                <CheckCircle2 className="h-4 w-4 mr-2" /> Log Reflection
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenEdit(interview)} className="cursor-pointer hover:bg-white/10">
                                                <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeleteId(interview.id)} className="cursor-pointer text-red-400 hover:bg-red-400/10 hover:text-red-300">
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex justify-between items-start mb-4 pr-8">
                                    <div className="flex items-center gap-2 text-gray-200 font-semibold text-lg">
                                        <Building2 className="h-5 w-5 text-blue-400" />
                                        {interview.application.company}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Briefcase className="h-4 w-4" />
                                        {interview.application.role}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(interview.scheduledFor).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        {new Date(interview.scheduledFor).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-sm">
                                    <span className="text-gray-500">
                                        Round {interview.round} • {interview.type}
                                    </span>
                                    <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                                        {interview.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* COMPLETED / REFLECTIONS SECTION */}
            {completedInterviews.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-gray-800">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Completed & Reflections</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {completedInterviews.map((interview) => (
                            <div key={interview.id} className="p-6 rounded-xl border border-gray-800 bg-[#111] opacity-75">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-gray-400 font-semibold text-lg">
                                        <Building2 className="h-5 w-5" />
                                        {interview.application.company}
                                    </div>
                                    <span className="px-2.5 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                                        Completed
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                    {interview.type} • Round {interview.round}
                                </div>
                                {interview.stumpers && (
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Stumpers</span>
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{interview.stumpers}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* POST-INTERVIEW REFLECTION MODAL */}
            <Dialog open={!!reflectionId} onOpenChange={(open) => !open && setReflectionId(null)}>
                <DialogContent className="bg-[#1a1a1a] border border-gray-800 text-white sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Post-Interview Reflection</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveReflection} className="space-y-6 mt-4">
                        <div className="space-y-3">
                            <Label>The Stumpers</Label>
                            <p className="text-xs text-gray-400">Which technical or behavioral questions caught you off guard?</p>
                            <Textarea
                                value={stumpers}
                                onChange={(e) => setStumpers(e.target.value)}
                                className="bg-black/50 border-gray-800 min-h-[80px]"
                                placeholder="e.g., They asked a specific SQL indexing question I didn't know..."
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>General Notes & Vibe</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="bg-black/50 border-gray-800 min-h-[80px]"
                                placeholder="e.g., Team seems great, focus was heavy on API design..."
                            />
                        </div>
                        <div className="space-y-4 pt-2">
                            <Label>Bridge Technique Effectiveness ({bridgeScore[0]}/5)</Label>
                            <p className="text-xs text-gray-400">How well did the &quot;Chemistry to Software&quot; narrative land?</p>
                            <Slider
                                value={bridgeScore}
                                onValueChange={setBridgeScore}
                                max={5} min={1} step={1}
                                className="py-4"
                            />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                Complete Round
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Custom Alert Dialog for Deletion */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-[#1a1a1a] border border-gray-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete this interview from your pipeline tracking.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-gray-700 text-white hover:bg-gray-800">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete Interview
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}