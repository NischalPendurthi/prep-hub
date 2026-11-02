import random, subprocess, sys

ITERS = 400


def brute(inp):
    it = iter(inp.split())
    n = int(next(it))
    a = [0] + [int(next(it)) for _ in range(n)]
    m = int(next(it))
    out = []
    for _ in range(m):
        t, l, r = int(next(it)), int(next(it)), int(next(it))
        if t == 1:
            out.append(sum(a[l:r + 1]))
        else:
            x = int(next(it))
            for i in range(l, r + 1):
                a[i] ^= x
    return "\n".join(map(str, out))


def gen():
    n = random.randint(1, 12)
    m = random.randint(1, 15)
    hi = random.choice([7, 10**6])
    a = [random.randint(0, hi) for _ in range(n)]
    qs = []
    for _ in range(m):
        l = random.randint(1, n)
        r = random.randint(l, n)
        if random.random() < 0.5:
            qs.append(f"1 {l} {r}")
        else:
            qs.append(f"2 {l} {r} {random.randint(1, hi)}")
    return f"{n}\n{' '.join(map(str, a))}\n{m}\n" + "\n".join(qs) + "\n"


FIXED = [
    "5\n4 10 3 13 7\n8\n1 2 4\n2 1 3 3\n1 2 4\n1 3 3\n2 2 5 5\n1 1 5\n2 1 2 10\n1 2 3\n",
    "1\n0\n3\n1 1 1\n2 1 1 1000000\n1 1 1\n",
    "4\n1000000 1000000 0 0\n4\n2 1 4 1000000\n1 1 4\n2 2 3 1\n1 1 4\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
