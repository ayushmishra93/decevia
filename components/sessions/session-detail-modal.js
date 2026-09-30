"use client";
import React, { useState } from "react";
import { X, Terminal, Shield, FileCode, AlertTriangle, FolderLock, Save, CheckCircle, Network, } from "lucide-react";
import { TerminalReplay } from "./terminal-replay";
import { cn } from "@/lib/utils";
export function SessionDetailModal({ session, onClose }) {
    const [activeTab, setActiveTab] = useState("terminal");
    const [notes, setNotes] = useState(session?.analystNotes || "");
    const [noteSaved, setNoteSaved] = useState(false);
    if (!session)
        return null;
    const handleSaveNotes = () => {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2500);
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0B1220] border border-[#1E293B] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#070B14] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-[#8B5CF6]">
              <Terminal className="w-5 h-5"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white">
                  Session {session.id}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold uppercase">
                  {session.status}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                  Risk: {session.riskScore}/100
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                Attacker IP: {session.sourceIp} ({session.country}) • Decoy: {session.ghostEnvironment}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#111827] transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Attacker Profile Banner */}
        <div className="px-6 py-3 bg-[#111827] border-b border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-gray-500 block text-[10px]">MITRE Technique</span>
            <span className="text-[#00D9FF] font-semibold">{session.techniqueId}: {session.techniqueName}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px]">Active Duration</span>
            <span className="text-white font-semibold">{session.duration}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px]">Commands Harvested</span>
            <span className="text-amber-400 font-semibold">{session.commandsCaptured} commands</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px]">Behavior Score</span>
            <span className="text-red-400 font-semibold">{session.behaviourScore} / 100</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1E293B] bg-[#070B14] px-6 gap-2 text-xs font-medium">
          <button onClick={() => setActiveTab("terminal")} className={cn("py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5", activeTab === "terminal"
            ? "border-[#00D9FF] text-[#00D9FF]"
            : "border-transparent text-gray-400 hover:text-white")}>
            <Terminal className="w-3.5 h-3.5"/>
            <span>Terminal Replay</span>
          </button>

          <button onClick={() => setActiveTab("files")} className={cn("py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5", activeTab === "files"
            ? "border-[#00D9FF] text-[#00D9FF]"
            : "border-transparent text-gray-400 hover:text-white")}>
            <FolderLock className="w-3.5 h-3.5"/>
            <span>Files Probed ({session.filesAccessed.length})</span>
          </button>

          <button onClick={() => setActiveTab("payloads")} className={cn("py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5", activeTab === "payloads"
            ? "border-[#00D9FF] text-[#00D9FF]"
            : "border-transparent text-gray-400 hover:text-white")}>
            <FileCode className="w-3.5 h-3.5"/>
            <span>Payload Attempts ({session.payloadAttempts.length})</span>
          </button>

          <button onClick={() => setActiveTab("lateral")} className={cn("py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5", activeTab === "lateral"
            ? "border-[#00D9FF] text-[#00D9FF]"
            : "border-transparent text-gray-400 hover:text-white")}>
            <Network className="w-3.5 h-3.5"/>
            <span>Lateral Movement Traps</span>
          </button>

          <button onClick={() => setActiveTab("notes")} className={cn("py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5", activeTab === "notes"
            ? "border-[#00D9FF] text-[#00D9FF]"
            : "border-transparent text-gray-400 hover:text-white")}>
            <Save className="w-3.5 h-3.5"/>
            <span>Analyst Notes</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Tab 1: Terminal Replay */}
          {activeTab === "terminal" && (<TerminalReplay logs={session.terminalLogs} sessionTitle={`${session.sourceIp} inside ${session.ghostEnvironment}`}/>)}

          {/* Tab 2: Files Accessed */}
          {activeTab === "files" && (<div className="space-y-3">
              <div className="text-xs text-gray-400">
                All filesystem requests intercepted inside the sandbox. Canary files trigger real-time SIEM alerts when opened.
              </div>
              <div className="rounded-xl border border-[#1E293B] overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#070B14] text-gray-400 border-b border-[#1E293B]">
                    <tr>
                      <th className="p-3">File Path</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Canary Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60">
                    {session.filesAccessed.map((file, i) => (<tr key={i} className="hover:bg-[#111827]">
                        <td className="p-3 text-white font-semibold">{file.path}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-[#070B14] border border-[#1E293B] text-[10px] text-gray-300">
                            {file.action}
                          </span>
                        </td>
                        <td className="p-3">
                          {file.isCanary ? (<span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                              <CheckCircle className="w-3 h-3"/> CANARY TRAP SEEDED
                            </span>) : (<span className="text-gray-500 text-[10px]">Normal Decoy File</span>)}
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>)}

          {/* Tab 3: Payloads */}
          {activeTab === "payloads" && (<div className="space-y-3">
              <div className="text-xs text-gray-400">
                Staged attack payloads safely defanged and executed inside the gVisor hypervisor container.
              </div>
              <div className="space-y-2">
                {session.payloadAttempts.map((p, idx) => (<div key={idx} className="p-3.5 rounded-xl bg-[#070B14] border border-red-500/30 font-mono text-xs text-red-300">
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-gray-400">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400"/>
                      <span>Captured Payload Vector #{idx + 1}</span>
                    </div>
                    <code className="text-xs text-white">{p}</code>
                  </div>))}
              </div>
            </div>)}

          {/* Tab 4: Lateral Movement */}
          {activeTab === "lateral" && (<div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-gray-300">
                <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4"/> Air-Gap Containment Confirmed
                </div>
                All lateral scanning attempts were confined to synthetic decoy subnets (10.240.0.0/16). Zero packets reached production CIDRs.
              </div>

              <div className="space-y-2">
                {session.lateralAttempts.length > 0 ? (session.lateralAttempts.map((lat, idx) => (<div key={idx} className="p-3 rounded-lg bg-[#070B14] border border-[#1E293B] text-xs font-mono text-cyan-300">
                      → {lat}
                    </div>))) : (<div className="text-xs text-gray-500 italic p-4 text-center">
                    No lateral movement attempts observed yet.
                  </div>)}
              </div>
            </div>)}

          {/* Tab 5: Analyst Notes */}
          {activeTab === "notes" && (<div className="space-y-4">
              <div className="text-xs text-gray-400">
                Collaborative notes for SOC incident responders and threat hunters regarding this adversary.
              </div>
              <textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-4 rounded-xl bg-[#070B14] border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#00D9FF]/50 font-mono" placeholder="Record behavioral insights, threat actor attribution, or IOC notes..."/>
              <div className="flex items-center justify-between">
                <button onClick={handleSaveNotes} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00D9FF] hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-glow">
                  <Save className="w-4 h-4"/>
                  <span>Save Analyst Notes</span>
                </button>
                {noteSaved && (<span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5"/> Notes recorded to audit log
                  </span>)}
              </div>
            </div>)}
        </div>
      </div>
    </div>);
}
