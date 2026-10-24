/* Prep Hub shared script. Load it in <head>, before the tool's own scripts:
     <script src="../shared/hub.js" data-tool="mcq" data-toggle="#themeToggle"></script>
   and put <nav class="hubbar" id="hubbar"></nav> first in <body>.
   It keeps one theme across every tool, renders the hub bar and remembers the last tool opened. */
(function () {
  "use strict";
  var me = document.currentScript;
  var ROOT = new URL("../", me.src).href;
  var TOOL = me.getAttribute("data-tool") || "";
  var TOGGLE = me.getAttribute("data-toggle") || "";

  var TOOLS = [
    { id: "guide", name: "C++ / OS Guide", href: "guide/" },
    { id: "mcq", name: "MCQ Prep", href: "mcq/" },
    { id: "atlas", name: "CP Atlas", href: "atlas/" },
    { id: "ladder", name: "Ladder", href: "ladder/" },
    { id: "counter", name: "Counter", href: "counter/" }
  ];

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- fonts ---------- */
  var fonts = document.createElement("link");
  fonts.rel = "stylesheet";
  fonts.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
  document.head.appendChild(fonts);

  /* ---------- theme: one value, mirrored into each tool's own key ---------- */
  function mirror(t) {
    set("hub-theme", t);
    set("atlas-theme", JSON.stringify(t));
    set("cog:theme", t);
    try {
      var s = JSON.parse(get("mcqprep.v1") || "{}");
      if (s.theme !== t) { s.theme = t; set("mcqprep.v1", JSON.stringify(s)); }
    } catch (e) {}
  }
  function current() {
    return document.documentElement.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  var saved = get("hub-theme");
  if (saved === "light" || saved === "dark") {
    mirror(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }
  new MutationObserver(function () {
    var t = document.documentElement.getAttribute("data-theme");
    if ((t === "light" || t === "dark") && t !== get("hub-theme")) mirror(t);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function toggleTheme() {
    var own = TOGGLE && document.querySelector(TOGGLE);
    if (own) { own.click(); return; }
    document.documentElement.setAttribute("data-theme", current() === "dark" ? "light" : "dark");
  }

  if (TOOL) set("hub-last", JSON.stringify({ tool: TOOL, t: Date.now() }));

  /* ---------- hub bar ---------- */
  var ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var ICON_MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  function render() {
    var bar = document.getElementById("hubbar");
    if (!bar) {
      bar = document.createElement("nav");
      bar.className = "hubbar";
      bar.id = "hubbar";
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.setAttribute("aria-label", "Prep Hub");
    var links = TOOLS.map(function (t) {
      return '<a href="' + ROOT + t.href + '"' + (t.id === TOOL ? ' aria-current="page"' : "") + ">" + t.name + "</a>";
    }).join("");
    bar.innerHTML =
      '<button class="hub-menu-btn" type="button" aria-label="Open tools menu" aria-expanded="false">' + ICON_MENU + "</button>" +
      '<a class="hub-brand" href="' + ROOT + '"><span class="hub-mark">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>' +
      "</span>Prep Hub</a>" +
      '<div class="hub-links">' + links + "</div>" +
      '<span class="hub-spacer"></span>' +
      '<button class="hub-theme-btn" type="button" aria-label="Toggle dark mode" title="Toggle dark / light"></button>';

    var themeBtn = bar.querySelector(".hub-theme-btn");
    function syncIcon() { themeBtn.innerHTML = current() === "dark" ? ICON_SUN : ICON_MOON; }
    syncIcon();
    themeBtn.addEventListener("click", function () { toggleTheme(); syncIcon(); });
    new MutationObserver(syncIcon).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncIcon);

    var menuBtn = bar.querySelector(".hub-menu-btn");
    menuBtn.addEventListener("click", function () {
      var open = bar.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (bar.classList.contains("open") && !bar.contains(e.target)) {
        bar.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });

    /* the hub bar owns the theme toggle, so hide the tool's duplicate */
    var own = TOGGLE && document.querySelector(TOGGLE);
    if (own) own.style.display = "none";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
