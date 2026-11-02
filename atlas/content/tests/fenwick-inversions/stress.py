import random, subprocess, sys

ITERS = 400


def brute(inp):  # O(n^3): rotate and count pairs directly
    v = list(map(int, inp.split()))
    n, a = v[0], v[1:]
    out = []
    for k in range(n):
        b = a[k:] + a[:k]
        out.append(sum(b[i] > b[j] for i in range(n) for j in range(i + 1, n)))
    return "\n".join(map(str, out))


def gen():
    n = random.randint(1, 10)
    a = list(range(n))
    random.shuffle(a)
    return f"{n}\n{' '.join(map(str, a))}\n"


FIXED = [
    "4\n0 1 2 3\n",
    "1\n0\n",
    "5\n4 3 2 1 0\n",
    "10\n7 9 0 4 6 1 3 8 2 5\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
