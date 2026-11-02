import random, subprocess, sys


def partitions(items):  # every set partition, recursively
    if not items:
        yield []
        return
    first, rest = items[0], items[1:]
    for p in partitions(rest):
        yield [[first]] + p
        for i in range(len(p)):
            yield p[:i] + [[first] + p[i]] + p[i + 1:]


def brute(inp):
    v = list(map(int, inp.split()))
    n = v[0]
    a = [v[1 + i * n:1 + (i + 1) * n] for i in range(n)]
    best = None
    for p in partitions(list(range(n))):
        s = sum(a[i][j] for g in p for i in g for j in g if i < j)
        best = s if best is None else max(best, s)
    return str(best)


def gen():
    n = random.randint(1, 7)
    hi = random.choice([5, 10**9])
    a = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            a[i][j] = a[j][i] = random.randint(-hi, hi)
    return f"{n}\n" + "\n".join(" ".join(map(str, r)) for r in a) + "\n"


if __name__ == "__main__":
    for it in range(300):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
