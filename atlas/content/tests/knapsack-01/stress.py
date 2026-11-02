import random, subprocess, sys

ITERS = 400


def brute(inp):
    t = list(map(int, inp.split()))
    n, x = t[0], t[1]; h = t[2:2 + n]; s = t[2 + n:2 + 2 * n]
    best = 0
    for m in range(1 << n):  # every subset of books
        cost = sum(h[i] for i in range(n) if m >> i & 1)
        if cost <= x:
            best = max(best, sum(s[i] for i in range(n) if m >> i & 1))
    return str(best)


def gen():
    n = random.randint(1, 10); x = random.randint(1, 40)
    h = [random.randint(1, 15) for _ in range(n)]
    s = [random.randint(1, 20) for _ in range(n)]
    return f"{n} {x}\n{' '.join(map(str, h))}\n{' '.join(map(str, s))}\n"


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True, timeout=10).stdout.split()


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = run(exe, inp)
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp[:30], "got", got[:30])
            sys.exit(1)
