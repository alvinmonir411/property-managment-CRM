"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

export default function PropertiesPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                    <p className="text-gray-500">Manage your property listings</p>
                </div>
                <Link
                    href="/dashboard/agents/add-property"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Property
                </Link>
            </div>

            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">No properties listed yet.</p>
                <Link href="/dashboard/agents/add-property" className="mt-2 text-blue-600 text-sm hover:underline">
                    Add your first property
                </Link>
            </div>
        </div>
    );
}
