import random, subprocess, sys


def brute(inp):  # try every T from 1 upwards
    v = list(map(int, inp.split()))
    n, t, k = v[0], v[1], v[2:]
    T = 1
    while sum(T // x for x in k) < t:
        T += 1
    return str(T)


def gen():
    n = random.randint(1, 5)
    t = random.randint(1, 30)
    k = [random.randint(1, 10) for _ in range(n)]
    return f"{n} {t}\n{' '.join(map(str, k))}\n"


if __name__ == "__main__":
    for it in range(500):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
