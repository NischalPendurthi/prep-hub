// Guide list and landing page for /guide/, loaded by `node langs/build.mjs --root guide`.
// /guide/ used to be one C++/OS/Networks page. redirects.json maps every old anchor (#ch09, #ch09-cookies, …)
// to its place in the C++ or OS & Networks guide, so old links still land on the right section.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const redirects = fs.readFileSync(path.join(HERE, "redirects.json"), "utf8").trim();

function landing(guides, { esc, inline }) {
  const cards = guides.map((L) => {
    const m = L.overview.meta;
    const parts = [...new Set(L.chapters.map((c) => c.meta.part.replace(/^Part \w+ · /, "")))];
    return `<a class="card" href="${L.lang}/">
      <div class="kind">${esc(m.version)}</div>
      <h2>${esc(m.name)}</h2>
      <p>${inline(m.card || m.lede)}</p>
      <div class="chips">${parts.map((p) => `<span class="chip">${esc(p)}</span>`).join("")}</div>
      <div class="stat">${L.chapters.length} chapters · ${L.stats.drills} drills</div>
      <span class="open">Open guide →</span>
    </a>`;
  }).join("\n    ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>
(function () {
  var map = ${redirects};
  var h = location.hash.slice(1);
  var to = map[h] || map[h.slice(0, 4)];          // unknown section: fall back to its chapter
  if (to) location.replace(to);
})();
</script>
<link rel="stylesheet" href="../shared/hub.css">
<script src="../shared/hub.js" data-tool="guide"></script>
<title>C++ and OS Guides</title>
<meta name="description" content="Interview guides for C++ and for operating systems and networks, with compiled examples and drills.">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='#6b7cff'/><text x='16' y='22' font-size='14' font-family='monospace' font-weight='700' text-anchor='middle' fill='white'>C++</text></svg>")}">
<style>
* { box-sizing: border-box; }
body { margin: 0; background: var(--hub-bg); color: var(--hub-ink); font: 16px/1.55 var(--hub-sans); -webkit-font-smoothing: antialiased; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px; }
.hero { padding: 44px 0 26px; }
.eyebrow { font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--hub-accent); }
.hero h1 { margin: 6px 0 8px; font-size: clamp(2rem, 4.4vw, 2.6rem); line-height: 1.1; letter-spacing: -.025em; font-weight: 800; }
.hero p { margin: 0; max-width: 64ch; color: var(--hub-ink-2); font-size: 1.05rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; padding-bottom: 32px; }
.card { display: flex; flex-direction: column; gap: 10px; padding: 22px; border-radius: var(--hub-radius); text-decoration: none; color: inherit; background: var(--hub-surface); border: 1px solid var(--hub-line); box-shadow: var(--hub-shadow); transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
.card:hover { border-color: var(--hub-accent); box-shadow: var(--hub-shadow-lg); transform: translateY(-2px); }
.card:focus-visible { outline: 2px solid var(--hub-accent); outline-offset: 2px; }
.card h2 { margin: 0; font-size: 1.25rem; letter-spacing: -.01em; }
.card .kind { font-size: .8rem; color: var(--hub-ink-3); }
.card p { margin: 0; color: var(--hub-ink-2); font-size: .95rem; flex: 1; }
.card code { font-family: var(--hub-mono); font-size: .86em; background: var(--hub-code-bg); padding: 1px 5px; border-radius: 4px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font-size: .76rem; padding: 2px 8px; border-radius: 999px; background: var(--hub-surface-2); color: var(--hub-ink-2); }
.stat { padding-top: 12px; border-top: 1px solid var(--hub-line); font-size: .86rem; color: var(--hub-ink-2); }
.open { font-weight: 600; font-size: .9rem; color: var(--hub-accent); }
@media (max-width: 520px) { .hero { padding: 30px 0 20px; } .grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<nav class="hubbar" id="hubbar"></nav>
<main class="wrap">
  <section class="hero">
    <div class="eyebrow">Core guides</div>
    <h1>C++, and the OS underneath it</h1>
    <p>Two reader guides with compiled examples and interview drills: one for the C++ language, one for operating systems and networks.</p>
  </section>
  <section class="grid" aria-label="Guides">
    ${cards}
  </section>
</main>
</body>
</html>
`;
}

export default { tool: "guide", guides: ["cpp", "os"], landing };
