import random, subprocess, sys


def brute(inp):
    # mark covered points on a doubled grid (2x so [1,2] and [3,4] stay separate),
    # then read off maximal runs
    v = list(map(int, inp.split()))
    n = v[0]
    cov = [False] * 50
    for i in range(n):
        l, r = v[1 + 2 * i], v[2 + 2 * i]
        for x in range(2 * l, 2 * r + 1):
            cov[x] = True
    res, x = [], 0
    while x < 50:
        if cov[x]:
            y = x
            while y + 1 < 50 and cov[y + 1]:
                y += 1
            res.append((x // 2, y // 2))
            x = y + 1
        else:
            x += 1
    return "\n".join([str(len(res))] + [f"{l} {r}" for l, r in res])


def gen():
    n = random.randint(1, 8)
    seg = []
    for _ in range(n):
        l = random.randint(0, 15)
        seg.append(f"{l} {random.randint(l, min(20, l + random.choice([0, 2, 6])))}")
    return f"{n}\n" + "\n".join(seg) + "\n"


if __name__ == "__main__":
    for it in range(500):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
