import random, subprocess, sys
from collections import Counter


def all_paths(n, e):  # brute: every way to walk all edges exactly once from 1, ending at n
    used = [False] * len(e)
    res = set()

    def go(u, path):
        if len(path) == len(e) + 1:
            if u == n:
                res.add(tuple(path))
            return
        for i, (a, b) in enumerate(e):
            if not used[i] and a == u:
                used[i] = True
                go(b, path + [b])
                used[i] = False
    go(1, [1])
    return res


def parse(inp):
    it = iter(inp.split())
    n, m = int(next(it)), int(next(it))
    return n, [(int(next(it)), int(next(it))) for _ in range(m)]


def solve(inp):  # only defined when the answer is unique (used to make the .out files)
    ps = all_paths(*parse(inp))
    assert len(ps) <= 1, "answer not unique"
    return "IMPOSSIBLE" if not ps else " ".join(map(str, next(iter(ps))))


def gen():
    n = random.randint(1, 5)
    m = random.randint(0, 7)
    return f"{n} {m}\n" + "".join(f"{random.randint(1, n)} {random.randint(1, n)}\n" for _ in range(m))


if __name__ == "__main__":
    exe = sys.argv[1]
    found = 0
    for _ in range(3000):
        if random.random() < .7:  # bias towards solvable cases: a random walk from 1 to n
            n = random.randint(1, 5)
            path = [1] + [random.randint(1, n) for _ in range(random.randint(0, 6))] + [n]
            e = list(zip(path, path[1:]))
            random.shuffle(e)
            inp = f"{n} {len(e)}\n" + "".join(f"{a} {b}\n" for a, b in e)
        else:
            inp = gen()
        n, e = parse(inp)
        ps = all_paths(n, e)
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if not ps:
            ok = got == ["IMPOSSIBLE"]
        else:
            found += 1
            p = list(map(int, got)) if got and got[0] != "IMPOSSIBLE" else []
            ok = len(p) == len(e) + 1 and p[0] == 1 and p[-1] == n and Counter(zip(p, p[1:])) == Counter(e)
        if not ok:
            print("wrong\n" + inp, "got", got, "valid answers e.g.", next(iter(ps)) if ps else "IMPOSSIBLE")
            sys.exit(1)
    assert found > 500
