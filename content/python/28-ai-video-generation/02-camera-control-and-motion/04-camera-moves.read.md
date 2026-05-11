---
xp: 1
estSeconds: 220
concept: camera-moves
code: |
  # the working set of camera moves, with what they do and how to prompt them.
  CAMERA_MOVES = {
      "static":      "camera does not move. (rare in pro work; mostly for tension.)",
      "pan":         "camera rotates LEFT or RIGHT on a fixed axis. (a head turn.)",
      "tilt":        "camera rotates UP or DOWN on a fixed axis. (a chin lift.)",
      "dolly in / push-in":   "camera moves CLOSER to subject (along its lens axis).",
      "dolly out / pull-out": "camera moves AWAY from subject.",
      "truck left / right":   "camera moves SIDEWAYS, parallel to subject.",
      "pedestal up / down":   "camera moves VERTICALLY (raise/lower the whole rig).",
      "orbit":       "camera circles AROUND a fixed subject. (great for product.)",
      "tracking":    "camera moves WITH a moving subject. (follow shot.)",
      "parallax":    "camera moves sideways through a 3D scene, foreground & background separate.",
      "rack focus":  "camera doesn't move — FOCUS shifts between two depths.",
      "dolly zoom":  "camera dollies one way while zooming the other (Vertigo effect).",
  }
  for name, desc in CAMERA_MOVES.items():
      print(f"{name:<22} — {desc}")
---

# Camera moves — the second axis of every prompt

Once you've named the shot type, the second axis is **how the
camera travels through the scene over the duration of the clip.**
There are about a dozen camera moves that account for 95% of
professional video. Each has a specific name, a specific
direction, and a specific intent.

## The twelve moves you need to know

| Move | What it does | Typical use |
|---|---|---|
| **Static** | Camera doesn't move. | Tension, surveillance, talking head. |
| **Pan** | Camera rotates left/right on a fixed point. | Following action across a frame. |
| **Tilt** | Camera rotates up/down on a fixed point. | Revealing a tall subject. |
| **Dolly-in / push-in** | Camera moves *closer* to subject. | Intensity rising, internal thought. |
| **Dolly-out / pull-out** | Camera moves *away* from subject. | Revelation, emotional release. |
| **Truck** (left/right) | Camera moves *sideways*, parallel to subject. | Following a moving subject. |
| **Pedestal** (up/down) | Camera moves *vertically*. | Following standing-to-sitting action. |
| **Orbit** | Camera circles around a *fixed* subject. | Product showcases, dramatic reveals. |
| **Tracking** | Camera moves *with* a moving subject. | Following walks, runs, drives. |
| **Parallax** | Sideways move through depth — foreground and background separate. | Establishing depth in a still scene. |
| **Rack focus** | Camera static — focus *shifts* between depths. | Drawing attention across the frame. |
| **Dolly zoom** | Dolly one direction + zoom the other. | The Vertigo effect, vertigo / dread. |

## Why each name matters

These names are not interchangeable. "Push-in" and "zoom-in" are
different operations. Push-in is the camera physically moving
closer — parallax shifts. Zoom-in is the lens changing focal
length — parallax stays the same. Audiences cannot articulate the
difference but they see it. AI models trained on real footage
have learned the distinction.

If you write "zoom in on the subject," you might get a zoom (lens
change) or a push-in (camera move) depending on the model's
mood that day. If you write "slow push-in over 3 seconds," you
get a push-in. The specificity is the API.

## Combinations — the cinematic look

Real shots usually combine moves. A handheld walk through a
crowd is *tracking + slight pedestal bounce + handheld
microjitter*. A car commercial product reveal is *low pedestal
+ slow orbit + tilt-up at the end*. Higgsfield's Cinema Studio
exists specifically to make combinations like this plannable —
it stacks moves into one instruction set.

Three combinations that work, with names you can paste straight
into a prompt:

1. **"Slow push-in (3 seconds) with subtle tilt-up at the end."**
   The reveal shot. Subject becomes more important; head turns
   toward the heavens at the moment of decision.
2. **"Wide orbit (180 degrees over 5 seconds) maintaining
   subject at center."** Product shot. Beauty pass. Audi
   commercial standard.
3. **"Tracking shot following subject left-to-right, medium
   distance, with parallax against the background."** The
   walking-and-talking shot from every prestige TV drama.

## Duration and pace matter

A push-in over 1 second feels *aggressive*. The same push-in
over 5 seconds feels *contemplative*. The model needs to know
both the move *and* the duration:

> "Slow 4-second push-in" ≠ "Fast 1-second push-in"

Most failures in AI video camera work are duration mismatches.
You ask for a 1-second clip and inside it want an orbit, a
push-in, AND a tilt-up. The model can't fit all three; you get
something that looks like a confused twitch. Match the move
vocabulary to the duration budget.

## Higgsfield as the camera-move escape hatch

The base models (Sora 2, Veo 3, Kling 3.0) interpret these moves
*roughly correctly* most of the time. About 60-70% of generations
will match the move you asked for. The other 30-40% will pick
something nearby. For B-roll this is fine. For a planned shot
list this is dealbreaking.

Higgsfield's Cinema Studio is built around making the named
moves *deterministic*. You ask for a 35mm push-in at f/2.8 over
3 seconds; you get a 35mm push-in at f/2.8 over 3 seconds. The
acceptance rate for the move (not the content) approaches 100%.
That's what you're paying for — control, not raw frame quality.

## The takeaway

Two axes, named explicitly, in every prompt:

1. **Shot type** (from previous read): "medium close-up,"
   "wide," "extreme close-up," etc.
2. **Camera move** (this read): "static," "push-in over 3
   seconds," "orbit 180 degrees," etc.

A prompt without these two axes is a wishing well. A prompt with
them is a shot specification. The output gap between the two is
the entire difference between "AI video" and "video that happens
to be made with AI."
