"use client";
import React, { useState } from "react";
import { Globe2, Crosshair, MapPin } from "lucide-react";
const ORIGIN_COORDS = [
    { country: "Russia", code: "RU", x: 68, y: 32, percentage: 34.2, threats: 974, dominantType: "Cobalt Strike & Web Exploit" },
    { country: "China", code: "CN", x: 78, y: 46, percentage: 22.8, threats: 649, dominantType: "Reconnaissance & Zero-Day" },
    { country: "Netherlands (Tor)", code: "NL", x: 50, y: 36, percentage: 16.4, threats: 467, dominantType: "Brute Force & Credential Stuffing" },
    { country: "Iran", code: "IR", x: 62, y: 44, percentage: 11.2, threats: 319, dominantType: "K8s Breakout & Reverse Shell" },
    { country: "Brazil", code: "BR", x: 34, y: 68, percentage: 8.5, threats: 242, dominantType: "Masscan & CMS Botnets" },
    { country: "Seychelles", code: "SC", x: 63, y: 62, percentage: 6.9, threats: 196, dominantType: "SQL Injection & Data Exfil" },
];
export function AttackOriginsMap() {
    const [activePin, setActivePin] = useState(ORIGIN_COORDS[0]);
    return (<div className="rounded-xl bg-[#111827] border border-[#1E293B] p-5 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#00D9FF]"/>
            <h3 className="text-base font-semibold text-white">Global Attack Origins & Vectors</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Geographic distribution of diverted intrusion campaigns intercepted in Ghost Honeynets
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
          <Crosshair className="w-3.5 h-3.5 animate-spin"/>
          <span>Active Tracking: 6 Regions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* World Map SVG Canvas */}
        <div className="lg:col-span-2 relative h-64 sm:h-72 rounded-xl bg-[#070B14] border border-[#1E293B] overflow-hidden p-2 flex items-center justify-center">
          {/* Subtle World Map Vector Silhouette */}
          <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 text-gray-600 fill-current select-none pointer-events-none">
            {/* Simplified continents path */}
            <path d="M150,150 Q180,100 240,110 T300,160 T250,230 T160,200 Z"/>
            <path d="M220,260 Q270,250 280,310 T250,420 T210,360 Z"/>
            <path d="M450,120 Q520,90 580,110 T600,180 T500,210 T460,150 Z"/>
            <path d="M480,220 Q560,210 570,300 T530,400 T470,320 Z"/>
            <path d="M600,100 Q750,80 850,120 T900,220 T780,260 T660,180 Z"/>
            <path d="M780,300 Q860,290 870,360 T800,420 T760,340 Z"/>
          </svg>

          {/* Coordinate grid lines */}
          <div className="absolute inset-0 cyber-dots opacity-40 pointer-events-none"/>

          {/* Map Target Center (Decevia HQ - Protected Infrastructure) */}
          <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: "25%", top: "35%" }}>
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-40"></span>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-glow-green"/>
              <div className="absolute left-5 top-0 whitespace-nowrap text-[10px] font-mono bg-[#070B14]/90 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded shadow">
                Protected Real Core
              </div>
            </div>
          </div>

          {/* Interactive Origin Hotspots */}
          {ORIGIN_COORDS.map((pin) => {
            const isSelected = activePin.code === pin.code;
            return (<button key={pin.code} onClick={() => setActivePin(pin)} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none" style={{ left: `${pin.x}%`, top: `${pin.y}%` }} title={`${pin.country}: ${pin.threats} threats`}>
                <div className="relative flex items-center justify-center">
                  <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-60 ${isSelected ? "bg-red-400" : "bg-violet-400"}`}/>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${isSelected
                    ? "bg-red-500 border-white scale-125 shadow-glow-red"
                    : "bg-violet-500 border-gray-900 group-hover:scale-110 shadow-glow-violet"}`}/>
                  {isSelected && (<div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono bg-[#070B14] border border-red-500/50 text-red-300 px-2 py-0.5 rounded-md shadow-lg pointer-events-none">
                      {pin.country} ({pin.percentage}%)
                    </div>)}
                </div>
              </button>);
        })}
        </div>

        {/* Selected Country Details & Ranking */}
        <div className="flex flex-col justify-between space-y-3">
          {/* Active pin detail card */}
          <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E293B]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400"/>
                <span className="text-sm font-semibold text-white">{activePin.country}</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                {activePin.percentage}% Total
              </span>
            </div>
            <div className="mt-2 text-xs space-y-1.5 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">Diverted Threats:</span>
                <span className="font-mono text-white font-medium">{activePin.threats} attacks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dominant Vector:</span>
                <span className="text-[#00D9FF] truncate max-w-[150px] font-medium">{activePin.dominantType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sandbox Target:</span>
                <span className="text-violet-400 font-mono">Ubuntu & Windows Decoys</span>
              </div>
            </div>
          </div>

          {/* Mini Top List */}
          <div className="space-y-1.5 overflow-y-auto max-h-36">
            {ORIGIN_COORDS.map((c) => (<button key={c.code} onClick={() => setActivePin(c)} className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${activePin.code === c.code
                ? "bg-[#1E293B] text-white border border-red-500/30"
                : "hover:bg-[#070B14] text-gray-400 hover:text-white"}`}>
                <span className="truncate">{c.country}</span>
                <span className="font-mono text-gray-300 ml-2">{c.threats}</span>
              </button>))}
          </div>
        </div>
      </div>
    </div>);
}
