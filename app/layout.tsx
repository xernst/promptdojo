import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BrainDump from "@/components/BrainDump";
import SiteHeader from "@/components/SiteHeader";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: {
    default: "promptdojo — free interactive python course",
    template: "%s",
  },
  description:
    "free, open-source python course for people who already use ai to write code. runs in your browser. login to save progress and sync across devices.",
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
