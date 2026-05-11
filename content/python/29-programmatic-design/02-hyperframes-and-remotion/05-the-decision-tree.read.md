---
xp: 1
estSeconds: 150
concept: pick-by-team-fit
code: |
  # the four signals that decide hyperframes vs remotion (vs both vs neither).

  SIGNALS = {
      "team_familiarity_react": "does your team already ship React apps?",
      "needs_text_reflow":      "do headlines need to auto-wrap based on font metrics?",
      "render_target":          "'local' (one developer's laptop) or 'scale' (Lambda)?",
      "complexity":             "'simple' (1-2 scenes), 'medium' (3-10), or 'high' (10+ scenes)",
  }
  for k, v in SIGNALS.items():
      print(f"{k}: {v}")
---

# Pick by team fit, not feature list

The two tools have ~95% feature overlap. They both render parametric, deterministic MP4s from web code, run in a headless browser, and support audio + video tracks. Trying to pick based on "which has more features" is the wrong frame.

Pick based on **who's on the team** and **how the renders are deployed**. Four signals do most of the work.

## Signal 1 — team_familiarity_react

The biggest predictor of which tool wins is whether your team already ships React. If yes, Remotion's mental model (`useCurrentFrame()`, `interpolate(...)`, props) is a natural extension of what they do all day. If no — if your team is designers, freelancers, or people who think in CSS first — the HyperFrames learning curve is much shorter.

**Rule:** React-heavy team → Remotion bias. CSS/design-heavy team → HyperFrames bias.

## Signal 2 — needs_text_reflow

If headlines have to auto-wrap based on actual rendered font metrics — "this could be 'Welcome' or 'Welcome to the demo experience', and the layout has to look good either way" — HyperFrames has an edge. It runs in real Chrome with real font metrics. There's a `window.__hyperframes.fitTextFontSize(...)` helper specifically for dynamic text overflow.

Remotion can do this too, but you'll be writing it yourself in React. HyperFrames ships the helper.

**Rule:** Text-heavy parametric work → HyperFrames slight edge.

## Signal 3 — render_target

If you're rendering on one developer's laptop, both tools are roughly equivalent. If you're rendering 1000s of videos a day, you want Remotion + AWS Lambda. The Lambda distribution is the production scale move — render chunks in parallel, concatenate the result. HyperFrames doesn't have an equivalent of `@remotion/lambda` baked in; you'd build your own queue + worker pool.

**Rule:** `render_target == "scale"` (cloud, 1000s/day) → Remotion bias.

## Signal 4 — complexity

For very simple compositions (a single shot with a headline), both tools are overkill. AI gen might be the right answer. For high-complexity work (10+ scenes with custom shader transitions), HyperFrames has a built-in shader-transitions package and a richer scene-transition system in the skill files. Remotion can do it; you'll just write more glue.

**Rule:** Very simple → AI-gen-only might do it. Very high complexity → HyperFrames bias on transitions, Remotion bias on Lambda parallelization.

## The combined rule (what you'll code)

```python
def pick_tool(project):
    if project["complexity"] == "simple" and project["render_target"] == "local":
        return "ai-gen-only"   # don't reach for a framework
    if project["team_familiarity_react"] and project["render_target"] == "scale":
        return "remotion"      # React team + Lambda need
    if project["needs_text_reflow"] or not project["team_familiarity_react"]:
        return "hyperframes"   # design-first team or heavy reflow
    return "both"              # in-house engineers, pick the one with momentum
```

`"both"` isn't a cop-out — some shops run a Remotion pipeline for parametric ads and a HyperFrames pipeline for designer-driven brand work. Different tools for different jobs is fine. The point is to *choose intentionally*, not by accident.
