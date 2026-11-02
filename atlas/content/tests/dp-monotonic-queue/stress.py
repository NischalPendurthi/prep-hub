import random, subprocess, sys
from itertools import combinations

ITERS = 300


def gen():
    n = random.randint(1, 10)
    k = random.randint(1, n)
    x = random.randint(1, n)
    a = [random.randint(1, 10**9 if random.random() < 0.2 else 20) for _ in range(n)]
    return f"{n} {k} {x}\n{' '.join(map(str, a))}\n"


def brute(inp):
    t = list(map(int, inp.split()))
    n, k, x, a = t[0], t[1], t[2], t[3:]
    best = -1
    for c in combinations(range(n), x):
        s = set(c)
        if all(any(j in s for j in range(i, i + k)) for i in range(n - k + 1)):
            best = max(best, sum(a[j] for j in c))
    return str(best)


def same(e, g):
    return e.split() == g.split()


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True, timeout=10).stdout


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp)
        got = run(exe, inp)
        if not same(exp, got):
            print("mismatch on input:\n" + inp + "expected:", exp, "got:", got)
            sys.exit(1)

