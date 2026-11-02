import math, random, subprocess, sys

exe = sys.argv[1]
L = 5 * 10**18
for it in range(400):
    big = random.random() < 0.3
    R = 2 * 10**9 if big else 12
    A, B = 0, 0
    while A == 0 and B == 0:
        A, B = random.randint(-R, R), random.randint(-R, R)
    C = random.randint(-R, R)
    # brute existence: for small coefficients search a box; gcd test otherwise
    if not big and not (A == 0 or B == 0):
        exists = any((-C - A * x) % B == 0 for x in range(-abs(B), abs(B) + 1))
    else:
        exists = C % math.gcd(A, B) == 0
    got = subprocess.run([exe], input=f"{A} {B} {C}\n", capture_output=True, text=True).stdout.split()
    if not exists:
        ok = got == ["-1"]
    else:
        ok = len(got) == 2 and all(abs(int(v)) <= L for v in got) and A * int(got[0]) + B * int(got[1]) + C == 0
    if not ok:
        print("mismatch", A, B, C, "exists", exists, "got", got)
        sys.exit(1)
