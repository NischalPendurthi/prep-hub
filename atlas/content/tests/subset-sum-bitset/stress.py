import random, subprocess, sys

ITERS = 400


def brute(inp):
    t = list(map(int, inp.split()))
    n = t[0]; a = t[1:1 + n]
    sums = set()
    for m in range(1, 1 << n):  # every non-empty subset
        sums.add(sum(a[i] for i in range(n) if m >> i & 1))
    sums = sorted(sums)
    return f"{len(sums)}\n" + " ".join(map(str, sums))


def gen():
    n = random.randint(1, 11)
    hi = random.choice([3, 10, 1000])
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
