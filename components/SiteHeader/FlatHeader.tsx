// Lesson-route header — full-width sticky bar identical to V3 chrome.
// Used only on /learn/v2/* paths so the lesson keeps every pixel of
// vertical real estate. Non-lesson chrome lives in FloatingNav.
//
// Per design-kit/audit-v4/HEADOFIT-plan.md PR 7.

"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

import FollowOnXPill from "@/components/FollowOnXPill";
import LoginToSave from "@/components/LoginToSave";
import GitHubStatsPill from "@/components/GitHubStatsPill";
import CourseProgress from "@/components/v2/CourseProgress";
import ContinuePill from "@/components/SiteHeader/ContinuePill";
import HeaderDrawer from "@/components/SiteHeader/Drawer";
import Wordmark from "@/components/Wordmark";

type Props = {
  onLesson: boolean;
};

export default function FlatHeader({ onLesson }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <Link
            href="/"
            aria-label="promptdojo home"
            className="inline-flex items-center transition hover:opacity-90"
          >
            <Wordmark size="text-[13px]" className="lowercase tracking-wide" />
          </Link>
          <ContinuePill />
          <nav
            aria-label="site"
            className="hidden items-center gap-2 md:flex"
          >
            <GitHubStatsPill />
            {onLesson && <CourseProgress />}
            <LoginToSave />
            <FollowOnXPill />
          </nav>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center p-2 text-ink-400 hover:text-green-400 md:hidden"
            aria-label="open menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
      <HeaderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
