import random, subprocess, sys

exe = sys.argv[1]
P = 10**9 + 7
N = 3000
f = [1] + [0] * N   # brute: ways to write i as an ordered sum of 1..6
for i in range(1, N + 1):
    f[i] = sum(f[i - j] for j in range(1, 7) if i - j >= 0) % P
for it in range(150):
    n = random.choice([1, 2, 6, 7, random.randint(1, 30), random.randint(1, N)])
    got = subprocess.run([exe], input=f"{n}\n", capture_output=True, text=True).stdout.split()
    if got != [str(f[n])]:
        print("mismatch", n, "expected", f[n], "got", got)
        sys.exit(1)
