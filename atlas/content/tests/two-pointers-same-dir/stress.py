import random, subprocess, sys

ITERS = 400
def gen():
    n = random.randint(1, 14); x = random.randint(1, 15)
    return f"{n} {x}\n{' '.join(str(random.randint(1, 5)) for _ in range(n))}\n"
def brute(s):
    t = list(map(int, s.split())); n, x = t[0], t[1]; a = t[2:2 + n]
    return str(sum(sum(a[l:r+1]) == x for l in range(n) for r in range(l, n)))

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
