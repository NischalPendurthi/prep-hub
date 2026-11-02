import random, subprocess, sys

ITERS = 500


def gen():
    n = random.randint(1, 10)
    k = random.choice([0, 1, 2, random.randint(0, 30)])
    return f"{n} {k}\n"


def brute(inp):
    n, k = map(int, inp.split())
    ch, pos, out = list(range(1, n + 1)), 0, []
    while ch:
        for _ in range(k % len(ch)):  # skip k children one at a time (full laps change nothing)
            pos = (pos + 1) % len(ch)
        out.append(ch.pop(pos))
        if ch:
            pos %= len(ch)
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

