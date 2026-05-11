---
xp: 1
estSeconds: 200
concept: nano-banana-batch-economics
---

# nano-banana and the batch economics

Google released Gemini 2.5 Flash Image (codename "nano-banana") in late 2025, then rolled out Gemini 3 Pro Image (Nano Banana Pro) and Gemini 3.1 Flash Image (Nano Banana 2) through 2026. The whole family lives behind the Gemini API and Vertex AI.

The reason it matters: it changed the math.

## The pricing

- **Gemini 2.5 Flash Image** (Nano Banana): $30 per million output tokens, ~1290 tokens/image → **~$0.039/image**.
- **Gemini 3 Pro Image** (Nano Banana Pro): $120 per million output tokens → **~$0.134/image at 2K**, **~$0.24 at 4K**.
- **Gemini 3.1 Flash Image** (Nano Banana 2): roughly half the price of Pro, ranked #1 on text-to-image benchmarks at launch.

Compare against the rest:

| Model | Per-image cost (~) |
|---|---|
| Imagen 4 Fast | $0.02 |
| GPT Image 1 Mini (low) | $0.005 |
| Flux.1.1 [pro] | $0.04 |
| nano-banana (Gemini 2.5 Flash Image) | $0.039 |
| Flux.1.1 [pro] Ultra | $0.06 |
| Imagen 4 Ultra | $0.06 |
| Ideogram (Quality) | $0.09 |
| GPT Image 1 (High) | $0.167 |
| Midjourney (per-image equivalent) | $0.10+ depending on plan |

## The economic threshold

Here's the math that actually matters. Suppose your product needs one shipping-ready image per user request. Three strategies:

1. **One-shot premium**: send one prompt to Midjourney Pro or GPT Image 1 (High). Cost: ~$0.10-0.17/image. Hit rate (image is usable as-is): maybe 30-40%. So real cost per shipping-ready image: $0.25-0.50, and you spent a minute regenerating.

2. **Batch-and-filter**: send the same prompt to nano-banana 10 times. Cost: ~$0.39/batch. Hit rate per individual image is lower (~20%), but you have 10 candidates. Probability that AT LEAST one is shipping-ready is 1 - (0.8 ^ 10) ≈ 89%. Real cost per shipping-ready image: $0.39 with 89% confidence, $0.78 with ~99% confidence on the second batch.

3. **Self-hosted Flux**: rent an H100, run Flux.1 [dev]. Marginal cost per image: ~$0.001-0.005 depending on GPU pricing. Worth it above ~50,000 images/month.

The batch-and-filter strategy is the 2026 default for most consumer products. nano-banana made it economically obvious. At $0.039/image, you can generate 25 candidates for the price of one premium render, then use a filtering step (cheap LLM call with vision, or a CLIP-similarity score against a reference) to pick the best.

## Multi-turn editing

The other reason nano-banana is interesting: it's built for multi-turn conversational editing in the Gemini API. You generate an image, then say "make the background blue and add a coffee cup on the left," and it edits in-place using world knowledge from Gemini's text base. Most other image models don't do this — they regenerate from scratch, losing identity.

This makes nano-banana the right pick for any flow where the user is iterating: "show me an image of X" → "now change Y" → "now zoom in on Z." The cost per turn stays under $0.05 and the identity of the original subject is preserved across turns.

## When to NOT use nano-banana

- **Highest-end photorealism for hero shots.** Flux.1.1 [pro] still beats it. nano-banana is good, Flux is best.
- **Crisp text rendering at scale.** Use Ideogram. nano-banana 2 got better, but Ideogram is still the specialist.
- **Subjective magazine-shot taste.** Midjourney is still ahead here for now.

For everything else — batch generation, multi-turn editing, "I need 50 variants under $5" — nano-banana is the default.

## What this changes about your harness

Before nano-banana, the default image-gen pattern was "spend a lot, generate one, hope it's good." After nano-banana, the default is "spend a little, generate many, filter." That changes the shape of the pipeline. Lesson 03 of this chapter walks the full pattern (brief → prompt → batch → filter → upscale → format). For now, just internalize: the cost of generating 10 images dropped 5-10x in the last 18 months. The pipelines built before that drop are wasting money.
