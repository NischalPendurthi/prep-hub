"""Add a problem you solved to content/mine/.

usage:
  python tools/add.py <url> [solution.cpp] --variant <id> [--variant <id2>] --insight "the one-line trick"
                      [--mistakes "..."] [--star] [--date YYYY-MM-DD] [--tags "InMobi OA,contest 2041"]
                      [--title "..."] [--rating 1600] [--platform OA]

Without --insight the entry is saved as status 'needs-insight' so you can annotate it later.
Title, rating and tags are fetched from Codeforces / LeetCode / CSES when the URL is recognised.
"""
import argparse
import datetime
import difflib
import sys

from atlas import CONTENT, PLATFORMS, load_yaml, lookup, parse_url, slugify, write_front_matter
from build import split_template

# CF tag -> variants worth considering (suggestions only)
CF_TAG_HINTS = {
    "dsu": ["dsu-basic", "dsu-offline-reverse", "dsu-parity"],
    "binary search": ["bs-on-answer", "bs-bounds"],
    "two pointers": ["two-pointers-same-dir", "window-variable"],
    "bitmasks": ["bit-tricks", "bitmask-dp", "submask-enumeration"],
    "graph matchings": ["bipartite-matching", "min-path-cover"],
    "flows": ["max-flow-dinic"],
    "shortest paths": ["dijkstra", "bfs", "zero-one-bfs"],
    "hashing": ["rolling-hash"],
    "combinatorics": ["ncr-factorials", "inclusion-exclusion"],
    "games": ["nim-grundy"],
    "geometry": ["geometry-basics"],
    "matrices": ["matrix-exponentiation"],
    "constructive algorithms": ["constructive"],
    "sortings": ["exchange-argument", "sweep-line-events"],
    "probabilities": ["expected-value-dp"],
    "meet-in-the-middle": ["meet-in-the-middle"],
    "2-sat": ["scc"],
    "chinese remainder theorem": ["gcd-ext-euclid"],
    "number theory": ["sieve-spf", "divisors", "gcd-ext-euclid"],
    "trees": ["tree-dp", "lca-binary-lifting", "subtree-euler-tour"],
    "strings": ["kmp", "z-function", "rolling-hash"],
    "data structures": ["segtree-basic", "fenwick-point-range", "multiset-budget"],
    "dfs and similar": ["cycle-detection", "grid-flood-fill"],
    "graphs": ["bfs", "topo-sort"],
    "dp": ["dp-linear", "knapsack-01", "interval-dp"],
}


def all_variant_ids():
    return [v["id"] for c in load_yaml(CONTENT / "taxonomy.yaml") for k in c["concepts"] for v in k["variants"]]


def main():
    ap = argparse.ArgumentParser(description="Add a solved problem to CP Atlas")
    ap.add_argument("url", help="problem URL (or '-' for an OA / offline problem)")
    ap.add_argument("code", nargs="?", help="your solution file (.cpp/.py)")
    ap.add_argument("--variant", "-v", action="append", default=[])
    ap.add_argument("--insight", "-i", default="")
    ap.add_argument("--mistakes", "-m", default="")
    ap.add_argument("--star", action="store_true")
    ap.add_argument("--date", default=datetime.date.today().isoformat())
    ap.add_argument("--tags", default="")
    ap.add_argument("--title", default="")
    ap.add_argument("--rating", default=None)
    ap.add_argument("--platform", default="")
    a = ap.parse_args()

    url = "" if a.url == "-" else a.url
    platform, pid = parse_url(url)
    info = lookup(platform, pid) if platform else None
    if url and platform in ("CF", "LC", "CSES") and not info:
        sys.exit(f"could not find {platform} problem '{pid}' on the judge: check the URL")

    title = a.title or (info and info["title"]) or ""
    if not title:
        sys.exit("no title: pass --title for problems outside CF / LC / CSES")
    platform = a.platform or platform or "OTHER"
    if platform not in PLATFORMS:
        sys.exit(f"--platform must be one of {PLATFORMS}")
    rating = a.rating if a.rating is not None else (info and info["rating"])
    if isinstance(rating, str) and rating.isdigit():
        rating = int(rating)

    known = all_variant_ids()
    for v in a.variant:
        if v not in known:
            close = difflib.get_close_matches(v, known, n=4, cutoff=0.4)
            sys.exit(f"unknown variant '{v}'. Did you mean: {', '.join(close) or '(no close match)'}?\n"
                     f"(every id is listed in content/taxonomy.yaml)")

    tags = [t.strip() for t in a.tags.split(",") if t.strip()]
    cf_tags = (info or {}).get("tags", [])
    status = "solved" if a.insight and a.variant else "needs-insight"

    body = ""
    if a.code:
        src = open(a.code, encoding="utf-8").read()
        lang = "python" if a.code.endswith(".py") else "cpp"
        code = split_template(src) if lang == "cpp" else src.strip()
        body = f"```{lang}\n{code}\n```"

    meta = {"title": title, "url": url, "platform": platform, "rating": rating, "date": a.date,
            "variants": a.variant, "tags": tags + [f"cf:{t}" for t in cf_tags], "insight": a.insight,
            "mistakes": a.mistakes, "star": a.star, "status": status}
    base = f"{a.date}-{slugify(title)}"
    path = CONTENT / "mine" / f"{base}.md"
    n = 2
    while path.exists():
        path = CONTENT / "mine" / f"{base}-{n}.md"
        n += 1
    write_front_matter(path, meta, body)

    print(f"added {path.relative_to(CONTENT.parent)}  [{platform}] {title}  rating={rating}  status={status}")
    hints = sorted({v for t in cf_tags for v in CF_TAG_HINTS.get(t, [])} - set(a.variant))
    if hints:
        print("  CF tags suggest these variants:", ", ".join(hints))
    if status == "needs-insight":
        print("  no insight/variant yet: edit the file and set status: solved when you've written them")
    print("  next: python tools/build.py   (then git commit + push to publish)")


if __name__ == "__main__":
    main()
