import random, subprocess, sys

exe = sys.argv[1]
def nd(x):  # brute divisor count by trial pairs
    return sum((1 if d * d == x else 2) for d in range(1, int(x ** 0.5) + 2) if d * d <= x and x % d == 0)
for it in range(40):
    xs = [random.choice([1, 2, random.randint(1, 100), random.randint(1, 10**6), 10**6]) for _ in range(30)]
    inp = f"{len(xs)}\n" + "".join(f"{x}\n" for x in xs)
    exp = [str(sum(1 for d in range(1, x + 1) if x % d == 0)) if x <= 2000 else str(nd(x)) for x in xs]
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != exp:
        print("mismatch", xs, "expected", exp, "got", got)
        sys.exit(1)
