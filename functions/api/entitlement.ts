// POST /api/entitlement — RevenueCat webhook receiver (Cloudflare Pages Function).
// RevenueCat POSTs subscription lifecycle events here; we verify the shared
// secret in `Authorization: Bearer ${REVENUECAT_WEBHOOK_SECRET}` (constant-time
// HMAC-SHA256 compare per RC's documented pattern), dedupe on `event.id` with
// a 7-day TTL guard, derive the resulting tier from the event type +
// product_id, and persist `entitlement:${app_user_id}` to Cloudflare KV.
// Returns 200 `{ ok: true }` on success, 401 on bad signature, 400 on bad body.

type KV = {
  get: (key: string) => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>;
};

type Env = {
  PROGRESS_KV: KV;
  REVENUECAT_WEBHOOK_SECRET?: string;
};
type Ctx = { request: Request; env: Env };

// RevenueCat webhook event types we handle. Anything else is acknowledged
// with 200 (idempotent no-op) so RC doesn't retry — we don't want to be
// the source of webhook backpressure on event types we don't care about
// (TRANSFER, NON_RENEWING_PURCHASE, SUBSCRIPTION_PAUSED, etc.).
const HANDLED_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "CANCELLATION",
  "EXPIRATION",
  "BILLING_ISSUE",
  "PRODUCT_CHANGE",
]);

// Product to tier mapping. Source of truth lives in RevenueCat dashboard
// under Products; these IDs are configured per plan.md Phase 3 step 1.
const PRODUCT_TO_TIER: Record<string, Tier> = {
  pdo_pro_monthly: "pro_monthly",
  pdo_pro_annual: "pro_annual",
  pdo_pro_lifetime: "lifetime",
};

type Tier = "pro_monthly" | "pro_annual" | "lifetime" | "free";

type EntitlementRecord = {
  tier: Tier;
  expiresAt?: string; // ISO8601
  productId: string;
  updatedAt: string; // ISO8601
};

// Subset of RevenueCat's webhook payload shape we depend on. RC sends
// additional fields (app_id, environment, etc.) which we ignore.
// https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
type RcEvent = {
  id?: string;
  type?: string;
  app_user_id?: string;
  product_id?: string;
  // Unix milliseconds. RENEWAL/INITIAL_PURCHASE set this; CANCELLATION leaves
  // it on the existing period end; EXPIRATION marks the past expiry.
  expiration_at_ms?: number | null;
};

type RcWebhookBody = {
  event?: RcEvent;
  api_version?: string;
};

// 7 days in seconds — bounds the dedupe window. RC retries failed
// webhooks with exponential backoff for up to ~3 days, so 7 gives a
// comfortable margin. KV expiration ttl floor is 60s.
const DEDUPE_TTL_SECONDS = 60 * 60 * 24 * 7;

const enc = new TextEncoder();

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

// Constant-time string compare so a leaked secret can't be byte-guessed
// via response-timing analysis. HMAC BOTH sides under the same key, then
// byte-compare the digests in constant time. Prior version only HMACed
// `a` then `verify`d against `b` plaintext — leaked length info through
// the encode step. Fixed per launch-week security audit 2026-05-11.
async function constantTimeEquals(a: string, b: string): Promise<boolean> {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode("revenuecat-bearer-compare"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, enc.encode(a)),
    crypto.subtle.sign("HMAC", key, enc.encode(b)),
  ]);
  const va = new Uint8Array(sigA);
  const vb = new Uint8Array(sigB);
  if (va.length !== vb.length) return false;
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

function readBearer(header: string | null): string | null {
  if (!header) return null;
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  return m ? m[1].trim() : null;
}

function deriveTier(event: RcEvent): { tier: Tier; productId: string } {
  const productId = event.product_id ?? "";
  const mapped = PRODUCT_TO_TIER[productId];

  switch (event.type) {
    // Active subscription states — the user just got (or kept) access.
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
      return { tier: mapped ?? "free", productId };

    // CANCELLATION = user turned off auto-renew. They KEEP access until
    // the period ends (RC fires EXPIRATION at that point). So we leave
    // the tier as the active product — don't downgrade now.
    case "CANCELLATION":
      return { tier: mapped ?? "free", productId };

    // Terminal states that revoke access.
    case "EXPIRATION":
    case "BILLING_ISSUE":
      return { tier: "free", productId };

    default:
      // Unknown event type — caller already filtered, but defense in depth.
      return { tier: "free", productId };
  }
}

export const onRequestPost = async (ctx: Ctx): Promise<Response> => {
  if (!ctx.env?.PROGRESS_KV || !ctx.env?.REVENUECAT_WEBHOOK_SECRET) {
    // 503 (not 401) so RC's retry logic kicks in — this is a server
    // misconfig, not an auth failure on the sender's side.
    return json({ ok: false, error: "service not configured" }, 503);
  }

  // 1. Auth
  const bearer = readBearer(ctx.request.headers.get("authorization"));
  if (!bearer) {
    return json({ ok: false, error: "missing signature" }, 401);
  }
  const authOk = await constantTimeEquals(
    bearer,
    ctx.env.REVENUECAT_WEBHOOK_SECRET,
  );
  if (!authOk) {
    return json({ ok: false, error: "invalid signature" }, 401);
  }

  // 2. Parse body
  let body: RcWebhookBody;
  try {
    body = (await ctx.request.json()) as RcWebhookBody;
  } catch {
    return json({ ok: false, error: "invalid json" }, 400);
  }

  const event = body?.event;
  if (
    !event ||
    typeof event.id !== "string" ||
    typeof event.type !== "string" ||
    typeof event.app_user_id !== "string" ||
    !event.id ||
    !event.app_user_id
  ) {
    return json({ ok: false, error: "malformed event" }, 400);
  }

  // 3. Idempotency check
  // RC retries on non-2xx, so seeing the same event.id twice is normal.
  // Mark-then-process leaves a tiny race where two concurrent webhook
  // deliveries could both pass the check; that's acceptable because the
  // KV write that follows is idempotent (same event yields same tier).
  const seenKey = `seen-event:${event.id}`;
  const alreadySeen = await ctx.env.PROGRESS_KV.get(seenKey);
  if (alreadySeen) {
    return json({ ok: true, deduped: true });
  }

  // 4. Skip unsupported event types early (still ack 200 so RC stops retrying)
  if (!HANDLED_EVENT_TYPES.has(event.type)) {
    await ctx.env.PROGRESS_KV.put(seenKey, "1", {
      expirationTtl: DEDUPE_TTL_SECONDS,
    });
    return json({ ok: true, ignored: event.type });
  }

  // 5. Derive tier + write entitlement
  const { tier, productId } = deriveTier(event);

  const record: EntitlementRecord = {
    tier,
    productId,
    updatedAt: new Date().toISOString(),
  };
  if (
    typeof event.expiration_at_ms === "number" &&
    Number.isFinite(event.expiration_at_ms) &&
    event.expiration_at_ms > 0
  ) {
    record.expiresAt = new Date(event.expiration_at_ms).toISOString();
  }

  const entitlementKey = `entitlement:${event.app_user_id}`;

  try {
    // Order matters: write the entitlement FIRST, then the dedupe marker.
    // If the entitlement write fails, RC retries and we re-attempt; if
    // we wrote the dedupe marker first and then crashed, the retry would
    // be silently skipped and the user's tier would be stale.
    await ctx.env.PROGRESS_KV.put(entitlementKey, JSON.stringify(record));
    await ctx.env.PROGRESS_KV.put(seenKey, "1", {
      expirationTtl: DEDUPE_TTL_SECONDS,
    });
  } catch (err) {
    console.error(
      "[entitlement] KV write failed",
      event.id,
      event.app_user_id,
      String(err),
    );
    // 500 so RC retries — we don't want to ack-and-drop a tier update.
    return json({ ok: false, error: "kv write failed" }, 500);
  }

  return json({ ok: true });
};
