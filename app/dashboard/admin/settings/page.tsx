"use client";

import React, { useState } from "react";
import { CreditCard, Shield, Settings, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("billing");

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h1>
                <p className="text-slate-500 font-medium font-medium">Manage agency configuration and billing</p>
            </header>

            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                {['billing', 'security', 'branding'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'billing' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Plan */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                            <div className="relative z-10">
                                <span className="px-4 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 rounded-full mb-6 inline-block">
                                    Current Subscription
                                </span>
                                <h3 className="text-4xl font-black mb-2">Agency Pro Max</h3>
                                <p className="text-slate-400 mb-8 font-medium">Billed annually • Next renewal: Dec 24, 2026</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-white/10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Leads</p>
                                        <p className="text-xl font-bold">Unlimited</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Agents</p>
                                        <p className="text-xl font-bold">Up to 25</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Storage</p>
                                        <p className="text-xl font-bold">100 GB</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">API Access</p>
                                        <p className="text-xl font-bold">Standard</p>
                                    </div>
                                </div>

                                <div className="mt-10 flex items-center gap-4">
                                    <button className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all">
                                        Manage Subscription
                                    </button>
                                    <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                                        View Invoices
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                            <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-slate-400" /> Payment Methods
                            </h4>
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                                    <div>
                                        <p className="font-bold text-slate-800">•••• •••• •••• 4242</p>
                                        <p className="text-xs text-slate-500 font-medium">Expires 12/28</p>
                                    </div>
                                </div>
                                <button className="text-sm font-bold text-blue-600">Update</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Upgrade Options */}
                        <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-black text-blue-900 mb-2">Upgrade to Enterprise</h4>
                            <p className="text-blue-700 text-sm font-medium mb-6 leading-relaxed">Unlock advanced AI lead scoring, dedicated support, and white-labeling.</p>
                            <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group">
                                Learn More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                            <h4 className="text-lg font-black text-slate-800 mb-6">Subscription Support</h4>
                            <div className="space-y-4">
                                <button className="w-full px-6 py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl text-left border border-slate-100">Contact Billing Representative</button>
                                <button className="w-full px-6 py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl text-left border border-slate-100">Request Tax Invoice (VAT)</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab !== 'billing' && (
                <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <Settings className="w-10 h-10 animate-spin-slow" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h3>
                    <p className="text-slate-500 font-medium">This section is currently being optimized for your experience.</p>
                </div>
            )}
        </div>
    );
}
