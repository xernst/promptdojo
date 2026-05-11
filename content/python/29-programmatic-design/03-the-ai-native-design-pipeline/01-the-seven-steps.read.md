---
xp: 1
estSeconds: 180
concept: seven-canonical-pipeline-steps
code: |
  # the seven canonical steps from idea to shipped MP4.

  PIPELINE = [
      ("1. concept",        "what is this video for, who is it for, what action does it drive"),
      ("2. reference-gen",  "AI-generated visual references — moodboards, hero shots, b-roll"),
      ("3. composition",    "HyperFrames or Remotion stitches references into a timeline"),
      ("4. audio",          "TTS narration, licensed music, or a soundtrack track"),
      ("5. captions",       "transcript synced to audio — TikTok plays muted by default"),
      ("6. render",         "render to MP4, verify lint and contrast pass"),
      ("7. review",         "stakeholder review, address notes, re-render"),
  ]
  for step, what in PIPELINE:
      print(f"{step:18s} — {what}")
---

# Seven steps, none of them optional

A shippable video has seven canonical steps. Skip any one and you either don't ship or ship something broken. AI gen models give you huge leverage on steps 2 and 4 — generating reference frames and generating narration audio — but they don't *replace* the pipeline. They make each step cheaper.

The pipeline:

1. **Concept** — what's this video doing? Who's it for? What action does it drive? This is the hardest step, and the one humans still own. AI can suggest concepts; it can't decide whether the brand should run them.
2. **Reference-gen** — generate visual references for the look. Hero shots, b-roll, color palettes, moodboards. Veo, Sora, Midjourney, Runway. The cost is now low enough to generate 10 references and pick the best.
3. **Composition** — assemble the references (plus copy, captions, brand assets) into a timeline. This is where HyperFrames or Remotion lives. The output of step 3 is a project file you can render.
4. **Audio** — narration (TTS via HyperFrames' built-in Kokoro voices, or ElevenLabs, or Cartesia), music (licensed or AI-generated via Suno, Udio), sound effects. Audio is the single biggest predictor of whether a video feels professional.
5. **Captions** — transcribe the audio to word-level timestamps and layer captions on screen. 98% of TikTok plays are muted. Captions aren't optional.
6. **Render** — go from project file to MP4. Verify lint passes, verify WCAG contrast on text, verify the timeline duration matches the audio.
7. **Review** — show the rough cut to stakeholders, collect notes, re-render. The reproducibility property from lesson 01 is what makes this loop converge.

## What changes when you go AI-native

Pre-AI, this pipeline took a team — copywriter, motion designer, voice actor, sound engineer, video editor. The fast version was two weeks. The slow version was two months.

The AI-native version compresses each step by 10-100×:

| Step | Pre-AI cost | AI-native cost |
|---|---|---|
| Concept | 2-3 days of meetings | 1-2 hours with an AI brainstorm partner |
| Reference-gen | $500-2000 stock photo/footage license | 5-10 cents per Veo/Sora generation |
| Composition | Motion designer at $1500/day | Engineer + HyperFrames for free |
| Audio | $300-800 voice actor + studio | Kokoro TTS at ~free, or ElevenLabs at ~$0.30/min |
| Captions | $1-3/minute via Rev | Whisper local for free |
| Render | $50-200 render farm time | Lambda at a few cents, or local for free |
| Review | 2-3 day async cycles | Same-day if the renders are fast enough |

The cost compression is the headline. The bigger story is the *throughput* compression. A team that used to ship 1 video a week can now ship 1 video a day. Or — with parametric variation — 100 videos a day, each personalized.

## What this lesson teaches

The rest of the lesson walks through where AI fits at each step, the `website-to-hyperframes` pattern as a worked example, and the cost model. Then you'll write `score_pipeline(steps)` — a function that audits a team's pipeline and tells you which steps they're missing.

Most pipelines fail not because step 3 is wrong but because someone forgot step 5 (captions) or step 7 (review). Scoring the pipeline against the seven canonical steps surfaces the gap before it costs you a ship date.
