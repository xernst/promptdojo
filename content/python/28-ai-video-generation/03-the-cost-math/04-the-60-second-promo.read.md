---
xp: 1
estSeconds: 220
concept: 60-second-promo-by-model
code: |
  # the same 60-second promo, priced across every model.
  # assumes I2V workflow, "usable B-roll" retake rate of 2.5x.
  PRICE_PER_SEC = {
      "Hailuo 02 (768p)":      0.045,
      "Veo 3.1 Lite (720p)":   0.05,
      "Runway Gen-4 Turbo":    0.05,
      "Vidu Q3":               0.07,
      "Veo 3.1 Lite (1080p)":  0.08,
      "Hailuo 02 (1080p)":     0.08,
      "Kling 3.0 standard":    0.084,
      "Sora 2 (720p)":         0.10,
      "Veo 3 Fast":            0.15,
      "Kling 3.0 Pro":         0.168,
      "Sora 2 Pro (720p)":     0.30,
      "Veo 3 (with audio)":    0.40,
      "Sora 2 Pro (1024p)":    0.50,
  }
  duration_min = 1.0
  retake = 2.5
  print(f"{'model':<28}{'$/min real':>14}")
  for model, p in sorted(PRICE_PER_SEC.items(), key=lambda kv: kv[1]):
      cost = p * 60 * retake
      print(f"{model:<28}{cost:>14.2f}")
---

# A 60-second promo, priced end-to-end across every model

Concrete scenario: a 60-second promotional video for a SaaS
product. Twelve shots of 5 seconds each. Image-to-video pipeline
(frames composed in Nano Banana Pro at $0.05/frame). Usable
B-roll quality bar — not Super Bowl, but client-presentable.
Retake rate of 2.5x is realistic for I2V at this quality bar.

## The math, line by line

**Frame composition spend (constant across models):**
12 frames × $0.05 = $0.60

**Video generation spend (varies by model):**
60 seconds × `price_per_sec` × 2.5 retake multiplier

## The full table

| Model | $/sec | Video gen × 2.5 | + frames | Total |
|---|---|---|---|---|
| Hailuo 02 (768p) | $0.045 | $6.75 | $0.60 | **$7.35** |
| Veo 3.1 Lite (720p) | $0.05 | $7.50 | $0.60 | **$8.10** |
| Runway Gen-4 Turbo | $0.05 | $7.50 | $0.60 | **$8.10** |
| Vidu Q3 | $0.07 | $10.50 | $0.60 | **$11.10** |
| Veo 3.1 Lite (1080p) | $0.08 | $12.00 | $0.60 | **$12.60** |
| Hailuo 02 (1080p) | $0.08 | $12.00 | $0.60 | **$12.60** |
| Kling 3.0 standard | $0.084 | $12.60 | $0.60 | **$13.20** |
| Sora 2 (720p) | $0.10 | $15.00 | $0.60 | **$15.60** |
| Veo 3 Fast | $0.15 | $22.50 | $0.60 | **$23.10** |
| Kling 3.0 Pro | $0.168 | $25.20 | $0.60 | **$25.80** |
| Sora 2 Pro (720p) | $0.30 | $45.00 | $0.60 | **$45.60** |
| Veo 3 (with audio) | $0.40 | $60.00 | $0.60 | **$60.60** |
| Sora 2 Pro (1024p) | $0.50 | $75.00 | $0.60 | **$75.60** |

## What this table tells you

Three observations.

**The cheap-to-premium spread is ~10x.** $7-12 for the cheap tier
all the way up to $75 for premium 1024p. Same brief.

**There is no single "right" model.** The answer depends on:

- What the client expects (cheap-tier output is recognizable to
  trained eyes and disqualifies premium client work).
- What the audience expects (TikTok audiences accept Hailuo
  output; brand marketers do not).
- Whether the piece needs audio (if yes, you're paying at least
  $7.50 for Veo 3.1 Lite or $60 for Veo 3 full).

**The retake rate dominates the choice.** If you're disciplined
about prompts (lesson 02) and have a real shot list, you might
hit 2.0x retake instead of 2.5x. That's a 20% cost cut across
the board. Conversely, if you're sloppy and hit 5.0x retake,
every number doubles.

## What goes where in real production

Three rules from working agencies as of 2026:

1. **Hero shot? Sora 2 Pro at 1024p or Veo 3.** The output quality
   is non-negotiable for client work. ~$60-75/finished-minute.
   Used for the one or two shots that are the deliverable.
2. **B-roll / supporting shots? Kling 3.0 standard or Veo 3.1
   Lite 1080p.** Quality is good enough to cut next to a hero
   shot. ~$12-20/finished-minute. Used for the supporting 70-80%
   of a piece.
3. **Performance marketing tests? Hailuo 02 or Veo 3.1 Lite
   720p.** Quality is "AI-flavored" but the testing volume is the
   point. ~$7-10/finished-minute. Used when you need 50+ variants.

A typical 60-second promo for a serious client lands at
**$25-45 in real spend** by mixing hero shots from the premium
tier with B-roll from the value tier. Pure all-Sora-2-Pro is
$75+. Pure cheap-tier is $10 but won't ship.

## The Higgsfield wrinkle, revisited

If the brief requires deterministic camera moves (the brand book
specifies "all product shots are slow orbits," etc.), Higgsfield
becomes mandatory regardless of tier. The Plus plan at $34/mo
gives ~14-25 Sora-2 generations or ~167 Kling 3.0 generations.
At those volumes Higgsfield is a flat fee that beats per-second
pricing IF the camera control is what you actually need.

If you don't need the camera control, the $34/mo is dead weight
and you should go direct to the underlying API.

## The script

Step 5 has you write `cost_per_minute(model, retake_rate)` —
a function that takes a model name and a retake multiplier and
returns dollars per finished minute. You'll use it to make
viable/not-viable decisions on your own briefs without opening
a spreadsheet.
