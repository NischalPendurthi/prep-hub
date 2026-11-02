import random, subprocess, sys

ITERS = 400


def brute(inp):
    v = list(map(int, inp.split()))
    n = v[0]
    x, p = v[1:n + 1], v[n + 1:]
    out = []
    for q in p:
        out.append(x.pop(q - 1))
    return " ".join(map(str, out))


def gen():
    n = random.randint(1, 20)
    x = [random.randint(1, random.choice([3, 10**9])) for _ in range(n)]
    p = [random.randint(1, n - i) for i in range(n)]
    return f"{n}\n{' '.join(map(str, x))}\n{' '.join(map(str, p))}\n"


FIXED = [
    "5\n2 6 1 4 2\n3 1 3 1 1\n",
    "1\n7\n1\n",
    "8\n1 2 3 4 5 6 7 8\n8 7 6 5 4 3 2 1\n",
    "8\n1 2 3 4 5 6 7 8\n1 1 1 1 1 1 1 1\n",
    "7\n5 5 5 1 1 9 9\n4 4 4 4 3 2 1\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
