#!/usr/bin/env node
// scripts/curriculum-lint.mjs
//
// Constructive-alignment lint. A chapter's overview.md often promises a
// set of lessons ("the four moves", "5 patterns") that the actual
// chapter.yaml never delivered. Learners hit a 1-lesson chapter that
// promised five and bounce. This script flags those gaps loudly and
// non-fatally.
//
// What it checks per chapter:
//   1. Number of lessons promised in overview.md (numbered lists,
//      "the N moves/patterns/lessons cover", etc.)
//   2. Number of lessons actually built (lesson folders)
//   3. Step counts per chapter for context
//
// What it does NOT do:
//   - Block the build. Exits 0 always. The whole point is to surface
//     debt so future work can target the right chapters.
//
// Run:  node scripts/curriculum-lint.mjs

import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import YAML from "yaml";

const REPO = resolve(new URL("..", import.meta.url).pathname);
const CONTENT = join(REPO, "content", "python");

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const BOLD = "\x1b[1m";

const bold = (s) => `${BOLD}${s}${RESET}`;
const dim = (s) => `${DIM}${s}${RESET}`;
const red = (s) => `${RED}${s}${RESET}`;
const yellow = (s) => `${YELLOW}${s}${RESET}`;
const green = (s) => `${GREEN}${s}${RESET}`;

const SPELLED = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function parsePromisedCount(overview) {
  if (!overview) return null;
  const lower = overview.toLowerCase();

  // "the {N} {moves|lessons|patterns|...}"
  const promisedNoun = /\b(?:the )?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(moves?|lessons?|patterns?|chapters?|steps|sections?|parts?|ways?|principles?|techniques?)\b/g;
  const counts = [];
  let m;
  while ((m = promisedNoun.exec(lower)) !== null) {
    const digit = Number(m[1]);
    const n = Number.isFinite(digit) ? digit : SPELLED[m[1]] ?? null;
    if (n && n >= 2 && n <= 12) {
      counts.push({ n, noun: m[2], match: m[0] });
    }
  }

  // Numbered enumerations "1. ... 2. ... 3. ..."
  const numLines = [...lower.matchAll(/^\s{0,4}(\d+)\.\s+\S/gm)].map((m) => Number(m[1]));
  const maxNum = numLines.length > 0 ? Math.max(...numLines) : 0;

  return {
    promisedNoun: counts,
    enumeratedTo: maxNum,
  };
}

async function listChapters() {
  const entries = await readdir(CONTENT, { withFileTypes: true });
  return entries
    .filter((d) => d.isDirectory() && /^\d+-/.test(d.name))
    .map((d) => d.name)
    .sort();
}

async function readYaml(path) {
  if (!existsSync(path)) return null;
  const raw = await readFile(path, "utf8");
  return YAML.parse(raw);
}

async function inspectChapter(slug) {
  const dir = join(CONTENT, slug);
  const chapterYaml = await readYaml(join(dir, "chapter.yaml"));
  let overview = "";
  const overviewPath = join(dir, "overview.md");
  if (existsSync(overviewPath)) overview = await readFile(overviewPath, "utf8");

  const entries = await readdir(dir, { withFileTypes: true });
  const lessonDirs = entries
    .filter((e) => e.isDirectory() && /^\d+-/.test(e.name))
    .map((e) => e.name)
    .sort();

  let totalSteps = 0;
  for (const lessonDir of lessonDirs) {
    const lessonPath = join(dir, lessonDir);
    const lessonFiles = await readdir(lessonPath);
    totalSteps += lessonFiles.filter((f) => /^\d+-/.test(f) && f !== "lesson.yaml").length;
  }

  return {
    slug,
    title: chapterYaml?.title ?? slug,
    actualLessons: lessonDirs.length,
    totalSteps,
    promised: parsePromisedCount(overview),
    hasOverview: overview.length > 0,
  };
}

function diagnose({ actualLessons, totalSteps, promised }) {
  const findings = [];

  if (actualLessons === 0) {
    findings.push({ kind: "error", msg: "chapter has zero lessons" });
  } else if (actualLessons === 1 && totalSteps < 6) {
    findings.push({
      kind: "warn",
      msg: `only 1 lesson with ${totalSteps} steps — thin slice of the topic`,
    });
  }

  if (promised?.promisedNoun?.length > 0) {
    for (const p of promised.promisedNoun) {
      const matchesLessonLike = /^(lessons?|moves?|patterns?|ways?|parts?|principles?|techniques?)$/.test(p.noun);
      if (matchesLessonLike && actualLessons < p.n) {
        findings.push({
          kind: "warn",
          msg: `overview promises "${p.match}" — built ${actualLessons}`,
        });
      }
    }
  }

  if (promised?.enumeratedTo >= 3 && actualLessons < promised.enumeratedTo) {
    findings.push({
      kind: "info",
      msg: `overview enumerates ${promised.enumeratedTo} numbered items — chapter has ${actualLessons} lessons`,
    });
  }

  return findings;
}

async function main() {
  const slugs = await listChapters();
  console.log(bold(`\ncurriculum-lint  ·  ${slugs.length} chapters\n`));

  const summary = { ok: 0, warn: 0, error: 0 };
  const rows = [];

  for (const slug of slugs) {
    const info = await inspectChapter(slug);
    const findings = diagnose(info);

    if (findings.some((f) => f.kind === "error")) summary.error++;
    else if (findings.some((f) => f.kind === "warn")) summary.warn++;
    else summary.ok++;

    rows.push({ info, findings });
  }

  for (const { info, findings } of rows) {
    const id = `ch${info.slug.split("-")[0]}`;
    const meta = dim(`${info.actualLessons} lesson${info.actualLessons === 1 ? "" : "s"} · ${info.totalSteps} steps`);
    let prefix;
    if (findings.some((f) => f.kind === "error")) prefix = red("✖");
    else if (findings.some((f) => f.kind === "warn")) prefix = yellow("⚠");
    else prefix = green("✓");

    console.log(`${prefix} ${bold(id.padEnd(5))} ${info.title}  ${meta}`);
    for (const f of findings) {
      const tag = f.kind === "error" ? red("error") : f.kind === "warn" ? yellow("warn ") : dim("info ");
      console.log(`    ${tag}  ${f.msg}`);
    }
  }

  console.log(
    `\n${bold("summary")}  ${green(summary.ok + " ok")}  ${yellow(summary.warn + " warn")}  ${red(summary.error + " error")}\n`,
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("curriculum-lint crashed:", err);
  process.exit(0);
});
