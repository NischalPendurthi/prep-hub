#!/usr/bin/env node
// Build the language-internals guides from content/<lang>/*.md into dist/.
//
// usage: node langs/build.mjs            build; run only examples whose code changed since outputs.json
//        node langs/build.mjs --verify   re-run every example and fail if any recorded output differs
//        node langs/build.mjs --only python   limit to one language (repeatable)
//
// Chapter format: see langs/README.md.
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(HERE, "content");
const DIST = path.join(HERE, "dist");
const WORK = path.join(HERE, ".work");
const OUTPUTS = path.join(HERE, "outputs.json");
const hljs = createRequire(import.meta.url)(path.join(HERE, "..", "atlas", "site", "vendor", "highlight.min.js"));

const args = process.argv.slice(2);
const VERIFY = args.includes("--verify");
const ONLY = args.flatMap((a, i) => (a === "--only" ? [args[i + 1]] : []));

const LANGS = {
  python: { name: "Python", hl: "python", file: () => "main.py", cmd: () => "python3 -I main.py" },
  java: {
    name: "Java", hl: "java",
    file: (code) => ((code.match(/public\s+(?:final\s+)?class\s+(\w+)/) || code.match(/class\s+(\w+)/) || [])[1] || "Main") + ".java",
    // compile quietly (errors still show), then run; javap examples can reuse the .class files
    cmd: (file) => `javac -d . -nowarn -XDsuppressNotes -XDignore.symbol.file ${file} && java -cp . ${file.replace(/\.java$/, "")}`,
  },
  go: { name: "Go", hl: "go", file: () => "main.go", cmd: () => "go run main.go" },
  rust: { name: "Rust", hl: "rust", file: () => "main.rs", cmd: () => "rustc --edition 2024 --color never -A warnings -O -o main main.rs && ./main" },
};
const PLAIN = new Set(["text", "txt", "console", "output", "plain"]);
const HL_ALIAS = { shell: "bash", sh: "bash", asm: "x86asm" };

const DRILL = { concept: "Concept", tricky: "Tricky", output: "Output", bug: "Find the bug", code: "Code" };
const CALLOUT = { trap: "Interview trap", key: "Key idea", tip: "Tip", new: "Version note" };
const ROLE = { th: "Theory", dr: "Drills", cd: "Coding" };

class BuildError extends Error {}
const fail = (where, msg) => { throw new BuildError(`${where}: ${msg}`); };

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/`/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

function parseAttrs(s) {
  const out = {};
  for (const m of s.matchAll(/([\w-]+)(?:=("([^"]*)"|\S+))?/g)) out[m[1]] = m[3] !== undefined ? m[3] : m[2] !== undefined ? m[2] : true;
  return out;
}

function frontMatter(text, where) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) fail(where, "missing front matter");
  const meta = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) fail(where, `bad front matter line: ${line}`);
    meta[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: text.slice(m[0].length) };
}

// ---------------------------------------------------------------- inline markdown
function inline(s) {
  // code spans become placeholders first, so **bold `code`** and links around code still work
  const codes = [];
  const text = s.replace(/(`+)([\s\S]*?)\1/g, (_, __, body) => {
    codes.push(`<code>${esc(body.replace(/^ (.*) $/, "$1"))}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  return inlineText(text).replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
}
function inlineText(s) {
  let t = esc(s);
  t = t.replace(/&lt;(\/?)(kbd|br|sub|sup|b|i|em|mark|small)&gt;/g, "<$1$2>");
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => `<a href="${url}"${/^https?:/.test(url) ? ' rel="noopener"' : ""}>${txt}</a>`);
  t = t.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "<b>$1</b>");
  t = t.replace(/(^|[\s(])\*(?=\S)([^*]*?\S)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
  t = t.replace(/ -- /g, " – ");
  return t;
}

// ---------------------------------------------------------------- block parser
const RE_FENCE = /^(`{3,})(.*)$/;
const RE_BOX = /^:::\s*([\w-]+)\s*(.*)$/;
const RE_HEAD = /^(#{2,4})\s+(.*?)\s*(\{[^}]*\})?\s*$/;
const RE_LIST = /^([-*]|\d+\.)\s+/;

function parseBlocks(lines, where) {
  const blocks = [];
  let i = 0;
  const startsBlock = (l) => RE_FENCE.test(l) || RE_BOX.test(l) || /^:::\s*$/.test(l) || RE_HEAD.test(l) || RE_LIST.test(l) || l.startsWith("|") || l.startsWith("<");
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = line.match(RE_FENCE))) {
      const ticks = m[1], info = m[2].trim();
      const body = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ticks) body.push(lines[i++]);
      if (i >= lines.length) fail(where, `unclosed code fence (${info})`);
      i++;
      const sp = info.indexOf(" ");
      const lang = (sp < 0 ? info : info.slice(0, sp)) || "text";
      blocks.push({ t: "code", lang, attrs: parseAttrs(sp < 0 ? "" : info.slice(sp + 1)), code: body.join("\n") });
      continue;
    }
    if ((m = line.match(RE_BOX))) {
      const kind = m[1], arg = m[2];
      let depth = 1, inFence = null;
      const body = [];
      i++;
      for (; i < lines.length; i++) {
        const l = lines[i], f = l.match(RE_FENCE);
        if (inFence) { if (l.trim() === inFence) inFence = null; }
        else if (f) inFence = f[1];
        else if (RE_BOX.test(l)) depth++;
        else if (/^:::\s*$/.test(l) && --depth === 0) break;
        body.push(l);
      }
      if (i >= lines.length) fail(where, `unclosed ::: ${kind}`);
      i++;
      blocks.push({ t: "box", kind, arg, lines: body });
      continue;
    }
    if ((m = line.match(RE_HEAD))) {
      const a = m[3] ? parseAttrs(m[3].slice(1, -1).replace(/#([\w-]+)/, "id=$1").replace(/\.(\w+)/g, "class-$1")) : {};
      blocks.push({ t: "h", level: m[1].length, text: m[2], id: a.id, roles: Object.keys(a).filter((k) => k.startsWith("class-")).map((k) => k.slice(6)) });
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      blocks.push({ t: "table", rows });
      continue;
    }
    if (RE_LIST.test(line)) {
      const ordered = /^\d/.test(line);
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        if (RE_LIST.test(l)) { items.push([l.replace(RE_LIST, "")]); i++; }
        else if (l.trim() && /^\s{2,}/.test(l) && items.length) { items[items.length - 1].push(l.replace(/^\s{2,4}/, "")); i++; }
        else if (!l.trim() && i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1]) && items.length) { items[items.length - 1].push(""); i++; }
        else break;
      }
      blocks.push({ t: "list", ordered, items: items.map((it) => parseBlocks(it, where)) });
      continue;
    }
    if (line.startsWith("<")) {
      const raw = [];
      while (i < lines.length && lines[i].trim()) raw.push(lines[i++]);
      blocks.push({ t: "html", html: raw.join("\n") });
      continue;
    }
    const para = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) para.push(lines[i++]);
    blocks.push({ t: "p", text: para.join(" ") });
  }
  return blocks;
}

// ---------------------------------------------------------------- examples
let outputs = {};
try { outputs = JSON.parse(fs.readFileSync(OUTPUTS, "utf8")); } catch { outputs = {}; }
const jobs = new Map(); // key -> {lang, id, block, where}

function registerRun(lang, block, where, seen) {
  const id = block.attrs.run;
  if (typeof id !== "string") fail(where, "run= needs an id");
  const key = `${lang}:${id}`;
  if (seen.has(key)) fail(where, `duplicate run id ${id}`);
  seen.add(key);
  const L = LANGS[lang];
  const file = block.attrs.file || L.file(block.code);
  const cmd = block.attrs.cmd || L.cmd(file);
  const hash = sha(JSON.stringify([lang, file, cmd, block.attrs.env || "", block.attrs.head || "", block.code]));
  jobs.set(key, { lang, id, file, cmd, hash, block, where });
}

function toolPath() {
  const extra = [path.join(os.homedir(), ".local", "go", "bin"), path.join(os.homedir(), ".cargo", "bin")].filter((p) => fs.existsSync(p));
  return [...extra, process.env.PATH].join(":");
}
const RUN_ENV = (() => {
  const e = { ...process.env, PATH: toolPath(), NO_COLOR: "1", TERM: "dumb", LANG: "C.UTF-8", LC_ALL: "C.UTF-8", GOTOOLCHAIN: "local", GOFLAGS: "", PYTHONDONTWRITEBYTECODE: "1" };
  delete e.JAVA_TOOL_OPTIONS; delete e._JAVA_OPTIONS; delete e.PYTHONSTARTUP; delete e.PYTHONHASHSEED; delete e.RUSTFLAGS;
  return e;
})();

function normalise(out, dir, head) {
  let s = out.split(dir + "/").join("").split(dir).join(".");
  for (const [p, name] of [[process.env.GOROOT || path.join(os.homedir(), ".local", "go"), "$GOROOT"], [os.homedir(), "~"]]) s = s.split(p).join(name);
  s = s.replace(/\b0x[0-9a-fA-F]{6,}\b/g, "0x…");
  s = s.replace(/\/tmp\/tmp[\w]+/g, "/tmp/tmpXXXX");
  let lines = s.replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, ""));
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  const max = head ? Number(head) : 80;
  if (lines.length > max) lines = [...lines.slice(0, max), head ? "…" : `… (${lines.length - max} more lines)`];
  return lines.join("\n");
}

function runOne(job) {
  return new Promise((resolve) => {
    const dir = path.join(WORK, `${job.lang}-${job.id}`);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, job.file), job.block.code + "\n");
    const env = { ...RUN_ENV };
    if (job.block.attrs.env) for (const kv of String(job.block.attrs.env).split(/\s+/)) { const [k, ...v] = kv.split("="); env[k] = v.join("="); }
    const child = spawn("bash", ["-c", `(${job.cmd}) 2>&1`], { cwd: dir, env, detached: true });   // own process group
    const killAll = () => { try { process.kill(-child.pid, "SIGKILL"); } catch {} };
    let out = "";
    child.stdout.on("data", (d) => { out += d; if (out.length > 2e6) killAll(); });
    const timer = setTimeout(() => { out += "\n[timed out]"; killAll(); }, Number(job.block.attrs.timeout || 30) * 1000);
    child.on("close", (code) => { clearTimeout(timer); killAll(); resolve({ code: code ?? -1, out: normalise(out, dir, job.block.attrs.head) }); });
  });
}

async function runAll() {
  const todo = [...jobs.values()].filter((j) => VERIFY || !outputs[`${j.lang}:${j.id}`] || outputs[`${j.lang}:${j.id}`].hash !== j.hash);
  if (!todo.length) return [];
  console.log(`running ${todo.length} example(s)${VERIFY ? " (verify)" : ""}…`);
  const problems = [];
  let next = 0, done = 0;
  const width = Math.max(2, Math.min(os.cpus().length, 8));
  async function worker() {
    while (next < todo.length) {
      const job = todo[next++];
      const key = `${job.lang}:${job.id}`;
      const r = await runOne(job);
      const wantErr = !!job.block.attrs.expect;
      if (r.out.includes("[timed out]")) problems.push(`${job.where} [${job.id}]: timed out`);
      else if (wantErr && r.code === 0) problems.push(`${job.where} [${job.id}]: expected an error but it exited 0\n${r.out}`);
      else if (!wantErr && r.code !== 0) problems.push(`${job.where} [${job.id}]: exited ${r.code}\n${r.out}`);
      const prev = outputs[key];
      const unchanged = prev && prev.hash === job.hash;   // same code as when the output was recorded
      if (VERIFY && unchanged && !job.block.attrs.nondet && prev.out !== r.out) problems.push(`${job.where} [${job.id}]: output differs from outputs.json\n--- recorded\n${prev.out}\n--- now\n${r.out}`);
      if (!unchanged || job.block.attrs.nondet) outputs[key] = { hash: job.hash, out: r.out };
      if (++done % 25 === 0) console.log(`  ${done}/${todo.length}`);
    }
  }
  await Promise.all(Array.from({ length: width }, worker));
  return problems;
}

// ---------------------------------------------------------------- rendering
function highlight(code, lang) {
  if (PLAIN.has(lang)) return esc(code);
  const l = HL_ALIAS[lang] || lang;
  return hljs.getLanguage(l) ? hljs.highlight(code, { language: l, ignoreIllegals: true }).value : esc(code);
}

function renderTable(rows) {
  const cells = (r) => r.replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => inline(c.trim().replace(/\\\|/g, "|")));
  const head = cells(rows[0]);
  const body = rows.slice(rows[1] && /^\|[\s:|-]+\|?$/.test(rows[1]) ? 2 : 1).map(cells);
  return `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function makeCtx(lang, chId, where, seen) {
  return { lang, chId, where, seen, h3s: [], ids: new Set() };
}

function renderBlocks(blocks, ctx) {
  return blocks.map((b) => renderBlock(b, ctx)).join("\n");
}

function renderCode(b, ctx) {
  const lang = b.lang;
  let html = `<pre${b.attrs.run ? ` data-run="${esc(b.attrs.run)}"` : ""}><code class="language-${esc(lang)} hljs">${highlight(b.code, lang)}</code></pre>`;
  if (b.attrs.run) {
    if (!LANGS[lang]) fail(ctx.where, `run= on unsupported language ${lang}`);
    if (lang !== ctx.lang) fail(ctx.where, `run= block in ${lang} inside the ${ctx.lang} guide`);
    registerRun(lang, b, ctx.where, ctx.seen);
    const out = `<pre class="out" data-out="${esc(b.attrs.run)}">@@OUT:${lang}:${b.attrs.run}@@</pre>`;
    // in a drill question the output is the answer, so it moves into the hidden answer
    if (ctx.deferOut) ctx.deferOut.push(out);
    else if (!b.attrs["no-output"]) html += "\n" + out;
  }
  return html;
}

function renderBlock(b, ctx) {
  switch (b.t) {
    case "p": return `<p>${inline(b.text)}</p>`;
    case "html": return b.html;
    case "table": return renderTable(b.rows);
    case "code": return renderCode(b, ctx);
    case "list": {
      const tag = b.ordered ? "ol" : "ul";
      return `<${tag}>${b.items.map((it) => `<li>${it.length === 1 && it[0].t === "p" ? inline(it[0].text) : renderBlocks(it, ctx)}</li>`).join("")}</${tag}>`;
    }
    case "h": {
      if (b.level === 2) fail(ctx.where, `## heading "${b.text}" inside a block`);
      const id = b.id || `${ctx.chId}-${slug(b.text)}`;
      if (ctx.ids.has(id)) fail(ctx.where, `duplicate id ${id}`);
      ctx.ids.add(id);
      if (b.level === 3) ctx.h3s.push({ id, text: b.text });
      return `<h${b.level} id="${id}">${inline(b.text)}</h${b.level}>`;
    }
    case "box": {
      const inner = parseBlocks(b.lines, ctx.where);
      if (CALLOUT[b.kind]) return `<div class="callout ${b.kind}"><p class="callout-title">${inline(b.arg || CALLOUT[b.kind])}</p>\n${renderBlocks(inner, ctx)}</div>`;
      if (b.kind === "drill") return renderDrill(b, ctx);
      if (b.kind === "steps") return `<div class="deriv">${inner.map((x) => `<div class="step">${renderBlock(x, ctx)}</div>`).join("")}</div>`;
      fail(ctx.where, `unknown ::: ${b.kind}`);
    }
  }
  fail(ctx.where, `unknown block ${b.t}`);
}

function renderDrill(b, ctx) {
  const a = parseAttrs(b.arg);
  const kind = Object.keys(a).find((k) => DRILL[k]);
  if (!kind) fail(ctx.where, `drill needs a kind (${Object.keys(DRILL).join(", ")}): "${b.arg}"`);
  let sep = -1, inFence = null;
  for (let i = 0; i < b.lines.length; i++) {
    const l = b.lines[i], f = l.match(RE_FENCE);
    if (inFence) { if (l.trim() === inFence) inFence = null; } else if (f) inFence = f[1]; else if (l.trim() === "---") { sep = i; break; }
  }
  if (sep < 0) fail(ctx.where, `drill without --- answer: ${b.lines.find((l) => l.trim()) || ""}`);
  const q = parseBlocks(b.lines.slice(0, sep), ctx.where);
  const ans = parseBlocks(b.lines.slice(sep + 1), ctx.where);
  if (!q.length || q[0].t !== "p") fail(ctx.where, "a drill must start with a question paragraph");
  if (!ans.length) fail(ctx.where, "empty drill answer");
  ctx.drills = (ctx.drills || 0) + 1;
  ctx.deferOut = [];
  const qHtml = renderBlocks(q.slice(1), ctx);
  const outs = ctx.deferOut;
  ctx.deferOut = null;
  return `<div class="drill" data-kind="${kind}">
  <p class="dq"><span class="lvl">${DRILL[kind]}</span>${inline(q[0].text)}</p>
  ${qHtml}${a.rating ? `\n  <p class="rating">Estimated difficulty: about ${esc(a.rating)} (Codeforces-style)</p>` : ""}
  <details class="q" data-kind="${kind}"><summary>Answer</summary><div class="a">
  ${outs.join("\n")}
  ${renderBlocks(ans, ctx)}
  </div></details>
</div>`;
}

// ---------------------------------------------------------------- chapters
function loadLang(lang) {
  const dir = path.join(CONTENT, lang);
  const files = fs.readdirSync(dir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
  if (!files.length || !files[0].startsWith("00-")) fail(lang, "needs 00-overview.md");
  const seen = new Set();
  const overview = { ...frontMatter(fs.readFileSync(path.join(dir, files[0]), "utf8"), `${lang}/${files[0]}`), file: files[0] };
  const chapters = files.slice(1).map((f) => {
    const where = `${lang}/${f}`;
    const { meta, body } = frontMatter(fs.readFileSync(path.join(dir, f), "utf8"), where);
    for (const k of ["title", "part", "lede", "desc"]) if (!meta[k]) fail(where, `front matter needs ${k}`);
    const num = f.slice(0, 2);
    return { lang, num, id: `ch${num}`, where, meta, body };
  });
  return { lang, overview, chapters, seen };
}

function renderChapter(L, ch, idx) {
  const ctx = makeCtx(L.lang, ch.id, ch.where, L.seen);
  const blocks = parseBlocks(ch.body.split("\n"), ch.where);
  const sections = [];
  let cur = null;
  for (const b of blocks) {
    if (b.t === "h" && b.level === 2) {
      const id = b.id || `${ch.id}-${slug(b.text)}`;
      if (ctx.ids.has(id)) fail(ch.where, `duplicate id ${id}`);
      ctx.ids.add(id);
      cur = { id, title: b.text, roles: b.roles.length ? b.roles : ["th"], blocks: [] };
      for (const r of cur.roles) if (!ROLE[r]) fail(ch.where, `unknown role .${r} on "${b.text}"`);
      sections.push(cur);
    } else if (!cur) fail(ch.where, "content before the first ## section");
    else cur.blocks.push(b);
  }
  const toc = [];
  const secHtml = sections.map((s) => {
    ctx.h3s = [];
    const inner = renderBlocks(s.blocks, ctx);
    toc.push(`<a href="#${s.id}">${inline(s.title)}</a>`, ...ctx.h3s.map((h) => `<a class="h3" href="#${h.id}">${inline(h.text)}</a>`));
    return `<section id="${s.id}" data-roles="${s.roles.join(" ")}"><div class="sec-head"><h2>${inline(s.title)}</h2><div class="sec-tools">${s.roles.map((r) => `<span class="role ${r}">${ROLE[r]}</span>`).join("")}</div></div>\n${inner}\n</section>`;
  }).join("\n\n");
  const roles = [...new Set(sections.flatMap((s) => s.roles))].sort((a, b) => Object.keys(ROLE).indexOf(a) - Object.keys(ROLE).indexOf(b));
  ch.roles = roles;
  ch.drills = ctx.drills || 0;
  const prev = L.chapters[idx - 1], next = L.chapters[idx + 1];
  const pager = `<nav class="pager" aria-label="Chapter navigation">${prev ? `<a href="#${prev.id}"><small>Previous · ${prev.num}</small><span>${inline(prev.meta.title)}</span></a>` : ""}${next ? `<a class="next" href="#${next.id}"><small>Next · ${next.num}</small><span>${inline(next.meta.title)}</span></a>` : ""}</nav>`;
  const meta = [`${roles.map((r) => `<span class="role ${r}">${ROLE[r]}</span>`).join("")}`, ch.meta.hours ? `<span>· about ${esc(ch.meta.hours)} hours</span>` : "", ch.meta.prereqs ? `<span>· prerequisites: ${inline(ch.meta.prereqs)}</span>` : ""].join("");
  return `<div class="page chwrap" id="${ch.id}"><div class="col"><article class="chapter">
<header class="ch-head">
  <p class="eyebrow">${esc(ch.meta.part)} · Chapter ${Number(ch.num)}</p>
  <h1>${inline(ch.meta.title)}</h1>
  <p class="lede">${inline(ch.meta.lede)}</p>
  <div class="ch-meta">${meta}</div>
</header>

${secHtml}
${pager}</article>
</div><nav class="toc" aria-label="On this page"><p>On this page</p>${toc.join("")}</nav></div>`;
}

function renderOverview(L) {
  const { meta, body } = L.overview;
  const where = `${L.lang}/${L.overview.file}`;
  for (const k of ["name", "short", "version", "eyebrow", "headline", "lede"]) if (!meta[k]) fail(where, `front matter needs ${k}`);
  const ctx = makeCtx(L.lang, "home", where, L.seen);
  const blocks = parseBlocks(body.split("\n"), where);
  let hero = "";
  const rest = [];
  for (const b of blocks) {
    if (b.t === "box" && b.kind === "hero") {
      const inner = parseBlocks(b.lines, where);
      hero = `<div class="hero-eq" aria-label="${esc(b.arg || "Example")}">\n${inner.map((x) => (x.t === "p" ? `<p class="cap">${inline(x.text)}</p>` : renderBlock(x, ctx))).join("\n")}\n</div>`;
    } else if (b.t === "h" && b.level === 2) rest.push(`<h2>${inline(b.text)}</h2>`);
    else if (b.t === "p" && rest.length && /^<h2>/.test(rest[rest.length - 1])) rest.push(`<p class="sub">${inline(b.text)}</p>`);
    else if (b.t === "table") rest.push(renderTable(b.rows).replace('class="table-wrap"', 'class="table-wrap plan"'));
    else rest.push(renderBlock(b, ctx));
  }
  const cta = (meta.cta || "").split(";").map((x) => x.trim()).filter(Boolean).map((x, i) => {
    const [label, href] = x.split("|").map((s) => s.trim());
    return `<a class="btn${i === 0 ? " primary" : ""}" href="${esc(href)}">${esc(label)}</a>`;
  }).join("\n          ");
  const parts = [];
  for (const ch of L.chapters) {
    if (!parts.length || parts[parts.length - 1].name !== ch.meta.part) parts.push({ name: ch.meta.part, chs: [] });
    parts[parts.length - 1].chs.push(ch);
  }
  const partsHtml = parts.map((p) => `<div class="part"><h3>${esc(p.name)}</h3>${p.chs.map((ch) => `<a href="#${ch.id}"><span class="n">${ch.num}</span><span class="t">${inline(ch.meta.title)}</span><span class="rr">${ch.roles.map((r) => `<span class="role ${r}">${ROLE[r]}</span>`).join("")}</span><span class="d">${inline(ch.meta.desc)}</span></a>`).join("")}</div>`).join("");
  return `<div id="home">
  <div class="home">
    <section class="hero">
      <div>
        <p class="eyebrow">${esc(meta.eyebrow)}</p>
        <h1>${meta.headline}</h1>
        <p class="lede">${inline(meta.lede)}</p>
        <div class="hero-cta">
          ${cta}
        </div>
      </div>
      ${hero}
    </section>

    <h2>Chapters</h2>
    <p class="sub">Each chapter has three kinds of section: <span class="role th">Theory</span>, <span class="role dr">Drills</span> and <span class="role cd">Coding</span>. Use the switch in the top bar to show only one kind. Every program on these pages was run with ${esc(meta.version)}, and the output under it is what it printed.</p>
    <div class="parts">${partsHtml}</div>

    ${rest.join("\n    ")}
  </div>
</div>`;
}

const ICONS = {
  python: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-4 0-4 1.5-4 3v2h4.5M8 8H5.5C4 8 3 9.5 3 12s1 4 2.5 4H8"/><path d="M12 21c4 0 4-1.5 4-3v-2h-4.5M16 16h2.5c1.5 0 2.5-1.5 2.5-4s-1-4-2.5-4H16"/><path d="M8 8v3a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v1M16 16v-3"/></svg>',
  java: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a3 3 0 0 1 0 6h-1"/><path d="M3 8h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M7 2v2M11 2v2M15 2v2"/></svg>',
  go: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  rust: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
};

function page(L, body, routing) {
  const m = L.overview.meta;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="stylesheet" href="../../shared/hub.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..600&display=swap">
<script src="../../shared/hub.js" data-tool="langs" data-toggle="#theme"></script>
<title>${esc(m.name)}</title>
<meta name="description" content="${esc(m.lede.replace(/`/g, ""))}">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='#3b5bdb'/><text x='16' y='21.5' font-size='13' font-family='monospace' font-weight='700' text-anchor='middle' fill='white'>${m.icon || m.short.slice(0, 2)}</text></svg>`)}">
<link rel="stylesheet" href="../reader.css">
<style>
${routing}
</style>
<link rel="stylesheet" href="../theme.css">
</head>
<body>
<nav class="hubbar" id="hubbar"></nav>
<input type="radio" name="kind" id="k-all" class="kind" checked><input type="radio" name="kind" id="k-th" class="kind"><input type="radio" name="kind" id="k-dr" class="kind"><input type="radio" name="kind" id="k-cd" class="kind">
<input type="checkbox" id="menu-toggle">
<header class="topbar">
  <label class="iconbtn menubtn" for="menu-toggle" aria-label="Open chapter list"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12"/></svg></label>
  <a class="brand" href="#home"><b><span class="long">${esc(m.name)}</span><span class="short">${esc(m.short)}</span></b><span>${esc(m.version)}</span></a>
  <div class="spacer"></div>
  <div class="roles" role="group" aria-label="Filter sections by kind">
    <label for="k-all">All</label><label for="k-th">Theory</label><label for="k-dr">Drills</label><label for="k-cd">Coding</label>
  </div>
  <button class="iconbtn searchbtn no-js-hide" id="searchbtn" type="button" aria-label="Search the guide"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/></svg><span class="label">Search</span><kbd>/</kbd></button>
  <button class="iconbtn no-js-hide" id="theme" type="button" aria-label="Switch between light and dark theme"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z"/></svg></button>
</header>
<div class="shell">
  ${body}
</div>
<div class="search-overlay" id="search" hidden><div class="search-box" role="dialog" aria-label="Search"><input id="q" type="search" placeholder="${esc(m.search || "Search this guide…")}" autocomplete="off"><div class="search-results" id="results"></div></div></div>
<script src="../reader.js"></script>
</body>
</html>
`;
}

function buildLang(L) {
  const chHtml = L.chapters.map((ch, i) => renderChapter(L, ch, i));
  const home = renderOverview(L);
  let rail = `<nav class="rail" id="rail" aria-label="Chapters"><h4>Start</h4><a href="#home"><span class="n">⌂</span><span>Overview and study plan</span><span></span></a>`;
  let part = null;
  for (const ch of L.chapters) {
    if (ch.meta.part !== part) { part = ch.meta.part; rail += `<h4>${esc(part)}</h4>`; }
    rail += `<a href="#${ch.id}"><span class="n">${ch.num}</span><span>${inline(ch.meta.title)}</span><span></span></a>`;
  }
  rail += "</nav>";
  const sel = (id) => `#${id}:target, #${id} :target`;
  const routing = [
    `body:has(${L.chapters.map((c) => sel(c.id)).join(", ")}) #home { display: none; }`,
    ...L.chapters.map((c) => `body:has(${sel(c.id)}) .rail a[href="#${c.id}"] { background: var(--accent-soft); color: var(--ink); font-weight: 600; }`),
  ].join("\n");
  const body = `${rail}\n  <main id="main">\n    ${home}\n    ${chHtml.join("")}\n  </main>`;
  return { html: page(L, body, routing), routing };
}

function landing(langs) {
  const cards = langs.map((L) => {
    const m = L.overview.meta;
    const parts = [...new Set(L.chapters.map((c) => c.meta.part.replace(/^Part \w+ · /, "")))];
    return `<a class="card t-${L.lang}" href="${L.lang}/">
      <div class="card-top"><span class="icon">${ICONS[L.lang] || ""}</span><div><h2>${esc(m.name)}</h2><div class="kind">${esc(m.version)}</div></div></div>
      <p>${inline(m.card || m.lede)}</p>
      <div class="chips">${parts.map((p) => `<span class="chip">${esc(p)}</span>`).join("")}</div>
      <div class="stat">${L.chapters.length} chapters · ${L.stats.drills} drills · ${L.stats.examples} runnable examples</div>
      <span class="open">Open guide →</span>
    </a>`;
  }).join("\n    ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="stylesheet" href="../shared/hub.css">
<script src="../shared/hub.js" data-tool="langs"></script>
<title>Language Internals</title>
<meta name="description" content="How Python, Java, Go and Rust work underneath, with runnable examples and interview drills.">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='#3b5bdb'/><path d='M12 10l-6 6 6 6M20 10l6 6-6 6' stroke='white' stroke-width='2.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>")}">
<style>
* { box-sizing: border-box; }
[hidden] { display: none !important; }
body { margin: 0; background: var(--hub-bg); color: var(--hub-ink); font: 16px/1.55 var(--hub-sans); -webkit-font-smoothing: antialiased; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px; }
.hero { padding: 44px 0 26px; }
.eyebrow { font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--hub-accent); }
.hero h1 { margin: 6px 0 8px; font-size: clamp(2rem, 4.4vw, 2.6rem); line-height: 1.1; letter-spacing: -.025em; font-weight: 800; }
.hero p { margin: 0; max-width: 64ch; color: var(--hub-ink-2); font-size: 1.05rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; padding-bottom: 32px; }
.card { display: flex; flex-direction: column; gap: 12px; padding: 20px; border-radius: var(--hub-radius); text-decoration: none; color: inherit; background: var(--hub-surface); border: 1px solid var(--hub-line); box-shadow: var(--hub-shadow); transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
.card:hover { border-color: color-mix(in srgb, var(--tint) 55%, var(--hub-line)); box-shadow: var(--hub-shadow-lg); transform: translateY(-2px); }
.card:focus-visible { outline: 2px solid var(--hub-accent); outline-offset: 2px; }
.card-top { display: flex; align-items: center; gap: 12px; }
.icon { width: 42px; height: 42px; flex: none; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--tint) 14%, transparent); color: var(--tint); }
.icon svg { width: 22px; height: 22px; }
.card h2 { margin: 0; font-size: 1.12rem; letter-spacing: -.01em; }
.card .kind { font-size: .8rem; color: var(--hub-ink-3); }
.card p { margin: 0; color: var(--hub-ink-2); font-size: .94rem; flex: 1; }
.card code { font-family: var(--hub-mono); font-size: .86em; background: var(--hub-code-bg); padding: 1px 5px; border-radius: 4px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font-size: .76rem; padding: 2px 8px; border-radius: 999px; background: var(--hub-surface-2); color: var(--hub-ink-2); }
.stat { padding-top: 12px; border-top: 1px solid var(--hub-line); font-size: .86rem; color: var(--hub-ink-2); }
.open { font-weight: 600; font-size: .9rem; color: var(--hub-accent); }
.t-python { --tint: #3572a5; } .t-java { --tint: #b07219; } .t-go { --tint: #00838f; } .t-rust { --tint: #b7410e; } .t-cpp { --tint: #6b5bd2; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .t-python { --tint: #6ea8e0; } :root:not([data-theme="light"]) .t-java { --tint: #e0a24a; } :root:not([data-theme="light"]) .t-go { --tint: #4fd1dc; } :root:not([data-theme="light"]) .t-rust { --tint: #f08a5d; } :root:not([data-theme="light"]) .t-cpp { --tint: #a99bff; } }
:root[data-theme="dark"] .t-python { --tint: #6ea8e0; } :root[data-theme="dark"] .t-java { --tint: #e0a24a; } :root[data-theme="dark"] .t-go { --tint: #4fd1dc; } :root[data-theme="dark"] .t-rust { --tint: #f08a5d; } :root[data-theme="dark"] .t-cpp { --tint: #a99bff; }
footer { padding: 20px 0 36px; border-top: 1px solid var(--hub-line); color: var(--hub-ink-3); font-size: .84rem; }
@media (max-width: 520px) { .hero { padding: 30px 0 20px; } .grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<nav class="hubbar" id="hubbar"></nav>
<main class="wrap">
  <section class="hero">
    <div class="eyebrow">Language internals</div>
    <h1>How your languages work underneath</h1>
    <p>Each guide explains what the runtime and compiler actually do, shows it with programs you can run, and then tests you with interview drills. Every output on these pages was produced by running the program.</p>
  </section>
  <section class="grid" aria-label="Guides">
    ${cards}
    <a class="card t-cpp" href="../guide/">
      <div class="card-top"><span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg></span><div><h2>C++ / OS Guide</h2><div class="kind">C++20 · GCC and Clang</div></div></div>
      <p>The original guide: objects and vtables, threads and locks, networking, memory management and move semantics.</p>
      <div class="chips"><span class="chip">OOP</span><span class="chip">Threads</span><span class="chip">Memory</span><span class="chip">Moves</span></div>
      <div class="stat">26 chapters · 847 drills</div>
      <span class="open">Open guide →</span>
    </a>
  </section>
</main>
<footer><div class="wrap">Read a chapter, then answer its drills before opening the answers. Press <kbd>/</kbd> inside a guide to search it.</div></footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------- main
async function main() {
  const langs = fs.readdirSync(CONTENT).filter((d) => LANGS[d] && fs.existsSync(path.join(CONTENT, d, "00-overview.md"))).filter((d) => !ONLY.length || ONLY.includes(d)).sort((a, b) => Object.keys(LANGS).indexOf(a) - Object.keys(LANGS).indexOf(b));
  const loaded = langs.map(loadLang);
  const built = loaded.map((L) => {
    const before = jobs.size;
    const { html } = buildLang(L);
    L.stats = { examples: jobs.size - before, drills: L.chapters.reduce((n, c) => n + c.drills, 0) };
    return { L, html };
  });
  const problems = await runAll();
  // drop outputs for examples that no longer exist (only when building every language)
  if (!ONLY.length) for (const k of Object.keys(outputs)) if (!jobs.has(k)) delete outputs[k];
  fs.writeFileSync(OUTPUTS, JSON.stringify(Object.fromEntries(Object.entries(outputs).sort()), null, 1) + "\n");
  if (problems.length) {
    console.error(`\n${problems.length} example problem(s):\n\n` + problems.join("\n\n"));
    process.exit(1);
  }
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  for (const f of ["reader.css", "reader.js", "theme.css"]) fs.copyFileSync(path.join(HERE, "reader", f), path.join(DIST, f));
  for (const { L, html } of built) {
    const filled = html.replace(/@@OUT:(\w+):([\w.-]+)@@/g, (_, lang, id) => {
      const o = outputs[`${lang}:${id}`];
      if (!o) fail(L.lang, `no output for ${id} (run without --only?)`);
      return o.out ? esc(o.out) : "(no output)";
    });
    fs.mkdirSync(path.join(DIST, L.lang), { recursive: true });
    fs.writeFileSync(path.join(DIST, L.lang, "index.html"), filled);
    console.log(`${L.lang}: ${L.chapters.length} chapters, ${L.stats.drills} drills, ${L.stats.examples} examples`);
  }
  fs.writeFileSync(path.join(DIST, "index.html"), landing(built.map((b) => b.L)));
  console.log(`built ${path.relative(process.cwd(), DIST) || DIST}/`);
}

main().catch((e) => {
  if (e instanceof BuildError) { console.error("error: " + e.message); process.exit(1); }
  throw e;
});
