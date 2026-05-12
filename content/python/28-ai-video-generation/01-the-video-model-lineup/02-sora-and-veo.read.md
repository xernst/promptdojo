---
xp: 1
estSeconds: 220
concept: sora-and-veo
code: |
  # the two heavyweight base models, side by side (mid-2026 pricing).
  sora_2 = {
      "vendor": "OpenAI",
      "released_api": "2025-10-06",
      "resolutions": ["720p"],
      "durations_sec": [4, 8, 12],
      "price_per_sec_720p": 0.10,
      "native_audio": True,
      "image_to_video": True,
      "strength": "physics + character consistency",
  }
  sora_2_pro = {
      "vendor": "OpenAI",
      "resolutions": ["720p", "1024p"],
      "durations_sec": [10, 15, 25],
      "price_per_sec_720p": 0.30,
      "price_per_sec_1024p": 0.50,
      "native_audio": True,
      "strength": "premium tier — best for hero shots",
  }
  veo_3 = {
      "vendor": "Google (Vertex AI)",
      "resolutions": ["720p", "1080p"],
      "price_per_sec_with_audio": 0.40,
      "native_audio": True,
      "strength": "cinematic + NATIVE audio in one pass",
  }
  veo_3_fast = {
      "vendor": "Google (Vertex AI)",
      "price_per_sec_with_audio": 0.15,
      "native_audio": True,
      "strength": "Veo 3 quality at sub-Lite pricing",
  }
  veo_3_1_lite = {
      "vendor": "Google",
      "released": "2026-03-31",
      "price_per_sec_720p": 0.05,
      "price_per_sec_1080p": 0.08,
      "native_audio": True,
      "strength": "cheap Veo — production-grade B-roll",
  }
  for m in (sora_2, sora_2_pro, veo_3, veo_3_fast, veo_3_1_lite):
      print(m["vendor"], "—", m["strength"])
---

# Sora 2 and Veo 3 — the two heavyweights, two philosophies

Sora 2 and Veo 3 are the closest thing to "GPT-4 class" video
models in 2026. They are not the same product, even though casual
coverage talks about them like they are.

## Sora 2 — physics-first

OpenAI shipped the Sora 2 API at DevDay on October 6, 2025. By
mid-2026 it has two tiers:

- **Sora 2** (base): 720p, durations 4 / 8 / 12 seconds, **$0.10
  per second of generated video**. Native synchronized audio.
- **Sora 2 Pro**: 720p or 1024p (1024x1792 or 1792x1024),
  durations 10 / 15 / 25 seconds. **$0.30/sec at 720p, $0.50/sec
  at 1024p**. Same audio.

What Sora 2 does better than anything else: **character and
physics consistency.** A person's face is the same face from
frame 1 to frame 300. A poured glass of water behaves like water.
A bouncing ball has the right deceleration. These are not free —
other models burn obvious tells (fingers melting, faces shifting,
fluids behaving like jello). Sora 2 spent its training compute on
exactly this.

What it does NOT do better:

- Camera moves. You can prompt a dolly-in or a rack focus and you
  get *something*, but it's nondeterministic. Higgsfield (lesson 02)
  exists because the base models, including Sora 2, are not yet
  good at this.
- Long durations. The 25-second cap on Sora 2 Pro is the longest
  in the lineup, but the price ($12.50 per 25-sec clip at 1024p,
  before retakes) means you'll generate 10s or 15s and stitch.
- Multilingual lip-sync. Veo 3 has the edge here.

## Veo 3 — cinematic + audio-native

Google released Veo 3 on Vertex AI in mid-2025 and shipped Veo 3.1
Lite on March 31, 2026 to compete on price.

- **Veo 3** (Vertex AI): 720p / 1080p. **$0.40/sec with audio**
  (Google dropped the price in September 2025 from the original
  $0.50/$0.75 launch tier). The audio is *the* feature. Speech with
  lip-sync. Ambient sound. Music. All generated in the same pass
  as the picture. No compositing step.
- **Veo 3 Fast**: **$0.15/sec with audio.** Lower-quality sibling
  shipped at the same price-cut, slots between full Veo 3 and the
  Lite tier.
- **Veo 3.1 Lite**: **$0.05/sec at 720p, $0.08/sec at 1080p.** This
  is the model that made Veo competitive on price. Quality is
  slightly below full Veo 3 but better than most cheap-tier
  alternatives.
- Available consumer-side via Google AI Ultra ($249.99/mo) which
  bundles Veo 3 with Gemini 2.5 Ultra and other Google AI tools.

What Veo 3 does better than Sora 2:

- **Audio in one shot.** Sora 2 added audio in 2025 but Veo 3
  shipped it first and the speech quality is still the reference.
  When the brief is "talking head with synchronized speech," Veo 3
  is the default.
- **Cinematic lighting.** Side-by-side, Veo 3 outputs look more
  like film and Sora 2 outputs look more like high-fidelity
  game cinematics. Subjective, but consistent.

What it does NOT do better:

- Character consistency across cuts. Sora 2 wins here.
- Hand and finger physics. Both fail, Sora 2 fails less.

## The "which one" question

Three-way split that works in practice:

| Job | Use |
|---|---|
| Hero product shot, 8 sec, no audio | Sora 2 ($0.80) |
| Talking-head ad with VO, 30 sec | Veo 3 with audio ($12.00) |
| Mass B-roll, 60 clips × 6 sec | Veo 3.1 Lite ($0.30/clip × 60 = $18) |
| Character-driven narrative | Sora 2 Pro (consistency) |
| Anything with sound design | Veo 3 (audio native) |

When in doubt: **Sora 2 if you care most about what's in the
frame; Veo 3 if you care most about what comes out of the
speakers.**

## Both have a real moat

The smaller models in the next two reads (Kling, Hailuo, Pika,
Luma) are catching up fast, but Sora 2 and Veo 3 are the only
ones currently usable for premium client work without a heavy
disclaimer. Until that changes — and it will — these two are the
default heavyweight picks.
