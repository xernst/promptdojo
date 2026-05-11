## The model makes the shot. Code makes the deliverable.

Veo, Sora, Runway, Pika — the AI video models are good at one shot. Hand one a prompt, get back a 5-second clip that looks cinematic. That's the right tool when the brief is "make me a hero shot of a car driving through fog." It's the wrong tool when the brief is "make me 100 versions of this product ad with different products, captions, and audio tracks, all in our brand palette, all under 15 seconds, all in 9:16 for TikTok."

The second brief is a code job. The first is a model job. This chapter is about the second one — the layer between "AI generates an asset" and "marketing ships a campaign."

## Why programmatic suddenly matters

Three forces converged in 2026:

1. **AI gen is cheap enough to be a primitive.** A 5-second Veo shot is a few dollars. That means you can call it from a loop instead of treating it as the whole product.
2. **Code-driven video frameworks went mainstream.** HyperFrames (HTML+GSAP→MP4 via headless Chrome) and Remotion (React→MP4 via Chromium or AWS Lambda) gave web developers a way to compose video without learning After Effects.
3. **The output channels demand volume.** TikTok rewards posting 3× a day. Every Shopify store wants product videos. The bottleneck isn't taste anymore — it's throughput.

Programmatic video is the answer to throughput. One template, a data source, and a render loop produces a hundred shippable assets in the time After Effects produces one.

## What this chapter covers

Three lessons. Each one zooms in on a different layer of the new design pipeline:

1. **Why programmatic** — when AI gen alone wins, when code wins, when you need both. Three jobs only code does well: parametric variation, data-driven rendering, reproducibility under review.
2. **HyperFrames and Remotion** — the two tools that own this space. HyperFrames is HTML+CSS+GSAP through `npx hyperframes render`. Remotion is React components through `@remotion/renderer` or `@remotion/lambda`. Pick by familiarity, not features.
3. **The AI-native design pipeline** — concept → reference-gen → composition → audio → captions → render → ship. Where AI fits at each step, what each agent is good at, and the `website-to-hyperframes` pattern as a worked example.

## What AI specifically gets wrong

- **Treating one-shot AI gen as the whole pipeline.** You ask for a 30-second product launch video; the model gives you a 30-second hero shot with no copy, no captions, no CTA, no brand colors. The model's not wrong — it's just answering a different question.
- **Hand-rolling video composition.** "I'll just script FFmpeg directly." Possible, but every multi-scene timeline, transition, and synced caption you build is reinventing what HyperFrames or Remotion already ship.
- **Picking the wrong tool for the team.** A React shop reaching for HyperFrames will fight the framework. A design shop reaching for Remotion will hate writing components. The two tools optimize for different mental models; pick the one your team already lives in.
- **Skipping the data layer.** Programmatic video without a data source is just a slower way to make one video. The win is the spreadsheet (or DB, or JSON file) that drives 100 renders from one template.

## What you'll be able to do at the end

- Look at a video brief and decide: AI-gen-only, code-driven, or hybrid.
- Pick between HyperFrames and Remotion using team-fit, not feature checklists.
- Sketch the seven-step pipeline from concept to shipped MP4 — and name which AI model handles which step.
- Score a team's pipeline coverage to find the gap (audio? captions? review loop?) that's blocking their throughput.

After this chapter, "we should make more video" stops being a budget problem and becomes a pipeline problem — which is the kind of problem code is good at.
