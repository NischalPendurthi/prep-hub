---
title: MDPs, Q-learning and policy gradients
part: Part A · Core RL
lede: The core vocabulary of RL and the two families of methods built on it. Value methods learn how good each action is and act on that, and policy methods adjust action probabilities directly. The chapter goes from the Markov decision process through Bellman equations, value iteration, Monte Carlo and TD learning, SARSA, Q-learning and DQN, then REINFORCE, baselines, actor-critic and PPO.
desc: MDPs, discounting, value and Q functions, Bellman equations, value iteration, Monte Carlo vs TD, SARSA vs Q-learning, DQN ideas, REINFORCE, baselines, actor-critic, PPO, on-policy vs off-policy
hours: 8
prereqs: Probability and expectation, gradient descent, basic Python
---

## The agent, the environment and the MDP {#ch01-mdp .th}

An agent observes a state, picks an action, and receives a reward and a next state. It repeats this until the episode ends, or forever. The goal is to pick actions that make the total future reward large.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 640 150" role="img" aria-label="Agent sends an action to the environment. The environment returns a reward and next state to the agent.">
  <rect x="60" y="45" width="150" height="60" rx="8" class="d-acc"/><text x="135" y="70" text-anchor="middle" class="t-mono">agent</text><text x="135" y="90" text-anchor="middle" class="t-small">policy π(a|s)</text>
  <rect x="430" y="45" width="150" height="60" rx="8" class="d-key"/><text x="505" y="70" text-anchor="middle" class="t-mono">environment</text><text x="505" y="90" text-anchor="middle" class="t-small">P(s'|s,a), R(s,a,s')</text>
  <path d="M210 60 L 430 60" class="d-line"/><path d="M430 60 l -9 -4 M430 60 l -9 4" class="d-line"/>
  <text x="320" y="50" text-anchor="middle" class="t-small">action a</text>
  <path d="M430 92 L 210 92" class="d-line"/><path d="M210 92 l 9 -4 M210 92 l 9 4" class="d-line"/>
  <text x="320" y="112" text-anchor="middle" class="t-small">reward r, next state s', done flag</text>
</svg></div><figcaption><b>The RL loop.</b> The agent's actions change which states it sees next, so the training data depends on the policy being trained.</figcaption></figure>

A **Markov decision process** (MDP) formalises this with five things:

- `S`: the states.
- `A`: the actions.
- `P(s' | s, a)`: the transition probabilities.
- `R(s, a, s')`: the reward function.
- `γ` (gamma) in `[0, 1]`: the discount factor.

The **Markov property** says the next state and reward depend only on the current state and action, and earlier history adds nothing. It is a property of how you define the state. A single video frame is not Markov for a moving ball, because it hides velocity, while a stack of recent frames is close to Markov. When the agent sees only part of the true state, the problem is a partially observable MDP (POMDP).

A **policy** `π(a | s)` gives the probability of each action in each state. The **return** is the discounted sum of future rewards:

```text
G_t = r_(t+1) + γ r_(t+2) + γ² r_(t+3) + ...  =  r_(t+1) + γ G_(t+1)
```

The recursive form on the right is the reason a one-line backward loop computes it, and it is also the reason Bellman equations exist.

### Why discount {#ch01-discount}

Discounting does three jobs. It keeps the sum finite in tasks that never end, as long as rewards are bounded. It expresses a preference for sooner reward. It also reduces variance, because distant rewards, which are the noisiest, count for less. A useful rule of thumb is the **effective horizon** `1 / (1 - γ)`: with `γ = 0.99` the agent roughly cares about the next 100 steps. The program compares a small reward now with a larger one four steps later.

```python run=rl-c01-return
def discounted_return(rewards, gamma):
    g = 0.0
    for r in reversed(rewards):
        g = r + gamma * g
    return g

now = [1, 0, 0, 0, 0]
later = [0, 0, 0, 0, 10]
print("gamma   now    later  prefers  horizon")
for gamma in (0.99, 0.9, 0.6, 0.5, 0.1):
    a, b = discounted_return(now, gamma), discounted_return(later, gamma)
    print(f"{gamma:5.2f} {a:6.3f} {b:7.3f}  {'later' if b > a else 'now':7}  {1 / (1 - gamma):6.1f}")
print(f"switch point: gamma = {(1 / 10) ** 0.25:.3f}")
```

For the three largest `γ` values the agent waits for the 10. By `γ = 0.5` it takes the 1 now. The switch happens where `10 γ⁴ = 1`, at `γ ≈ 0.562`, so the same rewards produce opposite decisions depending on `γ` alone.

:::trap
`γ` is part of the problem definition, and it also acts as a tuning knob. A policy that is optimal for `γ = 0.9` can be wrong for `γ = 0.99`, so compare algorithms with the same `γ`. Report the undiscounted episode return for evaluation if that is what you actually care about.
:::

## Value functions and Bellman equations {#ch01-value .th}

Two functions summarise how good things are under a policy `π`:

- **State value** `V^π(s)`: expected return starting in `s`, then following `π`.
- **Action value** `Q^π(s, a)`: expected return after taking `a` in `s`, then following `π`.

They relate by `V^π(s) = Σ_a π(a|s) Q^π(s, a)`. `Q` is the more convenient one for control: with `Q` you can act by taking the argmax, and you need no model of the environment. With only `V`, picking an action needs a one-step lookahead through `P` and `R`.

The recursion in the return gives the **Bellman expectation equations**, which hold for a fixed policy:

```text
V^π(s)    = Σ_a π(a|s) Σ_s' P(s'|s,a) [ R(s,a,s') + γ V^π(s') ]
Q^π(s,a)  = Σ_s' P(s'|s,a) [ R(s,a,s') + γ Σ_a' π(a'|s') Q^π(s',a') ]
```

The optimal versions replace the average over the policy with a max, which makes them nonlinear:

```text
V*(s)    = max_a Σ_s' P(s'|s,a) [ R(s,a,s') + γ V*(s') ]
Q*(s,a)  = Σ_s' P(s'|s,a) [ R(s,a,s') + γ max_a' Q*(s',a') ]
```

For a fixed policy the equations are linear: `V = r + γ P V`, so `V = (I - γP)⁻¹ r`. The program solves a two-state example directly and by repeated backups. Each backup applies the **Bellman operator**, which is a `γ`-contraction in the max norm: it shrinks the worst-case error by at least a factor of `γ`.

```python run=rl-c01-bellman
import numpy as np

P = np.array([[0.9, 0.1],     # transition matrix under a fixed policy
              [0.5, 0.5]])
r = np.array([1.0, -1.0])     # expected reward in each state
gamma = 0.9

exact = np.linalg.solve(np.eye(2) - gamma * P, r)
print("exact     ", np.round(exact, 3))

V = np.zeros(2)
for k in range(1, 51):
    V = r + gamma * P @ V
    if k in (1, 2, 5, 10, 20, 50):
        err = np.abs(V - exact).max()
        print(f"sweep {k:3d} V=[{V[0]:6.3f} {V[1]:6.3f}] max error {err:.3f}  error bound {gamma ** k * np.abs(exact).max():.3f}")
```

The iteration moves toward the exact answer `[7.188, 4.063]` slowly, because `γ = 0.9` removes only 10% of the error bound per sweep. After 50 sweeps the max error is 0.034, and at every printed sweep it stays below `γ^k · max|V*|`, the bound you get from starting at zero. The practical lesson is that convergence slows as `γ` approaches 1.

## Value iteration {#ch01-vi .th}

**Value iteration** turns the Bellman optimality equation into an update. Start from any `V`, then apply the max backup to every state until the values stop changing. Afterwards, read off a greedy policy with a one-step lookahead. It needs a full model, `P` and `R`, so it is planning. It is also the standard baseline for checking tabular learning code.

**Policy iteration** alternates between solving for `V^π` and making `π` greedy with respect to it. It usually takes fewer iterations, each of which costs more. Both converge to the optimal policy on a finite MDP with `γ < 1`.

Here is value iteration by hand on a corridor of five cells. Entering the rightmost cell gives +1 and ends the episode, all other rewards are 0, and the agent can move left or right.

```python run=rl-c01-corridor
gamma = 0.9
V = [0.0] * 5                   # cell 4 is terminal, its value stays 0
for sweep in range(1, 7):
    new = V[:]
    for s in range(4):
        left, right = max(s - 1, 0), s + 1
        reward = 1.0 if right == 4 else 0.0
        new[s] = max(gamma * V[left], reward + gamma * V[right])
    V = new
    print(f"sweep {sweep}: " + " ".join(f"{v:5.3f}" for v in V))
```

Information spreads backward one cell per sweep: the first sweep only sees the reward next to the goal, and the second sees that cell's value. After sweep 4 nothing changes, and each cell's value is `γ` raised to its distance from the last move: 1, 0.9, 0.81, 0.729. That is why long horizons need many sweeps, and why sweeping in a good order helps.

:::key
Value iteration's cost per sweep is `O(|S|² |A|)` in the worst case, and much less when transitions are sparse. This only works when you can enumerate the states. Everything after this section is about what to do when you don't know `P`, or can't enumerate `S`.
:::

The full gridworld, with slippery moves and a policy read off the values, is the first coding exercise at the end of this chapter.

## Monte Carlo and temporal-difference learning {#ch01-mc-td .th}

Without a model, you learn from sampled experience. Two estimators cover most of the ideas.

**Monte Carlo (MC)** waits until the episode ends and moves `V(s)` toward the actual return:

```text
V(s) ← V(s) + α [ G_t - V(s) ]
```

**TD(0)** updates after each step, using its own current estimate of the next state in place of the rest of the return. This use of an estimate to update an estimate is called **bootstrapping**:

```text
V(s) ← V(s) + α [ r + γ V(s') - V(s) ]
```

The bracket in the TD update is the **TD error** `δ`.

| | Monte Carlo | TD(0) |
|---|---|---|
| Target | Actual return `G_t` | `r + γ V(s')` |
| Bias | Unbiased for `V^π` | Biased, because `V(s')` is an estimate |
| Variance | High, sums many random rewards | Low, one random step |
| Needs episode end | Yes | No, works in continuing tasks |
| Markov assumption | Doesn't rely on it | Exploits it |

**n-step returns** and **TD(λ)** interpolate between the two. The classic test is a random walk over five states, where the true values are known: `1/6` through `5/6`. Each setting is averaged over 100 seeds, and each method gets several step sizes so one bad `α` doesn't decide the comparison.

```python run=rl-c01-mc-td
import numpy as np

TRUE = np.arange(1, 6) / 6.0

def run(method, alpha, seed, episodes=100):
    rng = np.random.default_rng(seed)
    V = [0.5] * 7                              # states 1..5 are real, 0 and 6 are terminal
    V[0] = V[6] = 0.0
    errors = {}
    for ep in range(1, episodes + 1):
        s, visited = 3, []
        while s not in (0, 6):
            s2 = s + (1 if rng.random() < 0.5 else -1)
            r = 1.0 if s2 == 6 else 0.0
            if method == "TD":
                V[s] += alpha * (r + V[s2] - V[s])
            visited.append(s)
            s = s2
        if method == "MC":
            for x in visited:                  # gamma = 1, reward only at the end
                V[x] += alpha * (r - V[x])
        if ep in (10, 50, 100):
            errors[ep] = np.sqrt(np.mean((np.array(V[1:6]) - TRUE) ** 2))
    return errors

print("RMS error, mean of 100 seeds")
print("method alpha   ep10   ep50  ep100")
for method, alphas in (("TD", (0.05, 0.1, 0.15)), ("MC", (0.01, 0.02, 0.04))):
    for alpha in alphas:
        runs = [run(method, alpha, s) for s in range(100)]
        row = " ".join(f"{np.mean([e[k] for e in runs]):6.3f}" for k in (10, 50, 100))
        print(f"{method:6} {alpha:5.2f} {row}")
```

TD has the lower error at each checkpoint when you compare each method's best step size: 0.097 against 0.184 at episode 10, 0.050 against 0.100 at episode 50, and 0.036 against 0.085 at episode 100. A constant step size also sets an error floor. TD with `α = 0.15` stays near 0.07 after episode 50, and MC with `α = 0.04` gets slightly worse between episodes 50 and 100. This problem is exactly Markov, which suits TD, so don't take this as a general ranking.

## SARSA and Q-learning {#ch01-sarsa .th}

For control you learn `Q`, and act epsilon-greedily on it: a random action with probability `ε`, otherwise the best-looking one. The two classic updates differ in one term.

```text
SARSA:      Q(s,a) ← Q(s,a) + α [ r + γ Q(s',a')       - Q(s,a) ]     a' is the action actually taken next
Q-learning: Q(s,a) ← Q(s,a) + α [ r + γ max_a' Q(s',a') - Q(s,a) ]
```

**SARSA** is **on-policy**. It learns the value of the policy it actually runs, exploration included. **Q-learning** is **off-policy**. It learns the value of the greedy policy while behaving differently. In a tabular problem, Q-learning converges to `Q*` under standard conditions: every state-action pair is visited infinitely often and step sizes satisfy the Robbins-Monro conditions (`Σα = ∞`, `Σα² < ∞`).

The classic demonstration is **cliff walking**: a 4 by 12 grid with a cliff along the bottom edge between start and goal. Each step costs 1, and stepping off the cliff costs 100 and sends you back to the start. The program runs each algorithm for 500 episodes with a fixed `ε = 0.1`, over 20 seeds.

```python run=rl-c01-cliff
import numpy as np

START, GOAL = (3, 0), (3, 11)
MOVES = [(-1, 0), (0, 1), (1, 0), (0, -1)]

def step(s, a):
    r, c = min(max(s[0] + MOVES[a][0], 0), 3), min(max(s[1] + MOVES[a][1], 0), 11)
    return (START, -100.0) if r == 3 and 0 < c < 11 else ((r, c), -1.0)

def choose(q, eps, rng):
    if rng.random() < eps:
        return int(rng.random() * 4)
    ties = [a for a in range(4) if q[a] == max(q)]
    return ties[int(rng.random() * len(ties))]

def train(method, seed, episodes=500, alpha=0.1, eps=0.1):
    rng = np.random.default_rng(seed)
    Q = {(r, c): [0.0] * 4 for r in range(4) for c in range(12)}
    returns = []
    for _ in range(episodes):
        s, total = START, 0.0
        a = choose(Q[s], eps, rng)
        while s != GOAL:
            s2, r = step(s, a)
            total += r
            a2 = choose(Q[s2], eps, rng)
            bootstrap = 0.0 if s2 == GOAL else Q[s2][a2] if method == "sarsa" else max(Q[s2])
            Q[s][a] += alpha * (r + bootstrap - Q[s][a])    # gamma = 1
            s, a = s2, a2
        returns.append(total)
    return Q, returns

def greedy_return(Q):
    s, total = START, 0.0
    for _ in range(100):
        if s == GOAL:
            break
        s, r = step(s, int(np.argmax(Q[s])))
        total += r
    return total

print("method     online return, last 100 episodes   median greedy return   seeds where greedy never arrives")
for method in ("sarsa", "qlearning"):
    runs = [train(method, seed) for seed in range(20)]
    online = [np.mean(ret[-100:]) for _, ret in runs]
    se = np.std(online, ddof=1) / np.sqrt(len(online))
    greedy = [greedy_return(Q) for Q, _ in runs]                  # a 100-step cap gives exactly -100
    print(f"{method:10} {np.mean(online):8.1f} +- {se:3.1f}                    {np.median(greedy):8.1f}   {sum(g == -100.0 for g in greedy):25d}/20")
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 660 200" role="img" aria-label="Cliff walking map. Start at bottom left, goal at bottom right, cliff between them along the bottom row. The short path runs directly above the cliff and the safe path runs further from it.">
  <rect x="30" y="20" width="600" height="160" rx="4" class="d-box"/>
  <rect x="80" y="140" width="500" height="40" class="d-soft"/><text x="330" y="165" text-anchor="middle" class="t-small t-trap">cliff: reward -100, back to start</text>
  <rect x="30" y="140" width="50" height="40" class="d-acc"/><text x="55" y="165" text-anchor="middle" class="t-mono">S</text>
  <rect x="580" y="140" width="50" height="40" class="d-key"/><text x="605" y="165" text-anchor="middle" class="t-mono">G</text>
  <path d="M55 140 L 55 120 L 605 120 L 605 140" class="d-line-trap"/><text x="330" y="113" text-anchor="middle" class="t-small t-trap">short path, optimal once ε = 0, 13 steps</text>
  <path d="M55 120 L 55 40 L 605 40 L 605 120" class="d-line-acc"/><text x="330" y="33" text-anchor="middle" class="t-small t-acc">safer path, away from the edge</text>
</svg></div><figcaption><b>Cliff walking, drawn as a sketch.</b> Q-learning's greedy policy takes the lower path. SARSA's learned paths stay further from the edge. An exploring agent next to the edge sometimes falls in.</figcaption></figure>

Each method wins on a different measure. During training, with exploration still on, SARSA averages -23.2 per episode and Q-learning averages -48.4. Q-learning walks the edge, and random moves throw it off the cliff, while SARSA's values include that risk and it stays further away. With exploration turned off after training, Q-learning's greedy policy scores -13.0, the optimum, on all 20 seeds. SARSA's median is -15.0, a slightly longer route, and on 2 of the 20 seeds its greedy policy loops and never arrives. SARSA learned values for its exploring policy, so the pure greedy version of it was never the thing it optimised. Q-learning answers "what is the best policy?", and SARSA answers "how should I behave, given that I keep exploring?". If `ε` decays toward zero, SARSA also approaches the optimal policy.

:::trap
"Q-learning is always better because it finds the optimal policy" is the wrong takeaway. If exploration continues in deployment, or if mistakes during training cost real money, the policy that is optimal on paper can earn less.
:::

## DQN: Q-learning with a neural network {#ch01-dqn .th}

A table can't hold a state made of pixels or a long feature vector. **Deep Q-networks** (DQN) replace the table with a network `Q(s, a; θ)`, and train it to reduce the squared TD error. Naive versions are unstable, so DQN adds two main ideas.

- **Experience replay.** Store transitions in a buffer and train on random minibatches. This breaks the correlation between consecutive samples and reuses each transition many times.
- **Target network.** Compute the target `r + γ max_a' Q(s', a'; θ⁻)` with an older copy `θ⁻` of the weights, updated periodically. Without it, every gradient step also moves the target being chased.

```python
# Illustrative: the DQN loss on a minibatch. Needs a deep-learning framework, so it does not run here.
s, a, r, s2, done = replay.sample(batch_size)
with no_grad():
    target = r + gamma * (1 - done) * target_net(s2).max(dim=1)
pred = q_net(s)[range(batch_size), a]
loss = huber(pred, target)
# every C steps: target_net.load_state_dict(q_net.state_dict())
```

The **deadly triad** names the three ingredients that together can make value learning diverge: function approximation, bootstrapping and off-policy data. DQN has all three. Replay and target networks reduce the problem in practice, and give no general guarantee of convergence.

### Maximisation bias and Double DQN {#ch01-double}

The `max` in the target causes systematic overestimation: the max of noisy estimates is, on average, larger than the max of the true values. **Double Q-learning** uses one set of estimates to choose the action and an independent set to evaluate it. **Double DQN** applies that idea using the online network to choose and the target network to evaluate. In this program, all five actions have a true value of 0, and each estimate averages `n` noisy samples.

```python run=rl-c01-maxbias
import numpy as np

rng = np.random.default_rng(0)
print("    n  true max   E[max of estimates]   double estimator")
for n in (1, 4, 16, 64):
    a = rng.normal(0.0, 1.0, (100000, 5, n)).mean(axis=2)     # estimate set A
    b = rng.normal(0.0, 1.0, (100000, 5, n)).mean(axis=2)     # independent set B
    single = a.max(axis=1).mean()
    double = b[np.arange(100000), a.argmax(axis=1)].mean()    # choose with A, evaluate with B
    print(f"{n:5d}  {0.0:8.3f}   {single:19.3f}   {double:16.3f}")
```

The single estimator gives 1.166 with one sample per action, and it halves each time `n` quadruples, reaching 0.146 at `n = 64`. The double estimator stays within 0.002 of the true value throughout. In Q-learning this bias feeds on itself, because each overestimate becomes part of the next target.

## Policy gradients and REINFORCE {#ch01-pg .th}

Value methods get a policy indirectly. **Policy gradient** methods parametrise the policy `π_θ(a|s)` and do gradient ascent on the expected return `J(θ)`. This handles continuous actions naturally, and can represent stochastic policies. The reward and dynamics may be unknown and non-differentiable, so how do we differentiate through them? The **log-derivative trick** removes the need:

```text
∇ E_{x~p_θ}[f(x)] = E_{x~p_θ}[ f(x) ∇ log p_θ(x) ]
```

The probability of a trajectory contains the policy terms and the environment's transition terms. Taking the log turns the product into a sum, and the transitions drop out because they do not depend on `θ`. What remains is the **policy gradient theorem** in sampled form:

```text
∇J(θ) ≈ Σ_t ∇ log π_θ(a_t | s_t) · G_t
```

**REINFORCE** samples an episode, computes the **reward-to-go** `G_t` from each step, and takes this step. Actions followed by high return become more likely. Using reward-to-go in place of the whole episode's return keeps the estimate unbiased and lowers variance, since an action can't affect rewards that came before it.

Its weakness is variance. The estimate comes from one noisy trajectory, and its scale depends on the size of the returns.

### Baselines {#ch01-baseline}

Subtract a function of the state, `b(s)`, from the return:

```text
∇J(θ) ≈ Σ_t ∇ log π_θ(a_t | s_t) · (G_t - b(s_t))
```

The mean doesn't change, because `E_a[∇ log π(a|s)] = Σ_a π ∇π/π = ∇ Σ_a π = ∇1 = 0`. The variance can drop a lot. With a good `b(s)`, usually a learned `V(s)`, the update asks whether this action did better than expected. This program estimates the same gradient from one-step samples with no baseline and with the mean reward as a baseline. The rewards are around 10, so the raw returns are always large and positive.

```python run=rl-c01-baseline
import numpy as np

rng = np.random.default_rng(0)
p = np.array([0.5, 0.5])                # softmax policy over 2 actions, logits at 0
means = np.array([10.0, 11.0])
n = 200000

a = rng.choice(2, size=n, p=p)
r = means[a] + rng.normal(0, 1.0, n)
score = (a == 1).astype(float) - p[1]   # d log pi(a) / d logit_1 for a softmax
exact = p[1] * (1 - p[1]) * (means[1] - means[0])

print(f"exact gradient {exact:.3f}")
for name, b in (("no baseline", 0.0), ("constant 10.5", 10.5), ("constant 100", 100.0)):
    g = score * (r - b)
    print(f"{name:14} mean {g.mean():7.3f}  std of one sample {g.std():7.3f}")
```

The exact gradient is 0.250. A baseline of 10.5 gives a single-sample standard deviation of 0.501, about a tenth of the 5.274 with no baseline, so the same precision needs about a hundredth of the samples. A bad baseline can do harm: a constant of 100 raises the deviation to 44.752. The printed means differ from 0.250 by sampling error, which is the deviation divided by `√200000`, so 0.012 for no baseline and 0.100 for the constant of 100. Both are within two standard errors.

## Actor-critic {#ch01-ac .th}

An **actor-critic** learns two things: an actor `π_θ` and a critic that estimates value. The critic replaces the Monte Carlo return with a bootstrapped estimate, and this trades some bias for much lower variance. The term multiplying `∇ log π` is an estimate of the **advantage**, `A(s, a) = Q(s, a) - V(s)`. The simplest one-step version uses the TD error:

```text
δ_t = r_t + γ V(s_(t+1)) - V(s_t)        critic: move V(s_t) toward the target
θ ← θ + α δ_t ∇ log π_θ(a_t | s_t)       actor: scale the gradient by the advantage estimate
```

**Generalised advantage estimation** (GAE) is the common choice in modern code. It takes an exponentially weighted sum of TD errors, `Â_t = Σ_l (γλ)^l δ_(t+l)`. With `λ = 0` it is the one-step estimate, which has low variance and more bias. With `λ = 1` it is close to the Monte Carlo return minus `V`, which has high variance and less bias.

:::trap
"Actor-critic has a critic, so it's a value method and off-policy." The critic estimates the value of the current policy, and a plain actor-critic is on-policy. Off-policy actor-critic methods such as DDPG, TD3 and SAC exist, and they use replay buffers and a differently trained critic.
:::

## PPO and its clipped objective {#ch01-ppo .th}

Policy gradient steps are fragile. One step that is too large produces a bad policy, the bad policy collects bad data, and the next gradient is computed from that bad data. In supervised learning, the dataset stays the same if you overshoot, but here it doesn't.

**Proximal Policy Optimization** (PPO) lets you take several gradient steps on one batch of data while discouraging the policy from moving far. It uses the **probability ratio** between the new and old policy:

```text
r_t(θ) = π_θ(a_t|s_t) / π_old(a_t|s_t)
L^CPI(θ)  = E[ r_t(θ) · A_t ]                                                unclipped surrogate
L^CLIP(θ) = E[ min( r_t(θ) · A_t,  clip(r_t(θ), 1-ε, 1+ε) · A_t ) ]          PPO, with ε typically 0.1 to 0.3
```

At `θ = θ_old` the ratio is 1, and the gradient of the surrogate equals the policy gradient. As the policy moves, the unclipped surrogate keeps promising more improvement by raising the ratio of positive-advantage actions without limit, although its estimate is valid only near the old policy.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 660 230" role="img" aria-label="Two plots of the per-sample clipped objective against the ratio. For positive advantage it rises to the ratio 1.2 and then stays flat. For negative advantage it stays flat up to ratio 0.8 and then falls.">
  <text x="170" y="18" text-anchor="middle" class="t-small">A = +1</text>
  <path d="M40 190 L 300 190" class="d-line"/><path d="M40 30 L 40 190" class="d-line"/>
  <path d="M40 190 L 196 70 L 300 70" class="d-line-acc"/>
  <path d="M196 70 L 248 30" class="d-line-trap" stroke-dasharray="5 4"/>
  <path d="M170 190 L 170 196" class="d-line"/><text x="170" y="208" text-anchor="middle" class="t-small">1</text>
  <path d="M196 70 L 196 190" class="d-line" stroke-dasharray="3 4"/><text x="200" y="208" text-anchor="middle" class="t-small">1.2</text>
  <text x="252" y="88" text-anchor="middle" class="t-small t-acc">flat: no gradient</text>
  <text x="300" y="224" text-anchor="end" class="t-small">ratio r</text>
  <text x="500" y="18" text-anchor="middle" class="t-small">A = -1</text>
  <path d="M370 40 L 630 40" class="d-line"/><path d="M370 30 L 370 190" class="d-line"/>
  <path d="M370 96 L 474 96 L 630 180" class="d-line-acc"/>
  <path d="M370 40 L 474 96" class="d-line-trap" stroke-dasharray="5 4"/>
  <path d="M474 96 L 474 40" class="d-line" stroke-dasharray="3 4"/><text x="474" y="34" text-anchor="middle" class="t-small">0.8</text>
  <text x="420" y="116" text-anchor="middle" class="t-small t-acc">flat: no gradient</text>
  <text x="630" y="224" text-anchor="end" class="t-small">ratio r</text>
</svg></div><figcaption><b>One sample's clipped objective as a function of the ratio, with ε = 0.2.</b> The solid line is the objective, and the dashed line is the unclipped term where it differs. Moving further in the direction the advantage asks for earns nothing beyond the clip point.</figcaption></figure>

**Why it is stable.** The `min` makes the objective a pessimistic lower bound on the unclipped surrogate. Once a sample's ratio has moved past the clip point in the direction its advantage favours, its gradient becomes zero, so that sample stops pushing the policy further. Moving the wrong way is still penalised in full. A related method, TRPO, enforces a KL constraint with second-order optimisation. PPO gets a similar effect using only first-order gradients and a few lines of code.

```python run=rl-c01-clip
def clipped(ratio, adv, eps=0.2):
    clip = min(max(ratio, 1 - eps), 1 + eps)
    return min(ratio * adv, clip * adv)

print("ratio   adv  unclipped  clipped  gradient?")
for ratio, adv in [(1.0, 2), (1.5, 2), (0.5, 2), (1.5, -2), (0.5, -2), (1.1, -2)]:
    c = clipped(ratio, adv)
    print(f"{ratio:5.2f} {adv:5d} {ratio * adv:10.2f} {c:8.2f}  {'yes' if abs(c - ratio * adv) < 1e-9 else 'no'}")
```

Rows 2 and 5 are the two clipped cases, and their gradient is zero because the clipped term doesn't depend on the ratio. In row 2 a good action has already become 1.5 times as likely, so the sample earns only 2.4. Row 4 shows the other side: a bad action became more likely, and the full penalty of -3.0 applies.

Now the effect on a whole policy. This program collects one batch from a uniform policy over four actions, then runs many gradient steps on the same batch, with and without clipping. It reports the mean over 20 seeds.

```python run=rl-c01-ppo-toy
import numpy as np

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

def train(seed, use_clip, checkpoints, lr=0.5, eps=0.2, n=128):
    rng = np.random.default_rng(seed)
    true_adv = np.array([0.3, 0.1, -0.1, -0.3])
    old = np.full(4, 0.25)
    actions = rng.integers(0, 4, n)
    adv = true_adv[actions] + rng.normal(0, 1.0, n)     # one noisy batch
    adv = (adv - adv.mean()) / adv.std()                # the usual normalisation
    z = np.zeros(4)
    rows = {}
    for epoch in range(1, max(checkpoints) + 1):
        p = softmax(z)
        ratio = p[actions] / old[actions]
        active = np.ones(n, dtype=bool)
        if use_clip:
            active = ratio * adv <= np.clip(ratio, 1 - eps, 1 + eps) * adv
        w = ratio * adv * active                        # d ratio_i / dz = ratio_i * (one_hot(a_i) - p)
        grad = (np.bincount(actions, w, 4) - w.sum() * p) / n
        z = z + lr * grad
        if epoch in checkpoints:
            p = softmax(z)
            rows[epoch] = (float(np.sum(old * np.log(old / p))), float((p / old).max()), float(p[0]),
                           float(p.argmax() != 0), float(1 - active.mean()))
    return rows

checkpoints = (1, 5, 20, 80, 320)
print("mean of 20 seeds")
print("objective  epochs  KL(old,new)  max ratio  p(best)  top action wrong  clipped")
for name, use_clip in (("unclipped", False), ("clipped", True)):
    all_rows = [train(s, use_clip, checkpoints) for s in range(20)]
    for e in checkpoints:
        kl, mr, pb, wrong, cl = np.mean([r[e] for r in all_rows], axis=0)
        print(f"{name:9}  {e:6d}  {kl:11.3f}  {mr:9.2f}  {pb:7.2f}  {wrong:16.2f}  {cl:7.2f}")
```

The unclipped objective keeps moving on the same batch: KL reaches 2.335, the largest ratio reaches 3.83, and the policy puts 0.77 of its probability on the true best action, on average. That average hides a problem. In 20% of the seeds, noise made a wrong action look best, and the policy is moving toward it just as firmly. The clipped objective stops near the clip point, with the largest ratio about 1.21 and KL about 0.019, and the probability on the best action stays near 0.30. Its "top action wrong" column is noisy and means little, since all four probabilities remain close to 0.25. The next batch can still correct course.

So clipping reduced how far one batch moved the policy. In this toy it also learned less per batch. PPO accepts that and collects a fresh batch often.

:::trap
Clipping does not enforce a hard trust region. Ratios can still move beyond `1 ± ε`, because the shared network and other samples' gradients move them, and many steps can drift far. Real implementations often add **early stopping** when the measured KL gets too large, and they watch the clip fraction. Code-level details such as advantage normalisation and learning-rate annealing matter a great deal for PPO's results, too.
:::

A typical PPO loop collects a fixed number of steps from parallel environments, computes GAE, and then runs several epochs of minibatch updates on the combined loss. It finally throws the data away.

```python
# Illustrative: one PPO update. Needs a framework, so it does not run here.
for epoch in range(K):
    for batch in minibatches(rollout):
        ratio = exp(policy.log_prob(batch.s, batch.a) - batch.old_log_prob)   # old_log_prob is stored at collection time
        surrogate = min(ratio * batch.adv, clip(ratio, 1 - eps, 1 + eps) * batch.adv).mean()
        value_loss = ((value(batch.s) - batch.ret) ** 2).mean()
        loss = -surrogate + c1 * value_loss - c2 * policy.entropy(batch.s).mean()
        loss.backward(); clip_grad_norm(); optimizer.step()
```

## On-policy and off-policy {#ch01-onoff .th}

The **behaviour policy** collects the data, and the **target policy** is the one being evaluated or improved. On-policy methods use the same policy for both. Off-policy methods allow them to differ.

| | On-policy | Off-policy |
|---|---|---|
| Examples | SARSA, REINFORCE, A2C, PPO | Q-learning, DQN, DDPG, SAC |
| Data reuse | Recent data only, thrown away after an update (PPO reuses a batch for a few epochs) | Replay buffer, reused many times |
| Sample efficiency | Usually lower | Usually higher |
| Stability | Usually easier to tune | Can be brittle, deadly triad |
| When it suits | Cheap fast simulator, parallel rollouts | Costly samples, learning from logged data |

Pick by the cost of samples. If a simulator gives millions of cheap steps, PPO's simplicity often wins. If each sample comes from a real robot, reusing data matters more. Chapter 2 picks up the extreme case, learning entirely from a fixed log.

## Drills {#ch01-drills .dr}

:::drill output
Rewards over an episode are `[1, 0, 0, 10]` and `γ = 0.9`. Compute `G_0`, `G_1` and `G_3` by hand.

```python run=rl-c01-d-return
rewards, gamma = [1, 0, 0, 10], 0.9
g, out = 0.0, []
for r in reversed(rewards):
    g = r + gamma * g
    out.append(g)
print([f"G{len(rewards) - 1 - i}={v:.2f}" for i, v in enumerate(out)][::-1])
```
---
**Answer.** `G_3 = 10`, `G_2 = 9`, `G_1 = 8.1`, and `G_0 = 1 + 0.9 × 8.1 = 8.29`.

**Why.** Compute backward with `G_t = r + γ G_(t+1)`. That is `O(T)` for all steps, while summing each one separately is `O(T²)`.
:::

:::drill output
`Q(s,a) = 2`, `r = 1`, `γ = 0.9`, `α = 0.1`. In `s'`, `Q` is `[3, 5]` and the next action actually taken is action 0. Compute the updated `Q(s,a)` for Q-learning and for SARSA.

```python run=rl-c01-d-update
q, r, gamma, alpha, next_q, a2 = 2.0, 1.0, 0.9, 0.1, [3.0, 5.0], 0
for name, target in (("qlearning", r + gamma * max(next_q)), ("sarsa", r + gamma * next_q[a2])):
    print(f"{name:10} target={target:.2f} new Q={q + alpha * (target - q):.2f}")
```
---
**Answer.** Q-learning's target is `1 + 0.9 × 5 = 5.5`, so `Q = 2 + 0.1 × 3.5 = 2.35`. SARSA's target is `1 + 0.9 × 3 = 3.7`, so `Q = 2 + 0.1 × 1.7 = 2.17`.

**Why.** The two differ only when the next action taken isn't the greedy one. If `ε = 0` and ties break the same way, their updates are nearly the same.
:::

:::drill tricky
Q-learning is off-policy. Why does it need no importance-sampling correction?
---
**Answer.** The one-step target doesn't depend on which next action the behaviour policy takes, since it uses `max_a' Q(s', a')`. The current `(s, a)` is given, so the only randomness is in `s'` and `r`, which come from the environment.

**Why.** The behaviour policy only decides how often each `(s, a)` is visited, and this affects the weighting and speed, and with function approximation can affect the fixed point. n-step Q-learning does have the issue, since the intermediate actions came from the behaviour policy.
:::

:::drill tricky
You add a constant `+2` to every reward in an episodic task where the original reward is `-1` per step until the goal. Does the optimal policy change? Then consider a scale factor of 10.

```python run=rl-c01-d-shift
def solve(step_reward, gamma=0.9, n=4):
    V = [0.0] * (n + 1)                       # cell n is the goal, terminal
    for _ in range(200):
        for s in range(n):
            go = step_reward + gamma * V[s + 1]
            stay = step_reward + gamma * V[s]
            V[s] = max(go, stay)
    return ["go" if V[s + 1] > V[s] else "stay" for s in range(n)]      # ties count as stay

for reward in (-1.0, 1.0, -10.0):
    print(f"step reward {reward:5.1f}: {solve(reward)}")
```
---
**Answer.** Yes, adding a constant changes it. With `+1` per step, staying forever beats reaching the goal, since the goal ends the reward stream. Scaling by a positive constant leaves the optimal policy the same.

**Why.** In a continuing task with `γ < 1`, adding a constant only shifts every value by `c / (1 - γ)`, and the policy is unchanged. Termination breaks this, because a shift changes the value of ending. Chapter 3 returns to this under episode termination.
:::

:::drill bug
All `Q` values start at 5 to encourage exploration. The update below runs on the last step of an episode, and `Q(s)` settles at a value far above the true 1. Find the bug.

```python run=rl-c01-d-terminal
gamma, alpha = 0.9, 0.5
Q = {"s": 5.0, "goal": 5.0}                     # optimistic start for every state
for _ in range(100):                            # transition s -> goal, reward 1, episode ends
    target = 1.0 + gamma * Q["goal"]
    Q["s"] += alpha * (target - Q["s"])
print(f"Q(s) = {Q['s']:.2f}, true value 1.00")
```
---
**Answer.** It bootstraps through a terminal state. The target should be `r + γ (1 - done) max Q(s')`, which gives 1 here.

**Why.** `goal` is never updated, since no action is taken from it, so its initial 5 stays. The target is stuck at `1 + 0.9 × 5 = 5.5`, and that error then spreads to earlier states. A follow-up is a time-limit cutoff: that isn't a real terminal state, and you should bootstrap there (Chapter 3).
:::

:::drill output
Batch data with `γ = 1`: one episode `A, 0, B, 0`, six episodes `B, 1`, and one episode `B, 0`. What are `V(A)` and `V(B)` under batch Monte Carlo and under batch TD?

```python run=rl-c01-d-ab
episodes = [[("A", 0), ("B", 0)]] + [[("B", 1)]] * 6 + [[("B", 0)]]
returns = {"A": [], "B": []}
for ep in episodes:
    for i, (s, _) in enumerate(ep):
        returns[s].append(sum(r for _, r in ep[i:]))
print("MC", {s: round(sum(v) / len(v), 3) for s, v in returns.items()})

V = {"A": 0.0, "B": 0.0, None: 0.0}
for _ in range(20000):
    for ep in episodes:
        for i, (s, r) in enumerate(ep):
            nxt = ep[i + 1][0] if i + 1 < len(ep) else None
            V[s] += 0.001 * (r + V[nxt] - V[s])
print("TD", {s: round(V[s], 2) for s in "AB"})
```
---
**Answer.** Both give `V(B) = 0.75`. MC gives `V(A) = 0`, the one return seen from `A`. TD gives `V(A) = 0.75`, because `A` always goes to `B`.

**Why.** Batch MC minimises squared error on the observed returns. Batch TD converges to the value of the maximum-likelihood Markov model of the data, called the **certainty-equivalence** estimate. If the process really is Markov, TD's answer tends to predict better.
:::

:::drill concept
Name the three parts of the deadly triad, and say how DQN handles them.
---
**Answer.** Function approximation, bootstrapping and off-policy learning. DQN has all three, and it adds replay and a target network to reduce instability, with no convergence guarantee.

**Why.** Each pair is usually manageable. Dropping any one removes the classic divergence: tabular values, Monte Carlo targets, or on-policy data with linear function approximation.
:::

:::drill tricky
Prove a state-dependent baseline adds no bias. Does an action-dependent one?
---
**Answer.** `E_a[∇ log π(a|s) b(s)] = b(s) Σ_a π(a|s) ∇π(a|s) / π(a|s) = b(s) ∇ Σ_a π(a|s) = b(s) ∇1 = 0`.

**Why.** The proof pulls `b(s)` outside the sum over actions. If `b` depends on `a`, it can't move outside, and the term is generally nonzero, so you need a correction term. A constant baseline is a special case of the state-dependent form.
:::

:::drill bug
This REINFORCE update makes the policy worse over time. Find the bug.

```python
for t, (s, a) in enumerate(trajectory):
    g = sum(rewards[t:])
    grad = one_hot(a) - softmax(theta[s])     # gradient of log pi(a|s) for a tabular softmax
    theta[s] -= lr * g * grad
```
---
**Answer.** The sign is wrong. This is gradient descent on the return. It should be `theta[s] += lr * g * grad`.

**Why.** Frameworks minimise, so the loss is written `-log_prob * G`, then the optimiser subtracts the gradient of the loss. People who translate that into manual code often keep the minus sign and drop the one in the loss. Check with a test on a two-armed problem, where a learning run must favour the better arm. Discounting is omitted here too, which is common in practice.
:::

:::drill output
With `ε = 0.2`, evaluate the per-sample clipped objective for `(r, A)` equal to `(1.5, 2)`, `(1.5, -2)`, `(0.5, 2)` and `(0.5, -2)`.
---
**Answer.** `2.4`, `-3.0`, `1.0` and `-1.6`. The run in the PPO section prints the same values.

**Why.** Compute `min(rA, clip(r)A)`. Cases 1 and 4 are clipped, because they moved in the direction the advantage favours and past the clip point, so their gradient is zero. Cases 2 and 3 moved in the wrong direction, so the objective keeps the full penalty and the gradient pulls them back.
:::

:::drill bug
A student's PPO recomputes `old_log_prob` from the current network at the start of each minibatch. The clip fraction stays near zero, and the policy drifts far from the policy that collected the data. Why?
---
**Answer.** `old_log_prob` must be the log probability under the policy that collected the data, stored at collection time. Recomputing it resets the ratio to about 1 every minibatch, so the clip never activates relative to the data-collecting policy.

**Why.** The ratio measures total movement since collection. With the bug, it measures movement in the last step only, so many small steps can add up to an unlimited change.
:::

:::drill tricky
Is `γ = 1` safe in value iteration?
---
**Answer.** It is safe only when every policy, or at least every policy under consideration, reaches a terminal state with probability 1 (a proper stochastic shortest-path problem). Otherwise values can grow without limit.

**Why.** The contraction argument needs `γ < 1`. With `γ = 1` and a positive reward loop, the backup keeps adding to the values, and the max error doesn't shrink.
:::

:::drill concept
When would you pick PPO over DQN, and DQN over PPO?
---
**Answer.** PPO when samples are cheap, actions may be continuous, and you value stable tuning. DQN or another off-policy method when actions are discrete, samples are costly, and reusing logged data matters.

**Why.** PPO throws data away after a few epochs, so it uses more samples. Plain DQN can't handle continuous actions because of the `max`. A good answer states the constraint first and then names the method.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1300
Write value iteration for a 3 by 4 gridworld. There is a wall at `(1,1)`, a goal at `(0,3)` with reward +1, and a pit at `(1,3)` with reward -1. Both end the episode. Each other step costs `0.04`. A move goes the intended way with probability 0.8, and slips to each perpendicular direction with probability 0.1. Hitting a wall means staying in place. Use `γ = 0.9`, and print the values and the greedy policy.
---
Precompute the transitions as lists, then back up until the largest change falls below a threshold.

```python run=rl-c01-c-vi
WALL, GOAL, PIT = (1, 1), (0, 3), (1, 3)
MOVES = {"^": (-1, 0), ">": (0, 1), "v": (1, 0), "<": (0, -1)}
SIDE = {"^": "<>", "v": "<>", "<": "^v", ">": "^v"}
STATES = [(r, c) for r in range(3) for c in range(4) if (r, c) != WALL]

def move(s, a):
    t = (s[0] + MOVES[a][0], s[1] + MOVES[a][1])
    return s if t == WALL or not (0 <= t[0] < 3 and 0 <= t[1] < 4) else t

def reward(t):
    return 1.0 if t == GOAL else -1.0 if t == PIT else -0.04

def outcomes(s, a):
    return [(0.8, move(s, a)), (0.1, move(s, SIDE[a][0])), (0.1, move(s, SIDE[a][1]))]

def backup(V, s, a, gamma=0.9):
    return sum(p * (reward(t) + gamma * V[t]) for p, t in outcomes(s, a))

V = {s: 0.0 for s in STATES}
for sweep in range(1, 1000):
    new = {s: 0.0 if s in (GOAL, PIT) else max(backup(V, s, a) for a in MOVES) for s in STATES}
    delta = max(abs(new[s] - V[s]) for s in STATES)
    V = new
    if delta < 1e-6:
        break
print("sweeps", sweep)
for r in range(3):
    print(" ".join("  wall" if (r, c) == WALL else f"{V[(r, c)]:6.3f}" for c in range(4)))
for r in range(3):
    print(" ".join("#" if (r, c) == WALL else "G" if (r, c) == GOAL else "P" if (r, c) == PIT
                   else max(MOVES, key=lambda a: backup(V, (r, c), a)) for c in range(4)))
```

Twenty-one sweeps reach the threshold. The policy reads well: in `(2,3)`, next to the pit, it moves left and takes the long way around, since going up risks the pit.

Separate `outcomes` from `backup`, since follow-ups usually change the slip probability or the step cost. Try a higher step cost, and see what happens to the policy near the pit.
:::

:::drill code rating=1400
Write tabular Q-learning for the same gridworld, learning only from sampled transitions. Check the learned policy and values against value iteration, over 5 seeds.
---
Keep the environment behind a `step` that samples, so the learner can't see the probabilities. Decaying the step size per state-action pair matches the convergence conditions.

```python run=rl-c01-c-q
import numpy as np

WALL, GOAL, PIT = (1, 1), (0, 3), (1, 3)
MOVES = [(-1, 0), (0, 1), (1, 0), (0, -1)]
STATES = [(r, c) for r in range(3) for c in range(4) if (r, c) != WALL]
FREE = [s for s in STATES if s not in (GOAL, PIT)]

def move(s, a):
    t = (s[0] + MOVES[a][0], s[1] + MOVES[a][1])
    return s if t == WALL or not (0 <= t[0] < 3 and 0 <= t[1] < 4) else t

def reward(t):
    return 1.0 if t == GOAL else -1.0 if t == PIT else -0.04

def outcomes(s, a):
    return [(0.8, move(s, a)), (0.1, move(s, (a + 3) % 4)), (0.1, move(s, (a + 1) % 4))]

def value_iteration(gamma=0.9):
    Q = {s: [0.0] * 4 for s in STATES}
    for _ in range(300):
        V = {s: max(Q[s]) for s in STATES}
        for s in FREE:
            Q[s] = [sum(p * (reward(t) + gamma * V[t]) for p, t in outcomes(s, a)) for a in range(4)]
    return Q

def q_learning(seed, episodes=4000, gamma=0.9, eps=0.2):
    rng = np.random.default_rng(seed)
    Q = {s: [0.0] * 4 for s in STATES}
    visits = {s: [0] * 4 for s in STATES}
    for _ in range(episodes):
        s = FREE[int(rng.random() * len(FREE))]        # random starts help coverage
        for _ in range(100):
            a = int(rng.random() * 4) if rng.random() < eps else int(np.argmax(Q[s]))
            u, out = rng.random(), outcomes(s, a)      # the learner only uses the sample
            s2 = out[0][1] if u < 0.8 else out[1][1] if u < 0.9 else out[2][1]
            done = s2 in (GOAL, PIT)
            visits[s][a] += 1
            target = reward(s2) + (0.0 if done else gamma * max(Q[s2]))
            Q[s][a] += (target - Q[s][a]) / visits[s][a] ** 0.7
            s = s2
            if done:
                break
    return Q

star = value_iteration()
print("seed  max|V - V*|  states with the optimal action")
for seed in range(5):
    Q = q_learning(seed)
    err = max(abs(max(Q[s]) - max(star[s])) for s in FREE)
    match = sum(int(np.argmax(Q[s])) == int(np.argmax(star[s])) for s in FREE)
    print(f"{seed:4d}  {err:11.3f}  {match}/{len(FREE)}")
```

On all 5 seeds, the learned greedy action matches value iteration in all 9 states, and the largest value error is between 0.018 and 0.058. The check against value iteration is the point: a tabular problem with a known answer catches bugs that a learning curve hides. Random start states and `ε = 0.2` give good coverage, and the `1 / n^0.7` step size meets the Robbins-Monro conditions.
:::

:::drill code rating=1500
Write REINFORCE with a tabular softmax policy on a corridor of 5 cells. The agent starts at cell 0, moves left or right, gets `-1` per step, and the episode ends at cell 4 or after 30 steps. Compare no baseline with a learned per-state baseline, over 20 seeds. Then add a bonus of 30 for reaching the goal, which makes most returns large and positive, and repeat.
---
For a two-action softmax, the score for a state's logits is `(a - p1)` on logit 1 and its negative on logit 0. Episode length is the measure, since the bonus changes the return's scale, and the best possible length is 4.

```python run=rl-c01-c-reinforce
import math
import numpy as np

N, MAX_STEPS = 5, 30

def train(seed, use_baseline, bonus, episodes=400, lr=0.02, lr_v=0.1):
    rng = np.random.default_rng(seed)
    theta = [0.0] * N            # logit of "go right" minus logit of "go left", per state
    V = [0.0] * N
    lengths = []
    for _ in range(episodes):
        s, traj = 0, []
        for _ in range(MAX_STEPS):
            p = 1.0 / (1.0 + math.exp(-theta[s]))
            a = 1 if rng.random() < p else 0
            traj.append((s, a, p))
            s = s + 1 if a else max(s - 1, 0)
            if s == N - 1:
                break
        T = len(traj)
        final = bonus if s == N - 1 else 0.0
        for t, (s, a, p) in enumerate(traj):
            g = final - (T - t)  # reward-to-go: -1 per remaining step, plus any bonus
            b = V[s] if use_baseline else 0.0
            theta[s] += lr * (g - b) * (a - p)
            if use_baseline:
                V[s] += lr_v * (g - V[s])
        lengths.append(T)
    return lengths

print("mean episode length, mean of 20 seeds (std across seeds in brackets)")
print("bonus  episodes  no baseline      baseline")
for bonus in (0, 30):
    results = {b: np.array([train(s, b, bonus) for s in range(20)], dtype=float) for b in (False, True)}
    for lo, hi in [(0, 50), (50, 100), (100, 200), (200, 400)]:
        cells = [results[b][:, lo:hi].mean(axis=1) for b in (False, True)]
        print(f"{bonus:5d}  {lo:3d}-{hi:3d}   " + "   ".join(f"{c.mean():6.2f} ({c.std(ddof=1):4.2f})" for c in cells))
```

With the plain `-1` reward, the baseline makes no clear difference in this run. Mean length falls from about 8.6 to about 4.5 for both, against a best of 4, and the mean stays above 4 because the policy is still a little random. With the bonus, the means stay close but the spread across seeds differs: over episodes 200 to 400, the standard deviation is 0.48 without a baseline and 0.05 with one. So in this small problem the baseline made results more consistent when returns had a large positive offset, and it did not speed up the average. Expect a larger effect on harder problems with higher-dimensional policies, and test it there.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- MDP: `S, A, P, R, γ`. Markov: the state summarises history. Effective horizon: `1 / (1 - γ)`.
- `V^π`: value of a state. `Q^π`: value of a state and action. `V^π(s) = Σ_a π(a|s) Q^π(s,a)`.
- Bellman expectation: linear, solve exactly or iterate. Optimality: has a `max`, so iterate. The backup is a `γ`-contraction.
- Value iteration needs the model. Policy iteration uses fewer, more costly iterations.
- MC: real return, unbiased, high variance, needs episode end. TD: bootstrap, biased, lower variance.
- SARSA: on-policy, uses the action taken. Q-learning: off-policy, uses the max. Cliff: SARSA takes the safer path during training, and Q-learning learns the shortest.
- DQN: replay, target network. Deadly triad: function approximation, bootstrapping, off-policy. `max` overestimates, and Double DQN splits choosing from evaluating.
- Policy gradient: `∇J = E[∇ log π · G]`. A state-dependent baseline adds no bias and can cut variance.
- Actor-critic: critic gives the advantage. GAE `λ` trades bias for variance.
- PPO: `min(rA, clip(r, 1-ε, 1+ε)A)`, several epochs per batch, a pessimistic bound. It removes the incentive to move far on a sample, and does not enforce a hard limit. Store `old_log_prob` at collection.
- On-policy: fresh data, usually stable, more samples. Off-policy: replay, sample-efficient, more brittle.
