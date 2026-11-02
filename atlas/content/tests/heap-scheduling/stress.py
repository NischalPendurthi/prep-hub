import random, subprocess, sys

ITERS = 500


def gen():
    n = random.randint(1, 8)
    rows = [(random.randint(1, 10), random.randint(1, 4)) for _ in range(n)]
    return f"{n}\n" + "".join(f"{e} {p}\n" for e, p in rows)


def brute(inp):
    t = list(map(int, inp.split()))
    n = t[0]
    en, pr = t[1::2], t[2::2]
    done, time, order = [False] * n, 0, []
    while len(order) < n:
        avail = [i for i in range(n) if not done[i] and en[i] <= time]
        if not avail:
            time = min(en[i] for i in range(n) if not done[i])
            continue
        i = min(avail, key=lambda i: (pr[i], i))
        done[i] = True
        time += pr[i]
        order.append(i)
    return " ".join(map(str, order))


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

