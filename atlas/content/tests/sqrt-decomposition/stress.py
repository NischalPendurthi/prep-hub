import random, subprocess, sys

ITERS = 400


def brute(inp):  # simulate every jump
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    a = [int(next(it)) for _ in range(n)]
    out = []
    for _ in range(m):
        t = int(next(it))
        if t == 0:
            p, b = int(next(it)), int(next(it))
            a[p - 1] = b
        else:
            p = int(next(it)) - 1
            cnt, last = 0, p
            while p < n:
                last = p
                cnt += 1
                p += a[p]
            out.append(f"{last + 1} {cnt}")
    return "\n".join(out)


def gen():
    n = random.randint(1, 30)
    m = random.randint(1, 20)
    a = [random.randint(1, min(n, random.choice([2, 4, n]))) for _ in range(n)]
    qs = []
    for _ in range(m):
        if random.random() < 0.4:
            qs.append(f"0 {random.randint(1, n)} {random.randint(1, n)}")
        else:
            qs.append(f"1 {random.randint(1, n)}")
    return f"{n} {m}\n{' '.join(map(str, a))}\n" + "\n".join(qs) + "\n"


FIXED = [
    "8 5\n1 1 1 1 1 2 8 2\n1 1\n0 1 3\n1 1\n0 3 4\n1 2\n",
    "1 2\n1\n1 1\n0 1 1\n",
    "10 4\n1 1 1 1 1 1 1 1 1 1\n1 1\n0 5 6\n1 1\n1 10\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
