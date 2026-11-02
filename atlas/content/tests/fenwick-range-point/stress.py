import random, subprocess, sys

ITERS = 400


def brute(inp):
    it = iter(inp.split())
    n, q = int(next(it)), int(next(it))
    a = [0] + [int(next(it)) for _ in range(n)]
    out = []
    for _ in range(q):
        t = int(next(it))
        if t == 1:
            l, r, u = int(next(it)), int(next(it)), int(next(it))
            for i in range(l, r + 1):
                a[i] += u
        else:
            out.append(a[int(next(it))])
    return "\n".join(map(str, out))


def gen():
    n = random.randint(1, 12)
    q = random.randint(1, 15)
    hi = random.choice([5, 10**9])
    a = [random.randint(1, hi) for _ in range(n)]
    qs = []
    for _ in range(q):
        if random.random() < 0.5:
            l = random.randint(1, n)
            qs.append(f"1 {l} {random.randint(l, n)} {random.randint(1, hi)}")
        else:
            qs.append(f"2 {random.randint(1, n)}")
    return f"{n} {q}\n{' '.join(map(str, a))}\n" + "\n".join(qs) + "\n"


FIXED = [
    "8 3\n3 2 4 5 1 1 5 3\n2 4\n1 2 5 1\n2 4\n",
    "1 3\n5\n1 1 1 1000000000\n2 1\n2 1\n",
    "4 5\n1 1 1 1\n1 1 4 2\n1 4 4 3\n2 1\n2 4\n2 3\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
