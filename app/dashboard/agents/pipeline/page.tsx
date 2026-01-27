"use client";

import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/app/lib/axios";
import { useLeadActions } from "@/hooks/useLeadActions";
import { Loader2, MoreHorizontal, Phone, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const PREDEFINED_STAGES = ["Assigned", "Call", "Visit", "Deal", "Commission"];

type Lead = {
    _id: string;
    fullName: string;
    status: string;
    priority?: string;
    nextFollowUpDate?: string;
    phone: string;
    budgetMax?: number;
};

export default function PipelinePage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const { executeAction } = useLeadActions();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await axiosInstance.get("/api/Agents/AssignedLeads");
            setLeads(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pipeline");
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = async (leadId: string, newStage: string) => {
        try {
            await executeAction(leadId, "Stage Change", { nextStage: newStage });
            // Optimistic Update
            setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStage } : l));
        } catch (error) {
            console.error(error);
        }
    };

    // Group leads by status
    const groupedLeads = useMemo(() => {
        const groups: Record<string, Lead[]> = {};
        PREDEFINED_STAGES.forEach(stage => groups[stage] = []);

        leads.forEach(lead => {
            // Map loosely to predefined stages if status doesn't match exactly
            const normalizedStatus = PREDEFINED_STAGES.includes(lead.status)
                ? lead.status
                : lead.status === "New" ? "Assigned"
                    : lead.status === "Attempted" ? "Call"
                        : "Assigned"; // Fallback to Assigned

            if (groups[normalizedStatus]) {
                groups[normalizedStatus].push(lead);
            }
        });
        return groups;
    }, [leads]);

    const getColumnColor = (stage: string) => {
        switch (stage) {
            case "Assigned": return "border-t-4 border-t-blue-500";
            case "Visit": return "border-t-4 border-t-purple-500";
            case "Deal": return "border-t-4 border-t-green-500";
            case "Commission": return "border-t-4 border-t-emerald-500";
            default: return "border-t-4 border-t-slate-300";
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 overflow-x-auto">
            <h1 className="text-2xl font-black text-slate-900 mb-6 sticky left-0">Deals Pipeline</h1>

            <div className="flex gap-6 min-w-max pb-8">
                {PREDEFINED_STAGES.map(stage => (
                    <div key={stage} className="w-80 flex-shrink-0 flex flex-col gap-4">
                        {/* Column Header */}
                        <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 ${getColumnColor(stage)}`}>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-slate-700">{stage}</h3>
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                    {groupedLeads[stage]?.length || 0}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                Total: ${(groupedLeads[stage]?.reduce((acc, l) => acc + (l.budgetMax || 0), 0) / 1000).toFixed(0)}k
                            </p>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-3 min-h-[200px]">
                            {groupedLeads[stage]?.map(lead => (
                                <PipelineCard
                                    key={lead._id}
                                    lead={lead}
                                    onMove={(newStage) => handleStageChange(lead._id, newStage)}
                                />
                            ))}
                            {groupedLeads[stage]?.length === 0 && (
                                <div className="h-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center p-4">
                                    <span className="text-slate-300 text-sm font-medium">Empty</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const PipelineCard = ({ lead, onMove }: { lead: Lead, onMove: (s: string) => void }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                    ${lead.priority === 'Hot' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    {lead.priority || 'Normal'}
                </span>
                {lead.nextFollowUpDate && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400" title="Next Follow-up">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.nextFollowUpDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                    </div>
                )}
            </div>

            <h4 className="font-bold text-slate-800 mb-1">{lead.fullName}</h4>
            <p className="text-sm font-medium text-slate-500 mb-3">${(lead.budgetMax || 0).toLocaleString()}</p>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                <a href={`tel:${lead.phone}`} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                </a>

                {/* Quick Move Dropdown (simplified as select for now) */}
                <div className="relative">
                    <select
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        onChange={(e) => onMove(e.target.value)}
                        value={lead.status}
                    >
                        {PREDEFINED_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="text-xs font-bold text-slate-400 hover:text-purple-600 transition-colors flex items-center gap-1">
                        Move <MoreHorizontal className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};
