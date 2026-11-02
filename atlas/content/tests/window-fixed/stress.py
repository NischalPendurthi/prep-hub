import random, subprocess, sys

ITERS = 400
def gen():
    n = random.randint(1, 14); k = random.randint(1, n)
    return f"{n} {k}\n{' '.join(str(random.choice([random.randint(1, 4), 10**9])) for _ in range(n))}\n"
def brute(s):
    t = list(map(int, s.split())); n, k = t[0], t[1]; a = t[2:2 + n]
    return " ".join(str(len(set(a[i:i+k]))) for i in range(n - k + 1))

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
