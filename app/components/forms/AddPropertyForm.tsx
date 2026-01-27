"use client";

import { useState } from "react";
import { axiosInstance } from "@/app/lib/axios";
import { toast } from "react-toastify";
import {
    Loader2, Upload, MapPin, Home, DollarSign,
    Layout, Bed, Bath, Plus, Image as ImageIcon,
    CheckCircle, Type, Building2
} from "lucide-react";
import { useRouter } from "next/navigation";

const InputGroup = ({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Icon className="w-4 h-4 text-blue-500" />
            {label}
        </label>
        {children}
    </div>
);

export default function AddPropertyForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        type: "Sale",
        category: "Apartment",
        bedrooms: "",
        bathrooms: "",
        area: "",
        images: [] as string[]
    });
    const [imageUrl, setImageUrl] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                area: Number(formData.area),
                images: imageUrl ? [imageUrl] : []
            };

            await axiosInstance.post("/api/Agents/properties", payload);
            toast.success("Property published successfully!");
            router.push("/dashboard/agents/properties");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add property");
        } finally {
            setLoading(false);
        }
    };



    return (
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg shadow-blue-200">
                <h2 className="text-2xl font-bold mb-2">Create New Listing</h2>
                <p className="text-blue-100 opacity-90">Fill in the details below to publish your property to the marketplace.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Details Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                            <Home className="w-5 h-5 text-gray-400" /> Basic Information
                        </h3>

                        <div className="space-y-6">
                            <InputGroup icon={Type} label="Property Title">
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Modern Luxury Apartment with City View"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                                />
                            </InputGroup>

                            <InputGroup icon={Type} label="Description">
                                <textarea
                                    name="description"
                                    rows={5}
                                    placeholder="Describe the key features, amenities, and selling points..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </InputGroup>
                        </div>
                    </div>

                    {/* Features Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                            <Layout className="w-5 h-5 text-gray-400" /> Specifications
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                            <InputGroup icon={Bed} label="Bedrooms">
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center font-bold text-gray-700"
                                />
                            </InputGroup>
                            <InputGroup icon={Bath} label="Bathrooms">
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center font-bold text-gray-700"
                                />
                            </InputGroup>
                            <InputGroup icon={Layout} label="Area (sqft)">
                                <input
                                    type="number"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center font-bold text-gray-700"
                                />
                            </InputGroup>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Status & Pricing Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                            <DollarSign className="w-5 h-5 text-gray-400" /> details
                        </h3>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-gray-700 cursor-pointer"
                                    >
                                        <option value="Sale">For Sale</option>
                                        <option value="Rent">For Rent</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-gray-700 cursor-pointer"
                                    >
                                        <option value="Apartment">Apartment</option>
                                        <option value="House">House</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Land">Land</option>
                                    </select>
                                </div>
                            </div>

                            <InputGroup icon={DollarSign} label="Price">
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-blue-500 transition-colors">$</span>
                                    <input
                                        required
                                        type="number"
                                        name="price"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                                    />
                                </div>
                            </InputGroup>

                            <InputGroup icon={MapPin} label="Location">
                                <textarea
                                    required
                                    rows={2}
                                    name="location"
                                    placeholder="Full Address"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                                />
                            </InputGroup>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                            <ImageIcon className="w-5 h-5 text-gray-400" /> Media
                        </h3>

                        <div className="space-y-4">
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Upload className="w-4 h-4" />
                                </span>
                                <input
                                    type="url"
                                    placeholder="Paste Image URL..."
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                />
                            </div>

                            {imageUrl && (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-40 bg-gray-50 group">
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                                        Preview
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Publish Property
                    </button>
                </div>
            </div>
        </form>
    );
}
