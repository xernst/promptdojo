# V4.5 Implementation Plan — The Interactive Features Sprint

**Author:** Head of IT
**Date:** 2026-05-06
**Founder authorization (verbatim):** *"schedule V4.5 — PR 11 (fill-blank widgets, 10h) + step-through playback + Visualize panel + TracebackView + Pyodide hairline. That's the interactive-features sprint that takes the IDE to 9.9/10."*
**Predecessors:** `audit-v4/SENIOR-DEV-worklog.md` (V4 shipped 1-10), `audit-v4/CEO-vision.md` §V4.5 deferral list, `audit-v4/08-interactive-features-feasibility.md` (the technical contract), `audit-v3/HEADOFIT-plan.md` PR 2 (TracebackView spec) + PR 4 (Pyodide hairline spec).

---

## Executive summary

Five PRs total ~52h (PR 11 fill-blank 10h + TracebackView 8h + Pyodide hairline 8h + Step-through playback 16h + Visualize 10h). **Honest read: that is 2x a normal evening sprint at solo cadence (~25h/week).** I'm splitting the work in two halves:

- **Stage 1 (~26h, 1 sprint):** PR 11 fill-blank widgets, TracebackView, Pyodide hairline. Three independently shippable upgrades to existing surfaces. Zero new schema, zero worker protocol changes, lowest risk per dev-hour. Lands the V4 deferred queue (per `audit-v4/CEO-vision.md:152` order) without committing to the worker rewrite.
- **Stage 2 (~26h, follow-up sprint):** Step-through playback (16h) + Visualize panel (10h). These ship together because Visualize strictly depends on the playback frames buffer (`08-interactive-features-feasibility.md:179` — *one run, one buffer, two views*). Splitting them creates a half-feature that ships nothing visible. Stage 2 also introduces the only worker-protocol change in the sprint, the only new schema fields, and the only chapter-author opt-in matrix.

**Key risks:** (1) Pyodide hairline's "real byte progress" path may not be reachable in Pyodide 0.28.3 — fall back to the asymptotic timer the V3 spec already specced (`audit-v3/HEADOFIT-plan.md:665`). (2) Stage 2's `sys.settrace` overhead on Chromebooks could surprise — mitigated by 500-frame ring-buffer cap and per-step opt-in (no chapter pays the trace tax it didn't request). (3) Fill-blank's `eq()` correctness is the load-bearing detail (`08-interactive-features-feasibility.md:356`) — if focus loss reappears after the rewrite, the V3 broken-state regresses.

**Ships first:** PR 11 fill-blank widgets is the founder-named priority and was the V4 worklog's explicit handoff (`SENIOR-DEV-worklog.md:24`). I'm landing TracebackView **before** fill-blank inside Stage 1 because TracebackView is pure UI on existing data (zero risk, sets up `editorViewRef` capture that fill-blank does not need but other features will), and the V3 audit ranked TracebackView as the highest feels-per-dev-hour change still on the queue (`audit-v4/CEO-vision.md:153`). The CEO's V4.5 ship order in the deferral notes — TracebackView → playback → visualize → hairline — is honored within the staging.

---

## Pre-flight

- **State of main:** V4 PRs 1-10 squashed onto main per `SENIOR-DEV-worklog.md:7-17`. Hero respected (`SENIOR-DEV-worklog.md:27-31`). Smoke tests green on https://promptdojo.pages.dev (`SENIOR-DEV-worklog.md:50-60`). `pnpm build` exits 0; ~30 lines of pyodide-solution warnings from sibling `~/python-course-2026/` are noise (`SENIOR-DEV-worklog.md:39`).
- **Build green check:** Run `pnpm build` from `~/Developer/code-killa/` before starting Stage 1. Expect `out/` static export to render. `predev`/`prebuild` runs `copy-pyodide.mjs` + `build-content.mjs` + `build-content-v2.mjs` — all three must succeed for any PR.
- **Deps audit:** All three `@codemirror/*` modules referenced in this sprint are **already installed** at versions compatible with the spec (`package.json:16-21`):
  - `@codemirror/autocomplete@^6.20.1` (provides `closeBrackets` already used; we add no new export)
  - `@codemirror/commands@^6.10.3` (provides `indentWithTab` already used; we add no new export)
  - `@codemirror/state@^6.6.0` (we add `StateField`, `StateEffect` — already exported)
  - `@codemirror/view@^6.41.1` (we add `WidgetType`, `Decoration` — already exported)
  - `@codemirror/language@^6.12.3` (already used; we add nothing)
- **No new packages required for any PR in this sprint.** Bundle delta is purely first-party app code (~+800 LOC by `08-interactive-features-feasibility.md:557` estimate, ~5 KB gzipped).
- **Founder draft chapter caveat:** The V4 worklog flagged a YAML parse error in `content/python/14-structured-output/02-validation-with-pydantic/04-predict-the-error.predict.yaml:34` (`SENIOR-DEV-worklog.md:35`) and untracked drafts for chapters 16/21-25. **Do not block on these.** Stage 1's PR-B content migration sweep operates only on committed `*.fill.yaml` files (55 files total per `find -name '*.fill.yaml'`); founder's untracked chapter 14 lessons are out of scope until the YAML is fixed.

**Rollback plan (one sentence per PR):**

- **PR-A (TracebackView):** Revert the commit; `PersistentIDE.tsx:362-364` stderr `<pre>` returns. No state, no schema, no risk.
- **PR-B (fill-blank widgets):** Revert + run a one-line script to revert `___ID___` markers in migrated YAMLs (script ships in same PR, branch `revert-fill-migration.mjs`). Existing `splitOnBlanks` path in `FillBlankStepView.tsx:54-57` survives untouched in legacy mode.
- **PR-C (Pyodide hairline):** Revert the commit; `STATUS_COPY` strings + `Loader2` spinner return. Worker boot path unchanged.
- **PR-D (Step-through playback):** Revert the commit; `runWithTrace` is gated behind `step.playback === true` and the opt-in flag isn't set on any production step until the dogfood lessons in evening 7 — until then no learner sees the path. Revert before opt-in equals zero learner-facing change.
- **PR-E (Visualize panel):** Revert the commit; the panel only mounts when `step.visualize` is set, and that flag also isn't set on any production step pre-opt-in.

---

## Stage 1 — sprintable now (~26h)

Three PRs, ship in this order: **PR-A (TracebackView, 8h) → PR-B (fill-blank widgets, 10h) → PR-C (Pyodide hairline, 8h).**

**Why this order:**

1. PR-A first because TracebackView is pure UI on existing data (stderr is already in component state at `PersistentIDE.tsx:115`), zero new types, lowest risk, and was the V3 deferred work that the V4 worklog never picked up. Ships clean before touching the editor extensions array.
2. PR-B second because the editor extension wire-up follows the same `useMemo`-extensions pattern PR-A doesn't touch (`PersistentIDE.tsx:209-223`), and the build-script changes for fill-blank don't conflict with anything PR-A added.
3. PR-C last because the worker fetch path is the most volatile change in the stage; rolling it back is most independent if it lands last.

---

### PR-A — refresh-v4-5/A-traceback-view

**Branch:** `refresh-v4-5/A-traceback-view`
**Outcome:** Python tracebacks render as structured frames — collapsed Pyodide internal frames, syntax-highlighted code in user frames, clickable `line N` links that scroll the editor. Errors stop being a wall of red text. (Spec lifted from `audit-v3/HEADOFIT-plan.md:390-507`.)
**Estimated time:** 8h
**Depends on:** main (V4 PR 10 squashed)

**Files to touch:**

| File | Change | LOC delta |
|---|---|---:|
| `lib/python-traceback.ts` | NEW — pure parser, no React | +120 |
| `components/v2/TracebackView.tsx` | NEW — renders parsed frames | +90 |
| `components/v2/PersistentIDE.tsx` | Swap raw `<pre>` at lines 362-364 for `<TracebackView>`; capture `EditorView` via `onCreateEditor`; expose `scrollToLine` on the handle | +25 / -3 |
| `__tests__/python-traceback.test.ts` | NEW — 3 unit tests if test infra exists; otherwise eyeball | +40 |

**Parser spec (`lib/python-traceback.ts`):**

Lifted from `audit-v3/HEADOFIT-plan.md:417-463`. Pyodide stderr structure is fixed:

```
Traceback (most recent call last):
  File "<...user...>", line 7, in <module>
  File "<...user...>", line 4, in collect_errors
KeyError: 'name'
```

(Pyodide gives user-runner code a synthetic filename; we treat `"<exec>"` as the user-frame discriminator.)

```ts
// lib/python-traceback.ts
export type Frame = {
  file: string;       // "<exec>" for user code; otherwise pyodide internal
  line: number;
  func: string;
  isUser: boolean;    // file === "<exec>"
};

export type ParsedTraceback = {
  frames: Frame[];
  exceptionType: string;
  exceptionMessage: string;
  raw: string;
};

export function parseTraceback(raw: string): ParsedTraceback | null {
  if (!raw.trim().startsWith("Traceback")) return null;
  const lines = raw.split("\n");
  const frames: Frame[] = [];
  const FRAME_RE = /^\s*File "([^"]+)", line (\d+), in (.+)$/;
  let lastLine: { type: string; message: string } | null = null;

  for (const line of lines) {
    const m = line.match(FRAME_RE);
    if (m) {
      frames.push({
        file: m[1],
        line: parseInt(m[2], 10),
        func: m[3],
        isUser: m[1] === "<exec>",
      });
    } else if (line.match(/^[A-Z][a-zA-Z]*Error|^[A-Z][a-zA-Z]*Exception|^SyntaxError/)) {
      const colonIdx = line.indexOf(":");
      lastLine = colonIdx > 0
        ? { type: line.slice(0, colonIdx), message: line.slice(colonIdx + 1).trim() }
        : { type: line.trim(), message: "" };
    }
  }

  if (frames.length === 0 && !lastLine) return null;
  return {
    frames,
    exceptionType: lastLine?.type ?? "Error",
    exceptionMessage: lastLine?.message ?? "",
    raw,
  };
}
```

**Component spec (`components/v2/TracebackView.tsx`):**

```tsx
"use client";
import { parseTraceback } from "@/lib/python-traceback";

type Props = {
  raw: string;
  onJumpToLine?: (line: number) => void;
};

export default function TracebackView({ raw, onJumpToLine }: Props) {
  const parsed = parseTraceback(raw);
  if (!parsed) return <pre className="mt-2 whitespace-pre-wrap text-err">{raw}</pre>;

  const { frames, exceptionType, exceptionMessage } = parsed;
  const userFrames = frames.filter((f) => f.isUser);
  const internalFrames = frames.filter((f) => !f.isUser);

  return (
    <div className="mt-2 border-l-2 border-err pl-3">
      <div className="t-mono-meta text-err">{exceptionType}</div>
      <div className="font-mono text-sm text-ink-200">{exceptionMessage}</div>
      <ol className="mt-3 space-y-1 font-mono text-xs">
        {userFrames.map((f, i) => (
          <li key={i} className="text-ink-300">
            <button
              type="button"
              onClick={() => onJumpToLine?.(f.line)}
              className="text-green-400 underline-offset-2 hover:underline"
            >
              line {f.line}
            </button>{" "}
            in <span className="text-ink-500">{f.func}</span>
          </li>
        ))}
      </ol>
      {internalFrames.length > 0 && (
        <details className="mt-2">
          <summary className="t-mono-meta cursor-pointer text-ink-500">
            show internal frames ({internalFrames.length})
          </summary>
          <ol className="mt-1 space-y-1 font-mono text-xs text-ink-500">
            {internalFrames.map((f, i) => (
              <li key={i}>{f.file}:{f.line} in {f.func}</li>
            ))}
          </ol>
        </details>
      )}
      <details className="mt-3">
        <summary className="t-mono-meta cursor-pointer text-ink-500">show raw traceback</summary>
        <pre className="mt-2 whitespace-pre-wrap text-err text-xs">{raw}</pre>
      </details>
    </div>
  );
}
```

**Click-to-jump in editor (`components/v2/PersistentIDE.tsx`):**

`@uiw/react-codemirror@4.25.9` exposes `onCreateEditor: (view: EditorView) => void`. Capture into a ref; expose `scrollToLine` on `PersistentIDEHandle`.

**BEFORE (`PersistentIDE.tsx:37-42`):**
```ts
export type PersistentIDEHandle = {
  run: () => Promise<RunResult | null>;
  getActiveCode: () => string;
  getFile: (name: string) => string | undefined;
  reset: () => void;
};
```

**AFTER:**
```ts
export type PersistentIDEHandle = {
  run: () => Promise<RunResult | null>;
  getActiveCode: () => string;
  getFile: (name: string) => string | undefined;
  reset: () => void;
  scrollToLine: (line: number) => void;
};
```

**BEFORE (`PersistentIDE.tsx:362-364`):**
```tsx
{stderr && (
  <pre className="mt-2 whitespace-pre-wrap text-err">{stderr}</pre>
)}
```

**AFTER:**
```tsx
{stderr && (
  <TracebackView raw={stderr} onJumpToLine={(n) => scrollToLineImpl(n)} />
)}
```

Add at the top of the component:
```ts
const editorViewRef = useRef<EditorView | null>(null);
const scrollToLineImpl = useCallback((line: number) => {
  const view = editorViewRef.current;
  if (!view) return;
  if (line < 1 || line > view.state.doc.lines) return;
  const pos = view.state.doc.line(line).from;
  view.dispatch({
    selection: { anchor: pos },
    effects: EditorView.scrollIntoView(pos, { y: "center" }),
  });
  view.focus();
}, []);
```

Pass `onCreateEditor={(view) => { editorViewRef.current = view; }}` to the `<CodeMirror>` element at `PersistentIDE.tsx:259`. Wire `scrollToLine: scrollToLineImpl` into the `useImperativeHandle` block at `PersistentIDE.tsx:193-207`.

**Live-region risk (`audit-v3/HEADOFIT-plan.md:506`):** `<details>` inside `aria-live="polite"` (`PersistentIDE.tsx:342-344`) re-announces on every disclosure toggle. Mitigation: scope the live region to stdout only by moving `aria-live="polite"` from the parent `<div>` to a child wrapper that contains *only* `{stdout && <pre>...}` and the `cursor-blink` placeholder. The TracebackView container sits outside that live region.

**BEFORE (`PersistentIDE.tsx:341-344`):**
```tsx
<div
  aria-live="polite"
  className="flex-1 overflow-auto p-3 font-mono text-[12.5px] leading-relaxed"
>
```

**AFTER:**
```tsx
<div className="flex-1 overflow-auto p-3 font-mono text-[12.5px] leading-relaxed">
  <div aria-live="polite">
    {/* stdout + idle / running / ranEmpty placeholders go here */}
  </div>
  {/* TracebackView sits outside the live region */}
```

(Move the inner content blocks accordingly — stdout/running/ranEmpty inside the inner `<div aria-live>`, stderr/TracebackView outside.)

**Test checklist:**
- [ ] `KeyError` in a 7-line lesson: TracebackView shows `KeyError` heading + `'name'` message + clickable `line 7` button
- [ ] click "line 7" → editor cursor positions on line 7, scrollIntoView centers it, editor focuses
- [ ] internal Pyodide frames hidden behind `<details>` (closed by default)
- [ ] `print("warn", file=sys.stderr)` (no traceback) → falls back to raw `<pre>` (parseTraceback returns null)
- [ ] empty stderr → no TracebackView mounted
- [ ] toggling `<details>` does NOT cause `aria-live` to re-announce stdout (manual VoiceOver/NVDA spot check)
- [ ] `pnpm build` green; `out/_next/static/*` bundle delta < 5 KB br

**Verification:**
- [ ] Visual smoke on `/learn/v2/error-handling/...` step that has a known throw path
- [ ] `parseTraceback` unit-tested with fixtures (3 cases: KeyError, SyntaxError, no-traceback stderr)

**Risks:**
- Some chapter-14 draft lessons have malformed YAML that crashes the build (`SENIOR-DEV-worklog.md:35`). PR-A doesn't touch content, so unrelated — but if the dev tries to ship without the founder's chapter.yaml revert, prebuild fails. Resolution is independent of this PR.
- `EditorView.scrollIntoView` on a line beyond the document length is silently a no-op in `@codemirror/view@6.41.1`, but we guard explicitly above to avoid noisy console traces.

---

### PR-B — refresh-v4-5/B-fill-blank-widgets

**Branch:** `refresh-v4-5/B-fill-blank-widgets`
**Outcome:** `___ID___` markers in fill-step `code` render as inline `<input>` widgets inside CodeMirror at the marker positions. Multi-blank navigation works. Submit lives in the prompt panel's Check button (per V4.5 scope guard — see decision below). Existing 55 fill lessons migrate cleanly via a build-script sweep. Closes the V3 audit's "the persistent-IDE moat breaks here" finding (`audit-v3/05-ide-deep-dive.md:88`, `audit-v4/CEO-vision.md:101-106`).
**Estimated time:** 10h (CEO-trimmed from 12h per `audit-v4/CEO-vision.md:104`)
**Depends on:** PR-A merged (avoid editor extension array conflict)

**Files to touch:**

| File | Change | LOC delta |
|---|---|---:|
| `lib/codemirror-blank-widget.ts` | NEW — `WidgetType` + `StateField` + `StateEffect` + `blankExtension(opts)` | +160 |
| `components/v2/PersistentIDE.tsx` | Accept `extraExtensions?: Extension[]` prop; merge into `useMemo` extensions array | +8 |
| `components/v2/steps/FillBlankStepView.tsx` | Rewrite — drop `splitOnBlanks` path; render prose prompt only; pass `blanks` + `onChange` + `state` through to a new `<PersistentIDE>` wrapper via `extraExtensions`; keep Check button in prompt panel for V4.5 (don't migrate to IDE chrome — that's V5 polish per scope guard) | -80 / +90 |
| `lib/codemirror-theme.ts` | Add `.cm-blank-input` + `.cm-blank-input[data-state="correct"]` + `.cm-blank-input[data-state="wrong"]` rules to `dojoEditorTheme` | +24 |
| `scripts/build-content-v2.mjs` | Add `parseFillBlankCode(step)` validator at the lesson load step; emit build error on `blanks[].id` ↔ `___ID___` mismatch | +60 |
| `scripts/migrate-fill-steps-v45.mjs` | NEW one-shot migration — sweeps `content/python/**/*.fill.yaml`, transforms `___` in `code` to `___ID___` based on positional `blanks[].id` order; idempotent (skips already-migrated files) | +80 |
| `content/python/**/*.fill.yaml` (55 files) | Mechanical migration via the script above | varies |

**Why the Check button stays in the prompt panel for V4.5:**

`audit-v4/CEO-vision.md:104` explicitly trims the IDE-chrome migration to the V4.5 cut list: *"defer the keyboard-only `Tab` polish and the codemirror-theme `.cm-blank-input` style states to a follow-up if time tight."* Moving Submit to IDE chrome touches `PersistentIDE` props + every step view's submit handler — out of scope for the 10h budget. The prompt panel's existing `Check` button (`FillBlankStepView.tsx:142-153`) remains; it calls `handleSubmit()` against the same `values` state the widget writes to. The widget IS the moat win; chrome relocation is V5.

**Widget extension spec (`lib/codemirror-blank-widget.ts`):**

Lifted from `audit-v4/08-interactive-features-feasibility.md:312-355`, with the load-bearing `eq()` correctness called out in `:356-357`.

```ts
import { EditorView, Decoration, WidgetType, type DecorationSet } from "@codemirror/view";
import { StateField, StateEffect, type EditorState, type Extension, RangeSetBuilder } from "@codemirror/state";

export type BlankSpec = {
  id: string;
  width?: number; // optional ch units; default = max(4, longest accept + 1)
};

export type BlankState = "neutral" | "correct" | "wrong";

export type BlankExtensionOptions = {
  blanks: BlankSpec[];
  values: Record<string, string>;          // controlled — current input values
  states: Record<string, BlankState>;      // per-blank visual state
  readOnly: boolean;                       // submitted + correct → readOnly true
  onChange: (id: string, value: string) => void;
  onSubmit?: () => void;                   // Enter inside any blank submits
};

class BlankInputWidget extends WidgetType {
  constructor(
    readonly blankId: string,
    readonly value: string,
    readonly width: number,
    readonly state: BlankState,
    readonly readOnly: boolean,
    readonly onChange: (id: string, v: string) => void,
    readonly onSubmit?: () => void,
  ) { super(); }

  toDOM(): HTMLElement {
    const input = document.createElement("input");
    input.type = "text";
    input.value = this.value;
    input.dataset.blankId = this.blankId;
    input.dataset.state = this.state;
    input.style.width = `${this.width}ch`;
    input.className = "cm-blank-input";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.readOnly = this.readOnly;
    input.addEventListener("input", (e) => {
      this.onChange(this.blankId, (e.target as HTMLInputElement).value);
    });
    input.addEventListener("keydown", (e) => {
      // Enter submits if all filled (the parent decides via onSubmit)
      if (e.key === "Enter") {
        e.preventDefault();
        this.onSubmit?.();
      }
      // Tab-to-next-blank polish — DEFERRED per CEO V4.5 trim. Handled at
      // the step-view level if shipped later: query [data-blank-id] siblings,
      // .focus() the next/prev. Out of scope for V4.5.
    });
    return input;
  }

  // CRITICAL: equality determines whether CM tears down the DOM node and
  // rebuilds it. Same id+value+state+readOnly = same DOM = focus + caret
  // survive across decoration set rebuilds. This is the load-bearing fix
  // the V3 path lacked. (08-interactive-features-feasibility.md:356-357)
  eq(other: BlankInputWidget): boolean {
    return other.blankId === this.blankId
      && other.value === this.value
      && other.state === this.state
      && other.readOnly === this.readOnly;
  }

  ignoreEvent(): boolean {
    // Don't let CM swallow input events into editor commands.
    return true;
  }
}

const setOptions = StateEffect.define<BlankExtensionOptions>();

function buildDecorations(state: EditorState, opts: BlankExtensionOptions): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const text = state.doc.toString();
  const MARKER_RE = /___([A-Z][A-Z0-9_]*)___/g;
  let match: RegExpExecArray | null;
  while ((match = MARKER_RE.exec(text)) !== null) {
    const blankId = match[1];
    const blank = opts.blanks.find((b) => b.id.toUpperCase() === blankId);
    if (!blank) continue; // unknown id — leave the literal in place
    const value = opts.values[blank.id] ?? "";
    const blankState = opts.states[blank.id] ?? "neutral";
    const width = blank.width ?? Math.max(4, value.length + 2);
    const widget = new BlankInputWidget(
      blank.id,
      value,
      width,
      blankState,
      opts.readOnly,
      opts.onChange,
      opts.onSubmit,
    );
    builder.add(
      match.index,
      match.index + match[0].length,
      Decoration.replace({ widget }),
    );
  }
  return builder.finish();
}

export function blankExtension(opts: BlankExtensionOptions): Extension {
  const field = StateField.define<{ deco: DecorationSet; opts: BlankExtensionOptions }>({
    create(state) {
      return { deco: buildDecorations(state, opts), opts };
    },
    update(prev, tr) {
      let next = prev;
      for (const e of tr.effects) {
        if (e.is(setOptions)) {
          next = { deco: buildDecorations(tr.state, e.value), opts: e.value };
        }
      }
      if (next === prev && tr.docChanged) {
        next = { ...prev, deco: buildDecorations(tr.state, prev.opts) };
      }
      return next;
    },
    provide: (f) => EditorView.decorations.from(f, (v) => v.deco),
  });
  return [field];
}

export const blankSetEffect = setOptions;
```

**Step-view rewrite (`components/v2/steps/FillBlankStepView.tsx`):**

The fill step view stops splitting the prompt on `___`; the prompt is now pure prose narration. The IDE owns the blanks. State (values, submitted, allCorrect) stays in this view; on every render it produces a fresh `extraExtensions` array containing a fresh `blankExtension(...)`. React's reconciler handles the re-render; CM's reconfigure is fine for the 1-2 fill renders per step.

**BEFORE (`FillBlankStepView.tsx:54-57, 91-139`):**
```tsx
const segments = useMemo(() => splitOnBlanks(prompt, step.blanks.length), [
  prompt,
  step.blanks.length,
]);
// ...
<div className="prose max-w-none text-ink-200">
  {segments.map((segment, idx) => {
    if (segment.type === "text") { /* render markdown */ }
    /* render blank <input> in prompt panel */
  })}
</div>
```

**AFTER:**
```tsx
// FillBlankStepView no longer renders any input. The prompt panel becomes
// pure prose; the IDE owns the inputs.
<div className="prose max-w-none text-ink-200">
  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
    {prompt}
  </ReactMarkdown>
</div>
```

The IDE itself receives `extraExtensions` via the new `PersistentIDE` prop (see below). The step view passes a stable callback that updates local `values` state. The Check button at `:142-153` stays.

**Decision: hoist values to the IDE OR keep them in the step view?** Keep them in the step view. The grading code at `:78` already lives here, and the IDE remains pure rendering. Simpler boundary.

**`<PersistentIDE>` prop addition (`PersistentIDE.tsx`):**

**BEFORE (`PersistentIDE.tsx:44-84`):**
```ts
type Props = {
  files: IDEFile[];
  runnable?: boolean;
  stepId: string;
  onCodeChange?: (file: IDEFile, code: string) => void;
  onResult?: (result: RunResult) => void;
  rightActions?: React.ReactNode;
  outputBadge?: React.ReactNode;
  outputExtra?: React.ReactNode;
};
```

**AFTER:**
```ts
type Props = {
  files: IDEFile[];
  runnable?: boolean;
  stepId: string;
  onCodeChange?: (file: IDEFile, code: string) => void;
  onResult?: (result: RunResult) => void;
  rightActions?: React.ReactNode;
  outputBadge?: React.ReactNode;
  outputExtra?: React.ReactNode;
  /**
   * Step-specific CodeMirror extensions (e.g. fill-blank widget overlays).
   * Recomputed by the parent on every render; the inner extensions array
   * is keyed by reference so changing it triggers a CM reconfigure — fine
   * for the 1-2 fill-blank renders per step.
   */
  extraExtensions?: Extension[];
};
```

Merge into the existing `useMemo` at `PersistentIDE.tsx:209-223`:

**BEFORE:**
```ts
const extensions = useMemo(() => {
  const baseExtensions =
    activeFile?.language === "python" || activeFile?.language === undefined
      ? [python(), bracketMatching(), closeBrackets(), keymap.of([indentWithTab])]
      : [bracketMatching(), closeBrackets()];
  if (activeFile?.readOnly) {
    return [...baseExtensions, EditorView.editable.of(false)];
  }
  return baseExtensions;
}, [activeFile]);
```

**AFTER:**
```ts
const extensions = useMemo(() => {
  const baseExtensions =
    activeFile?.language === "python" || activeFile?.language === undefined
      ? [python(), bracketMatching(), closeBrackets(), keymap.of([indentWithTab])]
      : [bracketMatching(), closeBrackets()];
  const merged = extraExtensions
    ? [...baseExtensions, ...extraExtensions]
    : baseExtensions;
  if (activeFile?.readOnly) {
    return [...merged, EditorView.editable.of(false)];
  }
  return merged;
}, [activeFile, extraExtensions]);
```

Add `Extension` import from `@codemirror/state` at line 1-9.

**The `LessonStepClient.tsx` wire (line 211-218 region) needs `extraExtensions` plumbed through.** The cleanest move is to lift `extraExtensions` to `LessonStepClient.tsx` with a step-discriminated useMemo: `const extraExtensions = useMemo(() => step.type === "fill" ? buildFillExtensions(step, fillState, fillCallbacks) : undefined, [...])`. Pass to the shared IDE.

**Two architectural options considered:**

- **(A) Mount a dedicated `<PersistentIDE>` inside `<FillBlankStepView>`** with the extension. Cleaner boundary, but breaks the "one IDE per lesson" model that `LessonStepClient.tsx:83-90` relies on for `ideBridge`.
- **(B) Lift `extraExtensions` to `LessonStepClient.tsx`** with a step-discriminated useMemo. Preserves the single-IDE invariant.

**Pick (B).** Preserves run bar, output panel, drafts persistence — the V2 moat. Keeps `FillBlankStepView` pure-render. The `fillState` lives in the step view via React's lifted-state pattern; `LessonStepClient` reads it through an extended `StepIDEBridge` with a `getFillExtensions: () => Extension[] | undefined` method, called by `LessonStepClient` as it builds the IDE props.

This is the only architecturally subtle bit in PR-B. **Estimate 1.5h for this seam alone.** If it overruns, ship option (A) as a contingency — it doubles the IDE footprint but is mechanically simpler.

**Schema: `___ID___` marker grammar:**

Authors write `___ID___` in the `code` field where `ID` is UPPERCASE_SNAKE matching a `blanks[].id` (case-insensitive comparison). The build script (`scripts/build-content-v2.mjs`) validates:

1. Every `blanks[].id` (uppercased) appears at least once in `code`.
2. Every `___ID___` token in `code` has a matching `blanks[].id`.
3. If `code` contains zero markers but `blanks[]` is non-empty, fall back to legacy V3 prompt-rendering (the existing `splitOnBlanks` path stays in the codebase as a fallback for the ~5-10 keyword-only fill steps that have no `code`).

**Build-script addition (`scripts/build-content-v2.mjs:248` after Step.safeParse succeeds):**

```js
// AFTER successful Step.safeParse for type === "fill":
if (result.data.type === "fill" && result.data.code) {
  const code = result.data.code;
  const markerRe = /___([A-Z][A-Z0-9_]*)___/g;
  const found = new Set();
  let m;
  while ((m = markerRe.exec(code)) !== null) found.add(m[1].toUpperCase());

  const declared = new Set(result.data.blanks.map((b) => b.id.toUpperCase()));
  const missingInCode = [...declared].filter((id) => !found.has(id));
  const undeclared = [...found].filter((id) => !declared.has(id));

  if (found.size > 0) {
    if (missingInCode.length > 0) {
      throw new Error(
        `Fill step ${result.data.id}: blanks[].id [${missingInCode.join(", ")}] declared but no ___${missingInCode[0]}___ marker in code`,
      );
    }
    if (undeclared.length > 0) {
      throw new Error(
        `Fill step ${result.data.id}: ___${undeclared[0]}___ marker in code but no matching blanks[].id`,
      );
    }
  }
  // If found.size === 0, legacy mode — `splitOnBlanks(prompt)` still works.
}
```

**Migration script (`scripts/migrate-fill-steps-v45.mjs`):**

One-shot, idempotent. Reads each `*.fill.yaml`, finds bare `___` in `code`, replaces them with `___<BLANK_ID>___` based on positional order against `blanks[]`. Writes back. Skips files where `code` already contains `___[A-Z]+___` markers.

```js
// scripts/migrate-fill-steps-v45.mjs
import { readFile, writeFile } from "node:fs/promises";
import { glob } from "node:fs";
import YAML from "yaml";
import { promisify } from "node:util";
const globAsync = promisify(glob);

const files = await globAsync("content/python/**/*.fill.yaml");
let migrated = 0;
let skipped = 0;
for (const file of files) {
  const text = await readFile(file, "utf8");
  const doc = YAML.parse(text);
  if (!doc.code) { skipped++; continue; } // legacy keyword-only fill
  if (/___[A-Z][A-Z0-9_]*___/.test(doc.code)) { skipped++; continue; } // already migrated

  const bareMatches = [...doc.code.matchAll(/___/g)];
  if (bareMatches.length !== doc.blanks?.length) {
    console.error(`SKIP ${file}: ${bareMatches.length} bare ___ markers but ${doc.blanks?.length} blanks declared`);
    skipped++;
    continue;
  }

  let result = doc.code;
  // Replace right-to-left so positions don't shift mid-replace.
  for (let i = bareMatches.length - 1; i >= 0; i--) {
    const blank = doc.blanks[i];
    const id = blank.id.toUpperCase();
    const pos = bareMatches[i].index;
    result = result.slice(0, pos) + `___${id}___` + result.slice(pos + 3);
  }
  doc.code = result;
  await writeFile(file, YAML.stringify(doc, { lineWidth: 0 }));
  migrated++;
  console.log(`MIGRATED ${file}`);
}
console.log(`\n${migrated} migrated, ${skipped} skipped`);
```

Run the script ONCE in the PR commit; commit the resulting YAML diff as part of PR-B. Reverse migration is mechanical (replace `___<ID>___` → `___`) — keep the script in the repo so a future revert can be scripted via `--reverse` flag added in same PR.

**Theme additions (`lib/codemirror-theme.ts`):**

Add to `dojoEditorTheme` `EditorView.theme(...)` rule set:

```ts
".cm-blank-input": {
  display: "inline-block",
  padding: "1px 4px",
  margin: "0 1px",
  border: `1px solid ${ink700}`,
  borderRadius: "0",
  backgroundColor: ink900,
  color: green300,
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  lineHeight: "1",
  outline: "none",
},
".cm-blank-input:focus": {
  borderColor: green500,
  boxShadow: `0 0 0 1px ${green500}`,
},
'.cm-blank-input[data-state="correct"]': {
  borderColor: green500,
  color: ink200,
},
'.cm-blank-input[data-state="wrong"]': {
  borderColor: ink700,
  borderStyle: "dashed",
  color: ink300,
},
".cm-blank-input:read-only": {
  cursor: "default",
  opacity: "0.85",
},
```

(`green500`, `green300`, `ink700`, `ink900`, `ink200`, `ink300` are already declared at the top of the file — `lib/codemirror-theme.ts:20-29`.)

**Test checklist:**
- [ ] Existing `01-variables/02-types-on-sight/05-fill-the-cast.fill.yaml`: editor renders `port = ___CAST___(port_str) + 1` with an `<input>` widget at the marker. Type `int` → click Check → widget border turns ember green, value locks to readOnly.
- [ ] Multi-blank lesson (any in `11-classes-basics/`): both inputs render in source order; clicking one focuses, typing updates only that blank's value.
- [ ] Type a wrong answer → click Check → widget gets dashed `data-state="wrong"` border. Type a different value → state resets to neutral on input change.
- [ ] Press Enter inside any blank with all filled → submits (mirrors V3 `e.key === "Enter"` path at `FillBlankStepView.tsx:120-125`).
- [ ] CM doc-change elsewhere (e.g. another React state pulse re-renders parent) → focus + caret position survive in the focused blank's input. **This is the load-bearing test.**
- [ ] Legacy keyword-only fill step (no `code` field) — falls back to V3 `splitOnBlanks` path; still renders inputs in the prompt panel as before.
- [ ] `scripts/build-content-v2.mjs` errors helpfully when YAML has `___FOO___` but no `blanks[].id: FOO`.
- [ ] `pnpm build` green; `out/` exports the migrated content.

**Verification:**
- [ ] Migrate the 55 `*.fill.yaml` files with the script. Manual diff review on 5 randomly-sampled files before committing.
- [ ] Visit `/learn/v2/variables/types-on-sight/` (or wherever the cast step renders) and submit interactively.

**Risks:**
- The `extraExtensions` plumbing through `StepIDEBridge` (option B) is the architectural hot spot. If the bridge starts feeling like an N+1 pattern, fall back to option A and accept the second IDE instance for fill steps only.
- `RangeSetBuilder` requires decorations sorted by start position (we iterate via regex so order is guaranteed; documenting here so future contributors don't break it).
- `ignoreEvent()` returning `true` means CM skips ALL events on the widget DOM — clicks inside the input will not bubble to CM as cursor placement, which is what we want, but it also means CM's history/undo can't roll back the input typing. For V4.5 that's fine — input state is in React, not CM.
- The CEO-flagged trim path: if 10h runs over, drop **(a)** the `data-state` theme rules (ship neutral-only widgets — submit feedback shows in the prompt panel's inline message at `FillBlankStepView.tsx:155-173`), AND **(b)** any inter-blank navigation polish. These are 2h combined, recoverable in V5.

---

### PR-C — refresh-v4-5/C-pyodide-hairline

**Branch:** `refresh-v4-5/C-pyodide-hairline`
**Outcome:** "Booting Python…" replaces with a 1px ember hairline animating 0% → 100% across the editor top edge, lowercase honest copy, 15s timeout that surfaces a retry banner. Stops reading as broken on slow networks. (Spec lifted from `audit-v3/HEADOFIT-plan.md:648-820`.)
**Estimated time:** 8h
**Depends on:** main (PR-A and PR-B do not conflict — PR-C touches the worker + status copy + a top-edge hairline render, no overlap with stderr or extension array)

**Files to touch:**

| File | Change | LOC delta |
|---|---|---:|
| `public/pyodide-worker.js` | Add `progress` postMessage timer + 15s timeout race | +35 |
| `lib/use-pyodide.ts` | Extend `WorkerMsg` union with `progress` and `error`; expose `progress: number` and `error: string \| null` from the hook | +20 |
| `components/v2/PersistentIDE.tsx` | Render `<ProgressHairline value={progress} max={100}>` at the top edge of the run bar when `status !== 'ready'`; render retry banner on error | +30 |

**Worker-side timer (`public/pyodide-worker.js`):**

The V3 spec at `audit-v3/HEADOFIT-plan.md:665` correctly notes that real byte-streaming through Pyodide 0.28's `loadPyodide` is fragile; the **asymptotic timer** is the pragmatic answer the CEO endorsed. Spec verbatim:

```js
// public/pyodide-worker.js — additions at the top
const BOOT_BUDGET_MS = 8000; // p50 broadband; the curve fits this
const BOOT_TIMEOUT_MS = 15000;
let progressTimer = null;
let bootStartedAt = 0;

function startProgressTimer() {
  bootStartedAt = performance.now();
  progressTimer = setInterval(() => {
    const elapsed = performance.now() - bootStartedAt;
    // Asymptotic curve: rises fast, slows near 95%. Never reaches 100% from
    // the timer alone — the actual ready event sets 100%.
    const pct = Math.min(95, Math.round((1 - Math.exp(-elapsed / BOOT_BUDGET_MS)) * 100));
    self.postMessage({ type: "progress", payload: pct });
  }, 100);
}

function stopProgressTimer(final = 100) {
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = null;
  self.postMessage({ type: "progress", payload: final });
}
```

Wrap the existing `ensurePyodide` body (`public/pyodide-worker.js:16-57`) in a 15s timeout race:

**BEFORE (`public/pyodide-worker.js:29-56`):**
```js
loading = (async () => {
  self.postMessage({ type: "status", payload: "loading" });
  pyodide = await self.loadPyodide({ indexURL: "/pyodide/" });
  pyodide.runPython(`...harness...`);
  self.postMessage({ type: "status", payload: "ready" });
  return pyodide;
})();
```

**AFTER:**
```js
loading = (async () => {
  self.postMessage({ type: "status", payload: "loading" });
  startProgressTimer();
  try {
    pyodide = await Promise.race([
      self.loadPyodide({ indexURL: "/pyodide/" }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("pyodide-boot-timeout")), BOOT_TIMEOUT_MS),
      ),
    ]);
    pyodide.runPython(`...harness unchanged...`);
    stopProgressTimer(100);
    self.postMessage({ type: "status", payload: "ready" });
    return pyodide;
  } catch (err) {
    stopProgressTimer(0);
    self.postMessage({
      type: "error",
      payload: err.message === "pyodide-boot-timeout"
        ? "boot-timeout"
        : "boot-failed",
    });
    loading = null; // allow retry
    throw err;
  }
})();
```

Add a retry handler (extends the existing `addEventListener("message", ...)` block at `public/pyodide-worker.js:75-91`):

```js
} else if (type === "retry") {
  // Allow a fresh ensurePyodide attempt
  pyodide = null;
  loading = null;
  await ensurePyodide();
  self.postMessage({ type: "result", id, payload: { ok: true } });
}
```

**Hook extension (`lib/use-pyodide.ts`):**

**BEFORE (`lib/use-pyodide.ts:10-13`):**
```ts
type WorkerMsg =
  | { type: "status"; payload: "loading" | "ready" }
  | { type: "result"; id: number; payload: RunResult };
```

**AFTER:**
```ts
type WorkerMsg =
  | { type: "status"; payload: "loading" | "ready" }
  | { type: "result"; id: number; payload: RunResult }
  | { type: "progress"; payload: number }
  | { type: "error"; payload: "boot-timeout" | "boot-failed" };
```

Add state:
```ts
const [progress, setProgress] = useState(0);
const [error, setError] = useState<null | "boot-timeout" | "boot-failed">(null);
```

In `onMsg`:
```ts
} else if (msg.type === "progress") {
  setProgress(msg.payload);
} else if (msg.type === "error") {
  setError(msg.payload);
  setStatus("idle");
}
```

Add a `retry()` callback and expose `{ status, run, progress, error, retry }` from the hook.

**IDE wire-up (`components/v2/PersistentIDE.tsx`):**

The `STATUS_COPY` is already lowercase from V3 PR 9 (verified `PersistentIDE.tsx:86-90`). No copy change needed.

**Add hairline + retry banner.** Render `<ProgressHairline>` (already shipped at `components/v2/ProgressHairline.tsx`) above the run bar — between the editor body and the run bar at `PersistentIDE.tsx:281`:

```tsx
{!ready && !error && (
  <ProgressHairline
    value={progress}
    max={100}
    height="xs"
    className="border-t border-ink-800"
  />
)}
{error && (
  <div className="border-t border-err bg-ink-900 px-3 py-2 text-xs text-ink-300">
    <span className="text-err">⚠</span>{" "}
    {error === "boot-timeout"
      ? "python failed to load (15s)."
      : "python failed to load."}
    <button
      type="button"
      onClick={retry}
      className="ml-2 text-green-400 underline-offset-2 hover:underline"
    >
      retry
    </button>
  </div>
)}
```

`{ ready, progress, error, retry }` come from `usePyodide()` (`PersistentIDE.tsx:105`).

**Test checklist (lifted from `audit-v3/HEADOFIT-plan.md:809-820`):**
- [ ] hard refresh `/learn/v2/variables/...` → status reads "booting python…" then "loading wasm…"; hairline animates 0→95% asymptotically, snaps to 100% on ready
- [ ] simulate slow network (DevTools throttle "Slow 3G") → hairline keeps moving, never appears stuck
- [ ] block `pyodide.asm.wasm` request in DevTools → after 15s, retry banner appears with the "retry" button. Click retry → banner clears, hairline restarts.
- [ ] `prefers-reduced-motion: reduce` → `ProgressHairline`'s existing `motion-reduce:transition-none` rule (`ProgressHairline.tsx:51`) handles it; no extra work needed
- [ ] On a warm cache (second visit), `progress` snaps to 100 quickly — verify the "loading" state still flickers visibly, or skip rendering hairline if `status` flips to ready within 50ms
- [ ] `pnpm build` green
- [ ] No regression in run-button queueing (`PersistentIDE.tsx:160-162` comment) — clicks during boot still queue

**Verification:**
- [ ] Smoke on `/learn/v2/variables/naming-things/0/` after `pnpm build && pnpx serve out/`
- [ ] Verify `progress: 95` is the timer ceiling — no `progress: 100` from the timer alone (ready event must be the 100% trigger)

**Risks:**
- Pyodide 0.28.3 may emit its own `console.log` boot lines that the worker doesn't filter — these appear in DevTools console as informational noise, not user-facing.
- The existing run-button "queues during loading" UX (`PersistentIDE.tsx:160-162`) remains untouched. With the timeout-error path, a user who clicks Run during a boot that ultimately errors will see an unresolved promise. Acceptable for V4.5; the retry button is the recovery path. Note in CHANGELOG.
- The `--err` color in the retry banner is the existing `text-err` token; verify contrast on Cloudflare staging.

---

## Stage 2 — follow-up sprint (~26h)

Two PRs: **PR-D (Step-through playback, 16h) → PR-E (Visualize panel, 10h).** Strict sequence — Visualize consumes the playback frames buffer (`08-interactive-features-feasibility.md:179` *one run, one buffer, two views*).

Stage 2 is its own sprint because:
- It introduces the only worker-protocol change in V4.5 (`trace: true` flag + frames payload).
- It adds the only schema fields (`playback`, `playbackFocus`, `visualize`) — needs author opt-in lessons that don't exist yet.
- Worker-side `sys.settrace` overhead is the schedule-risk feature in the audit (`08-interactive-features-feasibility.md:18-19`); it deserves a clean sprint.

### PR-D — refresh-v4-5/D-step-through-playback

**Branch:** `refresh-v4-5/D-step-through-playback`
**Outcome:** When a `read`/`predict`/`mc` step has `playback: true`, running the code emits a `frames[]` payload. A `<PlaybackStrip>` below the IDE renders numbered pills; ←/→ keys + click jump frames. CodeMirror highlights the active frame's source line via an ember left-rail decoration. (Spec verbatim from `audit-v4/08-interactive-features-feasibility.md:26-166`.)
**Estimated time:** 16h
**Depends on:** Stage 1 merged

**Files to touch (high-level):**

| File | Change |
|---|---|
| `public/pyodide-worker.js` | Add `__ck_run_traced(code)` Python harness with `sys.settrace` + serializer; extend message protocol with `trace: bool` flag; serialize per-frame `f_locals` with the filter rules from `08-interactive-features-feasibility.md:48-66` |
| `lib/use-pyodide.ts` | New `runWithTrace(code)`; extend `RunResult` with `frames?: RunFrame[]` and `framesTruncated?: boolean` per `08-interactive-features-feasibility.md:74-101` |
| `lib/content/schema.ts` | Add `playback: z.boolean().default(false)` and `playbackFocus: z.array(z.string()).optional()` to `StepBaseFields` (`schema.ts:113-127`); only meaningful on `read`/`predict`/`mc` (validated in build script) |
| `scripts/build-content-v2.mjs` | Validate `playback: true` only on `read`/`predict`/`mc`; build-error on `write`/`fix`/`checkpoint`/`reorder` (`08-interactive-features-feasibility.md:138`); regex-warn `\binput\s*\(` on `playback: true` steps |
| `components/v2/PlaybackStrip.tsx` | NEW — numbered pills, ←/→ keyboard, click-to-jump, ember active-frame ring |
| `components/v2/PersistentIDE.tsx` | Render `<PlaybackStrip>` between editor and run bar when frames are available; ember left-rail decoration on the active frame's line |
| `components/v2/LessonStepClient.tsx` | When `step.type ∈ {read, predict, mc}` and `step.playback === true`, call `runWithTrace` instead of `run` |
| `content/python/01-variables/...` (~2-4 dogfood lessons) | Set `playback: true` on `01-variables/01-naming-things` read steps + `mutation-and-state` predict step |

**Risks (lifted from `08-interactive-features-feasibility.md:446-458`):**

1. Trace overhead 5x slowdown on traced loops — surface dual timing `ran in 67ms · traced in 312ms` to keep the UI honest.
2. `f_locals` semantics in nested functions — known CPython quirk; document, don't fix in V4.5.
3. Generators/file handles render as opaque labels — fine for V4.5, polish in V5.
4. `to_js` recursion on cyclic data — track `id()` set in serializer, emit `<cyclic>` on second visit.
5. Memory cap at 500 frames; `framesTruncated: true` surfaces a "playback truncated — too long to step through" banner. Loops > 500 iterations explicitly out of scope (no chapter opts in if it would).

**Lesson opt-in for V4.5 launch (per `08-interactive-features-feasibility.md:481`):** dogfood 4-6 steps in 2 chapters — `variables` (3 read) + `mutation-and-state` (2 read + 1 predict). Hold back broader expansion to V5 once analytics proves utility.

**Test checklist (high-level):**
- [ ] Traced run on a 30-line program emits ~30 frames (filtered to user-frames per `:42`)
- [ ] Infinite-loop test → 500-frame cap fires; `framesTruncated: true`; UI shows truncation banner; stderr surfaces `RuntimeError("playback aborted: > 500 steps")`
- [ ] Non-traced steps unaffected — no `frames` on `RunResult`
- [ ] CodeMirror line decoration shows ember left-rail on the active frame's line; updates on frame navigation
- [ ] ←/→ keys advance frames; only when focus is on `<PlaybackStrip>` (don't conflict with `⌘↵` run keymap at `PersistentIDE.tsx:182-187`)
- [ ] Schema validation: setting `playback: true` on a `write` step → build errors with the message from `:138`

---

### PR-E — refresh-v4-5/E-visualize-panel

**Branch:** `refresh-v4-5/E-visualize-panel`
**Outcome:** A pure-React+CSS panel renders variable bindings (lists, dicts, sets, scalars, instances) sourced from `frames[currentFrame].locals`. Diff animations (CSS only, ≤200ms). Identity aliasing for the mutable-default-arg lesson. (Spec verbatim from `audit-v4/08-interactive-features-feasibility.md:170-289`.)
**Estimated time:** 10h
**Depends on:** PR-D merged (frames buffer)

**Files to touch (high-level):**

| File | Change |
|---|---|
| `components/v2/VisualizePanel.tsx` | NEW — kind-discriminated render (scalar/list/tuple/dict/set/instance/opaque) |
| `lib/content/schema.ts` | Add `visualize: z.object({ bindings, kindHints }).optional()` to `StepBaseFields` per `08-interactive-features-feasibility.md:188-196` |
| `public/pyodide-worker.js` | Add `id` field to non-scalar serialized values (per `:240-247`) for identity aliasing |
| `components/v2/PersistentIDE.tsx` | Mount `<VisualizePanel>` next to or replacing stdout when `step.visualize` or `step.playback` is set |
| `content/python/.../mutation-and-state/02-mutation-bites.read.yaml` | Set `visualize: { bindings: ["dog_owner", "cat_owner"] }` on the wedge-narrative step |

**Identity-aliasing display:** when two bindings share the same `id` (Python `id()`), the panel renders them with a shared border color (deterministic hash → palette hue, ember/ok-green/desaturated-third). Caption above: *"cache and history reference the same list."* This is the wedge story for the `mutable-default-arg` lesson — `08-interactive-features-feasibility.md:251-263`.

**Lesson opt-in for V4.5 launch:** `variables/01-naming` (scalars), `lists-and-dicts/01-list-basics` (list mutation), `mutation-and-state/02-mutation-bites` (the alias diagram). 3 lessons — `08-interactive-features-feasibility.md:493-494`.

**Risks:**
- Class instance rendering is half-baked in V4.5 (`08-interactive-features-feasibility.md:452`). Ship scalar/list/tuple/dict/set as headline kinds; instances as opaque pills with `<ClassName>` label. Defer instance polish to V5 (this is `08-interactive-features-feasibility.md` §Risk 3 — already accepted by audit).
- `playbackFocus` schema field cuttable per `:461-462` — auto-detect heuristic (top-3 most-changed vars, `:198`) is fine for V4.5.
- Diff animations cancel naturally on rapid frame-strip clicks (CSS state resets per render — `:267`); no debounce needed.

**Test checklist (high-level):**
- [ ] Open `mutation-and-state/02-mutation-bites` → run code → playback strip + visualize panel both render → both `dog_owner` and `cat_owner` rendered with the same border hue and the alias caption
- [ ] Author-declared `visualize.bindings` → only those vars render
- [ ] Author-declared binding for a not-yet-defined var → hairline placeholder with `name (not yet defined)` caption
- [ ] Auto-detect (no `visualize` declared, `playback: true`) → top-3 most-mutated vars surface
- [ ] `prefers-reduced-motion: reduce` → cells appear instantly (Tailwind's `motion-reduce:` modifier handles)
- [ ] List > 50 items → renders 50 + `+N more` chip per the cap rules at `:120-124`

---

## Cross-cutting concerns

### New deps schedule

**Zero new packages across all 5 PRs.** Every CodeMirror sub-module the spec references is already in `package.json:16-21`:

| PR | Imports added | From |
|---|---|---|
| PR-A | `parseTraceback` (first-party) | local |
| PR-B | `WidgetType`, `Decoration`, `RangeSetBuilder` | `@codemirror/view@^6.41.1` (installed) |
| PR-B | `StateField`, `StateEffect` | `@codemirror/state@^6.6.0` (installed) |
| PR-C | `ProgressHairline` (first-party) | already shipped V2 |
| PR-D | `EditorView.decorations`, `Decoration.line` | `@codemirror/view` (installed) |
| PR-E | none new | — |

If a `pnpm install` is needed in any PR, it shouldn't be — flag immediately.

### Schema additions

Stage 1 PR-B: **none.** Build-script validator only; the existing `FillBlankStep` schema (`schema.ts:164-179`) is unchanged.

Stage 2 PR-D adds to `StepBaseFields` (`schema.ts:113-127`):
```ts
playback: z.boolean().default(false),
playbackFocus: z.array(z.string()).optional(),
```

Stage 2 PR-E adds to `StepBaseFields`:
```ts
visualize: z
  .object({
    bindings: z.array(z.string()).default([]),
    kindHints: z.record(z.string(), z.enum(["list", "dict", "set", "tuple", "var"])).optional(),
  })
  .optional(),
```

Both are additive, default-safe, backward-compatible with all existing 488-624 step content.

### Worker protocol changes

Stage 1 PR-C extends `WorkerMsg` with `progress` and `error` (additive — no breaking change to existing `status`/`result`).

Stage 2 PR-D extends:
- Inbound: `{ type: "run", id, code, trace?: boolean }` (default false — non-traced runs unaffected)
- Outbound `result.payload`: `RunResult` gains optional `frames?: RunFrame[]` + `framesTruncated?: boolean`

Both shape additions are optional; the existing `RunResult` consumers don't break.

### Tailwind 4 @theme additions

Stage 1 PR-B adds `.cm-blank-input` rules to `lib/codemirror-theme.ts`'s `dojoEditorTheme` block — these are CodeMirror theme rules, not Tailwind classes, so no `app/globals.css` change needed.

Stage 1 PR-C adds none — `<ProgressHairline>` already has `bg-green-500` + `bg-ink-800` Tailwind classes (`ProgressHairline.tsx:45-52`).

Stage 2 PR-E may add ember/ok-green border-color CSS variables for identity aliasing. The third desaturated accent for 3-way alias case isn't in the brand palette — pull from the audit ink-300 + 30% saturation, document in `lib/codemirror-theme.ts` since it's CM-adjacent.

### Build-time data freezing

PR-B's migration script (`scripts/migrate-fill-steps-v45.mjs`) runs ONCE at PR commit time, not in CI. After migration, `scripts/build-content-v2.mjs`'s validator catches drift on every prebuild.

PR-D's build-script validator catches `playback: true` set on disallowed step types at prebuild.

No runtime data fetching changes — the static export model (`output: "export"`) is preserved.

---

## Lesson opt-in matrix

Which existing chapters benefit MOST from each feature.

### Step-through playback (Stage 2 / PR-D)

Chapters where execution order is the lesson — per `08-interactive-features-feasibility.md:466-481`:

| Chapter | Why playback helps | Recommended dogfood |
|---|---|---|
| `01-variables` | Watch `name` change as you reassign | YES — launch lessons (3 read) |
| `mutation-and-state` | Aliasing semantics are invisible without it; this is THE wedge | YES — 2 read + 1 predict |
| `loops` | `i` increment, accumulator growth | hold for V5 expansion |
| `lists-and-dicts` | `.append`, `.pop`, `dict[k] = v` mutate live | hold |
| `error-handling` | try/except/finally exception propagation | hold |
| `02-functions` | Frame-call semantics, scope highlighting | hold |
| `11-classes-basics` | `self.x = ...` mutating instance | hold (instance render is half-baked — Risk 3) |
| `tracebacks` (if it exists; check chapter list) | Step into the failing call | hold |

**V4.5 launch: 4-6 steps across 2 chapters.** Expand on the back half of the quarter.

### Visualize panel (Stage 2 / PR-E)

Chapters where data shape is the lesson — per `08-interactive-features-feasibility.md:485-493`:

| Chapter | Why visualize helps | Recommended dogfood |
|---|---|---|
| `01-variables` | First learners see scalar = name = value boxes | YES — `01-naming-things` |
| `lists-and-dicts` | The whole reason this feature exists | YES — `01-list-basics` |
| `mutation-and-state` | Reference-vs-value diagram; identity aliasing | YES — `02-mutation-bites` (the wedge) |
| `11-classes-basics` | Instance-as-record (limited in V4.5) | hold |
| `structured-output` | Dict-shape reasoning for LLM JSON | hold |

**V4.5 launch: 3 lessons across 3 chapters.**

### Inline fill-blank widgets (Stage 1 / PR-B)

Every fill step (no opt-in matrix — render upgrade for an existing step type). Migration sweep covers all 55 `*.fill.yaml` files. ~5-10 keyword-only fill lessons (no `code` field) fall back to V3 prompt-rendering — counted at migration time.

### TracebackView (Stage 1 / PR-A) and Pyodide hairline (Stage 1 / PR-C)

No opt-in — they affect every lesson with stderr / every cold start, respectively. Universal upgrades.

---

## Rollback playbook

Each PR is independently revert-able. In order of likelihood-of-needing-revert:

| PR | Revert action | Side effects |
|---|---|---|
| PR-A TracebackView | `git revert <sha>` | stderr returns to raw `<pre>` (current V4 state). No data, no schema. |
| PR-B fill-blank widgets | `git revert <sha>` + run `node scripts/migrate-fill-steps-v45.mjs --reverse` (build the reverse path into the script before merge) | 55 YAMLs revert to bare `___` in `code` fields; legacy `splitOnBlanks` path resumes. **Smoke-test 3 fill lessons after revert** — the fallback path is V3 code that's been in the repo for months, but revert hygiene matters. |
| PR-C Pyodide hairline | `git revert <sha>` | Status copy + spinner return; no progress bar; boot still completes the same way. |
| PR-D playback | `git revert <sha>` before any production opt-in lessons set `playback: true` | If reverted post-opt-in, the dogfood lessons' `playback: true` flag becomes a noop (default schema accepts it). Clean revert if done before content opt-in commit. |
| PR-E visualize | `git revert <sha>` before any production opt-in lessons set `visualize: ...` | Same pattern — schema field becomes inert, no runtime crash. |

**Stage gating:** do NOT merge Stage 2's content opt-in (the `playback: true` + `visualize: ...` updates to lesson YAMLs) until 24h after PR-D + PR-E ship clean on production. Content commits are reversible but they trip Plausible analytics on actual learner exposure.

---

## Risks I flagged but the founder accepted

The founder's directive (*"That's the interactive-features sprint that takes the IDE to 9.9/10"*) accepts the following risks I'd otherwise flag harder:

1. **52h is 2x a single sprint.** Founder authorized the staging implicitly by listing all 5 features. I'm splitting into Stage 1 (~26h) + Stage 2 (~26h). If the founder pushes back and wants Stage 1 only with Stage 2 deferred, the rollback is clean — Stage 1 ships three felt-improvements without committing to the worker rewrite.
2. **Pyodide hairline is "fake progress" via asymptotic timer.** The CEO already accepted this in V3 spec (`audit-v3/HEADOFIT-plan.md:665`) and CEO V4 acknowledged the user-felt outcome is identical. I'm not pursuing real byte-streaming.
3. **Fill-blank theme states + inter-blank navigation polish are cuttable.** Per CEO V4's explicit trim directive (`audit-v4/CEO-vision.md:104`). If the 10h overruns, ship without `data-state` colors and without inter-blank Tab navigation — the widget itself is the moat win.
4. **Playback overhead on Chromebooks.** 5x slowdown on traced loops is documented (`08-interactive-features-feasibility.md:447-448`); dual-timing badge ("ran in 67ms · traced in 312ms") absorbs the optic. Founder's 9.9/10 bar is for "the IDE feels alive," not "the IDE runs at native CPython speed."
5. **Class instance rendering is half-baked in V4.5.** Headline kinds ship; instances opaque-labeled. Polish to V5 (`08-interactive-features-feasibility.md:452`).
6. **No new mobile gate work.** V4 PR 3 already shipped the honest "ship on desktop" gate (`SENIOR-DEV-worklog.md:9`). Step-through playback on mobile is undefined for V4.5; the desktop gate covers it.

---

## Dependencies between PRs

The build order is not optional.

```
main (V4 PR 10 squashed)
   │
   ├─→ PR-A TracebackView ────────┐ (Stage 1)
   │                              │
   ├─→ PR-B fill-blank widgets ───┤ (depends on PR-A merged — extension array hot spot)
   │                              │
   └─→ PR-C Pyodide hairline ─────┴─→ Stage 1 done
                                       │
                                       ↓
                              PR-D step-through playback (Stage 2 — depends on Stage 1)
                                       │
                                       ↓ (frames buffer wire-up stable)
                              PR-E visualize panel (depends on PR-D)
                                       │
                                       ↓
                              Content opt-in (24h after PR-E green on prod)
```

**Hard ordering rules:**

- **PR-B requires PR-A merged.** Both touch `PersistentIDE.tsx` extension array region; PR-A's `editorViewRef` capture should land first to avoid merge churn.
- **PR-C is independent of PR-A and PR-B** but ships last in Stage 1 because the worker boot path is the most volatile change. Roll-back asymmetry argues for shipping it last.
- **PR-D requires Stage 1 fully merged.** It extends the same `WorkerMsg` union PR-C touched and the same `extensions` array PR-A and PR-B touched.
- **PR-E requires PR-D merged.** Strict — the frames buffer must exist as deployed code before Visualize consumes it.
- **Content opt-in is the very last step.** No `playback: true` or `visualize: ...` flag in any committed YAML until PR-D + PR-E are both green on production for 24h.

**Soft ordering (preferred but recoverable):**

- PR-A TracebackView before PR-B fill-blank because PR-A's live-region scoping change (`PersistentIDE.tsx:341-344`) is small and isolated; if PR-B lands first, PR-A's diff grows because PR-B's `extraExtensions` plumbing creates merge surface in the same useMemo.

---

## Open questions for the CEO

None. The founder's directive ("schedule V4.5 — PR 11 + step-through playback + Visualize panel + TracebackView + Pyodide hairline") is unambiguous; the audit specs are complete; deps are pre-installed. The staging decision (Stage 1 ships 3, Stage 2 ships 2) is mine to own under the founder's authorization. If the founder prefers a strict 25h cap with one sprint and a hard cut, the cut path is: ship Stage 1 (PR-A + PR-B + PR-C) and defer Stage 2 entirely to V4.6. Both paths land the IDE at 9.6 → 9.8/10 minimum; the 9.9/10 bar requires Stage 2.

— end —
