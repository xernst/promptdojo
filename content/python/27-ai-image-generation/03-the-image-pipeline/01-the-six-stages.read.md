---
xp: 1
estSeconds: 200
concept: six-stage-image-pipeline
code: |
  # the six stages of a 2026 image pipeline.

  STAGES = [
      ("1. brief",      "what is the image FOR — channel, intent, audience, dimensions"),
      ("2. prompt",     "the eight knobs (subject, composition, lighting, style, camera, lens, palette, negatives)"),
      ("3. generate",   "send the prompt to the chosen model — usually N times, not once"),
      ("4. filter",     "score candidates, drop the bad ones, keep the top K"),
      ("5. upscale",    "boost resolution for hero/print use (Imagen 4 upscale, Flux ultra, dedicated upscalers)"),
      ("6. format",     "convert to platform formats (WebP, AVIF, JPG), strip EXIF, generate alt-text"),
  ]
  for name, desc in STAGES:
      print(f"{name:14} {desc}")
---

# Brief → prompt → generate → filter → upscale → format

The hobbyist workflow is: open the tool, type a prompt, save the result. The production workflow is six stages, each with its own quality gate. Skip a stage and either the cost balloons or the output looks like AI slop.

## Stage 1 — Brief

Before any prompt, you write down what the image is FOR.

- **Channel**: Instagram square, TikTok 9:16, web hero 16:9, email header 600x300, print 300dpi.
- **Intent**: drive a click, illustrate a product, set a mood, identify a person.
- **Audience**: who sees this and what they expect.
- **Constraints**: brand colors, must-include elements (logo, product), must-avoid elements (competitor product, controversial imagery).

The brief shapes the prompt and the platform-format step. Skipping it means you generate beautiful images that don't fit the format you actually need.

## Stage 2 — Prompt

Eight knobs (lesson 02). Subject, composition, lighting, style, camera, lens, palette, negatives. Score it with `score_image_prompt` before you spend money. Don't send a 4/8 prompt to a $0.10/image model — fix the prompt first.

## Stage 3 — Generate

The API call. The 2026 pattern is **batch, not single-shot**. nano-banana at ~$0.039/image makes generating 25 candidates cost about $1.00. For most briefs that beats one Midjourney render in expected value (better odds at least one is shipping-ready, plus options).

Where the actual API call lives depends on the model:

```python
# pseudocode — real call shape varies by provider

# Flux via Black Forest Labs direct
# import requests
# r = requests.post(
#     "https://api.bfl.ml/v1/flux-pro-1.1",
#     headers={"X-Key": BFL_API_KEY},
#     json={"prompt": prompt, "width": 1024, "height": 1024},
# )

# Flux via Replicate
# import replicate
# out = replicate.run("black-forest-labs/flux-1.1-pro", input={"prompt": prompt})

# Flux via Fal.ai
# import fal_client
# out = fal_client.subscribe("fal-ai/flux-pro/v1.1", arguments={"prompt": prompt})

# nano-banana via Google Gemini API
# from google import genai
# client = genai.Client(api_key=GEMINI_API_KEY)
# resp = client.models.generate_content(
#     model="gemini-2.5-flash-image-preview",
#     contents=[prompt],
# )
```

Don't memorize call signatures. They change. Memorize the shape: **prompt + model + size → bytes**.

## Stage 4 — Filter

You generated 25. You need 3. How to pick:

- **Manual review.** Slow but the most reliable. A human picks the top K.
- **LLM-as-judge with vision.** Send the candidates to a vision model (Claude, GPT-4o vision, Gemini) with the original brief and the scoring criteria. The model returns a ranked list. Fast and cheap (~$0.001-0.005 per candidate evaluated).
- **CLIP similarity score.** Embed the brief into CLIP space, embed each candidate, rank by cosine similarity. Deterministic and free but ranks "matches the brief" not "is beautiful."
- **Aesthetic scorer.** Open-source models like `LAION-Aesthetics-V2` score "how aesthetic does this look" on a 0-10 scale. Pair with the CLIP score for a combined rank.

The 2026 default for an app: LLM-as-judge with vision. It's the only one that handles "does this match the brief AND look good AND not have broken hands."

## Stage 5 — Upscale

The image-gen models output at fixed sizes — usually 1024x1024 or up to ~4MP for Flux Pro Ultra. For hero use, print, or large-display banners, you need 4K+. The 2026 options:

- **Imagen 4 upscale** — $0.06/image, in-line with Google Vertex AI's image generation surface.
- **Flux.1.1 [pro] Ultra** — generates at up to 4MP natively. Saves the separate upscale step.
- **Dedicated upscalers** — `clarity-upscaler`, `topaz-photo-ai` via API, `real-esrgan` open-source.

For most pipelines, generating at the highest resolution the chosen model supports and skipping the dedicated upscale is the right tradeoff. Reserve upscaling for "I have a 1024 image and I need 4K" exceptions.

## Stage 6 — Format

The final step. Often skipped, always matters:

- **Convert to platform format.** WebP for web (smaller than JPG, supported everywhere modern), AVIF for cutting edge (smaller still, support is now ubiquitous in 2026), JPG for compatibility, PNG only if you need transparency.
- **Strip EXIF metadata.** Generated images sometimes include model name, prompt, and timestamps in EXIF. Strip them before shipping unless you want your prompt leaked publicly.
- **Generate alt-text.** For every image you ship to a website, generate descriptive alt-text. A vision-model call with "describe this image in one sentence for a blind user" is roughly $0.001 and makes the page accessible.
- **Watermark or sign if needed.** C2PA content credentials are now standard from most providers (OpenAI, Google) — they sign the image so it can be authenticated as AI-generated. Don't strip these if you want provenance.

## The pipeline as code

The function shape:

```python
def run_image_pipeline(brief):
    prompt = build_prompt(brief)                    # stage 2
    model = pick_image_model(brief.task)            # from lesson 01
    candidates = generate_batch(model, prompt, n=brief.count)  # stage 3
    top_k = filter_with_vision(candidates, brief)   # stage 4
    upscaled = [upscale(img) for img in top_k] if brief.needs_4k else top_k  # stage 5
    return [format_for_platform(img, brief) for img in upscaled]  # stage 6
```

Six stages, six function calls. Every production image-gen feature you've ever used has roughly this shape underneath.

The next step drills batch-and-filter — the stage 3+4 economics. Then a multiple choice on diagnosing a broken pipeline. Then format-and-platform. Then the fill step where you wire up a dispatch. Then the write step: `cost_for_batch(model, count, options)` at real 2026 rates. Then the checkpoint plans a full shoot end-to-end.
