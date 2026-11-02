import random, subprocess, sys
from itertools import combinations


def brute(inp):  # every subset
    v = list(map(int, inp.split()))
    n, x, t = v[0], v[1], v[2:]
    return str(sum(sum(c) == x for k in range(n + 1) for c in combinations(t, k)))


def gen():
    n = random.randint(1, 12)
    hi = random.choice([1, 3, 10, 10**9])
    t = [random.randint(1, hi) for _ in range(n)]
    x = random.choice([random.randint(1, max(1, sum(t))), sum(t), random.choice(t)])
    return f"{n} {x}\n{' '.join(map(str, t))}\n"


if __name__ == "__main__":
    for it in range(400):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
