// components/Wordmark.tsx — the brand mark, in code.
//
// Inline JSX, no SVG file load — keeps Cloudflare static export simple.
// Uses JetBrains Mono ExtraBold per LOGO.md:18. The blinking underscore is
// the brand heartbeat (MOTION.md §The heartbeat).
//
// Two modes:
//   - "lockup" (default): ❯ promptdojo _   — site headers, onboarding, sidebar
//   - "mark":             ❯                — favicon-scale solo usage

import { cn } from "@/lib/utils";

type Props = {
  variant?: "lockup" | "mark";
  className?: string;
  /** Tailwind text-size class. Defaults to text-base. */
  size?: string;
};

export default function Wordmark({
  variant = "lockup",
  className,
  size = "text-base",
}: Props) {
  if (variant === "mark") {
    return (
      <span
        className={cn("font-mono font-extrabold text-ember-500", size, className)}
        aria-label="promptdojo"
      >
        ❯
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[0.4ch] font-mono font-extrabold tracking-[-0.015em]",
        size,
        className,
      )}
      aria-label="promptdojo"
    >
      <span className="text-ember-500">❯</span>
      <span className="text-ink-100">promptdojo</span>
      <span className="cursor-blink text-ember-500">_</span>
    </span>
  );
}
