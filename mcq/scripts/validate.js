#!/usr/bin/env node
/* Validates the question bank. Usage: node scripts/validate.js [--quiet]
   Loads data/catalog.js and every data file exactly the way the browser does
   (scripts that push onto window.QUESTIONS), then checks schema and coverage. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const quiet = process.argv.includes("--quiet");
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const ctx = { window: {}, console };
vm.createContext(ctx);
function run(rel) {
  const file = path.join(ROOT, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: rel });
}

run("data/catalog.js");
const CATALOG = ctx.window.CATALOG;
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const SUBJECTS = CATALOG.map((d) => d.id);
const DIFFS = ["easy", "medium", "hard"];
const TYPES = ["concept", "numerical", "code-output", "query"];
const REQUIRED = ["id", "subject", "subtopic", "difficulty", "type", "question", "options", "answer", "explanation", "optionExplanations"];
const KNOWN = new Set(REQUIRED.concat(["code", "tags", "lang"]));

const all = [];
const fileOf = new Map();
const expectedFiles = new Set();

for (const d of CATALOG) {
  for (const s of d.subdomains) {
    const rel = `data/${d.id}/${s.key}.js`;
    expectedFiles.add(rel);
    if (!fs.existsSync(path.join(ROOT, rel))) { err(`Missing data file ${rel}`); continue; }
    if (!html.includes(`src="${rel}"`)) err(`index.html does not load ${rel}`);
    const before = ctx.window.QUESTIONS.length;
    try { run(rel); } catch (e) { err(`${rel}: failed to load — ${e.message}`); continue; }
    for (const q of ctx.window.QUESTIONS.slice(before)) { all.push(q); fileOf.set(q, { rel, d, s }); }
  }
}
for (const d of fs.readdirSync(path.join(ROOT, "data"), { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of fs.readdirSync(path.join(ROOT, "data", d.name))) {
    const rel = `data/${d.name}/${f}`;
    if (f.endsWith(".js") && !expectedFiles.has(rel)) err(`${rel} is not registered in data/catalog.js`);
  }
}

const seenIds = new Map();
const seenText = new Map();
const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

for (const q of all) {
  const { rel, d, s } = fileOf.get(q);
  const where = `${q && q.id ? q.id : "(no id)"} [${rel}]`;
  if (!q || typeof q !== "object") { err(`${rel}: non-object entry`); continue; }
  for (const f of REQUIRED) if (q[f] === undefined || q[f] === null || q[f] === "") err(`${where}: missing field "${f}"`);
  for (const k of Object.keys(q)) if (!KNOWN.has(k)) warn(`${where}: unknown field "${k}"`);

  if (typeof q.id === "string") {
    if (seenIds.has(q.id)) err(`${where}: duplicate id (also in ${seenIds.get(q.id)})`);
    seenIds.set(q.id, rel);
    const m = q.id.match(/^([a-z]+)-([a-z]+)-(\d{3})$/);
    if (!m) err(`${where}: id must look like ${d.prefix}-${s.key}-001`);
    else if (m[1] !== d.prefix || m[2] !== s.key) err(`${where}: id prefix should be "${d.prefix}-${s.key}-"`);
  }
  if (!SUBJECTS.includes(q.subject)) err(`${where}: invalid subject "${q.subject}"`);
  else if (q.subject !== d.id) err(`${where}: subject "${q.subject}" but file is in data/${d.id}/`);
  if (q.subtopic !== s.name) err(`${where}: subtopic "${q.subtopic}" must be "${s.name}"`);
  if (!DIFFS.includes(q.difficulty)) err(`${where}: invalid difficulty "${q.difficulty}"`);
  if (!TYPES.includes(q.type)) err(`${where}: invalid type "${q.type}"`);

  if (!Array.isArray(q.options) || q.options.length !== 4) err(`${where}: must have exactly 4 options`);
  else {
    q.options.forEach((o, i) => { if (typeof o !== "string" || !o.trim()) err(`${where}: option ${i} empty or not a string`); });
    if (new Set(q.options.map((o) => String(o).replace(/\s+/g, " ").trim())).size !== 4) err(`${where}: options are not distinct`);
    if (q.options.some((o) => /\b(all|none) of the above\b/i.test(o))) warn(`${where}: uses "all/none of the above"`);
  }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(`${where}: answer must be an integer 0-3`);
  if (!Array.isArray(q.optionExplanations) || q.optionExplanations.length !== 4) err(`${where}: optionExplanations must have length 4`);
  else q.optionExplanations.forEach((o, i) => { if (typeof o !== "string" || !o.trim()) err(`${where}: optionExplanations[${i}] empty`); });
  if (typeof q.explanation === "string" && q.explanation.length < 60) warn(`${where}: explanation is very short`);
  if (q.code !== undefined && typeof q.code !== "string") err(`${where}: code must be a string`);
  if ((q.type === "code-output" || q.type === "query") && !q.code) warn(`${where}: ${q.type} question without a code block`);
  if (q.tags !== undefined && (!Array.isArray(q.tags) || q.tags.some((t) => typeof t !== "string"))) err(`${where}: tags must be an array of strings`);

  const key = norm(q.question) + "||" + norm(q.code);
  if (seenText.has(key)) err(`${where}: duplicate question text (same as ${seenText.get(key)})`);
  seenText.set(key, q.id);
}

/* ---------- Coverage table ---------- */
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const gaps = [];
let out = "\n" + pad("Domain › Subdomain", 58) + lpad("Easy", 6) + lpad("Med", 6) + lpad("Hard", 6) + lpad("Total", 7) + "\n" + "-".repeat(83) + "\n";
const grand = { easy: 0, medium: 0, hard: 0 };
for (const d of CATALOG) {
  const dc = { easy: 0, medium: 0, hard: 0 };
  let rows = "";
  for (const s of d.subdomains) {
    const c = { easy: 0, medium: 0, hard: 0 };
    all.filter((q) => q.subject === d.id && q.subtopic === s.name).forEach((q) => { if (c[q.difficulty] !== undefined) c[q.difficulty]++; });
    const missing = DIFFS.filter((l) => !c[l]);
    if (missing.length) gaps.push(`${d.name} › ${s.name}: no ${missing.join("/")} questions`);
    DIFFS.forEach((l) => { dc[l] += c[l]; grand[l] += c[l]; });
    rows += pad("  " + s.name + (missing.length ? "  ⚠" : ""), 58) + lpad(c.easy, 6) + lpad(c.medium, 6) + lpad(c.hard, 6) + lpad(c.easy + c.medium + c.hard, 7) + "\n";
  }
  out += pad(d.name, 58) + lpad(dc.easy, 6) + lpad(dc.medium, 6) + lpad(dc.hard, 6) + lpad(dc.easy + dc.medium + dc.hard, 7) + "\n" + rows;
}
out += "-".repeat(83) + "\n" + pad("ALL", 58) + lpad(grand.easy, 6) + lpad(grand.medium, 6) + lpad(grand.hard, 6) + lpad(all.length, 7) + "\n";

/* ---------- Answer-position distribution ---------- */
const dist = (qs) => { const c = [0, 0, 0, 0]; qs.forEach((q) => { if (q.answer >= 0 && q.answer <= 3) c[q.answer]++; }); return c; };
const fmtDist = (c) => { const n = c.reduce((a, b) => a + b, 0) || 1; return c.map((v, i) => `${"ABCD"[i]}: ${lpad(v, 4)} (${lpad(Math.round((v / n) * 100), 2)}%)`).join("   "); };
out += "\nCorrect-answer positions\n";
out += pad("  All", 14) + fmtDist(dist(all)) + "\n";
for (const d of CATALOG) out += pad("  " + d.short, 14) + fmtDist(dist(all.filter((q) => q.subject === d.id))) + "\n";
for (const d of CATALOG) for (const s of d.subdomains) {
  const qs = all.filter((q) => q.subject === d.id && q.subtopic === s.name);
  if (qs.length >= 12) {
    const c = dist(qs), mx = Math.max(...c) / qs.length;
    if (mx > 0.4) warn(`${d.name} › ${s.name}: answer positions skewed (${c.join("/")})`);
  }
}

console.log(out);
if (warnings.length && !quiet) { console.log(`Warnings (${warnings.length}):`); warnings.forEach((w) => console.log("  - " + w)); console.log(""); }
if (gaps.length) { console.log(`Coverage gaps (${gaps.length}) — subdomains missing a difficulty level:`); gaps.forEach((g) => console.log("  - " + g)); console.log(""); }
if (errors.length) { console.log(`ERRORS (${errors.length}):`); errors.forEach((e) => console.log("  - " + e)); }
const failed = errors.length + gaps.length;
console.log(failed ? `\n✗ Validation failed: ${errors.length} error(s), ${gaps.length} coverage gap(s).` : `\n✓ ${all.length} questions valid. No errors, no coverage gaps.`);
process.exit(failed ? 1 : 0);
