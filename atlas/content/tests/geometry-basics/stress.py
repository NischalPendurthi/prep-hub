import random, subprocess, sys
from fractions import Fraction

exe = sys.argv[1]
def side(x1, y1, x2, y2, x3, y3):
    # brute without cross product: compare p3 with the line's point at the same x (or y for vertical)
    if x1 == x2:
        if x3 == x1: return "TOUCH"
        return "LEFT" if (x3 < x1) == (y2 > y1) else "RIGHT"
    yl = y1 + Fraction(y2 - y1, x2 - x1) * (x3 - x1)
    if y3 == yl: return "TOUCH"
    return "LEFT" if (y3 > yl) == (x2 > x1) else "RIGHT"
for it in range(100):
    R = random.choice([3, 10**9])
    ts = []
    for _ in range(20):
        while True:
            t = [random.randint(-R, R) for _ in range(6)]
            if (t[0], t[1]) != (t[2], t[3]): break
        if random.random() < 0.2:  # force collinear: p3 = p1 + k (p2 - p1)
            k = random.randint(-2, 2) if R == 3 else 0
            t[4], t[5] = t[0] + k * (t[2] - t[0]), t[1] + k * (t[3] - t[1])
        ts.append(t)
    inp = f"{len(ts)}\n" + "".join(" ".join(map(str, t)) + "\n" for t in ts)
    exp = [side(*t) for t in ts]
    got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
    if got != exp:
        print("mismatch", ts, "expected", exp, "got", got)
        sys.exit(1)
