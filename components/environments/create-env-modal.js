"use client";
import React, { useState } from "react";
import { X, Server, Shield } from "lucide-react";
export function CreateEnvModal({ isOpen, onClose, onCreated }) {
    const [name, setName] = useState("");
    const [os, setOs] = useState("Ubuntu 24.04 LTS");
    const [type, setType] = useState("Web Server");
    const [simulationLevel, setSimulationLevel] = useState("High Fidelity");
    const [loggingLevel, setLoggingLevel] = useState("Verbose + eBPF");
    const [networkProfile, setNetworkProfile] = useState("Isolated DMZ Honeynet");
    const [vCpu, setVCpu] = useState("2 vCPU");
    const [memory, setMemory] = useState("4 GB RAM");
    const [canaryTokens, setCanaryTokens] = useState(15);
    if (!isOpen)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim())
            return;
        const newEnv = {
            id: `ENV-${Math.floor(10 + Math.random() * 90)}`,
            name: name.trim(),
            os,
            type,
            status: "Running",
            activeSessions: 0,
            isolationHealth: 100,
            cpuUsage: 4.2,
            memoryUsage: 18.0,
            lastActivity: "Just provisioned",
            ipAddress: `10.240.${Math.floor(20 + Math.random() * 70)}.${Math.floor(2 + Math.random() * 250)}`,
            canaryTokensPlanted: canaryTokens,
            canariesTripped: 0,
            simulationLevel,
            loggingLevel,
            uptime: "0m",
        };
        onCreated(newEnv);
        onClose();
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0B1220] border border-[#1E293B] shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#070B14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[#00D9FF]">
              <Server className="w-5 h-5"/>
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-white">
                Provision Ghost Deception Environment
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Deploy an isolated synthetic decoy sandbox with canary seeds
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#111827] transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Environment Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Environment Decoy Name
            </label>
            <input type="text" required placeholder="e.g., Staging API Node - Kubernetes Pod Decoy" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B14] border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#00D9FF]/50"/>
          </div>

          {/* Grid of Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Operating System */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Target Operating System
              </label>
              <select value={os} onChange={(e) => setOs(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B14] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#00D9FF]/50">
                <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS</option>
                <option value="Windows Server 2022">Windows Server 2022</option>
                <option value="PostgreSQL 16 Cluster">PostgreSQL 16 Cluster</option>
                <option value="Developer Mac/Linux">Developer Mac/Linux</option>
                <option value="AWS S3 Gateway">AWS S3 Gateway</option>
                <option value="Kubernetes Honeynet">Kubernetes Honeynet</option>
              </select>
            </div>

            {/* Service Template */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Service Archetype
              </label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B14] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#00D9FF]/50">
                <option value="Web Server">Web Server (Nginx / Apache / Node)</option>
                <option value="Enterprise Server">Enterprise Server (Active Directory)</option>
                <option value="Database">Database (Postgres / MySQL / Redis)</option>
                <option value="Workstation">Dev Workstation (SSH / Git)</option>
                <option value="Cloud Storage">Cloud Storage (S3 / IAM API)</option>
                <option value="Container Pod">Container Pod (K8s / Docker)</option>
              </select>
            </div>

            {/* Simulation Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Simulation Fidelity
              </label>
              <select value={simulationLevel} onChange={(e) => setSimulationLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B14] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#00D9FF]/50">
                <option value="High Fidelity">High Fidelity (Interactive Mocked OS)</option>
                <option value="Full Kernel Emulation">Full Kernel Emulation (MicroVM / KVM)</option>
                <option value="Medium Fidelity">Medium Fidelity (Tarpit Delay Proxy)</option>
              </select>
            </div>

            {/* Logging Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Telemetry Depth
              </label>
              <select value={loggingLevel} onChange={(e) => setLoggingLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B14] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#00D9FF]/50">
                <option value="Verbose + eBPF">Verbose + eBPF Kernel Keystrokes</option>
                <option value="Kernel Syscalls">Kernel Syscalls Only</option>
                <option value="Network Only">Network Packets Only</option>
              </select>
            </div>

            {/* Resource Allocation */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                vCPU Allocation
              </label>
              <select value={vCpu} onChange={(e) => setVCpu(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B14] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#00D9FF]/50">
                <option value="1 vCPU">1 vCPU (Light Recon)</option>
                <option value="2 vCPU">2 vCPU (Standard Deception)</option>
                <option value="4 vCPU">4 vCPU (High Load Stress)</option>
              </select>
            </div>

            {/* Memory */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                RAM Allocation
              </label>
              <select value={memory} onChange={(e) => setMemory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B14] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#00D9FF]/50">
                <option value="2 GB RAM">2 GB RAM</option>
                <option value="4 GB RAM">4 GB RAM</option>
                <option value="8 GB RAM">8 GB RAM</option>
              </select>
            </div>
          </div>

          {/* Canary Seed Slider */}
          <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E293B]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-300">
                Auto-Planted Canary Tokens
              </span>
              <span className="font-mono text-[#00D9FF] text-xs font-bold">
                {canaryTokens} Decoy Tokens
              </span>
            </div>
            <input type="range" min={5} max={50} value={canaryTokens} onChange={(e) => setCanaryTokens(Number(e.target.value))} className="w-full accent-[#00D9FF]"/>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Seeds synthetic AWS credentials, fake database tables, and mock SSH keys.
            </span>
          </div>

          {/* Air-gap guarantee badge */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-gray-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
            <span>
              <strong>100% Isolation Guarantee:</strong> Sandboxes possess zero route tables to real corporate VPCs.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#1E293B] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs font-medium text-gray-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#00D9FF] hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-glow">
              Deploy Sandbox
            </button>
          </div>
        </form>
      </div>
    </div>);
}
