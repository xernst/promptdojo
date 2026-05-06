# IDE V4 — Cartesian-inspired moves

> Beat the bar: every learner using Promptdojo for an hour should think "this in-browser IDE feels closer to a textbook than Replit." Cartesian's textbook discipline is the inspiration. Replit's run loop stays the floor.

## The IDE thesis (1 sentence)

Promptdojo's IDE today is a faithful Replit-shaped tool living inside a textbook page that gives it nothing back; Cartesian shows us what a **textbook-shaped IDE** looks like — chrome in the page voice, code that plays back instead of running once, output that reads like a typeset paragraph instead of a terminal — and lifting four of those moves (paper-frame chrome, step-through playback, ember-active-line gutter, output-as-document) is what turns the editor from "embedded Replit" into "interactive textbook."

---

## What's already shipped (don't re-spec)

V3 picks #1, #4, #7 already landed (`components/v2/PersistentIDE.tsx:5-9, 209-223, 281-292`):

- `lib/codemirror-theme.ts:1-74` — dojo theme is live, ember caret + green selection at 18% alpha, one-dark is dead.
- `bracketMatching()` + `closeBrackets()` + `keymap.of([indentWithTab])` — wired at `PersistentIDE.tsx:213-216`.
- Status copy is honest now (`PersistentIDE.tsx:86-90`): "loading wasm…" instead of the lying "(one-time, ~5s)".

So this report builds on the receipts, not on the V3 wishlist as if nothing shipped.

---

## Pattern proposals

### Proposal 1 — Paper-frame the IDE on `read` / `mc` / `predict` steps

- **Cartesian source**: `cartesian-features-1920.png` (the entire feature-card rail) and `cartesian-edit-run-test-1920.png` (the "Code" window with hairline cream bezel + window-chrome title bar). Every code panel on Cartesian sits inside a `1px solid` cream-paper bezel, with a small chrome titlebar reading the structure name (`Implementation (Sorted Pair Sum (Two Pointers))`).
- **Promptdojo target**: `components/v2/PersistentIDE.tsx:230` (root `<div className="flex h-full min-h-0 flex-col bg-ink-950">`) and `components/v2/LessonShell.tsx` (the wrapper that holds the IDE pane).
- **Concrete change**:
  1. Add a `chrome?: "frame" | "raw"` prop to `PersistentIDE`. Default `"raw"` (current look — `write`, `fix`, `checkpoint` need the full bleed). On `read`/`mc`/`predict`/`fill`/`reorder`, pass `chrome="frame"`.
  2. When `chrome === "frame"`, wrap the editor body in a paper-tone bezel: `border border-ink-800 rounded-md bg-ink-950 shadow-[0_1px_0_0_rgba(244,244,245,0.04)]` with `~16px` outer padding from the lesson column. Inner border `1px solid var(--color-ink-800)`.
  3. Replace the file-tab strip on `chrome="frame"` with a **single titled chrome bar**: small left badge `<code icon> step.snippetName ?? activeFile.name` styled like Cartesian's `Implementation (...)` titlebar — same monospace, smaller, dimmed.
  4. Schema: optional `step.snippetName?: string` on read/mc/predict step types, e.g. `"return_values.py · the example"` so it reads like a figure caption, not a filename.
- **Why it lifts the IDE feel**: Today the IDE is a dark slab that visually screams "code workshop" on `read` steps where there's no work to do. Cartesian's framing tells you "this is a figure in the chapter, study it." Same affordance — totally different psychological register. Solves V3's `read`-step "active line is off, looks like a broken editor" finding (`audit-v3/05-ide-deep-dive.md:85`) without needing extra ember work.
- **Effort**: S — half day. One prop, ~40 lines of conditional chrome, one schema field, content sweep is opt-in (no migration required, default stays raw).

### Proposal 2 — "Step through" mode (Code Playback) for `read` and `predict`

- **Cartesian source**: `cartesian-features-1920.png` ("Code Playback." section with the numbered step strip 0-12 below the editor; `cartesian-edit-run-test-1920.png` shows transport controls + `12:56` timecode top-right of the editor). The bullet copy: "Every step is visualized, and you can see exactly how each variable changes as the program runs — in real time."
- **Promptdojo target**:
  - `public/pyodide-worker.js:34-52` (the `__ck_run` harness — instrument it to capture frames).
  - `components/v2/PersistentIDE.tsx:159-179` (`handleRun`) — extend `RunResult` with `frames?: RunFrame[]`.
  - `components/v2/steps/ReadStepView.tsx`, `PredictStepView.tsx:96-101` (the "Or run the code →" button is the natural surface to upgrade).
- **Concrete change**:
  1. Worker-side: replace single-shot exec with a Pyodide `sys.settrace`-driven harness. The trace callback appends `{ line, locals: {...filtered}, stdout_delta }` to a frames buffer on each `'line'` event. Filter `locals` to non-callable, non-module values — small ones inline as a string, lists/dicts as JSON. Bound the buffer at 200 frames; if exceeded, fall back to "ran without playback" so we never crash a class-of-step that loops to 10k.
  2. Hook-side (`lib/use-pyodide.ts:1-66`): pipe `frames` through to the result.
  3. New component `components/v2/PlaybackStrip.tsx`: numbered pills 0..N (Cartesian's strip exactly), `← / →` keyboard, click-to-jump. Active frame number rings ember.
  4. IDE side: when `frames.length > 0` AND step is `read`/`predict`, render the strip in the output panel (currently the stdout pre — `PersistentIDE.tsx:341-366`). Selecting a frame: dispatch `EditorView.scrollIntoView` to that line + add a 1px ember left-rail decoration on the active line.
  5. UI copy: replace the `lastRun` "✓ ran in 234ms" pill with `"step 7 of 12 · variables on the right"` while playback is open.
  6. Variables panel: small right-side gutter inside the output area showing the locals diff (`name = "Ada"` newly bound shows in ember; mutated values pulse once at 1Hz). This is Cartesian's "you can see exactly how each variable changes" — verbatim.
- **Why it lifts the IDE feel**: `predict` step today asks "what stdout will this print?", learner types a guess, hits submit, gets a binary right/wrong + then has to click "Or run the code →" to see the answer (`PredictStepView.tsx:96-101`). Eye travel + cognitive whiplash. With playback, after submit, the strip walks the user through the program one statement at a time so they can *see why* their prediction was wrong. This is the single biggest "textbook, not Replit" lift on the page — it's the move you can't get from any browser-IDE-as-a-service.
- **Effort**: M-L — 3-4 days. The trace is ~40 lines of Python, the strip is ~80 lines of TSX, the variables panel is ~60 lines. The content cost is zero because `read`/`predict` steps already have valid runnable code. **Gate behind `step.playback?: boolean` schema flag** so authors opt-in per lesson; ship for `02-functions/03-return-values` and `03-collections/01-lists/iteration` first to dogfood, then expand.

### Proposal 3 — Output-as-document (kill the terminal aesthetic on read steps)

- **Cartesian source**: `cartesian-features-1920.png` — the visualization panel and the editor panel both feel like **figures in a book**, not a terminal log. There's no `[promptdojo:~]$` prompt, no `❯ stdout` uppercase eyebrow, no green-on-black mono background. The closest analog Cartesian shows is the small `Output` strip inside `cartesian-edit-run-test-1920.png` — paper-tone, hairline-bordered, sans-serif metadata.
- **Promptdojo target**: `components/v2/PersistentIDE.tsx:319-366` — the entire `<div className="flex h-44 min-h-0 flex-col border-t border-ink-800 bg-ink-950">` output panel.
- **Concrete change**:
  1. Same `chrome` prop drives this. On `chrome="frame"` (read / predict / mc), output renders as a typeset block:
     - Drop the `[promptdojo:~]$` blinking-cursor empty state. Replace with hairline-bordered figure caption: `"output will appear here when you press run"` in `text-ink-500 text-sm` (not mono).
     - `<pre className="whitespace-pre-wrap text-ink-200">` stays for actual stdout (it IS data the program emitted, mono is correct), but wrap it in a `<figure>` with a tiny serif/display caption above: `output ·`, italic, ink-400.
     - "ran in 234ms" badge moves from uppercase "STDOUT" eyebrow into the figure caption row, lowercase, italic.
  2. On `chrome="raw"` (write / fix / checkpoint — the work surfaces), keep the current terminal aesthetic exactly. **Builders want the terminal feel when they're shipping.** Don't soften the work mode.
  3. The "✓ ran with no output. add a `print(…)` to see something." copy at `PersistentIDE.tsx:354-358` is already great. Keep it; it's the closest Promptdojo currently has to Cartesian voice.
- **Why it lifts the IDE feel**: 80% of step types are read/mc/predict/fill/reorder where the user is *studying* code, not building it. The terminal aesthetic on those screens borrows authority from "real dev tools" but spends it on the wrong feeling — like watching Khan Academy in a tmux pane. Soft-mode the output panel for study, keep terminal-mode for work, and the IDE finally tells you which mode you're in *visually* without copy.
- **Effort**: S — half day. Conditional class swap on the output container, one figure-caption component, copy tweak. Zero new deps, zero schema changes.

### Proposal 4 — Visualize panel: data-structure overlay for variables/collections chapters

- **Cartesian source**: `cartesian-features-1920.png` "Visualize Everything." — the right column shows a graph (nodes 1-13 with red traversal edges) generated FROM the code. Bullet copy: "All interactive elements are dynamic and are procedurally generated based on your inputs."
- **Promptdojo target**:
  - New `components/v2/VisualizePanel.tsx`.
  - Schema: `lib/content/schema.ts` — new optional `step.visualize?: { kind: "list" | "dict" | "set" | "tuple" | "var"; binding: string }`.
  - Mount point: `components/v2/PersistentIDE.tsx:319-366` — visualize panel replaces or sits beside the output panel when `step.visualize` is present.
- **Concrete change**:
  1. After `handleRun`, if `step.visualize` is set, fetch the binding's value from Pyodide via `pyodide.globals.get(binding).toJs(...)`.
  2. Render kind-specific:
     - `list` / `tuple` → horizontal cells with index above each cell (Cartesian's hash-table-as-row style).
     - `dict` → two-column rows (key | value), hairline rows.
     - `set` → unordered chip cluster.
     - `var` → single labeled cell — for primitives this is the boring case but it's the *teaching* case for `01-variables`.
  3. After mutation steps (rerun on append/pop), animate the affected cell with a 200ms ember outline. Tie to motion-reduce.
  4. **Constraint**: Pure Promptdojo aesthetic — hairline borders, ink-200 cell content, ember accent for the just-changed item. No D3, no force-directed graphs, no force layouts. Lists/dicts/sets only in V4. Defer trees/graphs to V5 if ever (Promptdojo's curriculum doesn't currently teach them).
- **Why it lifts the IDE feel**: The variables/lists/dicts chapters (early curriculum, where most learners actually live) get a visual `appendix` to every run. Cartesian does this as their #1 feature for a DSA book; for a Python fundamentals book, the right scope is just the four built-in containers. **Bounded and shippable.** This is the move that makes a learner say "huh, I can SEE what `.append` does" and that's the textbook bar.
- **Effort**: M — 2 days for the panel + 4 kind-renderers. Schema field + content opt-in, ~10 lessons in 03-collections benefit.

### Proposal 5 — "Edit. Run. Test. Repeat." treatment as the IDE eyebrow on `write` / `fix` / `checkpoint`

- **Cartesian source**: `cartesian-edit-run-test-1920.png` — the section title `Edit. Run. Test. Repeat.` with each word in a different color (green / red / magenta / dark). Rhythmic, instructional, a brand line that lives ABOVE the framed editor.
- **Promptdojo target**: `components/v2/LessonStepClient.tsx` (the prompt panel — wherever the step's title/eyebrow currently renders for write/fix/checkpoint) and/or `components/v2/PersistentIDE.tsx:230` (above the file tab strip).
- **Concrete change**: For step types where the verb pattern fits (`write` = "edit. submit. ship.", `fix` = "find. fix. pass.", `checkpoint` = "build. run. lock it in."), render a tiny per-step verb tricolon as the eyebrow on the editor itself, ember/ink alternating. Two-line max, lowercase, period after each word. **Not** on every step — only on the work-mode trio.
- **Why it lifts the IDE feel**: The IDE on a `fix` step today reads identical to a `write` step. Adds a brand-voice signal that this is the "fix" mode. Cartesian's tricolon is verbatim quotable; this is the cheapest "the IDE knows what kind of step it's on" surface. Pairs with proposal 1's chrome distinction — frame mode for study, eyebrow tricolon for work.
- **Effort**: XS — 2 hours. Tiny styled component, three step views call it.

### Proposal 6 — Named challenge tag on `checkpoint` (the "TWO SUM" / "TARGET 12" treatment)

- **Cartesian source**: `cartesian-edit-run-test-1920.png` and the playback strip in the lower frame both show a hairline-bordered tag `TARGET 12` and elsewhere `TWO SUM`. Each problem has a *name* that gets watermarked in the chrome.
- **Promptdojo target**: `components/v2/steps/CheckpointStepView.tsx` and `PersistentIDE.tsx` chrome.
- **Concrete change**:
  1. Schema: `step.checkpointName?: string` (already exists as `step.title` for checkpoint; just promote it visually).
  2. Render as a hairline-bordered uppercase tag in the chrome titlebar of the editor: `[ FORMATTED RECEIPTS ]` styled like a print label — Cartesian's exact treatment.
  3. After pass, the tag flips to ember-tinted with a checkmark — `[ ✓ FORMATTED RECEIPTS ]`. Persists on the page until the user navigates away. Tiny win, big "I did it" moment.
- **Why it lifts the IDE feel**: Checkpoints today blend into the lesson stream (`audit-v3/05-ide-deep-dive.md:317-318` flagged this). A named, watermarked challenge inside the IDE chrome makes a checkpoint feel like a problem-set entry rather than another step. Three months from now Josh can post "I just shipped the FORMATTED RECEIPTS checkpoint in Promptdojo" and that's a legible artifact.
- **Effort**: XS — 1 hour. Pure styling + one prop.

### Proposal 7 — Hairline progress rail bottom-of-IDE on cold start

- **Cartesian source**: Less direct — but Cartesian's pricing card uses `1px solid #4B4B4B` borders + square corners as the entire visual chassis. The brand is "hairline rules everywhere." Today's Promptdojo has `app/globals.css` `ProgressHairline.tsx` already in the brand vocabulary.
- **Promptdojo target**: `components/v2/PersistentIDE.tsx:281-292` (status row above the run button) — extend with a 1px wasm-fetch-percentage rail. V3 pick #6 specced this; bumping for V4.
- **Concrete change**:
  1. Worker-side: stream the `pyodide.asm.wasm` fetch via the `ReadableStream` reader API on `Response.body`, postMessage `{ type: "boot-progress", pct: 0..1 }`.
  2. Render a 1px ember-to-ink hairline below the status copy, animating width 0→100%. Uses the existing `ProgressHairline` styling vocabulary.
  3. On 100%, the rail dissolves (200ms fade, motion-reduce → instant).
- **Why it lifts the IDE feel**: This is the V3 #6 pick still missing — but framing it through Cartesian's "everything is a hairline rule" lens makes the **visual treatment** obvious. Don't build a fat progress bar; build a Cartesian-quiet 1px line.
- **Effort**: S — half day, V3 #6 carryover.

### Proposal 8 — Inline blank widgets for `fill` (V3 #5 carryover, framed by Cartesian)

- **Cartesian source**: Code Playback panel — every position in the code that the learner can interact with (custom inputs, "you can provide your own values, test edge cases, and simulate corner-case scenarios") sits **inside the editor**, not in a sidebar form.
- **Promptdojo target**: `components/v2/steps/FillBlankStepView.tsx` rewrite, new `lib/codemirror-blank-widget.ts`, `PersistentIDE.tsx` widgets prop. (V3 #5.)
- **Concrete change**: As specced in V3 (`audit-v3/05-ide-deep-dive.md:196-201`). Cartesian gives us the **visual proof** — interactive cells live inside the framed editor, not outside it.
- **Why it lifts the IDE feel**: Closes the V1-flagged "moat breaks here" finding. The `fill` step today renders the IDE as decoration; Cartesian's playback proves that an interactive textbook lives inside the code panel, not adjacent to it.
- **Effort**: M — 2 days, V3 #5 carryover.

---

## Don't lift these from Cartesian

1. **Title-Case display serif (Abril Fatface) inside the editor chrome.** The font is gorgeous on Cartesian's marketing sections but would clash with `JetBrains Mono` / the IDE's monospace voice. Editor titlebars stay mono.
2. **The 12:56 timecode + transport controls in the editor.** Cartesian's "play/pause/stop" transport (top-right of the code panel in `cartesian-edit-run-test-1920.png`) implies the code is a recording. For Promptdojo's playback (Proposal 2), the strip itself is the transport — don't add a separate VCR. Two affordances for one job is sloppy.
3. **The cream paper background on dark code.** Cartesian's editor background reads as cream-tinted to match the page. Promptdojo's editor is `ink-950` (`PersistentIDE.tsx:230`) and that's correct — ember on warm-cream loses the brand heartbeat. Frame the editor with paper bezels, but **keep the editor body dark**.
4. **Pre-rendered framed PNGs/GIFs as visualization.** Cartesian ships a hand-illustrated GIF for "Visualize Everything." That works for marketing screenshots; for *runtime* visualization it's not real. Promptdojo's Visualize Panel (Proposal 4) generates from live values, not assets. Don't ship pre-baked diagrams.
5. **The "Implementation (Sorted Pair Sum (Two Pointers))" titlebar verbosity.** Three nested parens in a chrome titlebar is too dense for Promptdojo's lowercase voice. Single-noun chrome titles only — `the example`, `your work`, `the bug`.
6. **Paid-content gating / "limited time" pricing language anywhere near the IDE.** Cartesian's IDE is a screenshot pitching a $35 download. Promptdojo's IDE *is* the product. No upsell chrome, no "preview this lesson" gating in the editor.
7. **Square-corner everything.** Cartesian's letterpress aesthetic uses `border-radius: 0`. Promptdojo runs `rounded-md` and the IDE chrome should match (4-8px). Bezels yes, square corners no.

---

## Top 8 IDE moves ranked

Ranked by `(visual delta to "textbook IDE" feel × pedagogical value) / dev effort`. P0/P1/P2 reflects ship priority for V4.

| # | Move | Effort | Tier | Lift |
|---|---|---|---|---|
| 1 | **Output-as-document on `chrome="frame"` step types** (Proposal 3) | S | P0 | Single biggest "this is a textbook, not Replit" register flip. Half day, no deps, no schema migration. |
| 2 | **Paper-frame chrome around editor on study steps** (Proposal 1) | S | P0 | Works in lockstep with #1. Visually distinguishes study mode from work mode. Pairs with content-side "the example" caption. |
| 3 | **Step-through playback for `read` and `predict`** (Proposal 2) | M-L | P1 | The textbook moat. Every other in-browser IDE runs once and dumps stdout. This is the move competitors can't copy in a week. Schema-gated, dogfood on collections + functions chapters first. |
| 4 | **Inline `fill` blank widgets** (V3 #5, Proposal 8) | M | P1 | Closes the V1 "moat breaks here" finding. Cartesian's playback frames make the case visually — interactive cells live IN the editor. |
| 5 | **Visualize panel for list/dict/set/var bindings** (Proposal 4) | M | P1 | Bounded scope (4 kinds), high impact on early curriculum. The "I can SEE what `.append` does" moment. |
| 6 | **"Edit. Run. Test. Repeat." tricolon eyebrow on work steps** (Proposal 5) | XS | P2 | Almost free. Differentiates write/fix/checkpoint visually beyond the prompt-panel title. |
| 7 | **Named checkpoint tag in editor chrome** (Proposal 6) | XS | P2 | One hour. Makes checkpoints feel like named problems. Brand artifact ("I shipped FORMATTED RECEIPTS"). |
| 8 | **Hairline cold-start progress rail** (Proposal 7 / V3 #6) | S | P2 | V3 carryover, framed through Cartesian's hairline aesthetic. Half day. |

**P0 budget: 1 day. P0+P1 budget: ~7 dev-days.** First two ship together as one PR; #3-#5 each ship as own PR with their schema field gated to opt-in lessons.

---

## V3 IDE picks still missing

These remain in the queue from `audit-v3/05-ide-deep-dive.md` and are **not redone here** — but flagging because V4 still needs them:

- **V3 #2 — Format Python tracebacks.** Stderr is still dumped raw at `PersistentIDE.tsx:362-364` (the err pre tag). The single biggest "errors stop being a wall of red" win. **1 dev-day. Still the highest feelings-per-hour change in the report.** A textbook-grade IDE that lets a `KeyError` smear unparsed across the output panel is a contradiction in terms. Ship before any V4 polish.
- **V3 #4 — Pyodide cold-start hairline progress.** Re-specced as Proposal 7 above with the Cartesian framing; same V3 work, different visual treatment. Still missing.
- **V3 #8 — Run history (last 5 runs).** Not specced again here; Cartesian's playback (Proposal 2) is a different axis of "see what happened" — playback is *within one run*, history is *across runs*. Both still wanted. Run history is a 4-hour win once the output panel has the new figure-caption layout from Proposal 3 (run history strip slots cleanly above the figure).

V3 picks #1 (theme), #4 (closeBrackets/bracketMatching/indentWithTab), and #7 (reset button — partial; `reset()` is on the imperative handle but no UI surface exists yet) are the only ones meaningfully landed. The other 12 V3 priorities (autocomplete, lint, fill widgets, editable ranges, keyboard shortcuts, stop button, SW cache, mobile gate, chrome consolidation of show-solution, etc.) are still on the queue. **V4's job isn't to replace that queue — it's to add the 8 textbook-discipline moves above on top of it.**

---

## Summary

The four lifts that matter most: **frame study steps in paper bezels (Proposal 1) + soften the output to figure-caption (Proposal 3) + add step-through playback for read/predict (Proposal 2) + add a Visualize panel for list/dict/set/var bindings (Proposal 4)**. The first two ship in a half day each and flip the IDE's register from "embedded Replit" to "textbook figure" with zero new dependencies. Proposals 2 and 4 are where Promptdojo passes Cartesian — Cartesian's visualizations are pre-rendered GIFs, Promptdojo's would be live. That's the bar.

File touch points cited:
- `components/v2/PersistentIDE.tsx:230, 281-292, 319-366, 159-179, 213-216`
- `components/v2/LessonShell.tsx`
- `components/v2/steps/PredictStepView.tsx:96-101`, `ReadStepView.tsx`, `CheckpointStepView.tsx`, `FillBlankStepView.tsx`
- `lib/codemirror-theme.ts:1-74` (already shipped — don't re-spec)
- `lib/use-pyodide.ts:1-66`
- `lib/content/schema.ts` (new optional fields: `chrome`, `playback`, `visualize`, `snippetName`, `checkpointName`)
- `public/pyodide-worker.js:34-52` (extend `__ck_run` with `sys.settrace` for playback)
- New: `components/v2/PlaybackStrip.tsx`, `components/v2/VisualizePanel.tsx`, `lib/codemirror-blank-widget.ts`

— end —
