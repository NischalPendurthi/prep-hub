import random, subprocess, sys
from itertools import product

ITERS = 300


def gen():
    n = random.randint(1, 8)
    return f"{n}\n{' '.join(str(random.randint(0, 3)) for _ in range(n))}\n"


def brute(inp):
    t = list(map(int, inp.split()))
    a = t[1:]
    best = len(a)
    for plan in product(range(3), repeat=len(a)):  # 0 rest, 1 contest, 2 gym
        ok = all(s == 0 or (a[i] >> (s - 1) & 1) for i, s in enumerate(plan))
        ok = ok and all(not (plan[i] and plan[i] == plan[i + 1]) for i in range(len(a) - 1))
        if ok:
            best = min(best, plan.count(0))
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

