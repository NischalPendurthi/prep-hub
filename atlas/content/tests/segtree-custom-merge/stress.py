import random, subprocess, sys

ITERS = 400


def brute(inp):  # O(n^2) over all subarrays, empty subarray allowed
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    a = [int(next(it)) for _ in range(n)]
    out = []
    for _ in range(m):
        k, x = int(next(it)), int(next(it))
        a[k - 1] = x
        best = 0
        for i in range(n):
            s = 0
            for j in range(i, n):
                s += a[j]
                best = max(best, s)
        out.append(best)
    return "\n".join(map(str, out))


def gen():
    n = random.randint(1, 10)
    m = random.randint(1, 10)
    hi = random.choice([5, 10**9])
    a = [random.randint(-hi, hi) for _ in range(n)]
    qs = [f"{random.randint(1, n)} {random.randint(-hi, hi)}" for _ in range(m)]
    return f"{n} {m}\n{' '.join(map(str, a))}\n" + "\n".join(qs) + "\n"


FIXED = [
    "5 3\n2 -1 2 -2 3\n1 -1\n2 2\n5 -1\n",
    "1 2\n-5\n1 -3\n1 4\n",
    "4 2\n-1 -2 -3 -4\n2 -7\n4 0\n",
    "5 1\n1000000000 1000000000 1000000000 1000000000 1000000000\n3 1000000000\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
