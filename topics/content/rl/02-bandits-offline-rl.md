---
title: Bandits and offline RL
part: Part B · Learning from limited feedback
lede: Two simpler settings that appear in production more often than full RL. A bandit has actions and rewards with no state transitions, and it isolates the explore or exploit decision. Offline RL has a fixed log and no chance to try anything new, and it isolates the problem of trusting data that a different policy produced. The chapter finishes with evaluating a policy without deploying it, and with the risks of systems that learn from their own feedback.
desc: explore vs exploit, epsilon-greedy, UCB, Thompson sampling, regret, contextual bandits, non-stationarity, traffic routing, offline RL, distribution shift, conservative methods, off-policy evaluation, feedback loops
hours: 6
prereqs: Chapter 1 (value functions, on-policy vs off-policy), basic probability, expectation and variance
---

## Explore or exploit {#ch02-explore .th}

A **multi-armed bandit** has `K` actions, called arms. Each pull gives a reward from that arm's unknown distribution, and nothing else changes. There are no states and no delayed consequences, so the only difficulty is learning which arm is best while still earning reward. Exploring gives information, and exploiting uses it. The hero example on the overview page shows a pure greedy agent getting stuck on a worse arm.

The measure of success is **regret**: how much reward you lost compared with always pulling the best arm.

```text
Regret(T) = Σ_t ( μ* - μ_(a_t) ) = Σ_arms Δ_a · n_a(T)        Δ_a = μ* - μ_a is the arm's gap
```

This version uses the true means, and it is often called pseudo-regret. A bad algorithm has **linear** regret: it keeps paying the same cost per step forever. Theory says that for a fixed problem, no reasonable algorithm can do better than regret growing like `log T`, with a constant that grows as gaps shrink. Over all possible problems, the worst case is on the order of `√(KT)`.

## Epsilon-greedy, UCB and Thompson sampling {#ch02-algos .th}

**Epsilon-greedy** pulls a random arm with probability `ε`, and otherwise the arm with the highest estimated mean. It is simple and works with almost any model. With a fixed `ε`, regret is linear, because it keeps exploring obviously bad arms at the same rate. Decaying `ε` over time fixes the rate, but a good schedule depends on the unknown gaps.

**UCB1** picks the arm with the highest optimistic estimate, for rewards in `[0, 1]`:

```text
index(a) = mean(a) + √( 2 ln t / n_a )
```

The bonus comes from a concentration bound (Hoeffding): the true mean is unlikely to be above the index. A rarely pulled arm has a large bonus, and it gets tried. As the arm is pulled, the bonus shrinks. Because `ln t` keeps growing, every arm is revisited eventually, but less and less often. This is "optimism in the face of uncertainty", and it needs no random numbers.

**Thompson sampling** keeps a posterior over each arm's mean, samples once from each posterior, and pulls the arm with the highest sample. So each arm is pulled with the probability that it is the best, under current beliefs. With 0/1 rewards the posterior is a Beta distribution: start at `Beta(1, 1)` and add 1 to the first parameter on success, or the second on failure.

```python run=rl-c02-posterior
import numpy as np

rng = np.random.default_rng(0)
arms = {"A (6 of 10)": (6, 10), "B (30 of 60)": (30, 60), "C (2 of 2)": (2, 2)}
samples = np.array([rng.beta(1 + s, 1 + n - s, 100000) for s, n in arms.values()])
best = samples.argmax(axis=0)
for i, (name, (s, n)) in enumerate(arms.items()):
    print(f"{name:13} mean {s / n:.2f}  posterior mean {(1 + s) / (2 + n):.3f}  P(best) {np.mean(best == i):.3f}")
```

`C` has the highest chance of being best at 0.751, and it would get most of the traffic. `A` still gets about 20% and `B` about 4%. Thompson sampling keeps testing `C` until its posterior narrows. Note that `C`'s posterior mean is 0.75, well below its raw mean of 1.00, because of the prior.

:::trap
A plain mean compares `C` at 1.00 with `B` at 0.50 and says `C` is far better. Two samples say very little. Any answer about choosing between options should mention uncertainty as well as the mean.
:::

| | Epsilon-greedy | UCB1 | Thompson sampling |
|---|---|---|---|
| Explores | Uniformly at random | Toward uncertain arms | In proportion to probability of being best |
| Randomised | Yes | No | Yes |
| Parameter | `ε` or a schedule | Bonus scale, often tuned | Prior |
| Batched or delayed feedback | Fine | Repeats the same arm until feedback arrives | Fine, since samples differ |
| Regret on a fixed problem | Linear with fixed `ε` | Logarithmic | Logarithmic, under assumptions |

The comparison on a real run, with regret curves, is in the coding section at the end of this chapter.

## Contextual bandits {#ch02-contextual .th}

A **contextual bandit** sees features `x` before choosing an arm, and the best arm depends on `x`. A recommendation system might see the user's device and the time of day. The action still doesn't affect the next context. If it did, for example if today's recommendation changes what the user does tomorrow, you would have a full RL problem. In an interview, this is the first question to ask about a new problem: do my actions change future states?

**LinUCB** models each arm's expected reward as linear in `x`, and it adds an uncertainty bonus. For arm `a`, fit ridge regression with `A_a = λI + Σ x xᵀ` and `b_a = Σ r x`, then pick the arm maximising:

```text
θ_a = A_a⁻¹ b_a           index(a) = θ_aᵀ x + α √( xᵀ A_a⁻¹ x )
```

The bonus is large for directions in feature space this arm hasn't seen. Linear Thompson sampling samples `θ` from a Gaussian posterior. Neural versions typically fit a network and use its last layer as `x`. The program compares a context-free UCB with LinUCB, over 10 seeds, on a problem where the best arm flips with the sign of one feature.

```python run=rl-c02-contextual
import numpy as np

THETA = np.array([[0.5, 0.3], [0.5, -0.3], [0.45, 0.0]])    # true weights on [1, c] per arm

def run(seed, contextual, T=2000, alpha=0.5):
    rng = np.random.default_rng(seed)
    A_inv = [np.eye(2) for _ in range(3)]                   # update the inverse directly
    b = [np.zeros(2) for _ in range(3)]
    n, total = np.zeros(3), np.zeros(3)
    regret = 0.0
    for t in range(1, T + 1):
        x = np.array([1.0, rng.uniform(-1, 1)])
        true = THETA @ x
        if contextual:
            index = [A_inv[a] @ b[a] @ x + alpha * np.sqrt(x @ A_inv[a] @ x) for a in range(3)]
        else:
            index = [np.inf if n[a] == 0 else total[a] / n[a] + np.sqrt(2 * np.log(t) / n[a]) for a in range(3)]
        a = int(np.argmax(index))
        r = true[a] + rng.normal(0, 0.2)
        regret += true.max() - true[a]
        n[a] += 1
        total[a] += r
        v = A_inv[a] @ x
        A_inv[a] = A_inv[a] - np.outer(v, v) / (1.0 + x @ v)  # Sherman-Morrison
        b[a] = b[a] + r * x
    return regret

for name, contextual in (("context-free UCB", False), ("LinUCB", True)):
    regrets = [run(s, contextual) for s in range(10)]
    print(f"{name:17} regret after 2000 steps: {np.mean(regrets):6.1f} +- {np.std(regrets, ddof=1) / np.sqrt(10):.1f}")
```

No single arm is good everywhere, so context-free UCB pays about 0.15 per step, ending at 317.2. That follows from the setup: the best single arm has a mean of 0.5, and the best arm per context has a mean of 0.65. LinUCB reaches 5.8 on this problem, where the true model is linear. A mismatch between the model and reality would hurt it.

## Non-stationary rewards {#ch02-nonstat .th}

Real rewards drift. A standard bandit averages all history, so after the world changes, old data keeps dragging its estimates. Two fixes are common, and both make the algorithm forget.

- **Discounting.** Multiply all counts by `γ < 1` each step, so a sample's weight decays geometrically. The effective memory is `1 / (1 - γ)` samples.
- **Sliding window.** Use only the last `W` steps.

Either one trades accuracy for adaptability, since a shorter memory means noisier estimates on a stable problem. The program runs Thompson sampling on two arms that swap means halfway through. The figures are means over 200 seeds.

```python run=rl-c02-nonstat
import numpy as np

SEEDS, T, HALF = 200, 4000, 2000
rows = np.arange(SEEDS)

def run(gamma=1.0, window=None, seed=0):
    rng = np.random.default_rng(seed)
    wins, losses = np.zeros((SEEDS, 2)), np.zeros((SEEDS, 2))
    arm_log, reward_log = np.zeros((SEEDS, T), dtype=int), np.zeros((SEEDS, T))
    regret = np.zeros(T)
    for t in range(T):
        means = np.array([0.7, 0.3]) if t < HALF else np.array([0.3, 0.7])
        a = rng.beta(1 + wins, 1 + losses).argmax(axis=1)
        r = (rng.random(SEEDS) < means[a]).astype(float)
        wins *= gamma
        losses *= gamma
        wins[rows, a] += r
        losses[rows, a] += 1 - r
        arm_log[:, t], reward_log[:, t] = a, r
        if window and t >= window:
            old_a, old_r = arm_log[:, t - window], reward_log[:, t - window]
            wins[rows, old_a] -= old_r
            losses[rows, old_a] -= 1 - old_r
        regret[t] = (means.max() - means[a]).mean()
    return regret[:HALF].sum(), regret[HALF:].sum()

print("variant                 regret before swap   regret after swap")
for name, kwargs in (("plain Thompson", {}), ("discounted 0.99", {"gamma": 0.99}),
                     ("discounted 0.999", {"gamma": 0.999}), ("window 200", {"window": 200})):
    before, after = run(**kwargs)
    print(f"{name:24}{before:12.1f}{after:20.1f}")
```

Plain Thompson has almost no regret while the world is fixed, 5.8, and then 382.2 after the swap, because its old evidence takes many samples to overturn. Each forgetting variant pays more before the swap and much less after it. `γ = 0.99` costs 40.3 and then 58.1, and a window of 200 costs 26.2 and then 51.9. `γ = 0.999` sits in between. So the memory length is a bet on how often the world changes, and the discount or window size should come from how fast your reward actually drifts.

## Routing traffic as a bandit {#ch02-routing .th}

Many production decisions have this shape: send each request to one of several options, observe the outcome, and adjust. Examples include routing payments among gateways, routing inference requests among model versions or LLM providers, and choosing between ranking variants. For a bandit view of payments, each gateway is an arm, and each transaction is a pull with a success or failure result.

The toy below has three gateways with success rates 0.90, 0.85 and 0.80. The best gateway has an outage from step 3000 to step 4000, and its success rate falls to 0.30. All numbers are invented. The figures are means over 100 seeds.

```python run=rl-c02-router
import numpy as np

SEEDS, T = 100, 6000
rows = np.arange(SEEDS)
BASE = np.array([0.90, 0.85, 0.80])

def means_at(t):
    return np.array([0.30, 0.85, 0.80]) if 3000 <= t < 4000 else BASE

def simulate(policy, seed=0):
    rng = np.random.default_rng(seed)
    wins, losses = np.zeros((SEEDS, 3)), np.zeros((SEEDS, 3))
    success, share0 = np.zeros(T), np.zeros(T)
    for t in range(T):
        if policy == "equal split":
            a = rng.integers(0, 3, SEEDS)
        else:
            a = rng.beta(1 + wins, 1 + losses).argmax(axis=1)
            if policy.endswith("floor"):                    # 5% of traffic is always spread evenly
                explore = rng.random(SEEDS) < 0.05
                a = np.where(explore, rng.integers(0, 3, SEEDS), a)
        r = (rng.random(SEEDS) < means_at(t)[a]).astype(float)
        if policy.startswith("discounted"):
            wins *= 0.995
            losses *= 0.995
        wins[rows, a] += r
        losses[rows, a] += 1 - r
        success[t], share0[t] = r.mean(), (a == 0).mean()
    return success, share0

print("policy                  overall  before  outage  first 500 after  share on gateway 0 in last 500")
for policy in ("equal split", "plain Thompson", "plain Thompson + floor", "discounted Thompson", "discounted + floor"):
    s, g = simulate(policy)
    print(f"{policy:24}{s.mean():6.3f}{s[:3000].mean():8.3f}{s[3000:4000].mean():8.3f}{s[4000:4500].mean():12.3f}{g[-500:].mean():18.2f}")
```

During the outage, plain Thompson succeeds only 0.618 of the time, worse than the equal split's 0.649, because it has so much old evidence for the gateway that broke. Discounted Thompson holds 0.810. After the outage, plain Thompson has largely given up on the best gateway, with 0.10 of traffic there in the last 500 steps. Discounted Thompson is back to 0.74. Its evidence decays, its posterior widens, and it retries. Overall, it has the highest success rate at 0.869, though it is slightly below plain Thompson before the outage, 0.883 against 0.892: this is the cost of forgetting.

The 5% floor made almost no difference in this run, and overall success fell by about 0.003 with discounting. A floor still guarantees non-zero propensities for later evaluation, as described below.

Beyond the algorithm, the design decisions usually draw more follow-ups than the update rule.

- **Reward.** Success alone ignores cost and latency. A common reward is `success - cost_weight × fee - latency_weight × latency`. The weights encode a business decision, so make them explicit.
- **Context.** Success may depend on the payment method, the amount bucket or the region. Use a contextual bandit or one bandit per segment, and watch for segments with too little traffic to learn from.
- **Delayed and missing feedback.** Outcomes can take minutes. Treat pending results as unknown, and decide what a timeout counts as. Batched updates favour randomised policies.
- **Exploration floor.** A minimum share per option keeps you measuring every option, and it keeps propensities above zero for off-policy evaluation later. Its cost is real traffic on worse options.
- **Guardrails.** Keep hard rules outside the learner: remove options that are failing, limit how quickly traffic shifts, and cap the share per option. A learning system shouldn't be the only thing that responds to an outage.
- **Correlated failure and capacity.** Sending all traffic to one option may degrade it. The reward then depends on your own allocation, which a basic bandit doesn't model.
- **Logging.** Record the context, the chosen arm, the probability of choosing it, and the outcome. You can't recover the probability later, and the evaluation methods below need it.

## Offline RL and distribution shift {#ch02-offline .th}

**Offline RL**, also called batch RL, learns a policy from a fixed dataset with no further interaction. It suits cases where exploration is costly or dangerous, such as healthcare or industrial control, or where logs are plentiful. It is not the same as off-policy RL: DQN learns from a replay buffer, but it keeps collecting new data, and that corrects its mistakes. Offline, a mistake stays uncorrected.

The core problem is **distribution shift**. The learned policy differs from the one that produced the data, so it visits states and takes actions the data barely covers. Q-learning's `max` makes this worse: it seeks out actions whose values are overestimated, and those are often the actions with the least data. This is **extrapolation error**, and it spreads through bootstrapping. Online, the agent would try that action and learn it is bad. Offline, nothing pushes back.

The program shows this with one state and ten actions. The logging policy took action 0 a thousand times, and took each other action five times. One rare action really is better. The agent picks an action either by highest estimated mean or by a lower confidence bound (LCB), which is the pessimistic estimate.

```python run=rl-c02-offline
import numpy as np

TRUE = np.array([0.50, 0.20, 0.25, 0.30, 0.35, 0.40, 0.30, 0.25, 0.20, 0.60])
COUNTS = np.array([1000] + [5] * 9)
SEEDS = 2000
rng = np.random.default_rng(0)

means = rng.binomial(COUNTS, TRUE, (SEEDS, 10)) / COUNTS
pessimistic = means - 1.0 * np.sqrt(np.log(100.0) / (2 * COUNTS))      # subtract a Hoeffding width

for name, scores in (("highest mean", means), ("lower confidence bound", pessimistic)):
    picks = scores.argmax(axis=1)
    print(f"{name:24} true value of pick {TRUE[picks].mean():.3f}  picks action 0 {np.mean(picks == 0):.3f}  picks the truly best {np.mean(picks == 9):.3f}")
print(f"estimate of the picked action under 'highest mean': {means.max(axis=1).mean():.3f}")
```

Picking by highest mean gets a true value of 0.439, worse than the 0.50 you would get by just repeating action 0. It believes its pick is worth 0.706 on average, so the estimate is too high and the decision is worse. The LCB picks action 0 in every run and gets 0.50. It also never finds the truly best action, worth 0.60, which the optimistic rule does find 37% of the time. With only five samples per rare action, pessimism sets a floor on performance and gives up the chance of finding the improvement.

**Conservative methods** apply this idea to full RL. You only need the concepts for most interviews.

- **Policy constraints** keep the learned policy close to the behaviour policy, so it stays where data exists. BCQ and TD3+BC are examples.
- **Value pessimism** lowers the values of actions outside the data. Conservative Q-Learning (CQL) adds a penalty that pushes down Q-values on actions from the learned policy and pushes up those on actions from the dataset.
- **Avoiding the query.** Implicit Q-Learning (IQL) learns good values using only actions in the dataset, and extracts a policy afterwards, so it never evaluates an unseen action in its target.
- **Behaviour cloning** is the simple baseline: copy the logged policy with supervised learning. Compare any offline RL method against it.

:::trap
Don't claim offline RL can discover anything from any log. If the data never includes an action or state, no algorithm can know its value. Conservative methods avoid betting on it, which means they can also miss a real improvement.
:::

## Off-policy evaluation {#ch02-ope .th}

**Off-policy evaluation** (OPE) estimates how a new target policy `π` would perform, using logs from a behaviour policy `μ`, before you deploy it. The basic tool is **importance sampling** (IS). Weight each logged outcome by how much more likely `π` was to take that action:

```text
V_IS = (1/n) Σ_i  [ π(a_i | x_i) / μ(a_i | x_i) ] · r_i
```

It is unbiased when `μ(a|x) > 0` wherever `π(a|x) > 0`. This requirement is called **overlap** or coverage. There are three common variants.

- **Weighted (self-normalised) IS** divides by the sum of weights in place of `n`. It has some bias and usually much lower variance.
- **Direct method** fits a reward model and averages its predictions under `π`. It has low variance and carries any bias of the model.
- **Doubly robust** (DR) combines them: start from the model's prediction and add an IS correction for its error. It is consistent if either the model or the propensities are right.

For sequences, the weight is a product of per-step ratios, and its variance can grow exponentially with the horizon. In this program the behaviour policy is uniform over two actions, and the target picks the rewarded action with probability 0.8.

```python run=rl-c02-is-horizon
import numpy as np

rng = np.random.default_rng(0)
n = 200000
print("horizon  true  IS estimate  std of one weighted return  effective sample share")
for H in (1, 5, 10, 20, 40):
    good = rng.random((n, H)) < 0.5                       # behaviour: action 0 with probability 0.5
    weights = np.prod(np.where(good, 0.8 / 0.5, 0.2 / 0.5), axis=1)
    returns = good.mean(axis=1)                           # reward: share of steps with action 0
    wr = weights * returns
    ess = weights.sum() ** 2 / (weights ** 2).sum() / n
    print(f"{H:7d}  0.80  {wr.mean():11.3f}  {wr.std():26.3f}  {ess:22.5f}")
```

With one step the estimate is good, and the effective sample share (`(Σw)² / (n Σw²)`) is 0.736. By `H = 20` it is 0.0029, so 200,000 logged trajectories act like about 580. By `H = 40` the estimate reads 0.624 against a true 0.80, with 200,000 samples. The heavy weights that would correct it are too rare to appear in the sample, so the output looks stable and is wrong. The measured share is itself too optimistic at that length, for the same reason. Per-decision IS, weighted IS and doubly robust estimators all reduce this, and none removes it.

## Continual learning from feedback loops {#ch02-loops .th}

A model that retrains on data from its own decisions is in a **feedback loop**. Its choices decide which outcomes you get to see. That turns a supervised retraining pipeline into a kind of RL system, usually with no exploration and no off-policy correction. Here, each of 100 seeds starts with noisy estimates from a few samples per item, then retrains daily on what it showed.

```python run=rl-c02-loop
import numpy as np

TRUE = np.array([0.10, 0.12, 0.14, 0.16, 0.20])
SEEDS, DAYS, IMPRESSIONS = 100, 60, 200
rows = np.arange(SEEDS)

def simulate(floor, seed=0):
    rng = np.random.default_rng(seed)
    shows = np.full((SEEDS, 5), 20.0)                  # a small starting log, 20 views per item
    clicks = rng.binomial(20, TRUE, (SEEDS, 5)).astype(float)
    for _ in range(DAYS):
        best = (clicks / shows).argmax(axis=1)
        counts = np.full((SEEDS, 5), floor * IMPRESSIONS / 5)
        counts[rows, best] += (1 - floor) * IMPRESSIONS
        counts = counts.astype(int)
        shows += counts
        clicks += rng.binomial(counts, TRUE)
    best = (clicks / shows).argmax(axis=1)
    return TRUE[best].mean(), np.mean(best == 4), shows[:, 4].mean(), np.mean(shows[:, 4] <= 20)

print("exploration floor  true rate of final pick  found best item  mean views of best item  best item never shown again")
for floor in (0.0, 0.05, 0.2):
    v, found, views, never = simulate(floor)
    print(f"{floor:17.2f}  {v:23.3f}  {found:15.2f}  {views:23.0f}  {never:27.2f}")
```

With no exploration, 19% of the runs never show the best item again after the starting log, because its early estimate happened to be low, and the system has no way to learn it was wrong. The mean true rate of the final pick is 0.191. A floor of 5% finds the best item in 97% of runs, and 20% finds it in all of them. The table doesn't show the cost: at a floor of 20%, about 16% of impressions go to items other than the current pick.

The main risks of continual learning from feedback are these.

- **Selection bias.** You see outcomes only for what you chose. Absence of evidence becomes evidence of absence.
- **Self-reinforcement.** Showing an item produces clicks, and clicks raise its score. Popular items stay popular for that reason alone.
- **Label and reward corruption.** Delayed labels, automated traffic or users adapting to the system can feed in bad signal. Attackers can poison an online learner.
- **Drift and forgetting.** Recent data can overwrite what the model knew about rare cases. Neural models can show **catastrophic forgetting** when the training distribution moves.
- **Silent degradation.** Offline metrics computed on self-selected data can look fine while the true outcome falls.

Common mitigations are an exploration floor with logged propensities, a small random holdout that the model doesn't control, canary deployment and fast rollback, monitoring of input and outcome distributions, a replay of older data in training, and a gated release: new models must pass an OPE or a controlled test before getting traffic.

## Drills {#ch02-drills .dr}

:::drill output
Three arms have means 0.9, 0.8 and 0.5. Epsilon-greedy with `ε = 0.1` has already identified the best arm, and explores uniformly over all three. What is the expected regret per step, and over 10,000 steps?

```python run=rl-c02-d-eps
means, eps = [0.9, 0.8, 0.5], 0.1
gaps = [max(means) - m for m in means]
per_step = eps * sum(gaps) / len(gaps)
print(f"per step {per_step:.4f}, over 10000 steps {per_step * 10000:.1f}")
```
---
**Answer.** `0.1 × (0 + 0.1 + 0.4) / 3 ≈ 0.0167` per step, about 167 over 10,000 steps.

**Why.** Regret is linear in `T`, whatever the agent has learned. Decaying `ε`, or moving to UCB or Thompson sampling, fixes the rate.
:::

:::drill output
At `t = 100`, arm A has mean 0.60 from 50 pulls, B has 0.50 from 10 pulls, and C has 0.55 from 40 pulls. Which arm does UCB1 pick?

```python run=rl-c02-d-ucb
import math
for name, mean, n in [("A", 0.60, 50), ("B", 0.50, 10), ("C", 0.55, 40)]:
    bonus = math.sqrt(2 * math.log(100) / n)
    print(f"{name}: bonus {bonus:.3f} index {mean + bonus:.3f}")
```
---
**Answer.** B, the arm with the lowest mean. Its index is about 1.460, while A and C are near 1.03.

**Why.** B has the most uncertainty. The index can exceed 1 even for rewards in `[0, 1]`, since it is a confidence bound, not a probability.
:::

:::drill tricky
Feedback arrives in batches once an hour, and you must assign 10,000 requests per hour. Why might UCB do poorly, and what would you use?
---
**Answer.** UCB is deterministic given its data, so all 10,000 requests go to the same arm until the next update. Thompson sampling draws different samples per request, so traffic spreads according to current uncertainty.

**Why.** Randomised policies handle delay and batching more gracefully. Sending all traffic to one option also risks a capacity problem. Batched UCB variants exist as well.
:::

:::drill concept
A team models an email campaign as a bandit, and each email affects whether users unsubscribe. Is a bandit right?
---
**Answer.** It's an approximation that ignores long-term effects. An action changes the future audience, so this is an RL problem in principle. A bandit optimising clicks can over-send.

**Why.** The usual practical choices are a reward that includes a long-term proxy, such as a penalty for unsubscribes, or a real RL model when you have data to support one.
:::

:::drill concept
With discount `γ = 0.99`, what is a Thompson sampler's effective memory? What is the largest evidence total an arm can ever have?
---
**Answer.** About 100 samples. If an arm is pulled every step, its total pseudo-count converges to `1 / (1 - γ) = 100`.

**Why.** The sum `1 + γ + γ² + …` converges to that value. So the posterior never gets narrower than that amount of data allows, and this keeps it exploring. It is also the cost: it can't detect a very small gap, however long it runs.
:::

:::drill tricky
An adaptive allocator has run for a month, and a teammate reports each arm's success rate as a plain mean from the logs. What's wrong with using those for inference? The program uses a greedy allocator with two arms of true mean 0.5, which shows the effect most strongly.

```python run=rl-c02-d-adaptive
import numpy as np

rng = np.random.default_rng(0)
seeds, steps = 20000, 100
rows = np.arange(seeds)
pulls = np.ones((seeds, 2))                                   # one starting pull per arm
wins = rng.binomial(1, 0.5, (seeds, 2)).astype(float)
for _ in range(steps):
    a = (wins / pulls).argmax(axis=1)                         # greedy, the strongest case
    wins[rows, a] += rng.random(seeds) < 0.5
    pulls[rows, a] += 1
print(f"mean of sample means: {(wins / pulls).mean():.3f}   true mean: 0.500")
```
---
**Answer.** Sample means under adaptive allocation are biased, typically downward, and standard confidence intervals assume a fixed allocation, so they can mislead. In this run the average estimate is 0.303 against a true 0.5. Softer allocators such as Thompson sampling usually show a smaller effect in the same direction.

**Why.** An arm that gets unlucky gets fewer pulls, so its low estimate stays uncorrected. An arm that gets lucky gets more pulls, which brings its estimate back down. If you need clean inference, keep a randomised holdout or use IS weights with logged propensities.
:::

:::drill output
Logs from a policy with `μ(A) = 0.5`, `μ(B) = 0.5`: `(A, r=1)`, `(A, r=0)`, `(B, r=1)`, `(A, r=1)`. Target policy: `π(A) = 0.9`, `π(B) = 0.1`. Compute IS and weighted IS.

```python run=rl-c02-d-is
logs = [("A", 1), ("A", 0), ("B", 1), ("A", 1)]
pi, mu = {"A": 0.9, "B": 0.1}, {"A": 0.5, "B": 0.5}
w = [pi[a] / mu[a] for a, _ in logs]
print("weights", [round(x, 2) for x in w])
print(f"IS  {sum(x * r for x, (_, r) in zip(w, logs)) / len(logs):.3f}")
print(f"WIS {sum(x * r for x, (_, r) in zip(w, logs)) / sum(w):.3f}")
```
---
**Answer.** Weights are 1.8, 1.8, 0.2 and 1.8. IS: `(1.8 + 0 + 0.2 + 1.8) / 4 = 0.95`. WIS: `3.8 / 5.6 ≈ 0.679`.

**Why.** The weights should average 1 in expectation, and on this small sample they average 1.4, which inflates IS. WIS removes that scale problem by normalising.
:::

:::drill bug
A student's IS estimate gets better when the target policy gets worse, and it's far from the true value. Find the bug.

```python
w = mu[a] / pi[a]
estimate = np.mean(w * r)
```
---
**Answer.** The ratio is inverted. It should be `pi[a] / mu[a]`.

**Why.** The weight should raise samples that the target policy takes more often than the logger. As a check, `E_μ[π/μ] = 1` for any valid pair, so the mean of the weights should be near 1. Log this in every OPE pipeline.
:::

:::drill tricky
Your new policy sometimes takes an action the logger never took. What does IS report, and what's the true situation?
---
**Answer.** Those actions never appear in the logs, so IS ignores them and gives a biased answer, usually without warning. The true value on those actions can't be identified from the data.

**Why.** Overlap fails. Check by comparing the support of `π` and `μ`. You can restrict the target, use a reward model with explicit caution about extrapolation, or run a small controlled test to collect that data.
:::

:::drill concept
Why is offline RL harder than off-policy RL, when both use data from another policy?
---
**Answer.** An off-policy online agent can try an action it overestimates, see the result, and correct itself. An offline agent can't, so its overestimates persist and spread by bootstrapping.

**Why.** `max` seeks out the errors. Answers in this area should mention distribution shift and how pessimism or constraints handle it.
:::

:::drill tricky
Weighted IS has lower variance than IS in most cases. Why would anyone use ordinary IS?
---
**Answer.** Ordinary IS is unbiased at any sample size, and WIS is only consistent (its bias shrinks with `n`). Unbiasedness also makes some confidence-interval constructions and combinations of estimates simple.

**Why.** In practice WIS or DR is usually preferred. A single huge weight dominates ordinary IS and can give estimates outside the possible range of rewards, and WIS can't do that.
:::

:::drill bug
A recommendation model retrains daily on impressions and clicks. Its offline AUC on the newest data is stable, but user engagement is slowly falling. What is the likely cause, and what test would you add?
---
**Answer.** It's likely a feedback loop. The offline test set is drawn from what the model itself chose to show, so it can't reveal missed items. Add a small randomised holdout, and compute metrics on that data.

**Why.** The holdout is unaffected by the model's choices, so its outcomes give an unbiased view of what the model isn't showing. It also supplies logged data with known propensities for OPE.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1300
Write epsilon-greedy, UCB1 and Thompson sampling. Run them on five Bernoulli arms with means 0.3, 0.5, 0.45, 0.55 and 0.6, for 5000 steps, and report mean cumulative regret over 200 seeds.
---
All seeds run in parallel, as one row per seed, so a 5000-step run stays fast. A small random tie-break matters at the start, when every estimate is equal.

```python run=rl-c02-c-regret
import numpy as np

MEANS = np.array([0.3, 0.5, 0.45, 0.55, 0.6])
GAPS = MEANS.max() - MEANS
SEEDS, T = 200, 5000
rows = np.arange(SEEDS)

def eps_greedy(eps):
    def pick(t, n, s, rng):
        est = s / np.maximum(n, 1) + rng.random(n.shape) * 1e-9
        a = est.argmax(axis=1)
        e = eps(t)
        return np.where(rng.random(SEEDS) < e, rng.integers(0, 5, SEEDS), a)
    return pick

def ucb1(t, n, s, rng):
    with np.errstate(divide="ignore", invalid="ignore"):
        index = s / n + np.sqrt(2 * np.log(t + 1) / n)
    index[n == 0] = np.inf
    return (index + rng.random(n.shape) * 1e-9).argmax(axis=1)

def thompson(t, n, s, rng):
    return rng.beta(1 + s, 1 + n - s).argmax(axis=1)

def run(pick, seed=0):
    rng = np.random.default_rng(seed)
    n, s = np.zeros((SEEDS, 5)), np.zeros((SEEDS, 5))
    regret = np.zeros((SEEDS, T))
    for t in range(T):
        a = pick(t, n, s, rng)
        n[rows, a] += 1
        s[rows, a] += rng.random(SEEDS) < MEANS[a]
        regret[:, t] = GAPS[a]
    return regret.cumsum(axis=1), n

checkpoints = (100, 500, 1000, 2000, 5000)
print("algorithm".ljust(20) + "".join(f"{c:>8}" for c in checkpoints) + "   +-(T=5000)  pulls on best arm")
for name, pick in (("eps 0.1", eps_greedy(lambda t: 0.1)), ("eps decaying", eps_greedy(lambda t: min(1.0, 50 / (t + 1)))),
                   ("UCB1", ucb1), ("Thompson", thompson)):
    cum, n = run(pick)
    row = "".join(f"{cum[:, c - 1].mean():8.1f}" for c in checkpoints)
    se = cum[:, -1].std(ddof=1) / np.sqrt(SEEDS)
    print(f"{name:20}{row}   {se:10.1f}  {n[:, 4].mean() / T:17.2f}")
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 680 230" role="img" aria-label="Mean cumulative regret against steps for four bandit algorithms. Thompson sampling is lowest at step 5000, then decaying epsilon, fixed epsilon, and UCB1 is highest.">
  <path d="M60 20 L 60 190 L 540 190" class="d-line"/>
  <text x="52" y="194" text-anchor="end" class="t-small">0</text>
  <text x="52" y="152" text-anchor="end" class="t-small">50</text>
  <text x="52" y="109" text-anchor="end" class="t-small">100</text>
  <text x="52" y="66" text-anchor="end" class="t-small">150</text>
  <text x="52" y="24" text-anchor="end" class="t-small">200</text>
  <text x="60" y="208" text-anchor="middle" class="t-small">0</text>
  <text x="156" y="208" text-anchor="middle" class="t-small">1000</text>
  <text x="252" y="208" text-anchor="middle" class="t-small">2000</text>
  <text x="348" y="208" text-anchor="middle" class="t-small">3000</text>
  <text x="444" y="208" text-anchor="middle" class="t-small">4000</text>
  <text x="540" y="208" text-anchor="middle" class="t-small">5000</text>
  <text x="300" y="226" text-anchor="middle" class="t-small">steps</text>
  <path d="M60 190.0 L 70 184.0 L 108 169.9 L 156 157.6 L 252 139.2 L 540 96.8" class="d-line"/>
  <text x="548" y="99" class="t-small">eps 0.1 109.6</text>
  <path d="M60 190.0 L 70 180.8 L 108 166.5 L 156 157.4 L 252 144.4 L 540 118.3" class="d-line-trap"/>
  <text x="548" y="124" class="t-small t-trap">eps decaying 84.3</text>
  <path d="M60 190.0 L 70 182.0 L 108 158.1 L 156 134.8 L 252 99.2 L 540 26.7" class="d-line-key"/>
  <text x="548" y="31" class="t-small t-key">UCB1 192.1</text>
  <path d="M60 190.0 L 70 183.6 L 108 170.4 L 156 161.1 L 252 150.4 L 540 137.0" class="d-line-acc"/>
  <text x="548" y="145" class="t-small t-acc">Thompson 62.3</text>
</svg></div><figcaption><b>Mean cumulative regret, 200 seeds.</b> Straight segments join the five printed checkpoints, so the plot shows less detail than the real curves.</figcaption></figure>

Thompson sampling has the lowest regret at 5000 steps in this run, at 62.3 with a standard error of 2.2. Decaying epsilon follows at 84.3, fixed epsilon at 109.6, and UCB1 is last at 192.1.

UCB1 finishing last surprises people, and this is a common follow-up. Logarithmic regret describes growth as `T` becomes large, and it says nothing about the constant. The gaps here are small and the `√(2 ln t / n)` bonus is conservative, so UCB1 is still spending many pulls on arms it hasn't ruled out: only 0.59 of its pulls go to the best arm. Fixed epsilon adds about 50 regret between steps 2000 and 5000, a nearly steady rate, while Thompson adds about 16. Scaling down the UCB bonus is common in practice. Also look at the spread: decaying epsilon has the largest standard error, 6.5, which fits a fast decay sometimes settling on a wrong arm.
:::

:::drill code rating=1400
A logging policy chose between 3 actions, and you want the value of a new target policy. Implement IS, weighted IS, a direct method and doubly robust. Repeat over 500 logged datasets of 200 samples, with one behaviour policy that has good overlap and one with poor overlap. Report bias and spread.
---
A deliberately imperfect reward model (mean per action, shrunk toward 0.5) shows why DR helps. The true value is known here, since we built the problem.

```python run=rl-c02-c-is
import numpy as np

TRUE_R = np.array([0.2, 0.5, 0.8])
TARGET = np.array([0.1, 0.2, 0.7])
TRUE_VALUE = float((TARGET * TRUE_R).sum())
N, REPS = 200, 500

def estimators(mu, rng):
    a = rng.choice(3, size=N, p=mu)
    r = (rng.random(N) < TRUE_R[a]).astype(float)
    w = TARGET[a] / mu[a]
    model = np.array([(r[a == k].sum() + 2.5) / ((a == k).sum() + 5.0) for k in range(3)])    # shrunk mean
    dm = float((TARGET * model).sum())
    return {"IS": (w * r).mean(), "WIS": (w * r).sum() / w.sum(), "DM": dm,
            "DR": dm + (w * (r - model[a])).mean()}

print(f"true value {TRUE_VALUE:.3f}")
for name, mu in (("good overlap", np.array([0.4, 0.3, 0.3])), ("poor overlap", np.array([0.49, 0.49, 0.02]))):
    rng = np.random.default_rng(0)
    runs = [estimators(mu, rng) for _ in range(REPS)]
    print(name, "max weight", round(float((TARGET / mu).max()), 1))
    for key in ("IS", "WIS", "DM", "DR"):
        values = np.array([run[key] for run in runs])
        print(f"  {key:4} mean {values.mean():.3f}  bias {values.mean() - TRUE_VALUE:+.3f}  std {values.std():.3f}  RMSE {np.sqrt(((values - TRUE_VALUE) ** 2).mean()):.3f}")
```

With good overlap, the largest weight is about 2.3, and every estimator is close. IS has the largest spread at 0.068. DR and WIS cut this to about 0.04, and DR removes most of DM's bias of -0.013. With poor overlap, where the target likes an action the logger rarely took, the largest weight is 35. IS has a spread of 0.308, so a single run can be very far off. DM's spread is the smallest, 0.068, but its shrunk model gives a bias of -0.124. Here DM has the lowest RMSE, 0.142, with DR at 0.154 and WIS at 0.158, so in this setup no estimator is safe by default. Good practice is to report several, check the weights, and treat disagreement between them as a warning.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- Bandit: arms, no state transitions. Regret: `Σ_a Δ_a n_a`. Fixed `ε`: linear. UCB and Thompson: logarithmic on a fixed problem. Worst case over problems: about `√(KT)`.
- UCB1: `mean + √(2 ln t / n)`, optimism, deterministic. Thompson: sample from the posterior, pull the argmax, handles batches well. Beta(1 + wins, 1 + losses) for 0/1 rewards.
- Contextual bandit: features, actions don't change future contexts. LinUCB: ridge regression plus a bonus `α √(xᵀA⁻¹x)`. First question: do actions change future states?
- Non-stationary: discount (`memory = 1/(1-γ)`) or a sliding window. Faster recovery, some extra regret when nothing changes.
- Routing: reward with explicit cost weights, context, delayed outcomes, an exploration floor, guardrails, and logged propensities.
- Offline RL: fixed data, distribution shift, `max` seeks overestimated actions. Pessimism, policy constraints, in-dataset targets. Behaviour cloning is the baseline.
- OPE: `π/μ` weights. IS is unbiased with overlap. WIS: lower variance, small bias. DM: depends on the model. DR: combines both. Sequence weights blow up with horizon. Check that mean weight is near 1.
- Feedback loops: selection bias, self-reinforcement, drift, silent degradation. Fix with an exploration floor, a holdout, logged propensities, monitoring, canaries and rollback.
