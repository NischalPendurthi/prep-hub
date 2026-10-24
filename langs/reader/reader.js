(function () {
  "use strict";
  document.body.classList.add("js");
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var get = function (k) { try { return localStorage.getItem("cog:" + k); } catch (e) { return null; } };
  var set = function (k, v) { try { localStorage.setItem("cog:" + k, v); } catch (e) {} };

  var t = get("theme"); if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  $("#theme").addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next); set("theme", next);
  });

  $("#rail").addEventListener("click", function (e) { if (e.target.closest("a")) $("#menu-toggle").checked = false; });

  $$(".chapter > section").forEach(function (s) {
    var answers = $$(".drill details.q", s);
    if (!answers.length) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "reveal-all";
    var label = function () { b.textContent = answers.every(function (d) { return d.open; }) ? "Hide all answers" : "Show all answers"; };
    label();
    b.addEventListener("click", function () { var open = !answers.every(function (d) { return d.open; }); answers.forEach(function (d) { d.open = open; }); label(); });
    answers.forEach(function (d) { d.addEventListener("toggle", label); });
    $(".sec-head", s).after(b);
  });

  var entries = [];
  $$(".chwrap").forEach(function (w) {
    var ct = ($(".chapter h1", w) || {}).textContent || "";
    $$(".chapter > section", w).forEach(function (s) {
      var h2 = $("h2", s); if (!h2) return;
      entries.push({ href: "#" + s.id, t: h2.textContent, c: ct, x: s.textContent.replace(/\s+/g, " ").toLowerCase() });
      $$("h3[id]", s).forEach(function (h) { entries.push({ href: "#" + h.id, t: h.textContent + " · " + h2.textContent, c: ct, x: (h.textContent + " " + (h.nextElementSibling ? h.nextElementSibling.textContent : "")).toLowerCase() }); });
    });
  });
  var overlay = $("#search"), input = $("#q"), results = $("#results");
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function run() {
    var q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = '<div class="search-empty">Search section titles and text, for example “vtable”, “futex”, “NRVO”.</div>'; return; }
    var words = q.split(/\s+/);
    var hits = entries.map(function (e) {
      var tl = e.t.toLowerCase(), score = 0;
      for (var i = 0; i < words.length; i++) { var w = words[i]; if (tl.indexOf(w) >= 0) score += 5; else if (e.x.indexOf(w) >= 0) score += 1; else return null; }
      return { e: e, s: score };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 40);
    results.innerHTML = hits.length ? hits.map(function (h) { return '<a href="' + h.e.href + '"><b>' + esc(h.e.t) + "</b><br><small>" + esc(h.e.c) + "</small></a>"; }).join("") : '<div class="search-empty">No matches.</div>';
  }
  function open() { overlay.hidden = false; input.value = ""; run(); setTimeout(function () { input.focus(); }, 0); }
  $("#searchbtn").addEventListener("click", open);
  input.addEventListener("input", run);
  results.addEventListener("click", function (e) { if (e.target.closest("a")) overlay.hidden = true; });
  overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.hidden = true; });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") overlay.hidden = true;
    else if (e.key === "/" && overlay.hidden && !(document.activeElement && (/textarea/i.test(document.activeElement.tagName) || /^(text|search)$/.test(document.activeElement.type || "")))) { e.preventDefault(); open(); }
  });
})();
