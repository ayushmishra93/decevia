"use client";
import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
export function StatCard({ title, value, change, isPositive = true, icon: Icon, accentColor = "cyan", tooltip, sparklineData = [], pulse = false, }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const colorStyles = {
        cyan: {
            border: "hover:border-[#00D9FF]/40",
            glow: "group-hover:shadow-glow",
            iconBg: "bg-cyan-500/10 text-[#00D9FF] border border-cyan-500/30",
            accent: "#00D9FF",
        },
        violet: {
            border: "hover:border-[#8B5CF6]/40",
            glow: "group-hover:shadow-glow-violet",
            iconBg: "bg-violet-500/10 text-[#8B5CF6] border border-violet-500/30",
            accent: "#8B5CF6",
        },
        emerald: {
            border: "hover:border-emerald-500/40",
            glow: "group-hover:shadow-glow-green",
            iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
            accent: "#22C55E",
        },
        amber: {
            border: "hover:border-amber-500/40",
            glow: "group-hover:shadow-glow",
            iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
            accent: "#F59E0B",
        },
        rose: {
            border: "hover:border-rose-500/40",
            glow: "group-hover:shadow-glow-red",
            iconBg: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
            accent: "#EF4444",
        },
    }[accentColor];
    // SVG Sparkline calculation
    const minVal = Math.min(...sparklineData);
    const maxVal = Math.max(...sparklineData);
    const range = maxVal - minVal || 1;
    const width = 100;
    const height = 28;
    const points = sparklineData
        .map((d, i) => {
        const x = (i / (sparklineData.length - 1)) * width;
        const y = height - ((d - minVal) / range) * (height - 6) - 3;
        return `${x},${y}`;
    })
        .join(" ");
    return (<div className={cn("relative rounded-xl bg-[#111827] border border-[#1E293B] p-4 sm:p-5 transition-all duration-300 group shadow-card", colorStyles.border, colorStyles.glow)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="relative">
            <button onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} className="text-gray-500 hover:text-gray-300 focus:outline-none" aria-label="Information">
              <Info className="w-3.5 h-3.5"/>
            </button>
            {showTooltip && (<div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 rounded-lg bg-[#070B14] border border-[#1E293B] text-[11px] text-gray-300 z-20 shadow-lg pointer-events-none">
                {tooltip}
              </div>)}
          </div>
        </div>

        <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", colorStyles.iconBg)}>
          <Icon className="w-4 h-4"/>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            {value}
          </span>
          {pulse && (<span className="relative flex h-2.5 w-2.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D9FF]"></span>
            </span>)}
        </div>

        {/* Small trend sparkline */}
        <div className="w-20 h-7 flex-shrink-0">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <polyline fill="none" stroke={colorStyles.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} opacity="0.8"/>
          </svg>
        </div>
      </div>

      {change && (<div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center font-medium font-mono text-[11px] px-1.5 py-0.5 rounded", isPositive
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-rose-400 bg-rose-500/10 border border-rose-500/20")}>
            {isPositive ? (<ArrowUpRight className="w-3 h-3 mr-0.5"/>) : (<ArrowDownRight className="w-3 h-3 mr-0.5"/>)}
            {change}
          </span>
          <span className="text-[11px] text-gray-500">vs previous 24h</span>
        </div>)}
    </div>);
}
