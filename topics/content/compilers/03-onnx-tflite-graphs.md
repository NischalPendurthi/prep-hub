---
title: ONNX and TFLite graphs, tensor shapes and layouts
part: Part B · The ML compiler
lede: An ML compiler's input is usually a graph of tensor operators, exported from a training framework. This chapter explains what ONNX and TFLite files contain, how shape inference and broadcasting work, what NCHW and NHWC mean in memory, how a topological order captures execution dependencies, and which graph-level optimisations run first. You write the shape inference, the sort, a tracer that shows why exporters freeze control flow, and two rewrites.
desc: computational graphs, operators, shape inference, broadcasting, NCHW vs NHWC, topological order, PyTorch export, constant folding, operator fusion
hours: 4
prereqs: Chapter 1 (passes), matrix multiplication, what a convolution computes
---

## Computational graphs and operators {#ch03-graphs .th}

A trained network can be written as a **computational graph**: a directed acyclic graph (DAG) in which nodes are operators and edges are tensors. Weights are constant tensors with no producer. The graph records *what* to compute and leaves *how* open, so a compiler is free to reorder, merge or lower nodes as long as outputs stay the same.

Compared with Chapter 1's IR, a graph node does far more work (a `Conv` is millions of multiplies), and the values have rich types (element type plus shape). Almost everything is free of side effects, which makes reordering easy. Graphs do have control flow, such as ONNX `If` and `Loop` with nested subgraphs, and this guide leaves it out.

**ONNX** is an open format stored as protobuf. A `ModelProto` holds an IR version, the opset versions it uses, and a `GraphProto`, which has `node` (the operators), `initializer` (the constant weights), and `input`, `output` and `value_info` (typed values). An **opset** version pins the exact definition of each operator, so the same op name can change behaviour between opsets. Below is a small model in ONNX's text syntax, which the `onnx` package can parse.

```text
// illustrative: ONNX textual syntax. Weights are written as inputs here to keep it short.
<ir_version: 8, opset_import: ["" : 17]>
tiny (float[N, 3, 32, 32] x, float[8, 3, 3, 3] w, float[8] b, float[8, 10] fc) => (float[N, 10] y)
{
   c = Conv <kernel_shape = [3, 3], pads = [1, 1, 1, 1], strides = [2, 2]> (x, w, b)
   r = Relu (c)
   p = GlobalAveragePool (r)
   f = Flatten <axis = 1> (p)
   y = MatMul (f, fc)
}
```

**TFLite** is a FlatBuffers format designed to be memory-mapped on small devices. A `Model` has `operator_codes`, `subgraphs` and `buffers`. Each subgraph lists `tensors`, its `inputs` and `outputs` as tensor indexes, and `operators`, which are stored in execution order. Quantization parameters are attached to each tensor (Chapter 5). Activation is often folded into the operator as `fused_activation_function`.

```json
// illustrative: a fragment of a .tflite file converted to JSON with flatc
{ "operator_codes": [ { "builtin_code": "CONV_2D" } ],
  "subgraphs": [ {
    "tensors": [
      { "shape": [1, 32, 32, 3], "type": "INT8", "buffer": 0, "name": "input",
        "quantization": { "scale": [0.0078125], "zero_point": [0] } } ],
    "inputs": [0], "outputs": [3],
    "operators": [ {
      "opcode_index": 0, "inputs": [0, 1, 2], "outputs": [3],
      "builtin_options_type": "Conv2DOptions",
      "builtin_options": { "padding": "SAME", "stride_w": 1, "stride_h": 1,
                           "fused_activation_function": "RELU6" } } ] } ] }
```

## Broadcasting and shape inference {#ch03-shapes .th}

**Shape inference** works out each tensor's shape from the input shapes and each operator's rules. Compilers run it early, since memory planning and lowering both need sizes. Each op has a formula. For convolution, on each spatial axis:

`out = floor((in + pad_begin + pad_end - dilation * (kernel - 1) - 1) / stride) + 1`

TensorFlow's `SAME` padding means `out = ceil(in / stride)`, and `VALID` means no padding. **Broadcasting** is the rule for elementwise ops on different shapes: align shapes at the right, and on each axis the sizes must match, or one must be 1. A missing axis counts as 1. ONNX uses the same rule as NumPy for `Add` and similar ops, which it calls multidirectional broadcasting.

```python run=cc-c03-broadcast
from itertools import zip_longest
import numpy as np

def broadcast(a, b):
    out = []
    for x, y in zip_longest(reversed(a), reversed(b), fillvalue=1):
        if x != y and 1 not in (x, y):
            raise ValueError(f"{a} and {b} differ at {x} vs {y}")
        out.append(y if x == 1 else x)
    return tuple(reversed(out))

for a, b in [((8, 1, 6), (7, 1)), ((3,), (3, 1)), ((5, 4), (1,)), ((), (2, 3)), ((2, 3), (3, 2)), ((4, 0), (1,))]:
    try:
        mine = broadcast(a, b)
    except ValueError as e:
        mine = f"error: {e}"
    try:
        theirs = np.broadcast_shapes(a, b)
    except ValueError:
        theirs = "error"
    print(a, b, "->", mine, "| NumPy:", theirs)
```

The second case is a famous bug source: shapes `(3,)` and `(3, 1)` broadcast to a 3×3 matrix, when the author probably wanted element-by-element. The last case shows that a size of 1 stretches to 0.

Now a toy inference pass over a small residual block. The batch dimension is the symbol `"N"`, and symbols pass through untouched. Each operator has a rule, and an error names the node.

```python run=cc-c03-shape
from itertools import zip_longest
from math import floor, prod

def bcast(a, b):
    out = []
    for x, y in zip_longest(reversed(a), reversed(b), fillvalue=1):
        if x != y and 1 not in (x, y):
            raise ValueError(f"cannot broadcast {a} with {b}")
        out.append(y if x == 1 else x)
    return out[::-1]

def conv(s, out_ch, k, stride=1, pad=0):
    f = lambda d: floor((d + 2 * pad - (k - 1) - 1) / stride) + 1
    return [s[0], out_ch, f(s[2]), f(s[3])]

RULES = {
    "Conv": lambda s, **a: conv(s[0], **a),
    "MaxPool": lambda s, k, stride: conv(s[0], s[0][1], k, stride),
    "Relu": lambda s: s[0],
    "Add": lambda s: bcast(s[0], s[1]),
    "GlobalAvgPool": lambda s: [*s[0][:2], 1, 1],
    "Flatten": lambda s: [s[0][0], prod(s[0][1:])],
    "MatMul": lambda s: [*s[0][:-1], s[1][1]],
}

def infer(inputs, nodes):
    shapes = dict(inputs)
    for out, op, args, attrs in nodes:
        try:
            shapes[out] = RULES[op]([shapes[a] for a in args], **attrs)
        except ValueError as e:
            print(f"{out} ({op}): {e}")
            return None
        print(f"{out:4} {op:14} {shapes[out]}")
    return shapes

INPUTS = {"x": ["N", 3, 32, 32], "fc": [16, 10], "gain": [1]}
NODES = [("c1", "Conv", ["x"], dict(out_ch=16, k=3, pad=1)),
         ("r1", "Relu", ["c1"], {}),
         ("p1", "MaxPool", ["r1"], dict(k=2, stride=2)),
         ("c2", "Conv", ["p1"], dict(out_ch=16, k=3, pad=1)),
         ("a1", "Add", ["p1", "c2"], {}),
         ("a2", "Add", ["a1", "gain"], {}),
         ("g", "GlobalAvgPool", ["a2"], {}),
         ("f", "Flatten", ["g"], {}),
         ("y", "MatMul", ["f", "fc"], {})]
infer(INPUTS, NODES)
print("-- with a bad channel count --")
NODES[3] = ("c2", "Conv", ["p1"], dict(out_ch=8, k=3, pad=1))
infer(INPUTS, NODES)
```

The second run stops at `a1`, with an error on the mismatch between 16 and 8 channels. Finding this at compile time, with the node's name, is far better than a crash inside a kernel. Real inference also has **data-dependent** cases. If a `Reshape`'s target shape comes from a tensor computed at run time, the output shape is unknown, unless constant folding can compute it first. That is why compilers often alternate folding and shape inference.

## NCHW, NHWC and memory order {#ch03-layout .th}

Tensor shapes do not say how values sit in memory. For a batch of images, **NCHW** (channels first, the default in PyTorch and ONNX) stores one whole channel plane, then the next. **NHWC** (channels last, the default in TensorFlow and TFLite) stores all channels of one pixel together. The stride of each axis is the product of the sizes to its right.

```python run=cc-c03-layout
import numpy as np

nchw = np.arange(12).reshape(1, 3, 2, 2)    # 3 channels, height 2, width 2
nhwc = nchw.transpose(0, 2, 3, 1)           # same image, new axis order

print("NCHW memory:", nchw.ravel().tolist())
print("NHWC memory:", nhwc.ravel().tolist())
print("first pixel, all channels:", nchw[0, :, 0, 0].tolist(), nhwc[0, 0, 0, :].tolist())
print("strides in elements:", [s // 8 for s in nchw.strides], [s // 8 for s in np.array(nhwc).copy().strides])
print("shares memory:", np.shares_memory(nchw, nhwc), "| contiguous:", nhwc.flags.c_contiguous)
```

NumPy's `transpose` only changes the strides, so `nhwc` shares its buffer with `nchw`. In the output, `ravel` copies to show the logical NHWC order. A compiler's `Transpose` to NHWC in real memory must either copy, or be removed.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 150" role="img" aria-label="NCHW groups each channel plane in memory while NHWC groups all channels of a pixel">
  <text x="20" y="42" class="t-mono">NCHW</text>
  <rect x="90" y="20" width="192" height="34" class="d-acc"/><rect x="282" y="20" width="192" height="34" class="d-soft"/><rect x="474" y="20" width="192" height="34" class="d-key"/>
  <text x="186" y="42" text-anchor="middle" class="t-mono">0 1 2 3</text><text x="378" y="42" text-anchor="middle" class="t-mono">4 5 6 7</text><text x="570" y="42" text-anchor="middle" class="t-mono">8 9 10 11</text>
  <text x="20" y="112" class="t-mono">NHWC</text>
  <rect x="90" y="90" width="48" height="34" class="d-acc"/><rect x="138" y="90" width="48" height="34" class="d-soft"/><rect x="186" y="90" width="48" height="34" class="d-key"/>
  <rect x="234" y="90" width="48" height="34" class="d-acc"/><rect x="282" y="90" width="48" height="34" class="d-soft"/><rect x="330" y="90" width="48" height="34" class="d-key"/>
  <rect x="378" y="90" width="48" height="34" class="d-acc"/><rect x="426" y="90" width="48" height="34" class="d-soft"/><rect x="474" y="90" width="48" height="34" class="d-key"/>
  <rect x="522" y="90" width="48" height="34" class="d-acc"/><rect x="570" y="90" width="48" height="34" class="d-soft"/><rect x="618" y="90" width="48" height="34" class="d-key"/>
  <text x="114" y="112" text-anchor="middle" class="t-mono">0</text><text x="162" y="112" text-anchor="middle" class="t-mono">4</text><text x="210" y="112" text-anchor="middle" class="t-mono">8</text>
  <text x="258" y="112" text-anchor="middle" class="t-mono">1</text><text x="306" y="112" text-anchor="middle" class="t-mono">5</text><text x="354" y="112" text-anchor="middle" class="t-mono">9</text>
  <text x="402" y="112" text-anchor="middle" class="t-mono">2</text><text x="450" y="112" text-anchor="middle" class="t-mono">6</text><text x="498" y="112" text-anchor="middle" class="t-mono">10</text>
  <text x="546" y="112" text-anchor="middle" class="t-mono">3</text><text x="594" y="112" text-anchor="middle" class="t-mono">7</text><text x="642" y="112" text-anchor="middle" class="t-mono">11</text>
  <text x="90" y="144" class="t-small">Colours mark channels. The numbers are the values from the program above.</text>
</svg></div><figcaption><b>Same values, different order.</b> NCHW keeps each channel contiguous. NHWC keeps each pixel contiguous.</figcaption></figure>

Neither is always faster. It depends on how the kernel or the hardware walks the data: which loop is innermost, what the SIMD width is, and how the accelerator feeds its units. An NPU often mandates a particular layout, sometimes a blocked one. Converting a PyTorch model for an NHWC target wraps layers in `Transpose` nodes, and a layout pass then pushes these through elementwise ops and cancels pairs. Weight layouts also differ: ONNX `Conv` weights are `[out, in, kH, kW]`, and TFLite `CONV_2D` weights are `[out, kH, kW, in]`.

:::trap
Changing layout changes axis attributes too. A `Concat` on axis 1 in NCHW is on axis 3 in NHWC, and a `Mean` or `Softmax` axis must be remapped. Models often break here silently when the sizes happen to match.
:::

## Topological order and dependencies {#ch03-topo .th}

An operator can run once all its input tensors exist. A **topological order** lists nodes so every node comes after its producers. A DAG usually has many valid orders, and they all compute the same result, but they differ in memory use and parallelism (Chapter 4). ONNX requires `node` to be sorted topologically, and its checker rejects a model that is not.

Kahn's algorithm tracks each node's count of unfinished inputs and keeps a ready list. If the ready list empties while nodes remain, the graph has a cycle. Grouping by *level* shows what could run in parallel.

```python run=cc-c03-topo
GRAPH = {"conv1": [], "relu": ["conv1"], "conv2": ["relu"], "conv3": ["relu"],
         "add": ["conv2", "conv3"], "pool": ["add"], "aux": ["relu"]}

def topo_levels(graph):
    waiting = {n: len(d) for n, d in graph.items()}
    users = {n: [m for m in graph if n in graph[m]] for n in graph}
    ready = sorted(n for n, c in waiting.items() if c == 0)
    levels, done = [], 0
    while ready:
        levels.append(ready)
        done += len(ready)
        nxt = []
        for n in ready:
            for u in users[n]:
                waiting[u] -= 1
                if waiting[u] == 0:
                    nxt.append(u)
        ready = sorted(nxt)
    if done != len(graph):
        stuck = sorted(n for n, c in waiting.items() if c > 0)
        raise ValueError(f"cycle involving {stuck}")
    return levels

print(topo_levels(GRAPH))
try:
    topo_levels({**GRAPH, "conv1": ["pool"]})
except ValueError as e:
    print(e)
```

Data edges are not the only dependencies. Ops that update state, such as an RNN's hidden state or a batch-norm in training mode, and ops that share a buffer in place need an order even without a data edge between them. Compilers call those **control dependencies**.

## Exporting from PyTorch {#ch03-export .th}

`torch.onnx.export` needs an example input. The classic exporter runs the model on it and **traces** the operations that happen. A dictionary of dynamic axes marks which sizes may vary, and everything else is fixed.

```python
# illustrative: PyTorch is not available in this site's build
import torch
model = Net().eval()                    # eval() fixes dropout and batch norm behaviour
dummy = torch.randn(1, 3, 32, 32)
torch.onnx.export(model, (dummy,), "net.onnx", opset_version=17,
                  input_names=["x"], output_names=["y"],
                  dynamic_axes={"x": {0: "batch"}, "y": {0: "batch"}})
```

Newer PyTorch versions also have an exporter based on `torch.export`, selected with `dynamo=True`. Its defaults have changed across releases, so check the documentation for your version. The tracing idea is easy to demonstrate. This toy records arithmetic on a wrapper type:

```python run=cc-c03-trace
class T:
    tape = []
    def __init__(self, value, name):
        self.value, self.name = value, name
    def _rec(self, op, other):
        o = other.name if isinstance(other, T) else other
        v = other.value if isinstance(other, T) else other
        result = T(self.value + v if op == "add" else self.value * v, f"t{len(T.tape)}")
        T.tape.append((result.name, op, self.name, o))
        return result
    def __add__(self, other): return self._rec("add", other)
    def __mul__(self, other): return self._rec("mul", other)

def model(x):
    if x.value > 0:             # Python sees a bool, the tape sees nothing
        return x * 2
    return x + 100

def replay(tape, x):
    env = {"x": x}
    for dest, op, a, b in tape:
        rhs = env.get(b, b)
        env[dest] = env[a] + rhs if op == "add" else env[a] * rhs
    return env[tape[-1][0]]

model(T(3, "x"))
print("traced with x=3:", T.tape)
print("real model at x=-5:", model(T(-5, "x")).value)
print("replay at x=-5:   ", replay(T.tape[:1], -5))
```

The Python `if` ran once, during tracing, so the recorded graph has only the branch taken for `x=3`. Replaying on `x=-5` gives a different answer from the real model, with no error raised. Real tracers warn in some of these cases, and fixes include rewriting the branch as a tensor operation such as `torch.where`, or scripting that part. The same effect turns `x.size(0)` into a fixed constant, unless the exporter records it as a shape computation.

:::trap
Three common export bugs: forgetting `model.eval()`, so dropout or batch-norm training behaviour is captured; a hard-coded batch size from tracing; and an operator or opset the target runtime does not support. Always compare exported outputs against the framework on a few inputs.
:::

## Graph optimisations {#ch03-opt .th}

Graph passes run before lowering, and they use the same ideas as Chapter 1 at a coarser grain:

- **Constant folding**: evaluate subgraphs with constant inputs, such as a `Shape`, `Gather` and `Concat` chain that computes a `Reshape` target.
- **DCE and identity removal**: drop unused outputs, `Identity`, and `Dropout` at inference.
- **Fusion**: combine ops into one that the kernel or hardware runs directly, such as `Conv + BatchNorm`, `Conv + Relu`, or `MatMul + Add` to `Gemm`.
- **Layout cleanup**: push and cancel `Transpose` pairs.

Fusing batch norm into a conv is pure algebra. BN computes `gamma * (y - mean) / sqrt(var + eps) + beta` per output channel, and `y` is linear in its input. So scale each output channel's weights by `gamma / sqrt(var + eps)`, and adjust its bias. Here a dense layer stands in for the conv, since the algebra per output channel is the same.

```python run=cc-c03-bn-fold
import numpy as np

rng = np.random.default_rng(7)
W, b = rng.normal(size=(4, 6)), rng.normal(size=4)          # 6 inputs, 4 outputs
gamma, beta = rng.normal(size=4), rng.normal(size=4)
mean, var, eps = rng.normal(size=4), rng.uniform(0.5, 2, size=4), 1e-5
x = rng.normal(size=(10, 6))

y = x @ W.T + b
slow = gamma * (y - mean) / np.sqrt(var + eps) + beta

k = gamma / np.sqrt(var + eps)
W2, b2 = W * k[:, None], k * (b - mean) + beta
fast = x @ W2.T + b2

print("max difference below 1e-12:", np.abs(slow - fast).max() < 1e-12)
print("ops:", 2, "->", 1, "| parameters:", W.size + b.size + 4 * 4, "->", W2.size + b2.size)
```

A fusion is only legal if nothing else reads the intermediate tensor. The pass below fuses `Conv` and `Relu` only when the `Relu` is the conv's only consumer.

```python run=cc-c03-fusion
NODES = [("c1", "Conv", ["x"]), ("r1", "Relu", ["c1"]),
         ("c2", "Conv", ["r1"]), ("r2", "Relu", ["c2"]), ("skip", "Add", ["c2", "r2"])]

def fuse(nodes):
    users = {}
    for name, _, args in nodes:
        for a in args:
            users.setdefault(a, []).append(name)
    by_name = {n[0]: n for n in nodes}
    out, removed = [], set()
    for name, op, args in nodes:
        if name in removed:
            continue
        next_user = users.get(name, [])
        if op == "Conv" and len(next_user) == 1 and by_name[next_user[0]][1] == "Relu":
            relu = next_user[0]
            out.append((relu, "ConvRelu", args))    # keeps the Relu's output name
            removed.add(relu)
        else:
            if op == "Conv":
                print(f"cannot fuse {name}: read by {next_user}")
            out.append((name, op, args))
    return out

print(fuse(NODES))
```

## Drills {#ch03-drills .dr}

:::drill concept
What does an ONNX opset version pin, and why does it matter?
---
**Answer.** The exact definition of each operator: its inputs, attributes and semantics.

**Why.** Operators change between opsets. For example, some attributes moved to inputs (`Squeeze` axes moved in opset 13). A runtime supports a range of opsets, so a model exported at a newer one may fail to load.
:::

:::drill output
What does this print, and which line is likely a bug in real code?

```python run=cc-c03-d-broadcast
import numpy as np
pred = np.arange(3.0)
target = np.arange(3.0).reshape(3, 1)
print((pred - target).shape)
print(((pred - target) ** 2).mean(), ((pred - target.ravel()) ** 2).mean())
```
---
**Answer.** `pred - target` has shape `(3, 3)`, and its mean squared value is not zero, even though both tensors hold the same values. The corrected loss is 0.

**Why.** `(3,)` aligns with the last axis of `(3, 1)`, so both axes stretch. This silently trains on a wrong loss, and is one of the most common shape bugs.
:::

:::drill concept
Use the formula to find the output height of a conv with input 32, kernel 3, stride 2, pad 1. Then the same with pad 0.
---
**Answer.** `floor((32 + 2 - 2 - 1) / 2) + 1 = 15 + 1 = 16`. With no pad, `floor((32 - 2 - 1) / 2) + 1 = 14 + 1 = 15`.

**Why.** Pad 1 with kernel 3 preserves size at stride 1, and at stride 2 it halves an even input. Knowing this avoids drawing the whole network to check a shape.
:::

:::drill tricky
A `Reshape` has target shape `(-1, 16)` and input `[N, 16, 1, 1]`. What is the output, and can a compiler give it a static shape if `N` is unknown?
---
**Answer.** `[N, 16]`. Symbolically that is exact, but no fixed byte size is known until `N` is known.

**Why.** Many accelerator compilers require static shapes for memory planning, so they ask you to fix the batch size. The `-1` is resolved by dividing the total number of elements by the known dimensions.
:::

:::drill output
What do these print? The second line converts a permutation to its inverse.

```python run=cc-c03-d-perm
import numpy as np
x = np.zeros((2, 3, 4, 5))
perm = (0, 2, 3, 1)
print(x.transpose(perm).shape)
inv = tuple(np.argsort(perm).tolist())
print(inv, x.transpose(perm).transpose(inv).shape)
```
---
**Answer.** `(2, 4, 5, 3)`, then inverse `(0, 3, 1, 2)` restores `(2, 3, 4, 5)`.

**Why.** NCHW to NHWC is `(0, 2, 3, 1)`, and NHWC to NCHW is `(0, 3, 1, 2)`. Their composition is the identity, which is what the cancel pass checks.
:::

:::drill concept
Name a reason a model might get slower after conversion to NHWC, even though the target "prefers" NHWC.
---
**Answer.** Leftover `Transpose` nodes that copy tensors, especially around ops that do not support the layout.

**Why.** Each one costs memory bandwidth and may double the buffers alive at that point. A good pass pushes them towards the graph's edges and cancels them.
:::

:::drill bug
This fusion is wrong for some graphs. Find the case.

```python
# rewrite: Conv(x) -> c, BatchNorm(c) -> y    becomes    FusedConv(x) -> y
for conv, bn in pairs(graph):
    replace(conv, bn, fused(conv, bn))
```
---
**Answer.** It never checks that `c` has no other consumers, nor that `c` is not a graph output. If something else reads `c`, it would lose its tensor or read a changed value.

**Why.** Single-consumer checks guard almost every fusion. A correct pass either skips the fusion or duplicates the conv, which needs a cost decision.
:::

:::drill tricky
Two topological orders of the same graph can produce different outputs. True or false?
---
**Answer.** False for pure ops: every valid order computes the same values. It can be true if the graph has hidden state, or in-place ops whose ordering is not expressed by an edge.

**Why.** That is the reason for control dependencies. For floats, a change of order within one op's kernel can change rounding, but that is a different matter from the graph's order.
:::

:::drill output
What does this print? Here `g` maps each node to the nodes it depends on.

```python run=cc-c03-d-cycle
g = {"a": ["c"], "b": ["a"], "c": ["b"], "d": []}
pending = {n: len(p) for n, p in g.items()}
ready = [n for n, c in pending.items() if c == 0]
seen = []
while ready:
    n = ready.pop()
    seen.append(n)
    for m in g:
        if n in g[m]:
            pending[m] -= 1
            if pending[m] == 0:
                ready.append(m)
print(seen, len(seen) == len(g))
```
---
**Answer.** Only `d` is visited, and the check is `False`, because `a`, `b` and `c` form a cycle whose counts never reach zero.

**Why.** Kahn's algorithm detects cycles by count: visited fewer than total means a cycle exists. It does not name the exact cycle, and finding that takes an extra walk.
:::

:::drill concept
Why does TFLite store weights in `buffers` and memory-map the file?
---
**Answer.** FlatBuffers can be read in place without parsing or copying, so a small device can use weights directly from flash or a mapped file.

**Why.** Reduced peak RAM and start-up time matter on phones and microcontrollers. ONNX's protobuf normally needs parsing, and large models use external data files because protobuf has a 2 GB limit.
:::

:::drill concept
Why must dropout and batch norm be treated specially during export?
---
**Answer.** They behave differently in training and inference. `model.eval()` makes dropout a no-op, and makes batch norm use its running statistics.

**Why.** Tracing records what runs, so a train-mode export bakes in sampling and per-batch statistics. After `eval()`, an optimiser can remove the dropout and fold the batch norm.
:::

:::drill tricky
A graph has the node `Reshape(x, Concat(Gather(Shape(x), 0), Constant(-1)))`. Can you constant fold it? What changes if the input size is fixed?
---
**Answer.** With an unknown batch size, the `Shape` is not constant, so only the `Constant` is known. With a fixed input shape, `Shape(x)` becomes a constant, the whole chain folds, and `Reshape` gets a literal target.

**Why.** This is why fixing input shapes before simplification makes exported graphs much smaller. It is a large part of what tools like `onnx-simplifier` do.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1300
Write a layout pass: given a list of ops, push `Transpose` through unary elementwise ops, and cancel adjacent pairs whose permutations compose to the identity. Print the result for `T(perm) → Relu → T(inv) → Conv`.
---
Move each `Transpose` later past a unary op, then look for two neighbours that cancel.

```python run=cc-c03-c-transpose
UNARY = {"Relu", "Clip", "Sigmoid"}

def compose(p, q):
    return tuple(p[i] for i in q)

def simplify(ops):
    changed = True
    while changed:
        changed = False
        for i in range(len(ops) - 1):
            a, b = ops[i], ops[i + 1]
            if a[0] == "T" and b[0] in UNARY:
                ops[i], ops[i + 1] = b, a
                changed = True
            elif a[0] == "T" and b[0] == "T":
                p = compose(a[1], b[1])
                ops[i:i + 2] = [] if p == tuple(range(len(p))) else [("T", p)]
                changed = True
                break
    return ops

print(simplify([("T", (0, 2, 3, 1)), ("Relu",), ("T", (0, 3, 1, 2)), ("Conv",)]))
print(simplify([("T", (0, 2, 3, 1)), ("Relu",), ("Conv",)]))
```

The second case shows the limit: a `Conv` is not movable, so one `Transpose` remains before it. Unary elementwise ops are safe to pass since they treat every element independently, and ops with axes need their axes remapped.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Graph: DAG of ops (nodes) and tensors (edges). Mostly pure, which makes reordering safe.
- ONNX: protobuf, opset versioned, `node`, `initializer`, `input`, `output`. Nodes must be topologically sorted. Default layout NCHW.
- TFLite: FlatBuffers, memory-mappable, `operators` in execution order, quantization on tensors, fused activations. Default layout NHWC.
- Conv size: `floor((in + pads - dilation*(k-1) - 1)/stride) + 1`. `SAME`: `ceil(in/stride)`.
- Broadcasting: align right, sizes equal or one is 1. `(3,)` with `(3,1)` gives `(3,3)`.
- NCHW keeps channel planes together, NHWC keeps pixels together. NCHW to NHWC is `(0,2,3,1)`, inverse `(0,3,1,2)`. Remap axis attributes.
- Kahn's algorithm: ready list, cycle if not all are visited. Many valid orders, and they differ in memory use.
- Tracing freezes Python control flow and sizes. Call `model.eval()`. Compare outputs after export.
- Optimise: fold constants, DCE, fuse (`Conv + BN` is algebra), cancel transposes. Fusion needs a single consumer.
