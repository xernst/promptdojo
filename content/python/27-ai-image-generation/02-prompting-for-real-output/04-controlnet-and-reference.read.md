---
xp: 1
estSeconds: 180
concept: reference-images-and-controlnet
---

# Reference images and ControlNet — when prompts aren't enough

The eight knobs get you to a specific-looking image. But sometimes "specific-looking" still isn't enough. You need the **exact** pose. You need **this** building's silhouette. You need a character whose face matches **this photo**.

For these cases, you stop describing the image in text and start showing the model a reference.

## Three flavors of image conditioning

The 2026 toolbox has three distinct ways to condition generation on an existing image. Each does a different thing.

### 1. Image-to-image (the strength dial)

You give the model an image plus a prompt, plus a `strength` parameter between 0.0 and 1.0. At strength 0.1 the output is nearly your input image with light prompt changes. At strength 0.9 the input is just a vague composition starter and the prompt dominates.

- **Flux** — supports image-to-image at all tiers; pass `image` field with the source URL or base64, and a `strength` between 0 and 1.
- **Fal.ai** — many models on Fal expose image-to-image as `image_url` + `strength` in the input schema.
- **nano-banana** — supports image input as part of the multi-turn conversation. Edit-by-instruction is the same surface; you pass the image then describe what to change.

Use it for: rough sketch → polished render, color reference → matching scene, hand-drawn composition → photorealistic version.

### 2. Edit-by-instruction (Flux Kontext, nano-banana)

Newer than i2i. Instead of "give me this image but adjusted by strength X," you say "change the background to a beach" and the model edits in-place while preserving identity.

- **Flux Kontext [pro], [max], [dev]** — built specifically for this. Maintains character consistency across edit chains. Supports multi-step edits (edit, then edit again, identity holds).
- **nano-banana family** — the same shape inside a Gemini conversation; cheaper per turn but less precise than Flux Kontext for serious editing work.

Use it for: same product on different backgrounds, same character in different scenes, swapping text on a sign, recoloring an outfit while keeping the model identical.

### 3. ControlNet (structural conditioning)

The most powerful and most fiddly. You give the model:

- An image (or a pre-extracted control signal — an edge map, a depth map, a pose skeleton, a segmentation mask).
- A prompt.
- A control type (`canny`, `depth`, `pose`, `seg`, `scribble`, `lineart`, `mlsd`, etc.).

The output follows the **structure** of the control signal while filling in the **content** from the prompt. ControlNet pose conditioning is how you get "this exact pose, but as a knight in armor in a fantasy setting." ControlNet canny is how you get "this exact building silhouette, but rendered in oil painting style."

ControlNet is most commonly used through the open-weights Flux and Stable Diffusion ecosystem. You'll see it referenced in ComfyUI workflows, in self-hosted Flux setups, and via specific Replicate/Fal models like `controlnet-pose` or `controlnet-depth`.

API surfaces vary widely; if you need this in a hosted API, search the model index on Replicate or Fal for "controlnet" plus your control type. The call shape varies by provider — don't memorize one signature.

## When you'd actually reach for these

The decision tree:

- **Pure text prompt is enough** for most marketing/social/illustration work. The eight knobs cover the case.
- **Image-to-image** when you have a rough that you want polished — a sketch, a color reference, a low-quality phone shot.
- **Edit-by-instruction (Flux Kontext)** when you have a finished image and want variants that preserve identity — same product on twelve backgrounds, same character in five scenes.
- **ControlNet** when the structure must be exact — pose-locked character animation frames, building-silhouette-preserved architectural rendering, matching the layout of a wireframe to a finished UI mockup.

The mistake to avoid: starting with ControlNet because it sounds powerful. It's a power-user feature with significant setup overhead. Most production briefs are solved with a good text prompt and, if needed, Flux Kontext for the multi-variant case.

## What the next step asks

You'll be given five real-world briefs, each with one knob obviously missing. The drill is identifying which one. After that you'll read the failure modes (hands, text, character drift), then write the scoring function.
