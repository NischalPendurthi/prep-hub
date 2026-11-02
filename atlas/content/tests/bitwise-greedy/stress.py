import random, subprocess, sys
from itertools import permutations
from functools import reduce


def brute(inp):  # try every reordering of b
    v = list(map(int, inp.split()))
    t, pos, out = v[0], 1, []
    for _ in range(t):
        n = v[pos]
        a, b = v[pos + 1:pos + 1 + n], v[pos + 1 + n:pos + 1 + 2 * n]
        pos += 1 + 2 * n
        out.append(max(reduce(lambda x, y: x & y, (x ^ y for x, y in zip(a, p))) for p in permutations(b)))
    return "\n".join(map(str, out))


def gen():
    t = random.randint(1, 5)
    s = [str(t)]
    for _ in range(t):
        n = random.randint(1, 6)
        hi = random.choice([1, 7, 2**30 - 1])
        s.append(str(n))
        s.append(" ".join(str(random.randint(0, hi)) for _ in range(n)))
        s.append(" ".join(str(random.randint(0, hi)) for _ in range(n)))
    return "\n".join(s) + "\n"


if __name__ == "__main__":
    for it in range(300):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
