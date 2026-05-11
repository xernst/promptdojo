"use client";

// LoginToSave — magic-link sign-in.
//
// Replaces the prior "type your email and we trust you" model (audit-v5
// critical). Flow:
//
//   1. User clicks "save your spot" → modal with email input.
//   2. Submit → POST /api/auth/request → server sends a magic link.
//   3. UI shows "check your email" and closes after a beat.
//   4. User clicks link in inbox → /api/auth/verify sets HMAC cookie
//      and redirects to /?signed-in=1.
//   5. On the next page load, GET /api/auth/session returns { email }
//      and the header pill flips to "saved as <email>".
//
// Auto-sync: while signed in, every progress change debounces a POST
// to /api/save. Email is taken from the session cookie server-side.

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  PROGRESS_EVENT_V2 as PROGRESS_EVENT,
  PROGRESS_KEY_V2 as PROGRESS_KEY,
} from "@/lib/storage";

const SYNC_DEBOUNCE_MS = 1500;

type Status =
  | "idle"
  | "checking-session"
  | "requesting"
  | "link-sent"
  | "logged-in"
  | "error";

function readProgress(): unknown {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROGRESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeProgress(payload: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

function countSteps(payload: unknown): number {
  if (!payload || typeof payload !== "object") return 0;
  const obj = payload as {
    lessons?: Record<string, unknown>;
    steps?: Record<string, unknown>;
  };
  return (
    (obj.lessons ? Object.keys(obj.lessons).length : 0) +
    (obj.steps ? Object.keys(obj.steps).length : 0)
  );
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

async function fetchSession(): Promise<string | null> {
  try {
    const r = await fetch("/api/auth/session", { credentials: "same-origin" });
    if (!r.ok) return null;
    const data = (await r.json()) as { email?: string };
    return data.email ?? null;
  } catch {
    return null;
  }
}

async function postSave(payload: unknown): Promise<boolean> {
  try {
    const r = await fetch("/api/save", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function fetchLoad(): Promise<unknown | null> {
  try {
    const r = await fetch("/api/load", { credentials: "same-origin" });
    if (!r.ok) return null;
    const data = (await r.json()) as { payload?: unknown };
    return data.payload ?? null;
  } catch {
    return null;
  }
}

async function postLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    /* network errors don't block client-side logout */
  }
}

async function postRequestLink(email: string): Promise<boolean> {
  try {
    // Send the current path so /api/auth/verify can redirect the user
    // back to the lesson they were on instead of dumping them on /.
    // Per audit-v6/code-review #2.
    const next =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search + window.location.hash
        : null;
    const r = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, next }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export default function LoginToSave() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("checking-session");
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // On mount: check whether the cookie is valid. If we just returned
  // from the magic-link redirect (?signed-in=1), also pull remote
  // progress and merge.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const sessionEmail = await fetchSession();
      if (cancelled) return;
      if (sessionEmail) {
        setEmail(sessionEmail);
        setStatus("logged-in");
        // Just-signed-in branch. Three cases:
        //   1. local empty, remote exists → take remote (return user)
        //   2. local non-empty, remote empty → push local (first save)
        //   3. BOTH non-empty → prefer whichever has MORE step progress.
        //      audit-v6/code-review #1: prior logic ("push local if non-empty")
        //      could clobber the other device's months of progress when a
        //      user signed in on a new laptop after clicking around as a guest.
        //      Real fix is per-step lastModified merge; this is the safe stopgap.
        const params = new URLSearchParams(window.location.search);
        if (params.get("signed-in") === "1") {
          const local = readProgress();
          const remote = await fetchLoad();
          if (cancelled) return;
          const localCount = countSteps(local);
          const remoteCount = countSteps(remote);
          if (remoteCount > localCount) {
            if (remote) writeProgress(remote);
          } else if (localCount > 0) {
            void postSave(local);
          }
          // Strip the marker so reload doesn't re-run the merge.
          params.delete("signed-in");
          const qs = params.toString();
          const newUrl =
            window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
          window.history.replaceState({}, "", newUrl);
        }
      } else {
        setStatus("idle");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Esc + tab-trap inside the modal.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const enabled = Array.from(focusable).filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (enabled.length === 0) return;
      const first = enabled[0];
      const last = enabled[enabled.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeModal]);

  // Auto-sync local progress to KV while signed in.
  useEffect(() => {
    if (status !== "logged-in") return;
    const handler = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const payload = readProgress();
        if (payload) void postSave(payload);
      }, SYNC_DEBOUNCE_MS);
    };
    window.addEventListener(PROGRESS_EVENT, handler);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, handler);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [status]);

  const handleRequestLink = useCallback(async () => {
    const trimmed = input.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      setError("that doesn't look like an email");
      setStatus("error");
      return;
    }
    setError(null);
    setStatus("requesting");
    const ok = await postRequestLink(trimmed);
    if (!ok) {
      setError("couldn't send the link. try again in a sec.");
      setStatus("error");
      return;
    }
    setStatus("link-sent");
  }, [input]);

  const handleLogout = useCallback(async () => {
    await postLogout();
    setEmail(null);
    setStatus("idle");
    setOpen(false);
    setInput("");
  }, []);

  const buttonLabel =
    status === "logged-in" && email
      ? `[ saved as ${email} ]`
      : "[ save your spot ]";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen(true);
          setInput("");
          setError(null);
          if (status !== "logged-in") setStatus("idle");
        }}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition",
          status === "logged-in"
            ? "border border-green-700/50 bg-green-950/40 text-green-400 hover:border-green-500 hover:text-green-300"
            : "text-ink-500 hover:text-green-400",
        )}
        aria-label={
          status === "logged-in"
            ? "manage saved session"
            : "save your progress"
        }
      >
        {buttonLabel}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lts-title"
          aria-describedby="lts-desc"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/70 px-4 pt-24 pb-12 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            ref={panelRef}
            className="w-full max-w-md border border-ink-800 bg-ink-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-baseline justify-between">
              <h2
                id="lts-title"
                className="font-display text-2xl font-black tracking-tight text-ink-100"
              >
                {status === "logged-in" ? "you're signed in" : "save your spot"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="font-mono text-xs text-ink-500 hover:text-ink-300"
                aria-label="close"
              >
                [ esc ]
              </button>
            </div>

            {status === "logged-in" && email ? (
              <>
                <p
                  id="lts-desc"
                  className="mb-5 font-display text-sm leading-relaxed text-ink-400"
                >
                  signed in as{" "}
                  <span className="font-mono text-green-400">{email}</span>.
                  your progress syncs to this email automatically. open the
                  same dojo on another device by signing in there too.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-mono text-xs text-ink-500 hover:text-rose-400"
                >
                  sign out on this device
                </button>
              </>
            ) : status === "link-sent" ? (
              <>
                <p
                  id="lts-desc"
                  className="mb-5 font-display text-sm leading-relaxed text-ink-400"
                >
                  ✉ check your inbox. we sent a one-time sign-in link.
                  it expires in 15 minutes. click it to save your spot.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="border border-green-500 bg-green-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink-950 transition hover:bg-green-400"
                >
                  got it
                </button>
              </>
            ) : (
              <>
                <p
                  id="lts-desc"
                  className="mb-5 font-display text-sm leading-relaxed text-ink-400"
                >
                  type your email — we&apos;ll send a one-time sign-in link.
                  no password to remember. your progress syncs across devices.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleRequestLink();
                  }}
                  className="space-y-3"
                >
                  <label htmlFor="lts-email" className="sr-only">
                    your email
                  </label>
                  <input
                    id="lts-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@somewhere.dev"
                    aria-describedby="lts-desc"
                    aria-invalid={status === "error" ? "true" : undefined}
                    aria-errormessage={
                      status === "error" ? "lts-error" : undefined
                    }
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (status === "error") {
                        setError(null);
                        setStatus("idle");
                      }
                    }}
                    disabled={status === "requesting"}
                    className="w-full border border-ink-800 bg-ink-950 px-3 py-2 font-mono text-sm text-ink-100 placeholder:text-ink-600 focus:border-green-500 focus:outline-none"
                  />

                  {error ? (
                    <p
                      id="lts-error"
                      role="alert"
                      className="font-mono text-xs text-rose-400"
                    >
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={status === "requesting" || !input.trim()}
                    className="border border-green-500 bg-green-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "requesting" ? "sending..." : "send link"}
                  </button>
                </form>

                <p className="mt-5 border-t border-ink-800 pt-4 font-mono text-[10px] leading-relaxed text-ink-500">
                  ❯ no password. magic-link only. anyone with access to your
                  inbox can sign in — same as any newsletter.
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
