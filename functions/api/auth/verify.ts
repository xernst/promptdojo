// GET /api/auth/verify?token=... — consume a magic-link token, set the
// session cookie, redirect home.
//
// Tokens are single-use (deleted from KV after consumption) and TTL'd
// to 15 minutes by /api/auth/request.

import {
  buildSessionCookie,
  signSession,
} from "../_lib/session";
import { safeReturnPath } from "../_lib/return-path";

type AuthKV = {
  get: (key: string) => Promise<string | null>;
  delete: (key: string) => Promise<void>;
};

type Env = {
  AUTH_KV: AuthKV;
  SESSION_SECRET: string;
};

type Ctx = { request: Request; env: Env };

function htmlError(message: string, status = 400): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>sign-in failed</title>
    <body style="font:14px/1.5 ui-monospace,monospace;background:#14140f;color:#fafaf7;padding:48px">
    <h1 style="color:#2aa06a;margin:0 0 12px">sign-in failed</h1>
    <p>${message}</p>
    <p><a href="/" style="color:#2aa06a">← back home</a></p>
    </body>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  );
}

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  const url = new URL(ctx.request.url);
  const token = url.searchParams.get("token");

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return htmlError("invalid sign-in link.", 400);
  }
  if (!ctx.env?.AUTH_KV || !ctx.env?.SESSION_SECRET) {
    console.error("[auth:verify] AUTH_KV or SESSION_SECRET binding missing");
    return htmlError("auth is not configured on this deploy.", 503);
  }

  const raw = await ctx.env.AUTH_KV.get(`auth:${token}`);
  if (!raw) {
    return htmlError(
      "this link is expired or already used. request a new one.",
      410,
    );
  }

  // Single-use — delete BEFORE we evaluate the payload. A malformed
  // entry still gets cleared so an attacker can't keep probing the
  // same key during its TTL window. KV TTL is the backstop if delete
  // fails — log and continue so a flaky KV doesn't 500 the sign-in.
  try {
    await ctx.env.AUTH_KV.delete(`auth:${token}`);
  } catch (err) {
    console.warn("[auth:verify] AUTH_KV.delete failed (TTL is backstop):", err);
  }

  let parsed: { email?: string; next?: string | null };
  try {
    parsed = JSON.parse(raw) as { email?: string; next?: string | null };
  } catch {
    return htmlError("malformed token.", 500);
  }
  const email = parsed.email;
  if (!email) return htmlError("malformed token.", 500);

  const cookieValue = await signSession(email, ctx.env.SESSION_SECRET);

  // Honor the validated `next` path so the user lands back on the
  // lesson they were on, not the home page. Per audit-v6/code-review #2.
  const safeNext = safeReturnPath(parsed.next ?? null);
  const location = safeNext
    ? `${safeNext}${safeNext.includes("?") ? "&" : "?"}signed-in=1`
    : "/?signed-in=1";

  return new Response(null, {
    status: 302,
    headers: {
      location,
      "set-cookie": buildSessionCookie(cookieValue),
      "cache-control": "no-store",
    },
  });
};
