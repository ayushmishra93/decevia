"use client";

import { useCallback, useEffect, useState } from "react";
import LoadingScreen from "@/components/ui/loading-screen";

export default function SiteIntro({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const finish = useCallback(() => setIsLoading(false), []);

    useEffect(() => {
        if (!isLoading) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previousOverflow; };
    }, [isLoading]);

    return (
        <>
            {isLoading && <LoadingScreen onComplete={finish} />}
            <div className={isLoading ? "site-loading-content" : undefined} hidden={isLoading}>
                {children}
            </div>
            <noscript>
                <style>{`.site-loading-screen { display: none !important; } .site-loading-content { display: block !important; }`}</style>
            </noscript>
        </>
    );
}
