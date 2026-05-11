// POST /api/auth/request — send a magic-link sign-in email.
//
// Body: { email }
// Response: always 200 { ok: true } regardless of whether the email
// exists / was sent — prevents email-enumeration. Real failures are
// logged server-side.

import { sendEmail, type EmailEnv } from "../_lib/email";
import { normalizeEmail } from "../_lib/validate";
import { generateToken } from "../_lib/session";
import { safeReturnPath } from "../_lib/return-path";
import { ipFrom, isRateLimited, tooManyRequests } from "../_lib/rate-limit";

type AuthKV = {
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>;
};

type Env = EmailEnv & {
  AUTH_KV: AuthKV;
  SESSION_SECRET: string;
};

type Ctx = { request: Request; env: Env };

const TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const onRequestPost = async (ctx: Ctx): Promise<Response> => {
  // 5 magic-link requests per IP per minute. Stops link-bombing a target
  // inbox. Per audit-v6/code-review #4.
  const ip = ipFrom(ctx.request);
  if (isRateLimited(ip, "auth-request", { max: 5, windowMs: 60_000 })) {
    return tooManyRequests();
  }

  let body: { email?: unknown; next?: unknown };
  try {
    const parsed = (await ctx.request.json()) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return json({ ok: false, error: "invalid request" }, 400);
    }
    body = parsed as { email?: unknown; next?: unknown };
  } catch {
    return json({ ok: false, error: "invalid request" }, 400);
  }

  const email = normalizeEmail(body.email);
  if (!email) return json({ ok: false, error: "invalid email" }, 400);

  // Optional same-origin return path so verify can redirect the user
  // back to the lesson they were on. Per audit-v6/code-review #2.
  const next =
    typeof body.next === "string" ? safeReturnPath(body.next) : null;

  if (!ctx.env?.AUTH_KV || !ctx.env?.SESSION_SECRET) {
    console.error("[auth:request] AUTH_KV or SESSION_SECRET binding missing");
    return json({ ok: false, error: "auth not configured" }, 503);
  }

  const token = generateToken();
  await ctx.env.AUTH_KV.put(
    `auth:${token}`,
    JSON.stringify({ email, createdAt: Date.now(), next }),
    { expirationTtl: TOKEN_TTL_SECONDS },
  );

  const origin = new URL(ctx.request.url).origin;
  const link = `${origin}/api/auth/verify?token=${token}`;

  const result = await sendEmail(ctx.env, {
    to: email,
    subject: "your promptdojo sign-in link",
    text: [
      "click the link below to sign in to promptdojo:",
      "",
      link,
      "",
      "the link works once and expires in 15 minutes.",
      "if you didn't ask for this, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>click the link below to sign in to promptdojo:</p>
      <p><a href="${link}" style="color:#2aa06a;font-weight:bold">${link}</a></p>
      <p style="color:#666;font-size:13px">the link works once and expires in 15 minutes. if you didn't ask for this, you can ignore this email.</p>
    `,
  });

  if (!result.ok) {
    // Don't leak the failure to the client — log + return generic ok.
    console.error("[auth:request] email send failed:", result.error);
  }

  return json({ ok: true });
};
