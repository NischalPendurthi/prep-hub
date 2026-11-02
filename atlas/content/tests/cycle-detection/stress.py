import random, subprocess, sys

exe = sys.argv[1]
for it in range(600):
    n = random.randint(1, 8)
    m = random.randint(0, 12) if n > 1 else 0
    edges = [tuple(random.sample(range(1, n + 1), 2)) for _ in range(m)]
    es = set(edges)
    # brute: transitive closure, a cycle exists iff some node reaches itself
    reach = [[False] * (n + 1) for _ in range(n + 1)]
    for a, b in edges:
        reach[a][b] = True
    for k in range(1, n + 1):
        for i in range(1, n + 1):
            for j in range(1, n + 1):
                reach[i][j] = reach[i][j] or (reach[i][k] and reach[k][j])
    has = any(reach[i][i] for i in range(1, n + 1))
    inp = f"{n} {m}\n" + "".join(f"{a} {b}\n" for a, b in edges)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if not has:
        ok = got == ["IMPOSSIBLE"]
    else:
        try:
            k = int(got[0]); c = list(map(int, got[1:]))
            ok = (k == len(c) >= 3 and c[0] == c[-1] and len(set(c[:-1])) == k - 1
                  and all((c[i], c[i + 1]) in es for i in range(k - 1)))
        except (ValueError, IndexError):
            ok = False
    if not ok:
        print("mismatch\n" + inp + "cycle exists:", has, "got", got)
        sys.exit(1)
