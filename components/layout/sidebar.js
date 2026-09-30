"use client";
import Brand from "@/components/ui/brand";
import UserMenu from "@/components/auth/user-menu";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Radio, Terminal, Server, Fingerprint, Bell, Network, FileText, Settings, ChevronLeft, ChevronRight, Menu, X, } from "lucide-react";
import { cn } from "@/lib/utils";
const navItems = [
    { title: "Command Center", href: "/dashboard", icon: Activity },
    { title: "Live Traffic", href: "/live-traffic", icon: Radio, badge: "LIVE", badgeColor: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" },
    { title: "Attack Sessions", href: "/attack-sessions", icon: Terminal, badgeColor: "bg-violet-500/20 text-violet-400 border border-violet-500/30" },
    { title: "Ghost Environments", href: "/ghost-environments", icon: Server },
    { title: "Threat Intelligence", href: "/threat-intelligence", icon: Fingerprint },
    { title: "Alerts", href: "/alerts", icon: Bell, badgeColor: "bg-red-500/20 text-red-400 border border-red-500/30" },
    { title: "System Architecture", href: "/system-architecture", icon: Network },
    { title: "Reports", href: "/reports", icon: FileText },
    { title: "Profile", href: "/profile", icon: Settings },
    { title: "Settings", href: "/settings", icon: Settings },
];
export function Sidebar({collapsed, setCollapsed, health}) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    return (<>
      {/* Mobile Hamburger Button */}
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-3 left-4 z-50 p-2 rounded-lg bg-sidebar border border-card-border text-gray-200 hover:text-primary transition-colors" aria-label="Open sidebar">
        <Menu className="w-5 h-5"/>
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (<div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)}/>)}

      {/* Main Sidebar Container */}
      <aside className={cn("fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0B1220] border-r border-[#1E293B] transition-all duration-300 select-none", collapsed ? "w-20" : "w-64", mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#1E293B]">
          <div className="min-w-0">
            <Brand href="/dashboard" compact={collapsed} />
            {!collapsed && <span className="ml-11 block text-[9px] uppercase font-mono tracking-widest text-[#D9B875]">Deception SOC</span>}
          </div>

          {/* Mobile close button */}
          <button onClick={() => setMobileOpen(false)} aria-label="Close sidebar" className="md:hidden p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5"/>
          </button>

          {/* Desktop Collapse Toggle */}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-[#111827] border border-transparent hover:border-[#1E293B] transition-all" title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (<Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn("relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group", isActive
                    ? "bg-[#111827] text-white border border-[#00D9FF]/40 shadow-glow"
                    : "text-gray-400 hover:text-white hover:bg-[#111827]/70 border border-transparent hover:border-[#1E293B]")} title={collapsed ? item.title : undefined}>
                {/* Active left indicator pill */}
                {isActive && (<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#00D9FF]"/>)}

                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-[#00D9FF]" : "text-gray-400 group-hover:text-cyan-400")}/>

                {!collapsed && (<span className="truncate flex-1">{item.title}</span>)}

                {!collapsed && item.badge && (<span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ml-auto flex-shrink-0", item.badgeColor || "bg-cyan-500/20 text-cyan-400")}>
                    {item.badge}
                  </span>)}
              </Link>);
        })}
        </div>

        {/* Backend protection status */}
        {!collapsed && (<div className="p-3 mx-3 mb-3 rounded-xl bg-[#111827]/90 border border-emerald-500/30 shadow-glow-green">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {health?.activeAssets ? "Assets Configured" : "Awaiting Assets"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1 leading-tight">
              {health ? `${health.activeAssets} active assets. Sensor analysis and safe simulation.` : "Checking backend health…"}
            </p>
          </div>)}

        {/* Collapsed small status dot */}
        {collapsed && (<div className="flex justify-center mb-3" title={health?.activeAssets ? "Assets configured" : "Awaiting assets"}>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>)}

        <div className="p-4 border-t border-slate-800"><UserMenu align="up" /></div>
      </aside>
    </>);
}
