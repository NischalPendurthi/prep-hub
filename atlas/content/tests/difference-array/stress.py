import random, subprocess, sys

ITERS = 300
def gen():
    n = random.randint(1, 8); k = random.randint(1, n); q = random.randint(1, 8)
    hi = random.choice([10, 30, 200000])
    def seg():
        l = random.randint(1, hi); r = random.randint(l, min(hi, l + random.choice([0, 5, 200000]))); return f"{l} {r}"
    return f"{n} {k} {q}\n" + "\n".join(seg() for _ in range(n)) + "\n" + "\n".join(seg() for _ in range(q)) + "\n"
def brute(s):
    t = list(map(int, s.split())); n, k, q = t[:3]; rec = t[3:3 + 2*n]; qs = t[3 + 2*n:]
    segs = [(rec[2*i], rec[2*i+1]) for i in range(n)]
    pts = sorted({x for l, r in segs for x in (l, r + 1)})
    out = []
    for i in range(q):
        a, b = qs[2*i], qs[2*i+1]
        # count temps in [a,b] covered by >=k recipes, segment by segment between breakpoints
        cuts = sorted(set([a, b + 1] + [p for p in pts if a < p <= b]))
        tot = 0
        for c0, c1 in zip(cuts, cuts[1:]):
            if sum(l <= c0 <= r for l, r in segs) >= k: tot += c1 - c0
        out.append(tot)
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
