import random, subprocess, sys


def solve(inp):  # brute: transitive closure, u~v iff each reaches the other; label by first appearance
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    r = [[i == j for j in range(n + 1)] for i in range(n + 1)]
    for _ in range(m):
        r[int(next(it))][int(next(it))] = True
    for k in range(1, n + 1):
        for i in range(1, n + 1):
            for j in range(1, n + 1):
                r[i][j] = r[i][j] or (r[i][k] and r[k][j])
    lab = [0] * (n + 1)
    k = 0
    for i in range(1, n + 1):
        if not lab[i]:
            k += 1
            for j in range(i, n + 1):
                if r[i][j] and r[j][i]:
                    lab[j] = k
    return f"{k}\n" + " ".join(map(str, lab[1:]))


def gen():
    n = random.randint(1, 8)
    m = random.randint(0, 14)
    return f"{n} {m}\n" + "".join(f"{random.randint(1, n)} {random.randint(1, n)}\n" for _ in range(m))


if __name__ == "__main__":
    exe = sys.argv[1]
    for _ in range(600):
        inp = gen()
        exp = solve(inp)
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp.split():
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
