---
name: RL & bandits
short: RL
icon: RL
version: Toy agents and environments in Python 3.12 and NumPy
eyebrow: MDPs · Q-learning · policy gradients · PPO · bandits · offline RL · environment design
headline: Learning from <em>rewards</em>, and what goes wrong when you do.
lede: Three chapters for students who know basic ML and want to explain reinforcement learning in an interview and survive the follow-ups. You build value iteration, Q-learning, REINFORCE, a bandit comparison, an importance-sampling estimator and an environment with a reward-hacking bug, using only NumPy. Every output shown comes from running that code, and comparisons between algorithms are averaged over several seeds.
card: MDPs and Bellman equations, Q-learning and SARSA, DQN ideas, REINFORCE, actor-critic and PPO's clipped objective, bandits and regret, offline RL and off-policy evaluation, environment design, reward hacking and verifiers for LLM-agent training.
cta: Start with MDPs|#ch01; Bandits and offline RL|#ch02; Designing environments|#ch03
search: Search: Bellman, SARSA, baseline, clipped objective, regret, Thompson, importance sampling, reward hacking…
---

:::hero A greedy agent gets stuck
```python run=rl-home-hero
import numpy as np

def run(eps, seed, steps=500):
    rng = np.random.default_rng(seed)
    means = [0.5, 0.6]                   # arm 1 is better, the agent doesn't know
    counts, totals = [1, 1], [float(rng.random() < m) for m in means]   # pull each arm once
    for _ in range(steps):
        est = [t / c for t, c in zip(totals, counts)]
        a = int(rng.integers(2)) if rng.random() < eps else int(est[1] > est[0])
        counts[a] += 1
        totals[a] += float(rng.random() < means[a])
    return counts[1] / sum(counts)

for eps in (0.0, 0.1):
    shares = [run(eps, s) for s in range(200)]
    print(f"eps={eps:.1f}  mean share of pulls on the better arm: {np.mean(shares):.2f}")
```

The greedy agent commits to whichever arm looked better early and often stays there, so it spends only about half its pulls on the better arm across 200 seeds. Adding 10% random actions raises that to 0.75. Choosing how much to explore is the subject of Chapter 2, and every method in this guide has to deal with it.
:::

## What this guide covers

Reinforcement learning (RL) trains a decision maker from the consequences of its own actions. Supervised learning gets a correct label for each input. An RL agent gets a number that says how well things went, often much later, and the data it sees depends on what it chose to do. Most interview questions in this area come from those two facts.

| Chapter | Topic | You build |
|---|---|---|
| [1](#ch01) | MDPs, Q-learning and policy gradients | Gridworld value iteration, tabular Q-learning checked against it, REINFORCE with and without a baseline |
| [2](#ch02) | Bandits and offline RL | Epsilon-greedy, UCB and Thompson sampling with cumulative regret, a traffic router, importance-sampling estimators |
| [3](#ch03) | Designing RL environments | An environment with a reward-hacking bug and its fix, a hardened LLM answer grader, a seed-replay determinism test |

## How to use the drills

Answer each drill out loud before opening it, and give the reason as well as the answer. For the numerical ones, work on paper first and then compare with the recorded output. Follow-ups in these interviews usually change one assumption: "what if the episode is cut off by a time limit?", "what if the logged policy never tried that action?", "what if the grader can be fooled?". After a drill, change one assumption yourself and say what happens. Press <kbd>/</kbd> to search, and use the contents list to move around a chapter.

## Suggested plan

| Sessions | Read | Drill |
|---|---|---|
| 1 | Ch 1, MDPs through value iteration | Derive the Bellman backup on paper for the corridor, then write the gridworld without looking |
| 2 | Ch 1, Monte Carlo through DQN | Write tabular Q-learning, then explain why SARSA and Q-learning differ on the cliff |
| 3 | Ch 1, policy gradients and PPO | Derive the log-derivative trick, then evaluate the clipped objective by hand for all sign cases |
| 4 | Ch 2, bandits | Write all three bandit algorithms and read the regret table |
| 5 | Ch 2, offline RL and evaluation | Compute an importance-sampling estimate by hand, then explain why it fails with poor overlap |
| 6 | Ch 3, reward and termination | Find the reward-hacking bug before opening the fix |
| 7 | Ch 3, verifiers and evaluation | Attack the grader with your own bad answers, then do the remaining drills |

## What is real and what is illustrative

Every block with an output below it was executed when the site was built, and the output is the real one. The agents are small and tabular, or nearly so, because the build has NumPy and no deep-learning framework or simulator. Numbers such as "regret 62.3" describe these toy problems with the stated settings and seeds. They do not predict results on any other problem.

DQN, PPO and LLM post-training loops need a framework, a GPU or a model, so they appear as plain code blocks labelled **illustrative**, with no output. The concepts they show carry over to real systems, but real training code has many more details.
