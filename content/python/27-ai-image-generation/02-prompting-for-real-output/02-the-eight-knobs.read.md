---
xp: 2
estSeconds: 200
concept: eight-prompt-knobs
code: |
  # the eight knobs, in the order they go in a prompt.
  # naming each one narrows the distribution the model samples from.

  KNOBS = [
      ("subject",     "young woman with curly auburn hair, looking off-camera"),
      ("composition", "rule-of-thirds, subject in left third, blurred bookshelves background"),
      ("lighting",    "golden-hour side-lighting from a window on her left, soft shadows"),
      ("style",       "editorial portrait, film grain, Kodak Portra 400 palette"),
      ("camera",      "shot on 35mm film camera, eye-level perspective"),
      ("lens",        "85mm f/1.4 lens, shallow depth of field"),
      ("palette",     "muted earth tones, terracotta sweater, warm shadows"),
      ("negatives",   "no text, no watermark, no harsh studio lighting"),
  ]
  for name, example in KNOBS:
      print(f"{name:12} → {example}")
---

# The eight knobs

Every production-grade image prompt names eight things. Skip any one and the model fills in the average of the training data on that axis. Name all eight and you've narrowed the distribution to roughly the image you want.

The eight, in the order a working prompt usually lists them:

## 1. Subject

What is in the image. Be specific about **what kind of subject** (young woman, not "girl"), **identifying features** (curly auburn hair), and **action or pose** (looking off-camera at 30 degrees, holding a coffee cup, mid-stride).

The trap: "subject" alone isn't enough. "A woman" produces a generic woman. "A 32-year-old woman with shoulder-length brown hair, mid-laugh, holding a vintage Leica" produces the same person across many renders.

## 2. Composition

Where things sit in the frame. The vocabulary: **rule of thirds**, **centered**, **symmetric**, **leading lines**, **negative space**, **close-up / medium / wide**, **subject in left third**, **eye level / high angle / low angle / Dutch tilt**.

A single composition term immediately gives an image more intent and visual impact. The best angle depends on mood: eye level for connection, high angle for vulnerability, low angle for strength.

## 3. Lighting

How light hits the subject. **Golden hour, blue hour, harsh midday, overcast, studio three-point, rim light, chiaroscuro, volumetric god rays, bioluminescent glow.** Models understand specific physical descriptions ("golden-hour side-lighting from a window on her left") far better than vague terms ("beautiful lighting").

Lighting is the single biggest tell between AI slop and AI work that ships. Studio over-lighting is the default; specifying anything else immediately raises the output quality.

## 4. Style

The visual language. **Editorial photography, fashion editorial, fine-art portrait, watercolor illustration, vector flat illustration, oil painting, cyberpunk concept art, brutalist architecture rendering, anime cel-shaded, 90s film stock.**

Style words pull the model toward a specific cluster in its training distribution. "Editorial portrait" and "stock photo" are both photographs of people, but they sample completely different distributions of light, pose, color, and finish.

## 5. Camera

The capture device. **Shot on 35mm film camera. Shot on Leica M11. Shot on iPhone 15 Pro. Drone shot. GoPro fisheye.** The model has learned the look of each because professional photographs are often captioned with their gear.

Camera also encodes perspective: **eye-level, high-angle, low-angle, bird's-eye, worm's-eye, over-the-shoulder, POV**. Pick one. Don't make the model guess.

## 6. Lens

The optics. **85mm f/1.4 (portrait, shallow depth of field), 50mm f/1.8 (natural, slight portrait), 24mm wide-angle (landscape, environmental, deeper depth), 100mm macro (close-up texture), 200mm telephoto (compression, distant subject).** Diffusion models have learned the optical characteristics of specific lenses. Naming a lens does roughly what naming it on a real shoot does.

## 7. Color palette

The chromatic direction. **Muted earth tones, terracotta and forest green, pastel pinks and creams, high-contrast monochrome, Kodak Portra 400 (warm shadows, soft highlights), Fuji Velvia (saturated, punchy), teal-and-orange film grade.**

Palette is the second-biggest aesthetic lever after lighting. A studio-lit portrait in muted earth tones reads as editorial. The same portrait in saturated cyan-and-magenta reads as cyberpunk. Same composition. Same lighting. Different output, because you moved this knob.

## 8. Negatives

What you do NOT want in the image. **No text, no watermark, no harsh studio lighting, no extra fingers, no plastic skin, no smile, no logo.**

Negative prompts work differently across models — Flux and Stable Diffusion forks honor them as a separate input field, Midjourney has `--no`, gpt-image-1 accepts them in the prompt. But every model handles "negatives" of some kind. The most useful are usually the slop-defaults: text, watermarks, the AI smile, harsh studio light.

## Why eight, in this order

The order matches what the model resolves first. Subject is non-negotiable — without it, no image. Composition tells the model where to place the subject. Lighting and style set the visual register. Camera and lens narrow the optical look. Palette pulls the color cluster. Negatives prune the slop defaults out.

You can shuffle the order in your final prompt — the model doesn't care about syntax as long as each concept is named — but the **completeness** matters. The next step gives you a broken prompt; you'll fix it. Then a multiple-choice on identifying which knob is missing from a real-world brief. Then the score function you can run as a pre-flight check.
