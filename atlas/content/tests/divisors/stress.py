import math, random, subprocess, sys

exe = sys.argv[1]
for it in range(60):
    n = random.randint(2, 12)
    hi = random.choice([10, 1000, 10**6])
    a = [random.randint(1, hi) for _ in range(n)]
    exp = max(math.gcd(a[i], a[j]) for i in range(n) for j in range(i + 1, n))
    got = subprocess.run([exe], input=f"{n}\n{' '.join(map(str, a))}\n", capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch", a, "expected", exp, "got", got)
        sys.exit(1)
