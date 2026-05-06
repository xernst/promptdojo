# V4 Implementation Plan — Curriculum + Nav + Improvements

**Author:** Head of IT
**Date:** 2026-05-06
**Audience:** the dev who picks this up Wednesday evening
**Contract:** `design-kit/audit-v4/CEO-vision.md` (11 picks, ~25h hard / ~34h with fill-blank). Don't add. Don't substitute.
**Stack:** Next.js 16 App Router, `output: "export"`, React 19, Tailwind 4, CodeMirror 6, Pyodide 0.28.3, Cloudflare Pages free tier.
**Frozen contracts:** localStorage keys `promptdojo:progress:v2` + `promptdojo:save-email`; Pages Functions at `/api/save` + `/api/load`; no new deps allowed except `@codemirror/view` extensions (already a transitive dep via `@uiw/react-codemirror`).

---

## Executive summary

11 PRs, 24h cumulative through PR 10 (under the 25h ceiling), +10h for the fill-blank PR if the founder accepts the spill — total 34h across 5–7 evenings. Bug fixes ship first (PRs 1–3, 5.5h, evening 1) so the live site stops contradicting itself. Voice + about overhaul ships second (PRs 4–6, 7.5h, evening 2) — pure character-edit work. Structural picks third (PRs 7–8, 8h, evenings 3–4): nav pill before curriculum accordion so the new accordion never lives under old chrome. Janitorial fourth (PRs 9–10, 3h, evening 5). Fill-blank widgets last (PR 11, 10h, evenings 6–7) because if anything spills the fill widget truncates first per CEO §11. **Hero stays exactly as-is** — every PR steers around `app/page.tsx:95-131`.

**Key risks:**
1. PR 7 (floating nav pill) and PR 2 (mobile drawer) both rebuild `<SiteHeader>`. PR 2 ships the drawer first; PR 7 reuses it. Land in order.
2. PR 11 (fill-blank widgets) requires moving `___` markers from `prompt` to `code` across 44 lessons. The codepath in `FillBlankStepView.tsx:194-232` (`splitOnBlanks`) currently parses `prompt` for `___` — leaving that path alive as legacy fallback is mandatory because some lessons have prose-only blanks.
3. PR 1 reads `lib/generated/v2/manifest.toc.json` at build-time — `StatStrip` already does this, so the fix is removing two hardcoded `398`s, not adding new data flow.

**Ships first:** PR 1 (the leak). It's a 1h credibility-floor fix; everything else can wait.

---

## Pre-flight

- **Main:** `git checkout main && git pull && pnpm install && pnpm build` must be green. Last shipped commit is `88481a2 refresh-v3/06-breadcrumb-and-tablet`. There are unstaged changes in `content/python/16-agent-loops/`, `21-evals/`, `25-capstone/` and untracked `audit-v4/` — these are the founder's content drafts and the audit itself. Stash the content drafts before starting; they ride on top of V4 PRs at the end. The audit folder is fine to leave untracked — it's reference material, not shipped code.
- **Branch convention:** `refresh-v4/01-fix-398-leak`, `refresh-v4/02-modal-scrim-and-mobile-drawer`, …, `refresh-v4/11-fill-blank-widgets`. One PR per branch. Squash-merge.
- **Verification per PR:** `pnpm build` clean, hand-test the touched flow at `localhost:3000`, push to a Cloudflare preview, smoke-test prod after merge. Per-PR test checklist below.
- **Rollback plan:** every PR is a single squash-merged commit on `main`; if a deploy ships broken, revert + push and Cloudflare Pages auto-redeploys the previous green build (~5 min).

---

## Build order

---

### PR 1: refresh-v4/01-fix-398-leak

**Branch:** `refresh-v4/01-fix-398-leak`
**Outcome:** every surface that mentions step count reads from the manifest. `StatStrip` shows `624 steps`, `/curriculum` H1 reads `624 steps`, `/not-found` footer agrees with body.
**Estimated time:** 1h
**Cumulative:** 1h
**Depends on:** none
**Unblocks:** PR 4 (voice swaps touch the same surfaces — 398 fix lands first so voice PR doesn't accidentally regress the count).

**Files to modify:**
- `app/curriculum/page.tsx:65-74` — H1 currently hardcodes `25 chapters · 398 steps · ~6 hours`; switch to manifest sums.
- `app/not-found.tsx:21,41` — body line and StatStrip both currently render the leak.
- `components/StatStrip.tsx:16-19` — already reads from manifest TOC, no change needed (verify by inspection).

**The bug, mechanical:** Audit `00-promptdojo-current-state.md` lines 70-87 confirms three surfaces still leak `398`: home StatStrip pill, `/curriculum` H1, `/not-found` mono footer. Reading `components/StatStrip.tsx:16-19`:

```tsx
const steps = toc.chapters.reduce(
  (a: number, c: { stepCount: number }) => a + c.stepCount,
  0,
);
```

`StatStrip` is correct — it sums from `lib/generated/v2/manifest.toc.json`. So the leak is **NOT in StatStrip** as the audit suggests; the audit was looking at a stale screenshot. The actual leaks are in `/curriculum` H1 (hardcoded `398` in CEO summary) and possibly a stale snapshot of `/not-found`. Verify on dev first.

**Changes:**

1. **`app/curriculum/page.tsx:65-74`** — the H1 derives `totalSteps` from `chapters.reduce` but `app/curriculum/page.tsx:73` writes `{totalSteps} steps` correctly. **The bug here is `totalHours` precision: `(totalMinutes / 60).toFixed(0)` rounds `~6.4h` to `6` while the audit reports `~6 hours` — the fix is to align with `StatStrip`'s `8–15h` range copy.** Replace:

   ```tsx
   // BEFORE (lines 70-74)
   <main id="main" className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
     <div className="t-eyebrow">the whole course</div>
     <h1 className="t-section mt-3">
       {chapters.length} chapters · {totalSteps} steps · ~{totalHours} hours
     </h1>
     <StatStrip className="mt-6" />
   ```

   ```tsx
   // AFTER
   <main id="main" className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
     <div className="t-eyebrow">the whole course</div>
     <h1 className="t-section mt-3">
       {chapters.length} chapters · {totalSteps} runnable steps · 8–15h
     </h1>
     <StatStrip className="mt-6" />
   ```

   Drop the `(totalHours / 60).toFixed(0)` calc at `:66-67` — it's now unused. Voice canon: `runnable` per CEO pick #4 (which we ship next, but landing it here costs nothing and prevents a regression-during-fix).

2. **Verify `/not-found`** — load `localhost:3000/notarealpage` after the change. The body at `app/not-found.tsx:21` reads `the curriculum has 25 chapters and 624 steps, but not this one.` (already correct). `<StatStrip />` at `:41` derives from the manifest. Both should display `624`. **If the screenshot capture was stale and 398 already isn't on this page, this PR is just the curriculum edit.** Document the verification result in the PR body.

3. **Verify home `/`** — `app/page.tsx:108-111` hero subheadline body reads `25 chapters · 624 interactive steps · runs in your browser · free forever.`. The literal `624` is hardcoded here; **leave it alone** because PR 4 swaps `interactive` to `runnable` on the same line. Don't touch `app/page.tsx` in this PR — that's PR 4's territory.

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] `localhost:3000/curriculum` H1 reads `25 chapters · 624 runnable steps · 8–15h`
- [ ] `localhost:3000/notarealpage` body line says `624 steps`; StatStrip below the cards says `624 steps`
- [ ] `localhost:3000` home StatStrip shows `624 steps` (verify the live site mismatch was screenshot-stale, not code-stale)

**Verification (post-deploy):**
- [ ] DOM probe: `document.querySelectorAll('main').textContent.includes("398")` returns false on `/`, `/curriculum`, `/not-found`

**Risks:** if the home StatStrip live site really shows `398`, the manifest may have been built against a stale `lessonCount`. Re-run `node scripts/build-content-v2.mjs` and verify `lib/generated/v2/manifest.toc.json` chapters sum to 624.

---

### PR 2: refresh-v4/02-modal-scrim-and-mobile-drawer

**Branch:** `refresh-v4/02-modal-scrim-and-mobile-drawer`
**Outcome:** (a) login modal opens with a `bg-ink-950/70 backdrop-blur-sm` scrim behind the card; clicking the scrim closes the modal. (b) at `<md:` (`<768px`), header collapses to `[wordmark · ContinuePill · ≡]`; the hamburger opens a full-screen drawer with the rest of the nav.
**Estimated time:** 3h
**Cumulative:** 4h
**Depends on:** PR 1 (so 398 strings don't appear in the new drawer)
**Unblocks:** PR 7 (floating nav pill — reuses the `<HeaderDrawer>` shipped here)

**Files to modify:**
- `components/LoginToSave.tsx:217-224` — verify scrim is correct or fix.
- `components/SiteHeader.tsx:26-48` — collapse mobile rendering to `[wordmark · ContinuePill · ≡]`; mount drawer; preserve desktop layout above `md:`.

**Files to create:**
- `components/SiteHeader/Drawer.tsx` — new full-screen mobile drawer (≤120 LOC).

**Changes:**

1. **Modal scrim** — read `components/LoginToSave.tsx:217-224`:

   ```tsx
   <div
     role="dialog"
     aria-modal="true"
     aria-labelledby="lts-title"
     aria-describedby="lts-desc"
     className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/80 px-4 pt-24 pb-12 backdrop-blur-sm"
     onClick={closeModal}
   >
   ```

   **The scrim is already there** (`bg-ink-950/80 backdrop-blur-sm`). The audit `00-promptdojo-current-state.md` Reg R2 lines 89-96 caught this on a screenshot but did NOT verify the DOM. **First-do:** open dev, click `[ login to save ]`, inspect the modal's outer `<div>`. If the scrim renders correctly (semi-transparent dark behind the card), this part of PR 2 is a 5-min verification with no code change. If the scrim is broken (likely a transparency-stacking bug with the parent `<header>` z-index), bump to `bg-ink-950/85` and add an explicit `position: fixed` rule.

   **Conservative change:** tighten to `bg-ink-950/70 backdrop-blur-sm` per CEO §2 spec exactly, even if `/80` works:

   ```tsx
   // BEFORE (line 223)
   className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/80 px-4 pt-24 pb-12 backdrop-blur-sm"

   // AFTER
   className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/70 px-4 pt-24 pb-12 backdrop-blur-sm"
   ```

2. **Mobile drawer — new `components/SiteHeader/Drawer.tsx`:**

   ```tsx
   "use client";

   import Link from "next/link";
   import { useEffect, useRef } from "react";
   import FollowOnXPill from "@/components/FollowOnXPill";
   import LoginToSave from "@/components/LoginToSave";
   import GitHubStatsPill from "@/components/GitHubStatsPill";

   type Props = {
     open: boolean;
     onClose: () => void;
   };

   export default function HeaderDrawer({ open, onClose }: Props) {
     const panelRef = useRef<HTMLDivElement>(null);

     // Escape closes; basic focus return.
     useEffect(() => {
       if (!open) return;
       function onKeyDown(e: KeyboardEvent) {
         if (e.key === "Escape") {
           e.preventDefault();
           onClose();
         }
       }
       window.addEventListener("keydown", onKeyDown);
       return () => window.removeEventListener("keydown", onKeyDown);
     }, [open, onClose]);

     if (!open) return null;

     return (
       <div
         role="dialog"
         aria-modal="true"
         aria-label="site navigation"
         className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-sm md:hidden"
         onClick={onClose}
       >
         <div
           ref={panelRef}
           className="ml-auto flex h-full w-full max-w-xs flex-col gap-6 border-l border-ink-800 bg-ink-950 p-6"
           onClick={(e) => e.stopPropagation()}
         >
           <div className="flex items-baseline justify-between">
             <span className="t-eyebrow">menu</span>
             <button
               type="button"
               onClick={onClose}
               className="font-mono text-xs text-ink-500 hover:text-ink-300"
               aria-label="close menu"
             >
               [ esc ]
             </button>
           </div>
           <nav className="flex flex-col gap-3 font-mono text-sm uppercase tracking-wider">
             <Link href="/" onClick={onClose} className="text-ink-300 hover:text-green-400">home</Link>
             <Link href="/curriculum" onClick={onClose} className="text-ink-300 hover:text-green-400">the curriculum</Link>
             <Link href="/about" onClick={onClose} className="text-ink-300 hover:text-green-400">about</Link>
             <Link href="/changelog" onClick={onClose} className="text-ink-300 hover:text-green-400">changelog</Link>
           </nav>
           <div className="mt-auto flex flex-col gap-3 border-t border-ink-800 pt-4">
             <GitHubStatsPill />
             <LoginToSave />
             <FollowOnXPill />
           </div>
         </div>
       </div>
     );
   }
   ```

3. **`components/SiteHeader.tsx` rewrite — split mobile / desktop:**

   ```tsx
   // BEFORE (lines 18-49) — current full-bleed sticky bar wrapping
   //                         all 4 pills with flex-wrap (which causes the 4-row
   //                         pile on mobile per audit Reg R3).
   ```

   ```tsx
   // AFTER
   "use client";

   import Link from "next/link";
   import { useState } from "react";
   import { usePathname } from "next/navigation";
   import { Menu } from "lucide-react";

   import FollowOnXPill from "@/components/FollowOnXPill";
   import LoginToSave from "@/components/LoginToSave";
   import GitHubStatsPill from "@/components/GitHubStatsPill";
   import CourseProgress from "@/components/v2/CourseProgress";
   import ContinuePill from "@/components/SiteHeader/ContinuePill";
   import HeaderDrawer from "@/components/SiteHeader/Drawer";

   export default function SiteHeader() {
     const pathname = usePathname();
     const onLesson = pathname?.startsWith("/learn/v2") ?? false;
     const onOnboarding =
       pathname?.startsWith("/onboarding") || pathname?.startsWith("/start");
     const [drawerOpen, setDrawerOpen] = useState(false);

     if (onOnboarding) return null;

     return (
       <>
         <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/95 backdrop-blur-sm">
           <div className="flex items-center justify-between gap-2 px-4 py-2 sm:px-6">
             <Link
               href="/"
               className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 transition hover:text-green-400"
             >
               <span className="text-green-500">❯</span>
               <span>promptdojo</span>
             </Link>
             <ContinuePill />
             {/* Desktop nav (>= md) */}
             <nav
               aria-label="site"
               className="hidden items-center gap-2 md:flex"
             >
               <GitHubStatsPill />
               {onLesson && <CourseProgress />}
               <LoginToSave />
               <FollowOnXPill />
             </nav>
             {/* Mobile hamburger (< md) */}
             <button
               type="button"
               onClick={() => setDrawerOpen(true)}
               className="inline-flex items-center justify-center p-2 text-ink-400 hover:text-green-400 md:hidden"
               aria-label="open menu"
               aria-expanded={drawerOpen}
             >
               <Menu size={20} />
             </button>
           </div>
         </header>
         <HeaderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
       </>
     );
   }
   ```

   The `flex-wrap` is gone — the header is now a single row. ContinuePill stays center. Hamburger replaces the four pills below md.

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] At 1280×720: header looks identical to today (4 pills + ContinuePill + wordmark)
- [ ] At 375×667: header is one row `[❯ promptdojo · CONTINUE pill · ≡]`. Tap `≡` — drawer slides in from right with all nav links + 3 pills.
- [ ] Tap outside drawer — closes. Press Esc — closes.
- [ ] Click `[ login to save ]` on home — modal scrim is semi-transparent dark with backdrop blur; click outside card closes modal.

**Verification (post-deploy):**
- [ ] `agent-browser` at 375×667 on `/` — header renders exactly 3 elements (wordmark, ContinuePill text, hamburger SVG). No 4-row stack.
- [ ] DOM probe: modal scrim background contains `rgba(20, 20, 15`.

**Risks:**
- The `useState` in `SiteHeader.tsx` makes the entire component a client island — already a `"use client"` per V3. No change.
- `ContinuePill` shows up to ~22 chars. On 320px viewports (rare) it might overflow. The CSS `flex justify-between gap-2` will compress; if it still wraps, tighten ContinuePill copy in a follow-up.
- The drawer's `z-50` matches the login modal's `z-50`; if both open simultaneously, drawer wins (rendered after). Acceptable.

---

### PR 3: refresh-v4/03-mobile-editor-gate

**Branch:** `refresh-v4/03-mobile-editor-gate`
**Outcome:** at `<md:`, the broken "Show editor" toggle in `LessonShell` is replaced with an honest gate: a centered card reading `pyodide is ~6mb. ship on desktop.` with a `[ ↵ resume on desktop ]` link to `/lesson/resume`. No more no-op button.
**Estimated time:** 1.5h
**Cumulative:** 5.5h
**Depends on:** none
**Unblocks:** PR 7 (lesson chrome stays as `<FlatHeader>`, opt-out from floating pill)

**Files to modify:**
- `components/v2/LessonShell.tsx:43-114` — drop the `drawerOpen` toggle on `<md:`; render a static gate card instead of the broken second-pane toggle.

**The bug, mechanical:** Read `components/v2/LessonShell.tsx:46-53`:

```tsx
const [drawerOpen, setDrawerOpen] = useState(true);
useEffect(() => {
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    setDrawerOpen(false);
  }
}, []);
```

The effect flips `drawerOpen` to false on mobile so the prompt pane shows by default. The button at `:94-113` toggles between the IDE pane and prompt pane. Per the audit, the IDE pane mounts but its bounding rect stays `0×0` because the parent `min-h-0 min-w-0 flex-col` collapses to zero when its child (CodeMirror) hasn't been given an explicit height in the toggle path. CEO §3 picks option (b): replace the broken toggle with an honest "ship on desktop" gate.

**Changes:**

Replace the mobile-toggle block in `components/v2/LessonShell.tsx`:

```tsx
// BEFORE (lines 43-114, abridged) — drawerOpen toggle pattern
//   useState + useEffect + mobile button at the bottom that flips between
//   prompt pane and IDE pane (the IDE pane stays 0x0 — that's the bug).
```

```tsx
// AFTER
return (
  <div className="flex h-[calc(100dvh-40px)] min-h-0 flex-col bg-ink-950 text-ink-100">
    <div className="flex h-full min-h-0 flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-ink-800 bg-ink-900 md:flex md:flex-col lg:w-60">
        {sidebar}
      </aside>
      {/* Desktop / tablet layout — unchanged */}
      <main
        id="main"
        className="hidden min-h-0 w-full flex-1 md:grid md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]"
      >
        <section className="min-h-0 min-w-0 flex flex-col border-r border-ink-800 md:max-w-[460px] lg:max-w-[520px]">
          {header && (
            <div className="flex items-start justify-between gap-3 border-b border-ink-800 bg-ink-900 px-5 py-3">
              <div className="min-w-0 flex-1">{header}</div>
              <DailyGoalDial compact className="shrink-0 pt-0.5" />
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-auto px-4 py-5 sm:px-5 sm:py-6">
            {prompt}
          </div>
          {footer && (
            <div className="border-t border-ink-800 bg-ink-900 px-4 py-3 sm:px-5">
              {footer}
            </div>
          )}
        </section>
        <section className="min-h-0 min-w-0 flex flex-1 flex-col">{ide}</section>
      </main>
      {/* Mobile gate (< md) — honest "ship on desktop" message */}
      <main
        id="main"
        className="flex min-h-0 w-full flex-1 flex-col md:hidden"
      >
        {/* Show prompt body so a user can still read the lesson on mobile */}
        <div className="flex-1 min-h-0 overflow-auto px-4 py-5">
          {prompt}
        </div>
        <div className="border-t border-ink-800 bg-ink-900 p-5">
          <div className="t-eyebrow mb-2">desktop required</div>
          <p className="t-body-sm">
            the editor runs python in your browser via pyodide
            (~6&thinsp;mb of webassembly). it ships clean on a laptop;
            on a phone it is a battery tax.
          </p>
          <Link
            href="/lesson/resume"
            className="dojo-btn-primary mt-4 inline-flex"
          >
            ↵ resume on desktop <span aria-hidden>→</span>
          </Link>
          <p className="mt-3 t-mono-meta">
            we save your spot. open this same url on a laptop.
          </p>
        </div>
      </main>
    </div>
  </div>
);
```

Drop these imports / hooks:
- `useEffect`, `useState` from `"react"` (no longer needed)
- `ChevronUp`, `ChevronDown` from `"lucide-react"` (toggle is gone)
- `cn` if no longer used in this file (probably still used elsewhere — verify)

Add:
- `import Link from "next/link";` if not already present.

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] 1280×720 lesson view: layout identical to today (sidebar + prompt + IDE).
- [ ] 768×1024 lesson view: same as 1280 (desktop layout starts at md, which is 768).
- [ ] 375×667 lesson view: NO toggle button. Prompt body visible top, "desktop required" card at bottom with `[ ↵ resume on desktop ]` button. Tap — routes to `/lesson/resume`.
- [ ] On mobile, the IDE never mounts (DOM probe: `document.querySelector('.cm-editor')` is null at 375).

**Verification (post-deploy):**
- [ ] `agent-browser` at 375×667 on `/learn/v2/variables/naming-things/0` — find text "desktop required". Click the resume button and verify navigation.

**Risks:**
- Removing the toggle removes the `useState` + `useEffect` — `LessonShell` becomes a near-pure component on `<md:`. The unused `cn` import (if it becomes unused) will TypeScript-warn, not error.
- The audit specifies "ship on desktop — pyodide is ~6MB" — keep the wording lowercase + period per CEO voice canon. The implemented copy reads `the editor runs python in your browser via pyodide (~6 mb of webassembly).` to avoid sounding accusatory.

---

### PR 4: refresh-v4/04-voice-and-system-sweep

**Branch:** `refresh-v4/04-voice-and-system-sweep`
**Outcome:** every "interactive" copy site-wide reads "runnable"; about CTAs say `start chapter 1 →`; PriceBand eyebrow lowercased + period; footer says `shipped`; onboarding says `read what it wrote` and `you ship code`; FAQ has datestamp; `t-emph` utility added and applied to ~9 section headings.
**Estimated time:** 2.5h
**Cumulative:** 8h
**Depends on:** PR 1 (so 624 is the only step number anywhere on the property)
**Unblocks:** PR 5 (FAQ rewrite reuses `t-emph` from this PR)

**Files to modify:**
- `app/globals.css:244` (after `t-mono-meta`) — add `t-emph` utility.
- `app/page.tsx:108-111` — `interactive steps` → `runnable steps` (hero subhead).
- `app/page.tsx:168-170` — section H2 above the rail; rephrase with periods.
- `app/page.tsx:213-220` — footer `last commit` → `shipped`; add github + @TFisPython links.
- `app/about/page.tsx:112` — CTA `start the course →` → `start chapter 1 →`.
- `app/about/page.tsx:124-130` — H2 already uses `<em>` color, swap to `t-emph` class.
- `app/about/page.tsx:148-150` — H2 wraps `interactive` in `t-emph` and swaps to `runnable`.
- `app/about/page.tsx:170` — H2 wraps `read` `run` `fix` in `t-emph`.
- `app/about/page.tsx:191-195` — H2 wraps `write` and `won't` in `t-emph`.
- `app/about/page.tsx:256` — H2 wraps `open source` and `ever` in `t-emph`.
- `app/about/page.tsx:298` — H2 wraps `answers` in `t-emph`. Add datestamp `last revised 2026-05-06` BELOW H2.
- `app/about/page.tsx:315` — H2 wraps `fixing` in `t-emph`.
- `app/about/page.tsx:322` — CTA `start the course →` → `start chapter 1 →`.
- `app/onboarding/page.tsx:194-200` — Welcome screen body: `read it` → `read what it wrote`; `you write code` → `you ship code`.
- `components/PriceBand.tsx:9` — eyebrow `forever` → `forever.` (add the period). The CSS forces lowercase already.
- All OG metadata strings — search for `interactive steps` and replace with `runnable steps` in `app/page.tsx`, `app/curriculum/page.tsx`, `app/about/page.tsx`, `app/not-found.tsx`, `app/layout.tsx`.

**Files to create:** none.

**Changes:**

1. **`app/globals.css` — add `t-emph` after `t-mono-meta` (after line 244):**

   ```css
   /* Pattern #7 from 02-ui-design-cartesian-lift.md — colored-display-word
      emphasis at heading scale. One ember word per section heading. */
   .t-emph {
     color: var(--color-green-500);
     font-style: italic;
     font-variation-settings: "opsz" 144;
   }
   ```

2. **`app/page.tsx:108-111` — hero subhead:**

   ```tsx
   // BEFORE
   <p className="t-body mt-12 max-w-2xl">
     a python school for the version of you that lives in cursor.
     25 chapters · 624 interactive steps · runs in your browser · free forever.
   </p>
   ```

   ```tsx
   // AFTER
   <p className="t-body mt-12 max-w-2xl">
     a python school for the version of you that lives in cursor.
     25 chapters · 624 runnable steps · runs in your browser · free forever.
   </p>
   ```

3. **`app/page.tsx:168-170` — section H2 above the rail:**

   ```tsx
   // BEFORE
   <h2 className="t-eyebrow mb-12">
     25 chapters · 624 steps · free forever
   </h2>
   ```

   ```tsx
   // AFTER (sentence rhythm, periods)
   <h2 className="t-eyebrow mb-12">
     25 chapters. 624 runnable steps. free forever.
   </h2>
   ```

4. **`app/page.tsx:213-220` — footer:**

   ```tsx
   // BEFORE
   <div className="t-mono-meta">
     {(() => {
       const lc = formatDateShort(githubStats.lastCommitISO);
       return lc ? <>last commit {lc} · </> : null;
     })()}
     <Link href="/changelog" className="hover:text-green-400">changelog</Link>
   </div>
   ```

   ```tsx
   // AFTER
   <div className="t-mono-meta flex flex-wrap items-baseline gap-x-2">
     {(() => {
       const lc = formatDateShort(githubStats.lastCommitISO);
       return lc ? <span>shipped {lc}</span> : null;
     })()}
     <span className="text-ink-700">·</span>
     <Link href="/changelog" className="hover:text-green-400">changelog</Link>
     <span className="text-ink-700">·</span>
     <a
       href="https://github.com/xernst/promptdojo"
       target="_blank"
       rel="noopener noreferrer"
       className="hover:text-green-400"
     >
       github
     </a>
     <span className="text-ink-700">·</span>
     <a
       href="https://x.com/TFisPython"
       target="_blank"
       rel="noopener noreferrer"
       className="hover:text-green-400"
     >
       @TFisPython
     </a>
   </div>
   ```

5. **`app/about/page.tsx:148-150` — example of `t-emph` application:**

   ```tsx
   // BEFORE
   <h2 className="t-section">
     25 chapters. 624 interactive steps. zero install.
   </h2>
   ```

   ```tsx
   // AFTER
   <h2 className="t-section">
     25 chapters. 624 <em className="t-emph">runnable</em> steps. zero install.
   </h2>
   ```

   Repeat for the 5 other H2s on `/about` per CEO §4. List of section headings to swap (file:line + word(s) to wrap):
   - `:170` — wrap `read`, `run`, `fix` (3 individual `t-emph` spans).
   - `:191-195` — wrap `write` and `won't`.
   - `:256` — wrap `open source` and `ever`.
   - `:298` — wrap `answers`. Add datestamp paragraph below: `<p className="t-mono-meta mt-3">last revised 2026-05-06</p>`.
   - `:315` — wrap `fixing`.

6. **`components/PriceBand.tsx:9`:**

   ```tsx
   // BEFORE
   <div className="t-eyebrow tracking-[0.6em]">forever</div>
   ```

   ```tsx
   // AFTER
   <div className="t-eyebrow tracking-[0.6em]">forever.</div>
   ```

7. **`app/onboarding/page.tsx:195-199`:**

   ```tsx
   // BEFORE
   <p className="mt-4 max-w-xl text-lg text-ink-300">
     ai is your co-pilot, not your crutch. you&apos;ll learn the shapes you
     need to direct it, read it, and catch when it&apos;s wrong.
   </p>
   <p className="mt-2 max-w-xl text-sm text-ink-500">
     five questions. under a minute. then you write code.
   </p>
   ```

   ```tsx
   // AFTER
   <p className="mt-4 max-w-xl text-lg text-ink-300">
     ai is your co-pilot, not your crutch. you&apos;ll learn the shapes you
     need to direct it, read what it wrote, and catch when it&apos;s wrong.
   </p>
   <p className="mt-2 max-w-xl text-sm text-ink-500">
     five questions. under a minute. then you ship code.
   </p>
   ```

   **NOTE:** PR 9 will rename `/onboarding` to `/start` and trim 5 questions to 3. This PR's edit lands here so the copy is right when the rename happens. The `five questions.` line will become `three questions.` in PR 9. Don't try to do both at once.

8. **OG metadata sweep** — find/replace `interactive steps` → `runnable steps` across:
   - `app/page.tsx:19` (description in metadata)
   - `app/page.tsx:25` (openGraph.description)
   - `app/about/page.tsx:11`
   - `app/curriculum/page.tsx:17`
   - `app/not-found.tsx:13`
   - `app/layout.tsx:15-16`

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] `grep -rn "interactive steps" app/ components/` returns 0 results
- [ ] Home hero subhead reads `624 runnable steps`
- [ ] About — every section H2 has at least one `t-emph` (italic green word)
- [ ] FAQ datestamp `last revised 2026-05-06` visible under "quick answers."
- [ ] PriceBand eyebrow shows `forever.` (with period)
- [ ] Footer reads `shipped 2026-05-06 · changelog · github · @TFisPython`

**Verification (post-deploy):**
- [ ] DOM probe: `document.body.innerText.includes("interactive steps")` returns false on every page
- [ ] DOM probe: at least 6 `.t-emph` elements on `/about`

**Risks:** the `t-emph` italic + opsz 144 setting may render at slightly different baselines than surrounding non-italic Fraunces text. If kerning looks off on `/about`, the optical-size axis is the suspect — try `opsz` 96 instead.

---

### PR 5: refresh-v4/05-about-page-faq-founder-litany

**Branch:** `refresh-v4/05-about-page-faq-founder-litany`
**Outcome:** about FAQ becomes hairline `<details>` accordion ordered by buyer doubt (`is it really free?` first); founder paragraph rewritten to 3 sentences ending @TFisPython; "free forever" prose replaced with 8-line vertical anti-feature litany + `+ pull requests welcome.` closer.
**Estimated time:** 3h
**Cumulative:** 11h
**Depends on:** PR 4 (uses `t-emph`)
**Unblocks:** PR 6 (page-rhythm cleanup follows the new shape)

**Files to modify:**
- `app/about/page.tsx:62-90` — reorder FAQ array; rebuild `<dl>` as `<details>` accordion.
- `app/about/page.tsx:225-250` — replace founder paragraph + intro `TODO(josh)`.
- `app/about/page.tsx:253-274` — replace `$0. open source. no upsell. ever.` prose section with 8-line vertical litany.

**Changes:**

1. **FAQ reorder + accordion (lines 62-90 array, plus the `<dl>` block at 296-311):**

   ```tsx
   // BEFORE (line 62-90 array, ordered by author intuition)
   const faqs = [
     { q: "do i need python experience?", a: "no. chapter 01..." },
     { q: "is it really free?", a: "yes. no paid tier..." },
     { q: "do i have to log in?", a: "no. progress saves..." },
     { q: "how long does it take?", a: "624 steps..." },
     { q: "what if i find a bug?", a: "open an issue..." },
     { q: "why isn't it on udemy / coursera / boot.dev?", a: "because i wanted..." },
     { q: "how often is it updated?", a: "commits land most weeks..." },
   ];
   ```

   ```tsx
   // AFTER — buyer-doubt priority per CEO §5 + 04-brand-voice-cartesian.md §6
   const faqs = [
     { q: "is it really free?", a: "yes. no paid tier, no premium content. the only money this site costs me is the domain." },
     { q: "why isn't it on udemy / coursera / boot.dev?", a: "because i wanted it to look how i wanted, run in the browser, and never gate-keep behind a streak." },
     { q: "do i need python experience?", a: "no. chapter 01 starts at variables. if you've used cursor or claude to write code, you know enough to begin." },
     { q: "do i have to log in?", a: "no. progress saves to your browser. login only syncs across devices — same email anywhere else, same dojo. no list, no upsell." },
     { q: "how long does it take?", a: "624 steps. most steps are 30 seconds. realistically: 8–15 hours total spread over a few weeks." },
     { q: "how often is it updated?", a: "commits land most weeks. content gets revised when models change shape — the agent-loop chapter looks different in 2026 than it did in 2025. follow the build at @TFisPython." },
     { q: "what if i find a bug?", a: "open an issue or a pr at github.com/xernst/promptdojo. or dm me on x." },
   ];
   ```

   ```tsx
   // BEFORE (lines 296-311 — flat <dl>)
   <dl className="mt-8 space-y-6">
     {faqs.map((f) => (
       <div key={f.q} className="border-l-2 border-ink-800 pl-5">
         <dt className="font-display text-lg font-bold text-ink-100">{f.q}</dt>
         <dd className="mt-2 font-display leading-snug text-ink-300">{f.a}</dd>
       </div>
     ))}
   </dl>
   ```

   ```tsx
   // AFTER — hairline accordion (Pattern #2 from 02-ui-design)
   <p className="t-mono-meta mt-3">last revised 2026-05-06</p>
   <dl className="mt-8 divide-y divide-ink-800 border-y border-ink-800">
     {faqs.map((f) => (
       <details key={f.q} className="group py-5">
         <summary className="flex cursor-pointer list-none items-baseline gap-3">
           <span className="font-mono text-green-500 transition group-open:rotate-90">❯</span>
           <dt className="t-h3 font-display">{f.q}</dt>
         </summary>
         <dd className="mt-3 pl-6 t-body-sm">{f.a}</dd>
       </details>
     ))}
   </dl>
   ```

   **Note:** `<details>/<summary>` containing `<dt>/<dd>` inside a `<dl>` is technically non-standard HTML (children of `<dl>` are normally `<dt>` then `<dd>`). The lint will pass because the `<dt>` lives inside `<summary>`. If strict validators complain, refactor to plain `<div>` containers and drop the `<dl>` entirely. The semantics are the same.

2. **Founder paragraph (lines 225-250):**

   ```tsx
   // BEFORE
   <section className="border-b border-ink-800 py-16">
     <div className="t-eyebrow mb-3">who built it</div>
     <div className="font-display text-lg leading-relaxed text-ink-300">
       {/* TODO(josh): replace credential sentence with your final shape ... */}
       <p>
         i&apos;m josh. i ship python alongside cursor and claude every day for client work.
         i wrote this because i wanted to learn python the way i actually use python — alongside
         an llm, fixing what it got wrong, not memorizing what it already knows. every other
         course felt like a museum tour. this one is the workshop floor.
       </p>
       <p className="mt-4">
         built solo. open source. free forever. follow the build at <a href="https://x.com/TFisPython" ...>@TFisPython</a>.
       </p>
     </div>
   </section>
   ```

   ```tsx
   // AFTER (from 04-brand-voice-cartesian.md §8, tightened per CEO §5)
   <section className="border-b border-ink-800 py-16">
     <div className="t-eyebrow mb-3">who built it</div>
     <div className="font-display text-lg leading-relaxed text-ink-300">
       <p>
         i&apos;m josh. ai consultant. i ship python with cursor and claude every
         day for client work. i wrote this because every other course felt like a
         museum tour and i wanted the workshop floor.
       </p>
       <p className="mt-4">
         i ship to this site weekly. follow the build at{" "}
         <a
           href="https://x.com/TFisPython"
           target="_blank"
           rel="noopener noreferrer"
           className="text-green-400 underline underline-offset-2 hover:text-green-300"
         >
           @TFisPython
         </a>
         .
       </p>
     </div>
   </section>
   ```

3. **"Free forever" section (lines 253-274) — 8-line vertical litany:**

   ```tsx
   // AFTER (Pattern #4 from 02-ui-design-cartesian-lift.md, voice from 04-brand-voice-cartesian.md §1)
   <section className="border-b border-ink-800 py-16">
     <div className="t-eyebrow mb-3">free forever</div>
     <h2 className="t-section">
       $0. <em className="t-emph">open source</em>. no upsell. <em className="t-emph">ever</em>.
     </h2>

     <ul className="mt-10 flex flex-col items-start gap-3 font-display text-2xl leading-tight text-ink-300 sm:text-3xl">
       <li>no paid tier.</li>
       <li>no premium chapters.</li>
       <li>no certificate store.</li>
       <li>no streak shame.</li>
       <li>no email list.</li>
       <li>no upsell.</li>
       <li className="text-green-500">open source.</li>
       <li className="text-green-500">forever.</li>
     </ul>

     <p className="t-body mt-10 max-w-2xl">
       fork it. break it. open a pr. <span className="text-ink-500">+ pull requests welcome.</span>
     </p>

     <p className="t-body mt-4 max-w-2xl text-ink-300">
       if this is the python school you wish existed,{" "}
       <a
         href="https://github.com/xernst/promptdojo"
         target="_blank"
         rel="noopener noreferrer"
         className="text-green-400 underline-offset-2 hover:underline"
       >
         star the repo
       </a>
       . it&apos;s the only metric we keep.
     </p>

     <div className="mt-6 flex flex-wrap gap-3">
       <a href="https://github.com/xernst/promptdojo" target="_blank" rel="noopener noreferrer" className="dojo-btn-secondary">
         github →
       </a>
       <a href="https://x.com/TFisPython" target="_blank" rel="noopener noreferrer" className="dojo-btn-secondary">
         @TFisPython on x →
       </a>
     </div>
   </section>
   ```

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] `/about` FAQ — first question reads `is it really free?`. Click chevron — answer expands. Second click — collapses.
- [ ] FAQ has hairline rules between every Q (no left border on each item).
- [ ] Founder paragraph reads `i'm josh. ai consultant. ...` with no `TODO(josh)` comment in DOM.
- [ ] "Free forever" section shows 8 lines stacked vertically; last 2 (`open source.` + `forever.`) are green.
- [ ] `+ pull requests welcome.` closer visible after the litany.

**Verification (post-deploy):**
- [ ] DOM probe `/about`: at least 7 `<details>` elements
- [ ] First `<details>` content: `is it really free?`

**Risks:** native `<details>` has no smooth animation. If founder asks for one, defer to V4.5 — V4 ships the structure. Browser default is fine (instant open/close).

---

### PR 6: refresh-v4/06-page-rhythm-cleanup

**Branch:** `refresh-v4/06-page-rhythm-cleanup`
**Outcome:** every `border-b border-ink-800` on `/about` sections deleted (8 horizontal rules → 0). Legacy 28-chapter `<details>` block at `app/page.tsx:177-203` deleted. The v2 PhaseBandedRail becomes the only curriculum on home.
**Estimated time:** 2h
**Cumulative:** 13h
**Depends on:** PR 5 (FAQ rebuild done so the `border-b` removal doesn't strand a hanging accordion)
**Unblocks:** none directly (but creates a cleaner canvas for PR 7's floating pill)

**Files to modify:**
- `app/about/page.tsx:96, 122, 146, 168, 189, 224, 254, 295` — every `border-b border-ink-800` removed.
- `app/page.tsx:177-203` — delete the `<details>` block.
- `app/page.tsx:3` — delete the import `import { getChapters } from "@/lib/content";` if `legacyChapters` is no longer referenced.

**Files to create:** none. CEO §6 mentions `components/SectionDivider.tsx` but constrains "the `+` glyph divider goes between litany and colophon ONLY (one per page max)." That single divider is folded inline into PR 5's litany section as `<div aria-hidden className="my-12 text-2xl text-ink-700">+</div>` if we want it. **No new component file.**

**Changes:**

1. **`app/about/page.tsx` — sweep `border-b border-ink-800` from every section.** Each section currently looks like:

   ```tsx
   <section className="border-b border-ink-800 py-16">
   ```

   Replace with:

   ```tsx
   <section className="py-16">
   ```

   Lines to edit: `:96`, `:122`, `:146`, `:168`, `:189`, `:224`, `:254`, `:295`. Eight in total. Use the Edit tool with explicit context per line so you don't accidentally hit the FAQ `border-y` rule from PR 5.

2. **`app/page.tsx:177-203` — delete the legacy course `<details>` block** (the entire `<details>...</details>` element).

3. **`app/page.tsx` — drop now-unused `legacyChapters`:**

   - Delete `const legacyChapters = getChapters();` at line 89.
   - Delete `import { getChapters } from "@/lib/content";` at line 3.

   **Note:** `lib/content.ts` (the v1 content reader) is still used by the legacy `/learn/[chapter]/...` routes — do NOT delete the file itself, only this import.

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] `/about` — no horizontal rules between sections (whitespace + composition does the work)
- [ ] `/` — no `legacy 28-chapter course` disclosure between PhaseBandedRail and footer
- [ ] `pnpm tsc --noEmit` (or however lint runs) — no unused-import warning for `getChapters`

**Verification (post-deploy):**
- [ ] DOM probe `/about`: zero `<section>` elements with class `border-b`
- [ ] DOM probe `/`: body innerText does not include `legacy 28-chapter`

**Risks:** removing `border-b` from `/about` may make sections feel run-on. If they do, follow-up: bump section `py-16` → `py-20` for breathing room. Don't add borders back.

---

### PR 7: refresh-v4/07-floating-nav-pill

**Branch:** `refresh-v4/07-floating-nav-pill`
**Outcome:** non-lesson routes render a floating glass pill `fixed top-3 left-1/2 -translate-x-1/2 bg-ink-950/60 backdrop-blur-md border border-ink-800` with **sharp 0px corners** (kit canon overrides Cartesian's 50px radius). Lesson routes (`/learn/v2/*`) keep today's flat sticky header. Section nav links scroll-to-anchor when on home; route-navigate elsewhere. Mobile: pill collapses to `[wordmark · ≡]` with ContinuePill below if applicable.
**Estimated time:** 4h
**Cumulative:** 17h
**Depends on:** PR 2 (drawer ships there, gets reused here); PR 6 (cleaner `/about` for the pill to float over)
**Unblocks:** PR 8 (curriculum accordion lives under the new pill)

**Files to modify:**
- `components/SiteHeader.tsx` — split into `<FloatingNav>` (default) + `<FlatHeader>` (lesson opt-out); pathname gate.
- `app/page.tsx:92`, `app/about/page.tsx:94`, `app/curriculum/page.tsx:70`, `app/not-found.tsx:18`, `app/changelog/page.tsx` — bump non-lesson `<main>` top padding so the floating pill doesn't overlap content.

**Files to create:**
- `components/SiteHeader/FloatingNav.tsx` — new (≤120 LOC).
- `components/SiteHeader/FlatHeader.tsx` — extracted from current `SiteHeader.tsx` (the existing implementation, renamed).

**Changes:**

1. **Create `components/SiteHeader/FlatHeader.tsx`** — copy current PR-2-modified `SiteHeader.tsx` contents (post mobile-drawer + scrim), renaming the export:

   ```tsx
   "use client";
   // The lesson-route header — full-width sticky bar, identical to V3 chrome.
   // Reused by SiteHeader on /learn/v2/* paths only.
   import Link from "next/link";
   import { useState } from "react";
   import { Menu } from "lucide-react";
   import FollowOnXPill from "@/components/FollowOnXPill";
   import LoginToSave from "@/components/LoginToSave";
   import GitHubStatsPill from "@/components/GitHubStatsPill";
   import CourseProgress from "@/components/v2/CourseProgress";
   import ContinuePill from "@/components/SiteHeader/ContinuePill";
   import HeaderDrawer from "@/components/SiteHeader/Drawer";

   export default function FlatHeader({ onLesson }: { onLesson: boolean }) {
     const [drawerOpen, setDrawerOpen] = useState(false);
     return (
       <>
         <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/95 backdrop-blur-sm">
           <div className="flex items-center justify-between gap-2 px-4 py-2 sm:px-6">
             <Link href="/" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 transition hover:text-green-400">
               <span className="text-green-500">❯</span>
               <span>promptdojo</span>
             </Link>
             <ContinuePill />
             <nav aria-label="site" className="hidden items-center gap-2 md:flex">
               <GitHubStatsPill />
               {onLesson && <CourseProgress />}
               <LoginToSave />
               <FollowOnXPill />
             </nav>
             <button
               type="button"
               onClick={() => setDrawerOpen(true)}
               className="inline-flex items-center justify-center p-2 text-ink-400 hover:text-green-400 md:hidden"
               aria-label="open menu"
             >
               <Menu size={20} />
             </button>
           </div>
         </header>
         <HeaderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
       </>
     );
   }
   ```

2. **Create `components/SiteHeader/FloatingNav.tsx`** — new floating pill:

   ```tsx
   "use client";
   import Link from "next/link";
   import { useCallback, useState } from "react";
   import { usePathname } from "next/navigation";
   import { Menu } from "lucide-react";
   import FollowOnXPill from "@/components/FollowOnXPill";
   import LoginToSave from "@/components/LoginToSave";
   import GitHubStatsPill from "@/components/GitHubStatsPill";
   import ContinuePill from "@/components/SiteHeader/ContinuePill";
   import HeaderDrawer from "@/components/SiteHeader/Drawer";

   /**
    * The non-lesson chrome. Floating glass pill, smoked-dark, sharp corners
    * (kit canon overrides Cartesian's 50px radius — see 02-ui-design §1).
    * Hybrid anchor/route behavior: section links scroll-to-anchor on home,
    * route-navigate elsewhere.
    */
   export default function FloatingNav() {
     const pathname = usePathname();
     const onHome = pathname === "/";
     const [drawerOpen, setDrawerOpen] = useState(false);

     const onSectionClick = useCallback(
       (anchor: string) => (e: React.MouseEvent) => {
         if (!onHome) return; // let Link route normally
         const target = document.getElementById(anchor);
         if (!target) return; // no anchor on home — let Link route
         e.preventDefault();
         target.scrollIntoView({ behavior: "smooth", block: "start" });
         history.replaceState(null, "", `#${anchor}`);
       },
       [onHome],
     );

     return (
       <>
         <header
           className="fixed left-1/2 top-3 z-40 -translate-x-1/2 border border-ink-800 bg-ink-950/60 backdrop-blur-md"
         >
           <div className="flex h-11 items-center gap-3 px-3 sm:px-4">
             <Link
               href="/"
               className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 transition hover:text-green-400"
             >
               <span className="text-green-500">❯</span>
               <span>promptdojo</span>
             </Link>

             {/* Desktop nav */}
             <nav
               aria-label="site"
               className="hidden items-center gap-3 border-l border-ink-800 pl-3 md:flex"
             >
               <Link
                 href="/curriculum"
                 className="font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-green-400"
               >
                 the curriculum
               </Link>
               <Link
                 href="/about"
                 onClick={onSectionClick("what-is-this")}
                 className="font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-green-400"
               >
                 about
               </Link>
               <Link
                 href="/changelog"
                 className="font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-green-400"
               >
                 changelog
               </Link>
             </nav>

             <div className="ml-auto flex items-center gap-2">
               <ContinuePill />
               {/* Desktop pills */}
               <div className="hidden items-center gap-2 md:flex">
                 <GitHubStatsPill />
                 <LoginToSave />
                 <FollowOnXPill />
               </div>
               {/* Mobile hamburger */}
               <button
                 type="button"
                 onClick={() => setDrawerOpen(true)}
                 className="inline-flex items-center justify-center p-1.5 text-ink-400 hover:text-green-400 md:hidden"
                 aria-label="open menu"
               >
                 <Menu size={18} />
               </button>
             </div>
           </div>
         </header>
         <HeaderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
       </>
     );
   }
   ```

3. **Rewrite `components/SiteHeader.tsx` as a router:**

   ```tsx
   "use client";
   import { usePathname } from "next/navigation";
   import FloatingNav from "@/components/SiteHeader/FloatingNav";
   import FlatHeader from "@/components/SiteHeader/FlatHeader";

   export default function SiteHeader() {
     const pathname = usePathname();
     const onLesson = pathname?.startsWith("/learn/v2") ?? false;
     // Onboarding focused-flow — header dimmed entirely.
     const onOnboarding =
       pathname?.startsWith("/onboarding") || pathname?.startsWith("/start");
     if (onOnboarding) return null;
     // Lessons keep the flat sticky header (vertical real estate).
     if (onLesson) return <FlatHeader onLesson />;
     // Everything else gets the floating glass pill.
     return <FloatingNav />;
   }
   ```

4. **Per-page top padding bump** — the floating pill is `position: fixed` so it overlays content. The pill's 12px-top + 44px-height + 16px-bottom-clearance = ~72px below pill. Each non-lesson page already has `py-10 sm:py-16` (40px / 64px top). Bump to `pt-20 pb-10 sm:pt-24 sm:pb-16` (80px / 96px top):

   ```tsx
   // BEFORE (each non-lesson <main>)
   <main id="main" className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
   ```

   ```tsx
   // AFTER
   <main id="main" className="mx-auto max-w-6xl px-6 pt-20 pb-10 sm:pt-24 sm:pb-16">
   ```

   Files: `app/page.tsx:92`, `app/about/page.tsx:94`, `app/curriculum/page.tsx:70`, `app/not-found.tsx:18`, `app/changelog/page.tsx` (read first to find line). Don't touch lesson routes — those use `LessonShell`.

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] Home — pill floats centered at top, semi-transparent dark glass, NO rounded corners. Hero text starts BELOW the pill (no overlap).
- [ ] Lesson page — flat sticky header (today's chrome). No floating pill.
- [ ] Onboarding page — no header at all (focused flow preserved).
- [ ] At 375 viewport: pill collapses to wordmark + ContinuePill (if applicable) + `≡` hamburger.
- [ ] Click `about` link from `/curriculum` — routes to `/about`. Click `about` link from `/` — routes to `/about` because home doesn't have a `#what-is-this` anchor in V4 scope. Verify the `onSectionClick` handler correctly falls through to default Link routing when `target` is null.

**Verification (post-deploy):**
- [ ] DOM probe `/`: header position is `fixed`
- [ ] DOM probe `/learn/v2/...`: header position is `sticky`
- [ ] DOM probe `/`: header border-radius is `0px`

**Risks:**
- The floating pill's `bg-ink-950/60` over content with images may look murky in the rare case there's a colored block beneath. The hero is mostly dark already — verify on `/about` too.
- ContinuePill's `font-mono text-[11px]` may push the pill width past a 320px viewport when `lastVisitedV2` is `chapter "mutation-and-state" step 8 of 12` (~36 chars). Acceptable — the pill is `flex-wrap` adjacent to wordmark; if it overflows it'll wrap to a second line. If it bites in QA, hide ContinuePill on `<sm:` and surface it in the drawer instead.
- The `onSectionClick` handler now early-returns when the target anchor doesn't exist — verify that `/about` link still triggers a real navigation and doesn't dead-click.

---

### PR 8: refresh-v4/08-curriculum-accordion

**Branch:** `refresh-v4/08-curriculum-accordion`
**Outcome:** `/curriculum` renders a new `<CurriculumAccordion>` (5 phase rows, phase 1 default-open, hairline-rule chapter rows, click-to-expand blurb + lesson list). The grid view stays on `/` (home). Same data, two compositions, two roles.
**Estimated time:** 4h
**Cumulative:** 21h
**Depends on:** PR 7 (the floating pill ships first so accordion never lives under the old chrome)
**Unblocks:** none

**Files to modify:**
- `app/curriculum/page.tsx:76-82` — swap `<PhaseBandedRail expanded ... />` for `<CurriculumAccordion ... />`.

**Files to create:**
- `components/v2/CurriculumAccordion.tsx` — new server component (≤140 LOC).

**Changes:**

1. **Create `components/v2/CurriculumAccordion.tsx`:**

   The mockup at `parked-mockups/B2-curriculum-parked.html` is the visual target. Build a server component that mirrors that shape using existing data (`PHASES` from `lib/curriculum/phases.ts`, chapter metadata from manifest):

   ```tsx
   // components/v2/CurriculumAccordion.tsx
   //
   // Server component — renders /curriculum as a textbook-index accordion.
   // Phase 1 default-open per CEO §8. Hairline rules between rows, no card chrome.
   //
   // Per design-kit/audit-v4/CEO-vision.md pick #8 + 02-ui-design Pattern #6.

   import { PHASES } from "@/lib/curriculum/phases";

   type LessonSummary = { slug: string; title: string; stepCount: number };

   export type AccordionChapter = {
     slug: string;
     title: string;
     number: number;
     blurb: string;
     stepCount: number;
     estMinutes: number;
     firstLessonSlug: string | null;
     hasOverview: boolean;
     lessons: LessonSummary[];
   };

   type Props = {
     chapters: AccordionChapter[];
     className?: string;
   };

   function pad(n: number): string {
     return String(n).padStart(2, "0");
   }

   function formatMinutes(m: number): string {
     if (!Number.isFinite(m) || m <= 0) return "0m";
     if (m < 60) return `${m}m`;
     const h = Math.floor(m / 60);
     const r = m % 60;
     return r === 0 ? `${h}h` : `${h}h ${r}m`;
   }

   function titleClean(t: string): string {
     return t.replace(/\s*—.*$/, "").toLowerCase();
   }

   export default function CurriculumAccordion({ chapters, className }: Props) {
     const bySlug = new Map(chapters.map((c) => [c.slug, c]));
     return (
       <article className={`divide-y divide-ink-800 border-y border-ink-800 ${className ?? ""}`.trim()}>
         {PHASES.map((phase) => {
           const phaseChapters = phase.chapterSlugs
             .map((s) => bySlug.get(s))
             .filter((c): c is AccordionChapter => !!c);
           const phaseMinutes = phaseChapters.reduce((acc, c) => acc + c.estMinutes, 0);
           return (
             <details
               key={phase.number}
               className="group"
               open={phase.number === 1}
             >
               <summary className="flex cursor-pointer list-none items-baseline gap-4 py-6">
                 <span className="font-mono text-2xl text-green-500 transition group-open:rotate-90">
                   ❯
                 </span>
                 <div className="flex-1">
                   <div className="t-eyebrow">phase {pad(phase.number)}</div>
                   <h2 className="t-section mt-1">{phase.name}</h2>
                   <p className="t-body-sm mt-2 max-w-2xl">{phase.blurb}</p>
                 </div>
                 <div className="t-mono-meta self-center text-right">
                   {phase.range}
                   <br />~{formatMinutes(phaseMinutes)}
                 </div>
               </summary>
               <div className="divide-y divide-ink-800 border-t border-ink-800">
                 {phaseChapters.map((c) => {
                   const href = c.firstLessonSlug
                     ? c.hasOverview
                       ? `/learn/v2/${c.slug}`
                       : `/learn/v2/${c.slug}/${c.firstLessonSlug}/0`
                     : null;
                   return (
                     <details key={c.slug} className="group/c py-4 pl-9">
                       <summary className="flex cursor-pointer list-none items-baseline gap-3">
                         <span className="font-mono text-ink-500 transition group-open/c:rotate-90">
                           +
                         </span>
                         <span className="font-mono text-[11px] tabular-nums text-ink-500">
                           ch {pad(c.number)}
                         </span>
                         <span className="t-h3">{titleClean(c.title)}</span>
                         <span className="ml-auto t-mono-meta">
                           {c.stepCount} steps · ~{formatMinutes(c.estMinutes)}
                         </span>
                       </summary>
                       <div className="mt-3 pl-9">
                         <p className="t-body-sm">{c.blurb}</p>
                         {c.lessons.length > 0 && (
                           <ol className="mt-3 space-y-1 font-mono text-[11px] text-ink-400">
                             {c.lessons.map((l, i) => (
                               <li key={l.slug} className="flex items-baseline gap-2">
                                 <span className="text-ink-600 tabular-nums">{pad(i + 1)}</span>
                                 <span>·</span>
                                 <span>{l.title.toLowerCase()}</span>
                                 <span className="ml-auto text-ink-600">{l.stepCount}</span>
                               </li>
                             ))}
                           </ol>
                         )}
                         {href && (
                           <a
                             href={href}
                             className="dojo-btn-tertiary mt-4 inline-flex"
                           >
                             open chapter <span aria-hidden>→</span>
                           </a>
                         )}
                       </div>
                     </details>
                   );
                 })}
               </div>
             </details>
           );
         })}
       </article>
     );
   }
   ```

2. **`app/curriculum/page.tsx:76-82` — swap rail for accordion:**

   ```tsx
   // BEFORE (lines 76-82)
   <PhaseBandedRail
     chapters={chapters}
     stepIdsByChapter={stepIdsByChapter}
     lessonsByChapter={lessonsByChapter}
     expanded
     className="mt-12"
   />
   ```

   ```tsx
   // AFTER
   <CurriculumAccordion
     chapters={chapters.map((c) => ({
       slug: c.slug,
       title: c.title,
       number: c.number,
       blurb: c.blurb,
       stepCount: c.stepCount,
       estMinutes: c.estMinutes,
       firstLessonSlug: c.firstLessonSlug,
       hasOverview: c.hasOverview,
       lessons: lessonsByChapter[c.slug] ?? [],
     }))}
     className="mt-12"
   />
   ```

   Add the import at the top of `app/curriculum/page.tsx`:

   ```tsx
   import CurriculumAccordion from "@/components/v2/CurriculumAccordion";
   ```

   Drop the `import PhaseBandedRail from "@/components/v2/PhaseBandedRail";` if it's no longer used in this file.

3. **Confirm `app/page.tsx` PhaseBandedRail unchanged** — home rail at `app/page.tsx:171-174` stays. Two compositions, two roles, per CEO §8.

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] `/curriculum` — phase 01 default-open showing 7 chapter rows; phases 2–5 collapsed showing only the phase header + chevron.
- [ ] Click phase 02 chevron — expands. Click phase 01 chevron — collapses.
- [ ] Click any chapter `+` — expands showing blurb + lesson list + `open chapter` link.
- [ ] No `<PhaseBandedRailClient>` JS shipped to `/curriculum` (server-only accordion). Verify with `pnpm build && grep -r "use client" .next/server/app/curriculum/`.
- [ ] `/` (home) PhaseBandedRail unchanged (grid view).

**Verification (post-deploy):**
- [ ] DOM probe `/curriculum`: exactly 1 `<details>` with `[open]` attribute by default
- [ ] DOM probe `/curriculum`: total `<details>` count is 5 phases + 25 chapters = 30

**Risks:**
- The `lessonsByChapter` payload size: 25 chapters × ~3 lessons × ~50 chars title = ~3.75 KB. Static export bundles this into the HTML — adds ~3-4 KB to `/curriculum`'s HTML. Acceptable.
- Native `<details>` doesn't smooth-animate. CEO accepts this. If a future PR wants animation, use `interpolate-size` CSS or keep deferring.

---

### PR 9: refresh-v4/09-onboarding-to-start

**Branch:** `refresh-v4/09-onboarding-to-start`
**Outcome:** `/onboarding` renamed to `/start`. The 5-screen flow trims to 3 (drop "personalization" screen + "daily-goal" screen — keep audience + level + goal). Add a `skip for now → start chapter 1` text-link routing to `/learn/v2/variables/naming-things/0` with default profile. Hand-rolled `<button>` already uses `dojo-btn-primary` per V3 — verify, no change.
**Estimated time:** 2h
**Cumulative:** 23h
**Depends on:** PR 7 (already gates `/onboarding` AND `/start` to no-header in `SiteHeader.tsx`)
**Unblocks:** PR 10 (preloader sweep verifies `/start` mounts the preloader)

**Files to modify:**
- `app/onboarding/page.tsx` — moved to `app/start/page.tsx` (file move).
- After move, edit `app/start/page.tsx` to drop screens 3 (personalization) and 4 (daily-goal); add skip link.
- `public/_redirects` — add `/onboarding /start 301`.

**Files to create:**
- `app/start/` directory (move target).
- `app/start/page.tsx` (the moved + trimmed file).

**Files to delete:**
- `app/onboarding/page.tsx` (after move).
- `app/onboarding/` directory (after move).

**Changes:**

1. **File move + dir rename:**

   `git mv app/onboarding app/start` (preserves git history). Resulting path: `app/start/page.tsx`.

2. **`app/start/page.tsx` — trim 5 screens to 3:**

   The current file (`app/onboarding/page.tsx:79-182`) renders 5 screens via a switch. Drop screens 3 (`PersonalizationScreen`) and 4 (`DailyGoalScreen`). Keep:
   - Screen 0 — Welcome
   - Screen 1 — GoalScreen (audience)
   - Screen 2 — LevelScreen (level)

   Also drop the `pet`, `team`, `city`, `dailyGoalMinutes` from `Draft` since they're no longer collected. The `setUserProfile` call in `finish` should still pass these as defaults from the schema.

   ```tsx
   // BEFORE (lines 79-158, abridged) — 5-screen switch
   ```

   ```tsx
   // AFTER
   type Draft = {
     goal: Goal | null;
     level: Level | null;
   };

   export default function StartPage() {
     const router = useRouter();
     const [step, setStep] = useState(0);
     const [draft, setDraft] = useState<Draft>({
       goal: null,
       level: null,
     });

     const finish = useCallback(() => {
       setUserProfile({
         name: "",
         goal: draft.goal ?? "curious",
         level: draft.level ?? "absolute-beginner",
         flavor: {},
         dailyGoalMinutes: 10, // schema default
       });
       router.push(FIRST_LESSON);
     }, [draft, router]);

     const skip = useCallback(() => {
       setUserProfile({
         name: "",
         goal: "curious",
         level: "absolute-beginner",
         flavor: {},
         dailyGoalMinutes: 10,
       });
       router.push(FIRST_LESSON);
     }, [router]);

     const next = useCallback(() => setStep((s) => Math.min(2, s + 1)), []);
     const update = useCallback(
       <K extends keyof Draft>(key: K, value: Draft[K]) =>
         setDraft((d) => ({ ...d, [key]: value })),
       [],
     );

     const screen = useMemo(() => {
       switch (step) {
         case 0:
           return <Welcome onContinue={next} />;
         case 1:
           return <GoalScreen value={draft.goal} onPick={(g) => { update("goal", g); next(); }} />;
         case 2:
           return <LevelScreen value={draft.level} onPick={(l) => { update("level", l); finish(); }} />;
         default:
           return null;
       }
     }, [step, draft, finish, next, update]);

     return (
       <main id="main" className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 sm:py-16">
         <PyodidePreloader />
         <header className="mb-10 flex items-center justify-between">
           <Link href="/" className="block">
             <Wordmark size="text-base" />
           </Link>
           <div className="flex items-center gap-1.5" aria-label={`step ${step + 1} of 3`}>
             {[0, 1, 2].map((i) => (
               <span
                 key={i}
                 className={cn(
                   "h-1 w-8 rounded-full transition",
                   i <= step ? "bg-green-500" : "bg-ink-800",
                 )}
               />
             ))}
           </div>
         </header>
         <div className="flex flex-1 flex-col">{screen}</div>
         <div className="mt-8 text-center">
           <button
             type="button"
             onClick={skip}
             className="font-mono text-xs text-ink-500 underline-offset-4 hover:text-ink-300 hover:underline"
           >
             skip for now → start chapter 1
           </button>
         </div>
       </main>
     );
   }
   ```

   Also update `Welcome`'s subhead per PR 4:

   ```tsx
   // BEFORE
   <p className="mt-2 max-w-xl text-sm text-ink-500">
     five questions. under a minute. then you ship code.
   </p>
   ```

   ```tsx
   // AFTER
   <p className="mt-2 max-w-xl text-sm text-ink-500">
     three questions. under a minute. then you ship code.
   </p>
   ```

   The `start` button in `Welcome` (`:201-208`) is already `dojo-btn-primary` — verify, no change.

3. **`public/_redirects` — append the rename rule:**

   The file already exists at `public/_redirects`. Add at the top (or bottom — order doesn't matter for non-overlapping rules):

   ```
   /onboarding  /start  301
   /onboarding/  /start/  301
   ```

   Cloudflare Pages reads `_redirects` at the project root in the deployed output. With `output: "export"`, Next bundles `public/_redirects` into `out/_redirects` at build. **Verify post-build:** run `pnpm build && cat out/_redirects` — confirm the new rules are present. If `out/_redirects` is missing entirely, add a postbuild script to `package.json` that copies `public/_redirects` to `out/_redirects`.

4. **`components/SiteHeader.tsx` PR-7 update** — already added `/start` to the `onOnboarding` check in PR 7's rewrite. Verify.

5. **Sweep references to `/onboarding` route** across the codebase. Likely places that need update:
   - `components/PyodidePreloader.tsx` — comment at line 9 mentions `/onboarding`. Update comment.
   - Any internal `<Link href="/onboarding">` — should none exist (it's a destination, not a navigated link), but verify.

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] `/start` — renders 3-screen flow with progress dots showing 3 (not 5)
- [ ] Click `start` (welcome) → goal screen → pick a goal → level screen → pick a level → routed to `/learn/v2/variables/naming-things/0`
- [ ] On any screen, click `skip for now → start chapter 1` — routes to first lesson with default profile
- [ ] `/onboarding` — 301 redirect to `/start` (test on the Cloudflare preview, not localhost — Next dev server doesn't apply `_redirects`)

**Verification (post-deploy):**
- [ ] `curl -I https://<preview-url>/onboarding` — `HTTP/1.1 301`, `Location: /start`
- [ ] `https://<preview-url>/start` 200, page renders, 3 dots in progress

**Risks:**
- `setUserProfile` schema requires `name`, `dailyGoalMinutes`, `flavor` — pass empty defaults explicitly. Schema default at `lib/content/schema.ts:351` is 10, matches.
- The `_redirects` file needs verification on Cloudflare Pages — the `output: "export"` Next setup copies `public/` into `out/`, so `_redirects` should land in `out/_redirects`. If not, the build script needs an explicit copy.

---

### PR 10: refresh-v4/10-404-and-preloader-polish

**Branch:** `refresh-v4/10-404-and-preloader-polish`
**Outcome:** ship the V3-specced Levenshtein "did you mean: about?" hint on `/not-found.tsx`. Audit `<PyodidePreloader>` mount points: keep on `/` and `/start`, ensure NOT on `/curriculum`, `/about`, `/changelog`, `/not-found`.
**Estimated time:** 1h
**Cumulative:** 24h
**Depends on:** PR 9 (so `/start` exists and the preloader audit covers the new path)
**Unblocks:** PR 11 (clean baseline before the big interactive feature)

**Files to modify:**
- `app/not-found.tsx` — add `<DidYouMean />` component.
- `components/PyodidePreloader.tsx` — verify mounts (no edit if OK; comment update for `/onboarding` → `/start`).

**Files to create:**
- `components/DidYouMean.tsx` — new (≤80 LOC).

**Changes:**

1. **Create `components/DidYouMean.tsx`:**

   ```tsx
   "use client";
   import Link from "next/link";
   import { useEffect, useState } from "react";

   const KNOWN_PATHS = [
     "/",
     "/about",
     "/curriculum",
     "/changelog",
     "/start",
     "/lesson/resume",
   ];

   function levenshtein(a: string, b: string): number {
     const m = a.length;
     const n = b.length;
     if (m === 0) return n;
     if (n === 0) return m;
     const dp: number[][] = Array.from({ length: m + 1 }, () =>
       new Array<number>(n + 1).fill(0),
     );
     for (let i = 0; i <= m; i++) dp[i][0] = i;
     for (let j = 0; j <= n; j++) dp[0][j] = j;
     for (let i = 1; i <= m; i++) {
       for (let j = 1; j <= n; j++) {
         const cost = a[i - 1] === b[j - 1] ? 0 : 1;
         dp[i][j] = Math.min(
           dp[i - 1][j] + 1,
           dp[i][j - 1] + 1,
           dp[i - 1][j - 1] + cost,
         );
       }
     }
     return dp[m][n];
   }

   /**
    * Suggests the closest known route based on the current pathname.
    * Threshold: distance <= 4. Anything farther stays silent — better to say
    * nothing than guess wrong.
    */
   export default function DidYouMean() {
     const [suggestion, setSuggestion] = useState<string | null>(null);

     useEffect(() => {
       if (typeof window === "undefined") return;
       const path = window.location.pathname;
       let best: { path: string; dist: number } | null = null;
       for (const cand of KNOWN_PATHS) {
         const dist = levenshtein(path, cand);
         if (best === null || dist < best.dist) {
           best = { path: cand, dist };
         }
       }
       if (best && best.dist > 0 && best.dist <= 4) {
         setSuggestion(best.path);
       }
     }, []);

     if (!suggestion) return null;

     return (
       <p className="mt-6 t-body">
         did you mean{" "}
         <Link
           href={suggestion}
           className="text-green-400 underline underline-offset-2 hover:text-green-300"
         >
           {suggestion}
         </Link>
         ?
       </p>
     );
   }
   ```

2. **`app/not-found.tsx` — wire `<DidYouMean />`:**

   ```tsx
   // BEFORE (lines 16-44)
   export default function NotFound() {
     return (
       <main id="main" className="mx-auto max-w-2xl px-6 py-16">
         <div className="t-eyebrow">404 ─ page not found</div>
         <h1 className="t-section mt-4">this lesson does not exist (yet).</h1>
         <p className="t-body mt-6">
           the curriculum has 25 chapters and 624 steps, but not this one.
         </p>
         <div className="mt-10 grid gap-3 sm:grid-cols-3">
           ...3 cards...
         </div>
         <StatStrip className="mt-12" />
       </main>
     );
   }
   ```

   ```tsx
   // AFTER
   import Link from "next/link";
   import StatStrip from "@/components/StatStrip";
   import DidYouMean from "@/components/DidYouMean";

   export const metadata = {
     title: "page not found · promptdojo",
     description:
       "this lesson does not exist (yet). 25 chapters, 624 runnable steps, but not this one.",
     robots: { index: false },
   };

   export default function NotFound() {
     return (
       <main id="main" className="mx-auto max-w-2xl px-6 pt-20 pb-10 sm:pt-24 sm:pb-16">
         <div className="t-eyebrow">404 ─ page not found</div>
         <h1 className="t-section mt-4">this lesson does not exist (yet).</h1>
         <p className="t-body mt-6">
           the curriculum has 25 chapters and 624 runnable steps, but not this one.
         </p>
         <DidYouMean />
         <div className="mt-10 grid gap-3 sm:grid-cols-3">
           <Link href="/" className="dojo-card-interactive">
             <div className="t-eyebrow">go</div>
             <div className="mt-2 text-ink-100">← home</div>
           </Link>
           <Link href="/about" className="dojo-card-interactive">
             <div className="t-eyebrow">read</div>
             <div className="mt-2 text-ink-100">about →</div>
           </Link>
           <Link href="/learn/v2/variables/naming-things/0" className="dojo-card-interactive">
             <div className="t-eyebrow">start</div>
             <div className="mt-2 text-ink-100">↵ chapter 1</div>
           </Link>
         </div>
         <StatStrip className="mt-12" />
       </main>
     );
   }
   ```

3. **`components/PyodidePreloader.tsx` — verify mounts:**

   The component mounts wherever it's imported. Check current mount sites with `grep -rn "PyodidePreloader" app/`. Expected:
   - `app/page.tsx` — mounts on `/`. Keep.
   - `app/start/page.tsx` (after PR 9). Keep.
   - `app/curriculum/page.tsx` — should NOT mount. Verify it does NOT import.
   - `app/about/page.tsx` — should NOT mount. Verify.
   - `app/changelog/page.tsx` — should NOT mount. Verify.
   - `app/not-found.tsx` — should NOT mount. Verify.

   If any of the "should NOT mount" pages import `PyodidePreloader`, remove the import and the JSX usage.

   Also update the comment at `components/PyodidePreloader.tsx:9` from `/onboarding` to `/start`.

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green
- [ ] `/notarealpage` — body shows `did you mean /about?` (Levenshtein <=4 from `/notarealpage` to `/about` is 8 — too far. Try `/abou` instead — distance 1, suggests `/about`).
- [ ] `/curriculum` — `__ck_pyodide_warm` global is undefined (preloader not mounted)
- [ ] `/` — `__ck_pyodide_warm` becomes true within 1500ms (preloader fires)

**Verification (post-deploy):**
- [ ] DOM probe `/abou`: body innerText includes "did you mean"

**Risks:**
- The Levenshtein threshold of <=4 may produce false positives for very short paths (e.g. `/x` to `/` distance 1, suggests home). Acceptable — home is the right fallback.
- Long paths like `/learn/v2/variables/typo/0` may compute distance > 4 to all known paths and silently suggest nothing. The "did you mean" stays hidden. Acceptable.
- For `/learn/v2/<typo>` paths specifically, the Levenshtein over the full path won't help much. CEO §10 mentions surfacing it for `/learn/v2/<typo>` paths too — V4 ships against `KNOWN_PATHS` only; the deeper-path version is V4.5. Acceptable trim.

---

### PR 11: refresh-v4/11-fill-blank-widgets

**Branch:** `refresh-v4/11-fill-blank-widgets`
**Outcome:** the existing 44 fill steps render their blanks INSIDE the editor at `___NAME___` token positions via CodeMirror 6 `WidgetType` decorations. Multi-blank Tab navigation works. The legacy in-prompt-blank rendering remains as a fallback for prose-only fill steps.
**Estimated time:** 10h (CEO §11 trimmed from 12h audit estimate; multi-blank Tab polish + theme states explicitly cuttable to V4.5)
**Cumulative:** 34h
**Depends on:** PRs 1–10 all merged
**Unblocks:** none in V4

**Files to modify:**
- `lib/content/schema.ts` — no new fields; add a build-script enforcement comment.
- `scripts/build-content-v2.mjs` — add `___X___` parsing + validation.
- `components/v2/PersistentIDE.tsx` — accept optional `extraExtensions` + `onEditorView` props; wire when active step is `fill`.
- `components/v2/steps/FillBlankStepView.tsx` — rewrite: state moves up, IDE renders inputs.
- `lib/codemirror-theme.ts` — add `.cm-blank-input` styles (deprioritize-cuttable).
- 44 fill `.fill.yaml` files in `content/python/**` — migrate `___` markers from `prompt` to `code`.

**Files to create:**
- `lib/codemirror-blank-widget.ts` — new `WidgetType` + `StateField` extension.
- `scripts/migrate-fill-steps-v4.mjs` — one-shot migration tool.

**Changes:**

1. **`lib/codemirror-blank-widget.ts` — new file (~150 LOC):**

   ```ts
   // lib/codemirror-blank-widget.ts
   //
   // CodeMirror 6 widget extension — renders <input> elements at ___NAME___
   // marker positions in the editor. Per audit-v4/08-interactive-features-feasibility.md
   // Feature 3.
   //
   // Critical: WidgetType.eq() must return true when (id, value, state) are
   // unchanged so CM reuses the existing DOM node and preserves focus across
   // re-renders. This is the load-bearing fix that makes V3's broken fill
   // step work.

   import {
     EditorView,
     Decoration,
     WidgetType,
     type DecorationSet,
   } from "@codemirror/view";
   import { StateField, StateEffect, RangeSetBuilder } from "@codemirror/state";

   export type BlankSpec = {
     id: string;
     accept: string[];
     caseSensitive: boolean;
     normalize: "trim" | "collapse-ws" | "none";
   };

   export type BlankState = "neutral" | "correct" | "wrong";

   export type BlankConfig = {
     blanks: BlankSpec[];
     values: Record<string, string>;
     states: Record<string, BlankState>;
     onChange: (id: string, value: string) => void;
     onTab: (currentId: string, shift: boolean) => void;
   };

   export const setBlankConfig = StateEffect.define<BlankConfig>();

   class BlankInputWidget extends WidgetType {
     constructor(
       readonly blankId: string,
       readonly value: string,
       readonly state: BlankState,
       readonly width: number,
       readonly onChange: (id: string, v: string) => void,
       readonly onTab: (id: string, shift: boolean) => void,
     ) {
       super();
     }

     toDOM() {
       const input = document.createElement("input");
       input.type = "text";
       input.value = this.value;
       input.dataset.blankId = this.blankId;
       input.dataset.state = this.state;
       input.style.width = `${this.width}ch`;
       input.className = "cm-blank-input";
       input.spellcheck = false;
       input.autocomplete = "off";
       input.disabled = this.state === "correct";
       input.addEventListener("input", (e) => {
         this.onChange(
           this.blankId,
           (e.target as HTMLInputElement).value,
         );
       });
       input.addEventListener("keydown", (e) => {
         if (e.key === "Tab") {
           e.preventDefault();
           this.onTab(this.blankId, e.shiftKey);
         }
       });
       return input;
     }

     // Critical for focus preservation. While typing, the widget should NOT
     // rebuild — only the DOM node's value attribute updates via the input
     // listener. So eq() returns true for any value change while in
     // "neutral" state; rebuilds only when state flips to correct/wrong.
     eq(other: BlankInputWidget) {
       if (other.blankId !== this.blankId) return false;
       if (other.state !== this.state) return false;
       // While neutral, never rebuild on value change (preserves focus).
       if (this.state === "neutral" && other.state === "neutral") return true;
       return other.value === this.value;
     }

     ignoreEvent() {
       return true;
     }
   }

   const MARKER = /___([A-Z_]+)___/g;

   const blankConfigField = StateField.define<BlankConfig | null>({
     create: () => null,
     update(prev, tr) {
       for (const e of tr.effects) {
         if (e.is(setBlankConfig)) return e.value;
       }
       return prev;
     },
   });

   const blankDecorationField = StateField.define<DecorationSet>({
     create: () => Decoration.none,
     update(_prev, tr) {
       const cfg = tr.state.field(blankConfigField);
       if (!cfg) return Decoration.none;
       const builder = new RangeSetBuilder<Decoration>();
       const text = tr.state.doc.toString();
       MARKER.lastIndex = 0;
       let m: RegExpExecArray | null;
       while ((m = MARKER.exec(text)) !== null) {
         const idLower = m[1].toLowerCase();
         const blank = cfg.blanks.find(
           (b) => b.id.toLowerCase() === idLower,
         );
         if (!blank) continue;
         const value = cfg.values[blank.id] ?? "";
         const state = cfg.states[blank.id] ?? "neutral";
         const longestAccept = Math.max(
           ...blank.accept.map((s) => s.length),
         );
         const width = Math.max(4, longestAccept + 1);
         const widget = new BlankInputWidget(
           blank.id,
           value,
           state,
           width,
           cfg.onChange,
           cfg.onTab,
         );
         builder.add(
           m.index,
           m.index + m[0].length,
           Decoration.replace({ widget }),
         );
       }
       return builder.finish();
     },
     provide: (f) => EditorView.decorations.from(f),
   });

   /** Use this in PersistentIDE's `extensions` array when active step is `fill`. */
   export function blankWidgetExtension() {
     return [blankConfigField, blankDecorationField];
   }
   ```

   **Note:** Verify `RangeSetBuilder` import path against the live `@codemirror/state` API before shipping. CodeMirror 6 docs: https://codemirror.net/docs/ref/

2. **`scripts/build-content-v2.mjs` — add fill-step marker validator:**

   Inside the FillBlankStep validation block (search for `FillBlankStep` or the file's pattern), add:

   ```js
   // After Zod-parsing each fill step:
   if (step.type === "fill" && typeof step.code === "string") {
     const matches = [...step.code.matchAll(/___([A-Z_]+)___/g)];
     const blankIdsLower = step.blanks.map((b) => b.id.toLowerCase());
     for (const m of matches) {
       const idLower = m[1].toLowerCase();
       if (!blankIdsLower.includes(idLower)) {
         throw new Error(
           `[fill validator] step ${step.id} has marker ___${m[1]}___ in code with no matching blanks[].id`,
         );
       }
     }
     for (const b of step.blanks) {
       const expected = `___${b.id.toUpperCase()}___`;
       if (!step.code.includes(expected)) {
         // Fallback path — blank in prompt only. Print warning, don't error.
         console.warn(
           `[fill validator] step ${step.id} blank ${b.id} not found in code; falling back to legacy in-prompt rendering.`,
         );
       }
     }
   }
   ```

3. **`components/v2/PersistentIDE.tsx` — accept extension prop:**

   Add to the `Props` type (after `outputExtra` at line 84):

   ```tsx
   /** Extra CodeMirror extensions to merge into the editor (e.g. fill-blank widgets). */
   extraExtensions?: Extension[];
   /** Callback invoked once with the EditorView so the parent can dispatch effects. */
   onEditorView?: (view: EditorView | null) => void;
   ```

   Add `Extension` to the imports from `@codemirror/state`. Update the `extensions` useMemo at line 209 to merge `extraExtensions`:

   ```tsx
   const extensions = useMemo(() => {
     const base = ...; // existing
     return [...base, ...(extraExtensions ?? [])];
   }, [activeFile, extraExtensions]);
   ```

   On `<CodeMirror>` add an `onCreateEditor` callback:

   ```tsx
   onCreateEditor={(view) => {
     onEditorView?.(view);
   }}
   ```

4. **`components/v2/steps/FillBlankStepView.tsx` — rewrite:**

   The new flow: blanks render in the IDE; the step view shows the prompt + Check button + result. Detect prose-only fallback by checking whether `step.code?.match(/___[A-Z_]+___/)` is null. If null, render the existing V3 path (`splitOnBlanks` etc.). If not null, render the new IDE-widget path.

   The new path needs a ref to the `EditorView` so `setBlankConfig` effects can be dispatched on change. The wiring:
   - `FillBlankStepView` owns `values`, `submitted`, `allCorrect` state.
   - Builds a `BlankConfig` memo that includes `onChange` (updates `values`), `onTab` (focuses next/prev `[data-blank-id]` input), and `states` (derived from `submitted` + `allCorrect`).
   - Receives `editorViewRef` callback from PersistentIDE; on every `cfg` change, dispatches `setBlankConfig.of(cfg)`.

   **Rough new path:**

   ```tsx
   const editorViewRef = useRef<EditorView | null>(null);
   const cfg: BlankConfig = useMemo(() => ({
     blanks: step.blanks,
     values,
     states: deriveStates(submitted, allCorrect, values, step.blanks),
     onChange: (id, v) => setValues((p) => ({ ...p, [id]: v })),
     onTab: (currentId, shift) => focusAdjacentBlank(currentId, shift),
   }), [step.blanks, values, submitted, allCorrect]);

   useEffect(() => {
     editorViewRef.current?.dispatch({ effects: setBlankConfig.of(cfg) });
   }, [cfg]);
   ```

   And the `<PersistentIDE>` mount in this step (in `LessonStepClient.tsx` or wherever the IDE renders for a fill step) needs:

   ```tsx
   <PersistentIDE
     ...
     extraExtensions={step.type === "fill" ? [blankWidgetExtension()] : undefined}
     onEditorView={(view) => { editorViewRef.current = view; }}
   />
   ```

5. **Content migration (44 fill yaml files) — `scripts/migrate-fill-steps-v4.mjs`:**

   Walk `content/python/**/*.fill.yaml`. For each:
   - Parse YAML, find `___` count in `prompt` and in `code`.
   - If `code` has bare `___` and `blanks` has matching IDs (in source order), replace each bare `___` with `___<ID_UPPER>___` matching `blanks[i].id`.
   - Replace any trailing `Key: ___` (or analogous prompt-line) in `prompt` with `Fill the blank in the editor.`.
   - Write back.
   - Log every file changed.
   - Skip files where `code` is absent (prose-only fallback path).

   Run: `node scripts/migrate-fill-steps-v4.mjs`. Hand-review `git diff content/` before commit.

6. **`lib/codemirror-theme.ts` — add `.cm-blank-input` states (CUTTABLE per CEO):**

   Add to `dojoEditorTheme`'s first arg (the CSS-in-JS object):

   ```ts
   ".cm-blank-input": {
     display: "inline-block",
     border: `1px solid ${ink700}`,
     background: "transparent",
     color: green300,
     fontFamily: "inherit",
     fontSize: "inherit",
     fontWeight: "600",
     padding: "0 4px",
     borderRadius: "0",
     outline: "none",
     transition: "border-color 140ms ease-out",
   },
   ".cm-blank-input:focus": {
     borderColor: green500,
   },
   '.cm-blank-input[data-state="correct"]': {
     borderColor: green500,
     color: green500,
   },
   '.cm-blank-input[data-state="wrong"]': {
     borderColor: "#ef4444",
     borderBottomStyle: "dotted",
   },
   ```

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` green (this includes `build-content-v2.mjs` which now validates fill steps)
- [ ] Migration script ran and `git diff content/python/` shows expected `___ID___` markers in `code` fields
- [ ] Open a fill step (e.g. `/learn/v2/lists-and-dicts/the-bones-of-apis/4`) — the editor shows an `<input>` element where `___KEY___` was; cursor focuses it; you can type
- [ ] Type the correct answer (e.g. `"email"`) → press Check → green border + "that fits."
- [ ] Multi-blank step (find one in `loops` chapter) — type in first blank, press Tab, focus moves to second blank
- [ ] Prose-only fallback step (any with `code` absent) renders the V3 in-prompt input path

**Verification (post-deploy):**
- [ ] DOM probe a fill step: `document.querySelectorAll('.cm-blank-input').length` matches the expected blank count
- [ ] Test multi-blank: 3-blank lesson should show 3 `.cm-blank-input` elements

**Risks:**
- **CodeMirror StateField rebuild on doc change:** when CM rebuilds the decoration set on every doc change, our `BlankInputWidget.eq()` must return true for unchanged blanks during typing. The implementation explicitly returns `true` for any neutral-state blank (so the DOM node is reused regardless of typed value). When the user submits, the state flips to `correct` or `wrong` and the widget rebuilds — that's fine because focus is already lost on submit (the Check button took focus).
- **CUTTABLE if time tight (per CEO §11):** multi-blank Tab navigation + the `.cm-blank-input` theme states. Ship the core widget + state-field + 44-step migration first; theme states ship as a follow-up if time tight. If cut, the input renders with the browser default border which is acceptable.
- **PersistentIDE prop additions:** `extraExtensions` and `onEditorView` need to be threaded through `LessonStepClient.tsx` to `<PersistentIDE>`. Verify the prop chain.

---

## Cross-cutting concerns

### Token additions (CSS / Tailwind theme)

**`app/globals.css`:**
- New utility class `.t-emph` (PR 4).
- New utility class `.cm-blank-input` (PR 11, cuttable).
- No `@theme` token additions — sticking to existing `--color-ink-*` and `--color-green-*` palette per BRAND.md.

### TypeScript interface changes

| File | Interface | Change |
|---|---|---|
| `components/v2/PersistentIDE.tsx` | `Props` | Add `extraExtensions?: Extension[]` and `onEditorView?: (view: EditorView \| null) => void` (PR 11) |
| `components/SiteHeader/Drawer.tsx` (new) | `Props` | `{ open: boolean; onClose: () => void; }` (PR 2) |
| `components/SiteHeader/FloatingNav.tsx` (new) | — | No props; reads `usePathname()` (PR 7) |
| `components/SiteHeader/FlatHeader.tsx` (new) | `Props` | `{ onLesson: boolean; }` (PR 7) |
| `components/v2/CurriculumAccordion.tsx` (new) | `AccordionChapter` + `Props` | exported types — see PR 8 |
| `components/DidYouMean.tsx` (new) | — | No props (PR 10) |
| `lib/codemirror-blank-widget.ts` (new) | `BlankSpec`, `BlankState`, `BlankConfig` + `setBlankConfig` effect | exported (PR 11) |

### Build-time data freezing

- **PR 1:** uses existing `lib/generated/v2/manifest.toc.json` (no rebuild needed).
- **PR 8:** `CurriculumAccordion` is a server component reading from manifest; no new build step.
- **PR 11:** `scripts/build-content-v2.mjs` gains a fill-step validator; `scripts/migrate-fill-steps-v4.mjs` is a one-shot migration tool (not part of the build).

### Mobile drawer integration with V3 partial PR 6

V3's PR 6 was supposed to ship a mobile drawer; per the audit (`00-promptdojo-current-state.md` line 56), it never did. **PR 2 of V4 is that drawer.** PR 7's `FloatingNav` reuses the same `HeaderDrawer` component shipped in PR 2. There is no V3 partial-drawer file to merge with — PR 2 is greenfield.

---

## Rollback playbook

1. Identify the broken PR's squash commit on `main`: `git log --oneline | head`.
2. `git revert <sha>` (creates a fresh revert commit — preserves history; never `--hard reset`).
3. `git push origin main`.
4. Cloudflare Pages auto-redeploys the previous green build (~5 min).
5. Open a follow-up PR fixing the issue; never re-push the reverted PR without addressing the root cause.

For PR 11 specifically (the largest, riskiest): if the fill-blank widget breaks, the legacy in-prompt path is the fallback. The revert simply removes the IDE-widget rendering path; existing `___ID___` markers in `code` stay in place (they're invisible without the widget extension wired in). No content rollback needed.

---

## Risks I flagged but the CEO accepted

1. **PR 11 9h spillover into a 6th/7th evening.** CEO §11 explicitly accepts this with a clear truncate plan. If anything earlier slips, fill-blank's multi-blank Tab + theme states get cut to V4.5; the core widget still ships.

2. **Floating nav pill `border-radius: 0` instead of Cartesian's 50px.** Kit canon overrides Cartesian per `02-ui-design-cartesian-lift.md` line 22. CEO §7 confirms. Some readers may find sharp corners on a "floating" element jarring — the trade-off is brand consistency.

3. **Mobile lesson gate is a feature, not a bug.** PR 3 ships the honest "ship on desktop" message instead of trying to make Pyodide work on a 375px battery-bound device. CEO §3 explicitly chose option (b). A mobile-first reviewer may flag this; defend with the audit's pyodide-size argument.

4. **404 silently regresses Cartesian's behavior.** Cartesian rewrites all 404s to home; Promptdojo branded 404 + Levenshtein hint is the opposite move. CEO §10 confirms this is a brand win to preserve, not a regression to fix.

---

## Things explicitly NOT done (echo CEO's cuts)

These were tempting cross-cuts from the audit reports. Each is OUT per CEO:

- **Single-CTA hero promotion** (drop "or pick your chapter ↓"). OUT — touches hero structure.
- **Promote bug snippet to framed PNG.** OUT — hero structural.
- **Anti-feature litany on home PriceBand.** OUT on home; ships only on `/about` (PR 5). Home PriceBand stays as four-token horizontal strip (the cleanest single-frame meme).
- **Fat-numeral StatStrip display variant on home.** OUT — restructures home rhythm.
- **5-movement home collapse / `/about` consolidation into anchors.** OUT — hero-structural cascade. Routes stay multi-route.
- **`<Frame>` primitive applied to home concept cards.** OUT — V4.5.
- **`dojo-card-receipt` + spec strip on chapter tiles.** OUT — V4.5.
- **Step-through playback** (16h, the moat). OUT — V4.5.
- **Visualize panel** (10h). OUT — V4.5 (depends on playback).
- **TracebackView** (8h). OUT — V4.5.
- **Pyodide hairline cold-start progress** (8h). OUT — V4.5.
- **Trailer placement on /about.** OUT — V4.5.
- **Three-card "read / run / ship" pattern.** OUT — adds a section to home.
- **"Read Once. Run It. Don't Skim." block.** OUT — home-structural.
- **Founder byline in home footer.** OUT as a separate pick (the existing /about founder rewrite covers it via PR 5).

---

## Estimated total time

| # | PR | Hours | Cumulative |
|---|---|---|---|
| 1 | `refresh-v4/01-fix-398-leak` | 1.0 | 1.0 |
| 2 | `refresh-v4/02-modal-scrim-and-mobile-drawer` | 3.0 | 4.0 |
| 3 | `refresh-v4/03-mobile-editor-gate` | 1.5 | 5.5 |
| 4 | `refresh-v4/04-voice-and-system-sweep` | 2.5 | 8.0 |
| 5 | `refresh-v4/05-about-page-faq-founder-litany` | 3.0 | 11.0 |
| 6 | `refresh-v4/06-page-rhythm-cleanup` | 2.0 | 13.0 |
| 7 | `refresh-v4/07-floating-nav-pill` | 4.0 | 17.0 |
| 8 | `refresh-v4/08-curriculum-accordion` | 4.0 | 21.0 |
| 9 | `refresh-v4/09-onboarding-to-start` | 2.0 | 23.0 |
| 10 | `refresh-v4/10-404-and-preloader-polish` | 1.0 | 24.0 |
| 11 | `refresh-v4/11-fill-blank-widgets` | 10.0 | 34.0 |

**Reality check:** solo founder + Cloudflare Pages free-tier deploy cycle. Each PR is 1–4h focused work + 5min CF deploy + 5min smoke test = ~30min overhead per PR × 11 PRs = ~5.5h overhead. **Real wall-clock estimate: 24h + 10h + 5.5h = ~40h, or 5–7 evenings of 5–8h work.**

If the founder forces strict 25h, ship PRs 1–10 only (24h cumulative); roll PR 11 (fill-blank) into V4.5 alongside playback + visualize.

---

## Open questions for the CEO

None blocking. Two soft asks for clarification before PR 11:

1. **PR 11 trim authority:** if the founder explicitly wants the 25h ceiling enforced, confirm PR 11 defers to V4.5 entirely. The plan above assumes the founder accepts the 9h spill per CEO §11 recommendation.

2. **PR 9 `_redirects`:** confirm Cloudflare Pages is reading `public/_redirects` correctly post-build. If `output: "export"` doesn't copy it to `out/`, the PR adds a one-line postbuild script copying `public/_redirects` to `out/_redirects` in `package.json`. This is a 5-min check during PR 9 implementation, not a blocker.
