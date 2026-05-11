---
xp: 2
estSeconds: 130
concept: classify-by-three-signals
code: |
  # three signals decide where a video brief lands.

  SIGNALS = {
      "rows":         "more than 1 means parametric — code wins",
      "needs_copy":   "headlines, captions, CTAs — code wins (model can't reliably render text)",
      "data_source":  "live DB, API, spreadsheet — code wins",
      "is_one_shot":  "single novel scene, no copy, no template — model wins",
  }
  for k, v in SIGNALS.items():
      print(f"{k}: {v}")
---

# Three signals, one decision

You're going to write `classify_video_task(task)` in the next step. The function reads a task dict and returns one of three strings: `"ai-gen-only"`, `"code-driven"`, or `"hybrid"`. Here's the decision logic.

## The signals

Four fields on the input task:

- `rows: int` — how many different videos this brief produces from one template. `1` is one-off. `>1` is parametric.
- `needs_copy: bool` — does the deliverable require text on screen (headline, caption, CTA, lower-third)? AI gen models still can't reliably render long, accurate copy.
- `data_source: str | None` — is the content driven by a database, API, or spreadsheet? `None` means no live data input.
- `is_one_shot: bool` — is the brief a single creative shot with no template ("imagine a beautiful scene of...")?

## The decision tree

```text
if is_one_shot AND rows == 1 AND not needs_copy AND data_source is None:
    return "ai-gen-only"   # model wins — single novel scene

elif rows > 1 OR data_source is not None:
    return "code-driven"   # parametric or data-driven — code wins

else:
    return "hybrid"        # single video, but needs copy or non-trivial composition
```

## Why "hybrid" is the most common verdict

Most real product videos are hybrid. The brief is "a 20-second feature launch video with our brand template, our logo at the end, our copy, our music — and a hero shot we generate with Veo." That's one video (rows=1), no live data (data_source=None), but needs copy. The model generates the hero shot. Code stitches it into the template with the copy, logo, and music.

Hybrid is where most of this chapter lives. AI-gen-only is the boundary case where you don't need a renderer. Code-driven is the boundary case where the model isn't even involved — every input is structured.

## Examples mapped to verdicts

| Brief | rows | needs_copy | data_source | is_one_shot | verdict |
|---|---|---|---|---|---|
| 5-second fog hero shot | 1 | False | None | True | `ai-gen-only` |
| Channel intro (same every video) | 1 | True | None | False | `hybrid` |
| 100 Shopify product ads | 100 | True | "catalog.csv" | False | `code-driven` |
| NFL reel from league API | 1 | True | "nfl-api" | False | `code-driven` |
| Album-art abstract loop | 1 | False | None | True | `ai-gen-only` |

Note the asymmetry: `code-driven` doesn't require *all* its inputs to be structured — having any one of `rows > 1` or `data_source is not None` is enough. `ai-gen-only` requires *all four* signals to point at the model. That's intentional — when in doubt, default to code, because code can call the model but the model can't call code.
