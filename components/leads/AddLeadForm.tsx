"use client"

import React, { useState } from 'react'
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
    PlusCircle,
    Loader2
} from 'lucide-react'
import { toast } from 'react-toastify'

export const AddLeadForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        propertyType: 'Apartment',
        budgetMin: '',
        budgetMax: '',
        location: '',
        purpose: 'Buy',
        source: 'Manual',
        timeline: 'ASAP',
        financeType: 'Bank Loan',
        propertySize: '',
        contactPref: 'Call',
        notes: '',
        nextFollowUpDate: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Final Form Data:', formData)

        setIsLoading(true)
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success('Lead added successfully!')
                // Reset form
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    propertyType: 'Apartment',
                    budgetMin: '',
                    budgetMax: '',
                    location: '',
                    purpose: 'Buy',
                    source: 'Manual',
                    timeline: 'ASAP',
                    financeType: 'Bank Loan',
                    propertySize: '',
                    contactPref: 'Call',
                    notes: '',
                    nextFollowUpDate: ''
                })
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to add lead')
            }
        } catch (err) {
            console.error(err)
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Add New Lead</h2>
                <p className="text-slate-500">Enter client information to initialize the lead management process.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* A. Required Client Fields */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">Required Client Fields</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Interested Property Type</label>
                            <div className="relative">
                                <Home className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <select
                                    required
                                    name="propertyType"
                                    value={formData.propertyType}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                                >
                                    <option>Apartment</option>
                                    <option>House</option>
                                    <option>Land</option>
                                    <option>Commercial</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Budget Range (Min - Max)</label>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                    <input
                                        required
                                        type="number"
                                        name="budgetMin"
                                        value={formData.budgetMin}
                                        onChange={handleChange}
                                        placeholder="Min"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                    <input
                                        required
                                        type="number"
                                        name="budgetMax"
                                        value={formData.budgetMax}
                                        onChange={handleChange}
                                        placeholder="Max"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Preferred Location</label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Downtown, New York"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Purpose</label>
                            <div className="relative">
                                <Target className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <select
                                    required
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                                >
                                    <option>Buy</option>
                                    <option>Rent</option>
                                    <option>Invest</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Lead Source</label>
                            <div className="relative">
                                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <select
                                    required
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                                >
                                    <option>Website</option>
                                    <option>Facebook</option>
                                    <option>WhatsApp</option>
                                    <option>Referral</option>
                                    <option>Manual</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. Smart Optional Fields */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
                        <PlusCircle className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-slate-800">Smart Optional Fields</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Move-in Timeline</label>
                            <div className="relative">
                                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <select
                                    name="timeline"
                                    value={formData.timeline}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                                >
                                    <option>ASAP</option>
                                    <option>1–3 months</option>
                                    <option>3–6 months</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Financing Type</label>
                            <div className="relative">
                                <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <select
                                    name="financeType"
                                    value={formData.financeType}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                                >
                                    <option>Cash</option>
                                    <option>Bank Loan</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Property Size Preference</label>
                            <div className="relative">
                                <Maximize className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    name="propertySize"
                                    value={formData.propertySize}
                                    onChange={handleChange}
                                    placeholder="e.g. 1500 sq ft or 3BHK"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Contact Preference</label>
                            <div className="relative">
                                <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <select
                                    name="contactPref"
                                    value={formData.contactPref}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                                >
                                    <option>Call</option>
                                    <option>WhatsApp</option>
                                    <option>Email</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Next Follow-up Date</label>
                            <div className="relative">
                                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="date"
                                    name="nextFollowUpDate"
                                    value={formData.nextFollowUpDate}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Message / Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Additional details about client preferences..."
                                rows={4}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        className="px-6 py-2.5 text-slate-500 font-medium hover:bg-slate-100 rounded-xl transition-all"
                    >
                        Save Draft
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                        Create Lead
                    </button>
                </div>
            </form>
        </div>
    )
}
