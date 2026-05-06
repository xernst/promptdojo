// POST /api/subscribe — Cloudflare Pages Function.
// Forwards email subscription to Beehiiv's Public API v2 server-side
// so the BEEHIIV_API_KEY never ships to the client.
//
// Replaces the old `app/actions/subscribe.ts` server action, which
// doesn't run under `output: "export"` (static export).
//
// Env vars (set via wrangler / Cloudflare Pages dashboard):
//   BEEHIIV_API_KEY        — from beehiiv.com → Settings → API
//   BEEHIIV_PUBLICATION_ID — from beehiiv.com → Settings → Publication
//
// Until those are set, returns a clear "coming soon" status so the
// landing page form degrades gracefully.

type Env = {
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
};
type Ctx = { request: Request; env: Env };

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

export const onRequestPost = async (ctx: Ctx): Promise<Response> => {
  let body: { email?: string };
  try {
    body = (await ctx.request.json()) as { email?: string };
  } catch {
    return json({ ok: false, error: "invalid request" }, 400);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !VALID_EMAIL.test(email)) {
    return json({ ok: false, error: "enter a valid email" }, 400);
  }

  const apiKey = ctx.env.BEEHIIV_API_KEY;
  const publicationId = ctx.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    return json({
      ok: false,
      error: "subscription not configured yet — check back soon",
    });
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "promptdojo",
          utm_medium: "landing",
          referring_site: "promptdojo.dev",
        }),
      },
    );

    if (!res.ok) {
      return json({
        ok: false,
        error: "couldn't subscribe — try again in a moment",
      });
    }

    return json({
      ok: true,
      message: "you're in. check your inbox for the welcome.",
    });
  } catch {
    return json({ ok: false, error: "network hiccup — try again" });
  }
};
