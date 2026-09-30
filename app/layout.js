import "./globals.css";
import SiteIntro from "@/components/layout/site-intro";
export const metadata = {
    title: "Decevia | Intelligent Deception-Based Cybersecurity Platform",
    description: "Decevia protects real infrastructure by controlling the attacker's reality through intelligent deception.",
    applicationName: "Decevia",
    icons: { icon: "/decevia-icon.svg", apple: "/apple-touch-icon.png" },
    keywords: [
        "cybersecurity",
        "deception technology",
        "honeypots",
        "SOC dashboard",
        "threat intelligence",
        "zero trust",
        "intrusion diversion",
    ],
};
export default function RootLayout({ children, }) {
    return (<html lang="en" className="dark scroll-smooth">

      <body className="min-h-screen bg-[#070B14] text-slate-100 antialiased selection:bg-[#00D9FF] selection:text-slate-950">
        <SiteIntro>{children}</SiteIntro>
      </body>
    </html>);
}
