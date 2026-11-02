import random, subprocess, sys
from itertools import product


def solve(inp):  # brute: lexicographically smallest valid 1/2 colouring (= smallest vertex of each component gets 1)
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    e = [(int(next(it)), int(next(it))) for _ in range(m)]
    for c in product((1, 2), repeat=n):
        if all(c[a - 1] != c[b - 1] for a, b in e):
            return " ".join(map(str, c))
    return "IMPOSSIBLE"


def gen():
    n = random.randint(1, 9)
    pairs = [(a, b) for a in range(1, n + 1) for b in range(a + 1, n + 1)]
    e = random.sample(pairs, random.randint(0, min(len(pairs), 10)))
    return f"{n} {len(e)}\n" + "".join(f"{a} {b}\n" if random.random() < .5 else f"{b} {a}\n" for a, b in e)


if __name__ == "__main__":
    exe = sys.argv[1]
    for _ in range(600):
        inp = gen()
        exp = solve(inp)
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp.split():
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
