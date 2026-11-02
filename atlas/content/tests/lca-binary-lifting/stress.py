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
    n = random.randint(1, 12); q = random.randint(1, 10)
    # random rooted tree at 1 whose other labels are shuffled, so a boss can have a bigger id
    lab = [1] + random.sample(range(2, n + 1), n - 1)
    boss = [0] * (n + 1)
    for i in range(1, n):
        boss[lab[i]] = lab[random.randint(0, i - 1)] if random.random() < 0.7 else lab[i - 1]
    out = [f"{n} {q}", " ".join(str(boss[i]) for i in range(2, n + 1))]
    out += [f"{random.randint(1, n)} {random.randint(1, n)}" for _ in range(q)]
    return "\n".join(out) + "\n"

def brute(inp):
    a = list(map(int, inp.split())); n, q = a[0], a[1]
    boss = [0, 0] + a[2:n + 1]
    res = []
    for i in range(q):
        x, y = a[n + 1 + 2 * i], a[n + 2 + 2 * i]
        anc = set()
        while x: anc.add(x); x = boss[x]
        while y not in anc: y = boss[y]
        res.append(y)
    return "\n".join(map(str, res))
run(gen, brute, 400)
