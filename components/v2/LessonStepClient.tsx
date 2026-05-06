"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import LessonShell from "./LessonShell";
import { phaseForChapter } from "@/lib/curriculum/phases";
import PersistentIDE, {
  type IDEFile,
  type PersistentIDEHandle,
} from "./PersistentIDE";
import StepRouter, { type StepIDEBridge } from "./StepRouter";
import V2ChapterNav, { type ChapterNavTree } from "./ChapterNav";
import type { Chapter, Lesson, Step, StepAttempt, UserProfile } from "@/lib/content/schema";
import {
  loadProgressV2,
  setStepAttempt,
  setLastVisitedV2,
  markLessonStarted,
  markLessonComplete,
  markChapterCompleteIfNew,
  getStepProgress,
} from "@/lib/storage";
import { awardPass, grantFrozenFlame } from "@/lib/streaks";

type Props = {
  tree: ChapterNavTree;
  chapter: Chapter;
  lesson: Lesson;
  step: Step;
  stepIndex: number;
  next: { chapterSlug: string; lessonSlug: string; stepIndex: number } | null;
};

const FRESH_PROFILE: UserProfile = {
  name: "",
  goal: "curious",
  level: "absolute-beginner",
  flavor: {},
  dailyGoalMinutes: 10,
  reducedMotion: false,
  soundEnabled: false,
  createdAt: new Date(0).toISOString(),
};

export default function LessonStepClient({
  tree,
  chapter,
  lesson,
  step,
  stepIndex,
  next,
}: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(FRESH_PROFILE);
  const [latestAttempt, setLatestAttempt] = useState<StepAttempt | null>(null);
  const ideRef = useRef<PersistentIDEHandle>(null);

  // Load profile + record visit on mount / step change. Restore any
  // previously-passed attempt for this step so reload doesn't ask the user
  // to re-pass content they've already completed.
  useEffect(() => {
    const progress = loadProgressV2();
    if (progress.profile) {
      setProfile({ ...FRESH_PROFILE, ...progress.profile });
    }
    setLastVisitedV2({
      chapterSlug: chapter.slug,
      lessonSlug: lesson.slug,
      stepIndex,
    });
    if (stepIndex === 0) {
      markLessonStarted(chapter.slug, lesson.slug);
    }
    const prior = getStepProgress(step.id);
    const lastPassed = prior?.attempts
      ?.slice()
      .reverse()
      .find((a) => a.correct);
    setLatestAttempt(lastPassed ?? null);
  }, [chapter.slug, lesson.slug, stepIndex, step.id]);

  const ideFiles = useMemo<IDEFile[]>(() => buildFilesForStep(step), [step]);
  const stepRunnable = useMemo(() => stepIsRunnable(step), [step]);

  const ideBridge = useMemo<StepIDEBridge>(
    () => ({
      run: async () => ideRef.current?.run() ?? null,
      getActiveCode: () => ideRef.current?.getActiveCode() ?? "",
    }),
    [],
  );

  function handleAttempt(attempt: StepAttempt) {
    // Award XP / advance streak on the FIRST passing attempt for a step only —
    // re-passes (e.g. user comes back, hits Submit again) shouldn't double-count.
    const alreadyPassed = getStepProgress(step.id)?.attempts?.some(
      (a) => a.correct,
    );
    setLatestAttempt(attempt);
    setStepAttempt(step.id, attempt, { concept: step.concept });
    if (attempt.correct && !alreadyPassed) {
      awardPass();
    }
    if (attempt.correct && next === null) {
      markLessonComplete(chapter.slug, lesson.slug);
      // Chapter completion: if every lesson in this chapter now has a
      // completedAt, credit the chapter and grant a frozen flame (idempotent).
      const fresh = loadProgressV2();
      const allDone = chapter.lessons.every(
        (l) => fresh.lessons[`${chapter.slug}/${l.slug}`]?.completedAt,
      );
      if (allDone && markChapterCompleteIfNew(chapter.slug)) {
        grantFrozenFlame();
      }
    }
  }

  function handleContinue() {
    if (step.type === "read" && latestAttempt?.correct !== true) {
      const now = new Date().toISOString();
      handleAttempt({
        stepId: step.id,
        startedAt: now,
        submittedAt: now,
        correct: true,
        hintsUsed: 0,
        payload: { kind: "read-ack" },
      });
    }
    if (!next) {
      router.push("/");
      return;
    }
    router.push(`/learn/v2/${next.chapterSlug}/${next.lessonSlug}/${next.stepIndex}`);
  }

  const totalSteps = lesson.steps.length;
  const passed = latestAttempt?.correct === true;

  return (
    <LessonShell
      sidebar={
        <V2ChapterNav
          tree={tree}
          activeChapter={chapter.slug}
          activeLesson={lesson.slug}
          activeStepIndex={stepIndex}
        />
      }
      header={(() => {
        const phase = phaseForChapter(chapter.slug);
        const lessonIndex = chapter.lessons.findIndex(
          (l) => l.slug === lesson.slug,
        );
        return (
          <div className="flex flex-col gap-1.5">
            <h1 className="sr-only">
              {lesson.title} — step {stepIndex + 1} of {totalSteps}
            </h1>
            {phase && (
              <div className="t-mono-meta">
                phase {String(phase.number).padStart(2, "0")} · {phase.name}
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-baseline gap-2 truncate">
                <Link
                  href={`/learn/v2/${chapter.slug}`}
                  className="t-mono-meta text-ink-300 transition-colors hover:text-green-400"
                >
                  ch {String(chapter.number).padStart(2, "0")} ·{" "}
                  {chapter.title.replace(/\s*—.*$/, "").toLowerCase()}
                </Link>
                <span className="t-mono-meta text-ink-600">›</span>
                <span className="t-mono-meta truncate">
                  lesson {lessonIndex + 1} of {chapter.lessons.length} ·{" "}
                  {lesson.title.toLowerCase()}
                </span>
              </div>
              <span className="t-mono-meta tabular-nums">
                step {stepIndex + 1} / {totalSteps}
              </span>
            </div>
            <ProgressBar value={(stepIndex + 1) / totalSteps} />
          </div>
        );
      })()}
      prompt={
        <StepRouter
          step={step}
          profile={profile}
          onAttempt={handleAttempt}
          ide={ideBridge}
        />
      }
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-500">
            {passed
              ? "locked in. move on when you're ready."
              : "⌘↵ runs the editor."}
          </span>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!passed && step.type !== "read"}
            className="dojo-btn-primary"
          >
            {next ? "continue →" : "that's all 624 →"}
          </button>
        </div>
      }
      ide={
        <PersistentIDE
          ref={ideRef}
          stepId={step.id}
          files={ideFiles}
          runnable={stepRunnable}
        />
      }
    />
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 w-full overflow-hidden rounded-full bg-ink-800"
    >
      <div
        className="h-full bg-green-500 transition-all motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function buildFilesForStep(step: Step): IDEFile[] {
  if (step.files && step.files.length > 0) {
    return step.files.map((f) => ({
      name: f.name,
      body: f.body,
      readOnly: f.readOnly,
      language: f.language,
    }));
  }

  switch (step.type) {
    case "read":
    case "mc": {
      const code = step.code ?? "";
      return [
        {
          name: "main.py",
          body: code,
          readOnly: true,
          language: "python",
        },
      ];
    }
    case "predict":
      return [
        {
          name: "main.py",
          body: step.code,
          readOnly: true,
          language: "python",
        },
      ];
    case "fix":
      return [
        {
          name: "main.py",
          body: step.brokenCode,
          readOnly: false,
          language: "python",
        },
      ];
    case "write":
    case "checkpoint":
      return [
        {
          name: "main.py",
          body: step.starter,
          readOnly: false,
          language: "python",
        },
      ];
    case "fill": {
      // Prefer the explicit step.code field (cleaner separation of concerns —
      // prompt panel narrates, IDE shows code). Fall back to extracting the
      // first python fence from the prompt for backwards compat with steps
      // authored before the `code` field landed.
      const code = step.code ?? extractFirstPythonFence(step.prompt);
      return [
        {
          name: "main.py",
          body: code,
          readOnly: true,
          language: "python",
        },
      ];
    }
    case "reorder": {
      // Reorder shows the unsorted fragments concatenated in the IDE so the
      // editor isn't blank. The drag interaction lives in the prompt panel.
      const code = step.fragments.map((f) => f.code).join("\n");
      return [
        {
          name: "main.py",
          body: code,
          readOnly: true,
          language: "python",
        },
      ];
    }
  }
}

function extractFirstPythonFence(markdown: string): string {
  const match = markdown.match(/```(?:python|py)?\n([\s\S]*?)```/);
  if (!match) return "";
  return match[1].replace(/\n+$/, "") + "\n";
}

function stepIsRunnable(step: Step): boolean {
  switch (step.type) {
    case "read":
    case "mc":
      return step.runnable !== false && (step.code?.length ?? 0) > 0;
    case "predict":
    case "fix":
    case "write":
    case "checkpoint":
      return true;
    case "fill":
    case "reorder":
      return false;
  }
}
