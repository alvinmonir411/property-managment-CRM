"use client";

import AddPropertyForm from "@/app/components/forms/AddPropertyForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddPropertyPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard/agents/properties" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Properties
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
                <p className="text-gray-500">List an apartment, house, or land for sale or rent.</p>
            </div>

            <AddPropertyForm />
        </div>
    );
}
