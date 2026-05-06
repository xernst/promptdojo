# IDE Deep Audit — Josh-named priority area

> The IDE is where 80% of a learner's time lives. The founder named it as one of three "30% of what it could be" surfaces. This audit treats the in-browser editor + run loop as a first-class product with its own pristine bar (Replit / CodeSandbox / Codespaces), not as Codecademy-tier filler.

**TL;DR — the dojo IDE today is roughly Codecademy-1998 plus better Python execution.** It has CodeMirror 6 + Pyodide-in-a-Worker (real receipts), self-hosted runtime (real engineering), persistent-across-steps state (real moat). It is missing the basic affordances every modern in-browser editor has shipped for five years: brand-matching theme, autocomplete, lint squiggles, traceback formatting, "reset" / "show solution" / "format" buttons in the editor chrome, run history, mobile-aware layout, and a Pyodide cold-start that doesn't read as broken. **The receipts are there. The chrome around them isn't.**

---

## Current IDE inventory

### What `PersistentIDE.tsx` actually does today

- **Editor:** `CodeMirror 6` via `@uiw/react-codemirror@4.25.9` (`PersistentIDE.tsx:3`).
- **Theme:** `oneDark` from `@codemirror/theme-one-dark` (`PersistentIDE.tsx:5,255`). **This is Atom's brand, not the dojo's.** A `lib/codemirror-theme.ts` was specced in V1 (`design-kit/audit/06-ux-architecture.md:170`) and `app/globals.css:115` even references the file in a comment — but the file does not exist on disk. The V1 CEO-vision picked it as P5 (`design-kit/audit/CEO-vision.md:78-81`), it never shipped.
- **Language:** `python()` from `@codemirror/lang-python` (`PersistentIDE.tsx:4,209`).
- **Tabs:** Multi-file tabs rendered as `role="tablist"` over `IDEFile[]` (`PersistentIDE.tsx:223-248`). Lock icon on read-only files. Active tab gets a green underline.
- **Read-only mode:** `EditorView.editable.of(false)` extension when `file.readOnly` (`PersistentIDE.tsx:211-214`) plus `readOnly={file.readOnly}` on the CodeMirror prop (`PersistentIDE.tsx:258`).
- **basicSetup** explicitly sets `lineNumbers: true, highlightActiveLine: !readOnly, foldGutter: false, tabSize: 4` (`PersistentIDE.tsx:259-264`). Everything else (history depth, bracket matching, autocomplete, lint, search, multi-cursor) is whatever `@uiw/react-codemirror`'s defaults provide — i.e., "history yes, search yes (Ctrl-F), autocomplete from text in document, no Python-aware completion, no linting."
- **Run button:** Single button at `PersistentIDE.tsx:286-311`. Green CTA, ⌘↵ keyboard shortcut wired at `:178-188`. Disabled only while a run is in flight; clicks during Pyodide load are queued (intentional, see `PersistentIDE.tsx:90-95` rationale).
- **Run loop:** `usePyodide()` hook (`lib/use-pyodide.ts:1-66`) → singleton `Worker("/pyodide-worker.js")`. Worker calls `loadPyodide({ indexURL: "/pyodide/" })` (`public/pyodide-worker.js:11,32`). User code wrapped in `__ck_run` Python harness that captures stdout/stderr via `io.StringIO` and `traceback.print_exc()` (`pyodide-worker.js:34-52`).
- **Output panel:** Fixed `h-44` (~176px) panel below the editor (`PersistentIDE.tsx:315`). Has a header strip with terminal icon + "Output" label + run-duration badge ("✗ ran in 234ms" or "✓ ran in 234ms" at `:321-322`). Body renders `<pre>` for stdout (ink-200) and `<pre>` for stderr (`text-err`/red).
- **Empty / idle states:** Pre-run shows `[promptdojo:~]$ _` with `cursor-blink` 1Hz heartbeat (`:339-341`). Empty-but-ran shows `✓ Ran with no output. Add a print(…) to see something` (`:346-352`). Running shows italic "Running your code…" (`:343-345`).
- **State persistence:** `drafts: Record<string, string>` keyed by file name (`:104-106`). When `stepId` changes, the effect at `:120-138` carries forward edits for files whose name matches AND aren't read-only — this is the "persistent IDE" moat. Output panel is reset on each step.
- **Imperative API:** `useImperativeHandle` exposes `run / getActiveCode / getFile / reset` to parent (`:190-204`). Step views call `ide.run()` and `ide.getActiveCode()` via the `StepIDEBridge` (`StepRouter.tsx:26-31`).
- **Preloading:** `PyodidePreloader.tsx` mounts on `/` and `/onboarding`, fires `init` to a throwaway Worker via `requestIdleCallback` to warm the WASM module cache (`PyodidePreloader.tsx:1-48`). Real, working, never written about in marketing copy.
- **Status badge:** Tiny "Booting Python (one-time, ~5s)…" / "press Run or use ⌘↵" copy in run bar (`:273-284`). No progress bar, no skeleton, no "this only happens once" reassurance.
- **Output `aria-live="polite"`** at `:335` — minimum bar accessibility, will be read by screen readers.

### What feeds the IDE per step type (`buildFilesForStep` at `LessonStepClient.tsx:241-321`)

| Step type | What's in the editor | Read-only? | Runnable? |
| --- | --- | --- | --- |
| `read` | `step.code ?? ""` | yes | yes if `step.runnable !== false` and code exists (`:332`) |
| `mc` | `step.code ?? ""` | yes | same as `read` |
| `predict` | `step.code` | yes | always |
| `fix` | `step.brokenCode` | **no** | always |
| `write` | `step.starter` | **no** | always |
| `checkpoint` | `step.starter` | **no** | always |
| `fill` | `step.code` (or extracted from prompt) | yes | **no** — blanks live in the prompt panel |
| `reorder` | `fragments.map(f.code).join("\n")` | yes | no |

**Both `fill` and `reorder` parade content through the IDE that the user can never interact with.** This is a known v1 finding (`audit/02-ux-research.md:173`): "Make `fill` blanks render inside the IDE — implementation puts blanks in the prompt panel. The persistent-IDE moat breaks here."

---

## Pristine-bar gaps by category

### 1) Editor capabilities

| Gap | Severity | Concrete fix |
| --- | --- | --- |
| **No Python-aware autocomplete.** No `completionKeymap`, no `pythonLanguage.data.of(autocompletion)`, no Pyodide-introspection-backed completer. CodeMirror falls back to text-prefix completion from the buffer — useless for stdlib calls, useless for `__main__`-scoped names. | **CRITICAL** | Add `@codemirror/autocomplete`. Wire `python().language.data.of(...)` with a static dictionary of Python builtins + the dojo curriculum's first 200 names (`print, len, range, input, int, str, float, list, dict, set, tuple, def, return, for, while, if, elif, else, try, except, finally, raise, yield, lambda, import, from, as, with, in, is, not, and, or, None, True, False`). Phase 2: ship a Pyodide-introspection completer that returns `dir(__main__)` after each successful run. |
| **No lint squiggles.** A user with `print(hello)` (forgot to quote) sees no inline indicator until they Run. Replit shows red squiggle live. | **MAJOR** | Add `@codemirror/lint`. Pyodide-side: ship a tiny lint pass that calls `compile(source, '<editor>', 'exec')` and surfaces `SyntaxError.lineno/offset/msg` as diagnostics. Debounce 400ms after last keystroke. ~30 lines of worker code, zero new wasm dependencies. |
| **No bracket-matching highlight or pair completion.** `(`, `[`, `{`, `"`, `'` don't auto-close. Beginners type `print("hello"` and confusion follows. | **MAJOR** | Add `@codemirror/language` `bracketMatching()` + `closeBrackets()` extensions. Free, opt-in, ~20kb gzipped. |
| **No indent guides.** `for x in range(3):` followed by 4-space indent has no visual rail. Disorienting in nested blocks. | **MINOR** | `indentationMarkers()` from `@replit/codemirror-indentation-markers` OR roll a tiny `EditorView.theme` rule with `::before` pseudo-element on `.cm-line` indented lines. |
| **No "active line" highlight on read-only files.** Code is `highlightActiveLine: !readOnly` (`:262`). Read steps are 80% of step count; the editor visually flatlines. | **MINOR** | Always-on. Reading is an active state. |
| **Tab key doesn't insert spaces.** Default CodeMirror `Tab` moves focus out of the editor (accessibility default). For Python, where indentation is syntax, this is brutal. | **MAJOR** | Add `keymap.of([indentWithTab])` from `@codemirror/commands`. Document `Esc` as the "let me out" escape. |
| **No find-in-editor UX.** `Ctrl-F` works (CodeMirror default), but it's hidden. No header button, no `⌘F` hint anywhere. | **MINOR** | Add a tiny `Search` icon in the editor tab bar that triggers `openSearchPanel(view)`. |
| **Selection styling is one-dark default.** `--ember` never appears on selected text. The brand's only chromatic accent is absent from the most-used surface. | **MAJOR** | Custom theme: `selectionBackground: rgba(42,160,106,0.25)` (ember at 25%). |
| **Cursor color is not ember.** It's whatever `oneDark` ships. Brand heartbeat is a green ember at 1Hz; the editor cursor itself is gray. | **MAJOR** | `caretColor: var(--color-green-500)` and `cursorBlinkRate: 1000` (1Hz, matches the brand). |
| **No multi-cursor.** Default keymap supports it (`Alt-Click`) but discoverability is zero. | Defer | Don't surface — beginners shouldn't see this. Power users find it. |
| **Read-only sections within an editable buffer are impossible.** `fix` step makes the entire file editable. There's no way to mark "lines 3-5 are the function under test, you can only change line 7." | **MAJOR** | `EditorState.changeFilter.of(...)` per spec. Add a content-schema field `editableRanges: [{from, to}]` and translate at IDE boundary. Replit's classic "fix-the-bug" affordance. |
| **No format-on-save / format button.** `black` won't run in the browser. `ruff` is now WASM-compatible (Astral ships `ruff-wasm`). | Defer (V2) | Worth tracking but not P0. Beginners don't care; intermediates do. |

### 2) Run loop

| Gap | Severity | Concrete fix |
| --- | --- | --- |
| **No traceback formatting.** Stderr is dumped raw into a `<pre className="text-err">` (`:355-356`). A `KeyError: 'name'` on line 7 of a 12-line script renders as a wall of pink text with no file:line jump, no folded "stack trace" detail, no syntax-colored frame. | **CRITICAL** | Parse Python tracebacks client-side. The structure is fixed: `File "<exec>", line N, in <module>` lines + `^` carets + final `ExceptionType: message`. Render as a structured component: collapse internal Pyodide frames, syntax-highlight code in frame snippets, link "line N" to scroll the editor to that line. ~80 lines of TS + 30 lines of CSS. **This is the single biggest "the IDE feels alive" win in the report.** |
| **No "click line N to jump there"** when a traceback says `line 7`. | **MAJOR** | Wire the linked frame to `EditorView.dispatch({ effects: EditorView.scrollIntoView(line(7).from) })`. |
| **No run history.** Output is wiped on each Run. A learner who runs three times can't compare. | **MAJOR** | Keep last 5 runs in a ring buffer in component state. Render as collapsible history strip above the current output. ~40 lines. |
| **No ANSI color in output.** If a Python program prints `\033[31mboom\033[0m`, it renders as literal escape codes. Modern courses (Boot.dev, Replit) parse ANSI. | **MINOR** | Pull `ansi-to-html` (4kb) or write a 30-line regex-based parser. Most lessons won't need it; the ones that do (custom `print` styling, terminal-coloring tutorial) become possible. |
| **Pyodide cold-start has no progress.** `STATUS_COPY[loading] = "Booting Python (one-time, ~5s)…"` (`:84`). On a slow connection 12MB takes 30+ seconds. The user sees an unchanging string and concludes the page is broken. | **CRITICAL** | Stream the WASM fetch with `fetch().then(response.body.getReader())` and report bytes-loaded percentage to the worker via `postMessage`. Render a 1px hairline progress bar across the IDE top edge. Keeps the brand's hairline motif (`ProgressHairline.tsx`). |
| **"Booting Python (one-time, ~5s)…" lies.** It's only "one-time" within a session. Hard refresh and you pay it again. | **MAJOR** | Keep the copy honest: `loading wasm · ${pct}%` once we have a percentage. Drop the "(one-time)" claim. |
| **No abort / stop button.** A learner with `while True: pass` has no recourse short of closing the tab. The CEO-vision V1 explicitly cut this (`audit/CEO-vision.md:102`); for V3 it's table stakes. | **MAJOR** | Run the user's Python in a Pyodide thread with `interruptBuffer` (Pyodide ≥ 0.23 supports `setInterruptBuffer` for Ctrl-C-style). Show a "stop" button that `Atomics.store(buf, 0, 2)` — Pyodide will raise `KeyboardInterrupt` at the next bytecode boundary. ~25 lines worker-side. |
| **5-second `setTimeout` boot guard is missing.** If `loadPyodide` throws (network blocked, jsdelivr blocked even though we self-host — corp proxies), the UI says "Booting…" forever. | **MAJOR** | Wrap `ensurePyodide()` in `Promise.race([ensure, timeout(15000)])`. On timeout, postMessage `{type: "error", reason: "boot-timeout"}`. Render a banner: "Python failed to load. Reload, or [check your network](#)". |
| **No worker-blocked / cookie-blocked / SharedArrayBuffer-missing detection.** Some corp proxies block Workers. Some browsers (Safari < 15.2) lack the COOP/COEP headers Pyodide can use for threads. | Defer | Detect on mount; degrade to "interactive code is disabled in this browser" with a "view as static" reading mode. Park for V2 unless analytics shows it. |
| **Run button shows ⌘↵ kbd hint** on every device — including iPad / Android touch where there's no keyboard. | **MINOR** | `useMediaQuery('(pointer: fine)')` gate. |
| **No "ran in 234ms" detail clickthrough** for power users wanting to see "this run took 1.2s — was that compile or execute?" | Defer | Phase 2 polish. |

### 3) Step types in the IDE

| Step type | Current behavior | Pristine behavior | Severity |
| --- | --- | --- | --- |
| **`read`** | Read-only editor + Run button works on the example | The IDE chrome should *visually* indicate "this is reference code, you can't edit" — currently the only signal is the lock icon on the file tab. Active line highlight is off. Looks like a broken editor, not a deliberate "read me, then run me" surface. | **MAJOR** |
| **`write`** | Editable buffer with `step.starter`, Submit button in prompt panel calls `ide.run()` | Decent today. Missing: "reset to starter" button. After 3 failed submits, "show solution" surfaces — but it lives in the prompt panel, not the IDE chrome. | **MINOR** |
| **`fix`** | Entire file editable. Bug-line note ("the break is on line 7") in prompt panel. | Bug line should be visually anchored *in the editor* — gutter highlight on line 7, red "bug" marker. After `revealAfter` failed runs, the line should pulse with a 1Hz ember marker (the brand's heartbeat applied to pedagogy). Read-only fences around lines that aren't the bug. | **CRITICAL** |
| **`fill`** | Read-only IDE shows code with literal `___` strings; user types into HTML `<input>` fields in the *prompt panel*. | Blanks should be inline editable widgets *inside the editor*. CodeMirror has `WidgetType` for exactly this — render `___` as a 60px-wide editable input slot. The persistent-IDE moat is the entire pitch; rendering blanks outside the IDE breaks it. (`audit/02-ux-research.md:173` flagged this in V1, not fixed.) | **CRITICAL** |
| **`mc`** | Read-only IDE shows the snippet under question; choices in prompt panel | Sensible. Could highlight the line being asked about ("which of these prints `hello`?" — gutter mark on line 4). | **MINOR** |
| **`predict`** | Read-only IDE shows the code; textarea in prompt panel for the prediction | Add a "reveal output" button after submit so the learner can see the actual run result side-by-side with their prediction. Currently the prompt panel has "Or run the code →" — but it runs and renders in the IDE output panel, requiring eye travel. | **MAJOR** |
| **`reorder`** | Read-only IDE shows fragments concatenated; reorder UI in prompt panel | The IDE is dead weight here. Either hide the IDE entirely on reorder steps OR move reorder into the IDE as drag-handles in the editor gutter. Hiding is the cheap win. | **MAJOR** |
| **`checkpoint`** | Same as `write` with stronger framing | Good as-is. Nothing to add. | OK |

### 4) Hints + help

| Gap | Severity | Concrete fix |
| --- | --- | --- |
| **Hints aren't gated by attempt count.** `_HintReveal.tsx` shows the "Show hint" button immediately, before the user has tried. Boot.dev / Codecademy gate hint 1 behind 1 failed attempt, hint 2 behind 2. The dojo gives the answer away. | **MAJOR** | Pass `failedCount` prop to `HintReveal`. Hint level N appears at `failedCount >= N - 1`. |
| **"Show solution" lives in the prompt panel** (`WriteStepView.tsx:77-85`, `FixBugStepView.tsx:92-100`). That puts a high-stakes button in low-stakes territory. | **MINOR** | Move "show solution" into the IDE chrome (right side of the run bar). Adds gravity; matches the "this is the answer to the code in the editor" mental model. |
| **No "reset to starting state" button.** A learner who edits `write`/`fix` into a corner has no recovery short of refreshing the page. The `PersistentIDEHandle.reset()` exists (`:196-201`); nothing surfaces it. | **MAJOR** | Add a "reset" button in the run bar (left-aligned, secondary tier — `dojo-btn-secondary` from `globals.css`). Confirm-on-click only if the buffer differs from `step.starter`/`step.brokenCode`. |
| **Solution display is a `<pre>` in the prompt panel** (`WriteStepView.tsx:106-109`) — not a CodeMirror block, no syntax highlighting, no "copy to editor" button. | **MAJOR** | Render the solution in a CodeMirror read-only instance with the same theme. Add a `Copy → Editor` button that overwrites the active draft. (Optional: prepend `# solution` comment.) |

### 5) Performance

| Gap | Severity | Concrete fix |
| --- | --- | --- |
| **Editor input latency is unmeasured.** `<CodeMirror>` re-renders on every keystroke through React's reconciler. With our setup that's still O(1) but no FPS metric exists. | **MINOR** | Add a `performance.mark('cm-input-start')` + `performance.measure('cm-input', mark)` on a debounced sample. Surface as a debug overlay (`?debug=1`). |
| **Every step navigation rebuilds the editor.** `key={`${stepId}:${activeFile.name}`}` (`PersistentIDE.tsx:252`) forces a full unmount on step change. The `drafts` state survives in the parent — but the editor instance, history stack, scroll position, fold state all reset. | **MAJOR** | Drop the `key`. Rely on `value` prop for content sync; CodeMirror 6 handles incremental document updates. The `EditorView` is reusable; tearing it down on every step is wasteful and breaks `Ctrl-Z` across steps (which would otherwise be a charming detail). |
| **Pyodide is preloaded on every page in the layout chain that mounts `PyodidePreloader`.** Doc-only routes (`/about`, `/changelog`) don't need 12MB of WASM in module cache. | **MINOR** | `<PyodidePreloader>` should only mount on `/`, `/onboarding`, `/learn/*`. Currently the import graph means it mounts wherever it's referenced — verify with a build-trace. |
| **No service worker caching for `/pyodide/*`.** First visit downloads 12MB; second visit re-downloads if the HTTP cache evicted (mobile is aggressive). | **MAJOR** | Add a tiny SW that `caches.put` `/pyodide/pyodide.asm.wasm` and `python_stdlib.zip` once and serves cache-first thereafter. Vercel/CF Pages cache headers help but don't survive cache eviction. |
| **`copy-pyodide.mjs` ships every `.whl` in `node_modules/pyodide`** (`scripts/copy-pyodide.mjs:50-58`). 90% of those are never imported by lessons (numpy, pandas wheels). | Defer | Audit lessons for `import` statements; ship only the wheels we actually load. Park for V2. |

### 6) Mobile IDE

The mobile experience today (`LessonShell.tsx:42-52, 60-90`):

- < 1024px: prompt panel and IDE are mutually exclusive — a "Show prompt / Show editor" button at the bottom toggles between them.
- The IDE renders at full mobile width when shown, with `h-44` output panel still fixed.
- **CodeMirror touch behavior is the default.** On iOS Safari this means: tap to position cursor (works), pinch-zoom (broken because `<meta viewport>` likely has `user-scalable=no`), no software-keyboard-aware autoscroll, no swipe-to-undo gesture, virtual keyboard covers the run button.
- **No mobile-specific run UI.** The ⌘↵ keyboard shortcut is dead weight on phones.

**Decisive recommendation:** **Hide the IDE gracefully on mobile, ship a "view-only" mode for `write`/`fix`/`checkpoint` steps until the desktop budget is freed up to do mobile right.**

- Below 768px, render `<MobileIDESkeleton />` with: code as a syntax-highlighted (CodeMirror read-only) snippet, a "Read on mobile, ship on desktop" eyebrow, and a "Continue on desktop ↗" button that emails the user a deep link via the existing email-save flow.
- For `read`/`mc`/`predict`/`fill`/`reorder` (no editing required), the prompt panel works on mobile already. Show those steps fully.
- Update step routing: `read`/`mc`/`predict`/`fill`/`reorder` → mobile OK. `write`/`fix`/`checkpoint` → mobile = "ship on desktop."
- Track via Plausible: % of mobile visits that hit a "ship on desktop" gate. If >5% drop off, prioritize a real mobile editor in V4.

The honest reading: **a real mobile editor is a 3-week project.** A "this is desktop-first by design" gate is one afternoon. The brand voice ("for builders") backs the gate — builders have laptops.

### 7) Accessibility (IDE-specific)

| Gap | Severity | Concrete fix |
| --- | --- | --- |
| **Focus enters CodeMirror, then `Tab` is trapped** because CodeMirror eats Tab as indent. Screen-reader users can't escape the editor without `Esc` (which they may not know about). | **MAJOR** | Already partially handled by CodeMirror's `Esc → Tab moves focus` default — but no `aria-describedby` tells the user this. Add `aria-describedby="ide-keymap-hint"` on the editor container with a visually-hidden hint: "press Escape, then Tab, to leave the editor." |
| **Run button `aria-busy={running \|\| !ready}`** (`:295`) — reasonable. But there's no `role="status"` for the run-status text ("Booting Python…"); SR users don't hear cold-start progress. | **MINOR** | Wrap `STATUS_COPY` in a `role="status" aria-live="polite"` span. |
| **Output panel `aria-live="polite"`** (`:335`) — good. But it's a single live region for stdout *and* stderr together. SR announces stderr as plain text without prefix, so a user gets `KeyError: name` with no signal that it's an error. | **MAJOR** | Split into two live regions OR prefix stderr with a screen-reader-only "Error:" span. |
| **No keyboard shortcut for "submit"** on `write`/`fix`/`checkpoint` steps. `⌘↵` runs; you have to mouse to the prompt panel's Submit button. | **MAJOR** | `⌘⇧↵` (Cmd-Shift-Enter) → submit. Wire from `LessonStepClient.tsx` via the bridge. |
| **No keyboard shortcut for "next step"** after passing. Tab → button → space, every step. 624 steps. | **MAJOR** | After `passed === true`, listen for `Enter` (already-pressed-once-during-run shouldn't re-fire — use `keyup` debounce). Surfaces in the StepFooter's keyboard hint copy ("press enter to continue"). |
| **Color-only error signaling.** stderr is `text-err` (red); for the 8% red-green-deficient population, that's identical to stdout (`text-ink-200`). | **MAJOR** | Prefix stderr lines with `✗ ` glyph (or `Traceback:` heading). Add an icon in the output header that flips green/red — already does, with `✗` / `✓` mark — but the `<pre>` itself should reinforce. |
| **Tab order in the lesson shell:** sidebar → header → prompt panel → footer → IDE. The IDE comes last. For runnable steps the IDE *is* the work; users tab through 30+ elements before reaching it. | **MINOR** | Add a "skip to editor" link as the first focusable element on lesson pages. Standard a11y pattern. |
| **Cursor blink at 1Hz with `prefers-reduced-motion: reduce`** is already handled in `globals.css` for the brand cursor. The CodeMirror caret blink is *not* gated. | **MAJOR** | When `matchMedia('(prefers-reduced-motion: reduce)')` matches, set CodeMirror `cursorBlinkRate: 0`. |

### 8) Performance benchmarks (where to measure)

We have **zero IDE performance instrumentation today.** Add these:

| Metric | What | Where |
| --- | --- | --- |
| **TTI on first lesson page** | Time from navigation to "Run button is enabled and Pyodide is ready" | `lib/use-pyodide.ts` — dispatch a `performance.measure('pyodide-ready')` on first ready signal |
| **First-keystroke latency** | Time between `keydown` and visible character in the editor | CodeMirror `EditorView.updateListener.of` — sample 1 in 50 keystrokes |
| **Run round-trip** | postMessage("run") → result received | Already captured in `lastRun.durationMs` (`:113-116`) — surface it in analytics |
| **Cold-start WASM fetch** | Time from `loadPyodide()` start to ready | Worker — `performance.now()` deltas |
| **Step navigation cost** | `stepId` change → IDE renders new content | `LessonStepClient.tsx:120-138` effect — wrap in `performance.measure` |

Pain points visible in code review without measurement:

- The `extensions = useMemo(...)` recomputes when `activeFile` changes by reference (`:206-215`). If the parent passes new `IDEFile[]` arrays each render (which `LessonStepClient.tsx:83` does via `useMemo`, so this is fine *if* `step` is stable — which it is per step navigation only). Verify with React DevTools profiler.
- `seedDrafts(files)` is called on **every** `reset()` invocation — including from `useImperativeHandle` re-creations. Marginal cost.
- `<CodeMirror>` from `@uiw/react-codemirror` is a wrapper around the canonical `EditorView`. The wrapper has a known issue with `extensions` arrays — passing a new array every render forces a full reconfigure. Confirm via the wrapper's `Extension` change-detection (it uses reference equality).

---

## The "every learner spends 80% here" priority list

Top 15 IDE moves ranked by `(user-time-affected × user-experience-delta) / dev-effort`. Each entry: **the fix**, **file touch points**, **deps**, **estimated effort**.

### 1. Replace `oneDark` with the dojo CodeMirror theme that V1 specced and never shipped
- **Fix:** Create `lib/codemirror-theme.ts` that maps `--color-ink-*` and `--color-green-*` to CodeMirror's HighlightStyle + EditorView.theme. Replace `oneDark` import.
- **Files:** `lib/codemirror-theme.ts` (new, ~80 lines), `components/v2/PersistentIDE.tsx:5,255` (swap import).
- **Deps:** `@codemirror/language` (already pulled transitively — verify), `@lezer/highlight`.
- **Effort:** 4 hours. CEO V1 spec at `design-kit/audit/CEO-vision.md:78-81` has the palette mapping. Do not re-spec.
- **Impact:** Brand fidelity 92% → 99% on the highest-traffic surface in the product. Single biggest "this is one product" lift.

### 2. Format Python tracebacks
- **Fix:** Parse `traceback.format_exc()` output into structured frames; render with syntax-highlighted snippets and clickable line numbers.
- **Files:** `lib/python-traceback.ts` (new, ~120 lines), `components/v2/PersistentIDE.tsx:355-356` (swap raw `<pre>` for `<TracebackView>`), `components/v2/TracebackView.tsx` (new).
- **Deps:** None new (use existing `highlight.js` for the snippet).
- **Effort:** 1 day.
- **Impact:** Errors stop being a wall of red. The most important "moment of truth" in any run becomes legible. **This is the single highest-feelings-per-dev-hour change in the report.**

### 3. Add Python autocomplete
- **Fix:** Static dictionary + `python().language.data.of(autocompletion(...))`. Phase 2 ships Pyodide-backed `dir(__main__)` after each run.
- **Files:** `lib/python-completions.ts` (new, ~150 lines — Python 3 builtins + first 200 stdlib names), `components/v2/PersistentIDE.tsx:206-215` (extend extensions).
- **Deps:** `@codemirror/autocomplete` (new — small, ~15kb gzipped).
- **Effort:** 1 day for the static dictionary; +1 day for the runtime introspection.
- **Impact:** Beginners stop typo'ing `prnt`. The "Replit-feel" gap closes.

### 4. Add `closeBrackets` + `bracketMatching` + `indentWithTab`
- **Fix:** Three CodeMirror extensions, ~5 lines added to the `extensions` array.
- **Files:** `components/v2/PersistentIDE.tsx:206-215`.
- **Deps:** `@codemirror/language` + `@codemirror/commands` (likely already in tree via `lang-python`).
- **Effort:** 30 minutes.
- **Impact:** Tab-indents-spaces is the single biggest beginner-Python ergonomics fix. Free.

### 5. Render `fill` blanks inside the editor as widgets
- **Fix:** Replace the `<input>` rendered in `FillBlankStepView.tsx:111-135` with CodeMirror `WidgetType` that renders an inline `<input>` at the `___` position in the buffer. Wire blank values back to the step view's `setValues`.
- **Files:** `lib/codemirror-blank-widget.ts` (new, ~80 lines), `components/v2/steps/FillBlankStepView.tsx` (rewrite the rendering — drop `splitOnBlanks`, drop the prompt-panel inputs), `components/v2/PersistentIDE.tsx` (accept a `widgets` prop or a new "fill mode").
- **Deps:** `@codemirror/state`, `@codemirror/view` (already in tree).
- **Effort:** 2 days.
- **Impact:** Closes the V1 audit's "the persistent-IDE moat breaks here" finding (`audit/02-ux-research.md:173`). The pitch finally lines up with the implementation.

### 6. Pyodide cold-start progress bar
- **Fix:** Stream the wasm fetch with a `ReadableStream` reader, postMessage percent to the main thread; render a 1px hairline at the editor top edge.
- **Files:** `public/pyodide-worker.js` (replace `loadPyodide({indexURL:'/pyodide/'})` with a manual `fetch` + bytes-streamed wrapper, then hand to Pyodide via `_module`), `components/v2/PersistentIDE.tsx:273-284` (replace status string with a hairline bar).
- **Deps:** None.
- **Effort:** 1 day.
- **Impact:** "Booting Python…" stops reading as broken. CEO V1 cut the timeout / hardening pass; for V3 it's the bar.

### 7. Reset-to-starter button
- **Fix:** Tertiary button in the IDE run bar, calls `ide.reset()`. Confirms only if buffer differs from starter.
- **Files:** `components/v2/PersistentIDE.tsx:285-313` (add button to the run bar).
- **Deps:** None.
- **Effort:** 2 hours.
- **Impact:** Eliminates "I broke it, now what" — a top-3 reason novices abandon coding tutorials.

### 8. Run history (last 5 runs)
- **Fix:** Ring buffer in component state; render previous runs as a collapsible strip above the current output.
- **Files:** `components/v2/PersistentIDE.tsx:111-117` (extend `lastRun` to `runHistory: RunSummary[]`), `:315-360` (add history strip component).
- **Deps:** None.
- **Effort:** 4 hours.
- **Impact:** "Did I break it or did the lesson grader change?" gets answered in one click.

### 9. Lint squiggles via Pyodide `compile()`
- **Fix:** Worker-side, on every code change (debounced 400ms), `try: compile(src, '<editor>', 'exec') except SyntaxError as e: postMessage({type: 'lint', diagnostics: [{line: e.lineno, col: e.offset, msg: str(e)}]})`. Render via `@codemirror/lint`.
- **Files:** `public/pyodide-worker.js` (add `lint` message handler), `lib/use-pyodide.ts` (add `lint(code)` to the API), `components/v2/PersistentIDE.tsx` (debounced lint pass on `handleChange`).
- **Deps:** `@codemirror/lint`.
- **Effort:** 1 day.
- **Impact:** Live syntax errors. Closes the second-biggest Replit-parity gap after autocomplete.

### 10. `Cmd-Shift-Enter` to submit, `Enter` to continue after pass
- **Fix:** Two keyboard listeners in `LessonStepClient.tsx`. Submit triggers the active step view's submit; Continue mirrors the Continue button.
- **Files:** `components/v2/LessonStepClient.tsx:54-92` (add the global listener; need the active step view to expose its submit handler — extend `StepIDEBridge` with `submit`, or hoist via context).
- **Deps:** None.
- **Effort:** 4 hours.
- **Impact:** A keyboard-only learner can complete an entire lesson without leaving the editor.

### 11. Stop / abort button
- **Fix:** SharedArrayBuffer interrupt buffer; "stop" button in the run bar visible only while `running`.
- **Files:** `public/pyodide-worker.js` (set up `interruptBuffer` on Pyodide init, expose interrupt method), `lib/use-pyodide.ts` (add `interrupt()`), `components/v2/PersistentIDE.tsx:285-313` (button).
- **Deps:** None — Pyodide ≥ 0.23 supports it natively. We're on 0.28.3 (`package.json:24`).
- **Effort:** 1 day. Requires COOP/COEP headers — verify Cloudflare Pages config.
- **Impact:** `while True:` stops killing tabs.

### 12. Read-only editable ranges for `fix` steps
- **Fix:** Schema field `editableRanges?: Array<{from: number, to: number}>`. Translate to CodeMirror `EditorState.changeFilter.of(...)`. Author can mark only the buggy line as editable.
- **Files:** `lib/content/schema.ts` (add field), `components/v2/PersistentIDE.tsx:206-215` (wire change filter), content authors update existing `fix` steps.
- **Deps:** None.
- **Effort:** 1 day code; 1-2 days authoring sweep.
- **Impact:** The "fix the bug" affordance becomes pedagogically tight — beginners can't accidentally rewrite the working parts.

### 13. Move "show solution" + "reset" into IDE chrome (not prompt panel)
- **Fix:** Pass `solution: string | undefined` and `onReset` to the IDE; render in a tertiary slot.
- **Files:** `components/v2/PersistentIDE.tsx` (new prop), `components/v2/steps/{Write,Fix,Checkpoint}StepView.tsx` (delete the prompt-panel buttons, pass through to IDE).
- **Deps:** None.
- **Effort:** 4 hours.
- **Impact:** The IDE owns IDE-things. The prompt panel owns prompt-things. One mental model.

### 14. Service-worker cache for `/pyodide/*`
- **Fix:** Tiny SW that cache-firsts the runtime files. Register on first lesson page mount.
- **Files:** `public/sw.js` (new, ~30 lines), `components/v2/PersistentIDE.tsx` (register on mount), `next.config.ts` if SW needs to be served at root scope.
- **Deps:** None.
- **Effort:** 4 hours including testing.
- **Impact:** Second-visit cold-start drops from 5s to 0.3s.

### 15. Mobile IDE: ship a graceful gate, not a broken experience
- **Fix:** Below 768px, replace IDE with `<MobileIDEGate>` for runnable steps; render syntax-highlighted snippet for read steps. Email-the-user-a-deep-link via the existing email-save.
- **Files:** `components/v2/MobileIDEGate.tsx` (new), `components/v2/PersistentIDE.tsx` or `LessonShell.tsx` (gate at the boundary).
- **Deps:** None.
- **Effort:** 1 day.
- **Impact:** Stops the worst mobile experience in the product. Buys time to do mobile right in V4.

**Total budget for the top 15: ~20 dev-days.** The first 5 deliver 80% of the perceived "this is on par with Replit" lift in 5-6 dev-days.

---

## Step-type-specific UX gaps

### `read`
- **Current:** Read-only buffer + Run button. No "active line" highlight. Lock icon on tab.
- **Pristine:** "Reading mode" treatment — soft ember left-rail on the editor, dimmed run-bar background, "Run this example" copy on the run button instead of generic "run." Cursor hidden (no caret on a read-only file). Hover-to-show-line-number tooltip explaining what each line does (advanced — V2).
- **Component changes:** `PersistentIDE.tsx:218-272` — when active file is read-only, swap chrome treatment. Cursor `cursorVisible: false` extension.

### `write`
- **Current:** Editable buffer with starter, Submit in prompt panel, Show solution in prompt panel.
- **Pristine:** Reset button in IDE chrome. Submit button at IDE level (`Submit` becomes the second action next to `Run`, since `write` always-runs-then-grades). Show-solution gated behind 3 failed runs, surfaces in IDE chrome.
- **Component changes:** `WriteStepView.tsx` collapses to: prompt + grade banner + hint. All actions move to IDE.

### `fix`
- **Current:** Entire file editable, "bug is on line N" copy in prompt panel.
- **Pristine:** Read-only ranges around non-buggy lines (#12 above). Gutter highlight on bug line(s) — small ember dot. After `revealAfter` failed runs, the dot pulses at 1Hz (brand heartbeat applied to pedagogy). Reset button.
- **Component changes:** `FixBugStepView.tsx:70-78` — drop the "bug is on line N" prompt-panel block, replaced by editor-side gutter highlight. Schema needs `bugLines` already exists; just render in CM.

### `fill`
- **Current:** Read-only IDE shows code with `___`; HTML inputs in prompt panel.
- **Pristine:** Inline editable widgets at each `___` position in the editor (#5 above). Submit at IDE level. The prompt panel becomes pure prose — "fill in the keyword."
- **Component changes:** Major rewrite of `FillBlankStepView.tsx`; new `lib/codemirror-blank-widget.ts`.

### `multiple-choice`
- **Current:** Read-only IDE shows snippet; choices in prompt panel.
- **Pristine:** Add gutter pin on the line being asked about ("which line throws the error?") — schema field `markedLine?: number`. Choices stay in prompt panel.
- **Component changes:** Schema field; `PersistentIDE.tsx` accepts `markedLines?: number[]` and renders gutter markers.

### `predict`
- **Current:** Read-only IDE shows code; textarea + "or run the code →" in prompt panel.
- **Pristine:** "Reveal output" replaces "or run the code" — single button that runs the code, then renders the actual stdout *next to* the user's prediction in a side-by-side diff. Visual reinforcement of "you said X, the machine said Y, here's the gap."
- **Component changes:** `PredictStepView.tsx:52-56,103-116` — render comparison instead of running silently.

### `reorder`
- **Current:** Read-only IDE shows fragments concatenated; reorder UI in prompt panel.
- **Pristine:** Hide the IDE entirely on `reorder` steps. The IDE adds zero value and confuses the affordance. Reorder UI takes the full canvas.
- **Component changes:** `LessonShell.tsx:82-89` — accept a `hideIDE?: boolean` prop. `LessonStepClient.tsx:211-218` — pass `hideIDE={step.type === "reorder"}`.

### `checkpoint`
- **Current:** Same UX as `write` with stronger framing in prompt panel.
- **Pristine:** Same as `write` after #13 ships. Add a small "checkpoint" eyebrow above the run bar in the IDE itself — currently lives only in the prompt panel.
- **Component changes:** Pass `step.type` or a `chrome` prop to IDE so it can render contextual eyebrows.

---

## Pyodide UX (first-load + subsequent)

### Current cold-start UX

1. User lands on `/learn/v2/...` for the first time.
2. `usePyodide()` mounts, fires `init` to a singleton worker.
3. Worker: `importScripts('/pyodide/pyodide.js')` (sync, ~200kb), then `loadPyodide({indexURL:'/pyodide/'})` which fetches `pyodide.asm.wasm` (~12MB), `python_stdlib.zip` (~10MB), `pyodide-lock.json` (~2MB).
4. While that's happening, the run bar shows: `Booting Python (one-time, ~5s)…` with a small spinner.
5. **No progress percentage. No cancel. No retry on failure. No "this happens once per device" copy.**
6. On a 50Mbps connection: 5-8s. On a slow 4G (1.5Mbps): 60-120s. On a corp proxy that throttles `.wasm`: forever.
7. When ready, status flips to `press Run or use ⌘↵` and the Run button enables.

If `loadPyodide` throws (network blocked):
- Worker `try/catch` posts `{type: 'result', payload: {ok: false, stderr: String(err)}}` (`pyodide-worker.js:84-89`).
- The hook does nothing with that — the status stays at `loading` forever. The Run button stays disabled.
- The user concludes the page is broken.

### Proposed cold-start UX

```
[ promptdojo ]                                    booting · 47%
 ▸ wasm engine (12 MB)        ████████░░░░░░░  8.4 / 12 MB
 ▸ stdlib (10 MB)             not yet
 ▸ first run                  not yet

 [ this happens once per browser. cached after that. ]
```

Concrete:

- 1px ember hairline above the editor, animating from 0% → 100% as bytes-loaded.
- Three-line text overlay in the output panel during boot — engine, stdlib, first run — each ticks to ✓ as it completes.
- Honest copy: "this happens once per browser." (see #6 in the priority list re: dropping the dishonest "(one-time, ~5s)").
- On failure: "Python failed to load. [Retry] · [Continue without code]." Retry re-instantiates the worker. Continue-without-code degrades to read-only "view source" mode for runnable steps.
- On timeout (>15s): same banner.

### Cache strategy improvements

| Layer | Today | Proposed |
| --- | --- | --- |
| HTTP cache | `out/_headers` rule on `/pyodide/*` (long-cache via Cloudflare per CEO-vision V1) | Keep |
| Browser module cache | Implicit (the WASM module compile result lives in V8 module cache between worker re-instantiations) | Keep — `PyodidePreloader.tsx` already exploits this |
| Service worker cache | None | Add — explicit `caches.put` of the 4 runtime files. Survives memory pressure. |
| LocalStorage | None | N/A — wasm files too big for localStorage (5MB cap) |
| IndexedDB | None | Defer — would survive even harder cache evictions but adds complexity |

### Failure modes — handled?

| Mode | Today | Proposed |
| --- | --- | --- |
| Network down on cold start | Status hangs at "Booting…" forever | 15s timeout → retry banner |
| Network down on subsequent run | Worker postMessage fails silently | Detect via timeout; show "lost connection to Python — retry?" |
| `pyodide.asm.wasm` 404 (build-script bug) | Same as network down | Same |
| Browser blocks Workers | `getWorker()` throws; first call to `usePyodide` crashes the component tree | Catch in the hook; render fallback "view source only" UI |
| `SharedArrayBuffer` unavailable (no COOP/COEP) | Pyodide still works for single-threaded execution; thread-based interrupt won't | Detect; disable "stop" button with tooltip "your browser doesn't support thread interruption" |
| User clicks Run during cold start | Click queues, runs after ready (`PersistentIDE.tsx:90-95`) — current behavior is correct | Keep |
| User navigates away mid-load | Worker survives (singleton); next page reuses | Keep |

---

## Mobile IDE strategy

**Recommendation: ship the gate, not a half-built mobile editor.**

### What "ship the gate" means

- **Below 768px** for runnable steps (`write`, `fix`, `checkpoint`):
  - Replace `<PersistentIDE>` with `<MobileIDEGate>`.
  - Renders a syntax-highlighted code preview (CodeMirror read-only).
  - Hero: `the editor is desktop only — for now.`
  - Two CTAs: `email me this link` (uses existing `LoginToSave` flow) + `keep reading on mobile →` (advances to next non-runnable step).
- **Below 768px** for non-runnable steps (`read`, `mc`, `predict`, `fill`, `reorder`):
  - Hide the IDE pane entirely (or make it a collapsible "see the code" drawer).
  - Prompt panel takes full width.
  - Lessons remain consumable on the train.

### What "do mobile right" would mean (V4 scope, do not ship in V3)

- Replace the bottom drawer with a swipe-from-right overlay.
- Use CodeMirror's mobile-aware extensions (`scrollPastEnd`, virtual-keyboard-aware autoscroll).
- Add a numpad-style key strip above the iOS keyboard (`(`, `:`, `_`, `:`, `[`, `]`, `Tab`) — Replit's mobile UI has this.
- Reflow the run bar so the Run button hovers above the keyboard via `visualViewport` events.
- Test on actual iOS Safari, not Chrome devtools mobile mode.

### Why the gate is correct

- The brand voice is builder-class. Builders carry laptops. The "desktop only" message reinforces, doesn't apologize.
- $0 budget, solo founder. A real mobile editor is 3 weeks; the gate is one afternoon.
- Discoverability of *the curriculum* (the marketing surface) works on mobile already. Conversion to first-lesson-completion happens on desktop. The funnel is honest.
- Khan Academy and Codecademy went mobile-first because their learners are 14-year-olds on iPads. Promptdojo's audience is Indie Ian on a 14" MacBook Pro.

---

## Accessibility audit (IDE-specific)

### Keyboard map (current)

| Key | Action |
| --- | --- |
| `⌘↵` / `Ctrl-Enter` | Run editor |
| `Tab` | Indent (in CodeMirror — not currently wired; today it tabs out of the editor) |
| `Esc` | (CodeMirror default) — exit edit mode for `Tab` to escape |
| `Ctrl-F` | (CodeMirror default) — open find panel |
| `Ctrl-Z` / `⌘Z` | (CodeMirror default) — undo |
| `Ctrl-Shift-Z` / `⌘⇧Z` | (CodeMirror default) — redo |

### Keyboard map (proposed)

Add:

| Key | Action |
| --- | --- |
| `Tab` | Indent 4 spaces (`indentWithTab` from `@codemirror/commands`) |
| `Esc, Tab` | Move focus out of editor |
| `⌘⇧↵` / `Ctrl-Shift-Enter` | Submit (run + grade) — wires up step-level submit |
| `Enter` (post-pass only) | Continue to next step |
| `Ctrl-/` / `⌘/` | Toggle line comment (CodeMirror has this; verify keymap) |
| `?` (when focus outside editor) | Show keyboard shortcut overlay |

### Screen reader story

- **Editor body:** CodeMirror 6 has decent screen reader support out of the box via `aria-multiline="true"` on the cm-content div. Lines are announced as the cursor moves.
- **Run status:** Today's "Booting Python…" is in a plain span, not announced. Wrap in `role="status" aria-live="polite"`.
- **Output panel:** Already `aria-live="polite"` (`:335`). Split into two regions for stdout / stderr OR add `<span class="sr-only">Error:</span>` prefix to stderr.
- **Run completion:** When a run completes, the live region announces the new content. Today that includes the entire stdout dump. For SR users, this can be 100+ words read out. **Add an opt-in compact mode:** announce "Run complete. 7 lines of output. Press Tab to read." instead of dumping.
- **Run button state:** `aria-busy={running || !ready}` (`:295`) — good. `aria-keyshortcuts="Meta+Enter Control+Enter"` — good. **Missing:** `aria-disabled` synonym for older AT.

### Focus management

- When step changes (route change), focus should move to the prompt panel heading, not the editor. Today `LessonStepClient.tsx` doesn't manage focus on route change.
- After a successful run, focus should stay in the editor (the user is iterating).
- After a successful submit, focus should move to the Continue button (the user is done).
- **Today, none of this is wired.** Focus is wherever the click landed, plus or minus React's default behavior on remount.
- Implementation: `useEffect` in `LessonStepClient.tsx` watching `stepId` → `document.querySelector('[data-prompt-heading]')?.focus()`. Plus a `data-prompt-heading` attribute on the step's title.

---

## Performance benchmarks (or where to measure)

### What to instrument

```ts
// lib/ide-perf.ts — new
export const ideMark = (name: string) => performance.mark(`ide:${name}`);
export const ideMeasure = (name: string, start: string) => {
  performance.measure(`ide:${name}`, `ide:${start}`);
  const last = performance.getEntriesByName(`ide:${name}`).at(-1);
  if (last && process.env.NODE_ENV === 'development') console.debug(`ide:${name} ${last.duration.toFixed(0)}ms`);
};
```

Wire at:

- `lib/use-pyodide.ts:30` — `ideMark('mount')` on hook mount, `ideMeasure('first-ready', 'mount')` when status flips to 'ready'.
- `components/v2/PersistentIDE.tsx:156` — `ideMark('run-start')` before `run(code)`, `ideMeasure('run-rt', 'run-start')` after result.
- `components/v2/PersistentIDE.tsx:147` — every 50th `handleChange` call, `ideMark('keystroke')` — measure how long until the next render commits via a `useLayoutEffect`.
- `components/v2/LessonStepClient.tsx:62-81` — `ideMark('step-change')`, `ideMeasure('step-render', 'step-change')` after the step's first paint.

Surface in a `?debug=ide` overlay component that reads `performance.getEntriesByType('measure').filter(e => e.name.startsWith('ide:'))`.

### Current pain points visible without measurement

1. **Step navigation forces editor unmount** via `key={...stepId...}` (`PersistentIDE.tsx:252`). Removes editor history (Ctrl-Z across steps), scroll position, fold state. **Fix:** drop the `key`; use `value` prop for sync (already does).
2. **`ideFiles` re-derives every render** of `LessonStepClient.tsx:83`. `useMemo` keys on `step` reference. If parent ever passes a new `step` object with same content (e.g., from a re-fetch), full editor reset. Today `step` is stable per route — verify with React DevTools.
3. **PyodidePreloader fires on `/` and `/onboarding` only**, but the import surface area is bigger — verify in production build trace that doc-only routes don't pull the preloader.
4. **`copy-pyodide.mjs` ships every wheel** in `node_modules/pyodide`. Current build size is fine because we serve same-origin and Cloudflare caches. But: visit-1-no-cache is paying for wheels we never load. Audit lessons for `import` statements; ship the subset.
5. **CodeMirror's input pipeline** is fine on desktop, untested on a low-end Android device. No blocker because of the mobile gate — but if mobile becomes a target, profile.

---

## Top 15 IDE moves to ship — ranked

Each row: **change**, **file:line touch points**, **deps**, **effect**.

| # | Move | File:line | Deps | Effect |
| --- | --- | --- | --- | --- |
| 1 | Replace `oneDark` with dojo theme | `lib/codemirror-theme.ts` (new), `PersistentIDE.tsx:5,255` | `@codemirror/language` | Brand fidelity: highest single lift |
| 2 | Format Python tracebacks | `lib/python-traceback.ts` (new), `components/v2/TracebackView.tsx` (new), `PersistentIDE.tsx:355-356` | none | Errors stop being a wall of red |
| 3 | Python autocomplete (static + introspection) | `lib/python-completions.ts` (new), `PersistentIDE.tsx:206-215`, `pyodide-worker.js` (introspection) | `@codemirror/autocomplete` | Closes Replit-parity gap #1 |
| 4 | `closeBrackets` + `bracketMatching` + `indentWithTab` | `PersistentIDE.tsx:206-215` | `@codemirror/commands` (likely already pulled) | Tab-indents-spaces. Free. |
| 5 | `fill` blanks render inside the editor as widgets | `lib/codemirror-blank-widget.ts` (new), `FillBlankStepView.tsx` (rewrite), `PersistentIDE.tsx` (widgets prop) | none beyond CM core | Fixes V1 audit's "moat breaks here" |
| 6 | Pyodide cold-start progress hairline | `pyodide-worker.js:32`, `PersistentIDE.tsx:273-284` | none | Boot stops reading as broken |
| 7 | Reset-to-starter button | `PersistentIDE.tsx:285-313` | none | "I broke it" recovery, 2hr fix |
| 8 | Run history (last 5 runs) | `PersistentIDE.tsx:111-117,315-360` | none | Compare runs without losing state |
| 9 | Lint squiggles via `compile()` | `pyodide-worker.js`, `lib/use-pyodide.ts`, `PersistentIDE.tsx:147-154` | `@codemirror/lint` | Live syntax errors |
| 10 | `Cmd-Shift-Enter` submit + `Enter` continue | `LessonStepClient.tsx:54-92`, `StepRouter.tsx:26-31` (extend bridge) | none | Keyboard-only completion |
| 11 | Stop / abort run button | `pyodide-worker.js`, `PersistentIDE.tsx`, `lib/use-pyodide.ts` | none (Pyodide ≥ 0.23 has `setInterruptBuffer`) | `while True:` no longer kills tabs |
| 12 | Editable ranges for `fix` steps | `lib/content/schema.ts`, `PersistentIDE.tsx:206-215`, `_grader.ts`, content authoring sweep | none | Pedagogical tightness |
| 13 | "Show solution" + "Reset" → IDE chrome | `PersistentIDE.tsx`, `Write/Fix/CheckpointStepView.tsx` | none | One mental model |
| 14 | Service-worker cache `/pyodide/*` | `public/sw.js` (new), `next.config.ts`, `PersistentIDE.tsx` (register) | none | 2nd-visit cold-start: 5s → 0.3s |
| 15 | Mobile IDE gate | `components/v2/MobileIDEGate.tsx` (new), `LessonShell.tsx:82-89` | none | Stops worst mobile experience |

**Estimated total: ~20 dev-days.** First five (the 80% lift): 5-6 dev-days.

### Sequencing recommendation

- **Week 1 — the receipts ship:** #1 (theme), #4 (Tab + brackets), #7 (reset), #2 (traceback formatting). Single PR, ~2.5 days. Brand fidelity + error legibility unlocked.
- **Week 2 — the moat closes:** #5 (fill widgets), #3 (autocomplete static), #13 (chrome consolidation). ~3 days. The persistent-IDE story finally matches the marketing copy.
- **Week 3 — the polish layer:** #6 (cold-start progress), #9 (lint), #8 (run history), #14 (SW cache). ~3 days. The IDE feels alive even before the user types.
- **Week 4 — the hard stuff:** #11 (interrupt), #12 (editable ranges), #10 (keyboard shortcuts), #15 (mobile gate). ~4 days.

After week 1, an indie founder seeing the IDE for the first time would not say "this is good for an open-source project." They'd say "this is on par with Replit." That's the bar.

---

## What to NOT ship in V3

- **Real mobile editor.** $0 budget, 3-week project, audience is desktop. Park for V4.
- **AST-based grading.** `_grader.ts:64-69` notes it's not wired client-side. Stay stdout-equality. AST grading needs Pyodide-side analysis and adds 1-2 days per grader to the authoring pipeline.
- **Multi-file editing affordance** beyond the current tab strip. The tabs exist; no lesson uses more than one file. Don't optimize for content that doesn't exist.
- **WebContainer / Node.js runtime.** Pyodide is the moat. Don't dilute.
- **Live collaboration / sharing.** Out of scope for solo learners.
- **`ruff`/`black` format-on-save.** WASM-compatible exists but adds 5MB. Beginners don't care. V4.
- **AI-powered hints in the editor.** The brand position is "AI writes code, you make sure it works." Putting an AI helper in the IDE is a brand contradiction. The hint system stays human-authored.

---

## Citations index

- IDE component: `components/v2/PersistentIDE.tsx:1-371`
- Step orchestration: `components/v2/LessonStepClient.tsx:1-343`
- Lesson shell + mobile drawer: `components/v2/LessonShell.tsx:1-114`
- Step router: `components/v2/StepRouter.tsx:1-91`
- Step views: `components/v2/steps/{Read,MultipleChoice,FillBlank,Predict,FixBug,Write,Reorder,Checkpoint}StepView.tsx`
- Hint reveal: `components/v2/steps/_HintReveal.tsx:1-74`
- Grader: `components/v2/steps/_grader.ts:1-83`
- Pyodide worker: `public/pyodide-worker.js:1-91`
- Pyodide hook: `lib/use-pyodide.ts:1-66`
- Pyodide preloader: `components/PyodidePreloader.tsx:1-49`
- Pyodide copy script: `scripts/copy-pyodide.mjs:1-67`
- Brand colors / tokens: `app/globals.css:3-32`
- Type scale + button hierarchy: `app/globals.css:131-end`
- Cursor blink (1Hz brand heartbeat): `app/globals.css:131-145`, `MOTION.md:6-12`
- Brand spec: `BRAND.md`
- Motion spec: `MOTION.md`
- V1 CodeMirror theme spec (specced, not shipped): `design-kit/audit/06-ux-architecture.md:170`, `design-kit/audit/CEO-vision.md:78-81`
- V1 finding "fill blanks should render in IDE": `design-kit/audit/02-ux-research.md:173`
- V1 cut "stop button + 30s timeout": `design-kit/audit/CEO-vision.md:102`
- Schema: `lib/content/schema.ts`
- Step content example (fix): `content/python/02-functions/01-return-values/06-fix-the-missing-return.fix.yaml`
- Step content example (fill): `content/python/02-functions/01-return-values/05-fill-the-return.fill.yaml`
