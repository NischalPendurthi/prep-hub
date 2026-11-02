import random, subprocess, sys

ITERS = 400
MOD = 10**9 + 7


def brute(inp):
    t = list(map(int, inp.split()))
    n, x = t[0], t[1]; c = t[2:2 + n]
    cnt = 0
    def dfs(i, rem):  # choose how many of coin i, then move on: each multiset once
        nonlocal cnt
        if i == n:
            cnt += rem == 0
            return
        k = 0
        while k * c[i] <= rem:
            dfs(i + 1, rem - k * c[i]); k += 1
    dfs(0, x)
    return str(cnt % MOD)


def gen():
    n = random.randint(1, 5); x = random.randint(1, 40)
    c = random.sample(range(1, 15), n)  # CSES coins are distinct
    return f"{n} {x}\n{' '.join(map(str, c))}\n"


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
