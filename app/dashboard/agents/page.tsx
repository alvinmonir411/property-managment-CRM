"use client";

import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/app/lib/axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Users, Home, DollarSign, TrendingUp, Plus,
    ArrowRight, Activity, Calendar, Clock, Phone,
    MessageCircle, CheckCircle, MapPin, ChevronRight, Flame
} from "lucide-react";
import { useLeadActions } from "@/hooks/useLeadActions";

type Lead = {
    _id: string;
    fullName: string;
    status: string;
    score: number;
    phone: string;
    nextFollowUpDate?: string;
    budgetMax?: number;
    history?: { date: string; action: string; note?: string }[];
};

type Property = {
    _id: string;
    status: string;
    price: string;
};

export default function AgentDashboardHome() {
    const { data: session } = useSession();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const { executeAction } = useLeadActions();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leadsRes, propsRes] = await Promise.all([
                    axiosInstance.get("/api/Agents/AssignedLeads"),
                    axiosInstance.get("/api/Agents/properties")
                ]);
                setLeads(leadsRes.data);
                setProperties(propsRes.data);
            } catch (error) {
                console.error("Dashboard data fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- 1. Stats Calculation ---
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const hotLeads = leads.filter(l => l.score >= 80).length;
        const dueToday = leads.filter(l => {
            if (!l.nextFollowUpDate) return false;
            const d = new Date(l.nextFollowUpDate);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        }).length;
        const visits = leads.filter(l => l.status === "Visit").length;

        return {
            totalLeads: leads.length,
            hotLeads,
            dueToday,
            visits,
            activeListings: properties.filter(p => p.status === "Available").length
        };
    }, [leads, properties]);

    // --- 2. Value Stats ---
    const valueStats = useMemo(() => {
        const listingValue = properties
            .filter(p => p.status === "Available")
            .reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);

        const pipelineValue = leads
            .filter(l => ["Visit", "Deal"].includes(l.status))
            .reduce((acc, l) => acc + (l.budgetMax || 0), 0);

        return { listingValue, pipelineValue };
    }, [leads, properties]);

    // --- 3. Pipeline Data ---
    const pipelineCounts = useMemo(() => {
        return {
            Assigned: leads.filter(l => l.status === "Assigned").length,
            Visit: leads.filter(l => l.status === "Visit").length,
            Deal: leads.filter(l => l.status === "Deal").length,
            Commission: leads.filter(l => l.status === "Commission").length
        };
    }, [leads]);

    // --- 3. Today's Tasks (Overdue + Today) ---
    const tasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return leads
            .filter(l => l.nextFollowUpDate && !["Deal", "Commission"].includes(l.status))
            .map(l => {
                const d = new Date(l.nextFollowUpDate!);
                d.setHours(0, 0, 0, 0);
                return { ...l, dateObj: d };
            })
            .filter(l => l.dateObj <= today) // Overdue or Today
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
            .slice(0, 5); // Show top 5
    }, [leads]);

    // --- 4. Recent Activity ---
    const recentActivity = useMemo(() => {
        const allHistory = leads.flatMap(l =>
            (l.history || []).map(h => ({ ...h, leadName: l.fullName }))
        );
        return allHistory
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4);
    }, [leads]);


    if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Loading Agent Dashboard...</div>;

    return (
        <div className="p-6 max-w-8xl mx-auto space-y-8 pb-20">

            {/* Header with Quick Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Dashboard <span className="text-purple-600">Overview</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Welcome back, {session?.user?.name?.split(' ')[0]}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/agents/addleads" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Lead
                    </Link>
                    <Link href="/dashboard/agents/add-property" className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition flex items-center gap-2">
                        <Home className="w-4 h-4" /> Add Property
                    </Link>
                </div>
            </div>

            {/* 1. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    label="Total Leads"
                    value={stats.totalLeads}
                    icon={Users} color="bg-blue-500"
                    link="/dashboard/agents/assignedleads"
                />
                <KPICard
                    label="Hot Leads"
                    value={stats.hotLeads}
                    icon={Flame} color="bg-orange-500"
                    link="/dashboard/agents/assignedleads?filter=hot" // Mock filter param
                    subtext="High Priority"
                />
                <KPICard
                    label="Due Today"
                    value={stats.dueToday}
                    icon={Calendar} color="bg-red-500"
                    link="/dashboard/agents/follow-ups"
                    subtext="Follow-ups"
                />
                <KPICard
                    label="Visits"
                    value={stats.visits}
                    icon={MapPin} color="bg-purple-500"
                    link="/dashboard/agents/pipeline"
                    subtext="Scheduled"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2 & 3. Main Content Area (Pipeline + Tasks) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Pipeline Overview */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" /> Pipeline Status
                            </h3>
                            <Link href="/dashboard/agents/pipeline" className="text-sm font-bold text-purple-600 hover:underline">View All</Link>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {['Assigned', 'Visit', 'Deal', 'Commission'].map((stage, i) => (
                                <Link
                                    href="/dashboard/agents/pipeline"
                                    key={stage}
                                    className="group flex flex-col items-center p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 transition-colors border border-slate-100 text-center relative overflow-hidden"
                                >
                                    <span className="text-2xl font-black text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">
                                        {pipelineCounts[stage as keyof typeof pipelineCounts]}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stage}</span>
                                    {/* Progress visual */}
                                    <div className={`absolute bottom-0 left-0 h-1 bg-purple-500 transition-all opacity-0 group-hover:opacity-100 w-full`} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Today's Tasks */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" /> Tasks & Follow-ups
                            </h3>
                            <Link href="/dashboard/agents/follow-ups" className="text-sm font-bold text-slate-400 hover:text-slate-600">View All</Link>
                        </div>

                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl">
                                    <p>No urgent tasks for today! 🎉</p>
                                </div>
                            ) : (
                                tasks.map(lead => (
                                    <div key={lead._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-10 rounded-full ${lead.status === 'Visit' ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{lead.fullName}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className={`${lead.score >= 80 ? 'text-orange-600 font-bold' : ''}`}>
                                                        {lead.score >= 80 ? '🔥 Hot Lead' : 'Warm'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{lead.status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => executeAction(lead._id, "Call", { phone: lead.phone })}
                                                className="p-2 bg-white text-blue-600 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-colors" title="Call">
                                                <Phone className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => executeAction(lead._id, "WhatsApp", { phone: lead.phone })}
                                                className="p-2 bg-white text-green-600 rounded-xl border border-slate-200 hover:border-green-200 hover:bg-green-50 transition-colors" title="WhatsApp">
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Sidebar Area (Recent Activity + Mini Cal) */}
                <div className="space-y-6">

                    {/* Activity Feed */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit">
                        <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" /> Recent Activity
                        </h3>
                        <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-slate-400">No recent activity.</p>
                            ) : (
                                recentActivity.map((activity, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-sm"></div>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">
                                            {activity.action} <span className="text-slate-400 font-normal">for</span> {activity.leadName}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{activity.note}</p>
                                        <p className="text-[10px] text-slate-300 mt-2 font-mono">
                                            {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/dashboard/agents/assignedleads" className="block text-center mt-8 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                            View all history
                        </Link>
                    </div>

                    {/* Real Value Stats */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white text-center">
                        <h4 className="font-bold opacity-80 mb-2 text-sm uppercase tracking-widest">Active Listings Value</h4>
                        <p className="text-3xl font-black mb-6">
                            ${(valueStats.listingValue / 1000000).toFixed(1)}M
                        </p>

                        <div className="w-full h-px bg-white/10 mb-6"></div>

                        <h4 className="font-bold opacity-80 mb-2 text-sm uppercase tracking-widest">Potential Pipeline</h4>
                        <p className="text-3xl font-black text-emerald-400">
                            ${(valueStats.pipelineValue / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs opacity-50 mt-2">Based on max budgets of active deals</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Sub-components
const KPICard = ({ label, value, icon: Icon, color, link, subtext }: any) => {
    const Content = (
        <div className="flex items-center gap-4 h-full">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} text-white shadow-lg shadow-purple-900/10`}>
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-800">{value}</h3>
                    {subtext && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{subtext}</span>}
                </div>
            </div>
        </div>
    );

    if (link) return (
        <Link href={link} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            {Content}
        </Link>
    );

    return <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">{Content}</div>;
};