---
name: LLMs & fine-tuning
short: LLMs
icon: LM
version: Toy models in Python 3.12 and NumPy
eyebrow: BPE · attention · sampling · KV cache · LoRA · QLoRA · RLHF · DPO · quantization · vLLM · TGI
headline: How large language models <em>are trained, adapted and served</em>, explained well enough to answer the follow-ups.
lede: Three chapters for final-year students preparing for applied-AI and ML engineer interviews who already know basic neural networks. You build a BPE tokenizer, causal attention, a top-p sampler, a LoRA update, a DPO loss, a memory calculator and a continuous-batching simulator in plain NumPy, and every output shown comes from running that code.
card: BPE tokenization, self-attention, decoding and the KV cache; choosing between prompting, RAG and fine-tuning; LoRA, QLoRA, RLHF and DPO; GPTQ, AWQ and GGUF, continuous batching, PagedAttention, speculative decoding and serving cost estimates.
cta: Start with attention|#ch01; Fine-tuning|#ch02; Serving|#ch03
search: Search: top-p, causal mask, low-rank, NF4, DPO, KV cache, TTFT…
---

:::hero Why low-rank updates matter
```python run=lm-home-hero
m, n, r = 4096, 4096, 8                     # one weight matrix and a LoRA rank
full = m * n
lora = r * (m + n)
print(f"full update  {full:>12,} parameters")
print(f"LoRA update  {lora:>12,} parameters")
print(f"LoRA is {100 * lora / full:.2f}% of the full matrix")
```

A low-rank update to this matrix trains **65,536** numbers where a full update would train more than 16 million. Chapter 2 derives this, shows when the saving is safe to use, and builds the update from scratch.
:::

## What this guide covers

An LLM interview usually moves through three questions. How does the model turn text into a next-token distribution? How do you change its behaviour for your task? How do you run it for many users at a sensible cost? Each chapter takes one of these questions.

| Chapter | Topic | You build |
|---|---|---|
| [1](#ch01) | Tokenization, attention and how LLMs are trained | BPE trainer, causal attention, next-token loss, temperature, top-k and top-p, beam search, KV cache |
| [2](#ch02) | LoRA, QLoRA, RLHF and DPO | Label masking, LoRA update with parameter counts, NF4-style quantizer, pairwise reward model, DPO loss |
| [3](#ch03) | Quantization and serving with vLLM or TGI | GPTQ and AWQ toys, flash attention, memory calculator, page allocator, speculative decoding, continuous-batching simulator |

## How to use the drills

Answer each drill out loud before opening it, and include the reason. Interviewers rarely stop at a definition. They ask what breaks: "what happens if the mask is off by one?", "why not fine-tune instead?", "what does quantizing the weights not save?". When you have an answer, try to name the follow-up question it invites, then answer that too.

Drills marked **output** run real code: predict the output before you open the answer. Press <kbd>/</kbd> to search, and use the contents list to move around a chapter.

## Suggested plan

| Sessions | Read | Drill |
|---|---|---|
| 1 | Ch 1, tokenization to the transformer block | Draw a block from memory and explain each residual |
| 2 | Ch 1, training to the end | Do the sampling arithmetic by hand, then all drills |
| 3 | Ch 2, decision table, data and LoRA | Work out the parameter count for a model of your choice |
| 4 | Ch 2, QLoRA, RLHF, DPO and evaluation | Derive why the partition term cancels in DPO, then all drills |
| 5 | Ch 3, quantization, memory and flash attention | Run the memory calculation by hand for one model size |
| 6 | Ch 3, batching to cost estimates | Change the simulator's slot count and predict the result, then all drills |

## What is real and what is illustrative

Every block with an output below it was executed when the site was built, and the output is the real one. Those programs are toys that use small matrices and invented workloads, so the mechanism carries over to real systems while the numbers do not. Parameter counts, memory arithmetic and cost figures use round hypothetical values unless a chapter says otherwise.

Hugging Face, PyTorch, vLLM and TGI code cannot run in this site's build, so it appears in plain code blocks with no output, labelled **illustrative**. Library names and arguments change between releases, so check them against the version you have installed. This field moves quickly, and this guide teaches the mechanisms that change slowly. Look up current benchmarks yourself and treat any you find as specific to their hardware and workload.
