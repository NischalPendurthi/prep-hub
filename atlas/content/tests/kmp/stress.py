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
    s = "".join(random.choice(al) for _ in range(random.randint(1, 25)))
    t = "".join(random.choice(al) for _ in range(random.randint(1, 5)))
    return f"{s}\n{t}\n"

def brute(inp):
    s, t = inp.split()
    return str(sum(s[i:i + len(t)] == t for i in range(len(s) - len(t) + 1)))
run(gen, brute, 500)
