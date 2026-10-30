---
title: LoRA, QLoRA, RLHF and DPO
part: Part B · Changing the model's behaviour
lede: A pretrained model completes documents. To make it follow instructions, match a format or prefer better answers, you change its weights, and this chapter explains how to do that cheaply. It starts with when to fine-tune at all, then builds a low-rank update, works out what 4-bit training saves, walks through RLHF, and shows why DPO reaches a similar goal with no reward model.
desc: fine-tuning vs prompting vs RAG, instruction data, label masking, LoRA arithmetic, QLoRA and NF4, RLHF, reward models, PPO, DPO objective, overfitting, evaluation
hours: 6
prereqs: Chapter 1 (next-token loss, teacher forcing, temperature), gradient descent, basic probability
---

## Prompting, RAG or fine-tuning {#ch02-decide .th}

This is the most common design question in applied interviews, and the right first answer is a question about the failure. What exactly is going wrong? Missing facts, the wrong form of answer, and poor quality on some task type have different fixes.

| Symptom | First choice | Why |
|---|---|---|
| Output format or tone is off | Better prompt, a few examples, constrained output | Cheap, fast to change, no training |
| Answers need private or changing facts | RAG | Facts are retrieved at query time and can be updated without touching weights, and citations are possible |
| Task needs a stable behaviour that prompts cannot hold reliably | Fine-tuning | The behaviour moves into the weights |
| Prompts have become long and expensive at high volume | Fine-tuning, possibly on a smaller model | Fewer prompt tokens per request |
| Specialised style, domain language or a classification scheme | Fine-tuning | The model learns patterns that are hard to describe |
| Facts and behaviour both matter | RAG and fine-tuning together | Tune how it should use context, and retrieve the context |

Start with a prompt and an evaluation set, because you need that set anyway to decide if fine-tuning helped. Fine-tuning adds costs that a prompt does not have: collecting data, training, a separate model version to host, and retraining if the base model changes.

:::trap
Fine-tuning is a poor way to add facts. The model does not store them reliably, it cannot cite them, and they go stale as soon as they change. It can also make the model sound confident about nearby facts it never learned. If the answer depends on a document, retrieve the document.
:::

## Instruction tuning data {#ch02-data .th}

**Instruction tuning**, also called supervised fine-tuning (SFT), trains on prompt and response pairs with the same next-token loss as Chapter 1. Three details decide whether it works.

**The chat template.** Each model family has a specific format with special tokens for turn boundaries. Training and serving must render messages identically. Use the template shipped with the tokenizer.

**Label masking.** Compute the loss on the response only. Prompt positions get the label `-100`, so the model is not trained to predict the user's text. Padding gets the same treatment.

**The end-of-sequence token.** The response must end in EOS, and EOS must be in the labels. If it is missing, the model has never learned to stop, so it keeps generating past the answer.

```python run=lm-c02-labels
IGNORE = -100
EOS = "</s>"

def build(prompt, answer, max_len):
    p = ["<user>"] + prompt.split() + ["<assistant>"]
    a = answer.split() + [EOS]
    tokens = (p + a)[:max_len]
    labels = ([IGNORE] * len(p) + a)[:max_len]
    pad = max_len - len(tokens)
    return tokens + ["<pad>"] * pad, labels + [IGNORE] * pad

tokens, labels = build("translate cat to french", "chat", 10)
print(f"{'position':9}{'input':14}label (before the model's one-token shift)")
for i, (t, l) in enumerate(zip(tokens, labels)):
    print(f"{i:<9}{t:14}{l}")
print("trained positions:", sum(l != IGNORE for l in labels))

_, labels = build("summarise this very long report about quarterly rainfall in detail", "ok", 10)
print("long prompt, trained positions:", sum(l != IGNORE for l in labels))
```

The first example trains on two positions: the answer and EOS. The second shows a silent failure: the prompt fills `max_len`, so truncation removes the whole answer and the example contributes nothing to the loss. Check how many examples survive truncation before you start training.

For the data itself, aim for examples that look like production inputs, written with the quality you want back. The model copies mistakes in the data. Remove near-duplicates, and split train and evaluation by source or user so similar text cannot land on both sides. Dataset size depends heavily on the task: narrow format tasks can work with hundreds of good examples, and broad behaviour changes need far more. Measure instead of assuming.

## The low-rank update {#ch02-lora .th}

Fine-tuning a whole model needs memory for gradients and optimizer state on every weight, and it risks overfitting a small dataset. **LoRA (low-rank adaptation)** freezes the original weights and learns a small update per chosen matrix:

```text
W' = W + (α / r) · B · A         W: m x n (frozen)    A: r x n    B: m x r
```

Here `r`, the rank, is much smaller than `m` and `n`. `A` starts random and `B` starts at zero, so `BA = 0` and the model begins exactly as the base model. `α` is a fixed scale, and dividing by `r` means you can change `r` without having to retune the learning rate much.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 196" role="img" aria-label="The matrix W of size m by n plus a scale factor times a tall thin matrix B of size m by r times a short wide matrix A of size r by n">
  <rect x="30" y="24" width="130" height="130" rx="3" class="d-soft"/><text x="95" y="86" text-anchor="middle" class="t-mono">W</text><text x="95" y="104" text-anchor="middle" class="t-small">m x n, frozen</text>
  <text x="192" y="94" text-anchor="middle" class="t-mono">+</text>
  <text x="248" y="94" text-anchor="middle" class="t-mono">α / r</text>
  <rect x="300" y="24" width="30" height="130" rx="3" class="d-acc"/><text x="315" y="94" text-anchor="middle" class="t-mono">B</text><text x="315" y="172" text-anchor="middle" class="t-small">m x r</text>
  <text x="352" y="94" text-anchor="middle" class="t-mono">·</text>
  <rect x="374" y="74" width="130" height="30" rx="3" class="d-key"/><text x="439" y="94" text-anchor="middle" class="t-mono">A</text><text x="439" y="124" text-anchor="middle" class="t-small">r x n</text>
  <text x="530" y="60" class="t-small">trained: r(m + n) numbers</text>
  <text x="530" y="82" class="t-small">frozen: m x n numbers</text>
  <text x="530" y="104" class="t-small">B starts at 0, so the first</text>
  <text x="530" y="122" class="t-small">forward pass equals the base</text>
</svg></div><figcaption><b>The LoRA update.</b> Two thin matrices stand in for a full update. At run time an input passes through <code>A</code> and then <code>B</code>, so <code>BA</code> never has to be stored as a full matrix during training.</figcaption></figure>

Why can a low-rank update work at all? The original paper's motivating observation is that fine-tuning changes appear to have low intrinsic dimension, and that the model already holds most of what it needs. The program below checks the arithmetic in the easiest case, where a target update really is close to low rank. The truncated SVD gives the best possible rank-`r` approximation, so no `BA` of that rank could do better.

```python run=lm-c02-lowrank
import numpy as np

rng = np.random.default_rng(0)
m, n, true_rank = 200, 200, 3
delta = rng.normal(size=(m, true_rank)) @ rng.normal(size=(true_rank, n)) / np.sqrt(n)
delta = delta + 0.05 * rng.normal(size=(m, n))     # a little noise on top of rank 3

U, S, Vt = np.linalg.svd(delta)
print(" r  params(BA)  % of full   relative error")
for r in (1, 2, 3, 4, 8, 32):
    approx = (U[:, :r] * S[:r]) @ Vt[:r]           # sign of U and V cancels here
    err = np.linalg.norm(delta - approx) / np.linalg.norm(delta)
    print(f"{r:2}  {r * (m + n):10,}  {100 * r * (m + n) / (m * n):8.1f}  {err:15.3f}")
```

Error falls fast until the true rank of 3. What remains, about 0.38, is mostly the added noise, and extra rank only eats into it slowly. On a real model nobody knows the true rank, so it is a hyperparameter set by evaluation.

In practice LoRA is usually applied to the attention projection matrices, and some setups add MLP layers. Module names differ per model, so read the model's structure before you choose them. After training you can **merge** the update, `W = W + (α/r) B A`, for slightly faster inference with no adapter code, or keep adapters separate and swap them on one shared base model.

## Parameter-count arithmetic {#ch02-arith .th}

Interviewers like this one because it takes a minute on a whiteboard and shows you understand the structure. A full update has `m·n` parameters, and LoRA has `r(m + n)`. The saving is close to `2r/n` for a square matrix.

```python run=lm-c02-count
layers, d, per_layer = 32, 4096, 4          # hypothetical: Q, K, V and output matrices
whole_model = 7_000_000_000                 # hypothetical total weights
matrices = layers * per_layer
full = matrices * d * d
print(f"{matrices} matrices, full update {full:,} parameters")
print(" r    adapter params   % of targeted   % of whole model   MB at 32-bit")
for r in (4, 8, 16, 32):
    lora = matrices * r * (d + d)
    print(f"{r:2} {lora:16,} {100 * lora / full:14.2f}  {100 * lora / whole_model:17.3f} {lora * 4 / 1e6:14.1f}")
```

With `r = 8`, this hypothetical adapter trains well under 1% of the targeted weights, and it is small enough to store and ship separately. For a rectangular matrix, the longer side dominates `m + n`, so check the sum and do not assume a square.

:::trap
"LoRA trains only a small fraction of the parameters" does not mean each step is cheap in proportion. The forward and backward passes still run through the entire frozen model, so time per step is close to a full fine-tune. LoRA saves mainly on gradient and optimizer memory for weights, and it limits how far the model can move.
:::

Follow-ups worth having ready: what if both `A` and `B` start at zero? Each one's gradient is proportional to the other, so nothing ever moves. The drills check this. Does a larger `r` always help? No: it gives more capacity to overfit a small dataset, and returns often flatten early.

## QLoRA: a 4-bit base {#ch02-qlora .th}

**QLoRA** trains LoRA adapters on top of a base model stored in 4 bits per weight. Its contribution is the observation that the base stays frozen, so it needs only enough accuracy to run forward and backward passes. The adapters stay in higher precision, because they are the part being updated with small steps. It has three parts.

**NF4 (normal float 4-bit).** Weights in each block of 64 are divided by the block's largest absolute value. Then each weight is rounded to one of 16 levels. Pretrained weights are roughly normal, so a uniform grid puts most of them in a few central buckets. NF4 sets the buckets so each receives about the same share of weights.

**Double quantization.** Each block needs a 32-bit float scale, and that overhead is 0.5 bits per weight. QLoRA quantizes those scales too, using 8 bits each with a 32-bit constant for every 256 of them.

**Paged optimizer.** Optimizer state can be paged to CPU memory to survive short memory spikes. This is mainly a stability feature.

The program below builds a quantizer in the NF4 style from a sample. The real NF4 table is a fixed constant in the library with similar values, not these exact numbers.

```python run=lm-c02-nf4
import numpy as np

rng = np.random.default_rng(0)
weights = rng.normal(0.0, 0.02, size=(4000, 64))             # blocks of 64
scales = np.abs(weights).max(axis=1, keepdims=True)
x = (weights / scales).ravel()

uniform_levels = np.linspace(-1, 1, 16)
edges = np.quantile(x, np.linspace(0, 1, 17))                # equal share in each bucket
which = np.clip(np.searchsorted(edges, x, side="right") - 1, 0, 15)
nf4_levels = np.array([x[which == b].mean() for b in range(16)])

def quantize(x, levels):
    return levels[np.abs(x[:, None] - levels[None, :]).argmin(axis=1)]

print("levels (first 8):", " ".join(f"{v:.2f}" for v in nf4_levels[:8]))
print("grid       bucket share   entropy   MSE all   MSE |x|<0.25   MSE |x|>=0.25")
small = np.abs(x) < 0.25
for name, levels in [("uniform", uniform_levels), ("nf4-style", nf4_levels)]:
    pick = np.abs(x[:, None] - levels[None, :]).argmin(axis=1)
    share = np.bincount(pick, minlength=16) / len(x)
    entropy = -(share[share > 0] * np.log2(share[share > 0])).sum()
    err = (levels[pick] - x) ** 2
    print(f"{name:10} {share.min():.3f}-{share.max():.3f}   {entropy:6.2f}   {err.mean():.5f}   {err[small].mean():11.5f}   {err[~small].mean():12.5f}")

plain = 4 + 32 / 64
double = 4 + 8 / 64 + 32 / (64 * 256)
print(f"bits per weight: {plain:.3f} with 32-bit scales, {double:.3f} with double quantization")
```

Compare the two grids carefully, because the result is not the one people usually assume. The equal-share grid uses its 16 codes almost evenly, so it carries 4.00 bits of information per weight against 3.59 for uniform, and it is about four times more accurate on the many small weights near zero. Its overall squared error is **higher** than the uniform grid's in this toy, because its outer buckets are wide and large weights suffer. So do not claim that NF4 minimises weight error. The QLoRA paper's motivation is the information argument, and its case for NF4 rests on measured model quality, which a toy like this cannot show. Double quantization brings the cost down to about 4.13 bits per weight.

What does QLoRA save? This table compares the memory for **weights and optimizer state only**, using a hypothetical 7-billion-weight model.

```python run=lm-c02-qmem
n = 7e9
adapter = 8_388_608               # r = 8 from the arithmetic above
GB = 1e9

def row(name, base_bytes, trained, trained_bytes):
    base = n * base_bytes
    grads = trained * trained_bytes
    adam = 2 * trained * trained_bytes        # two state values per trained weight
    print(f"{name:26}{base / GB:7.1f}{trained * trained_bytes / GB:9.2f}{grads / GB:8.2f}{adam / GB:8.2f}"
          f"{(base + trained * trained_bytes + grads + adam) / GB:8.1f}")

print(f"{'':26}{'base':>7}{'trained':>9}{'grads':>8}{'adam':>8}{'total':>8}   GB")
row("full fine-tune, 16-bit", 0, n, 2)
row("LoRA, 16-bit base", 2, adapter, 4)
row("QLoRA, NF4 + double quant", 4.127 / 8, adapter, 4)
```

The first move, from a full fine-tune to LoRA, removes the gradient and optimizer memory for the base. The second, to QLoRA, cuts the base itself to about a quarter. That table leaves out memory QLoRA cannot reduce: activations and their gradients. These scale with batch size and sequence length, are held in the compute type such as 16-bit, and can be a large share of use in practice. Gradient checkpointing and smaller batches are how you reduce those.

:::key
QLoRA saves memory and does not save time. Weights have to be dequantized on the fly in each forward pass, which adds cost per step. Gradients still flow through the frozen base to reach the adapters, but no gradient is stored for the base weights themselves.
:::

```python
# Illustrative: the transformers, peft and bitsandbytes stack. Not run here.
# Argument names can change, so check them against your installed versions.
bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                         bnb_4bit_use_double_quant=True,
                         bnb_4bit_compute_dtype=torch.bfloat16)
model = AutoModelForCausalLM.from_pretrained(model_id, quantization_config=bnb)
model = prepare_model_for_kbit_training(model)
config = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, task_type="CAUSAL_LM",
                    target_modules=["q_proj", "v_proj"])     # names depend on the model
model = get_peft_model(model, config)
model.print_trainable_parameters()
```

## RLHF: the pipeline {#ch02-rlhf .th}

**RLHF (reinforcement learning from human feedback)** tunes for what people prefer, which a next-token loss over fixed answers cannot express directly. A person can usually say which of two answers is better even when they could not write the ideal answer. The classic pipeline has three stages, as described in the InstructGPT paper.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 216" role="img" aria-label="Three stage pipeline: supervised fine-tuning gives a policy, human comparisons train a reward model, and PPO updates the policy using the reward model with a KL penalty toward a frozen reference">
  <rect x="10" y="20" width="200" height="66" rx="5" class="d-soft"/><text x="110" y="42" text-anchor="middle" class="t-mono">1. SFT</text><text x="110" y="60" text-anchor="middle" class="t-small">prompts + good answers</text><text x="110" y="76" text-anchor="middle" class="t-small">gives an initial policy</text>
  <rect x="260" y="20" width="200" height="66" rx="5" class="d-key"/><text x="360" y="42" text-anchor="middle" class="t-mono">2. reward model</text><text x="360" y="60" text-anchor="middle" class="t-small">human ranks answer pairs</text><text x="360" y="76" text-anchor="middle" class="t-small">learns r(prompt, answer)</text>
  <rect x="510" y="20" width="200" height="66" rx="5" class="d-acc"/><text x="610" y="42" text-anchor="middle" class="t-mono">3. PPO</text><text x="610" y="60" text-anchor="middle" class="t-small">sample, score, update</text><text x="610" y="76" text-anchor="middle" class="t-small">the policy</text>
  <path d="M210 53 L 260 53" class="d-line"/><path d="M460 53 L 510 53" class="d-line"/>
  <rect x="120" y="130" width="130" height="50" rx="5" class="d-box"/><text x="185" y="152" text-anchor="middle" class="t-mono">reference</text><text x="185" y="170" text-anchor="middle" class="t-small">frozen SFT model</text>
  <rect x="280" y="130" width="130" height="50" rx="5" class="d-box"/><text x="345" y="152" text-anchor="middle" class="t-mono">policy</text><text x="345" y="170" text-anchor="middle" class="t-small">being trained</text>
  <rect x="440" y="130" width="130" height="50" rx="5" class="d-box"/><text x="505" y="152" text-anchor="middle" class="t-mono">value</text><text x="505" y="170" text-anchor="middle" class="t-small">estimates return</text>
  <rect x="600" y="130" width="110" height="50" rx="5" class="d-box"/><text x="655" y="152" text-anchor="middle" class="t-mono">reward</text><text x="655" y="170" text-anchor="middle" class="t-small">frozen</text>
  <text x="360" y="206" text-anchor="middle" class="t-small">Stage 3 holds up to four networks in memory, which is one reason it is expensive.</text>
</svg></div><figcaption><b>The RLHF pipeline.</b> Stage 2 turns preferences into a score, and stage 3 trains the policy to raise that score.</figcaption></figure>

**Stage 2: the reward model.** It is usually a language model with a single scalar output. Preferences train it through a pairwise loss, called the **Bradley-Terry** model: the chance that a person prefers `a` over `b` is `σ(r(a) - r(b))`, and the loss is `-log σ(r(winner) - r(loser))`. Only differences appear, so absolute reward values carry no meaning.

```python run=lm-c02-reward
import numpy as np

rng = np.random.default_rng(0)
true_w = np.array([2.0, -1.0, 0.5, 0.0])       # hidden: how a person scores answer features

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def comparisons(n):
    a, b = rng.normal(size=(2, n, 4))
    a_wins = rng.random(n) < sigmoid((a - b) @ true_w)
    return np.where(a_wins[:, None], a, b), np.where(a_wins[:, None], b, a)

winner, loser = comparisons(4000)
w = np.zeros(4)
for step in range(501):
    margin = (winner - loser) @ w
    loss = -np.log(sigmoid(margin)).mean()
    if step in (0, 500):
        print(f"step {step:3}  loss {loss:.3f}")
    w += 0.2 * ((1 - sigmoid(margin))[:, None] * (winner - loser)).mean(axis=0)

print("true weights   ", true_w)
print("learned weights", w.round(2))
test_w, test_l = comparisons(4000)
print(f"agrees with held-out human choices: {((test_w - test_l) @ w > 0).mean():.3f}")
rw, rl = winner @ w, loser @ w
print(f"loss with rewards as learned {-np.log(sigmoid(rw - rl)).mean():.3f}, with 5 added to all {-np.log(sigmoid((rw + 5) - (rl + 5))).mean():.3f}")
```

Loss starts at `ln 2 = 0.693`, the value for no opinion, and the learned weights recover the true ones. Agreement on held-out comparisons does not reach 1 because the simulated human is noisy, and a real reward model has the same ceiling. Adding a constant to every reward has no effect, because only differences enter the loss.

**Stage 3: PPO.** The policy samples answers. The reward model scores them. A value network estimates the expected return, and the **advantage** measures how much better than expected the answer was. **PPO (proximal policy optimization)** then updates the policy to make good answers more likely. It limits each update using a clipped objective, where `ratio` is the new probability over the old one:

```text
L = min( ratio · advantage,  clip(ratio, 1 - ε, 1 + ε) · advantage )
```

```python run=lm-c02-ppo
eps = 0.2
print("advantage  ratio  unclipped  clipped  objective")
for adv in (1.0, -1.0):
    for ratio in (0.5, 1.0, 1.5):
        unclipped = ratio * adv
        clipped = min(max(ratio, 1 - eps), 1 + eps) * adv
        print(f"{adv:9.1f}{ratio:7.1f}{unclipped:11.2f}{clipped:9.2f}{min(unclipped, clipped):11.2f}")
```

Read the rows with `ratio = 1.5`. With a positive advantage the objective stops at 1.2, so moving further brings no extra gain. With a negative advantage it stays at -1.5, so the penalty remains in force. `min` keeps the cautious of the two, which stops one batch from pushing the policy too far.

**Reward hacking and the KL penalty.** A reward model is only an approximation of human preference, and an optimizer will find its errors. RLHF models can drift towards longer answers, flattery or confident-sounding text if those score well. A standard defence is a penalty for moving away from the frozen reference: maximise `E[r] - β·KL(π ‖ π_ref)`. This objective has a closed-form optimum for a discrete set of answers, `π ∝ π_ref · exp(r/β)`, which lets you watch what β does.

```python run=lm-c02-kl
import numpy as np

names = ["accurate", "brief", "flattering", "rambling"]
ref = np.array([0.40, 0.30, 0.20, 0.10])
reward = np.array([1.0, 0.5, 1.6, 0.2])       # the reward model wrongly favours flattery
print(f"{'beta':>6} ", " ".join(f"{n:>10}" for n in names))
print(f"{'ref':>6} ", " ".join(f"{p:10.3f}" for p in ref))
for beta in (5.0, 1.0, 0.3, 0.05):
    p = ref * np.exp((reward - reward.max()) / beta)
    p = p / p.sum()
    print(f"{beta:6.2f} ", " ".join(f"{x:10.3f}" for x in p))
```

A large β stays near the reference. As β falls, the policy concentrates on whichever answer the reward model scores highest, even though that score is wrong. The same formula is the starting point for DPO.

RLHF's difficulties are practical: gathering preference data, holding several large models, sampling during training and the well-known instability of RL. All of that motivates the next section.

## DPO: preferences without a reward model {#ch02-dpo .th}

**DPO (direct preference optimization)** trains on the same preference pairs and skips both the reward model and the sampling loop. It comes from rearranging the KL-penalised objective. Start from the optimum above and solve for the reward:

```text
π*(y|x) = π_ref(y|x) · exp(r(x,y)/β) / Z(x)
r(x,y)  = β · log( π*(y|x) / π_ref(y|x) ) + β · log Z(x)
```

`Z(x)` normally makes this useless, since it sums over all possible answers. But Bradley-Terry only uses a **difference** of rewards for the same prompt, and `β log Z(x)` is the same for both answers, so it cancels. Replacing `π*` with the model being trained gives the DPO loss:

```text
L = -log σ( β · [ log(π(y_w|x) / π_ref(y_w|x))  -  log(π(y_l|x) / π_ref(y_l|x)) ] )
```

Here `y_w` is the preferred response and `y_l` the rejected one, and the log probability of a response is the sum over its tokens. The model's own log ratio takes the role of the reward, so the policy is its own reward model. This is why DPO avoids a separate one.

The loss is an ordinary classification-style loss with backprop. There is no sampling and no value network, and the reference can be frozen or its log probabilities computed ahead of time. The program below checks the theory on a small discrete problem: it minimises the DPO loss using only the pairwise preference probabilities, then compares the result to the closed form.

```python run=lm-c02-dpo
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

ref = np.array([0.40, 0.30, 0.20, 0.10])
reward = np.array([1.0, 0.5, 2.0, 0.0])              # used only to simulate human choices
K = len(ref)
pairs = [(i, j) for i in range(K) for j in range(K) if i != j]
prefers = {(i, j): sigmoid(reward[i] - reward[j]) for i, j in pairs}

def fit(beta, steps=4000):
    theta = np.log(ref).copy()                       # start at the reference
    for step in range(steps + 1):
        h = theta - np.log(ref)                      # the softmax normaliser cancels in differences
        loss, g = 0.0, np.zeros(K)
        for i, j in pairs:
            z = beta * (h[i] - h[j])
            loss -= prefers[i, j] * np.log(sigmoid(z))
            g[i] -= prefers[i, j] * (1 - sigmoid(z)) * beta
            g[j] += prefers[i, j] * (1 - sigmoid(z)) * beta
        if step == 0:
            first = loss / (len(pairs) / 2)
        theta -= (0.1 / max(beta, 1) ** 2) * g
    p = np.exp(theta - theta.max())
    return p / p.sum(), first, loss / (len(pairs) / 2)

print(f"{'ref':14}", " ".join(f"{x:.3f}" for x in ref))
for beta in (2.0, 1.0, 0.5):
    p, first, last = fit(beta)
    closed = ref * np.exp((reward - reward.max()) / beta)
    closed = closed / closed.sum()
    print(f"beta={beta:<9}", " ".join(f"{x:.3f}" for x in p), f"  loss {first:.3f} -> {last:.3f}")
    print(f"{'closed form':14}", " ".join(f"{x:.3f}" for x in closed))
```

Fitted and closed-form policies agree, and the reward was never given to the optimizer. The first loss is always `ln 2`, because the policy starts at the reference, so both log ratios are zero. A smaller β moves further from the reference, because the model needs a larger log ratio to reach the same margin. The final loss is the same at every β, since the optimal margin always equals the reward difference.

| | RLHF with PPO | DPO |
|---|---|---|
| Data | Preference pairs, plus online sampling | Preference pairs only |
| Networks | Policy, value, reward, reference | Policy, reference |
| Training | RL loop, and more tuning | Backprop on one loss |
| Exploration | Samples from the current policy | None beyond the fixed dataset |
| Reward model | Reusable for evaluation | None, so no separate scorer |
| Failure mode | Reward hacking, instability | Overfits pairs, weak control far from the data |

:::trap
DPO only sees answers in its dataset. Its log-ratio trick is exact at the optimum over all answers, but real training is not there. It can raise the probability of phrases common in chosen answers and let unrelated outputs change in ways you did not train for, and pairs written by another model may not cover what `π_ref` actually produces. Measure the tuned model's generated output directly, since the loss cannot show these problems.
:::

## Overfitting and evaluation {#ch02-eval .th}

Small datasets and strong models overfit quickly. Signs include eval loss rising while training loss falls, answers that reuse training phrases, good results on exact-style prompts and poor results on paraphrases, and regressions on tasks the base model handled well.

Rank `r` is one capacity control. This toy stands in for it with matrix completion: fill in a noisy rank-3 matrix from about 40% of its entries using a factorisation of varying rank. The analogy is limited, but the shape of the curve is the point.

```python run=lm-c02-overfit
import numpy as np

rng = np.random.default_rng(5)
m, n, lam = 60, 60, 0.1
clean = rng.normal(size=(m, 3)) @ rng.normal(size=(3, n)) / np.sqrt(3)
noisy = clean + 0.5 * rng.normal(size=(m, n))
seen = rng.random((m, n)) < 0.40

def fit(rank, sweeps=30):
    r = np.random.default_rng(rank)
    B = 0.3 * r.normal(size=(m, rank))
    A = 0.3 * r.normal(size=(n, rank))
    eye = lam * np.eye(rank)
    for _ in range(sweeps):
        for i in range(m):
            X = A[seen[i]]
            B[i] = np.linalg.solve(X.T @ X + eye, X.T @ noisy[i, seen[i]])
        for j in range(n):
            X = B[seen[:, j]]
            A[j] = np.linalg.solve(X.T @ X + eye, X.T @ noisy[seen[:, j], j])
    return B @ A.T

def rmse(pred, mask):
    return float(np.sqrt(((pred - noisy)[mask] ** 2).mean()))

print(f"observed entries {int(seen.sum())} of {m * n}")
print("rank  params  train RMSE  held-out RMSE")
for rank in (1, 2, 3, 5, 10):
    pred = fit(rank)
    print(f"{rank:4}  {rank * (m + n):6}  {rmse(pred, seen):10.2f}  {rmse(pred, ~seen):13.2f}")
```

Training error keeps falling as rank grows, from 0.82 to 0.15. Held-out error is lowest at the true rank of 3, at 0.60, and reaches 1.12 at rank 10, even though that model looks far better on the training data. Fine-tuning also has other brakes: fewer epochs, early stopping on eval loss, LoRA dropout, and above all more and better data.

Loss alone will not tell you if a tuned model is better. A useful evaluation has several layers:

- **Task metrics** on a held-out set taken from real inputs: exact match, F1, schema validity, or rubric scores.
- **A baseline comparison.** Compare to the base model with your best prompt, on the same set. The fine-tune has to beat this.
- **Pairwise judging** by people, or by a model used as a judge with spot checks. Randomise which side each answer appears on, because position bias is real.
- **Regression and safety checks.** Fine-tuning can weaken refusal and safety behaviour even with harmless data, so re-run those tests.
- **Slice analysis** by input type, language and length. Averages hide damage to small groups.
- **Serving checks.** Test with the same template, stop tokens and sampling settings as production.

## Drills {#ch02-drills .dr}

:::drill concept
A team wants the assistant to answer from a handbook that changes every month, and suggests fine-tuning on it. What do you recommend?
---
**Answer.** Use RAG. The handbook changes, answers need to trace back to a source, and a retrain per update is expensive.

**Why.** Weights are a poor store for specific facts. Fine-tuning could still make sense later for tone or for how to cite context, but it should not hold the content.
:::

:::drill output
A linear layer has `m = 768`, `n = 768`, and LoRA uses `r = 4`. How many trainable parameters, and what fraction of the full matrix? Then try `m = 2048`, `n = 512`, `r = 16`.

```python run=lm-c02-d-count
for m, n, r in [(768, 768, 4), (2048, 512, 16)]:
    print(f"m={m} n={n} r={r}: lora {r * (m + n):,}  full {m * n:,}  {100 * r * (m + n) / (m * n):.2f}%")
```
---
**Answer.** 6,144 of 589,824 (1.04%), then 40,960 of 1,048,576 (3.91%).

**Why.** It is `r(m + n)` over `m·n`. A larger rank raises the percentage, and for a fixed area a rectangular matrix has larger `m + n`.
:::

:::drill tricky
Why does LoRA start `B` at zero and `A` at random values? What happens if both start at zero, or if both start at random values?
---
**Answer.** Starting `B` at zero makes the initial model equal to the base. If both are zero, training never starts. If both are random, training starts from a noisy perturbed model.

**Why.** The gradient for `B` includes `A` as a factor, and the gradient for `A` includes `B`. See the next drill for the numbers.
:::

:::drill output
Using `W' = W + BA` and squared error against a target `T`, what are the gradient sizes in each starting case?

```python run=lm-c02-d-init
import numpy as np

rng = np.random.default_rng(0)
W, T = rng.normal(size=(2, 6, 6))
A0 = rng.normal(size=(2, 6))
B0 = rng.normal(size=(6, 2))

for name, A, B in [("A random, B zero", A0, 0 * B0), ("both zero", 0 * A0, 0 * B0), ("both random", A0, B0)]:
    R = W + B @ A - T
    gB, gA = 2 * R @ A.T, 2 * B.T @ R
    print(f"{name:18} |grad B| {np.linalg.norm(gB):7.3f}  |grad A| {np.linalg.norm(gA):7.3f}  same as base: {np.allclose(W + B @ A, W)}")
```
---
**Answer.** With `A` random and `B` zero, `B` has a gradient and `A` has none on the first step. With both zero, both gradients are exactly zero, so the update stays at zero forever. With both random, both gradients are nonzero, but the model no longer equals the base.

**Why.** After the first step `B` is nonzero, so `A` starts to learn as well. The zero-and-random start therefore gets both properties: same as base at step 0 and working gradients from step 1.
:::

:::drill bug
After fine-tuning, the model gives good answers, then keeps writing another fake question and answer. Eval loss looks fine. Find the likely bug.

```python
text = template(prompt) + answer
ids = tokenizer(text, add_special_tokens=False).input_ids
```
---
**Answer.** No EOS was added to the training text, so the model never learned to stop. Append the end token, and include it in the labels.

**Why.** Eval loss compares tokens in the labels, so it cannot catch a token that was never there. Also check that the generation config's stop tokens match the template.
:::

:::drill tricky
Your LoRA trained with `r = 16`, `α = 32`. You change to `r = 32` and keep `α = 32`. What changes besides the capacity?
---
**Answer.** The scale `α/r` drops from 2 to 1, so a given `BA` has half the effect. That acts like a lower effective learning rate on the update.

**Why.** Compare runs with this in mind. Conversely, reloading a trained adapter with a different `α` than it was trained with changes its effect directly.
:::

:::drill concept
What does QLoRA save, and what does it fail to save?
---
**Answer.** It saves base-weight memory, about 4.13 bits per weight in place of 16. It does not reduce activation memory, gradient memory for activations or time per step.

**Why.** Activations grow with batch size and sequence length, and they run in the compute type. Dequantizing each forward pass adds some time, so training is often slower than with an unquantized base. Its benefit is that the model fits on the GPU at all.
:::

:::drill tricky
Why is the base quantized in QLoRA but not the adapters?
---
**Answer.** The base is frozen and only needs to give good enough forward and backward passes. Adapter updates are small, and 4-bit values could not represent them.

**Why.** Rounding to 16 levels would wipe out most small steps. That is why adapters are kept at higher precision and quantization is not simply applied to everything.
:::

:::drill output
For a hypothetical 13-billion-weight base, compute base memory in 16-bit, 8-bit and QLoRA's 4-bit with double quantization.

```python run=lm-c02-d-mem
n = 13e9
for name, bits in [("16-bit", 16), ("8-bit", 8), ("NF4 + double quant", 4 + 8 / 64 + 32 / (64 * 256))]:
    print(f"{name:20} {bits:6.3f} bits/weight  {n * bits / 8 / 1e9:6.2f} GB")
```
---
**Answer.** 26 GB, 13 GB and about 6.7 GB.

**Why.** Bytes equal weights times bits over 8. This excludes activations, adapters and optimizer state, so a GPU of exactly this size would still run out of memory.
:::

:::drill concept
List the stages of a classic RLHF pipeline, and name the models that are in memory during PPO.
---
**Answer.** SFT, reward model training on human comparisons, then PPO. PPO typically holds the policy, value network, frozen reward model and frozen reference.

**Why.** The reference provides the KL penalty. It is common to share some weights between the policy and value network, and it is possible to run the reward model elsewhere, but the cost remains significant.
:::

:::drill concept
Why does DPO avoid both a separate reward model and sampling?
---
**Answer.** It writes the reward in terms of the policy's own log ratio against the reference. The troublesome `Z(x)` cancels in a pairwise difference. The result is a supervised loss on fixed pairs.

**Why.** No separate network has to score answers, and fixed pairs mean no generation is needed in the training loop. The trade-off is no exploration, and no reusable scorer afterwards.
:::

:::drill bug
A DPO implementation drifts far from the base model, losing general ability. What is wrong?

```python
def dpo_loss(logp_chosen, logp_rejected, beta):
    return -F.logsigmoid(beta * (logp_chosen - logp_rejected)).mean()
```
---
**Answer.** The reference log probabilities are missing. It should use `(logp_chosen - ref_chosen) - (logp_rejected - ref_rejected)`.

**Why.** Without them, the optimum is `π ∝ exp(r/β)` with nothing tying it to the reference, so the KL anchor is gone. If the reference is evaluated from the live model, the same thing happens, so freeze it or precompute its values.
:::

:::drill tricky
You tune with DPO, and the loss drops well on training and eval. Users say answers got longer and more repetitive. How can both be true?
---
**Answer.** The loss measures whether chosen answers beat rejected ones in your pairs. It does not measure real outputs, and if chosen answers tend to be longer, the model can learn length as a cue.

**Why.** Evaluate generated output for length and repetition, check your dataset for such bias, and compare outputs against the reference on the same prompts.
:::

:::drill concept
A fine-tune beats the base model on the eval set by a wide margin, but the eval set was a random 10% split of examples written from 50 source documents. Why should you be wary?
---
**Answer.** Train and eval share the same sources, so near-duplicate content can leak between them. The score then measures memory as much as skill.

**Why.** Split by source or user. Add examples from sources not used in training, and compare with the base model using your best prompt on the same set.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1400
Implement a LoRA layer in NumPy, and train it by gradient descent to learn an unknown low-rank change to a matrix. Show: the initial output equals the base, `W` never changes, how error depends on `r`, the parameter saving, and that merging gives the same output.
---
Use `y = x Wᵀ + s (x Aᵀ) Bᵀ`. With squared error and residual `R`, the gradients are `2s Rᵀ (X Aᵀ) / N` for `B` and `2s Bᵀ Rᵀ X / N` for `A`.

```python run=lm-c02-c-lora
import numpy as np

class Lora:
    def __init__(self, W, r, alpha=None, seed=0):
        rng = np.random.default_rng(seed)
        self.W = W
        self.s = (alpha if alpha is not None else r) / r
        self.A = rng.normal(0, 0.1, size=(r, W.shape[1]))
        self.B = np.zeros((W.shape[0], r))

    def __call__(self, X):
        return X @ self.W.T + self.s * (X @ self.A.T) @ self.B.T

    def step(self, X, Y, lr):
        R = self(X) - Y
        gB = 2 * self.s * R.T @ (X @ self.A.T) / len(X)
        gA = 2 * self.s * self.B.T @ R.T @ X / len(X)
        self.B -= lr * gB
        self.A -= lr * gA
        return float((R ** 2).mean())

    def merged(self):
        return self.W + self.s * self.B @ self.A

rng = np.random.default_rng(1)
m, n, true_rank = 32, 32, 3
W = rng.normal(size=(m, n)) / np.sqrt(n)
delta = rng.normal(size=(m, true_rank)) @ rng.normal(size=(true_rank, n)) / n
X = rng.normal(size=(128, n))
Y = X @ (W + delta).T
X_test = rng.normal(size=(128, n))
Y_test = X_test @ (W + delta).T
base_error = float(((X_test @ W.T - Y_test) ** 2).mean())
W_before = W.copy()

print(f"full matrix params {m * n:,}, base test MSE {base_error:.4f}")
print(" r  params  % of full  test MSE")
for r in (1, 2, 3, 4, 8):
    layer = Lora(W, r)
    if r == 1:
        print("starts equal to base:", bool(np.allclose(layer(X_test), X_test @ W.T)))
    for _ in range(800):
        layer.step(X, Y, lr=0.05)
    mse = float(((layer(X_test) - Y_test) ** 2).mean())
    print(f"{r:2}  {r * (m + n):6}  {100 * r * (m + n) / (m * n):9.1f}  {mse:8.4f}")

print("W unchanged:", bool(np.array_equal(W, W_before)))
print("merged matches adapter:", bool(np.allclose(X_test @ layer.merged().T, layer(X_test))))
```

Error drops as `r` approaches the true rank of 3, then stays low. Rank 4 and rank 8 cost more parameters and bring no real gain on this clean problem. All of the learning happens in `A` and `B`, and the test shows that `W` is untouched.
:::

:::drill code rating=1300
Write `dpo_loss` over token log probabilities with a mask for the response positions. Test three cases: the policy equals the reference, the policy prefers the chosen answer, and the reference term is removed.
---
Sum log probabilities only over the response tokens. The prompt positions are masked, as with instruction tuning labels.

```python run=lm-c02-c-dpo
import numpy as np

def seq_logp(token_logps, mask):
    return (token_logps * mask).sum(axis=1)

def dpo_loss(pi_c, pi_r, ref_c, ref_r, mask_c, mask_r, beta=0.5):
    margin = (seq_logp(pi_c, mask_c) - seq_logp(ref_c, mask_c)) - (seq_logp(pi_r, mask_r) - seq_logp(ref_r, mask_r))
    return float(np.mean(np.logaddexp(0.0, -beta * margin)))      # stable -log sigmoid

mask_c = np.array([[0, 0, 1, 1, 1]], dtype=float)                 # first two positions are prompt
mask_r = np.array([[0, 0, 1, 1, 0]], dtype=float)                 # shorter answer, last is padding
ref_c = np.array([[-9.0, -5.0, -1.0, -1.2, -0.8]])
ref_r = np.array([[-9.0, -5.0, -0.9, -1.1, -7.0]])

print(f"ln 2 = {np.log(2):.3f}")
print(f"policy = reference       {dpo_loss(ref_c, ref_r, ref_c, ref_r, mask_c, mask_r):.3f}")

better_c, worse_r = ref_c + 0.4 * mask_c, ref_r - 0.4 * mask_r
print(f"prefers chosen           {dpo_loss(better_c, worse_r, ref_c, ref_r, mask_c, mask_r):.3f}")
worse_c, better_r = ref_c - 0.4 * mask_c, ref_r + 0.4 * mask_r
print(f"prefers rejected         {dpo_loss(worse_c, better_r, ref_c, ref_r, mask_c, mask_r):.3f}")

no_ref = np.zeros_like(ref_c)
print(f"policy = reference, ref term dropped {dpo_loss(ref_c, ref_r, no_ref, no_ref, mask_c, mask_r):.3f}")
print("response log probs under the reference:", seq_logp(ref_c, mask_c).round(2), seq_logp(ref_r, mask_r).round(2))

changed = ref_c.copy()
changed[0, :2] -= 3.0                                             # change prompt positions only
print(f"changing masked positions, loss {dpo_loss(changed, ref_r, ref_c, ref_r, mask_c, mask_r):.3f}")
```

Equal policy and reference gives `ln 2`, and the loss goes down or up according to the preference. Dropping the reference gives a different starting value that depends on the sequence log probabilities. A longer answer has a lower total log probability, so that bug also adds a bias based on length. The last line confirms that changes at masked positions have no effect.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- Decide by failure type: format and tone go to prompts, changing or private facts go to RAG, stable behaviour goes to fine-tuning. Keep an evaluation set for all of them.
- Instruction data: use the correct template, mask the prompt with `-100`, include EOS in the labels, and check for truncation that removes the answer.
- LoRA: `W' = W + (α/r) B A`. `B` starts at 0, `A` is random. Parameters are `r(m + n)` against `m·n`. Time per step stays about the same, and memory for gradients on the base goes away.
- Merge for inference, or keep adapters separate and swap them on a shared base.
- QLoRA: 4-bit NF4 frozen base, double quantization of the scales, adapters at higher precision. About 4.13 bits per weight. No saving on activations or time.
- RLHF stages: SFT, reward model, PPO with a KL penalty. Risks: reward hacking, cost, instability.
- Bradley-Terry: `-log σ(r_w - r_l)`. Only differences matter.
- PPO clip: `min(ratio·A, clip(ratio)·A)`. It caps gains and keeps penalties.
- KL-penalised optimum: `π ∝ π_ref exp(r/β)`. A small β moves far from the reference.
- DPO: `-log σ(β[log(π/π_ref)(y_w) - log(π/π_ref)(y_l)])`. `Z(x)` cancels, so no reward model and no sampling. No exploration.
- Evaluate: task metrics, baseline with best prompt, split by source, pairwise judging, safety regressions, slices, serving config.
