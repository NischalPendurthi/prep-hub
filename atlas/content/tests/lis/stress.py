import random, subprocess, sys

ITERS = 400


def brute(inp):
    t = list(map(int, inp.split()))
    n = t[0]; a = t[1:1 + n]
    best = 0
    for m in range(1, 1 << n):  # every subsequence, keep strictly increasing ones
        seq = [a[i] for i in range(n) if m >> i & 1]
        if all(seq[i] < seq[i + 1] for i in range(len(seq) - 1)):
            best = max(best, len(seq))
    return str(best)


def gen():
    n = random.randint(1, 12)
    hi = random.choice([1, 3, 10, 10**9])  # small ranges force duplicates
    a = [random.randint(1, hi) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"


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
