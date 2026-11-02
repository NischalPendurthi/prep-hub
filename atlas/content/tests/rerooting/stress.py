import random, subprocess, sys
from collections import deque

ITERS = 300


def gen():
    n = random.randint(1, 30)
    perm = list(range(1, n + 1))
    random.shuffle(perm)
    lines = [str(n)]
    for v in range(2, n + 1):
        # mix of path-like and star-like trees
        p = v - 1 if random.random() < 0.4 else random.randint(1, v - 1)
        lines.append(f"{perm[v - 1]} {perm[p - 1]}")
    return "\n".join(lines) + "\n"


def brute(inp):
    t = list(map(int, inp.split()))
    n = t[0]
    adj = [[] for _ in range(n + 1)]
    for i in range(n - 1):
        u, v = t[1 + 2 * i], t[2 + 2 * i]
        adj[u].append(v)
        adj[v].append(u)
    res = []
    for s in range(1, n + 1):
        d = [-1] * (n + 1)
        d[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if d[v] < 0:
                    d[v] = d[u] + 1
                    q.append(v)
        res.append(max(d[1:]))
    return " ".join(map(str, res))


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

