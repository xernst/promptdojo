## Video is no longer a research demo

Image generation went from "uncanny" to "production-grade" in about two years. Video has taken roughly the same trajectory, but compressed into eighteen months: when Sora 1 leaked in early 2024 it was a spectacle. Sora 2 (September 2025), Veo 3 (mid-2025, native audio), Veo 3.1 Lite (March 2026, $0.05/sec) and the Kling 3.0 release (February 2026, native 4K with audio) collectively crossed the line from "trick" to "infrastructure." There are now at least eight distinct video models with real production users, each occupying a different lane.

The catch: video is also the most *expensive* generative modality by an order of magnitude. A 60-second promo on Sora 2 Pro at 1024p costs $30 in raw API spend. The same minute on Veo 3 with audio runs $45. Higgsfield's flagship Cinema Studio sits on top of those APIs and charges in credits that work out to single-digit dollars per usable clip. None of this includes the "generate ten, pick one" reality.

## The four questions that decide which model

1. **Do you need native audio?** Veo 3 generates speech, ambience, and music inline. Sora 2 generates audio too. Kling 3.0 added it in February 2026. Everyone else makes you composite audio in post.
2. **Do you need camera control?** Higgsfield's specialty — virtual lenses, focal lengths, stacked moves, character lock-in. Most base models can't do a coherent dolly-in or rack focus. Higgsfield wraps the base models with that vocabulary.
3. **Is the budget per-minute viable?** Cheap tier (Hailuo, Pika base, Veo 3.1 Lite): $3-5/finished-minute including retakes. Premium tier (Sora 2 Pro, Veo 3 with audio): $30-60/finished-minute. Different products entirely.
4. **Text-to-video, image-to-video, or video-to-video?** Image-to-video is the sweet spot for product work — you control the first frame in something cheap (Nano Banana, Imagen 4) and only spend the video budget on motion.

## What AI specifically gets wrong

- **Treating all video models as interchangeable.** They are not. Higgsfield is a camera-control layer; Sora 2 is a physics-first base model; Kling 3.0 is the price-performance leader; Veo 3 owns audio. Picking by "which sounds coolest" wastes thousands of dollars.
- **Text-to-video as the default.** You get one shot at composing the frame, and the model picks for you. Image-to-video gives you that frame in advance, cheaply, with full control.
- **Prompting "cinematic."** The word is meaningless to the model. Shot vocabulary (medium close-up, push-in, rack focus) is meaningful. "Cinematic" is what someone writes when they don't know the words.
- **Static cameras.** A 5-second locked-off shot from any 2026 model is the new "AI smell." Audiences clock it instantly. The fix is camera motion — Higgsfield's whole pitch.
- **Forgetting the acceptance rate.** "Generate 10, pick 1" is real. Plan budget against the *retake-multiplied* cost, not the headline price.

## What you'll be able to do at the end

By the end of this chapter you'll have:

- A mental map of the 2026 video model lineup — which one to use for which job, by lane (physics, audio, camera, price, region).
- The shot vocabulary that separates AI-generated craft from AI-generated slop. Specific moves, specific lenses, specific timing.
- A routing function that picks a model from a brief.
- A cost-per-finished-minute model that accounts for retake rate. Run it on your idea before you spend the money.

After this chapter, when someone says "we should make an AI video," you'll be the person in the room who can name the right model, write the shot list, and price it out before anyone opens a browser tab.
