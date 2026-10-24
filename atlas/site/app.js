/* CP Atlas: single-page app over window.ATLAS (built by tools/build.py). */
(function () {
  "use strict";
  const D = window.ATLAS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = (s) => (window.marked ? marked.parse(s || "") : `<pre><code>${esc(s)}</code></pre>`);
  const mdi = (s) => (window.marked ? marked.parseInline(s || "") : esc(s));

  // localStorage can be unavailable (private mode, blocked storage): never let it break the page
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  if (!D) {
    $("#main").innerHTML = `<div class="note">No data found. Run <code>python tools/build.py</code> first.</div>`;
    return;
  }

  // ------------------------------------------------------------ derived data
  const V = D.variants;
  const order = D.categories.flatMap((c) => c.concepts.flatMap((k) => k.variants));
  const mineById = Object.fromEntries(D.mine.map((p) => [p.id, p]));
  const counted = (p) => p.status !== "unsolved";
  const vCount = (vid) => V[vid].mine.filter((id) => counted(mineById[id])).length;
  const heat = (n) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);

  const today = () => new Date().toLocaleDateString("en-CA");
  const addDays = (d, n) => { const t = new Date(d + "T00:00:00"); t.setDate(t.getDate() + n); return t.toLocaleDateString("en-CA"); };
  const fmtDate = (d) => { if (!d) return ""; const t = new Date(d + "T00:00:00"); return t.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); };

  // ------------------------------------------------------------ spaced repetition
  const INTERVALS = [1, 3, 7, 21, 60, 120];
  let review = store.get("atlas-review", {});
  const dueOf = (p) => (review[p.id] ? review[p.id].due : addDays(p.date || today(), 1));
  const stageOf = (p) => (review[p.id] ? review[p.id].stage : 0);
  const reviewable = () => D.mine.filter((p) => p.status === "solved");
  const dueList = () => reviewable().filter((p) => dueOf(p) <= today()).sort((a, b) => (dueOf(a) < dueOf(b) ? -1 : 1));
  function grade(p, ok) {
    const s = ok ? Math.min(stageOf(p) + 1, INTERVALS.length - 1) : 0;
    review[p.id] = { stage: s, due: addDays(today(), ok ? INTERVALS[s] : 1), last: today() };
    store.set("atlas-review", review);
    updateDuePill();
  }
  function updateDuePill() {
    const n = dueList().length, pill = $("#due-pill");
    pill.hidden = n === 0;
    pill.textContent = n;
  }

  // ------------------------------------------------------------ small renderers
  const platBadge = (p) => `<span class="badge plat plat-${esc(p)}">${esc(p)}</span>`;
  const ratingBadge = (r) => (r == null || r === "" ? "" : `<span class="badge">${esc(r)}</span>`);
  const vChip = (vid) => V[vid] ? `<a class="chip ${V[vid].ready ? "" : "planned"}" href="#/v/${vid}">${esc(V[vid].title)}</a>` : "";
  const extLink = (url, label = "open ↗") => (url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>` : "");

  function problemCard(p, { open = false, hideVariants = false } = {}) {
    const code = p.body ? `<details ${open ? "open" : ""}><summary>Code &amp; notes</summary><div class="prose">${md(p.body)}</div></details>` : "";
    return `<div class="card pcard">
      <div class="head">
        ${p.star ? `<span class="star" title="starred">★</span>` : ""}
        <a class="title" href="#/p/${esc(p.id)}">${esc(p.title)}</a>
        ${extLink(p.url)}
      </div>
      <div class="meta">${platBadge(p.platform)} ${ratingBadge(p.rating)} <span>${fmtDate(p.date)}</span>
        ${p.status !== "solved" ? `<span class="badge">${esc(p.status)}</span>` : ""}
        ${(p.tags || []).filter((t) => !t.startsWith("cf:")).map((t) => `<span class="badge">${esc(t)}</span>`).join(" ")}</div>
      ${hideVariants ? "" : `<div style="margin-top:6px">${p.variants.map(vChip).join("")}</div>`}
      ${p.insight ? `<div class="insight">${mdi(p.insight)}</div>` : `<div class="insight muted">No insight yet: what was the trick?</div>`}
      ${p.mistakes ? `<div class="mistakes"><b>Mistakes:</b> ${mdi(p.mistakes)}</div>` : ""}
      ${code}
    </div>`;
  }

  function codeBlock(core, full) {
    const id = "c" + Math.random().toString(36).slice(2, 8);
    return `<div class="code-wrap" id="${id}">
      <div class="code-tools">
        <div class="seg"><button class="on" data-k="core">Core</button><button data-k="full">Full file</button></div>
        <button class="btn copy">Copy</button>
      </div>
      <pre><code class="language-cpp" data-core="${esc(core)}" data-full="${esc(full)}">${esc(core)}</code></pre>
    </div>`;
  }
  function wireCode(root) {
    $$(".code-wrap", root).forEach((w) => {
      const code = $("code", w);
      $$(".seg button", w).forEach((b) => b.addEventListener("click", () => {
        $$(".seg button", w).forEach((x) => x.classList.toggle("on", x === b));
        code.textContent = code.dataset[b.dataset.k];
        code.removeAttribute("data-highlighted");
        if (window.hljs) hljs.highlightElement(code);
      }));
      $(".copy", w).addEventListener("click", (e) => {
        const btn = e.currentTarget, text = code.textContent;
        const done = () => { btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy"), 1200); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {});
        else { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); done(); } catch (er) {} t.remove(); }
      });
    });
  }
  function highlight(root) {
    if (!window.hljs) return;
    $$("pre code", root).forEach((el) => { if (!el.dataset.highlighted) hljs.highlightElement(el); });
  }

  // ------------------------------------------------------------ sidebar
  let openCats = store.get("atlas-open-cats", null);
  function renderTree(filter = "") {
    const f = filter.trim().toLowerCase();
    const cur = currentVariant();
    if (!openCats) openCats = D.categories.slice(0, 2).map((c) => c.id);
    $("#tree").innerHTML = D.categories.map((c) => {
      const concepts = c.concepts.map((k) => {
        const vs = k.variants.filter((vid) => !f || (V[vid].title + " " + k.title + " " + c.title).toLowerCase().includes(f));
        if (!vs.length) return "";
        return `<div class="concept"><div class="concept-title">${esc(k.title)}</div>${vs.map((vid) => {
          const n = vCount(vid);
          return `<a class="vlink ${V[vid].ready ? "" : "planned"} ${vid === cur ? "active" : ""}" href="#/v/${vid}">${esc(V[vid].title)}${n ? `<span class="n">${n}</span>` : ""}</a>`;
        }).join("")}</div>`;
      }).join("");
      if (!concepts) return "";
      const total = c.concepts.reduce((s, k) => s + k.variants.length, 0);
      const ready = c.concepts.reduce((s, k) => s + k.variants.filter((v) => V[v].ready).length, 0);
      const open = f || openCats.includes(c.id) || (cur && V[cur].category === c.id);
      return `<details class="cat" data-cat="${c.id}" ${open ? "open" : ""}><summary>${esc(c.title)}<span class="count">${ready}/${total}</span></summary>${concepts}</details>`;
    }).join("");
    $$("#tree details.cat").forEach((d) => d.addEventListener("toggle", () => {
      if (f) return;
      const id = d.dataset.cat;
      openCats = d.open ? [...new Set([...openCats, id])] : openCats.filter((x) => x !== id);
      store.set("atlas-open-cats", openCats);
    }));
  }
  $("#side-filter").addEventListener("input", (e) => renderTree(e.target.value));

  // ------------------------------------------------------------ views
  function viewHome() {
    const ready = order.filter((v) => V[v].ready).length;
    const solved = D.mine.filter((p) => p.status === "solved");
    const needs = D.mine.filter((p) => p.status === "needs-insight");
    const due = dueList();
    const catCards = D.categories.map((c) => {
      const vs = c.concepts.flatMap((k) => k.variants);
      const r = vs.filter((v) => V[v].ready).length;
      const mine = new Set(vs.flatMap((v) => V[v].mine)).size;
      return `<a class="card cat-card" href="#/map#${c.id}"><b>${esc(c.title)}</b>
        <div class="bar"><i style="width:${(100 * r) / vs.length}%"></i></div>
        <div class="muted" style="font-size:.85rem">${r}/${vs.length} variants written · ${mine} of yours</div></a>`;
    }).join("");
    const row = (p) => `<div class="list-row">${platBadge(p.platform)}<a class="t" href="#/p/${esc(p.id)}">${esc(p.title)}</a><span class="spacer"></span><span class="muted" style="font-size:.85rem">${fmtDate(p.date)}</span></div>`;
    return `<h1>Your pattern atlas</h1>
      <p class="lead">Every technique you've used, organised so you can find it again, plus a revision queue so good problems don't fade.</p>
      <div class="stats">
        <a class="stat" href="#/revise"><b>${due.length}</b><span>due for revision</span></a>
        <a class="stat" href="#/log"><b>${solved.length}</b><span>problems logged</span></a>
        <a class="stat" href="#/log?status=needs-insight"><b>${needs.length}</b><span>need an insight</span></a>
        <a class="stat" href="#/map"><b>${ready}<small class="muted" style="font-size:.9rem">/${order.length}</small></b><span>variants written</span></a>
      </div>
      <h2>Recently solved</h2>
      <div class="card">${D.mine.slice(0, 8).map(row).join("") || `<div class="muted">Nothing yet. Add one with <code>python tools/add.py</code>.</div>`}</div>
      ${needs.length ? `<h2>Needs an insight</h2><div class="card">${needs.slice(0, 6).map(row).join("")}</div>` : ""}
      <h2>Categories</h2><div class="cat-grid">${catCards}</div>`;
  }

  function viewVariant(vid) {
    const v = V[vid];
    if (!v) return `<div class="empty">Unknown variant <code>${esc(vid)}</code>.</div>`;
    const i = order.indexOf(vid), prev = order[i - 1], next = order[i + 1];
    const std = v.standard.map((k) => D.standard[k]);
    const mine = v.mine.map((id) => mineById[id]);
    const stdTable = std.length ? `<table><thead><tr><th></th><th>Problem</th><th>Difficulty</th><th>Also</th></tr></thead><tbody>${std.map((s) =>
      `<tr><td>${platBadge(s.platform)}</td><td><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> ${s.solved ? `<span class="solved-mark" title="you solved this">✓</span>` : ""}</td>
       <td>${esc(s.rating ?? "")}</td><td>${(s.variants || []).filter((x) => x !== vid).map(vChip).join("")}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No standard problems listed yet.</div>`;
    return `<div class="crumb">${esc(v.categoryTitle)} › ${esc(v.conceptTitle)}</div>
      <h1>${esc(v.title)}</h1>
      ${v.ready ? `<div class="row" style="margin-bottom:6px"><span class="badge wrap">⏱ ${esc(v.complexity)}</span><span class="badge">${mine.length} of yours</span></div>` :
        `<div class="note">This variant is planned but not written yet. Its notes and template come in a later seeding batch. Your problems and standard problems still show below.</div>`}
      ${v.ready ? `
        <h2>Recognise it when you see</h2><ul class="signals">${v.signals.map((s) => `<li>${mdi(s)}</li>`).join("")}</ul>
        <h2>Core idea</h2><div class="idea prose">${md(v.idea)}</div>
        <h2>Template</h2>${codeBlock(v.templateCore, v.templateFull)}
        ${v.pitfalls.length ? `<h2>Pitfalls</h2><ul class="pitfalls">${v.pitfalls.map((s) => `<li>${mdi(s)}</li>`).join("")}</ul>` : ""}
        ${v.body ? `<h2>Notes</h2><div class="prose">${md(v.body)}</div>` : ""}` : ""}
      <h2>Your problems</h2>
      ${mine.length ? `<div class="stack">${mine.map((p) => problemCard(p, { hideVariants: false })).join("")}</div>` : `<div class="empty">None yet. When you solve one, add it with <code>--variant ${esc(vid)}</code>.</div>`}
      <h2>Standard problems</h2>${stdTable}
      ${v.related && v.related.length ? `<h2>Related</h2><div>${v.related.map(vChip).join("")}</div>` : ""}
      <div class="pager"><span>${prev ? `← <a href="#/v/${prev}">${esc(V[prev].title)}</a>` : ""}</span><span>${next ? `<a href="#/v/${next}">${esc(V[next].title)}</a> →` : ""}</span></div>`;
  }

  function viewProblem(id) {
    const p = mineById[id];
    if (!p) return `<div class="empty">Unknown problem <code>${esc(id)}</code>.</div>`;
    const r = review[p.id];
    return `<div class="crumb"><a href="#/log">Log</a> › ${fmtDate(p.date)}</div>
      ${problemCard(p, { open: true })}
      <p class="muted" style="font-size:.88rem;margin-top:12px">Next revision: ${fmtDate(dueOf(p))}${r ? ` · stage ${r.stage + 1}/${INTERVALS.length}` : ""}</p>`;
  }

  function viewMap() {
    const cats = D.categories.map((c) => {
      const lis = c.concepts.map((k) => `<li><div class="mm-concept">${esc(k.title)}</div><div class="mm-variants">${k.variants.map((vid) => {
        const n = vCount(vid);
        return `<a class="mm-v ${V[vid].ready ? "h" + heat(n) : "planned"}" href="#/v/${vid}">${esc(V[vid].title)}${n ? `<b>${n}</b>` : ""}</a>`;
      }).join("")}</div></li>`).join("");
      const vs = c.concepts.flatMap((k) => k.variants);
      return `<section class="mm-cat" id="${c.id}"><h2>${esc(c.title)} <small>${vs.filter((v) => V[v].ready).length}/${vs.length} written · ${vs.reduce((s, v) => s + vCount(v), 0)} solved</small></h2><ul class="mm-concepts">${lis}</ul></section>`;
    }).join("");
    return `<h1>Map</h1>
      <p class="lead">Every concept and variant. Colour shows how many of your problems use it, so pale areas are where to practise next.</p>
      <div class="legend"><span><i style="background:var(--heat-0)"></i>0</span><span><i style="background:var(--heat-1)"></i>1</span><span><i style="background:var(--heat-2)"></i>2–3</span><span><i style="background:var(--heat-3)"></i>4–6</span><span><i style="background:var(--heat-4)"></i>7+</span><span><i style="border:1px dashed var(--faint)"></i>planned</span></div>
      ${cats}`;
  }

  function viewLog(params) {
    const saved = store.get("atlas-log-filters", {});
    const f = { q: "", platform: "", status: "", star: false, min: "", max: "", ...saved, ...params };
    const plats = [...new Set(D.mine.map((p) => p.platform))].sort();
    setTimeout(() => wireLog(f), 0);
    return `<h1>Log</h1><p class="lead">Everything you've solved, newest first.</p>
      <div class="filters" id="filters">
        <input type="search" id="f-q" placeholder="Filter by title, insight, tag, variant…" value="${esc(f.q)}">
        <select id="f-platform"><option value="">All platforms</option>${plats.map((p) => `<option ${p === f.platform ? "selected" : ""}>${esc(p)}</option>`).join("")}</select>
        <select id="f-status">${[["", "Any status"], ["solved", "Solved"], ["needs-insight", "Needs insight"], ["unsolved", "Unsolved"]].map(([v, l]) => `<option value="${v}" ${v === f.status ? "selected" : ""}>${l}</option>`).join("")}</select>
        <input type="number" id="f-min" placeholder="min rating" value="${esc(f.min)}">
        <input type="number" id="f-max" placeholder="max rating" value="${esc(f.max)}">
        <label><input type="checkbox" id="f-star" ${f.star ? "checked" : ""}> ★ only</label>
      </div>
      <div id="log-list"></div>`;
  }
  function wireLog(f) {
    const ids = ["q", "platform", "status", "min", "max", "star"];
    const read = () => ({ q: $("#f-q").value, platform: $("#f-platform").value, status: $("#f-status").value, min: $("#f-min").value, max: $("#f-max").value, star: $("#f-star").checked });
    const draw = (ff) => {
      const q = ff.q.trim().toLowerCase();
      const rows = D.mine.filter((p) => {
        if (ff.platform && p.platform !== ff.platform) return false;
        if (ff.status && p.status !== ff.status) return false;
        if (ff.star && !p.star) return false;
        const r = typeof p.rating === "number" ? p.rating : null;
        if (ff.min && (r == null || r < +ff.min)) return false;
        if (ff.max && (r == null || r > +ff.max)) return false;
        if (q) {
          const hay = [p.title, p.insight, p.mistakes, ...(p.tags || []), ...p.variants.map((v) => V[v] ? V[v].title : v)].join(" ").toLowerCase();
          if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
        }
        return true;
      });
      let html = "", last = "";
      rows.forEach((p) => {
        if (p.date !== last) { html += `<div class="day">${fmtDate(p.date)}</div>`; last = p.date; }
        html += problemCard(p);
      });
      $("#log-list").innerHTML = rows.length ? `<div class="stack">${html}</div>` : `<div class="empty">No problems match these filters.</div>`;
      highlight($("#log-list"));
    };
    ids.forEach((k) => $("#f-" + k).addEventListener("input", () => { const ff = read(); store.set("atlas-log-filters", ff); draw(ff); }));
    draw(f);
  }

  let rv = { mode: "due", i: 0, shown: false, queue: [] };
  function viewRevise() {
    rv.queue = rv.mode === "due" ? dueList() : reviewable().filter((p) => p.star);
    rv.i = 0; rv.shown = false;
    setTimeout(drawCard, 0);
    return `<h1>Revise</h1>
      <p class="lead">Recall the pattern and the key insight <i>before</i> revealing. Intervals: ${INTERVALS.join(", ")} days. Keys: <kbd>Space</kbd> reveal, <kbd>1</kbd> forgot, <kbd>2</kbd> got it.</p>
      <div class="row" style="margin-bottom:14px">
        <div class="seg" id="rv-mode"><button data-m="due" class="${rv.mode === "due" ? "on" : ""}">Due today</button><button data-m="star" class="${rv.mode === "star" ? "on" : ""}">Starred</button></div>
        <span class="spacer"></span>
        <button class="btn" id="rv-export">Export progress</button>
        <label class="btn" style="cursor:pointer">Import<input type="file" id="rv-import" accept="application/json" hidden></label>
      </div>
      <div id="rv-card"></div>`;
  }
  function drawCard() {
    const box = $("#rv-card");
    if (!box) return;
    $$("#rv-mode button").forEach((b) => (b.onclick = () => { rv.mode = b.dataset.m; render(); }));
    $("#rv-export").onclick = () => {
      const blob = new Blob([JSON.stringify(review, null, 1)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `cp-atlas-review-${today()}.json`; a.click();
    };
    $("#rv-import").onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      file.text().then((t) => { try { review = { ...review, ...JSON.parse(t) }; store.set("atlas-review", review); updateDuePill(); render(); } catch (er) { alert("That file is not a CP Atlas export."); } });
    };
    const p = rv.queue[rv.i];
    if (!p) {
      const upcoming = reviewable().filter((q) => dueOf(q) > today()).sort((a, b) => (dueOf(a) < dueOf(b) ? -1 : 1)).slice(0, 8);
      box.innerHTML = `<div class="card flash"><div class="front"><div class="title">All caught up</div><p class="prompt">${rv.mode === "due" ? "Nothing else is due today." : "No starred problems yet. Star the good ones with <code>star: true</code>."}</p></div></div>
        ${upcoming.length ? `<h2>Coming up</h2><div class="card">${upcoming.map((q) => `<div class="list-row">${platBadge(q.platform)}<a class="t" href="#/p/${esc(q.id)}">${esc(q.title)}</a><span class="spacer"></span><span class="muted" style="font-size:.85rem">${fmtDate(dueOf(q))}</span></div>`).join("")}</div>` : ""}`;
      return;
    }
    box.innerHTML = `<div class="progress">Card ${rv.i + 1} of ${rv.queue.length}</div>
      <div class="card flash">
        <div class="front">
          <div class="row" style="justify-content:center;margin-bottom:8px">${platBadge(p.platform)} ${ratingBadge(p.rating)} ${extLink(p.url, "statement ↗")}</div>
          <div class="title">${esc(p.title)}</div>
          <p class="prompt">Which pattern is this, and what's the one-line trick?</p>
          ${rv.shown ? "" : `<button class="btn primary" id="rv-reveal">Reveal</button>`}
        </div>
        ${rv.shown ? `<div>${problemCard(p)}</div>
          <div class="grade"><button class="btn bad" id="rv-forgot">Forgot (1)</button><button class="btn good" id="rv-got">Got it (2)</button></div>` : ""}
      </div>`;
    highlight(box);
    const reveal = $("#rv-reveal");
    if (reveal) reveal.onclick = () => { rv.shown = true; drawCard(); };
    const step = (ok) => { grade(p, ok); rv.i++; rv.shown = false; drawCard(); };
    if ($("#rv-forgot")) { $("#rv-forgot").onclick = () => step(false); $("#rv-got").onclick = () => step(true); }
  }
  document.addEventListener("keydown", (e) => {
    if (!$("#rv-card") || !$("#search").hidden || /input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (e.key === " " && $("#rv-reveal")) { e.preventDefault(); $("#rv-reveal").click(); }
    if (e.key === "1" && $("#rv-forgot")) $("#rv-forgot").click();
    if (e.key === "2" && $("#rv-got")) $("#rv-got").click();
  });

  // ------------------------------------------------------------ search
  const index = [
    ...order.map((vid) => ({ group: "Variants", href: `#/v/${vid}`, title: V[vid].title, sub: `${V[vid].categoryTitle} › ${V[vid].conceptTitle}`, hay: [V[vid].title, V[vid].conceptTitle, V[vid].categoryTitle, ...(V[vid].signals || []), V[vid].idea || ""].join(" ") })),
    ...D.mine.map((p) => ({ group: "Your problems", href: `#/p/${p.id}`, title: p.title, sub: p.insight, hay: [p.title, p.insight, p.mistakes, ...(p.tags || []), ...p.variants].join(" ") })),
    ...D.standard.map((s) => ({ group: "Standard problems", href: s.url, ext: true, title: `${s.title}`, sub: `${s.platform} · ${(s.variants || []).map((v) => V[v] ? V[v].title : v).join(", ")}`, hay: [s.title, s.platform, s.id, ...(s.variants || [])].join(" ") })),
  ].map((x) => ({ ...x, lc: x.hay.toLowerCase(), tl: x.title.toLowerCase() }));
  let sel = 0;
  function runSearch(q) {
    const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    const res = toks.length ? index.filter((x) => toks.every((t) => x.lc.includes(t)))
      .map((x) => ({ x, s: toks.every((t) => x.tl.includes(t)) ? 0 : 1 })).sort((a, b) => a.s - b.s).slice(0, 40).map((r) => r.x) : index.filter((x) => x.group === "Variants" && V[x.href.slice(4)].ready).slice(0, 12);
    let html = "", g = "";
    res.forEach((x, i) => {
      if (x.group !== g) { html += `<div class="sr-group">${x.group}</div>`; g = x.group; }
      html += `<a class="sr ${i === sel ? "sel" : ""}" href="${esc(x.href)}" ${x.ext ? 'target="_blank" rel="noopener"' : ""}>${esc(x.title)}<small>${esc(x.sub || "")}</small></a>`;
    });
    $("#search-results").innerHTML = html || `<div class="empty" style="margin:8px">No matches.</div>`;
  }
  function openSearch() { $("#search").hidden = false; sel = 0; const i = $("#search-input"); i.value = ""; runSearch(""); i.focus(); }
  function closeSearch() { $("#search").hidden = true; }
  $("#search-btn").addEventListener("click", openSearch);
  $("#search").addEventListener("click", (e) => { if (e.target.id === "search" || e.target.closest(".sr")) closeSearch(); });
  $("#search-input").addEventListener("input", (e) => { sel = 0; runSearch(e.target.value); });
  $("#search-input").addEventListener("keydown", (e) => {
    const items = $$(".sr");
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % Math.max(items.length, 1);
      items.forEach((it, i) => it.classList.toggle("sel", i === sel));
      if (items[sel]) items[sel].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && items[sel]) { items[sel].click(); closeSearch(); }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#search").hidden ? openSearch() : closeSearch(); }
    else if (e.key === "/" && $("#search").hidden && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    else if (e.key === "Escape") { closeSearch(); document.body.classList.remove("side-open"); }
  });

  // ------------------------------------------------------------ theme + mobile sidebar
  function applyTheme() {
    const t = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    $("#hl-light").disabled = t === "dark";
    $("#hl-dark").disabled = t !== "dark";
  }
  $("#theme-btn").addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nxt = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nxt;
    store.set("atlas-theme", nxt);
    applyTheme();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  $("#menu-btn").addEventListener("click", () => document.body.classList.toggle("side-open"));
  $("#scrim").addEventListener("click", () => document.body.classList.remove("side-open"));

  // ------------------------------------------------------------ router
  function parseHash() {
    const raw = (location.hash.slice(1) || "/").split("#")[0];  // "#/map#ds" -> "/map"
    const [path, qs] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    const params = Object.fromEntries(new URLSearchParams(qs || ""));
    return { parts, params };
  }
  function currentVariant() { const { parts } = parseHash(); return parts[0] === "v" ? parts[1] : null; }
  function render() {
    const { parts, params } = parseHash();
    const [view, arg] = parts;
    const tab = { undefined: "home", v: "", p: "log", map: "map", log: "log", revise: "revise" }[view] ?? "";
    $$("#tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
    let html;
    if (view === "v") html = viewVariant(arg);
    else if (view === "p") html = viewProblem(arg);
    else if (view === "map") html = viewMap();
    else if (view === "log") html = viewLog(params);
    else if (view === "revise") html = viewRevise();
    else html = viewHome();
    const main = $("#main");
    main.innerHTML = html;
    wireCode(main);
    highlight(main);
    renderTree($("#side-filter").value);
    document.body.classList.remove("side-open");
    const anchor = location.hash.split("#")[2];
    if (anchor && document.getElementById(anchor)) document.getElementById(anchor).scrollIntoView();
    else window.scrollTo(0, 0);
    const v = view === "v" && V[arg];
    document.title = v ? `${v.title} · CP Atlas` : "CP Atlas";
    const active = $(".vlink.active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }
  window.addEventListener("hashchange", render);
  applyTheme();
  updateDuePill();
  render();
})();
