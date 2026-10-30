---
title: Lowering, scheduling and memory planning
part: Part B · The ML compiler
lede: Once the graph is clean, the compiler must decide what runs where, in what order, and at which memory address. This chapter maps operators onto hardware primitives, builds a list scheduler, shows why execution order changes peak memory, and writes a greedy memory planner that assigns every tensor an offset. It finishes with the moves used when a tensor still does not fit, in-place reuse, tiling and spilling.
desc: operator mapping, list scheduling, latency vs memory, tensor lifetimes, offset planning as interval colouring, in-place, tiling, spilling
hours: 5
prereqs: Chapter 1 (liveness, colouring), Chapter 3 (graphs, topological order)
---

## From graph to schedule {#ch04-pipeline .th}

An accelerator compiler's back half follows the same order as Chapter 1's back end, with tensors in place of scalars. Operators become hardware primitives (instruction selection). They get an order and a unit (scheduling). Tensors get a memory address (register allocation). The output is a static plan, often a command list: in a typical NPU flow, no allocator or scheduler makes these decisions while the model runs.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 300" role="img" aria-label="Pipeline from a graph through operator mapping, schedule, tensor lifetimes and memory offsets to a command list">
  <text x="10" y="18" class="t-small">graph</text>
  <rect x="10" y="26" width="58" height="26" rx="5" class="d-box"/><text x="39" y="44" text-anchor="middle" class="t-mono">conv1</text>
  <rect x="96" y="6" width="58" height="26" rx="5" class="d-box"/><text x="125" y="24" text-anchor="middle" class="t-mono">conv2</text>
  <rect x="182" y="6" width="58" height="26" rx="5" class="d-box"/><text x="211" y="24" text-anchor="middle" class="t-mono">conv3</text>
  <rect x="182" y="46" width="58" height="26" rx="5" class="d-box"/><text x="211" y="64" text-anchor="middle" class="t-mono">conv4</text>
  <rect x="268" y="26" width="62" height="26" rx="5" class="d-box"/><text x="299" y="44" text-anchor="middle" class="t-mono">concat</text>
  <rect x="358" y="26" width="58" height="26" rx="5" class="d-box"/><text x="387" y="44" text-anchor="middle" class="t-mono">conv5</text>
  <rect x="444" y="26" width="52" height="26" rx="5" class="d-box"/><text x="470" y="44" text-anchor="middle" class="t-mono">relu</text>
  <rect x="524" y="26" width="52" height="26" rx="5" class="d-box"/><text x="550" y="44" text-anchor="middle" class="t-mono">head</text>
  <path d="M68 34 L 96 20" class="d-line"/><path d="M68 44 L 182 58" class="d-line"/><path d="M154 19 L 182 19" class="d-line"/><path d="M240 19 L 268 34" class="d-line"/><path d="M240 59 L 268 44" class="d-line"/><path d="M330 39 L 358 39" class="d-line"/><path d="M416 39 L 444 39" class="d-line"/><path d="M496 39 L 524 39" class="d-line"/>
  <text x="10" y="102" class="t-small">1. map to primitives</text>
  <rect x="10" y="108" width="700" height="28" rx="5" class="d-soft"/><text x="20" y="127" class="t-mono">conv* and head: MAC engine;  concat: DMA or alias;  relu: vector unit or fused</text>
  <text x="10" y="156" class="t-small">2. schedule (a topological order, plus units and start times)</text>
  <rect x="10" y="162" width="700" height="28" rx="5" class="d-acc"/><text x="20" y="181" class="t-mono">conv1  conv2  conv3  conv4  concat  conv5  relu  head</text>
  <text x="10" y="210" class="t-small">3. lifetimes and offsets (each tensor: first step, last step, address)</text>
  <rect x="10" y="216" width="700" height="28" rx="5" class="d-key"/><text x="20" y="235" class="t-mono">a [0,3] at 144;  b [1,2] at 0;  c [2,4] at 80;  e [4,5] at 0;  ...</text>
  <text x="10" y="264" class="t-small">4. command list for the hardware</text>
  <rect x="10" y="270" width="700" height="28" rx="5" class="d-box"/><text x="20" y="289" class="t-mono">RUN conv1 in=&#64;0 out=&#64;144;  RUN conv2 in=&#64;144 out=&#64;0;  ...</text>
</svg></div><figcaption><b>The pipeline this chapter builds.</b> The graph, order and offsets shown are the ones used by the programs below.</figcaption></figure>

## Mapping operators to primitives {#ch04-map .th}

Hardware offers a small set of primitives, such as a convolution or MAC engine, an elementwise unit, a pooling unit, a lookup table for nonlinear functions, and a DMA for moving data. The compiler has to express each graph op in those terms. Some are direct. Others are rewritten: a `MatMul` can become a 1×1 convolution, a `Mean` over the spatial axes an average pool, and a `Sigmoid` a table lookup. Unsupported ops fall back to a CPU, which costs a transfer in each direction. The toy below uses a made-up primitive table, and reports the partitions.

```python run=cc-c04-map
MAP = {"Conv": ["MAC"], "MatMul": ["RESHAPE", "MAC"], "Mean": ["POOL"], "Relu": ["FUSED"],
       "Add": ["ELTWISE"], "Sigmoid": ["LUT"], "Reshape": ["RESHAPE"]}

graph = ["Conv", "Relu", "Conv", "Relu", "Add", "Mean", "Resize", "Reshape", "MatMul", "Sigmoid"]
parts = []
for op in graph:
    where = "npu" if op in MAP else "cpu"
    if not parts or parts[-1][0] != where:
        parts.append((where, []))
    parts[-1][1].append(op)
    print(f"{op:8} {where} {MAP.get(op, ['software kernel'])}")
print("partitions:", [(w, len(ops)) for w, ops in parts])
print("transfers between CPU and NPU:", len(parts) - 1)
```

One unsupported `Resize` in the middle splits the model in three parts. The usual response is to replace the op with something supported or to change the model. A cost model compares options like these, since an NPU kernel plus two transfers may lose to running a whole region on one side.

## List scheduling: latency and memory {#ch04-list .th}

**List scheduling** is the standard greedy heuristic for a DAG with limited resources. Each cycle, it looks at the ops whose inputs are finished, picks the highest-priority op that has a free unit, and starts it. A common priority is the **critical path**: the longest latency from this op to the end of the graph. The program below schedules our graph with one or two MAC units. Each tensor occupies memory from the start of its producer to the end of its last reader.

```python run=cc-c04-list
# op: (unit, latency, inputs, output)
OPS = {"conv1": ("mac", 4, ["in"], "a"), "conv2": ("mac", 6, ["a"], "b"), "conv3": ("mac", 6, ["b"], "c"),
       "conv4": ("mac", 3, ["a"], "d"), "concat": ("vec", 1, ["c", "d"], "e"), "conv5": ("mac", 4, ["e"], "f"),
       "relu": ("vec", 1, ["f"], "g"), "head": ("mac", 2, ["g"], "out")}
SIZE = {"in": 32, "a": 48, "b": 64, "c": 64, "d": 16, "e": 80, "f": 32, "g": 32, "out": 8}
# two branches of the same shape, every op on the MAC unit
OPS2 = {"r": ("mac", 2, [], "tr"), "a1": ("mac", 2, ["tr"], "ta1"), "a2": ("mac", 2, ["ta1"], "ta2"),
        "b1": ("mac", 2, ["tr"], "tb1"), "b2": ("mac", 2, ["tb1"], "tb2"), "add": ("mac", 2, ["ta2", "tb2"], "o")}
SIZE2 = {"tr": 40, "ta1": 60, "ta2": 8, "tb1": 60, "tb2": 8, "o": 8}

def schedule(ops, units):
    producer = {o[3]: n for n, o in ops.items()}
    deps = {n: [producer[i] for i in o[2] if i in producer] for n, o in ops.items()}
    users = {n: [m for m in ops if n in deps[m]] for n in ops}
    path = lambda n: ops[n][1] + max((path(u) for u in users[n]), default=0)
    start, end, time = {}, {}, 0
    while len(start) < len(ops):
        busy = {u: sum(1 for n in start if ops[n][0] == u and end[n] > time) for u in units}
        ready = [n for n in ops if n not in start and all(end.get(d, 1e9) <= time for d in deps[n])]
        for n in sorted(ready, key=lambda n: (-path(n), n)):
            if busy[ops[n][0]] < units[ops[n][0]]:
                start[n], end[n] = time, time + ops[n][1]
                busy[ops[n][0]] += 1
        time += 1
    return start, end

def peak(ops, size, start, end):
    span = {}
    for n, (_, _, inputs, out) in ops.items():
        span[out] = [start[n], end[n]]
    for n, (_, _, inputs, out) in ops.items():
        for i in inputs:
            lo, hi = span.get(i, [0, 0])
            span[i] = [lo, max(hi, end[n])]
    return max(sum(size[t] for t, (lo, hi) in span.items() if lo <= c < hi) for c in range(max(end.values())))

for name, ops, size in [("chain with a skip", OPS, SIZE), ("two branches", OPS2, SIZE2)]:
    print(name)
    for macs in (1, 2):
        start, end = schedule(ops, {"mac": macs, "vec": 1})
        print(f"  {macs} MAC: makespan {max(end.values())} peak {peak(ops, size, start, end)}",
              [f"{n}@{start[n]}" for n in sorted(start, key=lambda n: (start[n], n))])
```

On the first graph, a second MAC unit helps both numbers: `conv4` no longer waits for `conv3`, so the schedule shortens, and `a` is freed sooner, so the peak drops as well. That is a property of this graph, and it does not hold in general. On the two-branch graph, a second unit shortens the schedule and the peak stays high. The one-unit schedule there is also poor for memory: critical-path priority knows only about time, so it alternates between branches. The next section shows that a different order on one unit needs much less memory for the same total latency. Latency and memory can pull against each other, so a compiler targets one with a limit on the other, or combines them in a cost.

## Order changes peak memory {#ch04-order .th}

Every topological order computes the same outputs, but peak memory can differ a lot, even on one unit. Depth-first orders finish a branch and free its memory, while breadth-first orders hold many branches open. This program tries every valid order on a graph with two branches.

```python run=cc-c04-orders
OPS = {"r": ([], 40), "a1": (["r"], 60), "a2": (["a1"], 8), "b1": (["r"], 60), "b2": (["b1"], 8),
       "add": (["a2", "b2"], 8)}
users = {n: [m for m in OPS if n in OPS[m][0]] for n in OPS}

def peak(order):
    remaining = {n: len(users[n]) for n in OPS}
    live, best = 0, 0
    for n in order:
        live += OPS[n][1]
        best = max(best, live)
        for i in OPS[n][0]:
            remaining[i] -= 1
            if remaining[i] == 0:
                live -= OPS[i][1]
    return best

def orders(done):
    if len(done) == len(OPS):
        yield list(done)
    for n in OPS:
        if n not in done and all(i in done for i in OPS[n][0]):
            yield from orders(done + [n])

results = {}
for o in orders([]):
    results.setdefault(peak(o), []).append(o)
print({p: len(v) for p, v in sorted(results.items())})
for p in sorted(results):
    print(p, results[p][0])
print("depth first", peak(["r", "a1", "a2", "b1", "b2", "add"]))
print("breadth first", peak(["r", "a1", "b1", "a2", "b2", "add"]))
```

Finding the order with the minimum peak is NP-hard in general (it is related to the register sufficiency problem), and enumeration only works on very small graphs. Practical compilers use heuristics, or dynamic programming over sets of finished nodes for small graphs. Series-parallel structure helps too, since a residual block can be optimised as a unit.

:::key
Scheduling and memory planning are coupled. The order sets the lifetimes, and the lifetimes set the memory needed. Most compilers fix an order first, because solving both together is much harder.
:::

## Memory planning as interval colouring {#ch04-plan .th}

A tensor's **lifetime** is the interval of steps from its producer to its last reader. Two tensors may share memory if their intervals do not overlap. This is the liveness analysis from Chapter 1, and offset assignment is the analogue of register allocation, with one difference: tensors have different sizes.

If all sizes were equal, this would be interval graph colouring, which a greedy sweep by start time solves optimally: the number of colours equals the maximum overlap. With different sizes, each tensor needs a contiguous range of addresses. This is the **dynamic storage allocation** problem, and it is NP-hard. A useful lower bound is the largest total size of tensors live at one step. A **naive** plan gives every tensor its own space, costing the sum of all sizes.

A common heuristic is **greedy by size**: sort tensors from largest to smallest, and put each at the lowest offset that does not collide with an already-placed tensor whose lifetime overlaps. Large tensors go first because they are hardest to fit. TFLite's arena planner also uses a size-ordered approach.

```python run=cc-c04-plan
SCHEDULE = [("conv1", ["in"], "a"), ("conv2", ["a"], "b"), ("conv3", ["b"], "c"), ("conv4", ["a"], "d"),
            ("concat", ["c", "d"], "e"), ("conv5", ["e"], "f"), ("relu", ["f"], "g"), ("head", ["g"], "out")]
SIZE = {"in": 32, "a": 48, "b": 64, "c": 64, "d": 16, "e": 80, "f": 32, "g": 32, "out": 8}

def lifetimes(schedule):
    span = {}
    for step, (_, inputs, out) in enumerate(schedule):
        span[out] = [step, step]
        for i in inputs:
            span.setdefault(i, [step, step])[1] = step
    return span

def plan(span, size, key):
    placed = {}
    for t in sorted(span, key=key):
        taken = sorted((placed[o], placed[o] + size[o]) for o in placed
                       if span[o][0] <= span[t][1] and span[t][0] <= span[o][1])
        offset = 0
        for lo, hi in taken:
            if offset + size[t] <= lo:
                break
            offset = max(offset, hi)
        placed[t] = offset
    return placed

def check(span, size, placed):
    for a in placed:
        for b in placed:
            if a < b and span[a][0] <= span[b][1] and span[b][0] <= span[a][1]:
                assert placed[a] + size[a] <= placed[b] or placed[b] + size[b] <= placed[a], (a, b)

def report(name, span, size, placed):
    check(span, size, placed)
    print(f"{name}: peak {max(placed[t] + size[t] for t in placed)}")

span = lifetimes(SCHEDULE)
greedy = plan(span, SIZE, key=lambda t: (-SIZE[t], t))
print("tensor size life    offset")
for t in span:
    print(f"{t:6} {SIZE[t]:4} {str(span[t]):8} {greedy[t]:4}")
print("naive (sum of sizes):", sum(SIZE.values()))
print("lower bound (max live):",
      max(sum(SIZE[t] for t in span if span[t][0] <= s <= span[t][1]) for s in range(len(SCHEDULE))))
report("greedy by size", span, SIZE, greedy)
report("first use order", span, SIZE, plan(span, SIZE, key=lambda t: (span[t][0], t)))

# relu runs in place: f and g become one tensor that lives across both lifetimes
merged = {t: list(v) for t, v in span.items() if t not in ("f", "g")}
merged["fg"] = [span["f"][0], span["g"][1]]
sizes = {**SIZE, "fg": 32}
report("greedy with in-place relu", merged, sizes, plan(merged, sizes, key=lambda t: (-sizes[t], t)))
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 268" role="img" aria-label="Memory plan: time steps on the horizontal axis, memory offset on the vertical axis, with one rectangle per tensor. No two rectangles overlap and the top reaches 208.">
  <text x="108" y="20" text-anchor="middle" class="t-small">step 0</text>
  <text x="184" y="20" text-anchor="middle" class="t-small">step 1</text>
  <text x="260" y="20" text-anchor="middle" class="t-small">step 2</text>
  <text x="336" y="20" text-anchor="middle" class="t-small">step 3</text>
  <text x="412" y="20" text-anchor="middle" class="t-small">step 4</text>
  <text x="488" y="20" text-anchor="middle" class="t-small">step 5</text>
  <text x="564" y="20" text-anchor="middle" class="t-small">step 6</text>
  <text x="640" y="20" text-anchor="middle" class="t-small">step 7</text>
  <text x="60" y="34" text-anchor="end" class="t-mono">0</text>
  <text x="60" y="118" text-anchor="end" class="t-mono">80</text>
  <text x="60" y="185" text-anchor="end" class="t-mono">144</text>
  <text x="60" y="219" text-anchor="end" class="t-mono">176</text>
  <text x="60" y="252" text-anchor="end" class="t-mono">208</text>
  <rect x="71" y="30.0" width="74" height="33.6" rx="3" class="d-soft"/>
  <text x="108" y="51" text-anchor="middle" class="t-mono">in (32)</text>
  <rect x="71" y="181.2" width="302" height="50.4" rx="3" class="d-acc"/>
  <text x="222" y="210" text-anchor="middle" class="t-mono">a (48)</text>
  <rect x="147" y="30.0" width="150" height="67.2" rx="3" class="d-key"/>
  <text x="222" y="68" text-anchor="middle" class="t-mono">b (64)</text>
  <rect x="223" y="114.0" width="226" height="67.2" rx="3" class="d-soft"/>
  <text x="336" y="152" text-anchor="middle" class="t-mono">c (64)</text>
  <rect x="299" y="231.6" width="150" height="16.8" rx="3" class="d-acc"/>
  <text x="374" y="244" text-anchor="middle" class="t-mono">d (16)</text>
  <rect x="375" y="30.0" width="150" height="84.0" rx="3" class="d-key"/>
  <text x="450" y="76" text-anchor="middle" class="t-mono">e (80)</text>
  <rect x="451" y="114.0" width="150" height="33.6" rx="3" class="d-soft"/>
  <text x="526" y="135" text-anchor="middle" class="t-mono">f (32)</text>
  <rect x="527" y="30.0" width="150" height="33.6" rx="3" class="d-acc"/>
  <text x="602" y="51" text-anchor="middle" class="t-mono">g (32)</text>
  <rect x="603" y="63.6" width="74" height="8.4" rx="3" class="d-key"/>
  <text x="640" y="84" text-anchor="middle" class="t-small">out (8)</text>
  <path d="M70 214.8 L 678 214.8" class="d-line-key"/><text x="674" y="209.8" text-anchor="end" class="t-small t-key">lower bound 176</text>
  <path d="M70 248.4 L 678 248.4" class="d-line-trap"/><text x="674" y="243.4" text-anchor="end" class="t-small t-trap">greedy peak 208</text>
</svg></div><figcaption><b>The greedy-by-size plan from the program above.</b> Time runs left to right and offsets run downward. A rectangle shows where a tensor lives and for how long, and no two rectangles overlap. Naive allocation would use 376.</figcaption></figure>

The plan needs 208 units against 376 for the naive one, and greedy by size also beats placing tensors in order of first use, which needs 256. It stays above the lower bound of 176, because `d` finds no gap and lands at the top. Making `relu` run in place does not lower the peak here. `f` and `g` are alive only after the busiest steps, so merging them changes nothing where the peak is set. In-place reuse helps only when it reduces live bytes at or near the peak. The coding drill below shows that a better placement order does reach 176.

## In-place ops, tiling and spilling {#ch04-fit .th}

**In-place** execution writes an op's output over an input. It is legal when the input's last reader is this op, the sizes fit, and the op can safely overwrite as it goes. Elementwise ops such as `Relu` and `Add` qualify. `Conv` generally does not, since its window reads inputs that an in-place output would already have overwritten. `Concat` and `Split` can often be handled by **aliasing**: place the inputs next to each other, so that no data moves. Ops like `Reshape` that keep the bytes can alias, too.

:::trap
Never reuse a graph input's or graph output's buffer in place without checking who owns it, and never reuse a tensor that another op still reads. A model where `f` feeds both `relu` and a skip connection cannot overwrite `f`. This is the same reasoning as the lifetime check, applied to one op.
:::

**Tiling** handles a single op whose tensors do not fit in fast memory. It splits the tensor into pieces, and runs the op once for each piece. A convolution's output tile needs an input region larger than itself, called the **halo**: for kernel `k` and stride 1, each tile needs `k - 1` extra input elements. The program checks that a tiled 1D convolution gives the same result as the full one, and that skipping the halo does not.

```python run=cc-c04-tile
import numpy as np

x = np.arange(20.0) ** 2
kernel = np.array([1.0, -2.0, 1.0])
k = len(kernel)
want = np.convolve(x, kernel, mode="valid")

def tiled(tile_out, halo):
    out, biggest = [], 0
    for start in range(0, len(want), tile_out):
        stop = min(start + tile_out, len(want))
        window = x[start:stop + halo]
        biggest = max(biggest, len(window))
        got = np.convolve(window, kernel, mode="valid")
        out.append(got[:stop - start])
    return np.concatenate(out), biggest

result, biggest = tiled(tile_out=5, halo=k - 1)
print("full input", len(x), "largest tile input", biggest)
print("tiled equals full:", np.array_equal(result, want))
bad, _ = tiled(tile_out=5, halo=0)
print("no halo, output length", len(bad), "of", len(want))
```

Without a halo, each tile loses `k - 1` outputs at its edge. Tiling trades extra transfers and some repeated work for a smaller peak. Fusing several layers into one tiled loop keeps intermediate data in fast memory, but the halo grows with each layer, since it follows the receptive field.

**Spilling** moves a live tensor to slower external memory and reloads it before its next use. The classic choice is to evict the tensor whose next use is furthest away, called Belady's rule. It is optimal for equal-sized values, and only a heuristic here. A tensor that is never read again can be dropped at no cost. The working set of a single op must still fit, otherwise that op has to be tiled.

```python run=cc-c04-spill
SCHEDULE = [("conv1", ["in"], "a"), ("conv2", ["a"], "b"), ("conv3", ["b"], "c"), ("conv4", ["a"], "d"),
            ("concat", ["c", "d"], "e"), ("conv5", ["e"], "f"), ("relu", ["f"], "g"), ("head", ["g"], "out")]
SIZE = {"in": 32, "a": 48, "b": 64, "c": 64, "d": 16, "e": 80, "f": 32, "g": 32, "out": 8}

def next_use(tensor, step):
    return next((s for s, (_, i, _) in enumerate(SCHEDULE) if s >= step and tensor in i), None)

def simulate(capacity):
    fast, moved, log = {"in"}, 0, []
    for step, (name, inputs, out) in enumerate(SCHEDULE):
        fast = {t for t in fast if next_use(t, step) is not None}
        need = set(inputs) | {out}
        if sum(SIZE[t] for t in need) > capacity:
            return f"working set of {name} does not fit, tile it"
        for t in sorted(set(inputs) - fast):        # reload
            moved += SIZE[t]
            log.append(f"reload {t}")
        fast |= need
        while sum(SIZE[t] for t in fast) > capacity:
            victim = max(sorted(fast - need), key=lambda t: next_use(t, step))
            fast.remove(victim)
            moved += SIZE[victim]
            log.append(f"step {step}: spill {victim}")
    return f"{moved} bytes moved {log}"

for capacity in (176, 170, 160, 159):
    print(capacity, simulate(capacity))
```

These figures ignore fragmentation: a real plan needs contiguous space, so a compiler re-runs the offset planner after deciding on its spills.

## Drills {#ch04-drills .dr}

:::drill concept
Why do many NPU compilers plan memory statically, rather than calling `malloc` at run time?
---
**Answer.** Shapes are usually known ahead of time, so a static plan has no allocator overhead, no fragmentation surprises, and a known worst-case memory use.

**Why.** Small devices have fixed, small on-chip memory, and the compiler must prove that the model fits. Dynamic shapes force a fallback or a re-plan.
:::

:::drill concept
What is the critical path of a DAG, and why is it a good scheduling priority?
---
**Answer.** It is the longest latency path from a node to any sink. Prioritising it starts the ops that most constrain the finish time.

**Why.** No schedule can finish before the longest path, whatever the resources are. Delaying a non-critical op often has no effect, and delaying a critical one always does.
:::

:::drill output
Tensor lifetimes are `A[0,2]`, `B[1,3]`, `C[3,4]`, with sizes 10, 20 and 30. Work out the lower bound, then check it.

```python run=cc-c04-d-bound
span = {"A": (0, 2, 10), "B": (1, 3, 20), "C": (3, 4, 30)}
for s in range(5):
    print(s, sum(z for lo, hi, z in span.values() if lo <= s <= hi))
```
---
**Answer.** The bound is 50, at step 3, when `B` and `C` are both live. At steps 1 and 2 the total is only 30, and `A` and `C` can share since they never overlap.

**Why.** The bound is the maximum over steps of the live total. A sum-of-sizes plan would need 60.
:::

:::drill tricky
Is the max-live lower bound always achievable with contiguous offsets?
---
**Answer.** No. Fragmentation can force more memory, since a tensor needs one contiguous range, even when enough total bytes are free.

**Why.** The greedy plan in this chapter is above its bound, although the coding drill shows a better order reaches it there. For some inputs, no placement reaches the bound, and this is one reason the general problem is hard.
:::

:::drill concept
Why do greedy planners place large tensors first?
---
**Answer.** They are the hardest to place. Small tensors can fit in gaps afterwards, while a late large tensor often goes at the top of the arena and raises the peak.

**Why.** It is the same intuition as sorting items in bin packing. The chapter's two orders have different peaks on the same lifetimes, which you can read from the output.
:::

:::drill bug
This lifetime computation lets tensors share memory they should not. Find the bug.

```python
span = {}
for step, (op, inputs, out) in enumerate(schedule):
    span[out] = [step, step]
    for i in inputs:
        span[i] = [step, step]
```
---
**Answer.** `span[i] = [step, step]` overwrites the start of the input's lifetime, which erases its producer step. It should keep the start and update only the end: `span[i][1] = step` (or `setdefault` for graph inputs).

**Why.** With this bug, a tensor's lifetime is only its last read, so its space could be handed to another tensor while it is still being used. That gives corrupted results, with no crash. A check like the planner's `check` function catches it when it is run against correct lifetimes.
:::

:::drill tricky
`Add(x, y)` where `x` has another reader later and `y` does not. Can it be in place? Into which input?
---
**Answer.** Yes, into `y`'s buffer, if the shapes match. `x` must be preserved.

**Why.** Commutative ops give the compiler a choice of which input to overwrite. With broadcasting, the output can be larger than one input, so only the input with the output's shape qualifies.
:::

:::drill concept
A tile's output covers positions 10 to 19 in a 2D conv with kernel 3, stride 1 and no padding. What input range does it need on that axis?
---
**Answer.** Positions 10 to 21. Output `i` reads input `i` to `i + 2`.

**Why.** In general, output `[a, b]` needs input `[a * s, b * s + k - 1]` with stride `s`, adjusted for padding. Chained layers compound this, and that sets the size of a fused tile's input.
:::

:::drill output
A planner with a schedule of `P → Q → R` (each using the previous output) has sizes 8, 8, 8. What is the peak, and how many colours would interval colouring use?

```python run=cc-c04-d-colour
span = {"P": (0, 1), "Q": (1, 2), "R": (2, 3)}
colours = {}
for t in sorted(span, key=lambda t: span[t][0]):
    used = {colours[o] for o in colours if span[o][0] <= span[t][1] and span[t][0] <= span[o][1]}
    colours[t] = min(c for c in range(9) if c not in used)
print(colours, "peak", (max(colours.values()) + 1) * 8)
```
---
**Answer.** Two colours, giving a peak of 16. `P` and `R` can share, since `P` is dead when `R` is written.

**Why.** An op's input and output must both be alive during the op, unless it runs in place. So a chain needs two buffers, and swaps them, like double buffering. If each op could run in place, one buffer would do.
:::

:::drill tricky
When can spilling a tensor make things slower than tiling?
---
**Answer.** When a large tensor is reloaded often. Each trip costs external bandwidth and time, possibly more than the extra overhead of tiling an op so its working set stays in fast memory.

**Why.** External memory is usually much slower and more power hungry per byte. Spill choices should count real transfer costs, so they appear in the compiler's cost model.
:::

:::drill concept
Why might a compiler schedule depth-first even when there are enough units to run ops in parallel?
---
**Answer.** To limit peak memory. Parallel branches keep their tensors alive together, and that may exceed on-chip memory.

**Why.** Exceeding the memory forces spills or tiling, and those can cost more than the parallelism saved. The two-branch program shows peaks of 108 and 160 for orders that are all valid.
:::

:::drill bug
A student's plan passes the planner's `check`, but still corrupts data in `Concat`. They aliased `c` and `d` into `e` by placing them adjacent, then ran the op as a copy to `e`. Another op reads `c` after `Concat`, and modifies it in place. What is wrong?
---
**Answer.** Aliasing makes `c` and `e` one storage location. Any in-place write to `c` changes `e`, so `c`, `d` and `e` must be treated as one group in the lifetime analysis, and an in-place write needs all readers of the group to be finished.

**Why.** The usual check treats each tensor separately, so aliases need to be merged into a single lifetime first.
:::

## Write the code {#ch04-coding .cd}

:::drill code rating=1500
Is 176, the lower bound of this chapter's plan with `f` and `g` merged, reachable by first-fit with some order? Try all permutations of the tensors and report the best peak.
---
First-fit is flexible enough: if a valid packing exists, then placing tensors in order of their offsets in that packing reproduces it or does better. So a search over orders finds the optimum. There are only 8 tensors here, so 40320 orders are possible.

```python run=cc-c04-c-brute
from itertools import permutations

SIZE = {"in": 32, "a": 48, "b": 64, "c": 64, "d": 16, "e": 80, "fg": 32, "out": 8}
SPAN = {"in": (0, 0), "a": (0, 3), "b": (1, 2), "c": (2, 4), "d": (3, 4), "e": (4, 5), "fg": (5, 7), "out": (7, 7)}
names = sorted(SIZE)
over = {t: [o for o in names if o != t and SPAN[o][0] <= SPAN[t][1] and SPAN[t][0] <= SPAN[o][1]] for t in names}

def place(order, stop_at):
    placed, peak = {}, 0
    for t in order:
        offset = 0
        for lo, hi in sorted((placed[o], placed[o] + SIZE[o]) for o in over[t] if o in placed):
            if offset + SIZE[t] <= lo:
                break
            offset = max(offset, hi)
        placed[t] = offset
        peak = max(peak, offset + SIZE[t])
        if peak >= stop_at:
            return None, peak
    return placed, peak

best, best_plan = 10**9, None
for order in permutations(names):
    plan, peak = place(order, best)
    if plan and peak < best:
        best, best_plan = peak, plan
print("best peak", best)
print(dict(sorted(best_plan.items())))
```

This search is exponential and only suits small examples. It is useful as a test oracle: for small graphs, you can measure how far a heuristic falls from the true optimum.
:::

:::drill code rating=1300
Add a dynamic programme to find the minimum-peak order. State: the set of finished ops. Use a bitmask, and run it on the two-branch graph from this chapter.
---
From any set of finished ops, live memory is fixed, since a tensor is live if its producer is done and some reader is not. So memoise on the set.

```python run=cc-c04-c-dp
from functools import lru_cache

OPS = {"r": ([], 40), "a1": (["r"], 60), "a2": (["a1"], 8), "b1": (["r"], 60), "b2": (["b1"], 8), "add": (["a2", "b2"], 8)}
names = list(OPS)
idx = {n: i for i, n in enumerate(names)}
users = {n: [m for m in OPS if n in OPS[m][0]] for n in OPS}

def live_after(mask):
    total = 0
    for n in names:
        done = mask >> idx[n] & 1
        if done and (not users[n] or any(not mask >> idx[u] & 1 for u in users[n])):
            total += OPS[n][1]
    return total

@lru_cache(None)
def best(mask):
    if mask == (1 << len(names)) - 1:
        return 0, ()
    options = []
    for n in names:
        if not mask >> idx[n] & 1 and all(mask >> idx[i] & 1 for i in OPS[n][0]):
            during = live_after(mask) + OPS[n][1]
            rest, order = best(mask | 1 << idx[n])
            options.append((max(during, rest), (n, *order)))
    return min(options)

print(best(0))
```

The number of states can reach `2^n`, but on a graph with little branching, far fewer sets are reachable. The `min` tie-break on the tuple keeps the output deterministic.
:::

## Cheat sheet {#ch04-cheatsheet .th}

- Pipeline: map ops, schedule, lifetimes, offsets, commands. It mirrors selection, scheduling and register allocation.
- Unsupported ops split the model into partitions, and each boundary costs transfers.
- List scheduling: ready ops, priority by critical path, limited units. Parallelism lowers latency and can raise peak memory.
- All topological orders give the same results but different peaks. The optimum is NP-hard. Depth-first usually beats breadth-first on memory.
- Lifetime: producer step to last reader step. Overlapping lifetimes cannot overlap in memory.
- Equal sizes: interval colouring, optimal by a sweep. Different sizes: dynamic storage allocation, NP-hard. Lower bound: maximum live bytes. Naive: sum of sizes.
- Greedy by size: largest first, lowest non-colliding offset. Always verify the plan with a checker.
- In-place needs: last reader, same size, safe overwrite. Elementwise yes, `Conv` generally no. Aliased tensors are one lifetime group.
- Tiling: split an op that does not fit. Halo is `k - 1` at stride 1, and it grows through fused layers. Spilling: evict furthest next use, reload, and count the cost.
