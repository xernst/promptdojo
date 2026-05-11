// GET /api/health — public-safe service status.
//
// Returns a JSON snapshot of which integrations are wired up at runtime.
// Only emits booleans for env-var presence (never the values) and probes
// each KV namespace with a no-op read. Safe to link publicly — there's
// nothing here a curl on the open internet couldn't already infer from
// behaviour.

type KV = {
  get(key: string): Promise<string | null>;
};

type Env = {
  SESSION_SECRET?: string;
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  PROGRESS_KV?: KV;
  AUTH_KV?: KV;
};

type Ctx = { request: Request; env: Env };

type ServiceState = "ok" | "missing" | "degraded";

type HealthPayload = {
  ok: boolean;
  generatedAt: string;
  services: {
    auth: { state: ServiceState; sessionSecret: boolean; authKv: ServiceState };
    progress: { state: ServiceState; progressKv: ServiceState };
    email: { state: ServiceState; resend: boolean };
    newsletter: { state: ServiceState; beehiivPublication: boolean; beehiivApi: boolean };
  };
  notes: string[];
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });

async function probeKv(kv: KV | undefined): Promise<ServiceState> {
  if (!kv) return "missing";
  // 3-second cap so a degraded KV can't burn the function's full budget.
  // KV bindings don't accept AbortSignal directly, so we race the read.
  try {
    const probe = kv.get("__health_probe__");
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("kv-probe-timeout")), 3_000),
    );
    await Promise.race([probe, timeout]);
    return "ok";
  } catch {
    return "degraded";
  }
}

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  const env = ctx.env ?? {};
  const sessionSecret = Boolean(env.SESSION_SECRET);
  const beehiivPublication = Boolean(env.BEEHIIV_PUBLICATION_ID);
  const beehiivApi = Boolean(env.BEEHIIV_API_KEY);
  const resend = Boolean(env.RESEND_API_KEY);

  const [authKv, progressKv] = await Promise.all([
    probeKv(env.AUTH_KV),
    probeKv(env.PROGRESS_KV),
  ]);

  const notes: string[] = [];

  const authState: ServiceState =
    sessionSecret && authKv === "ok"
      ? "ok"
      : sessionSecret || authKv === "ok"
        ? "degraded"
        : "missing";

  const progressState: ServiceState = progressKv;

  const emailState: ServiceState = resend ? "ok" : "missing";
  if (!resend) {
    notes.push("magic-link emails fall back to function logs until RESEND_API_KEY lands");
  }

  const newsletterState: ServiceState =
    beehiivPublication && beehiivApi
      ? "ok"
      : beehiivPublication || beehiivApi
        ? "degraded"
        : "missing";
  if (!beehiivApi) {
    notes.push("newsletter sign-ups return 503 until BEEHIIV_API_KEY lands");
  }

  const payload: HealthPayload = {
    ok: authState === "ok" && progressState === "ok",
    generatedAt: new Date().toISOString(),
    services: {
      auth: { state: authState, sessionSecret, authKv },
      progress: { state: progressState, progressKv },
      email: { state: emailState, resend },
      newsletter: { state: newsletterState, beehiivPublication, beehiivApi },
    },
    notes,
  };

  return json(payload);
};
