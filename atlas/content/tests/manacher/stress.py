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
    al = random.choice(["a", "ab", "abc", "az"])
    return "".join(random.choice(al) for _ in range(random.randint(1, 25))) + "\n"

def brute(inp):
    s = inp.split()[0]; best = s[0]
    for i in range(len(s)):  # i increasing + strict '>' keeps the leftmost longest
        for j in range(i + 1, len(s) + 1):
            w = s[i:j]
            if w == w[::-1] and len(w) > len(best): best = w
    return best
run(gen, brute, 500)
