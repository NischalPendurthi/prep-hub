"""Check that every template compiles and passes its samples, and every problem link is real.

usage: python tools/verify.py                 # templates + links
       python tools/verify.py templates [ids] # only templates (optionally just these ids)
       python tools/verify.py links           # only standard.yaml / mine links
"""
import subprocess
import sys

from atlas import (CONTENT, ROOT, load_yaml, lc_question, cf_problems, cses_problems,
                   norm_title, parse_url, read_front_matter)

BUILD = ROOT / "tools" / ".build"
GXX = ["g++", "-std=c++17", "-O2", "-Wall", "-DONLINE_JUDGE"]


def tokens(s):
    return s.split()


def check_templates(only):
    BUILD.mkdir(parents=True, exist_ok=True)
    fails = 0
    tpls = sorted((CONTENT / "templates").glob("*.cpp"))
    for tpl in tpls:
        vid = tpl.stem
        if only and vid not in only:
            continue
        exe = BUILD / vid
        r = subprocess.run(GXX + [str(tpl), "-o", str(exe)], capture_output=True, text=True)
        if r.returncode != 0:
            print(f"  FAIL {vid}: compile error\n{r.stderr[:2000]}")
            fails += 1
            continue
        cerr = r.stderr.strip()
        warn = " (warnings)" if cerr else ""
        tests = sorted((CONTENT / "tests" / vid).glob("*.in"))
        bad = []
        for t in tests:
            exp_file = t.with_suffix(".out")
            if not exp_file.exists():
                bad.append(f"{t.name}: missing .out")
                continue
            try:
                got = subprocess.run([str(exe)], stdin=open(t), capture_output=True, text=True, timeout=10).stdout
            except subprocess.TimeoutExpired:
                bad.append(f"{t.name}: timeout")
                continue
            if tokens(got) != tokens(exp_file.read_text()):
                bad.append(f"{t.name}: expected {exp_file.read_text().split()[:20]} got {got.split()[:20]}")
        stress = CONTENT / "tests" / vid / "stress.py"
        if stress.exists() and not bad:
            r = subprocess.run([sys.executable, "-I", str(stress), str(exe)], capture_output=True, text=True,
                               timeout=600)
            if r.returncode != 0:
                bad.append("stress: " + (r.stdout + r.stderr)[-800:])
        if bad:
            fails += 1
            print(f"  FAIL {vid}{warn}: " + "; ".join(bad))
        else:
            extra = " + stress" if stress.exists() else ""
            print(f"  ok   {vid}{warn}: {len(tests)} sample(s){extra}")
            if warn:
                print("       " + cerr.replace("\n", "\n       ")[:1500])
    return fails


def check_link(platform, pid, title, rating=None):
    """Return an error string, or None if the problem exists and the title matches."""
    if platform == "CF":
        p = cf_problems().get(pid)
        if not p:
            return f"CF {pid} does not exist"
        if title and norm_title(p["name"]) != norm_title(title):
            return f"CF {pid} is '{p['name']}', not '{title}'"
        if rating and p["rating"] and int(rating) != p["rating"]:
            return f"CF {pid} rating is {p['rating']}, not {rating}"
    elif platform == "CSES":
        t = cses_problems().get(pid)
        if not t:
            return f"CSES {pid} does not exist"
        if title and norm_title(t) != norm_title(title):
            return f"CSES {pid} is '{t}', not '{title}'"
    elif platform == "LC":
        q = lc_question(pid)
        if not q:
            return f"LC slug '{pid}' does not exist"
        if title and norm_title(q["title"]) != norm_title(title):
            return f"LC {pid} is '{q['title']}', not '{title}'"
        if rating and rating != q["difficulty"]:
            return f"LC {pid} difficulty is {q['difficulty']}, not {rating}"
    return None


def check_links():
    fails = 0
    for s in load_yaml(CONTENT / "standard.yaml") or []:
        e = check_link(s["platform"], str(s["id"]), s.get("title"), s.get("rating"))
        if e:
            fails += 1
            print("  FAIL standard:", e)
    n = len(load_yaml(CONTENT / "standard.yaml") or [])
    for f in sorted((CONTENT / "mine").glob("*.md")):
        meta, _ = read_front_matter(f)
        plat, pid = parse_url(meta.get("url", ""))
        if plat in ("CF", "LC", "CSES"):
            e = check_link(plat, pid, None)
            if e:
                fails += 1
                print(f"  FAIL {f.name}:", e)
    print(f"  checked {n} standard problem(s) and your entries' links")
    return fails


if __name__ == "__main__":
    args = sys.argv[1:]
    mode = args[0] if args and args[0] in ("templates", "links") else "all"
    only = set(args[1:]) if mode != "all" else set()
    fails = 0
    if mode in ("all", "templates"):
        print("templates:")
        fails += check_templates(only)
    if mode in ("all", "links"):
        print("links:")
        fails += check_links()
    print("ALL OK" if not fails else f"{fails} failure(s)")
    sys.exit(1 if fails else 0)
