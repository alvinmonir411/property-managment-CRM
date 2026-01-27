"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Home,
  DollarSign,
  MapPin,
  Target,
  Globe,
  Clock,
  CreditCard,
  Maximize,
  MessageSquare,
  BadgeCheck,
  Star,
  UserCheck,
  Calendar,
  Loader2,
  Save,
} from "lucide-react";
import { axiosInstance } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function EditLeadForm({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    axiosInstance
      .get(`/api/leads/${id}`)
      .then((res) => setLead(res.data.lead))
      .catch(() => toast.error("Failed to load lead"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setLead((prev: any) => ({ ...prev, [name]: value }));
  };
  console.log("btn clicked");
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.patch(`/api/leads/${id}`, lead);
      toast.success("Lead updated successfully");
      router.back();
      router.refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Edit Lead</h2>
      <p className="text-slate-500 mb-8">
        Full admin control over lead lifecycle
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* CLIENT INFO */}
        <Section title="Client Information">
          <Grid>
            <Input
              icon={User}
              label="Full Name"
              name="fullName"
              value={lead.fullName}
              onChange={handleChange}
            />
            <Input
              icon={Mail}
              label="Email"
              name="email"
              value={lead.email}
              onChange={handleChange}
            />
            <Input
              icon={Phone}
              label="Phone"
              name="phone"
              value={lead.phone}
              onChange={handleChange}
            />
            <Input
              icon={MapPin}
              label="Location"
              name="location"
              value={lead.location}
              onChange={handleChange}
            />
          </Grid>
        </Section>

        {/* PROPERTY & BUDGET */}
        <Section title="Property & Budget">
          <Grid>
            <Select
              icon={Home}
              label="Property Type"
              name="propertyType"
              value={lead.propertyType}
              onChange={handleChange}
              options={["Apartment", "House", "Land", "Commercial"]}
            />
            <Input
              icon={DollarSign}
              label="Min Budget"
              name="budgetMin"
              value={lead.budgetMin}
              onChange={handleChange}
            />
            <Input
              icon={DollarSign}
              label="Max Budget"
              name="budgetMax"
              value={lead.budgetMax}
              onChange={handleChange}
            />
            <Input
              icon={Maximize}
              label="Property Size"
              name="propertySize"
              value={lead.propertySize}
              onChange={handleChange}
            />
          </Grid>
        </Section>

        {/* LEAD INTENT */}
        <Section title="Lead Intent">
          <Grid>
            <Select
              icon={Target}
              label="Purpose"
              name="purpose"
              value={lead.purpose}
              onChange={handleChange}
              options={["Buy", "Rent", "Invest"]}
            />
            <Select
              icon={Clock}
              label="Timeline"
              name="timeline"
              value={lead.timeline}
              onChange={handleChange}
              options={["ASAP", "1–3 months", "3–6 months"]}
            />
            <Select
              icon={CreditCard}
              label="Finance Type"
              name="financeType"
              value={lead.financeType}
              onChange={handleChange}
              options={["Cash", "Bank Loan"]}
            />
            <Select
              icon={MessageSquare}
              label="Contact Preference"
              name="contactPref"
              value={lead.contactPref}
              onChange={handleChange}
              options={["Call", "WhatsApp", "Email"]}
            />
          </Grid>
        </Section>

        {/* CRM CONTROL */}
        <Section title="CRM Control">
          <Grid>
            <Select
              icon={BadgeCheck}
              label="Status"
              name="status"
              value={lead.status}
              onChange={handleChange}
              options={[
                "New",
                "Contacted",
                "Qualified",
                "Assigned",
                "Closed",
                "Lost",
              ]}
            />
            <Input
              icon={Star}
              label="Lead Score"
              name="score"
              value={lead.score}
              onChange={handleChange}
            />
            <Select
              icon={Globe}
              label="Source"
              name="source"
              value={lead.source}
              onChange={handleChange}
              options={[
                "Website",
                "Facebook",
                "WhatsApp",
                "Referral",
                "Manual",
              ]}
            />
            <Input
              icon={UserCheck}
              label="Assigned Agent"
              name="assignedAgent"
              value={lead.assignedAgent}
              onChange={handleChange}
            />
          </Grid>
        </Section>

        {/* NOTES */}
        <Section title="Notes & Follow-up">
          <Grid>
            <Input
              icon={Calendar}
              type="date"
              label="Next Follow-up"
              name="nextFollowUpDate"
              min={new Date().toISOString().split("T")[0]}
              value={lead.nextFollowUpDate?.slice(0, 10)}
              onChange={handleChange}
            />
            <Textarea
              label="Notes"
              name="notes"
              value={lead.notes}
              onChange={handleChange}
            />
          </Grid>
        </Section>

        {/* READ ONLY SYSTEM */}
        <Section title="System Info (Read-only)">
          <Grid>
            <Readonly label="Lead Added By" value={lead.leadsAddby} />
            <Readonly
              label="Last Contacted"
              value={lead.lastContactedAt || "—"}
            />
            <Readonly
              label="Created At"
              value={new Date(lead.createdAt).toLocaleString()}
            />
            <Readonly
              label="Updated At"
              value={new Date(lead.updatedAt).toLocaleString()}
            />
          </Grid>
        </Section>

        {/* ACTION */}
        <div className="flex justify-end pt-6 border-t">
          <button
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Lead
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- UI PRIMITIVES ---------- */

const Section = ({ title, children }: any) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <h3 className="font-semibold text-purple-600 mb-6">{title}</h3>
    {children}
  </div>
);

const Grid = ({ children }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

const Input = ({ icon: Icon, label, ...props }: any) => (
  <div>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative mt-2">
      <Icon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
      />
    </div>
  </div>
);

const Select = ({ icon: Icon, label, options, ...props }: any) => (
  <div>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative mt-2">
      <Icon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
      <select
        {...props}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
      >
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div className="md:col-span-2">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <textarea
      {...props}
      rows={4}
      className="mt-2 w-full px-4 py-2.5 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
    />
  </div>
);

const Readonly = ({ label, value }: any) => (
  <div>
    <label className="text-sm font-medium text-slate-500">{label}</label>
    <div className="mt-2 px-4 py-2.5 bg-slate-100 rounded-xl text-slate-600 text-sm">
      {value}
    </div>
  </div>
);
