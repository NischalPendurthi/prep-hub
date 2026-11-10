/* Prep Plan. The timetable lives in data.js; ticks live in localStorage.
   plan.v1     { taskId: "YYYY-MM-DD" }  the date each task was ticked (the real date, not the plan day)
   plan.rev.v1 { "YYYY-MM-DD": { taskId: 1 } }  revision items ticked on that day
   The revision list for a day is built from ticks: tasks finished that day, 1, 3 and 7 days before,
   plus a few older ones, so everything studied since the start keeps coming back. */
(function () {
  "use strict";
  var KEY = "plan.v1", REV_KEY = "plan.rev.v1", DATA_KEY = "plan.data.v1";
  /* The timetable names private projects, so it stays out of the public repo: a local build serves data.js,
     and the published site reads plan.json from the private repo after sign-in, then caches it here. */
  var PRIVATE_DATA = "https://api.github.com/repos/NischalPendurthi/prep-hub-private/contents/plan.json";
  var $ = function (id) { return document.getElementById(id); };

  function cachedRaw() { try { return localStorage.getItem(DATA_KEY); } catch (e) { return null; } }
  function cached() { try { return JSON.parse(cachedRaw() || "null"); } catch (e) { return null; } }
  function cache(p) { try { localStorage.setItem(DATA_KEY, JSON.stringify(p)); } catch (e) {} }

  function fetchPrivate() {
    if (document.documentElement.getAttribute("data-hub-auth") !== "in") return Promise.resolve(null);
    var token;
    try { token = localStorage.getItem("cp_counter_gh_token_v2"); } catch (e) { return Promise.resolve(null); }
    return fetch(PRIVATE_DATA, {
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github.raw+json" },
      cache: "no-cache"
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  var started = false;
  if (window.PLAN) { cache(window.PLAN); start(window.PLAN); }
  else {
    /* Keep the raw string: start() fills in defaults on the object (b.tasks = []), so comparing
       the fresh copy to the started object would always differ and reload forever. */
    var raw = cachedRaw(), c = cached();
    if (c) start(c);
    fetchPrivate().then(function (p) {
      if (!p || !p.days) {
        if (!started) $("day").textContent = "Sign in to load the plan.";
        return;
      }
      var changed = JSON.stringify(p) !== raw;
      cache(p);
      if (!started) start(p);
      else if (changed) location.reload();
    });
  }

  function start(P) {
  started = true;

  function read(k) { try { return JSON.parse(localStorage.getItem(k) || "null") || {}; } catch (e) { return {}; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var done = read(KEY), rev = read(REV_KEY);

  /* ---------- dates (local, not UTC) ---------- */
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], p[1] - 1, +p[2]); }
  function shift(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function diff(a, b) { return Math.round((parse(a) - parse(b)) / 864e5); }
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var WDL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function short(s) { var d = parse(s); return WD[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; }
  function long(s) { var d = parse(s); return WDL[d.getDay()] + ", " + d.getDate() + " " + MON[d.getMonth()]; }

  var qd = new URLSearchParams(location.search).get("d");
  var realToday = /^\d{4}-\d\d-\d\d$/.test(qd || "") ? qd : iso(new Date());
  var today = realToday < P.start ? P.start : realToday > P.end ? P.end : realToday;

  /* ---------- index ---------- */
  var TASK = {}, DAY_OF = {}, ALL = [];
  P.days.forEach(function (d) {
    d.blocks.forEach(function (b) {
      b.tasks = b.tasks || [];
      b.tasks.forEach(function (t) { TASK[t.id] = t; DAY_OF[t.id] = d.date; ALL.push(t); });
    });
  });
  var EXAM_DATE = {};
  P.exams.forEach(function (e) { EXAM_DATE[e.id] = e.date; });

  function dayTasks(d) { return d.blocks.reduce(function (a, b) { return a.concat(b.tasks); }, []); }
  function count(list) {
    var n = list.filter(function (t) { return done[t.id]; }).length;
    return { done: n, total: list.length, pct: list.length ? Math.round(n / list.length * 100) : 0 };
  }
  function fmtMins(m) { return m >= 60 ? (Math.floor(m / 60) + "h" + (m % 60 ? " " + m % 60 + "m" : "")) : m + "m"; }

  /* An exam-prep task stops mattering once its exam is over; a "write the exam" task never carries over. */
  function stillRelevant(t) {
    if (t.kind !== "exam") return true;
    var ex = t.id.split(":")[0];
    return EXAM_DATE[ex] ? EXAM_DATE[ex] >= realToday : false;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- selection ---------- */
  function selected() {
    var h = location.hash.slice(1);
    return P.days.some(function (d) { return d.date === h; }) ? h : today;
  }

  /* ---------- header ---------- */
  function renderTop() {
    var c = count(ALL);
    var left = diff(P.end, realToday);
    $("sub").textContent = short(P.start) + " – " + short(P.end) +
      (left >= 0 && realToday >= P.start ? " · " + (left + 1) + (left ? " days" : " day") + " left" : "");
    var o = $("overall");
    o.textContent = "";
    var lab = el("div", "olabel");
    lab.append(el("strong", "", c.done + " / " + c.total), " tasks · " + c.pct + "%");
    var bar = el("div", "bar"), fill = el("span");
    fill.style.width = c.pct + "%";
    bar.appendChild(fill);
    o.append(lab, bar);

    var ex = $("exams");
    ex.textContent = "";
    P.exams.forEach(function (e) {
      var n = diff(e.date, realToday);
      var chip = el("span", "exam" + (n < 0 ? " past" : n <= 1 ? " soon" : ""));
      chip.append(el("b", "", e.name), " " + (n < 0 ? "done" : n === 0 ? "today" : n === 1 ? "tomorrow" : "in " + n + " days") +
        " · " + short(e.date) + (e.time ? " " + e.time : "") + (e.venue && e.venue !== "TBD" ? " · " + e.venue : ""));
      ex.appendChild(chip);
    });
  }

  function renderStrip(sel) {
    var box = $("days");
    box.textContent = "";
    P.days.forEach(function (d) {
      var c = count(dayTasks(d));
      var a = el("a", "chip");
      a.href = "#" + d.date;
      if (d.date === sel) a.setAttribute("aria-current", "date");
      if (d.date === realToday) a.classList.add("today");
      if (d.date < realToday) a.classList.add("past");
      var p = parse(d.date);
      a.append(el("span", "wd", WD[p.getDay()]), el("span", "dn", String(p.getDate())));
      if (d.exams.some(function (x) { return x.exam; })) a.appendChild(el("span", "dot", "")).title = "Exam day";
      var bar = el("span", "mini"), fill = el("span");
      fill.style.width = c.pct + "%";
      bar.appendChild(fill);
      a.appendChild(bar);
      a.setAttribute("aria-label", long(d.date) + ", " + c.done + " of " + c.total + " done");
      box.appendChild(a);
    });
    var cur = box.querySelector('[aria-current="date"]');
    if (cur) cur.scrollIntoView({ block: "nearest", inline: "center" });
  }

  /* ---------- tasks ---------- */
  function taskRow(t, extra) {
    var li = el("li", "task k-" + t.kind + (done[t.id] ? " done" : ""));
    var id = "t-" + t.id.replace(/[^a-z0-9]+/gi, "-") + (extra ? "-" + extra : "");
    var cb = el("input");
    cb.type = "checkbox";
    cb.id = id;
    cb.checked = !!done[t.id];
    cb.addEventListener("change", function () {
      if (cb.checked) done[t.id] = realToday; else delete done[t.id];
      write(KEY, done);
      render(true);
      var again = document.getElementById(id);
      if (again) again.focus();
    });
    var body = el("div", "tbody");
    var lab = el("label", "ttext");
    lab.htmlFor = id;
    lab.textContent = t.text;
    body.appendChild(lab);
    var meta = el("div", "meta");
    meta.appendChild(el("span", "mins", fmtMins(t.mins)));
    if (t.note) meta.appendChild(el("span", "", t.note));
    if (t.href) { var a = el("a", "open", "Open →"); a.href = t.href; meta.appendChild(a); }
    if (t.video) { var v = el("a", "vid", "▶ watch if stuck"); v.href = t.video; meta.appendChild(v); }
    if (done[t.id] && done[t.id] !== DAY_OF[t.id]) meta.appendChild(el("span", "when", "ticked " + short(done[t.id])));
    body.appendChild(meta);
    li.append(cb, body);
    return li;
  }

  function renderCarry(box, sel) {
    if (sel !== today) return;
    var late = ALL.filter(function (t) { return DAY_OF[t.id] < today && !done[t.id] && stillRelevant(t); });
    if (!late.length) return;
    var mins = late.reduce(function (s, t) { return s + t.mins; }, 0);
    var det = el("details", "carry");
    if (late.length <= 6) det.open = true;
    var sum = el("summary");
    sum.append(el("strong", "", "Carry-over: " + late.length + (late.length === 1 ? " task" : " tasks")),
      " from earlier days · about " + fmtMins(mins));
    det.appendChild(sum);
    var hint = el("p", "hint", "Fit these into today's slack or the Nov 30 catch-up block. Skip anything marked Skim if time is short.");
    det.appendChild(hint);
    var ul = el("ul", "tasks");
    var last = "";
    late.forEach(function (t) {
      if (DAY_OF[t.id] !== last) { last = DAY_OF[t.id]; ul.appendChild(el("li", "from", "From " + short(last))); }
      ul.appendChild(taskRow(t, "carry"));
    });
    det.appendChild(ul);
    box.appendChild(det);
  }

  /* ---------- revision ---------- */
  function seeded(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
  }

  function revisionGroups(day) {
    var byAge = {};
    Object.keys(done).forEach(function (id) {
      if (!TASK[id]) return;
      var age = diff(day, done[id]);
      if (age < 0) return;
      (byAge[age] = byAge[age] || []).push(TASK[id]);
    });
    var groups = [
      { name: "Finished today: recall each one without looking, then check", list: byAge[0] || [] },
      { name: "From yesterday", list: byAge[1] || [] },
      { name: "From 3 days ago", list: byAge[3] || [] },
      { name: "From a week ago", list: byAge[7] || [] }
    ];
    var older = [];
    Object.keys(byAge).forEach(function (a) { if (+a > 1 && +a !== 3 && +a !== 7) older = older.concat(byAge[a]); });
    older = older.filter(function (t) { return t.kind !== "exam"; });
    var rnd = seeded(day);
    older.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    for (var i = older.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var x = older[i]; older[i] = older[j]; older[j] = x; }
    groups.push({ name: "Older picks: one-minute recall each", list: older.slice(0, 4) });
    return groups;
  }

  function renderRevision(box, day, b) {
    var card = el("section", "block rev");
    var head = el("div", "bhead");
    head.append(el("span", "time", b.time), el("h3", "", b.title));
    card.appendChild(head);
    var r = rev[day] || {};
    var any = false;
    revisionGroups(day).forEach(function (g) {
      var list = g.list.filter(stillRelevant);
      if (!list.length) return;
      any = true;
      card.appendChild(el("h4", "", g.name));
      var ul = el("ul", "revlist");
      list.forEach(function (t) {
        var li = el("li", r[t.id] ? "done" : "");
        var id = "r-" + day + "-" + t.id.replace(/[^a-z0-9]+/gi, "-");
        var cb = el("input");
        cb.type = "checkbox";
        cb.id = id;
        cb.checked = !!r[t.id];
        cb.addEventListener("change", function () {
          rev[day] = rev[day] || {};
          if (cb.checked) rev[day][t.id] = 1; else delete rev[day][t.id];
          write(REV_KEY, rev);
          li.className = cb.checked ? "done" : "";
        });
        var lab = el("label", "", t.text);
        lab.htmlFor = id;
        li.append(cb, lab);
        if (t.href) { var a = el("a", "open", "Open →"); a.href = t.href; li.appendChild(a); }
        ul.appendChild(li);
      });
      card.appendChild(ul);
    });
    if (!any) card.appendChild(el("p", "hint", day > realToday
      ? "This list fills in on the day, from the tasks you have ticked by then."
      : "Nothing ticked yet. Tasks you tick come back here the same night, then after 1, 3 and 7 days."));
    var std = el("div", "standing");
    [["MCQ: review mistakes", "../mcq/#/mode/mistakes"], ["Codeforces: re-solve one problem you missed", "https://codeforces.com/problemset"]].forEach(function (l) {
      var a = el("a", "", l[0]);
      a.href = l[1];
      std.appendChild(a);
    });
    card.appendChild(std);
    box.appendChild(card);
  }

  /* ---------- day ---------- */
  function renderDay(sel) {
    var box = $("day");
    box.textContent = "";
    var d = P.days.filter(function (x) { return x.date === sel; })[0];
    var c = count(dayTasks(d));
    var mins = dayTasks(d).reduce(function (s, t) { return s + t.mins; }, 0);

    var head = el("div", "dhead");
    var h2 = el("h2", "", long(d.date));
    if (d.date === realToday) h2.appendChild(el("span", "badge", "Today"));
    head.appendChild(h2);
    var line = el("p", "dline", c.done + " of " + c.total + " done · about " + fmtMins(mins) + " of tasks · 7 h sleep, 4 h meals and rest");
    head.appendChild(line);
    if (d.exams.length) {
      var ex = el("div", "dexams");
      d.exams.forEach(function (x) {
        ex.appendChild(el("span", "exam" + (x.exam ? " soon" : ""), x.course + " · " + x.label + (x.hours ? " " + x.hours + "h" : "")));
      });
      head.appendChild(ex);
    }
    if (d.note) head.appendChild(el("p", "note", d.note));
    box.appendChild(head);

    renderCarry(box, sel);

    d.blocks.forEach(function (b) {
      if (b.kind === "break") {
        var br = el("div", "brk");
        br.append(el("span", "time", b.time), el("span", "", b.title));
        box.appendChild(br);
        return;
      }
      if (b.kind === "rev" && !b.tasks.length) { renderRevision(box, d.date, b); return; }
      var sec = el("section", "block k-" + b.kind);
      var bh = el("div", "bhead");
      bh.append(el("span", "time", b.time), el("h3", "", b.title));
      var bc = count(b.tasks);
      if (b.tasks.length > 1) bh.appendChild(el("span", "bcount", bc.done + "/" + bc.total));
      sec.appendChild(bh);
      var ul = el("ul", "tasks");
      b.tasks.forEach(function (t) { ul.appendChild(taskRow(t)); });
      sec.appendChild(ul);
      box.appendChild(sec);
    });
  }

  function render(keepScroll) {
    var sel = selected();
    var y = window.scrollY;
    renderTop();
    renderStrip(sel);
    renderDay(sel);
    if (keepScroll) window.scrollTo(0, y);
  }

  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });

  /* ---------- optional + export/import ---------- */
  (P.optional || []).forEach(function (o) {
    var li = el("li"), a = el("a", "", o.text);
    a.href = o.href;
    li.appendChild(a);
    $("optional-list").appendChild(li);
  });

  $("export").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify({ done: done, rev: rev }, null, 1)], { type: "application/json" });
    var a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prep-plan-" + realToday + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  $("import").addEventListener("click", function () { $("file").click(); });
  $("file").addEventListener("change", function () {
    var f = $("file").files[0];
    if (!f) return;
    f.text().then(function (txt) {
      var data = JSON.parse(txt);
      if (!data || typeof data.done !== "object") throw new Error("bad file");
      Object.keys(data.done).forEach(function (k) {
        if (TASK[k] && /^\d{4}-\d\d-\d\d$/.test(data.done[k])) done[k] = data.done[k];
      });
      Object.keys(data.rev || {}).forEach(function (d) {
        rev[d] = Object.assign(rev[d] || {}, data.rev[d]);
      });
      write(KEY, done);
      write(REV_KEY, rev);
      render();
    }).catch(function () { alert("That file isn't a Prep Plan export."); });
    $("file").value = "";
  });

  render();
  }
})();
