import random, subprocess, sys


def connected(n, e, skip, a, b):
    adj = [[] for _ in range(n + 1)]
    for i, (u, v) in enumerate(e):
        if i != skip:
            adj[u].append(v)
            adj[v].append(u)
    seen, st = {a}, [a]
    while st:
        u = st.pop()
        for v in adj[u]:
            if v not in seen:
                seen.add(v)
                st.append(v)
    return b in seen


def solve(inp):  # brute: an edge is a bridge iff deleting it disconnects its two endpoints
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    e = [(int(next(it)), int(next(it))) for _ in range(m)]
    br = sorted((min(u, v), max(u, v)) for i, (u, v) in enumerate(e) if not connected(n, e, i, u, v))
    return f"{len(br)}\n" + "".join(f"{u} {v}\n" for u, v in br)


def gen():
    n = random.randint(1, 8)
    m = random.randint(0, 11)
    e = []
    for _ in range(m):
        a, b = random.sample(range(1, n + 1), 2) if n > 1 else (None, None)
        if a is not None:
            e.append((a, b))  # parallel edges allowed, they are never bridges
    return f"{n} {len(e)}\n" + "".join(f"{a} {b}\n" for a, b in e)


if __name__ == "__main__":
    exe = sys.argv[1]
    for _ in range(600):
        inp = gen()
        exp = solve(inp)
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp.split():
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
