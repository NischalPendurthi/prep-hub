import random, subprocess, sys


def brute(inp):  # each customer scans every unsold ticket for the priciest one <= t
    v = list(map(int, inp.split()))
    n, m = v[0], v[1]
    h, ts = v[2:2 + n], v[2 + n:2 + n + m]
    out = []
    for t in ts:
        ok = [p for p in h if p <= t]
        if ok:
            b = max(ok)
            h.remove(b)
            out.append(b)
        else:
            out.append(-1)
    return "\n".join(map(str, out))


def gen():
    n, m = random.randint(1, 8), random.randint(1, 8)
    hi = random.choice([3, 10, 100])
    h = [random.randint(1, hi) for _ in range(n)]
    t = [random.randint(1, hi) for _ in range(m)]
    return f"{n} {m}\n{' '.join(map(str, h))}\n{' '.join(map(str, t))}\n"


if __name__ == "__main__":
    for it in range(500):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
