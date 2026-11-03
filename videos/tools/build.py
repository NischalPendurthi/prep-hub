#!/usr/bin/env python3
"""Validate videos/content/*.json and write videos/data.js.

usage: python3 videos/tools/build.py            offline: schema checks only (CI)
       python3 videos/tools/build.py --online   also confirm every video still exists on YouTube
                                               and its title matches the one recorded

Topic order and the list of planned topics come from videos/content/index.json.
"""
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
ROLES = {"course", "best", "next", "deeper", "quick"}


def fail(msg):
    print("videos: " + msg, file=sys.stderr)
    sys.exit(1)


def oembed_title(p):
    url = ("https://www.youtube.com/watch?v=" if p["kind"] == "v" else "https://www.youtube.com/playlist?list=") + p["id"]
    req = urllib.request.Request("https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(url, safe=""),
                                 headers={"User-Agent": "prep-hub-video-check/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r).get("title")
    except Exception:  # noqa: BLE001
        return None


def main():
    online = "--online" in sys.argv
    index = json.loads((CONTENT / "index.json").read_text())
    topics, seen_total, bad = [], 0, []
    for entry in index["topics"]:
        path = CONTENT / (entry["id"] + ".json")
        if not path.exists():
            topics.append({"id": entry["id"], "name": entry["name"], "ready": False})
            continue
        t = json.loads(path.read_text())
        if t.get("id") != entry["id"]:
            fail(f"{path.name}: id must be {entry['id']}")
        keys = set()
        for s in t["subtopics"]:
            if s["key"] in keys:
                fail(f"{t['id']}: duplicate subtopic {s['key']}")
            keys.add(s["key"])
            if not s.get("picks"):
                fail(f"{t['id']}/{s['key']}: no picks")
            ids = set()
            for p in s["picks"]:
                where = f"{t['id']}/{s['key']}/{p.get('id')}"
                for f in ("kind", "id", "role", "title", "channel", "why"):
                    if not p.get(f):
                        fail(f"{where}: missing {f}")
                if p["kind"] not in ("v", "l"):
                    fail(f"{where}: kind must be v or l")
                if p["role"] not in ROLES:
                    fail(f"{where}: role must be one of {sorted(ROLES)}")
                if p["kind"] == "v" and len(p["id"]) != 11:
                    fail(f"{where}: video ids are 11 characters")
                k = (p["id"], p.get("start", 0))
                if k in ids:
                    fail(f"{where}: listed twice in one subtopic")
                ids.add(k)
                if online:
                    got = oembed_title(p)
                    if got is None:
                        bad.append(f"{where}: no longer available")
                    elif got.strip() != p["title"].strip():
                        bad.append(f"{where}: title is now {got!r}")
                seen_total += 1
            if sum(p["role"] == "best" for p in s["picks"]) > 1:
                fail(f"{t['id']}/{s['key']}: more than one best pick")
        t["ready"] = True
        topics.append(t)
    if bad:
        fail("online check failed:\n  " + "\n  ".join(bad))
    (ROOT / "data.js").write_text("window.VIDEOS = " + json.dumps({"topics": topics}, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(f"videos: {seen_total} picks across {sum(t['ready'] for t in topics)} topic(s)" + (" (online check passed)" if online else ""))


if __name__ == "__main__":
    main()
