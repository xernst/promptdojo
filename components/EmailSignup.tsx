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
      setState(data ?? { ok: false, error: "network failed. try again." });
    } catch {
      setState({ ok: false, error: "network failed. try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="my-24 flex flex-col items-center border-y border-ink-800 py-16 text-center">
      <div className="t-eyebrow tracking-[0.4em]">the bugs ai shipped this week</div>
      <h2 className="t-h2 mt-4 max-w-2xl text-ink-100">
        a weekly post-mortem of what cursor and claude got wrong
      </h2>
      <p className="t-body-sm mt-4 max-w-xl text-ink-400">
        one email a week. new chapters, the bugs ai shipped, the threads.
        unsubscribe in one click.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-10 flex w-full max-w-md flex-col gap-3 text-left sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="email-signup-input"
            className="mb-1 block font-mono text-[10px] uppercase tracking-[0.3em] text-ink-300"
          >
            email
          </label>
          <input
            id="email-signup-input"
            type="email"
            name="email"
            required
            autoComplete="email"
            aria-describedby="email-signup-message"
            aria-invalid={state?.ok === false}
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending || state?.ok === true}
            className="w-full rounded-md border border-ink-700 bg-ink-950 px-4 py-3 text-ink-100 placeholder:text-ink-600 focus:border-green-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={pending || state?.ok === true}
          className="dojo-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "sending…" : state?.ok ? "subscribed" : "send me the bugs"}
        </button>
      </form>

      <div id="email-signup-message" className="mt-4 min-h-6 t-mono-meta" aria-live="polite">
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
