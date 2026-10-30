---
title: RAG: chunking, embeddings, hybrid search and re-ranking
part: Part A · Building the agent
lede: Retrieval-augmented generation finds relevant text and gives it to the model so the answer can rest on your documents. Most RAG failures are retrieval failures, so this chapter builds the retrieval side by hand: chunkers, BM25, vector search, approximate indexes with recall measured, reciprocal rank fusion, re-ranking, query rewriting, agentic retrieval, citation checks and the metrics that let you find which stage broke.
desc: RAG pipeline, chunking, embeddings, cosine similarity, exact vs IVF and HNSW, BM25, RRF, cross-encoders, query rewriting, agentic RAG, citations, recall@k, MRR, failure diagnosis
hours: 6
prereqs: Chapter 1 (the loop). Basic linear algebra (dot product).
---

## The pipeline {#ch02-pipeline .th}

A model does not know your refund policy, and it may invent one if asked. RAG fetches relevant text at question time and places it in the prompt. It has an offline half and an online half.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 220" role="img" aria-label="RAG pipeline: offline documents are chunked, embedded and indexed; online the query is rewritten, retrieved by BM25 and vectors, fused, re-ranked and given to the LLM with citations">
  <text x="10" y="16" class="t-small">offline: indexing</text>
  <rect x="10" y="24" width="110" height="38" rx="5" class="d-soft"/><text x="65" y="48" text-anchor="middle">documents</text>
  <rect x="150" y="24" width="90" height="38" rx="5" class="d-box"/><text x="195" y="48" text-anchor="middle">chunk</text>
  <rect x="270" y="24" width="90" height="38" rx="5" class="d-box"/><text x="315" y="48" text-anchor="middle">embed</text>
  <rect x="390" y="24" width="150" height="38" rx="5" class="d-key"/><text x="465" y="48" text-anchor="middle">vector + BM25 index</text>
  <path d="M120 43 L150 43 M240 43 L270 43 M360 43 L390 43" class="d-line"/>
  <text x="10" y="102" class="t-small">online: answering</text>
  <rect x="10" y="110" width="80" height="38" rx="5" class="d-soft"/><text x="50" y="134" text-anchor="middle">query</text>
  <rect x="112" y="110" width="84" height="38" rx="5" class="d-box"/><text x="154" y="134" text-anchor="middle">rewrite</text>
  <rect x="218" y="92" width="94" height="32" rx="5" class="d-acc"/><text x="265" y="113" text-anchor="middle">BM25</text>
  <rect x="218" y="134" width="94" height="32" rx="5" class="d-acc"/><text x="265" y="155" text-anchor="middle">vector</text>
  <rect x="334" y="110" width="66" height="38" rx="5" class="d-box"/><text x="367" y="134" text-anchor="middle">RRF</text>
  <rect x="422" y="110" width="84" height="38" rx="5" class="d-box"/><text x="464" y="134" text-anchor="middle">re-rank</text>
  <rect x="528" y="110" width="84" height="38" rx="5" class="d-box"/><text x="570" y="134" text-anchor="middle">LLM</text>
  <rect x="634" y="110" width="76" height="38" rx="5" class="d-key"/><text x="672" y="134" text-anchor="middle">cited</text>
  <path d="M90 129 L112 129 M196 122 L218 108 M196 136 L218 150 M312 108 L334 122 M312 150 L334 136 M400 129 L422 129 M506 129 L528 129 M612 129 L634 129" class="d-line"/>
  <path d="M465 62 C 465 80, 265 70, 265 92" class="d-line d-dash"/>
  <text x="10" y="196" class="t-small">Measure each arrow separately: chunk boundaries, recall of the retrievers, rank after re-ranking, faithfulness of the answer.</text>
</svg></div><figcaption><b>Each box can fail on its own.</b> Most of this chapter builds one box at a time, and the metrics and diagnosis sections then show how to find which one failed.</figcaption></figure>

## Chunking {#ch02-chunk .th}

You usually embed pieces of documents, for two reasons. A single vector for a long document blurs its topics together, and the prompt only has room for a few passages. So **how** you split affects everything downstream.

| Strategy | How | Good for | Risk |
|---|---|---|---|
| Fixed size with overlap | N tokens, sliding | Quick baseline, uniform text | Splits sentences and tables |
| Sentence or paragraph | Split on natural boundaries, merge up to a limit | Prose | Uneven sizes |
| Structure-aware | Headings, sections, code blocks, table rows | Docs, manuals, contracts | Needs a parser per format |
| Parent-child | Search small chunks, return the larger parent | Precise match, enough context | More storage and logic |
| Contextual headers | Prepend title and section to each chunk | Chunks that say "it" or "this plan" | Larger chunks |

The program below shows how a fact gets cut at a boundary, and what overlap and structure do about it.

```python run=ag-c02-chunk
DOC = """# Refunds
Refunds go to the original payment method. Processing takes 5 days.

# Cancellations
Cancel within 24 hours for free. After that a fee of 10 percent applies to all plans."""

def fixed(text, size, overlap=0):
    step = size - overlap
    return [text[i:i + size] for i in range(0, len(text), step) if text[i:i + size].strip()]

def by_heading(text):
    sections = []
    for part in text.split("# ")[1:]:
        title, _, body = part.partition("\n")
        sections.append(f"[{title}] " + " ".join(body.split()))
    return sections

FACT = "within 24 hours for free"
for name, chunks in [("fixed 60", fixed(DOC, 60)), ("fixed 60, overlap 20", fixed(DOC, 60, 20)),
                     ("by heading", by_heading(DOC))]:
    whole = sum(FACT in c for c in chunks)
    print(f"{name}: {len(chunks)} chunks, fact whole in {whole}")
    for c in chunks:
        print("   ", repr(c))
```

Fixed chunks cut "for free" in half, so no chunk holds the whole fact, and a search for it would find only a fragment. Overlap repairs that cut because the fact now sits whole in a neighbouring window. The price is more chunks with repeated text, including a useless tail. Splitting on headings keeps the fact whole, and the section title now travels with the chunk, so a passage that says "that" still has its topic.

There is no universally best chunk size, because it depends on your documents and queries. Treat size as a parameter, and pick it by measuring retrieval on your eval set (see the metrics section below).

## Embeddings and similarity {#ch02-embed .th}

An embedding model maps text to a fixed-length vector, trained so that related texts land close together. You compare vectors with cosine similarity, `a·b / (|a||b|)`. If vectors are normalised to length 1, cosine equals the dot product, and Euclidean distance gives the same ranking, since `|a-b|² = 2 - 2 cos(a,b)`.

```python run=ag-c02-cosine
import numpy as np

rng = np.random.default_rng(0)
docs = rng.normal(size=(1000, 64))
query = rng.normal(size=64)

unit = lambda v: v / np.linalg.norm(v, axis=-1, keepdims=True)
d, q = unit(docs), unit(query)
cos = d @ q
l2 = np.linalg.norm(d - q, axis=1)
print("same top 5 by cosine and L2:", list(np.argsort(-cos)[:5]) == list(np.argsort(l2)[:5]))
print("identity holds:", bool(np.allclose(l2 ** 2, 2 - 2 * cos)))
raw_dot = docs @ query
print("top 5 cosine:     ", [int(i) for i in np.argsort(-cos)[:5]])
print("top 5 raw dot:    ", [int(i) for i in np.argsort(-raw_dot)[:5]])
```

The raw dot product on unnormalised vectors gives a different order, because it also rewards long vectors. Use the metric your embedding model was trained for, and use the same model for documents and queries. Changing the model means re-embedding everything, since vectors from two models are not comparable.

The toy below uses a small hand-written word-vector table as a **stand-in** for an embedding model. Each dimension is a made-up concept. A real model learns hundreds or thousands of opaque dimensions, but the search arithmetic is the same.

```python run=ag-c02-embed
import numpy as np

#                  money time acct fail
WORDS = {"refund":  [1.0, 0.0, 0.0, 0.0], "money":   [0.9, 0.0, 0.1, 0.0], "back":    [0.5, 0.1, 0.0, 0.0],
         "charged": [0.8, 0.0, 0.2, 0.2], "password":[0.0, 0.0, 1.0, 0.0], "login":   [0.0, 0.0, 0.9, 0.2],
         "reset":   [0.0, 0.1, 0.7, 0.1], "locked":  [0.0, 0.0, 0.7, 0.5], "error":   [0.0, 0.0, 0.1, 1.0],
         "days":    [0.0, 1.0, 0.0, 0.0], "failed":  [0.1, 0.0, 0.1, 0.9]}

def embed(text):
    vectors = [WORDS[w] for w in text.lower().split() if w in WORDS]
    v = np.sum(vectors, axis=0) if vectors else np.zeros(4)
    n = np.linalg.norm(v)
    return v / n if n else v

DOCS = ["refund takes 5 days", "reset your password to login", "ERR-4012 error at checkout"]
q = "how do I get my money back"
for d in DOCS:
    print(f"{float(embed(q) @ embed(d)):.3f}  {d}")
print("query with no known words:", embed("ERR-4012"))
```

The query shares no word with the refund document, and it still ranks first. That is what vector search adds. The last line shows the weakness: an exact code such as `ERR-4012` has no entry here. A real model will produce some vector for it, but rare identifiers are not reliably matched, because the model never learned that token as meaningful. That gap is why hybrid search exists.

## Vector indexes: exact, IVF and HNSW {#ch02-index .th}

Exact search compares the query with every vector. It has perfect recall and costs `O(N·d)` per query. That is often fine for thousands of vectors, and even more with a matrix multiply on good hardware. Past that, you trade some recall for speed with an approximate nearest-neighbour (ANN) index.

**IVF (inverted file)** clusters the vectors with k-means. A query compares against the centroids, then searches only the `nprobe` nearest clusters.

**HNSW (hierarchical navigable small world)** builds a layered proximity graph. Search starts at a sparse top layer, moves greedily toward the query, and drops down layer by layer, keeping a candidate list of size `efSearch` on the bottom layer. It usually gives high recall quickly, and it uses a lot of memory for the graph.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 190" role="img" aria-label="IVF searches a few clusters; HNSW walks a graph greedily through layers">
  <text x="10" y="16" class="t-small">IVF: visit the nearest clusters only</text>
  <circle cx="70" cy="70" r="38" class="d-soft"/><circle cx="170" cy="60" r="34" class="d-acc"/><circle cx="110" cy="140" r="34" class="d-acc"/><circle cx="240" cy="130" r="36" class="d-soft"/><circle cx="290" cy="50" r="28" class="d-soft"/>
  <circle cx="145" cy="100" r="5" class="d-fill-trap"/><text x="152" y="96" class="t-small">query</text>
  <text x="170" y="56" text-anchor="middle" class="t-small">probe 1</text><text x="105" y="150" text-anchor="middle" class="t-small">probe 2</text>
  <text x="400" y="16" class="t-small">HNSW: greedy descent, then a local search</text>
  <text x="680" y="44" class="t-small">L2</text><text x="680" y="94" class="t-small">L1</text><text x="680" y="154" class="t-small">L0</text>
  <path d="M420 40 L 640 40" class="d-grid"/><path d="M420 90 L 640 90" class="d-grid"/><path d="M420 150 L 640 150" class="d-grid"/>
  <circle cx="440" cy="40" r="5" class="d-fill-acc"/><circle cx="600" cy="40" r="5" class="d-fill-muted"/>
  <circle cx="440" cy="90" r="5" class="d-fill-acc"/><circle cx="520" cy="90" r="5" class="d-fill-acc"/><circle cx="620" cy="90" r="5" class="d-fill-muted"/>
  <circle cx="520" cy="150" r="5" class="d-fill-acc"/><circle cx="470" cy="150" r="5" class="d-fill-muted"/><circle cx="560" cy="150" r="5" class="d-fill-acc"/><circle cx="600" cy="150" r="5" class="d-fill-trap"/><circle cx="430" cy="150" r="5" class="d-fill-muted"/>
  <path d="M440 40 L440 90 L520 90 L520 150 L560 150 L600 150" class="d-line-acc"/>
</svg></div><figcaption><b>Two ways to avoid comparing against everything.</b> The IVF sketch shows why a query near a cluster boundary needs more than one probe. In the HNSW sketch, long jumps happen on sparse upper layers and fine steps on the dense bottom layer.</figcaption></figure>

The program measures the trade-off with a real IVF and a simplified graph search: a k-nearest-neighbour graph, with either one fixed entry point or a sparse sample of 60 entry points that plays the role of HNSW's upper layers. It counts distance computations, which do not depend on the machine, as timings would.

```python run=ag-c02-ann
import heapq
import numpy as np

N, D, K = 3000, 32, 10

def experiment(spread):
    rng = np.random.default_rng(42)
    centers = rng.normal(size=(30, D)) * spread
    data = centers[rng.integers(0, 30, N)] + rng.normal(size=(N, D))
    queries = centers[rng.integers(0, 30, 50)] + rng.normal(size=(50, D))
    truth = [set(np.argsort(((data - q) ** 2).sum(1))[:K].tolist()) for q in queries]

    # IVF: k-means, then search only the nearest nprobe lists
    C = data[rng.choice(N, 40, replace=False)].copy()
    for _ in range(10):
        assign = ((data[:, None] - C[None]) ** 2).sum(2).argmin(1)
        for c in range(len(C)):
            if (assign == c).any():
                C[c] = data[assign == c].mean(0)
    lists = [np.where(assign == c)[0] for c in range(len(C))]

    def ivf(q, nprobe):
        order = ((C - q) ** 2).sum(1).argsort()[:nprobe]
        ids = np.concatenate([lists[c] for c in order])
        best = ids[((data[ids] - q) ** 2).sum(1).argsort()[:K]]
        return set(best.tolist()), len(C) + len(ids)

    # Graph: each node links to its 16 nearest neighbours; best-first search, candidate list of size ef
    sq = (data ** 2).sum(1)
    graph = np.argsort(sq[:, None] + sq[None] - 2 * data @ data.T, axis=1)[:, 1:17]
    upper = rng.choice(N, 60, replace=False).tolist()         # a sparse "upper layer" of entry points
    centre = [int(((data - data.mean(0)) ** 2).sum(1).argmin())]   # one fixed entry point

    def graph_search(q, ef, entries):
        dist = lambda i: float(((data[i] - q) ** 2).sum())
        entry = min(entries, key=dist)
        seen, count = {entry}, len(entries)
        frontier = [(dist(entry), entry)]
        best = [(-frontier[0][0], entry)]
        while frontier:
            d, node = heapq.heappop(frontier)
            if len(best) >= ef and d > -best[0][0]:
                break
            for nb in graph[node].tolist():
                if nb not in seen:
                    seen.add(nb)
                    dn = dist(nb)
                    count += 1
                    if len(best) < ef or dn < -best[0][0]:
                        heapq.heappush(frontier, (dn, nb))
                        heapq.heappush(best, (-dn, nb))
                        if len(best) > ef:
                            heapq.heappop(best)
        return {i for _, i in sorted((-d, i) for d, i in best)[:K]}, count

    def show(label, fn):
        results = [fn(q) for q in queries]
        recall = np.mean([len(r & t) / K for (r, _), t in zip(results, truth)])
        print(f"  {label:24} recall@10={recall:.3f} distances={np.mean([c for _, c in results]):.0f}")

    print(f"exact search: recall@10=1.000 distances={N}; cluster spread={spread}")
    for p in (1, 2, 4, 8):
        show(f"IVF nprobe={p}", lambda q: ivf(q, p))
    show("graph ef=50, one entry", lambda q: graph_search(q, 50, centre))
    for ef in (10, 50, 100):
        show(f"graph ef={ef}, 60 entries", lambda q: graph_search(q, ef, upper))

experiment(3.0)    # well-separated clusters
experiment(0.8)    # overlapping clusters
```

Read the first block first. On well-separated clusters, IVF does very well, because its clusters match the data. The graph with one entry point scores 0.000. That is a real failure: when every node's nearest neighbours are in its own cluster, the graph falls into disconnected islands and the search can never leave the first one. Sparse entry points help a lot, and recall still stalls below 0.9, since a query's true neighbours can sit in an island the search did not start in.

On overlapping clusters, the picture changes. IVF needs many more probes, because a query's neighbours are spread over several lists, and the graph is now connected, so raising `ef` buys recall steadily. So the winner depends on the data, and the numbers here come from a toy, so do not quote them as properties of real libraries. The lesson for interviews is the method: compute ground truth with exact search on a sample, then plot recall against cost for your own data. Real HNSW also chooses links with a heuristic that keeps some longer edges, specifically to avoid the islands seen above.

Compression methods such as product quantization (PQ) store vectors as short codes, trading recall for memory, and they often combine with IVF. Libraries like FAISS and pgvector implement these index types. Their tuning names vary, but they map onto the same ideas: `nprobe`, `M` (links per node), `efConstruction` and `efSearch`.

:::trap Metadata filters and ANN
"Top 10 where tenant = X" is harder than it looks. Filtering after the search can leave fewer than 10 results, or none, if most neighbours belong to other tenants. Filtering during the graph walk can disconnect the search. Check how your index handles filters, and test with a rare filter value. For tenant isolation, separate indexes or partitions are a safer starting point.
:::

## BM25 {#ch02-bm25 .th}

BM25 is the standard keyword-ranking function. It scores a document by summing over the query terms that appear in it:

`score = Σ IDF(t) · f(t,d)·(k1+1) / ( f(t,d) + k1·(1 - b + b·|d|/avgdl) )`

Here `f` is the term's count in the document. The three ideas are easy to explain:

- **IDF** makes rare words count for more, so `ERR-4012` outweighs `the`.
- **Saturation through `k1`** means the tenth occurrence of a word adds little.
- **Length normalisation through `b`** stops long documents winning merely by containing more words.

Common defaults are `k1` around 1.2 to 2 and `b` around 0.75.

```python run=ag-c02-bm25
import math
import re
from collections import Counter

CORPUS = {
    "refunds":  "Refunds go back to the original payment method and take 5 days.",
    "cancel":   "Cancel within 24 hours for free. Later cancellation has a 10 percent fee.",
    "err4012":  "Error ERR-4012 at checkout means the card issuer declined the payment.",
    "reset":    "Reset your password from the login page using the emailed link.",
    "locked":   "An account is locked after five failed login attempts for 30 minutes.",
    "invoice":  "Download an invoice from the billing page. Invoices are monthly.",
}

def tokenize(text):
    return re.findall(r"[a-z0-9-]+", text.lower())

class BM25:
    def __init__(self, docs, k1=1.5, b=0.75):
        self.k1, self.b = k1, b
        self.tf = {d: Counter(tokenize(t)) for d, t in docs.items()}
        self.len = {d: sum(c.values()) for d, c in self.tf.items()}
        self.avg = sum(self.len.values()) / len(docs)
        self.df = Counter(t for c in self.tf.values() for t in c)
        self.n = len(docs)

    def idf(self, t):
        return math.log((self.n - self.df[t] + 0.5) / (self.df[t] + 0.5) + 1)

    def score(self, query, d):
        s = 0.0
        for t in tokenize(query):
            f = self.tf[d][t]
            s += self.idf(t) * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * self.len[d] / self.avg))
        return s

    def search(self, query):
        scored = [(self.score(query, d), d) for d in self.tf]
        return sorted([(round(s, 3), d) for s, d in scored if s > 0], key=lambda x: (-x[0], x[1]))

bm = BM25(CORPUS)
print("idf payment:", round(bm.idf("payment"), 3), " idf err-4012:", round(bm.idf("err-4012"), 3))
for q in ["ERR-4012", "payment declined", "how do I get my money back", "I want my money returned"]:
    print(repr(q), bm.search(q))
```

`err-4012` appears in one document and `payment` in two, so the rare token has the higher IDF. The tokenizer matters as much as the formula here: one that split on the hyphen would turn the code into two weaker tokens. The third query only hits `refunds` through the single word "back", which is luck. The fourth asks the same thing in other words and gets nothing at all, since BM25 sees no matching term.

## Hybrid search with reciprocal rank fusion {#ch02-rrf .th}

Keyword search handles exact terms and misses paraphrases. Vector search handles paraphrases and can miss exact terms. You would like to combine them, but their scores are on different scales: a BM25 score of 5.2 and a cosine of 0.81 cannot be added directly.

**Reciprocal rank fusion (RRF)** ignores the scores and uses only the ranks. For each document:

`RRF(d) = Σ over retrievers of 1 / (k + rank(d))`

`k` is usually 60, the value from the paper that introduced it. A document ranked well by both retrievers beats one ranked first by only one of them. The whole retrieval toy is below: BM25, vectors, and fusion, on the same corpus.

```python run=ag-c02-hybrid
import math
import re
from collections import Counter
import numpy as np

CORPUS = {
    "refunds":  "Refunds go back to the original payment method and take 5 days.",
    "cancel":   "Cancel within 24 hours for free. Later cancellation has a 10 percent fee.",
    "err4012":  "Error ERR-4012 at checkout means the card issuer declined the payment.",
    "reset":    "Reset your password from the login page using the emailed link.",
    "locked":   "An account is locked after five failed login attempts for 30 minutes.",
    "invoice":  "Download an invoice from the billing page. Invoices are monthly.",
}
tokenize = lambda text: re.findall(r"[a-z0-9-]+", text.lower())
TF = {d: Counter(tokenize(t)) for d, t in CORPUS.items()}
LEN = {d: sum(c.values()) for d, c in TF.items()}
AVG = sum(LEN.values()) / len(CORPUS)
DF = Counter(t for c in TF.values() for t in c)

def bm25(query, k1=1.5, b=0.75):
    scores = {}
    for d in CORPUS:
        s = 0.0
        for t in tokenize(query):
            f = TF[d][t]
            idf = math.log((len(CORPUS) - DF[t] + 0.5) / (DF[t] + 0.5) + 1)
            s += idf * f * (k1 + 1) / (f + k1 * (1 - b + b * LEN[d] / AVG))
        if s > 0:
            scores[d] = s
    return sorted(scores, key=lambda d: (-scores[d], d))

# STAND-IN for an embedding model: dimensions are money, time, account, failure
WORDS = {"refunds": [1, 0, 0, 0], "money": [.9, 0, .1, 0], "back": [.5, .1, 0, 0], "payment": [.8, 0, .1, 0],
         "fee": [.7, 0, 0, 0], "card": [.6, 0, .2, .1], "declined": [.2, 0, .1, .9], "error": [0, 0, .1, 1],
         "failed": [.1, 0, .1, .9], "password": [0, 0, 1, 0], "login": [0, 0, .9, .2], "account": [0, 0, 1, 0],
         "locked": [0, 0, .7, .5], "days": [0, .3, 0, 0], "hours": [0, .3, 0, 0], "minutes": [0, .3, 0, 0],
         "invoice": [.5, 0, .2, 0], "billing": [.6, 0, .2, 0], "cannot": [0, 0, 0, .6], "sign": [0, 0, .7, 0]}

def embed(text):
    vs = [WORDS[w] for w in tokenize(text) if w in WORDS]
    v = np.sum(vs, axis=0) if vs else np.zeros(4)
    n = np.linalg.norm(v)
    return v / n if n else v

VEC = {d: embed(t) for d, t in CORPUS.items()}

def vector(query, min_sim=0.3):
    q = embed(query)
    sims = {d: float(q @ v) for d, v in VEC.items()}
    return sorted((d for d in sims if sims[d] >= min_sim), key=lambda d: (-sims[d], d))

def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, d in enumerate(ranking, 1):
            scores[d] = scores.get(d, 0.0) + 1 / (k + rank)
    return sorted(scores, key=lambda d: (-scores[d], d)), scores

for q in ["ERR-4012", "I want my money returned", "cannot sign in after failed login"]:
    a, b = bm25(q), vector(q)
    fused, scores = rrf([a, b])
    print(repr(q))
    print("  bm25  :", a[:4])
    print("  vector:", b[:4])
    print("  rrf   :", [(d, round(scores[d], 4)) for d in fused[:3]])
```

Each retriever fails one of the first two queries: vector search has no vector for `ERR-4012`, and BM25 shares no term with "money returned". Fusion ranks the right document first on all three, because a document only needs to appear in one list to survive. In the last query both retrievers agree, so those documents score close to `2/61`, about double what a single-list hit gets. The threshold `min_sim` keeps very weak vector hits out, and real systems often simply take the top N from each retriever.

RRF is a good default because it needs no tuning or score calibration. Its limitation is that it discards score gaps: a doc barely in rank 1 and a doc far ahead of rank 2 count the same. If you have labelled data, a weighted combination of normalised scores can beat it. Measure before assuming so.

## Re-ranking with a cross-encoder {#ch02-rerank .th}

The embedding retriever is a **bi-encoder**: query and document are embedded separately, so that document vectors can be computed ahead of time. It never looks at the two texts together. A **cross-encoder** takes the pair as a single input and outputs one relevance score. That is usually more accurate, since it can see how the query's words interact with the document's. It also costs a model call per pair and cannot be precomputed for unseen queries, so you can't run it over the whole corpus.

The standard design is a funnel: retrieve maybe 50 to 100 candidates cheaply, re-rank them, and pass the top 3 to 10 to the LLM. The re-ranker can only reorder what it receives. If the right chunk never reached the candidate set, re-ranking cannot rescue it.

Below, a hand-written function that rewards query-term coverage and adjacency is a **stand-in** for a real cross-encoder.

```python run=ag-c02-rerank
import re

tokenize = lambda text: re.findall(r"[a-z0-9-]+", text.lower())
STOP = {"the", "a", "an", "to", "of", "is", "my", "do", "i", "how", "on", "for", "what"}

CANDIDATES = {   # imagine these came back from hybrid search, in this order
    "plan-a": "The annual plan renews each year. Monthly plans can be cancelled at any time.",
    "fee":    "A fee applies to monthly plans. The annual fee is waived for students.",
    "cancel": "To cancel an annual plan, open billing. Cancelling the annual plan refunds unused months.",
    "faq":    "Plans and billing FAQ. Annual, monthly, cancel, refund, students, invoices.",
}

def cross_encoder_standin(query, doc):
    """STAND-IN: coverage of query terms, plus a bonus for adjacent query-term pairs."""
    q = [t for t in tokenize(query) if t not in STOP]
    d = tokenize(doc)
    coverage = sum(t in d for t in q) / len(q)
    text = " ".join(d)
    adjacency = sum(f"{a} {b}" in text for a, b in zip(q, q[1:])) / max(1, len(q) - 1)
    return round(coverage + adjacency, 3)

query = "how do I cancel an annual plan"
retrieved = list(CANDIDATES)
scored = sorted(retrieved, key=lambda d: (-cross_encoder_standin(query, CANDIDATES[d]), d))
print("before:", retrieved)
print("scores:", {d: cross_encoder_standin(query, CANDIDATES[d]) for d in sorted(CANDIDATES)})
print("after: ", scored)
```

`cancel` moves from third place to first, because it contains all three query terms and the pair "annual plan". `plan-a` stays near the top although it does not say how to cancel, which shows the limit of a word-counting stand-in. A real cross-encoder learns these interactions from training data, and that is the accuracy gain you pay for.

## Query rewriting {#ch02-rewrite .th}

Users write poorly formed queries, and follow-ups often depend on the conversation ("what about for students?"). A cheap model call can fix this before retrieval. The common forms are:

- **Contextualise:** turn a follow-up into a standalone question using chat history.
- **Expand:** add synonyms, or generate several variants and fuse the results with RRF (multi-query).
- **Decompose:** split "compare X and Y" into separate searches.
- **HyDE:** generate a hypothetical answer and search with its embedding, since answers often resemble documents more than questions do. A wrong hypothetical answer can mislead the search.

```python run=ag-c02-rewrite
def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, d in enumerate(ranking, 1):
            scores[d] = scores.get(d, 0.0) + 1 / (k + rank)
    return sorted(scores, key=lambda d: (-scores[d], d))

DOCS = {"d1": "student discount on annual plan", "d2": "cancel annual plan refund",
        "d3": "student verification documents", "d4": "monthly plan price"}

def search(q):
    words = set(q.lower().split())
    hits = [(len(words & set(t.split())), d) for d, t in DOCS.items()]
    return [d for n, d in sorted(hits, key=lambda h: (-h[0], h[1])) if n]

def rewrite_llm(history, q):
    """STAND-IN for a rewriting model: returns standalone variants of a follow-up."""
    if q == "what about for students?" and "annual plan" in history:
        return ["student discount annual plan", "student price annual plan", "student verification"]
    return [q]

history = "user: how much is the annual plan?"
q = "what about for students?"
print("raw query:   ", search(q))
variants = rewrite_llm(history, q)
for v in variants:
    print(f"  {v!r}: {search(v)}")
print("multi-query: ", rrf([search(v) for v in variants]))
```

The raw follow-up finds nothing, because "students" does not match "student" in this toy and the other words are absent from the corpus. Stemming would fix that one word, but it would still lack the "annual plan" context, which only the rewrite supplies. The cost is an extra call and added latency, and a poor rewrite can hurt, so evaluate with and without it.

## Agentic RAG {#ch02-agentic .th}

Basic RAG retrieves once and answers. **Agentic RAG** exposes search as a tool in the Chapter 1 loop, so the model can search again after reading results, reformulate, follow a reference, or decide it has enough. This helps with multi-hop questions, where the second search depends on the first answer.

```python run=ag-c02-agentic
DOCS = {
    "teams":   "The payments team owns the refund service.",
    "oncall":  "The on-call lead for the payments team is Asha.",
    "refunds": "Refunds take 5 days.",
}

def search(q):
    words = set(q.lower().split())
    hits = [(len(words & set(t.lower().rstrip('.').split())), d) for d, t in DOCS.items()]
    return [(d, DOCS[d]) for n, d in sorted(hits, key=lambda h: (-h[0], h[1]))[:1] if n]

def scripted_llm(observations):
    """STAND-IN: decides the next action from what has been retrieved so far."""
    text = " ".join(t for _, t in observations)
    if "owns the refund service" not in text:
        return {"tool": "search", "q": "who owns the refund service"}
    if "on-call" not in text:
        return {"tool": "search", "q": "on-call lead for the payments team"}
    cited = [d for d, _ in observations]
    return {"answer": "Asha is the on-call lead for the team that owns refunds.", "cited": cited}

observations = []
for step in range(1, 5):
    action = scripted_llm(observations)
    if "answer" in action:
        print("answer:", action["answer"], "cited:", action["cited"])
        break
    found = search(action["q"])
    print(f"step {step}: search({action['q']!r}) -> {found}")
    observations += found

print("single search for the whole question:", search("who is on-call for the service that handles refunds"))
```

The single search lands on the on-call document, and nothing it returned shows that the payments team owns refunds. The loop finds the team first, then uses that name in the second query. The price is more calls, more latency and a less predictable path, so a fixed pipeline remains the better default for simple lookups. A router can send simple questions down the fixed path.

## Citations {#ch02-citations .th}

Citations let users check answers, and they let you test faithfulness automatically. The usual method gives each chunk an ID in the prompt, and asks the model to tag each claim with the ID it came from. A model can still invent or misattribute citations, so check them in code. The first check below is exact: does the ID exist among the retrieved chunks? The second is only a heuristic: does the cited chunk share the claim's key terms and numbers?

```python run=ag-c02-cite
import re

CHUNKS = {"c1": "Refunds take 5 days to reach the original payment method.",
          "c2": "Cancel within 24 hours for free. After that a 10 percent fee applies."}

def check(answer):
    out = []
    for sentence in re.split(r"(?<=\.)\s+", answer.strip()):
        ids = re.findall(r"\[(\w+)\]", sentence)
        claim = re.sub(r"\[\w+\]", "", sentence).lower()
        numbers = set(re.findall(r"\d+", claim))
        if not ids:
            out.append(("no citation", sentence))
        elif any(i not in CHUNKS for i in ids):
            out.append(("unknown id", sentence))
        elif not numbers <= set(re.findall(r"\d+", " ".join(CHUNKS[i] for i in ids))):
            out.append(("number not in source", sentence))
        else:
            out.append(("ok", sentence))
    return out

ANSWER = ("Refunds take 5 days [c1]. Cancelling is free within 48 hours [c2]. "
          "A 10 percent fee applies later [c2]. Support is open all week [c9]. Plans renew yearly.")
for status, sentence in check(ANSWER):
    print(f"{status:22} {sentence}")
```

The checker catches the invented ID, the changed number and the uncited sentence. A paraphrase that changes the meaning with the same numbers would pass, so a real system adds an LLM-judged faithfulness check (Chapter 3) on a sample.

:::trap Retrieved text is untrusted input
A document can contain instructions aimed at the model. RAG therefore opens a route for indirect prompt injection, which Chapter 3 demonstrates. Mark retrieved text clearly as data, and limit what the model can do after reading it.
:::

## Retrieval metrics {#ch02-metrics .th}

Evaluate retrieval on its own, using a set of queries with known relevant documents. These metrics need no LLM, so they are cheap to run on every change.

- **Recall@k:** of all relevant documents, the fraction appearing in the top k. It answers "did we retrieve it at all?".
- **Precision@k:** of the top k, the fraction that are relevant.
- **Hit rate@k:** the fraction of queries with at least one relevant document in the top k. With exactly one relevant document per query, it equals recall@k.
- **MRR (mean reciprocal rank):** the mean over queries of 1 / (rank of the first relevant document), counted as 0 if none is found. It rewards having the first relevant result near the top.
- **nDCG:** handles graded relevance and rewards good ordering across the whole list.

```python run=ag-c02-metrics
def recall_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) & relevant) / len(relevant)

def precision_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) & relevant) / k

def reciprocal_rank(ranked, relevant):
    for i, d in enumerate(ranked, 1):
        if d in relevant:
            return 1 / i
    return 0.0

EVAL = [  # query id, relevant docs, ranked output from three retrievers
    ("exact code",  {"err4012"},           {"bm25": ["err4012"], "vector": ["refunds", "invoice", "err4012"], "hybrid": ["err4012", "refunds", "invoice"]}),
    ("paraphrase",  {"refunds"},           {"bm25": ["cancel", "invoice"], "vector": ["refunds", "invoice", "cancel"], "hybrid": ["refunds", "invoice", "cancel"]}),
    ("two docs",    {"reset", "locked"},   {"bm25": ["locked", "err4012", "reset"], "vector": ["reset", "locked", "invoice"], "hybrid": ["locked", "reset", "err4012"]}),
    ("not indexed", {"sso"},               {"bm25": ["reset"], "vector": ["locked", "reset"], "hybrid": ["reset", "locked"]}),
]

print(f"{'retriever':10} {'recall@1':>9} {'recall@3':>9} {'prec@3':>7} {'MRR':>6}")
for name in ("bm25", "vector", "hybrid"):
    rows = [(rel, runs[name]) for _, rel, runs in EVAL]
    mean = lambda f: sum(f(r, rel) for rel, r in rows) / len(rows)
    print(f"{name:10} {mean(lambda r, rel: recall_at_k(r, rel, 1)):9.3f} {mean(lambda r, rel: recall_at_k(r, rel, 3)):9.3f} "
          f"{mean(lambda r, rel: precision_at_k(r, rel, 3)):7.3f} {mean(reciprocal_rank):6.3f}")

print("per query, hybrid:")
for q, rel, runs in EVAL:
    r = runs["hybrid"]
    print(f"  {q:12} recall@3={recall_at_k(r, rel, 3):.2f} RR={reciprocal_rank(r, rel):.3f}")
```

The rankings are typed in so that you can check the arithmetic by hand. Recall@1 is low everywhere partly because "two docs" can score at most 0.5 at `k=1`. Hybrid and vector tie on recall@3, and hybrid is ahead on MRR because it places the first relevant document higher. Nothing scores on "not indexed", since no retriever can find a document that was never indexed. Read the per-query lines as well as the means, because an average hides which type of query fails.

:::trap Your eval set can lie
If the eval queries were written by someone reading the documents, they share vocabulary with the documents, and keyword search looks better than it will on real traffic. Collect real user queries where you can. Label by document or section as well as by chunk ID, because chunk IDs change whenever you re-chunk.
:::

## Diagnosing failures {#ch02-diagnose .th}

"The RAG gives wrong answers" is not yet a diagnosis. Walk the pipeline in order, and find the first stage where the correct information goes missing.

| Check | If it fails | Typical fixes |
|---|---|---|
| Is the fact in the corpus? | Knowledge gap | Add the document; have the system say it doesn't know |
| Was it parsed correctly? | Extraction bug | Fix PDF and table parsing |
| Is it whole in one chunk? | Chunking | Overlap, structure-aware splitting, parent-child |
| In the top 100 candidates? | Recall | Hybrid search, query rewriting, a better embedding model, metadata fixes |
| In the top k after re-ranking? | Ranking | Re-ranker, larger k, fusion |
| In the prompt? | Assembly | Truncation, context budget, order |
| Answer uses it faithfully? | Generation | Prompt, conflicting sources, model choice |
| Answer is fresh? | Staleness | Re-indexing, deletions, dates in metadata |

Run this checklist over the whole eval set and count the first failing stage per query. The counts tell you whether to work on chunking or on the prompt. Log the ranks at each stage in production so that this analysis is possible later.

## Mapping to frameworks {#ch02-frameworks .th}

LlamaIndex, LangChain and similar libraries package these parts. "Node parser" or "text splitter" means chunker, "retriever" means search, "node postprocessor" or "compressor" often means re-ranker. "Ensemble retriever" or "fusion retriever" typically means RRF or a weighted merge. Vector databases add storage, filtering and index maintenance. Knowing the primitives tells you what to inspect when the default configuration underperforms.

```python
# illustrative only: names and imports vary by library and version. Not run here.
chunks  = splitter.split(documents)           # your fixed() or by_heading()
index   = vector_store.from_texts(chunks, embedder)
hits    = fuse(bm25.search(q, 50), index.search(q, 50))   # your rrf()
top     = reranker.rerank(q, hits)[:5]        # your cross_encoder step
answer  = llm.invoke(build_prompt(q, top))    # with ids, for citations
```

## Drills {#ch02-drills .dr}

:::drill concept
Your RAG system gives a wrong answer. What is your first step?
---
**Answer.** Look at what was retrieved for that query, before touching the prompt or the model. Then walk the stages: is the fact in the corpus, parsed properly, in one chunk, in the candidates, in the final top k, and used faithfully?

**Why.** It splits the problem in two at once. If the right chunk was in the prompt, the issue is generation. If not, changing the prompt cannot help.
:::

:::drill concept
Why is cosine similarity equal to dot product for normalised vectors, and when do they differ?
---
**Answer.** Cosine is `a·b / (|a||b|)`, and normalising makes the denominator 1. On unnormalised vectors, the dot product also rewards length, so long vectors rank higher.

**Follow-up.** Use the metric the model was trained for. Some models encode useful information in the length, and in that case dot product is right.
:::

:::drill output
Compute RRF with `k=60` by hand for doc X (ranks 1 and 50) and doc Y (ranks 5 and 5). Which wins?

```python run=ag-c02-d-rrf
k = 60
x = 1 / (k + 1) + 1 / (k + 50)
y = 1 / (k + 5) + 1 / (k + 5)
print(f"X={x:.4f} Y={y:.4f}")
for k in (1, 10, 60):
    x = 1 / (k + 1) + 1 / (k + 50)
    y = 2 / (k + 5)
    print(f"k={k:<3} X={x:.4f} Y={y:.4f} winner={'X' if x > y else 'Y'}")
```
---
**Answer.** At `k=60`, Y wins because both retrievers agree on it. At `k=1`, the gap between rank 1 and rank 5 is much larger, so X wins. So `k` controls how much a top rank dominates: a larger `k` flattens the curve and rewards agreement.
:::

:::drill output
For `ranked = [d3, d1, d7, d2, d9]` and `relevant = {d1, d2, d5}`, compute recall@3, recall@5, precision@3 and the reciprocal rank.

```python run=ag-c02-d-metrics
ranked = ["d3", "d1", "d7", "d2", "d9"]
relevant = {"d1", "d2", "d5"}
for k in (3, 5):
    hits = len(set(ranked[:k]) & relevant)
    print(f"k={k} recall={hits / len(relevant):.3f} precision={hits / k:.3f}")
first = next(i for i, d in enumerate(ranked, 1) if d in relevant)
print("reciprocal rank:", round(1 / first, 3))
```
---
**Answer.** Top 3 holds one relevant doc, so recall@3 is 1/3 and precision@3 is 1/3. Top 5 holds two, so recall@5 is 2/3. The first relevant doc sits at rank 2, so RR is 0.5. Recall@5 can never reach 1 here, since `d5` was not retrieved at all.
:::

:::drill bug
This MRR implementation gives a value that is too high. Find the bug.

```python run=ag-c02-d-mrrbug
def mrr(runs):
    total = 0.0
    found = 0
    for ranked, relevant in runs:
        for i, d in enumerate(ranked, 1):
            if d in relevant:
                total += 1 / i
                found += 1
                break
    return total / found

runs = [(["a", "b"], {"a"}), (["c", "d"], {"z"}), (["e", "f"], {"z"}), (["g", "h"], {"h"})]
print(round(mrr(runs), 3))
print("correct:", round((1 + 0 + 0 + 0.5) / len(runs), 3))
```
---
**Answer.** It divides by the number of queries with a hit, so queries that found nothing are dropped. A query with no relevant result must count as 0. Divide by `len(runs)`. This bug hides exactly the failures you want to see.
:::

:::drill bug
Search quality collapsed after a deploy, and every result looks random. Nothing in the retrieval code changed. The diff is below. What happened?

```python
# illustrative
- embedder = load_model("embed-small-v1")
+ embedder = load_model("embed-small-v2")   # queries now use v2; index was built with v1
```
---
**Answer.** Queries are embedded with a new model, while the index holds vectors from the old one. Vectors from different models live in unrelated spaces, so similarity is close to meaningless. If the dimensions match, nothing crashes, which makes this bug hard to spot.

**Fix.** Re-embed the corpus into a new index, switch over when it is ready, and store the model name with the index so a mismatch fails at startup.
:::

:::drill tricky
A team boosts `top_k` from 5 to 50, passing all 50 chunks to the LLM. Recall@k went up and answers got worse. Why?
---
**Answer.** Recall measures whether the fact was retrieved. It does not measure what the model does with it. Fifty chunks bring in distractors and contradictions, add cost and latency, and can push the key passage into the middle of a long prompt, where it may get less attention.

**Fix.** Retrieve many and re-rank down to a few. Track recall at the candidate stage, and precision or MRR at the prompt stage.
:::

:::drill tricky
Why not run the cross-encoder over all documents, since it is more accurate?
---
**Answer.** It needs one model inference per query-document pair at query time, so cost grows linearly with the corpus and nothing can be precomputed. A bi-encoder embeds documents once, and an ANN index then searches them in sub-linear time. Use the cheap retriever to get candidates, and the cross-encoder on those only.
:::

:::drill tricky
Your ANN index returns good results at first, and recall falls after months of updates and deletes, with the same parameters. What might be happening?
---
**Answer.** Possibilities: the data drifted, so IVF centroids trained long ago no longer fit and clusters became unbalanced; deletes left tombstones in a graph index, hurting connectivity; or filtered queries are hitting sparse regions.

**How to know.** Regularly compare the ANN results with exact search on a sample of queries, since exact search gives true recall without any labels. Rebuild or retrain when it drops.
:::

:::drill concept
Exact search or an ANN index for 50,000 vectors of a few hundred dimensions?
---
**Answer.** Start with exact search if the latency meets the requirement. It has perfect recall, no index to maintain, and straightforward filtering. A matrix multiply over that many vectors is commonly in the tens of milliseconds on a CPU or less, depending on hardware, so measure yours.

**Move to ANN** when the corpus or query volume makes exact search too slow or costly. Many teams add ANN earlier than they need to.
:::

:::drill concept
A user asks "what is the latest refund policy?" and the system confidently quotes last year's version. Which layer do you fix?
---
**Answer.** Several. Both versions were in the index, and similarity does not know about dates. Remove or mark superseded documents at ingestion. Store `effective_date` as metadata, and filter or boost by it. Put the dates in the prompt, so the model can see the conflict. Add test cases to the eval set for superseded documents.
:::

:::drill concept
**Design.** Build RAG over 2 million support tickets and internal docs, with per-customer access control. Walk through your design and the first things you would measure.
---
**Answer outline.**

- **Ingest:** a parser per source, structure-aware chunks, contextual headers, metadata (tenant, source, date, permissions).
- **Access:** enforce permissions in the retrieval query, in code. Never rely on the prompt or on post-filtering by the LLM. Partition per tenant where you can.
- **Retrieve:** hybrid BM25 and vector with RRF, then a cross-encoder over the top 50.
- **Answer:** chunk IDs, a citation check, and "I don't know" when retrieval confidence is low.
- **Measure:** recall@50 before re-ranking, MRR after re-ranking, faithfulness, abstention rate, latency per stage, and cost per query. Build the eval set from real tickets.
- **Operate:** incremental indexing with deletes, and a way to re-embed when the model changes.
:::

:::drill concept
**Design.** Users ask both "what does ERR-4012 mean?" and "my payment keeps failing, what should I do?". Explain to a colleague why a vector database on its own will disappoint, and what you would add.
---
**Answer.** The second query suits embeddings. The first relies on an exact token that an embedding may blur into other error codes. Add BM25 (or another keyword index) with a tokenizer that keeps tokens such as `ERR-4012` whole, and fuse with RRF. Then check both types in the eval set, reported separately, since a good average can hide one type failing.
:::

:::drill tricky
Is a high faithfulness score enough to say that an answer is good?
---
**Answer.** No. Faithfulness says that the answer is supported by the retrieved context. If retrieval returned the wrong or an outdated document, the answer can be perfectly faithful and also wrong. You need answer correctness against a reference, and answer relevance to the question, alongside it.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1300
Write a sentence-aware chunker: split into sentences, greedily pack them up to `max_chars`, and start each new chunk with the last `overlap` sentences of the previous one. A single sentence longer than the limit becomes its own chunk.
---
The loop must make progress. If the overlap sentences plus the next sentence don't fit, drop the overlap, or the same sentences could be emitted forever.

```python run=ag-c02-c-chunker
import re

def chunk(text, max_chars, overlap=1):
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    chunks, current = [], []
    for s in sentences:
        if current and len(" ".join(current + [s])) > max_chars:
            chunks.append(" ".join(current))
            current = current[-overlap:] if overlap else []
            if len(" ".join(current + [s])) > max_chars:
                current = []
        current.append(s)
    if current:
        chunks.append(" ".join(current))
    return chunks

TEXT = ("Refunds take 5 days. They go to the original method. Cancel within 24 hours for free. "
        "After that a fee applies. This very long sentence about fees and plans exceeds the limit on its own. "
        "Contact support for help.")
for c in chunk(TEXT, 70):
    print(len(c), repr(c))
```
:::

:::drill code rating=1400
Write a retrieval regression check: given old and new rankings for each query and the relevant set, report the mean recall@k and MRR for both versions, and list each query that got worse.
---
List the queries as well as the means. A change can raise the average and still break an important query.

```python run=ag-c02-c-regress
def rr(ranked, rel):
    return next((1 / i for i, d in enumerate(ranked, 1) if d in rel), 0.0)

def recall(ranked, rel, k):
    return len(set(ranked[:k]) & rel) / len(rel)

def compare(cases, k=3):
    worse, totals = [], {"old": [0.0, 0.0], "new": [0.0, 0.0]}
    for q, rel, old, new in cases:
        for name, r in (("old", old), ("new", new)):
            totals[name][0] += recall(r, rel, k)
            totals[name][1] += rr(r, rel)
        if rr(new, rel) < rr(old, rel) or recall(new, rel, k) < recall(old, rel, k):
            worse.append(f"{q}: RR {rr(old, rel):.2f}->{rr(new, rel):.2f}")
    n = len(cases)
    for name, (a, b) in totals.items():
        print(f"{name}: recall@{k}={a / n:.3f} MRR={b / n:.3f}")
    print("worse:", worse)

compare([("q1", {"a"}, ["b", "c", "a"], ["a", "b", "c"]),
         ("q2", {"d"}, ["x", "y", "z"], ["d", "x", "y"]),
         ("q3", {"e"}, ["e", "x", "y"], ["x", "y", "e"]),
         ("q4", {"f"}, ["f", "x", "y"], ["x", "y", "z"]),
         ("q5", {"g"}, ["x", "g", "y"], ["g", "x", "y"])])
```

MRR rises and recall@3 holds, and the list still shows two queries that got worse, including one the new version lost entirely.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- Pipeline: parse, chunk, embed, index, then rewrite, retrieve, fuse, re-rank, generate, cite. Most failures are retrieval failures.
- Chunking: fixed with overlap as a baseline, structure-aware when documents have structure, parent-child to search small and return large. Choose the size by measuring.
- Similarity: cosine, dot product and L2 agree on normalised vectors. Never mix embedding models in one index.
- Index: exact is `O(Nd)` with recall 1. IVF: clusters and `nprobe`. HNSW: layered graph and `efSearch`, with more memory. PQ compresses. Measure recall against exact search.
- BM25: IDF, saturation `k1`, length normalisation `b`. Strong on rare exact terms.
- RRF: sum of `1/(k+rank)`, usually `k=60`, needs no score calibration.
- Cross-encoder: scores the pair together. More accurate, costs one inference per pair, so use it on candidates only. It cannot recover what retrieval missed.
- Rewriting: contextualise, expand, decompose, HyDE. Agentic RAG: search as a tool, for multi-hop questions.
- Citations: IDs in the prompt, check them in code. Retrieved text is untrusted.
- Metrics: recall@k (found it), precision@k (noise), MRR (first hit high), nDCG (graded). Queries with no hit count as 0.
- Diagnose in order: corpus, parse, chunk, candidates, top k, prompt, generation, freshness.
