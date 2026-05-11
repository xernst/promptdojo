---
xp: 1
estSeconds: 180
concept: six-image-model-families
---

# Six families, six jobs

In 2024 there was effectively one mainstream image model people knew about (DALL-E 3) and a few power-user choices (Midjourney, Stable Diffusion forks). In 2026 the landscape has forked into six distinct families, each optimized for a different job. Picking the wrong family is the single biggest source of bad output in image generation today — bigger than prompt skill, bigger than budget.

The six families:

1. **Flux** (Black Forest Labs) — open weights, leads on photorealism and technical accuracy. The 2026 lineup runs Flux.1 [pro], Flux.1.1 [pro], Flux.1.1 [pro] Ultra (up to 4MP), and the Flux Kontext family for edit-with-instructions. API access via `api.bfl.ml`, Replicate, and Fal.ai.
2. **nano-banana** (Google Gemini Flash Image) — the rebranded marketing name for Gemini 2.5 Flash Image, Gemini 3 Pro Image (Nano Banana Pro), and Gemini 3.1 Flash Image (Nano Banana 2). Speed-optimized, very cheap per image, strong multi-turn editing. The Flash Image Preview launched late 2025 and made batch generation economically obvious.
3. **Midjourney** (v7) — closed-source, no public API, Discord and web app only. Wins on subjective aesthetic taste, loses on text-in-image, character consistency, and any workflow that needs more than 200 images a month.
4. **Ideogram** (3.0) — text-in-image specialist. Claims 90-95% text rendering accuracy. Three tiers: Turbo (~$0.03), Default (~$0.0375), Quality (~$0.09).
5. **OpenAI gpt-image-1 family** — gpt-image-1, gpt-image-1.5 (current flagship as of March 2026), and gpt-image-1-mini. Strong instruction-following (you can say "put the logo top-left at 20% size" and it usually listens). DALL-E 3 is now deprecated.
6. **Google Imagen** (4) — three variants on Vertex AI: Imagen 4 Fast ($0.02), Imagen 4 ($0.04), Imagen 4 Ultra ($0.06). Enterprise-friendly, integrates with Google Cloud.

## The two axes that actually matter

When you're picking a model, two axes determine 80% of the decision:

- **Taste vs. control.** Midjourney is taste-heavy: you describe a vibe and it gives you a magazine shot. Flux and gpt-image-1 are control-heavy: you describe a specific composition and they execute on it. If you have art direction, you want control. If you don't, you want taste.
- **Per-image cost vs. quality ceiling.** nano-banana at ~$0.039/image is the batch workhorse. Flux Pro at ~$0.04 is the photoreal workhorse. Midjourney Mega at $120/month is unlimited-Fast-GPU for one creator. Imagen 4 Ultra at $0.06 is the enterprise quality ceiling.

Everything else (character consistency, text-in-image, document handling) collapses into a specialty model: if you need it, use the specialist.

## What Claude can and can't do

One trap before we go further. Anthropic's Claude (the model running this curriculum) reads images — you can pass `{"type": "image", ...}` blocks into a `messages.create` and Claude will analyze them. Claude **does not generate images**. If you wire up an image-generation feature, the call goes to Google, OpenAI, Black Forest Labs, fal.ai, Replicate, or directly to a self-hosted Flux endpoint. Not Anthropic.

This trips up about half the people who try to ship an image feature in their first Claude app. Don't be one of them.

## What this lesson does

Walks the six families with their actual 2026 names, prices, and strengths. Drills you on which one to pick for five different jobs. Ends with a `pick_image_model(task)` function you can call from any harness to route an image-gen request to the right backend. Pure decision logic — no API calls, runs in stdlib.

The downstream lessons assume you can tell, given a task description, which family you'd send it to. By the end of this lesson, you can.
