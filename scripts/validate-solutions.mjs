// scripts/validate-solutions.mjs
//
// Prebuild gate: run every `solution` (write/checkpoint) and every `code`
// (predict) block through its grader so an editorial regression — wrong
// expected output, broken solution, drifted ast rules — fails the build
// before it ships.
//
// Reads from lib/generated/v2/chapters/*.json (the output of
// build-content-v2.mjs), batches every gradeable task into a single JSON
// blob, and pipes it to scripts/validate-solutions.py for execution.
//
// Skips graders the runtime can validate but a CI can't:
//   - llm-judge (needs an API key + a model call per step)
//   - string-equality (designed for user-typed answers, not code)
//
// Skips step kinds whose solution isn't authored:
//   - fix (only brokenCode is known; the fix is the student's job)
//   - write where `solution` is omitted (still authoring)
//
// Exit code 0 = clean, 1 = at least one failure.

import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const REPO = resolve(new URL("..", import.meta.url).pathname);
const CHAPTERS_DIR = join(REPO, "lib", "generated", "v2", "chapters");
const PY_HELPER = join(REPO, "scripts", "validate-solutions.py");
const PY_BIN =
  process.env.VALIDATE_PYTHON ||
  (existsSync("/opt/homebrew/bin/python3.12") ? "/opt/homebrew/bin/python3.12" : "python3");

// Cloudflare Pages and other CI environments may not have Python 3.11+.
// If the build runner asks us to skip, exit cleanly so the deploy isn't
// blocked. Authors still get the gate locally via `pnpm check`.
const SKIP = process.env.SKIP_VALIDATE_SOLUTIONS === "1";

/** Pull every gradeable task out of a chapter manifest. */
function tasksFromChapter(chapter) {
  const tasks = [];
  for (const lesson of chapter.lessons) {
    for (const step of lesson.steps) {
      const task = taskFromStep(chapter, lesson, step);
      if (task) tasks.push(task);
    }
  }
  return tasks;
}

function taskFromStep(chapter, lesson, step) {
  // Predict steps deliberately include code that may crash (e.g. teaching
  // "predict the IndexError"). Their grader matches the user's typed
  // answer, not the code's stdout. Not validatable here.
  if (step.type === "checkpoint") {
    return wrapTask({ chapter, lesson, step }, step.solution, step.grader);
  }
  if (step.type === "write" && step.solution) {
    return wrapTask({ chapter, lesson, step }, step.solution, step.grader);
  }
  return null;
}

function wrapTask({ chapter, lesson, step }, code, grader) {
  const where = `${chapter.slug}/${lesson.slug} · ${step.id ?? step.type}`;
  if (grader.kind === "stdout-equality") {
    return {
      id: where,
      kind: "stdout-equality",
      code,
      expected: grader.expected,
      normalize: grader.normalize ?? "collapse-trailing-newline",
      stdin: step.stdin,
    };
  }
  if (grader.kind === "ast-match") {
    return {
      id: where,
      kind: "ast-match",
      code,
      must: grader.must ?? [],
      mustNot: grader.mustNot ?? [],
    };
  }
  // Silently skip llm-judge and string-equality — neither is appropriate
  // for prebuild validation.
  return null;
}

async function loadAllChapters() {
  if (!existsSync(CHAPTERS_DIR)) {
    console.log(`No chapters at ${CHAPTERS_DIR}. Did build-content-v2 run?`);
    process.exit(0);
  }
  const files = (await readdir(CHAPTERS_DIR)).filter((f) => f.endsWith(".json"));
  const chapters = [];
  for (const f of files) {
    const text = await readFile(join(CHAPTERS_DIR, f), "utf8");
    chapters.push(JSON.parse(text));
  }
  return chapters;
}

function runPython(tasks) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(PY_BIN, [PY_HELPER], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code !== 0) {
        rejectPromise(new Error(`python helper exited ${code}: ${stderr}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(stdout));
      } catch (err) {
        rejectPromise(new Error(`could not parse python output: ${err.message}\n${stdout}`));
      }
    });
    child.stdin.write(JSON.stringify(tasks));
    child.stdin.end();
  });
}

function summarize(results) {
  const failures = results.filter((r) => !r.passed);
  console.log(
    `\nvalidate-solutions: ${results.length} task(s) checked, ${failures.length} failed.`,
  );
  if (failures.length === 0) {
    console.log("  \x1b[32m✓\x1b[0m every solution matches its grader.");
    return 0;
  }
  for (const f of failures) {
    console.log(`\n  \x1b[31m✗\x1b[0m ${f.id}`);
    for (const line of (f.reason ?? "").split("\n")) {
      console.log(`      ${line}`);
    }
  }
  return 1;
}

async function pythonAvailable() {
  return new Promise((res) => {
    const child = spawn(PY_BIN, ["--version"], { stdio: ["ignore", "ignore", "ignore"] });
    child.on("error", () => res(false));
    child.on("close", (code) => res(code === 0));
  });
}

async function main() {
  if (SKIP) {
    console.log("validate-solutions: SKIP_VALIDATE_SOLUTIONS=1, skipping.");
    return;
  }
  if (!(await pythonAvailable())) {
    console.log(
      `validate-solutions: \x1b[33mskipped\x1b[0m (no '${PY_BIN}' on PATH). Run locally with pnpm check.`,
    );
    return;
  }

  const started = Date.now();
  const chapters = await loadAllChapters();
  if (chapters.length === 0) {
    console.log("No chapters to validate.");
    return;
  }

  const tasks = chapters.flatMap(tasksFromChapter);
  if (tasks.length === 0) {
    console.log("No gradeable solutions in the current content tree.");
    return;
  }

  console.log(
    `validate-solutions: ${tasks.length} task(s) across ${chapters.length} chapter(s)...`,
  );

  const results = await runPython(tasks);
  const code = summarize(results);
  console.log(`  ${((Date.now() - started) / 1000).toFixed(1)}s`);
  if (code !== 0) process.exit(code);
}

main().catch((err) => {
  console.error("\n\x1b[31m✗\x1b[0m validate-solutions:", err.message);
  process.exit(1);
});
