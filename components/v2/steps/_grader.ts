// Client-side grader helpers. Mirrors the Zod-validated grader shapes from
// lib/content/schema.ts. Used by step views that submit code through the
// persistent IDE bridge.

import type { Grader } from "@/lib/content/schema";
import type { RunResult } from "../PersistentIDE";
import type { StepIDEBridge } from "../StepRouter";

export function normalizeStdout(
  raw: string,
  rule: "trim" | "collapse-trailing-newline" | "none",
): string {
  switch (rule) {
    case "trim":
      return raw.trim();
    case "collapse-trailing-newline":
      return raw.replace(/\n+$/g, "");
    case "none":
    default:
      return raw;
  }
}

export function normalizeString(
  raw: string,
  rule: "trim" | "collapse-ws" | "lower" | "none",
): string {
  switch (rule) {
    case "trim":
      return raw.trim();
    case "collapse-ws":
      return raw.trim().replace(/\s+/g, " ");
    case "lower":
      return raw.toLowerCase();
    case "none":
    default:
      return raw;
  }
}

/** Grade a stdout-shaped result against the canonical grader. */
export function gradeRunResult(grader: Grader, result: RunResult): GradeResult {
  if (grader.kind === "stdout-equality") {
    if (!result.ok || result.stderr) {
      return { passed: false, reason: result.stderr || "Code didn't finish — see the traceback." };
    }
    const got = normalizeStdout(result.stdout, grader.normalize);
    const expected = normalizeStdout(grader.expected, grader.normalize);
    return got === expected
      ? { passed: true }
      : {
          passed: false,
          reason: `Output didn't match. Got "${truncate(got)}", expected "${truncate(expected)}".`,
        };
  }
  if (grader.kind === "string-equality") {
    // Falls through; views that use this grader pass user input as result.stdout
    const expected = Array.isArray(grader.expected) ? grader.expected : [grader.expected];
    const got = normalizeString(result.stdout, grader.normalize);
    const matched = expected.some(
      (e) => normalizeString(e, grader.normalize) === got,
    );
    return matched ? { passed: true } : { passed: false, reason: "That answer didn't match." };
  }
  if (grader.kind === "ast-match") {
    // Synchronous path can't grade AST — async caller should use
    // gradeRunResultAsync(grader, result, ide) instead. Returning a
    // hint reason rather than a hard failure so the upstream view can
    // detect this and dispatch async.
    return {
      passed: false,
      reason: "ast-grader-needs-async",
    };
  }
  return {
    passed: false,
    reason: "This step uses a grader the v1 runtime doesn't support yet.",
  };
}

/**
 * Async grader for steps that may use ast-match or compound. Falls
 * through to the sync grader for the simple kinds so step views don't
 * have to branch.
 */
export async function gradeRunResultAsync(
  grader: Grader,
  result: RunResult,
  ide: StepIDEBridge,
): Promise<GradeResult> {
  if (grader.kind === "compound") {
    for (const child of grader.graders) {
      const res = await gradeRunResultAsync(child, result, ide);
      if (!res.passed) return res;
    }
    return { passed: true };
  }
  if (grader.kind === "ast-match") {
    if (!result.ok || result.stderr) {
      return {
        passed: false,
        reason: result.stderr || "Code didn't finish — see the traceback.",
      };
    }
    const code = ide.getActiveCode();
    const ast = await ide.gradeAst(code, {
      must: grader.must,
      mustNot: grader.mustNot,
    });
    if (!ast) {
      return { passed: false, reason: "Editor isn't ready yet." };
    }
    if (!ast.parsed) {
      return {
        passed: false,
        reason: ast.syntaxError ?? "Couldn't parse your code.",
      };
    }
    const missing = ast.must.filter((m) => !m.matched).map((m) => describeRule(m.rule));
    if (missing.length > 0) {
      return {
        passed: false,
        reason: `Missing required pattern: ${missing.join(", ")}`,
      };
    }
    const forbidden = ast.mustNot
      .filter((m) => m.matched)
      .map((m) => describeRule(m.rule));
    if (forbidden.length > 0) {
      return {
        passed: false,
        reason: `Found a forbidden pattern: ${forbidden.join(", ")}`,
      };
    }
    return { passed: true };
  }
  return gradeRunResult(grader, result);
}

function describeRule(rule: {
  kind: string;
  name?: string;
  module?: string;
  minArgs?: number;
}): string {
  switch (rule.kind) {
    case "calls":
      return `call to ${rule.name}()`;
    case "uses-loop":
      return "a for/while loop";
    case "defines-function":
      if (rule.name && rule.minArgs !== undefined) {
        return `function ${rule.name} with ≥${rule.minArgs} args`;
      }
      if (rule.name) return `function ${rule.name}`;
      if (rule.minArgs !== undefined)
        return `a function with ≥${rule.minArgs} args`;
      return "any function definition";
    case "uses-import":
      return `import of ${rule.module}`;
    case "no-globals":
      return "no `global` statements";
    default:
      return rule.kind;
  }
}

export type GradeResult =
  | { passed: true }
  | { passed: false; reason: string };

function truncate(value: string, max = 80): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}
