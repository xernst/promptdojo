// GET /api/auth/session — returns { ok, email? } describing the current
// session. Anonymous visitors get a 200 with { ok: false, anonymous: true }
// rather than a 401 because the browser flags every 401 in the DevTools
// console even when it's the expected "no session yet" path. The 401
// noised up the console on every page load for every anonymous user
// (QA report 2026-05-12). Real failures (missing secret) still 503.

import { readSessionCookie, verifySession } from "../_lib/session";

type Env = { SESSION_SECRET: string };
type Ctx = { request: Request; env: Env };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  if (!ctx.env?.SESSION_SECRET) {
    return json({ ok: false, error: "auth not configured" }, 503);
  }
  const cookie = readSessionCookie(ctx.request);
  const session = await verifySession(cookie, ctx.env.SESSION_SECRET);
  if (!session) return json({ ok: false, anonymous: true }, 200);
  return json({ ok: true, email: session.email });
};
