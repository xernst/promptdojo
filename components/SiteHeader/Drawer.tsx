// Mobile site-nav drawer. Full-screen scrim + right-side panel with the
// nav links and the three pills that desktop puts on the bar. Tap-outside
// or Esc closes; focus returns to the trigger via the parent's onClose.
//
// Per design-kit/audit-v4/HEADOFIT-plan.md PR 2.

"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import FollowOnXPill from "@/components/FollowOnXPill";
import LoginToSave from "@/components/LoginToSave";
import GitHubStatsPill from "@/components/GitHubStatsPill";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function HeaderDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Move keyboard focus into the panel on open so screen-reader users
    // hear the dialog announce instead of staying on the hamburger button.
    // Per master review P0 — Drawer focus trap.
    panelRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="site navigation"
      className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-sm md:hidden"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="ml-auto flex h-full w-full max-w-xs flex-col gap-6 border-l border-ink-800 bg-ink-950 p-6 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <span className="t-eyebrow">menu</span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs text-ink-500 hover:text-ink-300"
            aria-label="close menu"
          >
            [ esc ]
          </button>
        </div>
        <nav className="flex flex-col gap-3 font-mono text-sm uppercase tracking-wider">
          <Link
            href="/"
            onClick={onClose}
            className="text-ink-300 hover:text-green-400"
          >
            home
          </Link>
          <Link
            href="/curriculum"
            onClick={onClose}
            className="text-ink-300 hover:text-green-400"
          >
            the curriculum
          </Link>
          <Link
            href="/roast"
            onClick={onClose}
            className="text-green-400 hover:text-green-300"
          >
            roast my prompt
          </Link>
          <Link
            href="/about"
            onClick={onClose}
            className="text-ink-300 hover:text-green-400"
          >
            about
          </Link>
          <Link
            href="/changelog"
            onClick={onClose}
            className="text-ink-300 hover:text-green-400"
          >
            changelog
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-ink-800 pt-4">
          <GitHubStatsPill />
          <LoginToSave />
          <FollowOnXPill />
        </div>
      </div>
    </div>
  );
}
