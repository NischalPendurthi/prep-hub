import random, subprocess, sys

exe = sys.argv[1]
INF = float("inf")
for it in range(600):
    n = random.randint(1, 7)
    m = random.randint(0, 12)
    edges = [(random.randint(1, n), random.randint(1, n), random.randint(-6, 10)) for _ in range(m)]
    best = {}
    for a, b, c in edges:
        best[(a, b)] = min(best.get((a, b), INF), c)
    # brute: Floyd-Warshall, a negative cycle exists iff some d[i][i] < 0
    d = [[0 if i == j else INF for j in range(n + 1)] for i in range(n + 1)]
    for (a, b), c in best.items():
        d[a][b] = min(d[a][b], c)
    for k in range(1, n + 1):
        for i in range(1, n + 1):
            for j in range(1, n + 1):
                d[i][j] = min(d[i][j], d[i][k] + d[k][j])
    has = any(d[i][i] < 0 for i in range(1, n + 1))
    inp = f"{n} {m}\n" + "".join(f"{a} {b} {c}\n" for a, b, c in edges)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if not has:
        ok = got == ["NO"]
    else:
        try:
            c = list(map(int, got[1:]))
            ok = (got[0] == "YES" and len(c) >= 2 and c[0] == c[-1]
                  and all((c[i], c[i + 1]) in best for i in range(len(c) - 1))
                  and sum(best[(c[i], c[i + 1])] for i in range(len(c) - 1)) < 0)
        except (ValueError, IndexError):
            ok = False
    if not ok:
        print("mismatch\n" + inp + "negative cycle:", has, "got", got)
        sys.exit(1)
