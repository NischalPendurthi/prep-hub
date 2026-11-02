import random, subprocess, sys

exe = sys.argv[1]
PR = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79]
for it in range(200):
    n = random.choice([1, random.randint(1, 50), random.randint(1, 5000)])
    k = random.randint(1, 8)
    ps = random.sample(PR, k)
    exp = sum(1 for x in range(1, n + 1) if any(x % p == 0 for p in ps))
    got = subprocess.run([exe], input=f"{n} {k}\n{' '.join(map(str, ps))}\n", capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch", n, ps, "expected", exp, "got", got)
        sys.exit(1)
