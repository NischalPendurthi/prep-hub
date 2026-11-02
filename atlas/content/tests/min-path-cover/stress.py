import random, subprocess, sys


def solve(inp):  # brute: bitmask dp, cover vertices path by path; dp[mask][last] = paths used
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    g = [[False] * (n + 1) for _ in range(n + 1)]
    for _ in range(m):
        g[int(next(it))][int(next(it))] = True
    INF = 99
    dp = [[INF] * (n + 1) for _ in range(1 << n)]
    for v in range(1, n + 1):
        dp[1 << (v - 1)][v] = 1
    for mask in range(1 << n):
        for last in range(1, n + 1):
            c = dp[mask][last]
            if c == INF:
                continue
            for v in range(1, n + 1):
                if mask >> (v - 1) & 1:
                    continue
                nm = mask | 1 << (v - 1)
                nc = c if g[last][v] else c + 1  # extend the current path, or start a new one
                dp[nm][v] = min(dp[nm][v], nc)
    return str(min(dp[(1 << n) - 1][1:]))


def gen():
    n = random.randint(1, 8)
    perm = random.sample(range(1, n + 1), n)  # random topological order
    m = random.randint(0, 14)
    e = []
    for _ in range(m):
        if n < 2:
            break
        i, j = sorted(random.sample(range(n), 2))
        e.append((perm[i], perm[j]))
    return f"{n} {len(e)}\n" + "".join(f"{a} {b}\n" for a, b in e)


if __name__ == "__main__":
    exe = sys.argv[1]
    for _ in range(600):
        inp = gen()
        exp = solve(inp)
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp.split():
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
