"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Cloud, Radar, Network, BookOpen, ChartNoAxesCombined, Building2, Code2, Database, Fingerprint } from "lucide-react";
import Brand from "@/components/ui/brand";

const menus = {
    Products: [
        { name: "Threat Detection", text: "See the signal. Stop the threat.", href: "#solutions", icon: Radar },
        { name: "Cloud Security", text: "Protection beyond the perimeter.", href: "#solutions", icon: Cloud },
        { name: "Security Monitoring", text: "Your infrastructure, in focus.", href: "#dashboard-preview", icon: ChartNoAxesCombined },
    ],
    Solutions: [
        { name: "For enterprises", text: "Confidence at every scale.", href: "#why-decevia", icon: Building2 },
        { name: "For cloud teams", text: "Build quickly. Operate securely.", href: "#solutions", icon: Code2 },
        { name: "For security teams", text: "Turn insights into action.", href: "#services", icon: Fingerprint },
    ],
    Resources: [
        { name: "Platform overview", text: "Explore your command center.", href: "#dashboard-preview", icon: Network },
        { name: "Security approach", text: "Protection, layer by layer.", href: "#why-decevia", icon: BookOpen },
        { name: "Data & privacy", text: "Understand how data is handled.", href: "/privacy", icon: Database },
    ],
};

export default function Navigation() {
    const [open, setOpen] = useState(null);
    const [mobile, setMobile] = useState(false);
    const root = useRef(null);
    const menuButton = useRef(null);
    const reduce = useReducedMotion();
    const close = () => { setOpen(null); setMobile(false); };
    useEffect(() => {
        const dismiss = (e) => {
            if (!root.current?.contains(e.target)) setOpen(null);
        };
        const escape = (e) => {
            if (e.key === "Escape") {
                if (mobile) menuButton.current?.focus();
                else if (open) root.current?.querySelector(`[data-nav="${open}"]`)?.focus();
                setMobile(false); setOpen(null);
            }
        };
        document.addEventListener("pointerdown", dismiss);
        document.addEventListener("keydown", escape);
        const breakpoint = window.matchMedia("(min-width: 1100px)");
        const resize = () => { if (breakpoint.matches) setMobile(false); };
        breakpoint.addEventListener("change", resize);
        return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); breakpoint.removeEventListener("change", resize); };
    }, [open, mobile]);

    const dropdown = (label) => <div className="nav-dropdown" key={label} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null); }}>
        <button data-nav={label} onClick={() => setOpen(open === label ? null : label)} aria-expanded={open === label} aria-controls={`nav-${label.toLowerCase()}`} className="nav-link">{label}<ChevronDown size={12} className={open === label ? "rotate-180" : ""} /></button>
        <AnimatePresence>{open === label && <motion.div id={`nav-${label.toLowerCase()}`} className="dropdown-panel" initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <span className="dropdown-eyebrow">Explore {label}</span>
            {menus[label].map(({ name, text, href, icon: Icon }) => <Link key={name} href={href} onClick={close}><Icon size={19} /><span><strong>{name}</strong><small>{text}</small></span><ArrowUpRight size={14} /></Link>)}
        </motion.div>}</AnimatePresence>
    </div>;

    return <header ref={root} className="decevia-header">
        <div className="home-container nav-inner">
            <Brand />
            <nav aria-label="Main navigation" className="desktop-nav">
                {dropdown("Products")}{dropdown("Solutions")}
                <Link className="nav-link" href="#services">Services</Link>
                {dropdown("Resources")}
                <Link className="nav-link" href="#pricing">Pricing</Link>
                <Link className="nav-link" href="#why-decevia">About</Link>
            </nav>
            <div className="nav-actions"><Link href="/login" className="nav-signin">Sign In</Link><Link href="/signup" className="button button-small button-primary">Get Protected <ArrowUpRight size={15} /></Link></div>
            <button ref={menuButton} className={`mobile-toggle ${mobile ? "is-open" : ""}`} onClick={() => setMobile(!mobile)} aria-label={mobile ? "Close navigation" : "Open navigation"} aria-expanded={mobile} aria-controls="mobile-navigation"><span /><span /></button>
        </div>
        <AnimatePresence>{mobile && <motion.nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav" initial={{ opacity: 0, height: reduce ? "auto" : 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: reduce ? "auto" : 0 }}>
            {["Products", "Solutions", "Services", "Resources", "Pricing", "About"].map((label) => menus[label] ? <div key={label}><button onClick={() => setOpen(open === label ? null : label)} aria-expanded={open === label} aria-controls={`mobile-${label}`}>{label}<ChevronDown size={16} /></button>{open === label && <div id={`mobile-${label}`} className="mobile-submenu">{menus[label].map(({ name, href }) => <Link onClick={close} key={name} href={href}>{name}<ArrowUpRight size={14} /></Link>)}</div>}</div> : <Link key={label} href={label === "About" ? "#why-decevia" : `#${label.toLowerCase()}`} onClick={close}>{label}<ArrowUpRight size={16} /></Link>)}
            <div className="mobile-auth"><Link onClick={close} href="/login" className="button button-secondary">Sign In</Link><Link onClick={close} href="/signup" className="button button-primary">Get Protected <ArrowUpRight size={15} /></Link></div>
        </motion.nav>}</AnimatePresence>
    </header>;
}
