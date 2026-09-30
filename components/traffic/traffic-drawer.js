"use client";
import React from "react";
import { X, Radio, Server, AlertTriangle, Lock, Download, } from "lucide-react";
import { cn } from "@/lib/utils";
export function TrafficDrawer({ record, onClose }) {
    if (!record)
        return null;
    return (<div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}/>

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#0B1220] border-l border-[#1E293B] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-[#1E293B] bg-[#070B14]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl border", record.decision === "Redirected"
            ? "bg-violet-500/10 border-violet-500/30 text-[#8B5CF6]"
            : record.decision === "Allowed"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400")}>
                <Radio className="w-5 h-5"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-mono text-white">{record.sourceIp}</h2>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase", record.decision === "Redirected"
            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
            : record.decision === "Allowed"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30")}>
                    {record.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  Record ID: {record.id} • {record.country}
                </p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#111827] transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Risk Gauge Bar */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Threat Risk Score
                </span>
                <span className={cn("font-mono font-bold text-base", record.riskScore > 75
            ? "text-red-400"
            : record.riskScore > 40
                ? "text-amber-400"
                : "text-emerald-400")}>
                  {record.riskScore} / 100
                </span>
              </div>
              <div className="w-full bg-[#070B14] rounded-full h-2.5 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", record.riskScore > 75
            ? "bg-gradient-to-r from-amber-500 to-red-500 shadow-glow-red"
            : record.riskScore > 40
                ? "bg-amber-400"
                : "bg-emerald-400 shadow-glow-green")} style={{ width: `${record.riskScore}%` }}/>
              </div>
              <span className="text-[11px] text-gray-500 mt-1.5 block">
                {record.riskScore > 75
            ? "High probability of intentional penetration testing or exploit activity."
            : "Within normal benign behavioral deviations."}
              </span>
            </div>

            {/* Decision Explanation Box */}
            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase tracking-wider mb-1.5">
                <Server className="w-4 h-4 text-[#8B5CF6]"/>
                <span>Automated Routing Verdict</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">
                {record.decisionReason}
              </p>
              {record.ghostEnvironment && (<div className="mt-3 pt-2.5 border-t border-violet-500/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">Assigned Honeynet:</span>
                  <span className="text-cyan-300 font-semibold">{record.ghostEnvironment}</span>
                </div>)}
            </div>

            {/* IP & Network Details */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                IP Telemetry & ASN Intelligence
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-gray-500 block mb-0.5">Autonomous System (ASN)</span>
                  <span className="font-mono text-white font-medium">{record.asn}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-gray-500 block mb-0.5">Internet Service Provider</span>
                  <span className="text-white font-medium">{record.isp}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-gray-500 block mb-0.5">Protocol / Transport</span>
                  <span className="font-mono text-cyan-400 font-semibold">{record.protocol}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <span className="text-gray-500 block mb-0.5">Timestamp (UTC)</span>
                  <span className="font-mono text-gray-300">{record.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Request Payload & Headers */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Captured Ingress Request
              </h4>
              <div className="p-3 rounded-xl bg-[#070B14] border border-[#1E293B] font-mono text-xs space-y-1.5 overflow-x-auto">
                <div className="text-cyan-400 font-bold">{record.request}</div>
                <div className="text-gray-500 text-[11px]">User-Agent: {record.userAgent}</div>
                {record.payloadAnomaly && (<div className="text-red-400 text-[11px] pt-1.5 border-t border-[#1E293B]">
                    Detected Anomaly: {record.payloadAnomaly}
                  </div>)}
              </div>
            </div>

            {/* Threat Signals List */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Identified Threat Signals
              </h4>
              <div className="space-y-1.5">
                {record.threatSignals.map((signal, idx) => (<div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#111827] border border-[#1E293B] text-xs text-gray-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0"/>
                    <span>{signal}</span>
                  </div>))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-[#1E293B] bg-[#070B14] flex items-center justify-between gap-3">
            <button onClick={() => alert(`Simulated PCAP capture downloaded for ${record.sourceIp}`)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs font-medium text-gray-300 hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5"/>
              <span>Export PCAP</span>
            </button>

            <button onClick={() => {
            alert(`IP ${record.sourceIp} permanently blacklisted at edge firewall.`);
            onClose();
        }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-xs font-semibold text-red-300 transition-colors shadow-glow-red">
              <Lock className="w-3.5 h-3.5"/>
              <span>Force Block IP</span>
            </button>
          </div>
        </div>
      </div>
    </div>);
}
