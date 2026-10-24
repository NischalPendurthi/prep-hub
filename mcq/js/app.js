/* Placement MCQ Prep — single-page app, vanilla JS, works on file:// */
(function () {
  "use strict";

  /* ================= Data indexing ================= */
  var CATALOG = window.CATALOG || [];
  var ALL = (window.QUESTIONS || []).slice();
  var LEVELS = ["easy", "medium", "hard"];
  var LEVEL_NAMES = { easy: "Easy", medium: "Medium", hard: "Hard" };
  var byId = {};
  var domainById = {};
  var subByRef = {};   // "domainId|subKey" -> subdomain object
  var subByName = {};  // "domainId|subtopic name" -> subdomain object

  CATALOG.forEach(function (d) {
    domainById[d.id] = d;
    d.ids = [];
    d.subdomains.forEach(function (s) {
      s.domain = d;
      s.ids = [];
      subByRef[d.id + "|" + s.key] = s;
      subByName[d.id + "|" + s.name] = s;
    });
  });
  ALL = ALL.filter(function (q) {
    var s = subByName[q.subject + "|" + q.subtopic];
    if (!s || byId[q.id]) {
      if (window.console) console.warn("Skipping question with unknown subtopic or duplicate id:", q.id);
      return false;
    }
    byId[q.id] = q;
    q._sub = s;
    s.ids.push(q.id);
    s.domain.ids.push(q.id);
    return true;
  });

  function idsWhere(ids, level) {
    return level ? ids.filter(function (id) { return byId[id].difficulty === level; }) : ids.slice();
  }

  /* ================= Storage (every access guarded) ================= */
  var KEY = "mcqprep.v1";
  var store = load();

  function load() {
    var base = { theme: null, prefs: { count: 10, shuffle: true }, stats: {}, bm: {} };
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === "object") {
          base.theme = s.theme || null;
          if (s.prefs) {
            base.prefs.count = s.prefs.count || 10; base.prefs.shuffle = s.prefs.shuffle !== false;
            if (Array.isArray(s.prefs.mock)) base.prefs.mock = s.prefs.mock;
          }
          base.stats = s.stats || {};
          base.bm = s.bm || {};
        }
      }
    } catch (e) { /* storage unavailable or corrupt: start fresh */ }
    return base;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore (private mode / quota) */ }
  }
  function record(id, correct) {
    var s = store.stats[id] || (store.stats[id] = { a: 0, c: 0, last: 0 });
    s.a += 1;
    if (correct) s.c += 1;
    s.last = correct ? 1 : 0;
    save();
  }
  function aggregate(ids) {
    var r = { total: ids.length, attempted: 0, attempts: 0, correct: 0 };
    ids.forEach(function (id) {
      var s = store.stats[id];
      if (s && s.a) { r.attempted++; r.attempts += s.a; r.correct += s.c; }
    });
    r.pct = r.total ? Math.round((r.attempted / r.total) * 100) : 0;
    r.acc = r.attempts ? Math.round((r.correct / r.attempts) * 100) : null;
    return r;
  }
  function mistakeIds(ids) {
    return (ids || ALL.map(function (q) { return q.id; })).filter(function (id) {
      var s = store.stats[id]; return s && s.a && s.last === 0;
    });
  }
  function bookmarkIds(ids) {
    return (ids || ALL.map(function (q) { return q.id; })).filter(function (id) { return !!store.bm[id]; });
  }

  /* ================= Helpers ================= */
  var app = document.getElementById("app");
  var crumbEl = document.getElementById("breadcrumb");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* Escape, then render `inline code` and line breaks. */
  function fmt(s) {
    return esc(s).replace(/`([^`\n]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function fmtTime(ms) {
    var t = Math.max(0, Math.round(ms / 1000));
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function letter(i) { return "ABCD".charAt(i); }
  function accText(a) { return a.acc == null ? "—" : a.acc + "%"; }
  function progressBar(pct) { return '<div class="progress" aria-hidden="true"><span style="width:' + pct + '%"></span></div>'; }
  function diffOrder(a, b) {
    var qa = byId[a], qb = byId[b];
    return LEVELS.indexOf(qa.difficulty) - LEVELS.indexOf(qb.difficulty) || (a < b ? -1 : a > b ? 1 : 0);
  }

  function setCrumbs(list) {
    var html = "";
    list.forEach(function (c, i) {
      if (i) html += '<span class="sep" aria-hidden="true">›</span>';
      if (i === list.length - 1 || !c.href) html += '<span class="current">' + esc(c.label) + "</span>";
      else html += '<a href="' + c.href + '">' + esc(c.label) + "</a>";
    });
    crumbEl.innerHTML = html;
  }
  function homeCrumb() { return { label: "Home", href: "#/" }; }
  function domainCrumb(d) { return { label: d.name, href: "#/d/" + d.id }; }
  function subCrumb(s) { return { label: s.name, href: "#/d/" + s.domain.id + "/" + s.key }; }

  /* ================= Syntax highlighting (tiny inline tokenizer) ================= */
  var KW = {
    python: words("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case self cls"),
    sql: words("select from where and or not in is null as on join inner left right full outer cross natural group by order having limit offset distinct insert into values update set delete create table drop alter add column primary key foreign references unique check default index view with recursive union all intersect except case when then else end exists between like asc desc over partition rows range preceding following current row unbounded begin commit rollback savepoint transaction grant revoke truncate trigger procedure function returns return declare if each for before after constraint coalesce count sum avg min max cast int integer varchar char text date numeric decimal real true false fetch first next only using lateral"),
    c: words("auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while pid_t NULL"),
    bash: words("if then else fi for do done while case esac in function echo export sudo")
  };
  function words(s) { var o = {}; s.split(" ").forEach(function (w) { o[w] = 1; }); return o; }
  var TOKEN_RE = {
    python: /(#[^\n]*)|((?:\b[rRbBfFuU]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b(?:0[xXoObB][\da-fA-F_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?)\b)|([A-Za-z_]\w*)/g,
    sql: /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:''|[^'])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g,
    c: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g,
    bash: /(#[^\n]*)|("(?:\\.|[^"\\])*"|'[^']*')|(\b\d+\b)|([A-Za-z_][\w-]*)/g
  };
  function highlight(code, lang) {
    var re = TOKEN_RE[lang];
    if (!re) return esc(code);
    var kw = KW[lang], out = "", last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      var t = m[0], cls = null;
      if (m[1]) cls = "com";
      else if (m[2]) cls = "str";
      else if (m[3]) cls = "num";
      else if (m[4]) {
        var key = lang === "sql" ? t.toLowerCase() : t;
        if (kw[key]) cls = "kw";
        else if (code.charAt(re.lastIndex) === "(") cls = "fn";
      }
      out += cls ? '<span class="tok-' + cls + '">' + esc(t) + "</span>" : esc(t);
      last = re.lastIndex;
      if (!t.length) re.lastIndex++;
    }
    return out + esc(code.slice(last));
  }
  function langOf(q) {
    if (q.lang) return q.lang;
    if (q.subject === "python") return "python";
    if (q.subject === "sql") return "sql";
    if (/#include|fork\s*\(|printf\s*\(/.test(q.code)) return "c";
    if (q.subject === "os") return "bash";
    return "plain";
  }
  function codeBlock(q) {
    return q.code ? '<pre class="code"><code>' + highlight(q.code, langOf(q)) + "</code></pre>" : "";
  }

  /* ================= Quiz preferences bar ================= */
  function optionsBar() {
    var p = store.prefs, html = '<div class="options-bar"><div><span class="label">Questions</span><span class="seg" role="group" aria-label="Question count">';
    [10, 20, 30, "all"].forEach(function (c) {
      html += '<button type="button" data-count="' + c + '" class="' + (p.count === c ? "on" : "") + '">' + (c === "all" ? "All" : c) + "</button>";
    });
    html += '</span></div><div><span class="label">Shuffle</span><span class="seg" role="group" aria-label="Shuffle">';
    html += '<button type="button" data-shuffle="1" class="' + (p.shuffle ? "on" : "") + '">On</button>';
    html += '<button type="button" data-shuffle="0" class="' + (!p.shuffle ? "on" : "") + '">Off</button>';
    return html + "</span></div></div>";
  }
  function bindOptionsBar() {
    app.querySelectorAll("[data-count]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-count");
        store.prefs.count = v === "all" ? "all" : Number(v); save(); route();
      });
    });
    app.querySelectorAll("[data-shuffle]").forEach(function (b) {
      b.addEventListener("click", function () { store.prefs.shuffle = b.getAttribute("data-shuffle") === "1"; save(); route(); });
    });
  }

  /* ================= Screens ================= */
  var quiz = null;      // active quiz session
  var lastResult = null;
  var timerHandle = null;

  function listNames(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function renderHome() {
    setCrumbs([{ label: "Home" }]);
    var html = '<div class="page-head"><div><h1>Placement MCQ Prep</h1><p class="muted">' + ALL.length +
      " questions across " + listNames(CATALOG.map(function (d) { return d.name; })) + ".</p></div></div>";
    if (quiz && !quiz.done) {
      html += '<div class="card" style="margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">' +
        "<div><b>Quiz in progress:</b> " + esc(quiz.title) + ' <span class="muted small">(' + (quiz.idx + 1) + "/" + quiz.ids.length + ")</span></div>" +
        '<a class="btn btn-primary" href="#/quiz">Resume</a></div>';
    }
    html += '<div class="grid">';
    CATALOG.forEach(function (d) {
      var a = aggregate(d.ids);
      html += '<a class="card domain-card" href="#/d/' + d.id + '"><span class="tag">' + esc(d.short) + "</span><h2>" + esc(d.name) + "</h2>" +
        '<div class="stats"><span><b>' + a.total + "</b> questions</span><span><b>" + a.attempted + "</b> attempted</span><span>accuracy <b>" + accText(a) + "</b></span></div>" +
        progressBar(a.pct) + '<div class="small muted">' + d.subdomains.length + " subdomains · " + a.pct + "% attempted</div></a>";
    });
    html += "</div>";

    var mis = mistakeIds().length, bm = bookmarkIds().length;
    html += '<div class="section-title">Modes</div><div class="grid">' +
      modeCard("#/mode/mistakes", "Review Mistakes", mis, "questions you got wrong and haven't answered correctly since") +
      modeCard("#/mode/bookmarks", "Bookmarked", bm, "questions you starred") +
      modeCard("#/mock", "Mixed Mock Test", 30, "random questions from the domains you pick, 45-minute timer, explanations at the end") +
      "</div>";

    var tot = aggregate(ALL.map(function (q) { return q.id; }));
    html += '<div class="footer-actions"><span class="muted small">Overall: ' + tot.attempted + "/" + tot.total + " attempted · accuracy " + accText(tot) +
      '</span><button class="btn btn-danger" id="resetBtn" type="button">Reset progress</button></div>';
    app.innerHTML = html;
    document.getElementById("resetBtn").addEventListener("click", resetProgress);
  }
  function modeCard(href, title, count, desc) {
    return '<a class="card mode-card" href="' + href + '"><h3>' + esc(title) + '</h3><div class="count">' + count +
      '</div><div class="small muted">' + esc(desc) + "</div></a>";
  }

  function renderDomain(d) {
    setCrumbs([homeCrumb(), { label: d.name }]);
    var a = aggregate(d.ids), mis = mistakeIds(d.ids).length;
    var html = '<div class="page-head"><div><h1>' + esc(d.name) + '</h1><p class="muted">' + a.total + " questions · " + a.attempted +
      " attempted · accuracy " + accText(a) + "</p></div>" +
      '<div class="btn-row"><button class="btn btn-primary" id="allDomain" type="button"' + (a.total ? "" : " disabled") + ">Practice whole domain</button>" +
      '<button class="btn" id="misDomain" type="button"' + (mis ? "" : " disabled") + ">Mistakes (" + mis + ")</button></div></div>";
    html += optionsBar() + '<div class="grid">';
    d.subdomains.forEach(function (s) {
      var sa = aggregate(s.ids);
      var lv = LEVELS.map(function (l) { return LEVEL_NAMES[l].charAt(0) + " " + idsWhere(s.ids, l).length; }).join(" · ");
      html += '<a class="card" href="#/d/' + d.id + "/" + s.key + '"><h3>' + esc(s.name) + "</h3>" +
        '<div class="stats"><span><b>' + sa.total + "</b> questions</span><span>accuracy <b>" + accText(sa) + "</b></span></div>" +
        progressBar(sa.pct) + '<div class="small muted">' + sa.attempted + "/" + sa.total + " attempted · " + lv + "</div></a>";
    });
    app.innerHTML = html + "</div>";
    bindOptionsBar();
    document.getElementById("allDomain").addEventListener("click", function () {
      startPractice(d.ids, d.name + " — all subdomains", [homeCrumb(), domainCrumb(d), { label: "All subdomains" }], "#/d/" + d.id);
    });
    document.getElementById("misDomain").addEventListener("click", function () {
      startPractice(mistakeIds(d.ids), d.name + " — mistakes", [homeCrumb(), domainCrumb(d), { label: "Mistakes" }], "#/d/" + d.id);
    });
  }

  function renderSub(s) {
    var d = s.domain;
    setCrumbs([homeCrumb(), domainCrumb(d), { label: s.name }]);
    var a = aggregate(s.ids);
    var html = '<div class="page-head"><div><h1>' + esc(s.name) + '</h1><p class="muted">' + esc(d.name) + " · " + a.total +
      " questions · accuracy " + accText(a) + "</p></div></div>" + optionsBar() + '<div class="grid-3">';
    LEVELS.forEach(function (l) {
      var ids = idsWhere(s.ids, l), la = aggregate(ids);
      html += '<div class="card level-card ' + l + '"><h2>' + LEVEL_NAMES[l] + "</h2>" +
        '<div class="stats"><span><b>' + la.total + "</b> questions</span><span><b>" + la.attempted + "</b> attempted</span><span>accuracy <b>" +
        accText(la) + "</b></span></div>" + progressBar(la.pct) + '<div class="small muted" style="margin-bottom:12px">' + la.pct + "% attempted</div>" +
        '<button class="btn btn-primary" type="button" data-level="' + l + '"' + (la.total ? "" : " disabled") + ">Start " + LEVEL_NAMES[l] + "</button></div>";
    });
    html += "</div>";
    var mis = mistakeIds(s.ids).length;
    html += '<div class="card" style="margin-top:14px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center">' +
      "<div><h3>All levels</h3><div class=\"small muted\">Easy → Medium → Hard (or shuffled if shuffle is on) · " + a.attempted + "/" + a.total + " attempted</div></div>" +
      '<div class="btn-row"><button class="btn" type="button" id="subMis"' + (mis ? "" : " disabled") + ">Mistakes (" + mis + ")</button>" +
      '<button class="btn btn-primary" type="button" data-level="all"' + (a.total ? "" : " disabled") + ">Start all levels</button></div></div>";
    app.innerHTML = html;
    bindOptionsBar();
    app.querySelectorAll("[data-level]").forEach(function (b) {
      b.addEventListener("click", function () {
        var l = b.getAttribute("data-level");
        var label = l === "all" ? "All levels" : LEVEL_NAMES[l];
        startPractice(idsWhere(s.ids, l === "all" ? null : l), s.name + " — " + label,
          [homeCrumb(), domainCrumb(d), subCrumb(s), { label: label }], "#/d/" + d.id + "/" + s.key);
      });
    });
    document.getElementById("subMis").addEventListener("click", function () {
      startPractice(mistakeIds(s.ids), s.name + " — mistakes", [homeCrumb(), domainCrumb(d), subCrumb(s), { label: "Mistakes" }], "#/d/" + d.id + "/" + s.key);
    });
  }

  function renderMode(kind) {
    var isMis = kind === "mistakes";
    var title = isMis ? "Review Mistakes" : "Bookmarked";
    setCrumbs([homeCrumb(), { label: title }]);
    var ids = isMis ? mistakeIds() : bookmarkIds();
    var html = '<div class="page-head"><div><h1>' + title + '</h1><p class="muted">' +
      (isMis ? "Questions you have answered wrong and not answered correctly since." : "Questions you starred during practice.") +
      "</p></div></div>";
    if (!ids.length) {
      app.innerHTML = html + '<div class="card empty">' + (isMis ? "No outstanding mistakes. Nice work!" : "No bookmarks yet. Tap ☆ on any question to save it here.") + "</div>";
      return;
    }
    html += optionsBar() + '<div class="btn-row" style="margin-bottom:18px"><button class="btn btn-primary" type="button" data-scope="all">Practice all (' + ids.length + ")</button>";
    CATALOG.forEach(function (d) {
      var n = ids.filter(function (id) { return byId[id].subject === d.id; }).length;
      if (n) html += '<button class="btn" type="button" data-scope="' + d.id + '">' + esc(d.short) + " (" + n + ")</button>";
    });
    html += "</div>" + listHtml(ids, null);
    app.innerHTML = html;
    bindOptionsBar();
    bindList();
    app.querySelectorAll("[data-scope]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sc = b.getAttribute("data-scope");
        var sel = sc === "all" ? ids : ids.filter(function (id) { return byId[id].subject === sc; });
        startPractice(sel, title + (sc === "all" ? "" : " — " + domainById[sc].short), [homeCrumb(), { label: title, href: "#/mode/" + kind }, { label: "Practice" }], "#/mode/" + kind);
      });
    });
  }

  /* Expandable list of questions (used by search + modes). */
  function listHtml(ids, terms) {
    var html = "";
    ids.slice(0, 200).forEach(function (id) {
      var q = byId[id];
      html += '<details class="card result"><summary><div class="meta"><span class="diff ' + q.difficulty + '">' + q.difficulty + "</span>" +
        esc(q._sub.domain.short) + " › " + esc(q.subtopic) + ' · <span>' + esc(q.id) + "</span></div>" + mark(q.question, terms) + "</summary>" +
        '<div style="margin-top:12px">' + codeBlock(q) + "<ol type=\"A\">" + q.options.map(function (o, i) {
          return "<li" + (i === q.answer ? ' style="color:var(--good);font-weight:600"' : "") + ">" + fmt(o) + "</li>";
        }).join("") + "</ol><p>" + fmt(q.explanation) + "</p>" +
        '<button class="btn" type="button" data-one="' + esc(id) + '">Practice this question</button></div></details>';
    });
    if (ids.length > 200) html += '<p class="muted small">Showing first 200 of ' + ids.length + " matches.</p>";
    return html;
  }
  function bindList() {
    app.querySelectorAll("[data-one]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-one"), q = byId[id];
        startPractice([id], q.subtopic, [homeCrumb(), domainCrumb(q._sub.domain), subCrumb(q._sub), { label: id }], location.hash, true);
      });
    });
  }
  function mark(text, terms) {
    var h = fmt(text);
    if (!terms || !terms.length) return h;
    terms.forEach(function (t) {
      var re = new RegExp("(" + esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![^<]*>)", "gi");
      h = h.replace(re, "<mark>$1</mark>");
    });
    return h;
  }

  function renderSearch(qstr) {
    var input = document.getElementById("searchInput");
    if (input.value !== qstr) input.value = qstr;
    setCrumbs([homeCrumb(), { label: 'Search: "' + qstr + '"' }]);
    var terms = qstr.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) { app.innerHTML = '<div class="card empty">Type a keyword in the search box.</div>'; return; }
    var ids = ALL.filter(function (q) {
      var hay = (q.question + " " + (q.code || "") + " " + q.options.join(" ") + " " + q.explanation + " " + q.subtopic + " " + (q.tags || []).join(" ") + " " + q.id).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    }).map(function (q) { return q.id; });
    var html = '<div class="page-head"><div><h1>Search results</h1><p class="muted">' + plural(ids.length, "question") + " match “" + esc(qstr) + "”.</p></div>" +
      (ids.length ? '<button class="btn btn-primary" type="button" id="practiceResults">Practice these</button>' : "") + "</div>";
    html += ids.length ? optionsBar() + listHtml(ids, terms) : '<div class="card empty">No questions found. Try a different keyword.</div>';
    app.innerHTML = html;
    if (ids.length) {
      bindOptionsBar(); bindList();
      document.getElementById("practiceResults").addEventListener("click", function () {
        startPractice(ids, 'Search: "' + qstr + '"', [homeCrumb(), { label: "Search", href: "#/search?q=" + encodeURIComponent(qstr) }, { label: "Practice" }], "#/search?q=" + encodeURIComponent(qstr));
      });
    }
  }

  function renderMockIntro() {
    setCrumbs([homeCrumb(), { label: "Mixed Mock Test" }]);
    var html = '<div class="page-head"><div><h1>Mixed Mock Test</h1><p class="muted">30 random questions drawn evenly from the selected domains and all difficulty levels. ' +
      "45-minute timer. You can move between questions and change answers; explanations are revealed only after you submit.</p></div></div>";
    var sel = mockDomains();
    html += '<div class="options-bar"><div><span class="label">Domains</span><span class="seg" role="group" aria-label="Mock test domains">';
    CATALOG.forEach(function (d) {
      if (d.ids.length) html += '<button type="button" data-mockdom="' + d.id + '" aria-pressed="' + (sel.indexOf(d.id) !== -1) + '" class="' + (sel.indexOf(d.id) !== -1 ? "on" : "") + '">' + esc(d.short) + "</button>";
    });
    html += "</span></div></div>";
    html += '<div class="card"><ul><li>Auto-submits when the timer reaches 0:00.</li><li>Shortcuts: <kbd>1</kbd>–<kbd>4</kbd> / <kbd>A</kbd>–<kbd>D</kbd> to choose, <kbd>←</kbd> <kbd>→</kbd> to move.</li><li>Results are added to your progress and mistakes list.</li></ul>' +
      '<button class="btn btn-primary" type="button" id="startMock"' + (ALL.length ? "" : " disabled") + ">Start mock test</button></div>";
    app.innerHTML = html;
    document.getElementById("startMock").addEventListener("click", startMock);
    app.querySelectorAll("[data-mockdom]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-mockdom"), cur = mockDomains(), i = cur.indexOf(id);
        if (i === -1) cur.push(id); else if (cur.length > 1) cur.splice(i, 1); // keep at least one domain
        store.prefs.mock = cur; save(); route();
      });
    });
  }
  function mockDomains() {
    var avail = CATALOG.filter(function (d) { return d.ids.length; }).map(function (d) { return d.id; });
    var m = (store.prefs.mock || avail).filter(function (id) { return avail.indexOf(id) !== -1; });
    return m.length ? m.slice() : avail;
  }

  /* ================= Quiz engine ================= */
  function startPractice(ids, title, crumbs, origin, keepOrder) {
    if (!ids.length) return;
    var list = ids.slice();
    if (!keepOrder) {
      if (store.prefs.shuffle) shuffle(list); else list.sort(diffOrder);
      if (store.prefs.count !== "all") list = list.slice(0, store.prefs.count);
    }
    quiz = { kind: "practice", title: title, crumbs: crumbs, origin: origin, ids: list, idx: 0, answers: {}, start: Date.now(), done: false };
    location.hash = "#/quiz";
  }

  function startMock() {
    var per = {}, picked = [];
    CATALOG.forEach(function (d) { per[d.id] = shuffle(d.ids.slice()); });
    var chosen = mockDomains();
    var doms = CATALOG.map(function (d) { return d.id; }).filter(function (id) { return per[id].length && chosen.indexOf(id) !== -1; });
    var i = 0;
    shuffle(doms);
    while (picked.length < 30 && doms.length) {
      var dom = doms[i % doms.length];
      if (per[dom].length) { picked.push(per[dom].pop()); i++; }
      else { doms.splice(i % doms.length, 1); }
    }
    quiz = { kind: "mock", title: "Mixed Mock Test", crumbs: [homeCrumb(), { label: "Mixed Mock Test", href: "#/mock" }, { label: "In progress" }],
      origin: "#/mock", ids: shuffle(picked), idx: 0, answers: {}, start: Date.now(), limit: 45 * 60 * 1000, done: false };
    location.hash = "#/quiz";
  }

  function renderQuiz() {
    if (!quiz || quiz.done) { location.replace("#/"); return; }
    setCrumbs(quiz.crumbs);
    var q = byId[quiz.ids[quiz.idx]], id = q.id, n = quiz.ids.length;
    var chosen = quiz.answers[id], isMock = quiz.kind === "mock";
    var revealed = !isMock && chosen != null;
    var answeredCount = Object.keys(quiz.answers).length;
    var mono = q.type === "code-output" || q.type === "query";

    var html = '<div class="quiz-top"><div class="quiz-meta"><b style="color:var(--text)">Q ' + (quiz.idx + 1) + " / " + n + "</b>" +
      '<span class="diff ' + q.difficulty + '">' + q.difficulty + "</span><span>" + esc(q._sub.domain.short) + " › " + esc(q.subtopic) + "</span></div>" +
      '<div class="quiz-meta">' + (isMock ? '<span>⏱ <span class="timer" id="timer"></span></span>' : '<span class="timer" id="timer"></span>') +
      '<button class="star' + (store.bm[id] ? " on" : "") + '" id="starBtn" type="button" title="Bookmark (S)" aria-label="Bookmark question">' + (store.bm[id] ? "★" : "☆") + "</button></div></div>";
    html += '<div class="qprogress"><span style="width:' + Math.round(((isMock ? answeredCount : quiz.idx + (revealed ? 1 : 0)) / n) * 100) + '%"></span></div>';
    html += '<div class="card"><div class="question">' + fmt(q.question) + "</div>" + codeBlock(q) + '<div class="opts" role="group" aria-label="Options">';
    q.options.forEach(function (o, i) {
      var cls = "opt" + (mono ? " mono" : "");
      if (revealed) {
        if (i === q.answer) cls += " correct";
        else if (i === chosen) cls += " wrong";
      } else if (isMock && i === chosen) cls += " selected";
      html += '<button type="button" class="' + cls + '" data-opt="' + i + '"' + (revealed ? " disabled" : "") +
        '><span class="key">' + letter(i) + '</span><span class="txt">' + esc(o) + "</span></button>";
    });
    html += "</div>";
    if (revealed) {
      var ok = chosen === q.answer;
      html += '<div class="card explain ' + (ok ? "good" : "bad") + '"><h3 class="verdict ' + (ok ? "good" : "bad") + '">' +
        (ok ? "Correct!" : "Not quite — the answer is " + letter(q.answer) + ".") + "</h3><p>" + fmt(q.explanation) + "</p>" + optExpHtml(q) + "</div>";
    }
    html += '<div class="quiz-actions"><div class="btn-row">' +
      '<button class="btn" type="button" id="prevBtn"' + (quiz.idx ? "" : " disabled") + ">← Prev</button>" +
      '<button class="btn" type="button" id="quitBtn">' + (isMock ? "Submit test" : "Finish") + "</button></div>" +
      '<button class="btn btn-primary" type="button" id="nextBtn"' + (!isMock && !revealed ? " disabled" : "") + ">" +
      (quiz.idx === n - 1 ? (isMock ? "Submit" : "See results") : "Next →") + "</button></div>";
    html += '<p class="kbd-hint" style="margin-top:12px">Shortcuts: <kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd> answer · <kbd>Enter</kbd>/<kbd>→</kbd> next · <kbd>←</kbd> previous · <kbd>S</kbd> bookmark</p></div>';

    if (isMock) {
      html += '<div class="palette" aria-label="Question palette">';
      quiz.ids.forEach(function (qid, i) {
        html += '<button type="button" data-jump="' + i + '" class="' + (quiz.answers[qid] != null ? "answered" : "") + (i === quiz.idx ? " current" : "") + '">' + (i + 1) + "</button>";
      });
      html += "</div>";
    }
    app.innerHTML = html;

    app.querySelectorAll("[data-opt]").forEach(function (b) {
      b.addEventListener("click", function () { choose(Number(b.getAttribute("data-opt"))); });
    });
    app.querySelectorAll("[data-jump]").forEach(function (b) {
      b.addEventListener("click", function () { quiz.idx = Number(b.getAttribute("data-jump")); renderQuiz(); });
    });
    document.getElementById("starBtn").addEventListener("click", toggleStar);
    document.getElementById("prevBtn").addEventListener("click", prev);
    document.getElementById("nextBtn").addEventListener("click", next);
    document.getElementById("quitBtn").addEventListener("click", function () {
      if (isMock) {
        var left = n - Object.keys(quiz.answers).length;
        confirmDialog("Submit test?", left ? plural(left, "question") + " still unanswered. Submit anyway?" : "Submit your answers and see results?", "Submit", finish);
      } else finish();
    });
    startTimer();
  }

  function optExpHtml(q) {
    if (!q.optionExplanations) return "";
    return '<ul class="optexp">' + q.optionExplanations.map(function (e, i) {
      return '<li class="' + (i === q.answer ? "is-correct" : "") + '"><span class="key">' + letter(i) + "</span><span>" + fmt(e) + "</span></li>";
    }).join("") + "</ul>";
  }

  function choose(i) {
    var q = byId[quiz.ids[quiz.idx]];
    if (i < 0 || i >= q.options.length) return;
    if (quiz.kind === "mock") { quiz.answers[q.id] = i; renderQuiz(); return; }
    if (quiz.answers[q.id] != null) return;
    quiz.answers[q.id] = i;
    record(q.id, i === q.answer);
    renderQuiz();
    var nb = document.getElementById("nextBtn"); if (nb) nb.focus({ preventScroll: true });
  }
  function next() {
    var id = quiz.ids[quiz.idx];
    if (quiz.kind === "practice" && quiz.answers[id] == null) return;
    if (quiz.idx < quiz.ids.length - 1) { quiz.idx++; renderQuiz(); window.scrollTo(0, 0); }
    else if (quiz.kind === "mock") {
      var left = quiz.ids.length - Object.keys(quiz.answers).length;
      confirmDialog("Submit test?", left ? plural(left, "question") + " still unanswered. Submit anyway?" : "Submit your answers and see results?", "Submit", finish);
    } else finish();
  }
  function prev() { if (quiz.idx > 0) { quiz.idx--; renderQuiz(); window.scrollTo(0, 0); } }
  function toggleStar() {
    var id = quiz.ids[quiz.idx];
    if (store.bm[id]) delete store.bm[id]; else store.bm[id] = 1;
    save();
    var b = document.getElementById("starBtn");
    if (b) { b.classList.toggle("on", !!store.bm[id]); b.textContent = store.bm[id] ? "★" : "☆"; }
  }

  function startTimer() {
    stopTimer();
    var tick = function () {
      var el = document.getElementById("timer");
      if (!el || !quiz || quiz.done) { stopTimer(); return; }
      var elapsed = Date.now() - quiz.start;
      if (quiz.kind === "mock") {
        var left = quiz.limit - elapsed;
        el.textContent = fmtTime(left);
        el.classList.toggle("low", left < 5 * 60 * 1000);
        if (left <= 0) { finish(); }
      } else el.textContent = fmtTime(elapsed);
    };
    tick();
    timerHandle = setInterval(tick, 1000);
  }
  function stopTimer() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }

  function finish() {
    if (!quiz || quiz.done) return;
    stopTimer();
    quiz.end = Date.now();
    if (quiz.kind === "mock") {
      quiz.ids.forEach(function (id) {
        if (quiz.answers[id] != null) record(id, quiz.answers[id] === byId[id].answer);
      });
    }
    quiz.done = true;
    lastResult = quiz;
    location.hash = "#/summary";
  }

  function renderSummary() {
    var r = lastResult;
    if (!r) { location.replace("#/"); return; }
    var crumbs = r.crumbs.slice(0, -1).concat([{ label: r.crumbs[r.crumbs.length - 1].label, href: null }, { label: "Results" }]);
    crumbs[crumbs.length - 2].href = r.origin;
    setCrumbs(crumbs);
    var correct = 0, wrong = [], skipped = 0, bySub = {}, byLevel = {};
    var counted = r.kind === "mock" ? r.ids : r.ids.filter(function (id) { return r.answers[id] != null; });
    counted.forEach(function (id) {
      var q = byId[id], a = r.answers[id], ok = a === q.answer;
      var sk = q._sub.domain.short + " › " + q.subtopic;
      bySub[sk] = bySub[sk] || { n: 0, c: 0 }; bySub[sk].n++;
      byLevel[q.difficulty] = byLevel[q.difficulty] || { n: 0, c: 0 }; byLevel[q.difficulty].n++;
      if (ok) { correct++; bySub[sk].c++; byLevel[q.difficulty].c++; }
      else if (a == null) { skipped++; wrong.push(id); }
      else wrong.push(id);
    });
    var total = counted.length, pct = total ? Math.round((correct / total) * 100) : 0;
    var html = '<div class="page-head"><div><h1>Results</h1><p class="muted">' + esc(r.title) +
      (r.kind === "practice" && counted.length < r.ids.length ? " · finished early (" + counted.length + " of " + r.ids.length + " answered)" : "") + "</p></div></div>";
    html += '<div class="score-hero"><div class="card"><div class="big">' + correct + " / " + total + '</div><div class="muted small">score</div></div>' +
      '<div class="card"><div class="big">' + pct + '%</div><div class="muted small">accuracy</div></div>' +
      '<div class="card"><div class="big">' + fmtTime(r.end - r.start) + '</div><div class="muted small">time taken</div></div>' +
      (skipped ? '<div class="card"><div class="big">' + skipped + '</div><div class="muted small">unanswered</div></div>' : "") + "</div>";
    html += '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">' +
      breakdown("By subdomain", bySub, Object.keys(bySub).sort()) +
      breakdown("By difficulty", byLevel, LEVELS.filter(function (l) { return byLevel[l]; }), LEVEL_NAMES) + "</div>";
    html += '<div class="btn-row" style="margin:18px 0">' + (wrong.length ? '<button class="btn btn-primary" type="button" id="retryWrong">Retry wrong (' + wrong.length + ")</button>" : "") +
      '<a class="btn" href="' + r.origin + '">Back</a><a class="btn" href="#/">Home</a></div>';

    if (r.kind === "mock") {
      html += '<div class="section-title">All questions</div>';
      r.ids.forEach(function (id, i) { html += reviewItem(byId[id], r.answers[id], i + 1, r.answers[id] !== byId[id].answer); });
    } else if (wrong.length) {
      html += '<div class="section-title">Questions you got wrong</div>';
      wrong.forEach(function (id, i) { html += reviewItem(byId[id], r.answers[id], i + 1, true); });
    } else if (total) html += '<div class="card empty">Perfect score — no wrong answers.</div>';
    app.innerHTML = html;
    var rb = document.getElementById("retryWrong");
    if (rb) rb.addEventListener("click", function () {
      startPractice(wrong, r.title + " — retry wrong", r.crumbs.slice(0, -1).concat([{ label: "Retry wrong" }]), r.origin, true);
    });
  }
  function breakdown(title, map, keys, names) {
    var h = '<div class="card"><h3>' + title + '</h3><div class="table-wrap"><table class="breakdown"><thead><tr><th></th><th class="num">Correct</th><th class="num">%</th></tr></thead><tbody>';
    keys.forEach(function (k) {
      var v = map[k];
      h += "<tr><td>" + esc(names ? names[k] : k) + '</td><td class="num">' + v.c + "/" + v.n + '</td><td class="num">' + Math.round((v.c / v.n) * 100) + "%</td></tr>";
    });
    return h + "</tbody></table></div></div>";
  }
  function reviewItem(q, a, num, open) {
    var ok = a === q.answer;
    return '<details class="card review-item"' + (open ? " open" : "") + "><summary>" + (ok ? "✅ " : a == null ? "⏭️ " : "❌ ") + num + ". " + fmt(q.question).split("<br>")[0] + "</summary>" +
      '<div style="margin-top:10px"><div class="meta small muted" style="margin-bottom:6px"><span class="diff ' + q.difficulty + '">' + q.difficulty + "</span> " +
      esc(q._sub.domain.short) + " › " + esc(q.subtopic) + " · " + esc(q.id) + "</div>" +
      '<div class="question">' + fmt(q.question) + "</div>" + codeBlock(q) +
      "<p>" + (a == null ? '<span class="your">You did not answer.</span>' : '<span class="' + (ok ? "right" : "your") + '">Your answer: ' + letter(a) + ". " + fmt(q.options[a]) + "</span>") + "<br>" +
      '<span class="right">Correct answer: ' + letter(q.answer) + ". " + fmt(q.options[q.answer]) + "</span></p>" +
      "<p>" + fmt(q.explanation) + "</p>" + optExpHtml(q) + "</div></details>";
  }

  /* ================= Dialog, theme, reset ================= */
  function confirmDialog(title, text, okLabel, onOk) {
    var dlg = document.getElementById("confirmDialog");
    if (!dlg || typeof dlg.showModal !== "function") { if (window.confirm(title + "\n\n" + text)) onOk(); return; }
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmText").textContent = text;
    document.getElementById("confirmOk").textContent = okLabel;
    dlg.returnValue = "";
    dlg.onclose = function () { if (dlg.returnValue === "ok") onOk(); };
    dlg.showModal();
  }
  function resetProgress() {
    confirmDialog("Reset all progress?", "This permanently clears your attempts, accuracy, mistakes list and bookmarks. Theme and quiz preferences are kept.", "Reset", function () {
      store.stats = {}; store.bm = {}; save(); quiz = null; lastResult = null; route();
    });
  }
  function currentTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  var themeBtn = document.getElementById("themeToggle");
  function syncThemeIcon() { themeBtn.textContent = currentTheme() === "dark" ? "☀" : "☾"; }
  themeBtn.addEventListener("click", function () {
    var t = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    store.theme = t; save(); syncThemeIcon();
  });
  syncThemeIcon();

  /* ================= Search box ================= */
  var searchInput = document.getElementById("searchInput"), searchTimer = null;
  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault(); goSearch();
  });
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { if (searchInput.value.trim().length >= 2) goSearch(true); }, 300);
  });
  function goSearch(replace) {
    var v = searchInput.value.trim();
    if (!v) return;
    var h = "#/search?q=" + encodeURIComponent(v);
    if (location.hash.indexOf("#/search") === 0 && replace) location.replace(h); else location.hash = h;
  }

  /* ================= Keyboard ================= */
  document.addEventListener("keydown", function (e) {
    if (!/^#\/quiz/.test(location.hash) || !quiz || quiz.done) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
    var dlg = document.getElementById("confirmDialog");
    if (dlg && dlg.open) return;
    var k = e.key;
    var map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3, A: 0, B: 1, C: 2, D: 3 };
    if (k in map) { e.preventDefault(); choose(map[k]); }
    else if (k === "Enter" || k === "ArrowRight") {
      if (k === "Enter" && tag === "BUTTON" && e.target.id !== "nextBtn") return; // let focused buttons act
      e.preventDefault(); next();
    } else if (k === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (k === "s" || k === "S") { e.preventDefault(); toggleStar(); }
  });

  /* ================= Router ================= */
  function route() {
    var h = location.hash || "#/";
    if (!/^#\/quiz/.test(h)) stopTimer();
    var m;
    if ((m = h.match(/^#\/d\/([^/]+)\/([^/?]+)/)) && subByRef[m[1] + "|" + m[2]]) renderSub(subByRef[m[1] + "|" + m[2]]);
    else if ((m = h.match(/^#\/d\/([^/?]+)$/)) && domainById[m[1]]) renderDomain(domainById[m[1]]);
    else if (/^#\/quiz/.test(h)) renderQuiz();
    else if (/^#\/summary/.test(h)) renderSummary();
    else if ((m = h.match(/^#\/search\?q=(.*)$/))) renderSearch(decodeURIComponent(m[1]));
    else if ((m = h.match(/^#\/mode\/(mistakes|bookmarks)$/))) renderMode(m[1]);
    else if (h === "#/mock") renderMockIntro();
    else renderHome();
    if (!/^#\/search/.test(h) && document.activeElement !== searchInput) searchInput.value = "";
  }
  window.addEventListener("hashchange", function () { route(); window.scrollTo(0, 0); });
  route();
})();
