"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import DailyGoalDial from "./DailyGoalDial";

type Props = {
  /**
   * Left rail — chapter / lesson / step navigation. v2-specific sidebar
   * comes from A8; the shell just hosts it.
   */
  sidebar: ReactNode;
  /**
   * Centre column — step prompt rendered by StepRouter (A3).
   */
  prompt: ReactNode;
  /**
   * Right column — PersistentIDE instance owned by the parent so it can
   * persist across steps without unmounting.
   */
  ide: ReactNode;
  /**
   * Optional header strip rendered above the prompt panel (lesson title,
   * progress bar, daily-goal dial). Falls back to nothing.
   */
  header?: ReactNode;
  /**
   * Optional footer rendered under the prompt panel — Hint / Skip / Continue
   * buttons usually live here (StepFooter, C2).
   */
  footer?: ReactNode;
};

// Mobile-gate copy lives here so the V3 toggle pattern is fully removed.
// Per design-kit/audit-v4/HEADOFIT-plan.md PR 3 + CEO §3.

export default function LessonShell({
  sidebar,
  prompt,
  ide,
  header,
  footer,
}: Props) {
  return (
    <div className="flex h-[calc(100dvh-40px)] min-h-0 flex-col bg-ink-950 text-ink-100">
      <div className="flex h-full min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-ink-800 bg-ink-900 md:flex md:flex-col lg:w-60">
          {sidebar}
        </aside>
        {/* Single <main id="main"> — the skip-link target. Houses both the
            desktop two-column layout (md+) and the mobile gate (< md). */}
        <main id="main" className="flex min-h-0 w-full flex-1 flex-col">
          {/* Desktop / tablet layout — two-column grid, unchanged from V3. */}
          <div className="hidden min-h-0 w-full flex-1 md:grid md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
            <section className="flex min-h-0 min-w-0 flex-col border-r border-ink-800 md:max-w-[460px] lg:max-w-[520px]">
              {header && (
                <div className="flex items-start justify-between gap-3 border-b border-ink-800 bg-ink-900 px-5 py-3">
                  <div className="min-w-0 flex-1">{header}</div>
                  <DailyGoalDial compact className="shrink-0 pt-0.5" />
                </div>
              )}
              <div className="flex-1 min-h-0 overflow-auto px-4 py-5 sm:px-5 sm:py-6">
                {prompt}
              </div>
              {footer && (
                <div className="border-t border-ink-800 bg-ink-900 px-4 py-3 sm:px-5">
                  {footer}
                </div>
              )}
            </section>
            <section className="flex min-h-0 min-w-0 flex-1 flex-col">
              {ide}
            </section>
          </div>
          {/* Mobile gate (< md) — honest "ship on desktop" message. The V3
              drawer-toggle was a no-op because the IDE pane mounted at 0×0. */}
          <div className="flex min-h-0 w-full flex-1 flex-col md:hidden">
            <div className="flex-1 min-h-0 overflow-auto px-4 py-5">
              {prompt}
            </div>
            <div className="border-t border-ink-800 bg-ink-900 p-5">
              <div className="t-eyebrow mb-2">desktop required</div>
              <p className="t-body-sm">
                the editor runs python in your browser via pyodide
                (~6&thinsp;mb of webassembly). it ships clean on a laptop;
                on a phone it is a battery tax.
              </p>
              <Link
                href="/lesson/resume"
                className="dojo-btn-primary mt-4 inline-flex"
              >
                ↵ resume on desktop <span aria-hidden>→</span>
              </Link>
              <p className="mt-3 t-mono-meta">
                we save your spot. open this same url on a laptop.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
