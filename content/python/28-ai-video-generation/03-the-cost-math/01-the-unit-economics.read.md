---
xp: 1
estSeconds: 210
concept: cost-per-second-by-model
code: |
  # raw cost per second of generated video, mid-2026 prices.
  # this is BEFORE retakes — see step 2 for the multiplier.
  PRICE_PER_SEC = {
      "Sora 2 (720p)":         0.10,
      "Sora 2 Pro (720p)":     0.30,
      "Sora 2 Pro (1024p)":    0.50,
      "Veo 3 (no audio)":      0.50,
      "Veo 3 (with audio)":    0.75,
      "Veo 3.1 Lite (720p)":   0.05,
      "Veo 3.1 Lite (1080p)":  0.08,
      "Kling 3.0 (standard)":  0.084,
      "Kling 3.0 (Pro)":       0.168,
      "Runway Gen-4 Turbo":    0.05,   # 5 credits/sec × $0.01/credit
      "Hailuo 02 (768p)":      0.045,
      "Hailuo 02 (1080p)":     0.047,  # ~$0.28 per 6s clip
      "Vidu Q3":               0.07,
  }
  print(f"{'model':<28}{'$/sec':>8}{'$/60s':>10}")
  for model, p in PRICE_PER_SEC.items():
      print(f"{model:<28}{p:>8.3f}{p*60:>10.2f}")
---

# The unit economics — cost per second across the 2026 lineup

Before anything else, the bare prices. This is API price per
second of *generated* video, before retakes are factored in.

## The table

| Model | $/sec | 60-sec spend (raw) |
|---|---|---|
| Sora 2 (720p) | $0.10 | $6 |
| Sora 2 Pro (720p) | $0.30 | $18 |
| Sora 2 Pro (1024p) | $0.50 | $30 |
| Veo 3 (no audio) | $0.50 | $30 |
| Veo 3 (with audio) | $0.75 | $45 |
| Veo 3.1 Lite (720p) | $0.05 | $3 |
| Veo 3.1 Lite (1080p) | $0.08 | $4.80 |
| Kling 3.0 (standard) | $0.084 | $5.04 |
| Kling 3.0 (Pro, video input) | $0.168 | $10.08 |
| Runway Gen-4 Turbo | $0.05 | $3 |
| Hailuo 02 (768p) | $0.045 | $2.70 |
| Hailuo 02 (1080p) | ~$0.047 | $2.80 |
| Vidu Q3 | $0.07 | $4.20 |

## The four tiers

The lineup separates cleanly into four price tiers:

1. **Sub-$0.10/sec — the cheap tier.** Hailuo 02, Veo 3.1 Lite,
   Vidu Q3, Runway Gen-4 Turbo, Kling 3.0 standard. A
   60-second piece at raw price runs $3-5. This is where
   high-volume work (performance marketing, social, B-roll)
   has to live.

2. **$0.10-0.20/sec — the value-quality tier.** Sora 2 base,
   Kling 3.0 Pro. Roughly $6-12 for a 60-second piece at raw
   price. The sweet spot when you need real model quality but
   not Sora 2 Pro / Veo 3 premium pricing.

3. **$0.30-0.50/sec — the premium tier.** Sora 2 Pro (both
   resolutions), Veo 3 without audio. Roughly $18-30 per
   60-second piece. Used for hero shots, client work where the
   output is the deliverable.

4. **$0.75/sec — the premium-with-audio tier.** Veo 3 with native
   audio. $45 per 60-second piece. Used for talking-head /
   narrated content where the lip-sync and ambient audio matter.

## The 10x spread is the strategic question

The cheapest tier is **17x cheaper than the most expensive tier**
(Hailuo at $0.045 vs Veo 3 with audio at $0.75). That spread is
not "the same product at different prices." It's *different
products entirely*. They serve different jobs.

If your project is "a 30-second product launch trailer for a
Fortune 500 client," Hailuo is wrong. The frames will not hold up
in a Super Bowl spot.

If your project is "60 short variations for a Facebook ad
performance test," Veo 3 is wrong. You'll burn $2,700 on the
test set and learn the same thing $300 of Hailuo output would
have told you.

Picking the wrong tier — in either direction — is the single
most expensive mistake in 2026 video work. The next read covers
the retake multiplier that makes all of these numbers worse.

## The Higgsfield wrinkle

Higgsfield doesn't price per second. It prices in credits, and
the credits buy time on the *underlying* base models (Sora 2,
Veo 3.1, Kling 3.0, etc.). On the Plus plan ($34/mo, 1,000
credits), the effective rate works out to:

- ~14-25 Sora 2 videos a month → ~$1.40-$2.40 per Sora 2 video
  effective price (much cheaper than raw API).
- ~167 Kling 3.0 generations a month → ~$0.20 per Kling video
  effective price.

Higgsfield is a price-arbitrage layer on top of being a control
layer. If you're going to use Sora 2 a lot AND want camera
control, the Higgsfield subscription is probably cheaper than
the raw OpenAI API.

But: the credits are usage-capped and the camera-control feature
is the actual product. Don't subscribe just for arbitrage —
subscribe because you want the deterministic shot vocabulary.

## What this gives you

The cost-per-second table is the floor of the planning math.
Step 2 turns this floor into an actual budget by adding the
retake multiplier — the "generate 10, pick 1" reality that makes
every raw price 2-10x more expensive than the table suggests.
