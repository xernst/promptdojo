---
xp: 1
estSeconds: 130
concept: design-html-and-claude-design
---

# The Claude Code `design-html` skill and where it fits

You'll see the term "Claude design" come up in two related but distinct senses. Worth pinning down so you don't mix them up.

## Sense 1 — the `design-html` skill (inside Claude Code)

`design-html` is a gstack skill that runs inside Claude Code. It produces **Pretext-native HTML/CSS** — production-quality web pages where text actually reflows and heights are computed dynamically. The skill is for design finalization: someone has approved a mockup (from `/design-shotgun`, a CEO plan, or a back-of-napkin sketch) and now needs the actual HTML.

It is *not* a video tool. It produces static web pages, not MP4s. The neighborhood overlap is that the HTML it produces is the same kind of asset HyperFrames composes into video — clean, deterministic, web-native.

If your pipeline is "design the page, then turn it into a 20-second promo video," you'd run `design-html` to ship the page and then HyperFrames (via `website-to-hyperframes`) to capture the page into a video.

## Sense 2 — "Claude Design" the standalone product

There's also Claude Design, Anthropic's design tool. The `claude-design-hyperframes` skill exists specifically for that environment — it produces valid HyperFrames first drafts inside Claude Design that the user can then download, open in Claude Code, and refine.

Two things to know:

1. The Claude Design skill uses **pre-valid skeletons** so the output passes `npx hyperframes lint` immediately.
2. It explicitly hands off to a coding agent for polish: "Claude Design creates the first cut of the film, Claude Code does the edit-bay refinement."

This handoff pattern matters for the pipeline lesson coming up. Different stages of the work want different tools, and the same HyperFrames project file is what passes between them.

## When `design-html` enters the video pipeline

Three real cases:

- **You need a landing page first, then a video about that page.** Run `design-html` to ship the page. Run `website-to-hyperframes` against the URL of that page to produce the promo. Same brand, same copy, same colors — because both came from the same DESIGN.md.
- **You need to embed a static "frame" inside a video.** A pricing table, a feature comparison, a stat callout. `design-html` produces the HTML; HyperFrames embeds it as a clip.
- **You're doing a `/design-shotgun` exploration that ends in motion.** Generate variants statically, pick one, finalize with `design-html`, then bring it into motion via HyperFrames.

The mental model: `design-html` owns the *page*. HyperFrames owns the *page through time*. Remotion owns the *component through time*. Three tools, three slightly different jobs, one shared DNA — production-quality web output that's reproducible because it's code.
