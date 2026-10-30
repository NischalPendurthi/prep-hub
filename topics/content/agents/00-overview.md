---
name: Agents, RAG & evals
short: Agents
icon: AG
version: Toy agents in Python 3.12 and NumPy, with a scripted fake LLM
eyebrow: agent loop · tools · context · memory · RAG · hybrid search · evals · guardrails · prompt injection · multi-agent · coding tools
headline: Build the <em>agent, the retriever and the eval harness</em> by hand, then answer the follow-ups.
lede: Four chapters for students who are comfortable in Python and are preparing for applied-AI and AI-agent engineer interviews. You write an agent loop with tools and stop conditions, context trimming, BM25 plus vector search with rank fusion, retrieval metrics, an eval harness with a regression table, and a prompt-injection attack with a working defence. Everything runs without a model or a network, because a scripted fake LLM stands in for the model.
card: The agent loop, function calling, ReAct and planning, context and memory, RAG with hybrid search and re-ranking, retrieval metrics, evals, guardrails, prompt injection, multi-agent trade-offs and agentic coding interviews, all with runnable toys.
cta: Start with the agent loop|#ch01; Jump to RAG|#ch02; Evals and guardrails|#ch03
search: Search: tool call, ReAct, RRF, recall@k, prompt injection, HNSW…
---

:::hero An agent in 15 lines
```python run=ag-home-hero
def scripted_llm(messages):
    """Stand-in for a real model. A fixed rule, so the output never varies."""
    results = [m["content"] for m in messages if m["role"] == "tool"]
    if not results:
        return {"tool": "add", "args": {"a": 17, "b": 25}}
    return {"text": f"The total is {results[0]}."}

TOOLS = {"add": lambda a, b: a + b}
messages = [{"role": "user", "content": "What is 17 + 25?"}]
while True:
    reply = scripted_llm(messages)
    if "text" in reply:
        print("final:", reply["text"])
        break
    result = TOOLS[reply["tool"]](**reply["args"])
    print("tool call:", reply["tool"], reply["args"], "->", result)
    messages.append({"role": "tool", "content": result})
```

The model only *asked* for `add`. Your code ran it and appended the result, and the second model call could then answer. Every agent framework is built around this loop. Chapter 1 adds the parts that make it survive contact with real use.
:::

## What this guide covers

Applied-AI interviews tend to test one question from several angles: can you build this and keep it working? Interviewers ask you to sketch an agent loop, explain why retrieval returned the wrong chunk, or say how you would know a prompt change made things worse. Knowing a framework's API rarely helps with those questions. Knowing the primitives underneath does, so this guide builds them.

| Chapter | Topic | You build |
|---|---|---|
| [1](#ch01) | The agent loop: tools, planning, context and memory | Loop with stop conditions, schema validator, ReAct parser, tree-of-thought search, plan-and-execute with replanning, context trimmer, branching conversation state, retries with idempotency |
| [2](#ch02) | RAG: chunking, embeddings, hybrid search and re-ranking | Chunkers, BM25, vector search, IVF and graph indexes with recall measured, reciprocal rank fusion, a re-ranking step, agentic retrieval, citation checks, recall@k and MRR |
| [3](#ch03) | Evals, guardrails and multi-agent systems | Graders, eval harness and regression table, confidence intervals, a cost trace, a prompt-injection attack and an allowlist defence, compliance checks, a supervisor with workers, a cost model for routing |
| [4](#ch04) | Working effectively with agentic coding tools | A toy coding agent with tests as feedback, a hallucinated-API checker, a tiny mutation tester |

## Suggested plan

| Sessions | Read | Drill |
|---|---|---|
| 1 and 2 | Ch 1 | Write the loop from memory, then add stop conditions and retries without looking |
| 3 and 4 | Ch 2 | Implement BM25 and RRF on paper for three short documents, then do the failure-diagnosis drills |
| 5 and 6 | Ch 3 | Design an eval set for an agent you would like to build, and name its must-pass cases |
| 7 | Ch 4 | Do a timed practice: build a small feature with a coding tool, narrating out loud, then review every line |
| 8 | All | Answer the design-scenario drills out loud, without opening the answers |

## How to use the drills

Answer each drill out loud before opening it, and include the reason. Follow-ups in these interviews usually ask what breaks: "what happens when the tool times out after it charged the card?", or "your recall is high and the answers are still wrong, so where do you look?". Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## What is real and what is illustrative

Every block with an output below it was executed when the site was built, and the output is the real one. The agent mechanics, BM25, rank fusion, metrics and graders are real code doing the real computation.

Three things are stand-ins, and the code labels them where they appear:

- **The LLM.** `scripted_llm` is a deterministic function that returns canned tool calls. It shows how the loop behaves. It says nothing about how well any real model would do on the same task.
- **The embeddings.** The toy vector search uses a small hand-written word-vector table, so that "money back" lands near "refund". The arithmetic of similarity search is real, and the quality of a real embedding model is not being measured.
- **The cross-encoder and the LLM judge.** Both are small scoring functions that show where these components sit in a pipeline and how you would test them.

Framework code (LangGraph, CrewAI) and wire formats appear as plain blocks labelled **illustrative**. They cannot run here, and these APIs change often, so check current documentation before you rely on the details. This field moves fast, so the guide teaches mechanisms and gives no benchmark rankings of models or tools.
