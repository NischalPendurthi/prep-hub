import random, subprocess, sys

from itertools import combinations
ITERS = 500


def gen():
    n = random.randint(3, 9)
    k = random.randint(3, n)
    dist = random.randint(max(k - 2, 0), n - 2)
    a = [random.randint(1, 6) for _ in range(n)]
    return f"{n} {k} {dist}\n{' '.join(map(str, a))}\n"


def brute(inp):
    t = list(map(int, inp.split()))
    n, k, dist, a = t[0], t[1], t[2], t[3:]
    best = None
    for c in combinations(range(1, n), k - 1):
        if c[-1] - c[0] <= dist:
            s = a[0] + sum(a[i] for i in c)
            best = s if best is None else min(best, s)
    return str(best)


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = run(exe, inp)
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp, "got", got)
            sys.exit(1)

