import random, subprocess, sys

ITERS = 120


def gen():
    n = random.randint(1, 12)
    hi = random.choice([1, 7, 63, 10**6])
    a = [random.randint(1, hi) for _ in range(n)]
    if random.random() < 0.3:
        a[0] = 1  # duplicates / tiny values
    return f"{n}\n{' '.join(map(str, a))}\n"


def brute(inp):
    t = list(map(int, inp.split()))
    a = t[1:]
    out = []
    for x in a:
        out.append(f"{sum(x | y == x for y in a)} {sum(x & y == x for y in a)} {sum(x & y != 0 for y in a)}")
    return "\n".join(out)


def same(e, g):
    return e.split() == g.split()


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True, timeout=10).stdout


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp)
        got = run(exe, inp)
        if not same(exp, got):
            print("mismatch on input:\n" + inp + "expected:", exp, "got:", got)
            sys.exit(1)

