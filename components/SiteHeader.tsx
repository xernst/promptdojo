// Site-wide header strip. Replaces the inline div in app/layout.tsx so the
// header cluster is a single unit instead of duplicated layout markup.
// Server component — composes the existing pill components without any
// extra client JS at the wrapper level.
//
// Per design-kit/audit-v2/HEADOFIT-plan.md PR 6.

import FollowOnXPill from "@/components/FollowOnXPill";
import LoginToSave from "@/components/LoginToSave";
import GitHubStatsPill from "@/components/GitHubStatsPill";
import CourseProgress from "@/components/v2/CourseProgress";

export default function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
      <a
        href="/about"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 transition hover:text-green-400"
      >
        <span className="text-green-500">❯</span>
        <span>what is this?</span>
      </a>
      <nav aria-label="site" className="flex flex-wrap items-center gap-2">
        <GitHubStatsPill />
        <CourseProgress />
        <LoginToSave />
        <FollowOnXPill />
      </nav>
    </header>
  );
}
