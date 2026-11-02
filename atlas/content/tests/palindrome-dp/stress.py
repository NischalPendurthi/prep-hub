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
    al = random.choice(["a", "ab", "abc"])
    s = "".join(random.choice(al) for _ in range(random.randint(1, 15)))
    q = random.randint(1, 10); out = [s, str(q)]
    for _ in range(q):
        l = random.randint(1, len(s)); out.append(f"{l} {random.randint(l, len(s))}")
    return "\n".join(out) + "\n"

def brute(inp):
    a = inp.split(); s = a[0]; q = int(a[1]); res = []
    for k in range(q):
        l, r = int(a[2 + 2 * k]) - 1, int(a[3 + 2 * k])
        res.append(sum(s[i:j] == s[i:j][::-1] for i in range(l, r) for j in range(i + 1, r + 1)))
    return "\n".join(map(str, res))
run(gen, brute, 500)
