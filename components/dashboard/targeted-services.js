"use client";
import React from "react";
import { Server, ShieldCheck } from "lucide-react";
import { TARGETED_SERVICES } from "@/lib/mock-data";
export function MostTargetedServices() {
    const maxCount = Math.max(...TARGETED_SERVICES.map((s) => s.count));
    return (<div className="rounded-xl bg-[#111827] border border-[#1E293B] p-5 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#8B5CF6]"/>
            <h3 className="text-base font-semibold text-white">Most Targeted Services & Ports</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">All Decoy Shielded</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Attack volume intercepted per exposed service interface
        </p>
      </div>

      <div className="my-3 space-y-3">
        {TARGETED_SERVICES.map((svc) => {
            const percent = Math.round((svc.count / maxCount) * 100);
            return (<div key={svc.service} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-medium truncate max-w-[220px]">
                  {svc.service}
                </span>
                <span className="font-mono text-white font-semibold">{svc.count} attacks</span>
              </div>
              <div className="w-full bg-[#070B14] rounded-full h-2 overflow-hidden border border-[#1E293B]">
                <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${percent}%`,
                    backgroundColor: svc.color,
                }}/>
              </div>
            </div>);
        })}
      </div>

      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5"/>
          100% Real Ports Cloaked
        </span>
        <span className="font-mono text-[11px]">Synthetic Responses Served</span>
      </div>
    </div>);
}
