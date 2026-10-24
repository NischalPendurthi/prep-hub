"""Shared helpers for build.py, verify.py, add.py and import_cf.py."""
import json
import re
import time
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
SITE = ROOT / "site"
CACHE = ROOT / "tools" / ".cache"

PLATFORMS = ("CF", "LC", "CSES", "AC", "CC", "OA", "OTHER")


# ---------------------------------------------------------------- files

def load_yaml(path):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def read_front_matter(path):
    """Return (meta dict, markdown body) for a file starting with a --- block."""
    text = Path(path).read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        raise ValueError(f"{path}: missing front matter")
    end = text.find("\n---", 4)
    if end == -1:
        raise ValueError(f"{path}: unterminated front matter")
    meta = yaml.safe_load(text[4:end]) or {}
    body = text[end + 4:].lstrip("\n")
    return meta, body


def write_front_matter(path, meta, body):
    head = yaml.safe_dump(meta, sort_keys=False, allow_unicode=True, width=1000)
    Path(path).write_text(f"---\n{head}---\n\n{body.rstrip()}\n", encoding="utf-8")


def slugify(s):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s.lower()).strip("-")
    return s[:60] or "problem"


def norm_title(s):
    return re.sub(r"[^a-z0-9]", "", str(s).lower())


# ---------------------------------------------------------------- problem keys

def problem_key(platform, pid):
    """Canonical key shared by standard problems and your solved problems."""
    return f"{platform}:{str(pid).strip().upper() if platform == 'CF' else str(pid).strip()}"


def parse_url(url):
    """Map a judge URL to (platform, id). Returns (None, None) if unknown."""
    if not url:
        return None, None
    m = re.search(r"codeforces\.com/(?:contest|problemset/problem|gym)/(\d+)/(?:problem/)?([A-Za-z]\d?)", url)
    if m:
        return "CF", f"{m.group(1)}{m.group(2).upper()}"
    m = re.search(r"leetcode\.com/problems/([a-z0-9-]+)", url)
    if m:
        return "LC", m.group(1)
    m = re.search(r"cses\.fi/problemset/(?:task|view)/(\d+)", url)
    if m:
        return "CSES", m.group(1)
    if "atcoder.jp" in url:
        m = re.search(r"tasks/([a-z0-9_]+)", url)
        return "AC", m.group(1) if m else url
    if "codechef.com" in url:
        return "CC", url.rstrip("/").rsplit("/", 1)[-1]
    return None, None


def problem_url(platform, pid):
    if platform == "CF":
        m = re.match(r"(\d+)([A-Z]\d?)$", pid)
        return f"https://codeforces.com/problemset/problem/{m.group(1)}/{m.group(2)}" if m else ""
    if platform == "LC":
        return f"https://leetcode.com/problems/{pid}/"
    if platform == "CSES":
        return f"https://cses.fi/problemset/task/{pid}"
    return ""


# ---------------------------------------------------------------- judge lookups (cached)

def _get(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers={"User-Agent": "cp-atlas", **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def _cached(name, max_age_s, fetch):
    CACHE.mkdir(parents=True, exist_ok=True)
    p = CACHE / name
    if p.exists() and time.time() - p.stat().st_mtime < max_age_s:
        return json.loads(p.read_text())
    val = fetch()
    p.write_text(json.dumps(val))
    return val


def cf_problems():
    """{'1900C': {'name':..., 'rating':..., 'tags':[...]}} for the whole CF problemset."""
    def fetch():
        res = json.loads(_get("https://codeforces.com/api/problemset.problems"))["result"]["problems"]
        return {f"{p['contestId']}{p['index']}": {"name": p["name"], "rating": p.get("rating"),
                                                  "tags": p.get("tags", [])} for p in res if "contestId" in p}
    return _cached("cf_problems.json", 86400, fetch)


def cses_problems():
    """{'1068': 'Weird Algorithm', ...}"""
    def fetch():
        html = _get("https://cses.fi/problemset/")
        return dict(re.findall(r'<a href="/problemset/task/(\d+)">([^<]+)</a>', html))
    return _cached("cses_problems.json", 7 * 86400, fetch)


def lc_question(slug):
    """{'id': '907', 'title': ..., 'difficulty': ...} or None if the slug does not exist."""
    CACHE.mkdir(parents=True, exist_ok=True)
    p = CACHE / "lc.json"
    cache = json.loads(p.read_text()) if p.exists() else {}
    if slug in cache:
        return cache[slug]
    body = json.dumps({"query": "query q($s:String!){question(titleSlug:$s){questionFrontendId title difficulty}}",
                       "variables": {"s": slug}}).encode()
    q = json.loads(_get("https://leetcode.com/graphql", data=body,
                        headers={"Content-Type": "application/json", "Referer": "https://leetcode.com"}))
    q = (q.get("data") or {}).get("question")
    val = {"id": q["questionFrontendId"], "title": q["title"], "difficulty": q["difficulty"]} if q else None
    cache[slug] = val
    p.write_text(json.dumps(cache, indent=0))
    return val


def lookup(platform, pid):
    """Title/rating/tags for a problem from its judge, or None."""
    if platform == "CF":
        p = cf_problems().get(pid)
        return p and {"title": p["name"], "rating": p["rating"], "tags": p["tags"]}
    if platform == "CSES":
        t = cses_problems().get(pid)
        return t and {"title": t, "rating": None, "tags": []}
    if platform == "LC":
        q = lc_question(pid)
        return q and {"title": f"{q['id']}. {q['title']}", "rating": q["difficulty"], "tags": []}
    return None
