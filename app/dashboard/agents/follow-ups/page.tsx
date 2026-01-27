"use client";

import { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/app/lib/axios";
import { toast } from "react-toastify";
import {
    Phone, MessageCircle, Clock, Calendar, CheckCircle,
    AlertCircle, Search, Filter, Loader2, X, MapPin,
    Home, DollarSign, ChevronRight
} from "lucide-react";
import { useLeadActions } from "@/hooks/useLeadActions";

type Lead = {
    _id: string;
    fullName: string;
    phone: string;
    status: string;
    priority?: string;
    nextFollowUpDate?: string;
    notes?: string;
    propertyId?: string;
    budgetMax?: number;
    history?: {
        date: string;
        action: string;
        note?: string;
        propertyId?: string;
    }[];
};

type Property = {
    _id: string;
    title: string;
    price: string;
    location: string;
    type: string;
    images: string[];
};

const NEXT_STAGES = ["Visit", "Deal", "Commission"];

export default function AgentFollowUpPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { executeAction, isActing } = useLeadActions();

    // Modal State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [note, setNote] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [nextStage, setNextStage] = useState<string>("");
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [propertySearch, setPropertySearch] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [leadsRes, propsRes] = await Promise.all([
                axiosInstance.get("/api/Agents/AssignedLeads"),
                axiosInstance.get("/api/Agents/properties")
            ]);
            setLeads(leadsRes.data);
            setProperties(propsRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const processedLeads = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return leads
            .filter(l =>
                l.nextFollowUpDate &&
                !["Deal", "Commission", "Closed"].includes(l.status) &&
                (l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery))
            )
            .map(l => {
                const date = new Date(l.nextFollowUpDate!);
                date.setHours(0, 0, 0, 0);
                const diff = (date.getTime() - today.getTime()) / (1000 * 3600 * 24);

                let timeStatus: 'overdue' | 'today' | 'upcoming' = 'upcoming';
                if (diff < 0) timeStatus = 'overdue';
                else if (diff === 0) timeStatus = 'today';

                return { ...l, timeStatus, dateObj: date };
            })
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [leads, searchQuery]);

    const stats = {
        today: processedLeads.filter(l => l.timeStatus === 'today').length,
        overdue: processedLeads.filter(l => l.timeStatus === 'overdue').length,
        hot: processedLeads.filter(l => l.priority === 'Hot').length
    };

    // --- Actions ---

    const handleQuickAction = (lead: Lead, action: 'call' | 'whatsapp') => {
        if (action === 'call') executeAction(lead._id, "Call", { phone: lead.phone });
        if (action === 'whatsapp') executeAction(lead._id, "WhatsApp", { phone: lead.phone });
    };

    const openCompleteModal = (lead: Lead) => {
        setSelectedLead(lead);
        setNote("");
        setNextStage(lead.status);
        if (lead.propertyId) setSelectedPropertyId(lead.propertyId);

        // Default follow-up to tomorrow
        const tmr = new Date();
        tmr.setDate(tmr.getDate() + 1);
        setFollowUpDate(tmr.toISOString().split('T')[0]);
    };

    const closeCompleteModal = () => {
        setSelectedLead(null);
        setNote("");
        setNextStage("");
        setSelectedPropertyId("");
        setPropertySearch("");
    };

    const handleUndo = async () => {
        if (!selectedLead) return;
        if (!confirm("Are you sure you want to undo the last action?")) return;

        setUpdating(true);
        try {
            await axiosInstance.delete(`/api/actions?leadId=${selectedLead._id}`);
            toast.success("Last action undone!");
            await fetchData();
            closeCompleteModal();
        } catch (err) {
            toast.error("Failed to undo action");
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateLead = async () => {
        if (!selectedLead) return;

        if (nextStage === "Deal" && !selectedPropertyId && !selectedLead.propertyId) {
            toast.error("Please link a property first (in Visit stage)");
            return;
        }

        setUpdating(true);
        try {
            await executeAction(selectedLead._id, "Complete", {
                note: note,
                followUpDate: followUpDate,
                nextStage: nextStage !== selectedLead.status ? nextStage : undefined,
                propertyId: selectedPropertyId || undefined
            });

            toast.success("Task updated & logged!");
            closeCompleteModal();
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to update task");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Stats Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Follow Ups</h1>
                            <p className="text-slate-500 text-sm font-medium">Clear your daily tasks</p>
                        </div>
                        <div className="relative flex-1 lg:w-64 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Badge label="Overdue" count={stats.overdue} color="bg-red-50 text-red-600 border-red-200" />
                        <Badge label="Today" count={stats.today} color="bg-blue-50 text-blue-600 border-blue-200" />
                        <Badge label="Hot Leads" count={stats.hot} color="bg-orange-50 text-orange-600 border-orange-200" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
                {processedLeads.length === 0 ? (
                    <div className="text-center py-20">
                        <CheckCircle className="w-16 h-16 text-green-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
                        <p className="text-slate-400">No pending follow-ups for now.</p>
                    </div>
                ) : (
                    processedLeads.map(lead => (
                        <div key={lead._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden">
                            {/* Status line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 
                                ${lead.timeStatus === 'overdue' ? 'bg-red-500' :
                                    lead.timeStatus === 'today' ? 'bg-blue-500' : 'bg-slate-300'}`}
                            />

                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pl-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-slate-800">{lead.fullName}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${lead.timeStatus === 'overdue' ? 'bg-red-100 text-red-600' :
                                            lead.timeStatus === 'today' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {lead.timeStatus}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lead.dateObj.toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>
                                        {lead.status && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{lead.status}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <button
                                        onClick={() => handleQuickAction(lead, 'call')}
                                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Call"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction(lead, 'whatsapp')}
                                        className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="WhatsApp"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => openCompleteModal(lead)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-all shadow-lg shadow-slate-200"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Update / Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- ADVANCED MODAL (Ported from Assigned Leads) --- */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all" onClick={closeCompleteModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5 fade-in duration-300" onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedLead.fullName}</h2>
                                <p className="text-sm text-gray-500">Update status & next steps</p>
                            </div>
                            <button onClick={closeCompleteModal} className="p-1 hover:bg-gray-200 rounded-full transition">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 overflow-y-auto">

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Note / Activity Log</label>
                                <textarea
                                    placeholder="Outcome of the call..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm"
                                />
                            </div>

                            {/* Activity History */}
                            <div className="bg-gray-50 border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-600" /> Recent History
                                    </h4>
                                    {selectedLead.history && selectedLead.history.length > 0 && (
                                        <button
                                            onClick={handleUndo}
                                            disabled={updating}
                                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 disabled:opacity-50"
                                        >
                                            Undo Last
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4 max-h-40 overflow-y-auto">
                                    {selectedLead.history && selectedLead.history.length > 0 ? (
                                        [...selectedLead.history].reverse().map((item, idx) => (
                                            <div key={idx} className="pl-4 border-l-2 border-gray-200">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold">{item.action}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                                                </div>
                                                {item.note && <p className="text-[10px] text-gray-500">{item.note}</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center">No history.</p>
                                    )}
                                </div>
                            </div>


                            <div className="grid grid-cols-2 gap-4">
                                {/* Follow Up Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            value={followUpDate}
                                            onChange={(e) => setFollowUpDate(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Next Stage */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Move to Stage</label>
                                    <select
                                        value={nextStage}
                                        onChange={(e) => setNextStage(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">Keep current ({selectedLead.status})</option>
                                        {NEXT_STAGES.map(stage => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Visit Stage - Select Property */}
                            {nextStage === "Visit" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Property for Visit</label>
                                    <div className="mb-2 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                        <input
                                            type="text"
                                            placeholder="Search Property..."
                                            value={propertySearch}
                                            onChange={(e) => setPropertySearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <select
                                        value={selectedPropertyId}
                                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">-- Choose Property --</option>
                                        {properties
                                            .filter(p => p.title.toLowerCase().includes(propertySearch.toLowerCase()))
                                            .map(p => (
                                                <option key={p._id} value={p._id}>{p.title}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}

                            {/* Deal Info (View Only here) */}
                            {nextStage === "Deal" && (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Closing Deal
                                    </h4>
                                    <p className="text-xs text-green-700">Commission will be calculated and property marked as sold.</p>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t bg-gray-50 flex gap-3">
                            <button onClick={closeCompleteModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100">Cancel</button>
                            <button
                                onClick={handleUpdateLead}
                                disabled={updating}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {nextStage === "Deal" ? "Close Deal" : "Save Update"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

const Badge = ({ label, count, color }: any) => (
    <div className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 ${color}`}>
        <span>{count}</span>
        <span className="opacity-70 font-medium">{label}</span>
    </div>
);
