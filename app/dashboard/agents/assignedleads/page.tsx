"use client";

import { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/app/lib/axios";
import { toast } from "react-toastify";
import {
    Mail, Phone, MapPin, Calendar, DollarSign,
    Search, Filter, Flame, CheckCircle, Clock,
    Loader2, X, ChevronRight, User, Home, FileText
} from "lucide-react";

type Lead = {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    propertyType: string;
    purpose: string;
    budgetMin: string;
    budgetMax: string;
    location: string;
    status: "Assigned" | "Call" | "Visit" | "Deal" | "Commission";
    score: number;
    nextFollowUpDate?: string;
    notes?: string;
    followUpCount?: number;
    dealPrice?: number;
    propertyId?: string;
    history?: {
        date: string;
        action: string;
        note?: string;
        propertyId?: string;
        agentName?: string;
    }[];
};

type Property = {
    _id: string;
    title: string;
    price: string;
    location: string;
    type: string;
    images: string[];
};

const NEXT_STAGES = ["Visit", "Deal", "Commission"];

const STATUS_COLORS = {
    "Assigned": "bg-blue-100 text-blue-800 border-blue-200",
    "Call": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Visit": "bg-purple-100 text-purple-800 border-purple-200",
    "Deal": "bg-green-100 text-green-800 border-green-200",
    "Commission": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function AssignedLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [onlyHot, setOnlyHot] = useState(false);

    // Modal State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [note, setNote] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [nextStage, setNextStage] = useState<string>("");
    const [dealPrice, setDealPrice] = useState<number | "">("");
    const [updating, setUpdating] = useState(false);

    // Properties State
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [propertySearch, setPropertySearch] = useState("");

    useEffect(() => {
        fetchLeads();
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await axiosInstance.get("/api/Agents/properties");
            setProperties(res.data);
        } catch (err) {
            console.error("Failed to fetch properties");
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await axiosInstance.get("/api/Agents/AssignedLeads");
            setLeads(res.data);
        } catch (err) {
            toast.error("Failed to fetch leads");
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch =
                lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.phone.includes(searchQuery);

            const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
            const matchesHot = !onlyHot || lead.score >= 70;

            return matchesSearch && matchesStatus && matchesHot;
        });
    }, [leads, searchQuery, statusFilter, onlyHot]);

    const handleUpdateLead = async () => {
        if (!selectedLead) return;

        if (nextStage === "Deal" && !selectedPropertyId && !selectedLead.propertyId) {
            toast.error("Please link a property first (in Visit stage)");
            return;
        }

        setUpdating(true);
        try {
            await axiosInstance.patch("/api/Agents/convert", {
                leadId: selectedLead._id,
                note,
                followUpDate,
                nextStage: nextStage || undefined,
                dealPrice: nextStage === "Deal" ? dealPrice : undefined,
                propertyId: selectedPropertyId || undefined,
            });
            toast.success("Lead updated successfully!");
            await fetchLeads();
            resetModal();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update lead");
        } finally {
            setUpdating(false);
        }
    };

    const resetModal = () => {
        setSelectedLead(null);
        setNote("");
        setFollowUpDate("");
        setNextStage("");
        setNextStage("");
        setNextStage("");
        setDealPrice("");
        setSelectedPropertyId("");
        setPropertySearch("");
    };

    const openModal = (lead: Lead) => {
        setSelectedLead(lead);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFollowUpDate(tomorrow.toISOString().split('T')[0]);
        if (lead.propertyId) setSelectedPropertyId(lead.propertyId);
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Pipeline</h1>
                    <p className="text-gray-500">Manage your active deals and follow-ups</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-blue-700 font-medium">
                        Total: {leads.length}
                    </div>
                    <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 text-orange-700 font-medium">
                        Hot Leads: {leads.filter(l => l.score >= 70).length}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search leads by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border px-3 py-2 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Statuses</option>
                        {["Assigned", "Call", "Visit", "Deal", "Commission"].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setOnlyHot(!onlyHot)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${onlyHot
                            ? "bg-orange-50 border-orange-200 text-orange-700"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <Flame className={`w-4 h-4 ${onlyHot ? "fill-orange-500 text-orange-500" : ""}`} />
                        Hot Leads
                    </button>
                </div>
            </div>

            {/* Leads Grid */}
            {filteredLeads.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No leads found matching your filters</p>
                    <button
                        onClick={() => { setSearchQuery(""); setStatusFilter("All"); setOnlyHot(false); }}
                        className="mt-2 text-blue-600 text-sm hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredLeads.map((lead) => (
                        <div key={lead._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition duration-200 flex flex-col h-full">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-gray-900">{lead.fullName}</h3>
                                        {lead.score >= 70 && (
                                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                <Flame className="w-3 h-3 fill-orange-500" /> HOT
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <MapPin className="w-3 h-3" /> {lead.location}
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[lead.status] || "bg-gray-100"}`}>
                                    {lead.status}
                                </span>
                            </div>

                            {/* Key Details */}
                            <div className="space-y-2 mb-4 text-sm text-gray-600 flex-grow">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-400">Budget Range</p>
                                        <p className="font-medium">{lead.budgetMin} - {lead.budgetMax}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-400">Property</p>
                                        <p className="font-medium">{lead.propertyType} ({lead.purpose})</p>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-1">
                                    <p className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer" onClick={() => window.open(`mailto:${lead.email}`)}>
                                        <Mail className="w-3.5 h-3.5" /> {lead.email}
                                    </p>
                                    <p className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer" onClick={() => window.open(`tel:${lead.phone}`)}>
                                        <Phone className="w-3.5 h-3.5" /> {lead.phone}
                                    </p>
                                </div>

                                {lead.nextFollowUpDate && (
                                    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        Next Follow-up: {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="border-t pt-4 mt-auto">
                                <div className="flex gap-3">
                                    <a
                                        href={`tel:${lead.phone}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm hover:bg-gray-100 transition"
                                    >
                                        <Phone className="w-4 h-4" /> Call
                                    </a>

                                    {lead.status !== "Commission" ? (
                                        <button
                                            onClick={() => openModal(lead)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition"
                                        >
                                            NextStage <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-100">
                                            <CheckCircle className="w-4 h-4" /> Closed
                                        </div>
                                    )}
                                </div>
                                {lead.followUpCount !== undefined && (
                                    <p className="text-[10px] text-center text-gray-400 mt-2">
                                        {lead.followUpCount} interactions logged
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Interaction Modal */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all" onClick={resetModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedLead.fullName}</h2>
                                <p className="text-sm text-gray-500">Update pipeline status & log activity</p>
                            </div>
                            <button onClick={resetModal} className="p-1 hover:bg-gray-200 rounded-full transition">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 overflow-y-auto">

                            {/* Notes Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Note / Activity Log</label>
                                <textarea
                                    placeholder="Spoke to client about... Client is interested in..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm"
                                />
                            </div>

                            {/* Activity Timeline */}
                            <div className="bg-gray-50 border rounded-xl p-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" /> Activity History
                                </h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {selectedLead.history && selectedLead.history.length > 0 ? (
                                        [...selectedLead.history].reverse().map((item, idx) => {
                                            const prop = item.propertyId ? properties.find(p => p._id === item.propertyId) : null;
                                            return (
                                                <div key={idx} className="relative pl-6 border-l-2 border-gray-200 last:border-0 pb-4 last:pb-0">
                                                    <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ${item.action === 'Deal' ? 'bg-green-500' :
                                                            item.action === 'Visit' ? 'bg-purple-500' :
                                                                item.action === 'Call' ? 'bg-yellow-500' :
                                                                    'bg-blue-400'
                                                        }`} />
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-bold text-gray-700">{item.action}</span>
                                                        <span className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                                                    </div>
                                                    {item.note && <p className="text-xs text-gray-600 mt-0.5">{item.note}</p>}
                                                    {prop && (
                                                        <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 bg-white border px-1.5 py-0.5 rounded w-fit">
                                                            <Home className="w-3 h-3" /> {prop.title}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-4">No activity recorded yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Follow Up Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            value={followUpDate}
                                            onChange={(e) => setFollowUpDate(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Next Stage */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Move to Stage</label>
                                    <select
                                        value={nextStage}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNextStage(val);
                                            // Reset deal price if not Deal
                                            if (val !== "Deal") setDealPrice("");
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">Keep current ({selectedLead.status})</option>
                                        {NEXT_STAGES.map(stage => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>


                            {/* Visit Stage - Select Property */}
                            {nextStage === "Visit" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Property for Visit</label>

                                    {/* Property Search */}
                                    <div className="mb-2 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                        <input
                                            type="text"
                                            placeholder="Paste Property ID or Search Title..."
                                            value={propertySearch}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPropertySearch(val);
                                                // Auto-select if exact ID match
                                                const exactMatch = properties.find(p => p._id === val);
                                                if (exactMatch) setSelectedPropertyId(exactMatch._id);
                                            }}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                                        />
                                    </div>

                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            value={selectedPropertyId}
                                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                        >
                                            <option value="">-- Choose a Property --</option>
                                            {properties
                                                .filter(p =>
                                                    p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
                                                    p._id === propertySearch.trim()
                                                )
                                                .map(p => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.title} - ${Number(p.price).toLocaleString()}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1 mb-3">Please select the property the client is visiting.</p>

                                    {selectedPropertyId && (() => {
                                        const prop = properties.find(p => p._id === selectedPropertyId);
                                        if (!prop) return null;
                                        return (
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {prop.images && prop.images[0] ? (
                                                        <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                            <Home className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{prop.title}</p>
                                                    <p className="text-xs text-gray-500 truncate mb-1">{prop.location}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{prop.type}</span>
                                                        <span className="text-sm font-bold text-gray-900">${Number(prop.price).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Deal Price Logic */}
                            {nextStage === "Deal" && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-green-50 p-4 rounded-xl border border-green-100">
                                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" /> Deal Closure & Commission
                                    </h4>

                                    {selectedPropertyId ? (
                                        (() => {
                                            const prop = properties.find(p => p._id === selectedPropertyId);
                                            // Fallback logic handled by parent check or similar, simplified for UI clarity

                                            if (!prop) return <p className="text-sm text-red-600">Linked property details not found or not available.</p>;

                                            const price = Number(prop.price);
                                            const commission = price * 0.30;

                                            return (
                                                <div className="space-y-4">
                                                    {/* Property Card */}
                                                    <div className="bg-white rounded-xl p-3 border border-green-100 flex gap-3 shadow-sm">
                                                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                            {prop.images && prop.images[0] ? (
                                                                <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                                    <Home className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 truncate">{prop.title}</p>
                                                            <p className="text-xs text-gray-500 truncate">{prop.location}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Sale Price:</span>
                                                            <span className="font-medium text-gray-900">${price.toLocaleString()}</span>
                                                        </div>
                                                        <div className="border-t border-green-200 my-1"></div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-green-700 font-bold">Your Commission (30%):</span>
                                                            <span className="text-xl font-bold text-green-700">${commission.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="text-center text-amber-600 text-sm">
                                            <p>No property linked to this lead.</p>
                                            <p className="mt-1">Please go back to 'Visit' stage and select a property first.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t bg-gray-50 flex gap-3">
                            <button
                                onClick={resetModal}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateLead}
                                disabled={updating}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {nextStage === "Deal" ? "Close Deal" : "Save Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
