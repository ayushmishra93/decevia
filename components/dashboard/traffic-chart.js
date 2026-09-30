"use client";
import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { Activity } from "lucide-react";
import { HOURLY_TRAFFIC_SERIES } from "@/lib/mock-data";
export function DashboardTrafficChart() {
    const [timeRange, setTimeRange] = useState("24h");
    return (<div className="rounded-xl bg-[#111827] border border-[#1E293B] p-5 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00D9FF]"/>
            <h3 className="text-base font-semibold text-white">
              Real-Time Traffic & Deception Telemetry
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Incoming edge requests vs. threats invisibly redirected to Ghost Sandboxes
          </p>
        </div>

        {/* Filter Controls & Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D9FF]"/>
              <span className="text-gray-300">Legitimate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"/>
              <span className="text-gray-300">Diverted to Decoy</span>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-[#070B14] p-0.5 border border-[#1E293B]">
            {["1h", "6h", "24h", "7d"].map((range) => (<button key={range} onClick={() => setTimeRange(range)} className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${timeRange === range
                ? "bg-[#1E293B] text-[#00D9FF]"
                : "text-gray-400 hover:text-white"}`}>
                {range}
              </button>))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={HOURLY_TRAFFIC_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="legitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="divertGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false}/>
            <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: "#1E293B" }}/>
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: "#1E293B" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}/>
            <Tooltip contentStyle={{
            backgroundColor: "#070B14",
            borderColor: "#1E293B",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
            fontSize: "12px",
            color: "#F8FAFC",
        }} formatter={(value, name) => [
            new Intl.NumberFormat().format(value) + " reqs",
            name === "legitimate" ? "Legitimate Real System" : "Diverted to Ghost Decoy",
        ]}/>
            <Area type="monotone" dataKey="legitimate" stroke="#00D9FF" strokeWidth={2} fillOpacity={1} fill="url(#legitGradient)"/>
            <Area type="monotone" dataKey="diverted" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#divertGradient)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Metrics Footer */}
      <div className="mt-4 pt-3 border-t border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-gray-500 block">Peak Ingress Rate</span>
          <span className="text-white font-mono font-semibold text-sm">72,400 req/s</span>
        </div>
        <div>
          <span className="text-gray-500 block">Diversion Latency</span>
          <span className="text-emerald-400 font-mono font-semibold text-sm">1.8 ms</span>
        </div>
        <div>
          <span className="text-gray-500 block">Attacker Retention</span>
          <span className="text-violet-400 font-mono font-semibold text-sm">34m 12s avg</span>
        </div>
        <div>
          <span className="text-gray-500 block">Deception Accuracy</span>
          <span className="text-cyan-400 font-mono font-semibold text-sm">99.98%</span>
        </div>
      </div>
    </div>);
}
