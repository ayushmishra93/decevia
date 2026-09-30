const config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#070B14",
                sidebar: "#0B1220",
                card: {
                    DEFAULT: "#111827",
                    border: "#1E293B",
                    hover: "#1E293B80",
                },
                primary: {
                    DEFAULT: "#00D9FF",
                    glow: "rgba(0, 217, 255, 0.25)",
                    dark: "#00A8C6",
                },
                secondary: {
                    DEFAULT: "#8B5CF6",
                    glow: "rgba(139, 92, 246, 0.25)",
                    dark: "#7C3AED",
                },
                status: {
                    safe: "#22C55E",
                    warning: "#F59E0B",
                    critical: "#EF4444",
                    info: "#00D9FF",
                },
                cyber: {
                    bg: "#070B14",
                    surface: "#0F172A",
                    panel: "#111827",
                    border: "#1E293B",
                    muted: "#64748B",
                    light: "#E2E8F0",
                    cyan: "#00D9FF",
                    violet: "#8B5CF6",
                },
            },
            borderRadius: {
                card: "12px",
            },
            boxShadow: {
                glow: "0 0 20px -5px rgba(0, 217, 255, 0.3)",
                "glow-violet": "0 0 20px -5px rgba(139, 92, 246, 0.3)",
                "glow-red": "0 0 20px -5px rgba(239, 68, 68, 0.3)",
                "glow-green": "0 0 20px -5px rgba(34, 197, 94, 0.3)",
                card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
            },
            animation: {
                pulse_slow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                scanline: "scanline 8s linear infinite",
            },
            keyframes: {
                scanline: {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(1000%)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
