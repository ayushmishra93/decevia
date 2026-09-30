"use client";
import React from "react";
import { Cpu, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
const SUBSYSTEMS = [
    { name: "Perimeter Ingress Proxy", status: "Optimal", latency: "1.2 ms", load: 24, health: 100 },
    { name: "AI Diversion Classifier", status: "Optimal", latency: "2.8 ms", load: 38, health: 100 },
    { name: "Ghost MicroVM Sandboxes", status: "Deception Active", latency: "3.4 ms", load: 42, health: 99.8 },
    { name: "eBPF Behavioral Telemetry", status: "Optimal", latency: "4.1 ms", load: 19, health: 100 },
];
export function SystemHealthPanel() {
    return (<div className="rounded-xl bg-[#111827] border border-[#1E293B] p-5 shadow-card">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00D9FF]"/>
          <h3 className="text-base font-semibold text-white">Deception Infrastructure Health</h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          100% AIR-GAPPED
        </span>
      </div>

      {/* Diversion Success Meter */}
      <div className="my-4 p-3.5 rounded-xl bg-[#070B14] border border-cyan-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-300">
            Automated Diversion Success Rate
          </span>
          <span className="text-sm font-bold font-mono text-[#00D9FF]">99.84%</span>
        </div>
        <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-400 to-[#8B5CF6] h-2 rounded-full shadow-glow" style={{ width: "99.84%" }}/>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1.5">
          <span>0 False Negatives</span>
          <span>Zero Real Servers Exposed</span>
        </div>
      </div>

      {/* Subsystem rows */}
      <div className="space-y-3">
        {SUBSYSTEMS.map((sys) => (<div key={sys.name} className="flex items-center justify-between p-2.5 rounded-lg bg-[#070B14]/70 border border-[#1E293B] text-xs hover:border-[#00D9FF]/30 transition-colors">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
              <div>
                <span className="font-medium text-white block">{sys.name}</span>
                <span className="text-[10px] font-mono text-gray-400">
                  Latency: {sys.latency} • Load: {sys.load}%
                </span>
              </div>
            </div>

            <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-semibold", sys.status === "Deception Active"
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30")}>
              {sys.status}
            </span>
          </div>))}
      </div>
    </div>);
}
