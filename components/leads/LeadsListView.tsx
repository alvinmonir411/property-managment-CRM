"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  ArrowUpDown,
  Loader2,
  DollarSign,
  MapPin,
  Phone,
  Mail,

  /* imports fixed */
  User,
  TrendingUp,
  Plus,
  CheckCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLeadActions } from "@/hooks/useLeadActions";

interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  location: string;
  purpose: string;
  source: string;
  status: string;
  score: number;
  timeline?: string;
  financeType?: string;
  propertySize?: string;
  contactPref?: string;
  notes?: string;
  nextFollowUpDate?: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export const LeadsListView = () => {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"createdAt" | "score" | "budgetMax">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { executeAction, isActing } = useLeadActions();

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin";

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterAndSortLeads();
  }, [leads, searchQuery, sortBy, sortOrder]);

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads");
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortLeads = () => {
    let filtered = leads.filter(
      (lead) =>
        (lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone.includes(searchQuery) ||
          lead.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "All" || lead.status === statusFilter)
    );

    filtered.sort((a, b) => {
      // 1. Priority to "Assigned" leads
      if (a.status === "Assigned" && b.status !== "Assigned") return -1;
      if (a.status !== "Assigned" && b.status === "Assigned") return 1;

      // 2. Then defined Sort By
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (sortBy === "createdAt") {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    });

    setFilteredLeads(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Lead deleted successfully");
        setLeads(leads.filter((l) => l._id !== id));
        setSelectedLead(null);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      Assigned: "bg-blue-50 text-blue-700 border-blue-200",
      Call: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Visit: "bg-purple-50 text-purple-700 border-purple-200",
      Deal: "bg-green-50 text-green-700 border-green-200",
      Commission: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          <p className="text-slate-500 text-sm">Loading your leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header with Stats */}
      <div className="relative overflow-hidden  rounded-3xl p-8 shadow-2xl shadow-purple-500/20">
        <div className="absolute top-0 right-0 w-ful h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-7xl h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Leads Management
              </h2>
              <p className="text-purple-100">
                Track and manage your property leads efficiently
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/agents/addleads"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all font-medium flex items-center gap-2 backdrop-blur-md border border-white/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Add Lead</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">
                    {filteredLeads.length}
                  </p>
                  <p className="text-purple-100 text-sm">Total Leads</p>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">
                    {filteredLeads.filter((l) => l.status === "Assigned").length}
                  </p>
                  <p className="text-purple-100 text-sm">Assigned</p>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">
                    {filteredLeads.filter((l) => l.score >= 70).length}
                  </p>
                  <p className="text-purple-100 text-sm">Hot Leads</p>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-white/50 shadow-lg transition-all"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="file"
                    id="bulk-import"
                    className="hidden"
                    accept=".json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (evt) => {
                        try {
                          const items = JSON.parse(evt.target?.result as string);
                          const res = await fetch("/api/admin/bulk-import", {
                            method: "POST",
                            body: JSON.stringify({ type: 'leads', items })
                          });
                          const data = await res.json();
                          if (data.success) {
                            toast.success(data.message);
                            window.location.reload();
                          } else {
                            toast.error(data.message);
                          }
                        } catch (err) {
                          toast.error("Invalid JSON format");
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                  <label
                    htmlFor="bulk-import"
                    className="px-5 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg cursor-pointer hover:bg-purple-600 transition-all flex items-center gap-2"
                  >
                    🚀 Bulk Import
                  </label>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-5 py-3.5 bg-white/95 backdrop-blur-sm border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-white/50 shadow-lg cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {["Assigned", "Call", "Visit", "Deal", "Commission"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-5 py-3.5 bg-white/95 backdrop-blur-sm border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-white/50 shadow-lg cursor-pointer"
                >
                  <option value="createdAt">📅 Date Created</option>
                  <option value="score">⭐ Lead Score</option>
                  <option value="budgetMax">💰 Budget</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-3.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-2xl transition-all shadow-lg"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  <ArrowUpDown className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No leads found
            </h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-purple-600 transition-colors">
                      {lead.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border",
                        getStatusBadge(lead.status),
                      )}
                    >
                      {lead.status}
                    </span>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1.5 rounded-full">
                      <TrendingUp
                        className={cn(
                          "w-3.5 h-3.5",
                          lead.score >= 70
                            ? "text-green-600"
                            : lead.score >= 40
                              ? "text-yellow-600"
                              : "text-red-600",
                        )}
                      />
                      <span className="text-xs font-bold text-slate-700">
                        {lead.score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Property Type</p>
                      <p className="font-semibold text-slate-800">
                        {lead.propertyType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Budget Range</p>
                      <p className="font-semibold text-slate-800">
                        ${lead.budgetMin.toLocaleString()} - $
                        {lead.budgetMax.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="font-semibold text-slate-800">
                        {lead.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => executeAction(lead._id, "Call", { phone: lead.phone })}
                    title="Call Lead"
                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-200"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => executeAction(lead._id, "Note", { note: "Quick nudge" })} // Placeholder for now, ideally opens modal
                    title="Add Quick Note"
                    className="p-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all border border-purple-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(lead._id)}
                      disabled={isDeleting}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-200 disabled:opacity-50"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedLead && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2 md:p-4"
            onClick={() => setSelectedLead(null)}
          >
            <div
              className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between rounded-t-2xl md:rounded-t-3xl">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Lead Details
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-4 md:p-8 space-y-6">
                {/* Contact Info */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 md:p-6 rounded-2xl">
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Full Name
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Email
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Phone
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Contact Preference
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.contactPref || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    Property Requirements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 md:p-6 rounded-2xl">
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Property Type
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.propertyType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Location
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Purpose
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.purpose}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Property Size
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.propertySize || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Budget Range
                      </p>
                      <p className="font-semibold text-slate-800">
                        ${selectedLead.budgetMin.toLocaleString()} - $
                        {selectedLead.budgetMax.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Timeline
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.timeline || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Financing
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.financeType || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    Lead Management
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 md:p-6 rounded-2xl">
                    <div>
                      <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">
                        Status
                      </p>
                      <span
                        className={cn(
                          "px-4 py-2 rounded-full text-xs font-semibold border inline-block",
                          getStatusBadge(selectedLead.status),
                        )}
                      >
                        {selectedLead.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Lead Score
                      </p>
                      <p className="font-semibold text-slate-800 text-2xl">
                        {selectedLead.score}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Source
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.source}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Assigned Agent
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.assignedAgent || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Next Follow-up
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedLead.nextFollowUpDate || "Not scheduled"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                        Created At
                      </p>
                      <p className="font-semibold text-slate-800">
                        {new Date(selectedLead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedLead.notes && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 text-lg">
                      Notes
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <p className="text-slate-700 leading-relaxed">
                        {selectedLead.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
