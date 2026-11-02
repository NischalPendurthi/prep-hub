import random, subprocess, sys

exe = sys.argv[1]
for it in range(300):
    n = random.randint(1, 10)
    a = []
    for _ in range(n):
        x = random.randint(1, 15)
        a.append((x, x + random.randint(1, 6)))
    best = 0
    for m in range(1 << n):  # brute: every subset, check pairwise disjoint (half-open)
        s = sorted(a[i] for i in range(n) if m >> i & 1)
        if all(s[i][1] <= s[i + 1][0] for i in range(len(s) - 1)):
            best = max(best, len(s))
    inp = f"{n}\n" + "".join(f"{x} {y}\n" for x, y in a)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != [str(best)]:
        print("mismatch", a, "expected", best, "got", got)
        sys.exit(1)
