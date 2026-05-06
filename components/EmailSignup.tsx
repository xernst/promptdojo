"use client";

// Email signup form for the landing page. POSTs to /api/subscribe
// (Cloudflare Pages Function); BEEHIIV_API_KEY stays server-side.
//
// Replaces the prior server-action implementation, which doesn't work
// under `output: "export"`.

import { useState } from "react";

type SubscribeResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SubscribeResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => null)) as SubscribeResult | null;
      setState(data ?? { ok: false, error: "network hiccup — try again" });
    } catch {
      setState({ ok: false, error: "network hiccup — try again" });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="my-24 flex flex-col items-center border-y border-ink-800 py-16 text-center">
      <div className="t-eyebrow tracking-[0.4em]">stay in the loop</div>
      <h2 className="t-h2 mt-4 max-w-2xl text-ink-100">
        new chapters, the x-thread version of every lesson, the bugs ai shipped
        this week
      </h2>
      <p className="t-body-sm mt-4 max-w-xl text-ink-400">
        no spam, no upsell. one email when there&apos;s something worth reading.
        unsubscribe in one click.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          aria-label="email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending || state?.ok === true}
          className="flex-1 rounded-md border border-ink-700 bg-ink-950 px-4 py-3 text-ink-100 placeholder:text-ink-600 focus:border-green-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || state?.ok === true}
          className="dojo-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "subscribing…" : state?.ok ? "subscribed ✓" : "subscribe"}
        </button>
      </form>

      <div className="mt-4 min-h-6 t-mono-meta" aria-live="polite">
        {state?.ok === false && (
          <span className="text-red-400">{state.error}</span>
        )}
        {state?.ok === true && (
          <span className="text-green-500">{state.message}</span>
        )}
      </div>
    </section>
  );
}
