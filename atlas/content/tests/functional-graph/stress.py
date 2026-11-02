import random, subprocess, sys


def walk(t, x, k):  # brute: step one at a time; once a vertex repeats, skip whole cycles
    seen = {}
    while k:
        if x in seen:
            k %= seen[x] - k
            seen = {}
            if not k:
                break
        seen[x] = k
        x = t[x]
        k -= 1
    return x


def solve(inp):
    it = iter(inp.split())
    n, q = int(next(it)), int(next(it))
    t = [0] + [int(next(it)) for _ in range(n)]
    return "\n".join(str(walk(t, int(next(it)), int(next(it)))) for _ in range(q))


def slow(inp):  # even dumber check for small k
    it = iter(inp.split())
    n, q = int(next(it)), int(next(it))
    t = [0] + [int(next(it)) for _ in range(n)]
    out = []
    for _ in range(q):
        x, k = int(next(it)), int(next(it))
        for _ in range(k):
            x = t[x]
        out.append(str(x))
    return "\n".join(out)


def gen(big):
    n = random.randint(1, 8)
    q = random.randint(1, 8)
    t = [random.randint(1, n) for _ in range(n)]
    ks = [random.choice([0, 1, 10**9, random.randint(0, 10**9)]) if big else random.randint(0, 40) for _ in range(q)]
    return f"{n} {q}\n{' '.join(map(str, t))}\n" + "".join(f"{random.randint(1, n)} {k}\n" for k in ks)


if __name__ == "__main__":
    exe = sys.argv[1]
    for i in range(600):
        inp = gen(i % 2)
        exp = solve(inp)
        if i % 2 == 0:
            assert exp == slow(inp)
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp.split():
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
