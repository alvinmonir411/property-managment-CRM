"use client";

import React from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function AssistantCalendarPage() {
    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agency Schedule</h1>
                    <p className="text-slate-500 font-medium">Coordinate visits and meetings across the team</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <Filter className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200">
                        Schedule Event
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-slate-800">January 2026</h2>
                        <div className="flex gap-1">
                            <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="flex gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                        <span className="px-3 py-1 bg-slate-50 rounded-lg text-slate-800">Month</span>
                        <span className="px-3 py-1 hover:bg-slate-50 rounded-lg">Week</span>
                        <span className="px-3 py-1 hover:bg-slate-50 rounded-lg">Day</span>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 border-r border-b border-slate-50 h-[600px]">
                    {[...Array(31)].map((_, i) => (
                        <div key={i} className="border-l border-t border-slate-50 p-4 hover:bg-slate-50 group cursor-pointer transition-colors relative">
                            <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600">{i + 1}</span>
                            {i === 15 && (
                                <div className="mt-2 space-y-1">
                                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md truncate">Visit: Client Apt</div>
                                    <div className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md truncate">Staff Meeting</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
