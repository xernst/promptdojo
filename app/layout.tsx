import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BrainDump from "@/components/BrainDump";
import SiteHeader from "@/components/SiteHeader";
import JsonLd, { ORG_SCHEMA, WEBSITE_SCHEMA } from "@/components/JsonLd";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

// CF Pages sets CF_PAGES_BRANCH=main only on the production deploy; preview
// branches get their own branch name. We bake a site-wide noindex into every
// non-prod build so preview URLs (*.pages.dev) never compete with the canonical
// domain for indexing. Per launch-week SEO audit 2026-05-11.
const isProductionBuild = process.env.CF_PAGES_BRANCH
  ? process.env.CF_PAGES_BRANCH === "main"
  : true;

export const metadata: Metadata = {
  metadataBase: new URL("https://promptdojo.dev"),
  title: {
    default: "promptdojo — free runnable python school",
    template: "%s",
  },
  description:
    "free preview of the python school for people who already use ai to write code. runs in your browser. the native app ships once the waitlist clears 1,000.",
  robots: isProductionBuild
    ? undefined
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
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
        <JsonLd data={[ORG_SCHEMA, WEBSITE_SCHEMA]} />
      </body>
    </html>
  );
}
