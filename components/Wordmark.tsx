// components/Wordmark.tsx — the brand mark, in code.
//
// Inline SVG (no file load) so the ensō ships everywhere the wordmark
// goes — header pills, hero, lesson breadcrumb, footer. Cloudflare static
// export friendly.
//
// Colors:
//   - Arc: hard-coded green #2aa06a (the brand signature)
//   - Glyph (chevron + bar): currentColor — inherits wrapper text color,
//     so the lockup adapts to dark and light surfaces automatically.
//
// Two modes:
//   - "lockup" (default): [mark] promptdojo _   — site headers, hero, sidebar
//   - "mark":             [mark]                 — favicon-scale solo usage

import { cn } from "@/lib/utils";

type Props = {
  variant?: "lockup" | "mark";
  className?: string;
  /** Tailwind text-size class. Defaults to text-base. */
  size?: string;
};

function MarkSvg({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={cn("inline-block", className)}
    >
      <path
        d="M 200 78 A 90 90 0 1 1 156 56"
        fill="none"
        stroke="#2aa06a"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M 102 100 L 138 128 L 102 156"
        fill="none"
        stroke="currentColor"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="100" y="170" width="56" height="14" rx="3" fill="currentColor" />
    </svg>
  );
}

export default function Wordmark({
  variant = "lockup",
  className,
  size = "text-base",
}: Props) {
  if (variant === "mark") {
    return (
      <span
        className={cn("inline-flex items-center text-ink-100", size, className)}
        aria-label="promptdojo"
      >
        <MarkSvg className="h-[1.4em] w-[1.4em]" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.4ch] font-mono font-extrabold tracking-[-0.015em] text-ink-100",
        size,
        className,
      )}
      aria-label="promptdojo"
    >
      <MarkSvg className="h-[1.4em] w-[1.4em] shrink-0" />
      <span>promptdojo</span>
      <span className="cursor-blink text-green-500">_</span>
    </span>
  );
}
