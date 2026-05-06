# Capture Log

**Date:** 2026-05-06
**Tool:** agent-browser CLI (CDP-attached) + custom node CDP shim for retina deviceScaleFactor=2
**Browser:** local Chrome via agent-browser default session (CDP port 59204)

## Tooling notes / surprises

- `browser-harness` (Josh's normal harness at `~/Developer/browser-harness/`) refused to attach — Chrome's remote-debugging page wasn't fully alive, so the daemon failed with "Chrome's remote-debugging page is open, but DevTools is not live yet on 127.0.0.1:9222". Fallback: `agent-browser` CLI was already healthy (`agent-browser doctor` reported the default session daemon up at pid 54970), so I drove the captures through that.
- agent-browser exposes `set viewport <w> <h>` but **does not expose deviceScaleFactor**. Native captures came out at DPR=1 (e.g. 1910×4535).
- To get retina (DPR=2), I attached a small Node CDP client (`/tmp/cdp-shot.mjs`, 60-line script using Node 24's built-in `WebSocket`) directly to the page's `webSocketDebuggerUrl` and called `Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot` with `captureBeyondViewport=true` and `clip` set to the document size. The shim resets metrics with `Emulation.clearDeviceMetricsOverride` before disconnecting so the page isn't left in a wedged emulated state.
- CDP page websocket pulled from `curl http://127.0.0.1:59204/json` after `agent-browser get cdp-url` revealed the browser endpoint port.

## Curriculum tree

- **URL captured:** `https://promptdojo.pages.dev/curriculum/`
- **Viewport / DPR:** 1920 × 1080 CSS, deviceScaleFactor 2 (retina)
- **Wait strategy:** `agent-browser wait --load networkidle` before capture
- **Full-page PNG:** `assets/curriculum-full.png` — 3840 × 9070, ~1.46 MB
- **Hero crop:** `assets/curriculum-tree.png` — 3360 × 1900, ~375 KB
- **Crop landmarks (CSS px, page coords from `getBoundingClientRect + scrollY`):**
  - Sticky site header: top=0, height=44
  - Hero h1 ("25 chapters · 398 steps · ~6 hours"): top=130, height=56
  - Phase 01 band (`section.border-l-2.border-green-700`): top=274, height=1127
  - Phase 02 band: top=1497
- **Crop math:** dropped sticky header (top 88 px @ 2x), kept hero title + phase 01 band header + 6 chapter tiles (variables, functions, lists and dicts, loops, conditionals, tracebacks), centered horizontally with ~115 CSS-px side margin.
- **ffmpeg command:**

  ```bash
  ffmpeg -y -i assets/curriculum-full.png \
    -vf "crop=3360:1900:230:176" \
    -update 1 -frames:v 1 \
    assets/curriculum-tree.png
  ```

- **Quality check:** warm-dark bg (#14140f-ish), green border-left on the phase band visible, JetBrains Mono crisp at 2x, no compression artifacts. Title note: live site says "**398 steps**" not "598" as the brief draft says — captured as-shipped.

## Lesson IDE

- **URL captured:** `https://promptdojo.pages.dev/learn/v2/variables/naming-things/0/` (loaded as written in the brief; site auto-trailing-slashed it)
- **Viewport / DPR:** 1920 × 1080 CSS, deviceScaleFactor 2 (retina)
- **Pyodide load wait strategy:**
  - `agent-browser wait --load networkidle` after `open` (Pyodide is lazy-loaded, not eager)
  - Verified no `loading wasm…` / `loading pyodide…` text in body; verified `Run` button was enabled and `aria-busy="false"`
  - Clicked the `RUN ⌘↵` button (`@e15`)
  - Polled the output panel via `eval` until it contained the actual program result: `"Alex has 3 tickets left on the free plan."`
  - Confirmed `pyodide-worker.js` target alive in `chrome://inspect` target list
- **Full-page PNG:** `assets/lesson-full.png` — 3820 × 2168, ~593 KB
- **Hero crop:** `assets/lesson-ide.png` — 3820 × 2080, ~602 KB
- **Crop landmarks (CSS px):**
  - Site header: 44 tall
  - CodeMirror editor: top=79, left=720, 1190 × 778
  - Run button: top=866, left=1787, 111 × 34
  - Output panel ("Alex has 3 tickets…"): top=950, left=732, 1166 × 20
  - Doc: 1910 × 1084
- **Crop math:** kept full width (sidebar + markdown + IDE all visible per brief), trimmed only ~88 px (44 CSS) of trailing whitespace below the output panel.
- **ffmpeg command:**

  ```bash
  ffmpeg -y -i assets/lesson-full.png \
    -vf "crop=3820:2080:0:0" \
    -update 1 -frames:v 1 \
    assets/lesson-ide.png
  ```

- **Quality check:** dojoTheme green tokens visible across `user` / `score` / `remaining` / `print` identifiers, ember-ish caret/cursor (CodeMirror selection styling), green `RUN` button with `⌘↵` shortcut, OUTPUT panel showing real Python execution: `Alex has 3 tickets left on the free plan.` All three columns (chapter rail / lesson markdown / IDE) clearly readable. No loading copy in frame.

## Files on disk

```
assets/curriculum-full.png   3840 × 9070   1.46 MB
assets/curriculum-tree.png   3360 × 1900   375 KB    ← hero asset 1
assets/lesson-full.png       3820 × 2168   593 KB
assets/lesson-ide.png        3820 × 2080   602 KB    ← hero asset 2
```

## Reusable shim

`/tmp/cdp-shot.mjs` — Node script that takes `(wsUrl, outPath, w, h, dpr, fullPage)` and produces a clip-bounded screenshot honoring deviceScaleFactor. If/when other agents need retina captures via agent-browser, this is the cheapest workaround and worth promoting into `~/Developer/browser-harness/` or shipping as a small npm helper. Worth a follow-up PR to agent-browser to expose `--dpr` on `screenshot`.
