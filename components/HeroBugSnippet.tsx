// Hero bug snippet — the screenshot-anchor for the home page.
//
// The hero needs a bug AI actually ships, with a consequence the
// audience (PMs, marketers, ops folks) recognizes from real life.
//
// Design constraints:
//   1. Readable to a non-dev (a for-loop with an if is the floor)
//   2. AI plausibly writes this — not a Python gotcha disguised as one
//   3. Business consequence is visceral (spam complaints, lost money,
//      angry customer, broken report — not "AttributeError")
//   4. The fix is obvious once you see it (one missing line)
//
// This bug — "the missing check" — is the #1 thing AI gets wrong.
// AI does exactly what you asked. It doesn't ask "should we?". You
// catch this in your unsubscribe complaints, not your tests.

export default function HeroBugSnippet() {
  return (
    <div className="overflow-hidden border border-ink-800 bg-ink-900">
      {/* row 1 — chrome label, mirrors the wedge OG card */}
      <div className="flex items-center justify-between border-b border-ink-800 px-4 py-2">
        <div className="font-mono text-[11px] text-ink-500">cursor.py</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          ai-generated
        </div>
      </div>
      {/* row 2 — code body */}
      <div className="relative">
        <pre
          className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-ink-300"
          aria-label="ai-shipped python bug"
          style={{ fontVariantLigatures: "none" }}
        >
          <code>
            <span className="text-ink-500"># email new signups about the launch</span>
            {"\n"}
            <span className="text-green-500">for</span> user{" "}
            <span className="text-green-500">in</span> users:
            {"\n  "}
            <span className="text-green-500">if</span> user.created_at{" "}
            &gt; last_monday:
            {"\n    "}
            send_email(user.email,{" "}
            <span className="text-green-300">&quot;we just launched!&quot;</span>
            ){"\n\n"}
            <span className="text-ink-500"># expected: welcome emails to new signups</span>
            {"\n"}
            <span
              style={{ color: "var(--err)", background: "rgba(239,68,68,0.14)" }}
            >
              <span className="text-ink-500"># shipped:  also emailed 14 users who unsubscribed last week</span>
            </span>
          </code>
        </pre>
      </div>
      {/* row 3 — annotation strip, always visible */}
      <div className="border-t border-ink-800 px-4 py-3 font-mono text-xs text-ink-400">
        <strong className="font-mono uppercase tracking-wider text-err">
          the missing check
        </strong>
        {" "}— ai does exactly what you asked. it doesn&apos;t ask{" "}
        <em className="not-italic text-ink-300">should we?</em>. you find
        this bug in your unsubscribe complaints, not your tests.
      </div>
    </div>
  );
}
