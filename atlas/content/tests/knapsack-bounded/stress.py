import random, subprocess, sys
from itertools import product

ITERS = 400


def brute(inp):
    t = list(map(int, inp.split()))
    n, x = t[0], t[1]; h = t[2:2 + n]; s = t[2 + n:2 + 2 * n]; k = t[2 + 2 * n:2 + 3 * n]
    best = 0
    for cnt in product(*[range(ki + 1) for ki in k]):  # every copy count per book
        if sum(c * hi for c, hi in zip(cnt, h)) <= x:
            best = max(best, sum(c * si for c, si in zip(cnt, s)))
    return str(best)


def gen():
    n = random.randint(1, 4); x = random.randint(1, 50)
    h = [random.randint(1, 12) for _ in range(n)]
    s = [random.randint(1, 20) for _ in range(n)]
    k = [random.randint(1, 7) for _ in range(n)]
    return f"{n} {x}\n" + "\n".join(" ".join(map(str, v)) for v in (h, s, k)) + "\n"


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
