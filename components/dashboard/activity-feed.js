"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Play, Pause, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
const INITIAL_EVENTS = [
    {
        id: "EV-109",
        time: "Just now",
        sourceIp: "185.220.101.42",
        country: "Netherlands (Tor)",
        action: "Attacker attempted sudo /usr/bin/python3 breakout in Ubuntu Decoy",
        targetDecoy: "Ubuntu Web Server",
        severity: "critical",
    },
    {
        id: "EV-108",
        time: "14s ago",
        sourceIp: "45.154.255.89",
        country: "Russia",
        action: "Decoy LSASS memory honey-hash requested by Cobalt Strike beacon",
        targetDecoy: "Windows AD Decoy",
        severity: "critical",
    },
    {
        id: "EV-107",
        time: "32s ago",
        sourceIp: "194.26.29.112",
        country: "Iran",
        action: "Kubelet API query intercepted: /pods returned synthetic canary pods",
        targetDecoy: "Kubernetes Honeynet",
        severity: "warning",
    },
    {
        id: "EV-106",
        time: "1m ago",
        sourceIp: "103.145.73.12",
        country: "China",
        action: "Automated scan for /.env diverted with seeded dummy AWS credentials",
        targetDecoy: "Ubuntu Web Server",
        severity: "warning",
    },
    {
        id: "EV-105",
        time: "2m ago",
        sourceIp: "89.248.165.71",
        country: "Seychelles",
        action: "SQL injection payload trapped: returned synthetic tracking records",
        targetDecoy: "Postgres Vault Decoy",
        severity: "info",
    },
];
export function LiveActivityFeed() {
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [isStreaming, setIsStreaming] = useState(true);
    // Periodic simulated live packet ticker
    useEffect(() => {
        if (!isStreaming)
            return;
        const interval = setInterval(() => {
            const simulatedActions = [
                {
                    sourceIp: "185.220.101.42",
                    country: "Netherlands (Tor)",
                    action: "Attacker executed 'cat /etc/shadow' in sandboxed Ubuntu Decoy",
                    targetDecoy: "Ubuntu Web Server",
                    severity: "critical",
                },
                {
                    sourceIp: "45.154.255.89",
                    country: "Russia",
                    action: "Active Directory Kerberoasting probe answered with honey-hashes",
                    targetDecoy: "Windows AD Decoy",
                    severity: "critical",
                },
                {
                    sourceIp: "193.106.191.24",
                    country: "Brazil",
                    action: "WordPress brute force attempt diverted into decoy login page",
                    targetDecoy: "Ubuntu Web Server",
                    severity: "warning",
                },
                {
                    sourceIp: "194.26.29.112",
                    country: "Iran",
                    action: "Adversary attempted docker socket mount escape; denied in gVisor sandbox",
                    targetDecoy: "Kubernetes Honeynet",
                    severity: "critical",
                },
            ];
            const randomAction = simulatedActions[Math.floor(Math.random() * simulatedActions.length)];
            const newEvent = {
                id: `EV-${Date.now().toString().slice(-4)}`,
                time: "Just now",
                sourceIp: randomAction.sourceIp,
                country: randomAction.country,
                action: randomAction.action,
                targetDecoy: randomAction.targetDecoy,
                severity: randomAction.severity,
            };
            setEvents((prev) => [newEvent, ...prev.slice(0, 6)]);
        }, 6000);
        return () => clearInterval(interval);
    }, [isStreaming]);
    return (<div className="rounded-xl bg-[#111827] border border-[#1E293B] p-5 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#00D9FF] animate-pulse"/>
          <h3 className="text-base font-semibold text-white">Live Attacker Activity Feed</h3>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsStreaming(!isStreaming)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070B14] border border-[#1E293B] text-xs font-mono text-gray-300 hover:text-white transition-colors" title={isStreaming ? "Pause real-time stream" : "Resume real-time stream"}>
            {isStreaming ? (<>
                <Pause className="w-3 h-3 text-amber-400"/>
                <span>Pause</span>
              </>) : (<>
                <Play className="w-3 h-3 text-emerald-400"/>
                <span>Resume</span>
              </>)}
          </button>
        </div>
      </div>

      <div className="my-3 space-y-2.5 overflow-hidden">
        {events.map((evt, idx) => (<div key={evt.id} className={cn("p-3 rounded-lg bg-[#070B14] border transition-all duration-300", idx === 0 ? "border-[#00D9FF]/40 shadow-glow" : "border-[#1E293B]/60", evt.severity === "critical"
                ? "hover:border-red-500/40"
                : evt.severity === "warning"
                    ? "hover:border-amber-500/40"
                    : "hover:border-cyan-500/40")}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", evt.severity === "critical"
                ? "bg-red-400 shadow-glow-red"
                : evt.severity === "warning"
                    ? "bg-amber-400"
                    : "bg-cyan-400")}/>
                <span className="font-mono text-gray-300 font-semibold">{evt.sourceIp}</span>
                <span className="text-gray-500">({evt.country})</span>
              </div>
              <span className="font-mono text-gray-500">{evt.time}</span>
            </div>

            <p className="text-xs text-gray-200 leading-snug">{evt.action}</p>

            <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#8B5CF6] px-1.5 py-0.5 rounded bg-violet-950/40 border border-violet-500/20">
                Target: {evt.targetDecoy}
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                Decoy Contained
              </span>
            </div>
          </div>))}
      </div>

      <div className="pt-2 border-t border-[#1E293B] flex justify-between items-center text-xs">
        <span className="text-gray-500 font-mono text-[11px]">
          eBPF Kernel Sniffer Active (12,400 cmds/day)
        </span>
        <Link href="/dashboard/sessions" className="text-[#00D9FF] hover:underline flex items-center gap-1 font-medium">
          View Attack Sessions <ArrowRight className="w-3.5 h-3.5"/>
        </Link>
      </div>
    </div>);
}
