import random, subprocess, sys

ITERS = 400


def comps(n, edges):
    p = list(range(n + 1))

    def f(x):
        while p[x] != x:
            x = p[x]
        return x
    c = n
    for a, b in edges:
        ra, rb = f(a), f(b)
        if ra != rb:
            p[ra] = rb
            c -= 1
    return c


def gen():
    n = random.randint(1, 7)
    allp = [(a, b) for a in range(1, n + 1) for b in range(a + 1, n + 1)]
    m = random.randint(0, len(allp)) if allp else 0
    edges = random.sample(allp, m)
    k = random.randint(1, m) if m else 0
    if k == 0:  # need at least one removal
        return gen()
    rem = random.sample(edges, k)
    flip = lambda e: (e[1], e[0]) if random.random() < 0.5 else e
    return f"{n} {m} {k}\n" + "".join(f"{a} {b}\n" for a, b in map(flip, edges)) + \
        "".join(f"{a} {b}\n" for a, b in map(flip, rem))


def brute(inp):
    t = list(map(int, inp.split()))
    n, m, k = t[:3]
    e = [tuple(sorted(t[3 + 2 * i:5 + 2 * i])) for i in range(m)]
    r = [tuple(sorted(t[3 + 2 * m + 2 * i:5 + 2 * m + 2 * i])) for i in range(k)]
    cur, out = list(e), []
    for x in r:
        cur.remove(x)
        out.append(comps(n, cur))
    return " ".join(map(str, out))


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = run(exe, inp)
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp, "got", got)
            sys.exit(1)

