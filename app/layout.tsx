import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BrainDump from "@/components/BrainDump";
import SiteHeader from "@/components/SiteHeader";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  metadataBase: new URL("https://promptdojo.dev"),
  title: {
    default: "promptdojo — free runnable python course",
    template: "%s",
  },
  description:
    "free, open-source python school for people who already use ai to write code. runs in your browser. login to save progress and sync across devices.",
  appleWebApp: {
    capable: true,
    title: "promptdojo",
    statusBarStyle: "black-translucent",
  },
};

// Next.js 16 wants themeColor on the viewport export, not metadata.
// Matches --color-ink-950 (#0a0a0a) from globals.css so the iOS Safari
// toolbar and Android Chrome address bar blend into the page.
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${fraunces.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-ink-950 text-ink-100 antialiased font-display">
        <a href="#main" className="skip-link">skip to content</a>
        <SiteHeader />
        {children}
        <BrainDump />
      </body>
    </html>
  );
}
