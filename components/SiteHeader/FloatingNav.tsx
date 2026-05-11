// Non-lesson chrome — floating glass pill in Apple liquid-glass style.
// Replaces the full-width sticky bar on /, /about, /curriculum, /changelog,
// /not-found.
//
// Per design-kit/audit-v4/HEADOFIT-plan.md PR 7. Founder rule: /about and
// /changelog STAY as routes — those nav links route normally; only
// course-section anchors scroll-on-home. GitHubStatsPill removed per
// founder feedback ("remove the view source committed part too").

"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

import FollowOnXPill from "@/components/FollowOnXPill";
import LoginToSave from "@/components/LoginToSave";
import ContinuePill from "@/components/SiteHeader/ContinuePill";
import HeaderDrawer from "@/components/SiteHeader/Drawer";
import Wordmark from "@/components/Wordmark";

export default function FloatingNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className={[
          // positioning
          "fixed left-1/2 top-3 z-40 -translate-x-1/2 w-fit max-w-[calc(100%-1.5rem)]",
          // pill shape — proper rounded
          "rounded-full",
          // apple liquid glass — heavier blur + saturation for the frost
          "bg-white/[0.06] backdrop-blur-3xl backdrop-saturate-200",
          // subtle rim + brighter inset highlight (the apple "edge" effect)
          "border border-white/[0.12]",
          "shadow-[0_12px_40px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.14)]",
        ].join(" ")}
      >
        <div className="flex h-11 items-center gap-4 whitespace-nowrap px-4 sm:px-5">
          <Link
            href="/"
            aria-label="promptdojo home"
            className="inline-flex shrink-0 items-center transition hover:opacity-90"
          >
            <Wordmark size="text-[13px]" className="lowercase tracking-wide" />
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="site"
            className="hidden items-center gap-4 border-l border-white/10 pl-4 md:flex"
          >
            <Link
              href="/curriculum"
              className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink-400 transition hover:text-green-400"
            >
              curriculum
            </Link>
            <Link
              href="/roast"
              className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-green-400/90 transition hover:text-green-300"
            >
              roast
            </Link>
            <Link
              href="/about"
              className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink-400 transition hover:text-green-400"
            >
              about
            </Link>
            <Link
              href="/changelog"
              className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink-400 transition hover:text-green-400"
            >
              changelog
            </Link>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <ContinuePill />
            {/* Desktop pills */}
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <LoginToSave />
              <FollowOnXPill />
            </div>
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center p-1.5 text-ink-300 transition hover:text-green-400 md:hidden"
              aria-label="open menu"
              aria-expanded={drawerOpen}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>
      <HeaderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
