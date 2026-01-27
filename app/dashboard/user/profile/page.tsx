"use client";

import React, { useState } from "react";
import { User, Mail, Shield, Camera, Save, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(session?.user?.name || "");

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                toast.success("Profile updated!");
                update({ name });
            } else {
                toast.error("Failed to update profile");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black text-slate-800">My Profile</h1>
                <p className="text-slate-500 font-medium">Manage your personal information and security</p>
            </header>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <form onSubmit={handleUpdate} className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
                        <div className="relative group">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl">
                                <span className="text-4xl font-black">{session?.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                            </div>
                            <button type="button" className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-slate-100 text-blue-600 hover:scale-110 transition-transform">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-black text-slate-800">{session?.user?.name || "User"}</h3>
                            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
                                <Mail className="w-4 h-4" /> {session?.user?.email}
                            </p>
                            <span className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full inline-block">
                                {(session?.user as any)?.role || "User"} Role
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent focus:border-blue-500 rounded-2xl focus:outline-none transition-all font-bold text-slate-800"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 opacity-60">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Email (Primary)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    disabled
                                    value={session?.user?.email || ""}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl cursor-not-allowed font-bold text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-lg font-black text-slate-800 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-emerald-500" /> Security Settings
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">Keep your account secure with a strong password.</p>
                    <button className="text-sm font-bold text-blue-600 hover:underline">Change Password</button>
                </div>
                <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm space-y-4">
                    <h4 className="text-lg font-black text-red-800">Danger Zone</h4>
                    <p className="text-sm text-red-600 font-medium">Deleting your account is permanent and cannot be undone.</p>
                    <button className="text-sm font-bold text-red-600 hover:underline">Deactivate Account</button>
                </div>
            </div>
        </div>
    );
}
