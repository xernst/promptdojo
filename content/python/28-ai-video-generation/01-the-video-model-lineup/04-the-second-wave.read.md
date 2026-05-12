---
xp: 1
estSeconds: 220
concept: second-wave-video-models
code: |
  # the second wave — not the heavyweights, but real production tools.
  second_wave = [
      {
          "name": "Runway Gen-4 Turbo",
          "lane": "speed + editing workflow",
          "price": "$0.05/credit, 5 credits/sec of Gen-4 Turbo video",
          "per_5s_clip": 0.25,  # 25 credits = $0.25
          "note": "5-10s clips in under a minute, lives inside Runway's timeline UI",
      },
      {
          "name": "Kling 3.0",
          "lane": "value tier + Chinese-market access",
          "price": "$0.084/sec standard, $0.168/sec Pro (with video input)",
          "note": "Native 4K + native multilingual audio (Feb 2026)",
      },
      {
          "name": "Luma Ray3 / Ray3.14",
          "lane": "motion smoothness, image-to-video",
          "price": "credit-based — Lite plan $9.99/mo for ~20 5s clips",
          "note": "Ray3.14 adds native 1080p and 3x lower cost",
      },
      {
          "name": "Pika 2.2",
          "lane": "Pikaffects + Pikaformance lip-sync",
          "price": "$8 Standard / $28 Pro / $76 Fancy per month (annual billing; monthly $28/$76/$95)",
          "note": "Lip-sync is ElevenLabs-powered, strong for talking-head edits",
      },
      {
          "name": "Hailuo 02 (MiniMax)",
          "lane": "cheapest publishable 1080p",
          "price": "$0.045/sec at 768p, $0.08/sec at 1080p ($0.48 per 6s 1080p clip)",
          "note": "MiniMax IPO'd in Hong Kong Jan 2026 at $4B",
      },
      {
          "name": "Vidu Q3 (ShengShu)",
          "lane": "reference-to-video at $0.07/sec",
          "price": "$10 Standard / $35 Premium / $99 Ultimate per month",
          "note": "Q3 added reference-to-video — feed a reference image of the subject",
      },
  ]
  for m in second_wave:
      print(f"{m['name']:<20} — {m['lane']}")
---

# The second wave — Runway, Kling, Luma, Pika, Hailuo, Vidu

Below the Sora 2 / Veo 3 heavyweight tier sits a second wave of
six models that are not "best in class" on any single axis but
are *the right answer* for the majority of real production jobs.
This is where most of the actual video work in 2026 happens,
because the heavyweights are too expensive and too slow for
high-volume work.

## Runway Gen-4 + Gen-4 Turbo — the production workflow

Runway has been in the AI-video game since Gen-1 in 2023 and the
company's edge has always been **workflow**, not raw model
quality. Gen-4 Turbo (released April 2025) generates 5-10 second
clips in under a minute. Pricing:

- $0.01 per API credit. 5 credits per second of Gen-4 Turbo
  video. **A 5-second clip costs $0.25 in raw API credits.**
- Subscription plans start at $12/mo. The 2,250-credit Pro plan
  buys 90 sec of Gen-4.5, 187 sec of Gen-4, or 450 sec of Gen-4
  Turbo — illustrating Turbo's credit efficiency.

Runway also ships Aleph (a video-to-video editing model), audio
sync tools, and a real timeline UI. The value is being able to
generate, edit, mask, and finish in one product instead of
juggling Sora 2 + DaVinci + ElevenLabs. For teams already inside
Runway it remains the default; for new teams Sora 2 / Veo 3
direct is usually higher-quality per dollar but loses the
workflow.

## Kling 3.0 — the value heavyweight

Kuaishou (Chinese parent of the original "TikTok"-shaped product
in Asia) released Kling 3.0 on February 5, 2026. The model uses a
**Multi-modal Visual Language (MVL) architecture** — text, image,
audio, and video all processed in one system — and ships **native
4K output with built-in multilingual audio**.

Pricing:
- **$0.084/sec standard mode** (no video input)
- **$0.168/sec Pro mode** (video input or higher quality)
- Subscription tiers: Standard $6.99 / Pro $25.99 / Premier
  $64.99 / Ultra $127.99-180 per month

This is the price-performance leader in the heavyweight class.
Kling 3.0 at $0.084/sec is roughly **20% the price of Sora 2 Pro
at $0.50/sec** for output that, on the right kind of prompt, is
comparable. Where Kling loses: long-duration character
consistency and the specific physics edge Sora 2 has.

Access caveat: the global onboarding flow is clunky for
non-Chinese developers; Atlas Cloud and other aggregators
re-sell the API with simpler auth (and at lower prices).

## Luma Ray3 — image-to-video motion

Luma Labs' Dream Machine and the Ray3 / Ray3.14 model family
focus on **smooth motion from a starting image**. The image-to-
video sweet spot — you compose the first frame in something like
Nano Banana Pro for $0.04, then Luma animates it.

- Lite plan $9.99/mo, 3,200 credits → ~20 Ray 2 clips at 720p
  (5s) per month, or ~9-10 at 1080p (10s).
- Plus $30 / Pro $90 / Ultra $300 per month.
- Ray3.14 (the current build) is 4x faster than Ray3 and 3x
  cheaper per generation.

Use Luma when the brief is "this image, in motion, smoothly."
Avoid for character dialogue, complex physics, or anything where
the camera move matters more than the subject.

## Pika 2.2 — effects and lip-sync

Pika's lane is *creative effects and dialogue*. Two products
matter:

- **Pikaffects**: dramatic transformations applied to images or
  clips with single-prompt presets (melt, explode, inflate,
  squish, morph). Great for TikTok/Reels-shaped content.
- **Pikaformance**: audio-driven lip-sync, ElevenLabs-powered.
  Take a single still image, give it a voice clip, get a talking
  head. Comparable to HeyGen for localized character content.

Pricing: $8 Standard / $28 Pro / $76 Fancy on annual billing
(monthly plans run $28/$76/$95). Pika 2.2 cut credit costs
significantly vs 2.1; a 5-second 1080p clip burns about 18
credits.

## Hailuo 02 (MiniMax) — the cheap-tier benchmark

The cheapest publishable model in the working set. **$0.045/sec at
768p, $0.017/sec at 512p, $0.08/sec at 1080p.** A 6-second 768p clip
costs $0.27; a 6-second 1080p clip costs $0.48. MiniMax is a
Beijing-based company that IPO'd on the Hong Kong exchange in
January 2026 at a $4B valuation.

Use Hailuo when the brief is "we need 50 short clips for a
performance-marketing test." Avoid when the brief includes the
word "hero" or the client is paying premium-agency rates.

## Vidu Q3 (ShengShu) — reference-to-video

ShengShu's Vidu Q3 added a **reference-to-video** feature: feed a
reference image of the subject (a product, a character, a style)
and Vidu maintains the reference across the generated clip. Sits
at **$0.07/sec for 12-second clips at 1080p** — the price
sweet-spot for product work where the subject must stay
on-brand.

- Free 80 credits/mo, Standard $10, Pro $35, Ultimate $99.
- ShengShu offers a 50% education discount.
- Pro plan: 60 seconds of Cinema-quality output costs ~$2.03.

## The honest summary

If you can only remember one rule: **Sora 2 / Veo 3 for premium,
Kling 3.0 / Vidu Q3 for value at quality, Hailuo / Veo 3.1 Lite
for cheap volume, Runway for editing workflow, Higgsfield when
camera matters, Luma when motion-from-image matters, Pika when
the effect or the dialogue matters.**

That's not a leaderboard; it's a lane map. The lanes are
durable. Lane leaders change every six months.
