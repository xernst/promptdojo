---
xp: 1
estSeconds: 210
concept: shot-vocabulary
code: |
  # the working set of shot types, with what they're for.
  SHOT_TYPES = {
      "extreme wide (EWS)": "establishing geography — subject tiny in frame",
      "wide (WS)":          "subject + environment, full body + space",
      "medium wide (MWS)":  "subject knees-up, environment context retained",
      "medium (MS)":        "subject waist-up, conversational distance",
      "medium close (MCU)": "subject chest-up, the news-anchor frame",
      "close-up (CU)":      "subject head-and-shoulders, emotion-readable",
      "extreme close (ECU)":"a single feature — eyes, hands, a detail",
      "over-the-shoulder (OTS)": "two subjects, one's shoulder framing the other",
      "POV":                "the viewer IS the subject — first-person",
  }
  for k, v in SHOT_TYPES.items():
      print(f"{k:<22} — {v}")
---

# Shot vocabulary — the words that mean something to the model

The first axis to specify in any prompt is **what is in the frame
and how close.** This is "shot type." It has a vocabulary that
predates AI by 100 years and every modern model has been trained
on enough labeled film footage to recognize it.

## The nine shots you actually need

| Shot | Abbrev | Used for |
|---|---|---|
| Extreme Wide | EWS | Geography. Subject tiny or absent. Opening of a scene. |
| Wide | WS | Whole subject + environment. Establishing the relationship between them. |
| Medium Wide | MWS | Subject knees-up. Common for action. |
| Medium | MS | Subject waist-up. Conversational distance. |
| Medium Close | MCU | Subject chest-up. News-anchor frame. Default for dialogue. |
| Close | CU | Head and shoulders. Emotional weight. |
| Extreme Close | ECU | A single feature — eyes, lips, hands, an object. |
| Over-the-Shoulder | OTS | Two subjects, one's shoulder framing the other. |
| POV | POV | Camera IS the subject. First-person. |

Almost every shot in every piece of professional video is one of
these nine. AI models, including all the heavyweights, have been
trained on labeled examples. Use the labels.

## Why this matters for video prompts

A prompt that names the shot type is grounding the model in
something concrete:

> **Bad:** "a man at a coffee shop, cinematic, beautiful."
>
> **Good:** "Medium close-up of a man sipping coffee at a window
> seat, shallow depth of field, warm light from frame-left."

The good version specifies:
- **Shot type** (MCU)
- **Action** (sipping coffee)
- **Setting** (window seat)
- **Depth of field** (shallow)
- **Lighting direction** (frame-left)
- **Lighting quality** (warm)

The bad version specifies one thing: "make it pretty." The model
has no choice but to invent the other five and the inventions
are unstable across retakes. You get a different shot every
time, none of them what you imagined.

## The two most-overused shots

In AI video specifically, two shots get overused:

1. **The slow drift wide.** Default Sora 2 / Veo 3 output when
   the prompt is vague. Reads as "AI nature documentary." Use
   only when you want a literal landscape moment.
2. **The locked-off medium.** Default for any prompt that
   mentions a person without specifying the shot. Reads as
   stock-photo-in-motion.

If your shot list has more than two of either, the piece will
read as AI-generated even if every individual shot is technically
fine. **The variety of shot types is what makes a sequence read
as professional.**

## The 30-shot test

Take any 30-second piece of professional video. Count the shot
types. You will find 5-10 different shot types in the sequence.
Each shot transition is a deliberate change of distance or angle.

Now take any 30-second piece of AI video that "looks like AI
video." Count the shot types. You will find 1-2 shot types
repeated through the sequence — usually a slow drift wide and a
locked-off medium, alternating.

The fix is shot-list discipline before generation. Decide the
shot types up front. Generate against the list. The output will
read as a real piece of video, not a tech demo.

## How to write a shot type in a prompt

The format the heavyweights respond to most consistently:

```
[Shot type] of [subject] [action], [framing detail],
[depth of field], [lighting].
```

Examples that work:

- "Medium close-up of a woman laughing at a phone screen,
  three-quarter angle, shallow depth of field, soft window light."
- "Extreme close-up of fingers typing on a mechanical keyboard,
  side angle, deep focus, neon underglow."
- "Wide shot of a runner cresting a hill at dawn, low horizon,
  deep focus, backlit sun."

Each of these prompts specifies the same five things every time.
Each one is reproducible. Each one cuts together with the others
because the variety is structural, not accidental.

This is the first axis. The next read covers the second:
**camera moves** — how the camera travels through the scene.
