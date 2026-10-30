---
title: The agent loop: tools, planning, context and memory
part: Part A · Building the agent
lede: An agent is an LLM call inside a loop, plus tools the model can ask for. This chapter builds that loop with a scripted fake LLM, then adds what real systems need: schemas and validation, ReAct, tree-of-thought and plan-and-execute patterns, stop conditions, context trimming, summarisation, memory, state for long branching conversations, and retries that do not charge a customer twice.
desc: LLM plus tool loop, function calling, ReAct, chain and tree of thought, plan-and-execute, stop conditions, context trimming, memory, conversation state, retries, idempotency
hours: 6
prereqs: Comfortable Python. No model or API needed.
---

## An agent is a loop {#ch01-loop .th}

A plain LLM call maps text to text. It cannot look anything up or change anything. To give it reach, you describe some tools in the request. The model can then answer with a structured request to call one. **Your code** runs the tool, appends the result to the conversation, and calls the model again. This repeats until the model answers in plain text or a guard stops the loop.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 230" role="img" aria-label="The agent loop: messages go to the model, the model returns either a tool call or a final answer, tool calls are run by your code and their results are appended to messages">
  <rect x="20" y="85" width="150" height="60" rx="6" class="d-soft"/><text x="95" y="111" text-anchor="middle" class="t-bold">messages</text><text x="95" y="130" text-anchor="middle" class="t-small">system, user, calls, results</text>
  <rect x="245" y="85" width="130" height="60" rx="6" class="d-acc"/><text x="310" y="111" text-anchor="middle" class="t-bold">LLM call</text><text x="310" y="130" text-anchor="middle" class="t-small">stateless function</text>
  <rect x="450" y="20" width="240" height="60" rx="6" class="d-box"/><text x="570" y="46" text-anchor="middle" class="t-bold">your code runs the tool</text><text x="570" y="65" text-anchor="middle" class="t-small">validate, execute, catch errors</text>
  <rect x="450" y="150" width="240" height="60" rx="6" class="d-key"/><text x="570" y="176" text-anchor="middle" class="t-bold">final answer: stop</text><text x="570" y="195" text-anchor="middle" class="t-small">or a guard stops the loop first</text>
  <path d="M170 115 L 245 115" class="d-line-acc"/><path d="M375 105 L 450 60" class="d-line-acc"/><path d="M375 125 L 450 170" class="d-line-key"/>
  <path d="M570 20 C 570 2, 95 2, 95 85" class="d-line d-dash"/>
  <text x="160" y="62" class="t-small">append call and result, call again</text>
  <text x="395" y="72" class="t-small">tool call</text><text x="400" y="164" class="t-small">text</text>
</svg></div><figcaption><b>The whole mechanism.</b> The model keeps no state between calls, so the message list is the only memory the loop has.</figcaption></figure>

The program below is the loop this chapter grows. `scripted_llm` is a **stand-in** for a real model: it inspects the messages and follows fixed rules. Because it reads the messages, it reacts to what the loop feeds it, so bugs in the loop show up just as they would with a real model.

```python run=ag-c01-loop
import json

ORDERS = {"1042": {"item": "headphones", "price": 2499, "days_since_delivery": 5}}

def get_order(order_id):
    return ORDERS.get(order_id, {"error": "no such order"})

def refund_quote(price, days):
    return {"refund": price if days <= 7 else 0}

TOOLS = {"get_order": get_order, "refund_quote": refund_quote}

def scripted_llm(messages):
    """STAND-IN for a real model: fixed rules over the message list."""
    seen = {m["name"]: json.loads(m["content"]) for m in messages if m["role"] == "tool"}
    if "get_order" not in seen:
        return {"tool": "get_order", "args": {"order_id": "1042"}}
    if "refund_quote" not in seen:
        order = seen["get_order"]
        return {"tool": "refund_quote", "args": {"price": order["price"], "days": order["days_since_delivery"]}}
    return {"text": f"Order 1042 can be refunded for {seen['refund_quote']['refund']}."}

def run_agent(question, max_steps=5):
    messages = [{"role": "system", "content": "You are a support agent."},
                {"role": "user", "content": question}]
    for step in range(1, max_steps + 1):
        reply = scripted_llm(messages)
        if "text" in reply:
            print(f"step {step}: final answer: {reply['text']}")
            return messages
        result = TOOLS[reply["tool"]](**reply["args"])
        print(f"step {step}: {reply['tool']}({reply['args']}) -> {result}")
        messages.append({"role": "assistant", "tool_call": reply})
        messages.append({"role": "tool", "name": reply["tool"], "content": json.dumps(result)})
    print("stopped: max_steps")
    return messages

messages = run_agent("Can I get a refund on order 1042?")
print("messages at the end:", [m["role"] for m in messages])
```

Three steps took three model calls, and the message list grew by two for each tool used. A real conversation grows the same way, which is why context management gets its own section.

:::key The two sentences interviewers want
The model never executes anything: it emits a request, and your code decides whether to run it. Each model call receives the whole message list again, because the model holds no state between calls.
:::

## Function calling and schemas {#ch01-schema .th}

You tell the model about a tool with a name, a description, and a JSON Schema for its arguments. The model returns a name and arguments, and your code runs the function and returns a result tied to that call. The exact wire format varies by provider, but the shape looks like this.

```json
// illustrative: field names differ between providers and versions
{"tools": [{"name": "get_order",
            "description": "Look up one order. Use when the user gives an order id.",
            "input_schema": {"type": "object",
                             "properties": {"order_id": {"type": "string"}},
                             "required": ["order_id"]}}]}

// the model's reply contains something like
{"tool_call": {"id": "call_1", "name": "get_order", "arguments": {"order_id": "1042"}}}

// your next request appends
{"role": "tool", "tool_call_id": "call_1", "content": "{\"item\": \"headphones\"}"}
```

The description is part of the prompt. Models pick tools by reading it, so a vague description produces wrong calls. Say when to use the tool and when to use another one, and give each argument a clear name.

Some providers can force the output to match a schema, which removes most malformed output. It cannot make the values correct: `order_id` can still be a well-formed ID the user never mentioned. So you validate at the boundary anyway, and when validation fails you return the error to the model as a tool result. The model can often fix its own call.

```python run=ag-c01-schema
import json

SCHEMA = {"required": ["order_id", "reason"],
          "properties": {"order_id": {"type": "string"},
                         "reason": {"type": "string", "enum": ["damaged", "late", "other"]}}}

def validate(args, schema):
    errors = []
    for name in schema["required"]:
        if name not in args:
            errors.append(f"missing required field '{name}'")
    for name, value in args.items():
        spec = schema["properties"].get(name)
        if spec is None:
            errors.append(f"unknown field '{name}'")
        elif spec["type"] == "string" and not isinstance(value, str):
            errors.append(f"'{name}' must be a string")
        elif "enum" in spec and value not in spec["enum"]:
            errors.append(f"'{name}' must be one of {spec['enum']}")
    return errors

def scripted_llm(messages):
    """STAND-IN: makes a mistake first, then corrects it from the error text."""
    last = messages[-1]["content"]
    if "unknown field 'orderId'" in last:
        return {"tool": "open_return", "args": {"order_id": "1042", "reason": "broken"}}
    if "must be one of" in last:
        return {"tool": "open_return", "args": {"order_id": "1042", "reason": "damaged"}}
    if last.startswith("return opened"):
        return {"text": "Your return is open."}
    return {"tool": "open_return", "args": {"orderId": 1042, "reason": "damaged"}}

messages = [{"role": "user", "content": "My order 1042 arrived broken."}]
for step in range(1, 6):
    reply = scripted_llm(messages)
    if "text" in reply:
        print(f"{step}: final: {reply['text']}")
        break
    errors = validate(reply["args"], SCHEMA)
    observation = "; ".join(errors) if errors else "return opened"
    print(f"{step}: {json.dumps(reply['args'])} -> {observation}")
    messages.append({"role": "tool", "content": observation})
```

The first call fails with two errors and the second with one, and each message tells the model what to fix. The third call passes. Raising a Python exception here would have ended the run, while a readable error string gives the model a chance to recover.

:::trap Too many tools
Every tool definition costs tokens on every call, and similar tools get confused with each other. With dozens of tools, group them, remove near-duplicates, or select a relevant subset per request (which is itself a small retrieval problem).
:::

## Chain of thought, ReAct and tree of thought {#ch01-patterns .th}

These names describe how reasoning text is arranged around tool calls. You can implement all of them with the same loop.

**Chain of thought (CoT)** means the model writes out intermediate steps before the answer. On multi-step problems this tends to help, because later tokens can build on earlier ones. Treat the text as a useful output and do not treat it as a faithful record of how the model decided. A model's stated reasoning can differ from what drove its answer.

**ReAct** alternates `Thought`, `Action` and `Observation`. It came before native function calling, when tool calls were parsed out of plain text. Native tool calls have replaced the parsing, and the pattern lives on: think briefly, act, read the result, repeat. Here is the text form, including the parse failure you have to handle.

```python run=ag-c01-react
import re

SCRIPT = [  # STAND-IN: canned model outputs, one per step
    "Thought: I need the order first.\nAction: get_order[1042]",
    "Thought: Check the policy for 5 days.\nI should look it up.",   # no Action line
    "Thought: Check the policy for 5 days.\nAction: policy[5]",
    "Thought: Within the window.\nFinal Answer: refundable",
]
TOOLS = {"get_order": lambda x: f"delivered 5 days ago, id {x}",
         "policy": lambda d: "refund allowed" if int(d) <= 7 else "refund denied"}
ACTION = re.compile(r"^Action: (\w+)\[(.*)\]$", re.M)
FINAL = re.compile(r"^Final Answer: (.*)$", re.M)

transcript = "Question: can order 1042 be refunded?"
for output in SCRIPT:
    transcript += "\n" + output
    print(output.replace("\n", " | "))
    if m := FINAL.search(output):
        print("=> answer:", m.group(1))
        break
    if m := ACTION.search(output):
        observation = TOOLS[m.group(1)](m.group(2))
    else:
        observation = "parse error: reply with an Action line or a Final Answer"
    print("   Observation:", observation)
    transcript += "\nObservation: " + observation
print("transcript characters:", len(transcript))
```

The parse error goes back as an observation, and the next output recovers. The transcript grows on every step, because it is what the next model call would receive. In this toy the canned outputs ignore it.

**Tree of thought** explores several candidate thoughts at each step, scores them, keeps the best and continues. It is a beam search where a model proposes and evaluates the steps. The classic demo is the Game of 24: combine four numbers with arithmetic to make 24. Below, ordinary functions stand in for the propose and evaluate calls, and `width=1` behaves like a single chain of thought. In a real system every proposal and every evaluation can be a paid model call, so `evaluated` is the cost figure to watch.

```python run=ag-c01-tot
from itertools import combinations

def propose(nums):
    """STAND-IN for 'model, suggest next steps': combine any two numbers."""
    out = []
    for i, j in combinations(range(len(nums)), 2):
        a, b = nums[i], nums[j]
        rest = [nums[k] for k in range(len(nums)) if k not in (i, j)]
        options = [(f"{a}+{b}", a + b), (f"{a}*{b}", a * b), (f"{a}-{b}", a - b), (f"{b}-{a}", b - a)]
        if b and a % b == 0:
            options.append((f"{a}/{b}", a // b))
        if a and b % a == 0:
            options.append((f"{b}/{a}", b // a))
        out += [(expr, sorted(rest + [v])) for expr, v in options]
    return out

def evaluate(nums):
    """STAND-IN for 'model, how promising is this?': closeness to 24. Higher is better."""
    return -min(abs(n - 24) for n in nums)

def search(start, width):
    frontier, evaluated = [(sorted(start), [])], 0
    while frontier:
        candidates = {}
        for nums, path in frontier:
            for expr, new in propose(nums):
                evaluated += 1
                if new == [24]:
                    return path + [expr], evaluated
                if len(new) > 1:
                    candidates.setdefault(tuple(new), path + [expr])   # drop duplicate states
        ranked = sorted(candidates.items(), key=lambda c: (-evaluate(c[0]), c[0]))
        frontier = [(list(nums), path) for nums, path in ranked[:width]]
    return None, evaluated

for start in ([1, 2, 3, 4], [2, 3, 4, 6], [2, 5, 8, 11], [4, 9, 10, 13]):
    for width in (1, 5, 50, 500):
        path, cost = search(start, width)
        print(f"{start} width={width:<3} evaluated={cost:<5} solution={path}")
```

`[1, 2, 3, 4]` is easy, and even a single chain solves it. `[2, 3, 4, 6]` needs a beam of 5, `[2, 5, 8, 11]` a beam of 50 and `[4, 9, 10, 13]` a beam of 500, and cost grows with the width each time. That last puzzle shows the real weakness: the good state `[4, 6]` is far from 24 by this score, so a narrow beam throws it away. The evaluator matters more than the width, and in a real system the evaluator is another model call that can be wrong.

Reach for this pattern when a wrong early step is costly and you can score partial answers. Most production agents use a single chain plus good tools, because the extra calls multiply cost and latency.

## Plan-and-execute {#ch01-plan .th}

ReAct decides one step at a time. **Plan-and-execute** asks a planner for the whole list of steps first, runs them with an executor, and calls the planner again only if something fails. Steps with known arguments need no model call. The trade-off is that the plan can go stale, since it was written before any tool ran.

```python run=ag-c01-plan
llm_calls = 0

def planner(goal, failure=None):
    """STAND-IN planner: returns a fixed plan, and a repaired one after a failure."""
    global llm_calls
    llm_calls += 1
    if failure is None:
        return [("get_status", "A17"), ("get_status", "B20"), ("get_status", "C33"), ("summarise", None)]
    return [("get_status_archive", failure), ("summarise", None)]

STATUS = {"A17": "shipped", "C33": "delivered"}
ARCHIVE = {"B20": "returned"}

def execute(plan, results):
    global llm_calls
    for index, (tool, arg) in enumerate(plan):
        if tool == "summarise":
            llm_calls += 1
            print("  summarise ->", dict(sorted(results.items())))
            return None
        table = STATUS if tool == "get_status" else ARCHIVE
        if arg not in table:
            print(f"  {tool}({arg}) -> not found")
            return index
        results[arg] = table[arg]
        print(f"  {tool}({arg}) -> {table[arg]}")
    return None

results = {}
plan = planner("status of three orders")
print("plan:", [f"{t}({a})" if a else t for t, a in plan])
failed = execute(plan, results)
if failed is not None:
    remaining = [step for step in plan[failed + 1:] if step[0] != "summarise"]
    plan = remaining + planner("status of three orders", failure=plan[failed][1])
    print("replanned:", [f"{t}({a})" if a else t for t, a in plan])
    execute(plan, results)
print("model calls:", llm_calls)
```

Four lookups and a summary cost three model calls: plan, replan, summarise. A ReAct agent would make one call per tool step plus one for the answer, which is five calls for these four lookups. ReAct adapts more naturally, since it sees each result before choosing the next step. Pick plan-and-execute when the task has a predictable shape and you want a reviewable plan, for example one a human approves before it runs. Pick ReAct when each step depends on what the last one found.

## Stop conditions {#ch01-stop .th}

The model saying "done" is one stop condition, and it is not enough. A confused model can loop forever, and each iteration costs money. Production loops check several guards on every step, and they report **why** they stopped, so that callers and dashboards can treat a clean finish differently from a budget cut-off.

```python run=ag-c01-stop
import json

def run(llm, max_steps=6, max_tokens=400, max_repeats=2):
    tokens, seen = 0, {}
    for step in range(1, max_steps + 1):
        reply, cost = llm(step)
        tokens += cost
        if tokens > max_tokens:
            return f"budget at step {step} ({tokens} tokens)"
        if "text" in reply:
            return f"final at step {step} ({tokens} tokens)"
        signature = json.dumps(reply, sort_keys=True)
        seen[signature] = seen.get(signature, 0) + 1
        if seen[signature] > max_repeats:
            return f"repeated call at step {step} ({tokens} tokens)"
    return f"max_steps ({tokens} tokens)"

# STAND-INS: each scripted model returns (reply, tokens used)
good = lambda s: ({"text": "done"}, 50) if s == 3 else ({"tool": "search", "q": s}, 50)
stuck = lambda s: ({"tool": "search", "q": "same"}, 50)
wandering = lambda s: ({"tool": "search", "q": s}, 50)
huge = lambda s: ({"tool": "read_file", "page": s}, 180)

for name, llm in [("good", good), ("stuck", stuck), ("wandering", wandering), ("huge", huge)]:
    print(f"{name:10} {run(llm)}")
```

Each scripted model trips a different guard. The repeat detector caught `stuck` earlier than `max_steps` would have, and `huge` ran out of budget in only three steps. When a guard fires, hand back a partial answer and a reason, or escalate to a person. Do not return an empty string or a confident-looking guess.

## Context-window management {#ch01-context .th}

The context window is the most text the model accepts in one request. Long runs fill it, and cost and latency usually rise with size well before the limit. Token counts below use a crude rule of thumb (four characters per token). Real systems use the model's tokenizer or the provider's count.

You have three levers, usually combined:

- **Trim** old messages.
- **Summarise** old messages into fewer tokens.
- **Keep tool output small to begin with**: return the 5 relevant rows instead of the 5000-row table, and let the model ask for more.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 170" role="img" aria-label="Three ways to fit a long conversation into a token budget">
  <text x="10" y="18" class="t-small">full history (over budget)</text>
  <rect x="10" y="24" width="50" height="22" class="d-key"/><text x="35" y="39" text-anchor="middle" class="t-small">sys</text><rect x="60" y="24" width="60" height="22" class="d-acc"/><text x="90" y="39" text-anchor="middle" class="t-small">goal</text><rect x="120" y="24" width="120" height="22" class="d-soft"/><text x="180" y="39" text-anchor="middle" class="t-small">call+result</text><rect x="240" y="24" width="120" height="22" class="d-soft"/><text x="300" y="39" text-anchor="middle" class="t-small">call+result</text><rect x="360" y="24" width="120" height="22" class="d-soft"/><text x="420" y="39" text-anchor="middle" class="t-small">call+result</text><rect x="480" y="24" width="120" height="22" class="d-soft"/><text x="540" y="39" text-anchor="middle" class="t-small">call+result</text>
  <text x="10" y="70" class="t-small">last N messages: loses the goal, and can split a call from its result</text>
  <rect x="420" y="76" width="60" height="22" class="d-trap"/><text x="450" y="91" text-anchor="middle" class="t-small">result</text><rect x="480" y="76" width="120" height="22" class="d-soft"/><text x="540" y="91" text-anchor="middle" class="t-small">call+result</text>
  <text x="10" y="122" class="t-small">pin and summarise: keep system and goal, compress the middle, keep recent pairs whole</text>
  <rect x="10" y="128" width="50" height="22" class="d-key"/><text x="35" y="143" text-anchor="middle" class="t-small">sys</text><rect x="60" y="128" width="60" height="22" class="d-acc"/><text x="90" y="143" text-anchor="middle" class="t-small">goal</text><rect x="120" y="128" width="90" height="22" class="d-rs"/><text x="165" y="143" text-anchor="middle" class="t-small">summary</text><rect x="210" y="128" width="120" height="22" class="d-soft"/><text x="270" y="143" text-anchor="middle" class="t-small">call+result</text>
</svg></div><figcaption><b>What each strategy keeps.</b> The red block is an orphan: a tool result whose call was trimmed away. Many APIs reject that request outright.</figcaption></figure>

```python run=ag-c01-trim
def tokens(m):  # crude: 4 characters per token plus overhead
    return len(m["content"]) // 4 + 4

def user(t): return {"role": "user", "content": t}
def call(i): return {"role": "assistant", "content": f"call get_page({i})", "call_id": i}
def result(i, t): return {"role": "tool", "content": t, "call_id": i}

history = [{"role": "system", "content": "You are a support agent. Never promise refunds over 5000."},
           user("Goal: find why order 1042 was charged twice and open a ticket.")]
facts = ["Payment ref P-7781 charged at checkout.", "Second charge P-7790 from a retry.",
         "Gateway log shows a timeout on the first attempt.", "Customer is on the premium plan."]
for i, fact in enumerate(facts):
    history += [call(i), result(i, fact + " " + "log line " * 40)]

def summarise(messages):
    """STAND-IN for a summariser model: keeps the first sentence of each tool result."""
    kept = [m["content"].split(". ")[0] for m in messages if m["role"] == "tool"]
    return {"role": "user", "content": "Summary of earlier steps: " + " | ".join(kept)}

def last_n(msgs, n):
    return msgs[-n:]

def pinned_groups(msgs, budget):
    head, rest = msgs[:2], msgs[2:]
    groups = [rest[i:i + 2] for i in range(0, len(rest), 2)]
    kept, used = [], sum(map(tokens, head))
    for g in reversed(groups):
        cost = sum(map(tokens, g))
        if used + cost > budget:
            break
        kept, used = g + kept, used + cost
    return head + kept

def pinned_summary(msgs, budget, keep_groups=1):
    head, rest = msgs[:2], msgs[2:]
    cut = len(rest) - keep_groups * 2
    return head + [summarise(rest[:cut])] + rest[cut:]

def report(name, msgs):
    calls = {m["call_id"] for m in msgs if m["role"] == "assistant"}
    orphans = sum(1 for m in msgs if m["role"] == "tool" and m["call_id"] not in calls)
    text = " ".join(m["content"] for m in msgs)
    print(f"{name:15} msgs={len(msgs):<3} tokens={sum(map(tokens, msgs)):<4} orphans={orphans} "
          f"goal={'Goal:' in text!s:5} rule={'5000' in text!s:5} P-7781={'P-7781' in text}")

BUDGET = 250
report("full", history)
report("last 3", last_n(history, 3))
report("pinned groups", pinned_groups(history, BUDGET))
report("pinned summary", pinned_summary(history, BUDGET))
```

`last 3` is the naive option. It leaves an orphaned result, and it has lost the goal and the system rule, so the agent would no longer know what it is doing or what it must not promise. `pinned groups` fixes those problems within the budget of 250, but with only one group kept, the payment reference `P-7781` is gone. `pinned summary` keeps every fact we check in 188 tokens, because the toy summariser happens to preserve the first sentence of each result.

:::trap Summaries lose exact values
A summariser may turn `P-7781` into "the first payment", and then the agent cannot pass the ID to a tool. Pin identifiers, amounts and dates in a state object (next section), or tell the summariser to copy them verbatim, and test that it does. Also keep the system prompt and the user's goal out of whatever gets trimmed.
:::

Keep the stable part of the prompt at the front. Many providers cache a repeated prefix at a lower price, so editing early messages on every turn can cost you that discount. Check your provider's rules for the details.

## Memory: short-term, long-term and state {#ch01-memory .th}

"Memory" means three different things, and interviewers notice if you blur them.

| Kind | Lives in | Example | Risk |
|---|---|---|---|
| Short-term | Message list for this run | The last few tool results | Overflows the window |
| Working state | A structured object you control | `{"verified": true, "amount": 8200}` | Drifts out of sync if the model alone updates it |
| Long-term | Database, across sessions | "Prefers calls after 6 pm" | Stale facts, and leaks between users |

Long-term memory is a read path and a write path. The read path is retrieval, as in Chapter 2. The write path is the harder design question: what is worth keeping, who decides, and what happens when a new fact contradicts an old one? The toy below stores facts by user and key, so the newest value replaces an older one, and retrieval scores by word overlap.

```python run=ag-c01-memory
class Memory:
    def __init__(self):
        self.rows, self.clock = {}, 0

    def write(self, user, key, value):
        self.clock += 1
        self.rows[(user, key)] = (value, self.clock)   # same key: newest wins

    def search(self, user, query, k=2):
        words = set(query.lower().split())
        hits = []
        for (owner, key), (value, t) in self.rows.items():
            if owner != user:          # scope check: never cross users
                continue
            overlap = len(words & set(f"{key} {value}".lower().replace("_", " ").split()))
            if overlap:
                hits.append((overlap, t, key, value))
        hits.sort(key=lambda h: (-h[0], -h[1], h[2]))
        return [(key, value) for _, _, key, value in hits[:k]]

mem = Memory()
mem.write("u1", "call_time", "prefers morning calls")
mem.write("u1", "language", "prefers Hindi")
mem.write("u2", "call_time", "prefers evening calls")
print("before:", mem.search("u1", "when does the customer prefer calls"))
mem.write("u1", "call_time", "prefers calls after 6 pm")     # contradicts the old fact
print("after: ", mem.search("u1", "when does the customer prefer calls"))
print("u2:    ", mem.search("u2", "prefer calls"))
```

Real stores add embeddings, timestamps and expiry, but the same two checks stay: the scope filter, and a rule for conflicts. Treat stored memory as untrusted input too. Text an attacker got into memory in one session can steer a later session.

### State across long branching conversations {#ch01-state}

Consider a debt-collection voice agent. Over twenty minutes, the person might verify their identity, dispute the amount, go back, then offer a partial payment. Relying on the transcript alone fails in two ways. Trimming can drop the fact that identity was verified, and a model re-reading a long transcript can lose track of which branch is current.

The usual fix has three parts:

- A **state object** that your code owns and sends with every model call.
- **Allowed transitions**, so that code rejects illegal moves such as recording a payment before verification.
- **Checkpoints**, one per step, which give you rollback and branching without copying everything by hand.

```python run=ag-c01-branch
ALLOWED = {"start": {"verified"}, "verified": {"disputed", "promised"},
           "disputed": {"dispute_logged"}, "dispute_logged": {"promised"}, "promised": set()}

class Conversation:
    def __init__(self):
        self.nodes = {"n0": {"parent": None, "stage": "start", "state": {"verified": False}, "said": "call opened"}}

    def step(self, parent, stage, said, **updates):
        node = self.nodes[parent]
        if stage not in ALLOWED[node["stage"]]:
            return f"rejected: {node['stage']} -> {stage}"
        name = f"n{len(self.nodes)}"
        self.nodes[name] = {"parent": parent, "stage": stage, "said": said,
                            "state": {**node["state"], **updates}}
        return name

    def path(self, name):
        out = []
        while name:
            out.append(self.nodes[name]["said"])
            name = self.nodes[name]["parent"]
        return out[::-1]

c = Conversation()
print(c.step("n0", "promised", "I will pay 2000 on the 5th"))           # too early
n1 = c.step("n0", "verified", "date of birth matches", verified=True)
n2 = c.step(n1, "disputed", "I only owe 6000, not 8200", claimed=6000)
n3 = c.step(n2, "dispute_logged", "dispute ticket opened", ticket="D-1")
n4 = c.step(n1, "promised", "I will pay 2000 on the 5th", promise=2000)  # new branch from n1
for leaf in (n3, n4):
    print(leaf, c.nodes[leaf]["stage"], dict(sorted(c.nodes[leaf]["state"].items())))
    print("   context:", c.path(leaf))
```

The two branches hold different state and different context, and neither sees the other's turns. A call that returns to "actually, let me just pay" can resume from `n1` or continue on from the current node, and that choice is a product decision. The model can still suggest updates to the state, and your code decides whether to apply them. Framework checkpointers (next section) provide the same idea with storage attached.

## Retries and error handling {#ch01-retry .th}

Different failures need different responses, and treating them alike is a common bug.

| Failure | Example | Response |
|---|---|---|
| Transient | Rate limit, 5xx, network timeout | Retry with exponential backoff and jitter, up to a limit |
| Model's fault | Bad arguments, unknown tool | Return the error as a tool result so the model can correct itself |
| Permanent | Permission denied, not found | Tell the model, do not retry the same call |
| Ambiguous | Timeout on a write | Retry only if the operation is idempotent |

The last row is where real money goes missing. A timeout tells you the response was lost, and the write may still have happened. An **idempotency key** lets the server recognise a repeat of the same request and return the first result. Generate the key once per logical operation, before the first attempt.

```python run=ag-c01-retry
import random

def backoff_delays(attempts, base=0.5, cap=8.0, seed=7):
    rng = random.Random(seed)
    return [round(rng.uniform(0, min(cap, base * 2 ** i)), 2) for i in range(attempts)]   # full jitter

print("delays (s):", backoff_delays(6))

class Timeout(Exception):
    pass

class Gateway:
    """The first request is applied, but its response is lost on the way back."""
    def __init__(self):
        self.charges, self.calls, self.seen = [], 0, {}

    def charge(self, amount, key=None):
        self.calls += 1
        if key in self.seen and key is not None:
            return self.seen[key]
        self.charges.append(amount)
        receipt = f"R{len(self.charges)}"
        if key is not None:
            self.seen[key] = receipt
        if self.calls == 1:
            raise Timeout()
        return receipt

def with_retries(fn, attempts=3):
    for i in range(attempts):
        try:
            return fn()
        except Timeout:
            print(f"  attempt {i + 1}: timeout, retrying")
    return "gave up"

for label, key in [("no key", None), ("idempotency key", "op-1042-a")]:
    gw = Gateway()
    print(label)
    print("  receipt:", with_retries(lambda: gw.charge(2499, key=key)), "charges:", gw.charges)
```

The delay can never exceed the cap, and the random jitter stops many clients retrying in step after an outage. Without a key, the customer pays twice. With one, the second request returns the original receipt. The key must be stored by the server: a client cannot fix this alone, because it cannot tell whether the lost request was applied.

## Mapping to frameworks {#ch01-frameworks .th}

Frameworks wrap these primitives and add storage, streaming and tracing. If you can name the primitive, you can learn any of their APIs quickly and explain what they do when something goes wrong.

| Primitive in this chapter | LangGraph | CrewAI |
|---|---|---|
| `run_agent` loop | A graph with a model node, a tool node and a conditional edge | `Crew.kickoff()` runs tasks through agents |
| `messages` and state object | State schema passed between nodes | Task context and agent memory options |
| Branch on tool call or final | `add_conditional_edges` | Handled inside the agent executor |
| Checkpoints and forks | Checkpointer plus a thread id | Less central to the model |
| `max_steps` guard | Recursion limit | Per-agent iteration limit |

```python
# illustrative only: LangGraph's API changes, so check current docs. Not run here.
from langgraph.graph import StateGraph, START, END

def call_model(state): ...          # the LLM call: returns new messages
def run_tools(state): ...           # your tool dispatch, as in run_agent
def route(state):                   # the "tool call or final?" check
    return "tools" if state["messages"][-1].tool_calls else END

graph = StateGraph(MyState)         # MyState holds messages plus your fields
graph.add_node("model", call_model)
graph.add_node("tools", run_tools)
graph.add_edge(START, "model")
graph.add_conditional_edges("model", route)
graph.add_edge("tools", "model")
app = graph.compile()
```

Should you use one? For a short loop, plain code is easier to read and debug. Frameworks earn their place when you need durable checkpoints, pause and resume for human approval, or complex branching.

## Drills {#ch01-drills .dr}

:::drill concept
Who executes a tool call: the model or your code? Why does the answer matter?
---
**Answer.** Your code. The model only emits a structured request.

**Why it matters.** Your code is therefore where validation, permissions, rate limits and audit logging go. A model "deciding" to delete a record has no effect until your dispatcher runs it, and that is the point where you can refuse. Chapter 3's defences rely on this.
:::

:::drill concept
What separates an agent from a fixed chain of LLM calls?
---
**Answer.** In a chain, your code fixes the order of steps. In an agent, the model's output decides the next step, so the number and order of steps vary per input.

**Follow-up.** Prefer a chain or plain code when the steps are known. It is cheaper, faster and easier to test. Use an agent when the path truly depends on what is found along the way.
:::

:::drill bug
This loop keeps calling the same tool until the guard stops it. Find the bug.

```python run=ag-c01-d-noappend
def scripted_llm(messages):  # STAND-IN
    if any(m["role"] == "tool" for m in messages):
        return {"text": "It is 31 C."}
    return {"tool": "weather", "args": {"city": "Pune"}}

TOOLS = {"weather": lambda city: "31 C"}
messages = [{"role": "user", "content": "Weather in Pune?"}]
for step in range(3):
    reply = scripted_llm(messages)
    if "text" in reply:
        print(reply["text"])
        break
    result = TOOLS[reply["tool"]](**reply["args"])
    print("called", reply["tool"], "->", result)
else:
    print("hit max steps")
```
---
**Answer.** The result is never appended to `messages`. Add `messages.append({"role": "tool", "content": result})` after the call. The model is stateless, so from its side the tool never ran. A real model behaves the same way, repeating the call or inventing an answer.
:::

:::drill bug
A validator accepts `{"quantity": true}` for an integer field. Why?

```python run=ag-c01-d-bool
def is_integer_field(value):
    return isinstance(value, int)

for value in (3, "3", 3.0, True):
    print(repr(value), is_integer_field(value))
```
---
**Answer.** In Python, `bool` is a subclass of `int`, so `isinstance(True, int)` is `True`. Use `isinstance(value, int) and not isinstance(value, bool)`. JSON has distinct booleans and numbers, so a hand-written validator must keep them apart. Using a tested schema library avoids this class of bug.
:::

:::drill tricky
Your agent's chain-of-thought text says "I chose this tool because the user is a premium customer". Can you log that as the reason for an audit?
---
**Answer.** Not as proof. Stated reasoning is generated text and need not match what actually drove the choice.

**What to log instead.** The inputs, the tools called with their arguments, the results, and the rule or check that allowed each action. The reasoning text is useful for debugging, and an auditor should rely on the recorded facts and deterministic checks.
:::

:::drill tricky
When would you pick plan-and-execute over ReAct? Give one reason against it.
---
**Answer.** Pick it when the steps are predictable, when you want a plan a person can review before anything runs, or when you want to save model calls by running known steps without one.

**Against.** The plan was written before any tool ran, so it can go stale when results differ from what was expected. You need a replanning trigger, and if failures are common you end up paying for many replans. A ReAct agent would have adapted at each step.
:::

:::drill output
You trim a history to the last 3 messages. How many tool results are left without their call?

```python run=ag-c01-d-orphan
history = ["system", "user", "call:1", "result:1", "call:2", "result:2"]

def orphans(msgs):
    calls = {m.split(":")[1] for m in msgs if m.startswith("call")}
    return [m for m in msgs if m.startswith("result") and m.split(":")[1] not in calls]

for n in (2, 3, 4, 5):
    kept = history[-n:]
    print(n, kept, "orphans:", orphans(kept))
```
---
**Answer.** One, for `n=3`: the slice starts on `result:1`, whose call was cut. The other sizes happen to cut between pairs. Trim by groups (a call with all its results), so that the outcome does not depend on where the cut lands. Note that `n=4` has no orphans and still loses the system prompt and the user's goal.
:::

:::drill concept
Should a failed tool call raise an exception out of the loop, or go back to the model? Give the rule.
---
**Answer.** Errors the model could act on go back as a tool result: bad arguments, not found, permission denied. Errors it cannot help with are handled in your code: repeated gateway failures, an exhausted budget, a bug in the tool.

**Detail.** Keep the message short and actionable ("`date` must be YYYY-MM-DD"). Never pass stack traces back: they waste tokens and can leak internals. Cap the correction attempts, or the model may keep trying forever.
:::

:::drill tricky
A payment tool times out. The model asks to call it again. What do you do?
---
**Answer.** Do not retry blindly, since the timeout does not tell you whether the charge went through. Retry with the same idempotency key if the server supports one. Otherwise query the status of the operation first, and escalate to a person if you cannot determine it.

**Also.** The key should be generated by your dispatcher once per logical operation. If the model generates it, it may produce a new key on the retry, and that defeats the purpose.
:::

:::drill concept
What should go into a summary when compacting a long agent run, and what can go wrong?
---
**Answer.** Keep the current goal and constraints, decisions made and why, exact identifiers and numbers, what has been tried and failed, and open questions.

**What goes wrong.** Details get paraphrased, so an ID can no longer be used. Errors in a summary persist and get repeated in later summaries, since the original is gone from the context. Keep the full transcript in storage so you can recover, and test the summariser with checks such as "this ID is still present".
:::

:::drill concept
**Design.** You are building a debt-collection voice agent where calls last 20 minutes and can change direction. How do you track state, and what do you send to the model on each turn?
---
**Answer outline.**

- **State object** owned by code: identity verified, amounts, disputes, promises, next allowed actions. Tools update it, and transitions are validated, so "record payment" fails before verification.
- **Each turn's prompt:** fixed instructions, the current state, a stage-specific instruction, a short summary of older turns, and the last few turns verbatim.
- **Latency:** voice needs quick replies, so keep the prompt small and move slow work (summarising, logging) outside the response path.
- **Branching:** checkpoint each turn so that a correction such as "actually, I said 6000" can roll back cleanly.
- **Testing:** replay stored transcripts through the state machine, and test the illegal-transition paths explicitly.
:::

:::drill concept
**Design.** A user pastes a 300-page PDF into your agent, and tool calls keep returning huge outputs. What changes do you make?
---
**Answer outline.** Stop putting large content into messages. Store it, and return a handle plus a short preview. Give the model tools to search and to read a range. Cap tool output, and say in the result that it was truncated and how to get the rest, since silently cut output makes the model conclude something is absent. Offload noisy sub-tasks to a sub-agent that returns only a short result. Track tokens per tool in your traces to find which one is the problem.
:::

:::drill tricky
The model requests three tool calls in one turn. What must your loop handle?
---
**Answer.** Run them (in parallel if they are safe to overlap), then return **every** result, each matched to its call ID, including failures. A missing result usually makes the next request invalid.

**Follow-up.** Parallel reads are generally safe. Parallel writes can conflict or depend on each other's order, so you may want to run those one at a time, even if the model asks for them together.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1300
Write `trim_to_budget(messages, budget)`. Always keep the first two messages (system and goal). Then keep the newest groups that fit. A group is an assistant message plus the tool results that follow it, and a call with several results must stay whole.
---
Walk from the end, collecting tool messages until you reach their assistant message, then accept or stop on the whole group. Stopping at the first group that does not fit keeps the kept part contiguous, and a gap in the middle of a history confuses the model.

```python run=ag-c01-c-trim
def tokens(m):
    return len(m["content"]) // 4 + 4

def trim_to_budget(messages, budget):
    head, rest = messages[:2], messages[2:]
    used = sum(map(tokens, head))
    kept, i = [], len(rest)
    while i > 0:
        j = i - 1
        while j > 0 and rest[j]["role"] == "tool":
            j -= 1
        group = rest[j:i]
        cost = sum(map(tokens, group))
        if used + cost > budget:
            break
        kept, used, i = group + kept, used + cost, j
    return head + kept, used

def msg(role, n):
    return {"role": role, "content": "x" * (n * 4 - 16), "tag": f"{role}{n}"}

history = [msg("system", 10), msg("user", 11), msg("assistant", 12), msg("tool", 20),
           msg("assistant", 13), msg("tool", 21), msg("tool", 22), msg("assistant", 14), msg("tool", 23)]
for budget in (30, 60, 120, 200):
    out, used = trim_to_budget(history, budget)
    print(budget, used, [m["tag"] for m in out])
```

Each `msg` costs exactly `n` tokens by this counter, so you can check the results by hand. The pinned head costs 21. At budget 60, only the newest group fits (21 + 37 = 58). At 120, the three-message group fits as well (58 + 56 = 114). At 200, everything fits (146). A `head` that is itself over budget is still kept here. In real code, decide whether to raise an error instead.
:::

:::drill code rating=1400
Add a dispatcher to the loop that handles unknown tools, bad arguments and tool exceptions, so that nothing escapes the loop, and counts consecutive failures. Stop after 3 failures in a row.
---
Catch exceptions at the boundary and turn them into text. Reset the counter on success: the guard is for an agent that is stuck, and an occasional failure is normal.

```python run=ag-c01-c-dispatch
def dispatch(tools, call):
    fn = tools.get(call["tool"])
    if fn is None:
        return False, f"unknown tool '{call['tool']}', available: {sorted(tools)}"
    try:
        return True, fn(**call["args"])
    except TypeError as e:
        return False, f"bad arguments: {e}"
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"

def run(llm_script, tools, max_failures=3):
    messages, failures = [], 0
    for reply in llm_script:          # STAND-IN: a canned list of model replies
        if "text" in reply:
            return f"final: {reply['text']}"
        ok, result = dispatch(tools, reply)
        failures = 0 if ok else failures + 1
        print(f"  {reply['tool']}: {'ok' if ok else 'fail'} -> {result}")
        messages.append({"role": "tool", "content": str(result)})
        if failures >= max_failures:
            return f"stopped: {failures} failures in a row"
    return "stopped: script ended"

def divide(a, b):
    return a / b

tools = {"divide": divide}
print(run([{"tool": "multiply", "args": {"a": 1}},
           {"tool": "divide", "args": {"a": 6, "b": 3}},
           {"text": "2"}], tools))
print(run([{"tool": "divide", "args": {"a": 1, "b": 0}},
           {"tool": "divide", "args": {"x": 1}},
           {"tool": "nope", "args": {}}], tools))
```

Real code should log the full exception separately and send the model only what it can use.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- Loop: call model, if tool call then validate, run, append call and result, repeat. If text, stop. Guards can stop it earlier.
- The model is stateless and never executes anything. The message list is its memory, and your dispatcher is the control point.
- Schema: name, description, JSON Schema. Descriptions are prompt text. Validate anyway and return errors as tool results.
- CoT: write steps before answering, and do not treat the text as an audit record. ReAct: thought, action, observation. ToT: beam search over thoughts, costly. Plan-and-execute: plan first, replan on failure.
- Stop on: final answer, max steps, token or cost budget, repeated calls, consecutive failures. Always report the reason.
- Context: pin system and goal, trim whole call and result groups, summarise the middle, keep tool output small, keep the prefix stable.
- Memory: short-term messages, working state owned by code, long-term store with scoping and conflict rules.
- Long conversations: state object, allowed transitions, checkpoints per turn.
- Errors: transient gets backoff with jitter, model errors go back to the model, permanent stops, ambiguous writes need idempotency keys.
- Frameworks wrap these primitives, and add storage, streaming and tracing.
