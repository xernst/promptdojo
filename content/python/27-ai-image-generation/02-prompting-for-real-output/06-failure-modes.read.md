---
xp: 1
estSeconds: 200
concept: image-failure-modes
---

# Failure modes — what still goes wrong in 2026

The eight knobs cover prompt quality. But three categories of failure are still inherent to the models themselves. Knowing them tells you when to inspect output before shipping and when to route a brief to a different tool entirely.

## 1. Text in image — the hardest universal failure

Until late 2024, every image model produced garbage text. Posters with "Hapry Birthay" instead of "Happy Birthday." The 2026 state:

- **Ideogram 3.0** lands 90-95% accuracy on rendered text.
- **GPT Image 1.5** and **Imagen 4** are decent for short copy (5-10 words).
- **Flux.1.1 [pro] Ultra** and **Flux Kontext [max]** improved, but trail Ideogram.
- **Midjourney v7** still runs 30-40% accuracy.

The rule: if the brief contains a specific text string, use Ideogram. If you can't route to Ideogram, generate the text in a second compositing layer (HTML/Figma/Photoshop) on top of an image-model background — don't ask the model to render the text inside the image.

## 2. Hands — still tells

Hands are the universal failure. Six fingers. Bent thumbs. Hands fused with objects. Every model still produces broken hands at a non-zero rate.

Mitigations:

- **Generate-and-inspect.** Always look at the hands before approving. This is one of the costs of using AI image gen — there's a manual check step.
- **Inpaint the hand region.** If a generation is otherwise great, mask the hand region and regenerate just that part with a hand-aware checkpoint. Most production pipelines have this as a pass.
- **Crop them out.** Half the working photographers do this on real shoots. If hands aren't critical to the brief, frame around them.
- **Hide them.** Hands in pockets, behind back, holding a prop that obscures fingers. The composition naturally fixes the problem.

If hands are critical to the image (a portrait of a watchmaker, a chef plating food), expect to regenerate 3-5x or to do an inpainting pass.

## 3. Character consistency — handled, but with effort

You want the same character — same face, same proportions, same wardrobe — across 10 renders. Out of the box, no model does this with a text prompt alone. The same prompt run twice will produce two visibly different people.

The 2026 solutions:

- **Flux Kontext** (pro / max / dev). Pass a reference image plus an edit instruction; identity is preserved. Best in class for production.
- **Midjourney `--cref`**. Works for casual use, lossy for production. Identity drifts.
- **LoRA fine-tuning on Flux [dev]**. Train a small adapter (~30 minutes on an H100) on 15-30 photos of your character. Then any Flux generation with that LoRA gets perfect identity. The right answer for "same brand mascot across hundreds of assets" or "this client's actual face."
- **DreamBooth on open Stable Diffusion** — older, less clean than Flux LoRAs, but still around.

The wrong approach: trying to describe the character precisely enough in text that the model produces the same face. The text encoder isn't accurate enough. Use an image reference.

## 4. The "AI face"

A meta-failure across all models: people generated end up with a recognizable "AI look." Slightly too symmetric, slightly too smooth, slightly too lit. Even with great prompts.

Mitigations:

- **Specify imperfection.** "Slight asymmetry, faint freckles, slight skin texture, faint under-eye shadow." The training data is full of retouched studio photography; you have to actively pull the model away from it.
- **Specify a real camera and film.** "Shot on 35mm Kodak Portra 400" produces less of the plastic look than the default of "studio portrait."
- **Avoid the smile.** "Smiling" → AI face. "Mid-laugh, looking off-camera" or "neutral expression, half-turned away" → not AI face.

## What this means for your pipeline

Three takeaways:

1. **Build inspection into the pipeline.** Generate, then look. Don't ship un-reviewed image-model output to customers.
2. **Route by failure mode.** Text-in-image → Ideogram. Character consistency → Flux Kontext or LoRA. Hands matter → expect inspection and inpainting.
3. **The eight knobs are necessary, not sufficient.** They get you to "specific image." They don't fix hands. They don't fix the AI face by themselves. You also need to know what the model can't do.

The next step asks you to write `score_image_prompt(prompt)` — a checker that catches the missing-knob bugs before you spend money sending a bad prompt. Then the checkpoint asks you to rank five prompts by completeness.
