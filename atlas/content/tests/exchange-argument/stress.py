import random, subprocess, sys
from itertools import permutations

exe = sys.argv[1]
for it in range(300):
    n = random.randint(1, 6)
    a = [(random.randint(1, 8), random.randint(1, 30)) for _ in range(n)]
    best = None
    for p in permutations(a):  # brute: every order
        t = s = 0
        for d, dl in p:
            t += d
            s += dl - t
        best = s if best is None else max(best, s)
    inp = f"{n}\n" + "".join(f"{x} {y}\n" for x, y in a)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != [str(best)]:
        print("mismatch", a, "expected", best, "got", got)
        sys.exit(1)
