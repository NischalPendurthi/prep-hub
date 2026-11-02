import random, subprocess, sys
from itertools import combinations


def solve(inp):  # brute: try every set of n-1 edges, keep the cheapest one that connects all n
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    e = [(int(next(it)), int(next(it)), int(next(it))) for _ in range(m)]
    best = None
    for sub in combinations(range(m), n - 1):
        p = list(range(n + 1))

        def f(x):
            while p[x] != x:
                x = p[x]
            return x
        comps = n
        for i in sub:
            a, b = f(e[i][0]), f(e[i][1])
            if a != b:
                p[a] = b
                comps -= 1
        if comps == 1:
            w = sum(e[i][2] for i in sub)
            best = w if best is None else min(best, w)
    return "IMPOSSIBLE" if best is None else str(best)


def gen():
    n = random.randint(1, 6)
    m = random.randint(0, 9)
    lines = [f"{n} {m}"]
    for _ in range(m):
        a, b = random.randint(1, n), random.randint(1, n)
        lines.append(f"{a} {b} {random.randint(1, 10)}")  # self loops and parallel edges allowed
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    exe = sys.argv[1]
    for _ in range(500):
        inp = gen()
        exp = solve(inp)
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp.split():
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
