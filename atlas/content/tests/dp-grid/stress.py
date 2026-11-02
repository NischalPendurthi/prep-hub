import random, subprocess, sys

ITERS = 400
MOD = 10**9 + 7


def brute(inp):
    t = inp.split()
    n = int(t[0]); g = t[1:1 + n]
    cnt = 0
    def dfs(i, j):  # walk every right/down path explicitly
        nonlocal cnt
        if i >= n or j >= n or g[i][j] == '*':
            return
        if i == n - 1 and j == n - 1:
            cnt += 1
            return
        dfs(i + 1, j); dfs(i, j + 1)
    dfs(0, 0)
    return str(cnt % MOD)


def gen():
    n = random.randint(1, 7)
    p = random.choice([0.0, 0.1, 0.25, 0.4])
    g = ["".join('*' if random.random() < p else '.' for _ in range(n)) for _ in range(n)]
    return f"{n}\n" + "\n".join(g) + "\n"


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
