// $0 forever band — the price billboard. Sits between StatStrip and
// the chapter rail. Viewport-tall, mono $0, eyebrow+token strip.
//
// Per design-kit/audit-v3/HEADOFIT-plan.md PR 7.

export default function PriceBand() {
  return (
    <section className="my-24 flex min-h-[60vh] flex-col items-center justify-center border-y border-ink-800 py-24 text-center">
      <div className="t-eyebrow tracking-[0.6em]">forever.</div>
      <div
        className="mt-6 font-mono font-black leading-none text-ink-100"
        style={{ fontSize: "clamp(72px, 22vw, 360px)" }}
      >
        $0
      </div>
      {/* "no login" was here previously — pulled when magic-link save
          landed (Pass 5). "no streaks" was here too but contradicted the
          visible streak widget on the same scroll. "no guilt" is honest
          (we DO show streaks, but we don't punish skips — frozen flames
          forgive a missed day). Per audit-v5/ux.md trust-dip fix. */}
      <div className="t-mono-meta mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <span>no signup</span>
        <span className="text-ink-700">·</span>
        <span>no guilt</span>
        <span className="text-ink-700">·</span>
        <span>no upsell</span>
        <span className="text-ink-700">·</span>
        <span className="text-green-500">open source</span>
      </div>
    </section>
  );
}
