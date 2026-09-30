"use client";
import React from "react";
import { Server, Terminal, Lock, ShieldCheck, Radio, Fingerprint, } from "lucide-react";
export function EnvironmentsTopologyView() {
    return (<div className="rounded-xl bg-[#111827] border border-[#1E293B] p-6 shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400"/>
            <h3 className="text-base font-semibold text-white">
              Zero-Trust Deception Topology & Air-Gap Verification
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Architectural proof of total boundary isolation between Ghost Sandboxes and Production Core
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            AIR GAP ENFORCED
          </span>
        </div>
      </div>

      {/* Interactive visual network layout */}
      <div className="relative p-6 rounded-xl bg-[#070B14] border border-[#1E293B]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-center">
          {/* Column 1: Public Ingress & Decision Engine */}
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-gray-400 text-center font-bold">
              Public Edge Layer
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-cyan-500/40 text-center space-y-2 shadow-glow">
              <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D9FF]">
                <Radio className="w-5 h-5 animate-pulse"/>
              </div>
              <div className="font-bold text-white text-sm">Decevia Ingress Proxy</div>
              <div className="text-[11px] text-gray-400">Layer 4-7 Real-time Classifier</div>
              <div className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 py-1 rounded border border-cyan-500/20">
                1.2M req/day scanned
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] text-center space-y-1.5">
              <div className="text-xs font-semibold text-white">AI Diversion Engine</div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Heuristic & JA4 scoring splits traffic into two isolated paths.
              </p>
            </div>
          </div>

          {/* Column 2: The Two Divergent Paths */}
          <div className="space-y-6 flex flex-col justify-center">
            {/* Green Legitimate Path */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 shadow-glow-green space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4"/> Legitimate Users Path
                </span>
                <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">
                  PASSTHROUGH
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                Direct TLS passthrough straight to authenticated production servers. Zero latency overhead.
              </p>
            </div>

            {/* Red Air-Gap Wall Barrier */}
            <div className="py-2 px-3 rounded-lg bg-red-950/40 border border-red-500/50 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5"/>
                Hardware Air-Gap & One-Way Data Diode
                <Lock className="w-3.5 h-3.5"/>
              </div>
              <div className="text-[10px] text-red-300 mt-0.5">
                NO egress packets can ever travel from Ghost Decoys into Real Systems.
              </div>
            </div>

            {/* Violet/Red Deception Path */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 to-red-950/40 border border-violet-500/40 shadow-glow-violet space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-violet-300">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#8B5CF6]"/> Adversarial Diversion Path
                </span>
                <span className="font-mono text-[10px] bg-violet-500/20 px-2 py-0.5 rounded text-violet-300">
                  DECEPTION
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                Transparent server-side swap into hyper-realistic synthetic decoys. Attacker believes they breached prod.
              </p>
            </div>
          </div>

          {/* Column 3: The Target Destinations */}
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-gray-400 text-center font-bold">
              Isolated Destinations
            </div>

            {/* Production Core */}
            <div className="p-4 rounded-xl bg-[#111827] border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Server className="w-4 h-4"/>
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Real Production Core</div>
                  <div className="text-[10px] text-emerald-400 font-mono">42 Core Systems • 100% Uptime</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Production database clusters, customer vaults, and private microservices completely shielded from scanner noise.
              </p>
            </div>

            {/* Ghost Honeynet Sandboxes */}
            <div className="p-4 rounded-xl bg-[#111827] border border-violet-500/40 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-violet-500/10 text-[#8B5CF6] border border-violet-500/30">
                  <Terminal className="w-4 h-4"/>
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Ghost Sandbox Decoys</div>
                  <div className="text-[10px] text-violet-400 font-mono">18 Active Adversaries Trapped</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Cloned Ubuntu, Windows, and DB instances seeded with trackable canary credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Loop Bar at Bottom */}
        <div className="mt-6 pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <Fingerprint className="w-4 h-4 text-[#00D9FF]"/>
            <span>
              <strong>Continuous Telemetry Loop:</strong> Every honeypot action streams to Behavioural Intelligence Recorder.
            </span>
          </div>
          <span className="font-mono text-cyan-400 text-[11px]">
            Unidirectional eBPF Bus (No Egress Feedback)
          </span>
        </div>
      </div>
    </div>);
}
