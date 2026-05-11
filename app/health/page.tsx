import type { Metadata } from "next";
import HealthClient from "@/components/HealthClient";

export const metadata: Metadata = {
  title: "system status · promptdojo",
  description:
    "live status of every promptdojo service. auth, progress, email, newsletter. transparent and free forever.",
  robots: { index: false },
  alternates: { canonical: "https://promptdojo.dev/health/" },
};

export default function HealthPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-6 pt-20 pb-10 sm:pt-24 sm:pb-16">
      <div className="t-eyebrow">/health ─ system status</div>
      <h1 className="t-section mt-4">
        what&apos;s wired up right now.
      </h1>
      <p className="t-body mt-6 text-ink-300">
        a $0/mo open-source python school still has to know whether the lights
        are on. this page asks <code className="rounded bg-ink-900 px-1.5 py-0.5 text-[0.9em]">/api/health</code> directly. no analytics, no
        third-party uptime service, no marketing words for &ldquo;operational.&rdquo;
      </p>
      <HealthClient />
    </main>
  );
}
