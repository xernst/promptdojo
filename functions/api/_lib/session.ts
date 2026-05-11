// HMAC-signed session cookie. Web Crypto only (Cloudflare Workers
// runtime), no external deps. Format:
//
//   pd_session = base64url(payload) "." base64url(hmac)
//   payload    = JSON { email: string, iat: number, exp: number }
//   hmac       = HMAC-SHA256(SESSION_SECRET, base64url(payload))
//
// Tampering invalidates the HMAC. The cookie is HttpOnly + Secure +
// SameSite=Lax so it can't be read from JS and only ships over HTTPS.

export const SESSION_COOKIE = "pd_session";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Hard cap on cookie length before decoding. Real signed sessions are
// ~220 bytes; anything over 2 KB is a client error or an attempt to
// OOM atob() on the worker.
const MAX_COOKIE_BYTES = 2048;

// HMAC with a short secret is trivially forgeable. 32 chars is the
// minimum we accept; the in-browser generator produces 64.
const MIN_SECRET_CHARS = 32;

export type SessionPayload = {
  email: string;
  iat: number; // issued-at, unix seconds
  exp: number; // expires-at, unix seconds
};

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlEncode(bytes: Uint8Array | ArrayBuffer): string {
  const bin = String.fromCharCode(
    ...new Uint8Array(bytes instanceof ArrayBuffer ? bytes : bytes.buffer),
  );
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64urlEncode(sig);
}

async function hmacVerify(
  secret: string,
  data: string,
  sigB64: string,
): Promise<boolean> {
  const key = await importHmacKey(secret);
  return crypto.subtle.verify("HMAC", key, b64urlDecode(sigB64), enc.encode(data));
}

export async function signSession(
  email: string,
  secret: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { email, iat: now, exp: now + ttlSeconds };
  const payloadB64 = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const sig = await hmac(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifySession(
  cookieValue: string | null | undefined,
  secret: string,
): Promise<SessionPayload | null> {
  // Hard-fail safe: any throw inside this function returns null instead
  // of bubbling 500 to /api/save, /api/load, /api/auth/session.
  // Per audit-v6/code-review #3.
  try {
    if (!cookieValue) return null;
    if (cookieValue.length > MAX_COOKIE_BYTES) return null;
    if (!secret || secret.length < MIN_SECRET_CHARS) return null;
    const parts = cookieValue.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, sig] = parts;
    const ok = await hmacVerify(secret, payloadB64, sig);
    if (!ok) return null;
    let payload: SessionPayload;
    try {
      payload = JSON.parse(dec.decode(b64urlDecode(payloadB64))) as SessionPayload;
    } catch {
      return null;
    }
    if (
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function readSessionCookie(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === SESSION_COOKIE) return rest.join("=");
  }
  return null;
}

export function buildSessionCookie(
  value: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): string {
  return [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${ttlSeconds}`,
  ].join("; ");
}

export function buildClearCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
