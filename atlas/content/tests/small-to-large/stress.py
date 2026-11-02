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
    n = random.randint(1, 12)
    lab = list(range(1, n + 1)); random.shuffle(lab)
    e = [(lab[random.randint(0, i - 1)] if random.random() < 0.7 else lab[i - 1], lab[i]) for i in range(1, n)]
    k = random.choice([1, 2, 3, 10**9])
    out = [str(n), " ".join(str(random.randint(1, k) if k < 10 else random.randint(1, 10**9)) for _ in range(n))]
    out += [f"{u} {v}" for u, v in e]
    return "\n".join(out) + "\n"

def brute(inp):
    a = list(map(int, inp.split())); n = a[0]; col = [0] + a[1:n + 1]
    adj = [[] for _ in range(n + 1)]
    for i in range(n - 1):
        u, v = a[n + 1 + 2 * i], a[n + 2 + 2 * i]; adj[u].append(v); adj[v].append(u)
    def sub(u, p):  # colour set of u's subtree, recomputed from scratch
        s = {col[u]}
        for v in adj[u]:
            if v != p: s |= sub(v, u)
        return s
    par = [0] * (n + 1); order = [1]; seen = {1}
    for u in order:
        for v in adj[u]:
            if v not in seen: seen.add(v); par[v] = u; order.append(v)
    return " ".join(str(len(sub(u, par[u]))) for u in range(1, n + 1))
run(gen, brute, 400)
