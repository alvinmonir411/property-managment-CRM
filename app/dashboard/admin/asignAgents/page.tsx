"use client";

import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/app/lib/axios";
import { toast } from "react-toastify";

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  assignedAgent: string;
}
interface user {
  _id: string;
  email: string;
  password: string;
}

const agenAsign = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setagents] = useState<user[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<{
    [key: string]: string;
  }>({});

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/leads/unassigned", {
        withCredentials: true,
      });
      setLeads(response.data.leads);
    } catch (err) {
      toast.error("Cannot fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    const response = await axiosInstance.get("/api/admin/agentfetch");
    setagents(response.data.agents || []);
  };

  useEffect(() => {
    fetchLeads();
    fetchAgents();
  }, []);

  const handleAssign = async (leadId: string) => {
    const agent = selectedAgents[leadId];
    if (!agent) return toast.error("Select an agent first");

    try {
      setAssigning(leadId);
      const response = await axiosInstance.patch(
        `/api/admin/assignedAgent/${leadId}`,
        { assignedAgent: agent, status: "Assigned" },
        { withCredentials: true },
      );

      toast.success(response.data.message || "Lead assigned successfully");
      setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
      setSelectedAgents((prev) => {
        const copy = { ...prev };
        delete copy[leadId];
        return copy;
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to assign");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        Unassigned Leads
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading leads...</p>
      ) : leads.length === 0 ? (
        <p className="text-gray-500">No unassigned leads available</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <div
              key={lead._id}
              className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl border border-purple-200 flex flex-col justify-between transition-transform transform hover:-translate-y-1"
            >
              <div>
                <h2 className="text-xl font-semibold text-purple-800">
                  {lead.name}
                </h2>
                <p className="text-gray-600">{lead.phone}</p>
                {lead.email && <p className="text-gray-600">{lead.email}</p>}
                {lead.notes && (
                  <p className="mt-2 text-gray-500 text-sm">{lead.notes}</p>
                )}
              </div>

              <div className="mt-4 flex items-center space-x-2">
                <select
                  value={selectedAgents[lead._id] || ""}
                  onChange={(e) =>
                    setSelectedAgents((prev) => ({
                      ...prev,
                      [lead._id]: e.target.value,
                    }))
                  }
                  className="flex-1 border border-purple-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select agent</option>
                  {agents.map((agent) => (
                    <option key={agent.email} value={agent?.email}>
                      {agent.email}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAssign(lead._id)}
                  disabled={assigning === lead._id}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {assigning === lead._id ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default agenAsign;
