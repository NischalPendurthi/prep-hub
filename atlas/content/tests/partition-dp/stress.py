import random, subprocess, sys
from itertools import combinations

ITERS = 400


def brute(inp):
    t = list(map(int, inp.split()))
    n, d = t[0], t[1]; a = t[2:2 + n]
    if d > n:
        return "-1"
    best = None
    for cuts in combinations(range(1, n), d - 1):  # every way to place d-1 cuts
        b = [0, *cuts, n]
        cost = sum(max(a[b[i]:b[i + 1]]) for i in range(d))
        best = cost if best is None else min(best, cost)
    return str(best)


def gen():
    n = random.randint(1, 10); d = random.randint(1, 11)
    a = [random.randint(0, random.choice([1, 10, 1000])) for _ in range(n)]
    return f"{n} {d}\n{' '.join(map(str, a))}\n"


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True, timeout=10).stdout.split()


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = run(exe, inp)
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp[:30], "got", got[:30])
            sys.exit(1)
