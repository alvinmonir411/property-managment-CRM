"use client";

import React, { useState, useEffect, useMemo } from "react";
import { axiosInstance } from "@/app/lib/axios";
import { useLeadActions } from "@/hooks/useLeadActions";
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Clock, Phone, MessageCircle, MoreHorizontal, CheckCircle, X
} from "lucide-react";
import { toast } from "react-toastify";

type Lead = {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    nextFollowUpDate?: string;
    notes?: string;
    priority?: string;
};

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null); // For detailed action modal

    const { executeAction } = useLeadActions();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/api/Agents/AssignedLeads");
            setLeads(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load calendar events");
        } finally {
            setLoading(false);
        }
    };

    // Calendar Logic
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
    }, [currentDate]);

    const firstDayOffset = useMemo(() => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    }, [currentDate]);

    const getEventsForDate = (date: Date) => {
        return leads.filter(l => {
            if (!l.nextFollowUpDate) return false;
            const d = new Date(l.nextFollowUpDate);
            return d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear() &&
                !["Deal", "Commission", "Closed"].includes(l.status);
        });
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    // Drawer Logic
    const activeEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Schedule</h1>
                        <p className="text-slate-500">Plan your customer interactions</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0 bg-slate-50 p-2 rounded-2xl">
                        <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h2 className="text-lg font-bold text-slate-800 min-w-[140px] text-center">
                            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px">
                        {Array.from({ length: firstDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-white min-h-[120px]" />
                        ))}

                        {daysInMonth.map(date => {
                            const events = getEventsForDate(date);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isSelected = selectedDate?.toDateString() === date.toDateString();

                            return (
                                <div
                                    key={date.toISOString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={`bg-white min-h-[120px] p-2 transition-colors cursor-pointer hover:bg-purple-50/30
                                        ${isSelected ? 'bg-purple-50 ring-2 ring-inset ring-purple-200' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                            ${isToday ? 'bg-purple-600 text-white' : 'text-slate-700'}
                                        `}>
                                            {date.getDate()}
                                        </span>
                                        {events.length > 0 && (
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {events.length} tasks
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        {events.slice(0, 3).map(lead => (
                                            <div key={lead._id} className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-50 border border-slate-100 truncate text-slate-600 border-l-2 border-l-purple-400">
                                                {lead.fullName}
                                            </div>
                                        ))}
                                        {events.length > 3 && (
                                            <div className="text-[10px] text-slate-400 pl-1">
                                                +{events.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Drawer / Logic */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]" onClick={() => setSelectedDate(null)}>
                    <div
                        className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">
                                    {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <p className="text-slate-500 font-medium">{activeEvents.length} tasks scheduled</p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activeEvents.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No events scheduled</p>
                                </div>
                            ) : (
                                activeEvents.map(lead => (
                                    <div key={lead._id} className="group bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{lead.fullName}</h4>
                                                <p className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded inline-block mt-1 border border-slate-100">{lead.status}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => executeAction(lead._id, "Call", { phone: lead.phone })}
                                                    className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                                    title="Call"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => executeAction(lead._id, "WhatsApp", { phone: lead.phone })}
                                                    className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {lead.notes && (
                                            <p className="text-sm text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100 mb-4">
                                                "{lead.notes.split('\n').pop()}"
                                            </p>
                                        )}

                                        <button
                                            onClick={() => executeAction(lead._id, "Note", { note: "Calendar Check-in" })}
                                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Mark / Update
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
