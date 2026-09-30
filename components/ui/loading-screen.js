"use client";

import Brand from "@/components/ui/brand";
import { useEffect, useRef } from "react";

export default function LoadingScreen({ onComplete }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (reducedMotion.matches) {
            onComplete?.();
            return;
        }

        const video = videoRef.current;
        video?.play()?.catch(() => onComplete?.());
        // A blocked or stalled video must never prevent access to the site.
        const timeout = onComplete ? window.setTimeout(onComplete, 9000) : null;
        return () => window.clearTimeout(timeout);
    }, [onComplete]);

    return (
        <div className="site-loading-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black p-6">
            <video
                ref={videoRef}
                className="w-full max-w-[848px] max-h-[70dvh] object-contain motion-reduce:hidden"
                autoPlay
                muted
                playsInline
                loop={!onComplete}
                preload="auto"
                onEnded={onComplete}
                onError={onComplete}
                aria-hidden="true"
            >
                <source src="/videos/decevia-loading.mp4" type="video/mp4" />
            </video>
            <Brand className="mt-4" />
            <p role="status" className="mt-6 text-xs font-mono tracking-[0.2em] text-slate-400">
                Loading Decevia…
            </p>
            {onComplete && (
                <button
                    type="button"
                    onClick={onComplete}
                    className="mt-8 rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                >
                    Skip animation
                </button>
            )}
        </div>
    );
}
