"use client"

import React from 'react'
import {
    Search,
    Bell,
    Menu,
    ChevronDown,
    Mail,
    X,
    User,
    Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'

import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

export const Header = ({
    setIsMobileOpen
}: {
    setIsMobileOpen: (v: boolean) => void
}) => {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isProfileOpen, setIsProfileOpen] = React.useState(false)

    // Simple breadcrumb logic
    const pathParts = pathname.split('/').filter(Boolean)
    const currentPage = pathParts[pathParts.length - 1] || 'Dashboard'
    const capitalizedPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1)

    const user = session?.user as any

    const [notifications, setNotifications] = React.useState<any[]>([])
    const [isNotifOpen, setIsNotifOpen] = React.useState(false)

    const onSearchChange = (val: string) => {
        setSearchQuery(val);
        if (val.trim() === "" && pathname.includes('/leads')) {
            const userRole = user?.role || 'user';
            let basePath = '/dashboard/admin/leads';
            if (userRole === 'agent') basePath = '/dashboard/agents/leads';
            router.push(basePath);
        }
    }

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const userRole = user?.role || 'user';
            let basePath = '/dashboard';
            if (userRole === 'admin') basePath = '/dashboard/admin/leads';
            else if (userRole === 'agent') basePath = '/dashboard/agents/leads';

            if (searchQuery.trim()) {
                router.push(`${basePath}?search=${encodeURIComponent(searchQuery.trim())}`);
            } else {
                router.push(basePath);
            }
        }
    }

    React.useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await fetch("/api/notifications")
                const data = await res.json()
                if (data.success) setNotifications(data.notifications)
            } catch (err) {
                console.error("Notif fetch error:", err)
            }
        }
        fetchNotifs()
        // Poll every 60s for new notifs
        const interval = setInterval(fetchNotifs, 60000)
        return () => clearInterval(interval)
    }, [])

    const unreadCount = notifications.filter(n => !n.isRead).length

    const markAsRead = async (id?: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify({ notificationId: id, markAll: !id })
            })
            if (!id) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })))
            } else {
                setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
            }
        } catch (err) {
            console.error(err)
        }
    }

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
                        placeholder="Search IDs, names, emails..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={handleSearch}
                        className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
                    />
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-2 relative">
                    <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all relative">
                        <Mail className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-purple-600 rounded-xl transition-all relative"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-[8px] text-white flex items-center justify-center rounded-full border-2 border-white font-black animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-4 z-50 overflow-hidden"
                                >
                                    <div className="px-5 pb-3 border-b flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800">Notifications</h3>
                                        <button
                                            onClick={() => markAsRead()}
                                            className="text-[10px] uppercase font-black tracking-widest text-purple-600 hover:text-purple-800"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="py-10 text-center">
                                                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                <p className="text-xs text-slate-400">All caught up!</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => markAsRead(n._id)}
                                                    className={cn(
                                                        "px-5 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors relative",
                                                        !n.isRead && "bg-purple-50/30"
                                                    )}
                                                >
                                                    {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600" />}
                                                    <p className="text-xs font-bold text-slate-800 mb-1">{n.title || 'New Update'}</p>
                                                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                                                    <p className="text-[8px] text-slate-400 mt-2 uppercase font-bold">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="px-5 pt-3 text-center border-t">
                                        <p className="text-[10px] text-slate-400 font-medium italic">Viewing last 20 activities</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* User Profile */}
                <div className="relative">
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-6 border-l border-slate-100 cursor-pointer group"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{user?.name || user?.email || 'Loading...'}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{user?.role || 'User'}</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm overflow-hidden transition-transform group-hover:scale-105">
                            <img
                                src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Felix'}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform", isProfileOpen && "rotate-180")} />
                    </div>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-slate-50">
                                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Account</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{user?.name || user?.email}</p>
                                </div>
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            const role = user?.role || 'user';
                                            let profilePath = '/dashboard/user/profile';
                                            if (role === 'admin') profilePath = '/dashboard/admin/profile';
                                            else if (role === 'agent') profilePath = '/dashboard/agents/profile';
                                            router.push(profilePath);
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
                                    >
                                        <User className="w-4 h-4" />
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            const role = user?.role || 'user';
                                            let settingsPath = '/dashboard/user/settings';
                                            if (role === 'admin') settingsPath = '/dashboard/admin/settings';
                                            router.push(settingsPath);
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-purple-600 rounded-xl transition-all"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Security Settings
                                    </button>
                                </div>
                                <div className="p-2 mt-1 border-t border-slate-50">
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
