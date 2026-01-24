"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Calendar,
    ClipboardList,
    Home,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Building2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const navlinks = [
    {
        label: "Dashboard",
        href: "/dashboard/agents",
        icon: LayoutDashboard
    },
    {
        label: "My Leads",
        href: "/dashboard/agents/leads",
        icon: Users
    },
    {
        label: "Add Lead",
        href: "/dashboard/agents/addleads",
        icon: UserPlus
    },
    {
        label: "Follow-ups",
        href: "/dashboard/agents/follow-ups",
        icon: ClipboardList
    },
    {
        label: "Calendar",
        href: "/dashboard/agents/calendar",
        icon: Calendar
    },
    {
        label: "Properties",
        href: "/dashboard/agents/properties",
        icon: Home
    },
    {
        label: "Analytics",
        href: "/dashboard/agents/analytics",
        icon: TrendingUp
    },
]

export const AgentSidebar = ({
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen
}: {
    isCollapsed: boolean,
    setIsCollapsed: (v: boolean) => void,
    isMobileOpen: boolean,
    setIsMobileOpen: (v: boolean) => void
}) => {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? 80 : 260,
                    x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -260 : 0)
                }}
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg lg:shadow-sm",
                    !isMobileOpen && "-translate-x-full lg:translate-x-0"
                )}
                style={{ width: isCollapsed ? '80px' : '260px' }}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Building2 className="text-white w-5 h-5" />
                                </div>
                                <span className="font-bold text-xl text-slate-800 tracking-tight">Agent Portal</span>
                            </motion.div>
                        )}
                        {isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full flex justify-center"
                            >
                                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Building2 className="text-white w-5 h-5" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 space-y-1.5 mt-4">
                    {navlinks.map((link) => {
                        const isActive = pathname === link.href
                        const Icon = link.icon

                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <div className={cn(
                                    "flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
                                )}>
                                    <Icon className={cn(
                                        "w-5 h-5 min-w-[20px]",
                                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                                    )} />
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="font-medium text-sm"
                                        >
                                            {link.label}
                                        </motion.span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <motion.div
                                            layoutId="active-highlight-agent"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/20 rounded-l-full"
                                        />
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / Toggle */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full hidden lg:flex items-center gap-3 px-3 py-3 text-slate-400 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all duration-200"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="font-medium text-sm">Collapse Sidebar</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-3.5 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>
        </>
    )
}
