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
  var PRIVATE = me.hasAttribute("data-private");

  /* Sign-in. Pages hosting has no server, so this can't be the OAuth redirect flow, which needs
     a client secret kept on a server. You paste a GitHub token, GitHub says whose it is, and
     only the owner counts as signed in. This hides things in the UI. It isn't access control:
     all code here is public, so never put private data in the repo. Personal data lives in
     localStorage, a private Gist or a private repo, which GitHub itself protects with the token.
     The token is shared with the counter's Gist sync. */
  var OWNER = "NischalPendurthi";
  var TOKEN_KEY = "cp_counter_gh_token_v2";
  var GIST_KEY = "cp_counter_gist_id_v2";
  var USER_KEY = "hub-user";
  var TOKEN_URL = "https://github.com/settings/personal-access-tokens/new";

  var TOOLS = [
    { id: "guide", name: "C++ / OS Guide", href: "guide/" },
    { id: "langs", name: "Languages", href: "langs/" },
    { id: "topics", name: "Topics", href: "topics/" },
    { id: "mcq", name: "MCQ Prep", href: "mcq/" },
    { id: "videos", name: "Videos", href: "videos/" },
    { id: "plan", name: "Plan", href: "plan/", private: true },
    { id: "atlas", name: "CP Atlas", href: "atlas/", private: true },
    { id: "ladder", name: "Ladder", href: "ladder/", private: true },
    { id: "counter", name: "Counter", href: "counter/", private: true },
    { id: "applications", name: "Applications", href: "applications/", private: true },
    { id: "projects", name: "Projects", href: "projects/", private: true }
  ];

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- auth state, set before first paint so private items never flash ---------- */
  function isOwner(login) { return String(login || "").toLowerCase() === OWNER.toLowerCase(); }
  function signedIn() { return !!get(TOKEN_KEY) && isOwner(get(USER_KEY)); }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  var SIGNED_IN = signedIn();
  document.documentElement.setAttribute("data-hub-auth", SIGNED_IN ? "in" : "out");
  if (PRIVATE) document.documentElement.setAttribute("data-hub-private", "");

  function whoIs(token) {
    return fetch("https://api.github.com/user", {
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" }
    }).then(function (r) {
      if (r.status === 401) return { invalid: true };
      if (!r.ok) throw new Error("GitHub returned " + r.status);
      return r.json();
    });
  }

  function signOut() {
    del(TOKEN_KEY); del(GIST_KEY); del(USER_KEY);
    function done() { location.reload(); }
    if (window.caches) caches.delete("projects-v1").then(done, done);    /* stored private guides */
    else done();
  }

  /* Recheck on each load, which also picks up a token saved by the counter. A network failure
     or rate limit keeps the current state, so being offline doesn't sign you out. */
  function revalidate() {
    var token = get(TOKEN_KEY);
    if (!token) return;
    whoIs(token).then(function (u) {
      if (u.invalid) { del(TOKEN_KEY); del(USER_KEY); }
      else if (isOwner(u.login)) set(USER_KEY, u.login);
      else del(USER_KEY);
      if (signedIn() !== SIGNED_IN) location.reload();
    }).catch(function () {});
  }

  function openSignIn() {
    var d = document.getElementById("hub-signin");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "hub-signin";
      d.className = "hub-signin";
      d.innerHTML =
        '<form method="dialog"><h2>Sign in with GitHub</h2>' +
        '<p>Paste a GitHub token. It stays in this browser and is only sent to GitHub.</p>' +
        '<p><a href="' + TOKEN_URL + '" target="_blank" rel="noopener">Create a fine-grained token on GitHub</a>, with <strong>prep-hub-private: Contents read-only</strong> and <strong>Gists: read and write</strong>.</p>' +
        '<label>Token <input type="password" autocomplete="off" spellcheck="false" required></label>' +
        '<p class="hub-signin-err" role="alert" hidden></p>' +
        '<div class="hub-signin-actions"><button type="button" class="hub-cancel">Cancel</button>' +
        '<button type="submit" class="hub-primary">Sign in</button></div></form>';
      document.body.appendChild(d);
      var input = d.querySelector("input");
      var err = d.querySelector(".hub-signin-err");
      var submit = d.querySelector(".hub-primary");
      function fail(msg) { err.textContent = msg; err.hidden = false; submit.disabled = false; input.value = ""; input.focus(); }
      d.querySelector(".hub-cancel").addEventListener("click", function () { d.close(); });
      d.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
        var token = input.value.trim();
        if (!token) return;
        err.hidden = true;
        submit.disabled = true;
        whoIs(token).then(function (u) {
          if (u.invalid) return fail("GitHub didn't accept that token.");
          if (!isOwner(u.login)) return fail("@" + u.login + " doesn't have access to this site's personal pages.");
          set(TOKEN_KEY, token);
          set(USER_KEY, u.login);
          if (!signedIn()) return fail("This browser is blocking storage, so sign-in can't be saved.");
          location.reload();
        }).catch(function () { fail("Couldn't reach GitHub. Check your connection and try again."); });
      });
    }
    d.showModal();
  }

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
    var links = TOOLS.filter(function (t) { return SIGNED_IN || !t.private; }).map(function (t) {
      return '<a href="' + ROOT + t.href + '"' + (t.id === TOOL ? ' aria-current="page"' : "") + ">" + t.name + "</a>";
    }).join("");
    bar.innerHTML =
      '<button class="hub-menu-btn" type="button" aria-label="Open tools menu" aria-expanded="false">' + ICON_MENU + "</button>" +
      '<a class="hub-brand" href="' + ROOT + '"><span class="hub-mark">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>' +
      "</span>Prep Hub</a>" +
      '<div class="hub-links">' + links + "</div>" +
      '<span class="hub-spacer"></span>' +
      '<button class="hub-auth-btn" type="button"></button>' +
      '<button class="hub-theme-btn" type="button" aria-label="Toggle dark mode" title="Toggle dark / light"></button>';

    var authBtn = bar.querySelector(".hub-auth-btn");
    authBtn.textContent = SIGNED_IN ? "Sign out" : "Sign in";
    if (SIGNED_IN) authBtn.title = "Signed in as @" + get(USER_KEY);
    authBtn.addEventListener("click", SIGNED_IN ? signOut : openSignIn);

    if (PRIVATE && !SIGNED_IN) {
      var gate = document.createElement("main");
      gate.className = "hub-gate";
      gate.innerHTML = "<h1>Sign in to view this page</h1><p>This page is personal. Sign in with GitHub to open it.</p>" +
        '<button type="button" class="hub-primary">Sign in with GitHub</button>';
      gate.querySelector("button").addEventListener("click", openSignIn);
      bar.parentNode.insertBefore(gate, bar.nextSibling);
    }

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
  revalidate();
})();
