import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import toc from "@/lib/generated/v2/manifest.toc.json";

export const runtime = "nodejs";
export const dynamic = "force-static";

const W = 1600;
const H = 900;

// Sourced from app/globals.css to match the live site palette exactly.
const ink950 = "#14140f";
const ink900 = "#18181b";
const ink800 = "#27272a";
const ink700 = "#3f3f46";
const ink400 = "#a1a1aa";
const ink300 = "#d4d4d8";
const ink100 = "#f4f4f5";
const ember = "#2aa06a";
const emberDim = "#1f7a51";
const red = "#ef4444";
const green = "#86efac";

// audit-v6/ui-design.md: site is sharp-corners-only with serif display +
// mono code + ensō mark. Previously the OG cards shipped sans-serif with
// borderRadius 14/8/6 and traffic-light circles — every X share looked
// like a Vercel template. This file is now corner-radius zero, system
// serif fallback for display (Fraunces ships via @next/font on the live
// site; loading woff2 into ImageResponse is a follow-up), and the ensō
// mark anchors the brand on hook + price cards.

// Dynamic counts so the OG art never lies again — last time these
// drifted to "22 chapters · 624 steps" while the actual was 26 / 515.
const TOTAL_CHAPTERS = toc.chapters.length;
const TOTAL_STEPS = toc.chapters.reduce(
  (a: number, c: { stepCount: number }) => a + c.stepCount,
  0,
);

const SERIF_STACK = "Georgia, 'Times New Roman', serif";
const MONO_STACK = "ui-monospace, 'JetBrains Mono', SFMono-Regular, monospace";

export async function generateStaticParams() {
  return [
    { name: "hook" },
    { name: "wedge" },
    { name: "ide" },
    { name: "capstone" },
    { name: "price" },
    { name: "roast" },
  ];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  switch (name) {
    case "hook":
      return renderHook();
    case "wedge":
      return renderWedge();
    case "ide":
      return renderIde();
    case "capstone":
      return renderCapstone();
    case "price":
      return renderPrice();
    case "roast":
      return renderRoast();
    default:
      notFound();
  }
}

// Inline ensō mark — green arc + white >_ glyph. Matches the on-site
// SVG in components/Wordmark.tsx.
function Enso({ size = 96 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      style={{ display: "block" }}
    >
      <path
        d="M 200 78 A 90 90 0 1 1 156 56"
        fill="none"
        stroke={ember}
        strokeWidth={22}
        strokeLinecap="round"
      />
      <path
        d="M 102 100 L 138 128 L 102 156"
        fill="none"
        stroke={ink100}
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x={100} y={170} width={56} height={14} rx={3} fill={ink100} />
    </svg>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        background: ink950,
        color: ink100,
        display: "flex",
        flexDirection: "column",
        padding: 72,
        fontFamily: SERIF_STACK,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        color: ember,
        fontSize: 24,
        letterSpacing: 6,
        textTransform: "uppercase",
        fontWeight: 700,
        fontFamily: MONO_STACK,
      }}
    >
      {text}
    </div>
  );
}

function Footer({ rightText }: { rightText: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: `1px solid ${ink800}`,
        paddingTop: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 32,
          fontWeight: 700,
          color: ink100,
          letterSpacing: -0.5,
          fontFamily: SERIF_STACK,
        }}
      >
        <Enso size={42} />
        promptdojo
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 22,
          color: ink400,
          fontFamily: MONO_STACK,
          letterSpacing: 1,
        }}
      >
        {rightText}
      </div>
    </div>
  );
}

function renderHook() {
  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Enso size={120} />
          <Eyebrow text="ai writes this — it's wrong" />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 220,
            fontWeight: 800,
            marginTop: 24,
            letterSpacing: -8,
            color: ink100,
            lineHeight: 0.95,
            fontFamily: SERIF_STACK,
          }}
        >
          promptdojo
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 38,
            color: ink300,
            marginTop: 24,
            width: 1456,
            lineHeight: 1.3,
            fontFamily: SERIF_STACK,
          }}
        >
          a python course for builders whose code is mostly written by ai now.
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div
          style={{
            display: "flex",
            width: "100%",
            marginBottom: 24,
            fontSize: 28,
            color: ink400,
            fontFamily: MONO_STACK,
            letterSpacing: 1,
          }}
        >
          <span>{TOTAL_CHAPTERS} chapters</span>
          <span style={{ color: ink700, margin: "0 14px" }}>·</span>
          <span>{TOTAL_STEPS} runnable steps</span>
          <span style={{ color: ink700, margin: "0 14px" }}>·</span>
          <span style={{ color: ember }}>free forever</span>
        </div>

        <Footer rightText="promptdojo.dev" />
      </Frame>
    ),
    { width: W, height: H },
  );
}

function renderWedge() {
  // Updated to match the current hero (ascending-sort default — the bug
  // visible in the code, not the prior mutable-default-arg version).
  const codeLines: Array<{ text: string; color?: string; bug?: boolean }> = [
    { text: "# top 3 best sellers for the homepage", color: ink400 },
    {
      text: "top_3 = sorted(products, key=lambda p: p.revenue)[:3]",
      color: red,
      bug: true,
    },
    { text: "", color: ink300 },
    { text: "# expected: 3 best-selling products", color: ink400 },
    { text: "# shipped:  3 worst sellers, featured all week", color: ink400 },
  ];

  return new ImageResponse(
    (
      <Frame>
        <Eyebrow text="ascending by default" />
        <div
          style={{
            display: "flex",
            fontSize: 70,
            fontWeight: 700,
            marginTop: 14,
            letterSpacing: -2,
            color: ink100,
            lineHeight: 1.05,
            width: "100%",
            fontFamily: SERIF_STACK,
          }}
        >
          ai writes this. it&apos;s wrong.
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            background: ink900,
            border: `1px solid ${ink800}`,
            padding: "24px 28px",
            fontFamily: MONO_STACK,
            fontSize: 26,
            lineHeight: 1.5,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              color: ink400,
              fontSize: 16,
              marginBottom: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            cursor.py
          </div>
          {codeLines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                color: line.color ?? ink300,
                background: line.bug ? "rgba(239,68,68,0.14)" : "transparent",
                padding: line.bug ? "2px 8px" : "2px 0",
                margin: line.bug ? "0 -8px" : 0,
                whiteSpace: "pre",
              }}
            >
              {line.text || " "}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: ink300,
              lineHeight: 1.4,
              fontFamily: SERIF_STACK,
            }}
          >
            <span style={{ color: red, fontWeight: 700 }}>
              sorted() goes low-to-high.
            </span>
            <span style={{ marginLeft: 12 }}>
              [:3] gave you the bottom 3, not the top.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <Footer rightText="promptdojo.dev" />
      </Frame>
    ),
    { width: W, height: H },
  );
}

function renderIde() {
  return new ImageResponse(
    (
      <Frame>
        <Eyebrow text="chapter 13 · llm apis" />
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            marginTop: 14,
            letterSpacing: -2,
            color: ink100,
            lineHeight: 1.05,
            width: "100%",
            fontFamily: SERIF_STACK,
          }}
        >
          no installs. no venv. no setup.
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 30,
            background: ink900,
            border: `1px solid ${ink800}`,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 18px",
              borderBottom: `1px solid ${ink800}`,
              background: ink950,
            }}
          >
            <div
              style={{
                display: "flex",
                color: ink400,
                fontSize: 18,
                fontFamily: MONO_STACK,
                letterSpacing: 1,
              }}
            >
              promptdojo.dev/learn/v2/llm-apis
            </div>
            <div style={{ display: "flex", flex: 1 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: ember,
                color: ink950,
                padding: "8px 22px",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 1,
                fontFamily: MONO_STACK,
              }}
            >
              run
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 28,
              fontFamily: MONO_STACK,
              fontSize: 26,
              lineHeight: 1.55,
            }}
          >
            <div style={{ display: "flex" }}>
              <span style={{ color: ink700, width: 36 }}>1</span>
              <span style={{ color: ember }}>import</span>
              <span style={{ color: ink300, marginLeft: 10 }}>httpx</span>
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ color: ink700, width: 36 }}>2</span>
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ color: ink700, width: 36 }}>3</span>
              <span style={{ color: ink300 }}>r = httpx.get(</span>
              <span style={{ color: green, marginLeft: 4 }}>
                &quot;https://api.github.com/zen&quot;
              </span>
              <span style={{ color: ink300 }}>)</span>
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ color: ink700, width: 36 }}>4</span>
              <span style={{ color: ink300 }}>print(r.text)</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "20px 28px 24px 28px",
              borderTop: `1px solid ${ink800}`,
              fontFamily: MONO_STACK,
              fontSize: 22,
              lineHeight: 1.5,
              background: "rgba(42,160,106,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                color: ink400,
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              output
            </div>
            <div style={{ display: "flex", color: ink100 }}>
              Avoid administrative distraction.
            </div>
            <div
              style={{
                display: "flex",
                color: emberDim,
                marginTop: 10,
                fontSize: 14,
              }}
            >
              ran in 187ms · pyodide wasm · client side
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1 }} />
        <Footer rightText="powered by pyodide" />
      </Frame>
    ),
    { width: W, height: H },
  );
}

function renderCapstone() {
  const traceLines = [
    { kind: "user", label: "user", text: "what's in my downloads folder?" },
    { kind: "tool", label: "tool_use", text: "list_files(path='~/Downloads')" },
    {
      kind: "result",
      label: "tool_result",
      text: "['invoice-2026.pdf', 'screenshot.png', 'agent-traces.md']",
    },
    { kind: "tool", label: "tool_use", text: "summarize(files=[...3])" },
    { kind: "stop", label: "stop_reason", text: "end_turn" },
    {
      kind: "agent",
      label: "agent",
      text: "you have an invoice, a screenshot, and a markdown note about agent traces.",
    },
  ];

  return new ImageResponse(
    (
      <Frame>
        <Eyebrow text="chapter 25 · capstone" />
        <div
          style={{
            display: "flex",
            fontSize: 62,
            fontWeight: 700,
            marginTop: 14,
            letterSpacing: -1.5,
            color: ink100,
            lineHeight: 1.05,
            width: "100%",
            fontFamily: SERIF_STACK,
          }}
        >
          ship a working cli agent in 12 steps.
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            background: ink900,
            border: `1px solid ${ink800}`,
            padding: "26px 30px",
            fontFamily: MONO_STACK,
            fontSize: 22,
            width: "100%",
          }}
        >
          {traceLines.map((line, i) => {
            const labelColor =
              line.kind === "user"
                ? ink400
                : line.kind === "tool"
                  ? ember
                  : line.kind === "result"
                    ? green
                    : line.kind === "stop"
                      ? "#a5b4fc"
                      : ink100;
            const textColor = line.kind === "agent" ? ink100 : ink300;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginTop: i === 0 ? 0 : 14,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color: labelColor,
                    fontSize: 14,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    width: 160,
                    paddingTop: 4,
                    fontWeight: 700,
                  }}
                >
                  {line.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    color: textColor,
                    flex: 1,
                  }}
                >
                  {line.text}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flex: 1 }} />
        <Footer rightText="~100 lines of python" />
      </Frame>
    ),
    { width: W, height: H },
  );
}

function renderPrice() {
  return new ImageResponse(
    (
      <Frame>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Enso size={140} />
          <div
            style={{
              display: "flex",
              color: ember,
              fontSize: 28,
              letterSpacing: 14,
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: MONO_STACK,
              marginTop: 24,
            }}
          >
            forever
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 320,
              fontWeight: 800,
              color: ink100,
              letterSpacing: -14,
              lineHeight: 0.9,
              marginTop: 12,
              fontFamily: SERIF_STACK,
            }}
          >
            $0
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              color: ink400,
              fontSize: 26,
              fontFamily: MONO_STACK,
              letterSpacing: 1,
            }}
          >
            <span>no signup</span>
            <span style={{ color: ink700, margin: "0 18px" }}>·</span>
            <span>no streak shame</span>
            <span style={{ color: ink700, margin: "0 18px" }}>·</span>
            <span>no upsell</span>
            <span style={{ color: ink700, margin: "0 18px" }}>·</span>
            <span style={{ color: ember }}>open source</span>
          </div>
        </div>

        <Footer rightText="github.com/xernst/promptdojo" />
      </Frame>
    ),
    { width: W, height: H },
  );
}

function renderRoast() {
  return new ImageResponse(
    (
      <Frame>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            flex: 1,
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: red,
              fontSize: 26,
              letterSpacing: 16,
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: MONO_STACK,
              marginTop: 40,
            }}
          >
            /roast
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 800,
              color: ink100,
              letterSpacing: -5,
              lineHeight: 1.0,
              marginTop: 40,
              fontFamily: SERIF_STACK,
            }}
          >
            roast my prompt.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: ink300,
              lineHeight: 1.25,
              marginTop: 28,
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              maxWidth: 1280,
            }}
          >
            paste a prompt. get a brutal critique in under a second.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              marginBottom: 8,
              color: ink400,
              fontSize: 24,
              fontFamily: MONO_STACK,
              letterSpacing: 1,
              alignItems: "center",
            }}
          >
            <span>no api key</span>
            <span style={{ color: ink700, margin: "0 18px" }}>·</span>
            <span>no signup</span>
            <span style={{ color: ink700, margin: "0 18px" }}>·</span>
            <span style={{ color: ember }}>runs in your browser</span>
          </div>
        </div>

        <Footer rightText="promptdojo.dev/roast" />
      </Frame>
    ),
    { width: W, height: H },
  );
}
