import random, subprocess, sys

exe = sys.argv[1]
P = 10**9 + 7
for it in range(200):
    q = [(random.choice([0, 1, 2, random.randint(0, 10**9)]), random.randint(0, 30), random.randint(0, 4))
         for _ in range(random.randint(1, 8))]
    inp = f"{len(q)}\n" + "".join(f"{a} {b} {c}\n" for a, b, c in q)
    exp = [str(pow(a, b ** c, P)) for a, b, c in q]   # brute: exact exponent b**c (Python 0**0 == 1)
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != exp:
        print("mismatch", q, "expected", exp, "got", got)
        sys.exit(1)
