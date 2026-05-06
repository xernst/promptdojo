// $0 forever band — the price billboard. Sits between StatStrip and
// the chapter rail. Viewport-tall, mono $0, eyebrow+token strip.
//
// Per design-kit/audit-v3/HEADOFIT-plan.md PR 7.

export default function PriceBand() {
  return (
    <section className="my-24 flex min-h-[60vh] flex-col items-center justify-center border-y border-ink-800 py-24 text-center">
      <div className="t-eyebrow tracking-[0.6em]">forever</div>
      <div
        className="mt-6 font-mono font-black leading-none text-ink-100"
        style={{ fontSize: "clamp(72px, 22vw, 360px)" }}
      >
        $0
      </div>
      <div className="t-mono-meta mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <span>no login</span>
        <span className="text-ink-700">·</span>
        <span>no streaks</span>
        <span className="text-ink-700">·</span>
        <span>no upsell</span>
        <span className="text-ink-700">·</span>
        <span className="text-green-500">open source</span>
      </div>
    </section>
  );
}
