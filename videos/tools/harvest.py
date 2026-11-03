#!/usr/bin/env python3
"""Collect candidate videos for one topic.

usage: python3 videos/tools/harvest.py <topic>

Sources:
  * Hacker News comments (Algolia API) that link to YouTube and mention the topic's terms.
    Each video gets the number of distinct HN users who linked it, plus comment snippets.
  * YouTube search results for each subtopic query (views, length, channel).
Titles and channels for HN links come from YouTube oEmbed, so dead or private videos drop out.

Writes videos/.work/<topic>/candidates.json and review.txt (a compact list for curation).
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORK = HERE.parent / ".work"
UA = {"User-Agent": "prep-hub-video-harvester/1.0", "Accept-Language": "en"}

VID_RE = re.compile(r"(?:youtube\.com/(?:watch\?(?:[^\s\"'<>]*?&)?v=|embed/|live/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})")
LIST_RE = re.compile(r"youtube\.com/[^\s\"'<>]*?[?&]list=([A-Za-z0-9_-]{13,})")
TAG_RE = re.compile(r"<[^>]+>")


def get(url, tries=2):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=12) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:  # noqa: BLE001
            if getattr(e, "code", None) in (400, 401, 403, 404):
                return None
            time.sleep(1.5 * (i + 1))
    return None


# ---------------- Hacker News ----------------
def hn_search(query):
    url = "https://hn.algolia.com/api/v1/search?" + urllib.parse.urlencode(
        {"query": query, "tags": "comment", "hitsPerPage": 1000})
    body = get(url)
    return json.loads(body)["hits"] if body else []


def snippet(text, key, width=260):
    plain = TAG_RE.sub(" ", text)
    plain = re.sub(r"\s+", " ", plain).strip()
    i = plain.find(key)
    if i < 0:
        return plain[:width]
    a = max(0, i - width // 2)
    return plain[a:a + width]


def harvest_hn(terms):
    queries = [f"{p} {t}" for t in terms for p in ("youtube.com", "youtu.be")]
    with ThreadPoolExecutor(6) as ex:
        results = list(ex.map(hn_search, queries))
    videos, lists, seen = {}, {}, set()
    for q, hits in zip(queries, results):
        for h in hits:
            cid = h["objectID"]
            raw = html.unescape(h.get("comment_text") or "")
            for kind, rx, store in (("v", VID_RE, videos), ("l", LIST_RE, lists)):
                for vid in set(rx.findall(raw)):
                    e = store.setdefault(vid, {"authors": set(), "comments": {}, "terms": set()})
                    e["terms"].add(q.split(" ", 1)[1])
                    if (cid, vid) in seen:
                        continue
                    seen.add((cid, vid))
                    e["authors"].add(h.get("author"))
                    e["comments"][cid] = {
                        "story": h.get("story_title"),
                        "date": (h.get("created_at") or "")[:10],
                        "text": snippet(raw, vid),
                    }
    return videos, lists


# ---------------- YouTube ----------------
def oembed(kind, ident):
    url = ("https://www.youtube.com/watch?v=" if kind == "v" else "https://www.youtube.com/playlist?list=") + ident
    body = get("https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(url, safe=""))
    if not body:
        return None
    d = json.loads(body)
    return {"title": d.get("title"), "channel": d.get("author_name")}


def walk(o, out):
    if isinstance(o, dict):
        if "videoRenderer" in o:
            v = o["videoRenderer"]
            out.append({
                "id": v.get("videoId"),
                "title": "".join(r.get("text", "") for r in v.get("title", {}).get("runs", [])),
                "channel": (v.get("ownerText", {}).get("runs") or [{}])[0].get("text"),
                "views": v.get("viewCountText", {}).get("simpleText"),
                "length": v.get("lengthText", {}).get("simpleText"),
                "age": v.get("publishedTimeText", {}).get("simpleText"),
            })
            return
        for x in o.values():
            walk(x, out)
    elif isinstance(o, list):
        for x in o:
            walk(x, out)


def yt_search(query):
    body = get("https://www.youtube.com/results?" + urllib.parse.urlencode({"search_query": query, "hl": "en"}))
    if not body:
        return []
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", body, re.S)
    if not m:
        return []
    out = []
    walk(json.loads(m.group(1)), out)
    return out[:20]


def views_num(s):
    if not s:
        return 0
    d = re.sub(r"[^\d]", "", s)
    return int(d) if d else 0


def main():
    topic = sys.argv[1]
    cfg = json.loads((HERE / "topics.json").read_text())[topic]
    out_dir = WORK / topic
    out_dir.mkdir(parents=True, exist_ok=True)
    cache_path = WORK / "oembed.json"
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}

    hn_path = out_dir / "hn.json"
    if hn_path.exists() and "--refresh" not in sys.argv:
        raw = json.loads(hn_path.read_text())
        videos, lists = raw["v"], raw["l"]
    else:
        print("HN: searching", len(cfg["hn_terms"]) * 2, "queries", flush=True)
        videos, lists = harvest_hn(cfg["hn_terms"])
        for store in (videos, lists):
            for e in store.values():
                e["authors"] = sorted(a for a in e["authors"] if a)
                e["terms"] = sorted(e["terms"])
        hn_path.write_text(json.dumps({"v": videos, "l": lists}))
    print(f"HN: {len(videos)} videos, {len(lists)} playlists", flush=True)

    # Only look up links that look on-topic: recommended by 2+ people, or the comment talks about the subject.
    words = [w.lower() for w in cfg["hn_terms"]] + ["lecture", "course", "talk", "explain", "professor", "class"]

    def relevant(e):
        if len(e["authors"]) >= 2:
            return True
        text = " ".join(c["text"] for c in e["comments"].values()).lower()
        return any(w in text for w in words)

    todo = [("v", k) for k, e in videos.items() if relevant(e) and "v:" + k not in cache] + \
           [("l", k) for k, e in lists.items() if relevant(e) and "l:" + k not in cache]
    print(f"oEmbed: {len(todo)} lookups", flush=True)
    with ThreadPoolExecutor(4) as ex:
        for n, ((kind, k), meta) in enumerate(zip(todo, ex.map(lambda t: oembed(*t), todo)), 1):
            cache[f"{kind}:{k}"] = meta
            if n % 100 == 0:
                cache_path.write_text(json.dumps(cache))
                print(f"  {n}/{len(todo)}", flush=True)
    cache_path.write_text(json.dumps(cache))

    hn = []
    for kind, store in (("v", videos), ("l", lists)):
        for k, e in store.items():
            meta = cache.get(f"{kind}:{k}")
            if not meta:
                continue  # dead, private or region-blocked
            hn.append({"kind": kind, "id": k, **meta, "hn_users": len(e["authors"]),
                       "terms": sorted(e["terms"]), "comments": list(e["comments"].values())[:4]})
    hn.sort(key=lambda x: -x["hn_users"])

    yt = {}
    for key, sub in cfg["subtopics"].items():
        rows = {}
        for q in sub["yt"]:
            for r in yt_search(q):
                if r["id"] and r["id"] not in rows:
                    rows[r["id"]] = r
        yt[key] = sorted(rows.values(), key=lambda r: -views_num(r["views"]))
        print(f"YT {key}: {len(yt[key])}")

    (out_dir / "candidates.json").write_text(json.dumps({"hn": hn, "yt": yt}, indent=1))

    hn_ids = {x["id"]: x["hn_users"] for x in hn}
    lines = ["== HN-linked (distinct users | kind | id | channel | title | matched terms) =="]
    for x in hn:
        lines.append(f'{x["hn_users"]:>3} {x["kind"]} {x["id"]} | {x["channel"]} | {x["title"]} | {", ".join(x["terms"][:5])}')
        for c in x["comments"][:2]:
            lines.append(f'      > [{c["date"]}] {c["text"][:220]}')
    for key, rows in yt.items():
        lines.append(f"\n== YT {key}: {cfg['subtopics'][key]['name']} ==")
        for r in rows:
            tag = f' HN{hn_ids[r["id"]]}' if r["id"] in hn_ids else ""
            lines.append(f'{r["id"]} | {r["channel"]} | {r["title"]} | {r["views"]} | {r["length"]} | {r["age"]}{tag}')
    (out_dir / "review.txt").write_text("\n".join(lines))
    print("wrote", out_dir / "review.txt")


if __name__ == "__main__":
    main()
