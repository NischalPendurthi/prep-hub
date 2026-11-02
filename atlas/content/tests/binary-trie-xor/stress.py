import random, subprocess, sys
from collections import Counter

ITERS = 400


def brute(inp):
    v = inp.split()
    q = int(v[0])
    ms = Counter([0])
    out = []
    for i in range(q):
        op, x = v[1 + 2 * i], int(v[2 + 2 * i])
        if op == "+":
            ms[x] += 1
        elif op == "-":
            ms[x] -= 1
        else:
            out.append(max(x ^ y for y, c in ms.items() if c > 0))
    return "\n".join(map(str, out))


def gen():
    q = random.randint(1, 20)
    hi = random.choice([7, 10**9])
    ms = Counter([0])
    qs = []
    for _ in range(q):
        r = random.random()
        live = [y for y, c in ms.items() if c > 0 and not (y == 0 and c == 1)]
        if r < 0.25 and live:
            y = random.choice(live)
            ms[y] -= 1
            qs.append(f"- {y}")
        elif r < 0.6:
            y = random.randint(1, hi)
            ms[y] += 1
            qs.append(f"+ {y}")
        else:
            qs.append(f"? {random.randint(1, hi)}")
    return f"{len(qs)}\n" + "\n".join(qs) + "\n"


FIXED = [
    "10\n+ 8\n+ 9\n+ 11\n+ 6\n+ 1\n? 3\n- 8\n? 3\n? 8\n? 11\n",
    "1\n? 1\n",
    "5\n+ 1000000000\n+ 1000000000\n- 1000000000\n? 1000000000\n? 1\n",
    "4\n+ 0\n- 0\n? 5\n? 1073741823\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
