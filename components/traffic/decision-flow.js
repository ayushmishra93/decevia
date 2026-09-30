"use client";
import React from "react";
import { Shield, Cpu, Shuffle, CheckCircle, Terminal } from "lucide-react";
export function AnimatedDecisionFlow() {
    return (<div className="rounded-xl bg-[#111827] border border-[#1E293B] p-5 shadow-card overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
            Autonomous Deception Routing Pipeline
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time packet classification & transparent diversion mechanism
          </p>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyan-950/50 text-[#00D9FF] border border-cyan-500/30">
          Latency: &lt; 1.8ms
        </span>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Step 1: Ingress */}
        <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E293B] flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-[#00D9FF] border border-cyan-500/20">
              <Shield className="w-4 h-4"/>
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">1. Incoming Request</span>
              <span className="text-[10px] font-mono text-gray-400">Layer 4-7 Edge Ingress</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            TLS JA4 Fingerprinting & client entropy verification.
          </p>
        </div>

        {/* Step 2: Behaviour Analysis */}
        <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E293B] flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-[#00D9FF] border border-cyan-500/20">
              <Cpu className="w-4 h-4"/>
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">2. Behaviour Analysis</span>
              <span className="text-[10px] font-mono text-cyan-400">Neural Heuristics</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Detects path traversal, brute force velocity & exploit payloads.
          </p>
        </div>

        {/* Step 3: Risk Evaluation */}
        <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E293B] flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-[#8B5CF6] border border-purple-500/20">
              <Shuffle className="w-4 h-4"/>
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">3. Risk Evaluation</span>
              <span className="text-[10px] font-mono text-purple-400">0 - 100 Threat Score</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Instantaneous diversion decision without notifying client.
          </p>
        </div>

        {/* Step 4: Split Destination Paths */}
        <div className="p-3 rounded-xl bg-[#070B14] border border-[#1E293B] flex flex-col justify-center space-y-2">
          {/* Legitimate Path (Green) */}
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between shadow-glow-green">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400"/>
              <span className="text-[11px] font-semibold text-emerald-300">
                Real Infrastructure
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
              Score &lt; 30
            </span>
          </div>

          {/* Adversarial Ghost Path (Violet / Red Glow) */}
          <div className="p-2 rounded-lg bg-gradient-to-r from-violet-950/60 to-red-950/60 border border-violet-500/40 flex items-center justify-between shadow-glow-violet">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#8B5CF6]"/>
              <span className="text-[11px] font-semibold text-violet-200">
                Ghost Sandbox Decoy
              </span>
            </div>
            <span className="text-[10px] font-mono text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded">
              Score ≥ 70
            </span>
          </div>
        </div>
      </div>
    </div>);
}
