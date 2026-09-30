"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Reveal({ children, className = "", delay = 0 }) {
    const reduce = useReducedMotion();
    return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function Counter({ end, decimals = 0, suffix = "" }) {
    const ref = useRef(null);
    const visible = useInView(ref, { once: true });
    const reduce = useReducedMotion();
    const [value, setValue] = useState(end);
    useEffect(() => {
        if (!visible || reduce) return;
        let frame;
        let start;
        const tick = (time) => {
            start ??= time;
            const progress = Math.min((time - start) / 1400, 1);
            setValue(end * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [end, visible, reduce]);
    return <span ref={ref} aria-label={`${end}${suffix}`}><span aria-hidden="true">{value.toFixed(decimals)}{suffix}</span></span>;
}
