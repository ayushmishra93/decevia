"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ShieldAlert } from "lucide-react";
const SEVERITY_DATA = [
    { name: "Critical Severity", value: 38, count: "1,082", color: "#EF4444" },
    { name: "High Severity", value: 32, count: "911", color: "#F59E0B" },
    { name: "Medium Severity", value: 20, count: "570", color: "#00D9FF" },
    { name: "Low / Benign Recon", value: 10, count: "284", color: "#8B5CF6" },
];
export function ThreatDonutChart() {
    return (<div className="rounded-xl bg-[#111827] border border-[#1E293B] p-5 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400"/>
            <h3 className="text-base font-semibold text-white">Threat Severity Profile</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
            2,847 Threats Diverted
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Autonomous severity classification of all diverted adversarial sessions
        </p>
      </div>

      <div className="relative h-56 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={SEVERITY_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
              {SEVERITY_DATA.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="#070B14" strokeWidth={2}/>))}
            </Pie>
            <Tooltip contentStyle={{
            backgroundColor: "#070B14",
            borderColor: "#1E293B",
            borderRadius: "0.75rem",
            fontSize: "12px",
            color: "#F8FAFC",
        }} formatter={(val, name) => [`${val}% of total threats`, name]}/>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono text-white">99.8%</span>
          <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider">
            Trap Rate
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2 pt-2 border-t border-[#1E293B]">
        {SEVERITY_DATA.map((item) => (<div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}/>
              <span className="text-gray-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-white font-semibold">{item.count}</span>
              <span className="text-gray-500 w-8 text-right">({item.value}%)</span>
            </div>
          </div>))}
      </div>
    </div>);
}
