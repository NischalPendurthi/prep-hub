import random, subprocess, sys
from itertools import product

ITERS = 300


def gen():
    n = random.randint(1, 4)
    a = [random.randint(0, 5) for _ in range(n)]
    k = random.randint(0, 14)
    return f"{n} {k}\n{' '.join(map(str, a))}\n"


def brute(inp):
    t = list(map(int, inp.split()))
    n, k, a = t[0], t[1], t[2:]
    return str(sum(sum(c) == k for c in product(*[range(v + 1) for v in a])) % (10**9 + 7))


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

