"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Home,
    MapPin,
    DollarSign,
    Plus,
    Loader2,
    Edit2,
    Eye
} from "lucide-react";
import { axiosInstance } from "@/app/lib/axios";
import Link from "next/link";

export default function AssistantPropertiesPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await axiosInstance.get("/api/Agents/properties");
                setProperties(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const filtered = properties.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Management</h1>
                    <p className="text-slate-500 font-medium font-medium">Manage agency property listings</p>
                </div>
                <Link href="/dashboard/agents/add-property">
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                        <Plus className="w-5 h-5" />
                        Add Listing
                    </button>
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search properties by title or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((prop) => (
                    <div key={prop._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                        <div className="aspect-video relative overflow-hidden bg-slate-100">
                            {prop.images?.[0] ? <img src={prop.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <Home className="m-auto mt-10 w-12 h-12 text-slate-300" />}
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${prop.status === 'Sold' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                                    }`}>
                                    {prop.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{prop.type}</p>
                            <h3 className="text-xl font-black text-slate-800 mb-2 truncate">{prop.title}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                <MapPin className="w-4 h-4" /> {prop.location}
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-5 h-5 text-slate-900" />
                                    <span className="text-2xl font-black text-slate-800">{Number(prop.price).toLocaleString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
