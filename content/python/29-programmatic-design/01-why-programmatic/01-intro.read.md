---
xp: 1
estSeconds: 150
concept: when-ai-gen-isnt-enough
---

# AI gen makes a shot. A pipeline makes a deliverable.

Type "a cinematic dolly shot of an espresso shot pouring, slow motion, warm light" into Veo or Sora and you'll get a beautiful 5-second clip. That's the model doing what it's best at — synthesizing one visual from one prompt.

Now type "make me 100 product videos for our Shopify catalog, each 15 seconds, with the product name, price, and CTA overlaid, in our brand colors, in 9:16 for TikTok, plus a 16:9 version for YouTube Shorts and a 1:1 version for Instagram feed." Watch the model fail.

It fails not because the model is bad. It fails because **that's a different kind of problem.**

## The two kinds of video problems

| Kind | Looks like | Tool that wins |
|---|---|---|
| One-shot generation | "Make me a cinematic hero shot of X" | AI gen model (Veo, Sora, Runway, Pika) |
| Composition | "Stitch these 8 shots into a 30-second story with copy, captions, and music" | Code (HyperFrames, Remotion, FFmpeg) |

Most real video deliverables are **both**. You use the model to generate the raw shots, then you use code to assemble them into something that ships. The raw model output isn't the deliverable; it's an input.

The mistake people make in 2026 is treating AI gen as the whole pipeline. They paste a prompt, get back a 5-second clip, and try to make it stand alone as the campaign. Sometimes that works — short brand teasers, mood pieces. Most of the time it doesn't, because real video work needs:

- A **headline** the viewer can read.
- A **caption** synced to audio (98% of TikTok plays are muted).
- A **CTA** at the end.
- A **brand color** that matches the rest of the company's output.
- A **duration** that matches the platform's algorithm (15s, 30s, 60s).
- A **second version** in a different aspect ratio.
- A **third version** with a different product.

None of those are model jobs. They're code jobs.

## What "programmatic" means here

A *programmatic video* is one where the timeline, layout, copy, and assembly are described in code — not painted by hand in a video editor. The clips inside it can be AI-generated, stock, or human-shot, but the composition is mechanical:

```text
script.json + template.html → renderer → output.mp4
```

Run that pipeline once, you get one video. Run it with a different `script.json`, you get a different video. Run it 100 times in a loop with 100 different scripts, you get 100 videos. Same template, 100 deliverables.

That's the unlock. Not "AI generates better shots" (the models are already great). Not "code lets me animate" (After Effects has done that for 30 years). The unlock is **scale across a template** — turning one designer's hour of taste into a hundred shipped MP4s.

## What this lesson does

The rest of this lesson builds the classifier. Given a video brief, you'll write a function that returns one of:

- `"ai-gen-only"` — the model is the whole answer (mood piece, single shot, abstract visual).
- `"code-driven"` — code is the whole answer (data-dashboard reel, captions over stock, slideshow).
- `"hybrid"` — AI gen for inputs, code for composition (most real product videos).

Once you can classify briefs, the rest of the chapter is just picking the right tool for the code-driven and hybrid cases.
