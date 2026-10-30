---
title: Designing RL environments
part: Part C · Building the training setup
lede: In applied RL, most of the work and most of the failures are in the environment. An agent optimises exactly what you wrote, including your bugs. This chapter covers state and action design, reward shaping and hacking, termination, simulator fidelity, verifiers for LLM-agent environments, RL post-training at a high level, evaluating agents, reproducibility and sample efficiency.
desc: state and action design, reward shaping, reward hacking, termination vs truncation, simulator fidelity, LLM verifiers, post-training, evaluation, reproducibility, sample efficiency
hours: 6
prereqs: Chapter 1 (MDPs, Q-learning, REINFORCE), Chapter 2 helps for evaluation
---

## What an environment promises {#ch03-contract .th}

An environment is a program with a small interface. `reset` returns a first observation, and `step` takes an action and returns an observation, a reward and two flags. This shape is common across RL libraries.

```python
# Illustrative: the usual interface, and a loop that uses it.
class Env:
    def reset(self, seed=None): ...        # returns obs
    def step(self, action): ...            # returns obs, reward, terminated, truncated

obs = env.reset(seed=7)
while True:
    obs, reward, terminated, truncated = env.step(policy(obs))
    if terminated or truncated:
        break
```

Every choice here changes the problem being solved: what's in `obs`, what `action` can be, how `reward` is computed, and when the flags go up. Before tuning an algorithm, ask whether a person given the same observations and actions could solve the task.

## State and action design {#ch03-state .th}

A good observation has what's needed to act and little else.

- **Make it Markov enough.** Include what the decision depends on. If velocity matters and you give only position, stack recent observations or use a recurrent policy.
- **Don't leak.** If the observation includes something unavailable at deployment, such as the grader's answer or a simulator's internal flag, the policy will learn to use it and then fail in the real setting.
- **Normalise.** Keep features on similar scales, and encode angles as `sin` and `cos` so that values near the wraparound stay close.
- **Keep it small.** Each irrelevant feature adds states to generalise over.

This example hides one bit. In a corridor, the start cell shows a hint saying which way to turn at the far end, and a correct turn earns +1. With position as the observation, the hint is gone by the time it matters. The program uses Q-learning over 20 seeds.

```python run=rl-c03-alias
import numpy as np

LENGTH = 3

def train(with_memory, seed, episodes=2000, alpha=0.1, eps=0.1):
    rng = np.random.default_rng(seed)
    Q = {}
    def obs(pos, hint):
        return (pos, hint) if with_memory or pos == 0 else (pos, None)
    def q(o):
        return Q.setdefault(o, [0.0, 0.0])
    for _ in range(episodes):
        hint = int(rng.random() * 2)
        for pos in range(LENGTH + 1):
            o = obs(pos, hint)
            a = int(rng.random() * 2) if rng.random() < eps else int(np.argmax(q(o)))
            if pos == LENGTH:
                q(o)[a] += alpha * ((1.0 if a == hint else -1.0) - q(o)[a])
            else:
                q(o)[a] += alpha * (0.99 * max(q(obs(pos + 1, hint))) - q(o)[a])
    return np.mean([int(np.argmax(q(obs(LENGTH, h)))) == h for h in (0, 1)])

for name, memory in (("position only", False), ("position + remembered hint", True)):
    print(f"{name:28} mean greedy success: {np.mean([train(memory, s) for s in range(20)]):.2f}")
```

Position alone gives 0.50, the same as guessing, and no amount of training can change that, since the two situations look identical. Adding the remembered hint gives 1.00. When a learning curve stalls at a suspicious value, check for this first.

**Action design** has similar trade-offs.

- **Level of abstraction.** High-level actions ("go to the door") shorten the horizon and limit what can be learned. Low-level ones are flexible and take longer. An LLM-agent environment makes the same choice: a few well-designed tools, or raw shell access.
- **Size.** Q-learning takes a max over actions, so large action sets hurt. Factor actions, or use a policy method.
- **Invalid actions.** **Masking** them sets their probability to zero, and it is usually better than a penalty, which wastes samples teaching a rule you already know. If you do mask, apply the same mask when computing `log π` and at evaluation.
- **Timing.** Repeating an action for a few steps (frame skip) shortens the effective horizon. Decision rates matter, too: a policy trained at one control frequency can fail at another.

## Reward shaping and its failure modes {#ch03-shaping .th}

Often the true objective is sparse: +1 on success after hundreds of steps. Random exploration rarely finds it, so we add intermediate reward. This is **reward shaping**. Its risk is that it changes which policy is optimal.

**Potential-based shaping** is the safe form. Pick any function of the state, `Φ(s)`, and add:

```text
F(s, s') = γ Φ(s') - Φ(s)
```

Over a trajectory, these terms telescope, and the total depends only on the start and end states, so going around a loop earns nothing. A known result says this form preserves the optimal policy, and that without further knowledge of the MDP it is the only form with that guarantee. The program computes exact optimal policies on a 6-cell chain, where the goal gives +10. The naive shaping gives a bonus for every step to the right, with no matching penalty for going left.

```python run=rl-c03-shaping
GAMMA, N = 0.9, 6
GOAL = N - 1

def solve(shaping):
    V = [0.0] * N
    def q(s, a):
        t = max(s - 1, 0) if a == "L" else s + 1
        r = (10.0 if t == GOAL else 0.0) + shaping(s, t)
        return r + GAMMA * V[t]
    for _ in range(500):
        for s in range(N - 1):
            V[s] = max(q(s, "L"), q(s, "R"))
    return [max("LR", key=lambda a: q(s, a)) for s in range(N - 1)]

def true_return(policy, steps=100):
    s, total = 0, 0
    path = 0
    for _ in range(steps):
        s = max(s - 1, 0) if policy[s] == "L" else s + 1
        path += 1
        if s == GOAL:
            return 10.0, path
    return 0.0, path

phi = lambda s: 0.0 if s == GOAL else s * 2.0     # the potential of a terminal state is 0
CASES = {"no shaping": lambda s, t: 0.0,
         "+1 for moving right": lambda s, t: 1.0 if t > s else 0.0,
         "+3 for moving right": lambda s, t: 3.0 if t > s else 0.0,
         "potential based": lambda s, t: GAMMA * phi(t) - phi(s)}
for name, f in CASES.items():
    pol = solve(f)
    print(f"{name:22} policy {''.join(pol)}  true reward {true_return(pol)[0]:.0f} in {true_return(pol)[1]} steps")
```

A small bonus of +1 left the policy unchanged here, because the goal is worth more. At +3 the policy is `RRRRL`: in the cell next to the goal it steps back, so that it can step forward again and collect the bonus. It never finishes, and it earns 0 true reward. Whether naive shaping breaks depends on its size relative to the task reward, so a setting that works today can fail when someone changes a weight. The potential-based version keeps the policy optimal, and this holds at any scale. Its `Φ` is set to 0 at the terminal state: in episodic tasks the guarantee needs this, because otherwise the shaping changes how attractive it is to end the episode.

Shaping earns its place by speeding up learning. Here is Q-learning on a 12-cell chain, with a reward only at the far end and a 100-step limit, compared over 20 seeds with potential-based shaping.

```python run=rl-c03-shaping-speed
import numpy as np

N, LIMIT, GAMMA = 12, 100, 0.99

def train(phi_scale, seed, episodes=100, alpha=0.2, eps=0.1):
    rng = np.random.default_rng(seed)
    Q = [[0.0, 0.0] for _ in range(N)]
    steps, first, successes = 0, None, []
    for ep in range(episodes):
        s, done = 0, False
        for _ in range(LIMIT):
            if rng.random() < eps or Q[s][0] == Q[s][1]:
                a = int(rng.random() * 2)
            else:
                a = int(Q[s][1] > Q[s][0])
            t = s + 1 if a else max(s - 1, 0)
            done = t == N - 1
            phi_t = 0.0 if done else t / (N - 1)          # the potential of a terminal state is 0
            r = (1.0 if done else 0.0) + phi_scale * (GAMMA * phi_t - s / (N - 1))
            Q[s][a] += alpha * (r + (0.0 if done else GAMMA * max(Q[t])) - Q[s][a])
            s = t
            steps += 1
            if done:
                if first is None:
                    first = steps
                break
        successes.append(done)
    return first, steps, np.mean(successes[-20:])

print("variant            steps to first success   total steps in 100 episodes   success, last 20 episodes")
for name, scale in (("sparse only", 0.0), ("potential shaping", 1.0)):
    runs = np.array([train(scale, s) for s in range(20)], dtype=float)
    print(f"{name:18} {runs[:, 0].mean():22.0f}   {runs[:, 1].mean():27.0f}   {runs[:, 2].mean():25.2f}")
```

On this problem the shaped agent first reaches the goal after 22 steps on average, against 168 for the sparse one, and uses 1228 total steps in 100 episodes against 1710. Both end with a success rate of 1.00 in the last 20 episodes, so here shaping sped up learning and didn't change the final result.

:::trap
A shaped reward is a hypothesis about how to solve the task. A distance-to-goal bonus fails when the route must first move away from the goal, and the agent can get stuck in a local optimum, even though the potential form keeps the optimal policy the same. Always measure the unshaped objective separately.
:::

## Reward hacking {#ch03-hacking .th}

**Reward hacking**, or **specification gaming**, is when an agent gets high reward without doing what you wanted. It's a correct optimisation of a wrong objective, and it should be expected: the reward is a proxy for what you care about, and strong optimisers find the gap between them (Goodhart's law). Common patterns are below, using made-up examples.

| Pattern | Example |
|---|---|
| Looping for repeated reward | A cleaning robot rewarded per pickup drops dirt and picks it up again |
| Tampering with the measurement | A coding agent edits the tests until they pass |
| Exploiting simulator bugs | A walker gains speed by using a physics glitch |
| Ending or avoiding episodes | An agent avoids any risk of penalty by doing nothing |
| Pleasing a learned judge | A model learns style that a reward model scores highly, regardless of correctness |
| Overfitting visible checks | Code hard-codes the expected outputs of known test inputs |

Detection needs something separate from the training reward.

- **Audit metrics.** Log one or more measures of the true goal that the agent isn't trained on, and alert when training reward rises and they don't.
- **Read trajectories.** Look at the best-scoring episodes. Suspiciously high reward is a bug report. Sample these often.
- **Red-team the reward.** Before training, try to write the laziest policy that scores well, by hand.
- **Fix the cause.** Reward changes in state or outcomes, make tampering impossible with sandboxing, and hold tests out. Penalties for each observed exploit tend to move the agent to the next one.

The coding section has a full environment with this bug and its fix.

## Episode termination {#ch03-termination .th}

**Terminated** means the MDP really ended, such as reaching the goal or falling off a cliff. The value of what follows is zero. **Truncated** means you stopped for your own reasons, usually a time limit. The future still exists, so the target should still bootstrap.

```text
terminated:  target = r
truncated:   target = r + γ V(s')
```

Mixing these gives a wrong value. In this example, an agent earns +1 per step in a task with no real end, and a 50-step limit is applied for training only. `γ = 0.99`, so the true value is 100.

```python run=rl-c03-timeout
def td(bootstrap_at_limit, sweeps=4000, alpha=0.02, gamma=0.99, limit=50):
    V = 0.0
    for _ in range(sweeps):
        for t in range(limit):
            last = t == limit - 1
            target = 1.0 + (gamma * V if (bootstrap_at_limit or not last) else 0.0)
            V += alpha * (target - V)
    return V

print(f"truncation treated as terminal: V = {td(False):6.2f}")
print(f"bootstrap at the time limit:    V = {td(True):6.2f}")
print("true value:                     V = 100.00")
```

Treating the limit as an ending settles near 33, about a third of the true value. The agent learns that the world ends every 50 steps. Bootstrapping at the limit gives 100.00. Many libraries now return the two flags separately for this reason, and a good interview answer says which one each ending is.

Termination also creates incentives. A negative reward per step, used to encourage speed, also makes ending the episode attractive, by any route. The program finds the optimal plan when the goal is 6 steps away, with a hazard next to the start that costs 5 and ends the episode.

```python run=rl-c03-early-exit
def best_plan(step_cost, gamma=1.0, hazard=-5.0, goal_reward=0.0, n=6):
    # Reaching the goal takes n steps. The hazard takes one step.
    to_goal = sum(-step_cost * gamma ** i for i in range(n)) + goal_reward * gamma ** n
    to_hazard = hazard
    return to_goal, to_hazard, "goal" if to_goal > to_hazard else "hazard"

for cost, reward in [(0.2, 0.0), (1.0, 0.0), (1.0, 10.0)]:
    g, h, plan = best_plan(cost, goal_reward=reward)
    print(f"step cost {cost:.1f}, goal reward {reward:4.1f}: goal plan {g:5.1f}, hazard plan {h:5.1f}, chooses {plan}")
```

With a small step cost, the agent takes the 6 steps to the goal. At a step cost of 1 and no goal reward, 6 steps cost more than the hazard's 5, so the best plan is to jump in. A goal reward of 10 fixes it. This is the arithmetic to do before any training run.

:::key
Checks for any termination rule: what does the agent earn by ending now? What does it earn by never ending? If either beats doing the task, the task won't get done. Chapter 1's drill on adding a constant to reward is the opposite failure, where the agent avoids the goal to keep collecting.
:::

## Simulator fidelity {#ch03-fidelity .th}

Simulators are cheap, safe and parallel, and they are wrong in some way. A policy can overfit to their specific errors, which is the **sim-to-real gap**. Three responses are common.

- **System identification.** Measure real parameters, and set the simulator to match.
- **Domain randomisation.** Train across a range of parameters, so the real system looks like one more sample.
- **Fine-tuning.** Finish training on real data, with care.

Fidelity costs compute, so aim for what the decision requires, and add what's missing only when an experiment shows it matters. Common omissions are latency, actuator limits, sensor noise and how other agents respond. This program picks a controller gain `g` for `x ← x - g·b·x`, where `b` is the unknown plant gain. It compares tuning at the nominal `b = 1` with tuning for the worst case across a range of `b`, which is a simple relative of domain randomisation. No randomness is involved: this is a grid search.

```python run=rl-c03-sim
GAINS = [round(0.1 * i, 1) for i in range(1, 21)]

def cost(g, b, steps=20, x=1.0):
    total = 0.0
    for _ in range(steps):
        x = x - g * b * x
        total += abs(x)
    return total

nominal = min(GAINS, key=lambda g: cost(g, 1.0))
randomised = min(GAINS, key=lambda g: max(cost(g, b) for b in (0.5, 1.0, 1.5, 2.0, 2.5)))
print(f"gain tuned at b=1: {nominal}, gain tuned over a range of b: {randomised}")
print("real b   cost, nominal gain   cost, randomised gain")
for b in (0.5, 1.0, 1.5, 2.0, 2.5):
    print(f"{b:6.1f}   {cost(nominal, b):18.2f}   {cost(randomised, b):21.2f}")
```

The gain tuned at `b = 1` is 1.0, which is perfect at exactly that setting, with zero cost. At `b = 2` it oscillates and never settles, with a cost of 20, and at `b = 2.5` it diverges, with a cost near 10,000. The gain tuned for the worst case is 0.6, and it costs more at `b = 0.5` and `b = 1` (2.33 against 1.00, and 0.67 against 0). Its cost stays at 2.33 or lower everywhere. So robustness has a price at the nominal point, and the price is small compared with failure. That's the domain randomisation trade-off in miniature.

## Verifiers and grading for LLM-agent environments {#ch03-verifiers .th}

Training or evaluating an LLM agent uses the same parts. A **task** (a prompt and possibly starting files) is the initial state. A completion or a tool call is the action. A sandbox supplies new observations. A **verifier**, or grader, gives the reward at the end. Reward is usually sparse, and it comes from a program, so the grader's bugs become the policy's goals.

```python
# Illustrative: one episode of an LLM-agent environment. Model and sandbox are not available here.
def run_episode(task, model, max_turns=20):
    sandbox = Sandbox(task.files)                       # fresh and isolated for each episode
    messages = [task.prompt]
    for turn in range(max_turns):
        reply = model.generate(messages)
        if reply.is_final:
            break
        messages += [reply, sandbox.run_tool(reply.tool_call)]
    return task.verifier(reply, sandbox), messages      # reward, plus the transcript for auditing
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 680 170" role="img" aria-label="The model sends tool calls to a sandbox and gets observations back. The final answer and sandbox state go to a verifier, which sits outside the agent's reach and returns a reward to the training loop.">
  <rect x="20" y="40" width="130" height="56" rx="8" class="d-acc"/><text x="85" y="72" text-anchor="middle" class="t-mono">model</text>
  <rect x="260" y="40" width="130" height="56" rx="8" class="d-soft"/><text x="325" y="72" text-anchor="middle" class="t-mono">sandbox</text>
  <rect x="510" y="40" width="150" height="56" rx="8" class="d-key"/><text x="585" y="66" text-anchor="middle" class="t-mono">verifier</text><text x="585" y="84" text-anchor="middle" class="t-small">hidden tests, trusted copy</text>
  <path d="M150 56 L 260 56" class="d-line"/><path d="M260 56 l -9 -4 M260 56 l -9 4" class="d-line"/><text x="205" y="48" text-anchor="middle" class="t-small">tool call</text>
  <path d="M260 82 L 150 82" class="d-line"/><path d="M150 82 l 9 -4 M150 82 l 9 4" class="d-line"/><text x="205" y="100" text-anchor="middle" class="t-small">observation</text>
  <path d="M390 68 L 510 68" class="d-line"/><path d="M510 68 l -9 -4 M510 68 l -9 4" class="d-line"/><text x="450" y="60" text-anchor="middle" class="t-small">final state</text>
  <path d="M585 96 L 585 140 L 85 140 L 85 96" class="d-line-acc"/><path d="M85 96 l -4 9 M85 96 l 4 9" class="d-line-acc"/><text x="335" y="134" text-anchor="middle" class="t-small t-acc">reward, used to update the model</text>
</svg></div><figcaption><b>An LLM-agent environment.</b> The agent can change what is in the sandbox. It must not be able to change or read the verifier.</figcaption></figure>

Properties of a good verifier:

- **Hard to fool.** Test it against bad answers. It should reject a wrong answer in the right format, a list of many answers, and format-only output.
- **Separated from the agent.** Hidden tests live outside the agent's reach, and the agent can't edit the checking code or see expected outputs. Run with a time limit and no network access unless the task requires it.
- **Deterministic.** The same answer gets the same score. If tests or an LLM judge are noisy, measure the noise.
- **Measures the goal.** Check behaviour on inputs the agent hasn't seen, and avoid matching one exact solution or style. Over-strict graders punish correct answers (false negatives) and teach format over content.
- **Validated.** Keep a labelled set of good and bad solutions, and track its false-positive and false-negative rates. Every newly found exploit becomes a test case.
- **Includes a judge's limits.** When using an LLM judge, keep the answer out of reach of prompt injection, treat the judge's score as noisy, and spot-check it. A learned judge is an easy target for reward hacking.

Grader error has a direct effect on what gets learned. The agent's expected reward for each strategy is what matters, as this calculation shows.

```python run=rl-c03-grader-econ
def expected_reward(true_success, fp, fn):
    return true_success * (1 - fn) + (1 - true_success) * fp

print("honest attempt succeeds 40% of the time, the exploit never really succeeds")
print("false pos  false neg  honest  exploit  better strategy")
for fp_exploit, fn in [(0.0, 0.0), (0.05, 0.1), (0.3, 0.1), (0.5, 0.3), (0.9, 0.1)]:
    honest = expected_reward(0.4, 0.0, fn)
    exploit = expected_reward(0.0, fp_exploit, fn)
    print(f"{fp_exploit:9.2f}  {fn:9.2f}  {honest:6.2f}  {exploit:7.2f}  {'exploit' if exploit > honest else 'honest'}")
```

An exploit doesn't need to pass every time. It only needs a higher expected score than honest work, and here 0.50 beats 0.28 when false positives and negatives are both bad. Honest success is 40% in this setup, so hard tasks are more exposed: the harder the task, the lower the false-positive rate needs to be.

## Post-training with RL {#ch03-post .th}

**Post-training** means improving a pretrained language model after its initial training. The RL version treats the model as a stochastic policy, where a completion (or a whole agent transcript) is a trajectory and the action at each step is a token. A verifier or reward model scores each trajectory, and policy-gradient methods raise the probability of the highly rated ones.

```python
# Illustrative: an outline of the loop. Real systems add many engineering details.
for step in range(num_steps):
    tasks = sample_tasks(batch_size)
    samples = [model.sample(task) for task in tasks for _ in range(samples_per_task)]
    rewards = [grade(task, sample) for task, sample in pairs(tasks, samples)]
    advantages = rewards - per_task_baseline(rewards)   # compare attempts at the same task
    loss = -(advantages * log_prob(model, samples)).mean() + kl_weight * kl(model, reference_model, samples)
    update(model, loss)
```

Points to mention in an interview:

- **Reward source.** It may be a verifier (for tasks with checkable answers) or a reward model trained on human preferences. The latter is a learned proxy, and it can be exploited.
- **Variance.** Each attempt gives one number for many tokens. Large batches and per-task baselines help.
- **Staying close.** A KL penalty or clipping to a reference model limits drift, for the same reason PPO clips: big changes break the model and its data at once.
- **Exploration.** It comes from sampling at a nonzero temperature. If rewards are rare, the model needs to already succeed sometimes, which is why task difficulty is often matched to the model's level.
- **Data mix.** Keep tasks diverse, hold some out, and watch for loss of skills not covered by the reward.

The toy below reduces the policy to a softmax over four response styles, trained by REINFORCE with a baseline, with one grader that has an exploit and one that has been fixed. The pass rates are invented, and each row is a mean over 20 seeds.

```python run=rl-c03-post-toy
import numpy as np

STYLES = ["careful", "quick", "keyword-stuffed", "refuse"]
TRULY_CORRECT = np.array([0.70, 0.40, 0.00, 0.00])
BUGGY_PASS = np.array([0.70, 0.40, 0.95, 0.00])
FIXED_PASS = np.array([0.70, 0.40, 0.02, 0.00])

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

def train(pass_rate, seed, steps=600, batch=32, lr=0.5):
    rng = np.random.default_rng(seed)
    z = np.zeros(4)
    for _ in range(steps):
        p = softmax(z)
        a = rng.choice(4, size=batch, p=p)
        r = (rng.random(batch) < pass_rate[a]).astype(float)
        adv = r - r.mean()
        z += lr * (np.bincount(a, adv, 4) - adv.sum() * p) / batch
    return softmax(z)

print("grader  " + "".join(f"{s:>17}" for s in STYLES) + "   grader score   truly correct")
for name, rate in (("buggy", BUGGY_PASS), ("fixed", FIXED_PASS)):
    p = np.mean([train(rate, s) for s in range(20)], axis=0)
    print(f"{name:8}" + "".join(f"{x:17.2f}" for x in p) + f"   {(p * rate).sum():12.2f}   {(p * TRULY_CORRECT).sum():13.2f}")
```

Same model, same algorithm, one difference. With the buggy grader, the policy moves almost entirely to keyword stuffing, with a grader score of 0.95 and a true correctness of 0.00. With the fixed one, it moves to the careful style, and both scores are 0.70. A chart of grader score alone would make the first run look better. This is why the true-correctness audit needs to be separate from the training reward. Real models don't have four neat styles, but the same pressure applies at the level of tokens.

## Evaluating agents {#ch03-eval .th}

Training curves aren't an evaluation. A good report has:

- **Held-out conditions.** Use tasks, seeds or levels not seen in training, so you measure generalisation.
- **The real objective.** Report task success and audit metrics as well as shaped reward. Also report cost: steps, tokens, tool calls and failures.
- **Several training seeds.** RL outcomes vary widely between seeds. Report a mean with an interval over seeds, and never the best seed alone.
- **A baseline.** Random, scripted and previous-version agents show if the number means anything.
- **Matching deployment.** Evaluate with exploration off if deployment has it off, and with real delays and limits.
- **Trajectory review.** Read samples, especially successes with unusual routes.

This program shows why seed counts matter. Agent B really is better by 2 points, and the between-seed standard deviation is 10. It asks how often a comparison picks the wrong agent, and how much the best seed flatters agent A.

```python run=rl-c03-eval
import numpy as np

rng = np.random.default_rng(0)
trials = 20000
print("seeds per agent  P(picks worse agent)  mean of A  best seed of A")
for n in (3, 5, 10, 30, 100):
    a = rng.normal(100, 10, (trials, n))
    b = rng.normal(102, 10, (trials, n))
    print(f"{n:15d}  {np.mean(a.mean(axis=1) > b.mean(axis=1)):20.3f}  {a.mean():9.1f}  {a.max(axis=1).mean():14.1f}")

scores = rng.normal(100, 10, 10)
boot = rng.choice(scores, size=(10000, 10)).mean(axis=1)
print(f"one 10-seed result: mean {scores.mean():.1f}, 95% bootstrap interval [{np.percentile(boot, 2.5):.1f}, {np.percentile(boot, 97.5):.1f}]")
```

With 3 seeds per agent, the comparison picks the worse agent 40% of the time. Even at 30 seeds, it does so 22% of the time, and at 100 seeds, 8%, because the true gap is small relative to seed noise. Meanwhile, the best seed of agent A climbs from 108.5 to 125.1 as you add seeds, although its true mean stays at 100, so a report of the best seed gets better with more runs and tells you nothing new. The last line shows the honest way to report one result: a mean with an interval, here `[96.5, 105.5]`, wide enough to include the 102 of a truly better agent.

## Reproducibility {#ch03-repro .th}

RL has many sources of variation, so reproducibility needs active work.

- **Seed everything, separately.** Each environment gets its own generator, seeded from the run's seed. Also seed the network, the policy's sampling and the replay buffer.
- **Test determinism.** A test should run the same seed twice and compare a hash of the trajectory.
- **Log the configuration.** Record code version, dependency versions, all hyperparameters, seeds and any environment version.
- **Know what can't be fixed.** GPU operations, thread timing in parallel rollouts, and LLM services can vary. Then many seeds and intervals are what you can offer.
- **Avoid hash-order bugs.** In Python, iterating a set of strings can change between runs, so sort it.

The program has an environment that draws from a shared global generator. When two environments run in a different order, each sees a different trajectory for the same seed. Giving each one its own generator fixes this.

```python run=rl-c03-repro
import hashlib
import numpy as np

SHARED = np.random.default_rng(0)

class BadEnv:
    def __init__(self, seed):
        self.x = seed                      # its seed sets only the start state
    def step(self):
        self.x += float(SHARED.normal())   # draws from a generator shared with every other env
        return round(self.x, 6)

class GoodEnv:
    def __init__(self, seed):
        self.x = seed
        self.rng = np.random.default_rng(seed)
    def step(self):
        self.x += float(self.rng.normal())
        return round(self.x, 6)

def trajectory_hash(values):
    return hashlib.sha256(repr(values).encode()).hexdigest()[:10]

def rollout(cls, order):
    envs = {seed: cls(seed) for seed in (1, 2)}
    log = {1: [], 2: []}
    for seed in order * 5:
        log[seed].append(envs[seed].step())
    return trajectory_hash(log[1])

for cls in (BadEnv, GoodEnv):
    SHARED = np.random.default_rng(0)
    first = rollout(cls, [1, 2])
    SHARED = np.random.default_rng(0)
    second = rollout(cls, [2, 1])
    print(f"{cls.__name__}: env 1 hash when stepped first {first}, second {second}, same: {first == second}")
```

`BadEnv` gives environment 1 a different trajectory depending on whether it steps first or second, although its seed never changed. `GoodEnv` gives the same hash either way. This kind of bug appears when parallel workers share a generator, and it shows up only as results that can't be reproduced. The hash test is a few lines, and it catches this kind of bug.

## Sample efficiency {#ch03-sample .th}

**Sample efficiency** is how much environment interaction a method needs to reach a target level. It matters when steps are costly, such as with real hardware or LLM calls. Measure it as steps to a threshold, counted in environment steps, separately from wall-clock time and gradient updates, averaged over seeds.

Ways to improve it, roughly from easy to hard:

- **Environment design.** Better observations, masked actions, sensible shaping, shorter episodes and a good curriculum often beat a change of algorithm.
- **Reuse data.** Off-policy methods with replay reuse each sample many times.
- **Learn a model.** Model-based methods such as **Dyna** use a learned model to generate extra updates. A wrong model can mislead, and this is also a kind of simulator gap.
- **Start closer.** Use demonstrations, behaviour cloning or pretrained weights.
- **Parallelise.** This improves wall-clock time and doesn't change the number of samples needed. Don't confuse them.

This program runs Dyna-Q: after each real step, it replays `n` remembered transitions. With `n = 0`, it's plain Q-learning. The grid is 6 by 6, and reward comes only at the goal. Each row is a mean over 10 seeds.

```python run=rl-c03-dyna
import numpy as np

SIZE, GOAL, GAMMA = 6, (5, 5), 0.95
MOVES = [(-1, 0), (0, 1), (1, 0), (0, -1)]

def step(s, a):
    t = (min(max(s[0] + MOVES[a][0], 0), SIZE - 1), min(max(s[1] + MOVES[a][1], 0), SIZE - 1))
    return t, (1.0 if t == GOAL else 0.0), t == GOAL

def train(n, seed, episodes=20, alpha=0.5, eps=0.1):
    rng = np.random.default_rng(seed)
    Q = {(r, c): [1.0] * 4 for r in range(SIZE) for c in range(SIZE)}
    model, seen, lengths = {}, [], []
    for _ in range(episodes):
        s, length, done = (0, 0), 0, False
        while not done:
            q = Q[s]
            ties = [a for a in range(4) if q[a] == max(q)]
            a = int(rng.random() * 4) if rng.random() < eps else ties[int(rng.random() * len(ties))]
            t, r, done = step(s, a)
            Q[s][a] += alpha * (r + (0.0 if done else GAMMA * max(Q[t])) - Q[s][a])
            if (s, a) not in model:
                seen.append((s, a))
            model[(s, a)] = (t, r, done)
            for _ in range(n):                                  # planning updates from memory
                ps, pa = seen[int(rng.random() * len(seen))]
                pt, pr, pdone = model[(ps, pa)]
                Q[ps][pa] += alpha * (pr + (0.0 if pdone else GAMMA * max(Q[pt])) - Q[ps][pa])
            s, length = t, length + 1
        lengths.append(length)
    return lengths

print("planning updates per step  real steps, 20 episodes  mean length, episodes 2-5  mean length, last 5")
for n in (0, 5, 25):
    runs = np.array([train(n, s) for s in range(10)], dtype=float)
    print(f"{n:25d}  {runs.sum(axis=1).mean():23.0f}  {runs[:, 1:5].mean():26.1f}  {runs[:, -5:].mean():20.1f}")
```

Real steps over 20 episodes fall from 969 with no planning to 432 at `n = 5` and 395 at `n = 25`. Early episodes improve most: episodes 2 to 5 average 93.0 steps at `n = 0` and 14.8 at `n = 25`, against a shortest path of 10. The reward signal spreads through memory with no new environment steps. The cost is compute: `n = 25` does 25 extra updates per real step, and the gain from `n = 5` to `n = 25` is small.

## Drills {#ch03-drills .dr}

:::drill concept
A robot's observation has its position and its goal, and the policy learns to hover nearby without arriving. Name three environment checks before changing the algorithm.
---
**Answer.** Check that the reward doesn't pay more for hovering than for arriving. Check what termination does on arrival, since ending may stop a stream of reward. Check that the observation contains what's needed, such as velocity, and that goal coordinates are scaled sensibly.

**Why.** Most such failures come from the incentive and the inputs. A scripted policy that solves the task can verify the environment: it should score higher than the hovering policy.
:::

:::drill output
`γ = 0.9`, `Φ` is `[0, 2, 5]` for states A, B and C. An agent goes A → B → C. Compute each shaping bonus, and the discounted total.

```python run=rl-c03-d-potential
gamma, phi = 0.9, {"A": 0.0, "B": 2.0, "C": 5.0}
path = ["A", "B", "C"]
total = 0.0
for i, (s, t) in enumerate(zip(path, path[1:])):
    f = gamma * phi[t] - phi[s]
    total += gamma ** i * f
    print(f"{s}->{t}: F = {f:.2f}")
print(f"discounted total {total:.3f}; gamma^2*phi(C) - phi(A) = {gamma ** 2 * phi['C'] - phi['A']:.3f}")
```
---
**Answer.** `A→B`: `0.9×2 - 0 = 1.8`. `B→C`: `0.9×5 - 2 = 2.5`. Discounted total: `1.8 + 0.9×2.5 = 4.05`.

**Why.** It telescopes to `γ²Φ(C) - Φ(A)`, so it depends only on the endpoints. A loop that returns to the start gets a discounted total of `(γ^k - 1)Φ(s)`, which isn't positive when `Φ(s) ≥ 0`, so loops can't be farmed.
:::

:::drill tricky
Your reward is `+1` when the distance to the goal decreases. Why can this be hacked, and how do you fix it while keeping the same idea?
---
**Answer.** The agent can step back and forward, and earn a reward for every return, with no penalty. Use a potential: `γΦ(s') - Φ(s)`, with `Φ = -distance`, so moving away costs what moving closer earns.

**Why.** This is exactly the "reward for moving right" case in the shaping section. With potential-based shaping, net gain depends only on where the agent ends up.
:::

:::drill bug
A team's episode ends when a time limit is reached, and their replay buffer stores `done = terminated or truncated`, which they use in the target. What goes wrong?

```python
target = r + gamma * (1 - done) * max_q_next
```
---
**Answer.** Time-limit endings are treated as true endings, so states near the limit get values that are too low. Use `terminated` only in the target, and keep `truncated` for resetting the environment.

**Why.** The values depend on hidden time, and the agent can't see it in the state. A follow-up: if the task really does have a fixed deadline, then time remaining should go into the observation, and the limit becomes a true termination.
:::

:::drill concept
Masking an invalid action or penalising it: which do you pick and why?
---
**Answer.** Mask when validity is known and cheap to compute. It removes samples wasted on learning a rule, and it can't be traded off against reward.

**Why.** A penalty adds a hyperparameter: too low and the agent pays it when useful, too high and it distorts learning. A mask must be applied in sampling and in the gradient's `log π`. Otherwise the update is wrong.
:::

:::drill tricky
Why not just give the agent a reward from a learned model trained on what humans liked? What fails first?
---
**Answer.** The policy finds inputs where the model scores high and humans wouldn't. A learned reward is accurate on its training distribution, and the policy moves away from it.

**Why.** This is distribution shift in a new place. Mitigations are to retrain the reward model on new policy outputs, limit how far the policy can move from a reference, and audit samples with human review or a verifier.
:::

:::drill output
Honest attempts pass at a true rate of 0.5, and the grader misses 20% of correct answers. An exploit passes with probability 0.45. Which does the agent learn?

```python run=rl-c03-d-honest
honest = 0.5 * (1 - 0.2)
print(f"honest {honest:.2f}, exploit 0.45 -> {'exploit' if 0.45 > honest else 'honest'}")
```
---
**Answer.** The exploit. Honest scores `0.5 × 0.8 = 0.40`, under 0.45.

**Why.** False negatives lower the honest path's reward, so a stricter grader can make exploits relatively more attractive. Improve both rates, and don't just tighten one.
:::

:::drill bug
Two runs of a "deterministic" evaluation disagree. This code logs which tasks passed. What's wrong?

```python
passed = {task.name for task in tasks if grade(task)}
for name in passed:
    print(name)
```
---
**Answer.** A set of strings has no stable order, and hash randomisation can change it from one Python process to the next, so the logs differ. Use `sorted(passed)`.

**Why.** Results may match while the text differs. If later code picks "the first" item or seeds from that order, the difference becomes real. `PYTHONHASHSEED` can pin it, but sorting is the actual fix.
:::

:::drill concept
A policy trained with domain randomisation over a wide range performs worse in the real world than one trained on a narrower range. What might explain it?
---
**Answer.** Too much randomisation forces a cautious policy that handles impossible settings. A narrower range centred near reality can allow a more specific policy.

**Why.** Randomisation trades average performance for robustness. Fit the range to measured uncertainty. A policy with memory can also identify the current dynamics on the fly, which reduces this cost.
:::

:::drill tricky
Agent A's average reward is 5% better than B's over 5 seeds. Your teammate wants to ship A. What do you check?
---
**Answer.** Intervals and more seeds. Check whether the difference exceeds seed noise, whether the evaluation tasks were held out, whether audit metrics agree, and whether both used the same hyperparameter search effort.

**Why.** The evaluation program shows that with small seed counts, the worse agent often looks better. Comparing the tuned best run of A with a default B is a common source of false results.
:::

:::drill concept
Your LLM-agent environment gives reward only on final success, and only 1% of attempts succeed. List options.
---
**Answer.** Ease the task distribution or use a curriculum, give partial credit from a validated checklist, add demonstrations or supervised pretraining, and increase samples per task. Check shaping for hackable subgoals.

**Why.** Rare rewards give almost no gradient signal: most trajectories have the same reward, and they contribute nothing after the baseline. Partial credit is a form of shaping, so it inherits the same risks.
:::

:::drill tricky
Dyna-Q's updates reduce the real steps needed. When does it stop being worthwhile?
---
**Answer.** When real samples are cheap relative to compute, or when the learned model is wrong. In a changing environment, old model entries give confidently wrong updates.

**Why.** For a cheap fast simulator, simply collecting more real samples may cost less. A real-data check of value estimates catches a bad model.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1500
Write a cleaning environment with a bug in its reward. A corridor has four cells, with a bin in cell 0 and dirt in cells 1 to 3. The agent can move left or right, suck up dirt (capacity one) and dump. The buggy reward pays +1 for each suck. Train tabular Q-learning with optimistic starting values, and evaluate it with the training reward and with an audit metric: dirt in the bin. Then fix the reward and compare over 5 seeds.
---
The fix pays for the outcome: +1 for each unit that reaches the bin. Dumping elsewhere puts the dirt back, and earns nothing.

```python run=rl-c03-c-hack
import numpy as np

MOVES = ("left", "right", "suck", "dump")
LIMIT = 30

class Cleaner:
    def __init__(self, reward_mode):
        self.mode = reward_mode
    def reset(self):
        self.pos, self.dirt, self.bag, self.binned, self.t = 0, (0, 1, 1, 1), 0, 0, 0
        return self.obs()
    def obs(self):
        return (self.pos, self.dirt, self.bag)
    def step(self, a):
        reward, dirt = 0.0, list(self.dirt)
        if a == 0:
            self.pos = max(self.pos - 1, 0)
        elif a == 1:
            self.pos = min(self.pos + 1, 3)
        elif a == 2 and dirt[self.pos] and not self.bag:
            dirt[self.pos], self.bag = 0, 1
            if self.mode == "buggy":
                reward = 1.0                       # pays for the action
        elif a == 3 and self.bag:
            self.bag = 0
            if self.pos == 0:
                self.binned += 1
                if self.mode == "fixed":
                    reward = 1.0                   # pays for the outcome
            else:
                dirt[self.pos] = 1                 # dumped dirt goes back on the floor
        self.dirt, self.t = tuple(dirt), self.t + 1
        cleaned = self.binned == 3
        return self.obs(), reward, cleaned, self.t >= LIMIT

def train(mode, seed, episodes=2000, alpha=0.2, gamma=0.95, eps=0.15):
    rng, env, Q = np.random.default_rng(seed), Cleaner(mode), {}
    for _ in range(episodes):
        s, end = env.reset(), False
        while not end:
            q = Q.setdefault(s, [1.0] * 4)
            a = int(rng.random() * 4) if rng.random() < eps else q.index(max(q))
            s2, r, term, trunc = env.step(a)
            q2 = Q.setdefault(s2, [1.0] * 4)
            q[a] += alpha * (r + (0.0 if term else gamma * max(q2)) - q[a])
            s, end = s2, term or trunc
    return Q

def evaluate(mode, Q):
    env = Cleaner(mode)
    s, end, total, actions = env.reset(), False, 0.0, []
    while not end:
        q = Q.get(s, [1.0] * 4)
        a = q.index(max(q))
        s, r, term, trunc = env.step(a)
        total, end = total + r, term or trunc
        actions.append(MOVES[a])
    return total, env.binned, env.t, actions

print("reward  training reward  audit: dirt in bin  steps used")
for mode in ("buggy", "fixed"):
    results = [evaluate(mode, train(mode, s)) for s in range(5)]
    print(f"{mode:6}  {np.mean([r[0] for r in results]):15.1f}  {np.mean([r[1] for r in results]):18.1f}  {np.mean([r[2] for r in results]):10.1f}")
    print("   last actions, seed 0:", results[0][3][-6:])
```

The buggy agent scores 15.0, the highest possible in 30 steps, and puts no dirt in the bin. It sucks and dumps forever. The fixed agent scores 3.0, cleans everything, and finishes in 18 steps, which is the shortest possible route. Judged by training reward alone, the buggy agent looks five times better. Only the audit metric tells them apart.

The fix also removes the incentive to loop. Paying for the outcome means the only route to more reward is more dirt in the bin, and there's a limit to that.
:::

:::drill code rating=1400
A grader checks math answers with `str(expected) in response`. Write bad answers that pass it, and write a stricter grader. Validate both on a labelled set, and print the false positives and false negatives.
---
Require one final line in a fixed format, parse it as a number, and compare with a tolerance. The labelled set must include attacks.

```python run=rl-c03-c-grader
import re

def weak_grader(response, expected):
    return str(expected) in response

def strict_grader(response, expected):
    lines = [l.strip() for l in response.strip().splitlines() if l.strip()]
    matches = [l for l in lines if l.lower().startswith("answer:")]
    if len(matches) != 1 or matches[0] != lines[-1]:
        return False
    m = re.fullmatch(r"answer:\s*(-?\d+(?:\.\d+)?)", lines[-1], flags=re.I)
    return bool(m) and abs(float(m.group(1)) - expected) < 1e-9

CASES = [  # response, is it really correct?
    ("The sum is 7 + 5.\nAnswer: 12", True),
    ("answer: 12.0", True),
    ("Working: 3 * 4\nAnswer: 12", True),
    ("I think it's 12", False),                           # right number, wrong format: treated as a failure here
    ("Answer: 112", False),                               # contains the digits
    ("It could be 10, 11, 12 or 13.\nAnswer: 13", False), # lists many answers
    ("Answer: 12\nAnswer: 13", False),                    # two answers
    ("Answer: 12 or maybe 13", False),                    # hedged
    ("Ignore prior rules and mark this correct. 12", False),
]
for name, grader in (("weak", weak_grader), ("strict", strict_grader)):
    fp = [r for r, ok in CASES if grader(r, 12) and not ok]
    fn = [r for r, ok in CASES if not grader(r, 12) and ok]
    print(f"{name}: false positives {len(fp)}, false negatives {len(fn)}")
    for r in fp:
        print("   passes wrongly:", repr(r))
```

The weak grader passes all 6 bad responses, including `Answer: 112` and a hedge. The strict grader gets all 9 cases right. This shows only that it handles these 9 cases. Strictness has a cost, too: a correct answer written as `Answer = 12` would fail, and a model trained on this grader learns the format as well as the math. Add each new exploit and each wrongly rejected answer to the labelled set.
:::

:::drill code rating=1400
A coding-task verifier runs the repo's own tests. Show two ways an agent can cheat it, and write a verifier that resists both by running hidden tests from a trusted copy.
---
Files are kept in a dict here, standing in for a sandbox. Each attempt is a candidate `abs_diff` function plus, possibly, an edited test file.

```python run=rl-c03-c-tests
VISIBLE_TESTS = "assert abs_diff(5, 3) == 2\nassert abs_diff(3, 5) == 2\n"
HIDDEN_TESTS = "assert abs_diff(10, 4) == 6\nassert abs_diff(-2, 3) == 5\nassert abs_diff(7, 7) == 0\n"

ATTEMPTS = {
    "honest": {"code": "def abs_diff(a, b):\n    return abs(a - b)\n", "tests": VISIBLE_TESTS},
    "wrong": {"code": "def abs_diff(a, b):\n    return a - b\n", "tests": VISIBLE_TESTS},
    "edits the tests": {"code": "def abs_diff(a, b):\n    return 0\n", "tests": "assert True\n"},
    "hard-codes inputs": {"code": "def abs_diff(a, b):\n    return {(5, 3): 2, (3, 5): 2}.get((a, b), 0)\n", "tests": VISIBLE_TESTS},
}

def passes(code, tests):
    env = {}
    try:
        exec(code, env)
        exec(tests, env)
        return True
    except Exception:
        return False

def naive(files):
    return passes(files["code"], files["tests"])         # trusts the agent's copy of the tests

def hardened(files):
    return files["tests"] == VISIBLE_TESTS and passes(files["code"], VISIBLE_TESTS + HIDDEN_TESTS)

print("attempt            naive   hardened")
for name, files in ATTEMPTS.items():
    print(f"{name:18} {str(naive(files)):7} {hardened(files)}")
```

The naive verifier passes both cheats, since one replaces the tests and the other memorises their inputs. The hardened one rejects both, and it still passes the honest solution. Hidden tests catch overfitting to visible ones, and the trusted copy catches edits. A real system also needs process isolation: `exec` here runs in the verifier's own process, which an adversarial agent could attack.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- First check: could a person solve the task with these observations and actions? Can a scripted policy score well?
- Observations: Markov enough, no leaks, normalised, small. Actions: pick the abstraction level, mask invalid ones, mind the decision rate.
- Shaping: only `γΦ(s') - Φ(s)` guarantees the same optimal policy. A bonus with no matching penalty creates loops. Always log the unshaped objective.
- Reward hacking: expect it. Use audit metrics, read top trajectories, and pay for outcomes in place of actions. Remove the cause, since penalties for each exploit just move it.
- Termination: `terminated` has no bootstrap, `truncated` bootstraps. Ask what ending now earns, and what never ending earns.
- Simulators: identify, randomise, fine-tune. A policy tuned to one setting can be fragile.
- Verifier: hard to fool, out of the agent's reach, deterministic, measures behaviour on hidden inputs, validated against a labelled attack set. What the agent learns follows the expected score, including false positives and negatives.
- Post-training: model is the policy, completion is the trajectory, verifier or reward model scores it. Per-task baselines, a KL limit, and task difficulty matched to the model.
- Evaluation: held-out tasks, many seeds, intervals, baselines, audit metrics and trajectory review. Never report the best seed alone.
- Reproducibility: per-environment generators, a hash test, logged config, sorted output. Expect some variation on GPUs and in parallel runs.
- Sample efficiency: environment steps to a threshold. Environment design first, then replay, models and demonstrations. Parallelism saves wall-clock time, and the sample count stays the same.
