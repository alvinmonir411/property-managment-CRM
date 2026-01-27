"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Home,
    Calendar,
    Clock,
    AlertCircle,
    ArrowRight,
    Search,
    Plus,
    Loader2,
    CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { axiosInstance } from "@/app/lib/axios";
import Link from "next/link";

export default function AssistantDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Assistants can use admin stats for now to get a birds-eye view
                const res = await axiosInstance.get("/api/admin/dashboard-stats");
                setStats(res.data);
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
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const kpis = [
        { title: "Active Leads", value: stats?.stats?.leadsCount || 0, icon: <Users />, color: "bg-blue-600" },
        { title: "Inventory", value: stats?.stats?.propertiesCount || 0, icon: <Home />, color: "bg-purple-600" },
        { title: "Pending Log", value: "8", icon: <Clock />, color: "bg-amber-600" },
        { title: "Today's Schedule", value: "3", icon: <Calendar />, color: "bg-emerald-600" },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Assistant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Assistant Command</h1>
                    <p className="text-slate-500 font-medium">Platform Operations & Support Dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/user/addleads">
                        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                            <Plus className="w-5 h-5" />
                            Log New Lead
                        </button>
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all"
                    >
                        <div className={`w-12 h-12 ${kpi.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                            {kpi.icon}
                        </div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{kpi.title}</p>
                        <h3 className="text-3xl font-black text-slate-800">{kpi.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-amber-500" /> Operational Alerts
                            </h3>
                            <button className="text-sm font-bold text-blue-600">View Inbox</button>
                        </div>

                        <div className="space-y-4">
                            {[1, 2].map((task) => (
                                <div key={task} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Clock className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Unassigned Lead Waiting #{task + 500}</p>
                                            <p className="text-xs text-slate-500 font-medium">Review requirement for property match</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <Search className="w-6 h-6 text-blue-400" /> Catalog Look-up
                        </h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Scan inventory..."
                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-2">My Task Score</h4>
                        <p className="text-sm text-slate-500 mb-6">Support score based on lead logging.</p>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-2/3 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
                        <h4 className="text-lg font-black mb-4">Daily Focus</h4>
                        <ul className="space-y-3 text-sm font-medium text-indigo-100">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Qualify Inbound Leads</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Verify Property Details</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Sync Agent Calendars</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}