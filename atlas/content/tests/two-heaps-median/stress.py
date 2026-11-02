import random, subprocess, sys

ITERS = 500


def gen():
    n = random.randint(1, 12)
    a = [random.randint(-4, 4) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"


def brute(inp):
    t = list(map(int, inp.split()))
    n, a = t[0], t[1:]
    return " ".join(str(sorted(a[:i + 1])[i // 2]) for i in range(n))


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

