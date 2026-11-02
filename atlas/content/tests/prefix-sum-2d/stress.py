import random, subprocess, sys

ITERS = 300
def gen():
    n = random.randint(1, 7); q = random.randint(1, 10)
    g = ["".join(random.choice(".*") for _ in range(n)) for _ in range(n)]
    qs = []
    for _ in range(q):
        y1 = random.randint(1, n); y2 = random.randint(y1, n); x1 = random.randint(1, n); x2 = random.randint(x1, n)
        qs.append(f"{y1} {x1} {y2} {x2}")
    return f"{n} {q}\n" + "\n".join(g) + "\n" + "\n".join(qs) + "\n"
def brute(s):
    t = s.split(); n, q = int(t[0]), int(t[1]); g = t[2:2 + n]; v = list(map(int, t[2 + n:])); out = []
    for i in range(q):
        y1, x1, y2, x2 = v[4*i:4*i+4]
        out.append(sum(g[y][x] == "*" for y in range(y1-1, y2) for x in range(x1-1, x2)))
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
