import random, subprocess, sys
from functools import lru_cache

ITERS = 400
MOD = 10**9 + 7


def brute(inp):  # recursion over prefixes with a plain set of words
    v = inp.split()
    s, k = v[0], int(v[1])
    words = set(v[2:2 + k])

    @lru_cache(None)
    def ways(i):
        if i == len(s):
            return 1
        return sum(ways(j) for j in range(i + 1, len(s) + 1) if s[i:j] in words) % MOD

    return str(ways(0))


def gen():
    alpha = "ab" if random.random() < 0.7 else "abc"
    n = random.randint(1, 15)
    s = "".join(random.choice(alpha) for _ in range(n))
    k = random.randint(1, 6)
    words = ["".join(random.choice(alpha) for _ in range(random.randint(1, 4))) for _ in range(k)]
    return f"{s}\n{k}\n" + "\n".join(words) + "\n"


FIXED = [
    "ababc\n4\nab\nabab\nc\ncb\n",
    "a\n1\nb\n",
    "a\n2\na\naa\n",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n2\na\naa\n",
]

if __name__ == "__main__":
    exe = sys.argv[1]
    for inp in FIXED + [gen() for _ in range(ITERS)]:
        exp = brute(inp).split()
        got = subprocess.run([exe], input=inp, capture_output=True, text=True).stdout.split()
        if got != exp:
            print("mismatch on input:\n" + inp[:500] + "\nexpected", exp[:20], "got", got[:20])
            sys.exit(1)
