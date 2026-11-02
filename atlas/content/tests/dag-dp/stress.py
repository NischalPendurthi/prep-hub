import random, subprocess, sys

ITERS = 300


def gen():
    n = random.randint(1, 8)
    order = list(range(1, n + 1))
    random.shuffle(order)
    p = random.random()
    edges = [(order[i], order[j]) for i in range(n) for j in range(i + 1, n) if random.random() < p]
    random.shuffle(edges)
    return f"{n} {len(edges)}\n" + "".join(f"{a} {b}\n" for a, b in edges)


def brute(inp):
    t = list(map(int, inp.split()))
    n, m = t[0], t[1]
    adj = [[] for _ in range(n + 1)]
    for i in range(m):
        adj[t[2 + 2 * i]].append(t[3 + 2 * i])

    def walk(u):  # enumerate every path, no memo
        return (u == n) + sum(walk(v) for v in adj[u])

    return str(walk(1) % (10**9 + 7))


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

