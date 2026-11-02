import random, subprocess, sys


def brute(inp):  # plain array, count by scanning
    tok = inp.split()
    n, q = int(tok[0]), int(tok[1])
    p = list(map(int, tok[2:2 + n]))
    pos, out = 2 + n, []
    for _ in range(q):
        c, a, b = tok[pos], int(tok[pos + 1]), int(tok[pos + 2])
        pos += 3
        if c == "!":
            p[a - 1] = b
        else:
            out.append(sum(a <= s <= b for s in p))
    return "\n".join(map(str, out))


def gen():
    n, q = random.randint(1, 6), random.randint(1, 8)
    hi = random.choice([5, 20, 10**9])
    p = [random.randint(1, hi) for _ in range(n)]
    qs = []
    for _ in range(q):
        if random.random() < 0.4:
            qs.append(f"! {random.randint(1, n)} {random.randint(1, hi)}")
        else:
            a = random.randint(1, hi)
            qs.append(f"? {a} {random.randint(a, hi)}")
    return f"{n} {q}\n{' '.join(map(str, p))}\n" + "\n".join(qs) + "\n"


if __name__ == "__main__":
    for it in range(500):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([sys.argv[1]], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp, "expected", exp, "got", got)
            sys.exit(1)
