import random, subprocess, sys
from functools import lru_cache

exe = sys.argv[1]
for it in range(400):
    n = random.randint(1, 10)
    a = [random.randint(-5, 20) for _ in range(n)]

    @lru_cache(None)
    def first(l, r):  # brute minimax: best total the player to move collects from a[l..r]
        if l > r:
            return 0
        rest = sum(a[l:r + 1])
        return max(a[l] + (rest - a[l]) - first(l + 1, r), a[r] + (rest - a[r]) - first(l, r - 1))

    exp = first(0, n - 1)
    got = subprocess.run([exe], input=f"{n}\n{' '.join(map(str, a))}\n", capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch", a, "expected", exp, "got", got)
        sys.exit(1)
