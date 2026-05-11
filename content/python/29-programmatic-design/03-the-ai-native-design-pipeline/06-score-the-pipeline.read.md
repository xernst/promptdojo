---
xp: 1
estSeconds: 140
concept: pipeline-coverage-score
code: |
  # the function you'll write next.

  def score_pipeline_preview(steps):
      """returns 0-100; each canonical step covered = 15 points (capped at 100)."""
      ...
  print("preview only — you implement this in the next screen")
---

# Score the pipeline against the canonical seven

You've seen the canonical seven steps and the worked example (`website-to-hyperframes`). Now the practical question: when you look at a real team's video workflow, how do you know if it's complete?

## The scoring rule

Score 15 points for each canonical step the team covers. Seven steps × 15 points = 105 points max, but we cap the score at 100. So if a team covers all seven, they hit 100. Missing any one drops them to 85. Missing two drops them to 70. The function returns an integer.

The seven canonical step names are:

```python
CANONICAL = [
    "concept",
    "reference-gen",
    "composition",
    "audio",
    "captions",
    "render",
    "review",
]
```

## What "covered" means

A step is covered when the team has a *named tool or artifact* responsible for it. Not "we talk about concept in a meeting." A real artifact: a `concept.md`, a SCRIPT, a reference shot library, a TTS tool, a captioning tool, a render command, a review checklist.

The input to your function will be a list of step dicts shaped like:

```python
[
    {"step": "concept", "tool": "Claude Opus"},
    {"step": "reference-gen", "tool": "Veo 3"},
    {"step": "composition", "tool": "HyperFrames"},
    # ...
]
```

A step counts as covered if its `step` name is in `CANONICAL` AND it has a non-empty `tool`. Anything else doesn't count.

## Why 15 points instead of dividing 100 by 7

Two reasons:

1. **Round numbers are easier to debug.** 15 + 15 + 15 = 45, easy to see at a glance. 14.28... × 3 = 42.85 is not.
2. **The cap rewards completeness.** If you cover all 7 you get 105, capped to 100. That asymmetry signals "all 7 is the goal" without making the math weird.

## What scores actually mean

| Score | Verdict |
|---|---|
| 100 | Full pipeline (all 7 covered → 105 capped to 100). Ready to scale. |
| 90 | One missing. Find it, fix it. |
| 75 | Two missing. Probably captions + review. |
| 60 or below | Multiple gaps. The team isn't shipping; they're rendering proofs. |

The most common gaps in 2026:

- **Captions.** Teams render to MP4 and don't add captions, then wonder why TikTok performance is bad. (98% muted plays.)
- **Review.** Teams render once and ship. No structured review = no convergence on quality.
- **Reference-gen.** Teams skip AI gen, hire stock, and pay 100× more per shot than they need to.

Coverage scoring catches all three. The next screen has you write it.
