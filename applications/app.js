/* Application tracker. The list lives in localStorage. seed.json (gitignored) holds the applied jobs:
   a local build serves it directly, and the published site reads the same list from the private repo
   after sign-in, so it never reaches the public repo. Export and Import use the same format. */
(function () {
  "use strict";
  var KEY = "applications.v1";
  /* Bump the suffix when the seed list should be merged in again. */
  var SEED_DONE = "applications.seeded.v2";
  var PRIVATE_SEED = "https://api.github.com/repos/NischalPendurthi/prep-hub-private/contents/applications.json";
  var STATUSES = [
    { id: "rejected", name: "Rejected" },
    { id: "hope", name: "Hope" },
    { id: "interview", name: "Interview" },
    { id: "offered", name: "Offered" }
  ];

  var apps = [];
  var filter = "all";
  var $ = function (id) { return document.getElementById(id); };

  function keyOf(a) { return (a.company + "\n" + a.role).toLowerCase(); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function say(text) {
    $("msg").textContent = text || "";
    $("msg").hidden = !text;
  }

  /* Returns clean entries, or null if the data is not a list of applications. */
  function clean(data) {
    if (!Array.isArray(data)) return null;
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      if (!d || typeof d.company !== "string" || typeof d.role !== "string") return null;
      var company = d.company.trim(), role = d.role.trim();
      if (!company || !role) return null;
      var known = STATUSES.some(function (s) { return s.id === d.status; });
      out.push({ company: company, role: role, status: known ? d.status : "" });
    }
    return out;
  }

  function read() {
    try { return clean(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return null; }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(apps));
    } catch (e) {
      say("This browser is blocking storage, so changes will be lost when you close the page.");
    }
  }

  function renderFilters() {
    var box = $("filters");
    box.textContent = "";
    var opts = [{ id: "all", name: "All", n: apps.length }];
    opts.push({ id: "", name: "No tag", n: apps.filter(function (a) { return !a.status; }).length });
    STATUSES.forEach(function (s) {
      opts.push({ id: s.id, name: s.name, n: apps.filter(function (a) { return a.status === s.id; }).length });
    });
    opts.forEach(function (o) {
      var b = el("button");
      b.type = "button";
      b.setAttribute("aria-pressed", String(filter === o.id));
      b.append(o.name + " ", el("b", "", String(o.n)));
      b.addEventListener("click", function () {
        filter = o.id;
        render();
        box.children[opts.indexOf(o)].focus();
      });
      box.appendChild(b);
    });
  }

  function renderRow(a, freshKey) {
    var li = el("li", "row" + (keyOf(a) === freshKey ? " fresh" : ""));
    var who = el("div", "who");
    who.append(el("strong", "", a.company), el("span", "", a.role));

    var tags = el("div", "tags");
    tags.setAttribute("role", "group");
    tags.setAttribute("aria-label", "Status");
    STATUSES.forEach(function (s, i) {
      var t = el("button", "tag " + s.id, s.name);
      t.type = "button";
      t.setAttribute("aria-pressed", String(a.status === s.id));
      t.addEventListener("click", function () {
        a.status = a.status === s.id ? "" : s.id;
        save();
        var row = renderList().get(a);
        if (row) row.querySelectorAll(".tag")[i].focus();
        renderFilters();
      });
      tags.appendChild(t);
    });

    var del = el("button", "del", "×");
    del.type = "button";
    del.setAttribute("aria-label", "Remove " + a.company + ", " + a.role);
    del.title = "Remove";
    del.addEventListener("click", function () {
      if (!confirm("Remove " + a.company + " (" + a.role + ")?")) return;
      apps.splice(apps.indexOf(a), 1);
      save();
      render();
    });

    li.append(who, tags, del);
    return li;
  }

  function renderList(freshKey) {
    var list = $("list");
    var rows = new Map();
    list.textContent = "";
    apps
      .filter(function (a) { return filter === "all" || a.status === filter; })
      .sort(function (x, y) {
        return x.company.localeCompare(y.company, undefined, { sensitivity: "base" }) ||
          x.role.localeCompare(y.role, undefined, { sensitivity: "base" });
      })
      .forEach(function (a) {
        var row = renderRow(a, freshKey);
        rows.set(a, row);
        list.appendChild(row);
      });
    var empty = $("empty");
    empty.hidden = rows.size > 0;
    empty.textContent = apps.length
      ? "No applications with this tag."
      : "No applications yet. Add one above, or import a saved list.";
    return rows;
  }

  function render(freshKey) {
    renderFilters();
    return renderList(freshKey);
  }

  $("add").addEventListener("submit", function (e) {
    e.preventDefault();
    var company = $("company").value.trim();
    var role = $("role").value.trim();
    if (!company || !role) {
      say("Enter both a company and a role.");
      $(company ? "role" : "company").focus();
      return;
    }
    var entry = { company: company, role: role, status: "" };
    if (apps.some(function (a) { return keyOf(a) === keyOf(entry); })) {
      say(company + " – " + role + " is already on the list.");
      return;
    }
    apps.push(entry);
    say("");
    save();
    filter = "all";
    var row = render(keyOf(entry)).get(entry);
    row.scrollIntoView({ block: "nearest" });
    $("add").reset();
    $("company").focus();
  });

  $("export").addEventListener("click", function () {
    var url = URL.createObjectURL(new Blob([JSON.stringify(apps, null, 2) + "\n"], { type: "application/json" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "applications.json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });

  $("import").addEventListener("click", function () { $("file").click(); });

  /* Import adds what is missing. A tag in the file replaces the one here; an untagged entry keeps it. */
  $("file").addEventListener("change", function () {
    var file = this.files[0];
    this.value = "";
    if (!file) return;
    file.text().then(function (text) {
      var incoming = clean(JSON.parse(text));
      if (!incoming) throw new Error("bad shape");
      var byKey = new Map(apps.map(function (a) { return [keyOf(a), a]; }));
      var added = 0;
      incoming.forEach(function (d) {
        var have = byKey.get(keyOf(d));
        if (have) { if (d.status) have.status = d.status; return; }
        apps.push(d);
        byKey.set(keyOf(d), d);
        added++;
      });
      save();
      filter = "all";
      render();
      say("");
      $("import").textContent = "Imported " + added + " new";
      setTimeout(function () { $("import").textContent = "Import"; }, 2500);
    }).catch(function () {
      say("That file isn't a list of applications, so nothing was imported.");
    });
  });

  /* another tab changed the list */
  window.addEventListener("storage", function (e) {
    if (e.key !== KEY) return;
    apps = read() || [];
    render();
  });

  function seeded() {
    try { return !!localStorage.getItem(SEED_DONE); } catch (e) { return true; }
  }

  function json(r) { return r.ok ? r.json() : null; }

  function fetchPrivateSeed() {
    if (document.documentElement.getAttribute("data-hub-auth") !== "in") return null;
    var token;
    try { token = localStorage.getItem("cp_counter_gh_token_v2"); } catch (e) { return null; }
    return fetch(PRIVATE_SEED, {
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github.raw+json" },
      cache: "no-cache"
    }).then(json);
  }

  /* Runs once per browser, so a removed entry stays removed and a tag you chose is kept.
     Entries that are missing are added, and untagged ones take the tag from the seed. */
  function mergeSeed(data) {
    var seed = clean(data);
    if (!seed) return;
    var byKey = new Map(apps.map(function (a) { return [keyOf(a), a]; }));
    seed.forEach(function (d) {
      var have = byKey.get(keyOf(d));
      if (!have) { apps.push(d); byKey.set(keyOf(d), d); }
      else if (!have.status) have.status = d.status;
    });
    save();
    try { localStorage.setItem(SEED_DONE, "1"); } catch (e) {}
    render();
  }

  apps = read() || [];
  render();
  if (!seeded()) {
    fetch("seed.json")
      .then(json)
      .catch(function () { return null; })
      .then(function (local) { return local || fetchPrivateSeed(); })
      .then(mergeSeed)
      .catch(function () {});
  }
})();
