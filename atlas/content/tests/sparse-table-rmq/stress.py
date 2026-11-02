import random, subprocess, sys

ITERS = 400


def brute(inp):
    it = iter(inp.split())
    n, q = int(next(it)), int(next(it))
    a = [int(next(it)) for _ in range(n)]
    out = []
    for _ in range(q):
        l, r = int(next(it)), int(next(it))
        out.append(min(a[l - 1:r]))
    return "\n".join(map(str, out))


def gen():
    n = random.randint(1, 40)
    q = random.randint(1, 30)
    hi = random.choice([5, 10**9])
    a = [random.randint(1, hi) for _ in range(n)]
    qs = []
    for _ in range(q):
        l = random.randint(1, n)
        qs.append(f"{l} {random.randint(l, n)}")
    return f"{n} {q}\n{' '.join(map(str, a))}\n" + "\n".join(qs) + "\n"


FIXED = [
    "8 4\n3 2 4 5 1 1 5 3\n2 4\n5 6\n1 8\n3 3\n",
    "1 1\n1000000000\n1 1\n",
    "16 4\n9 8 7 6 5 4 3 2 1 2 3 4 5 6 7 8\n1 16\n1 8\n10 16\n8 9\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
