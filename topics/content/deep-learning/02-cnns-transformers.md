---
title: CNNs and transformers
part: Part A · Foundations
lede: Interviews test these architectures through arithmetic and reasons. Given a layer, can you give its output shape and parameter count? Why does attention divide by the square root of the dimension? This chapter covers convolution, pooling, receptive field and residual connections, gives RNNs and LSTMs a short treatment, then builds attention, multi-head attention and encoder and decoder blocks, and ends with the vision transformer. You count ResNet and ViT parameters from first principles.
desc: convolution parameters, shape arithmetic, pooling, receptive field, residual connections, RNN and LSTM, attention, multi-head, positional encoding, encoder and decoder blocks, ViT, parameter counting
hours: 6
prereqs: Chapter 1 (backprop, normalisation, vanishing gradients)
---

## Convolution: parameters and shape arithmetic {#ch02-conv .th}

A 2D convolution slides a small kernel over a feature map. It has two built-in assumptions: **locality** (a pixel relates mostly to its neighbours) and **weight sharing** (the same detector is useful everywhere). Together they give far fewer parameters than a dense layer, and **translation equivariance**: shifting the input shifts the feature map, apart from edge and stride effects.

Along each spatial axis, with input size `n`, kernel `k`, stride `s`, padding `p` and dilation `d`:

```text
out = floor((n + 2p - d(k - 1) - 1) / s) + 1
```

A dilated kernel covers `d(k-1) + 1` input positions. Padding `p = (k-1)/2` with odd `k` and stride 1 keeps the size unchanged. A **transposed convolution** goes the other way, with `out = (n-1)s - 2p + k + output_padding`. It applies the transpose of the convolution's matrix, the same operation that carries gradients back through a convolution. "Deconvolution" is a misnomer for it, since it doesn't invert the convolution. The program checks the formula against a direct count of window positions.

```python run=dl-c02-shape
def conv_out(n, k, s=1, p=0, d=1):
    return (n + 2 * p - d * (k - 1) - 1) // s + 1

def brute(n, k, s=1, p=0, d=1):
    span, total = d * (k - 1) + 1, n + 2 * p
    return sum(1 for start in range(0, total, s) if start + span <= total)

print("   n   k  s  p  d  out  brute")
for c in [(224, 7, 2, 3, 1), (112, 3, 2, 1, 1), (32, 3, 1, 1, 1), (32, 3, 2, 1, 1), (7, 3, 2, 1, 1),
          (32, 3, 1, 0, 2), (32, 3, 1, 2, 2), (8, 2, 2, 0, 1)]:
    print("".join(f"{v:4}" for v in c), f"{conv_out(*c):4} {brute(*c):5}")

def tconv_out(n, k, s=1, p=0, op=0):
    return (n - 1) * s - 2 * p + k + op

print("transposed:", tconv_out(16, 4, 2, 1), tconv_out(16, 3, 2, 1), tconv_out(16, 3, 2, 1, 1))
```

Note the floor: `7` with `k=3, s=2, p=1` gives 4, and so does `8`. Downsampling loses the original size, which is why a transposed convolution has an `output_padding` argument to choose between them. The last line shows it: 31 without, 32 with.

Parameters depend on channels and kernel size, and not on the image size.

```text
params = k_h * k_w * (C_in / groups) * C_out  + C_out (if bias)
```

```python run=dl-c02-params
def conv(cin, cout, k, groups=1, bias=True):
    return k * k * cin // groups * cout + (cout if bias else 0)

print("3x3, 64 to 128, bias:     ", conv(64, 128, 3))
print("3x3, 64 to 128, no bias:  ", conv(64, 128, 3, bias=False))
print("1x1, 256 to 64, no bias:  ", conv(256, 64, 1, bias=False))
sep = conv(64, 64, 3, groups=64, bias=False) + conv(64, 128, 1, bias=False)
print(f"depthwise separable:       {sep}, {conv(64, 128, 3, bias=False) / sep:.1f}x fewer")
print("dense, 224x224x3 to 1000: ", 224 * 224 * 3 * 1000 + 1000)
C = 64
print("two 3x3 vs one 5x5:       ", 2 * conv(C, C, 3, bias=False), conv(C, C, 5, bias=False))
```

Convolutions before batch norm usually set `bias=False`, because batch norm's learned shift makes the bias redundant. A **1×1 convolution** is a per-pixel linear layer across channels, used to change channel count cheaply. A **depthwise separable** convolution splits spatial filtering (one kernel per channel) from channel mixing (1×1), as in the MobileNet family.

:::trap "Convolution" is cross-correlation
Deep learning frameworks don't flip the kernel, so what they call convolution is cross-correlation in the signal-processing sense. For learned kernels, it makes no practical difference, since the network can learn the flipped version. It matters when you load a designed filter, or when you compare with `np.convolve`, which does flip.
:::

## Pooling and receptive field {#ch02-rf .th}

**Max pooling** and **average pooling** downsample with no parameters. Max pooling keeps the strongest response and gives some local translation tolerance. Strided convolution is a learned alternative. **Global average pooling** collapses each channel to one number, so the classifier head needs far fewer parameters and the network accepts varying input sizes.

The **receptive field** of a unit is the input region that can affect it. Track it layer by layer using the **jump**, the distance in input pixels between adjacent units at that layer:

```text
r_out = r_in + d(k - 1) * j_in
j_out = j_in * s
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 170" role="img" aria-label="Three 1D layers with kernel 3 and stride 1. One unit at the top depends on 3, then 5, then 7 input cells.">
  <g class="d-grid"><rect x="150" y="130" width="420" height="30"/><path d="M210 130 V160 M270 130 V160 M330 130 V160 M390 130 V160 M450 130 V160 M510 130 V160"/></g>
  <rect x="150" y="130" width="420" height="30" class="d-acc"/>
  <rect x="210" y="90" width="300" height="24" class="d-soft"/>
  <rect x="270" y="50" width="180" height="24" class="d-soft"/>
  <rect x="330" y="10" width="60" height="24" class="d-key"/>
  <path d="M330 34 L 270 50 M390 34 L 450 50 M270 74 L 210 90 M450 74 L 510 90 M210 114 L 150 130 M510 114 L 570 130" class="d-line d-dash"/>
  <text x="140" y="150" text-anchor="end" class="t-small">input: r = 7</text>
  <text x="200" y="106" text-anchor="end" class="t-small">layer 1: 5 units</text>
  <text x="260" y="66" text-anchor="end" class="t-small">layer 2: 3 units</text>
  <text x="320" y="26" text-anchor="end" class="t-small">layer 3: 1 unit</text>
</svg></div><figcaption><b>Three 3×3 layers see 7 pixels on each axis.</b> That equals one 7×7 kernel's reach, with fewer parameters and more nonlinearities.</figcaption></figure>

```python run=dl-c02-rf
def receptive(layers):
    r, j = 1, 1
    for k, s, d in layers:
        r += d * (k - 1) * j
        j *= s
    return r, j

print("three 3x3:        ", receptive([(3, 1, 1)] * 3))
print("3x3 stride 2 first:", receptive([(3, 2, 1), (3, 1, 1), (3, 1, 1)]))
print("3x3 stride 2 last: ", receptive([(3, 1, 1), (3, 1, 1), (3, 2, 1)]))
print("dilations 1,2,4:  ", receptive([(3, 1, 1), (3, 1, 2), (3, 1, 4)]))

stem = [(7, 2, 1), (3, 2, 1)]
stage = lambda stride, blocks: [(3, stride, 1)] + [(3, 1, 1)] * (2 * blocks - 1)
resnet18 = stem + stage(1, 2) + stage(2, 2) + stage(2, 2) + stage(2, 2)
print("ResNet-18 convs:  ", receptive(resnet18))
```

Early strides make later layers grow the field faster, which is why a stride-2 layer first gives 11 and the same layer last gives 7. Dilation grows the field without reducing resolution, which helps segmentation. ResNet-18's theoretical receptive field of 435 is larger than a 224 input, but the **effective** receptive field is smaller: influence falls off roughly like a Gaussian from the centre, so pixels near the edge of the region barely contribute. The chain above ignores the skip connections, which give the same maximum reach and many shorter paths.

## Residual connections {#ch02-res .th}

Very deep plain networks trained worse than shallower ones, even on training error, which rules out overfitting as the cause. This is known as the **degradation problem**. A residual block outputs `x + F(x)`, so a block can act as identity by pushing `F` toward zero, and each block needs to learn only a correction.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 120" role="img" aria-label="Residual block: x passes through conv, batch norm, ReLU, conv, batch norm, then is added to a skip path carrying x, followed by ReLU">
  <text x="20" y="64" class="t-mono">x</text><path d="M34 60 L 70 60" class="d-line"/>
  <rect x="70" y="42" width="80" height="36" rx="5" class="d-box"/><text x="110" y="64" text-anchor="middle" class="t-mono">3x3 conv</text>
  <rect x="170" y="42" width="56" height="36" rx="5" class="d-soft"/><text x="198" y="64" text-anchor="middle" class="t-mono">BN</text>
  <rect x="246" y="42" width="56" height="36" rx="5" class="d-soft"/><text x="274" y="64" text-anchor="middle" class="t-mono">ReLU</text>
  <rect x="322" y="42" width="80" height="36" rx="5" class="d-box"/><text x="362" y="64" text-anchor="middle" class="t-mono">3x3 conv</text>
  <rect x="422" y="42" width="56" height="36" rx="5" class="d-soft"/><text x="450" y="64" text-anchor="middle" class="t-mono">BN</text>
  <path d="M150 60 H170 M226 60 H246 M302 60 H322 M402 60 H422 M478 60 H510" class="d-line"/>
  <circle cx="524" cy="60" r="14" class="d-acc"/><text x="524" y="65" text-anchor="middle" class="t-mono">+</text>
  <rect x="566" y="42" width="56" height="36" rx="5" class="d-soft"/><text x="594" y="64" text-anchor="middle" class="t-mono">ReLU</text>
  <path d="M538 60 H566 M622 60 H660" class="d-line"/>
  <path d="M52 60 V100 H524 V74" class="d-line-key"/><text x="288" y="114" text-anchor="middle" class="t-small t-key">skip: identity, or a 1x1 conv when stride or channels change</text>
</svg></div><figcaption><b>ResNet's basic block.</b> The sum needs matching shapes, so a downsampling block uses a strided 1×1 convolution on the skip path.</figcaption></figure>

The backward pass shows the other benefit. With `y = x + F(x)`, the Jacobian is `I + dF/dx`, so gradients always have a direct path through the identity. The program compares the gradient reaching each layer, relative to the last layer, in a 30-layer ReLU chain.

```python run=dl-c02-residual
import numpy as np

def relative_grads(skip, depth=30, width=64, n=64, branch=0.1):
    rng = np.random.default_rng(0)
    h = rng.normal(size=(n, width))
    trail = []
    for _ in range(depth):
        W = rng.normal(0, (1 / width) ** 0.5, (width, width))
        z = h @ W
        trail.append((W, z > 0))
        f = np.maximum(z, 0)
        h = h + branch * f if skip else f
    g = h / n                               # dL/dh for L = 0.5 * sum(h^2) / n
    norm = {depth: np.linalg.norm(g)}
    for layer in range(depth, 0, -1):
        W, mask = trail[layer - 1]
        through = (g * mask) @ W.T
        g = g + branch * through if skip else through
        norm[layer - 1] = np.linalg.norm(g)
    return {l: norm[l] / norm[depth] for l in (0, 10, 20, 29)}

for skip in (False, True):
    r = relative_grads(skip)
    print("residual" if skip else "plain   ", {k: f"{v:.2e}" for k, v in r.items()})
```

In the plain chain, the gradient at the input is about `2e-4` of its size at the last layer. With skips, it stays within a factor of about 2.6, and it grows slightly toward the input since each block adds to the identity path. The branch is scaled by 0.1 in this program to stop activations growing with depth, a job that normalisation and careful initialisation do in real networks.

Now count a whole network. Each stage's first block may downsample. The count below includes batch norm's learned scale and shift, and excludes its running-statistic buffers, as PyTorch's `parameters()` does.

```python run=dl-c02-resnet
def conv(cin, cout, k):
    return k * k * cin * cout           # bias=False, followed by batch norm
bn = lambda c: 2 * c

def basic(cin, c, stride):
    total = conv(cin, c, 3) + bn(c) + conv(c, c, 3) + bn(c)
    if stride != 1 or cin != c:
        total += conv(cin, c, 1) + bn(c)
    return total, c

def bottleneck(cin, c, stride):
    out = 4 * c
    total = conv(cin, c, 1) + bn(c) + conv(c, c, 3) + bn(c) + conv(c, out, 1) + bn(out)
    if stride != 1 or cin != out:
        total += conv(cin, out, 1) + bn(out)
    return total, out

def resnet(block, counts, name):
    total, cin, size = conv(3, 64, 7) + bn(64), 64, 56       # 224 -> 112 (conv) -> 56 (pool)
    for stage, (blocks, c) in enumerate(zip(counts, (64, 128, 256, 512))):
        for b in range(blocks):
            stride = 2 if stage > 0 and b == 0 else 1
            size = size // stride
            added, cin = block(cin, c, stride)
            total += added
        print(f"  {name} stage {stage + 1}: {cin} x {size} x {size}, params so far {total:,}")
    return total + cin * 1000 + 1000

print(f"ResNet-18 total {resnet(basic, (2, 2, 2, 2), 'R18'):,}")
print(f"ResNet-50 total {resnet(bottleneck, (3, 4, 6, 3), 'R50'):,}")
```

You can confirm the arithmetic on any machine with PyTorch:

```python
import torchvision
model = torchvision.models.resnet18()
sum(p.numel() for p in model.parameters())
```

## RNNs and LSTMs, in brief {#ch02-rnn .th}

A **vanilla RNN** updates `h_t = tanh(W_x x_t + W_h h_{t-1} + b)`. Backprop through time multiplies one Jacobian per step, so with a scalar weight `w`, the gradient over `T` steps scales as `w^T`.

An **LSTM** adds a cell state `c` updated additively. A forget gate `f`, input gate `i` and output gate `o`, each a sigmoid of the input and previous hidden state, compute `c_t = f * c_{t-1} + i * tanh(...)` and `h_t = o * tanh(c_t)`. With `f` near 1, gradients can pass along `c` over many steps. That reduces vanishing but doesn't remove it, and exploding gradients still need clipping. A **GRU** merges the forget and input gates, and has no separate cell state.

RNNs process steps one at a time, so they can't parallelise across a sequence in training, and long-range information has to survive every intermediate step. Attention gives every position a direct path to every other, which addresses both.

```python run=dl-c02-rnn
for w in (0.9, 1.0, 1.1):
    print(f"w={w}: w^50 = {w ** 50:.3f}")

i, h = 128, 256
print("LSTM, one bias per gate:", 4 * (h * (i + h) + h))
print("PyTorch nn.LSTM:        ", 4 * h * (i + h + 2))
```

The textbook LSTM has one bias per gate. PyTorch's `nn.LSTM` keeps two bias vectors (`bias_ih` and `bias_hh`), which is why its count is higher. If your count differs slightly from a framework's, a detail like this is usually the reason.

## Attention {#ch02-attention .th}

**Scaled dot-product attention** computes a weighted average of values, using weights from how well each query matches each key.

```text
Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V
Q: (T_q, d_k)   K: (T_k, d_k)   V: (T_k, d_v)   output: (T_q, d_v)
```

In **self-attention**, `Q`, `K` and `V` all come from the same sequence. In **cross-attention**, `Q` comes from one sequence, and `K` and `V` come from another. Each output is a mixture of value rows, so the output length follows the query and the output width follows the value.

Why divide by `sqrt(d_k)`? If the components of `q` and `k` are independent with unit variance, `q·k` has variance `d_k`. At large dimension, the scores spread out, softmax saturates towards one key, and the gradients become small.

```python run=dl-c02-scale
import numpy as np

rng = np.random.default_rng(0)
print("   d  std(q.k)  sqrt(d)  largest weight, unscaled  scaled")
for d in (4, 64, 512, 1024):
    q = rng.normal(size=(200, 1, d))
    k = rng.normal(size=(200, 8, d))
    s = (q * k).sum(-1)                  # (200, 8) scores against 8 keys
    def top(x):
        x = x - x.max(1, keepdims=True)
        w = np.exp(x) / np.exp(x).sum(1, keepdims=True)
        return w.max(1).mean()
    print(f"{d:4}  {s.std():8.2f}  {d ** 0.5:7.2f}  {top(s):24.3f}  {top(s / d ** 0.5):6.3f}")
```

The standard deviation of the scores tracks `sqrt(d)`. Without scaling, the largest of 8 weights averages 0.97 at `d = 1024`, so attention is close to picking a single key. With scaling, it stays near 0.35 at every dimension.

Two kinds of mask appear in practice. A **padding mask** stops attention to padding tokens in a batch of varying lengths. A **causal mask** stops a decoder position from seeing later positions. Set masked scores to a large negative value before the softmax, so the remaining weights still sum to 1.

Attention has `O(T^2)` time and memory in sequence length, since every query scores every key. That is the main cost that long sequences and high-resolution images run into, and windowed attention (as in Swin) is one response.

:::trap Boolean masks mean opposite things
In `F.scaled_dot_product_attention`, `True` means "may attend". In `nn.MultiheadAttention` and `nn.Transformer`, `True` means "blocked". Also, `nn.MultiheadAttention` expects `(T, B, D)` unless you pass `batch_first=True`. A wrong axis order runs without error, and it attends across the batch instead of along the sequence.
:::

## Multi-head attention {#ch02-mha .th}

One attention gives one weighting per query. **Multi-head attention** projects to `h` lower-dimensional spaces with `d_k = d_model / h`, runs attention in each, concatenates, and applies a final linear layer. Each head can capture a different relation, and the total cost stays about the same as one full-width head.

Tensor shapes in the usual implementation, with batch `B` and length `T`:

```text
x: (B, T, d)  -> W_q, W_k, W_v -> (B, T, d)
split:        -> (B, h, T, d_k)
scores:       -> (B, h, T, T)
output:       -> (B, h, T, d_k) -> merge (B, T, d) -> W_o -> (B, T, d)
```

The projections have size `d × d` whatever `h` is, so **adding heads doesn't add parameters** in this form. Counts for the original transformer's sizes (`d = 512`, `d_ff = 2048`) and for ViT-B/16 (`d = 768`, `d_ff = 3072`, 12 blocks, 16×16 patches):

```python run=dl-c02-count
linear = lambda a, b: a * b + b
mha = lambda d: 4 * linear(d, d)                 # W_q, W_k, W_v, W_o with bias
ffn = lambda d, ff: linear(d, ff) + linear(ff, d)
ln = lambda d: 2 * d

def encoder_layer(d, ff):
    return mha(d) + ffn(d, ff) + 2 * ln(d)

def decoder_layer(d, ff):
    return 2 * mha(d) + ffn(d, ff) + 3 * ln(d)

print(f"MHA, d=512 (any h dividing 512): {mha(512):,}")
print(f"encoder layer, d=512, ff=2048:   {encoder_layer(512, 2048):,}")
print(f"decoder layer, d=512, ff=2048:   {decoder_layer(512, 2048):,}")

d, patch, size = 768, 16, 224
tokens = (size // patch) ** 2
vit = {"patch projection": linear(3 * patch * patch, d), "class token": d, "position embedding": (tokens + 1) * d,
       "12 encoder layers": 12 * encoder_layer(d, 3072), "final norm": ln(d), "head, 1000 classes": linear(d, 1000)}
print(f"patches {tokens}, tokens with class token {tokens + 1}")
for name, count in vit.items():
    print(f"  {name:20} {count:>12,}")
print(f"  {'ViT-B/16 total':20} {sum(vit.values()):>12,}")
```

Bias choices change these numbers slightly, and embedding tables aren't included for the original transformer, since they depend on vocabulary size. Notice that in the ViT, nearly all parameters are in the encoder layers, and the attention and MLP in a layer are about one third and two thirds of it, which is typical at `d_ff = 4d`.

## Positional encoding {#ch02-pos .th}

Self-attention treats its input as a set: permute the tokens and the outputs permute the same way, so without extra information the model can't see order. The original transformer added fixed sinusoids to the embeddings:

```text
PE(pos, 2i)   = sin(pos / 10000^(2i/d))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
```

Each pair is a clock at a different frequency. A shift by `k` rotates each pair by a fixed angle, so `PE(pos + k)` is a linear function of `PE(pos)`, which makes relative offsets easy to represent. Many models use **learned** position embeddings instead (ViT does), and others build relative positions into the attention itself. A learned table has a fixed size, so a ViT at a new resolution has to interpolate its table.

```python run=dl-c02-pos
import numpy as np

def pos_encoding(T, d):
    pos = np.arange(T)[:, None]
    freq = 1 / 10000 ** (np.arange(0, d, 2) / d)
    pe = np.zeros((T, d))
    pe[:, 0::2], pe[:, 1::2] = np.sin(pos * freq), np.cos(pos * freq)
    return pe

pe = pos_encoding(200, 128)
print("norm at 0, 7, 199:", [round(float(np.linalg.norm(pe[p])), 3) for p in (0, 7, 199)])
print("similarity of pos 0 to 1, 10, 100:", [round(float(pe[0] @ pe[p]) / 64, 3) for p in (1, 10, 100)])

def attend(x):
    s = x @ x.T / x.shape[1] ** 0.5
    s -= s.max(1, keepdims=True)
    return (np.exp(s) / np.exp(s).sum(1, keepdims=True)) @ x

rng = np.random.default_rng(0)
x = rng.normal(size=(6, 128))
perm = rng.permutation(6)
print("no position: attend(x[perm]) == attend(x)[perm]:", bool(np.allclose(attend(x[perm]), attend(x)[perm])))
y = x + pe[:6]
print("with position added after permuting, equal:     ", bool(np.allclose(attend(x[perm] + pe[:6]), attend(y)[perm])))
```

Every vector has norm 8 (`sqrt(d/2)`), so position vectors differ in direction only. Nearby positions are more similar, and similarity falls with distance. The two equality checks confirm that self-attention alone ignores order, and that adding positions breaks that symmetry.

## Encoder and decoder blocks {#ch02-blocks .th}

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 330" role="img" aria-label="Encoder block with self-attention and feed-forward, decoder block with masked self-attention, cross-attention and feed-forward. Encoder output feeds keys and values of the decoder's cross-attention.">
  <text x="170" y="20" text-anchor="middle" class="t-bold">Encoder block (N times)</text>
  <text x="520" y="20" text-anchor="middle" class="t-bold">Decoder block (N times)</text>
  <rect x="70" y="240" width="200" height="40" rx="5" class="d-acc"/><text x="170" y="264" text-anchor="middle" class="t-mono">self-attention</text>
  <rect x="70" y="130" width="200" height="40" rx="5" class="d-key"/><text x="170" y="154" text-anchor="middle" class="t-mono">feed-forward (2 layers)</text>
  <rect x="420" y="240" width="200" height="40" rx="5" class="d-acc"/><text x="520" y="264" text-anchor="middle" class="t-mono">masked self-attention</text>
  <rect x="420" y="160" width="200" height="40" rx="5" class="d-rs"/><text x="520" y="184" text-anchor="middle" class="t-mono">cross-attention</text>
  <rect x="420" y="80" width="200" height="40" rx="5" class="d-key"/><text x="520" y="104" text-anchor="middle" class="t-mono">feed-forward (2 layers)</text>
  <path d="M170 318 V280 M170 240 V170 M170 130 V60" class="d-line"/>
  <path d="M520 318 V280 M520 240 V200 M520 160 V120 M520 80 V40" class="d-line"/>
  <text x="170" y="52" text-anchor="middle" class="t-small">encoder output (memory)</text>
  <text x="190" y="314" class="t-small">source tokens + positions</text>
  <text x="540" y="314" class="t-small">shifted target + positions</text>
  <path d="M170 60 H340 V180 H420" class="d-line-key"/><text x="348" y="176" class="t-small t-key">K, V</text>
  <text x="530" y="226" class="t-small">Q</text>
  <text x="280" y="225" class="t-small">each sublayer: residual + layer norm</text>
</svg></div><figcaption><b>The two block types.</b> Both wrap each sublayer in a residual connection and layer norm. The decoder's cross-attention takes its queries from the target side and its keys and values from the encoder.</figcaption></figure>

The **feed-forward network** applies the same two-layer MLP to each position. Attention mixes across positions, and the FFN mixes across features at each position. Attention by itself is a weighted average of value vectors, so it needs the FFN for per-position nonlinearity.

The original transformer used **post-norm**: `x = LN(x + Sublayer(x))`. Many later models use **pre-norm**: `x = x + Sublayer(LN(x))`, which trains more stably in deep stacks. PyTorch's `nn.TransformerEncoderLayer` defaults to post-norm, and you select pre-norm with `norm_first=True`.

In **training**, the decoder sees the target shifted right by one and the causal mask, which is **teacher forcing**. It runs all positions in parallel. At **inference**, it generates one token at a time, and feeds each output back in. A key-value cache avoids recomputing earlier positions.

```python
import torch.nn as nn, torch.nn.functional as F

layer = nn.TransformerEncoderLayer(d_model=512, nhead=8, dim_feedforward=2048,
                                   batch_first=True, norm_first=True)
enc = nn.TransformerEncoder(layer, num_layers=6)
out = enc(x, src_key_padding_mask=pad)      # pad: (B, T), True where padded

# the core operation, with a boolean mask where True means "may attend"
y = F.scaled_dot_product_attention(q, k, v, attn_mask=mask)
```

## The vision transformer idea {#ch02-vit .th}

A **vision transformer (ViT)** treats an image as a sequence. It cuts the image into fixed patches, flattens each and projects it to `d` dimensions, adds a learned position embedding, prepends a learned **class token**, and runs a standard pre-norm encoder. A head reads the class token, or an average of the tokens. A 224×224 image with 16×16 patches gives `14 × 14 = 196` patch tokens plus one, or 197 tokens.

The patch projection is equal to a convolution with kernel and stride both set to the patch size, since the kernel is just the projection matrix reshaped. Most code implements it that way.

A ViT has much less built-in bias than a CNN. There is no locality beyond the patch, and no translation equivariance apart from the patch projection. It must learn these from data, so it typically needs a lot of data, strong augmentation or pretraining to do well. In exchange, every token can attend globally from the first layer, while a CNN grows its receptive field over depth. Later models, such as Swin, add a hierarchy and local windows.

:::tip What to say about CNN versus ViT
Name the trade-off in terms of inductive bias, data needs and compute, and mention that pretrained weights change the picture. On a small dataset, without pretrained weights, a CNN is the safer first choice. Avoid claiming either wins in general.
:::

## Drills {#ch02-drills .dr}

:::drill output
Input is `3 × 32 × 32`. Apply Conv(16, k=3, s=1, p=1), MaxPool(2), Conv(32, k=3, s=2, p=1), Conv(64, k=3, s=1, p=0). Give each output shape, and the size of the flattened vector.

```python run=dl-c02-d-shape
def out(n, k, s=1, p=0):
    return (n + 2 * p - k) // s + 1

n = out(32, 3, 1, 1); print(16, n, n)
n = out(n, 2, 2, 0); print(16, n, n)
n = out(n, 3, 2, 1); print(32, n, n)
n = out(n, 3, 1, 0); print(64, n, n)
print("flat", 64 * n * n)
```
---
**Answer.** `16×32×32`, `16×16×16`, `32×8×8`, `64×6×6`, and a flat size of 2304.

**Why.** Use the formula at each step. A follow-up may ask for the size after a change to the input resolution: the first linear layer breaks unless you add global pooling.
:::

:::drill concept
Why use two 3×3 convolutions rather than one 5×5?
---
**Answer.** They have the same receptive field, 5. With `C` channels and no bias, the two 3×3 layers cost `18 C²` against `25 C²`, and they add one more nonlinearity.

**Why.** The extra nonlinearity gives more expressive functions, and fewer parameters mean less overfitting. The trade-off is slightly more layers to run.
:::

:::drill tricky
Is a CNN translation invariant?
---
**Answer.** Convolution is approximately equivariant: features shift with the input. Invariance comes later, from pooling and global averaging, and it is only approximate.

**Why.** Strides and pooling break exact equivariance, since a 1-pixel shift can change the downsampled output a lot. This is the aliasing problem, and anti-aliased pooling reduces it.
:::

:::drill bug
A skip connection fails at run time with a size mismatch at `out + x`. Why, and what is the fix?

```python
def forward(self, x):
    out = self.bn2(self.conv2(F.relu(self.bn1(self.conv1(x)))))  # conv1 has stride=2, 64 -> 128
    return F.relu(out + x)
```
---
**Answer.** `out` has half the spatial size and twice the channels of `x`. Project the skip: `self.down = nn.Sequential(nn.Conv2d(64, 128, 1, stride=2, bias=False), nn.BatchNorm2d(128))`, then use `out + self.down(x)`.

**Why.** The sum needs identical shapes. Concatenation, as in DenseNet, joins along channels, and needs only matching spatial size.
:::

:::drill tricky
Do residual connections help with vanishing gradients only?
---
**Answer.** No. They also make identity easy to represent, so extra depth doesn't have to hurt. Studies of the loss surface also suggest that it becomes smoother.

**Why.** Batch norm already helped signals reach deep plain networks, and they still showed higher training error than shallower ones. So gradient flow can't be the whole story.
:::

:::drill concept
Why does an LSTM suffer less from vanishing gradients than a vanilla RNN? Does it remove the problem?
---
**Answer.** The cell state is updated additively, gated by `f`. With `f` near 1, the Jacobian across a step is near identity on that path. It reduces the problem, and does not remove it.

**Why.** A vanilla RNN multiplies by `W` and a squashing slope each step. Over long gaps, LSTM gradients can still decay, and they can still explode, so clipping remains normal.
:::

:::drill concept
Why does scaled dot-product attention divide by `sqrt(d_k)`? What happens if you skip it?
---
**Answer.** It keeps score variance near 1. Without it, the scores grow with dimension, softmax saturates, and the gradients become very small.

**Why.** Assume independent unit-variance components. The dot product is a sum of `d_k` terms, each of variance 1, so its variance is `d_k`. Divide by `sqrt(d_k)` to bring it back to 1.
:::

:::drill bug
Weights in this attention don't sum to 1 per query, and the results are wrong. Find it.

```python
scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)   # (B, T_q, T_k)
weights = scores.softmax(dim=-2)
output = weights @ V
```
---
**Answer.** Softmax must run over keys, `dim=-1`. With `dim=-2`, it normalises over queries.

**Why.** Each row of `weights` is one query's distribution over keys. In a square self-attention, the shapes match either way, so there is no error.
:::

:::drill bug
A language model has near-perfect training accuracy, and generates garbage at inference. Its decoder call is below. What is the likely bug?

```python
out = decoder(tgt_embed(tgt_in), memory)   # no tgt_mask
```
---
**Answer.** There is no causal mask, so during training each position can see the token it must predict.

**Why.** The model learns to copy from the future. Inference has no future to copy, which explains the gap. Add `tgt_mask=nn.Transformer.generate_square_subsequent_mask(T)`.
:::

:::drill tricky
What are the differences between a padding mask and a causal mask? Would you ever use both?
---
**Answer.** A padding mask varies per sample, and hides padded positions. A causal mask is the same triangular pattern for all samples, and hides the future. A decoder over batched sequences uses both, combined with a logical OR on the blocked positions.

**Why.** Encoders generally need only the padding mask. Forgetting it lets padding tokens leak into results, and output changes with batch composition.
:::

:::drill concept
Why does a ViT generally need more data, or pretraining, than a CNN?
---
**Answer.** It lacks a CNN's built-in locality and translation equivariance, so it has to learn these from data.

**Why.** Less inductive bias allows more flexibility, and it takes more examples to constrain. Pretraining, including self-supervised methods, and heavy augmentation offset this.
:::

:::drill tricky
You feed 384×384 images to a ViT trained at 224×224 with 16×16 patches. What breaks and what doesn't?
---
**Answer.** The patch projection and the encoder work as they are, with 576 patch tokens rather than 196. The learned position table has the wrong size, so interpolate it as a 2D grid from 14×14 to 24×24, keeping the class token's entry apart.

**Why.** Attention parameters don't depend on sequence length, and the table does. Cost rises with the square of the token count, so memory use goes up too.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1300
Write `conv2d` from scratch for `(C, H, W)` input, with stride and padding. Check its output shape against the formula, show that it doesn't flip the kernel, and show translation equivariance on an impulse.
---
Each output channel sums a correlation with its kernel over all input channels.

```python run=dl-c02-c-conv
import numpy as np

def conv2d(x, w, stride=1, padding=0):
    # x: (C_in, H, W), w: (C_out, C_in, k, k)
    k = w.shape[-1]
    x = np.pad(x, ((0, 0), (padding, padding), (padding, padding)))
    H = (x.shape[1] - k) // stride + 1
    W = (x.shape[2] - k) // stride + 1
    out = np.zeros((w.shape[0], H, W))
    for i in range(H):
        for j in range(W):
            patch = x[:, i * stride:i * stride + k, j * stride:j * stride + k]
            out[:, i, j] = (w * patch).sum(axis=(1, 2, 3))
    return out

rng = np.random.default_rng(0)
x = rng.normal(size=(3, 11, 11))
w = rng.normal(size=(8, 3, 3, 3))
print("shape", conv2d(x, w, stride=2, padding=1).shape, "formula", (11 + 2 - 3) // 2 + 1)
print("params with bias", w.size + w.shape[0])

imp = np.zeros((1, 5, 5)); imp[0, 2, 2] = 1
kernel = np.array([[[[1.0, 2, 3], [4, 5, 6], [7, 8, 9]]]])
print("impulse response, framework style (flipped kernel appears):")
print(conv2d(imp, kernel, padding=1)[0, 1:4, 1:4].astype(int).tolist())
print("np.convolve flips, framework conv doesn't:",
      np.convolve([0, 1, 0], [1, 2, 3], mode="same").tolist(), np.correlate([0, 1, 0], [1, 2, 3], mode="same").tolist())

shifted = np.roll(imp, (1, 1), axis=(1, 2))
a = conv2d(imp, kernel, padding=1)
print("equivariant:", bool(np.array_equal(np.roll(a, (1, 1), axis=(1, 2)), conv2d(shifted, kernel, padding=1))))
```

The impulse response is the kernel rotated by 180 degrees, because each output position reads the impulse from a different kernel cell. A true convolution would reproduce the kernel unrotated. Equivariance holds here because the response stays inside the image, so `np.roll` doesn't wrap anything real.
:::

:::drill code rating=1500
Write scaled dot-product attention with a mask, multi-head attention, and pre-norm encoder and decoder blocks. Test that masked weights are zero, that a causal decoder ignores future tokens, and that a padding mask makes the output independent of padded content.
---
These tests are the same ones to write for a real model, and they catch most masking bugs.

```python run=dl-c02-c-attn
import numpy as np

def attention(Q, K, V, mask=None):
    s = Q @ np.swapaxes(K, -1, -2) / np.sqrt(Q.shape[-1])
    if mask is not None:                     # mask: True means may attend
        s = np.where(mask, s, -1e9)
    s = s - s.max(-1, keepdims=True)
    w = np.exp(s) / np.exp(s).sum(-1, keepdims=True)
    return w @ V, w

class MultiHead:
    def __init__(self, d, h, rng):
        self.h, self.dk = h, d // h
        self.W = {n: rng.normal(0, 1 / d ** 0.5, (d, d)) for n in "qkvo"}
    def __call__(self, q, k, v, mask=None):
        def split(x, name):
            B, T, _ = x.shape
            return (x @ self.W[name]).reshape(B, T, self.h, self.dk).transpose(0, 2, 1, 3)
        out, w = attention(split(q, "q"), split(k, "k"), split(v, "v"), mask)
        B, _, T, _ = out.shape
        return out.transpose(0, 2, 1, 3).reshape(B, T, -1) @ self.W["o"], w

def norm(x):
    return (x - x.mean(-1, keepdims=True)) / np.sqrt(x.var(-1, keepdims=True) + 1e-5)

class FFN:
    def __init__(self, d, ff, rng):
        self.a, self.b = rng.normal(0, 1 / d ** 0.5, (d, ff)), rng.normal(0, 1 / ff ** 0.5, (ff, d))
    def __call__(self, x):
        return np.maximum(x @ self.a, 0) @ self.b

class Encoder:
    def __init__(self, d, h, ff, rng):
        self.att, self.ffn = MultiHead(d, h, rng), FFN(d, ff, rng)
    def __call__(self, x, mask=None):
        n = norm(x)
        x = x + self.att(n, n, n, mask)[0]
        return x + self.ffn(norm(x))

class Decoder:
    def __init__(self, d, h, ff, rng):
        self.self_att, self.cross, self.ffn = MultiHead(d, h, rng), MultiHead(d, h, rng), FFN(d, ff, rng)
    def __call__(self, y, memory, causal):
        n = norm(y)
        y = y + self.self_att(n, n, n, causal)[0]
        y = y + self.cross(norm(y), memory, memory)[0]
        return y + self.ffn(norm(y))

rng = np.random.default_rng(0)
B, S, T, d, h = 2, 6, 4, 32, 4
src, tgt = rng.normal(size=(B, S, d)), rng.normal(size=(B, T, d))
enc, dec = Encoder(d, h, 64, rng), Decoder(d, h, 64, rng)
causal = np.tril(np.ones((T, T), dtype=bool))

memory = enc(src)
print("encoder output", memory.shape, "decoder output", dec(tgt, memory, causal).shape)

_, w = MultiHead(d, h, rng)(tgt, tgt, tgt, causal)
print("weights", w.shape, "rows sum to 1:", bool(np.allclose(w.sum(-1), 1)), "future weights zero:", bool((w[..., ~causal] < 1e-9).all()))
_, w = MultiHead(d, h, rng)(tgt, src, src)
print("cross-attention weights", w.shape)

changed = tgt.copy(); changed[:, 3] += 100.0            # change only the last target token
a, b = dec(tgt, memory, causal), dec(changed, memory, causal)
print("causal: outputs 0-2 unchanged:", bool(np.allclose(a[:, :3], b[:, :3])), " output 3 changed:", not np.allclose(a[:, 3], b[:, 3]))

pad = np.ones((B, 1, 1, S), dtype=bool); pad[:, :, :, 4:] = False   # positions 4, 5 are padding
other = src.copy(); other[:, 4:] = rng.normal(size=(B, 2, d))
a, b = enc(src, pad), enc(other, pad)
print("padding: real tokens unchanged:", bool(np.allclose(a[:, :4], b[:, :4])))
a, b = enc(src), enc(other)
print("no mask: real tokens unchanged:", bool(np.allclose(a[:, :4], b[:, :4])))
```

Weights have shape `(B, h, T_q, T_k)`. For cross-attention, this is `(2, 4, 4, 6)`: each of 4 target queries spreads over 6 source tokens, in each head. Without the padding mask, changing the padded content changes the real tokens' outputs, which is the batch-composition bug in the drills.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- Conv output: `floor((n + 2p - d(k-1) - 1)/s) + 1`. Transposed: `(n-1)s - 2p + k + output_padding`.
- Conv params: `k*k*(C_in/groups)*C_out`, plus `C_out` for bias. Independent of image size. `bias=False` before batch norm.
- Frameworks' "conv" is cross-correlation, and there is no kernel flip. Say transposed convolution, and avoid "deconvolution".
- Receptive field: `r += d(k-1)*j`, `j *= s`. Pooling counts. The effective field is smaller than the theoretical one.
- Residual: `x + F(x)`. Identity is easy, Jacobian `I + dF/dx`. Project the skip when shapes change. ResNet-18 has about 11.7M parameters, ResNet-50 about 25.6M.
- LSTM: additive cell, gates, reduced vanishing. RNN processes one step at a time.
- Attention: `softmax(QK^T/sqrt(d_k))V`. Output length follows `Q`, width follows `V`. `O(T^2)`.
- `sqrt(d_k)` keeps score variance near 1 so softmax doesn't saturate.
- Multi-head: `d_k = d/h`, params `4(d^2 + d)` independent of `h`.
- Self-attention is permutation equivariant, so it needs positions. Sinusoidal or learned, and interpolate a learned table at new resolutions.
- Encoder: self-attention, FFN. Decoder: masked self-attention, cross-attention (Q from decoder, K and V from encoder), FFN. Residual and layer norm around each.
- Masks: padding per sample, causal triangular. Check whether `True` means blocked or allowed in your API.
- ViT: patches, projection, class token, positions, encoder. 224 at patch 16 gives 197 tokens. ViT-B/16 has about 86.6M parameters. Less inductive bias, so more data or pretraining.
