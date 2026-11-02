import random, subprocess, sys

exe = sys.argv[1]
for it in range(500):
    n, m = random.randint(1, 8), random.randint(1, 8)
    p = random.random()
    g = ["".join("." if random.random() < p else "#" for _ in range(m)) for _ in range(n)]
    # brute: DSU over adjacent floor cells
    par = list(range(n * m))
    def find(x):
        while par[x] != x:
            x = par[x]
        return x
    for i in range(n):
        for j in range(m):
            if g[i][j] != ".":
                continue
            for a, b in ((i + 1, j), (i, j + 1)):
                if a < n and b < m and g[a][b] == ".":
                    par[find(i * m + j)] = find(a * m + b)
    exp = len({find(i * m + j) for i in range(n) for j in range(m) if g[i][j] == "."})
    inp = f"{n} {m}\n" + "\n".join(g) + "\n"
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != [str(exp)]:
        print("mismatch\n" + inp + "expected", exp, "got", got)
        sys.exit(1)
