import random, subprocess, sys

exe = sys.argv[1]
for it in range(300):
    hi = random.choice([30, 1000, 50000])
    a = random.choice([0, random.randint(0, hi)])  # ranges starting at 0 hit the "0" edge case
    b = random.randint(a, hi)
    d = random.randint(0, 9)  # d = 0 checks that leading zeros are not counted
    exp = sum(str(v).count(str(d)) for v in range(a, b + 1))
    got = subprocess.run([exe], input=f"{a} {b} {d}\n", capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch", a, b, d, "expected", exp, "got", got)
        sys.exit(1)
