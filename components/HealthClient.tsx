"use client";

import { useEffect, useState } from "react";

type ServiceState = "ok" | "missing" | "degraded";

type HealthPayload = {
  ok: boolean;
  generatedAt: string;
  services: {
    auth: { state: ServiceState; sessionSecret: boolean; authKv: ServiceState };
    progress: { state: ServiceState; progressKv: ServiceState };
    email: { state: ServiceState; resend: boolean };
    newsletter: {
      state: ServiceState;
      beehiivPublication: boolean;
      beehiivApi: boolean;
    };
  };
  notes: string[];
};

type FetchState =
  | { kind: "loading" }
  | { kind: "ok"; data: HealthPayload }
  | { kind: "err"; message: string };

const STATE_LABEL: Record<ServiceState, string> = {
  ok: "live",
  degraded: "partial",
  missing: "unwired",
};

const STATE_COLOR: Record<ServiceState, string> = {
  ok: "bg-green-500/15 text-green-400 ring-green-500/30",
  degraded: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  missing: "bg-ink-700/40 text-ink-300 ring-ink-600/30",
};

function StatusPill({ state }: { state: ServiceState }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide ring-1 ${STATE_COLOR[state]}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          state === "ok"
            ? "bg-green-400"
            : state === "degraded"
              ? "bg-amber-400"
              : "bg-ink-400"
        }`}
      />
      {STATE_LABEL[state]}
    </span>
  );
}

function ServiceRow({
  name,
  state,
  rows,
}: {
  name: string;
  state: ServiceState;
  rows: { k: string; v: ServiceState | boolean }[];
}) {
  return (
    <div className="dojo-card">
      <div className="flex items-center justify-between">
        <div className="t-mono-meta">{name}</div>
        <StatusPill state={state} />
      </div>
      <dl className="mt-3 grid gap-1.5 text-[13px] text-ink-300">
        {rows.map((r) => {
          const value =
            typeof r.v === "boolean"
              ? r.v
                ? "set"
                : "unset"
              : STATE_LABEL[r.v];
          return (
            <div key={r.k} className="flex items-center justify-between gap-3">
              <dt className="text-ink-500">{r.k}</dt>
              <dd className="font-mono text-ink-200">{value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default function HealthClient() {
  const [state, setState] = useState<FetchState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`http ${res.status}`);
        return (await res.json()) as HealthPayload;
      })
      .then((data) => {
        if (cancelled) return;
        setState({ kind: "ok", data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "unknown error";
        setState({ kind: "err", message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="loading system status"
        className="mt-10 grid gap-3 sm:grid-cols-2"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-md bg-ink-900/60 ring-1 ring-ink-800"
          />
        ))}
      </div>
    );
  }

  if (state.kind === "err") {
    return (
      <div className="mt-10 dojo-card border border-amber-500/30 bg-amber-500/5">
        <div className="t-mono-meta text-amber-300">/api/health unreachable</div>
        <p className="mt-2 text-[13px] text-ink-300">
          either the function isn&apos;t deployed yet or the network is in the way.
          the static site is fine. the dynamic surface is what this page measures.
        </p>
        <p className="mt-2 font-mono text-[11px] text-ink-500">{state.message}</p>
      </div>
    );
  }

  const { data } = state;
  const generated = new Date(data.generatedAt);

  return (
    <>
      <div className="mt-8 flex items-center gap-3">
        <StatusPill state={data.ok ? "ok" : "degraded"} />
        <span className="font-mono text-[11px] text-ink-400">
          checked {generated.toLocaleTimeString()} · {generated.toLocaleDateString()}
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ServiceRow
          name="auth · magic link"
          state={data.services.auth.state}
          rows={[
            { k: "SESSION_SECRET", v: data.services.auth.sessionSecret },
            { k: "AUTH_KV", v: data.services.auth.authKv },
          ]}
        />
        <ServiceRow
          name="progress · save / load"
          state={data.services.progress.state}
          rows={[
            { k: "PROGRESS_KV", v: data.services.progress.progressKv },
          ]}
        />
        <ServiceRow
          name="email · resend"
          state={data.services.email.state}
          rows={[{ k: "RESEND_API_KEY", v: data.services.email.resend }]}
        />
        <ServiceRow
          name="newsletter · beehiiv"
          state={data.services.newsletter.state}
          rows={[
            { k: "BEEHIIV_PUBLICATION_ID", v: data.services.newsletter.beehiivPublication },
            { k: "BEEHIIV_API_KEY", v: data.services.newsletter.beehiivApi },
          ]}
        />
      </div>
      {data.notes.length > 0 && (
        <div className="mt-8 rounded-md border border-ink-800 bg-ink-900/40 p-4">
          <div className="t-mono-meta text-ink-400">notes</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-ink-300">
            {data.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="t-body-sm mt-8 text-ink-500">
        source · <code>functions/api/health.ts</code> · the function never emits
        secret values, only booleans for presence.
      </p>
    </>
  );
}
