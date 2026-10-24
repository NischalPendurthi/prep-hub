import random, subprocess, sys
from functools import lru_cache

exe = sys.argv[1]
for it in range(400):
    n, m = random.randint(1, 6), random.randint(1, 6)
    edges = sorted({(random.randint(1, n), random.randint(1, m)) for _ in range(random.randint(0, 12))})
    adj = {u: [v for (x, v) in edges if x == u] for u in range(1, n + 1)}

    @lru_cache(None)
    def best(u, used):  # brute force: left vertices u..n, bitmask of used right vertices
        if u > n:
            return 0
        r = best(u + 1, used)
        for v in adj[u]:
            if not used >> v & 1:
                r = max(r, 1 + best(u + 1, used | 1 << v))
        return r

    inp = f"{n} {m} {len(edges)}\n" + "".join(f"{u} {v}\n" for u, v in edges)
    out = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    cnt = int(out[0])
    pairs = [(int(out[i]), int(out[i + 1])) for i in range(1, len(out), 2)]
    ok = (cnt == best(1, 0) and len(pairs) == cnt and all(p in edges for p in pairs)
          and len({u for u, _ in pairs}) == cnt and len({v for _, v in pairs}) == cnt)
    if not ok:
        print("wrong matching\n" + inp, "got", out, "expected size", best(1, 0))
        sys.exit(1)
