import random, subprocess, sys

ITERS = 400
def gen():
    n = random.randint(1, 14); k = random.randint(1, 5)
    return f"{n} {k}\n{' '.join(str(random.randint(1, random.choice([2, 4, 8]))) for _ in range(n))}\n"
def brute(s):
    t = list(map(int, s.split())); n, k = t[0], t[1]; a = t[2:2 + n]
    return str(sum(len(set(a[l:r+1])) == k for l in range(n) for r in range(l, n)))

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
