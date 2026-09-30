"use client";
import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle, Zap, } from "lucide-react";
import { cn } from "@/lib/utils";
export function AlertDrawer({ alert, onClose, onStatusChange, onAnalystAssign }) {
    const [selectedAction, setSelectedAction] = useState(null);
    const [actionDone, setActionDone] = useState(false);
    if (!alert)
        return null;
    const handleRunPlaybook = (action) => {
        setSelectedAction(action);
        setActionDone(true);
        setTimeout(() => setActionDone(false), 3000);
    };
    return (<div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#0B1220] border-l border-[#1E293B] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-[#1E293B] bg-[#070B14] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl border", alert.severity === "Critical"
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : alert.severity === "High"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400")}>
                <AlertTriangle className="w-5 h-5"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-white">{alert.id}</span>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase", alert.severity === "Critical"
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : alert.severity === "High"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30")}>
                    {alert.severity}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mt-1 leading-snug">
                  {alert.title}
                </h3>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#111827]">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Meta tags */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                <span className="text-gray-500 block">Threat Origin:</span>
                <span className="text-white font-semibold">{alert.sourceIp} ({alert.country})</span>
              </div>
              <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                <span className="text-gray-500 block">Affected Sandbox:</span>
                <span className="text-violet-400 font-semibold">{alert.affectedEnvironment}</span>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                Detection Explanation
              </span>
              <p className="text-xs text-gray-200 leading-relaxed">
                {alert.explanation}
              </p>
            </div>

            {/* Assigned Analyst */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                  {alert.assignedAnalyst.avatar}
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Assigned Lead Analyst:</span>
                  <span className="text-sm font-semibold text-white">{alert.assignedAnalyst.name}</span>
                </div>
              </div>

              <select value={alert.assignedAnalyst.name} onChange={(e) => onAnalystAssign(alert.id, e.target.value)} className="px-2.5 py-1.5 rounded-lg bg-[#070B14] border border-[#1E293B] text-xs text-gray-300 focus:outline-none">
                <option value="Cmdr. Sarah Vance">Cmdr. Sarah Vance</option>
                <option value="Marcus Chen">Marcus Chen</option>
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="David Kim">David Kim</option>
              </select>
            </div>

            {/* Complete Event Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Forensic Event Timeline
              </h4>
              <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E293B]">
                {alert.timeline.map((item, idx) => (<div key={idx} className="flex items-start gap-3 pl-6 relative">
                    <span className={cn("absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-1/2 border-2 border-[#0B1220]", item.severity === "critical"
                ? "bg-red-400 shadow-glow-red"
                : item.severity === "warning"
                    ? "bg-amber-400"
                    : "bg-cyan-400")}/>
                    <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1E293B] w-full text-xs">
                      <div className="flex justify-between font-mono text-[11px] text-gray-500 mb-0.5">
                        <span>Step #{idx + 1}</span>
                        <span>{item.time}</span>
                      </div>
                      <p className="text-gray-200">{item.event}</p>
                    </div>
                  </div>))}
              </div>
            </div>

            {/* Recommended Defensive Actions Playbooks */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Prescribed Defensive Playbooks
              </h4>
              <div className="space-y-2">
                {alert.playbookActions.map((action, idx) => (<div key={idx} className="p-3 rounded-xl bg-[#070B14] border border-[#1E293B] flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-300">{action}</span>
                    <button onClick={() => handleRunPlaybook(action)} className="px-3 py-1 rounded-lg bg-[#1E293B] hover:bg-[#00D9FF] hover:text-slate-950 text-white font-mono text-[11px] font-semibold transition-colors flex items-center gap-1 flex-shrink-0">
                      <Zap className="w-3 h-3"/>
                      <span>Execute</span>
                    </button>
                  </div>))}
              </div>

              {actionDone && (<div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4"/>
                  <span>Playbook executed: &quot;{selectedAction}&quot;</span>
                </div>)}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-[#1E293B] bg-[#070B14] flex items-center justify-between gap-3">
            <button onClick={() => onStatusChange(alert.id, "Investigating")} className={cn("px-4 py-2 rounded-xl text-xs font-semibold border transition-colors", alert.status === "Investigating"
            ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
            : "bg-[#111827] text-gray-300 border-[#1E293B] hover:text-white")}>
              Mark Investigating
            </button>

            <button onClick={() => {
            onStatusChange(alert.id, "Resolved");
            onClose();
        }} className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-glow-green">
              Resolve Alert
            </button>
          </div>
        </div>
      </div>
    </div>);
}
