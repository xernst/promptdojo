// Site-wide header router. Lessons keep the flat sticky bar (vertical
// real estate); everything else gets the floating glass pill. Onboarding
// hides chrome entirely.
//
// Per design-kit/audit-v4/HEADOFIT-plan.md PR 7.

"use client";

import { usePathname } from "next/navigation";
import FloatingNav from "@/components/SiteHeader/FloatingNav";
import FlatHeader from "@/components/SiteHeader/FlatHeader";

export default function SiteHeader() {
  const pathname = usePathname();
  const onLesson = pathname?.startsWith("/learn/v2") ?? false;
  const onOnboarding = pathname?.startsWith("/onboarding") ?? false;

  if (onOnboarding) return null;
  if (onLesson) return <FlatHeader onLesson />;
  return <FloatingNav />;
}
