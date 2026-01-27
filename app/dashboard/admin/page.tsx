"use client";

import React, { useState, useEffect } from "react";
import {
    TrendingUp,
    DollarSign,
    Users,
    Home,
    ArrowUpRight,
    Shield,
    BarChart3,
    Activity,
    Plus,
    Loader2,
    Briefcase,
    Clock,
    Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { axiosInstance } from "@/app/lib/axios";
import Link from "next/link";

interface DashboardData {
    stats: {
        totalSales: number;
        totalCommission: number;
        agentCount: number;
        leadsCount: number;
        propertiesCount: number;
    };
    topAgents: any[];
    recentDeals: any[];
    statusBreakdown: Record<string, number>;
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosInstance.get("/api/admin/dashboard-stats");
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-red-500">Failed to load platform data. Please ensure you are logged in as an Admin.</div>;

    const kpiCards = [
        { title: "Revenue", value: `$${(data.stats.totalSales / 1000).toFixed(1)}k`, icon: <TrendingUp />, color: "bg-purple-600", trend: "Agency Total" },
        { title: "Hot Leads", value: (data.stats as any).hotLeadsCount?.toString() || "0", icon: <Activity />, color: "bg-red-600", trend: "Score > 50" },
        { title: "Daily Follow-ups", value: (data.stats as any).followUpsToday?.toString() || "0", icon: <Clock />, color: "bg-amber-600", trend: "Due Today" },
        { title: "Active Visits", value: (data.stats as any).upcomingVisits?.toString() || "0", icon: <Calendar />, color: "bg-emerald-600", trend: "Live pipeline" },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        Command Center
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] uppercase font-bold rounded-full tracking-widest border border-purple-200">
                            Enterprise SaaS
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium">Platform-wide performance and agent health</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/admin/properties">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                            <Plus className="w-4 h-4" />
                            Inventory
                        </button>
                    </Link>
                    <Link href="/dashboard/admin/agents">
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all">
                            <Shield className="w-4 h-4" />
                            Manage Agents
                        </button>
                    </Link>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, idx) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${card.color} shadow-lg`}>
                                {React.cloneElement(card.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                                {card.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{card.title}</p>
                        <h3 className="text-3xl font-black text-slate-800">{card.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Agent Leaderboard */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Top Performing Agents</h2>
                        </div>
                        <Link href="/dashboard/admin/agents" className="text-sm font-bold text-purple-600 hover:underline">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {data.topAgents.map((agent, idx) => (
                            <div key={agent.email} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="text-lg font-black text-slate-300 w-6">#{idx + 1}</div>
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-purple-600 border border-slate-200">
                                        {agent.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{agent.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">{agent.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-800">${(agent.sales / 1000).toFixed(1)}k</p>
                                    <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">{agent.deals} Deals</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Breakdown Viz */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Lead Health</h2>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Summary Visualization */}
                        <div className="mb-8 p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-purple-200/20 relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 mb-2">Platform IQ</p>
                            <h3 className="text-2xl font-black mb-4">Conversion Funnel</h3>
                            <div className="space-y-3">
                                {Object.entries(data.statusBreakdown).map(([status, count], i) => {
                                    const total = data.stats.leadsCount || 1;
                                    const width = Math.max(30, (count / total) * 100);
                                    return (
                                        <div key={status} className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[10px] font-bold text-slate-400 capitalize">{status}</span>
                                                <span className="text-[10px] font-black">{count}</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-md">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${width}%` }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className={`h-full rounded-full ${i === 0 ? 'bg-purple-400' : 'bg-white/40'}`}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {Object.entries(data.statusBreakdown).map(([status, count]) => {
                            const total = data.stats.leadsCount || 1;
                            const percentage = (count / total) * 100;
                            return (
                                <div key={status} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-slate-600">{status}</span>
                                        <span className="text-xs font-black text-slate-900">{count}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className={`h-full rounded-full transition-all ${status === 'Deal' ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Recent Win</p>
                        {data.recentDeals[0] ? (
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="w-4 h-4 text-emerald-500 font-black" />
                                <span className="text-sm font-bold text-slate-800">New Deal Closed by Agent</span>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No recent deals today</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
