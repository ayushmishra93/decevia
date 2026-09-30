"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Activity, ArrowRight, ArrowUpRight, AudioLines, Binary, Boxes, Check, CheckCheck, Cloud, Code2, Database, Fingerprint, Globe2, Layers3, Mail, Network, Radar, ScanLine, Search, Server, Sparkles, Terminal, X } from "lucide-react";
import Navigation from "./navigation";
import Brand, { DeceviaMark } from "@/components/ui/brand";
import SecurityVisual from "./security-visual";
import DashboardPreview from "./dashboard-preview";
import { Counter, Reveal } from "./motion";

const solutions = [
    { name: "Threat Detection", icon: Radar, tag: "DETECT", description: "Find the signal in the noise. Uncover suspicious behavior before it becomes a breach.", details: ["Behavioral signals across applications and networks", "Prioritized alerts with investigation context", "A unified view of suspicious activity"] },
    { name: "Cloud Security", icon: Cloud, tag: "SECURE", description: "From your first workload to your entire cloud. Keep every environment in your control.", details: ["Visibility across cloud environments", "Configuration and exposure assessment", "Security insights for infrastructure teams"] },
    { name: "Network Protection", icon: Network, tag: "DEFEND", description: "Know what’s moving through your network. Keep unwanted connections out.", details: ["Network traffic visibility", "Suspicious connection investigation", "Centralized access and traffic controls"] },
    { name: "Data Encryption", icon: Binary, tag: "PROTECT", description: "Keep sensitive information private, wherever it lives and wherever it goes.", details: ["Encryption posture assessment", "Data access visibility", "Protection planning for data at rest and in transit"] },
    { name: "Vulnerability Assessment", icon: ScanLine, tag: "DISCOVER", description: "See your weak points before attackers do. Focus on the risks that matter most.", details: ["Infrastructure exposure review", "Risk-based remediation priorities", "Clear findings for technical teams"] },
    { name: "Security Monitoring", icon: Activity, tag: "OBSERVE", description: "A clear picture. Around the clock. Turn security events into actionable insight.", details: ["Continuous security event visibility", "System health and activity dashboards", "Investigation-ready event context"] },
];

function SectionHeading({ eyebrow, title, description, children, centered = false }) {
    return <div className={`section-heading ${centered ? "centered" : ""}`}><div><p className="eyebrow"><span />{eyebrow}</p><h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>{children}</div>;
}

function SolutionDialog({ solution, onClose }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!solution) return;
        const dialog = ref.current;
        const previous = document.activeElement;
        dialog.showModal();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
    }, [solution]);
    if (!solution) return null;
    const Icon = solution.icon;
    return <dialog ref={ref} className="solution-dialog" aria-labelledby="solution-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div><button className="dialog-close" onClick={onClose} aria-label="Close solution details"><X size={20} /></button><div className="solution-icon"><Icon size={26} /></div><p className="eyebrow">DECEVIA / {solution.tag}</p><h2 id="solution-title">{solution.name}</h2><p>{solution.description}</p><ul>{solution.details.map(detail => <li key={detail}><Check size={16} />{detail}</li>)}</ul><Link className="button button-primary" href="/signup" onClick={onClose}>Start Security Assessment <ArrowUpRight size={16} /></Link></div></dialog>;
}

export default function Homepage() {
    const [solution, setSolution] = useState(null);
    return <MotionConfig reducedMotion="user"><div className="decevia-home">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Navigation />
        <main id="main-content">
            <section className="hero-section" aria-labelledby="hero-title">
                <div className="hero-grid" /><div className="hero-light" />
                <div className="home-container hero-layout">
                    <div className="hero-copy">
                        <Reveal><div className="announcement"><span className="announcement-star"><Sparkles size={12} /></span>Advanced Cybersecurity for the Modern Web<ArrowUpRight size={12} /></div></Reveal>
                        <Reveal delay={0.08}><h1 id="hero-title">Enterprise-Grade<br /><span className="gradient-text">Security</span> for Your<br />Digital World<span className="headline-dot">.</span></h1></Reveal>
                        <Reveal delay={0.16}><p className="hero-description">Decevia protects your applications, networks, cloud infrastructure, and sensitive data with intelligent threat detection, continuous monitoring, and enterprise-grade security.</p></Reveal>
                        <Reveal delay={0.24}><div className="hero-buttons"><Link href="/signup" className="button button-primary">Start Security Assessment <ArrowUpRight size={16} /></Link><Link href="#solutions" className="button button-secondary">Explore Solutions <ArrowRight size={15} /></Link></div><p className="hero-reassurance"><CheckCheck size={14} /><span>No credit card required <b>•</b> Fast setup <b>•</b> Continuous protection</span></p></Reveal>
                        <Reveal delay={0.3}><div className="hero-footnote"><span className="status-dot" /><span>INTELLIGENCE THAT PROTECTS. CONFIDENCE THAT LASTS.</span></div></Reveal>
                    </div>
                    <SecurityVisual />
                </div>
                <div className="home-container trust-section"><p>Trusted Security for Modern Digital Infrastructure</p><div className="partner-logos" aria-label="Illustrative partner logos"><span><Layers3 />Layers</span><span><Globe2 />Spherule</span><span><Boxes />CIRC0OL</span><span><AudioLines />Quotient</span><span><Code2 />Catalog</span></div><span className="partner-note">Illustrative partner identities</span></div>
            </section>

            <section id="solutions" className="home-section home-container" aria-labelledby="solutions-title">
                <Reveal><SectionHeading eyebrow="A CONNECTED SECURITY ECOSYSTEM" title={<span id="solutions-title">Every layer. Every asset.<br /><span className="muted-heading">One step ahead.</span></span>} description="Security shouldn’t be fragmented. Bring your entire digital world under one intelligent layer of protection."><span className="section-index">01 / SOLUTIONS</span></SectionHeading></Reveal>
                <div className="solutions-grid">{solutions.map((item, index) => <Reveal delay={(index % 3) * 0.06} key={item.name}><button className="solution-card" onClick={() => setSolution(item)} aria-haspopup="dialog"><div className="solution-card-top"><span className="solution-icon"><item.icon size={25} strokeWidth={1.4} /></span><span className="card-tag">{item.tag}</span></div><h3>{item.name}</h3><p>{item.description}</p><span className="solution-link">Explore solution <ArrowUpRight size={16} /></span></button></Reveal>)}</div>
            </section>

            <section id="why-decevia" className="why-section"><div className="home-container home-section">
                <Reveal><SectionHeading eyebrow="THE DECEVIA DIFFERENCE" title={<span>Built for complexity.<br /><span className="muted-heading">Designed for confidence.</span></span>} description="A stronger security posture starts with clarity. Know what’s happening, decide what matters, and act with confidence."><div className="why-seal"><DeceviaMark /><span>INTELLIGENT BY DESIGN<br /><b>RELENTLESS BY NATURE</b></span></div></SectionHeading></Reveal>
                <div className="why-grid">{[{ number: "01", icon: Radar, title: "Intelligent Protection", text: "Identify and respond to suspicious activity before it becomes a serious threat.", detail: "Anticipate. Detect. Respond." }, { number: "02", icon: Fingerprint, title: "Complete Access Control", text: "Control identities, permissions, and access across your digital infrastructure.", detail: "The right access. Every time." }, { number: "03", icon: Activity, title: "Continuous Monitoring", text: "Monitor your systems around the clock with actionable security insights.", detail: "Always on. Always aware." }].map(({ number, icon: Icon, title, text, detail }, index) => <Reveal key={number} delay={index * 0.1}><article className="why-card"><div className="why-number">{number}<Icon size={28} strokeWidth={1} /></div><h3>{title}</h3><p>{text}</p><span>{detail}</span></article></Reveal>)}</div>
                <div id="services" className="services-strip"><div><p className="eyebrow">EXPERTISE, ON YOUR SIDE</p><h3>Technology meets human insight.</h3></div><div><span><Search size={16} /> Security assessments</span><span><Terminal size={16} /> Deployment guidance</span><span><Radar size={16} /> Threat investigation</span></div><Link href="mailto:hello@decevia.com" className="text-link">Talk to our team <ArrowUpRight size={15} /></Link></div>
            </div></section>

            <section id="dashboard-preview" className="home-container home-section dashboard-section">
                <Reveal><SectionHeading centered eyebrow="YOUR SECURITY. IN FOCUS." title={<>Less noise.<span className="muted-heading"> More intelligence.</span></>} description="Your entire security landscape, connected in one command center. See what matters. Take action faster." /></Reveal>
                <Reveal><DashboardPreview /></Reveal>
                <div className="dashboard-caption"><span><Check size={14} /> A unified view of your security posture</span><Link href="/dashboard" className="text-link">Explore the command center <ArrowUpRight size={15} /></Link></div>
            </section>

            <section className="stats-section" aria-label="Platform capabilities"><div className="home-container stats-grid"><Reveal><div className="stat-value"><Counter end={24} suffix="/7" /></div><p>Security Monitoring</p><span>Vigilance without interruption</span></Reveal><Reveal delay={0.06}><div className="stat-value"><Counter end={99.9} decimals={1} suffix="%" /></div><p>Platform Availability</p><span>Our availability target</span></Reveal><Reveal delay={0.12}><div className="stat-value stat-word">Real-Time<span className="stat-dot" /></div><p>Threat Detection</p><span>Every moment matters</span></Reveal><Reveal delay={0.18}><div className="stat-value stat-word">Enterprise-Grade</div><p>Encryption</p><span>Privacy at the foundation</span></Reveal></div></section>

            <section id="pricing" className="home-container home-section pricing-section">
                <Reveal><SectionHeading eyebrow="PROTECTION THAT GROWS WITH YOU" title={<>Your infrastructure.<br /><span className="muted-heading">Your level of protection.</span></>} description="Start with a security assessment. Find the right scope for your team, your environment, and what comes next." /></Reveal>
                <div className="pricing-grid">{[{ name: "Assess", subtitle: "Find your starting point", icon: ScanLine, items: ["Review your security posture", "Identify priority exposures", "Build your protection roadmap"], cta: "Start assessment", href: "/signup" }, { name: "Protect", subtitle: "Bring your defenses together", icon: Layers3, items: ["Connected security visibility", "Threat detection and monitoring", "Actionable investigation insights"], cta: "Find your solution", href: "mailto:hello@decevia.com", featured: true }, { name: "Scale", subtitle: "Built around your enterprise", icon: BuildingIcon, items: ["Infrastructure-specific planning", "Access and deployment guidance", "A tailored security engagement"], cta: "Contact security team", href: "mailto:hello@decevia.com" }].map(({ name, subtitle, icon: Icon, items, cta, href, featured }) => <Reveal key={name}><article className={`pricing-card ${featured ? "featured" : ""}`}><div className="pricing-card-title"><Icon size={22} />{featured && <span>CONNECTED PROTECTION</span>}</div><h3>{name}</h3><p>{subtitle}</p><div className="pricing-note">{name === "Assess" ? "Start with your needs" : "Tailored to your infrastructure"}</div><ul>{items.map(item => <li key={item}><Check size={14} />{item}</li>)}</ul><Link className={`button ${featured ? "button-primary" : "button-secondary"}`} href={href}>{cta}<ArrowUpRight size={15} /></Link></article></Reveal>)}</div>
            </section>

            <section id="contact" className="home-container final-cta-section"><Reveal><div className="final-cta"><div className="cta-grid" /><div className="cta-core"><DeceviaMark /></div><p className="eyebrow">YOUR NEXT CHAPTER. SECURED.</p><h2>Secure Your Digital<br />Future with <span className="gradient-text">Decevia.</span></h2><p>Build boldly. Move forward. We’ll help you protect what’s next.</p><div className="hero-buttons"><Link href="/signup" className="button button-primary">Get Protected Today <ArrowUpRight size={16} /></Link><a href="mailto:hello@decevia.com" className="button button-secondary">Contact Security Team <ArrowRight size={15} /></a></div><span className="cta-bottom"><span className="status-dot" /> YOUR WORLD. PROTECTED.</span></div></Reveal></section>
        </main>
        <Footer onSolution={setSolution} />
        <SolutionDialog solution={solution} onClose={() => setSolution(null)} />
    </div></MotionConfig>;
}

function BuildingIcon(props) { return <Server {...props} />; }

function Footer({ onSolution }) {
    return <footer className="decevia-footer"><div className="home-container"><div className="footer-main"><div className="footer-brand"><Brand /><p>Intelligent security for a connected world.<br />Protecting what matters. Empowering<br />what comes next.</p><a href="mailto:hello@decevia.com" className="footer-email"><Mail size={14} />hello@decevia.com</a><div className="footer-socials"><a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fdecevia.com" target="_blank" rel="noopener noreferrer" aria-label="Share Decevia on LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h4v12H3V9Zm6 0h4v1.6c.7-1.2 1.9-2 3.6-2 3.5 0 4.4 2.3 4.4 5.3V21h-4v-6.3c0-1.5-.3-2.6-1.9-2.6-1.7 0-2.1 1.3-2.1 2.9v6H9V9Z" /></svg></a><a href="https://twitter.com/intent/tweet?text=Discover%20Decevia%20%E2%80%94%20intelligent%20cybersecurity&url=https%3A%2F%2Fdecevia.com" target="_blank" rel="noopener noreferrer" aria-label="Share Decevia on X"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.3 8.4L23 22h-6.5l-5.1-7.1L5.2 22H2l7.9-9.1L1 2h6.7l4.6 6.5L18.9 2Zm-1.1 18h1.7L6.7 3.9H4.9L17.8 20Z" /></svg></a><a href="mailto:hello@decevia.com" aria-label="Email Decevia"><Mail size={17} /></a></div></div><div className="footer-column"><h3>Products</h3>{solutions.slice(0, 4).map(item => <button key={item.name} onClick={() => onSolution(item)}>{item.name}</button>)}</div><div className="footer-column"><h3>Solutions</h3><Link href="#why-decevia">Enterprise security</Link><Link href="#solutions">Cloud infrastructure</Link><Link href="#services">Security teams</Link><Link href="#pricing">Plans & pricing</Link></div><div className="footer-column"><h3>Company</h3><Link href="#why-decevia">About Decevia</Link><Link href="#contact">Contact us</Link><Link href="#services">Our services</Link><Link href="#solutions">Security</Link></div><div className="footer-column"><h3>Resources</h3><Link href="#dashboard-preview">Platform overview</Link><Link href="#why-decevia">Security approach</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link></div></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Decevia. All rights reserved.</p><span><span className="status-dot" /> DESIGNED FOR A MORE SECURE WORLD</span><a href="#main-content">Back to top ↑</a></div></div></footer>;
}
