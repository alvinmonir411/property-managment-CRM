"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Users, TrendingUp, DollarSign, Award, Loader2, Search, ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface Agent {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    commission: number; // Existing field
    assignedLeadsCount?: number; // New field
    dealsClosed?: number; // New field
    totalSalesValue?: number; // New field
}

export default function AdminAgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await fetch("/api/admin/agentfetch");
            const data = await response.json();
            if (data.success) {
                setAgents(data.agents || []);
            }
        } catch (error) {
            toast.error("Network synchronization failed");
        } finally {
            setIsLoading(false);
        }
    };

    // 🔥 Error Fix: Case-insensitive search
    const filteredAgents = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        return agents.filter(agent => {
            // Safe check: jodi name ba email na thake tobe empty string dhore nibe
            const name = agent?.name?.toLowerCase() || "";
            const email = agent?.email?.toLowerCase() || "";

            return name.includes(query) || email.includes(query);
        });
    }, [agents, searchQuery]);

    // 🔥 Data Calculation with safe fallbacks
    const stats = useMemo(() => {
        const totalLeads = agents.reduce((acc, curr) => acc + (curr.assignedLeadsCount || 0), 0);
        const totalDeals = agents.reduce((acc, curr) => acc + (curr.dealsClosed || 0), 0);
        const totalRevenue = agents.reduce((acc, curr) => acc + (curr.totalSalesValue || 0), 0);
        const totalCommission = agents.reduce((acc, curr) => acc + (curr.commission || 0), 0);
        const avgConversion = totalLeads > 0 ? ((totalDeals / totalLeads) * 100).toFixed(1) : "0.0";

        return { totalLeads, totalDeals, totalRevenue, totalCommission, avgConversion };
    }, [agents]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-slate-400 animate-pulse font-medium tracking-widest text-xs uppercase">Syncing Performance Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header with Glassmorphism */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Real-time Analytics</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sales Force <span className="text-purple-600">Leaderboard</span></h2>
                </div>

                {/* Search Bar Refined */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by agent name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-6 py-3.5 w-full md:w-80 bg-white border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 rounded-2xl shadow-sm outline-none transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Stats Grid - Premium SaaS Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users className="w-5 h-5" />} label="Total Agents" value={agents.length} color="blue" />
                <StatCard icon={<Briefcase className="w-5 h-5" />} label="Leads Pipeline" value={stats.totalLeads} subText={`${stats.avgConversion}% Conv.`} color="purple" />
                <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Gross Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="emerald" />
                <StatCard icon={<Award className="w-5 h-5" />} label="Payouts" value={`$${stats.totalCommission.toLocaleString()}`} color="orange" />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Agent Performance</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Pipeline</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Efficiency</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Revenue Contrib.</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Net Payout</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAgents.map((agent) => {
                                const leads = agent.assignedLeadsCount || 0;
                                const deals = agent.dealsClosed || 0;
                                const conversion = leads > 0 ? ((deals / leads) * 100).toFixed(1) : "0.0";

                                return (
                                    <tr key={agent._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <Link href={`/dashboard/admin/agents/${agent._id}`} className="block group/item">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-purple-100 group-hover/item:scale-110 transition-transform">
                                                        {agent?.name ? agent.name.charAt(0).toUpperCase() : "A"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-base group-hover/item:text-purple-600 transition-colors">{agent.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{agent.email}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-slate-700">{leads} Leads</span>
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{deals} Closed</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.min(Number(conversion), 100)}%` }} />
                                                </div>
                                                <span className="text-xs font-black text-slate-800">{conversion}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <p className="text-sm font-black text-slate-800">${(agent.totalSalesValue || 0).toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Sales Volume</p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="inline-flex flex-col items-end px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                                <span className="text-sm font-black text-emerald-700">${(agent.commission || 0).toLocaleString()}</span>
                                                <span className="text-[9px] font-bold text-emerald-600/70 uppercase">Earned</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// 🔥 Helper Stat Card Component for Clean Code
function StatCard({ icon, label, value, subText, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        purple: "bg-purple-50 text-purple-600 ring-purple-100",
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        orange: "bg-orange-50 text-orange-600 ring-orange-100",
    };

    return (
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ring-4 ${colors[color]}`}>
                {icon}
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
                {subText && <span className="text-[10px] font-bold text-slate-400">{subText}</span>}
            </div>
        </div>
    );
}