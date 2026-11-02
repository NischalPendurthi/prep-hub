import random, subprocess, sys

ITERS = 400
def gen():
    n = random.randint(1, 14)
    a = [random.randint(-5, 5) if random.random() < 0.5 else random.randint(-10**9, 10**9) for _ in range(n)]
    if random.random() < 0.2: a = [random.randint(1, 2) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"
def brute(s):
    t = list(map(int, s.split())); n = t[0]; a = t[1:1 + n]
    return str(sum(max(a[l:r+1]) - min(a[l:r+1]) for l in range(n) for r in range(l, n)))

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
