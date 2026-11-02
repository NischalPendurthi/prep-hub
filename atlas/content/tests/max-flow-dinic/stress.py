import random, subprocess, sys


def solve(inp):  # brute: max flow = min cut; try every S containing 1 and not n
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    e = [(int(next(it)), int(next(it)), int(next(it))) for _ in range(m)]
    best = None
    for mask in range(1 << n):
        if not mask & 1 or mask >> (n - 1) & 1:
            continue
        cut = sum(c for a, b, c in e if mask >> (a - 1) & 1 and not mask >> (b - 1) & 1)
        best = cut if best is None else min(best, cut)
    return str(best)


def gen():
    n = random.randint(2, 7)
    m = random.randint(0, 14)
    return f"{n} {m}\n" + "".join(f"{random.randint(1, n)} {random.randint(1, n)} {random.choice([1, 2, 5, 10**9])}\n"
                                  for _ in range(m))


if __name__ == "__main__":
    exe = sys.argv[1]
    for _ in range(600):
        inp = gen()
        exp = solve(inp)
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp.split():
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
