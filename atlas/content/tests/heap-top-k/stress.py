import random, subprocess, sys

ITERS = 500


def gen():
    n = random.randint(1, 10)
    k = random.randint(1, 5)
    a = [random.randint(-5, 5) for _ in range(n)]
    return f"{n} {k}\n{' '.join(map(str, a))}\n"


def brute(inp):
    t = list(map(int, inp.split()))
    n, k, a = t[0], t[1], t[2:]
    out = []
    for i in range(n):
        s = sorted(a[:i + 1], reverse=True)
        out.append(s[k - 1] if len(s) >= k else -1)
    return " ".join(map(str, out))


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

