#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const file = process.env.SITEMAP_PATH || "out/sitemap.xml";
const xml = await readFile(file, "utf8");
const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());

function fail(message) {
  console.error(`\x1b[31m✗\x1b[0m ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`\x1b[32m✓\x1b[0m ${message}`);
}

if (locs.length === 0) fail(`no <loc> entries found in ${file}`);

const unique = new Set(locs);
if (unique.size !== locs.length) {
  fail(`duplicate sitemap URLs found (${locs.length - unique.size} duplicates)`);
}

const required = [
  "https://promptdojo.dev/",
  "https://promptdojo.dev/curriculum",
  "https://promptdojo.dev/learn/v2/variables",
  "https://promptdojo.dev/learn/v2/variables/naming-things/0",
];

for (const url of required) {
  if (!unique.has(url)) fail(`missing required sitemap URL: ${url}`);
}

for (const url of unique) {
  if (!url.startsWith("https://promptdojo.dev/")) {
    fail(`unexpected sitemap origin: ${url}`);
  }
}

const legacy = [...unique].filter((url) => /\/learn\/(?!v2(?:\/|$))/.test(url));
if (legacy.length > 0) {
  fail(`legacy /learn URLs leaked into sitemap: ${legacy.slice(0, 5).join(", ")}`);
}

pass(`${unique.size} sitemap URLs parsed from ${file}`);
pass("required canonical routes present");
pass("all URLs use https://promptdojo.dev origin");
pass("no legacy /learn/* URLs leaked into sitemap");
