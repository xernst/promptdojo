---
xp: 1
estSeconds: 160
concept: vague-prompts-fail
---

# Why "girl with red hair" gets you slop

Every person who tries image generation for the first time types something like:

> a girl with red hair

…and gets back a generic stock-photo redhead with an awkward smile, plastic skin, and the standard "AI face." Then they conclude image gen isn't ready.

The model is fine. The prompt is wrong.

## What the model does with a vague prompt

A diffusion model is, roughly, learning a probability distribution over images conditioned on text. When you say "a girl with red hair," the model samples from the **average of every image in its training set that matched that description**. That average is: front-facing, neutral background, awkward smile, soft over-lit studio look, slightly uncanny — because the training set is full of stock photography and Instagram selfies, and "the mean of all those" is exactly that uncanny stock-photo look.

The fix isn't a better model. The fix is a more specific prompt — one that narrows the distribution the model is sampling from.

## What good looks like

Compare:

**Bad:**
> a girl with red hair

**Good:**
> Portrait of a young woman with curly auburn hair, looking off-camera at a 30-degree angle. Shot on 85mm f/1.4, shallow depth of field, golden-hour side-lighting from a window on her left, soft shadows. Muted earth-tone wardrobe (terracotta sweater). Composition: rule-of-thirds, subject in left third, blurred bookshelves in the background. Editorial portrait style, film grain, Kodak Portra 400 color palette. No text, no watermark, no harsh studio lighting.

The good version did eight things. The bad version did one.

## The 80-100 word ceiling

Research on production prompts found that prompts beyond 80-100 words start degrading output. Concise 20-50 word prompts with precise language often beat verbose 150-word descriptions. The goal is **dense** prompts, not long ones. Every word should narrow the distribution.

Beyond ~100 words the model starts losing track of which words apply to what, and you get composition errors — the lighting you described attaches to the wrong subject, the lens you specified gets ignored.

## What this lesson does

Lesson 01 was the model-picker. This lesson is the prompt-builder. You'll learn:

- The eight knobs that matter (subject, composition, lighting, style, camera, lens, color palette, negatives).
- Why each one narrows the distribution.
- How to score a prompt's completeness — turn the eight knobs into a checklist.
- Common failure modes that good prompts dodge.

At the end you'll write `score_image_prompt(prompt)` — a function that takes a prompt string and returns a quality score plus a list of missing knobs. You can run this in a CI step before sending any prompt to a model and catch the slop-bound prompts before they cost money.

A note before we go further: this is general guidance. Each model family has its own prompt quirks. Flux likes complete sentences and real camera terms ("85mm f/1.4 lens"). Midjourney historically used `--ar 16:9 --stylize 100` style parameters. nano-banana uses conversational instructions ("make the background blue"). The eight knobs are the universal shape; the syntax differs.
