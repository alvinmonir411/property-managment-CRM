"use client";

import React, { useState, useEffect } from "react";
import {
    Home,
    Calendar,
    Clock,
    CheckCircle2,
    ArrowRight,
    MapPin,
    DollarSign,
    Loader2,
    MessageCircle,
    User,
    Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { axiosInstance } from "@/app/lib/axios";

export default function UserDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosInstance.get("/api/user/dashboard");
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!data?.hasLead) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Welcome to Your Property Portal</h2>
                <p className="text-slate-500 mb-8">It looks like you don't have any active property inquiries yet. Start your journey today!</p>
                <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200">
                    Browse Properties
                </button>
            </div>
        );
    }

    const lead = data.lead;
    const stages = ["Assigned", "Call", "Visit", "Deal", "Commission"];
    const currentStageIndex = stages.indexOf(lead.status) === -1 ? 0 : stages.indexOf(lead.status);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* User Hero */}
            <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative z-10">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                        My Property Journey
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black mb-4">Hello, {lead.fullName}!</h1>
                    <p className="text-blue-100 text-lg md:max-w-lg">We're helping you find your perfect home. Here's a quick update on your progress.</p>
                </div>
            </header>

            {/* Application Progress */}
            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-600" /> Current Status
                </h3>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block"></div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                        {stages.map((stage, idx) => {
                            const isCompleted = idx < currentStageIndex;
                            const isCurrent = idx === currentStageIndex;
                            return (
                                <div key={stage} className="flex flex-col items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                                        isCurrent ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' :
                                            'bg-slate-50 text-slate-400'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-black text-sm">{idx + 1}</span>}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-black transition-colors ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                            {stage}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inquiry Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <Briefcase className="w-6 h-6 text-indigo-600" /> My Inquiry Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Property Type" value={lead.propertyType} icon={<Home className="w-4 h-4" />} />
                            <DetailItem label="Max Budget" value={`$${Number(lead.budgetMax).toLocaleString()}`} icon={<DollarSign className="w-4 h-4" />} />
                            <DetailItem label="Location" value={lead.location} icon={<MapPin className="w-4 h-4" />} />
                            <DetailItem label="Assigned Agent" value={lead.assignedAgent || "Pending"} icon={<User className="w-4 h-4" />} />
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black text-slate-800">Properties You Might Like</h3>
                            <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                                View all <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.recommendations?.map((prop: any) => (
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    key={prop._id}
                                    className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group border-transparent hover:border-blue-200 transition-all"
                                >
                                    <div className="aspect-video relative overflow-hidden bg-slate-100">
                                        {prop.images?.[0] ? <img src={prop.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Home className="w-10 h-10 m-auto mt-10 text-slate-300" />}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-800">
                                                {prop.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-black text-slate-800 text-lg mb-1 truncate">{prop.title}</h4>
                                        <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {prop.location}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-black text-blue-600">${Number(prop.price).toLocaleString()}</span>
                                            <button className="p-2 bg-slate-50 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Agent Sidebar (User perspective) */}
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg overflow-hidden">
                            <User className="w-10 h-10 text-slate-400" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800">Your Agent</h4>
                        <p className="text-sm text-slate-500 mb-6">{lead.assignedAgent !== "Unassigned" ? lead.assignedAgent : "Assigning soon..."}</p>

                        <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all group">
                            <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                            Message Agent
                        </button>
                    </div>

                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
                        <h4 className="text-lg font-black mb-2">Need Assistance?</h4>
                        <p className="text-indigo-100 text-sm mb-6 font-medium">Our support team is always here for your property needs.</p>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-2xl transition-all">
                            Help Center
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, icon }: any) {
    return (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
                <p className="font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}