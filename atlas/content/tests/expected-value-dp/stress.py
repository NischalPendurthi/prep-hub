import random, subprocess, sys
from fractions import Fraction
from itertools import product

ITERS = 300


def gen():
    n = random.randint(1, 5)
    t = random.randint(1, 11)
    p = random.choice([0, 100, random.randint(0, 100)])
    return f"{n} {p / 100:.2f} {t}\n"


def brute(inp):
    s = inp.split()
    n, p, t = int(s[0]), Fraction(s[1]), int(s[2])
    exp = Fraction(0)
    for seq in product([0, 1], repeat=t):  # 1 = the front person steps on this second
        pr, on = Fraction(1), 0
        for b in seq:
            pr *= p if b else 1 - p
            if b:
                on = min(on + 1, n)
        exp += pr * on
    return f"{float(exp):.9f}"


def same(e, g):
    try:
        return abs(float(e) - float(g.split()[0])) < 1e-6
    except (ValueError, IndexError):
        return False


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True, timeout=10).stdout


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp)
        got = run(exe, inp)
        if not same(exp, got):
            print("mismatch on input:\n" + inp + "expected:", exp, "got:", got)
            sys.exit(1)

