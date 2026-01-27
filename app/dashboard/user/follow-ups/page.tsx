"use client";

import React, { useState, useEffect } from "react";
import {
    Clock,
    Calendar,
    User,
    Phone,
    MessageSquare,
    CheckCircle,
    Loader2,
    Search
} from "lucide-react";
import { axiosInstance } from "@/app/lib/axios";

export default function AssistantFollowUpsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await axiosInstance.get("/api/leads");
                setLeads(res.data.leads || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const followUps = leads.filter(l =>
        l.nextFollowUpDate &&
        (l.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.phone?.includes(searchQuery))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Support Schedule</h1>
                    <p className="text-slate-500 font-medium">Coordinate agency follow-ups and lead touchpoints</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search follow-ups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {followUps.length === 0 ? (
                        <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">No follow-ups scheduled for today.</p>
                        </div>
                    ) : (
                        followUps.map(lead => (
                            <div key={lead._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${lead.nextFollowUpDate === today ? 'bg-amber-500 shadow-amber-200' : 'bg-slate-400 shadow-slate-200'
                                        }`}>
                                        {lead.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">{lead.fullName}</h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> {lead.nextFollowUpDate}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white h-fit">
                    <h3 className="text-lg font-black mb-6">Quick Filters</h3>
                    <div className="space-y-4">
                        <button className="w-full py-3 px-6 bg-blue-600 rounded-2xl text-sm font-bold text-left">Overdue Follow-ups</button>
                        <button className="w-full py-3 px-6 bg-white/5 rounded-2xl text-sm font-bold text-left hover:bg-white/10">Due Today</button>
                        <button className="w-full py-3 px-6 bg-white/5 rounded-2xl text-sm font-bold text-left hover:bg-white/10">Next 7 Days</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
