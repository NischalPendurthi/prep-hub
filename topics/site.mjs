// Guide list and landing page for /topics/, loaded by `node langs/build.mjs --root topics`.
// The landing page renders the role roadmaps from tracks.json. A checklist item links to its "href" (another
// hub tool) or to a topic guide chapter ("guide" + "ch"), and shows "planned" until that chapter exists,
// so an unwritten chapter never becomes a dead link.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(HERE, "tracks.json"), "utf8"));

function chapterHref({ guide, ch }) {
  const dir = path.join(HERE, "content", guide || "");
  const exists = guide && fs.existsSync(dir) && fs.readdirSync(dir).some((f) => f.startsWith(`${ch}-`));
  return exists ? `${guide}/#ch${ch}` : null;
}

function landing(guides, { esc, inline }) {
  const cards = guides.map((L) => {
    const m = L.overview.meta;
    return `<a class="card" href="${L.lang}/">
      <h3>${esc(m.name)}</h3>
      <p>${inline(m.card || m.lede)}</p>
      <div class="stat">${L.chapters.length} chapters · ${L.stats.drills} drills · ${L.stats.examples} runnable examples</div>
    </a>`;
  }).join("\n    ");
  const item = (it) => {
    const label = inline(it.text);
    const href = it.href || chapterHref(it);
    const title = href ? `<a href="${esc(href)}">${label}</a>` : `${label} <span class="planned">planned</span>`;
    return `<li><label><input type="checkbox" data-id="${esc(it.id)}"><span>${title}</span></label></li>`;
  };
  const tracks = data.tracks.map((t) => `<details class="track" id="${esc(t.id)}">
    <summary><span class="name">${esc(t.name)}</span><span class="count" data-track="${esc(t.id)}"></span><span class="blurb">${inline(t.blurb)}</span></summary>
    ${t.groups.map((g) => `<h4>${esc(g.name)}</h4><ul>${g.items.map(item).join("")}</ul>`).join("\n    ")}
  </details>`).join("\n  ");
  const rounds = data.rounds.map((r) => `<tr><td>${inline(r.round)}</td><td>${inline(r.tests)}</td><td>${inline(r.prep)}</td></tr>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="stylesheet" href="../shared/hub.css">
<script src="../shared/hub.js" data-tool="topics"></script>
<title>Topic Roadmaps</title>
<meta name="description" content="Concept checklists by role type, with topic guides on embedded systems, compilers, machine learning, system design and more.">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='#a8327a'/><circle cx='11' cy='11' r='3.5' fill='white'/><circle cx='21' cy='21' r='3.5' fill='white'/><path d='M14 11h4a3 3 0 0 1 3 3v4' stroke='white' stroke-width='2.4' fill='none'/></svg>")}">
<style>
* { box-sizing: border-box; }
body { margin: 0; background: var(--hub-bg); color: var(--hub-ink); font: 16px/1.55 var(--hub-sans); -webkit-font-smoothing: antialiased; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px; }
.hero { padding: 44px 0 22px; }
.eyebrow { font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--hub-accent); }
.hero h1 { margin: 6px 0 8px; font-size: clamp(2rem, 4.4vw, 2.6rem); line-height: 1.1; letter-spacing: -.025em; font-weight: 800; }
.hero p { margin: 0; max-width: 64ch; color: var(--hub-ink-2); font-size: 1.05rem; }
h2 { margin: 30px 0 10px; font-size: 1.3rem; letter-spacing: -.01em; }
.sub { margin: 0 0 14px; color: var(--hub-ink-2); font-size: .95rem; max-width: 72ch; }
.track { margin-bottom: 10px; background: var(--hub-surface); border: 1px solid var(--hub-line); border-radius: var(--hub-radius); padding: 0 18px; }
.track summary { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; padding: 14px 0; cursor: pointer; }
.track .name { font-weight: 700; }
.track .count { font-family: var(--hub-mono); font-size: .84rem; color: var(--hub-ink-2); }
.track .blurb { grid-column: 1 / -1; font-size: .9rem; color: var(--hub-ink-2); }
.track h4 { margin: 14px 0 6px; font-size: .78rem; letter-spacing: .06em; text-transform: uppercase; color: var(--hub-ink-3); }
.track ul { list-style: none; margin: 0 0 8px; padding: 0; }
.track ul:last-child { margin-bottom: 18px; }
.track li label { display: flex; gap: 10px; align-items: flex-start; padding: 4px 0; font-size: .95rem; cursor: pointer; }
.track input { margin-top: 5px; flex: none; accent-color: var(--hub-accent); }
.track a { color: var(--hub-accent); }
.track code, td code, .card code { font-family: var(--hub-mono); font-size: .86em; background: var(--hub-code-bg); padding: 1px 5px; border-radius: 4px; }
.planned { font-size: .72rem; padding: 1px 7px; border-radius: 99px; background: var(--hub-surface-2); color: var(--hub-ink-3); white-space: nowrap; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.card { display: flex; flex-direction: column; gap: 8px; padding: 18px; border-radius: var(--hub-radius); text-decoration: none; color: inherit; background: var(--hub-surface); border: 1px solid var(--hub-line); }
.card:hover { box-shadow: var(--hub-shadow-lg); }
.card:focus-visible { outline: 2px solid var(--hub-accent); outline-offset: 2px; }
.card h3 { margin: 0; font-size: 1.05rem; }
.card p { margin: 0; flex: 1; color: var(--hub-ink-2); font-size: .92rem; }
.card .stat { padding-top: 10px; border-top: 1px solid var(--hub-line); font-size: .84rem; color: var(--hub-ink-2); }
.table-wrap { overflow-x: auto; background: var(--hub-surface); border: 1px solid var(--hub-line); border-radius: var(--hub-radius); }
table { width: 100%; min-width: 620px; border-collapse: collapse; font-size: .92rem; }
th, td { padding: 9px 12px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--hub-line); }
tr:last-child td { border-bottom: 0; }
th { font-size: .78rem; letter-spacing: .04em; text-transform: uppercase; color: var(--hub-ink-3); }
td:first-child { font-weight: 600; white-space: nowrap; }
footer { margin-top: 36px; padding: 20px 0 36px; border-top: 1px solid var(--hub-line); color: var(--hub-ink-3); font-size: .84rem; }
@media (max-width: 520px) { .hero { padding: 30px 0 18px; } .grid { grid-template-columns: 1fr; } td:first-child { white-space: normal; } }
</style>
</head>
<body>
<nav class="hubbar" id="hubbar"></nav>
<main class="wrap">
  <section class="hero">
    <div class="eyebrow">Role roadmaps</div>
    <h1>What to prepare, by role type</h1>
    <p>Open the tracks that match the roles you are preparing for and tick concepts as you can explain them without notes. Each concept links to the guide, MCQ set or problem sheet that covers it.</p>
  </section>

  <h2>Tracks</h2>
  ${tracks}

  <h2>Topic guides</h2>
  <p class="sub">Chapters with drills on topics the rest of the hub does not cover. Every program shown with output was actually run.</p>
  <section class="grid" aria-label="Guides">
    ${cards}
  </section>

  <h2>What each round tests</h2>
  <p class="sub">General guidance by round type. Formats vary, so check the instructions you receive for each process.</p>
  <div class="table-wrap"><table><thead><tr><th>Round</th><th>What it tests</th><th>How to prepare</th></tr></thead><tbody>${rounds}</tbody></table></div>
</main>
<footer><div class="wrap">Progress is saved in this browser.</div></footer>
<script>
(function () {
  "use strict";
  var KEY = "topics.progress.v1", state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
  function counts() {
    document.querySelectorAll(".track").forEach(function (t) {
      var boxes = t.querySelectorAll("input"), done = t.querySelectorAll("input:checked").length;
      t.querySelector(".count").textContent = done + " / " + boxes.length;
    });
  }
  document.querySelectorAll(".track input").forEach(function (box) {
    box.checked = !!state[box.dataset.id];
    box.addEventListener("change", function () {
      document.querySelectorAll('.track input[data-id="' + box.dataset.id + '"]').forEach(function (b) { b.checked = box.checked; });
      if (box.checked) state[box.dataset.id] = 1; else delete state[box.dataset.id];
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      counts();
    });
  });
  counts();
})();
</script>
</body>
</html>
`;
}

export default { tool: "topics", guides: data.guides, landing };
