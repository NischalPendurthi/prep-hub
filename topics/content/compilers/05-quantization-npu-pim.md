---
title: Quantization and NPU / processing-in-memory dataflow
part: Part C · The hardware end
lede: Most accelerators run integer arithmetic. This chapter derives the scale and zero-point mapping, builds a quantized multiply that uses no floating point at run time, and checks it against the real result. It then explains overflow in MAC accumulators, NPU structure and systolic arrays, a general model of processing-in-memory with its constraints, and how bit-exact simulators and verification against a reference keep a compiler honest.
desc: fixed point, scale and zero point, per-channel, quantized MAC, overflow, NPU basics, systolic arrays, dataflow, processing-in-memory, bit-exact simulators, verification
hours: 5
prereqs: Chapter 3 (graphs), Chapter 4 (lowering), two's complement, matrix multiplication
---

## Fixed point, scale and zero point {#ch05-affine .th}

**Fixed point** stores a real number as an integer with an implied scale. The format Q1.7 uses an int8 with 7 fractional bits, so the stored value 64 means `64 / 2^7 = 0.5`. Integer adders and multipliers are small and need little energy, so accelerators prefer them to floating-point units.

Neural network quantization generalises this with an **affine** mapping. It has a real-valued **scale** `S` and an integer **zero point** `Z`:

`r = S * (q - Z)`, so `q = clamp(round(r / S) + Z)`.

The zero point is the integer that represents real 0.0 exactly. That matters because zero occurs constantly (padding, ReLU outputs, sparse values), and its error would otherwise spread. Given a calibrated range, choose `S` to span it, extend the range so it includes 0, and round `Z`.

```python run=cc-c05-affine
def qparams(lo, hi, qmin=-128, qmax=127):
    lo, hi = min(lo, 0.0), max(hi, 0.0)
    scale = (hi - lo) / (qmax - qmin)
    zero = round(qmin - lo / scale)
    return scale, max(qmin, min(qmax, zero))

scale, zero = qparams(-1.0, 3.0)
print(f"scale={scale:.6f} zero_point={zero}")

def quant(r):
    return max(-128, min(127, round(r / scale) + zero))

def dequant(q):
    return scale * (q - zero)

for r in [0.0, 0.5, 1.0, 3.0, -1.0, 5.0, -2.0]:
    q = quant(r)
    print(f"r={r:5} q={q:5} back={dequant(q):8.5f} error={abs(dequant(q) - r):.5f}")
print("half a step:", round(scale / 2, 5))
print("range excludes 0:", qparams(2.0, 6.0)[1], "zero point for [2, 6]")
```

Inside the range, the error is at most half a step (`S / 2`). Outside it, values **saturate**, as 5.0 and -2.0 show, and the error can be large. So a single outlier during calibration wastes resolution by stretching the range, and clipping to a percentile is a common defence. The last line shows a range that does not contain zero being extended to do so.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 130" role="img" aria-label="A number line mapping the real range from minus one to three onto int8 values, with real zero at the zero point">
  <line x1="60" y1="40" x2="660" y2="40" class="d-line"/><text x="10" y="44" class="t-small">real</text>
  <line x1="60" y1="96" x2="660" y2="96" class="d-line"/><text x="10" y="100" class="t-small">int8</text>
  <line x1="60" y1="32" x2="60" y2="48" class="d-line"/><text x="60" y="24" text-anchor="middle" class="t-mono">-1.0</text>
  <line x1="210" y1="32" x2="210" y2="48" class="d-line-acc"/><text x="210" y="24" text-anchor="middle" class="t-mono t-acc">0.0</text>
  <line x1="660" y1="32" x2="660" y2="48" class="d-line"/><text x="660" y="24" text-anchor="middle" class="t-mono">3.0</text>
  <line x1="60" y1="88" x2="60" y2="104" class="d-line"/><text x="60" y="122" text-anchor="middle" class="t-mono">-128</text>
  <line x1="210" y1="88" x2="210" y2="104" class="d-line-acc"/><text x="210" y="122" text-anchor="middle" class="t-mono t-acc">Z = -64</text>
  <line x1="660" y1="88" x2="660" y2="104" class="d-line"/><text x="660" y="122" text-anchor="middle" class="t-mono">127</text>
  <path d="M60 48 L 60 88" class="d-line"/><path d="M210 48 L 210 88" class="d-line-acc"/><path d="M660 48 L 660 88" class="d-line"/>
</svg></div><figcaption><b>An affine map.</b> The real range is stretched onto the integer range, and real zero lands exactly on the integer zero point.</figcaption></figure>

### Per-tensor and per-channel

**Per-tensor** quantization uses one scale for a whole tensor. **Per-channel** (per-axis) uses one scale for each output channel of a weight tensor. Channels often have very different ranges, and a single scale set by the largest channel leaves small channels with few levels. TFLite's specification uses int8 weights with `Z = 0` (symmetric) and per-axis scales for `CONV_2D` and `DEPTHWISE_CONV_2D`, and int8 activations with a non-zero `Z` allowed.

```python run=cc-c05-perchannel
import numpy as np

small = np.linspace(-0.01, 0.01, 8)
large = np.linspace(-2.0, 2.0, 8)
weights = np.stack([small, large])

def error(w, scale):
    q = np.clip(np.round(w / scale), -127, 127)
    return np.abs(q * scale - w).max()

shared = np.abs(weights).max() / 127
print(f"per-tensor  scale={shared:.6f} small={error(small, shared):.6f} large={error(large, shared):.6f}")
for name, w in [("small", small), ("large", large)]:
    s = np.abs(w).max() / 127
    print(f"per-channel {name} scale={s:.6f} levels used={len(np.unique(np.round(w / s)))} error={error(w, s):.6f}")
print("small channel levels with shared scale:", len(np.unique(np.round(small / shared))))
```

With a shared scale, the 8 distinct values of the small channel collapse to 3 integers, and the error (about 0.007) is close to the size of the values themselves. With its own scale, the channel keeps all 8 values and the error drops to about 0.00003. The large channel sets the shared scale, so nothing changes for it.

## Quantized multiply with integers only {#ch05-qmul .th}

Suppose `r3 = r1 * r2`, with three different scales and zero points. Substitute the affine form:

`S3 (q3 - Z3) = S1 (q1 - Z1) * S2 (q2 - Z2)`, so `q3 = Z3 + M * (q1 - Z1) * (q2 - Z2)`, where `M = S1 * S2 / S3`.

Everything is an integer except `M`, and the compiler can compute `M` offline. It normalises `M` to `M0 * 2^e` with `0.5 <= M0 < 1`, and stores `M0` as a 32-bit integer in Q0.31 format. At run time, the hardware needs only a 64-bit multiply, a rounding step and a shift. The next program uses the same operation names and rounding rules as gemmlowp and TFLite's reference kernels. Python's ints are arbitrary precision, so the checks in `srdhm` are written as they would be in C.

```python run=cc-c05-qmul
import math

S1, Z1, S2, Z2, S3, Z3 = 0.02, -10, 0.05, 6, 0.1, 3

def quantize_multiplier(m):         # compile time: floats are allowed here
    frac, exp = math.frexp(m)       # m = frac * 2**exp with 0.5 <= frac < 1
    q = round(frac * 2**31)
    if q == 2**31:
        q, exp = q // 2, exp + 1
    return q, exp

def srdhm(a, b):                    # saturating rounding doubling high multiply
    if a == b == -2**31:
        return 2**31 - 1
    n = a * b + (2**30 if a * b >= 0 else 1 - 2**30)
    return abs(n) // 2**31 * (1 if n >= 0 else -1)      # C-style truncation

def rdbpot(x, shift):               # rounding divide by a power of two
    mask = (1 << shift) - 1
    remainder = x & mask
    threshold = (mask >> 1) + (1 if x < 0 else 0)
    return (x >> shift) + (1 if remainder > threshold else 0)

M0, exp = quantize_multiplier(S1 * S2 / S3)
print(f"M = {S1 * S2 / S3} = {M0} / 2^31 * 2^{exp}")

def qmul(a, b):                     # run time: integers only
    product = (a - Z1) * (b - Z2)
    scaled = rdbpot(srdhm(product, M0), -exp)
    return max(-128, min(127, scaled + Z3))

a, b = 50, -40
r1, r2 = S1 * (a - Z1), S2 * (b - Z2)
q3 = qmul(a, b)
print(f"real: {r1:.2f} * {r2:.2f} = {r1 * r2:.4f}")
print(f"integer: q3 = {q3}, which means {S3 * (q3 - Z3):.4f}")

worst, differs, saturated, ties, gap = 0.0, 0, 0, 0, 0
for a in range(-128, 128):
    for b in range(-128, 128):
        q3 = qmul(a, b)
        exact = S1 * (a - Z1) * S2 * (b - Z2)
        ideal = max(-128, min(127, round(exact / S3) + Z3))
        if q3 != ideal:
            differs += 1
            gap = max(gap, abs(q3 - ideal))
            ties += (a - Z1) * (b - Z2) % 100 == 50     # M = 1/100, so these are exactly x.5
        if -128 < ideal < 127:
            worst = max(worst, abs(S3 * (q3 - Z3) - exact))
        else:
            saturated += 1
print(f"pairs={256 * 256} differ from ideal rounding={differs} saturated={saturated}")
print(f"of those differences: exact ties={ties}, largest difference={gap} step")
print(f"worst error when not saturated: {worst:.4f} (half a step is {S3 / 2})")
```

The exhaustive check covers all 65,536 input pairs. Floats appear only when computing `M0` and `exp`, which happens once at compile time, and `qmul` itself uses integer multiplies, shifts and comparisons. Every difference from the float answer is a single step on an exact tie, such as 88.5: the integer path rounds ties away from zero, and Python's `round` goes to the even neighbour. Outside the saturated pairs, the error never exceeds half a step, as the last line shows.

:::trap
Some hardware or code uses a plain right shift, without rounding. That is a floor, which biases every result towards negative infinity. The bias is small for each op, but it adds up through a network. Any simulator must match the exact rounding rule, including what happens at ties.
:::

## MAC arithmetic and overflow {#ch05-mac .th}

A convolution or dense layer is a sum of products. Write the output as `y = M * (sum of w_i * (x_i - Zx) + bias) + Zy` with `Zw = 0` for symmetric weights. The bias is stored as int32 with `Z = 0`, and scale `Sx * Sw`, so that it adds directly to the accumulator. Each output channel with per-channel weights has its own `M`.

The accumulator must be wide enough. With `Zx = -128`, `x - Zx` reaches 255. With symmetric int8 weights, `|w| <= 127`. So one product can reach `255 * 127 = 32385`, which needs 16 bits, and a sum of many products needs more.

```python run=cc-c05-mac
Sx, Zx, Sw, Sy, Zy = 0.02, -128, 0.01, 0.15, -20
w = [127, -90, 45, 60, -12, 33, -127, 88]
x = [120, -100, 30, 127, -128, 5, -60, 77]
bias_real = 0.25
bias = round(bias_real / (Sx * Sw))

acc = bias
for wi, xi in zip(w, x):
    acc += wi * (xi - Zx)

real = sum((Sw * wi) * (Sx * (xi - Zx)) for wi, xi in zip(w, x)) + bias_real
y = max(-128, min(127, round(acc * (Sx * Sw / Sy)) + Zy))    # requantize (float here for brevity)
print(f"accumulator={acc} bias={bias}")
print(f"real={real:.4f} quantized means {Sy * (y - Zy):.4f}, q={y}")

def wrap16(v):
    return (v + 2**15) % 2**16 - 2**15

def sat16(v):
    return max(-2**15, min(2**15 - 1, v))

wrapped = saturated = bias
wrapped, saturated = wrap16(wrapped), sat16(saturated)
for wi, xi in zip(w, x):
    p = wi * (xi - Zx)
    wrapped, saturated = wrap16(wrapped + p), sat16(saturated + p)
print("16-bit wrap:", wrapped, "16-bit saturate:", saturated, "true:", acc)

worst = 255 * 127
for bits in (16, 24, 32):
    print(f"{bits}-bit signed accumulator: up to {(2**(bits - 1) - 1) // worst} worst-case products")
```

With a 16-bit accumulator, one worst-case product fits and two may not. The wrapped value has no relation to the true one. Saturation stays in range, but it is still wrong. Hardware designs choose accumulator width from the largest kernel and layer they must support, and the compiler checks that a layer cannot exceed it or splits the accumulation.

**Quantized add needs rescaling.** `Add` looks simpler than `Mul`, and in integers it is harder: `S1(q1 - Z1) + S2(q2 - Z2)` has two different scales. Each input must be rescaled to a common scale before adding, and then the sum is rescaled to the output's. That is two or three multiplier-and-shift steps, against one for `Mul`.

## NPU basics, systolic arrays and dataflow {#ch05-npu .th}

An NPU is a specialised processor that has few control decisions and many multipliers. A common structure, in general terms: a host writes a **command list** produced by the compiler, a **MAC array** does the main work, dedicated units handle elementwise ops, pooling and activation lookups, **on-chip SRAM** holds tensors and weights, and **DMA** engines move data to and from external DRAM. The planner from Chapter 4 decides what lives in SRAM. Performance often depends more on memory movement than on multiplier count, since a multiplier that waits for data does nothing.

A **systolic array** is a grid of processing elements (PEs) connected to neighbours. Each cycle, a PE takes input from one side, does a MAC, and passes results on. Data pulses through the grid, hence the name. Short neighbour links keep wires short and reuse each value many times, without going back to memory.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 230" role="img" aria-label="A two by three grid of processing elements. Activations enter from the left with row skew and move right. Partial sums start at zero on top and move down to outputs.">
  <text x="20" y="72" class="t-mono">x0 →</text><text x="20" y="152" class="t-mono">· x1 →</text>
  <rect x="110" y="40" width="110" height="60" rx="8" class="d-acc"/><text x="165" y="76" text-anchor="middle" class="t-mono">w00</text>
  <rect x="270" y="40" width="110" height="60" rx="8" class="d-acc"/><text x="325" y="76" text-anchor="middle" class="t-mono">w01</text>
  <rect x="430" y="40" width="110" height="60" rx="8" class="d-acc"/><text x="485" y="76" text-anchor="middle" class="t-mono">w02</text>
  <rect x="110" y="120" width="110" height="60" rx="8" class="d-acc"/><text x="165" y="156" text-anchor="middle" class="t-mono">w10</text>
  <rect x="270" y="120" width="110" height="60" rx="8" class="d-acc"/><text x="325" y="156" text-anchor="middle" class="t-mono">w11</text>
  <rect x="430" y="120" width="110" height="60" rx="8" class="d-acc"/><text x="485" y="156" text-anchor="middle" class="t-mono">w12</text>
  <path d="M80 70 L 110 70" class="d-line"/><path d="M220 70 L 270 70" class="d-line"/><path d="M380 70 L 430 70" class="d-line"/>
  <path d="M80 150 L 110 150" class="d-line"/><path d="M220 150 L 270 150" class="d-line"/><path d="M380 150 L 430 150" class="d-line"/>
  <path d="M165 20 L 165 40" class="d-line-key"/><path d="M325 20 L 325 40" class="d-line-key"/><path d="M485 20 L 485 40" class="d-line-key"/>
  <path d="M165 100 L 165 120" class="d-line-key"/><path d="M325 100 L 325 120" class="d-line-key"/><path d="M485 100 L 485 120" class="d-line-key"/>
  <path d="M165 180 L 165 205" class="d-line-key"/><path d="M325 180 L 325 205" class="d-line-key"/><path d="M485 180 L 485 205" class="d-line-key"/>
  <text x="165" y="14" text-anchor="middle" class="t-small">0</text><text x="325" y="14" text-anchor="middle" class="t-small">0</text><text x="485" y="14" text-anchor="middle" class="t-small">0</text>
  <text x="165" y="222" text-anchor="middle" class="t-small">y0</text><text x="325" y="222" text-anchor="middle" class="t-small">y1</text><text x="485" y="222" text-anchor="middle" class="t-small">y2</text>
  <text x="560" y="76" class="t-small">x moves right</text><text x="560" y="156" class="t-small">sums move down</text>
</svg></div><figcaption><b>Weight-stationary array.</b> Weights stay in the PEs. Row 1 receives its input one cycle after row 0, so a partial sum arrives from above in step with the matching input.</figcaption></figure>

The program is a register-level simulation of this design. Each PE updates its registers from its neighbours' values in the previous cycle. Input row `i` is delayed by `i` cycles, the **skew** that keeps sums and inputs in step. It checks the result against NumPy.

```python run=cc-c05-systolic
import numpy as np

W = np.array([[1, 2, 3], [4, 5, 6]])            # R=2 rows, C=3 columns of PEs
A = np.array([[1, 0], [0, 1], [2, 3], [5, -1]])  # 4 input vectors of length R
R, C = W.shape
n = len(A)
a_reg = np.zeros((R, C), dtype=int)             # activation moving right
s_reg = np.zeros((R, C), dtype=int)             # partial sum moving down
out = np.zeros((n, C), dtype=int)
cycles = n + R + C - 2

for t in range(cycles):
    new_a, new_s = np.zeros_like(a_reg), np.zeros_like(s_reg)
    for i in range(R):
        for j in range(C):
            if j == 0:
                k = t - i                       # skew: row i starts i cycles late
                in_a = A[k, i] if 0 <= k < n else 0
            else:
                in_a = a_reg[i, j - 1]
            in_s = 0 if i == 0 else s_reg[i - 1, j]
            new_a[i, j] = in_a
            new_s[i, j] = in_s + in_a * W[i, j]
    a_reg, s_reg = new_a, new_s
    for j in range(C):
        k = t - (R - 1) - j                     # which input is finishing here
        if 0 <= k < n:
            out[k, j] = s_reg[R - 1, j]

print(out.tolist())
print("matches A @ W:", np.array_equal(out, A @ W))
print("cycles", cycles, "MAC operations", n * R * C, "PEs", R * C)
print(f"utilisation {n * R * C / (cycles * R * C):.2f}")
```

The final utilisation is below 1 because some cycles only fill or drain the array. A longer stream brings it closer to 1, and short streams pay more for skew.

**Dataflow** names what stays still in a PE, and hence which value is reused locally:

| Dataflow | Stays in PE | Reuses | Note |
|---|---|---|---|
| Weight-stationary | Weights | Each weight across many activations | The design above |
| Output-stationary | Partial sums | Accumulations in place | Fewer partial sum writes to memory |
| No local reuse | Nothing | Nothing locally, larger shared buffer | Simple PEs |

The compiler has to know the array's dataflow to choose how to tile a layer, since the best mapping of loop dimensions to rows and columns depends on it. Some designs are configurable, which adds a mapping search.

## Processing-in-memory: a general model {#ch05-pim .th}

This section describes a **general model**. Real processing-in-memory (PIM) chips differ widely in memory technology, cell precision and how much is digital, so check any specific design's documentation. The idea is to compute where the data is stored, to reduce movement between memory and compute. In an **analog crossbar**, weights are stored as cell conductances, inputs are applied as voltages on rows, and the current summed on each column is the dot product, following Ohm's and Kirchhoff's laws. An ADC digitises the column value. **Digital PIM** places logic beside the memory cells and does bit-level operations in parallel.

Common constraints, and what they mean for a compiler:

- **Limited cell precision.** A cell may hold a few bits, so a weight is **bit-sliced** over several cells, and results are combined by shifting and adding.
- **Bit-serial inputs.** A simple driver applies one input bit per step, so more input bits mean more steps.
- **ADC resolution.** Too few bits clip the column sum, and more bits cost area and energy. The rows that can be active together may be limited for this reason.
- **Signed values.** Conductance cannot be negative, so designs use pairs of cells or an offset.
- **Non-idealities.** Analog designs have noise, drift and device variation, so results may differ from the ideal and need calibration or retraining.
- **Costly writes.** Programming weights can be slow and wear cells out, so a compiler avoids rewriting them and places weights in arrays ahead of time.
- **Fixed array size.** Large layers are split across arrays, with partial results moved and added digitally. Scheduling then works at the level of whole arrays.

The model below is ideal apart from ADC clipping, with no noise. It does an 8-bit matrix-vector multiply on 2-bit cells with 1-bit inputs, and shows how result accuracy depends on ADC bits.

```python run=cc-c05-crossbar
import numpy as np

W = (np.arange(64).reshape(8, 8) * 37) % 256    # 8-bit unsigned weights
x = (np.arange(8) * 29) % 256                   # 8-bit unsigned inputs
CELL_BITS, WEIGHT_BITS, INPUT_BITS = 2, 8, 8
slices = WEIGHT_BITS // CELL_BITS
rows = W.shape[0]
max_sum = rows * (2**CELL_BITS - 1)
print("cells per weight", slices, "largest column sum", max_sum)

def crossbar(W, x, adc_bits):
    total = np.zeros(W.shape[1], dtype=np.int64)
    limit = 2**adc_bits - 1
    conversions = seen = 0
    for b in range(INPUT_BITS):
        bit = (x >> b) & 1
        for s in range(slices):
            cell = (W >> (CELL_BITS * s)) & (2**CELL_BITS - 1)
            column = bit @ cell                 # the analog sum in this model
            total += np.minimum(column, limit).astype(np.int64) << (b + CELL_BITS * s)
            conversions += len(column)
            seen = max(seen, column.max())
    return total, conversions, seen

for adc in (2, 3, 4, 5):
    got, conversions, seen = crossbar(W, x, adc)
    exact = x @ W
    worst = np.abs(got - exact).max() / exact.max()
    print(f"ADC {adc} bits: match={np.array_equal(got, exact)} worst relative error={worst:.3f} "
          f"conversions={conversions} largest sum seen={seen}")

W_max, x_max = np.full_like(W, 255), np.full_like(x, 255)
for adc in (4, 5):
    got, _, seen = crossbar(W_max, x_max, adc)
    print(f"all-ones data, ADC {adc} bits: match={np.array_equal(got, x_max @ W_max)} largest sum seen={seen}")
```

The largest possible sum is 24, which needs 5 bits to be exact for any data. These particular values never exceed the 4-bit limit, so 4 bits happen to be enough for them, and the all-ones case shows that 4 bits fail once the data reaches the worst case. How much a lower resolution loses depends on the data, so a real design may accept some loss, and train the network to tolerate it.

## Bit-exact simulators and verification {#ch05-verify .th}

A **bit-exact simulator** produces the same integer in every tensor as the hardware does. It need not model timing. A **cycle-accurate** simulator also models timing, and is much slower. Compiler teams rely on bit-exact models because hardware is expensive or unavailable, and because a tiny rounding difference can cause a large accuracy loss that is otherwise hard to trace.

Verification compares against a **reference** at each level:

1. Float model against quantized reference: compare accuracy on a dataset, and tolerate differences.
2. Quantized reference (such as reference integer kernels) against bit-exact simulator: results must match exactly, for every tensor.
3. Simulator against RTL or silicon: match exactly on directed and random vectors.

When outputs disagree, dump every tensor and find the **first op that diverges**. Everything after it is a consequence. Good test vectors include extremes (`-128`, `127`, the zero point), rounding ties, saturation cases and random values from a fixed seed. The next example does this in miniature: a Python reference and a C simulator read the same vectors, then a planted bug shows what a mismatch report looks like.

```bash run=cc-c05-cosim
cat > ref.py <<'PY'
import math, sys
S1, Z1, S2, Z2, S3, Z3 = 0.02, -10, 0.05, 6, 0.1, 3
frac, exp = math.frexp(S1 * S2 / S3)
M0, shift = round(frac * 2**31), -exp
if sys.argv[1] == "params":
    print(M0, shift, Z1, Z2, Z3)
elif sys.argv[1] == "vectors":
    x = 12345
    for _ in range(5000):
        x = (x * 1103515245 + 12345) & 0x7fffffff
        print((x >> 8 & 255) - 128, (x >> 16 & 255) - 128)
else:
    for line in sys.stdin:
        a, b = map(int, line.split())
        ab = (a - Z1) * (b - Z2) * M0
        n = ab + (2**30 if ab >= 0 else 1 - 2**30)
        v = abs(n) // 2**31 * (1 if n >= 0 else -1)
        mask = (1 << shift) - 1
        v = (v >> shift) + ((v & mask) > (mask >> 1) + (v < 0))
        print(max(-128, min(127, v + Z3)))
PY
cat > sim.c <<'C'
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
int main(int argc, char **argv) {
    int32_t M0 = atoi(argv[1]); int shift = atoi(argv[2]);
    int Z1 = atoi(argv[3]), Z2 = atoi(argv[4]), Z3 = atoi(argv[5]), a, b;
    while (scanf("%d %d", &a, &b) == 2) {
        int64_t ab = (int64_t)((a - Z1) * (b - Z2)) * M0;
        int32_t v = (int32_t)((ab + (ab >= 0 ? (1LL << 30) : 1 - (1LL << 30))) / (1LL << 31));
#ifdef BUG
        v = v >> shift;                 /* floor, no rounding */
#else
        int32_t mask = (1 << shift) - 1;
        v = (v >> shift) + ((v & mask) > (mask >> 1) + (v < 0));
#endif
        int r = v + Z3;
        printf("%d\n", r > 127 ? 127 : r < -128 ? -128 : r);
    }
    return 0;
}
C
python3 ref.py vectors > vec.txt
python3 ref.py golden < vec.txt > golden.txt
P=$(python3 ref.py params)
gcc -std=c17 -O1 -Wall -o sim sim.c && gcc -std=c17 -O1 -Wall -DBUG -o sim_bug sim.c
./sim $P < vec.txt > out.txt
./sim_bug $P < vec.txt > out_bug.txt
report() {
    paste vec.txt golden.txt "$1" | awk -v name="$2" '
        $3 != $4 { if (!bad) first = "line " NR ": a=" $1 " b=" $2 " ref=" $3 " sim=" $4; bad++ }
        END { printf "%s: %d vectors, %d mismatches %s\n", name, NR, bad + 0, first }'
}
report out.txt "correct build"
report out_bug.txt "planted bug"
```

## Drills {#ch05-drills .dr}

:::drill concept
Why must real 0.0 map exactly to an integer?
---
**Answer.** Zero is everywhere: padding, ReLU output, and sparse weights. If 0.0 mapped to, say, an offset of 0.3 of a step, each of them would add error to every sum.

**Why.** An exact zero also makes a zero-padded input cheap and keeps "no effect" operations truly without effect.
:::

:::drill output
Find `q` for `r = 1.0`, `S = 0.5`, `Z = 10`, then `r = 100.0`. What does this print?

```python run=cc-c05-d-q
def q(r, s, z):
    return max(-128, min(127, round(r / s) + z))
print(q(1.0, 0.5, 10), q(100.0, 0.5, 10), q(-0.25, 0.5, 10), q(-0.75, 0.5, 10))
```
---
**Answer.** `1 / 0.5 + 10 = 12`. For 100, the result saturates at 127. The last two involve ties: `round(-0.5)` is `0` and `round(-1.5)` is `-2`, so they give 10 and 8.

**Why.** Python rounds halves to the nearest even number, while the gemmlowp rule rounds them away from zero. A reference and a simulator that use different tie rules will disagree on exactly these values.
:::

:::drill tricky
What is a quantized ReLU, in integers?
---
**Answer.** `max(q, Z)`: real 0.0 is the zero point, so clamping at `Z` is the whole operation. ReLU6 also clamps above at `Z + round(6 / S)`.

**Why.** This is the reason activations can be fused: they can be a clamp in the output stage of the previous op. If the output range is calibrated to start at 0, the clamp may do nothing, and the op can be removed.
:::

:::drill concept
Why is the int32 bias's scale `Sx * Sw`, and why is its zero point 0?
---
**Answer.** The accumulator sums products `w (x - Zx)`, and they have scale `Sx * Sw`. A bias on the same scale can be added directly.

**Why.** Any other scale would need a rescale per bias, which defeats the purpose. With 32 bits, precision is more than enough for bias values.
:::

:::drill tricky
Why are weights usually symmetric (`Z = 0`), and activations asymmetric?
---
**Answer.** With `Zw = 0`, the term `w (x - Zx)` needs no extra subtraction on `w`, which saves work in the MAC array. Activations are often one-sided (ReLU outputs are nonnegative), so an asymmetric range uses the 8 bits better.

**Why.** Otherwise the full expansion has cross terms, such as `Zw * sum(x)`. Weight distributions are usually near zero-centred, so symmetry loses little.
:::

:::drill bug
Spot the bug in this C simulator's rounding.

```c
int32_t round_shift(int32_t v, int s) {
    return (v + (1 << (s - 1))) >> s;
}
```
---
**Answer.** It rounds ties upward, and it can overflow when `v` is near `INT32_MAX`, which is undefined behaviour for signed ints. It also breaks for `s == 0`, since `1 << -1` is undefined.

**Why.** Rounding here differs from the "away from zero" rule on negative ties, so it may not match a reference. A simulator must follow the specification's exact rule. Compile test builds with `-fsanitize=undefined`.
:::

:::drill concept
Name the three kinds of error a quantized network has, and how each is reduced.
---
**Answer.** Rounding error (reduced with more bits or per-channel scales), clipping error (better ranges, fewer outliers), and accumulated bias from rounding and range mismatch (bias correction, quantization-aware training).

**Why.** Post-training quantization only calibrates ranges. Quantization-aware training simulates rounding during training, so the weights adapt to it.
:::

:::drill output
How many worst-case MACs fit in a 32-bit accumulator if `x - Zx` reaches 255 and `|w| <= 127`? And if weights reach -128 (asymmetric int8, with `Zw = 0` kept)? Check.

```python run=cc-c05-d-acc
for w in (127, 128):
    print(w, 255 * w, (2**31 - 1) // (255 * w))
```
---
**Answer.** About 66 thousand in the first case, a little fewer in the second.

**Why.** One reason TFLite's weights are limited to `[-127, 127]` is that `-128 * -128` and similar corner cases are avoided in optimised kernels. A layer's maximum MAC count per output sets the accumulator's required width.
:::

:::drill tricky
A systolic array's input streams are not skewed. What happens?
---
**Answer.** The partial sum from the upper PE arrives one cycle after the matching input has already moved on, so a PE multiplies the wrong activation and adds it to the wrong sum. The output is wrong, and no error is reported.

**Why.** Skew pairs a row's input with the partial sum that has travelled down to it. The drain time is the cost of this pipeline, as the utilisation line in the program shows.
:::

:::drill concept
Why might a compiler for an analog crossbar avoid rewriting weights between layers?
---
**Answer.** Writing cells can be slow and may wear them. So weights are placed once, and each layer's data is routed to the arrays holding that layer's weights.

**Why.** This reverses the usual setup: tensors move to fixed weight locations. The schedule becomes a placement and routing problem across arrays. In the general model, this is the main reason for mapping decisions at compile time.
:::

:::drill concept
In this chapter's crossbar model, how many ADC bits are needed for exact results with 32 active rows, 2-bit cells and 1-bit inputs?
---
**Answer.** The largest column sum is `32 * 3 = 96`, which needs 7 bits (`2^7 - 1 = 127 >= 96`, and `2^6 - 1 = 63 < 96`).

**Why.** Reducing active rows per conversion cuts the ADC requirement, at a cost of more conversions. This trade is why some designs activate only part of an array at a time.
:::

:::drill bug
Two runs of a simulator give different outputs on the same model and input. List likely causes.
---
**Answer.** Uninitialised memory, an unseeded random generator, reliance on hash or pointer order, thread races, signed overflow (UB), and use of floats whose rounding can vary with compiler flags or fused multiply-add.

**Why.** A bit-exact model needs integer-only arithmetic with fixed widths, deterministic order, and no undefined behaviour. Reproducibility is a requirement, since a diff is the only way to find the first divergent op.
:::

:::drill tricky
A model's float and quantized accuracy differ by a lot, and the bit-exact simulator matches the reference kernels. Where do you look next?
---
**Answer.** The simulator is doing its job, so the loss comes from the quantization itself. Look at calibration ranges, outliers, and layers with low output resolution. Compare float and quantized tensors layer by layer, and find the first layer with a large error.

**Why.** Fixes include per-channel scales, 16-bit precision for sensitive layers, better calibration data, or quantization-aware training.
:::

## Write the code {#ch05-coding .cd}

:::drill code rating=1400
Write a function `requantize(acc, M)` in C with integer-only run-time arithmetic, then test it on a value where a rounding bug would show. Use 32-bit input, Q0.31 multiplier and a rounding right shift.
---
Compute the multiplier first, by hand or at compile time, and use the same operations as the chapter.

```c run=cc-c05-c-requant
#include <stdint.h>
#include <stdio.h>

static int32_t srdhm(int32_t a, int32_t b) {
    if (a == INT32_MIN && b == INT32_MIN) return INT32_MAX;
    int64_t ab = (int64_t)a * b;
    int64_t nudge = ab >= 0 ? (1LL << 30) : 1 - (1LL << 30);
    return (int32_t)((ab + nudge) / (1LL << 31));
}

static int32_t rdbpot(int32_t x, int shift) {
    int32_t mask = (int32_t)((1U << shift) - 1);
    int32_t rem = x & mask;
    int32_t threshold = (mask >> 1) + (x < 0);
    return (x >> shift) + (rem > threshold);
}

static int32_t requantize(int32_t acc, int32_t m0, int shift, int32_t zp) {
    int32_t v = rdbpot(srdhm(acc, m0), shift) + zp;
    return v > 127 ? 127 : v < -128 ? -128 : v;
}

int main(void) {
    /* M = 0.125 = 0.5 * 2^-2, so m0 = 2^30 and shift = 2 */
    int32_t m0 = 1 << 30;
    int cases[] = {8, 12, 20, -4, -12, -20, 1000, -2000, 2147483647};
    for (unsigned i = 0; i < sizeof cases / sizeof *cases; i++)
        printf("%d -> %d\n", cases[i], requantize(cases[i], m0, 2, 0));
    return 0;
}
```

The ties at `12 / 8 = 1.5` and `-12 / 8 = -1.5` round away from zero, to 2 and -2. So do `20 / 8` and `-20 / 8`, to 3 and -3. `-2000` and the largest int saturate, and `1000` scales to 125, which still fits.
:::

## Cheat sheet {#ch05-cheatsheet .th}

- `r = S (q - Z)`, `q = clamp(round(r / S) + Z)`. Real 0 is exact at `Z`. Error at most `S / 2` in range, saturation outside.
- TFLite spec: int8 activations, asymmetric allowed. int8 weights, symmetric, `[-127, 127]`, per-axis for conv. int32 bias, scale `Sx * Sw`.
- Multiply: `q3 = Z3 + M (q1 - Z1)(q2 - Z2)`, `M = S1 S2 / S3`. `M = M0 * 2^e`, `M0` in Q0.31. Run time: `srdhm`, rounding shift, clamp.
- `Add` needs rescale of both inputs. Quantized ReLU is `max(q, Z)`.
- Worst product with `Zx = -128` and symmetric weights: `255 * 127`. Choose accumulator width from the largest MAC count.
- NPU: command list, MAC array, SRAM, DMA. Movement often matters more than multipliers.
- Systolic array: neighbour links, input skew, fill and drain. Dataflows: weight-stationary, output-stationary, no local reuse.
- PIM general model: crossbar dot product, bit-slicing, bit-serial input, ADC limits, signed pairs, non-idealities, costly writes, placement of fixed weights.
- Column sum bits: active rows times the cell's maximum, then `ceil(log2(sum + 1))`.
- Bit-exact differs from cycle-accurate. Compare per tensor, find the first divergence, test extremes and ties. Avoid UB and floats in the model.
