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
    n = random.randint(1, 12); m = random.randint(1, 8)
    al = random.choice(["ab", "abc", "az"])
    s = "".join(random.choice(al + "??") for _ in range(n))
    p = "".join(random.choice(al) for _ in range(m))
    return f"{s}\n{p}\n"

def brute(inp):
    s, p = inp.split(); m = len(p); cnt = 0
    for i in range(len(s) - m + 1):
        rest = list(p); ok = True
        for c in s[i:i + m]:  # each real letter must use up a matching letter of p
            if c == "?": continue
            if c in rest: rest.remove(c)
            else: ok = False; break
        cnt += ok
    return str(cnt)
run(gen, brute, 500)
