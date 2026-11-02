import random, subprocess, sys

ITERS = 300


def gen():
    n = random.randint(1, 10)
    lines = [str(n)]
    for v in range(2, n + 1):
        lines.append(f"{random.randint(1, v - 1)} {v}" if random.random() < 0.5 else f"{v} {random.randint(1, v - 1)}")
    # relabel so node 1 is not always the root
    perm = list(range(1, n + 1))
    random.shuffle(perm)
    out = [lines[0]] + [" ".join(str(perm[int(z) - 1]) for z in l.split()) for l in lines[1:]]
    return "\n".join(out) + "\n"


def brute(inp):
    t = list(map(int, inp.split()))
    n = t[0]
    e = [(t[1 + 2 * i], t[2 + 2 * i]) for i in range(n - 1)]
    best = 0
    for mask in range(1 << len(e)):
        used, ok, cnt = set(), True, 0
        for i in range(len(e)):
            if mask >> i & 1:
                u, v = e[i]
                if u in used or v in used:
                    ok = False
                    break
                used |= {u, v}
                cnt += 1
        if ok:
            best = max(best, cnt)
    return str(best)


def same(e, g):
    return e.split() == g.split()


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

