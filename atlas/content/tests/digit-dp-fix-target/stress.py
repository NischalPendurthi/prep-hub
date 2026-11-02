import random, subprocess, sys

exe = sys.argv[1]
for it in range(60):
    hi = random.choice([30, 1000, 50000])
    a = random.randint(0, hi)
    b = random.randint(a, hi)
    exp = sum(v > 0 and v % sum(map(int, str(v))) == 0 for v in range(a, b + 1))
    got = subprocess.run([exe], input=f"{a} {b}\n", capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch", a, b, "expected", exp, "got", got)
        sys.exit(1)
