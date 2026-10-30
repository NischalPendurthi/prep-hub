---
title: Cache coherence and memory ordering
part: Part C · Multicore
lede: Each core has private caches and a private store buffer, yet threads must agree on shared data. This chapter covers how MESI keeps one location consistent, why false sharing is slow, what sequential consistency would promise, what x86 and ARM actually do, and how C++ atomics give you guarantees that hold on both. Keep one distinction in mind throughout: what the C++ standard guarantees and what your hardware happens to do are two separate questions.
desc: MESI, false sharing, sequential consistency, x86 TSO, ARM weak ordering, store buffers, barriers, C++ atomics, lock-free basics
hours: 4
prereqs: threads and mutexes, Chapter 2 (lines and write-back caches)
---

## Coherence and consistency {#ch03-problem .th}

Two different problems get mixed up here:

- **Coherence** concerns one memory location. Every core agrees on a single order of the writes to that location, and a write eventually reaches everyone. Hardware provides this for ordinary memory, so you never have to flush caches to share data between threads on x86 or ARM servers.
- **Consistency** (memory ordering) concerns several locations. If I write `data` and then `flag`, in what order can another core observe them? Coherence says nothing about this.

Coherent caches can still show you surprising orders, because many reorderings happen in the core, before a write ever reaches the cache.

## MESI {#ch03-mesi .th}

MESI gives each cache line one of four states in each cache. The rule it enforces is **single writer or multiple readers**: at any moment a line is either writable in one cache or readable in possibly many.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 310" role="img" aria-label="MESI state diagram with four states. Local reads and writes are drawn in one colour and snooped requests from other cores in another.">
  <rect x="80" y="30" width="130" height="50" rx="8" class="d-trap"/><text x="145" y="52" text-anchor="middle" class="t-mono t-bold">M</text><text x="145" y="70" text-anchor="middle" class="t-small">dirty, only copy</text>
  <rect x="550" y="30" width="130" height="50" rx="8" class="d-key"/><text x="615" y="52" text-anchor="middle" class="t-mono t-bold">E</text><text x="615" y="70" text-anchor="middle" class="t-small">clean, only copy</text>
  <rect x="80" y="230" width="130" height="50" rx="8" class="d-soft"/><text x="145" y="252" text-anchor="middle" class="t-mono t-bold">I</text><text x="145" y="270" text-anchor="middle" class="t-small">no usable data</text>
  <rect x="550" y="230" width="130" height="50" rx="8" class="d-acc"/><text x="615" y="252" text-anchor="middle" class="t-mono t-bold">S</text><text x="615" y="270" text-anchor="middle" class="t-small">clean, maybe shared</text>
  <path d="M550 55 L 210 55" class="d-line-acc"/><polygon points="210,55 218.0,51.0 218.0,59.0" class="d-fill-acc"/><text x="380" y="48" text-anchor="middle" class="t-small t-acc">local write, silent</text>
  <path d="M150 230 L 150 80" class="d-line-acc"/><polygon points="150,80 154.0,88.0 146.0,88.0" class="d-fill-acc"/><text x="158" y="150" class="t-small t-acc">local write:</text><text x="158" y="164" class="t-small t-acc">read-exclusive</text>
  <path d="M110 80 L 110 230" class="d-line-trap"/><polygon points="110,230 106.0,222.0 114.0,222.0" class="d-fill-trap"/><text x="102" y="150" text-anchor="end" class="t-small t-trap">snoop write:</text><text x="102" y="164" text-anchor="end" class="t-small t-trap">write back</text>
  <path d="M610 80 L 610 230" class="d-line-trap"/><polygon points="610,230 606.0,222.0 614.0,222.0" class="d-fill-trap"/><text x="618" y="158" class="t-small t-trap">snoop read</text>
  <path d="M210 245 L 550 245" class="d-line-acc"/><polygon points="550,245 542.0,249.0 542.0,241.0" class="d-fill-acc"/><text x="380" y="240" text-anchor="middle" class="t-small t-acc">local read, another copy exists</text>
  <path d="M550 268 L 210 268" class="d-line-trap"/><polygon points="210,268 218.0,264.0 218.0,272.0" class="d-fill-trap"/><text x="380" y="284" text-anchor="middle" class="t-small t-trap">snoop write</text>
  <path d="M210 72 L 550 222" class="d-line-trap"/><polygon points="550,222 541.1,222.4 544.3,215.1" class="d-fill-trap"/><path d="M550 234 L 210 84" class="d-line-acc"/><polygon points="210,84 218.9,83.6 215.7,90.9" class="d-fill-acc"/>
  <path d="M210 222 L 550 72" class="d-line-acc"/><polygon points="550,72 544.3,78.9 541.1,71.6" class="d-fill-acc"/><path d="M550 84 L 210 234" class="d-line-trap"/><polygon points="210,234 215.7,227.1 218.9,234.4" class="d-fill-trap"/>
  <text x="380" y="104" text-anchor="middle" class="t-small t-trap">M to S: snoop read, write back</text><text x="380" y="120" text-anchor="middle" class="t-small t-trap">E to I: snoop write</text>
  <text x="380" y="198" text-anchor="middle" class="t-small t-acc">S to M: local write, upgrade</text><text x="380" y="214" text-anchor="middle" class="t-small t-acc">I to E: local read, no other copy</text>
  <text x="20" y="304" class="t-small">Local means this core did it. Snoop means this cache saw another core's request on the interconnect.</text>
</svg></div><figcaption><b>MESI for one line in one cache.</b> Reads that hit in M, E or S and writes that hit in M stay where they are, with no traffic. Real protocols add states and transient steps, so treat this as the model.</figcaption></figure>

| State | Meaning | On a local read | On a local write |
|---|---|---|---|
| Modified | Dirty, only copy, memory is stale | Hit | Hit |
| Exclusive | Clean, only copy | Hit | Hit, moves to M with no traffic |
| Shared | Clean, others may have it | Hit | Must invalidate others first (upgrade) |
| Invalid | No usable data | Miss: E if alone, S if others have it | Miss: read-exclusive, then M |

The **E state** is the clever part: a thread that reads and then writes private data pays for no bus message on the write. Small machines broadcast these messages and **snoop**. Larger ones use a **directory** that tracks who holds each line. Variants such as MOESI add a state so that a dirty line can be shared without writing it to memory first.

This simulator follows one line through a two-core trace:

```python run=ca-c03-mesi
def step(st, core, op):
    other = 1 - core
    me = st[core]
    if op == "R":
        if me != "I": return "hit"
        if st[other] == "I":
            st[core] = "E"; return "read miss, memory supplies"
        msg = "read miss, owner writes back and supplies" if st[other] == "M" else "read miss, peer supplies"
        st[core] = st[other] = "S"
        return msg
    if me == "M": return "hit"
    if me == "E":
        st[core] = "M"; return "silent upgrade"
    msg = "upgrade: invalidate peer" if me == "S" else "read-exclusive" + (", owner writes back" if st[other] == "M" else "")
    st[core], st[other] = "M", "I"
    return msg

st = ["I", "I"]
for core, op in [(0, "R"), (0, "W"), (1, "R"), (1, "W"), (0, "W"), (0, "R"), (1, "R")]:
    msg = step(st, core, op)
    print(f"C{core} {op}: C0={st[0]} C1={st[1]}  {msg}")
```

## False sharing {#ch03-false-sharing .th}

Coherence works per line, with no idea of which bytes each thread cares about. If two threads write different variables in one line, each write needs ownership of the line, so the line bounces between the cores. That is **false sharing**. The result is correct and slow. This program gives each thread its own counter, once in one line and once in separate lines. The C++ guide's [chapter 19](../../guide/#ch19) covers padding and `hardware_destructive_interference_size`.

```cpp run=ca-c03-false-sharing nondet
#include <algorithm>
#include <atomic>
#include <chrono>
#include <cstdio>
#include <thread>
struct alignas(64) Same  { std::atomic<long> a{0}, b{0}; };
struct alignas(64) Apart { std::atomic<long> a{0}; alignas(64) std::atomic<long> b{0}; };

template <class S> static double run(bool& ok) {
    const long n = 5'000'000;
    double best = 1e9;
    for (int r = 0; r < 3; r++) {
        S s;
        auto t0 = std::chrono::steady_clock::now();
        std::thread t1([&] { for (long i = 0; i < n; i++) s.a.fetch_add(1, std::memory_order_relaxed); });
        std::thread t2([&] { for (long i = 0; i < n; i++) s.b.fetch_add(1, std::memory_order_relaxed); });
        t1.join(); t2.join();
        best = std::min(best, std::chrono::duration<double>(std::chrono::steady_clock::now() - t0).count());
        ok = ok && s.a == n && s.b == n;
    }
    return best;
}
int main() {
    bool ok = true;
    double same = run<Same>(ok), apart = run<Apart>(ok);
    printf("sizeof: %zu and %zu; totals correct: %s\n", sizeof(Same), sizeof(Apart), ok ? "yes" : "no");
    printf("one line took %.1fx as long as separate lines\n", same / apart);
}
```

Usually the shared-line version is several times slower. The size of the effect depends on the core count and topology, and it can be small when the two threads share a physical core or there is only one core available. Totals are correct either way, which is why false sharing is found with profilers, never with tests.

## Sequential consistency and the store buffer {#ch03-sc .th}

**Sequential consistency** (SC) is the model most people assume: all operations of all threads fit into one global order, and each thread's operations appear in program order. Consider this test, called **store buffering** (SB), with `x` and `y` starting at 0:

| Thread 1 | Thread 2 |
|---|---|
| `x = 1;` | `y = 1;` |
| `r1 = y;` | `r2 = x;` |

Under SC, `r1 == 0 && r2 == 0` is impossible, because whichever store comes first in the global order is seen by the other thread's load. Real processors allow it. A store goes first into the core's **store buffer**, so the core need not wait to gain ownership of the line. A later load can run while that store is still buffered.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 230" role="img" aria-label="Two cores, each with a private store buffer in front of shared memory. Each core's store waits in its buffer while its load reads the old value from memory.">
  <rect x="40" y="16" width="260" height="52" rx="8" class="d-box"/><text x="170" y="38" text-anchor="middle" class="t-mono">Core 0</text><text x="170" y="56" text-anchor="middle" class="t-mono">x = 1;  r1 = y;</text>
  <rect x="420" y="16" width="260" height="52" rx="8" class="d-box"/><text x="550" y="38" text-anchor="middle" class="t-mono">Core 1</text><text x="550" y="56" text-anchor="middle" class="t-mono">y = 1;  r2 = x;</text>
  <rect x="40" y="96" width="120" height="40" class="d-trap"/><text x="100" y="114" text-anchor="middle" class="t-small">store buffer</text><text x="100" y="128" text-anchor="middle" class="t-mono">x = 1</text>
  <rect x="420" y="96" width="120" height="40" class="d-trap"/><text x="480" y="114" text-anchor="middle" class="t-small">store buffer</text><text x="480" y="128" text-anchor="middle" class="t-mono">y = 1</text>
  <rect x="40" y="170" width="640" height="44" rx="8" class="d-soft"/><text x="360" y="197" text-anchor="middle" class="t-mono">caches and memory: x = 0, y = 0</text>
  <path d="M100 68 L 100 96" class="d-line-trap"/><path d="M480 68 L 480 96" class="d-line-trap"/>
  <path d="M100 136 L 100 170" class="d-line-trap d-dash"/><path d="M480 136 L 480 170" class="d-line-trap d-dash"/>
  <path d="M240 170 L 240 68" class="d-line-acc"/><polygon points="240,68 236,76 244,76" class="d-fill-acc"/><text x="248" y="124" class="t-small t-acc">r1 reads y = 0</text>
  <path d="M640 170 L 640 68" class="d-line-acc"/><polygon points="640,68 636,76 644,76" class="d-fill-acc"/><text x="632" y="124" text-anchor="end" class="t-small t-acc">r2 reads x = 0</text>
</svg></div><figcaption><b>Why both loads can see 0.</b> Each store waits in its core's private buffer (dashed: not yet drained) while the load behind it reads the cache. Neither core has broken coherence, and a core always sees its own buffered store.</figcaption></figure>

## x86 TSO and ARM weak ordering {#ch03-tso .th}

| Can the hardware reorder (different addresses, plain instructions)? | x86-64 (TSO) | ARMv8 |
|---|---|---|
| Load then later load | No | Yes |
| Load then later store | No | Yes |
| Store then later store | No | Yes |
| Store then later load | **Yes** (the store buffer) | Yes |

**TSO** (total store order) is SC plus a FIFO store buffer. This table describes ordinary instructions on ordinary write-back memory. Special cases such as non-temporal stores are weaker. **ARMv8** allows all four unless a barrier, an acquire/release instruction, or certain dependencies forbid it. Code that "works" on x86 can therefore fail on ARM without any change to the source.

The hardware table is only half of the story, since the **compiler** also reorders, removes and merges memory operations, and it follows the C++ rules on every target. The program below runs two litmus tests in lockstep. A result of zero for relaxed message passing on x86 is what the table predicts, and it proves nothing about the code's correctness, because the C++ standard still allows the bad outcome:

```cpp run=ca-c03-litmus nondet timeout=30
#include <atomic>
#include <chrono>
#include <cstdio>
#include <thread>
using namespace std::chrono_literals;
using Clock = std::chrono::steady_clock;
constexpr auto RLX = std::memory_order_relaxed;
constexpr auto SC = std::memory_order_seq_cst;
std::atomic<int> x, y, go, done_count;
std::atomic<bool> stop;
int r1, r2;

template <class F> static void worker(F body) {
    int t = 0;
    for (;;) {
        while (go.load(std::memory_order_acquire) == t)
            if (stop.load(RLX)) return;
        t++;
        body();
        done_count.fetch_add(1, std::memory_order_release);
    }
}
template <class A, class B, class Bad> static void trial(const char* name, A a, B b, Bad bad) {
    stop = false; go = 0;
    std::thread ta(worker<A>, a), tb(worker<B>, b);
    long seen = 0, total = 0;
    auto end = Clock::now() + 400ms;
    while (Clock::now() < end) {
        x = 0; y = 0; done_count = 0;
        go.fetch_add(1, std::memory_order_release);
        while (done_count.load(std::memory_order_acquire) < 2) {}
        seen += bad();
        total++;
    }
    stop = true;
    ta.join(); tb.join();
    printf("%-32s %ld of %ld trials\n", name, seen, total);
}
int main() {
    auto both_zero = [] { return r1 == 0 && r2 == 0; };
    trial("SB relaxed, both zero:", [] { x.store(1, RLX); r1 = y.load(RLX); },
                                    [] { y.store(1, RLX); r2 = x.load(RLX); }, both_zero);
    trial("SB seq_cst, both zero:", [] { x.store(1, SC); r1 = y.load(SC); },
                                    [] { y.store(1, SC); r2 = x.load(SC); }, both_zero);
    trial("MP relaxed, flag set, no data:", [] { x.store(1, RLX); y.store(1, RLX); },
                                    [] { r1 = y.load(RLX); r2 = x.load(RLX); },
                                    [] { return r1 == 1 && r2 == 0; });
}
```

On most multicore machines the relaxed SB line shows a nonzero count, though how many is highly variable. Whether it appears at all depends on the machine, so a zero there would prove nothing. The seq_cst line is different: the C++ standard forbids that outcome, so the count must be 0 on every conforming implementation.

:::trap
"I ran it a billion times and it never failed" is no evidence of safety. A data race is undefined behaviour in C++ whether or not you see a bad result. A test on x86 cannot catch hardware store-store or load-load reordering, since that hardware does not do them, and your next compiler or an ARM server may expose the bug. Use ThreadSanitizer (`g++ -fsanitize=thread`) and reason from the standard's rules.
:::

## Barriers {#ch03-barriers .th}

There are two separate kinds of barrier:

- **Compiler barrier**: `asm volatile("" : : : "memory")` or `std::atomic_signal_fence`. It stops the compiler moving memory accesses across it and emits no instruction.
- **Hardware barrier**: `mfence` on x86, `dmb ish` on ARM. On x86 a `lock`-prefixed instruction also acts as a full barrier, draining the store buffer. Usually you write `std::atomic_thread_fence` or an atomic operation and let the compiler pick the instruction.

This asks GCC what it emits for each operation on the build machine. It depends on the target and the compiler version:

```bash run=ca-c03-asm nondet
cat > ord.cpp <<'EOF'
#include <atomic>
std::atomic<int> x;
using M = std::memory_order;
extern "C" {
int load_relaxed() { return x.load(M::relaxed); }
int load_acquire() { return x.load(M::acquire); }
int load_seq_cst() { return x.load(M::seq_cst); }
void store_relaxed(int v) { x.store(v, M::relaxed); }
void store_release(int v) { x.store(v, M::release); }
void store_seq_cst(int v) { x.store(v, M::seq_cst); }
int add_relaxed(int v) { return x.fetch_add(v, M::relaxed); }
void fence_seq_cst() { std::atomic_thread_fence(M::seq_cst); }
}
EOF
uname -m
g++ -std=c++20 -O2 -S -o - ord.cpp | awk '/^[a-z_]+:$/ { name = $1 } /^\t(mov|xchg|lock|mfence|ldr|ldar|ldapr|str|stlr|dmb|ldadd)/ { sub(/^\t/, ""); print name, $0 }'
```

The usual mapping, which the output above should match on x86-64:

| C++ operation | x86-64 | ARMv8 |
|---|---|---|
| load: relaxed | `mov` | `ldr` |
| load: acquire | `mov` | `ldar` or `ldapr` |
| load: seq_cst | `mov` | `ldar` |
| store: relaxed | `mov` | `str` |
| store: release | `mov` | `stlr` |
| store: seq_cst | `xchg`, or `mov` + `mfence` | `stlr` |
| read-modify-write | `lock`-prefixed | exclusive-pair loop, or LSE atomics such as `ldadd` |
| fence: seq_cst | `mfence` or a locked instruction | `dmb ish` |

Only the seq_cst store and the RMW cost more on x86. On x86, a relaxed store and a release store are the same instruction, and they still differ in what the compiler may do around them.

## C++ atomics {#ch03-atomics .th}

A **data race** is two conflicting accesses to one location, at least one a write, at least one non-atomic, with no happens-before order between them. It is undefined behaviour. Atomics remove the race, and the memory order you pick controls what else is ordered:

- **relaxed**: the operation is atomic, and each variable has a single modification order. Nothing else is ordered. Good for counters.
- **release** (store) and **acquire** (load): if an acquire load reads the value written by a release store, the two **synchronize**. Everything before the store happens-before everything after the load. This is the standard way to publish data.
- **acq_rel**: both, on a read-modify-write.
- **seq_cst**: the default. Acquire and release, plus one total order over all seq_cst operations. If a program has no data races and uses only seq_cst, it behaves as if sequentially consistent.

`memory_order_consume` exists, and compilers treat it as acquire. Avoid it.

```cpp run=ca-c03-publish
#include <atomic>
#include <cstdio>
#include <thread>
struct Config { int port; int retries; };
Config config;                         // plain data
std::atomic<bool> ready{false};
std::atomic<long> hits{0};

int main() {
    std::thread writer([] {
        config = {8080, 3};
        ready.store(true, std::memory_order_release);    // publishes config
    });
    std::thread reader([] {
        while (!ready.load(std::memory_order_acquire)) {}
        printf("%d %d\n", config.port, config.retries);  // guaranteed by the standard
    });
    writer.join(); reader.join();

    std::thread counters[4];
    for (auto& t : counters)
        t = std::thread([] { for (int i = 0; i < 100000; i++) hits.fetch_add(1, std::memory_order_relaxed); });
    for (auto& t : counters) t.join();
    printf("%ld\n", hits.load());                        // relaxed is still atomic: no lost updates
}
```

:::trap
`volatile` is not for threads in C++. It stops the compiler from removing or merging accesses, but it gives no atomicity, no hardware ordering and no happens-before. Two threads doing `count++` on a `volatile int` have a data race, and updates are lost in practice.
:::

## Lock-free basics {#ch03-lockfree .th}

The building block is **compare-and-swap**: `a.compare_exchange_weak(expected, desired)` stores `desired` if `a == expected`, and otherwise copies the current value into `expected`. The `weak` form may fail for no visible reason (on LL/SC machines such as ARM with exclusive pairs), so use it in a loop. Progress guarantees are defined as follows:

- **Blocking**: a stalled thread holding a lock can stop everyone.
- **Lock-free**: some thread always makes progress, though one may starve.
- **Wait-free**: every thread finishes in a bounded number of its own steps.

Lock-free does not mean fast: all threads still fight over the same cache line. Check `std::atomic<T>::is_always_lock_free` too, since large types may use a hidden lock.

A Treiber stack is the classic example. Here several threads push, and one thread drains the stack after they have joined:

```cpp run=ca-c03-treiber
#include <atomic>
#include <cstdio>
#include <thread>
#include <vector>
struct Node { int value; Node* next; };
std::atomic<Node*> head{nullptr};

static void push(int v) {
    Node* n = new Node{v, head.load(std::memory_order_relaxed)};
    while (!head.compare_exchange_weak(n->next, n, std::memory_order_release, std::memory_order_relaxed)) {}
}
int main() {
    std::vector<std::thread> ts;
    for (int t = 0; t < 4; t++)
        ts.emplace_back([t] { for (int i = 1; i <= 10000; i++) push(t * 100000 + i); });
    for (auto& t : ts) t.join();
    long count = 0, sum = 0;
    for (Node* n = head.load(std::memory_order_acquire); n;) {
        Node* next = n->next;
        count++; sum += n->value;
        delete n;
        n = next;
    }
    printf("%ld %ld\n", count, sum);
}
```

A concurrent `pop` is much harder. It must read `top->next` while another thread may free `top`, and it faces the **ABA problem**: a CAS sees the same pointer value and succeeds, even though the node was popped, freed and reallocated in between, so the `next` it saved is stale. Fixes include tagged pointers with a version counter, and safe memory reclamation such as hazard pointers or epochs. In an interview, name the problem, say why it arises, and name one fix.

## Drills: coherence and ordering {#ch03-drills .dr}

:::drill concept
Give a one-sentence difference between coherence and consistency, and say which one a store buffer affects.
---
**Answer.** Coherence orders writes to one location, and consistency orders operations across different locations. A store buffer affects consistency: it lets a later load to a different address overtake an earlier store, while each location still has a single write order.
:::

:::drill output
Trace this by hand using the MESI rules, then check the states.

```python run=ca-c03-d-mesi
s = ["I", "I", "I"]
def read(c):
    if s[c] == "I":
        holders = [i for i in range(3) if s[i] != "I"]
        for i in holders: s[i] = "S"
        s[c] = "S" if holders else "E"
def write(c):
    for i in range(3):
        if i != c: s[i] = "I"
    s[c] = "M"
for act, c in [(read, 0), (read, 1), (write, 2), (read, 0), (write, 0), (read, 1)]:
    act(c)
    print("".join(s))
```
---
**Answer.** Read gives `E`. A second reader makes both `S`. A write by core 2 invalidates both. A read by core 0 forces the M owner down to S, and both are S. Core 0's write invalidates core 2. Core 1's read downgrades core 0, leaving two S copies and one I.
:::

:::drill tricky
Why have the E state at all? Would MSI not be enough?
---
**Answer.** MSI works, but a thread that reads a private line and then writes it would broadcast an upgrade even though no one else holds the line. E records "I am the only holder", so that write is silent. For unshared data, which is most data, this removes a lot of traffic.
:::

:::drill tricky
Two threads alternate writes to one line for 1000 writes in total, starting from I in both caches. How many writes need an interconnect transaction under MESI?
---
```python run=ca-c03-d-ping
st, bus = ["I", "I"], 0
for i in range(1000):
    c = i % 2
    if st[c] != "M":
        bus += st[c] != "E"
        st[c], st[1 - c] = "M", "I"
print(bus)
```

**Why.** Each write finds the line invalid, because the other core just took ownership. That is the cost of both false sharing and true sharing of a hot variable.
:::

:::drill output
What does this print?

```cpp run=ca-c03-d-pad
#include <atomic>
#include <cstddef>
#include <cstdio>
struct P { alignas(64) std::atomic<int> a; alignas(64) std::atomic<int> b; };
struct Q { std::atomic<int> a; std::atomic<int> b; };
int main() {
    printf("%zu %zu %zu %zu\n", sizeof(P), offsetof(P, b), sizeof(Q), offsetof(Q, b));
}
```
---
**Answer.** Each member of `P` starts on a 64-byte boundary, so `b` is at 64 and the size rounds up to 128. `Q` packs two 4-byte atomics into 8 bytes, and they will share a line.
:::

:::drill tricky
Does false sharing ever give a wrong result? Then how do you find it?
---
**Answer.** With atomics or properly separate variables, it never changes the result, only the speed. Symptoms include poor scaling and high coherence traffic. `perf c2c` on Linux can point at contended lines, and a padding experiment confirms the diagnosis.
:::

:::drill tricky
Would release on the stores and acquire on the loads forbid the SB outcome `r1 == 0 && r2 == 0`?
---
**Answer.** No. Release and acquire only create order when a load reads the value a store wrote. In the bad outcome neither load reads the other thread's store, so nothing synchronizes. On x86 those operations are plain `mov`s, so the store buffer still delays the stores. You need seq_cst on all four operations, or a seq_cst fence between the store and the load in each thread.
:::

:::drill tricky
"x86 gives acquire and release semantics to plain `mov`, so on x86 I can use `memory_order_relaxed` for publishing." What is wrong with this?
---
**Answer.** The hardware claim is correct, but the code is still wrong under the C++ standard, since relaxed creates no happens-before and the plain data access is a data race. The compiler may also reorder the two stores, because relaxed allows it, and the hardware cannot restore an order the compiler already changed.
:::

:::drill output
What does this print?

```cpp run=ca-c03-d-cas
#include <atomic>
#include <cstdio>
int main() {
    std::atomic<int> a{5};
    int e = 3;
    bool ok = a.compare_exchange_strong(e, 9);
    printf("%d %d %d\n", ok, a.load(), e);
    ok = a.compare_exchange_strong(e, 9);
    printf("%d %d %d\n", ok, a.load(), e);
}
```
---
**Answer.** The first CAS fails, since 5 is not 3, and writes the current value into `e`. The second CAS uses `e == 5`, so it succeeds. `e` stays 5. That update of `expected` is why CAS loops need no extra load.
:::

:::drill output
What does this print?

```cpp run=ca-c03-d-rmw
#include <atomic>
#include <cstdio>
int main() {
    std::atomic<int> c{10};
    int a = c.fetch_add(5);
    int b = ++c;
    int d = c.exchange(0);
    printf("%d %d %d %d\n", a, b, d, c.load());
}
```
---
**Answer.** `fetch_add` returns the old value, 10. `++c` returns the new value, 16. `exchange` returns the old value, 16, and leaves 0.
:::

:::drill bug
Find the bug. The loop may never exit at `-O2`.

```cpp
bool done = false;
void worker() { compute(); done = true; }
void waiter() { while (!done) {} use_result(); }
```
---
**Answer.** `done` is a non-atomic variable accessed by two threads with no synchronization, which is a data race and so undefined behaviour. In practice, the compiler sees no write inside the loop and may load `done` once, turning it into an infinite loop. Use `std::atomic<bool>` with release on the store and acquire on the load.
:::

:::drill bug
This usually works on x86. What is wrong?

```cpp
int data;
std::atomic<int> flag{0};
void producer() { data = 42; flag.store(1, std::memory_order_release); }
void consumer() { if (flag.load(std::memory_order_relaxed)) use(data); }
```
---
**Answer.** The load must be acquire. With relaxed there is no synchronizes-with edge, so reading `data` is a data race. On ARM the read of `data` can really happen before the flag load, and the compiler can reorder it on any target.
:::

:::drill bug
Find the bug in this lazy initialisation.

```cpp
Widget* inst = nullptr;
std::mutex m;
Widget* get() {
    if (!inst) {
        std::lock_guard<std::mutex> g(m);
        if (!inst) inst = new Widget();
    }
    return inst;
}
```
---
**Answer.** The first read of `inst` is unsynchronized, so it races with the write. Another thread can see a non-null pointer without any ordering guarantee for the object's fields. Make `inst` a `std::atomic<Widget*>` with acquire and release, or use a function-local `static Widget w;`, which C++11 makes thread-safe.
:::

:::drill bug
What is wrong with this "spinlock" on ARM, and why might an x86 test miss the problem?

```cpp
std::atomic<bool> locked{false};
void lock()   { while (locked.exchange(true, std::memory_order_relaxed)) {} }
void unlock() { locked.store(false, std::memory_order_relaxed); }
```
---
**Answer.** It gives mutual exclusion on the flag, but no happens-before between critical sections, so the protected data is still racy. `lock` needs acquire and `unlock` needs release. On x86 `exchange` is a locked instruction, a full barrier in hardware, and stores keep their order, so tests would pass as long as the compiler does not reorder anything. ARM gives no such help.
:::

:::drill tricky
A mutex is blocking. Is a `std::atomic<int>` counter wait-free? What about a CAS loop?
---
**Answer.** On x86 `fetch_add` is one `lock xadd`, a bounded number of steps, so it is wait-free in hardware. A CAS retry loop is lock-free only: when a thread fails, another thread succeeded, but one unlucky thread can keep failing. On LL/SC machines without LSE, `fetch_add` is itself a retry loop.
:::

:::drill concept
Explain ABA with a stack, using three steps.
---
**Answer.** Thread 1 reads `head = A` and `A->next = B`, then stalls. Thread 2 pops A, pops B, frees B and pushes A back. Thread 1's CAS sees `head == A` and succeeds, setting `head = B`, which was freed. The pointer compare could not tell that the stack changed in between.
:::

## Write the code {#ch03-coding .cd}

:::drill code
Write a test-and-test-and-set spinlock using `std::atomic<bool>`. Use the weakest correct orders, and show that it protects a plain counter.
---
Spin on a load so that waiting threads keep the line in S and generate no traffic. Only attempt `exchange` when the lock looks free.

```cpp run=ca-c03-c-spin
#include <atomic>
#include <cstdio>
#include <thread>
#include <vector>
class Spinlock {
    std::atomic<bool> locked{false};
public:
    void lock() {
        for (;;) {
            if (!locked.exchange(true, std::memory_order_acquire)) return;
            while (locked.load(std::memory_order_relaxed)) std::this_thread::yield();
        }
    }
    void unlock() { locked.store(false, std::memory_order_release); }
};
int main() {
    Spinlock lock;
    long counter = 0;       // plain variable, protected by the lock
    std::vector<std::thread> ts;
    for (int t = 0; t < 4; t++)
        ts.emplace_back([&] { for (int i = 0; i < 100000; i++) { lock.lock(); counter++; lock.unlock(); } });
    for (auto& t : ts) t.join();
    printf("%ld\n", counter);
}
```

The acquire on success and the release on unlock order the critical sections. A correct total here does not prove the orders right, so the argument above still has to hold.
:::

:::drill code
Write a single-producer, single-consumer ring buffer with no locks. Send the numbers 1 to 100000 through it and check the sum.
---
Only the producer writes `tail` and only the consumer writes `head`. The producer writes the slot and then publishes it with a release store. The consumer's acquire load makes the slot's contents visible. Padding keeps the two indexes on separate lines.

```cpp run=ca-c03-c-spsc
#include <atomic>
#include <cstdio>
#include <optional>
#include <thread>
template <class T, size_t N> class Spsc {
    T slots[N];
    alignas(64) std::atomic<size_t> head{0};
    alignas(64) std::atomic<size_t> tail{0};
public:
    bool push(const T& v) {
        size_t t = tail.load(std::memory_order_relaxed);
        size_t next = (t + 1) % N;
        if (next == head.load(std::memory_order_acquire)) return false;   // full
        slots[t] = v;
        tail.store(next, std::memory_order_release);
        return true;
    }
    std::optional<T> pop() {
        size_t h = head.load(std::memory_order_relaxed);
        if (h == tail.load(std::memory_order_acquire)) return std::nullopt;   // empty
        T v = slots[h];
        head.store((h + 1) % N, std::memory_order_release);
        return v;
    }
};
int main() {
    static Spsc<int, 1024> q;
    const int n = 100000;
    long sum = 0;
    std::thread consumer([&] {
        for (int got = 0; got < n;) {
            if (auto v = q.pop()) { sum += *v; got++; }
            else std::this_thread::yield();
        }
    });
    for (int i = 1; i <= n; i++) while (!q.push(i)) std::this_thread::yield();
    consumer.join();
    printf("%ld %ld\n", sum, long(n) * (n + 1) / 2);
}
```

The ring holds `N - 1` items, so full and empty can be told apart. This design is correct only with exactly one thread on each side.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Coherence: one location, one write order. Consistency: order across locations.
- MESI: single writer or many readers. E to M is silent. S to M needs an upgrade. Snoop read pushes M to S with a write-back.
- False sharing: separate variables, same line, correct result, poor scaling. Fix with `alignas(64)` or per-thread data. Find with `perf c2c`.
- SC: one global order respecting program order. SB test: both loads zero is impossible under SC and possible on real hardware.
- x86 TSO reorders only store then later load (store buffer), for ordinary memory. ARMv8 can reorder all four pairs unless told not to.
- The standard is what your code must satisfy. Hardware behaviour only describes what fails today. A race that does not show up is still a race.
- relaxed: atomic only. release + acquire: synchronize when the load reads the store. seq_cst: plus a total order. `volatile` is not for threads.
- On x86, load and release store are plain `mov`. seq_cst store is `xchg` or `mov` + `mfence`. RMW is `lock`-prefixed.
- CAS: `expected` is updated on failure; `weak` can fail spuriously, so loop. Lock-free: someone progresses. Wait-free: everyone does, in bounded steps.
- ABA: same pointer, different history. Fix with tags, hazard pointers or epochs.
