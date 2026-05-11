---
xp: 2
estSeconds: 200
concept: remotion-fundamentals
code: |
  # Remotion's surface, paraphrased — the React side of programmatic video.

  REMOTION_BUILDING_BLOCKS = [
      ("<Composition />",      "register a renderable component with a name, duration, fps, dimensions"),
      ("useCurrentFrame()",    "hook that returns the current frame number — drives all motion"),
      ("interpolate(...)",     "map a frame range to a value range, optional easing"),
      ("<Sequence from=... />", "compose multiple components on a shared timeline"),
      ("<Video /> / <Audio />","media elements with frame-aware playback"),
      ("npx remotion render",  "render a composition to MP4 locally"),
      ("@remotion/lambda",     "render distributed across AWS Lambda for speed and scale"),
  ]
  for k, v in REMOTION_BUILDING_BLOCKS:
      print(f"{k:24s} — {v}")
---

# Remotion — React components, frame by frame

Remotion's pitch: "if you can write React, you can write video." A composition is a React component. The renderer evaluates that component once per frame, screenshots the output, and stitches the frames into an MP4.

## The component you write

```tsx
import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";

export const Title: React.FC<{ headline: string }> = ({ headline }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", justifyContent: "center" }}>
      <h1 style={{ opacity, color: "white", fontSize: 120 }}>{headline}</h1>
    </AbsoluteFill>
  );
};
```

`useCurrentFrame()` returns the current frame number (0 at start, `fps * duration` at end). `interpolate(frame, [0, 30], [0, 1])` maps frames 0-30 to opacity 0-1. There's no timeline object you push tweens onto — every frame is a fresh render of the component with the current frame number wired through props or hooks.

## How a project is laid out

A Remotion project is a normal React app under `src/`, plus a `remotion.config.ts` and a `Root.tsx` that registers compositions:

```tsx
import { Composition } from "remotion";
import { Title } from "./Title";

export const Root = () => (
  <>
    <Composition
      id="hero-title"
      component={Title}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ headline: "Launch day" }}
    />
  </>
);
```

That `<Composition />` block is the same shape as a HyperFrames clip — name, duration, dimensions. Props are explicitly typed, which is the React-y advantage: TypeScript catches "I forgot to pass the headline" at compile time.

## The render path

Two rendering options:

- **Local:** `npx remotion render hero-title out.mp4 --props='{"headline":"Hello"}'`. Spins up Chromium, renders frame by frame, stitches via FFmpeg. Good for laptop iteration.
- **AWS Lambda:** `@remotion/lambda` distributes the render across many Lambda functions running in parallel. Each function renders a chunk of frames; the result is concatenated in S3. This is how production teams render long videos in seconds instead of hours. Lambda renders cost a few cents per render on AWS, plus Remotion's licensing layer on top.

## Licensing — read the fine print

Remotion is "open source" but commercial usage at scale requires a paid license. As of 2026:

- **Free license** for individuals or companies with ≤ 3 employees.
- **Company license** is per-developer-seat ($25/dev/month) plus per-render fees for self-hosted ($10 per 1000 renders/month), with a $100/month minimum.
- **Enterprise license** starts at $500/month.

HyperFrames is also open source but does not have a per-seat or per-render licensing wall. If cost across a large org matters, that's a real consideration.

## Why this design wins for some teams

Remotion is built on three bets, parallel to HyperFrames' three:

1. **React is the most expressive language for declarative UI**, and video is UI through time.
2. **The component model handles parametric rendering naturally.** Props in, frames out. A loop over a JSON file becomes a loop over `defaultProps`.
3. **AWS Lambda is the right scale model.** Hundreds of renders in parallel without provisioning servers.

If your team already lives in React, ships Next.js apps, and would rather write `interpolate(...)` than tween config objects, Remotion's mental model is the right match. If your team is half designers, half engineers, and "let's write some CSS" is the natural first instinct, HyperFrames probably wins.
