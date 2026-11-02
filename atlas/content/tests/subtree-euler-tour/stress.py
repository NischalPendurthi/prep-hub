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
def rand_tree(n):
    # random shape, random labels: node 1 is not always a leaf or the top of a path
    lab = list(range(1, n + 1)); random.shuffle(lab)
    return [(lab[random.randint(0, i - 1)], lab[i]) for i in range(1, n)]

def gen():
    n = random.randint(1, 9); q = random.randint(1, 10)
    out = [f"{n} {q}", " ".join(str(random.randint(0, 10)) for _ in range(n))]
    out += [f"{u} {v}" for u, v in rand_tree(n)]
    for _ in range(q):
        if random.random() < 0.4: out.append(f"1 {random.randint(1, n)} {random.randint(0, 10**9)}")
        else: out.append(f"2 {random.randint(1, n)}")
    return "\n".join(out) + "\n"

def brute(inp):
    it = iter(inp.split()); n, q = int(next(it)), int(next(it))
    val = [0] + [int(next(it)) for _ in range(n)]
    adj = [[] for _ in range(n + 1)]
    for _ in range(n - 1):
        u, v = int(next(it)), int(next(it)); adj[u].append(v); adj[v].append(u)
    par = [0] * (n + 1); order = [1]; seen = {1}
    for u in order:
        for v in adj[u]:
            if v not in seen: seen.add(v); par[v] = u; order.append(v)
    res = []
    for _ in range(q):
        if next(it) == "1":
            s, x = int(next(it)), int(next(it)); val[s] = x
        else:
            s = int(next(it)); tot = 0
            for u in range(1, n + 1):  # u in subtree of s iff s is on u's path to root
                w = u
                while w and w != s: w = par[w]
                if w == s: tot += val[u]
            res.append(tot)
    return "\n".join(map(str, res))
run(gen, brute, 400)
