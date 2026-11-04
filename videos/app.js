/* Video Picks: renders window.VIDEOS (built by videos/tools/build.py from videos/content/*.json). */
(function () {
  "use strict";
  var DATA = window.VIDEOS || { topics: [] };
  var KEY = "videos.watched.v1";
  var FILTER_KEY = "videos.filter.v1";
  var side = document.getElementById("side");
  var main = document.getElementById("main");

  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var watched = load(KEY, {});
  var filter = load(FILTER_KEY, "all");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid(t, p) { return t.id + ":" + p.kind + ":" + p.id + (p.start ? "@" + p.start : ""); }
  function hms(s) { s = +s || 0; var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0"); }
  function watchUrl(p) {
    return p.kind === "l" ? "https://www.youtube.com/playlist?list=" + p.id
      : "https://www.youtube.com/watch?v=" + p.id + (p.start ? "&t=" + p.start + "s" : "");
  }
  function embedUrl(p) {
    if (p.kind === "l") return "https://www.youtube-nocookie.com/embed/videoseries?list=" + p.id + "&autoplay=1";
    return "https://www.youtube-nocookie.com/embed/" + p.id + "?autoplay=1&rel=0" + (p.start ? "&start=" + p.start : "");
  }
  function thumb(p) { return "https://i.ytimg.com/vi/" + (p.thumb || p.id) + "/hqdefault.jpg"; }
  var ROLE = { best: "Best pick", next: "Then watch", deeper: "Go deeper", quick: "Quick / visual", course: "Full course" };

  function counts(t, sub) {
    var list = sub ? sub.picks : t.subtopics.reduce(function (a, s) { return a.concat(s.picks); }, []);
    var done = list.filter(function (p) { return watched[uid(t, p)]; }).length;
    return { done: done, total: list.length };
  }

  function route() {
    var h = (location.hash || "").replace(/^#\/?/, "").split("/");
    var ready = DATA.topics.filter(function (t) { return t.ready; });
    var t = ready.filter(function (x) { return x.id === h[0]; })[0] || ready[0];
    return { topic: t, sub: h[1] || "" };
  }

  function renderSide(r) {
    var html = '<button class="pill menu-btn" type="button" aria-expanded="false">Topics</button><div class="list"><h2>Topics</h2>';
    DATA.topics.forEach(function (t) {
      if (!t.ready) { html += '<span class="t soon">' + esc(t.name) + " <small>soon</small></span>"; return; }
      var c = counts(t);
      html += '<a class="t" href="#/' + t.id + '">' + esc(t.name) + "<small>" + c.done + "/" + c.total + "</small></a>";
      if (t === r.topic) t.subtopics.forEach(function (s) {
        var sc = counts(t, s);
        html += '<a class="s' + (r.sub === s.key ? " on" : "") + (sc.total && sc.done === sc.total ? " done" : "") +
          '" href="#/' + t.id + "/" + s.key + '"><span>' + esc(s.name) + '</span><span class="n">' + sc.done + "/" + sc.total + "</span></a>";
      });
    });
    side.innerHTML = html + "</div>";
    var btn = side.querySelector(".menu-btn");
    if (matchMedia("(max-width: 860px)").matches) side.classList.add("collapsed");
    btn.addEventListener("click", function () {
      var c = side.classList.toggle("collapsed");
      btn.setAttribute("aria-expanded", c ? "false" : "true");
    });
  }

  function card(t, p) {
    var id = uid(t, p), w = !!watched[id];
    return '<article class="pick ' + p.role + (w ? " watched" : "") + '" data-uid="' + esc(id) + '">' +
      '<button class="thumb" type="button" aria-label="Play ' + esc(p.label || p.title) + '" data-embed="' + esc(embedUrl(p)) + '">' +
      '<img loading="lazy" alt="" src="' + thumb(p) + '">' +
      '<span class="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' +
      (p.length ? '<span class="len">' + esc(p.length) + "</span>" : "") +
      (p.start ? '<span class="from">from ' + hms(p.start) + "</span>" : "") +
      "</button>" +
      '<div class="body"><span class="role">' + (ROLE[p.role] || p.role) + "</span>" +
      '<h3><a href="' + esc(watchUrl(p)) + '" target="_blank" rel="noopener">' + esc(p.label || p.title) + "</a></h3>" +
      '<div class="by">' + esc(p.channel) + "</div>" +
      '<p class="why">' + esc(p.why) + "</p>" +
      '<div class="foot"><label><input type="checkbox"' + (w ? " checked" : "") + "> Watched</label>" +
      (p.hn ? '<span class="hn" title="Distinct Hacker News users who linked this">HN ×' + p.hn + "</span>" : "") +
      "</div></div></article>";
  }

  function renderMain(r) {
    var t = r.topic;
    if (!t) { main.innerHTML = "<h1>No topics yet</h1>"; return; }
    var c = counts(t);
    var html = '<div class="eyebrow">Video picks</div><h1>' + esc(t.name) + "</h1>" +
      '<p class="lede">' + esc(t.blurb) + "</p>" +
      '<div class="progress"><span class="bar"><span style="width:' + (c.total ? c.done / c.total * 100 : 0) + '%"></span></span>' +
      c.done + " of " + c.total + " watched</div>" +
      '<div class="tools" role="group" aria-label="Show">' +
      ["all", "best", "unwatched"].map(function (f) {
        return '<button class="pill" type="button" data-filter="' + f + '" aria-pressed="' + (filter === f) + '">' +
          { all: "All picks", best: "Best picks only", unwatched: "Unwatched" }[f] + "</button>";
      }).join("") + "</div>";
    t.subtopics.forEach(function (s) {
      var picks = s.picks.filter(function (p) {
        if (filter === "best") return p.role === "best" || p.role === "course" && s.picks[0] === p;
        if (filter === "unwatched") return !watched[uid(t, p)];
        return true;
      });
      if (!picks.length && filter !== "all") return;
      html += '<section class="sub" id="s-' + s.key + '"><header><h2>' + esc(s.name) + "</h2>" +
        '<span class="meta">' + (s.mcq ? '<a href="' + esc(s.mcq) + '">Practise MCQs →</a>' : "") + "</span></header>" +
        (s.note ? '<p class="note">' + esc(s.note) + "</p>" : "") +
        '<div class="picks">' + picks.map(function (p) { return card(t, p); }).join("") + "</div></section>";
    });
    if (t.method) html += '<aside class="method"><h2>How these were picked</h2>' + t.method + "</aside>";
    main.innerHTML = html;

    if (r.sub) {
      var el = document.getElementById("s-" + r.sub);
      if (el) el.scrollIntoView();
    } else window.scrollTo(0, 0);
  }

  main.addEventListener("click", function (e) {
    var th = e.target.closest(".thumb");
    if (th) {
      var f = document.createElement("iframe");
      f.className = "frame";
      f.src = th.getAttribute("data-embed");
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.title = th.getAttribute("aria-label");
      th.replaceWith(f);
      return;
    }
    var fb = e.target.closest("[data-filter]");
    if (fb) { filter = fb.getAttribute("data-filter"); save(FILTER_KEY, filter); renderMain(route()); }
  });
  main.addEventListener("change", function (e) {
    if (e.target.type !== "checkbox") return;
    var card = e.target.closest(".pick"), id = card.getAttribute("data-uid");
    if (e.target.checked) watched[id] = Date.now(); else delete watched[id];
    save(KEY, watched);
    card.classList.toggle("watched", e.target.checked);
    var r = route();
    renderSide(r);
    var c = counts(r.topic);
    main.querySelector(".progress").innerHTML = '<span class="bar"><span style="width:' + (c.total ? c.done / c.total * 100 : 0) + '%"></span></span>' + c.done + " of " + c.total + " watched";
  });

  var lastTopic = null;
  function render() {
    var r = route();
    renderSide(r);
    if (r.topic !== lastTopic || !r.sub || !document.getElementById("s-" + r.sub)) { renderMain(r); lastTopic = r.topic; }
    else document.getElementById("s-" + r.sub).scrollIntoView();
  }
  window.addEventListener("hashchange", render);
  render();
})();
