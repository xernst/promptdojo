---
xp: 1
estSeconds: 200
concept: model-per-step-routing
---

# Different model for different step

The "AI model" inside this pipeline isn't one model — it's at least four, each doing what it's best at. Routing the right work to the right model is what makes the pipeline cheap and good.

## Step 1 — Concept

A reasoning-strong text model. Claude Opus, GPT-5, Gemini Ultra. The job is to take a fuzzy brief ("we want to launch our new SKU") and produce a structured concept doc: who's the audience, what action are we driving, what's the hook in the first 3 seconds, what's the CTA at the end. The token bill is small (a few thousand input, a few hundred output). You'll iterate maybe 3-5 times before locking the brief.

Tools that sit in this slot: gstack's `/plan-ceo-review`, `/design-shotgun`, `/plan-design-review`. They're concept-stage thinking partners. The output is a written plan, not pixels.

## Step 2 — Reference-gen

A video generation model. As of mid-2026, the strongest are Veo 3 (Google), Sora 2 (OpenAI), Runway Gen-4, Pika 2. Pick by what you need:

- **Veo** for realistic motion and lighting.
- **Sora** for stylized scenes and stronger physics.
- **Runway** for image-to-video (start from a still, animate it).
- **Pika** for fast iteration and lipsync.

Costs in 2026: usually a few cents to a couple dollars per 5-10 second clip. Generate 10, throw away 9, use 1. The economics work because the rejection rate is much higher than for human-made footage but the per-unit cost is 100× lower.

## Step 3 — Composition

Not an AI step. This is where a coding agent (Claude Code, Cursor, Codex, Aider) drives the HyperFrames or Remotion project. The agent reads the brief, picks scenes, writes the HTML or React components, runs `npx hyperframes lint`, and iterates.

Where models *do* help: writing the composition. The HyperFrames skill files are designed specifically for an LLM agent to read — they're long, detailed, and ground-truth-authoritative. A coding agent can author a HyperFrames composition in one shot given the SKILL.md and a brief.

## Step 4 — Audio

Three sub-steps, three different models:

- **Narration (TTS):** HyperFrames ships with Kokoro-82M (the `npx hyperframes tts` command). Voices like `af_nova`, `bf_emma`, etc. Free, local, deterministic. ElevenLabs is the paid alternative when you need a specific celebrity-style voice — costs ~$0.30/minute. Cartesia is the low-latency alternative.
- **Music:** Suno or Udio for AI-generated tracks. Generally licensed for commercial use under their subscription tiers. Both are at the "good enough for B-roll backing track, not good enough for the hero piece" stage.
- **SFX:** ElevenLabs Sound Effects, or pre-licensed Sonniss/Freesound libraries. AI gen still doesn't beat a real foley library for short percussive hits.

## Step 5 — Captions

Whisper (OpenAI) for transcription. HyperFrames bundles it via `npx hyperframes transcribe`. Runs locally, free, supports multiple model sizes (`tiny.en`, `base.en`, `medium.en`, `large-v3`). The output is word-level timestamps that the composition layer can sync against.

For non-English content, deepgram or AssemblyAI tend to outperform Whisper on accuracy.

## Step 6 — Render

Not an AI step. `npx hyperframes render` locally or `@remotion/lambda` for parallel cloud renders. Verify lint passes, verify contrast (HyperFrames runs a WCAG audit automatically), verify the timeline matches the audio length.

## Step 7 — Review

A vision-strong model can help with QA — Claude with vision, GPT-5 vision. Feed it the rendered MP4 (or screenshots at key timestamps) and ask: "any visual issues?". HyperFrames also has an animation-map script that produces a structured Gantt chart of every tween. Reading the JSON is faster than re-watching the video 50 times.

## The routing table

| Step | Model class | Example tools (2026) |
|---|---|---|
| Concept | Reasoning text | Claude Opus, GPT-5, Gemini Ultra |
| Reference-gen | Video gen | Veo 3, Sora 2, Runway Gen-4, Pika 2 |
| Composition | Coding agent | Claude Code, Cursor, Codex |
| Audio (TTS) | Speech synthesis | Kokoro (local), ElevenLabs, Cartesia |
| Audio (music) | Music gen | Suno, Udio |
| Captions | Transcription | Whisper, Deepgram, AssemblyAI |
| Render | None (mechanical) | HyperFrames CLI, Remotion CLI, @remotion/lambda |
| Review | Vision model | Claude vision, GPT-5 vision |

The routing matters. Using a reasoning model for transcription is wasteful. Using a transcription model for concept work is malpractice. The pipeline wins when each step calls the right model for the job.
