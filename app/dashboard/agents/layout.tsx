"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/dashboard/Header'
import { AgentSidebar } from '@/components/dashboard/AgentSidebar'

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Sidebar */}
            <AgentSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen",
                    isCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
                )}
            >
                {/* Header */}
                <Header setIsMobileOpen={setIsMobileOpen} />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-9xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
