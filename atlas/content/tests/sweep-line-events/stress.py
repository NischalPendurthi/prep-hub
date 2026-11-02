import random, subprocess, sys


def brute(inp):  # count customers present at every half-integer moment
    v = list(map(int, inp.split()))
    n = v[0]
    seg = [(v[1 + 2 * i], v[2 + 2 * i]) for i in range(n)]
    best = 0
    for t2 in range(0, 2 * 50):
        t = t2 / 2
        best = max(best, sum(a <= t < b for a, b in seg))
    return str(best)


def gen():
    n = random.randint(1, 10)
    times = random.sample(range(1, 45), 2 * n)  # CSES: all times are distinct
    seg = []
    for i in range(n):
        a, b = sorted(times[2 * i:2 * i + 2])
        seg.append(f"{a} {b}")
    return f"{n}\n" + "\n".join(seg) + "\n"


if __name__ == "__main__":
    for it in range(500):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
