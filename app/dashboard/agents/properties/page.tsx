"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { Plus, Home, MapPin, Bed, Bath, Layout, Loader2, Search, X, Tag, Building2, Copy, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from "@/app/lib/axios";

type Property = {
    _id: string;
    title: string;
    description?: string;
    price: string;
    location: string;
    type: string;
    category: string;
    images: string[];
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    status: string;
    agentEmail?: string;
    createdAt?: string;
};

const STATUS_COLORS: any = {
    "Available": "bg-green-100 text-green-800 border-green-200",
    "Sold": "bg-red-100 text-red-800 border-red-200",
    "Rent": "bg-blue-100 text-blue-800 border-blue-200",
    "Sale": "bg-purple-100 text-purple-800 border-purple-200",
};

// Seperate component for SearchParams logic to wrap in Suspense
function PropertiesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    // Derived state for modal
    const selectedPropertyId = searchParams.get("propertyId");
    const selectedProperty = properties.find(p => p._id === selectedPropertyId);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await axiosInstance.get("/api/Agents/properties");
            setProperties(res.data);
        } catch (error) {
            console.error("Failed to fetch properties", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (id: string) => {
        router.push(`/dashboard/agents/properties?propertyId=${id}`);
    };

    const handleCloseModal = () => {
        router.push("/dashboard/agents/properties");
    };

    const filteredProperties = useMemo(() => {
        return properties.filter(p => {
            const matchesSearch =
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || p.status === statusFilter;
            const matchesType = typeFilter === "All" || p.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [properties, searchQuery, statusFilter, typeFilter]);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Properties</h1>
                    <p className="text-gray-500">Manage your property listings</p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-blue-700 font-medium text-sm">
                        Total: {properties.length}
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 text-green-700 font-medium text-sm">
                        Available: {properties.filter(p => p.status === 'Available').length}
                    </div>
                    <Link
                        href="/dashboard/agents/add-property"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm hover:shadow ml-2"
                    >
                        <Plus className="w-5 h-5" /> Add Property
                    </Link>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search properties..."
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
                        <option value="Available">Available</option>
                        <option value="Sold">Sold</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-gray-50 border px-3 py-2 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Types</option>
                        <option value="Sale">For Sale</option>
                        <option value="Rent">For Rent</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            {filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No properties found matching your filters</p>
                    <button
                        onClick={() => { setSearchQuery(""); setStatusFilter("All"); setTypeFilter("All"); }}
                        className="mt-2 text-blue-600 text-sm hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                        <div key={property._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition duration-200 flex flex-col h-full">

                            {/* Card Header: Image & Status */}
                            <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100 mb-4 border border-gray-100">
                                {property.images && property.images.length > 0 ? (
                                    <img
                                        src={property.images[0]}
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <Home className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${STATUS_COLORS[property.type] || "bg-white text-gray-700"}`}>
                                        {property.type}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${STATUS_COLORS[property.status] || "bg-white text-gray-700"}`}>
                                        {property.status}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={property.title}>{property.title}</h3>
                                <p className="font-bold text-blue-600">${Number(property.price).toLocaleString()}</p>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                                <MapPin className="w-3.5 h-3.5" /> {property.location}
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-2 mb-4 text-sm text-gray-600 flex-grow">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-[10px] text-gray-400 uppercase">Bed</p>
                                        <p className="font-bold text-gray-700">{property.bedrooms || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-[10px] text-gray-400 uppercase">Bath</p>
                                        <p className="font-bold text-gray-700">{property.bathrooms || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-[10px] text-gray-400 uppercase">Sqft</p>
                                        <p className="font-bold text-gray-700">{property.area || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t pt-4 mt-auto flex gap-3">
                                <button
                                    onClick={() => handleViewDetails(property._id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(property._id);
                                        window.alert("Copied ID!");
                                    }}
                                    title="Copy ID"
                                    className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedProperty && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all" onClick={handleCloseModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="relative h-64 bg-gray-200 flex-shrink-0">
                            {selectedProperty.images && selectedProperty.images.length > 0 ? (
                                <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Home className="w-16 h-16" />
                                </div>
                            )}
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 bg-white/50 backdrop-blur-md hover:bg-white text-gray-800 p-2 rounded-full transition shadow-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold shadow-sm ${STATUS_COLORS[selectedProperty.status] || "bg-gray-500 text-white"}`}>
                                    {selectedProperty.status || 'Available'}
                                </span>
                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-bold text-gray-900 shadow-sm">
                                    {selectedProperty.type}
                                </span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProperty.title}</h2>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        <span>{selectedProperty.location}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-600">${Number(selectedProperty.price).toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Guide Price</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <Bed className="w-6 h-6 text-blue-500 mb-2" />
                                    <span className="font-bold text-gray-900">{selectedProperty.bedrooms || '-'}</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Bedrooms</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <Bath className="w-6 h-6 text-blue-500 mb-2" />
                                    <span className="font-bold text-gray-900">{selectedProperty.bathrooms || '-'}</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Bathrooms</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <Layout className="w-6 h-6 text-blue-500 mb-2" />
                                    <span className="font-bold text-gray-900">{selectedProperty.area || '-'}</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Sq Ft</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {selectedProperty.description || "No description provided."}
                                </p>
                            </div>

                            {/* Additional Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-gray-500" /> Property Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type</span>
                                            <span className="font-medium text-gray-900">{selectedProperty.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Category</span>
                                            <span className="font-medium text-gray-900">{selectedProperty.category || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status</span>
                                            <span className={`font-medium ${selectedProperty.status === 'Available' ? 'text-green-600' : 'text-gray-900'}`}>{selectedProperty.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-500" /> Administrative Info
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Listing Agent</span>
                                            <span className="font-medium text-gray-900">{selectedProperty.agentEmail}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Posted On</span>
                                            <span className="font-medium text-gray-900">
                                                {selectedProperty.createdAt ? new Date(selectedProperty.createdAt).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Property ID</span>
                                            <span className="font-medium text-gray-500 text-xs font-mono">{selectedProperty._id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedProperty._id);
                                        window.alert("Property ID copied to clipboard!");
                                    }}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" /> Copy Property ID
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>}>
            <PropertiesContent />
        </Suspense>
    );
}
