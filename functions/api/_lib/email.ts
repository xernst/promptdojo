// Send transactional email via Resend.
//
// If RESEND_API_KEY is not set, falls back to console.log so dev /
// pre-launch flows still work without an account. The console-log path
// returns ok=true so the user-facing flow doesn't error — they just
// won't receive the email until the key is configured.
//
// Resend API: https://resend.com/docs/api-reference/emails/send-email

export type EmailEnv = {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
};

export type EmailResult = { ok: true } | { ok: false; error: string };

const DEFAULT_FROM = "promptdojo <onboarding@resend.dev>";

export async function sendEmail(
  env: EmailEnv,
  args: { to: string; subject: string; text: string; html?: string },
): Promise<EmailResult> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;

  if (!apiKey) {
    // Stub mode: log only the envelope, never the body. The body
    // contains the magic-link URL — if this is deployed without
    // RESEND_API_KEY by accident, we don't want live tokens persisted
    // in Cloudflare's log drain.
    console.log("[email:stub] no RESEND_API_KEY set —", {
      to: args.to,
      subject: args.subject,
    });
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        text: args.text,
        html: args.html,
      }),
      // Cap the upstream call so a hung Resend doesn't burn the
      // function's 30s budget while the user waits for "ok".
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] resend rejected", res.status, body);
      return { ok: false, error: "email service unavailable" };
    }
    return { ok: true };
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
    console.error("[email] network error", isTimeout ? "timeout" : err);
    return {
      ok: false,
      error: isTimeout ? "email service timed out" : "network error sending email",
    };
  }
}
