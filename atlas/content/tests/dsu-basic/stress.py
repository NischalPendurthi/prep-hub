import random, subprocess, sys

ITERS = 400


def comps(n, edges):
    adj = [[] for _ in range(n + 1)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    seen, sizes = [False] * (n + 1), []
    for s in range(1, n + 1):
        if seen[s]:
            continue
        seen[s], st, c = True, [s], 0
        while st:
            u = st.pop()
            c += 1
            for v in adj[u]:
                if not seen[v]:
                    seen[v] = True
                    st.append(v)
        sizes.append(c)
    return sizes


def gen():
    n = random.randint(1, 7)
    m = random.randint(1, 10)
    return f"{n} {m}\n" + "".join(f"{random.randint(1, n)} {random.randint(1, n)}\n" for _ in range(m))


def brute(inp):
    t = list(map(int, inp.split()))
    n, m = t[0], t[1]
    edges, out = [], []
    for i in range(m):
        edges.append((t[2 + 2 * i], t[3 + 2 * i]))
        s = comps(n, edges)
        out.append(f"{len(s)} {max(s)}")
    return " ".join(out)


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = run(exe, inp)
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp, "got", got)
            sys.exit(1)

