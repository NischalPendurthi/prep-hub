import random, subprocess, sys
from fractions import Fraction


def exact(inp):
    # brute: the optimum is pinned by two friends i (left), j (right) meeting:
    # T = max over pairs with x_i <= x_j of (x_j - x_i) / (v_i + v_j), computed exactly
    v = list(map(int, inp.split()))
    n = v[0]
    x, s = v[1:1 + n], v[1 + n:1 + 2 * n]
    best = Fraction(0)
    for i in range(n):
        for j in range(n):
            if x[i] <= x[j]:
                best = max(best, Fraction(x[j] - x[i], s[i] + s[j]))
    return best


def brute(inp):
    return f"{float(exact(inp)):.9f}"


def gen():
    n = random.randint(1, 6)
    hi = random.choice([5, 1000, 10**9])
    x = [random.randint(1, hi) for _ in range(n)]
    s = [random.randint(1, random.choice([3, 10**9])) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, x))}\n{' '.join(map(str, s))}\n"


if __name__ == "__main__":
    for it in range(500):
        inp = gen()
        exp = exact(inp)
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        # CF checks absolute or relative error 1e-6
        if len(got) != 1 or abs(float(got[0]) - float(exp)) > 1e-6 * max(1.0, float(exp)):
            print("mismatch\n" + inp, "expected", float(exp), "got", got)
            sys.exit(1)
