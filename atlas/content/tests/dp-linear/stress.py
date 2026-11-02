import random, subprocess, sys
from functools import lru_cache

ITERS = 300
MOD = 10**9 + 7


def brute(inp):
    n = int(inp.split()[0])
    if n <= 16:  # literally enumerate every throw sequence
        cnt = 0
        def dfs(rem):
            nonlocal cnt
            if rem == 0:
                cnt += 1
                return
            for d in range(1, 7):
                if d <= rem:
                    dfs(rem - d)
        dfs(n)
        return str(cnt % MOD)
    # larger n: exact big-integer count (no mod until the end) to check the modding
    @lru_cache(None)
    def ways(s):
        return 1 if s == 0 else sum(ways(s - d) for d in range(1, 7) if d <= s)
    sys.setrecursionlimit(10000)
    for s in range(n + 1):
        ways(s)
    return str(ways(n) % MOD)


def gen():
    n = random.randint(1, 16) if random.random() < 0.8 else random.randint(17, 400)
    return f"{n}\n"


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
