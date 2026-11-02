import heapq, random, subprocess, sys

# brute force: Dijkstra over the tuple of remaining heights, simulating every single cut
def brute(a, b):
    n = len(a)
    start = tuple(a)
    dist = {start: 0}
    pq = [(0, start)]
    while pq:
        d, s = heapq.heappop(pq)
        if d > dist[s]:
            continue
        if not any(s):
            return d
        zeros = [i for i in range(n) if s[i] == 0]
        if zeros:
            c = b[max(zeros)]          # the charge used for this cut was bought at this price
        elif s == start:
            c = 0                      # the saw starts charged
        else:
            continue                   # cannot recharge before any tree is fully cut
        for i in range(n):
            if s[i]:
                t = s[:i] + (s[i] - 1,) + s[i + 1:]
                if d + c < dist.get(t, 1 << 62):
                    dist[t] = d + c
                    heapq.heappush(pq, (d + c, t))

if __name__ == "__main__":
    exe = sys.argv[1]
    for it in range(400):
        n = random.randint(1, 5)
        a = [1] + sorted(random.sample(range(2, 7), n - 1))
        b = sorted(random.sample(range(1, 15), n - 1), reverse=True) + [0]
        exp = brute(a, b)
        inp = f"{n}\n{' '.join(map(str, a))}\n{' '.join(map(str, b))}\n"
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != [str(exp)]:
            print("mismatch", a, b, "expected", exp, "got", got)
            sys.exit(1)
