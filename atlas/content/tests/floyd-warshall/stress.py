import random, subprocess, sys, heapq

exe = sys.argv[1]
for it in range(500):
    n = random.randint(1, 7)
    m = random.randint(0, 12)
    W = random.choice([5, 10**9])
    edges = [(random.randint(1, n), random.randint(1, n), random.randint(1, W)) for _ in range(m)]
    qs = [(random.randint(1, n), random.randint(1, n)) for _ in range(random.randint(1, 10))]
    adj = [[] for _ in range(n + 1)]
    for a, b, c in edges:
        adj[a].append((b, c)); adj[b].append((a, c))
    exp = []
    for s, t in qs:  # brute: a fresh Dijkstra per query
        d = {s: 0}
        pq = [(0, s)]
        while pq:
            du, u = heapq.heappop(pq)
            if du > d[u]:
                continue
            for v, w in adj[u]:
                if du + w < d.get(v, float("inf")):
                    d[v] = du + w
                    heapq.heappush(pq, (d[v], v))
        exp.append(str(d.get(t, -1)))
    inp = f"{n} {m} {len(qs)}\n" + "".join(f"{a} {b} {c}\n" for a, b, c in edges) + "".join(f"{a} {b}\n" for a, b in qs)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != exp:
        print("mismatch\n" + inp + "expected", exp, "got", got)
        sys.exit(1)
