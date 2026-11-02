import random, subprocess, sys

exe = sys.argv[1]
INF = float("inf")
it = 0
while it < 500:
    n = random.randint(1, 8)
    m = random.randint(0, 16)
    W = random.choice([3, 10, 10**9])
    edges = [(random.randint(1, n), random.randint(1, n), random.randint(0, W)) for _ in range(m)]
    for v in range(2, n + 1):  # keep every city reachable, as the problem guarantees
        if random.random() < 0.5:
            edges.append((random.randint(1, v - 1), v, random.randint(1, W)))
    # brute: Bellman-Ford
    d = [INF] * (n + 1)
    d[1] = 0
    for _ in range(n):
        for a, b, c in edges:
            if d[a] + c < d[b]:
                d[b] = d[a] + c
    if INF in d[1:]:
        continue
    it += 1
    inp = f"{n} {len(edges)}\n" + "".join(f"{a} {b} {c}\n" for a, b, c in edges)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != [str(x) for x in d[1:]]:
        print("mismatch\n" + inp + "expected", d[1:], "got", got)
        sys.exit(1)
