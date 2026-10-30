---
title: Quantization and serving with vLLM or TGI
part: Part C · Running it for users
lede: A trained model is a large file, and serving it means fitting it in memory and sharing a GPU among many requests. This chapter works through quantization formats, the memory arithmetic for weights and the KV cache, flash attention, continuous batching, PagedAttention and speculative decoding, and finishes with the metrics and cost estimates that interviewers expect you to compute on the spot.
desc: GPTQ, AWQ, GGUF, bytes per weight, flash attention, batching, continuous batching, KV-cache memory, PagedAttention, speculative decoding, TTFT, tokens per second, latency vs throughput, autoscaling, cost
hours: 6
prereqs: Chapter 1 (attention, KV cache, sampling), Chapter 2 (NF4 and quantized weights)
---

## Quantization formats {#ch03-formats .th}

Quantizing stores weights in fewer bits. For LLMs this usually means **weights only**: activations and the KV cache normally stay in floating point. A 4-bit weight is a small integer plus a scale shared across a group of weights, and the runtime turns it back into a float during computation. The saving is memory. Speed can go either way, since dequantizing costs work and smaller weights cost less memory traffic.

Three names come up, and they are different kinds of thing. **GPTQ** and **AWQ** are algorithms for choosing the rounded values, and **GGUF** is a file format.

| | GPTQ | AWQ | GGUF |
|---|---|---|---|
| What it is | Post-training quantization algorithm | Post-training quantization algorithm | File format from the llama.cpp project |
| Key idea | Quantize weights in turn, and adjust the rest to compensate | Protect channels with large activations by scaling them before rounding | One file with tensors and metadata, and several quantization schemes |
| Calibration data | Yes | Yes | Depends on the scheme, often none |
| Typical home | GPU serving | GPU serving | CPUs and laptops, with optional GPU layers |
| Uses | Second-order information per layer | Activation statistics, no backward pass | Scheme names such as `Q4_K_M` describe the bits and method |

bitsandbytes NF4 from Chapter 2 is a further option. It quantizes on load with no calibration and mainly suits training. Whichever you pick, evaluate on your own task, because the quality lost at 4 bits depends on both the model and the task.

**GPTQ** works layer by layer with a small calibration set. It rounds one weight, then adjusts the weights not yet rounded to cancel as much of the error as possible, using the inverse Hessian of the layer's squared output error. The program does this for one linear layer with correlated inputs. The real method processes columns in blocks for speed, using the same update.

```python run=lm-c03-gptq
import numpy as np

def trial(seed, correlated):
    rng = np.random.default_rng(seed)
    N, n = 2000, 16
    if correlated:
        X = rng.normal(size=(N, 8)) @ rng.normal(size=(8, n)) + 0.1 * rng.normal(size=(N, n))
    else:
        X = rng.normal(size=(N, n))
    w_true = rng.normal(size=n)
    H = X.T @ X / N                                     # Hessian of the output MSE
    H = H + 0.01 * np.diag(H).mean() * np.eye(n)        # a little damping, as the method uses
    step = 2 * np.abs(w_true).max() / 15                # 16 levels

    def snap(v):
        return np.clip(np.round(v / step), -8, 7) * step

    def output_mse(w):
        return float(((X @ (w - w_true)) ** 2).mean())

    naive = snap(w_true)
    w = w_true.copy()
    Hinv = np.linalg.inv(H)                             # over the weights not yet rounded
    active = list(range(n))
    while active:
        i, rest = active[0], active[1:]
        q = snap(w[i])
        error = q - w[i]
        w[i] = q
        if rest:
            w[rest] += error * Hinv[1:, 0] / Hinv[0, 0]  # best response of the remaining weights
            Hinv = Hinv[1:, 1:] - np.outer(Hinv[1:, 0], Hinv[0, 1:]) / Hinv[0, 0]
        active = rest
    return output_mse(naive), output_mse(w), ((naive - w_true) ** 2).mean(), ((w - w_true) ** 2).mean()

print("inputs        output MSE: round  gptq-style   weight MSE: round  gptq-style   gptq wins")
for name, correlated in [("correlated", True), ("independent", False)]:
    r = np.array([trial(seed, correlated) for seed in range(20)])
    m = r.mean(axis=0)
    print(f"{name:12} {m[0]:18.3f} {m[1]:11.3f} {m[2]:19.3f} {m[3]:11.3f} {int((r[:, 1] < r[:, 0]).sum()):8}/20")
```

Both methods use the same 16-level grid. With correlated inputs, GPTQ's weights end up further from the originals while the layer's **output** gets closer, because later weights can cancel earlier rounding. With independent inputs, the Hessian is close to diagonal and there is nothing to cancel, so it gains almost nothing. Real layers have correlated inputs, and output error is what matters.

**AWQ** starts from the observation that a small fraction of channels have large activations and carry most of the output, so their rounding error matters more. It multiplies a salient channel's weights by `s`, which moves them to a finer position on the grid, then divides the incoming activations by `s`, so that the unquantized function is unchanged. It searches for the `s` that minimises output error on calibration data. In the toy, the channels with large inputs have small weights, which a shared grid would round to zero.

```python run=lm-c03-awq
import numpy as np

rng = np.random.default_rng(1)
n = 32
activation = np.ones(n)
activation[:3] = 10.0                                # three salient channels
X = rng.normal(size=(2000, n)) * activation
w = rng.normal(0, 1.0, size=n)
w[:3] = rng.normal(0, 0.05, size=3)                  # small weights on those channels

def quantize(v):
    step = 2 * np.abs(v).max() / 15
    return np.clip(np.round(v / step), -8, 7) * step

def output_mse(s):
    scale = np.ones(n)
    scale[:3] = s
    q = quantize(w * scale) / scale                  # scale up, round, undo
    return float(((X @ (q - w)) ** 2).mean())

print("  s   output MSE")
results = {s: output_mse(s) for s in (1, 2, 4, 8, 16, 32, 64)}
for s, mse in results.items():
    print(f"{s:3}  {mse:10.3f}")
best = min(results, key=results.get)
print(f"best s = {best}, error falls by a factor of {results[1] / results[best]:.1f}")
```

Output error falls as `s` rises, up to the point where the scaled salient weights set the grid's range. Past that point, the grid gets coarser for all other weights. That trade-off is why the method searches for `s`. In the real method, the division by `s` is absorbed into the previous layer, so no extra operation is needed at run time.

## Memory arithmetic per weight {#ch03-memory .th}

Bytes per weight is the first number to compute: 32-bit float is 4, 16-bit float or bfloat is 2, 8-bit is 1, and 4-bit is 0.5 plus some overhead for scales. The model sizes below are round hypothetical numbers.

```python run=lm-c03-mem
GiB = 2 ** 30
formats = [("fp32", 32), ("fp16", 16), ("int8", 8), ("4-bit", 4), ("4-bit + scales", 4 + 16 / 128)]
sizes = [7e9, 13e9, 70e9]
print(f"{'format':16}{'bits':>7}" + "".join(f"{s / 1e9:>7.0f}B" for s in sizes) + "   (GiB)")
for name, bits in formats:
    print(f"{name:16}{bits:7.3f}" + "".join(f"{s * bits / 8 / GiB:8.1f}" for s in sizes))
print(f"70B at 4 bits is {70e9 * 0.5 / 1e9:.1f} GB, or {70e9 * 0.5 / GiB:.1f} GiB")
```

The last row assumes a 16-bit scale for each group of 128 weights, which adds little. Group size is a typical setting and a trade-off: smaller groups cost more scales and track local value ranges better.

:::trap
Vendors quote GB, and tools often report GiB, which is about 7% larger. More importantly, the weights number is a floor. Serving needs room for the KV cache, and training needs room for activations. A model whose weights exactly fill a GPU cannot run on it.
:::

## Flash attention {#ch03-flash .th}

**Flash attention** computes exactly the same result as standard attention, with far less traffic to the GPU's main memory. Standard attention writes a `T x T` score matrix to memory, reads it back for the softmax, and reads it again to multiply by the values. For long sequences, this memory traffic is a bottleneck.

Flash attention never stores the whole matrix. It splits inputs into blocks small enough to stay in fast on-chip memory, and computes the softmax **online** by keeping a running maximum, a running sum of exponentials, and a running output. It can do more arithmetic than the standard method, and it gets the time back through fewer memory accesses. Because it is exact, it changes no model outputs beyond ordinary floating-point differences. Sparse and low-rank attention methods are approximations, and this one is not.

```python run=lm-c03-flash
import numpy as np

rng = np.random.default_rng(0)
T, d, block = 2048, 64, 128
Q, K, V = rng.normal(size=(3, T, d))

def standard():
    S = Q @ K.T / np.sqrt(d)                     # the full T x T score matrix
    w = np.exp(S - S.max(axis=1, keepdims=True))
    return (w / w.sum(axis=1, keepdims=True)) @ V, S.size

def online(block):
    out = np.zeros((T, d))
    biggest = 0
    for i in range(0, T, block):
        q = Q[i:i + block]
        m = np.full((len(q), 1), -np.inf)        # running max of scores
        l = np.zeros((len(q), 1))                # running sum of exp(score - m)
        o = np.zeros((len(q), d))                # running weighted values
        for j in range(0, T, block):
            s = q @ K[j:j + block].T / np.sqrt(d)
            biggest = max(biggest, s.size)
            new_m = np.maximum(m, s.max(axis=1, keepdims=True))
            shift = np.exp(m - new_m)
            e = np.exp(s - new_m)
            l = shift * l + e.sum(axis=1, keepdims=True)
            o = shift * o + e @ V[j:j + block]
            m = new_m
        out[i:i + block] = o / l
    return out, biggest

a, cells_a = standard()
b, cells_b = online(block)
print("same output:", bool(np.allclose(a, b)))
print(f"score values held at once: standard {cells_a:,}, blocked {cells_b:,}")
print(f"reduction factor: {cells_a / cells_b:.0f}")
```

The output is the same, and the score memory needed at one time falls from 4 million values to about 16 thousand. How much faster that makes a real GPU depends on the hardware and sequence length, so run your own measurement. In PyTorch, `scaled_dot_product_attention` can select an efficient backend automatically when the conditions allow it.

## Batched inference {#ch03-batch .th}

GPUs are built for parallel work, so running several requests at once uses more of the hardware. Requests have different lengths, so **padding** fills out a rectangle. Generation appends on the right, so prompts should be **left padded** to keep the latest real token at the last position:

```python run=lm-c03-pad
prompts = [["the", "cat"], ["a", "very", "long", "prompt"], ["hi"]]
width = max(len(p) for p in prompts)
PAD = "<pad>"
right = [p + [PAD] * (width - len(p)) for p in prompts]
left = [[PAD] * (width - len(p)) + p for p in prompts]
print("the model predicts from the last position:")
print("right padded:", [row[-1] for row in right])
print("left padded: ", [row[-1] for row in left])
cells = len(prompts) * width
real = sum(len(p) for p in prompts)
print(f"real tokens {real} of {cells} cells, {100 * (cells - real) / cells:.0f}% is padding")
```

With right padding, two of the three requests would predict their next token from a padding position. Grouping similar lengths into the same batch cuts the padding share.

**Static batching** forms a batch, runs it until the **longest** output finishes, and only then takes new requests. A request that finishes early leaves its slot idle, and a new arrival waits for the whole batch. Output lengths vary widely, so this wastes a lot.

## Continuous batching {#ch03-cont .th}

**Continuous batching**, also called in-flight batching or iteration-level scheduling (it was introduced in the Orca paper), makes the decision at each decode step. Finished sequences leave, and waiting ones join. This works because one decode step for a sequence is the same kind of work regardless of how long that sequence has run: each sequence supplies one new token and its own KV cache.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 208" role="img" aria-label="Two timelines of three slots. In static batching slots stay idle until the longest request finishes. In continuous batching new requests fill slots as soon as they free up.">
  <text x="10" y="16" class="t-small">static: slots stay idle until the longest finishes</text>
  <rect x="10" y="24" width="120" height="20" rx="3" class="d-acc"/><text x="70" y="38" text-anchor="middle" class="t-mono">A</text><rect x="130" y="24" width="190" height="20" rx="3" class="d-box"/><text x="225" y="38" text-anchor="middle" class="t-small">idle</text>
  <rect x="10" y="48" width="310" height="20" rx="3" class="d-key"/><text x="165" y="62" text-anchor="middle" class="t-mono">B</text>
  <rect x="10" y="72" width="60" height="20" rx="3" class="d-soft"/><text x="40" y="86" text-anchor="middle" class="t-mono">C</text><rect x="70" y="72" width="250" height="20" rx="3" class="d-box"/><text x="195" y="86" text-anchor="middle" class="t-small">idle</text>
  <rect x="320" y="24" width="150" height="20" rx="3" class="d-soft"/><text x="395" y="38" text-anchor="middle" class="t-mono">D</text>
  <rect x="320" y="48" width="90" height="20" rx="3" class="d-acc"/><text x="365" y="62" text-anchor="middle" class="t-mono">E</text><rect x="410" y="48" width="60" height="20" rx="3" class="d-box"/>
  <rect x="320" y="72" width="60" height="20" rx="3" class="d-key"/><text x="350" y="86" text-anchor="middle" class="t-mono">F</text><rect x="380" y="72" width="90" height="20" rx="3" class="d-box"/>
  <text x="10" y="118" class="t-small">continuous: a free slot is refilled at the next step</text>
  <rect x="10" y="126" width="120" height="20" rx="3" class="d-acc"/><text x="70" y="140" text-anchor="middle" class="t-mono">A</text><rect x="130" y="126" width="150" height="20" rx="3" class="d-soft"/><text x="205" y="140" text-anchor="middle" class="t-mono">D</text>
  <rect x="10" y="150" width="310" height="20" rx="3" class="d-key"/><text x="165" y="164" text-anchor="middle" class="t-mono">B</text>
  <rect x="10" y="174" width="60" height="20" rx="3" class="d-soft"/><text x="40" y="188" text-anchor="middle" class="t-mono">C</text><rect x="70" y="174" width="90" height="20" rx="3" class="d-acc"/><text x="115" y="188" text-anchor="middle" class="t-mono">E</text><rect x="160" y="174" width="60" height="20" rx="3" class="d-key"/><text x="190" y="188" text-anchor="middle" class="t-mono">F</text>
  <text x="600" y="62" text-anchor="middle" class="t-small">the same six requests</text>
  <text x="600" y="164" text-anchor="middle" class="t-small">finish in less time</text>
</svg></div><figcaption><b>Static and continuous batching.</b> The horizontal axis is decode steps. Each row is one batch slot, and shaded boxes are requests.</figcaption></figure>

There is one complication. A new request must first run its whole prompt through the model, called **prefill** or prompt processing. A long prompt is much heavier than one decode step. Running it inside the decode batch stalls every other stream and shows up as a pause in their tokens. Schedulers handle this in various ways, such as limiting how much prefill work can be admitted per step, or running prefill in a separate batch. The coding section's simulator shows both the gain and the stall.

## KV-cache memory {#ch03-kv .th}

The Chapter 1 cache costs memory per token, per layer:

```text
bytes per token = 2 x layers x kv_heads x head_dim x bytes_per_value
```

The factor of 2 is for keys and values. With `kv_heads = heads`, `kv_heads x head_dim` equals `d_model`. Many recent models use **grouped-query attention (GQA)**, where several query heads share one key and value head, so `kv_heads` is smaller and the cache shrinks in proportion.

```python run=lm-c03-kv
MiB, GiB = 2 ** 20, 2 ** 30
layers, heads, head_dim, value_bytes = 32, 32, 128, 2     # hypothetical model, 16-bit floats

def per_token(kv_heads):
    return 2 * layers * kv_heads * head_dim * value_bytes

print("kv_heads  MiB/token   GiB at 1024 tokens   GiB at 4096 tokens")
for kv_heads in (32, 8):
    b = per_token(kv_heads)
    print(f"{kv_heads:8}  {b / MiB:9.3f}  {b * 1024 / GiB:19.2f}  {b * 4096 / GiB:19.2f}")
print("requests of 2048 tokens that fit in 40 GiB:")
for kv_heads in (32, 8):
    print(f"  kv_heads={kv_heads}: {int(40 * GiB // (per_token(kv_heads) * 2048))}")
```

This is a large number. One hypothetical long request with no GQA takes 2 GiB of cache. On a busy server, the cache is often what limits how many requests can run at once.

:::trap
Quantizing the weights to 4 bits does not shrink the KV cache. Cached keys and values are activations, stored in the compute type. If an interviewer asks why a 4-bit model still runs out of memory under load, this is the likely answer. Chapter 2's QLoRA point has the same structure: weights shrink and activations do not.
:::

## The idea behind PagedAttention {#ch03-paged .th}

Simple servers reserve a contiguous KV buffer per request at the maximum length. Most requests never reach it, so much of the reservation is wasted. **PagedAttention**, the idea at the centre of vLLM, borrows from virtual memory:

- Split cache memory into fixed-size **blocks** (pages) holding a small number of tokens.
- Give each sequence a **block table** mapping its logical positions to blocks. They do not have to be next to one another, and the attention kernel reads through the table.
- Allocate a block only when a sequence needs it. Waste is limited to the partly filled last block.
- **Share** blocks with reference counts. Several completions of one prompt can point at the same prompt blocks, and **copy-on-write** handles the first change to a shared block.
- When memory runs out, **evict** whole sequences: swap their blocks out to CPU memory or drop and recompute them later.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 164" role="img" aria-label="Two sequences with block tables pointing into a shared pool of physical KV blocks. Both sequences share the first block.">
  <text x="10" y="20" class="t-small">block tables</text>
  <rect x="10" y="28" width="150" height="28" rx="4" class="d-acc"/><text x="85" y="47" text-anchor="middle" class="t-mono">seq A: 0, 5, 2</text>
  <rect x="10" y="80" width="150" height="28" rx="4" class="d-key"/><text x="85" y="99" text-anchor="middle" class="t-mono">seq B: 0, 3</text>
  <text x="270" y="20" class="t-small">physical blocks in GPU memory</text>
  <rect x="270" y="28" width="66" height="44" class="d-soft"/><text x="303" y="55" text-anchor="middle" class="t-mono">0 share</text>
  <rect x="340" y="28" width="66" height="44" class="d-box"/><text x="373" y="55" text-anchor="middle" class="t-mono">1</text>
  <rect x="410" y="28" width="66" height="44" class="d-acc"/><text x="443" y="55" text-anchor="middle" class="t-mono">2 A</text>
  <rect x="480" y="28" width="66" height="44" class="d-key"/><text x="513" y="55" text-anchor="middle" class="t-mono">3 B</text>
  <rect x="550" y="28" width="66" height="44" class="d-box"/><text x="583" y="55" text-anchor="middle" class="t-mono">4</text>
  <rect x="620" y="28" width="66" height="44" class="d-acc"/><text x="653" y="55" text-anchor="middle" class="t-mono">5 A</text>
  <path d="M160 40 L 270 44" class="d-line-acc"/><path d="M160 94 L 270 60" class="d-line-key"/>
  <text x="270" y="102" class="t-small">Empty blocks (1 and 4) are ready for any sequence.</text>
  <text x="270" y="122" class="t-small">Block 0 holds a shared prompt, with reference count 2.</text>
  <text x="270" y="142" class="t-small">Lines show the first entry of each table.</text>
</svg></div><figcaption><b>Block tables over a shared pool.</b> A sequence's blocks need not be contiguous, and a shared prompt is stored once.</figcaption></figure>

The program compares reservations with paging for one workload of output lengths. It counts how many requests could be held at their final length in a pool for 100,000 tokens. Lengths and sizes are invented.

```python run=lm-c03-pages
import math, random

rng = random.Random(0)
lengths = [min(4096, int(rng.lognormvariate(5.2, 0.9))) for _ in range(2000)]
pool, reserve, page = 100_000, 4096, 16

fit_reserved = pool // reserve
used, fit_paged, last_page_waste = 0, 0, 0
for n in lengths:
    pages = math.ceil(n / page)
    if used + pages * page > pool:
        break
    used += pages * page
    last_page_waste += pages * page - n
    fit_paged += 1

print(f"mean length {sum(lengths) / len(lengths):.0f}, longest {max(lengths)}")
print(f"contiguous reservation of {reserve}: {fit_reserved} requests")
print(f"paged with {page}-token blocks: {fit_paged} requests, last-block waste {100 * last_page_waste / used:.1f}%")

prompt, output, n = 512, 128, 4
print(f"{n} completions of one {prompt}-token prompt: {n * (prompt + output)} tokens copied, {prompt + n * output} shared")
```

Paged allocation holds many more requests here, and the only waste is the partly full last block. This is the mechanism to explain in an interview. The size of any real gain depends on the workload, so do not quote a single speedup. The same bookkeeping also supports **prefix caching**: if many requests start with the same system prompt, their prefill work and memory can be reused.

## Speculative decoding {#ch03-spec .th}

A decode step on a large model is expensive, but verifying several proposed tokens in one forward pass costs not much more than generating one, since a forward pass handles all positions in parallel. **Speculative decoding** uses a small draft model to propose `k` tokens, runs the target model over them once, and keeps the longest accepted prefix.

To keep the target's sampling distribution exactly, each proposed token `x` is accepted with probability `min(1, p(x)/q(x))`, where `p` is the target and `q` the draft. On a rejection, a replacement is sampled from the normalised `max(0, p - q)`. This is a form of rejection sampling. The program checks that the result matches `p`, and that the acceptance rate equals `Σ min(p, q)`.

```python run=lm-c03-spec
import numpy as np

rng = np.random.default_rng(0)
p = np.array([0.50, 0.25, 0.15, 0.10])          # target
q = np.array([0.40, 0.40, 0.10, 0.10])          # draft
residual = np.maximum(p - q, 0)
residual = residual / residual.sum()

N = 200_000
proposal = rng.choice(4, size=N, p=q)
accepted = rng.random(N) < np.minimum(1, p[proposal] / q[proposal])
replacement = rng.choice(4, size=N, p=residual)
final = np.where(accepted, proposal, replacement)
freq = np.bincount(final, minlength=4) / N

print("target p  ", " ".join(f"{x:.3f}" for x in p))
print("empirical ", " ".join(f"{x:.3f}" for x in freq))
print(f"acceptance measured {accepted.mean():.3f}, predicted {np.minimum(p, q).sum():.3f}")

print("\ntokens per target pass, then relative time per token, draft step = 10% of a target step")
print(" accept      k=1          k=3          k=5          k=8")
for a in (0.5, 0.7, 0.9):
    row = []
    for k in (1, 3, 5, 8):
        tokens = (1 - a ** (k + 1)) / (1 - a)            # accepted run plus one sampled by the target
        row.append(f"{tokens:5.2f} {(1 + k * 0.1) / tokens:5.2f}")
    print(f"{a:6.1f}  " + "  ".join(row))
```

The empirical frequencies match the target, so output quality in distribution is unchanged, and only speed changes. The expected token count assumes independent acceptance with probability `a` at each position: a pass always yields at least one token, because the target supplies the replacement or the extra token after a full accept. The time column ignores the extra cost of a longer verifying pass, so treat it as an upper bound on the gain. A relative time under 1 is a speedup. At 50% acceptance, a long draft pays for little and starts to lose. At 90%, longer drafts help.

Costs to mention: extra memory for the draft model and its cache, rolling back the KV cache after rejections, a less predictable batch step, and little or no gain at high temperature or with a poorly matched draft. Variants use prompt lookup in place of a model, which suits tasks such as editing that copy their input.

## Metrics: TTFT, tokens per second, latency and throughput {#ch03-metrics .th}

Streaming splits the latency into parts, and each has a different cause.

- **Time to first token (TTFT)**: queueing plus prefill, so it grows with load and prompt length.
- **Inter-token latency (ITL)**, or time per output token: the decode step time, which grows with batch size.
- **End-to-end latency**: `TTFT + (output_tokens - 1) x ITL`.
- **Per-request tokens per second**: how fast one user sees text.
- **Throughput**: total tokens per second across all users, which is what sets cost.

```python run=lm-c03-metrics
# arrival time and token times in ms for three invented requests
events = {
    "r1": (0, [220, 260, 300, 340, 380, 420]),
    "r2": (50, [400, 450, 500, 550]),
    "r3": (100, [900, 960, 1020, 1080, 1140, 1200, 1260, 1320]),
}
print("req  TTFT   ITL    E2E  tok/s")
for name, (arrive, times) in events.items():
    ttft = times[0] - arrive
    itl = (times[-1] - times[0]) / (len(times) - 1)
    e2e = times[-1] - arrive
    print(f"{name:3}{ttft:6}{itl:6.0f}{e2e:7}{1000 * len(times) / e2e:7.1f}")

total = sum(len(t) for _, t in events.values())
span = max(t[-1] for _, t in events.values()) - min(a for a, _ in events.values())
print(f"aggregate {1000 * total / span:.1f} tokens/s")
```

The third request has the worst TTFT by far, which in real data would point to queueing or a long prompt, and its token rate is the lowest as well. Report percentiles such as p50, p95 and p99 per metric, since averages hide tail behaviour. Measure TTFT and ITL separately: a user notices a long initial wait differently from slow streaming.

**Latency and throughput pull against each other.** Larger batches raise throughput, since each step serves more sequences, but each step takes longer, so per-user speed falls. Near capacity, queues grow and TTFT rises steeply. The simple M/M/1 queueing formula shows the shape, though real batched servers differ in detail. Little's law, `in-flight = arrival rate x time in system`, holds regardless.

```python run=lm-c03-queue
service = 1.0
print("utilisation   time in system (x service time)")
for rho in (0.5, 0.7, 0.8, 0.9, 0.95, 0.99):
    print(f"{rho:11.2f}   {service / (1 - rho):8.1f}")
rate, time_in_system = 20, 3.0
print(f"Little's law: {rate} requests/s x {time_in_system} s = {rate * time_in_system:.0f} in flight")
```

Going from 50% to 90% utilisation multiplies waiting by five, and going on to 99% multiplies it by ten more. That is why servers are not run at their maximum throughput if latency matters.

## Autoscaling and cost estimates {#ch03-cost .th}

Scale on signals that track user experience: queue length, in-flight requests, or TTFT percentiles. GPU utilisation is a poor signal, because a batched server can look fully busy at many different load levels. Model loading is slow, since large weights must be downloaded and moved to the GPU, so scale up early, keep a minimum number of replicas warm, and store weights close to the machines. On scale-down, drain in-flight requests first. Scaling to zero saves money but adds a cold start for the first user.

A cost estimate takes one minute and shows that you understand the system. All numbers below are invented, and you should measure per-replica throughput under your own latency target.

```python run=lm-c03-cost
import math

gpu_cost_per_hour = 2.00           # hypothetical
tokens_per_second = 2000           # hypothetical aggregate output tokens/s per replica, at the latency target
requests_per_second = 30           # hypothetical peak
tokens_per_request = 300
target_load = 0.7                  # headroom for spikes

demand = requests_per_second * tokens_per_request
replicas = math.ceil(demand / (tokens_per_second * target_load))
print(f"peak demand {demand:,} tokens/s, replicas at {target_load:.0%} load: {replicas}")

for duty in (1.0, 0.7, 0.3):
    cost = gpu_cost_per_hour / (tokens_per_second * duty * 3600) * 1e6
    print(f"cost per million tokens at {duty:.0%} average busy: {cost:.2f}")

hours = 24 * 30
always_peak = replicas * hours * gpu_cost_per_hour
scaled = (replicas * 8 + 2 * 16) * 30 * gpu_cost_per_hour
print(f"monthly, {replicas} replicas always on: {always_peak:,.0f}")
print(f"monthly, {replicas} for 8 hours a day and 2 otherwise: {scaled:,.0f}")
```

Idle time drives the cost per token: the same GPU at 30% average load costs over three times as much per token as at full use. Prefill work uses compute too, so a full estimate should count prompt tokens as well. Compare self-hosting with any alternative at realistic utilisation, since peak-load figures flatter it.

## vLLM and TGI in practice {#ch03-tools .th}

Both are open-source inference servers, and both give you continuous batching and token streaming over HTTP. **vLLM** came out of the PagedAttention work, and **TGI (Text Generation Inference)** comes from the Hugging Face ecosystem. Features, supported formats and flags change often, so check the current docs instead of memorising them. What you should be able to do is explain the mechanisms, and read the settings that relate to them: maximum batch size in tokens or requests, maximum input and output lengths, the share of memory for the cache, and the quantization format.

```python
# Illustrative vLLM offline use. Not run here. Check the current API.
from vllm import LLM, SamplingParams

llm = LLM(model=model_id)
params = SamplingParams(temperature=0.7, top_p=0.9, max_tokens=128)
for out in llm.generate(prompts, params):
    print(out.outputs[0].text)
```

```bash
# Illustrative TGI server and request. Not run here. Check the current docs.
docker run --gpus all -p 8080:80 ghcr.io/huggingface/text-generation-inference --model-id "$MODEL_ID"
curl localhost:8080/generate -H 'Content-Type: application/json' \
  -d '{"inputs": "What is a KV cache?", "parameters": {"max_new_tokens": 64}}'
```

Debug a slow server in this order: is TTFT high (queue or prefill)? Is ITL high (batch too big, memory traffic)? Are requests being evicted and recomputed (cache too small)? Then compare one change at a time under a load test that has realistic lengths, because results from a single-request test tell you little about a server under load.

## Drills {#ch03-drills .dr}

:::drill concept
What is the difference between GPTQ, AWQ and GGUF?
---
**Answer.** GPTQ and AWQ are quantization algorithms, and GGUF is a file format from llama.cpp that can hold several schemes. GPTQ compensates for rounding error using second-order information. AWQ scales salient channels based on activations.

**Why.** Comparing "AWQ vs GGUF" mixes two levels. The useful questions are which runtime you have, which formats it loads, and how accuracy holds up on your task.
:::

:::drill output
Work out the memory for a hypothetical 13-billion-weight model at 16-bit and 4-bit, and the KV cache per token with 40 layers, `d_model = 5120` and no GQA, at 16-bit.

```python run=lm-c03-d-mem
n, layers, d = 13e9, 40, 5120
print(f"weights 16-bit {n * 2 / 2 ** 30:.1f} GiB, 4-bit {n * 0.5 / 2 ** 30:.1f} GiB")
per_token = 2 * layers * d * 2
print(f"cache per token {per_token:,} bytes = {per_token / 2 ** 20:.2f} MiB")
print(f"cache for 2048 tokens {per_token * 2048 / 2 ** 30:.2f} GiB")
```
---
**Answer.** About 24.2 GiB and 6.1 GiB, then about 0.78 MiB per token and 1.56 GiB per 2048-token sequence.

**Why.** At 4 bits, the weights no longer dominate: only four such sequences take as much memory as the 4-bit weights.
:::

:::drill tricky
You quantize a model from 16-bit to 4-bit. The GPU holds more, but under load you still run out of memory at similar concurrency. Why?
---
**Answer.** The KV cache did not shrink. Concurrency is limited by cache memory, and quantizing weights frees memory only once.

**Why.** The freed memory does allow some more requests, though each still costs the same. Other options are shorter maximum lengths, paged allocation, GQA models, or more replicas.
:::

:::drill concept
Is flash attention an approximation? What does it save?
---
**Answer.** No, the result is exact up to floating-point differences. It saves main-memory traffic by working on blocks that fit in fast memory, and memory use for the score matrix falls from `O(T²)` to `O(T)`.

**Why.** It is an IO-aware algorithm. The arithmetic complexity remains `O(T²)`, which is why long contexts are still expensive.
:::

:::drill bug
Batched generation works for the longest prompt but gives garbage for short ones. Why?

```python
tokenizer.padding_side = "right"
batch = tokenizer(prompts, padding=True, return_tensors="pt")
out = model.generate(**batch, max_new_tokens=32)
```
---
**Answer.** Right padding means the short prompts' next token is predicted from a padding position. Set the padding side to left for generation.

**Why.** New tokens are appended on the right, so the last real token must be at the end. For training, either side can work with a correct attention mask. Position ids should also skip the padding.
:::

:::drill tricky
Why can continuous batching exist at all, given that each request has a different length and cache?
---
**Answer.** Each decode step is per-token work. Every sequence contributes one new token and reads its own cache, so sequences at different stages can share a step.

**Why.** Scheduling at the iteration level, as opposed to the batch level, is the key change. The exception is prefill, since it processes many tokens at once, and it has to be scheduled with care.
:::

:::drill concept
A user complains about a long wait before text appears, yet streaming is fast once it starts. What do you look at?
---
**Answer.** TTFT, which means queueing and prefill. Check queue depth, prompt length and whether prefill is being delayed. Check prefix caching for repeated system prompts.

**Why.** High TTFT with low ITL suggests the decode batch is healthy, and the wait comes before the first token. More replicas or limits on prompt length would be the first options.
:::

:::drill output
Target and draft distributions are `p = [0.7, 0.2, 0.1]` and `q = [0.5, 0.3, 0.2]`. What is the acceptance rate, and what distribution is used on a rejection?

```python run=lm-c03-d-spec
import numpy as np

p, q = np.array([0.7, 0.2, 0.1]), np.array([0.5, 0.3, 0.2])
print("acceptance", round(float(np.minimum(p, q).sum()), 3))
r = np.maximum(p - q, 0)
print("residual", (r / r.sum()).round(3))
for token in range(3):
    print(token, "accept probability", round(float(min(1, p[token] / q[token])), 3))
```
---
**Answer.** Acceptance is 0.8. On rejection the replacement is always token 0, the only one where `p` exceeds `q`.

**Why.** The acceptance rate is `Σ min(p, q)`, which equals one minus the total variation distance. The residual supplies what the draft under-proposes, so the combined result is exactly `p`.
:::

:::drill tricky
Speculative decoding gave no gain on your creative writing app, and helped a lot on code completion. Why?
---
**Answer.** Acceptance depends on how closely the draft matches the target. Predictable text gives more accepted tokens, while high temperature and open-ended text cause more rejections.

**Why.** When few tokens are accepted, you pay for the draft, the larger forward pass and rollback for little gain. Measure acceptance rate per workload, and turn it off where it does not help.
:::

:::drill concept
A server shows 100% GPU utilisation with short queues and good latency. Should the autoscaler add replicas?
---
**Answer.** No, not on that signal. Batched inference can keep a GPU busy at various loads, and the user-facing numbers are healthy.

**Why.** Scale on queue length, in-flight requests or TTFT percentiles. Autoscaling on GPU utilisation alone can add replicas for no benefit.
:::

:::drill output
A replica gives 1500 tokens/s at your latency target. You expect 40 requests/s at peak with 250 output tokens each, and want to run at 60% load. How many replicas? Check with Little's law: if each request takes 5 s in the system, how many are in flight?

```python run=lm-c03-d-cap
import math

demand = 40 * 250
print("demand", demand, "tokens/s")
print("replicas", math.ceil(demand / (1500 * 0.6)))
print("in flight", 40 * 5)
```
---
**Answer.** 10,000 tokens/s of demand, 12 replicas, and 200 requests in flight.

**Why.** Demand divided by usable throughput per replica is 11.1, which rounds up. The in-flight count, divided across replicas, also tells you what concurrency, and so how much KV cache, each replica needs.
:::

:::drill tricky
With PagedAttention, what happens when memory runs out, and why evict a whole sequence?
---
**Answer.** The server evicts some running sequences, usually the most recently admitted, and swaps their blocks to CPU memory or recomputes them later.

**Why.** A sequence needs all of its keys and values to compute its next token, so holding only part of its cache gains nothing. This mirrors the working-set idea from operating systems.
:::

:::drill concept
Throughput doubled after you increased the maximum batch size, yet users say the product feels slower. Explain, and propose a fix.
---
**Answer.** Each step now serves more sequences and takes longer, so per-user ITL went up. Admitting more prefills may also stall streams.

**Why.** Throughput and per-user latency are separate goals. Set the batch limit using a latency target such as p95 ITL, then add replicas to meet demand.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1300
Write a memory calculator: given the weight count, bit width, layers, KV heads, head size, GPU memory and request length, report how many concurrent requests fit. Compare a few configurations.
---
Weights are fixed, so what remains goes to the cache, with a safety margin.

```python run=lm-c03-c-mem
GiB = 2 ** 30

def concurrency(weights, bits, layers, kv_heads, head_dim, tokens, vram_gib, overhead_gib=2, value_bytes=2):
    weight_bytes = weights * bits / 8
    free = vram_gib * GiB - overhead_gib * GiB - weight_bytes
    per_request = 2 * layers * kv_heads * head_dim * value_bytes * tokens
    return weight_bytes / GiB, per_request / GiB, max(0, int(free // per_request))

base = dict(weights=13e9, layers=40, head_dim=128, tokens=2048, vram_gib=48)
print(f"{'config':30}{'weights':>8}{'per req':>9}{'requests':>10}")
for name, bits, kv_heads in [("16-bit, no GQA", 16, 40), ("4-bit, no GQA", 4.125, 40),
                             ("16-bit, GQA", 16, 8), ("4-bit, GQA", 4.125, 8)]:
    w, r, n = concurrency(bits=bits, kv_heads=kv_heads, **base)
    print(f"{name:30}{w:7.1f}G{r:8.2f}G{n:10}")
w, r, n = concurrency(bits=16, kv_heads=8, **{**base, "tokens": 512})
print(f"{'16-bit, GQA, 512-token limit':30}{w:7.1f}G{r:8.2f}G{n:10}")
```

Quantization helps by freeing a single chunk of memory. GQA and shorter limits divide the per-request cost, so they can have a larger effect on concurrency. Real capacity also depends on the sum of actual lengths under a paged allocator, and this calculator uses the worst case.
:::

:::drill code rating=1500
Write a batching simulator with one tick per decode step. Compare static and continuous batching on the same requests, at two arrival rates, and then with a prefill stall. Report TTFT, end-to-end latency, throughput and slot use.
---
A slot produces one token per tick. In the static scheduler, a batch holds its slots until its longest member finishes. In the continuous scheduler, free slots refill at each tick. `prefill` is the number of ticks that an admission stalls the whole batch, which is a simple worst-case model.

```python run=lm-c03-c-batch
import random

def workload(n, mean_gap, seed=42):
    rng = random.Random(seed)
    t, jobs = 0.0, []
    for _ in range(n):
        t += rng.expovariate(1 / mean_gap)
        length = rng.randint(200, 400) if rng.random() < 0.05 else rng.randint(10, 60)
        jobs.append((t, length))
    return jobs

def percentile(values, q):
    values = sorted(values)
    return values[min(len(values) - 1, int(q * len(values)))]

def simulate(jobs, slots, mode, prefill):
    waiting, running = list(range(len(jobs))), []       # running: [job id, tokens left]
    first, done, tick, busy, stalls = {}, {}, 0, 0, 0
    while len(done) < len(jobs):
        arrived = [j for j in waiting if jobs[j][0] <= tick]
        free = slots - len(running) if mode == "continuous" else (slots if not running else 0)
        admit = arrived[:free]
        if admit:
            for j in admit:
                waiting.remove(j)
                running.append([j, jobs[j][1]])
            tick += prefill
            stalls += prefill
        if not running:
            tick += 1
            continue
        tick += 1
        for item in running:
            if item[1] > 0:
                item[1] -= 1
                busy += 1
                first.setdefault(item[0], tick)
                if item[1] == 0:
                    done[item[0]] = tick
        if mode == "continuous":
            running = [r for r in running if r[1] > 0]
        elif all(r[1] == 0 for r in running):
            running = []
    ttft = [first[j] - jobs[j][0] for j in range(len(jobs))]
    e2e = [done[j] - jobs[j][0] for j in range(len(jobs))]
    tokens = sum(length for _, length in jobs)
    return (sum(ttft) / len(ttft), percentile(ttft, 0.95), sum(e2e) / len(e2e), percentile(e2e, 0.95),
            tokens / tick, busy / (slots * (tick - stalls)), stalls)

SLOTS = 8
print("gap prefill mode        ttft  ttft95    e2e   e2e95  tok/tick  slot use  stall ticks")
for gap, prefill in [(30.0, 0), (12.0, 0), (6.0, 0), (6.0, 3)]:
    jobs = workload(400, gap)
    for mode in ("static", "continuous"):
        r = simulate(jobs, SLOTS, mode, prefill)
        print(f"{gap:3.0f} {prefill:7} {mode:10} {r[0]:6.0f} {r[1]:7.0f} {r[2]:6.0f} {r[3]:7.0f} {r[4]:9.2f} {r[5]:9.2f} {r[6]:12}")
```

Read the output in pairs. At a gap of 30 ticks both schedulers keep up, with about the same throughput, yet static batching's mean TTFT is 118 ticks against 2 for continuous, because arrivals wait for the current batch. At a gap of 12, static batching has hit its limit of about 2.65 tokens per tick, so its queue keeps growing and TTFT passes 1200 ticks, while continuous batching still starts almost at once. At a gap of 6, continuous batching reaches 90% slot use and 7.19 tokens per tick, nearly three times the static figure. The long requests cause most of static's waste, since each one holds a whole batch open.

The last two rows charge a stall to every admission. Continuous batching admits small groups often, so it spends 1107 ticks stalled against 153 for static. Its throughput falls from 7.19 to 5.29 tokens per tick and its mean TTFT rises from 68 to 532, and every stall also pauses the streams already running. It still beats static by a wide margin, and the stall is why schedulers limit prefill per step. A real prefill cost depends on prompt length, so this fixed stall is only a rough model.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- GPTQ and AWQ are algorithms. GGUF is a file format. NF4 mainly suits training. Usually only weights are quantized.
- Bytes per weight: fp32 4, fp16 2, int8 1, 4-bit about 0.5 plus scales. GiB is 2³⁰ bytes, and GB is 10⁹.
- KV cache per token: `2 x layers x kv_heads x head_dim x bytes`. Weight quantization leaves it unchanged, and GQA reduces it.
- Flash attention: exact, block-wise, online softmax, far less memory traffic, the same `O(T²)` arithmetic.
- Generation uses left padding. Static batching waits for the longest member.
- Continuous batching: join and leave at each decode step. Prefill is the catch.
- PagedAttention: fixed blocks, per-sequence tables, on-demand allocation, shared prompts with copy-on-write, whole-sequence eviction.
- Speculative decoding: accept with `min(1, p/q)`, resample from `max(0, p - q)`, distribution preserved. Acceptance rate is `Σ min(p, q)`. Expected tokens per pass are `(1 - a^(k+1)) / (1 - a)`.
- TTFT reflects queue and prefill. ITL reflects decode step and batch size. E2E is `TTFT + (n - 1) x ITL`. Report percentiles.
- Throughput and latency trade off. Queues grow sharply near capacity. Little's law: `in-flight = rate x time`.
- Autoscale on queue length, in-flight requests or TTFT, not GPU utilisation. Allow for slow model loading.
- Cost: replicas = demand / (per-replica throughput x target load). Cost per token rises as idle time rises.
