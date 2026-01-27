"use client";

import React, { useState, useEffect } from "react";
import {
    TrendingUp,
    DollarSign,
    Home,
    Users,
    ArrowUpRight,
    Target,
    BarChart3,
    PieChart,
    Calendar,
    Loader2
} from "lucide-react";
import { axiosInstance } from "@/app/lib/axios";
import { motion } from "framer-motion";

interface AnalyticsData {
    stats: {
        dealsClosed: number;
        commission: number;
        totalSalesValue: number;
    };
    stageBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
    totalLeads: number;
    recentActivities: any[];
}

export default function AgentAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axiosInstance.get("/api/Agents/analytics");
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!data) return <div>Failed to load analytics</div>;

    const conversionRate = data.totalLeads > 0
        ? ((data.stats.dealsClosed / data.totalLeads) * 100).toFixed(1)
        : "0";

    const stages = Object.entries(data.stageBreakdown);
    const maxStageCount = Math.max(...stages.map(([_, count]) => count), 1);

    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen pb-24">
            <header>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Performance Analytics</h1>
                <p className="text-slate-500 font-medium">Track your personal growth and lead conversion</p>
            </header>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Commission"
                    value={`$${(data.stats.commission / 1000).toFixed(1)}k`}
                    subtitle="Lifetime earnings"
                    icon={<DollarSign className="w-6 h-6" />}
                    color="bg-emerald-500"
                />
                <KPICard
                    title="Deals Closed"
                    value={data.stats.dealsClosed.toString()}
                    subtitle="Successful transactions"
                    icon={<Home className="w-6 h-6" />}
                    color="bg-blue-600"
                />
                <KPICard
                    title="Sales Volume"
                    value={`$${(data.stats.totalSalesValue / 1000000).toFixed(1)}M`}
                    subtitle="Total property value"
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="bg-purple-600"
                />
                <KPICard
                    title="Conversion Rate"
                    value={`${conversionRate}%`}
                    subtitle="Lead to deal ratio"
                    icon={<Target className="w-6 h-6" />}
                    color="bg-indigo-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pipeline Breakdown */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Pipeline Distribution</h2>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {stages.map(([stage, count]) => (
                            <div key={stage} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-600">{stage}</span>
                                    <span className="text-slate-900">{count} leads</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / maxStageCount) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${getStageColor(stage)}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lead Sources */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <PieChart className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Lead Sources</h2>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(data.sourceBreakdown).map(([source, count], idx) => (
                            <div key={source} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${idx % 2 === 0 ? 'bg-purple-500' : 'bg-blue-500'}`} />
                                    <span className="font-bold text-slate-700">{source}</span>
                                </div>
                                <span className="text-slate-500 text-sm font-medium">{count}</span>
                            </div>
                        ))}
                        {Object.keys(data.sourceBreakdown).length === 0 && (
                            <p className="text-center py-8 text-slate-400 text-sm italic">No source data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity / Wins */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Recent Milestones</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.recentActivities.length > 0 ? data.recentActivities.map((act) => (
                        <div key={act._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${act.actionType === "Deal" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                                }`}>
                                {act.actionType === "Deal" ? <ArrowUpRight className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{act.actionType}</p>
                                <p className="text-sm text-slate-500 line-clamp-1">{act.note || "Activity log"}</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                    {new Date(act.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <p className="col-span-full text-center py-8 text-slate-400">No recent activities logged</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, subtitle, icon, color }: any) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform`} />
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${color} shadow-lg shadow-${color}/20`}>
                    {icon}
                </div>
            </div>
            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 mb-1">{value}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{subtitle}</p>
        </div>
    );
}

function getStageColor(stage: string) {
    switch (stage) {
        case "Assigned": return "bg-blue-500";
        case "Call": return "bg-yellow-500";
        case "Visit": return "bg-purple-500";
        case "Deal": return "bg-green-500";
        case "Commission": return "bg-emerald-500";
        default: return "bg-slate-400";
    }
}

