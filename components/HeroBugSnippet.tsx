// Hero bug snippet — the screenshot-anchor for the home page.
//
// Two-row chrome (cursor.py · ai-generated), code body with the
// mutable-default-arg bug highlighted, footer summary. On desktop
// the red annotation arrow renders to the right of the bug line.
//
// The mutable-default-arg bug: a one-screen demonstration of why the AI
// codes you ship need a reader.
//
// Per design-kit/audit-v3/HEADOFIT-plan.md PR 7.

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
            <span className="text-green-500">def</span>{" "}
            <span className="text-green-300">collect_errors</span>(
            {"\n  "}
            msg: <span className="text-green-500">str</span>,
            {"\n  "}
            bag: <span className="text-green-500">list</span> ={" "}
            <span style={{ color: "var(--err)", background: "rgba(239,68,68,0.14)" }}>
              []
            </span>
            {"\n"}):{"\n  "}
            bag.append(msg){"\n  "}
            <span className="text-green-500">return</span> bag
          </code>
        </pre>
      </div>
      {/* row 3 — annotation strip, always visible */}
      <div className="border-t border-ink-800 px-4 py-3 font-mono text-xs text-ink-400">
        <strong className="font-mono uppercase tracking-wider text-err">
          mutable default arg
        </strong>
        {" "}— python evaluates the list once at definition. every caller
        mutates the same list.
      </div>
    </div>
  );
}
