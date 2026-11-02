import random, subprocess, sys
from itertools import permutations

ITERS = 300


def gen():
    n = random.randint(1, 7)
    x = random.randint(1, 20)
    w = [random.randint(1, x) for _ in range(n)]
    return f"{n} {x}\n{' '.join(map(str, w))}\n"


def brute(inp):
    # any packing is some order of people filled greedily ride by ride
    t = list(map(int, inp.split()))
    n, x, w = t[0], t[1], t[2:]
    best = n
    for p in permutations(w):
        rides, cur = 1, 0
        for v in p:
            if cur + v > x:
                rides, cur = rides + 1, 0
            cur += v
        best = min(best, rides)
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

