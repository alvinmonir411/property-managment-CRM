"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/lib/axios";

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
    status: string;
    score: number;
    nextFollowUpDate: string;
    notes: string;
};

const PIPELINE = ["Assigned", "Call", "Visit", "Deal", "Commission"];

export default function AssignedLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await axiosInstance.get("/api/Agents/AssignedLeads");
                setLeads(res.data);
            } catch (err) {
                console.error("Failed to fetch leads", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    const moveToNextStage = async (id: string, currentStatus: string) => {
        const nextIndex = PIPELINE.indexOf(currentStatus) + 1;
        if (nextIndex >= PIPELINE.length) return;

        await axiosInstance.patch(`/api/leads/${id}`, {
            status: PIPELINE[nextIndex],
            lastContactedAt: new Date(),
        });

        setLeads((prev) =>
            prev.map((lead) =>
                lead._id === id
                    ? { ...lead, status: PIPELINE[nextIndex] }
                    : lead
            )
        );
    };

    if (loading) return <div className="p-6">Loading leads…</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">My Assigned Leads</h1>

            <div className="grid lg:grid-cols-2 gap-4">
                {leads.map((lead) => (
                    <div
                        key={lead._id}
                        className="rounded-xl border p-4 bg-white shadow-sm space-y-3"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold text-lg">{lead.fullName}</h2>
                            <span className="text-sm px-2 py-1 rounded bg-gray-100">
                                {lead.status}
                            </span>
                        </div>

                        {/* Core info */}
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>📞 {lead.phone}</p>
                            <p>📧 {lead.email}</p>
                            <p>📍 {lead.location}</p>
                        </div>

                        {/* Property */}
                        <div className="text-sm">
                            <p>
                                🏠 {lead.propertyType} — {lead.purpose}
                            </p>
                            <p>
                                💰 Budget: {lead.budgetMin} – {lead.budgetMax}
                            </p>
                        </div>

                        {/* Meta */}
                        <div className="flex justify-between text-sm">
                            <p>🔥 Score: {lead.score}</p>
                            <p>
                                ⏰ Follow-up:{" "}
                                {lead.nextFollowUpDate
                                    ? new Date(lead.nextFollowUpDate).toLocaleDateString()
                                    : "—"}
                            </p>
                        </div>

                        {/* Notes */}
                        {lead.notes && (
                            <p className="text-sm text-gray-500 italic">
                                📝 {lead.notes}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() =>
                                    window.open(`tel:${lead.phone}`)
                                }
                                className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                            >
                                Call
                            </button>

                            <button
                                onClick={() =>
                                    moveToNextStage(lead._id, lead.status)
                                }
                                disabled={lead.status === "Commission"}
                                className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-50"
                            >
                                Move to Next Stage →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
