"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  PROGRESS_EVENT_V2 as PROGRESS_EVENT,
  PROGRESS_KEY_V2 as PROGRESS_KEY,
} from "@/lib/storage";

const EMAIL_KEY = "promptdojo:save-email";
const SYNC_DEBOUNCE_MS = 1500;

type Status = "idle" | "saving" | "loading" | "saved" | "loaded" | "error";

function readEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_KEY);
}

function writeEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) window.localStorage.setItem(EMAIL_KEY, email);
  else window.localStorage.removeItem(EMAIL_KEY);
}

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

function isProgressEmpty(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return true;
  const obj = payload as {
    lessons?: Record<string, unknown>;
    steps?: Record<string, unknown>;
  };
  const lessonCount = obj.lessons ? Object.keys(obj.lessons).length : 0;
  const stepCount = obj.steps ? Object.keys(obj.steps).length : 0;
  return lessonCount === 0 && stepCount === 0;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

async function postSave(email: string, payload: unknown): Promise<boolean> {
  try {
    const r = await fetch("/api/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, payload }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function fetchLoad(email: string): Promise<unknown | null> {
  try {
    const r = await fetch(`/api/load?email=${encodeURIComponent(email)}`);
    if (!r.ok) return null;
    const data = (await r.json()) as { payload?: unknown };
    return data.payload ?? null;
  } catch {
    return null;
  }
}

export default function LoginToSave() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    setOpen(false);
    // Return focus to the trigger when the dialog closes — WCAG 2.4.3.
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    setEmail(readEmail());
  }, []);

  // Escape closes; Tab cycles within the dialog (focus trap).
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

  // Auto-sync on progress change when logged in.
  useEffect(() => {
    if (!email) return;
    const handler = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const payload = readProgress();
        if (payload) void postSave(email, payload);
      }, SYNC_DEBOUNCE_MS);
    };
    window.addEventListener(PROGRESS_EVENT, handler);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, handler);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email]);

  const handleLogin = useCallback(async () => {
    const trimmed = input.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      setError("that doesn't look like an email");
      setStatus("error");
      return;
    }
    setError(null);

    const localProgress = readProgress();
    const localEmpty = isProgressEmpty(localProgress);

    if (localEmpty) {
      setStatus("loading");
      const remote = await fetchLoad(trimmed);
      if (remote) writeProgress(remote);
      writeEmail(trimmed);
      setEmail(trimmed);
      setStatus("loaded");
      setTimeout(() => setOpen(false), 900);
    } else {
      setStatus("saving");
      const ok = await postSave(trimmed, localProgress);
      if (!ok) {
        setError("couldn't reach the server. try again in a sec.");
        setStatus("error");
        return;
      }
      writeEmail(trimmed);
      setEmail(trimmed);
      setStatus("saved");
      setTimeout(() => setOpen(false), 900);
    }
  }, [input]);

  const handleForget = useCallback(() => {
    writeEmail(null);
    setEmail(null);
    setOpen(false);
    setInput("");
    setStatus("idle");
    setError(null);
  }, []);

  const buttonLabel = email ? `[ saved as ${email} ]` : "[ login to save ]";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen(true);
          setInput(email ?? "");
          setStatus("idle");
          setError(null);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition",
          email
            ? "border border-green-700/50 bg-green-950/40 text-green-400 hover:border-green-500 hover:text-green-300"
            : "text-ink-500 hover:text-green-400",
        )}
        aria-label={email ? "manage saved email" : "login to save progress"}
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
                login to save
              </h2>
              <button
                onClick={closeModal}
                className="font-mono text-xs text-ink-500 hover:text-ink-300"
                aria-label="close"
              >
                [ esc ]
              </button>
            </div>

            <p
              id="lts-desc"
              className="mb-5 font-display text-sm leading-relaxed text-ink-400"
            >
              type your email. we sync your progress across devices. no
              password. no spam. same email anywhere else, same dojo.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleLogin();
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
                aria-errormessage={status === "error" ? "lts-error" : undefined}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (status === "error") {
                    setError(null);
                    setStatus("idle");
                  }
                }}
                disabled={status === "saving" || status === "loading"}
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

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={
                    status === "saving" ||
                    status === "loading" ||
                    !input.trim()
                  }
                  className="border border-green-500 bg-green-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "saving"
                    ? "saving..."
                    : status === "loading"
                      ? "loading..."
                      : status === "saved"
                        ? "saved"
                        : status === "loaded"
                          ? "loaded"
                          : "save"}
                </button>

                {email ? (
                  <button
                    type="button"
                    onClick={handleForget}
                    className="font-mono text-xs text-ink-500 hover:text-rose-400"
                  >
                    forget my email on this device
                  </button>
                ) : null}
              </div>
            </form>

            <p className="mt-5 border-t border-ink-800 pt-4 font-mono text-[10px] leading-relaxed text-ink-500">
              ❯ no account, no auth. anyone with your email can load your
              progress. don&apos;t use a shared mailbox if that bothers you.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
