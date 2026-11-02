import random, subprocess, sys

exe = sys.argv[1]
INF = float("inf")
for it in range(500):
    n = random.randint(2, 8)
    m = random.randint(0, 12)
    edges = []
    for _ in range(m):
        a, b = random.sample(range(1, n + 1), 2)
        edges.append((a, b))
    # brute: Floyd-Warshall on unit weights
    d = [[0 if i == j else INF for j in range(n + 1)] for i in range(n + 1)]
    for a, b in edges:
        d[a][b] = d[b][a] = 1
    for k in range(1, n + 1):
        for i in range(1, n + 1):
            for j in range(1, n + 1):
                d[i][j] = min(d[i][j], d[i][k] + d[k][j])
    inp = f"{n} {m}\n" + "".join(f"{a} {b}\n" for a, b in edges)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    adj = {(a, b) for a, b in edges} | {(b, a) for a, b in edges}
    if d[1][n] == INF:
        ok = got == ["IMPOSSIBLE"]
    else:
        try:
            k = int(got[0]); path = list(map(int, got[1:]))
            ok = (k == d[1][n] + 1 == len(path) and path[0] == 1 and path[-1] == n
                  and all((path[i], path[i + 1]) in adj for i in range(k - 1)))
        except (ValueError, IndexError):
            ok = False
    if not ok:
        print("mismatch\n" + inp + "expected length", d[1][n] + 1, "got", got)
        sys.exit(1)
