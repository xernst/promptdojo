---
xp: 1
estSeconds: 170
concept: text-in-image-and-specialists
---

# Text in image, character consistency, and the specialty picks

The three hardest things for an image model are, in order: text inside the image, hands, and keeping a character identical across multiple renders. In 2026 each one has a specialist that solves it well.

## Text in image

Until early 2024, every image model produced garbage text. Posters with "Cumemr Sole" instead of "Summer Sale." Books with "Hapry Pottter." The problem is diffusion models don't reason about letterforms — they treat text as texture.

The 2026 state:

- **Ideogram 3.0** — purpose-built for text. Claims 90-95% accuracy. Three tiers: Turbo $0.03, Default $0.0375, Quality $0.09. Has a `magic_prompt_option` flag and supports negative prompts for style control. If your brief has copy that has to be readable, this is the default.
- **GPT Image 1 / 1.5** — instruction-tuned, decent text. Lands in the 70-85% range for short copy. Good when you want both text AND complex composition control ("logo top-left, headline center, subtle drop shadow").
- **Imagen 4 / 4 Ultra** — Google's enterprise pick. Strong on text in image, especially shorter copy. Better than Flux, worse than Ideogram.
- **Flux** — improved with Flux.1.1 [pro] Ultra and Flux Kontext [max] specifically calling out "high-quality typography generation," but still not Ideogram-tier.
- **Midjourney v7** — 30-40% accuracy. Don't use it for anything where the letters matter.

The rule: if the brief mentions specific text strings, route to Ideogram unless you have another reason not to. If the brief mentions a logo or brand mark, use Flux Kontext to composite a real PNG of the logo onto a Flux-generated background — don't ask the model to draw the logo from scratch.

## Character consistency

The classic failure: you generate a portrait of a character you like, then ask for "the same character but in a forest" and get a totally different person. Three approaches in 2026:

- **Flux.1 Kontext** — the current best. You pass an image + a text edit instruction, it preserves identity. Available as Kontext [pro] (API at $0.04/image generation), Kontext [max] (premium), and Kontext [dev] (open weights, non-commercial). Used for: "same person, different scene/outfit/expression."
- **Midjourney `--cref`** — works for casual use, lossy for production. Identity drifts across renders.
- **nano-banana multi-turn editing** — preserves identity within a session because Gemini holds the prior context. Cheap, but only works conversationally — you can't pass a reference image from outside the conversation and expect identity preservation.
- **Custom LoRAs / DreamBooth** — train a small model on 20 photos of your character. Then any Flux generation with that LoRA loaded gets perfect identity. Requires the open weights of Flux.1 [dev] and an hour of training. The right answer for "same brand mascot across hundreds of assets."

## Hands

Hands are still the universal tell. Every model still produces six-fingered or warped hands at a non-zero rate. The 2026 mitigation:

- Generate, inspect, regenerate any image with bad hands.
- Use a second pass with a hand-aware checkpoint or inpainting only the hand region.
- Or just don't show the hands. Crop them out. Half the working photographers do this on real shoots too.

## When you need a document (slide, infographic, layout)

None of these models are good at producing actual documents — slide decks, charts, infographics with structured data. The 2026 pattern is: generate the background and visual elements with an image model, then use a layout tool (HTML/CSS, Figma API, or a deck-gen library) to overlay the structured text and data. Don't expect any image model to produce a usable pitch deck slide end-to-end.

## What you're building toward

By the end of this lesson you'll have a `pick_image_model(task)` function that looks at a task description and returns the right model name. The decision logic is the rule set you've now seen:

- text-in-image required → Ideogram (or fallback Imagen 4)
- character consistency across renders → Flux Kontext (or LoRA)
- subjective taste / mood-driven, no API constraint → Midjourney
- photoreal + art-directed → Flux Pro
- batch volume + tight budget → nano-banana (Gemini Flash Image)
- instruction-heavy composition → gpt-image-1
- Google Cloud shop → Imagen 4

Five rules. One function. Next step: drill on text-in-image, then read the decision tree, then write it.
