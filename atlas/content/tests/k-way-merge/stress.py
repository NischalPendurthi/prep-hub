import random, subprocess, sys

ITERS = 500


def gen():
    k = random.randint(1, 4)
    s = f"{k}\n"
    for _ in range(k):
        m = random.randint(1, 4)
        s += f"{m} " + " ".join(map(str, sorted(random.randint(-6, 6) for _ in range(m)))) + "\n"
    return s


def brute(inp):
    t = list(map(int, inp.split()))
    k, p, L = t[0], 1, []
    for _ in range(k):
        m = t[p]
        L.append(t[p + 1:p + 1 + m])
        p += m + 1
    vals = sorted(set(x for l in L for x in l))
    best = None
    for a in vals:
        for b in vals:
            if b < a:
                continue
            if all(any(a <= x <= b for x in l) for l in L):
                if best is None or (b - a, a) < (best[1] - best[0], best[0]):
                    best = (a, b)
    return f"{best[0]} {best[1]}"


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = run(exe, inp)
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp, "got", got)
            sys.exit(1)

