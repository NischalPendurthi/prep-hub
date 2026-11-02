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
    lab = list(range(1, n + 1)); random.shuffle(lab)
    e = [(lab[random.randint(0, i - 1)] if random.random() < 0.7 else lab[i - 1], lab[i]) for i in range(1, n)]
    out = [f"{n} {q}"] + [f"{u} {v}" for u, v in e]
    out += [f"{random.randint(1, n)} {random.randint(1, n)}" for _ in range(q)]
    return "\n".join(out) + "\n"

def brute(inp):
    a = list(map(int, inp.split())); n, q = a[0], a[1]
    adj = [[] for _ in range(n + 1)]
    for i in range(n - 1):
        u, v = a[2 + 2 * i], a[3 + 2 * i]; adj[u].append(v); adj[v].append(u)
    res = []; base = 2 + 2 * (n - 1)
    for i in range(q):
        s, t = a[base + 2 * i], a[base + 2 * i + 1]
        d = {s: 0}; qu = [s]
        for u in qu:
            for v in adj[u]:
                if v not in d: d[v] = d[u] + 1; qu.append(v)
        res.append(d[t])
    return "\n".join(map(str, res))
run(gen, brute, 400)
