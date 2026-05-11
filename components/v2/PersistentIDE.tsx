"use client";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { closeBrackets } from "@codemirror/autocomplete";
import { bracketMatching } from "@codemirror/language";
import { indentWithTab } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { dojoTheme } from "@/lib/codemirror-theme";
import { Loader2, Lock, Play } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePyodide } from "@/lib/use-pyodide";
import { cn } from "@/lib/utils";

export type IDEFile = {
  name: string;
  body: string;
  readOnly?: boolean;
  language?: "python" | "text" | "json";
};

export type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  durationMs?: number;
};

import type { AstGradeRequest, AstGradeResult } from "@/lib/use-pyodide";

export type PersistentIDEHandle = {
  run: () => Promise<RunResult | null>;
  getActiveCode: () => string;
  getFile: (name: string) => string | undefined;
  gradeAst: (code: string, rules: AstGradeRequest) => Promise<AstGradeResult>;
  reset: () => void;
};

type Props = {
  /**
   * Per-step file set. The active tab's body seeds the editor.
   * The IDE preserves user edits for the same `name` between renders so the
   * editor never empties while moving through a single lesson.
   */
  files: IDEFile[];
  /**
   * When false, the Run button is hidden entirely. Defaults to true.
   * Even on `read` / `mc` steps the IDE is runnable so the learner can
   * press Run on the read-only example (UX §1.2).
   */
  runnable?: boolean;
  /**
   * Stable identifier for the current step. When this changes, the IDE
   * applies the new `files` from the prop (resetting any in-flight edits
   * that don't have a matching file name).
   */
  stepId: string;
  /**
   * Fires whenever the active editable file's body changes.
   */
  onCodeChange?: (file: IDEFile, code: string) => void;
  /**
   * Fires after each Run with the captured stdout/stderr.
   */
  onResult?: (result: RunResult) => void;
  /**
   * Optional extra controls rendered in the run bar (e.g. step's Submit button).
   */
  rightActions?: React.ReactNode;
  /**
   * Optional badge rendered above the output panel — used by step views to
   * surface "Passed" / "Try again" without owning the panel itself.
   */
  outputBadge?: React.ReactNode;
  /**
   * Optional extra content rendered inside the output panel (after stdout/stderr).
   */
  outputExtra?: React.ReactNode;
};

const STATUS_COPY: Record<"idle" | "loading" | "ready", string> = {
  idle: "booting python in your browser…",
  loading: "warming up python (~12 mb of wasm)…",
  ready: "press run · ⌘↵",
};

const PersistentIDE = forwardRef<PersistentIDEHandle, Props>(function PersistentIDE(
  {
    files,
    runnable = true,
    stepId,
    onCodeChange,
    onResult,
    rightActions,
    outputBadge,
    outputExtra,
  },
  ref,
) {
  const { status, run, gradeAst } = usePyodide();

  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    seedDrafts(files),
  );
  const [activeName, setActiveName] = useState<string>(
    () => files[0]?.name ?? "main.py",
  );
  const [running, setRunning] = useState(false);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [lastRun, setLastRun] = useState<{
    durationMs: number;
    at: number;
  } | null>(null);

  const lastStepIdRef = useRef(stepId);

  useEffect(() => {
    if (lastStepIdRef.current === stepId) return;
    lastStepIdRef.current = stepId;
    setDrafts((prev) => {
      const next: Record<string, string> = {};
      for (const file of files) {
        const carried = prev[file.name];
        next[file.name] =
          carried !== undefined && !file.readOnly ? carried : file.body;
      }
      return next;
    });
    setActiveName((current) =>
      files.some((f) => f.name === current) ? current : files[0]?.name ?? "main.py",
    );
    setStdout("");
    setStderr("");
    setLastRun(null);
  }, [stepId, files]);

  const activeFile = useMemo(
    () => files.find((f) => f.name === activeName) ?? files[0],
    [files, activeName],
  );

  const activeCode = activeFile ? drafts[activeFile.name] ?? activeFile.body : "";

  const handleChange = useCallback(
    (value: string) => {
      if (!activeFile || activeFile.readOnly) return;
      setDrafts((prev) => ({ ...prev, [activeFile.name]: value }));
      onCodeChange?.(activeFile, value);
    },
    [activeFile, onCodeChange],
  );

  const handleRun = useCallback(async (): Promise<RunResult | null> => {
    if (!activeFile || running) return null;
    // We don't bail when status === "loading" — the worker awaits ensurePyodide()
    // internally, so the run queues and resolves once Python finishes booting.
    // The user sees "Running…" instead of "Editor isn't ready yet."
    setRunning(true);
    setStdout("");
    setStderr("");
    const startedAt = performance.now();
    const code = drafts[activeFile.name] ?? activeFile.body;
    const result = await run(code);
    setStdout(result.stdout);
    setStderr(result.stderr);
    setLastRun({
      durationMs: result.durationMs ?? Math.round(performance.now() - startedAt),
      at: Date.now(),
    });
    setRunning(false);
    onResult?.(result);
    return result;
  }, [activeFile, drafts, onResult, run, running]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!runnable) return;
      if (event.key !== "Enter") return;
      if (!(event.metaKey || event.ctrlKey)) return;
      // Only own ⌘↵ when focus is inside the CodeMirror editor. Outside the
      // editor (Continue button focused, prompt panel scrolled, body focused
      // after a click), let StepFooter's listener advance the step. Prevents
      // the IDE running twice + footer firing concurrently.
      const target = event.target as HTMLElement | null;
      if (!target?.closest?.(".cm-editor")) return;
      event.preventDefault();
      void handleRun();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRun, runnable]);

  useImperativeHandle(
    ref,
    () => ({
      run: () => handleRun(),
      getActiveCode: () => (activeFile ? drafts[activeFile.name] ?? activeFile.body : ""),
      getFile: (name: string) => drafts[name],
      gradeAst: (code, rules) => gradeAst(code, rules),
      reset: () => {
        setDrafts(seedDrafts(files));
        setStdout("");
        setStderr("");
        setLastRun(null);
      },
    }),
    [activeFile, drafts, files, gradeAst, handleRun],
  );

  const extensions = useMemo(() => {
    const baseExtensions =
      activeFile?.language === "python" || activeFile?.language === undefined
        ? [
            python(),
            bracketMatching(),
            closeBrackets(),
            keymap.of([indentWithTab]),
          ]
        : [bracketMatching(), closeBrackets()];
    if (activeFile?.readOnly) {
      return [...baseExtensions, EditorView.editable.of(false)];
    }
    return baseExtensions;
  }, [activeFile]);

  const ready = status === "ready";
  const hasOutput = stdout.length > 0 || stderr.length > 0;
  const ranEmpty = !running && lastRun !== null && !hasOutput;

  return (
    <div className="flex h-full min-h-0 flex-col bg-ink-950">
      <div
        role="tablist"
        aria-label="Editor files"
        className="flex items-center gap-1 border-b border-ink-800 bg-ink-900 px-2"
      >
        {files.map((file, idx) => {
          const isActive = file.name === activeName;
          const tabId = `ide-tab-${stepId}-${idx}`;
          return (
            <button
              key={file.name}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`ide-tabpanel-${stepId}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveName(file.name)}
              onKeyDown={(event) => {
                // WAI-ARIA tablist pattern: arrow keys move between tabs.
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                event.preventDefault();
                const dir = event.key === "ArrowRight" ? 1 : -1;
                const nextIdx = (idx + dir + files.length) % files.length;
                const nextFile = files[nextIdx];
                if (!nextFile) return;
                setActiveName(nextFile.name);
                // Defer focus until the tab re-renders with tabIndex=0.
                requestAnimationFrame(() => {
                  const next = document.getElementById(
                    `ide-tab-${stepId}-${nextIdx}`,
                  );
                  next?.focus();
                });
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono transition",
                isActive
                  ? "border-b-2 border-green-500 text-ink-100"
                  : "border-b-2 border-transparent text-ink-500 hover:text-ink-300",
              )}
            >
              {file.readOnly && (
                <Lock size={11} className="text-ink-500" aria-hidden="true" />
              )}
              {file.name}
              {file.readOnly && <span className="sr-only"> (read only)</span>}
            </button>
          );
        })}
      </div>
      <div
        id={`ide-tabpanel-${stepId}`}
        role="tabpanel"
        aria-label={activeFile ? `${activeFile.name} editor` : "Editor"}
        className="flex-1 min-h-0 overflow-hidden"
      >
        {activeFile ? (
          <CodeMirror
            key={`${stepId}:${activeFile.name}`}
            value={activeCode}
            height="100%"
            theme={dojoTheme}
            extensions={extensions}
            onChange={handleChange}
            readOnly={activeFile.readOnly ?? false}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: !activeFile.readOnly,
              foldGutter: false,
              tabSize: 4,
            }}
            className="h-full text-[13px]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-500">
            no file
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-ink-800 bg-ink-900 px-3 py-2">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-xs",
            ready ? "text-ink-500" : "text-green-300",
          )}
        >
          {!ready && (
            <Loader2 size={11} className="animate-spin motion-reduce:animate-none" />
          )}
          {ready ? STATUS_COPY.ready : STATUS_COPY[status]}
        </div>
        <div className="flex items-center gap-2">
          {runnable && (
            <button
              type="button"
              onClick={() => void handleRun()}
              // The worker awaits ensurePyodide() internally, so a click during
              // load queues — the user sees "Running…" instead of a disabled
              // button that looks broken on first impression. We only block
              // re-clicks while a run is already in flight.
              disabled={running}
              aria-busy={running || !ready}
              aria-keyshortcuts="Meta+Enter Control+Enter"
              className="dojo-btn-primary inline-flex items-center gap-1.5"
            >
              {running || !ready ? (
                <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
              ) : (
                <Play size={14} />
              )}
              run
              <kbd className="ml-1 font-mono text-[10px] opacity-80">⌘↵</kbd>
            </button>
          )}
          {rightActions}
        </div>
      </div>
      <div
        className="flex h-44 min-h-0 flex-col border-t border-ink-800 bg-ink-950"
        role="region"
        aria-label="Code output"
      >
        <div className="flex items-center justify-between border-b border-ink-800 px-3 py-1.5">
          <div
            id={`ide-status-${stepId}`}
            aria-live="polite"
            aria-atomic="true"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-300"
          >
            <span className="text-green-500" aria-hidden="true">❯</span>
            stdout
            {lastRun && !running && (
              <span className="ml-2 font-mono text-[10px] normal-case tracking-normal text-ink-500">
                <span className={stderr ? "text-err" : "text-ok"} aria-hidden="true">
                  {stderr ? "✗" : "✓"}
                </span>{" "}
                <span className="sr-only">
                  {stderr ? "run failed." : "run succeeded."}{" "}
                </span>
                ran in {lastRun.durationMs}ms
              </span>
            )}
            {running && (
              <span className="ml-2 inline-flex items-center gap-1 font-mono text-[10px] normal-case tracking-normal text-green-400">
                <Loader2
                  size={10}
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
                running…
              </span>
            )}
          </div>
          {outputBadge}
        </div>
        <div
          aria-live="polite"
          aria-label="Program output"
          className="flex-1 overflow-auto p-3 font-mono text-[12.5px] leading-relaxed"
        >
          {!hasOutput && !outputExtra && !ranEmpty && !running && (
            <div className="font-mono text-sm text-ink-500">
              [promptdojo:~]$ <span className="cursor-blink">_</span>
            </div>
          )}
          {running && (
            <div className="italic text-ink-500">running your code…</div>
          )}
          {ranEmpty && (
            <div className="text-ink-500">
              <span className="text-ok">✓</span> ran with no output.
              <span className="ml-1 text-ink-500">
                add a <code className="rounded bg-ink-900 px-1 text-ink-400">print(…)</code> to see something.
              </span>
            </div>
          )}
          {stdout && <pre className="whitespace-pre-wrap text-ink-200">{stdout}</pre>}
          {stderr && (
            <pre className="mt-2 whitespace-pre-wrap text-err">{stderr}</pre>
          )}
          {outputExtra && <div className="mt-3">{outputExtra}</div>}
        </div>
      </div>
    </div>
  );
});

function seedDrafts(files: IDEFile[]): Record<string, string> {
  const drafts: Record<string, string> = {};
  for (const file of files) drafts[file.name] = file.body;
  return drafts;
}

export default PersistentIDE;
