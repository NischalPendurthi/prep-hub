import random, subprocess, sys

ITERS = 300
def gen():
    n = random.randint(1, 12); q = random.randint(1, 10)
    a = [random.choice([0, random.randint(1, 7), random.randint(1, 10**9)]) for _ in range(n)]
    qs = []
    for _ in range(q):
        l = random.randint(1, n); r = random.randint(l, n); qs.append(f"{l} {r}")
    return f"{n} {q}\n{' '.join(map(str, a))}\n" + "\n".join(qs) + "\n"
def brute(s):
    t = list(map(int, s.split())); n, q = t[0], t[1]; a = t[2:2 + n]; qs = t[2 + n:]; out = []
    for i in range(q):
        x = 0
        for v in a[qs[2*i]-1:qs[2*i+1]]: x ^= v
        out.append(x)
    return "\n".join(map(str, out))

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--brute":
        print(brute(sys.stdin.read()))
        return
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp[:30], "got", got[:30])
            sys.exit(1)

main()
