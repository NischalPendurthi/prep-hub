import math, random, subprocess, sys

exe = sys.argv[1]
P = 10**9 + 7
def brute(a, b):
    # small a: exact math.comb; big a: product formula over min(b, a-b) terms
    if a <= 500:
        return math.comb(a, b) % P
    k = min(b, a - b)
    num = den = 1
    for i in range(k):
        num = num * (a - i) % P
        den = den * (i + 1) % P
    return num * pow(den, P - 2, P) % P
for it in range(60):
    q = []
    for _ in range(random.randint(1, 40)):
        a = random.choice([random.randint(0, 20), random.randint(0, 500), random.randint(999000, 10**6)])
        if a <= 500:
            b = random.choice([0, a, random.randint(0, a)])
        else:
            b = random.choice([random.randint(0, 2000), a - random.randint(0, 2000)])
        q.append((a, b))
    inp = f"{len(q)}\n" + "".join(f"{a} {b}\n" for a, b in q)
    exp = [str(brute(a, b)) for a, b in q]
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != exp:
        print("mismatch", q, "expected", exp, "got", got)
        sys.exit(1)
