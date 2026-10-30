---
title: Tokenization, attention and how LLMs are trained
part: Part A · How the model works
lede: An LLM maps a sequence of token ids to a probability distribution over the next token, and everything else in this chapter supports that one function. You build BPE, causal attention, the next-token loss and the decoding strategies, then see why a KV cache makes generation affordable and why a model trained this way can state falsehoods with confidence.
desc: BPE, embeddings, self-attention, causal mask, transformer block, next-token loss, teacher forcing, temperature, top-k, top-p, beam search, KV cache, context windows, hallucination
hours: 5
prereqs: Basic neural networks, softmax and cross-entropy, matrix multiplication
---

## The whole path in one picture {#ch01-pipeline .th}

Text goes in and a probability distribution comes out. A **tokenizer** turns text into integer ids. An **embedding table** turns ids into vectors. A stack of **transformer blocks** mixes information between positions. A final linear layer, often called the **LM head**, produces one score (a **logit**) per vocabulary entry at each position. **Decoding** picks the next token from the scores at the last position, appends it, and repeats.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 176" role="img" aria-label="Pipeline from text through tokenizer, embeddings, transformer blocks and LM head to a next-token distribution, with the chosen token fed back as input">
  <rect x="6" y="30" width="86" height="44" rx="5" class="d-soft"/><text x="49" y="49" text-anchor="middle" class="t-small">text</text><text x="49" y="65" text-anchor="middle" class="t-mono">"low er"</text>
  <rect x="116" y="30" width="86" height="44" rx="5" class="d-box"/><text x="159" y="49" text-anchor="middle" class="t-small">tokenizer</text><text x="159" y="65" text-anchor="middle" class="t-mono">[71, 9]</text>
  <rect x="226" y="30" width="96" height="44" rx="5" class="d-box"/><text x="274" y="49" text-anchor="middle" class="t-small">embeddings</text><text x="274" y="65" text-anchor="middle" class="t-mono">T x d</text>
  <rect x="346" y="30" width="110" height="44" rx="5" class="d-acc"/><text x="401" y="49" text-anchor="middle" class="t-small">N blocks</text><text x="401" y="65" text-anchor="middle" class="t-mono">T x d</text>
  <rect x="480" y="30" width="86" height="44" rx="5" class="d-box"/><text x="523" y="49" text-anchor="middle" class="t-small">LM head</text><text x="523" y="65" text-anchor="middle" class="t-mono">T x V</text>
  <rect x="590" y="30" width="124" height="44" rx="5" class="d-key"/><text x="652" y="49" text-anchor="middle" class="t-small">decode</text><text x="652" y="65" text-anchor="middle" class="t-mono">next id</text>
  <path d="M92 52 L 116 52" class="d-line"/><path d="M202 52 L 226 52" class="d-line"/><path d="M322 52 L 346 52" class="d-line"/><path d="M456 52 L 480 52" class="d-line"/><path d="M566 52 L 590 52" class="d-line"/>
  <path d="M652 74 L 652 122 L 159 122 L 159 74" class="d-line-acc"/>
  <text x="405" y="142" text-anchor="middle" class="t-small">the chosen id is appended to the input, and the loop repeats until a stop token or length limit</text>
  <text x="405" y="162" text-anchor="middle" class="t-small">T = sequence length, d = embedding size, V = vocabulary size</text>
</svg></div><figcaption><b>One generation loop.</b> Training uses the same forward path but compares the logits at every position against the true next token.</figcaption></figure>

## BPE tokenization {#ch01-bpe .th}

A model needs a finite vocabulary. Whole words give a large vocabulary and no way to handle a new word. Single characters give long sequences and force the model to rebuild every word. **Byte pair encoding (BPE)** sits between them: start with characters or bytes, then repeatedly merge the most frequent adjacent pair into a new token. The ordered list of merges is the trained tokenizer.

The program below trains on the small corpus from the paper that brought BPE to neural machine translation. A word-end marker `</w>` lets the tokenizer tell the `est` in `newest` from the `est` in `estimate`.

```python run=lm-c01-bpe
from collections import Counter

corpus = {"low": 5, "lower": 2, "newest": 6, "widest": 3}

def to_symbols(word):
    return tuple(word) + ("</w>",)

def pair_counts(words):
    counts = Counter()
    for symbols, freq in words.items():
        for pair in zip(symbols, symbols[1:]):
            counts[pair] += freq
    return counts

def merge_word(symbols, pair):
    out, i = [], 0
    while i < len(symbols):
        if i + 1 < len(symbols) and (symbols[i], symbols[i + 1]) == pair:
            out.append(symbols[i] + symbols[i + 1])
            i += 2
        else:
            out.append(symbols[i])
            i += 1
    return tuple(out)

def train(corpus, n_merges):
    words = {to_symbols(w): f for w, f in corpus.items()}
    merges = []
    for _ in range(n_merges):
        counts = pair_counts(words)
        # ties broken by the pair itself, so the result does not depend on dict order
        pair = max(counts, key=lambda p: (counts[p], p))
        merges.append(pair)
        print(f"merge {pair[0]!r:8} + {pair[1]!r:8} seen {counts[pair]}")
        words = {merge_word(s, pair): f for s, f in words.items()}
    return merges, words

def encode(word, merges):
    symbols = to_symbols(word)
    for pair in merges:                 # apply merges in the order they were learned
        symbols = merge_word(symbols, pair)
    return list(symbols)

merges, words = train(corpus, 8)
print("corpus now:", [" ".join(s) for s in words])
for word in ["newest", "lowest", "slower", "zebra"]:
    print(f"{word:7} -> {encode(word, merges)}")
```

Frequent strings become single tokens, and `lowest`, which never appeared in training, still encodes cleanly as known pieces. `zebra` has no learned merge, so it falls apart into single characters. Real tokenizers work the same way at larger scale: they start from bytes, so any input can be encoded and nothing is ever out of vocabulary, and they pre-split text with a regular expression so merges never cross certain boundaries. Special tokens such as end-of-text are added outside the merge process.

Consequences that interviewers ask about:

- **Token counts differ from word counts.** Common English words are often one token, while rare words, code and identifiers split into several. A common rough figure for English is about four characters per token. Measure with the real tokenizer when cost or limits matter.
- **The model does not see letters.** It sees ids. Counting the letters in a word, reversing a string or rhyming is hard when the word arrives as one or two opaque tokens.
- **Whitespace and case change the tokens.** `" hello"`, `"hello"` and `"Hello"` commonly map to different ids, so stray spaces in a prompt can change behaviour.
- **Tokenizers belong to their models.** The ids only mean something to the model trained with that tokenizer.

:::trap
Using a different tokenizer, or a different version of the chat template, than the model was trained with gives no error. The ids are all valid and the output simply gets worse. Always load the tokenizer shipped with the checkpoint.
:::

## Embeddings and position {#ch01-embed .th}

An **embedding table** is a trainable `V x d` matrix, and looking up a token id selects one row. Similar tokens tend to end up with similar vectors because that helps prediction, but nothing enforces it.

Self-attention by itself has no idea of order: shuffle the inputs and the outputs shuffle the same way. Position has to be added. Three common choices are **learned position embeddings** (a second table, one row per position, which caps the maximum length), **sinusoidal encodings** (fixed functions of position, from the original transformer) and **rotary embeddings (RoPE)**, which rotate query and key vectors by an angle that depends on position, so their dot product depends on relative distance. RoPE is common in recent open-weight models such as the Llama family and adds no parameters.

Many models also **tie** the LM head to the embedding table: the head reuses the same matrix, which saves `V x d` parameters. This program counts the parameters of a GPT-2-small layout, whose configuration is public, so you can see where the weights live.

```python run=lm-c01-params
V, ctx, d, layers = 50257, 1024, 768, 12

tok, pos = V * d, ctx * d
qkv = d * (3 * d) + 3 * d          # one matrix producing Q, K and V, with biases
out = d * d + d
attn = qkv + out
mlp = (d * 4 * d + 4 * d) + (4 * d * d + d)
norms = 2 * (2 * d)                # two LayerNorms, scale and shift
block = attn + mlp + norms
total = tok + pos + layers * block + 2 * d   # final LayerNorm

for name, n in [("token embeddings", tok), ("position embeddings", pos),
                ("all attention", layers * attn), ("all MLPs", layers * mlp),
                ("all LayerNorms", layers * norms + 2 * d)]:
    print(f"{name:20} {n:>12,}  {100 * n / total:5.1f}%")
print(f"{'total (tied head)':20} {total:>12,}")
print(f"{'an untied head adds':20} {V * d:>12,}")
```

The MLPs hold about twice as many parameters as attention, because they expand to `4d` and back. Interview questions focus on attention, but most of each block's weights sit in the MLP. For a large vocabulary with a modest depth, the embedding table is also a large share of the total.

## Self-attention and the causal mask {#ch01-attn .th}

Each position produces three vectors from its embedding through learned linear maps: a **query** (what am I looking for), a **key** (what do I offer) and a **value** (what I pass on). The output at a position is a weighted average of all the values, with weights from query and key dot products:

```text
attention(Q, K, V) = softmax(Q Kᵀ / sqrt(d_k)) V
```

**Multi-head attention** runs `h` of these in parallel on vectors of size `d/h`, then concatenates and projects. Different heads can track different relationships, and the total cost stays about the same as one large head.

An LLM must predict each token using only earlier tokens, so a **causal mask** sets the score of every future position to minus infinity before the softmax. Those weights then become exactly zero.

```python run=lm-c01-mask
import numpy as np

np.set_printoptions(precision=2, suppress=True)
rng = np.random.default_rng(0)
T, d = 5, 8
x = rng.normal(size=(T, d))

scores = x @ x.T / np.sqrt(d)                # use x as Q, K and V for this demo
mask = np.tril(np.ones((T, T), dtype=bool))  # True where attention is allowed
scores = np.where(mask, scores, -np.inf)

weights = np.exp(scores)
weights = weights / weights.sum(axis=1, keepdims=True)
print(mask.astype(int))
print(weights)
print("row sums:", weights.sum(axis=1).round(3))
```

The upper triangle is exactly zero and each row still sums to 1. Row 0 sees only itself, so it predicts token 1 from token 0 alone. The diagonal has to stay on, or row 0 would have nothing to attend to. The mask is applied to scores, before the softmax. Zeroing weights after the softmax would leave rows that no longer sum to 1.

Why divide by `sqrt(d_k)`? With unit-variance entries, the dot product of two random vectors has variance `d_k`, so it grows with dimension. Large scores push the softmax towards one winner and flatten its gradient. The program compares scaled and unscaled scores.

```python run=lm-c01-scale
import numpy as np

rng = np.random.default_rng(1)
print("   d  std(score)  std(scaled)  top weight  top weight scaled")
for d in (4, 64, 1024):
    q = rng.normal(size=(2000, d))
    k = rng.normal(size=(2000, d))
    s = (q * k).sum(axis=1)
    def top(scores):
        w = np.exp(scores - scores.max())
        return (w / w.sum()).max()
    # average the largest softmax weight over many groups of 8 keys
    groups = s[:1600].reshape(200, 8)
    t1 = np.mean([top(g) for g in groups])
    t2 = np.mean([top(g / np.sqrt(d)) for g in groups])
    print(f"{d:4}  {s.std():10.2f}  {(s / np.sqrt(d)).std():11.2f}  {t1:10.2f}  {t2:17.2f}")
```

Scaling keeps the score spread near 1 at every dimension. Without it, the largest weight approaches 1 as `d` grows, so one key takes nearly everything and the gradients to the rest vanish.

Attention costs `O(T²)` in sequence length for a full forward pass, because every position scores every allowed position. That shows up again in context windows and in memory use during serving.

## The transformer block {#ch01-block .th}

A block has two sublayers. Attention lets positions exchange information. A position-wise **MLP** then transforms each position independently. Each sublayer has a residual connection and a normalisation layer. Modern models mostly use **pre-norm**:

```text
x = x + attention(norm(x))
x = x + mlp(norm(x))
```

Each piece has a job you should be able to state:

- **Residuals** give gradients a direct path through a deep stack, and make it easy for a layer to start near the identity.
- **Normalisation** (LayerNorm, or the simpler RMSNorm in several recent models) keeps activations in a stable range. It works per token, so it does not depend on batch statistics the way BatchNorm does.
- **The MLP** adds the nonlinearity. Attention is a weighted average of linear projections of values, so it mixes information but does little to transform it. Without the MLP, the block would have a far weaker ability to compute new features.
- **Stacking** gives depth: the output of one block is the input to the next, with the same causal mask.

Several current open-weight models also replace ReLU or GELU MLPs with gated variants, and share key and value heads between query heads to save memory. Chapter 3 returns to that second idea.

## The pretraining objective and teacher forcing {#ch01-train .th}

Pretraining is self-supervised: the text supplies its own labels. Take a window of tokens, feed all but the last, and ask the model to predict each next token. The loss is the average cross-entropy over positions. A pretrained base model is therefore a document completer. Getting it to behave like an assistant is the subject of Chapter 2.

```text
tokens : [ The, cat, sat, on, mat ]
inputs : [ The, cat, sat, on      ]
labels : [ cat, sat, on,  mat     ]
```

**Teacher forcing** means the input at each position is the true previous token, whatever the model predicted there. This has two benefits. The causal mask lets one forward pass compute every position at once, so training does not need a loop over positions. Also, an early mistake does not throw off the rest of the sequence. The cost is that the model trains only on real histories, and at generation time it has to continue from its own output, including its own mistakes.

The program trains the smallest possible next-token model, one table of logits indexed by the previous character. It uses the same shifted labels and the same loss.

```python run=lm-c01-bigram
import numpy as np

text = "the cat sat on the mat. the dog sat on the log. " * 20
chars = list(dict.fromkeys(text))
ix = {c: i for i, c in enumerate(chars)}
ids = np.array([ix[c] for c in text])
inputs, labels = ids[:-1], ids[1:]            # the one-token shift
V = len(chars)
W = np.zeros((V, V))                          # logits for next char, given previous char

def loss_and_grad(W):
    z = W[inputs]
    z = z - z.max(axis=1, keepdims=True)
    p = np.exp(z)
    p = p / p.sum(axis=1, keepdims=True)
    loss = -np.log(p[np.arange(len(labels)), labels]).mean()
    g = np.zeros_like(W)
    np.add.at(g, inputs, p)
    np.add.at(g, (inputs, labels), -1.0)
    return loss, g / len(labels)

print(f"vocabulary {V}, ln(V) = {np.log(V):.3f}")
for step in range(2001):
    loss, g = loss_and_grad(W)
    if step in (0, 10, 100, 500, 2000):
        print(f"step {step:5}  loss {loss:.3f}")
    W -= 5.0 * g

counts = np.zeros((V, V))
np.add.at(counts, (inputs, labels), 1)
probs = counts / counts.sum(axis=1, keepdims=True)
floor = -np.log(probs[inputs, labels]).mean()
print(f"best any bigram model can do: {floor:.3f}")
```

The starting loss equals `ln(V)`, the loss of a uniform guess. This is a useful sanity check on any new training run: an untrained model with small initial weights should start near `ln(V)`, and a start far from it usually means a bug in the labels or the loss. The loss then falls towards the floor this model can reach, which is above zero because a bigram table cannot use more than one character of context.

Real pretraining runs on the same recipe with more machinery: AdamW, a learning-rate warmup followed by decay, gradient clipping, mixed precision, shuffled shards of tokenized text and distributed training across many GPUs. Padding positions are excluded from the loss. In PyTorch the default `ignore_index` of cross-entropy is `-100`, and Hugging Face follows that convention for labels.

```python
# Illustrative PyTorch, not run here.
logits = model(input_ids).logits                    # (batch, T, V)
loss = F.cross_entropy(
    logits[:, :-1, :].reshape(-1, logits.size(-1)),  # predictions for positions 0..T-2
    input_ids[:, 1:].reshape(-1),                    # the next token at each position
    ignore_index=-100,
)
```

## Temperature, top-k, top-p and beam search {#ch01-sampling .th}

The model gives logits. **Decoding** turns them into a token. The usual sampling recipe applies temperature first, then filters, then renormalises and samples.

- **Temperature** divides logits by `T` before the softmax. `T < 1` sharpens the distribution, `T > 1` flattens it, and `T` near 0 approaches always taking the top token (**greedy** decoding). `T` cannot be exactly zero in the formula, so libraries treat it as greedy.
- **Top-k** keeps the `k` highest-probability tokens. It keeps the same number whether the model is confident or unsure.
- **Top-p (nucleus sampling)** keeps the smallest set of top tokens whose total probability reaches `p`. It adapts: a confident distribution keeps few tokens and an uncertain one keeps many.

```python run=lm-c01-decode
import numpy as np

words = ["Paris", "the", "a", "London", "Rome", "banana"]
logits = np.array([3.0, 2.0, 1.5, 1.0, 0.5, -1.0])

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

def show(name, p):
    print(f"{name:12}", " ".join(f"{x:6.3f}" for x in p))

print(f"{'':12}", " ".join(f"{w[:6]:>6}" for w in words))
for t in (0.5, 1.0, 2.0):
    show(f"T={t}", softmax(logits / t))

p = softmax(logits)
keep = np.argsort(-p)[:3]
q = np.zeros_like(p)
q[keep] = p[keep]
show("top-k k=3", q / q.sum())

order = np.argsort(-p)
cum = np.cumsum(p[order])
n = int(np.searchsorted(cum, 0.9)) + 1
q = np.zeros_like(p)
q[order[:n]] = p[order[:n]]
print("cumulative  ", " ".join(f"{x:6.3f}" for x in cum))
print("top-p p=0.9 keeps", n, "tokens")
show("top-p p=0.9", q / q.sum())
```

Temperature keeps the ranking the same and changes the spread. Filtering sets low-probability tokens to exactly zero, so a token such as `banana` can never be sampled after filtering, whereas plain sampling could choose it now and then. Read the cumulative row to see where top-p stops.

**Beam search** keeps the `b` highest-scoring partial sequences at each step, extends each one, and keeps the top `b` again. The score is the sum of log probabilities. Greedy decoding is beam search with `b = 1`. Beam search helps when one early token with a lower probability leads to a much better sequence:

```python run=lm-c01-beam
import math

MODEL = {"": {"A": 0.5, "B": 0.4, "C": 0.1},
         "A": {"x": 0.4, "y": 0.3, "z": 0.3},
         "B": {"x": 0.9, "y": 0.1},
         "C": {"x": 1.0}}

def beam(width):
    beams = [("", 0.0)]
    for _ in range(2):
        grown = [(s + t, lp + math.log(p)) for s, lp in beams for t, p in MODEL[s[-1:]].items()]
        beams = sorted(grown, key=lambda b: (-b[1], b[0]))[:width]
    return beams

for width in (1, 2):
    print("width", width, [(s, round(math.exp(lp), 2)) for s, lp in beam(width)])
```

Greedy commits to `A`, the best first token, and ends with a sequence of probability 0.20. Width 2 keeps `B` alive and finds `Bx` at 0.36.

Beam search works well for short, tightly constrained outputs such as translation, and poorly for open-ended text. The most likely sequences from a language model are often bland or repetitive, and human text is not always the highest-probability continuation. That finding motivated top-p sampling. Beam search also favours short outputs, because each extra token adds a negative log probability, so implementations usually normalise the score by a power of the length.

:::trap
Temperature, top-k and top-p do not make a model more truthful. They only change how it samples from the distribution it already has. If the top token is wrong, greedy decoding returns that wrong token every time. The hallucination toy at the end of this chapter shows this happening.
:::

## The KV cache {#ch01-kvcache .th}

Generation runs the model again for every new token. A naive loop recomputes every earlier position each time, even though those positions' keys, values and outputs have not changed, because the causal mask stops new tokens from affecting earlier ones. A **KV cache** stores each layer's keys and values for past positions. Each new step then computes one query, one key and one value for the new token, appends the key and value, and attends over the stored ones.

Queries are not cached. A past position's query was only needed to compute that position's output, which is already done.

```python run=lm-c01-kv
import numpy as np

rng = np.random.default_rng(3)
d, T = 16, 8
Wq, Wk, Wv = rng.normal(size=(3, d, d)) / np.sqrt(d)
x = rng.normal(size=(T, d))

def attend(q, K, V):
    s = K @ q / np.sqrt(d)
    w = np.exp(s - s.max())
    return (w / w.sum()) @ V

def no_cache(x):
    last = []
    for t in range(1, len(x) + 1):
        K, V = x[:t] @ Wk.T, x[:t] @ Wv.T         # recomputed every step
        q = x[t - 1] @ Wq.T
        last.append(attend(q, K, V))
    return np.array(last)

def with_cache(x):
    K, V, last = np.empty((0, d)), np.empty((0, d)), []
    for t in range(len(x)):
        K = np.vstack([K, x[t] @ Wk.T])           # only the new token's key and value
        V = np.vstack([V, x[t] @ Wv.T])
        last.append(attend(x[t] @ Wq.T, K, V))
    return np.array(last)

print("outputs match:", np.allclose(no_cache(x), with_cache(x)))
print("  tokens  key/value computed       query-key scores")
print("          no cache     cached     no cache      cached")
for n in (8, 64, 1024):
    kv_none = n * (n + 1) // 2
    scores_none = n * (n + 1) * (2 * n + 1) // 6   # a full t x t score matrix at step t
    print(f"{n:8} {kv_none:10,} {n:10,} {scores_none:12,} {kv_none:11,}")
```

Same results, with a large saving on the amount of work. Without a cache, generating 1024 tokens computes about 358 million query-key scores, and with one it computes about half a million. The cost moves from compute to memory, since the cached tensors grow with every token. Chapter 3 works out the numbers, and that memory turns out to limit how many requests a server can run together.

:::trap
With a cache, the input at each step is one token, so its position has to come from the cache length, not from the length of the current input. If it stays at 0 you get no error and a quietly worse model. This bug is common in hand-written decoders.
:::

## Context windows {#ch01-context .th}

The **context window** is the maximum number of tokens the model handles in one forward pass, and it includes the prompt and the generated output. A model has no memory between calls. Chat products send the conversation history again with each request, which is why long conversations cost more and eventually run out of room.

The limit comes from a few sources:

- **Architecture**: a learned position table has a fixed number of rows. RoPE has no table, but quality degrades beyond the lengths used in training.
- **Memory**: the KV cache grows linearly with length, and an uncached forward pass costs `O(T²)` in attention scores.
- **Quality**: having room for a long document does not guarantee the model will use all of it well.

When the input is too long, something must go: drop the oldest turns, summarise them, or retrieve only the relevant passages (RAG). Make sure the instructions survive. If a client truncates from the start, the system prompt may be the first thing lost.

## Why models hallucinate {#ch01-hall .th}

A **hallucination** is fluent output that is false or unsupported. The cause follows from the objective: the training loss rewards probable continuations of text, and nothing in it directly measures truth. A model can learn many true facts because they are probable in its data, but when it lacks knowledge, the same process still produces a plausible-sounding token.

This toy makes the point with a bigram model trained only on true sentences:

```python run=lm-c01-hall
from collections import Counter, defaultdict

corpus = ["paris is the capital of france"] * 2 + ["rome is the capital of italy",
          "tokyo is the capital of japan"]
next_counts = defaultdict(Counter)
for s in corpus:
    words = s.split()
    for a, b in zip(words, words[1:]):
        next_counts[a][b] += 1

def dist(word, temperature=1.0):
    c = next_counts[word]
    w = {t: n ** (1 / temperature) for t, n in c.items()}
    total = sum(w.values())
    return {t: round(v / total, 3) for t, v in sorted(w.items())}

print("prompt: rome is the capital of ...")
print("T=1.0", dist("of"))
print("T=0.2", dist("of", 0.2))
print("every word pair below appears in the training data:")
for pair in [("rome", "is"), ("is", "the"), ("the", "capital"), ("capital", "of"), ("of", "france")]:
    print(" ", pair, next_counts[pair[0]][pair[1]])
```

Every transition in "rome is the capital of france" was seen in training, and the sentence is false. The model's context is too short here to link the city to the country. A real LLM has far more context and gets this example right, but the failure has the same shape when knowledge is missing or thin. Lowering the temperature makes the false answer more certain, because `france` is the most frequent continuation.

Common causes to name in an interview:

- **Objective**: likelihood of text, with no direct truth signal, and training data that itself contains errors.
- **Sparse knowledge**: rare entities, long IDs, URLs and citations look predictable in form but have few examples. The form comes out right and the details get filled in.
- **No built-in abstention**: a softmax always gives a distribution, and "I don't know" is only produced if training taught it for such cases.
- **Stale data**: facts after the training data ends are simply absent.
- **Prompt pressure**: false premises in the question, or a preference-tuned model that learned that agreeing scores well.
- **Tokenization**: letter-level and arithmetic tasks are poorly served by subword tokens.

Mitigations reduce the rate without removing it: retrieval with citations, restricted output formats, tools for arithmetic and lookups, tuning on examples where the correct answer is to decline, and an evaluation set that measures factual accuracy on your own domain. For high-stakes uses, add verification outside the model.

## Drills {#ch01-drills .dr}

:::drill concept
Why do LLMs use subword tokens instead of words or characters?
---
**Answer.** Words give a huge vocabulary and cannot represent new words. Characters give long sequences, so more compute and context are spent per word. Subwords keep the vocabulary manageable and still cover any input.

**Why.** Byte-level BPE can always fall back to single bytes, so there is no unknown token. Frequent strings are compact, so common text uses few tokens.
:::

:::drill output
Without running it, what is the first merge, and how often was the pair seen?

```python run=lm-c01-d-merge
from collections import Counter

corpus = {"hug": 10, "pug": 5, "pun": 12, "bun": 4, "hugs": 5}
counts = Counter()
for word, freq in corpus.items():
    for pair in zip(word, word[1:]):
        counts[pair] += freq
for pair, n in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
    print(pair, n)
```
---
**Answer.** `('u', 'g')` with 20: 10 from `hug`, 5 from `pug` and 5 from `hugs`.

**Why.** Each pair's count is the sum of the frequencies of the words containing it. `('p', 'u')` comes second with 17 (`pug` and `pun`). Counting is weighted by word frequency, so training never needs another pass over the raw text.
:::

:::drill tricky
A model answers a hard physics question correctly and then miscounts the letter `r` in a common word. Give the most likely reason.
---
**Answer.** The model receives tokens, and a word may arrive as one or two ids with no explicit letters. Letter counts have to be remembered or inferred.

**Why.** The usual fix is to ask it to spell the word out first, or call a tool. Spelling writes each letter as its own token, so the model can then attend to them.
:::

:::drill concept
Why does attention divide scores by `sqrt(d_k)`?
---
**Answer.** The variance of a dot product of independent unit-variance entries equals `d_k`. The division restores a spread near 1, so the softmax is not saturated.

**Why.** A saturated softmax has one weight near 1 and very small gradients. The program in this chapter shows the top weight rising towards 1 with dimension when scores are unscaled.
:::

:::drill bug
This causal mask makes the last position's output NaN, and the model's training loss looks suspiciously good. What is wrong?

```python
mask = np.triu(np.ones((T, T), dtype=bool), k=1)   # True where allowed?
scores = np.where(mask, scores, -np.inf)
weights = softmax(scores)
```
---
**Answer.** `triu(k=1)` is True for the future positions, and `np.where` keeps scores where the mask is True. So it allows only the future and blocks the diagonal. The last row has no future positions, so it is all `-inf` and the softmax gives NaN. Use `np.tril(...)`, which is True at and below the diagonal.

**Why.** Conventions differ: some APIs mean "True = blocked", others "True = allowed", and mixing them up is a frequent source of leaks. A test helps: change a future token and assert that earlier outputs do not change.
:::

:::drill bug
Training loss falls almost to zero within a few hundred steps, and generation produces nonsense. What is the likely bug?

```python
logits = model(input_ids)
loss = cross_entropy(logits.reshape(-1, V), input_ids.reshape(-1))
```
---
**Answer.** The labels are not shifted. Each position can see its own token, so the model only has to copy its input.

**Why.** The self-attention diagonal is allowed, so the input token is available. The correct version compares `logits[:, :-1]` with `input_ids[:, 1:]`. Loss far below what the data should allow is a warning sign.
:::

:::drill output
Probabilities in sorted order are `[0.5, 0.2, 0.15, 0.1, 0.05]`. How many tokens does top-p keep at `p = 0.8`, and what is the top token's new probability?

```python run=lm-c01-d-topp
import numpy as np

p = np.array([0.5, 0.2, 0.15, 0.1, 0.05])
cum = np.cumsum(p)
n = int(np.searchsorted(cum, 0.8)) + 1
print("cumulative", cum.round(2))
print("kept", n, "top token now", round(float(p[0] / p[:n].sum()), 3))
```
---
**Answer.** Three tokens, and the top token becomes about 0.588.

**Why.** Two tokens reach 0.7, which is short of 0.8. The third crosses the threshold and is included. Dividing 0.5 by the kept total of 0.85 gives the new probability.
:::

:::drill tricky
Your distribution has one token at 0.99. How do `k = 40` and `p = 0.9` differ here? What about a nearly flat distribution over 1000 tokens?
---
**Answer.** With the peaked distribution, top-p keeps one token, while top-k keeps 40 with very low probabilities on the other 39. With the flat one, top-k keeps only 40 and top-p keeps about 900.

**Why.** Top-p follows the shape of the distribution, while top-k is a fixed count. When both are set, libraries commonly apply one filter after the other.
:::

:::drill tricky
Why is beam search rarely used for chat-style generation?
---
**Answer.** It tends to give safe, repetitive text, it costs `b` times the work, and it holds `b` KV caches.

**Why.** The most probable sequence is often not the most natural text, and beam search optimises the former. It also cannot stream cleanly, because the best beam may change. It remains useful for short constrained tasks such as translation or some kinds of structured extraction.
:::

:::drill concept
In a KV cache, why are keys and values stored but queries are not?
---
**Answer.** A query is used only to compute its own position's output, and past outputs are finished. New tokens must attend to past keys and values, so those have to stay.

**Why.** The causal mask guarantees that past outputs never change. Without the causal mask, new tokens would change past outputs and the cache would be invalid.
:::

:::drill bug
A hand-written decoder gives good first tokens and then degrades, and only with caching on. The attention code matches the uncached path. What should you check first?
---
**Answer.** Position handling. With a cache, the step's input length is 1, so a position computed as `arange(input_len)` is always 0. It should start from the cache length.

**Why.** Attention itself is unaware of order, so all order information comes from position. Compare cached and uncached logits on the same input with a test like this chapter's `outputs match` check.
:::

:::drill tricky
A model has a window of 8192 tokens. You send a 8000-token prompt and ask for a 1000-word summary. What happens, and what would you do?
---
**Answer.** The output is limited to 192 tokens, so the summary is cut off or the request is rejected, depending on the server. 1000 words needs well over 192 tokens.

**Why.** The window covers input and output together. Options are splitting the document and summarising in stages, trimming the input with retrieval, or using a model with a larger window.
:::

:::drill concept
Does setting `temperature = 0` stop a model from hallucinating?
---
**Answer.** No. It makes the output more repeatable, by always taking the top token, and that token can be wrong.

**Why.** Hallucination comes from the model's learned distribution. Sampling only reads from it. The chapter's toy shows a false answer becoming more likely as temperature falls. Use retrieval, tools, abstention training and factual evaluation.
:::

:::drill tricky
Your new model's loss starts at 11.5, with a vocabulary of about 50,000. Is that healthy? What if it starts at 55?
---
**Answer.** 11.5 is about right, since `ln(50000)` is about 10.8 and random initial logits add a little. A start of 55 points to a problem such as logits with a very large scale, a bad initialisation, or a wrong label or loss setup.

**Why.** An untrained model should be close to a uniform guess. This is a cheap check to run before spending any compute on training.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1300
Write a byte-level BPE tokenizer with `train`, `encode` and `decode`. It must handle any Unicode text and pass a round-trip test.
---
Token ids 0 to 255 are raw bytes, and each merge creates a new id. To encode, repeatedly apply the applicable merge with the lowest rank (the earliest learned). That gives the same result as replaying merges in learned order.

```python run=lm-c01-c-bpe
from collections import Counter

def counts(ids):
    return Counter(zip(ids, ids[1:]))

def replace(ids, pair, new):
    out, i = [], 0
    while i < len(ids):
        if i + 1 < len(ids) and (ids[i], ids[i + 1]) == pair:
            out.append(new)
            i += 2
        else:
            out.append(ids[i])
            i += 1
    return out

def train(text, n_merges):
    ids = list(text.encode("utf-8"))
    merges = {}
    for k in range(n_merges):
        c = counts(ids)
        if not c:
            break
        pair = max(c, key=lambda p: (c[p], p))
        if c[pair] < 2:
            break
        merges[pair] = 256 + k
        ids = replace(ids, pair, merges[pair])
    return merges

def encode(text, merges):
    ids = list(text.encode("utf-8"))
    while len(ids) >= 2:
        pair = min(counts(ids), key=lambda p: merges.get(p, float("inf")))
        if pair not in merges:
            break
        ids = replace(ids, pair, merges[pair])
    return ids

def decode(ids, merges):
    vocab = {i: bytes([i]) for i in range(256)}
    for (a, b), new in merges.items():
        vocab[new] = vocab[a] + vocab[b]
    return b"".join(vocab[i] for i in ids).decode("utf-8", errors="replace")

text = "the theory of the thing is that the theme is there. " * 10
merges = train(text, 20)
print("merges learned:", len(merges))
for sample in ["the theme", "theory", "naïve café 語"]:
    ids = encode(sample, merges)
    print(f"{sample!r:16} bytes {len(sample.encode('utf-8')):2}  tokens {len(ids):2}  round trip {decode(ids, merges) == sample}")
print("training text bytes", len(text.encode()), "tokens", len(encode(text, merges)))
```

The training text falls from 520 bytes to 103 tokens. With only 20 merges, a less frequent word such as `theory` saves little, and the non-ASCII sample gets no saving at all: 16 bytes become 16 tokens, since no merge covers them and those characters take several bytes each in UTF-8. That is why the same content can cost more tokens in a language or domain the tokenizer saw little of. `errors="replace"` matters because a prefix of the tokens can split a multi-byte character, which also happens when streaming tokens to a user.
:::

:::drill code rating=1400
Write multi-head causal self-attention in NumPy. Test the causal property: changing a later token must not change any earlier output. Show that the test fails without the mask.
---
Split `d` into `h` heads, attend per head, then concatenate and project.

```python run=lm-c01-c-attn
import numpy as np

class Attention:
    def __init__(self, d, heads, seed=0):
        rng = np.random.default_rng(seed)
        self.d, self.h, self.dh = d, heads, d // heads
        self.Wqkv = rng.normal(size=(3, d, d)) / np.sqrt(d)
        self.Wo = rng.normal(size=(d, d)) / np.sqrt(d)

    def split(self, x):
        T = x.shape[0]
        return x.reshape(T, self.h, self.dh).transpose(1, 0, 2)    # (h, T, dh)

    def __call__(self, x, causal=True):
        T = x.shape[0]
        Q, K, V = (self.split(x @ W.T) for W in self.Wqkv)
        s = Q @ K.transpose(0, 2, 1) / np.sqrt(self.dh)            # (h, T, T)
        if causal:
            s = np.where(np.tril(np.ones((T, T), dtype=bool)), s, -np.inf)
        w = np.exp(s - s.max(axis=-1, keepdims=True))
        w = w / w.sum(axis=-1, keepdims=True)
        out = (w @ V).transpose(1, 0, 2).reshape(T, self.d)        # concatenate heads
        return out @ self.Wo.T

rng = np.random.default_rng(1)
x = rng.normal(size=(6, 16))
attn = Attention(d=16, heads=4)
print("output shape", attn(x).shape)

changed = x.copy()
changed[4:] += 10.0                 # change tokens 4 and 5 only

for causal in (True, False):
    a, b = attn(x, causal), attn(changed, causal)
    same = [bool(np.allclose(a[t], b[t])) for t in range(6)]
    print("causal" if causal else "no mask", "output unchanged by position:", same)
```

With the mask, positions 0 to 3 are identical and only 4 and 5 change. Without it, every position changes, which is a data leak during training. This test is worth writing for any attention implementation, since a leaky model can show excellent training loss and fail at generation.
:::

:::drill code rating=1300
Write a top-p sampler that applies temperature first. Sample with a fixed seed and compare the empirical frequencies to the target distribution.
---
Sort, take the cumulative sum, keep up to and including the token that crosses `p`, renormalise, and sample.

```python run=lm-c01-c-topp
import numpy as np

def nucleus(logits, p=0.9, temperature=1.0):
    z = np.asarray(logits, dtype=float) / temperature
    probs = np.exp(z - z.max())
    probs = probs / probs.sum()
    order = np.argsort(-probs, kind="stable")
    cum = np.cumsum(probs[order])
    n = int(np.searchsorted(cum, p)) + 1
    kept = np.zeros_like(probs)
    kept[order[:n]] = probs[order[:n]]
    return kept / kept.sum()

logits = [3.0, 2.0, 1.5, 1.0, 0.5, -1.0]
rng = np.random.default_rng(7)
for p, t in [(0.9, 1.0), (0.9, 0.5), (0.5, 1.0), (1.0, 1.0)]:
    target = nucleus(logits, p, t)
    draws = rng.choice(len(logits), size=20000, p=target)
    freq = np.bincount(draws, minlength=len(logits)) / len(draws)
    print(f"p={p} T={t}  kept={int((target > 0).sum())}")
    print("  target", " ".join(f"{x:.3f}" for x in target))
    print("  freq  ", " ".join(f"{x:.3f}" for x in freq))
```

Lowering temperature sharpens the distribution before filtering, so fewer tokens are needed to reach the same `p`. With `p = 1.0` the filter removes nothing, which is a simple test case. Applying the steps in another order gives different results. A common bug is keeping only tokens whose cumulative sum is strictly below `p`, which can leave nothing when the top token alone exceeds `p`.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- BPE: start from bytes or characters, merge the most frequent pair, repeat. Encode by replaying merges in order. Byte-level means no unknown tokens.
- Tokens are opaque to the model: letters are not visible, and whitespace and case change the ids. Use the checkpoint's own tokenizer.
- Attention: `softmax(Q Kᵀ / sqrt(d_k)) V`. Scale because dot-product variance grows with `d_k`. Cost per pass is `O(T²)`.
- Causal mask: set future scores to `-inf` before softmax. The diagonal stays on. Test it by changing a future token.
- Block (pre-norm): `x + attn(norm(x))`, then `x + mlp(norm(x))`. Most weights in a block are in the MLP.
- Pretraining: next-token cross-entropy, labels shifted by one, starting loss about `ln(V)`.
- Teacher forcing: inputs are true tokens, so one pass trains all positions.
- Temperature divides logits. Top-k keeps a fixed count. Top-p keeps the smallest set reaching `p`. Beam search keeps `b` sequences and suits short constrained outputs.
- KV cache: store past keys and values, compute one new query per step. Identical output, less compute, more memory. Position must come from the cache length.
- Context window: input plus output. No memory between calls.
- Hallucination: the objective rewards probable text, not truth. Temperature does not fix it. Use retrieval, tools, abstention tuning and factual evaluation.
