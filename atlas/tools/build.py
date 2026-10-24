"""Validate content/ and compile it into site/data.js.

usage: python tools/build.py            # build, fail on errors
       python tools/build.py --serve    # build, then serve site/ on http://localhost:8000
"""
import datetime
import functools
import http.server
import json
import sys

from atlas import (CONTENT, PLATFORMS, SITE, load_yaml, parse_url, problem_key,
                   problem_url, read_front_matter)

TEMPLATE_HEAD_PREFIXES = ("#include", "#define", "using ", "typedef")


def split_template(code):
    """Core = everything between the standard header and the standard main()."""
    lines = code.rstrip().split("\n")
    i = 0
    while i < len(lines) and (lines[i].startswith(TEMPLATE_HEAD_PREFIXES) or not lines[i].strip()):
        i += 1
    j = len(lines)
    for k in range(len(lines) - 1, -1, -1):
        if lines[k].startswith("int main"):
            j = k
            break
    return "\n".join(lines[i:j]).strip("\n")


def build():
    errors = []
    err = errors.append

    # ---- taxonomy
    tax = load_yaml(CONTENT / "taxonomy.yaml")
    variants, categories = {}, []
    for cat in tax:
        c = {"id": cat["id"], "title": cat["title"], "concepts": []}
        for con in cat["concepts"]:
            ids = []
            for v in con["variants"]:
                if v["id"] in variants:
                    err(f"taxonomy: duplicate variant id {v['id']}")
                variants[v["id"]] = {"id": v["id"], "title": v["title"], "category": cat["id"],
                                     "concept": con["id"], "conceptTitle": con["title"],
                                     "categoryTitle": cat["title"], "ready": False,
                                     "standard": [], "mine": []}
                ids.append(v["id"])
            c["concepts"].append({"id": con["id"], "title": con["title"], "variants": ids})
        categories.append(c)

    # ---- variant pages + templates
    for f in sorted((CONTENT / "variants").rglob("*.md")):
        try:
            meta, body = read_front_matter(f)
        except ValueError as e:
            err(str(e))
            continue
        vid = meta.get("id")
        if vid not in variants:
            err(f"{f}: id '{vid}' is not in taxonomy.yaml")
            continue
        v = variants[vid]
        if f.stem != vid or f.parent.name != v["category"]:
            err(f"{f}: expected content/variants/{v['category']}/{vid}.md")
        for key in ("signals", "idea", "complexity"):
            if not meta.get(key):
                err(f"{f}: missing '{key}'")
        tpl = CONTENT / "templates" / f"{vid}.cpp"
        if not tpl.exists():
            err(f"{f}: missing template content/templates/{vid}.cpp")
            code = ""
        else:
            code = tpl.read_text(encoding="utf-8")
        if not list((CONTENT / "tests" / vid).glob("*.in")):
            err(f"{f}: no sample tests in content/tests/{vid}/")
        v.update(ready=True, title=meta.get("title", v["title"]), signals=meta.get("signals", []),
                 idea=meta.get("idea", ""), complexity=meta.get("complexity", ""),
                 pitfalls=meta.get("pitfalls", []), related=meta.get("related", []),
                 body=body, templateFull=code.rstrip(), templateCore=split_template(code))

    for v in variants.values():
        for r in v.get("related", []):
            if r not in variants:
                err(f"variant {v['id']}: related id '{r}' does not exist")

    # ---- standard problems
    standard = []
    for i, s in enumerate(load_yaml(CONTENT / "standard.yaml") or []):
        where = f"standard.yaml entry {i} ({s.get('title')})"
        if s.get("platform") not in ("CF", "LC", "CSES"):
            err(f"{where}: platform must be CF, LC or CSES")
            continue
        pid = str(s["id"])
        s = {**s, "id": pid, "key": problem_key(s["platform"], pid), "url": problem_url(s["platform"], pid)}
        for vid in s.get("variants", []):
            if vid not in variants:
                err(f"{where}: unknown variant '{vid}'")
            else:
                variants[vid]["standard"].append(len(standard))
        standard.append(s)

    # ---- your problems
    mine = []
    for f in sorted((CONTENT / "mine").glob("*.md")):
        try:
            meta, body = read_front_matter(f)
        except ValueError as e:
            err(str(e))
            continue
        status = meta.get("status", "solved")
        p = {"id": f.stem, "title": meta.get("title", f.stem), "url": meta.get("url", ""),
             "platform": meta.get("platform", "OTHER"), "rating": meta.get("rating"),
             "date": str(meta.get("date", "")), "variants": meta.get("variants") or [],
             "insight": meta.get("insight") or "", "mistakes": meta.get("mistakes") or "",
             "star": bool(meta.get("star")), "status": status, "tags": meta.get("tags") or [],
             "body": body}
        if p["platform"] not in PLATFORMS:
            err(f"{f}: platform must be one of {PLATFORMS}")
        if status not in ("solved", "needs-insight", "unsolved"):
            err(f"{f}: status must be solved, needs-insight or unsolved")
        try:
            datetime.date.fromisoformat(p["date"])
        except ValueError:
            err(f"{f}: date must be YYYY-MM-DD")
        if status == "solved" and (not p["insight"] or not p["variants"]):
            err(f"{f}: a solved entry needs an insight and at least one variant "
                f"(use status: needs-insight until you write them)")
        for vid in p["variants"]:
            if vid not in variants:
                err(f"{f}: unknown variant '{vid}'")
            else:
                variants[vid]["mine"].append(f.stem)
        plat, pid = parse_url(p["url"])
        p["key"] = problem_key(plat, pid) if plat else ""
        mine.append(p)

    solved_keys = {p["key"] for p in mine if p["key"] and p["status"] != "unsolved"}
    for s in standard:
        s["solved"] = s["key"] in solved_keys
    mine.sort(key=lambda p: (p["date"], p["id"]), reverse=True)

    if errors:
        print(f"build failed with {len(errors)} error(s):")
        for e in errors:
            print("  -", e)
        sys.exit(1)

    data = {"generated": datetime.datetime.now().isoformat(timespec="seconds"),
            "categories": categories, "variants": variants, "standard": standard, "mine": mine}
    out = SITE / "data.js"
    out.write_text("window.ATLAS = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
    ready = sum(v["ready"] for v in variants.values())
    print(f"built {out.relative_to(SITE.parent)}: {ready}/{len(variants)} variants ready, "
          f"{len(standard)} standard problems, {len(mine)} of yours")


if __name__ == "__main__":
    build()
    if "--serve" in sys.argv:
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(SITE))
        print("serving on http://localhost:8000  (Ctrl+C to stop)")
        http.server.ThreadingHTTPServer(("127.0.0.1", 8000), handler).serve_forever()
