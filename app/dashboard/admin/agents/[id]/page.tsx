"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    User, Mail, Phone, Calendar, Briefcase,
    CheckCircle2, Clock, AlertCircle, ArrowLeft,
    TrendingUp, DollarSign, Award, Target
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

interface Agent {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    commission?: number;
}

interface Lead {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    status: string;
    nextFollowUpDate?: string;
    lastContactedAt?: string;
    projectName?: string;
    budgetMax?: string;
    notes?: string;
}

export default function AgentDetailsPage() {
    const params = useParams();
    const agentId = params.id as string;
    const [agent, setAgent] = useState<Agent | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (agentId) {
            fetchAgentData();
        }
    }, [agentId]);

    const fetchAgentData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Agent Details
            const userRes = await fetch(`/api/users/${agentId}`);
            const userData = await userRes.json();

            if (userRes.ok && userData.success) {
                setAgent(userData.user);

                // 2. Fetch Agent's Leads using email
                if (userData.user.email) {
                    const leadsRes = await fetch(`/api/leads?assignedAgent=${userData.user.email}`);
                    const leadsData = await leadsRes.json();

                    if (leadsRes.ok && leadsData.success) {
                        setLeads(leadsData.leads);
                    }
                }
            } else {
                toast.error("Failed to load agent details");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = leads.length;
        const pending = leads.filter(l => l.status === "New" || l.status === "Assigned").length;
        const closed = leads.filter(l => l.status === "Closed" || l.status === "Deal").length; // Adjust status based on actual usage
        const upcomingFollowUps = leads.filter(l => {
            if (!l.nextFollowUpDate) return false;
            const date = new Date(l.nextFollowUpDate);
            const today = new Date();
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(today.getDate() + 3);
            return date >= today && date <= threeDaysFromNow;
        }).length;

        return { total, pending, closed, upcomingFollowUps };
    }, [leads]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-slate-400 animate-pulse font-medium tracking-widest text-xs uppercase">Loading Agent Profile...</p>
            </div>
        );
    }

    if (!agent) {
        return <div className="p-8 text-center text-slate-500">Agent not found</div>;
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Navigation */}
            <div>
                <Link href="/dashboard/admin/agents" className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-600 transition-colors mb-4 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Agents
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl shadow-purple-100">
                            {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{agent.name}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 text-sm font-medium">
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {agent.email}</span>
                                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">{agent.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DetailStatCard icon={<Briefcase className="w-5 h-5" />} label="Total Pipeline" value={stats.total} color="blue" />
                <DetailStatCard icon={<Clock className="w-5 h-5" />} label="Pending Actions" value={stats.pending} color="orange" />
                <DetailStatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Deals Closed" value={stats.closed} color="emerald" />
                <DetailStatCard icon={<AlertCircle className="w-5 h-5" />} label="Upcoming Tasks" value={stats.upcomingFollowUps} color="purple" subText="Next 3 days" />
            </div>

            {/* Detailed Leads View */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        Assigned Leads & Follow-ups
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Lead Details</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Next Follow-up</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Last Contact</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium">
                                        No leads currently assigned to this agent.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{lead.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{lead.email}</p>
                                                {lead.projectName && <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{lead.projectName}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${lead.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                lead.status === 'Assigned' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                    lead.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        'bg-slate-50 text-slate-600 border-slate-100'
                                                }`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {lead.nextFollowUpDate ? (
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Not scheduled</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs font-medium text-slate-500">
                                                {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : "Never"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {/* Could add a link to Edit Lead or View Lead Details here */}
                                            <button className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function DetailStatCard({ icon, label, value, subText, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        purple: "bg-purple-50 text-purple-600 ring-purple-100",
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        orange: "bg-orange-50 text-orange-600 ring-orange-100",
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-4 ${colors[color]}`}>
                    {icon}
                </div>
                {subText && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{subText}</span>}
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</h4>
            <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
        </div>
    );
}
