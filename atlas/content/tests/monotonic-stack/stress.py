import random, subprocess, sys

exe = sys.argv[1]
for it in range(500):
    n = random.randint(1, 9)
    a = [random.randint(1, 5) for _ in range(n)]
    exp = sum(min(a[i:j + 1]) for i in range(n) for j in range(i, n)) % (10**9 + 7)
    got = subprocess.run([exe], input=f"{n}\n{' '.join(map(str, a))}\n", capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch", a, "expected", exp, "got", got)
        sys.exit(1)
