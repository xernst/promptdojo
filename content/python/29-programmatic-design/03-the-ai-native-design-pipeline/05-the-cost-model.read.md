---
xp: 1
estSeconds: 150
concept: cost-of-each-step
code: |
  # rough cost per render, AI-native pipeline, 2026 prices.

  COSTS = {
      "1. concept":       "free (Claude/GPT call: ~$0.10)",
      "2. reference-gen": "$0.10 - $5.00 (Veo/Sora/Runway clip × N tries)",
      "3. composition":   "free (Claude Code session writes HyperFrames HTML)",
      "4. audio (TTS)":   "free with Kokoro, ~$0.30/min with ElevenLabs",
      "4. audio (music)": "Suno/Udio subscription, ~$10/mo for unlimited renders",
      "5. captions":      "free (local Whisper)",
      "6. render":        "free local CPU, or ~$0.05 on @remotion/lambda",
      "7. review":        "free (human time + a vision-model QA call ~$0.10)",
  }
  for step, cost in COSTS.items():
      print(f"{step:20s} {cost}")
---

# The cost model — what one render actually costs

The headline most people miss: the *render* itself is free. The HyperFrames render runs on your laptop's CPU; the @remotion/lambda render is a few cents. The real cost is the AI inputs.

## Per-render cost breakdown

Look at the editor. A representative 30-second product video in 2026:

- **Concept:** ~$0.10 in Claude/GPT tokens for the brief.
- **Reference-gen:** $0.10 - $5.00 depending on how many AI gen attempts you make per shot. Veo charges per second of output; Sora is similar. Generate 10 attempts at $0.30 each and keep the best, you're at $3.
- **Composition:** free in terms of API cost (Claude Code writes the HyperFrames HTML in a session you'd be running anyway). Maybe $0.50 - $2 in Anthropic API cost if you're using Claude Code in production with the chapter-23 prompt-cache hits.
- **Audio:** free if you use Kokoro TTS. ElevenLabs is ~$0.30/minute. Music via Suno/Udio is a flat subscription, ~$10/month for effectively unlimited renders.
- **Captions:** free via local Whisper.
- **Render:** free on local CPU. ~$0.05 on @remotion/lambda for a 30-second clip.
- **Review:** human time costs human-time money. The QA pass with a vision model is ~$0.10.

**Total per render: $0.30 - $7.00 depending on how many AI gen attempts you make.**

Compare to the pre-AI cost — voice actor at $300/hour, motion designer at $1500/day, stock licenses at $200/clip. The same 30-second video used to cost $2000-$5000 and 1-2 weeks. Now it costs $5 and one afternoon.

## What this unlocks

Three different business models live in the gap:

### Model A — Volume at zero marginal cost
A DTC brand renders a fresh ad for every product, every week. 200 products × 52 weeks = 10,400 ads/year. At $2/ad that's $20,800 — cheaper than one human-made campaign would have been. The cost-per-render is so low that the question "is this product worth a video?" stops mattering. Every product gets a video.

### Model B — Quality at constant cost
A high-end agency keeps the per-render budget around the pre-AI level ($500-1000) but uses the AI compression to do 50 iterations per render instead of 3. The output quality goes up because the rejection rate is now affordable.

### Model C — Personalization at scale
The Spotify-Wrapped pattern. A subscription product generates a per-user video as a renewal hook or year-in-review. With 1M users at $2/render, the program costs $2M to run — but if it lifts retention by 1%, the LTV math wins easily.

## Where the cost still bites

Three real cost areas left:

- **Reference-gen rejection rate.** AI video models still produce a lot of unusable output. Budgeting for 5-10× over-generation is normal.
- **Music licensing.** AI-generated music is fine for B-roll but still doesn't beat a licensed track for hero pieces. Real licenses still cost real money.
- **Review cycles.** If a stakeholder requests 30 revisions, "rendering is free" doesn't help — your engineer's time is the bottleneck.

The pipeline doesn't eliminate cost. It moves cost from "rendering and production" to "deciding what to render." Which is the right place for the cost to be.
