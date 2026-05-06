# Interactive Features — Technical Feasibility

> Feasibility lead for Promptdojo V4. Three interactive features lifted from Cartesian: step-through playback, visualize panel, inline fill-blank widgets. Pivot is **interaction, not chrome**. Site design stays.
>
> Source baseline: `components/v2/PersistentIDE.tsx`, `lib/use-pyodide.ts`, `public/pyodide-worker.js`, `lib/content/schema.ts`.
> Stack constraints: Pyodide 0.28.3, CodeMirror 6, React 19, Next.js (project-flavored). No new heavy deps.

---

## Executive summary

**Hard**: step-through playback. The trace approach is well-trodden Python (`sys.settrace`), but the WASM-side Pyodide ↔ JS bridge, locals serialization, and bounded memory budget are where most schedule risk lives. **Easy**: inline fill-blank widgets — CodeMirror 6 has `WidgetType` decorations purpose-built for this; the existing `FillBlankStep` schema already gives us blank IDs, accept lists, and per-blank normalization. **Middle**: visualize panel — pure React + CSS, no library, but binding extraction has to ride on top of the playback trace events to feel cohesive (otherwise we're running Python twice).

**Realistic dev budget for all three**: **~10 evening dev-days** (≈40 focused hours).

| Feature | Hours | Complexity | Schedule risk |
|---|---|---:|---|
| Step-through playback | 16h | High | Medium-high — trace overhead, locals serialization edge cases |
| Visualize panel | 10h | Medium | Low — bounded scope (4 kinds), no new deps |
| Inline fill-blank widgets | 12h | Medium | Low-medium — multi-blank fenced code is the only trap |

Build order: **Fill-blank first** (lowest risk, unblocks the broken `fill` step type). **Playback second** (the moat move). **Visualize third** (rides playback's frames buffer for free).

---

## Feature 1: Step-through playback

### Approach

**Decisive**: instrument Pyodide's CPython interpreter with `sys.settrace`, emit one event per `'line'` callback into a Python-side ring buffer, ship the buffer to the main thread as a single `frames` payload at end of run. **Not** real-time streaming. **Not** byte-code-level. **Not** PEP 657 column-spans.

**Why settrace and not the alternatives**:

- **`sys.setprofile`** fires only on `call`/`return`/`c_call`/`c_return`/`exception`. Misses every line transition inside a function — so you can't see `i` increment in a loop, which is *the* pedagogical use case. Reject.
- **Bytecode-level tracing** (e.g. Hypotrace-style frame.f_lasti polling) gives you sub-line resolution. Massive overkill for "watch the variable change". Pyodide doesn't ship a friendly bytecode disassembly API in the worker context. Reject.
- **Pure-Python interpreter** (writing our own `ast.NodeVisitor` walker that pretends to be Python). Theoretically gives perfect control over what counts as a "step." In practice this is a 6-month project that never matches CPython semantics. Hard reject.
- **Pyodide's `pyodide.code.run_js`-with-checkpoint pattern**. Doesn't exist as a stable API in 0.28.3.
- **`sys.settrace` (chosen)**: line-granular, native CPython, bounded overhead (~3-5x slowdown on traced regions but trivially fine for ≤ 200-frame programs). Standard library, zero new deps.

The trace function lives in Python, not JS. Critical: a JS trace function would round-trip through the JS↔Wasm boundary on every line and tank performance. Python-side trace appends to a Python list, then we marshal once at the end via `to_js()`.

**Trace scope guard**: `sys.settrace` fires for every frame including stdlib internals. Filter on `frame.f_code.co_filename == '<exec>'` (the synthetic filename Pyodide gives `exec`-ed user code) so we only trace user lines, not `traceback.py` or `io.StringIO.write`. Without this filter a 30-line user program would emit ~5000 frames.

**Step semantics**: trace event types `('call', 'line', 'return', 'exception')`. We record on `'line'` only. We do *not* record `'call'` (would double-emit on first line of every function), and we record `'return'` *only* when it raises (exception handling — see Failure modes).

### State extraction

**`frame.f_locals` snapshot per line, with three filters**:

1. **Drop callables and modules**: `if not callable(v) and not isinstance(v, types.ModuleType)`. Strips out the function being defined, imported names, etc.
2. **Drop dunder names**: `if not k.startswith('__')`. Strips `__name__`, `__builtins__`.
3. **Whitelist scalar + container types** for serialization:
   - `int`, `float`, `bool`, `str`, `None` → JSON literal
   - `list`, `tuple` → recurse (depth ≤ 3, length ≤ 50, then truncate to `[...18 more]`)
   - `dict` → recurse (key count ≤ 50)
   - `set`, `frozenset` → sort-by-repr, length ≤ 50
   - Anything else → `repr(v)[:80]` as a string label, marked `{ kind: "opaque", repr: "..." }`

**`f_locals` is a snapshot, not a live reference**. This matters: in CPython, `frame.f_locals` is a fresh dict each access for non-optimized frames; for the top-level `exec` frame it's the globals dict, so we copy explicitly with `dict(frame.f_locals)` then filter. The non-serializable cases (file handles, generators, custom classes, lambdas):

- File handles → `repr` shows `<_io.TextIOWrapper name='foo.txt' mode='r' encoding='UTF-8'>`. Truncated to 80 chars and labeled opaque. Good enough for V4.
- Generators → `repr` shows `<generator object foo at 0x...>`. Same opaque treatment. Visualize panel doesn't try to render these.
- Custom classes (Ch15 `classes-basics`) → if `__dict__` exists, render as a pseudo-dict labeled `<ClassName>{ ... }`. Specifically: `{ kind: "instance", cls: type(v).__name__, attrs: {...filtered f_locals-style} }`.
- Lambdas → callable, dropped.

**Snapshot diffing** is done client-side, not in Python. We ship the full filtered locals every line. Reasoning: (a) Python-side diff requires keeping the previous snapshot in worker memory and is fiddly, (b) JSON delta on the JS side is trivial with object equality, (c) for ≤ 200 frames × ≤ 10 vars × ≤ ~80 bytes/var = ~160KB pre-gzip, tiny.

### Worker protocol

**No streaming. One batched payload at end of run.** `postMessage` is cheap but every cross-thread hop allocates and the structured-clone serializer doesn't compress. For 200 frames that's still 200 messages and 200 React state updates. Single payload at the end means one render after run completes, and the playback strip drives all subsequent renders by indexing into the in-memory frames array.

Wire shape (extends current `RunResult`):

```ts
// lib/use-pyodide.ts
export type RunFrame = {
  line: number;            // 1-based source line
  locals: SerializedScope; // see SerializedScope below
  stdoutDelta: string;     // text written to stdout since previous frame
};

export type SerializedValue =
  | { kind: "scalar"; value: number | string | boolean | null }
  | { kind: "list"; items: SerializedValue[]; truncated: number }
  | { kind: "tuple"; items: SerializedValue[]; truncated: number }
  | { kind: "dict"; entries: Array<[string, SerializedValue]>; truncated: number }
  | { kind: "set"; items: SerializedValue[]; truncated: number }
  | { kind: "instance"; cls: string; attrs: Record<string, SerializedValue> }
  | { kind: "opaque"; repr: string };

export type SerializedScope = Record<string, SerializedValue>;

export type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  durationMs?: number;
  // New:
  frames?: RunFrame[];        // present only when runWithTrace was called
  framesTruncated?: boolean;  // true when ring buffer hit cap
};
```

Worker request payload gains a `trace: boolean` flag:
```ts
w.postMessage({ type: "run", id, code, trace: true });
```

Hook gains `runWithTrace(code) → Promise<RunResult>`. The default `run(code)` stays trace-off — read/write/fix/checkpoint steps that don't need playback don't pay the trace tax.

### Memory budget

**Estimate for the 100-line program / 50 frames / 10 vars cited**:
- Per-var JSON cost: ~40 bytes average (scalar names + small ints/strs).
- Per-frame: 10 vars × 40 bytes + line number + stdoutDelta empty string ≈ 450 bytes.
- 50 frames × 450 = ~22 KB per run. Negligible.

**Upper bound**: cap the worker-side ring buffer at **500 frames**. Beyond that, set `framesTruncated: true` and stop appending. 500 frames × 2 KB worst-case (10 vars, mid-size lists) = ~1 MB peak. The IDE renders a banner: `"playback truncated at frame 500 — too long to step through this run"` and falls back to plain stdout view. **Loops > 500 iterations are explicitly out of scope for playback** — chapters that loop deeply (capstone, agent-loops) just don't opt in.

**Per-value caps** (enforced in Python serializer):
- String values truncated to 200 chars + `…(N more)`
- List/tuple/set: 50 items + `…(N more)`
- Dict: 50 entries + `…(N more)`
- Recursion depth: 3. Beyond that, render as `<dict>` opaque label.

### Schema additions

```ts
// lib/content/schema.ts — added to StepBaseFields:
playback: z.boolean().default(false),
// Optional: which variables to highlight in the visualize panel.
// If absent, visualize panel auto-shows the top-3 most-recently-changed.
playbackFocus: z.array(z.string()).optional(),
```

**Per-step, not per-lesson**. Reasoning: a single lesson (e.g. `02-functions/03-return-values`) might have 5 steps where only the `predict` and the `read` benefit from playback. The `mc` and `fill` steps don't need it.

The `playback: true` flag is **only meaningful on `read`, `predict`, `mc`** (the study-mode trio that already has `code` populated). Build script (`scripts/build-content-v2.mjs`) adds a validation: error if `playback: true` is set on `write`/`fix`/`checkpoint`/`reorder`. Those step types are the work-mode trio; learners want raw run there, not narrated playback.

### Failure modes + handling

| Failure | Detection | Handling |
|---|---|---|
| **Infinite loop** | Trace buffer hits 500 frames | Hard-stop via `sys.settrace(None)` from a counter inside the trace fn, raise a synthetic `RuntimeError("playback aborted: > 500 steps")`. Stderr surfaces. Frames still ship up to the cap. |
| **OOM in user code** (huge list) | Pyodide throws `MemoryError`; serialization step itself bombs | The serializer wraps each value lookup in `try: ... except: opaque`. So one giant list doesn't kill the whole frame. The frame ships with that var marked opaque. |
| **Exception during normal execution** | Trace fn sees `'exception'` event | Don't record it as a frame. Let the standard `traceback.print_exc()` path fire. Frames captured up to the crash still ship — playback strip terminates at last successful line. UI shows `"crashed at step N — stderr below"`. |
| **`async`/`await` code** | Top-level await isn't supported by Pyodide's `exec` anyway. | No special handling needed for V4. Curriculum doesn't teach async until much later (and it's not on the V4 schema-opt-in list). |
| **Multi-threaded code** (`threading`) | `sys.settrace` is per-thread; spawned threads aren't traced | If a lesson uses threads (none currently do), playback shows main-thread events only. Document this caveat in the schema comment, not a runtime concern for V4. |
| **`input()` calls** | Worker has no stdin | Already a problem today; no behavior change. Read steps with `code` containing `input()` should never opt in to `playback`. Build-script validator: regex-flag `\binput\s*\(` on `playback: true` steps and emit a build warning. |
| **Recursion depth blow-up** | `RecursionError` | Trace fn pops cleanly (it's frame-scoped); the buffer captures the chain up to the limit, the error frame surfaces, playback strip ends at the last user-line frame. |
| **Generators / lazy evaluation** | `frame.f_locals` for a generator function only populates on `.next()` | Visualize panel renders the generator var as opaque. Already covered by serialization fallback. |
| **User code redefines `sys.settrace`** | Trace gets disabled mid-run | Acceptable. They asked for it. Frames stop appending; the playback strip shows what we have. |

**Hard-error fallback**: if the trace harness itself raises (bug in our serializer), we catch in the worker and re-run the same code without trace. User sees stdout normally, no playback strip, dev-only console warning fires.

### Dev cost: **16h**

- Worker-side trace harness + serializer (Python): **5h**
- Hook + protocol changes (`use-pyodide.ts`, `pyodide-worker.js`): **2h**
- `<PlaybackStrip>` component (numbered pills, ←/→ keyboard, click-to-jump): **3h**
- CodeMirror line decoration (ember left-rail on active frame's line): **2h**
- Schema field + build-script validator: **1h**
- Wire-up in `ReadStepView` / `PredictStepView` / `MultipleChoiceStepView`: **1h**
- Two opt-in lessons authored to dogfood (`02-functions/03-return-values`, `03-collections/01-lists/iteration`): **1h**
- Failure-mode tests (infinite loop, exception mid-run, memory cap): **1h**

---

## Feature 2: Visualize panel

### Approach

**Decisive**: pure HTML/CSS rendered as React components, sourced from the playback trace's `frames[currentFrame].locals`. **No D3, no SVG library, no `<canvas>`.** Tailwind utility classes + a single new component.

**Alternatives rejected**:
- **`react-d3-tree` / `d3` / `vis-network`** — 30-100KB minified, force-directed graphs we don't need. The brief explicitly bounds scope to lists/dicts/sets/scalars; box-and-cell rendering is `<div>` work.
- **`<canvas>`-based rendering** — gives us pixel-perfect animation but kills a11y, screen reader semantics, and dev velocity. Reject.
- **Pre-rendered SVG diagrams shipped with the lesson** — Cartesian's exact pattern, and explicitly called out as the wrong choice in `06-ide-cartesian.md` (proposal 4): "Promptdojo's would be live."

The visualize panel **mounts inside the existing output panel area** (next to or replacing stdout when `step.visualize` or `step.playback` is set, per the audit). It reads from the same `frames` buffer that powers the playback strip — there is no separate "visualize-only" code path. **One run, one buffer, two views.**

### Variable selection

**Both auto-detect and author-declared, with author wins**:

```ts
// schema addition (StepBaseFields):
visualize: z
  .object({
    // Empty array = "auto-pick top 3 most-changed". Otherwise show these.
    bindings: z.array(z.string()).default([]),
    // Override default kind detection per binding (rare).
    kindHints: z.record(z.string(), z.enum(["list", "dict", "set", "tuple", "var"])).optional(),
  })
  .optional(),
```

**Auto-detect rule**: when `step.visualize` is absent but `step.playback === true`, the panel scans frames for variables that change across frames (≥2 distinct serialized values), ranks by mutation frequency, picks top 3. Caches this once per run, not per frame.

**Author-declare rule**: when `step.visualize.bindings` is non-empty, those bindings render in declared order. Missing bindings (typo, or var not yet bound at frame N) render a hairline placeholder cell with caption `name (not yet defined)`.

### Render approach

Single component, kind-discriminated:

```tsx
// components/v2/VisualizePanel.tsx (sketch)
type Props = {
  scope: SerializedScope;          // current frame's locals
  prevScope?: SerializedScope;     // previous frame's locals — for diffing
  bindings: string[];              // names to render
  reduceMotion: boolean;           // from useReducedMotion()
};
```

- **Scalar** (`var`): `<div className="hairline-card">{name} = <code>{value}</code></div>`
- **List/tuple**: row of `<div className="cell">` per item, index above. Numbered 0..N. Truncation tail renders `+N more` chip.
- **Dict**: two-column hairline grid. Left column key (mono, ink-300), right column value (mono, ink-200).
- **Set**: chip cluster, no order indicator.
- **Instance**: `<ClassName>` header + nested kvs (renders like dict).
- **Opaque**: hairline pill `<repr…>`.

Bundle weight: ~3-4 KB minified additional component code. Zero new dependencies.

### Diff animation

**CSS transitions only, ≤ 200ms.** Implementation:
- Each cell carries a stable `key` (e.g. `list:items[3]` for a list element, `dict:items["foo"]` for a dict entry).
- On `prevScope` → `scope` diff (cheap JSON.stringify equality per cell, since scopes are small):
  - **New cell** (didn't exist last frame): mount with `data-state="entered"`, CSS animates `opacity 0 → 1` + `border-color ember → ink-700` over 200ms.
  - **Mutated cell** (existed, value changed): toggle `data-state="changed"` for one frame tick, CSS pulses `box-shadow` ember → none over 240ms.
  - **Removed cell** (existed, gone): unmount immediately. No exit animation in V4 — the `<PlaybackStrip>` is already a deliberate transport so users won't perceive list shrinks as instant.
- **Stagger**: `transition-delay: calc(var(--idx) * 20ms)` on entered cells, capped at 5 cells (so a `range(100)` doesn't take 2s to animate in).
- **Motion-reduce**: when `prefers-reduced-motion: reduce`, drop all transitions. Cells just appear. Already handled by Tailwind `motion-reduce:` modifiers used elsewhere in the codebase.

### Reference-vs-value (the WEDGE narrative)

This is the **mutable-default-arg** lesson's whole story. Two function calls share the same list object → visualize panel must show that.

**Solution**: **object identity tracking**. Python `id()` is stable for the lifetime of the object. We add `id` to the serialized payload for non-scalar types only:

```ts
type SerializedValue =
  | { kind: "list"; id: number; items: ...; truncated: number }
  | { kind: "dict"; id: number; entries: ...; truncated: number }
  // ...scalar kinds don't carry id (immutable)
```

When two bindings share the same `id`, the panel renders them with a **shared border color** (a deterministic hash of `id` → hue, but using only Promptdojo's palette: ember / ok-green / a third desaturated accent for the rare 3-way alias case). Above the visualize panel, a small caption: `cache and history reference the same list`.

For the canonical mutable-default-arg lesson (`mutation-and-state` / `02-mutation-bites`):

```python
def add_pet(name, pets=[]):
    pets.append(name)
    return pets

dog_owner = add_pet("rex")
cat_owner = add_pet("luna")  # both bindings now share the same list!
```

After the second call, `dog_owner` and `cat_owner` both have `id` X (the default arg list). Panel shows them side-by-side with the alias caption. **This works for V4** because `id` is just an integer and our serializer already has access to it.

### Update cadence

**Re-render only when `currentFrame` changes**, not per frame in real time. The `<PlaybackStrip>` owns the active-frame state; the visualize panel is a pure function of `frames[currentFrame].locals` and `frames[currentFrame - 1].locals`. React 19's compiler handles memoization fine; no manual `useMemo` needed for the diff.

If the user clicks the strip rapidly (frame 5 → 6 → 7 → 8 in 200ms), CSS transitions cancel naturally — the entered/changed `data-state` resets each render. No throttle, no debounce.

### Schema additions

```ts
// StepBaseFields, in addition to playback above:
visualize: z
  .object({
    bindings: z.array(z.string()).default([]),
    kindHints: z.record(z.string(), z.enum(["list", "dict", "set", "tuple", "var"])).optional(),
  })
  .optional(),
```

### Dev cost: **10h**

- `<VisualizePanel>` + 5 sub-renderers (scalar/list/dict/set/instance): **4h**
- Identity-aliasing display (border colors, caption): **1.5h**
- CSS diff animations + reduce-motion: **1.5h**
- Schema field + auto-detect ranking heuristic: **1h**
- Wire-up next to playback strip in IDE output panel: **1h**
- Two opt-in lessons (`03-collections/01-lists/iteration`, `mutation-and-state/02-mutation-bites`): **1h**

---

## Feature 3: Inline fill-blank widgets

### Approach

**Decisive**: CodeMirror 6 **`WidgetType` decorations** placed at `___NAME___` token positions. Widgets render a real `<input>` element, **CodeMirror replaces the source text range** with the widget. Author code stays as plain Python in the YAML/MD source.

**Alternatives rejected**:
- **Placeholder text only** (CM's `placeholder` extension) — placeholders are static, not interactive, and don't capture input. Not a fit.
- **A separate prompt panel below the editor** (current V3 behavior) — explicitly the thing we're replacing. The audit flags this as broken (`audit-v3/05-ide-deep-dive.md:196`).
- **`@codemirror/lang-python` plugin extension** to teach the parser about `___NAME___` as a token — way over-engineered. Decoration-based widgets do the job.
- **React portals into the editor** — fragile across CM re-renders. CM's own `WidgetType` lifecycle is the right abstraction.

The widget extension lives in a new file `lib/codemirror-blank-widget.ts`, takes a `blanks: BlankSpec[]` config + an `onChange(blankId, value)` callback, returns a `StateField + decorations` extension to be added to the editor. The extension is **only** added when the active step is a `fill` step.

### CodeMirror approach

Pseudo-implementation:

```ts
// lib/codemirror-blank-widget.ts (sketch)
import { EditorView, Decoration, WidgetType } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

class BlankInputWidget extends WidgetType {
  constructor(
    readonly blankId: string,
    readonly value: string,
    readonly width: number,
    readonly state: "neutral" | "correct" | "wrong",
    readonly onChange: (id: string, v: string) => void,
  ) { super(); }

  toDOM() {
    const input = document.createElement("input");
    input.type = "text";
    input.value = this.value;
    input.dataset.blankId = this.blankId;
    input.dataset.state = this.state;
    input.style.width = `${this.width}ch`;
    input.className = "cm-blank-input"; // styled in codemirror-theme.ts
    input.spellcheck = false;
    input.autocomplete = "off";
    input.addEventListener("input", (e) => {
      this.onChange(this.blankId, (e.target as HTMLInputElement).value);
    });
    return input;
  }

  // Critical: equality controls when CM tears down + rebuilds the widget.
  // Same id + same value + same state = no rebuild = preserves focus + caret.
  eq(other: BlankInputWidget) {
    return other.blankId === this.blankId
      && other.value === this.value
      && other.state === this.state;
  }

  // Don't let CM swallow input events into editor commands.
  ignoreEvent() { return true; }
}
```

The extension scans the document for the marker pattern (`___ID:width___` — see schema below), creates a `Decoration.replace()` over each match, and rebuilds the decoration set when blank values change via a `StateEffect`.

**Focus preservation across re-renders** is the load-bearing detail. CM rebuilds the widget on every doc change, but with `eq()` returning true for unchanged blanks, the existing DOM node is reused — focus and caret position survive. **This is the single thing that breaks current V3**. The fix is correctness on `eq()`.

### Validation

**Three timing layers**:

1. **On every keystroke** — light validation only (length > 0). Updates the visual `data-state` on the input from `neutral` → `dirty` (subtle ink-300 underline). **Does not** reveal whether the value is correct. Goal: the learner doesn't get correct-flash distractions while typing.
2. **On blur** — no validation. Blur is non-committal.
3. **On submit (existing "Check" button)** — full `blankAccepts()` from the existing `_grader.ts` runs per blank. Widget state flips to `correct` (ember accent border, ink-200 fill) or `wrong` (ink-700 border, ember dotted underline). Submitted+correct blanks become `readOnly`.

This mirrors the existing FillBlankStepView semantics (`submitted` flag controls input lockout). The state model doesn't change; the rendering surface does.

**Multi-blank Tab behavior**: pressing Tab inside a blank input advances to the next blank in source order. Implemented as a global keydown listener on the editor wrapper that finds `[data-blank-id]` siblings and `.focus()` the next one. Shift+Tab reverses. Enter submits if all filled.

### Schema

**Author-friendly inline marker, build-time parsed.** Authors write blanks inline in the `code` field:

```python
# Source YAML:
code: |
  def greet(name):
      message = ___GREETING___
      print(message)
```

**Marker grammar**: `___ID___` where `ID` is a UPPERCASE_SNAKE identifier. The build script (`scripts/build-content-v2.mjs`) transforms this on the way in:

1. Parse the `code` field for `/___([A-Z_]+)___/g` matches.
2. For each match, look up the corresponding `blanks[].id` (must match — case-insensitive comparison).
3. Replace the source range with a per-blank stable token: `___BLANK_<id>___` (kept in source so CM can find it; same length as the original which makes width estimation simple).
4. Validate: every `blanks[].id` must appear at least once in `code`; every `___X___` in `code` must have a matching entry in `blanks`. Build error on mismatch.

The existing `blanks: [...]` array in the `FillBlankStep` schema **stays as the source of truth for accept lists, normalization, case sensitivity** — only the rendering location changes.

**Width hint** (optional): authors can write `___ID:8___` to declare an 8-character width for the input. Default width = `max(4, len(longest accepted answer) + 1)` chars. This is purely cosmetic.

```ts
// schema.ts — FillBlankStep gains nothing structurally. Build script enforces:
// - blanks[].id ∈ matches in code
// - matches in code ∈ blanks[].id
// - prompt no longer renders blanks itself (deprecation warning if `___` in prompt)
```

**Backwards-compat note**: the existing 44 fill-step lessons have blanks rendered in `prompt`, not `code`. Migration is mechanical:
- Move the `___` markers from `prompt` to `code`.
- If `code` is absent on a fill step (some lessons have prompt-only blanks like "Type the keyword that…"), keep the V3 in-prompt rendering as a fallback. Schema-detect: if `code` lacks any `___X___` markers but `blanks[]` is non-empty and `prompt` contains `___`, render with the legacy V3 path.

This means we can ship the new widget for *most* fill lessons (those with code) and leave 5-10 keyword-only fill lessons on the old path. No big-bang migration required.

### Multi-blank lessons

The V3 audit flagged broken IDE-blank rendering for multi-blank fill steps. **Root cause** (inferred from the V3 audit + my read of `FillBlankStepView`): the existing path renders blanks as separate `<input>` elements in the prompt panel, not in the editor. The editor on a fill step shows static read-only code with `___` literals visible. Confusing.

**The fix**: with widget decorations, multi-blank is automatic. CM's decoration set handles N decorations the same as 1. The eq() implementation per blank preserves per-input focus correctly. Tested mental model: 3-blank lesson, fill blank 1, Tab to blank 2, fill, Tab to blank 3, Enter → submit. Each blank's DOM node is stable because its own `eq()` returns true while the others rebuild.

### Dev cost: **12h**

- `lib/codemirror-blank-widget.ts` extension (widget class + state field + effect): **4h**
- `<PersistentIDE>` integration: pass `blanks` + `onChange` into `extensions` when active step is `fill`: **1.5h**
- Build script `___X___` parsing + validation + width hints: **1.5h**
- `<FillBlankStepView>` rewrite: state moves up, IDE renders the inputs, the prompt panel just shows the prompt text: **2h**
- Multi-blank Tab navigation + Enter-submits: **1h**
- Theme additions in `codemirror-theme.ts` for `.cm-blank-input` states: **1h**
- Migration of existing 44 fill steps (mechanical, scriptable): **1h**

---

## Build order

**Ship order**: Fill-blank → Playback → Visualize.

**Why**:

1. **Fill-blank first**. Lowest risk, highest confidence, fixes a known broken step type. Ships standalone (no other features depend on it). Unblocks V4's "the IDE actually does what fill steps need" claim. If anything slips on the playback bet, fill is already shipped.

2. **Playback second**. The moat move. Cannot ship before fill because (a) CodeMirror line-decoration work in fill is a warm-up for the playback line decoration, (b) sharing the trace harness with visualize requires us to know the trace shape stable, and we want to dogfood it solo before adding the visualize consumer. Ships the trace + strip + ember active-line decoration as one PR.

3. **Visualize last**. Strict dependency on playback's frames buffer. Cheaper to build once playback is stable because we just consume the existing data. Ships visualize panel + auto-detect + opt-in lessons as the third PR.

**Dependencies**:
- Visualize → Playback (frames buffer)
- Playback → Schema additions (build script handles `playback: true` validation)
- Fill-blank → Schema migration (the `___` marker move)
- All three → no shared runtime state; each can be feature-flagged off independently.

**Suggested cadence**: 1 evening = ~2-3h. Fill-blank in PRs of ~3h chunks (4 PRs over a week), playback as 2 bigger chunks (worker + UI), visualize as 1 big PR.

---

## Risks I'm flagging

**1. Playback trace overhead on slower machines.** A 200-line program with traced loops slows ~5x. On a Chromebook this could push a 100ms run to 600ms — still acceptable, but the "ran in 234ms" badge will sometimes show ridiculous numbers. **Mitigation**: report two times, `ran in 67ms · traced in 312ms`, so learners see the trace cost is the artifact of the feature, not their code.

**2. `f_locals` semantics in optimized frames.** CPython doesn't always populate `f_locals` for non-`exec` frames (function locals are normally accessed via fast-locals array). For top-level user code (which is what `exec` runs), this works fine. For functions defined and called within user code, `f_locals` might miss assignments until the next trace point. **In practice this is fine** because `sys.settrace` triggers `frame.f_locals` refresh on each line event for traced frames. But if learners write nested functions and traces look stale, this is the first bug to suspect.

**3. The visualize panel for `class instances` is half-baked.** The chapter `classes-basics` (15 steps) is the natural opt-in, but rendering an `instance` as a pseudo-dict loses the "this is an object with methods" framing. **Punt**: V4 ships scalar/list/dict/set/tuple only as the headline kinds. Instances render as opaque pills with `<ClassName>` label. Defer instance-rendering polish to V5.

**4. Fill-blank build-script validation might fight existing content.** Some of the 44 lessons may have authored `___` in markdown prose (not as a blank marker — as e.g. an emphasis or fill-in-the-blank in English text). **Mitigation**: validator only fires on `___[A-Z_]+___` (uppercase identifier), not bare `___`, so `Fill in the ___` prose stays untouched.

**5. Pyodide's `to_js` recursion has edge cases.** Cyclic data structures (`a = []; a.append(a)`) blow recursion. **Mitigation**: track `id()` set during serialization, on second-visit emit `{ kind: "opaque", repr: "<cyclic>" }`. ~3 extra lines of Python in the serializer.

**6. CodeMirror widget focus-loss on document changes elsewhere.** If anything in the editor outside the widget triggers a doc-change, CM will rebuild the decoration set. Our `eq()` saves us only if the blank's value didn't change. Edge case: if React re-renders `<CodeMirror>` with a new `value` prop (from a `useEffect`), all widgets rebuild. **Mitigation**: confirm the existing draft-preservation logic in `PersistentIDE` (lines 122-141) doesn't reset on fill steps. If it does, gate the seedDrafts effect on `step.type !== 'fill'`.

**Deprioritize-if-tight**: 
- Visualize identity aliasing (the wedge narrative) is the one thing I'd cut if playback overruns. The mutable-default-arg lesson works without it; it's just less *visual*. Saves ~2h.
- The `playbackFocus` schema field. Auto-detect is fine for V4. Saves ~30min of build-script work.

---

## Lesson opt-in matrix

**Step-through playback**: chapters where execution order is the lesson.

| Chapter | Steps that benefit | Why |
|---|---|---|
| `variables` | 6 read + 3 predict = **9 candidates** | "Watch `name` change as we reassign" is the canonical first-week moment |
| `loops` | 6 read + 4 predict = **10 candidates** | The watershed feature for loops — see `i` increment, see the accumulator grow |
| `mutation-and-state` | 4 read + 2 predict = **6 candidates** | This is where playback IS the lesson — alias semantics are invisible without it |
| `lists-and-dicts` | 6 read + 3 predict = **9 candidates** | Watch `.append`, `.pop`, `dict[k] = v` mutate live |
| `error-handling` | 6 read + 3 predict = **9 candidates** | Stepping through try/except/finally — exception propagation visualized |
| `functions` | 6 read + 3 predict = **9 candidates** | Frame-call semantics; in-scope vs out-of-scope highlighted |
| `classes-basics` | 6 read + 3 predict = **9 candidates** | `self.x = ...` mutating the instance; method calls as attribute lookup |
| `tracebacks` | 6 read + 3 predict = **9 candidates** | Step into the failing call; the moment the error appears in the strip |

**Total playback opt-in candidates: ~70 steps across 8 chapters.** I recommend dogfooding 4-6 steps in 2 chapters (variables + mutation-and-state) for V4 launch; expand on the back half of the quarter.

**Visualize panel**: chapters where data shape is the lesson.

| Chapter | Steps that benefit | Why |
|---|---|---|
| `variables` | 6 read = **6 candidates** | Scalar var = name = value boxes; trivial, but the *first* learners see |
| `lists-and-dicts` | 6 read + 3 predict = **9 candidates** | The whole reason this feature exists |
| `mutation-and-state` | 4 read + 2 predict = **6 candidates** | Reference-vs-value diagram; aliasing display |
| `classes-basics` | 6 read + 3 predict = **9 candidates** | Instance-as-record display (limited in V4 — see Risk 3) |
| `structured-output` | 2 read + 1 predict = **3 candidates** | Dict-shape reasoning for LLM JSON outputs |

**Total visualize opt-in candidates: ~33 steps across 5 chapters.** Recommend launching with `variables/01-naming` + `lists-and-dicts/01-list-basics` + `mutation-and-state/02-mutation-bites` (the wedge story).

**Inline fill-blank widgets**: every fill step (no opt-in matrix needed — it's a render upgrade for an existing step type).

| Chapter | Fill steps | Notes |
|---|---:|---|
| `variables` | 3 | All have `code` → migrate cleanly |
| `loops` | 3 | All have `code` → migrate cleanly |
| `lists-and-dicts` | 3 | All have `code` → migrate cleanly |
| `mutation-and-state` | 2 | All have `code` → migrate cleanly |
| `functions` | 3 | All have `code` → migrate cleanly |
| `error-handling` | 3 | All have `code` → migrate cleanly |
| `classes-basics` | 3 | All have `code` → migrate cleanly |
| `files-and-io` | 3 | All have `code` → migrate cleanly |
| `http-and-apis` | 3 | All have `code` → migrate cleanly |
| `prompting` | 1 | May have prose-only blank — fall back to legacy path |
| `secrets-and-env` | 1 | Likely prose-only — fall back |
| ... | (rest) | Audit during migration |

**Total fill steps: 44** (per generated chapters). Budget ~30 minutes to audit which fall back to legacy prose-rendering vs the new widget path.

---

## Dependencies

**Need to add**: **nothing**. Every package required is already installed.

| Capability | Already installed | Used for |
|---|---|---|
| Pyodide CPython runtime | `pyodide@0.28.3` (~6MB wasm) | Playback trace harness |
| CodeMirror widget decorations | `@codemirror/view@6.41.1` (`WidgetType`, `Decoration.replace`) | Fill-blank inline inputs |
| CodeMirror state effects | `@codemirror/state@6.6.0` (`StateField`, `StateEffect`) | Blank value updates |
| Python lang grammar | `@codemirror/lang-python@6.2.1` | Already wired |
| Bracket matching / closeBrackets | `@codemirror/autocomplete@6.20.1`, `@codemirror/language@6.12.3` | Already wired |
| React 19 | `react@19.2.4` | All UI |
| Schema validation | `zod` (already used for content schema) | New schema fields |

**Don't need to add** (and why):
- **`d3` / `d3-array` / `vis-network` / `react-d3-tree`** — visualize panel uses pure CSS box-and-grid layouts. The Cartesian-style hashmap-as-row visual is `flex` + hairline borders.
- **`framer-motion`** — diff animations are CSS transitions only, ≤ 200ms. No physics, no spring, no reorder logic.
- **Custom Python tracing libraries** (`coverage`, `trace`, `viztracer`) — `sys.settrace` from stdlib is sufficient and ships with CPython in Pyodide.
- **Worker pooling libraries** (`comlink`) — single Pyodide worker is fine; the trace payload size is small enough that structured-clone is not the bottleneck.
- **Diffing libraries** (`fast-deep-equal`, `immer`) — we use `JSON.stringify` equality for cells (small scopes; no perf concern). Identity comparison for new vs existing cells uses cell key strings.

**Net dep change**: **+0 packages, +0 KB of new bundle weight.** The only on-the-wire additions are our own `~7 KB` (visualize panel) + `~5 KB` (blank widget extension) + `~3 KB` (playback strip) of new app code. Total ~15 KB minified, ~5 KB gzipped. Under the 5 KB-per-feature target stated in Feature 2.

---

## File touch points (pointer-only — for the implementing dev)

| File | Change | LOC delta |
|---|---|---:|
| `public/pyodide-worker.js` | Add `__ck_run_traced(code)` Python harness; extend message protocol with `trace: bool`; serializer | +120 |
| `lib/use-pyodide.ts` | New `runWithTrace()` method on hook; extended `RunResult` types | +30 |
| `lib/content/schema.ts` | Add `playback`, `playbackFocus`, `visualize` to `StepBaseFields` | +20 |
| `scripts/build-content-v2.mjs` | Validate `playback: true` only on read/predict/mc; parse `___X___` markers in fill code | +60 |
| `components/v2/PersistentIDE.tsx` | Accept `playback` + `visualize` + `blanks` props; conditional render PlaybackStrip + VisualizePanel + blank-widget extension | +80 |
| `components/v2/PlaybackStrip.tsx` | New: numbered pills, ←/→ keyboard, click-to-jump, ember ring on active | +100 |
| `components/v2/VisualizePanel.tsx` | New: 5 sub-renderers (scalar/list/dict/set/instance), diff animations | +200 |
| `lib/codemirror-blank-widget.ts` | New: WidgetType + StateField + Decoration extension | +150 |
| `lib/codemirror-theme.ts` | Add `.cm-blank-input` states (neutral / dirty / correct / wrong) + active-line ember rail | +30 |
| `components/v2/steps/FillBlankStepView.tsx` | Rewrite: blanks live in IDE; this view shows prompt + Check button only | -80 / +60 |
| `components/v2/steps/ReadStepView.tsx`, `PredictStepView.tsx`, `MultipleChoiceStepView.tsx` | Pass `playback`/`visualize` props to `<PersistentIDE>` | +10 each |
| `lib/content-v2.ts` | No change | 0 |

**Total app code delta**: ~+800 LOC, ~-80 LOC = **~+720 net**. Spread across 8 files + 3 new files. None over 800 LOC individually. PR boundaries:

- **PR 1 (fill-blank, 12h)**: `codemirror-blank-widget.ts` + `FillBlankStepView` rewrite + `codemirror-theme` + build-script blank parsing + content migration.
- **PR 2 (playback, 16h)**: `pyodide-worker.js` + `use-pyodide` + `PlaybackStrip` + schema fields + `PersistentIDE` wire + 2 dogfood lessons.
- **PR 3 (visualize, 10h)**: `VisualizePanel` + identity aliasing + 3 dogfood lessons + auto-detect heuristic.

Each PR is independently shippable and reversible. Each is scoped under 1 evening-week of focused work.

— end —
