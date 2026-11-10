// Check every link in plan/data.js points at something that exists, and that task ids are unique.
// usage: node plan/tools/check.mjs   (run from the repo root; build.sh runs it)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const ctx = { window: {} };
vm.runInNewContext(read("plan/data.js"), ctx);
const P = ctx.window.PLAN;

const guideIds = new Set([...read("guide/index.html").matchAll(/id="(ch\d\d)"/g)].map((m) => m[1]));
const atlasIds = new Set([...read("atlas/content/taxonomy.yaml").matchAll(/\{id: ([\w-]+),/g)].map((m) => m[1]));
const mcq = new Set();
for (const d of read("mcq/data/catalog.js").matchAll(/id: "(\w+)", prefix.*?subdomains: \[(.*?)\]/gs))
  for (const k of d[2].matchAll(/key: "(\w+)"/g)) mcq.add(d[1] + "/" + k[1]);
const videos = new Set();
for (const f of fs.readdirSync(path.join(ROOT, "videos/content"))) {
  const d = JSON.parse(read("videos/content/" + f));
  for (const s of d.subtopics || []) videos.add(d.id + "/" + s.key);
}
const chapter = (root, name, ch) =>
  fs.existsSync(path.join(ROOT, root, "content", name)) &&
  fs.readdirSync(path.join(ROOT, root, "content", name)).some((f) => f.startsWith(ch + "-"));

function ok(href) {
  let m;
  if ((m = href.match(/^\.\.\/guide\/(?:#(ch\d\d))?$/))) return !m[1] || guideIds.has(m[1]);
  if ((m = href.match(/^\.\.\/atlas\/#\/v\/([\w-]+)$/))) return atlasIds.has(m[1]);
  if (href === "../atlas/#/revise" || href === "../atlas/") return true;
  if (/^https:\/\/codeforces\.com\/[\w/?=&]*$/.test(href)) return true;
  if ((m = href.match(/^\.\.\/mcq\/#\/d\/(\w+)\/(\w+)$/))) return mcq.has(m[1] + "/" + m[2]);
  if (href === "../mcq/#/mode/mistakes") return true;
  if ((m = href.match(/^\.\.\/videos\/#\/([\w-]+)\/(\w+)$/))) return videos.has(m[1] + "/" + m[2]);
  if ((m = href.match(/^\.\.\/topics\/([\w-]+)\/#ch(\d\d)$/))) return chapter("topics", m[1], m[2]);
  if ((m = href.match(/^\.\.\/topics\/(?:([\w-]+)\/)?$/))) return !m[1] || fs.existsSync(path.join(ROOT, "topics/content", m[1]));
  if ((m = href.match(/^\.\.\/langs\/(\w+)\/#ch(\d\d)$/))) return chapter("langs", m[1], m[2]);
  if ((m = href.match(/^\.\.\/projects\/([\w-]+)\/#ch(\d\d)$/)))
    return !fs.existsSync(path.join(ROOT, "projects/chapters")) || fs.readdirSync(path.join(ROOT, "projects/chapters", m[1])).some((f) => f.startsWith(m[2] + "-"));
  if ((m = href.match(/^\.\.\/ladder\/([\w.]*)$/))) return !m[1] || fs.existsSync(path.join(ROOT, "ladder", m[1]));
  // Project guides live in a private repo, so only the folder names can be checked, and only on a machine that has them.
  if ((m = href.match(/^\.\.\/projects\/(?:([\w-]+)\/)?$/)))
    return !m[1] || !fs.existsSync(path.join(ROOT, "projects/chapters")) || fs.existsSync(path.join(ROOT, "projects/chapters", m[1]));
  return false;
}

const bad = [], seen = new Map();
const examIds = new Set(P.exams.map((e) => e.id));
for (const d of P.days)
  for (const b of d.blocks)
    for (const t of b.tasks || []) {
      if (seen.has(t.id)) bad.push(`${d.date}: duplicate id ${t.id} (also on ${seen.get(t.id)})`);
      seen.set(t.id, d.date);
      if (!(t.mins > 0)) bad.push(`${d.date}: ${t.id} has no mins`);
      if (t.kind === "exam" && !t.id.startsWith("exam:") && !examIds.has(t.id.split(":")[0]))
        bad.push(`${d.date}: exam task ${t.id} doesn't start with an exam id`);
      for (const k of ["href", "video"]) if (t[k] && !ok(t[k])) bad.push(`${d.date}: ${t.id} ${k} → ${t[k]}`);
    }
for (const o of P.optional || []) if (!ok(o.href)) bad.push(`optional → ${o.href}`);

if (bad.length) {
  console.error("plan: " + bad.length + " problem(s)\n  " + bad.join("\n  "));
  process.exit(1);
}
console.log(`plan: ${P.days.length} days, ${seen.size} tasks, all links ok`);
