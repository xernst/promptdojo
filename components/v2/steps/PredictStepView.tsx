"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeHighlightPinned } from "@/lib/rehype-highlight-pinned";
import { CheckCircle2, XCircle } from "lucide-react";
import { interpolate, type PredictStep } from "@/lib/content/schema";
import type { StepViewProps } from "../StepRouter";
import { cn } from "@/lib/utils";
import { gradeRunResult } from "./_grader";
import HintReveal from "./_HintReveal";

export default function PredictStepView({
  step,
  profile,
  onAttempt,
  ide,
}: StepViewProps<PredictStep>) {
  const [prediction, setPrediction] = useState("");
  const [submitted, setSubmitted] = useState<null | { passed: boolean; reason?: string }>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const startedAtRef = useRef(new Date().toISOString());


  const prompt = step.personalize ? interpolate(step.prompt, profile) : step.prompt;

  async function handleSubmit() {
    if (!prediction.trim() || submitted) return;
    // Treat the user's prediction as a virtual stdout and compare against the
    // grader's expected output. We don't need to actually execute the step's
    // code — the grader's `expected` is the source of truth.
    const fakeRun = { ok: true, stdout: prediction, stderr: "" };
    const grade = gradeRunResult(step.grader, fakeRun);
    setSubmitted(grade.passed ? { passed: true } : { passed: false, reason: grade.reason });
    onAttempt({
      stepId: step.id,
      startedAt: startedAtRef.current,
      submittedAt: new Date().toISOString(),
      correct: grade.passed,
      hintsUsed,
      payload: { kind: "predict", prediction },
    });
  }

  async function handleRunCode() {
    // Convenience: run the step's code via the IDE so the learner can see
    // the actual output without clicking back to the IDE pane.
    await ide.run();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="prose max-w-none text-ink-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlightPinned]}>
          {prompt}
        </ReactMarkdown>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-ink-300">
          your prediction
        </span>
        <textarea
          value={prediction}
          onChange={(e) => !submitted?.passed && setPrediction(e.target.value)}
          disabled={submitted?.passed === true}
          rows={4}
          className={cn(
            "rounded border border-ink-700 bg-ink-950 px-3 py-2 font-mono text-sm",
            "text-green-300 focus:border-green-500 focus:outline-none",
          )}
          placeholder="what stdout will this print?"
          spellCheck={false}
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!prediction.trim() || submitted?.passed === true}
          className={cn(
            "rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-ink-950 transition",
            "hover:bg-green-400",
            "disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-ink-500",
          )}
        >
          Submit prediction
        </button>
        {/* Mobile gate hides the IDE column on predict steps (passive-pass-through),
            so this convenience button is desktop-only — calling ide.run() on a
            phone executes against an IDE the user can't see (QA 2026-05-12). */}
        <button
          type="button"
          onClick={handleRunCode}
          className="hidden text-xs text-ink-400 underline-offset-2 hover:text-ink-100 hover:underline md:inline-flex"
        >
          Or run the code →
        </button>
      </div>
      {submitted && (
        <div
          aria-live="polite"
          className={cn(
            "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
            submitted.passed
              ? "border-green-700/50 bg-green-700/5 text-green-400"
              : "border-ink-700 bg-ink-800/40 text-ink-400",
          )}
        >
          {submitted.passed ? <CheckCircle2 size={16} className="mt-0.5" /> : <XCircle size={16} className="mt-0.5" />}
          <span>{submitted.passed ? "That's the output." : submitted.reason}</span>
        </div>
      )}
      {!submitted?.passed && (
        <HintReveal
          hints={step.hint}
          resetKey={step.id}
          onReveal={(level) => setHintsUsed((c) => Math.max(c, level))}
        />
      )}
    </div>
  );
}
