import random, subprocess, sys

# brute force: try every subset of monsters 1..n-1 to kill (monster n is always killed)
exe = sys.argv[1]
for it in range(400):
    n = random.randint(1, 9)
    x = random.randint(1, 30)
    s = [random.randint(1, 30) for _ in range(n)]
    f = [random.randint(1, 30) for _ in range(n)]
    best = None
    for mask in range(1 << (n - 1)):
        cost, fac = 0, x
        for i in range(n):
            if i == n - 1 or mask >> i & 1:
                cost += s[i] * fac
                fac = f[i]
        best = cost if best is None else min(best, cost)
    inp = f"{n} {x}\n{' '.join(map(str, s))}\n{' '.join(map(str, f))}\n"
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != [str(best)]:
        print("mismatch", n, x, s, f, "expected", best, "got", got)
        sys.exit(1)
