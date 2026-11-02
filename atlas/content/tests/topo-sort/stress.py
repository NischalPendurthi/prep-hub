import random, subprocess, sys
from itertools import permutations

exe = sys.argv[1]
for it in range(600):
    n = random.randint(1, 6)
    m = random.randint(0, 9) if n > 1 else 0
    # mostly forward edges in a hidden order so DAGs are common, sometimes any direction
    perm = random.sample(range(1, n + 1), n)
    edges = []
    for _ in range(m):
        i, j = sorted(random.sample(range(n), 2))
        a, b = perm[i], perm[j]
        if random.random() < 0.15:
            a, b = b, a
        edges.append((a, b))
    # brute: try every permutation
    def valid(order):
        pos = {v: i for i, v in enumerate(order)}
        return len(order) == n and sorted(order) == list(range(1, n + 1)) and all(pos[a] < pos[b] for a, b in edges)
    has = any(valid(p) for p in permutations(range(1, n + 1)))
    inp = f"{n} {m}\n" + "".join(f"{a} {b}\n" for a, b in edges)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if not has:
        ok = got == ["IMPOSSIBLE"]
    else:
        try:
            ok = valid(list(map(int, got)))
        except ValueError:
            ok = False
    if not ok:
        print("mismatch\n" + inp + "order exists:", has, "got", got)
        sys.exit(1)
