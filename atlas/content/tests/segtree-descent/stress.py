import random, subprocess, sys

ITERS = 400


def brute(inp):
    v = list(map(int, inp.split()))
    n, m = v[0], v[1]
    h, r = v[2:2 + n], v[2 + n:]
    out = []
    for g in r:
        idx = 0
        for i in range(n):
            if h[i] >= g:
                h[i] -= g
                idx = i + 1
                break
        out.append(idx)
    return " ".join(map(str, out))


def gen():
    n = random.randint(1, 12)
    m = random.randint(1, 12)
    h = [random.randint(1, 10) for _ in range(n)]
    r = [random.randint(1, 10) for _ in range(m)]
    return f"{n} {m}\n{' '.join(map(str, h))}\n{' '.join(map(str, r))}\n"


FIXED = [
    "8 5\n3 2 4 1 5 5 2 6\n4 4 7 1 1\n",
    "1 3\n5\n5 1 1\n",
    "3 4\n1000000000 1 1000000000\n1000000000 1000000000 1 1\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
