import random, subprocess, sys

from functools import lru_cache
ITERS = 400
def gen():
    n = random.randint(1, 10); x = random.randint(1, 12)
    return f"{n} {x}\n{' '.join(str(random.randint(1, x)) for _ in range(n))}\n"
def brute(s):
    t = list(map(int, s.split())); n, x = t[0], t[1]; p = t[2:2 + n]
    @lru_cache(None)
    def f(mask):  # min gondolas for the children in mask, by exhaustive pairing
        if mask == 0: return 0
        i = (mask & -mask).bit_length() - 1; rest = mask & ~(1 << i)
        best = 1 + f(rest)
        for j in range(n):
            if rest >> j & 1 and p[i] + p[j] <= x: best = min(best, 1 + f(rest & ~(1 << j)))
        return best
    return str(f((1 << n) - 1))

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--brute":
        print(brute(sys.stdin.read()))
        return
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp[:30], "got", got[:30])
            sys.exit(1)

main()
