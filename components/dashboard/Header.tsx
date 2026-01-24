"use client"

import React from 'react'
import {
    Search,
    Bell,
    Menu,
    ChevronDown,
    Mail,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

import { useSession } from 'next-auth/react'

export const Header = ({
    setIsMobileOpen
}: {
    setIsMobileOpen: (v: boolean) => void
}) => {
    const pathname = usePathname()
    const { data: session } = useSession()

    // Simple breadcrumb logic
    const pathParts = pathname.split('/').filter(Boolean)
    const currentPage = pathParts[pathParts.length - 1] || 'Dashboard'
    const capitalizedPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1)

    const user = session?.user as any

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                    <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-none">
                        {capitalizedPage}
                    </h1>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 font-medium">
                        <span>/</span>
                        <span>Dashboard</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="hidden lg:flex items-center relative group">
                    <Search className="w-4 h-4 absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search properties, leads..."
                        className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
                    />
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-2">
                    <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all relative">
                        <Mail className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                    </button>
                    <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-slate-100 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">{user?.email || 'Loading...'}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{user?.role || 'User'}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm overflow-hidden transition-transform group-hover:scale-105">
                        <img
                            src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Felix'}`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
            </div>
        </header>
    )
}
