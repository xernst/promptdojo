"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { setUserProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import PyodidePreloader from "@/components/PyodidePreloader";
import Wordmark from "@/components/Wordmark";

// UX §3 — five screens, one schema saved.
// Voice (Brand §3/§4): dry, adult, no exclamation marks. Skip is a small text
// link, never bold. Personalization is skippable, daily-goal has a default.

type Goal = "side-project" | "team-tools" | "startup" | "curious";
type Level = "absolute-beginner" | "some-exposure" | "rusty";
type DailyGoal = 5 | 10 | 20 | 40;

type Draft = {
  name: string;
  goal: Goal | null;
  level: Level | null;
  pet: string;
  team: string;
  city: string;
  dailyGoalMinutes: DailyGoal;
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

const DAILY_OPTIONS: { id: DailyGoal; label: string; blurb: string }[] = [
  { id: 5, label: "5 min", blurb: "a coffee. one short read." },
  { id: 10, label: "10 min", blurb: "default. one short lesson a day." },
  { id: 20, label: "20 min", blurb: "two lessons. real progress." },
  { id: 40, label: "40 min", blurb: "a focused block. move fast." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    name: "",
    goal: null,
    level: null,
    pet: "",
    team: "",
    city: "",
    dailyGoalMinutes: 10,
  });

  const finish = useCallback(() => {
    setUserProfile({
      name: draft.name.trim(),
      goal: draft.goal ?? "curious",
      level: draft.level ?? "absolute-beginner",
      flavor: {
        pet: draft.pet.trim() || undefined,
        team: draft.team.trim() || undefined,
        city: draft.city.trim() || undefined,
      },
      dailyGoalMinutes: draft.dailyGoalMinutes,
    });
    router.push(FIRST_LESSON);
  }, [draft, router]);

  const next = useCallback(() => setStep((s) => Math.min(4, s + 1)), []);
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
              next();
            }}
          />
        );
      case 3:
        return (
          <PersonalizationScreen
            draft={draft}
            onChange={update}
            onContinue={next}
            onSkip={next}
          />
        );
      case 4:
        return (
          <DailyGoalScreen
            value={draft.dailyGoalMinutes}
            onChange={(m) => update("dailyGoalMinutes", m)}
            onContinue={finish}
          />
        );
      default:
        return null;
    }
  }, [step, draft, finish, next, update]);

  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 sm:py-16">
      <PyodidePreloader />
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="block">
          <Wordmark size="text-base" />
        </Link>
        <div className="flex items-center gap-1.5" aria-label={`step ${step + 1} of 5`}>
          {[0, 1, 2, 3, 4].map((i) => (
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
        need to direct it, read it, and catch when it&apos;s wrong.
      </p>
      <p className="mt-2 max-w-xl text-sm text-ink-500">
        five questions. under a minute. then you write code.
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
      <p className="mt-2 text-sm text-ink-500">one sentence&apos;s worth. we&apos;ll tune the examples.</p>
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
      <p className="mt-2 text-sm text-ink-500">so we don&apos;t bore you with what you already know.</p>
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

function PersonalizationScreen({
  draft,
  onChange,
  onContinue,
  onSkip,
}: {
  draft: Draft;
  onChange: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-50">
        make the examples yours.
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        we sub these into the code. <code className="font-mono text-green-300">pets = [&quot;luna&quot;]</code>{" "}
        reads a lot better than <code className="font-mono text-green-300">pets = [&quot;cat&quot;]</code>.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="your name"
          placeholder="josh"
          value={draft.name}
          onChange={(v) => onChange("name", v)}
        />
        <Field
          label="a pet's name"
          placeholder="luna"
          value={draft.pet}
          onChange={(v) => onChange("pet", v)}
        />
        <Field
          label="team or company"
          placeholder="marketing"
          value={draft.team}
          onChange={(v) => onChange("team", v)}
        />
        <Field
          label="your city"
          placeholder="brooklyn"
          value={draft.city}
          onChange={(v) => onChange("city", v)}
        />
      </div>
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-ink-500 underline-offset-4 hover:text-ink-300 hover:underline"
        >
          skip — use generic names
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="dojo-btn-primary"
        >
          continue
        </button>
      </div>
    </section>
  );
}

function DailyGoalScreen({
  value,
  onChange,
  onContinue,
}: {
  value: DailyGoal;
  onChange: (m: DailyGoal) => void;
  onContinue: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-50">
        pick a daily floor.
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        it&apos;s a floor, not a target. going over is fine. missing a day costs an ember,
        not the streak. change anytime.
      </p>
      <fieldset className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <legend className="sr-only">pick a daily floor</legend>
        {DAILY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={value === opt.id}
            className={cn(
              "border bg-ink-950 p-4 text-left transition",
              value === opt.id
                ? "border-green-500 bg-ink-900"
                : "border-ink-800 hover:border-ink-600 hover:bg-ink-900",
            )}
          >
            <div className="font-display text-2xl text-ink-50">{opt.label}</div>
            <div className="mt-1 text-xs text-ink-500">{opt.blurb}</div>
          </button>
        ))}
      </fieldset>
      <div className="mt-10 flex items-center justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="dojo-btn-primary"
        >
          start lesson 1
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-widest text-ink-500">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-ink-800 bg-ink-950 px-3 py-2 text-ink-100 placeholder:text-ink-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-300/40"
      />
    </label>
  );
}
