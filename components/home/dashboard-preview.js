"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, Bell, Check, ChevronDown, Circle, Command, Globe2, LayoutDashboard, Monitor, Network, Radio, Settings2, Terminal, Zap } from "lucide-react";
import Brand from "@/components/ui/brand";

const samples = {
    "24 hours": { threats: "2,847", devices: "1,284", score: "98.6", change: "+12.8%", line: "M0 115 18 117 30 92 48 103 60 80 72 110 92 105 106 78 120 91 136 68 150 88 166 73 180 98 194 87 210 99 226 64 240 76 255 35 270 53 282 82 298 65 312 73 330 48 346 64 360 25 376 51 391 42 409 57 425 38 442 48 460 18 475 45 490 32 510 48 526 25 541 34 558 13 575 37 600 22", times: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"] },
    "7 days": { threats: "18,392", devices: "1,306", score: "99.1", change: "+18.4%", line: "M0 125 25 114 50 120 75 98 100 110 125 84 150 93 175 76 200 96 225 81 250 63 275 78 300 55 325 72 350 58 375 44 400 68 425 42 450 52 475 23 500 39 525 21 550 33 575 12 600 18", times: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] },
};
const events = [
    { icon: Zap, name: "Suspicious connection blocked", detail: "Network protection · 192.0.2.24", time: "Just now", status: "Blocked", type: "blue" },
    { icon: FingerprintIcon, name: "Identity verification completed", detail: "Access control · Production", time: "2 min ago", status: "Verified", type: "green" },
    { icon: Globe2, name: "Cloud security scan complete", detail: "Cloud infrastructure · All regions", time: "5 min ago", status: "Secure", type: "green" },
];
function FingerprintIcon(props) { return <Command {...props} />; }

export default function DashboardPreview() {
    const [range, setRange] = useState("24 hours");
    const data = samples[range];
    return <div className="dashboard-window">
        <div className="dashboard-browser"><div className="window-dots"><i /><i /><i /></div><span><span className="status-dot" /> Decevia Command Center</span><span className="demo-badge">INTERACTIVE DEMO</span></div>
        <div className="dashboard-body">
            <aside className="dashboard-sidebar" aria-label="Preview shortcuts"><Brand compact /><Link href="/dashboard" aria-label="Open dashboard" className="active"><LayoutDashboard size={18} /></Link><Link href="/dashboard/traffic" aria-label="Open network traffic"><Network size={18} /></Link><Link href="/dashboard/alerts" aria-label="Open alerts"><Bell size={18} /></Link><Link href="/dashboard/environments" aria-label="Open environments"><Monitor size={18} /></Link><Link href="/dashboard/settings" aria-label="Open settings" className="sidebar-bottom"><Settings2 size={18} /></Link></aside>
            <div className="dashboard-main">
                <div className="dashboard-title"><div><div className="dashboard-breadcrumb">Workspace <span>/</span> Overview</div><h3>Security overview<span className="secure-pill"><span className="status-dot" /> All systems protected</span></h3></div><label className="range-select"><span className="sr-only">Dashboard sample period</span><select value={range} onChange={e => setRange(e.target.value)}><option>24 hours</option><option>7 days</option></select><ChevronDown size={12} /></label></div>
                <div className="dashboard-metrics">
                    {[{ icon: Zap, label: "Threats blocked", value: data.threats, detail: `${data.change} vs. previous period`, color: "blue" }, { icon: Monitor, label: "Protected devices", value: data.devices, detail: "All endpoints connected", color: "cyan" }, { icon: Activity, label: "Security score", value: data.score, detail: "Excellent security posture", color: "gold" }].map(({ icon: Icon, label, value, detail, color }) => <div className={`dashboard-metric ${color}`} key={label}><div><span>{label}</span><Icon size={15} /></div><strong>{value}{label === "Security score" && <small>/100</small>}</strong><p><ArrowUpRight size={11} />{detail}</p></div>)}
                </div>
                <div className="dashboard-chart-row"><div className="network-chart"><div className="panel-title"><h4>Network activity</h4><span><i /> Secure traffic</span></div><div className="chart-area"><div className="chart-y"><span>1.5k</span><span>1.0k</span><span>500</span><span>0</span></div><svg viewBox="0 0 600 155" preserveAspectRatio="none" role="img" aria-label={`Illustrative secure network traffic over ${range}, trending upward.`}><defs><linearGradient id="traffic-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#3D87FF" stopOpacity=".28" /><stop offset="1" stopColor="#3D87FF" stopOpacity="0" /></linearGradient></defs>{[25, 65, 105, 150].map(y => <path key={y} d={`M0 ${y}H600`} stroke="#1a2638" strokeDasharray="3 5" />)}<path d={`${data.line}L600 155H0Z`} fill="url(#traffic-fill)" /><path d={data.line} stroke="#548fff" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" /></svg></div><div className="chart-times">{data.times.map(t => <span key={t}>{t}</span>)}</div></div><div className="system-health"><div className="panel-title"><h4>System health</h4><Radio size={13} /></div><div className="health-ring"><div><strong>100<span>%</span></strong><small>Operational</small></div></div><p><span className="status-dot" /> All services online</p></div></div>
                <div className="recent-events"><div className="panel-title"><h4>Recent security events</h4><Link href="/dashboard/alerts">View all <ArrowUpRight size={12} /></Link></div>{events.map(({ icon: Icon, name, detail, time, status, type }) => <div className="event-row" key={name}><span className={`event-icon ${type}`}><Icon size={15} /></span><div><strong>{name}</strong><small>{detail}</small></div><time>{time}</time><span className={`event-status ${type}`}>{status}</span></div>)}</div>
            </div>
        </div>
        <div className="dashboard-bottom"><span><Circle size={7} fill="currentColor" /> Illustrative data · Preview environment</span><span><Terminal size={11} /> Built for your security operations</span></div>
    </div>;
}
