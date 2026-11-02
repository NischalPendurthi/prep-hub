import random, subprocess, sys
from collections import deque

ITERS = 300


def brute(inp):
    a, b = inp.split()
    alpha = sorted(set(a + b))
    lim = max(len(a), len(b))
    # BFS over strings, one edit per step (never need a string longer than both inputs)
    dist = {a: 0}; q = deque([a])
    while q:
        s = q.popleft()
        if s == b:
            return str(dist[s])
        nxt = []
        for i in range(len(s)):
            nxt.append(s[:i] + s[i + 1:])
            for ch in alpha:
                nxt.append(s[:i] + ch + s[i + 1:])
        if len(s) < lim:
            for i in range(len(s) + 1):
                for ch in alpha:
                    nxt.append(s[:i] + ch + s[i:])
        for t in nxt:
            if t not in dist:
                dist[t] = dist[s] + 1; q.append(t)


def gen():
    al = random.choice(["A", "AB", "ABC"])
    a = "".join(random.choice(al) for _ in range(random.randint(1, 5)))
    b = "".join(random.choice(al) for _ in range(random.randint(1, 5)))
    return f"{a}\n{b}\n"


def run(exe, inp):
    return subprocess.run([exe], input=inp, capture_output=True, text=True, timeout=10).stdout.split()


if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(ITERS):
        inp = gen()
        exp = brute(inp).split()
        got = run(exe, inp)
        if got != exp:
            print("mismatch on input:\n" + inp + "expected", exp[:30], "got", got[:30])
            sys.exit(1)
