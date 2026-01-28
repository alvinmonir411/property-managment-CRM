"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Lock, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export const ProfileView = () => {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const user = session?.user as any;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.patch("/api/user/profile", {
                name: formData.name,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            if (response.data.success) {
                toast.success("Profile updated successfully");
                // Update session
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: formData.name,
                    },
                });

                setFormData({
                    ...formData,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-500 mt-2">Manage your account settings and personal information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: User Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-1 mb-4 shadow-lg">
                            <img
                                src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Felix'}`}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover border-4 border-white"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{user?.name || "No Name"}</h2>
                        <p className="text-sm text-slate-500 mb-4">{user?.email}</p>

                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full">
                            <Shield className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-600">
                                {user?.role || "User"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                <User className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-slate-800">Personal Information</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                    <div className="relative group">
                                        <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 opacity-60">
                                    <label className="text-sm font-semibold text-slate-700">Email Address (Read-only)</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            disabled
                                            type="email"
                                            value={user?.email || ""}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm cursor-not-allowed font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 opacity-60">
                                    <label className="text-sm font-semibold text-slate-700">Account Role (Read-only)</label>
                                    <div className="relative">
                                        <Shield className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            disabled
                                            type="text"
                                            value={user?.role?.toUpperCase() || ""}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm cursor-not-allowed font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 pb-2 border-b border-slate-50">
                                <Lock className="w-5 h-5 text-purple-600" />
                                <h3 className="font-bold text-slate-800">Security</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Current Password</label>
                                    <div className="relative group">
                                        <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">New Password</label>
                                        <div className="relative group">
                                            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                                        <div className="relative group">
                                            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
