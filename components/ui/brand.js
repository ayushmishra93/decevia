import Link from "next/link";

export function DeceviaMark({ className = "", ...props }) {
    return <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true" {...props}>
        <path d="M10 7h14c12 0 19 7 19 17s-7 17-19 17H10V29h7v5h7c8 0 12-4 12-10s-4-10-12-10H10V7Z" fill="currentColor" />
        <path d="M5 18h19l-7 7H5v-7Z" fill="#58D4EE" />
        <path d="m10 7 7 7H7L3 7h7Z" fill="#D9B875" />
    </svg>;
}

export default function Brand({ compact = false, href = "/", className = "" }) {
    return <Link href={href} aria-label={href === "/" ? "Decevia home" : "Decevia command center"} className={`decevia-brand inline-flex shrink-0 items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 ${className}`}>
        <DeceviaMark className="h-9 w-9 text-[#4D8FFF]" />
        {!compact && <span className="text-[27px] font-bold tracking-[-1.3px] text-white">Decevia<span className="brand-period text-[#D9B875]">.</span></span>}
    </Link>;
}
