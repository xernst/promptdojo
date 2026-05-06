"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { setUserProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import PyodidePreloader from "@/components/PyodidePreloader";
import Wordmark from "@/components/Wordmark";

// Three-screen flow per design-kit/audit-v4/HEADOFIT-plan.md PR 9.
// Personalization + daily-goal screens are out — schema gets defaults.
// Voice (Brand §3/§4): dry, adult, no exclamation marks. Skip is a small
// text link that routes to first lesson with default profile.

type Goal = "side-project" | "team-tools" | "startup" | "curious";
type Level = "absolute-beginner" | "some-exposure" | "rusty";

type Draft = {
  goal: Goal | null;
  level: Level | null;
};

const FIRST_LESSON = "/learn/v2/variables/naming-things/0";

const GOAL_OPTIONS: { id: Goal; label: string; blurb: string }[] = [
  {
    id: "side-project",
    label: "a side project",
    blurb: "something you can ship on your own time.",
  },
  {
    id: "team-tools",
    label: "tools for my team at work",
    blurb: "internal scripts, dashboards, ai plumbing.",
  },
  {
    id: "startup",
    label: "a startup or product",
    blurb: "you want to build the thing yourself, not hire it.",
  },
  {
    id: "curious",
    label: "just curious",
    blurb: "ai writes most of the code now. you want to know what it's doing.",
  },
];

const LEVEL_OPTIONS: { id: Level; label: string; blurb: string }[] = [
  {
    id: "absolute-beginner",
    label: "i haven't written code before",
    blurb: "we'll start with the shapes and names ai uses most.",
  },
  {
    id: "some-exposure",
    label: "i've copied code from chatgpt and edited it",
    blurb: "you can read along. we'll fill the gaps.",
  },
  {
    id: "rusty",
    label: "i used to code, years ago",
    blurb: "we'll pick up speed. skip what you already know.",
  },
];

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    goal: null,
    level: null,
  });

  const finish = useCallback(
    (level: Level) => {
      setUserProfile({
        name: "",
        goal: draft.goal ?? "curious",
        level,
        flavor: {},
        dailyGoalMinutes: 10,
      });
      router.push(FIRST_LESSON);
    },
    [draft.goal, router],
  );

  const skip = useCallback(() => {
    setUserProfile({
      name: "",
      goal: "curious",
      level: "absolute-beginner",
      flavor: {},
      dailyGoalMinutes: 10,
    });
    router.push(FIRST_LESSON);
  }, [router]);

  const next = useCallback(() => setStep((s) => Math.min(2, s + 1)), []);
  const update = useCallback(
    <K extends keyof Draft>(key: K, value: Draft[K]) =>
      setDraft((d) => ({ ...d, [key]: value })),
    [],
  );

  const screen = useMemo(() => {
    switch (step) {
      case 0:
        return <Welcome onContinue={next} />;
      case 1:
        return (
          <GoalScreen
            value={draft.goal}
            onPick={(g) => {
              update("goal", g);
              next();
            }}
          />
        );
      case 2:
        return (
          <LevelScreen
            value={draft.level}
            onPick={(l) => {
              update("level", l);
              finish(l);
            }}
          />
        );
      default:
        return null;
    }
  }, [step, draft, finish, next, update]);

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 sm:py-16"
    >
      <PyodidePreloader />
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="block">
          <Wordmark size="text-base" />
        </Link>
        <div
          className="flex items-center gap-1.5"
          aria-label={`step ${step + 1} of 3`}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 w-8 rounded-full transition",
                i <= step ? "bg-green-500" : "bg-ink-800",
              )}
            />
          ))}
        </div>
      </header>
      <div className="flex flex-1 flex-col">{screen}</div>
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={skip}
          className="font-mono text-xs text-ink-500 underline-offset-4 hover:text-ink-300 hover:underline"
        >
          skip for now → start chapter 1
        </button>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Screens
// ──────────────────────────────────────────────────────────────────────────

function Welcome({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="flex flex-1 flex-col justify-center">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-50 sm:text-5xl">
        you&apos;re going to learn python.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-300">
        ai is your co-pilot, not your crutch. you&apos;ll learn the shapes you
        need to direct it, read what it wrote, and catch when it&apos;s wrong.
      </p>
      <p className="mt-2 max-w-xl text-sm text-ink-500">
        three questions. under a minute. then you ship code.
      </p>
      <div className="mt-10">
        <button
          type="button"
          onClick={onContinue}
          className="dojo-btn-primary"
        >
          start
        </button>
      </div>
    </section>
  );
}

function GoalScreen({
  value,
  onPick,
}: {
  value: Goal | null;
  onPick: (g: Goal) => void;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-50">
        what are you trying to build?
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        one sentence&apos;s worth. we&apos;ll tune the examples.
      </p>
      <fieldset className="mt-8 flex flex-col gap-2">
        <legend className="sr-only">choose a goal</legend>
        {GOAL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onPick(opt.id)}
            className={cn(
              "border bg-ink-950 p-4 text-left transition",
              value === opt.id
                ? "border-green-500 bg-ink-900"
                : "border-ink-800 hover:border-ink-600 hover:bg-ink-900",
            )}
          >
            <div className="font-medium text-ink-100">{opt.label}</div>
            <div className="mt-0.5 text-sm text-ink-500">{opt.blurb}</div>
          </button>
        ))}
      </fieldset>
    </section>
  );
}

function LevelScreen({
  value,
  onPick,
}: {
  value: Level | null;
  onPick: (l: Level) => void;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-50">
        where are you starting from?
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        so we don&apos;t bore you with what you already know.
      </p>
      <fieldset className="mt-8 flex flex-col gap-2">
        <legend className="sr-only">choose your level</legend>
        {LEVEL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onPick(opt.id)}
            className={cn(
              "border bg-ink-950 p-4 text-left transition",
              value === opt.id
                ? "border-green-500 bg-ink-900"
                : "border-ink-800 hover:border-ink-600 hover:bg-ink-900",
            )}
          >
            <div className="font-medium text-ink-100">{opt.label}</div>
            <div className="mt-0.5 text-sm text-ink-500">{opt.blurb}</div>
          </button>
        ))}
      </fieldset>
    </section>
  );
}
