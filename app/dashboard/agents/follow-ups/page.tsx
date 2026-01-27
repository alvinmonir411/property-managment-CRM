"use client";

import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/app/lib/axios";
import { toast } from "react-toastify";
import {
    Phone, MessageCircle, CheckCircle, Clock, Calendar,
    AlertCircle, Search, Filter, MoreHorizontal, ArrowRight, X,
    User, MapPin, Briefcase
} from "lucide-react";
import { useLeadActions } from "@/hooks/useLeadActions";

type Lead = {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    location?: string;
    score: number;
    nextFollowUpDate?: string;
    lastContactedAt?: string;
    notes?: string;
    priority?: "Hot" | "Warm" | "Cold";
};

export default function AgentFollowUpPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Modal State
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [actionNote, setActionNote] = useState("");
    const [nextDate, setNextDate] = useState("");
    const [nextStage, setNextStage] = useState("");
    const [updating, setUpdating] = useState(false);

    const { executeAction, isActing } = useLeadActions();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/api/Agents/AssignedLeads");
            setLeads(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch leads");
        } finally {
            setLoading(false);
        }
    };

    // Derived Logic & Sorting
    const processedLeads = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return leads
            .filter(l => !["Deal", "Commission", "Closed"].includes(l.status) && l.nextFollowUpDate)
            .map(lead => {
                // Calculate Priority if not present (Simple logic based on score)
                const score = lead.score || 0;
                let priority = lead.priority;
                if (!priority) {
                    if (score >= 80) priority = "Hot";
                    else if (score >= 50) priority = "Warm";
                    else priority = "Cold";
                }

                // Determine Status Category
                const followUpDate = new Date(lead.nextFollowUpDate!);
                followUpDate.setHours(0, 0, 0, 0);

                let timeStatus = 'upcoming';
                if (followUpDate < today) timeStatus = 'overdue';
                else if (followUpDate.getTime() === today.getTime()) timeStatus = 'today';

                return { ...lead, priority, timeStatus, sortDate: followUpDate };
            })
            .sort((a, b) => {
                // Sort by: Overdue > Today > Upcoming
                const statusOrder = { overdue: 0, today: 1, upcoming: 2 };
                if (statusOrder[a.timeStatus as keyof typeof statusOrder] !== statusOrder[b.timeStatus as keyof typeof statusOrder]) {
                    return statusOrder[a.timeStatus as keyof typeof statusOrder] - statusOrder[b.timeStatus as keyof typeof statusOrder];
                }
                // Then by Priority
                const priorityOrder = { Hot: 0, Warm: 1, Cold: 2 };
                if (priorityOrder[a.priority as keyof typeof priorityOrder] !== priorityOrder[b.priority as keyof typeof priorityOrder]) {
                    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
                }
                return a.sortDate.getTime() - b.sortDate.getTime();
            });
    }, [leads]);

    const stats = useMemo(() => {
        return {
            today: processedLeads.filter(l => l.timeStatus === 'today').length,
            overdue: processedLeads.filter(l => l.timeStatus === 'overdue').length,
            hot: processedLeads.filter(l => l.priority === 'Hot').length
        };
    }, [processedLeads]);

    // Actions
    const handleQuickAction = (lead: Lead, action: 'call' | 'whatsapp') => {
        if (action === 'call') executeAction(lead._id, "Call", { phone: lead.phone });
        if (action === 'whatsapp') executeAction(lead._id, "WhatsApp", { phone: lead.phone });
        // Optimistically update last contacted? Or wait for manual log?
        // For now, we let the "Mark Done" handle the logging to keep it precise.
    };

    const openCompleteModal = (lead: Lead) => {
        setSelectedLead(lead);
        setNextStage(lead.status);
        setIsCompleteModalOpen(true);
        setActionNote("");
        setNextDate("");
    };

    const handleCompleteTask = async () => {
        if (!selectedLead) return;
        if (!actionNote) return toast.warning("Please add a note about the interaction");

        setUpdating(true);
        try {
            await executeAction(selectedLead._id, "Complete", {
                note: actionNote,
                followUpDate: nextDate,
                nextStage: nextStage !== selectedLead.status ? nextStage : undefined
            });

            toast.success("Task completed!");
            setIsCompleteModalOpen(false);
            fetchLeads(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to update task");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading your tasks...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Summary Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Today's <span className="text-purple-600">Focus</span></h1>
                            <p className="text-slate-500 text-sm font-medium">Clear your tasks to stay ahead.</p>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                            <StatBadge
                                label="Due Today"
                                count={stats.today}
                                icon={Clock}
                                color="bg-blue-100 text-blue-700"
                            />
                            <StatBadge
                                label="Overdue"
                                count={stats.overdue}
                                icon={AlertCircle}
                                color="bg-red-100 text-red-700"
                                animate={stats.overdue > 0}
                            />
                            <StatBadge
                                label="Hot Leads"
                                count={stats.hot}
                                icon={Briefcase}
                                color="bg-orange-100 text-orange-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">

                {/* List Header */}
                <div className="flex items-center justify-between text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
                    <span>Task Queue</span>
                    <span>{processedLeads.length} Pending</span>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                    {processedLeads.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">All Caught Up!</h3>
                            <p className="text-slate-500 mt-2">Great job. You have no pending follow-ups right now.</p>
                        </div>
                    ) : (
                        processedLeads.map((lead) => (
                            <TaskRow
                                key={lead._id}
                                lead={lead}
                                onQuickAction={handleQuickAction}
                                onComplete={() => openCompleteModal(lead)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Completion Modal */}
            {isCompleteModalOpen && selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Complete Follow-up</h3>
                                <p className="text-xs text-slate-500">for {selectedLead.fullName}</p>
                            </div>
                            <button onClick={() => setIsCompleteModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Outcome Note <span className="text-red-500">*</span></label>
                                <textarea
                                    autoFocus
                                    rows={3}
                                    placeholder="What happened? e.g. 'Client is interested, wants to visit...'"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none transition-all"
                                    value={actionNote}
                                    onChange={(e) => setActionNote(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Next Follow-up</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        value={nextDate}
                                        onChange={(e) => setNextDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Update Stage</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        value={nextStage}
                                        onChange={(e) => setNextStage(e.target.value)}
                                    >
                                        <option value="New">New</option>
                                        <option value="Attempted Contact">Attempted Contact</option>
                                        <option value="Connected">Connected</option>
                                        <option value="Visit">Site Visit</option>
                                        <option value="Deal">Deal / Closing</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsCompleteModalOpen(false)}
                                className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteTask}
                                disabled={updating}
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {updating ? 'Saving...' : <><CheckCircle className="w-4 h-4" /> Mark Complete</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components

const StatBadge = ({ label, count, icon: Icon, color, animate }: any) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 ${animate ? 'animate-pulse' : ''} bg-white shadow-sm min-w-[160px]`}>
        <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <span className={`block text-xl font-black ${count > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{count}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</span>
        </div>
    </div>
);

const TaskRow = ({ lead, onQuickAction, onComplete }: any) => {
    const isOverdue = lead.timeStatus === 'overdue';
    const isTodayTask = lead.timeStatus === 'today';

    return (
        <div className={`group bg-white rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 p-1 flex flex-col md:flex-row items-stretch`}>

            {/* Status Strip & Date */}
            <div className={`w-full md:w-48 flex-shrink-0 p-4 rounded-xl flex flex-col justify-center items-start gap-1 
                ${isOverdue ? 'bg-red-50 text-red-700' : isTodayTask ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'}`}>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                    <Calendar className="w-3 h-3" />
                    {isOverdue ? 'Overdue' : isTodayTask ? 'Today' : 'Upcoming'}
                </div>
                <div className="font-bold text-lg">
                    {new Date(lead.nextFollowUpDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs opacity-70">
                    {new Date(lead.nextFollowUpDate!).toLocaleDateString(undefined, { weekday: 'long' })}
                </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 p-4 flex flex-col justify-center gap-2">
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-purple-700 transition-colors">{lead.fullName}</h4>

                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border
                        ${lead.priority === 'Hot' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            lead.priority === 'Warm' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {lead.priority}
                    </span>

                    {/* Stage Badge */}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                        {lead.status}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 opacity-70" /> {lead.phone}</span>
                    <span className="flex items-center gap-1.5 hidden sm:flex"><MapPin className="w-3.5 h-3.5 opacity-70" /> {lead.location || 'N/A'}</span>
                </div>

                {lead.notes && (
                    <p className="text-xs text-slate-400 line-clamp-1 italic mt-1 pl-2 border-l-2 border-slate-200 max-w-lg">
                        "{lead.notes.split('\n').pop()}"
                    </p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 p-2 md:pl-0 border-t md:border-t-0 border-slate-100 justify-end md:justify-start">
                <button
                    onClick={() => onQuickAction(lead, 'call')}
                    title="Call Lead"
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                    <Phone className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onQuickAction(lead, 'whatsapp')}
                    title="WhatsApp"
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-green-100 hover:text-green-600 transition-colors"
                >
                    <MessageCircle className="w-4 h-4" />
                </button>
                <button
                    onClick={onComplete}
                    className="h-10 px-4 flex items-center gap-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-purple-600 shadow-md hover:shadow-purple-200 transition-all ml-2"
                >
                    <CheckCircle className="w-4 h-4" />
                    <span>Done</span>
                </button>
            </div>
        </div>
    );
}
