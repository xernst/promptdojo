// Hero bug snippet — the screenshot-anchor for the home page.
//
// Per audit-v5/ux.md: rewritten for the actual audience (PMs, marketers,
// ops folks) who don't know Python. The mutable-default-arg version was
// correct but unreadable to non-devs — they couldn't share what they
// couldn't articulate. This version uses `or` truthiness, which reads
// like English to them ("pro or enterprise") but quietly fails the way
// AI bugs always do.

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
            <span className="text-ink-500"># filter to our paying users</span>
            {"\n"}
            users = api.list_users(
            {"\n  "}
            plan=
            <span
              style={{ color: "var(--err)", background: "rgba(239,68,68,0.14)" }}
            >
              <span className="text-green-300">&quot;pro&quot;</span>{" "}
              <span className="text-green-500">or</span>{" "}
              <span className="text-green-300">&quot;enterprise&quot;</span>
            </span>
            ,{"\n"}){"\n\n"}
            <span className="text-ink-500"># expected: pro + enterprise users</span>
            {"\n"}
            <span className="text-ink-500"># shipped:  only pro users</span>
          </code>
        </pre>
      </div>
      {/* row 3 — annotation strip, always visible */}
      <div className="border-t border-ink-800 px-4 py-3 font-mono text-xs text-ink-400">
        <strong className="font-mono uppercase tracking-wider text-err">
          truthiness bug
        </strong>
        {" "}— python reads{" "}
        <code className="text-ink-300">&quot;pro&quot; or &quot;enterprise&quot;</code>{" "}
        and returns{" "}
        <code className="text-ink-300">&quot;pro&quot;</code>. enterprise
        customers vanish from the report.
      </div>
    </div>
  );
}
