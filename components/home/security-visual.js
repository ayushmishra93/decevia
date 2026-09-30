"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Database, Fingerprint, Globe2, Check, Activity } from "lucide-react";
import { DeceviaMark } from "@/components/ui/brand";

const layers = [
    { number: "01", title: "Encrypted Data", sub: "PRIVATE BY DESIGN", icon: Database, className: "layer-data" },
    { number: "02", title: "Access Control", sub: "EVERY IDENTITY. VERIFIED.", icon: Fingerprint, className: "layer-access" },
    { number: "03", title: "Global Compliance", sub: "CONFIDENCE WITHOUT BORDERS", icon: Globe2, className: "layer-compliance" },
];

export default function SecurityVisual() {
    const reduce = useReducedMotion();
    return <div className="security-visual" role="img" aria-label="Decevia security core connects three floating layers: encrypted data, access control, and global compliance.">
        <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
        <div className="visual-topline"><span className="status-dot" /> DECEVIA SECURITY FABRIC <span className="visual-coordinate">SYS / 001</span></div>
        <svg className="visual-connectors" viewBox="0 0 600 600" fill="none" aria-hidden="true">
            <path d="M310 110V190L460 275V365L290 465 105 358V269L310 150" stroke="#24446b" strokeWidth="1" />
            <path d="M310 110V190L460 275V365L290 465 105 358V269L310 150" stroke="#63d9ff" strokeWidth="2" strokeDasharray="14 640" className="data-flow" />
            <path d="M310 210V450M130 335L440 335" stroke="#264b72" strokeDasharray="3 7" />
            <circle cx="310" cy="110" r="4" fill="#70c7ff" /><circle cx="290" cy="465" r="4" fill="#d9b875" />
        </svg>
        <motion.div className="core-position" initial={reduce ? false : { opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div className="security-core"><div className="core-ring" /><DeceviaMark className="core-mark" /><span className="core-spark" /></div>
        </motion.div>
        {layers.map(({ number, title, sub, icon: Icon, className }, index) => <motion.div key={number} className={`security-platform ${className}`} initial={reduce ? false : { opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: index * 0.15 + 0.15 }}>
            <div className="platform-float" style={{ "--float-delay": `${index * -1.7}s` }}>
                <div className="platform-surface"><div className="platform-circuit" /><div className="platform-top"><span className="platform-number">{number}</span><Icon size={29} strokeWidth={1.2} /></div><div className="platform-name">{title}</div><span className="platform-sub">{sub}</span><span className="platform-corner" /></div>
                <div className="platform-edge" />
            </div>
        </motion.div>)}
        <div className="visual-scan" />
        <div className="visual-label label-encryption"><Check size={12} /> End-to-end encrypted</div>
        <div className="visual-label label-active"><Activity size={13} /><span>Protection active</span><span className="status-dot" /></div>
        <div className="visual-footer"><span>ONE CONNECTED DEFENSE.</span><span>ALWAYS AHEAD.</span></div>
        <span className="visual-particle particle-one" /><span className="visual-particle particle-two" /><span className="visual-particle particle-three" />
    </div>;
}
