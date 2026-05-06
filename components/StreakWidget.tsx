"use client";
import { useEffect, useState } from "react";
import { Flame, Snowflake, Sparkles } from "lucide-react";
import { loadProgressV2, PROGRESS_EVENT_V2 } from "@/lib/storage";
import { viewStreak } from "@/lib/streaks";
import type { StreakState } from "@/lib/types";

export default function StreakWidget() {
  const [s, setS] = useState<StreakState | null>(null);

  useEffect(() => {
    const refresh = () => setS(viewStreak(loadProgressV2()));
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(PROGRESS_EVENT_V2, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(PROGRESS_EVENT_V2, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  if (!s) return null;

  return (
    <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
      <span
        title={`${s.current}-day streak (longest ${s.longest})`}
        className="inline-flex items-center gap-1 text-green-500"
      >
        <Flame size={14} className={s.current > 0 ? "fill-green-500 text-green-500" : "text-ink-700"} />
        {s.current}
      </span>
      <span title={`${s.embers} ember(s) — auto-protect missed days`} className="inline-flex items-center gap-1 text-green-500">
        <Sparkles size={14} className={s.embers > 0 ? "text-green-500" : "text-ink-700"} />
        {s.embers}
      </span>
      <span title={`${s.frozenFlames} frozen flame(s) — earned per chapter`} className="inline-flex items-center gap-1 text-green-500">
        <Snowflake size={14} className={s.frozenFlames > 0 ? "text-green-500" : "text-ink-700"} />
        {s.frozenFlames}
      </span>
      <span title="Total XP earned" className="hidden sm:inline text-ink-400">
        {s.totalXp} XP
      </span>
    </div>
  );
}
