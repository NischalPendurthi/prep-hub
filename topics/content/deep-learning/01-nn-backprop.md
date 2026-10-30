---
title: Neural network operations and backprop
part: Part A · Foundations
lede: A neural network is a stack of differentiable operations, and training is repeated gradient descent on a scalar loss. This chapter explains what each piece does and why it is there, from activations and losses through reverse-mode autodiff, initialisation and normalisation, to optimisers and the routine for debugging a training run. You derive backprop by hand, check it numerically, and write a tiny autograd engine.
desc: layers, activations, losses, computation graphs, reverse-mode autodiff, initialisation, vanishing gradients, batch and layer norm, dropout, optimisers, overfitting, debugging
hours: 6
prereqs: Python and NumPy, matrix multiplication, the chain rule
---

## Layers, activations and what a network computes {#ch01-layers .th}

A **linear layer** computes `y = x @ W + b`. With input size `D` and output size `H`, `W` has shape `(D, H)` and `b` has shape `(H,)`, so it holds `D*H + H` parameters. Two linear layers in a row are still one linear map, because `(x @ A) @ B = x @ (A @ B)`. An elementwise nonlinearity between them is what lets a stack represent functions a single matrix cannot.

| Activation | Formula | Largest slope | Typical use | Main problem |
|---|---|---|---|---|
| ReLU | `max(0, x)` | 1 | Default in CNNs and MLPs | A unit that is negative for all inputs gets zero gradient ("dead ReLU") |
| Leaky ReLU | `max(a*x, x)` with small `a` | 1 | When dead units appear | One more hyperparameter |
| GELU | `x * Phi(x)`, `Phi` the Gaussian CDF | about 1.13 | Transformers | Costs slightly more to compute |
| Sigmoid | `1 / (1 + exp(-x))` | 0.25 | Binary or multi-label output, gates | Saturates, outputs are always positive |
| Tanh | `(e^x - e^-x) / (e^x + e^-x)` | 1 | RNN hidden states | Saturates |

Softmax is different from the others: it acts on a whole vector and maps logits to a probability distribution. Use it on the output for reading probabilities, and let the loss work from logits during training.

Saturated sigmoid and tanh units pass almost no gradient: at `|x| = 6` their slopes are about 0.0025 and 0.00002. ReLU has slope 1 on its positive side and 0 on its negative side.

### Losses {#ch01-losses}

For regression, the usual choices are MSE (Gaussian noise assumption, punishes outliers), L1 (robust, constant gradient size) and Huber (MSE near zero, L1 far away). For classification, use **cross-entropy**: the negative log probability of the correct class. Minimising it is maximum likelihood under a categorical model.

Why not MSE on a sigmoid output? Compare the gradient with respect to the logit `z` when the target is 1.

```python run=dl-c01-ce-vs-mse
import numpy as np

print("    z       p  BCE grad  MSE grad")
for z in (-6.0, -2.0, 0.0, 2.0, 6.0):
    p = 1 / (1 + np.exp(-z))
    print(f"{z:5.1f}  {p:6.4f}  {-(1 - p):8.4f}  {(p - 1) * p * (1 - p):8.4f}")
```

At `z = -6` the model is confidently wrong. Cross-entropy gives a gradient close to -1, the strongest push it can give, while MSE gives about -0.0025, since the `p * (1 - p)` factor from the sigmoid survives. Cross-entropy's log cancels that factor.

Compute the loss from logits. With logits such as `[1000, 0, -1000]`, a naive `exp` overflows to infinity and gives NaN, while subtracting the largest logit first keeps everything finite. That is the log-sum-exp trick used inside the framework losses.

:::trap Softmax twice
PyTorch's `nn.CrossEntropyLoss` expects raw logits and applies log-softmax itself. Adding `softmax` in your model's forward method raises no error, but it squashes the gradients and training is slow or stalls. For binary and multi-label problems, the same logic applies to `nn.BCEWithLogitsLoss` against sigmoid plus `nn.BCELoss`.
:::

## Computation graphs and reverse-mode autodiff {#ch01-autodiff .th}

Any network is a directed acyclic graph of primitive operations with known local derivatives. **Reverse-mode automatic differentiation** walks that graph in reverse topological order and applies the chain rule. Each node receives `dL/d(node)` from its consumers, and passes `dL/d(node) * d(node)/d(input)` on to each of its inputs. **Backpropagation** is the name for this algorithm when it is applied to a neural network loss.

Take `L = (w*x + b - t)^2` with `w=2, x=3, b=1, t=4`.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 230" role="img" aria-label="Computation graph for L equals w times x plus b minus t squared, with forward values in each node and backward gradients under each node">
  <rect x="10" y="20" width="84" height="32" rx="5" class="d-soft"/><text x="52" y="41" text-anchor="middle" class="t-mono">w = 2</text>
  <text x="52" y="68" text-anchor="middle" class="t-small t-key">dL/dw = 18</text>
  <rect x="10" y="130" width="84" height="32" rx="5" class="d-soft"/><text x="52" y="151" text-anchor="middle" class="t-mono">x = 3</text>
  <text x="52" y="178" text-anchor="middle" class="t-small t-key">dL/dx = 12</text>
  <rect x="150" y="74" width="100" height="32" rx="5" class="d-box"/><text x="200" y="95" text-anchor="middle" class="t-mono">a = w*x = 6</text>
  <text x="200" y="122" text-anchor="middle" class="t-small t-key">dL/da = 6</text>
  <rect x="150" y="170" width="84" height="32" rx="5" class="d-soft"/><text x="192" y="191" text-anchor="middle" class="t-mono">b = 1</text>
  <text x="192" y="218" text-anchor="middle" class="t-small t-key">dL/db = 6</text>
  <rect x="300" y="74" width="100" height="32" rx="5" class="d-box"/><text x="350" y="95" text-anchor="middle" class="t-mono">y = a+b = 7</text>
  <text x="350" y="122" text-anchor="middle" class="t-small t-key">dL/dy = 6</text>
  <rect x="300" y="170" width="84" height="32" rx="5" class="d-soft"/><text x="342" y="191" text-anchor="middle" class="t-mono">t = 4</text>
  <rect x="450" y="74" width="100" height="32" rx="5" class="d-box"/><text x="500" y="95" text-anchor="middle" class="t-mono">e = y-t = 3</text>
  <text x="500" y="122" text-anchor="middle" class="t-small t-key">dL/de = 6</text>
  <rect x="600" y="74" width="100" height="32" rx="5" class="d-acc"/><text x="650" y="95" text-anchor="middle" class="t-mono">L = e*e = 9</text>
  <text x="650" y="122" text-anchor="middle" class="t-small t-key">dL/dL = 1</text>
  <path d="M94 36 L 150 84" class="d-line"/><path d="M94 146 L 150 96" class="d-line"/><path d="M250 90 L 300 90" class="d-line"/><path d="M234 186 L 300 100" class="d-line"/><path d="M400 90 L 450 90" class="d-line"/><path d="M384 186 L 450 100" class="d-line"/><path d="M550 90 L 600 90" class="d-line"/>
</svg></div><figcaption><b>Forward values in the boxes, gradients beneath them.</b> Values flow left to right. Gradients flow right to left, and each one is its consumer's gradient times a local derivative. For example, <code>dL/dw = dL/da * x = 6 * 3 = 18</code>.</figcaption></figure>

### Why reverse mode {#ch01-modes}

Automatic differentiation has two modes. **Forward mode** pushes a tangent along with the values, so one pass gives the derivative of all outputs with respect to one input. **Reverse mode** gives the derivative of one output with respect to all inputs. For `f: R^n -> R^m`, a full Jacobian costs about `n` forward passes or `m` reverse passes. A loss has `m = 1` and `n` in the millions, so reverse mode wins by a huge factor: a gradient costs a small constant times one forward evaluation. The price is memory, since the intermediates must be kept for the backward pass.

### Backprop through an MLP, in matrices {#ch01-matrix}

For a two-layer ReLU classifier, the backward pass mirrors the forward pass, and each gradient has the shape of its parameter. A **gradient check** compares it with central differences on a small problem. Run one whenever you hand-write a gradient.

```python run=dl-c01-mlp-grad
import numpy as np

rng = np.random.default_rng(0)
N, D, H, C = 8, 5, 4, 3
X, y = rng.normal(size=(N, D)), rng.integers(0, C, N)
P = {"W1": rng.normal(0, 0.5, (D, H)), "b1": np.zeros(H), "W2": rng.normal(0, 0.5, (H, C)), "b2": np.zeros(C)}
rows = np.arange(N)

def loss_grads(P):
    z = X @ P["W1"] + P["b1"]          # (N, H)
    h = np.maximum(z, 0)
    s = h @ P["W2"] + P["b2"]          # (N, C) logits
    s0 = s - s.max(1, keepdims=True)
    p = np.exp(s0) / np.exp(s0).sum(1, keepdims=True)
    L = -np.log(p[rows, y]).mean()
    ds = p.copy()
    ds[rows, y] -= 1
    ds /= N                            # dL/ds
    dz = (ds @ P["W2"].T) * (z > 0)    # dL/dz: through W2, then the ReLU mask
    return L, {"W1": X.T @ dz, "b1": dz.sum(0), "W2": h.T @ ds, "b2": ds.sum(0)}

L, G = loss_grads(P)
print(f"loss {L:.3f}", {k: v.shape for k, v in G.items()})
worst, eps = 0.0, 1e-5
for k in P:
    for idx in np.ndindex(P[k].shape):
        old = P[k][idx]
        P[k][idx] = old + eps; up = loss_grads(P)[0]
        P[k][idx] = old - eps; down = loss_grads(P)[0]
        P[k][idx] = old
        num = (up - down) / (2 * eps)
        worst = max(worst, abs(num - G[k][idx]) / max(1e-8, abs(num) + abs(G[k][idx])))
print("worst relative error below 1e-5:", bool(worst < 1e-5))
```

In PyTorch the same thing takes one call. The points people get asked about are what accumulates and what is tracked.

```python
import torch

x = torch.tensor([3.0])
w = torch.tensor([2.0], requires_grad=True)
loss = (w * x - 4.0) ** 2
loss.backward()            # fills w.grad; frees the graph unless retain_graph=True
w.grad                     # grads ADD UP across backward() calls until you zero them

with torch.no_grad():      # no graph is recorded: use for inference and manual updates
    w -= 0.1 * w.grad
w.grad.zero_()

z = (w * x).detach()       # z shares data with w*x but gradients stop here
```

## Initialisation and vanishing gradients {#ch01-init .th}

If all weights in a layer start equal, all hidden units compute the same thing and receive the same gradient, so they stay identical forever. Random initialisation breaks that symmetry.

The scale matters too. For `y = sum(w_i * x_i)` with independent zero-mean terms, `Var(y) = n * Var(w) * Var(x)`. To keep variance steady across layers, choose `Var(w)` near `1/n`.

- **Xavier (Glorot)** uses `Var(w) = 2 / (n_in + n_out)`, derived for activations that are roughly linear near zero, such as tanh.
- **He (Kaiming)** uses `Var(w) = 2 / n_in`, since ReLU zeroes half of its inputs and so halves the second moment.

The program pushes random data through 20 layers and prints the activation standard deviation at some depths.

```python run=dl-c01-init
import numpy as np

relu = lambda x: np.maximum(x, 0)

def run(act, std, width=128, n=500, depth=20):
    rng = np.random.default_rng(0)
    x = rng.normal(size=(n, width))
    out = []
    for layer in range(1, depth + 1):
        x = act(x @ rng.normal(0, std, (width, width)))
        if layer in (1, 5, 10, 20):
            out.append(f"{x.std():.2e}")
    return out

n = 128
print("layer                   1         5         10        20")
for name, act, std in [("tanh, std 0.01", np.tanh, 0.01), ("tanh, Xavier", np.tanh, (1 / n) ** 0.5),
                       ("ReLU, Xavier", relu, (1 / n) ** 0.5), ("ReLU, He", relu, (2 / n) ** 0.5)]:
    print(f"{name:16}", "  ".join(run(act, std)))
```

With a very small initialisation, tanh is close to linear and each layer multiplies the signal by a small factor, so the activations shrink to about `1e-19`. Xavier with tanh decays slowly (tanh only compresses), and stays usable at 0.156. Xavier with ReLU loses roughly half the variance per layer, and reaches about `8e-4` at depth 20. He with ReLU stays near 0.9 all the way down. The single numbers wander because one random draw of finite width is a noisy estimate of the theory.

### Vanishing and exploding gradients {#ch01-vanish}

The gradient at an early layer is a product of one Jacobian per later layer. If those Jacobians shrink vectors, the gradient decays exponentially with depth, and if they stretch vectors it blows up. Sigmoid's slope is at most 0.25, so ten sigmoid layers contribute at most `0.25^10`, about `1e-6`, from slopes alone.

```python run=dl-c01-vanish
import numpy as np

def grad_norms(act, dact, std, depth=20, width=64, n=128):
    rng = np.random.default_rng(0)
    h = rng.normal(size=(n, width))
    Ws = [rng.normal(0, std, (width, width)) for _ in range(depth)]
    W_out = rng.normal(0, std, (width, 1))
    y = rng.normal(size=(n, 1))
    trail = []
    for W in Ws:
        z = h @ W
        trail.append((h, W, dact(z)))
        h = act(z)
    g = (h @ W_out - y) @ W_out.T / n        # dL/dh for 0.5 * mean squared error
    norms = {}
    for layer in range(depth, 0, -1):
        h_in, W, slope = trail[layer - 1]
        dz = g * slope
        norms[layer] = np.linalg.norm(h_in.T @ dz)
        g = dz @ W.T
    return norms

sig = lambda x: 1 / (1 + np.exp(-x))
n = 64
nets = [("sigmoid, Xavier", sig, lambda z: sig(z) * (1 - sig(z)), (1 / n) ** 0.5),
        ("tanh, Xavier", np.tanh, lambda z: 1 - np.tanh(z) ** 2, (1 / n) ** 0.5),
        ("ReLU, He", lambda z: np.maximum(z, 0), lambda z: (z > 0) * 1.0, (2 / n) ** 0.5)]
print("gradient norm at layer  1         5         10        15        20")
for name, act, dact, std in nets:
    g = grad_norms(act, dact, std)
    print(f"{name:22}", "  ".join(f"{g[l]:.2e}" for l in (1, 5, 10, 15, 20)))
```

The sigmoid network's gradient falls by about twelve orders of magnitude between layer 20 and layer 1, so its early layers would barely train. Tanh and ReLU, with matched initialisation, keep the norms within about one order of magnitude across depth at this starting point. That is a statement about initialisation only, since training can move units into saturation later.

The usual fixes are ReLU-family activations, correct initialisation, normalisation layers, residual connections (Chapter 2) and, for exploding gradients, **gradient clipping**. Clipping by global norm rescales all gradients together, so the direction is kept.

## Batch norm and layer norm {#ch01-norm .th}

Normalisation layers rescale activations to zero mean and unit variance, then apply a learned scale and shift. They differ in which axes the statistics are taken over.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 200" role="img" aria-label="Two grids of samples by features. Batch norm averages over one feature across samples. Layer norm averages over all features of one sample.">
  <text x="120" y="18" text-anchor="middle" class="t-bold">Batch norm</text>
  <text x="480" y="18" text-anchor="middle" class="t-bold">Layer norm</text>
  <g class="d-grid">
    <rect x="40" y="30" width="160" height="128"/><path d="M80 30 V158 M120 30 V158 M160 30 V158 M40 62 H200 M40 94 H200 M40 126 H200"/>
    <rect x="400" y="30" width="160" height="128"/><path d="M440 30 V158 M480 30 V158 M520 30 V158 M400 62 H560 M400 94 H560 M400 126 H560"/>
  </g>
  <rect x="80" y="30" width="40" height="128" class="d-acc"/>
  <rect x="400" y="62" width="160" height="32" class="d-key"/>
  <text x="120" y="176" text-anchor="middle" class="t-small">features</text>
  <text x="480" y="176" text-anchor="middle" class="t-small">features</text>
  <text x="26" y="98" text-anchor="middle" class="t-small" transform="rotate(-90 26 98)">samples</text>
  <text x="386" y="98" text-anchor="middle" class="t-small" transform="rotate(-90 386 98)">samples</text>
  <text x="240" y="90" class="t-small">one feature,</text><text x="240" y="106" class="t-small">across the batch</text>
  <text x="580" y="74" class="t-small">one sample,</text><text x="580" y="90" class="t-small">across its features</text>
</svg></div><figcaption><b>What each one averages over.</b> For an image batch <code>NCHW</code>, batch norm takes statistics over N, H and W for each channel. For a sequence batch <code>NLD</code>, layer norm usually takes them over D for each token.</figcaption></figure>

**Batch norm** uses the mini-batch's statistics in training and an exponential moving average of them at evaluation. That makes it depend on batch size, and it makes one sample's output depend on the rest of its batch. **Layer norm** computes statistics per sample, so train and eval behave the same, which is why transformers and RNNs use it. **Group norm** sits between them, and detection models trained with very small batches often use it.

Why batch norm helps is still discussed. The original paper's explanation was "internal covariate shift", and later work argued that the main effect is a smoother loss surface. In an interview, state what it does in practice: it allows larger learning rates, reduces sensitivity to initialisation, and adds some regularisation.

```python run=dl-c01-norm
import numpy as np

class BatchNorm1d:
    def __init__(self, c, momentum=0.1, eps=1e-5):
        self.gamma, self.beta = np.ones(c), np.zeros(c)     # learned
        self.mean, self.var = np.zeros(c), np.ones(c)       # buffers
        self.m, self.eps, self.training = momentum, eps, True
    def __call__(self, x):
        if self.training:
            mu, v = x.mean(0), x.var(0)
            self.mean = (1 - self.m) * self.mean + self.m * mu
            self.var = (1 - self.m) * self.var + self.m * v
        else:
            mu, v = self.mean, self.var
        return self.gamma * (x - mu) / np.sqrt(v + self.eps) + self.beta

def layer_norm(x, eps=1e-5):
    return (x - x.mean(1, keepdims=True)) / np.sqrt(x.var(1, keepdims=True) + eps)

rng = np.random.default_rng(0)
batch = lambda n: rng.normal(5.0, 2.0, size=(n, 4))

bn = BatchNorm1d(4)
fresh = BatchNorm1d(4)
for _ in range(200):
    bn(batch(64))
print(f"running mean {bn.mean.mean():.2f}, running var {bn.var.mean():.2f} (data: 5, 4)")

sample = batch(1)
others_a, others_b = batch(7), batch(7)
a = bn(np.vstack([sample, others_a]))[0]
b = bn(np.vstack([sample, others_b]))[0]
print("train mode, same sample in two batches, equal:", bool(np.allclose(a, b)))
print("layer norm, same sample in two batches, equal:",
      bool(np.allclose(layer_norm(np.vstack([sample, others_a]))[0], layer_norm(np.vstack([sample, others_b]))[0])))

bn.training = fresh.training = False
test = batch(1000)
print(f"eval, trained stats: output mean {bn(test).mean():.2f}, std {bn(test).std():.2f}")
print(f"eval, stats never updated: output mean {fresh(test).mean():.2f}, std {fresh(test).std():.2f}")
```

The last line reproduces a classic bug: if the running statistics were never updated (say, the layer stayed frozen or in eval mode), evaluation normalises with the initial mean of 0 and variance of 1, and the outputs keep the data's original scale.

:::trap Forgetting `model.eval()`
In `train()` mode, batch norm uses batch statistics and changes its running averages even during validation, and dropout keeps dropping. The symptoms are noisy validation metrics and results that change with batch size. `torch.no_grad()` does not switch modes: it only stops recording the graph. You usually want both.
:::

## Dropout {#ch01-dropout .th}

**Dropout** zeroes each activation with probability `p` during training and scales the survivors by `1/(1-p)`, which keeps the expected value unchanged. At evaluation it does nothing. This form is **inverted dropout**. It reduces co-adaptation, and it can be read as training an ensemble of thinned networks that share weights.

For an input of 1, the output has mean 1 and variance `p/(1-p)`, so dropout preserves the mean signal and adds noise. In PyTorch, `p` is the probability of dropping. Some older APIs took a keep probability, which is an easy way to get the opposite of what you meant. Stochastic depth (drop path) applies the same idea to whole residual branches, and it is common in vision transformers.

## Optimisers {#ch01-optim .th}

| Method | Update (gradient `g`) | Idea |
|---|---|---|
| SGD | `w -= lr * g` | Follow the noisy gradient |
| Momentum | `v = mu*v + g; w -= lr * v` | Average past gradients, which damps oscillation across a valley |
| Nesterov | Gradient evaluated at the looked-ahead point | Often a little more stable than plain momentum |
| RMSProp | `s = rho*s + (1-rho)*g^2; w -= lr * g / sqrt(s)` | Scale per parameter by recent gradient size |
| Adam | Momentum plus RMSProp, with bias correction | Default that needs less tuning |
| AdamW | Adam, with decay applied directly to the weights | Weight decay that is independent of gradient scaling |

Adam's defaults are `lr=1e-3, betas=(0.9, 0.999), eps=1e-8`. Both averages begin at zero, so bias correction divides them by `1 - beta^t`. With it, the very first update is exactly `lr * sign(g)` whatever the gradient's size, and without it the first step would be about 3.16 times larger.

The difference between Adam with L2 and AdamW is a favourite follow-up. L2 adds `lambda * w` to the gradient, so the decay passes through Adam's per-parameter division, and parameters with large past gradients get less effective decay. **Decoupled weight decay** (AdamW) subtracts `lr * lambda * w` after the Adam step, which decays every parameter at the same relative rate. For plain SGD, L2 and weight decay are the same thing up to a rescaling of `lambda`. PyTorch's `torch.optim.Adam(weight_decay=...)` is the L2 version.

This program runs each optimiser on an ill-conditioned quadratic `f = 0.5 * (100*x^2 + y^2)`. Plain gradient descent is stable only for `lr < 2/100`, since the steep direction limits it.

```python run=dl-c01-optim
import numpy as np

H = np.array([100.0, 1.0])
f = lambda w: 0.5 * (H * w * w).sum()
start = np.array([1.0, 1.0])

def gd(lr, steps=100):
    w = start.copy()
    for _ in range(steps):
        w -= lr * H * w
    return w

def momentum(lr, mu, steps=100):
    w, v = start.copy(), np.zeros(2)
    for _ in range(steps):
        v = mu * v + H * w
        w -= lr * v
    return w

def adam(lr, steps=100, b1=0.9, b2=0.999, eps=1e-8):
    w, m, s = start.copy(), np.zeros(2), np.zeros(2)
    for t in range(1, steps + 1):
        g = H * w
        m, s = b1 * m + (1 - b1) * g, b2 * s + (1 - b2) * g * g
        w -= lr * (m / (1 - b1 ** t)) / (np.sqrt(s / (1 - b2 ** t)) + eps)
    return w

for name, w in [("GD lr=0.021", gd(0.021)), ("GD lr=0.019", gd(0.019)), ("GD lr=0.001", gd(0.001)),
                ("momentum lr=0.01 mu=0.9", momentum(0.01, 0.9)), ("Adam lr=0.1", adam(0.1))]:
    print(f"{name:25} f after 100 steps {f(w):.3e}")
```

With `lr=0.021`, gradient descent diverges (the steep axis is multiplied by -1.1 each step), and 0.019 converges slowly because the steep axis oscillates with factor -0.9. A small learning rate is stable, but it leaves the shallow axis far from done, with `f` still about 0.41. Momentum and Adam both end far lower in the same 100 steps. A single toy function can't rank optimisers in general, but it shows the valley problem that momentum and per-parameter scaling address.

Learning rate is the first thing to tune. Common schedules are step decay, cosine decay, and a short linear **warmup**, which is standard for transformers and for large batches. Larger batches give less noisy gradients, and a common heuristic scales the learning rate linearly with batch size.

## Overfitting checks and debugging a training run {#ch01-debug .th}

Compare training and validation curves, and read them together.

| Train loss | Val loss | Reading | Next step |
|---|---|---|---|
| High, flat | High, flat | Underfitting, or a bug | Overfit one batch, check the learning rate and labels |
| Falling | Rising after a point | Overfitting | More data or augmentation, weight decay, dropout, early stopping |
| Falling | Far better than train from the start | Regularisation is active only in train, or leakage | Evaluate train in `eval()` mode, audit the split |
| NaN or a sudden jump | Same | Learning rate too high, bad data, a log or division at zero, mixed-precision overflow | Check inputs, clip, lower the learning rate, use anomaly detection |

Overfitting appears here on purpose: a wide network, 100 training points with 20% of their labels flipped, and 10 input features of which only 2 matter.

```python run=dl-c01-overfit
import numpy as np

def data(n, rng):
    X = rng.normal(size=(n, 10))
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    return X, np.where(rng.random(n) < 0.2, 1 - y, y)       # 20% label noise

def loss_grads(X, y, W1, W2):
    h = np.maximum(X @ W1, 0)
    s = h @ W2
    s0 = s - s.max(1, keepdims=True)
    p = np.exp(s0) / np.exp(s0).sum(1, keepdims=True)
    rows = np.arange(len(y))
    L = -np.log(p[rows, y] + 1e-12).mean()
    ds = p.copy()
    ds[rows, y] -= 1
    ds /= len(y)
    return L, X.T @ ((ds @ W2.T) * (h > 0)), h.T @ ds, (s.argmax(1) == y).mean()

def train(decay, steps=2000, lr=0.003, mu=0.9):
    rng = np.random.default_rng(0)
    Xt, yt = data(100, rng)
    Xv, yv = data(500, rng)
    W1, W2 = rng.normal(0, (2 / 10) ** 0.5, (10, 128)), rng.normal(0, 0.01, (128, 2))
    v1, v2 = np.zeros_like(W1), np.zeros_like(W2)
    print(f"weight decay {decay}")
    best = (9.0, 0)
    for step in range(steps + 1):
        Lt, d1, d2, at = loss_grads(Xt, yt, W1, W2)
        if step % 10 == 0:
            Lv, _, _, av = loss_grads(Xv, yv, W1, W2)
            best = min(best, (round(Lv, 6), step))
        if step in (0, 20, 100, 500, 2000):
            print(f"  step {step:4}  train {Lt:.3f} acc {at:.2f}   val {Lv:.3f} acc {av:.2f}")
        v1, v2 = mu * v1 + d1 + decay * W1, mu * v2 + d2 + decay * W2
        W1, W2 = W1 - lr * v1, W2 - lr * v2
    print(f"  best val loss {best[0]:.3f} at step {best[1]}")

train(0.0)
train(0.1)
```

Without decay, the training loss heads toward zero, reaching 100% accuracy on data that is 20% mislabelled, so the network has memorised the noise. Validation loss reaches its best value near step 20 and then rises past 1.6, while validation accuracy slides only from about 0.65 to 0.59. Loss shows the damage first, because the model becomes confidently wrong before it changes many decisions. A strong weight decay stops the climb and keeps the final validation loss close to its best. It gives no large gain in best validation accuracy here, since the 100 points limit what any model can learn. Without decay, early stopping would have picked a good model near step 20.

:::key The debugging routine, in order
1. Look at a batch after all preprocessing, with its labels. 2. Check the loss at initialisation: with small final-layer weights and `C` balanced classes it should be close to `ln(C)`. 3. Overfit one small batch to near-zero loss. 4. Sweep the learning rate across powers of ten. 5. Log gradient norms per layer. 6. Only then scale up, and change one thing at a time.
:::

Those first checks catch most bugs early, and they run in seconds.

```python run=dl-c01-debug
import numpy as np

rng = np.random.default_rng(0)
N, D, H, C = 16, 10, 64, 5
X, y = rng.normal(size=(N, D)), rng.integers(0, C, N)

def loss_grads(W1, W2):
    h = np.maximum(X @ W1, 0)
    s = h @ W2
    s0 = s - s.max(1, keepdims=True)
    p = np.exp(s0) / np.exp(s0).sum(1, keepdims=True)
    rows = np.arange(N)
    ds = p.copy()
    ds[rows, y] -= 1
    ds /= N
    return -np.log(p[rows, y] + 1e-12).mean(), X.T @ ((ds @ W2.T) * (h > 0)), h.T @ ds

def init(scale, seed=1):
    r = np.random.default_rng(seed)
    return r.normal(0, (2 / D) ** 0.5, (D, H)), r.normal(0, scale, (H, C))

print(f"expected ln(C) = {np.log(C):.3f}")
print(f"init loss, output std 0.01: {loss_grads(*init(0.01))[0]:.3f}")
print(f"init loss, output std 1.0:  {loss_grads(*init(1.0))[0]:.3f}")

def overfit(lr, steps=300, mu=0.9):
    W1, W2 = init(0.01)
    v1, v2 = np.zeros_like(W1), np.zeros_like(W2)
    for _ in range(steps):
        L, d1, d2 = loss_grads(W1, W2)
        v1, v2 = mu * v1 + d1, mu * v2 + d2
        W1, W2 = W1 - lr * v1, W2 - lr * v2
    return loss_grads(W1, W2)[0]

for lr in (1e-5, 1e-3, 1e-2):
    print(f"overfit {N} samples, lr {lr:g}: final loss {overfit(lr):.3f}")
```

Small output weights give an initial loss of 1.617, close to `ln(5) = 1.609`, and an output standard deviation of 1 gives 7.712, an immediate signal that logits start far too large. In the sweep, `1e-5` hardly moves the loss in 300 steps, `1e-3` gets to 0.303, and `1e-2` reaches 0.016.

Passing the overfit test proves little about the labels. A big enough network can memorise random labels, and the labels above are random. A pipeline with shuffled labels can pass it, so you still need to look at the data and at validation.

Silent shape bugs are a common failure in regression. Here `pred` has shape `(N, 1)` and the target `(N,)`, so the subtraction broadcasts to `(N, N)`, and each prediction is compared with every target.

```python run=dl-c01-broadcast
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=(64, 1))
y = 2 * x[:, 0] + 1

def fit(target):
    w, b = 0.0, 0.0
    for _ in range(500):
        err = x * w + b - target             # shape depends on target
        w, b = w - 0.1 * 2 * (err * x).mean(), b - 0.1 * 2 * err.mean()
    return w, b, err.shape, (err ** 2).mean()

for name, target in [("correct, target (N, 1)", y[:, None]), ("bug, target (N,)", y)]:
    w, b, shape, loss = fit(target)
    print(f"{name:24} err shape {shape}  w {round(w, 3) + 0.0:.3f}  b {b:.3f}  loss {loss:.3f}")
print(f"mean of y {y.mean():.3f}, variance of y {y.var():.3f}")
```

With the bug, the model learns to predict the mean of `y` for every input, and the loss settles at the variance of `y`. Nothing crashes. PyTorch's `MSELoss` prints a warning for this mismatch, which is a good reason to read your logs.

A training loop in PyTorch, with the steps in the order interviewers look for:

```python
model.train()
for x, y in loader:
    x, y = x.to(device), y.to(device)
    optimizer.zero_grad()
    logits = model(x)
    loss = criterion(logits, y)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optimizer.step()
scheduler.step()            # per epoch or per step, depending on the scheduler

model.eval()
with torch.no_grad():
    val_logits = model(x_val)
```

## Drills {#ch01-drills .dr}

:::drill concept
Why does a network need nonlinear activations? What happens to a 10-layer network if you remove them all?
---
**Answer.** It collapses to a single linear map, so its depth adds no expressive power.

**Why.** A composition of linear maps is a matrix product, which is one matrix. The training dynamics differ from one matrix, since the loss in terms of the factors is non-convex, but the set of functions it can represent is the same.
:::

:::drill concept
Why do frameworks use reverse-mode autodiff rather than forward mode? When would forward mode be better?
---
**Answer.** Reverse mode gets the gradient of one scalar with respect to all parameters in one backward pass. Forward mode needs one pass per parameter. Forward mode is better when there are few inputs and many outputs.

**Why.** The cost is set by the Jacobian's smaller side. Reverse mode's drawback is memory for intermediates, which is why gradient checkpointing exists.
:::

:::drill tricky
What is the gradient of ReLU at exactly 0, and does this break backprop?
---
**Answer.** ReLU has no derivative at 0. Frameworks pick a subgradient, usually 0, and training works.

**Why.** Any value in [0, 1] is a valid subgradient, and inputs that land on exactly 0 are rare. A real concern is units that are negative for all inputs. Those get zero gradient, and may never recover.
:::

:::drill bug
Loss barely falls, and accuracy stays low. What is wrong?

```python
class Net(nn.Module):
    def forward(self, x):
        return torch.softmax(self.body(x), dim=1)

criterion = nn.CrossEntropyLoss()
loss = criterion(net(x), y)
```
---
**Answer.** `CrossEntropyLoss` applies log-softmax itself, so this applies softmax twice. Return logits from `forward`.

**Why.** The double softmax bounds the values the loss sees, so the loss can't approach zero and the gradients are small. No error is raised.
:::

:::drill bug
The loss jumps around, and gets worse the longer it trains. What is missing?

```python
for x, y in loader:
    loss = criterion(model(x), y)
    loss.backward()
    optimizer.step()
```
---
**Answer.** `optimizer.zero_grad()`. Gradients accumulate across `backward()` calls, so each step uses the running sum of all earlier gradients.

**Why.** Accumulation is the default because it is useful on purpose: you can simulate a larger batch by calling `backward()` several times, dividing the loss by that number, and stepping once.
:::

:::drill tricky
You initialise every weight in a ReLU MLP to zero. What learns? Is zero ever a fine initial value?
---
**Answer.** With all zeros, hidden activations are zero, so the hidden weights get zero gradient and the only thing that learns is the output bias. Zero is fine for biases, for logistic regression (a single layer has no hidden symmetry) and for the last layer of a block when you want it to start as identity.

**Why.** Symmetry only hurts when several units share a role. A nonzero constant keeps the units identical as well, since they all see the same input weights and get the same update.
:::

:::drill tricky
Your training loss is higher than your validation loss. Name several reasons this can happen without any bug.
---
**Answer.** Dropout and other regularisers are active during training and off for validation. Heavy data augmentation makes the training data harder. The reported training loss is an average across an epoch while the model was improving, and validation is measured at the end. The validation set may simply be easier.

**Why.** If the gap is large, also check for leakage. To compare fairly, compute the training loss in `eval()` mode at the end of the epoch.
:::

:::drill bug
A model with batch norm and dropout gives a validation accuracy that changes with validation batch size. What is the bug?

```python
model.train()
for x, y in train_loader:
    ...
with torch.no_grad():
    acc = accuracy(model(x_val), y_val)
```
---
**Answer.** `model.eval()` was never called. `no_grad` stops graph recording, and it doesn't change layer behaviour, so batch norm is using validation batch statistics and dropout is still dropping.

**Why.** Batch statistics change with batch size, and validation also pollutes the running averages. Call `model.eval()` before evaluating and `model.train()` when you go back.
:::

:::drill concept
Why do transformers use layer norm rather than batch norm?
---
**Answer.** Layer norm is computed per token, so it doesn't depend on batch composition or size, and it works with variable-length sequences and padding. Train and eval behave the same, too.

**Why.** Batch statistics across varying sequence positions are poorly defined, and padding skews them. Batch norm also needs large enough batches, which is hard with long sequences.
:::

:::drill tricky
A colleague uses `Adam(weight_decay=0.01)` and says it is the same as AdamW. Is it?
---
**Answer.** No. `Adam` adds `0.01 * w` to the gradient, and this then goes through the per-parameter scaling. AdamW subtracts the decay from the weights directly.

**Why.** With L2 in Adam, weights with large gradient history are decayed less. For SGD without momentum, the two match up to the learning-rate factor, which is why the difference went unnoticed for a while.
:::

:::drill output
A parameter starts at 0 with `lr=1` and `mu=0.9`, and its gradient is always 1. Trace four steps of momentum by hand.

```python run=dl-c01-d-momentum
w, v = 0.0, 0.0
for t in range(4):
    v = 0.9 * v + 1.0
    w -= 1.0 * v
    print(t + 1, round(v, 3), round(w, 3))
```
---
**Answer.** `v` goes 1, 1.9, 2.71, 3.439, and `w` goes -1, -2.9, -5.61, -9.049.

**Why.** Under a constant gradient, `v` converges to `1 / (1 - mu) = 10`, so momentum acts like a learning rate ten times larger along steady directions.
:::

:::drill concept
Your loss becomes NaN at step 2,000. Walk through how you would find the cause.
---
**Answer.** Save the batch and the weights before the failure, and reproduce it. Check inputs for NaN or inf. Log the gradient norm and the largest weight over time. Turn on `torch.autograd.set_detect_anomaly(True)` to find the operation. Look for `log(0)`, `sqrt(0)` gradients and division by a small variance. Try a lower learning rate, gradient clipping, and full precision instead of mixed.

**Why.** A sudden NaN is usually either an explosion, which you can see coming in the gradient norms, or one bad sample or operation, which you find by reproducing the exact batch.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1400
Write a tiny scalar autograd engine in the style of micrograd: a `Value` class with `+`, `*`, `tanh` and `backward()`. Use it to train a small MLP on XOR, and check one gradient numerically.
---
Each operation records its inputs and a closure that pushes gradient to them. `backward()` visits nodes in reverse topological order. Children are kept in a tuple, so the order is deterministic.

```python run=dl-c01-c-autograd
import math, random

class Value:
    def __init__(self, data, parents=()):
        self.data, self.grad, self.parents = data, 0.0, parents
        self.push = lambda: None
    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other))
        def push():
            self.grad += out.grad
            other.grad += out.grad
        out.push = push
        return out
    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other))
        def push():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out.push = push
        return out
    def tanh(self):
        out = Value(math.tanh(self.data), (self,))
        def push():
            self.grad += (1 - out.data ** 2) * out.grad
        out.push = push
        return out
    def backward(self):
        order, seen = [], set()
        def visit(v):
            if id(v) not in seen:
                seen.add(id(v))
                for p in v.parents:
                    visit(p)
                order.append(v)
        visit(self)
        self.grad = 1.0
        for v in reversed(order):
            v.push()

class Neuron:
    def __init__(self, n, rng):
        self.w = [Value(rng.gauss(0, 1)) for _ in range(n)]
        self.b = Value(0.0)
    def __call__(self, x):
        total = self.b
        for w, xi in zip(self.w, x):
            total = total + w * xi
        return total.tanh()

rng = random.Random(3)
hidden = [Neuron(2, rng) for _ in range(4)]
out = Neuron(4, rng)
params = [p for n in hidden + [out] for p in n.w + [n.b]]
net = lambda x: out([n(x) for n in hidden])
data = [((-1, -1), -1), ((-1, 1), 1), ((1, -1), 1), ((1, 1), -1)]

def total_loss():
    loss = Value(0.0)
    for x, t in data:
        e = net(x) + (-t)
        loss = loss + e * e
    return loss

loss = total_loss()
loss.backward()
p = params[0]
analytic, old, h = p.grad, p.data, 1e-6
p.data = old + h; up = total_loss().data
p.data = old - h; down = total_loss().data
p.data = old
print(f"check: analytic {analytic:.5f}, numeric {(up - down) / (2 * h):.5f}")

for step in range(301):
    for p in params:
        p.grad = 0.0
    loss = total_loss()
    loss.backward()
    if step % 100 == 0:
        print(f"step {step:3}  loss {loss.data:.4f}")
    for p in params:
        p.data -= 0.05 * p.grad
print([(x, round(net(x).data, 2)) for x, _ in data])
```

The analytic and numeric gradients agree to five decimals, the loss falls from 5.23 to 0.017 in 300 steps, and the four predictions are close to their targets of plus or minus 1. A different seed can stall on XOR with so few units, and that is worth trying.
:::

:::drill bug
This `__mul__` backward gives the wrong answer for `b = a * a`, where `a = 3`. It should give `db/da = 6`. Find the problem.

```python
def push():
    self.grad = other.data * out.grad
    other.grad = self.data * out.grad
```
---
**Answer.** It assigns instead of adding. `self` and `other` are the same object, so the second line overwrites the first, and the result is 3. Use `+=`.

**Why.** A node with several consumers receives one contribution per edge, and the chain rule sums them. The same applies to a shared layer or a skip connection.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- Linear layer params: `D*H + H`. Without nonlinearities, depth adds no expressive power.
- Output logits. Use `CrossEntropyLoss` or `BCEWithLogitsLoss`, which take logits. Loss at init is about `ln(C)`.
- Reverse mode: gradient of a scalar in about one forward's cost, plus memory for intermediates. Gradients accumulate on shared nodes, so `+=`.
- Check hand-written gradients with central differences.
- Init: random breaks symmetry. Xavier `2/(n_in+n_out)` for tanh, He `2/n_in` for ReLU.
- Vanishing: product of small Jacobians. Fixes: ReLU, init, normalisation, residuals. Exploding: clip by global norm.
- Batch norm: stats over batch, running averages at eval, depends on batch size, `2C` learned parameters plus buffers. Layer norm: per sample, same in train and eval.
- Dropout: `p` drops, scale survivors by `1/(1-p)`, off at eval.
- Momentum damps oscillation. Adam scales per parameter. AdamW decays weights directly, while `Adam(weight_decay=)` is L2.
- Debug order: inspect data, loss at init, overfit one batch, sweep the learning rate, log gradient norms, change one thing at a time.
- `model.eval()` changes layer behaviour. `no_grad()` stops graph recording. Use both for validation.
- Watch for broadcasting bugs: `(N, 1)` against `(N,)` makes `(N, N)`.
