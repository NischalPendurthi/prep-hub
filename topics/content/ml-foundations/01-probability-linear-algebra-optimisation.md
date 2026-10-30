---
title: Probability, linear algebra and optimisation
part: Part A · The maths
lede: Most ML interview questions reduce to three toolkits. Probability says what a model's numbers mean and how much to trust them. Linear algebra says what happens to data when you transform it. Optimisation says how a model actually finds its weights. This chapter covers the parts that come up again and again, with a small program for each claim.
desc: Bayes, distributions, expectation, MLE and MAP, CLT, hypothesis tests, eigenvalues, SVD, PCA, gradients, convexity, GD, SGD, Adam, learning rate
hours: 7
prereqs: Basic calculus and matrix multiplication, some Python
---

## Bayes' rule and base rates {#ch01-bayes .th}

Bayes' rule turns a probability you can measure, `P(evidence | hypothesis)`, into the one you want, `P(hypothesis | evidence)`:

```text
P(H | E) = P(E | H) * P(H) / P(E)
P(E)     = P(E | H) * P(H) + P(E | not H) * P(not H)
```

`P(H)` is the **prior**, `P(E | H)` the **likelihood**, and `P(H | E)` the **posterior**. The classic interview question: a disease affects 1% of people, the test catches 99% of cases (sensitivity), and it correctly clears 95% of healthy people (specificity). You test positive. How likely is it that you are sick?

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 600 265" role="img" aria-label="Tree splitting 10,000 people into 100 sick and 9,900 healthy, then into test results: 99 sick positives and 495 healthy positives.">
  <rect x="10" y="90" width="120" height="50" rx="5" class="d-box"/><text x="70.0" y="111" text-anchor="middle" class="t-mono">10,000</text><text x="70.0" y="127" text-anchor="middle" class="t-mono">people</text><rect x="220" y="30" width="130" height="50" rx="5" class="d-soft"/><text x="285.0" y="51" text-anchor="middle" class="t-mono">100 sick</text><text x="285.0" y="67" text-anchor="middle" class="t-mono">1%</text><rect x="220" y="150" width="130" height="50" rx="5" class="d-soft"/><text x="285.0" y="171" text-anchor="middle" class="t-mono">9,900 healthy</text><text x="285.0" y="187" text-anchor="middle" class="t-mono">99%</text><rect x="440" y="6" width="120" height="40" rx="5" class="d-key"/><text x="500.0" y="30" text-anchor="middle" class="t-mono">99 positive</text><rect x="440" y="60" width="120" height="40" rx="5" class="d-box"/><text x="500.0" y="84" text-anchor="middle" class="t-mono">1 negative</text><rect x="440" y="130" width="120" height="40" rx="5" class="d-trap"/><text x="500.0" y="154" text-anchor="middle" class="t-mono">495 positive</text><rect x="440" y="184" width="120" height="40" rx="5" class="d-box"/><text x="500.0" y="208" text-anchor="middle" class="t-mono">9,405 negative</text><path d="M130.0 105.0 L 220.0 55.0" class="d-line"/><path d="M130.0 125.0 L 220.0 175.0" class="d-line"/><path d="M350.0 50.0 L 440.0 26.0" class="d-line"/><path d="M350.0 60.0 L 440.0 80.0" class="d-line"/><path d="M350.0 170.0 L 440.0 150.0" class="d-line"/><path d="M350.0 180.0 L 440.0 204.0" class="d-line"/>
  <text x="10" y="252" class="t-mono">P(sick | positive) = 99 / (99 + 495) = 99 / 594 = 16.7%</text>
</svg></div><figcaption><b>Count people to apply Bayes.</b> The healthy group is so large that its 5% false positive rate produces five times as many positives as the sick group does.</figcaption></figure>

Counting people is the easiest way to answer, and the figure does that for 10,000 people. The program below checks the same calculation and simulates it.

```python run=mf-c01-bayes
import numpy as np

prior, sens, spec = 0.01, 0.99, 0.95

def update(prior):
    p_pos = sens * prior + (1 - spec) * (1 - prior)
    return sens * prior / p_pos

first = update(prior)
print(f"P(sick | one positive)  = {first:.4f}")
print(f"P(sick | two positives) = {update(first):.4f}  (tests independent given status)")

rng = np.random.default_rng(1)
n = 1_000_000
sick = rng.random(n) < prior
positive = np.where(sick, rng.random(n) < sens, rng.random(n) < 1 - spec)
print(f"simulated, one positive = {sick[positive].mean():.3f}")
```

The answer is about 17%. Most positives come from the large healthy group, even though each healthy person rarely tests positive. A second independent positive lifts it to about 80%, since yesterday's posterior becomes today's prior. The same effect is why a fraud or defect detector with a good-looking false positive rate can still produce mostly false alarms.

:::trap The second test must be independent
Multiplying evidence like this assumes the tests are **conditionally independent given the status**. Rerunning the same test on the same sample usually repeats the same error, so it adds much less information than the formula suggests. Naive Bayes in Chapter 2 makes this assumption for every feature, and it overcounts correlated evidence in the same way.
:::

## Distributions you should recognise {#ch01-dist .th}

You need to know what each distribution models, its mean and variance, and how to spot it in a word problem.

| Distribution | Models | Mean | Variance |
|---|---|---|---|
| Bernoulli(p) | One yes or no trial | p | p(1-p) |
| Binomial(n, p) | Number of successes in n independent trials | np | np(1-p) |
| Geometric(p) | Trials until the first success | 1/p | (1-p)/p² |
| Poisson(λ) | Count of rare events in a fixed window | λ | λ |
| Uniform(a, b) | Any value in a range equally likely | (a+b)/2 | (b-a)²/12 |
| Normal(μ, σ²) | Sums of many small effects | μ | σ² |
| Exponential(rate r) | Waiting time between Poisson events | 1/r | 1/r² |

Two facts come up in follow-ups. The Poisson's variance equals its mean, so count data with variance much larger than the mean ("overdispersed") needs a different model. And the exponential distribution is **memoryless**: having waited ten minutes does not change the distribution of the remaining wait.

## Expectation, variance and covariance {#ch01-expect .th}

Expectation is **linear**: `E[X + Y] = E[X] + E[Y]`, and this holds even when `X` and `Y` depend on each other. Variance needs more care: `Var(X + Y) = Var(X) + Var(Y) + 2 Cov(X, Y)`. Scaling squares: `Var(aX) = a² Var(X)`. Linearity solves many puzzle questions: write the count as a sum of indicator variables, and take the expectation of each one.

```python run=mf-c01-expect
import numpy as np

rng = np.random.default_rng(3)
n = 300_000

# Expected number of fixed points of a random permutation of 10 items.
# Each position is fixed with probability 1/10, so the sum of indicators has mean 1.
fixed = [int(np.sum(rng.permutation(10) == np.arange(10))) for _ in range(30_000)]
print(f"fixed points of a random permutation: {np.mean(fixed):.2f}")

# Var(X + Y) needs the covariance when X and Y are correlated.
x = rng.normal(size=n)
y = 0.8 * x + 0.6 * rng.normal(size=n)
print(f"Var(X)+Var(Y)={x.var() + y.var():.2f}  Var(X+Y)={(x + y).var():.2f}  2Cov={2 * np.cov(x, y)[0, 1]:.2f}")

# Zero covariance does not mean independent: Y is a function of X.
y2 = x**2
print(f"Cov(X, X^2)={np.cov(x, y2)[0, 1]:.2f}")
print(f"E[X^2]={y2.mean():.2f}  E[X^2 given |X|>1]={y2[np.abs(x) > 1].mean():.2f}")
```

Covariance only measures linear association. `X` and `X²` have covariance near zero when `X` is symmetric around zero, yet knowing `X` fixes `X²` exactly. Independence implies zero covariance, and the reverse does not hold in general.

## MLE and MAP {#ch01-mle .th}

**Maximum likelihood (MLE)** picks the parameters that make the observed data most probable: `argmax P(data | θ)`. **Maximum a posteriori (MAP)** also uses a prior: `argmax P(data | θ) P(θ)`. Both give one point estimate. A fully Bayesian treatment keeps the whole posterior distribution instead.

For a coin with `k` heads in `n` tosses, the MLE is `k/n`. With a `Beta(a, b)` prior, the MAP is `(k + a - 1) / (n + a + b - 2)`, which behaves as if you had seen some extra tosses.

```python run=mf-c01-mle
import numpy as np

grid = np.arange(1, 1000) / 1000  # candidate values of p

def best(k, n, a=1, b=1):
    log_post = k * np.log(grid) + (n - k) * np.log(1 - grid)
    log_post += (a - 1) * np.log(grid) + (b - 1) * np.log(1 - grid)
    return grid[np.argmax(log_post)]

print("   k    n   MLE  MAP Beta(3,3)  formula")
for k, n in [(7, 10), (70, 100), (700, 1000)]:
    print(f"{k:4} {n:4} {best(k, n):5.3f} {best(k, n, 3, 3):11.3f} {(k + 2) / (n + 4):8.3f}")
```

A numeric grid search agrees with the formula. The prior pulls the 7-of-10 estimate towards 0.5, and its effect fades as data grows. This is why MAP matters most with little data.

The connection to loss functions is what interviewers usually want. Taking the negative log of the likelihood or posterior turns a product into a sum, and common losses appear:

| Assumption | Negative log gives |
|---|---|
| Gaussian noise around the prediction | Mean squared error |
| Laplace noise around the prediction | Mean absolute error |
| Bernoulli label with predicted probability | Binary cross-entropy |
| Categorical label | Softmax cross-entropy |
| Gaussian prior on the weights (MAP) | L2 penalty |
| Laplace prior on the weights (MAP) | L1 penalty |

For Gaussian noise the derivation fits on one line: `-log P(y | x, w) = (y - xᵀw)² / (2σ²) + constant`, so maximising the likelihood over `w` is the same as minimising the sum of squares.

MLE is not always unbiased. The MLE of a Gaussian's variance divides by `n`, and its expected value is `σ²(n-1)/n`. Dividing by `n - 1` (Bessel's correction) removes the bias, because the sample mean is itself fitted to the same data.

```python run=mf-c01-mle-var
import numpy as np

rng = np.random.default_rng(5)
x = rng.normal(0, 2, size=(400_000, 5))     # true variance 4, samples of size 5
print(f"divide by n     {x.var(axis=1, ddof=0).mean():.2f}")
print(f"divide by n-1   {x.var(axis=1, ddof=1).mean():.2f}")
```

The first average lands near `4 × 4/5 = 3.2`, and the second near 4.

## The central limit theorem {#ch01-clt .th}

The **law of large numbers** says a sample mean approaches the true mean as `n` grows. The **central limit theorem** says how it gets there: for independent draws with finite variance `σ²`, the sample mean is approximately `Normal(μ, σ²/n)` for large `n`, whatever the shape of the original distribution. The standard error `σ/√n` shrinks slowly: four times the data halves it.

```python run=mf-c01-clt
import numpy as np

rng = np.random.default_rng(11)
print("sample means of an Exponential(mean 1), a very skewed distribution")
print("    n   std  1/sqrt(n)  skew  2/sqrt(n)  coverage of mean +/- 1.96 s/sqrt(n)")
for n in (1, 5, 30, 200):
    x = rng.exponential(1, size=(20_000, n))
    m = x.mean(axis=1)
    skew = np.mean((m - m.mean())**3) / m.std()**3
    cover = "n/a" if n == 1 else f"{np.mean(np.abs(m - 1) < 1.96 * x.std(axis=1, ddof=1) / np.sqrt(n)):.3f}"
    print(f"{n:5} {m.std():5.3f} {1 / np.sqrt(n):9.3f} {skew:6.2f} {2 / np.sqrt(n):9.2f}  {cover}")

print("spread (IQR) of the sample mean as n grows")
print("    n  normal  cauchy")
for n in (1, 100, 2000):
    iqr = lambda a: float(np.subtract(*np.percentile(a.mean(axis=1), [75, 25])))
    print(f"{n:5} {iqr(rng.normal(size=(5000, n))):7.3f} {iqr(rng.standard_cauchy(size=(5000, n))):7.3f}")
```

The spread follows `1/√n`, and the skew fades as `2/√n`. Coverage of the usual interval, which estimates `s` from the sample, climbs towards 95% as `n` grows. For this skewed distribution it falls short at `n = 5` and is still a little short at `n = 30`, so "n ≥ 30 is enough" is only a rule of thumb. A Cauchy distribution has no finite mean or variance, so the theorem does not apply: its sample mean has the same distribution as one draw, and the IQR stays near 2 for any `n`.

:::trap What becomes normal
The **sample mean** becomes approximately normal. The data does not change shape however much you collect. A common wrong answer is "with enough data, we can assume the data is normal".
:::

## Hypothesis tests and p-values {#ch01-tests .th}

A test starts from a **null hypothesis** `H0`, usually "no effect", and a test statistic. The **p-value** is the probability, assuming `H0` is true, of a statistic at least as extreme as the one observed. You pick a threshold `α` in advance, often 0.05, and reject `H0` if `p < α`.

- **Type I error**: rejecting a true null (false positive). Its rate is `α`.
- **Type II error**: failing to reject a false null (false negative). Its rate is `β`, and **power** is `1 - β`.
- **Confidence interval**: a procedure that, over repeated samples, covers the true value 95% of the time. For a two-sided test, a 95% interval excludes the null value exactly when `p < 0.05`, for tests built from the same statistic.

Choosing a test is a common follow-up:

| Question | Test |
|---|---|
| Mean against a value, variance known or n large | z-test |
| Mean against a value, or two means, variance estimated | t-test (Welch's when variances differ) |
| Paired before and after measurements | Paired t-test on the differences |
| Two proportions | Two-proportion z-test, or chi-squared on the 2×2 table |
| Categorical association | Chi-squared test of independence |
| Few assumptions wanted | Permutation test, or a rank test such as Mann-Whitney U |

The program runs an A/B comparison: 200 conversions of 2000 in A, 250 of 2000 in B. It uses the z-test and then a permutation test, which shuffles the group labels to simulate "no difference".

```python run=mf-c01-ab
import math
import numpy as np

def two_sided_p(z):
    return math.erfc(abs(z) / math.sqrt(2))

xa, xb, n = 200, 250, 2000
pa, pb = xa / n, xb / n
pool = (xa + xb) / (2 * n)
se0 = math.sqrt(pool * (1 - pool) * 2 / n)
z = (pb - pa) / se0
print(f"lift {pb - pa:.3f}  z {z:.2f}  p {two_sided_p(z):.4f}")

se = math.sqrt(pa * (1 - pa) / n + pb * (1 - pb) / n)
print(f"95% CI for the lift [{pb - pa - 1.96 * se:.3f}, {pb - pa + 1.96 * se:.3f}]")

rng = np.random.default_rng(0)
outcomes = np.r_[np.ones(xa + xb), np.zeros(4000 - xa - xb)]
observed = pb - pa
hits = 0
trials = 20_000
for _ in range(trials):
    s = rng.permutation(outcomes)
    if abs(s[:n].mean() - s[n:].mean()) >= observed - 1e-12:
        hits += 1
print(f"permutation p {hits / trials:.3f}")

# Sample size per group for 80% power to detect 10% -> 11% at alpha 0.05
pbar = 0.105
print(f"n per group ~ {2 * (1.96 + 0.84)**2 * pbar * (1 - pbar) / 0.01**2:.0f}")
```

The z-test and the permutation test give similar p-values, and the permutation test needs no normal approximation. Note the last line: detecting one percentage point on a 10% base takes roughly 15,000 users per group, since required `n` grows with `1/δ²`.

:::trap What a p-value is not
A p-value of 0.03 is **not** a 3% chance that the null is true, and it is not the probability that the result was a fluke. It assumes the null and asks how surprising the data would be. To get `P(H0 | data)` you need a prior, which is the Bayes calculation from the start of this chapter. A small p-value also says nothing about whether the effect is large enough to care about: with enough data, tiny effects become significant.
:::

The ways tests go wrong can be simulated. All the experiments below have no real effect, so every rejection is a false positive.

```python run=mf-c01-nullsim
import math
import numpy as np

rng = np.random.default_rng(42)

def pvals(xa, xb, n):
    pool = (xa + xb) / (2 * n)
    z = (xb - xa) / n / np.sqrt(pool * (1 - pool) * 2 / n)
    return np.array([math.erfc(abs(v) / math.sqrt(2)) for v in z])

trials, n = 20_000, 1000
p = pvals(rng.binomial(n, 0.1, trials), rng.binomial(n, 0.1, trials), n)
print(f"one test            false positive rate {np.mean(p < 0.05):.3f}")
print(f"p-value quartiles   {np.percentile(p, 25):.2f} {np.percentile(p, 50):.2f} {np.percentile(p, 75):.2f}")

groups = p.reshape(-1, 20)
print(f"best of 20 metrics  false positive rate {np.mean(groups.min(axis=1) < 0.05):.3f}")
print(f"with Bonferroni     false positive rate {np.mean(groups.min(axis=1) < 0.05 / 20):.3f}")

# Peeking: test every 100 users per arm, stop at the first p < 0.05.
runs, users = 4000, 2000
a = np.cumsum(rng.random((runs, users)) < 0.1, axis=1)
b = np.cumsum(rng.random((runs, users)) < 0.1, axis=1)
stopped = np.zeros(runs, dtype=bool)
for t in range(100, users + 1, 100):
    with np.errstate(divide="ignore", invalid="ignore"):
        stopped |= pvals(a[:, t - 1], b[:, t - 1], t) < 0.05
print(f"peek 20 times       false positive rate {stopped.mean():.3f}")
```

A single test keeps its promise of about 5%, and under the null p-values are uniform, as the quartiles show. Looking at 20 metrics and reporting the best gives about `1 - 0.95²⁰ = 0.64`. Bonferroni, dividing `α` by the number of tests, brings it back to about 5%. Peeking and stopping early inflates the rate to about 24%, though each look would be a valid test by itself if it were the only one. Sequential testing methods exist for when you must look early.

## Vectors, eigenvalues and what a matrix does {#ch01-eig .th}

Read a matrix as a function that moves vectors. The **dot product** `a·b = |a||b|cos θ` measures alignment, and `(a·b)/|b|` is the length of the projection of `a` onto `b`. **Rank** is the number of independent directions the output can span. A rank-deficient `XᵀX` is why collinear features break the normal equation.

An **eigenvector** `v` of a square matrix `A` keeps its direction: `Av = λv`, where `λ` is its **eigenvalue**. For a **symmetric** matrix, which includes every covariance matrix, the eigenvalues are real, the eigenvectors can be chosen orthonormal, and `A = QΛQᵀ`. A symmetric matrix is **positive semi-definite (PSD)** when all eigenvalues are at least 0, which is equivalent to `xᵀAx ≥ 0` for all `x`. Covariance matrices are always PSD. Two handy checks: the eigenvalues sum to the trace and multiply to the determinant.

```python run=mf-c01-eig
import numpy as np

A = np.array([[2.0, 1.0], [1.0, 2.0]])
vals, vecs = np.linalg.eigh(A)           # eigh: for symmetric matrices, ascending order
vecs = vecs * np.sign(vecs[0])            # fix the arbitrary sign: first entry positive
print("eigenvalues ", vals.round(3).tolist())
print("eigenvectors", vecs.T.round(3).tolist())
print("trace", np.trace(A), " sum", round(float(vals.sum()), 3))
print("det  ", round(float(np.linalg.det(A)), 3), " product", round(float(vals.prod()), 3))

# Power iteration finds the largest eigenvalue by repeated multiplication.
x = np.array([1.0, 0.0])
for step in range(1, 7):
    x = A @ x
    x /= np.linalg.norm(x)
    print(f"step {step}: Rayleigh quotient {x @ A @ x:.4f}")

# A rotation moves every real vector, so it has no real eigenvector.
R = np.array([[0.0, -1.0], [1.0, 0.0]])
print("rotation eigenvalues, imaginary parts", sorted(np.linalg.eigvals(R).imag.round(3).tolist()))
```

Power iteration converges to 3 because each multiplication stretches the eigenvector with eigenvalue 3 more than the other. The convergence rate depends on the ratio of the top two eigenvalues.

:::trap Eigenvector sign is arbitrary
If `v` is an eigenvector, so is `-v`. Different libraries and BLAS builds can return either sign, so PCA components can flip between runs. Compare subspaces or normalise the sign, and never test for exact equality of raw eigenvectors.
:::

## SVD {#ch01-svd .th}

Any real `m × n` matrix, square or not, factors as `A = UΣVᵀ`. `U` and `V` have orthonormal columns, and `Σ` is diagonal with non-negative **singular values** in descending order. Read it as: rotate with `Vᵀ`, stretch along the axes with `Σ`, rotate with `U`.

The link to eigenvalues: the columns of `V` are eigenvectors of `AᵀA`, and the squared singular values are its eigenvalues. Keeping the top `k` singular values gives the best rank-`k` approximation in the Frobenius norm (the Eckart-Young theorem), and the squared error is the sum of the squared singular values you dropped. The pseudoinverse `A⁺ = VΣ⁺Uᵀ` gives the least-squares solution when `A` isn't invertible.

```python run=mf-c01-svd
import numpy as np

rng = np.random.default_rng(0)
A = rng.normal(size=(100, 3)) @ rng.normal(size=(3, 40)) + 0.1 * rng.normal(size=(100, 40))

U, s, Vt = np.linalg.svd(A, full_matrices=False)
print("top singular values", s[:6].round(2).tolist())

total = np.sum(A**2)
for k in (1, 2, 3, 4):
    Ak = (U[:, :k] * s[:k]) @ Vt[:k]
    err = np.sum((A - Ak)**2)
    print(f"k={k}: error share {err / total:.4f}  tail formula {np.sum(s[k:]**2) / total:.4f}")

eig = np.linalg.eigvalsh(A.T @ A)[::-1]
print("singular values^2 match eigenvalues of A'A:", bool(np.allclose(s**2, eig)))
print("orthonormal columns in U:", bool(np.allclose(U.T @ U, np.eye(40))))
```

Three singular values stand out, since the matrix is rank 3 plus a little noise. The error drops sharply up to `k = 3` and barely moves after that. That gap is the same thing you look for in a PCA scree plot.

## PCA {#ch01-pca .th}

**Principal component analysis** finds orthogonal directions of maximum variance. Keeping the top `k` directions gives the `k`-dimensional linear projection with the lowest squared reconstruction error, and those two descriptions are equivalent.

1. Centre each column (and scale it, if units differ).
2. Compute the SVD of the centred matrix, `X = UΣVᵀ`. The rows of `Vᵀ` are the components.
3. Project: `Z = X V_k = U_k Σ_k`.
4. Variance along component `i` is `sᵢ²/(n-1)`, which is the `i`-th eigenvalue of the covariance matrix.

SVD is preferred over forming the covariance matrix, because squaring the matrix squares its condition number and loses numerical precision.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 600 340" role="img" aria-label="Scatter of correlated 2D points with the first principal component along the long axis of the cloud and the second at right angles to it.">
  <path d="M40.0 170.0 L 560.0 170.0" class="d-grid"/><path d="M300.0 10.0 L 300.0 330.0" class="d-grid"/><circle cx="184.4" cy="284.4" r="2.4" class="d-fill-muted"/><circle cx="210.9" cy="203.8" r="2.4" class="d-fill-muted"/><circle cx="209.3" cy="256.4" r="2.4" class="d-fill-muted"/><circle cx="275.9" cy="167.1" r="2.4" class="d-fill-muted"/><circle cx="146.5" cy="307.5" r="2.4" class="d-fill-muted"/><circle cx="286.6" cy="212.5" r="2.4" class="d-fill-muted"/><circle cx="235.9" cy="226.1" r="2.4" class="d-fill-muted"/><circle cx="358.1" cy="100.3" r="2.4" class="d-fill-muted"/><circle cx="362.2" cy="116.5" r="2.4" class="d-fill-muted"/><circle cx="391.0" cy="99.5" r="2.4" class="d-fill-muted"/><circle cx="349.7" cy="107.2" r="2.4" class="d-fill-muted"/><circle cx="295.6" cy="186.0" r="2.4" class="d-fill-muted"/><circle cx="355.8" cy="105.3" r="2.4" class="d-fill-muted"/><circle cx="398.5" cy="80.2" r="2.4" class="d-fill-muted"/><circle cx="256.0" cy="223.7" r="2.4" class="d-fill-muted"/><circle cx="339.4" cy="114.1" r="2.4" class="d-fill-muted"/><circle cx="296.3" cy="144.2" r="2.4" class="d-fill-muted"/><circle cx="394.1" cy="96.0" r="2.4" class="d-fill-muted"/><circle cx="243.9" cy="208.3" r="2.4" class="d-fill-muted"/><circle cx="279.2" cy="188.8" r="2.4" class="d-fill-muted"/><circle cx="323.0" cy="172.3" r="2.4" class="d-fill-muted"/><circle cx="316.1" cy="135.8" r="2.4" class="d-fill-muted"/><circle cx="190.9" cy="275.6" r="2.4" class="d-fill-muted"/><circle cx="322.9" cy="136.3" r="2.4" class="d-fill-muted"/>
  <circle cx="291.3" cy="184.9" r="2.4" class="d-fill-muted"/><circle cx="283.3" cy="202.2" r="2.4" class="d-fill-muted"/><circle cx="288.8" cy="161.7" r="2.4" class="d-fill-muted"/><circle cx="313.5" cy="150.3" r="2.4" class="d-fill-muted"/><circle cx="179.2" cy="222.4" r="2.4" class="d-fill-muted"/><circle cx="401.6" cy="86.6" r="2.4" class="d-fill-muted"/><circle cx="242.2" cy="209.2" r="2.4" class="d-fill-muted"/><circle cx="151.2" cy="282.8" r="2.4" class="d-fill-muted"/><circle cx="293.7" cy="176.9" r="2.4" class="d-fill-muted"/><circle cx="395.3" cy="61.1" r="2.4" class="d-fill-muted"/><circle cx="264.9" cy="161.3" r="2.4" class="d-fill-muted"/><circle cx="401.5" cy="70.1" r="2.4" class="d-fill-muted"/><circle cx="401.8" cy="106.9" r="2.4" class="d-fill-muted"/><circle cx="242.1" cy="202.6" r="2.4" class="d-fill-muted"/><circle cx="136.4" cy="295.8" r="2.4" class="d-fill-muted"/><circle cx="217.6" cy="242.0" r="2.4" class="d-fill-muted"/><circle cx="377.5" cy="138.3" r="2.4" class="d-fill-muted"/><circle cx="245.2" cy="190.5" r="2.4" class="d-fill-muted"/><circle cx="199.4" cy="220.2" r="2.4" class="d-fill-muted"/><circle cx="210.8" cy="230.6" r="2.4" class="d-fill-muted"/><circle cx="299.1" cy="156.8" r="2.4" class="d-fill-muted"/><circle cx="297.4" cy="129.5" r="2.4" class="d-fill-muted"/><circle cx="356.6" cy="78.2" r="2.4" class="d-fill-muted"/><circle cx="364.4" cy="109.7" r="2.4" class="d-fill-muted"/><circle cx="237.6" cy="278.8" r="2.4" class="d-fill-muted"/><circle cx="288.7" cy="159.4" r="2.4" class="d-fill-muted"/>
  <circle cx="224.2" cy="223.4" r="2.4" class="d-fill-muted"/><circle cx="303.8" cy="148.0" r="2.4" class="d-fill-muted"/><circle cx="223.1" cy="239.0" r="2.4" class="d-fill-muted"/><circle cx="219.9" cy="252.3" r="2.4" class="d-fill-muted"/><circle cx="439.2" cy="43.6" r="2.4" class="d-fill-muted"/><circle cx="301.2" cy="171.8" r="2.4" class="d-fill-muted"/><circle cx="341.5" cy="130.7" r="2.4" class="d-fill-muted"/><circle cx="466.6" cy="23.8" r="2.4" class="d-fill-muted"/><circle cx="351.0" cy="123.2" r="2.4" class="d-fill-muted"/><circle cx="291.6" cy="204.7" r="2.4" class="d-fill-muted"/><circle cx="302.7" cy="151.6" r="2.4" class="d-fill-muted"/><circle cx="250.0" cy="217.2" r="2.4" class="d-fill-muted"/><circle cx="371.3" cy="114.0" r="2.4" class="d-fill-muted"/><circle cx="277.3" cy="175.3" r="2.4" class="d-fill-muted"/><circle cx="415.4" cy="106.1" r="2.4" class="d-fill-muted"/><circle cx="276.3" cy="191.4" r="2.4" class="d-fill-muted"/><circle cx="275.8" cy="226.3" r="2.4" class="d-fill-muted"/><circle cx="271.4" cy="201.9" r="2.4" class="d-fill-muted"/><circle cx="340.4" cy="127.1" r="2.4" class="d-fill-muted"/><circle cx="311.4" cy="161.0" r="2.4" class="d-fill-muted"/><circle cx="389.6" cy="101.6" r="2.4" class="d-fill-muted"/><circle cx="262.6" cy="184.6" r="2.4" class="d-fill-muted"/><circle cx="318.2" cy="161.7" r="2.4" class="d-fill-muted"/><circle cx="427.0" cy="101.0" r="2.4" class="d-fill-muted"/><circle cx="283.2" cy="157.7" r="2.4" class="d-fill-muted"/>
  <circle cx="334.2" cy="135.9" r="2.4" class="d-fill-muted"/><circle cx="402.8" cy="68.4" r="2.4" class="d-fill-muted"/><circle cx="335.6" cy="148.6" r="2.4" class="d-fill-muted"/><circle cx="257.2" cy="212.0" r="2.4" class="d-fill-muted"/><circle cx="163.0" cy="294.3" r="2.4" class="d-fill-muted"/><circle cx="457.0" cy="85.1" r="2.4" class="d-fill-muted"/><circle cx="327.5" cy="156.9" r="2.4" class="d-fill-muted"/><circle cx="382.3" cy="116.1" r="2.4" class="d-fill-muted"/><circle cx="267.7" cy="160.0" r="2.4" class="d-fill-muted"/><circle cx="419.1" cy="115.4" r="2.4" class="d-fill-muted"/><circle cx="333.4" cy="141.7" r="2.4" class="d-fill-muted"/><circle cx="302.4" cy="171.2" r="2.4" class="d-fill-muted"/><circle cx="239.6" cy="219.4" r="2.4" class="d-fill-muted"/><circle cx="323.4" cy="154.0" r="2.4" class="d-fill-muted"/><circle cx="267.0" cy="191.2" r="2.4" class="d-fill-muted"/><circle cx="284.4" cy="163.4" r="2.4" class="d-fill-muted"/><circle cx="192.0" cy="292.4" r="2.4" class="d-fill-muted"/><circle cx="266.7" cy="178.2" r="2.4" class="d-fill-muted"/><circle cx="309.6" cy="168.4" r="2.4" class="d-fill-muted"/><circle cx="216.5" cy="258.5" r="2.4" class="d-fill-muted"/><circle cx="304.0" cy="207.8" r="2.4" class="d-fill-muted"/><circle cx="342.9" cy="176.0" r="2.4" class="d-fill-muted"/><circle cx="278.8" cy="188.9" r="2.4" class="d-fill-muted"/><circle cx="258.1" cy="228.6" r="2.4" class="d-fill-muted"/><circle cx="258.2" cy="228.7" r="2.4" class="d-fill-muted"/>
  <circle cx="361.2" cy="132.4" r="2.4" class="d-fill-muted"/><circle cx="197.8" cy="251.9" r="2.4" class="d-fill-muted"/><circle cx="279.3" cy="197.5" r="2.4" class="d-fill-muted"/><circle cx="271.4" cy="218.3" r="2.4" class="d-fill-muted"/><circle cx="308.6" cy="177.4" r="2.4" class="d-fill-muted"/><circle cx="294.5" cy="178.7" r="2.4" class="d-fill-muted"/><circle cx="226.0" cy="252.7" r="2.4" class="d-fill-muted"/><circle cx="433.7" cy="43.5" r="2.4" class="d-fill-muted"/><circle cx="310.8" cy="133.8" r="2.4" class="d-fill-muted"/><circle cx="210.5" cy="213.5" r="2.4" class="d-fill-muted"/><circle cx="240.3" cy="225.0" r="2.4" class="d-fill-muted"/><circle cx="305.5" cy="173.2" r="2.4" class="d-fill-muted"/><circle cx="339.5" cy="158.5" r="2.4" class="d-fill-muted"/><circle cx="210.5" cy="211.4" r="2.4" class="d-fill-muted"/><circle cx="346.0" cy="143.6" r="2.4" class="d-fill-muted"/><circle cx="208.5" cy="195.4" r="2.4" class="d-fill-muted"/><circle cx="246.7" cy="257.3" r="2.4" class="d-fill-muted"/><circle cx="355.4" cy="120.5" r="2.4" class="d-fill-muted"/><circle cx="411.4" cy="69.6" r="2.4" class="d-fill-muted"/><circle cx="293.5" cy="174.8" r="2.4" class="d-fill-muted"/><circle cx="278.7" cy="173.9" r="2.4" class="d-fill-muted"/><circle cx="382.8" cy="59.6" r="2.4" class="d-fill-muted"/><circle cx="228.3" cy="227.8" r="2.4" class="d-fill-muted"/><circle cx="317.4" cy="137.5" r="2.4" class="d-fill-muted"/><circle cx="314.5" cy="167.7" r="2.4" class="d-fill-muted"/><circle cx="365.7" cy="144.3" r="2.4" class="d-fill-muted"/>
  <circle cx="318.8" cy="177.5" r="2.4" class="d-fill-muted"/><circle cx="281.5" cy="165.7" r="2.4" class="d-fill-muted"/><circle cx="339.6" cy="130.6" r="2.4" class="d-fill-muted"/><circle cx="224.7" cy="261.0" r="2.4" class="d-fill-muted"/><circle cx="352.8" cy="120.1" r="2.4" class="d-fill-muted"/><circle cx="254.7" cy="192.2" r="2.4" class="d-fill-muted"/><circle cx="239.0" cy="207.2" r="2.4" class="d-fill-muted"/><circle cx="274.8" cy="164.4" r="2.4" class="d-fill-muted"/><circle cx="302.1" cy="199.2" r="2.4" class="d-fill-muted"/><circle cx="346.0" cy="152.8" r="2.4" class="d-fill-muted"/><circle cx="285.1" cy="204.3" r="2.4" class="d-fill-muted"/><circle cx="347.6" cy="127.5" r="2.4" class="d-fill-muted"/><circle cx="363.4" cy="89.3" r="2.4" class="d-fill-muted"/><circle cx="292.1" cy="184.6" r="2.4" class="d-fill-muted"/><circle cx="234.3" cy="213.6" r="2.4" class="d-fill-muted"/><circle cx="359.8" cy="101.7" r="2.4" class="d-fill-muted"/><circle cx="317.3" cy="164.8" r="2.4" class="d-fill-muted"/><circle cx="159.5" cy="263.2" r="2.4" class="d-fill-muted"/><circle cx="233.9" cy="223.9" r="2.4" class="d-fill-muted"/><circle cx="308.5" cy="122.8" r="2.4" class="d-fill-muted"/><circle cx="208.5" cy="210.8" r="2.4" class="d-fill-muted"/><circle cx="254.1" cy="214.8" r="2.4" class="d-fill-muted"/><circle cx="186.0" cy="271.1" r="2.4" class="d-fill-muted"/><circle cx="325.6" cy="107.2" r="2.4" class="d-fill-muted"/><circle cx="315.0" cy="175.1" r="2.4" class="d-fill-muted"/>
  <circle cx="310.7" cy="134.0" r="2.4" class="d-fill-muted"/><circle cx="394.6" cy="101.3" r="2.4" class="d-fill-muted"/><circle cx="275.8" cy="212.6" r="2.4" class="d-fill-muted"/><circle cx="280.0" cy="146.0" r="2.4" class="d-fill-muted"/><circle cx="432.4" cy="52.4" r="2.4" class="d-fill-muted"/><circle cx="213.2" cy="259.9" r="2.4" class="d-fill-muted"/><circle cx="347.2" cy="135.3" r="2.4" class="d-fill-muted"/><circle cx="212.3" cy="254.0" r="2.4" class="d-fill-muted"/><circle cx="314.7" cy="177.3" r="2.4" class="d-fill-muted"/><path d="M300.0 170.0 L 432.0 54.9" class="d-line-acc"/><circle cx="432.0" cy="54.9" r="4" class="d-fill-acc"/><text x="440.0" y="48.9" class="t-mono t-acc">PC1</text><path d="M300.0 170.0 L 277.6 144.3" class="d-line-key"/><circle cx="277.6" cy="144.3" r="4" class="d-fill-key"/><text x="285.6" y="138.3" class="t-mono t-key">PC2</text>
</svg></div><figcaption><b>PCA on the data from the program below.</b> Each arrow is drawn to two standard deviations along its component. PC1 follows the long axis of the centred cloud, and PC2 is at a right angle to it.</figcaption></figure>

```python run=mf-c01-pca
import numpy as np

rng = np.random.default_rng(8)
x1 = rng.normal(0, 3, 500)
X = np.c_[x1, 0.8 * x1 + rng.normal(0, 1, 500)]

def pca(X, centre=True):
    Xc = X - X.mean(axis=0) if centre else X
    _, s, Vt = np.linalg.svd(Xc, full_matrices=False)
    Vt = Vt * np.sign(Vt[range(len(Vt)), np.abs(Vt).argmax(axis=1)])[:, None]
    return Vt, s**2 / (len(X) - 1)

comps, var = pca(X)
print("components", comps.round(3).tolist())
print("variances ", var.round(3).tolist(), " explained", (var / var.sum()).round(3).tolist())
print("cov eigen ", np.linalg.eigvalsh(np.cov(X.T))[::-1].round(3).tolist())

shifted = X + 100
print("not centred, far from origin, PC1:", pca(shifted, centre=False)[0][0].round(3).tolist())
print("rescale column 1 by 1000, PC1:    ", pca(X * [1000, 1])[0][0].round(3).tolist())

# Largest variance need not mean most useful: labels live on the low-variance axis.
y = rng.integers(0, 2, 2000)
D = np.c_[rng.normal(0, 10, 2000), (2 * y - 1) + rng.normal(0, 0.3, 2000)]
comps, _ = pca(D)
for i in (0, 1):
    z = (D - D.mean(axis=0)) @ comps[i]
    mid = (z[y == 0].mean() + z[y == 1].mean()) / 2
    side = z[y == 1].mean() > mid
    print(f"classify using only PC{i + 1}: accuracy {np.mean((z > mid) == (y == side)):.3f}")
```

Components here are the top directions of the correlated cloud, and the covariance eigenvalues match `s²/(n-1)`. The next two lines are common bugs. Without centring, PC1 points from the origin towards the data's mean. Without scaling, PC1 latches onto whichever column has the largest units. The last two lines show PCA's blind spot: it never looks at labels. The useful axis had low variance, so it became PC2, and keeping only PC1 throws away the signal.

## Gradients and convexity {#ch01-grad .th}

The **gradient** `∇f` is the vector of partial derivatives and points in the direction of steepest increase. For a function with vector output, the matrix of first derivatives is the **Jacobian**. The matrix of second derivatives is the **Hessian**, and its eigenvalues describe curvature: all positive means a local minimum, mixed signs mean a **saddle point**.

A function is **convex** if the line segment between any two points on its graph lies on or above the graph. For twice-differentiable functions, this is the same as a PSD Hessian everywhere. Every local minimum of a convex function is a global one, so gradient descent with a suitable step size has no bad minima to get stuck in. Linear regression with MSE and logistic regression with cross-entropy are convex in the weights. A neural network's loss is not convex.

Always check a hand-derived gradient numerically. Central differences have error of order `h²`.

```python run=mf-c01-grad
import numpy as np

rng = np.random.default_rng(1)
X = rng.normal(size=(50, 3))
y = rng.integers(0, 2, 50).astype(float)

def loss(w):
    p = 1 / (1 + np.exp(-X @ w))
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))

def grad(w):
    p = 1 / (1 + np.exp(-X @ w))
    return X.T @ (p - y) / len(y)

def bad_grad(w):                     # forgot to divide by n
    return X.T @ (1 / (1 + np.exp(-X @ w)) - y)

def numeric(f, w, h=1e-5):
    g = np.zeros_like(w)
    for i in range(len(w)):
        e = np.zeros_like(w)
        e[i] = h
        g[i] = (f(w + e) - f(w - e)) / (2 * h)
    return g

w = np.array([0.5, -1.0, 2.0])
print("analytic ", grad(w).round(4).tolist())
print("numeric  ", numeric(loss, w).round(4).tolist())
print("correct gradient passes:", bool(np.allclose(grad(w), numeric(loss, w), atol=1e-7)))
print("buggy gradient passes:  ", bool(np.allclose(bad_grad(w), numeric(loss, w), atol=1e-7)))

# Non-convex function: the start decides which minimum you reach.
f = lambda x: x**4 - 3 * x**2 + x
df = lambda x: 4 * x**3 - 6 * x + 1
for x in (-2.0, 2.0):
    start = x
    for _ in range(500):
        x -= 0.01 * df(x)
    print(f"start {start:+.1f} -> x = {x:+.3f}, f = {f(x):+.3f}")
```

From two starts, gradient descent lands in two different minima, and only the left one is global. In high-dimensional networks, saddle points are thought to be a bigger obstacle than poor local minima, since a critical point with thousands of curvature directions rarely has all of them positive. Treat that as intuition, since it is not a theorem about any particular network.

## Gradient descent and the learning rate {#ch01-lr .th}

Gradient descent repeats `w ← w - η ∇f(w)`, where `η` is the **learning rate**. A one-dimensional quadratic `f(x) = ½λx²` explains most of its behaviour. The update becomes `x ← (1 - ηλ) x`, so it converges only if `|1 - ηλ| < 1`, meaning `0 < η < 2/λ`.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 240" role="img" aria-label="Three parabolas showing six gradient descent iterates: learning rate 0.3 moves smoothly to the minimum, 1.9 oscillates and shrinks, 2.1 oscillates and grows.">
  <path d="M35.8 31.4 L 39.2 44.6 L 42.7 57.3 L 46.2 69.3 L 49.7 80.8 L 53.1 91.7 L 56.6 102.1 L 60.1 111.8 L 63.6 121.0 L 67.1 129.6 L 70.5 137.7 L 74.0 145.1 L 77.5 152.0 L 81.0 158.3 L 84.5 164.1 L 87.9 169.3 L 91.4 173.8 L 94.9 177.9 L 98.4 181.3 L 101.8 184.2 L 105.3 186.5 L 108.8 188.2 L 112.3 189.4 L 115.8 189.9 L 119.2 189.9 L 122.7 189.4 L 126.2 188.2 L 129.7 186.5 L 133.2 184.2 L 136.6 181.3 L 140.1 177.9 L 143.6 173.8 L 147.1 169.3 L 150.5 164.1 L 154.0 158.3 L 157.5 152.0 L 161.0 145.1 L 164.5 137.7 L 167.9 129.6 L 171.4 121.0 L 174.9 111.8 L 178.4 102.1 L 181.9 91.7 L 185.3 80.8 L 188.8 69.3 L 192.3 57.3 L 195.8 44.6 L 199.2 31.4" class="d-line"/><path d="M166.4 133.3 L 151.7 162.2 L 141.4 176.4 L 134.3 183.3 L 129.2 186.7 L 125.7 188.4" class="d-line-key"/><circle cx="166.4" cy="133.3" r="4" class="d-fill-key"/><circle cx="151.7" cy="162.2" r="2.8" class="d-fill-key"/><circle cx="141.4" cy="176.4" r="2.8" class="d-fill-key"/><circle cx="134.3" cy="183.3" r="2.8" class="d-fill-key"/><circle cx="129.2" cy="186.7" r="2.8" class="d-fill-key"/><circle cx="125.7" cy="188.4" r="2.8" class="d-fill-key"/><text x="117.5" y="212" text-anchor="middle" class="t-mono">lr = 0.3</text><text x="117.5" y="228" text-anchor="middle" class="t-small">converges smoothly</text><path d="M270.8 31.4 L 274.2 44.6 L 277.7 57.3 L 281.2 69.3 L 284.7 80.8 L 288.1 91.7 L 291.6 102.1 L 295.1 111.8 L 298.6 121.0 L 302.1 129.6 L 305.5 137.7 L 309.0 145.1 L 312.5 152.0 L 316.0 158.3 L 319.5 164.1 L 322.9 169.3 L 326.4 173.8 L 329.9 177.9 L 333.4 181.3 L 336.8 184.2 L 340.3 186.5 L 343.8 188.2 L 347.3 189.4 L 350.8 189.9 L 354.2 189.9 L 357.7 189.4 L 361.2 188.2 L 364.7 186.5 L 368.2 184.2 L 371.6 181.3 L 375.1 177.9 L 378.6 173.8 L 382.1 169.3 L 385.5 164.1 L 389.0 158.3 L 392.5 152.0 L 396.0 145.1 L 399.5 137.7 L 402.9 129.6 L 406.4 121.0 L 409.9 111.8 L 413.4 102.1 L 416.9 91.7 L 420.3 80.8 L 423.8 69.3 L 427.3 57.3 L 430.8 44.6 L 434.2 31.4" class="d-line"/>
  <path d="M401.4 133.3 L 308.5 144.1 L 392.1 152.8 L 316.9 159.9 L 384.6 165.6 L 323.6 170.2" class="d-line-acc"/><circle cx="401.4" cy="133.3" r="4" class="d-fill-acc"/><circle cx="308.5" cy="144.1" r="2.8" class="d-fill-acc"/><circle cx="392.1" cy="152.8" r="2.8" class="d-fill-acc"/><circle cx="316.9" cy="159.9" r="2.8" class="d-fill-acc"/><circle cx="384.6" cy="165.6" r="2.8" class="d-fill-acc"/><circle cx="323.6" cy="170.2" r="2.8" class="d-fill-acc"/><text x="352.5" y="212" text-anchor="middle" class="t-mono">lr = 1.9</text><text x="352.5" y="228" text-anchor="middle" class="t-small">oscillates, shrinks</text><path d="M505.8 31.4 L 509.2 44.6 L 512.7 57.3 L 516.2 69.3 L 519.7 80.8 L 523.1 91.7 L 526.6 102.1 L 530.1 111.8 L 533.6 121.0 L 537.1 129.6 L 540.5 137.7 L 544.0 145.1 L 547.5 152.0 L 551.0 158.3 L 554.5 164.1 L 557.9 169.3 L 561.4 173.8 L 564.9 177.9 L 568.4 181.3 L 571.8 184.2 L 575.3 186.5 L 578.8 188.2 L 582.3 189.4 L 585.8 189.9 L 589.2 189.9 L 592.7 189.4 L 596.2 188.2 L 599.7 186.5 L 603.2 184.2 L 606.6 181.3 L 610.1 177.9 L 613.6 173.8 L 617.1 169.3 L 620.5 164.1 L 624.0 158.3 L 627.5 152.0 L 631.0 145.1 L 634.5 137.7 L 637.9 129.6 L 641.4 121.0 L 644.9 111.8 L 648.4 102.1 L 651.9 91.7 L 655.3 80.8 L 658.8 69.3 L 662.3 57.3 L 665.8 44.6 L 669.2 31.4" class="d-line"/><path d="M636.4 133.3 L 533.8 121.4 L 646.6 107.0 L 522.5 89.6 L 659.0 68.5 L 508.8 43.0" class="d-line-trap"/><circle cx="636.4" cy="133.3" r="4" class="d-fill-trap"/><circle cx="533.8" cy="121.4" r="2.8" class="d-fill-trap"/>
  <circle cx="646.6" cy="107.0" r="2.8" class="d-fill-trap"/><circle cx="522.5" cy="89.6" r="2.8" class="d-fill-trap"/><circle cx="659.0" cy="68.5" r="2.8" class="d-fill-trap"/><circle cx="508.8" cy="43.0" r="2.8" class="d-fill-trap"/><text x="587.5" y="212" text-anchor="middle" class="t-mono">lr = 2.1</text><text x="587.5" y="228" text-anchor="middle" class="t-small">oscillates, grows</text>
</svg></div><figcaption><b>Six iterates on <code>f(x) = ½x²</code> from <code>x = 1</code>.</b> The stability limit for this function is a learning rate of 2.</figcaption></figure>

```python run=mf-c01-lr
# f(x) = 0.5 * x^2, so lambda = 1 and the stability limit is lr = 2
for lr in (0.3, 1.0, 1.9, 2.1):
    x, path = 1.0, []
    for step in range(20):
        path.append(x)
        x -= lr * x
    first = " ".join(f"{v:+.2f}" for v in path[:5])
    print(f"lr={lr}: {first} ...  after 20 steps {x:+.3f}")
```

With `lr = 1.0`, this quadratic is solved in one step, as `1/λ` is the Newton step. With 1.9, it oscillates and shrinks slowly. With 2.1, the same oscillation grows without bound, which in a real training run looks like a loss that jumps to infinity or NaN.

In many dimensions, each eigenvalue of the Hessian has its own limit, so the largest eigenvalue `L` caps the learning rate and the smallest `m` sets the slowest progress. The ratio `κ = L/m` is the **condition number**. A large one gives the long narrow valley where plain gradient descent zigzags across the steep direction and crawls along the flat one. Feature scaling helps because it reduces `κ`.

## Momentum, Adam and SGD {#ch01-opt .th}

Three upgrades cover almost everything you get asked:

```text
Momentum:  v = β v + g               w = w - η v
RMSProp:   s = ρ s + (1-ρ) g²        w = w - η g / (√s + ε)
Adam:      m = β1 m + (1-β1) g       s = β2 s + (1-β2) g²
           m̂ = m / (1 - β1^t)        ŝ = s / (1 - β2^t)
           w = w - η m̂ / (√ŝ + ε)
```

**Momentum** averages gradients, so oscillating components cancel and consistent ones add up. **Adam** adds a per-parameter step size based on a running average of squared gradients, plus a bias correction for the zero-initialised averages. The paper's suggested defaults are `β1 = 0.9`, `β2 = 0.999`, `ε = 1e-8`, and `η = 0.001` is a common starting point.

```python run=mf-c01-cond
import numpy as np

def make(theta):
    c, s = np.cos(theta), np.sin(theta)
    Q = np.array([[c, -s], [s, c]])
    return Q @ np.diag([1.0, 100.0]) @ Q.T

def steps(H, update, tol=1e-6, cap=50_000):
    w = np.array([1.0, 1.0])
    state = {"t": 0, "v": np.zeros(2), "m": np.zeros(2), "s": np.zeros(2)}
    for i in range(cap):
        if 0.5 * w @ H @ w < tol:
            return i
        w = update(w, H @ w, state)
    return f">{cap}"

def gd(w, g, st):
    return w - 0.01 * g

def momentum(w, g, st):
    st["v"] = 0.9 * st["v"] + g
    return w - 0.01 * st["v"]

def adam(w, g, st, lr=0.01, b1=0.9, b2=0.999):
    st["t"] += 1
    st["m"] = b1 * st["m"] + (1 - b1) * g
    st["s"] = b2 * st["s"] + (1 - b2) * g * g
    mh, sh = st["m"] / (1 - b1**st["t"]), st["s"] / (1 - b2**st["t"])
    return w - lr * mh / (np.sqrt(sh) + 1e-8)

print("steps until f < 1e-6 on a quadratic with condition number 100")
for name, angle in [("axis-aligned", 0.0), ("rotated 30 deg", np.pi / 6)]:
    H = make(angle)
    print(f"{name:15} GD {steps(H, gd):>6}  momentum {steps(H, momentum):>6}  Adam {steps(H, adam):>6}")
```

Momentum is the fastest in both rows here, and it cuts plain gradient descent's count by roughly a factor of five. Adam's result shows what its per-coordinate scaling can and can't do. When the steep and flat directions line up with the axes, it divides each coordinate by its own gradient scale. When they lie along diagonals, that scaling can't undo the problem, and Adam takes far longer. This is one toy problem with hand-picked learning rates, and a different rate would change the ranking, so don't read it as "momentum beats Adam".

**Stochastic gradient descent** estimates the gradient from a random **mini-batch**. The estimate is noisier, with standard deviation shrinking as `1/√B` for batch size `B`, and far cheaper per step. A pass over a large dataset gives thousands of slightly noisy updates in place of one exact one.

```python run=mf-c01-sgd
import numpy as np

rng = np.random.default_rng(2)
n, d = 2000, 5
X = rng.normal(size=(n, d))
y = X @ rng.normal(size=d) + rng.normal(0, 0.5, n)
best = np.linalg.lstsq(X, y, rcond=None)[0]
mse = lambda w: float(np.mean((X @ w - y)**2))

def run(batch, lr=0.05, epochs=3, decay=None):
    r = np.random.default_rng(3)
    w, t = np.zeros(d), 0
    for _ in range(epochs):
        order = r.permutation(n)
        for s in range(0, n, batch):
            b = order[s:s + batch]
            t += 1
            eta = lr / (1 + t / decay) if decay else lr
            w = w - eta * 2 * X[b].T @ (X[b] @ w - y[b]) / len(b)
    return t, mse(w) - mse(best)

print("3 epochs each: updates and excess MSE above the best fit")
for label, args in [("full batch", dict(batch=n)), ("batch 256", dict(batch=256)),
                    ("batch 32", dict(batch=32)), ("batch 1", dict(batch=1)),
                    ("batch 1, decaying lr", dict(batch=1, decay=500))]:
    t, gap = run(**args)
    print(f"{label:22} updates {t:5}  excess {gap:.4f}")

w0 = np.zeros(d)
for B in (1, 16, 256):
    g = [(2 * X[i].T @ (X[i] @ w0 - y[i]) / B)[0] for i in (rng.integers(0, n, B) for _ in range(3000))]
    print(f"B={B:3}: std of one gradient component {np.std(g):.3f}")
```

Each row makes three passes over the data. Full batch gets only 3 updates, and it has barely started. Smaller batches get far more updates for the same work, so they get closer. Batch 1 with a constant learning rate finishes worse than batch 32, since its noisy steps keep it bouncing around the minimum at a level set by the step size. Decaying the learning rate removes most of that noise floor. The last three lines show the `1/√B` rule: a batch 16 times larger cuts the gradient's standard deviation by about 4.

:::tip Debugging a training run
Loss rising or NaN: lower the learning rate, check gradients and input scale. Loss flat: learning rate too low, or a bug such as a detached graph or wrong label encoding. Try to overfit one small batch first. If the model can't, look for a bug in the code before collecting more data.
:::

**L2 regularisation inside Adam is different from weight decay.** Adding `λw` to the gradient means Adam divides it by `√ŝ`, so the shrinkage varies across parameters. AdamW subtracts the decay from the weights directly, which is usually what people mean by weight decay. With plain SGD the two are equivalent up to a rescaling of `λ` by the learning rate.

## Drills {#ch01-drills .dr}

:::drill concept
In one sentence, what is a p-value, and name two things it isn't.
---
It's the probability, assuming the null hypothesis is true, of a test statistic at least as extreme as the one observed.

It is not the probability that the null is true, and it is not a measure of effect size. A tiny, useless effect gives a small p-value when `n` is large enough.
:::

:::drill output
A spam filter flags 90% of spam and 2% of legitimate mail. 20% of mail is spam. What fraction of flagged mail is spam?

```python run=mf-c01-d-spam
spam, tpr, fpr = 0.2, 0.9, 0.02
flagged = tpr * spam + fpr * (1 - spam)
print(f"{tpr * spam / flagged:.3f}")
```
---
**Answer.** `0.18 / (0.18 + 0.016) = 0.918`.

**Why.** With a 20% base rate, the same detector performs far better than the disease test did at 1%. Precision depends on prevalence, and Chapter 3 returns to this.
:::

:::drill concept
What's the difference between MLE and MAP? When do they give the same answer?
---
MLE maximises `P(data | θ)`. MAP maximises `P(data | θ) P(θ)`, so it adds a prior. They match when the prior is uniform over the parameter range. They also converge as data grows, since the likelihood term grows with `n` while the prior stays fixed. In practice, a MAP estimate of a linear model with a Gaussian prior is ridge regression.
:::

:::drill tricky
"Covariance is zero, so the features are independent and I can treat them separately." What's wrong with that?
---
Zero covariance rules out only a linear relationship. `X` and `X²` with symmetric `X` have zero covariance and full dependence. There is one important exception: if variables are **jointly** Gaussian, zero covariance does imply independence. Being individually Gaussian isn't enough for that.
:::

:::drill output
Toss a coin with `P(heads) = 0.25` until the first head. What's the expected number of tosses, and the variance?

```python run=mf-c01-d-geom
import numpy as np
x = np.random.default_rng(0).geometric(0.25, 1_000_000)
print(f"{x.mean():.2f} {x.var():.2f}")
```
---
**Answer.** Mean `1/p = 4`, variance `(1-p)/p² = 12`, and the simulation agrees.

**Why.** A one-line derivation: `E = 1 + (1-p)E`, since you always toss once and with probability `1-p` you start over.
:::

:::drill tricky
"The 95% confidence interval is [2, 5], so there's a 95% probability the true mean is in [2, 5]." Is that correct?
---
Not in the frequentist framework that produced the interval. The true mean is fixed, and this interval either contains it or doesn't. The 95% describes the procedure: over many repeated samples, 95% of intervals built this way cover the true value. A Bayesian **credible interval** is the object that makes the statement you quoted, and it needs a prior.
:::

:::drill concept
Does the central limit theorem let you run a z-test on heavily skewed data with `n = 30`?
---
It may be a poor approximation. The theorem gives no fixed sample size, and the speed depends on the distribution, particularly its skew. For the exponential distribution in this chapter, the usual interval covers less than the nominal 95% at small `n`. With outliers or heavy tails, use more data, a transformation, a bootstrap, or a permutation test. If the variance is infinite, the classical theorem doesn't apply at all.
:::

:::drill output
Without running it: what are the eigenvalues of `A²` and of `A + 3I`, for `A = [[2, 1], [1, 2]]`? What are the singular values of `[[1, 0], [0, -2]]`?

```python run=mf-c01-d-eig
import numpy as np
A = np.array([[2.0, 1.0], [1.0, 2.0]])
print(np.linalg.eigvalsh(A @ A).round(3).tolist())
print(np.linalg.eigvalsh(A + 3 * np.eye(2)).round(3).tolist())
print(np.linalg.svd(np.array([[1.0, 0.0], [0.0, -2.0]]), compute_uv=False).round(3).tolist())
```
---
**Answer.** `A` has eigenvalues 1 and 3, so `A²` has 1 and 9, and `A + 3I` has 4 and 6, with the same eigenvectors.

**Why.** Singular values are non-negative. For a symmetric matrix they are the absolute values of the eigenvalues, so the result is 2 and 1.
:::

:::drill concept
What's the difference between eigendecomposition and SVD?
---
Eigendecomposition applies to square matrices, and not all of those can be diagonalised. Its eigenvectors need not be orthogonal, and eigenvalues can be negative or complex. SVD exists for every matrix of any shape, with orthonormal `U` and `V` and non-negative singular values. For a symmetric PSD matrix, the two coincide. `V` holds eigenvectors of `AᵀA`, and `U` holds eigenvectors of `AAᵀ`.
:::

:::drill bug
Why is the first component wrong here?

```python run=mf-c01-d-pcabug
import numpy as np

rng = np.random.default_rng(0)
height_cm = rng.normal(170, 8, 300)
weight_kg = 0.9 * (height_cm - 170) + 70 + rng.normal(0, 5, 300)
X = np.c_[height_cm, weight_kg]

_, s, Vt = np.linalg.svd(X, full_matrices=False)
print("variance share", (s[0]**2 / np.sum(s**2)).round(4))
print("PC1", (Vt[0] * np.sign(Vt[0, 0])).round(3).tolist())

Xc = X - X.mean(axis=0)
_, s, Vt = np.linalg.svd(Xc, full_matrices=False)
print("centred share", (s[0]**2 / np.sum(s**2)).round(4))
print("centred PC1", (Vt[0] * np.sign(Vt[0, 0])).round(3).tolist())
```
---
**Bug.** The data wasn't centred. SVD on raw data measures variation around the origin, so PC1 mostly points at the mean `(170, 70)` and "explains" nearly all the variance. Centred, the true direction and a realistic variance share appear.

**Follow-up.** These two features have different units, so you should usually standardise them as well. Then the components come from the correlation matrix.
:::

:::drill bug
The same logistic regression trains twice on the same data, and one run ends up noticeably worse. Find the bug.

```python run=mf-c01-d-shuffle
import numpy as np

rng = np.random.default_rng(0)
n = 2000
y = np.r_[np.zeros(n // 2), np.ones(n // 2)]            # sorted by label
X = np.c_[rng.normal(2 * y - 1, 1.0), np.ones(n)]

def train(shuffle):
    r = np.random.default_rng(1)
    w = np.zeros(2)
    for _ in range(3):
        order = r.permutation(n) if shuffle else np.arange(n)
        for s in range(0, n, 32):
            b = order[s:s + 32]
            p = 1 / (1 + np.exp(-X[b] @ w))
            w -= 0.5 * X[b].T @ (p - y[b]) / len(b)
    pred = X @ w > 0
    return np.mean(pred == y), pred.mean()

for shuffle in (False, True):
    acc, pos = train(shuffle)
    print(f"shuffle={shuffle!s:5} accuracy {acc:.3f}  predicted positive {pos:.3f}")
```
---
**Bug.** The data is sorted by label and never shuffled. Each mini-batch holds one class, so the bias term chases the current class and the batches stop being unbiased estimates of the full gradient. The model ends each epoch straight after a long run of positives, so it predicts positive too often, although the classes are balanced.

**Fix.** Shuffle every epoch. Sorted files are a common real-world cause of this, and so are data shards split by date or source.
:::

:::drill tricky
Why don't we train logistic regression with MSE on the sigmoid output?
---
MSE on a sigmoid is not convex in the weights, so gradient descent can get stuck. It also has a saturation problem: the gradient contains the factor `p(1-p)`, so a confidently wrong prediction gets a near-zero gradient. Cross-entropy cancels that factor, and its gradient is `(p - y) x`, which stays large when the model is badly wrong. It's also the MLE for a Bernoulli label, which makes it the natural choice.

```python run=mf-c01-d-mse
import math

x, y, w = 1.0, 1.0, -8.0    # confidently wrong: p near 0, label 1
p = 1 / (1 + math.exp(-w * x))
print(f"p = {p:.5f}")
print(f"MSE gradient magnitude: {abs(2 * (p - y) * p * (1 - p) * x):.5f}")
print(f"cross-entropy gradient magnitude: {abs((p - y) * x):.5f}")
```
:::

:::drill concept
Why might you pick SGD with momentum over Adam, or Adam over SGD?
---
Adam needs less tuning, handles differently scaled and sparse gradients, and usually gets going faster, so it's a good default for prototyping and for transformers. SGD with momentum and a learning-rate schedule is still widely used in vision training, and in some settings it has been reported to generalise better, though that depends on the setup. The honest answer is to try both on validation data with a tuned learning rate. Learning rate is usually the first hyperparameter to tune for either.
:::

:::drill tricky
You double the batch size and leave the learning rate alone. What changes? What about gradient noise, updates per epoch and memory?
---
Gradient noise falls by a factor of `√2`. Updates per epoch are cut in half, so with an unchanged learning rate you make less progress per epoch, although each update is more accurate. Memory per step doubles. Parallel hardware often means an epoch takes less wall-clock time. Very large batches often need a larger learning rate with a warm-up to train at the same speed per epoch.
:::

:::drill tricky
Is a Hessian with one zero eigenvalue and the rest positive at a critical point a minimum?
---
You can't tell from second derivatives alone. A zero eigenvalue means a flat direction at second order, and higher-order terms decide. `f(x, y) = x² + y⁴` has a minimum at the origin, and `f(x, y) = x² + y³` doesn't, while both have Hessian eigenvalues 2 and 0 there. A positive definite Hessian (all eigenvalues above 0) is sufficient for a local minimum, and a PSD Hessian is only necessary.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1200
Write a `PCA` class with `fit`, `transform` and `inverse_transform`, using SVD and a stable sign. Show that the reconstruction error for `k` components equals the variance you dropped.
---
Save the training mean and reuse it in `transform`. Refitting the mean on new data is a leak, and it also moves the origin.

```python run=mf-c01-c-pca
import numpy as np

class PCA:
    def __init__(self, k):
        self.k = k

    def fit(self, X):
        self.mean = X.mean(axis=0)
        _, s, Vt = np.linalg.svd(X - self.mean, full_matrices=False)
        idx = np.abs(Vt).argmax(axis=1)
        self.comps = (Vt * np.sign(Vt[range(len(Vt)), idx])[:, None])[:self.k]
        self.var = s**2 / (len(X) - 1)
        return self

    def transform(self, X):
        return (X - self.mean) @ self.comps.T

    def inverse_transform(self, Z):
        return Z @ self.comps + self.mean

rng = np.random.default_rng(3)
X = rng.normal(size=(1000, 6)) @ np.diag([5, 3, 1, 0.5, 0.2, 0.1]) @ np.linalg.qr(rng.normal(size=(6, 6)))[0]
for k in (1, 2, 3, 6):
    m = PCA(k).fit(X)
    rec = m.inverse_transform(m.transform(X))
    err = np.sum((X - rec)**2) / (len(X) - 1)
    print(f"k={k} reconstruction {err:7.3f}  dropped variance {m.var[k:].sum():7.3f}")
```
:::

:::drill code rating=1300
Train logistic regression with mini-batch Adam from scratch and print the loss and accuracy every few epochs. Use an appropriate epsilon to protect the log.
---
Clipping `p` keeps the log finite. Keep the Adam state per parameter and count `t` from 1 so the bias correction is correct on the first step.

```python run=mf-c01-c-adam
import numpy as np

rng = np.random.default_rng(9)
n = 1000
X = rng.normal(size=(n, 3))
w_true = np.array([2.0, -3.0, 0.5])
y = (rng.random(n) < 1 / (1 + np.exp(-(X @ w_true + 0.5)))).astype(float)
Xb = np.c_[X, np.ones(n)]

def loss(w):
    p = np.clip(1 / (1 + np.exp(-Xb @ w)), 1e-12, 1 - 1e-12)
    return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))

w, m, s, t = np.zeros(4), np.zeros(4), np.zeros(4), 0
b1, b2, lr = 0.9, 0.999, 0.05
for epoch in range(1, 21):
    order = rng.permutation(n)
    for i in range(0, n, 64):
        b = order[i:i + 64]
        g = Xb[b].T @ (1 / (1 + np.exp(-Xb[b] @ w)) - y[b]) / len(b)
        t += 1
        m = b1 * m + (1 - b1) * g
        s = b2 * s + (1 - b2) * g * g
        w -= lr * (m / (1 - b1**t)) / (np.sqrt(s / (1 - b2**t)) + 1e-8)
    if epoch in (1, 5, 20):
        print(f"epoch {epoch:2}: loss {loss(w):.3f}  accuracy {np.mean((Xb @ w > 0) == y):.3f}")
print("weights", w.round(1).tolist())
```

The fitted weights land near the true values of `[2, -3, 0.5]` and intercept `0.5`. Sampling noise and a constant step size prevent an exact match.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- Bayes: `posterior ∝ likelihood × prior`. Low base rates produce mostly false alarms. Count people to check.
- Expectation is always linear. Variance of a sum needs covariance. Zero covariance does not imply independence.
- MLE maximises the likelihood, MAP adds a prior. Gaussian noise gives MSE, Bernoulli gives cross-entropy, Gaussian prior gives L2, Laplace prior gives L1.
- CLT: the sample mean is roughly `Normal(μ, σ²/n)` given finite variance. Standard error is `σ/√n`.
- p-value: `P(data this extreme | H0)`. Type I is a false positive (`α`), type II a false negative (`β`), power is `1 - β`. Multiple tests and peeking inflate false positives.
- Symmetric matrix: real eigenvalues, orthonormal eigenvectors. Covariance is PSD. Eigenvalues sum to the trace and multiply to the determinant. Signs are arbitrary.
- SVD works for any matrix. `V` holds eigenvectors of `AᵀA`, and `s²` are their eigenvalues. Truncated SVD is the best low-rank approximation.
- PCA: centre, usually scale, SVD. Variance along component `i` is `s²/(n-1)`. It's unsupervised, linear, and fit on training data only.
- Convex means every local minimum is global. Linear regression with MSE and logistic regression with cross-entropy are convex. Check gradients numerically.
- GD on a quadratic is stable when `0 < η < 2/λ_max`. Condition number sets the speed, and scaling features reduces it.
- Momentum averages gradients. Adam adds per-parameter scaling and a bias correction. AdamW decouples weight decay. SGD noise falls as `1/√B`.
