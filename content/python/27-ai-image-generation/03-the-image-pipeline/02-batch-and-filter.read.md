---
xp: 1
estSeconds: 200
concept: batch-and-filter-economics
---

# Batch and filter — where the math actually works

The single biggest 2026 unlock in image generation isn't a better model. It's the **collapse in per-image cost** at the Flash tier. nano-banana at ~$0.039 changed the economics of "how should I get to a usable image" from "spend a lot, generate one, hope" to "spend a little, generate many, filter."

## The math, walked through

Suppose you need one shipping-ready image. Three strategies:

### Strategy A — One-shot premium

Send one prompt to Midjourney Pro tier or GPT Image 1 (High quality at $0.167/image). Per-image cost: ~$0.10-0.17. Hit rate (image is usable as-is, no broken hands, on-brief): assume 30-40%. So you regenerate, on average, 2-3 times to get a winner.

**Real cost per shipping-ready image: ~$0.25-0.50, plus operator time.**

### Strategy B — Batch and filter

Send the same prompt to nano-banana 10 times. Cost: $0.039 × 10 = $0.39. Each individual image has a lower hit rate (~20%) because nano-banana isn't as polished as the premium models. But you have 10 candidates.

Probability that AT LEAST ONE is shipping-ready:

```
P(none) = (1 - 0.2) ^ 10 = 0.8 ^ 10 ≈ 0.107
P(at least one) ≈ 89%
```

**Real cost per shipping-ready image: ~$0.39 with 89% confidence on first batch.**

If the first batch produces nothing usable (~11% of the time), you batch again. Two batches gets you to 98.8% confidence at ~$0.78 total. That's still cheaper than strategy A's expected cost.

### Strategy C — Self-hosted Flux

Rent an H100 GPU at ~$2/hour. Run Flux.1 [dev] (open weights, non-commercial license — for commercial you'd run Flux.1 [schnell] or have a license for [pro]). A well-tuned setup generates ~1 image/second at 1024x1024. That's 3,600 images/hour at $2/hour, so ~$0.00056 per image.

Below ~50,000 images/month, the API cost wins. Above that, the self-hosted economics win and the gap widens fast.

## When strategy B (batch-and-filter) is wrong

A few cases where you DON'T want batch-and-filter:

- **Highest possible quality required.** Hero shot for a billboard. Flagship product launch image. Use Flux.1.1 [pro] Ultra at $0.06/image and review it yourself, don't try to filter 25 mediocre nano-bananas.
- **Specific text required.** Ideogram. Generate 3-5, pick the one with crispest text. The filter step is text-readability check, not aesthetic.
- **Tight subject-identity requirement across multiple outputs.** Flux Kontext with a reference. Batch is the wrong frame — you want consistent outputs, not varied ones.
- **Single one-off where operator time is cheap.** Personal project, internal use. The math collapses; just pick whichever model you like and run it once.

## The filter step in production

Three ways to filter, in order of how often you'll actually use them:

### Vision-model judge (the default)

```python
# pseudocode — real call shape varies by provider

# import anthropic
# client = anthropic.Anthropic()
# resp = client.messages.create(
#     model="claude-sonnet-4-7",
#     messages=[{
#         "role": "user",
#         "content": [
#             {"type": "text", "text": f"Brief: {brief}. Rate each on 0-10 for fit."},
#             *[{"type": "image", "source": {...}} for img in candidates],
#         ],
#     }],
# )
```

Cost: ~$0.001-0.005 per candidate evaluated. Speed: ~3-10 seconds for a batch of 10. Quality: very good — the model catches broken hands, off-brief composition, AI face. The 2026 default.

### CLIP similarity (the deterministic option)

Embed the brief in CLIP-space, embed each candidate, rank by cosine similarity. Fast and free. The downside: CLIP only knows "does this image match this text," not "is this beautiful" or "does this have broken hands."

### Aesthetic scorer

Open-source models like `LAION-Aesthetics-V2-Predictor` give an aesthetic score 0-10. Combine with CLIP for a composite "matches the brief AND looks good" rank. Useful when you don't want vision-model latency or cost.

In practice, most production pipelines use the vision-model judge. The cost is in the noise compared to generation, and the quality of the rank is the bottleneck for shipping confidence.

## The batch size question

How many candidates is the right batch size? It's a function of three things:

- **Per-image cost.** Cheaper model → bigger batches make sense.
- **Per-image hit rate.** Lower hit rate → bigger batches needed for high confidence.
- **Filter cost.** The filter step costs money/time too. At some point adding more candidates costs more than it's worth.

The 2026 default heuristic: **batch of 10 for nano-banana, 5 for Flux Pro, 3 for premium tiers.** Adjust based on the hit rate you observe on your specific use case.

## What the next step asks

You'll see five pipelines, each broken in one specific stage. The drill is identifying which stage broke. Then you'll read about format-and-platform, fill in a dispatch pattern, write the cost function, and plan a full shoot.
