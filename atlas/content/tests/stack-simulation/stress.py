import random, subprocess, sys

ITERS = 500


def gen():
    n = random.randint(1, 12)
    return "".join(random.choice("()") for _ in range(n)) + "\n"


def brute(inp):
    s = inp.split()[0]
    n = len(s)
    best, cnt = 0, 1
    for i in range(n):
        bal = 0
        for j in range(i, n):
            bal += 1 if s[j] == "(" else -1
            if bal < 0:
                break
            if bal == 0:
                L = j - i + 1
                if L > best:
                    best, cnt = L, 1
                elif L == best:
                    cnt += 1
    return f"{best} {cnt}"


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

