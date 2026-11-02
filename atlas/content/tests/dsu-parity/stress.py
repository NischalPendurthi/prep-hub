import random, subprocess, sys

ITERS = 300


def gen():
    t = random.randint(1, 3)
    s = f"{t}\n"
    for _ in range(t):
        n = random.randint(1, 7)
        m = random.randint(0, 8) if n > 1 else 0  # statements need i != j
        s += f"{n} {m}\n"
        for _ in range(m):
            a, b = random.sample(range(1, n + 1), 2)
            s += f"{a} {b} {random.choice(['imposter', 'crewmate'])}\n"
    return s


def brute(inp):
    tok = inp.split()
    t, p, out = int(tok[0]), 1, []
    for _ in range(t):
        n, m = int(tok[p]), int(tok[p + 1])
        p += 2
        st = []
        for _ in range(m):
            st.append((int(tok[p]), int(tok[p + 1]), tok[p + 2]))
            p += 3
        best = -1
        for mask in range(1 << n):
            imp = lambda x: (mask >> (x - 1)) & 1
            # an honest crewmate's claim is true, an imposter's is false
            if all((imp(b) == (c == "imposter")) == (not imp(a)) for a, b, c in st):
                best = max(best, bin(mask).count("1"))
        out.append(best)
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

