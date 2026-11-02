# shared footer: `python3 -I stress.py <exe>` stresses; `python3 -I stress.py --brute < x.in` prints brute answer
import random, subprocess, sys
def run(gen, brute, iters):
    if sys.argv[1] == "--brute":
        print(brute(sys.stdin.read())); return
    exe = sys.argv[1]
    for it in range(iters):
        inp = gen()
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch\n" + inp + "expected", exp[:50], "got", got[:50])
            sys.exit(1)
def gen():
    n = random.randint(1, 30)
    al = random.choice(["a", "ab", "abc", "az"])
    if random.random() < 0.5:  # periodic strings have many borders
        w = "".join(random.choice(al) for _ in range(random.randint(1, 4)))
        s = (w * 30)[:n]
    else:
        s = "".join(random.choice(al) for _ in range(n))
    return s + "\n"

def brute(inp):
    s = inp.split()[0]; n = len(s)
    return " ".join(str(k) for k in range(1, n) if s[:k] == s[n - k:])
run(gen, brute, 500)
