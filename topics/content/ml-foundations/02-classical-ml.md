---
title: "Classical ML: linear models, trees, ensembles, clustering"
part: Part B · The models
lede: Tabular data is still where most campus interview questions live, and these models are why. For each one, this chapter gives the idea, the objective, what it assumes, how it fails, and which knob controls what. Then it ends with the question interviewers like most, which is choosing between them and defending the choice.
desc: linear and logistic regression, regularisation, bias-variance, SVM, decision trees, random forests, boosting, k-means, GMM, kNN, Naive Bayes, choosing a model
hours: 8
prereqs: Chapter 1 (MLE and MAP, gradients, convexity, eigenvalues)
---

## Linear regression {#ch02-linear .th}

Linear regression predicts `ŷ = Xw`, and it chooses `w` to minimise the squared error `‖y - Xw‖²`. Setting the gradient to zero gives the **normal equations**: `XᵀXw = Xᵀy`. If `XᵀX` is invertible, the solution is `w = (XᵀX)⁻¹Xᵀy`.

The geometric reading is worth saying out loud. `Xw` is a point in the space spanned by the columns of `X`, and the best fit is the orthogonal projection of `y` onto that space. So the residual is orthogonal to every column. With an intercept column, this also means the residuals sum to zero.

The classical assumptions are linearity, independent errors, constant error variance (homoscedasticity), and for exact inference, Gaussian errors. Prediction can work when some of these fail, while p-values and confidence intervals on coefficients rely on them more heavily.

```python run=mf-c02-ols
import numpy as np

rng = np.random.default_rng(0)
n = 200
X = rng.normal(size=(n, 2))
y = 3 + 2 * X[:, 0] - X[:, 1] + rng.normal(0, 0.5, n)
Xb = np.c_[np.ones(n), X]

w_normal = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)
w_lstsq = np.linalg.lstsq(Xb, y, rcond=None)[0]
res = y - Xb @ w_lstsq
print("normal equations", w_normal.round(3).tolist())
print("lstsq           ", w_lstsq.round(3).tolist())
print("residuals orthogonal to X:", bool(np.allclose(Xb.T @ res, 0, atol=1e-8)))
print(f"R^2 = {1 - np.sum(res**2) / np.sum((y - y.mean())**2):.3f}")

# Near-duplicate features: fit on two halves of the data
x1 = rng.normal(size=n)
Z = np.c_[x1, x1 + 0.001 * rng.normal(size=n)]
t = Z.sum(axis=1) + rng.normal(0, 0.5, n)
for name, idx in [("half A", np.arange(100)), ("half B", np.arange(100, 200))]:
    ols = np.linalg.lstsq(Z[idx], t[idx], rcond=None)[0]
    ridge = np.linalg.solve(Z[idx].T @ Z[idx] + np.eye(2), Z[idx].T @ t[idx])
    print(f"{name}: OLS {ols.round(1).tolist()}  ridge {ridge.round(2).tolist()}")
```

The first half confirms that both solvers agree and that the fit recovers the true `(3, 2, -1)`. In the second half, the two features are almost identical. OLS coefficients become huge and swing between the halves, although their **sum** stays close to the true value of 2, so predictions are fine and only the individual coefficients are meaningless. A small ridge penalty gives stable, shared coefficients.

:::trap Don't invert XᵀX in practice
Forming `XᵀX` squares the condition number. Libraries solve least squares with QR or SVD, as `np.linalg.lstsq` does. If an interviewer asks why, say "numerical stability". If they ask when `XᵀX` is singular, say "when columns are linearly dependent, or when there are more features than rows".
:::

## Logistic regression {#ch02-logistic .th}

Logistic regression models the **log-odds** as linear: `log(p / (1-p)) = xᵀw`. Inverting that gives `p = σ(xᵀw)`, where `σ` is the sigmoid. It's a linear classifier, since the boundary `xᵀw = 0` is a hyperplane, even though `p` is a curved function of `x`. A weight `wⱼ` means that one unit of `xⱼ` multiplies the odds by `exp(wⱼ)`, holding the others fixed.

Training minimises cross-entropy, which is the Bernoulli negative log-likelihood. It's convex, and its gradient is `Xᵀ(p - y) / n`. There's no closed form, so you use gradient methods or Newton's method. The multi-class version uses softmax.

If the classes are perfectly separable, the MLE doesn't exist: the loss keeps falling as the weights grow without limit.

```python run=mf-c02-logistic
import math

xs, ys = [-2.0, -1.0, 1.0, 2.0], [0, 0, 1, 1]

def train(l2, steps, lr=0.1):
    w = 0.0
    for _ in range(steps):
        g = sum((1 / (1 + math.exp(-w * x)) - y) * x for x, y in zip(xs, ys)) / len(xs)
        w -= lr * (g + l2 * w)
    loss = -sum(math.log(1 / (1 + math.exp(-w * x * (2 * y - 1)))) for x, y in zip(xs, ys)) / len(xs)
    return w, loss

print("  steps   no penalty       L2 = 0.01")
for steps in (10, 100, 1000, 10000, 100000):
    a, la = train(0.0, steps)
    b, _ = train(0.01, steps)
    print(f"{steps:7}   w={a:5.2f} loss={la:.4f}   w={b:5.2f}")
```

Without a penalty, the weight keeps growing, slowly, and the loss creeps towards zero. Predicted probabilities head to 0 and 1 with no justification. A small L2 penalty gives a finite answer, which stops changing once it's reached.

## Regularisation {#ch02-reg .th}

Regularisation adds a penalty on large weights, which trades a little bias for less variance.

- **Ridge (L2)**: penalty `λ‖w‖²`. Closed form `w = (XᵀX + λI)⁻¹Xᵀy`. It shrinks all weights smoothly, rarely to exactly zero. `XᵀX + λI` is always invertible for `λ > 0`.
- **Lasso (L1)**: penalty `λ‖w‖₁`. No closed form. It sets some weights to exactly zero, so it also selects features. With correlated features, it tends to keep one and drop the rest, somewhat arbitrarily.
- **Elastic net**: both penalties. It keeps L1's sparsity and shares weight among correlated features better.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 345" role="img" aria-label="Two panels. Elliptical loss contours around the unconstrained optimum touch a diamond at a corner on the w2 axis, and touch a circle away from the axes.">
  <path d="M10.0 215.0 L 280.0 215.0" class="d-grid"/><path d="M130.0 325.0 L 130.0 75.0" class="d-grid"/><text x="282" y="219" class="t-small">w1</text><text x="134" y="73" class="t-small">w2</text><path d="M130 145 L 200 215 L 130 285 L 60 215 Z" class="d-acc"/><ellipse cx="225" cy="95" rx="121.0" ry="80.7" class="d-line"/><ellipse cx="225" cy="95" rx="79.9" ry="53.3" class="d-line"/><ellipse cx="225" cy="95" rx="39.9" ry="26.6" class="d-line"/><circle cx="225" cy="95" r="3.5" class="d-fill-ink"/><circle cx="130.0" cy="145.0" r="5" class="d-fill-trap"/><text x="10" y="315" class="t-mono">L1 constraint</text><text x="10" y="333" class="t-small">touches at a corner: w1 = 0</text><path d="M360.0 215.0 L 630.0 215.0" class="d-grid"/><path d="M480.0 325.0 L 480.0 75.0" class="d-grid"/><text x="632" y="219" class="t-small">w1</text><text x="484" y="73" class="t-small">w2</text><circle cx="480" cy="215" r="70" class="d-key"/><ellipse cx="575" cy="95" rx="107.1" ry="71.4" class="d-line"/><ellipse cx="575" cy="95" rx="70.7" ry="47.1" class="d-line"/><ellipse cx="575" cy="95" rx="35.3" ry="23.6" class="d-line"/><circle cx="575" cy="95" r="3.5" class="d-fill-ink"/><circle cx="511.1" cy="152.3" r="5" class="d-fill-trap"/><text x="360" y="315" class="t-mono">L2 constraint</text><text x="360" y="333" class="t-small">touches off the axes: both non-zero</text>
</svg></div><figcaption><b>Why L1 gives zeros.</b> The small dark dot is the unconstrained optimum, and the larger coloured dot is the regularised solution. The same loss contours meet the L1 diamond at a corner, where <code>w1 = 0</code>, and meet the L2 circle at a point where both weights are non-zero.</figcaption></figure>

The geometry explains the difference. Minimising loss plus penalty is equivalent to minimising the loss inside a constraint region. Loss contours grow outward from the unconstrained optimum until they touch the region. L1's diamond has corners on the axes, so the first contact is often at a corner, where a weight is exactly zero. L2's circle has no corners. An algebraic explanation agrees: the L1 penalty's slope stays constant near zero, so it can pin a small weight at zero, while the L2 slope `2λw` vanishes there.

```python run=mf-c02-reg
import numpy as np

rng = np.random.default_rng(1)
n, d = 100, 10
X = rng.normal(size=(n, d))
X = (X - X.mean(axis=0)) / X.std(axis=0)
y = X[:, 0] * 3 - 2 * X[:, 1] + 1.5 * X[:, 2] + rng.normal(0, 1, n)
y = y - y.mean()

def lasso(lam, iters=300):
    w, r = np.zeros(d), y.copy()
    for _ in range(iters):
        for j in range(d):
            r += X[:, j] * w[j]
            rho = X[:, j] @ r / n
            w[j] = np.sign(rho) * max(abs(rho) - lam, 0.0)   # columns have unit variance
            r -= X[:, j] * w[j]
    return w + 0.0

def ridge(lam):
    return np.linalg.solve(X.T @ X / n + lam * np.eye(d), X.T @ y / n)

fmt = lambda w: " ".join(f"{v:+.2f}" for v in w)
print("true    +3.00 -2.00 +1.50 " + " ".join(["+0.00"] * 7))
print("lasso  ", fmt(lasso(0.3)))
print("ridge  ", fmt(ridge(0.3)))
print("lambda  lasso zeros  ridge zeros")
for lam in (0.01, 0.1, 0.3, 1.0, 3.0):
    print(f"{lam:6}  {int(np.sum(lasso(lam) == 0)):11}  {int(np.sum(ridge(lam) == 0)):11}")
```

The penalties use `(1/2n)‖y - Xw‖² + λ‖w‖₁` and `(1/2n)‖y - Xw‖² + (λ/2)‖w‖²`. Lasso zeros out irrelevant features exactly at this `λ`, and shrinks the rest. Ridge scales everything down and never reaches exactly zero. Both results show the bias that regularisation adds, since the large coefficients come out smaller than the truth.

:::trap Scale first, and leave the intercept alone
The penalty treats all weights alike, so a feature in small units needs a large weight and gets punished more. Standardise features before ridge, lasso, SVM or kNN, using statistics from the training data only. Don't penalise the intercept: it would make predictions depend on the shift of `y`.
:::

## Bias and variance {#ch02-bv .th}

For squared loss, the expected test error at a point splits into three parts, with the expectation over training sets:

```text
E[(y - f̂(x))²] = (E[f̂(x)] - f(x))²  +  Var[f̂(x)]  +  σ²
                  bias²                variance       irreducible noise
```

**Bias** is the error from the model family being unable to represent the truth, even with infinite training sets. **Variance** is how much the fit changes between training sets. The simulation below draws 2000 training sets, each with 25 points from `sin(2πx)` plus noise, and fits polynomials of different degrees.

```python run=mf-c02-bv
import numpy as np
from numpy.polynomial import chebyshev as ch

rng = np.random.default_rng(0)
f = lambda x: np.sin(2 * np.pi * x)
sigma, runs = 0.3, 2000
x = np.linspace(0, 1, 25)              # the same 25 inputs in every training set
grid = np.linspace(0.02, 0.98, 50)

print("degree  train   bias^2  variance  noise   sum    test")
for deg in (1, 2, 3, 5, 7, 9, 12, 15, 18):
    Y = f(x) + rng.normal(0, sigma, (runs, 25))
    c = ch.chebfit(2 * x - 1, Y.T, deg)  # Chebyshev basis: same fits as powers of x, better numerics
    train = np.mean((ch.chebval(2 * x - 1, c) - Y)**2)
    preds = ch.chebval(2 * grid - 1, c)
    bias2 = np.mean((preds.mean(axis=0) - f(grid))**2)
    var = preds.var(axis=0).mean()
    test = np.mean((preds - (f(grid) + rng.normal(0, sigma, preds.shape)))**2)
    print(f"{deg:6}  {train:.3f}  {bias2:6.3f}  {var:8.3f}  {sigma**2:.3f}  {bias2 + var + sigma**2:5.3f}  {test:5.3f}")
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 640 300" role="img" aria-label="Line chart against polynomial degree: bias squared drops to near zero by degree 3, variance rises with degree, and test error falls then rises.">
  <path d="M50.0 200.0 L 520.0 200.0" class="d-grid"/><text x="44" y="204" text-anchor="end" class="t-small">0.1</text><path d="M50.0 140.0 L 520.0 140.0" class="d-grid"/><text x="44" y="144" text-anchor="end" class="t-small">0.2</text><path d="M50.0 80.0 L 520.0 80.0" class="d-grid"/><text x="44" y="84" text-anchor="end" class="t-small">0.3</text><path d="M50.0 20.0 L 520.0 20.0" class="d-grid"/><text x="44" y="24" text-anchor="end" class="t-small">0.4</text><path d="M50.0 260.0 L 520.0 260.0" class="d-line"/><path d="M50.0 20.0 L 50.0 260.0" class="d-line"/><text x="44" y="264" text-anchor="end" class="t-small">0</text><text x="50" y="276" text-anchor="middle" class="t-small">1</text><text x="78" y="276" text-anchor="middle" class="t-small">2</text><text x="105" y="276" text-anchor="middle" class="t-small">3</text><text x="161" y="276" text-anchor="middle" class="t-small">5</text><text x="216" y="276" text-anchor="middle" class="t-small">7</text><text x="271" y="276" text-anchor="middle" class="t-small">9</text><text x="354" y="276" text-anchor="middle" class="t-small">12</text><text x="437" y="276" text-anchor="middle" class="t-small">15</text><text x="520" y="276" text-anchor="middle" class="t-small">18</text><text x="285.0" y="294" text-anchor="middle" class="t-small">polynomial degree</text><path d="M50.0 206.0 L 520.0 206.0" class="d-line d-dash"/><text x="526" y="210" class="t-small">noise 0.09</text><path d="M50.0 145.5 L 77.6 145.4 L 105.3 257.1 L 160.6 260.0 L 215.9 260.0 L 271.2 260.0 L 354.1 260.0 L 437.1 260.0 L 520.0 258.2" class="d-line-acc"/>
  <circle cx="50.0" cy="145.5" r="3" class="d-fill-acc"/><circle cx="77.6" cy="145.4" r="3" class="d-fill-acc"/><circle cx="105.3" cy="257.1" r="3" class="d-fill-acc"/><circle cx="160.6" cy="260.0" r="3" class="d-fill-acc"/><circle cx="215.9" cy="260.0" r="3" class="d-fill-acc"/><circle cx="271.2" cy="260.0" r="3" class="d-fill-acc"/><circle cx="354.1" cy="260.0" r="3" class="d-fill-acc"/><circle cx="437.1" cy="260.0" r="3" class="d-fill-acc"/><circle cx="520.0" cy="258.2" r="3" class="d-fill-acc"/><path d="M50.0 255.9 L 77.6 254.3 L 105.3 252.5 L 160.6 249.0 L 215.9 245.3 L 271.2 241.0 L 354.1 231.9 L 437.1 201.0 L 520.0 20.0" class="d-line-key"/><circle cx="50.0" cy="255.9" r="3" class="d-fill-key"/><circle cx="77.6" cy="254.3" r="3" class="d-fill-key"/><circle cx="105.3" cy="252.5" r="3" class="d-fill-key"/><circle cx="160.6" cy="249.0" r="3" class="d-fill-key"/><circle cx="215.9" cy="245.3" r="3" class="d-fill-key"/><circle cx="271.2" cy="241.0" r="3" class="d-fill-key"/><circle cx="354.1" cy="231.9" r="3" class="d-fill-key"/><circle cx="437.1" cy="201.0" r="3" class="d-fill-key"/><circle cx="520.0" cy="20.0" r="3" class="d-fill-key"/><path d="M50.0 87.3 L 77.6 85.6 L 105.3 195.2 L 160.6 195.0 L 215.9 191.5 L 271.2 186.7 L 354.1 177.8 L 437.1 147.3 L 520.0 20.0" class="d-line-trap"/><circle cx="50.0" cy="87.3" r="3" class="d-fill-trap"/><circle cx="77.6" cy="85.6" r="3" class="d-fill-trap"/><circle cx="105.3" cy="195.2" r="3" class="d-fill-trap"/><circle cx="160.6" cy="195.0" r="3" class="d-fill-trap"/>
  <circle cx="215.9" cy="191.5" r="3" class="d-fill-trap"/><circle cx="271.2" cy="186.7" r="3" class="d-fill-trap"/><circle cx="354.1" cy="177.8" r="3" class="d-fill-trap"/><circle cx="437.1" cy="147.3" r="3" class="d-fill-trap"/><circle cx="520.0" cy="20.0" r="3" class="d-fill-trap"/><text x="526" y="32" class="t-mono t-trap">test MSE</text><text x="526" y="50" class="t-mono t-key">variance</text><text x="526" y="68" class="t-mono t-acc">bias²</text>
</svg></div><figcaption><b>The numbers from the table above.</b> Bias drops once the model can represent the curve, and variance rises slowly and then sharply. Test error is their sum plus the noise floor. The y-axis is cut off at 0.4, so degree 18 runs off the top.</figcaption></figure>

The bias, variance and noise columns add up to the measured test error, as the formula says. Degrees 1 and 2 underfit, with bias² near 0.19. A quadratic term doesn't help here, since `sin(2πx)` is antisymmetric around `x = 0.5`. Degree 3 removes almost all the bias and has the lowest test error, tied with degree 5. Past that, variance grows while training error keeps falling, and by degree 18 the fit oscillates near the edges and test error is far above the noise level. Training error alone would have picked degree 18.

How to respond depends on the diagnosis. If both training and validation error are high, you likely have **high bias**: add features, use a more flexible model, or reduce regularisation. If training error is low and validation error is much higher, you likely have **high variance**: get more data, regularise, simplify or bag. More data helps with variance and doesn't fix bias.

:::tip Beyond the classic U-shape
The decomposition above is exact for squared loss. For 0-1 loss, no equally clean additive version exists. Very overparameterised models such as large neural networks can also show test error falling again past the point where they fit the training data perfectly, which is called **double descent**. For tree ensembles and linear models at this level, the U-shape is the right starting picture.
:::

## SVM intuition {#ch02-svm .th}

A linear **support vector machine** looks for the separating hyperplane with the largest **margin**, the distance to the closest training points. The margin width is `2/‖w‖`, so maximising it means minimising `‖w‖²`. The soft-margin version allows violations:

```text
minimise  ½‖w‖² + C Σ max(0, 1 - yᵢ xᵢᵀw)     yᵢ in {-1, +1}
```

The second term is the **hinge loss**. It's zero for points beyond the margin on the correct side, so only points on or inside the margin affect the solution. These are the **support vectors**. `C` controls the trade-off: large `C` punishes violations and risks overfitting, and small `C` gives a wider margin and more regularisation. Written as loss plus penalty, this looks like L2-regularised logistic regression with a different loss. An SVM's raw output is a distance, not a probability, so calibration (Platt scaling, see [Chapter 3](#ch03)) is needed to get probabilities.

The **kernel trick** rests on one observation: training and prediction can be written using only dot products between points. Replace `xᵀz` with a function `k(x, z)` that equals a dot product in some feature space, and you get a non-linear boundary without ever computing those features. The RBF kernel `exp(-γ‖x - z‖²)` corresponds to an infinite-dimensional space. `γ` sets the reach of each point: large `γ` gives very local, wiggly boundaries.

```python run=mf-c02-svm
import numpy as np

# The kernel equals a dot product in a feature space we never build.
phi = lambda v: np.array([v[0]**2, np.sqrt(2) * v[0] * v[1], v[1]**2])
a, b = np.array([1.0, 2.0]), np.array([3.0, -1.0])
print(f"phi(a).phi(b) = {phi(a) @ phi(b):.3f}   (a.b)^2 = {(a @ b)**2:.3f}")

rng = np.random.default_rng(0)
def circles(n):
    X = rng.normal(size=(n, 2))
    y = np.where(np.sum(X**2, axis=1) < 1.4, 1, -1)
    return X, y

Xtr, ytr = circles(300)
Xte, yte = circles(1000)

def rbf(gamma):
    return lambda A, B: np.exp(-gamma * ((A[:, None, :] - B[None, :, :])**2).sum(axis=2))

def perceptron(k, epochs=20):
    K = k(Xtr, Xtr)
    alpha = np.zeros(len(Xtr))
    for _ in range(epochs):
        for i in range(len(Xtr)):
            if ytr[i] * ((alpha * ytr) @ K[i]) <= 0:
                alpha[i] += 1
    return lambda X: np.sign((alpha * ytr) @ k(Xtr, X))

models = [("linear", lambda A, B: A @ B.T)] + [(f"rbf gamma={g}", rbf(g)) for g in (0.1, 1.0, 100.0)]
for name, k in models:
    pred = perceptron(k)
    print(f"{name:16} train {np.mean(pred(Xtr) == ytr):.3f}  test {np.mean(pred(Xte) == yte):.3f}")
```

This uses a kernel perceptron, a simpler relative of the SVM with the same kernel idea and no margin maximisation. A linear boundary can't separate a disc from its surroundings. An RBF kernel can, and it works best at a moderate `γ`. At `γ = 100`, each point only influences its immediate neighbourhood. Training accuracy reaches 1.000 and test accuracy drops, an effect of the kernel width alone. It shows up more strongly on noisier data.

Training a kernel SVM usually scales between quadratically and cubically in the number of samples, so kernels are a poor fit for millions of rows. Prediction costs one kernel evaluation per support vector.

## Decision trees {#ch02-trees .th}

A tree repeatedly picks the feature and threshold that best purify the child nodes. Common impurity measures for classification:

```text
Gini    = 1 - Σ pₖ²
Entropy = -Σ pₖ log₂ pₖ
Gain    = impurity(parent) - weighted average of impurity(children)
```

Regression trees use variance reduction, and predict the mean in each leaf. Finding the best tree is NP-hard, so the greedy search makes the locally best split and never revisits it. Gini and entropy usually pick very similar splits.

```python run=mf-c02-tree
import numpy as np

def gini(y):
    if len(y) == 0:
        return 0.0
    p = np.mean(y)
    return 1 - p**2 - (1 - p)**2

def gain(y, mask):
    return gini(y) - mask.mean() * gini(y[mask]) - (1 - mask.mean()) * gini(y[~mask])

y = np.array([1, 1, 1, 1, 0, 0, 0, 0, 1, 0])
a = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 1], dtype=bool)
b = np.array([1, 1, 0, 0, 1, 1, 0, 0, 1, 0], dtype=bool)
print(f"parent gini {gini(y):.3f}  gain A {gain(y, a):.3f}  gain B {gain(y, b):.3f}")

# XOR: neither first split helps, though a depth-2 tree solves it.
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]] * 5, dtype=bool)
y = X[:, 0] ^ X[:, 1]
print(f"XOR gain on x0 {gain(y.astype(float), X[:, 0]):.3f}  on x1 {gain(y.astype(float), X[:, 1]):.3f}")
left = X[:, 0]
print(f"after splitting on x0, gain on x1: {gain(y[left].astype(float), X[left, 1]):.3f}, {gain(y[~left].astype(float), X[~left, 1]):.3f}")

# A row ID separates anything, and it means nothing.
rng = np.random.default_rng(0)
labels = rng.integers(0, 2, 1000).astype(float)
noise = rng.random(1000) < 0.5
print(f"random labels: gain of a binary noise feature {gain(labels, noise):.4f}")
print(f"random labels: total gain if each row ID gets its own leaf {gini(labels):.4f}")
```

The first line shows `A` is a better split than `B`. The XOR case shows the weakness of greedy search: neither feature gives any gain at the root, even though two levels solve it perfectly. A real implementation splits anyway when allowed to, then finds the structure at the next level, but a rule such as "stop if gain is below a threshold" would miss it. The last lines show why impurity-based importance is biased: a feature with many unique values can reach near-perfect purity on training data, even when it's unrelated to the target.

**Controlling overfitting:** limit depth, require a minimum number of samples per leaf or split, or grow a full tree and prune it back (cost-complexity pruning). Trees need no feature scaling, since splits depend only on order. They handle mixed types and interactions, and are easy to explain. Their boundaries are axis-aligned staircases, they're unstable (small data changes can give a different tree), and a regression tree can't predict outside the range of targets seen in training.

## Random forests {#ch02-forest .th}

**Bagging** (bootstrap aggregating) trains many models on bootstrap samples and averages them. A **random forest** is bagging of deep trees, plus one extra idea: each split considers only a random subset of features, often `√d` for classification. This de-correlates the trees.

Why that matters: the average of `B` identically distributed estimators, each with variance `σ²` and pairwise correlation `ρ`, has this variance:

```text
Var(average) = ρσ² + (1 - ρ)σ²/B
```

More trees shrink only the second term. The first term is a floor set by correlation, so reducing `ρ` is the point of feature subsampling. Each bootstrap sample leaves out about `1/e ≈ 36.8%` of rows. Those **out-of-bag** rows give a validation estimate without a separate split.

```python run=mf-c02-rf
import numpy as np

rng = np.random.default_rng(0)
print("share of rows left out of a bootstrap sample")
for n in (10, 100, 10000):
    left = np.mean([1 - len(np.unique(rng.integers(0, n, n))) / n for _ in range(300)])
    print(f"  n={n:<6} simulated {left:.3f}  (1-1/n)^n {(1 - 1 / n)**n:.3f}")

print("variance of an average of B correlated estimators (sigma^2 = 1)")
print("   rho     B   simulated  formula")
for rho in (0.0, 0.3, 0.7):
    for B in (1, 10, 100):
        z = np.sqrt(rho) * rng.normal(size=(40_000, 1)) + np.sqrt(1 - rho) * rng.normal(size=(40_000, B))
        print(f"{rho:6} {B:5} {z.mean(axis=1).var():10.3f} {rho + (1 - rho) / B:8.3f}")
```

Adding trees to a forest doesn't cause overfitting in the sense of raising test error: the score levels off, and more trees only cost time. A forest can still overfit if its individual trees memorise noise, which `min_samples_leaf` and similar settings control. Forests are good defaults because they need little tuning.

## Boosting {#ch02-boost .th}

Bagging trains independent models in parallel, and mostly reduces variance. **Boosting** trains models in sequence, each one correcting its predecessors. It usually starts from shallow trees (high bias), and mostly reduces bias.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 450 322" role="img" aria-label="Two diagrams. Bagging trains four deep trees on separate bootstrap samples and averages them. Boosting trains four shallow trees in sequence, each fitted to the errors so far, and adds them.">
  <text x="10" y="18" class="t-small">bagging: independent models on bootstrap samples, averaged</text><rect x="10" y="28" width="76" height="34" rx="5" class="d-soft"/><text x="48.0" y="49" text-anchor="middle" class="t-mono">sample 1</text><rect x="10" y="84" width="76" height="34" rx="5" class="d-acc"/><text x="48.0" y="105" text-anchor="middle" class="t-mono">deep tree</text><path d="M48.0 62.0 L 48.0 84.0" class="d-line"/><path d="M48.0 118.0 L 190.0 150.0" class="d-line"/><rect x="100" y="28" width="76" height="34" rx="5" class="d-soft"/><text x="138.0" y="49" text-anchor="middle" class="t-mono">sample 2</text><rect x="100" y="84" width="76" height="34" rx="5" class="d-acc"/><text x="138.0" y="105" text-anchor="middle" class="t-mono">deep tree</text><path d="M138.0 62.0 L 138.0 84.0" class="d-line"/><path d="M138.0 118.0 L 190.0 150.0" class="d-line"/><rect x="190" y="28" width="76" height="34" rx="5" class="d-soft"/><text x="228.0" y="49" text-anchor="middle" class="t-mono">sample 3</text><rect x="190" y="84" width="76" height="34" rx="5" class="d-acc"/><text x="228.0" y="105" text-anchor="middle" class="t-mono">deep tree</text><path d="M228.0 62.0 L 228.0 84.0" class="d-line"/><path d="M228.0 118.0 L 190.0 150.0" class="d-line"/><rect x="280" y="28" width="76" height="34" rx="5" class="d-soft"/><text x="318.0" y="49" text-anchor="middle" class="t-mono">sample 4</text><rect x="280" y="84" width="76" height="34" rx="5" class="d-acc"/><text x="318.0" y="105" text-anchor="middle" class="t-mono">deep tree</text>
  <path d="M318.0 62.0 L 318.0 84.0" class="d-line"/><path d="M318.0 118.0 L 190.0 150.0" class="d-line"/><rect x="130" y="150" width="120" height="32" rx="5" class="d-key"/><text x="190.0" y="170" text-anchor="middle" class="t-mono">average</text><text x="10" y="212" class="t-small">boosting: each shallow tree fits what the current model still gets wrong</text><rect x="10" y="222" width="76" height="34" rx="5" class="d-acc"/><text x="48.0" y="243" text-anchor="middle" class="t-mono">tree 1</text><path d="M86.0 239.0 L 124.0 239.0" class="d-line"/><text x="105" y="233" text-anchor="middle" class="t-small">errors</text><path d="M48.0 256.0 L 48.0 282.0" class="d-line"/><rect x="124" y="222" width="76" height="34" rx="5" class="d-acc"/><text x="162.0" y="243" text-anchor="middle" class="t-mono">tree 2</text><path d="M200.0 239.0 L 238.0 239.0" class="d-line"/><text x="219" y="233" text-anchor="middle" class="t-small">errors</text><path d="M162.0 256.0 L 162.0 282.0" class="d-line"/><rect x="238" y="222" width="76" height="34" rx="5" class="d-acc"/><text x="276.0" y="243" text-anchor="middle" class="t-mono">tree 3</text><path d="M314.0 239.0 L 352.0 239.0" class="d-line"/><text x="333" y="233" text-anchor="middle" class="t-small">errors</text><path d="M276.0 256.0 L 276.0 282.0" class="d-line"/><rect x="352" y="222" width="76" height="34" rx="5" class="d-acc"/><text x="390.0" y="243" text-anchor="middle" class="t-mono">tree 4</text><path d="M390.0 256.0 L 390.0 282.0" class="d-line"/>
  <rect x="10" y="282" width="418" height="30" rx="5" class="d-key"/><text x="219.0" y="301" text-anchor="middle" class="t-mono">F = F0 + lr*tree1 + lr*tree2 + lr*tree3 + lr*tree4</text>
</svg></div><figcaption><b>Parallel and sequential ensembles.</b> Bagging reduces variance, and boosting reduces bias.</figcaption></figure>

**AdaBoost** reweights the data: misclassified points get more weight, and each weak learner gets a vote `α = ½ ln((1-ε)/ε)` based on its weighted error `ε`. It can be shown to minimise an exponential loss in a stagewise manner, and that explains its sensitivity to outliers and label noise.

**Gradient boosting** generalises this to any differentiable loss. Each round fits a small tree to the **negative gradient** of the loss at the current predictions, and adds it with a small step:

```text
F₀(x) = constant
rᵢ    = -∂L(yᵢ, F(xᵢ)) / ∂F           for squared loss: yᵢ - F(xᵢ), the residual
hₘ    = tree fitted to r
Fₘ(x) = Fₘ₋₁(x) + η hₘ(x)
```

For squared loss, "fit the gradient" is the same as "fit the residuals", and that's where most explanations stop. For log loss, the targets are `y - p`. XGBoost, LightGBM and CatBoost are widely used open-source implementations. XGBoost uses second derivatives and an explicit regularisation term, LightGBM uses histogram-based splits and grows trees leaf-wise, and CatBoost has specific handling for categorical features.

```python run=mf-c02-boost
import numpy as np

rng = np.random.default_rng(0)
f = lambda x: np.sin(x) + 0.3 * x
xtr = rng.uniform(0, 10, 200)
ytr = f(xtr) + rng.normal(0, 0.3, 200)
xte = rng.uniform(0, 10, 2000)
yte = f(xte) + rng.normal(0, 0.3, 2000)

def stump(x, r):
    order = np.argsort(x)
    xs, rs = x[order], r[order]
    cum = np.cumsum(rs)
    n, total = len(rs), cum[-1]
    i = np.arange(1, n)
    gain = cum[:-1]**2 / i + (total - cum[:-1])**2 / (n - i)
    gain[xs[1:] == xs[:-1]] = -np.inf
    k = int(np.argmax(gain))
    return (xs[k] + xs[k + 1]) / 2, cum[k] / (k + 1), (total - cum[k]) / (n - k - 1)

def boost(lr, rounds, report):
    ptr = np.full(200, ytr.mean())
    pte = np.full(2000, ytr.mean())
    for m in range(1, rounds + 1):
        t, a, b = stump(xtr, ytr - ptr)
        ptr += lr * np.where(xtr <= t, a, b)
        pte += lr * np.where(xte <= t, a, b)
        if m in report:
            print(f"  round {m:5}: train {np.sqrt(np.mean((ptr - ytr)**2)):.3f}  test {np.sqrt(np.mean((pte - yte)**2)):.3f}")

report = (1, 10, 50, 200, 1000, 5000)
for lr in (1.0, 0.1):
    print(f"learning rate {lr}, RMSE (noise level is 0.3)")
    boost(lr, 5000, report)
```

With learning rate 1.0, test error is lowest around rounds 50 to 200, then climbs while training error keeps falling: that's boosting overfitting. With learning rate 0.1, the fit starts slower and reaches a lower test error, 0.319 at round 1000, and rises more gently after that. These figures come from a single stump on a one-dimensional problem. Real gradient boosting uses deeper trees and many features, and overfits on its own schedule, so check the validation curve.

| Question | Random forest | Gradient boosting |
|---|---|---|
| Mainly reduces | Variance | Bias |
| Base learner | Deep trees | Shallow trees |
| Training | Parallel | Sequential |
| More trees | Levels off, no harm | Can eventually overfit, use early stopping |
| Sensitivity to noise | Lower | Higher |
| Tuning needed | Little | More: learning rate, depth, rounds |

:::key Learning rate and rounds move together
A smaller learning rate needs more rounds and usually gives a better result, up to a point. A common recipe: pick a small rate, and let early stopping on a validation set choose the number of rounds.
:::

## k-means and GMMs {#ch02-cluster .th}

**k-means** minimises **inertia**, the sum of squared distances from points to their assigned centre. Lloyd's algorithm alternates two steps:

1. **Assign** each point to the nearest centre.
2. **Update** each centre to the mean of its points.

Each step can only lower the objective, and there are finitely many assignments, so it terminates. It reaches a local optimum, and the start matters. **k-means++** spreads out the initial centres by picking each with probability proportional to squared distance from the nearest centre chosen so far. Run with several initialisations and keep the lowest inertia.

```python run=mf-c02-kmeans
import numpy as np

rng = np.random.default_rng(0)
centres = np.array([[0, 0], [8, 0], [0, 8], [8, 8], [4, 12]], dtype=float)
X = np.vstack([c + rng.normal(0, 0.8, (60, 2)) for c in centres])

def kmeans(X, k, seed, verbose=False):
    r = np.random.default_rng(seed)
    C = X[r.choice(len(X), k, replace=False)]
    prev = None
    for it in range(100):
        d = ((X[:, None] - C[None])**2).sum(axis=2)
        a = d.argmin(axis=1)
        inertia = d.min(axis=1).sum()
        if verbose:
            print(f"  iter {it}: inertia {inertia:.1f}")
        if prev is not None and np.array_equal(a, prev):
            break
        prev = a
        C = np.array([X[a == j].mean(axis=0) if np.any(a == j) else C[j] for j in range(k)])
    return inertia

print("one run, seed 0")
kmeans(X, 5, 0, verbose=True)
runs = [kmeans(X, 5, s) for s in range(50)]
print(f"50 random starts: best {min(runs):.1f}  worst {max(runs):.1f}  share near best {np.mean(np.array(runs) < min(runs) * 1.01):.2f}")
print("elbow: best inertia of 10 starts")
for k in range(1, 9):
    print(f"  k={k}: {min(kmeans(X, k, s) for s in range(10)):8.1f}")
```

Inertia falls at every iteration, and differs across starts, since some starts end in a poor local optimum. Inertia always falls with larger `k`, so it can't choose `k` on its own. The usual approach is to look for an elbow, which is at `k = 5` in this easy case, or to use silhouette scores. Real data rarely has such a clean bend.

k-means assumes clusters are roughly spherical and of similar size, because it uses plain Euclidean distance to the nearest centre. It's also sensitive to scale and to outliers.

A **Gaussian mixture model (GMM)** treats data as coming from `k` Gaussians, each with its own mean, covariance and mixture weight. It's fitted with **expectation-maximisation (EM)**:

- **E step**: compute each point's **responsibility**, the posterior probability of each component given the point.
- **M step**: refit each component's weight, mean and covariance using those responsibilities as soft counts.

Each EM iteration can't decrease the data's likelihood, although EM also finds only local optima. k-means behaves like a limiting case of a GMM with equal, shrinking, spherical covariances and hard assignments. GMMs can represent elongated clusters and give soft assignments, which k-means can't.

```python run=mf-c02-gmm
import numpy as np

rng = np.random.default_rng(1)
x = np.r_[rng.normal(-2, 0.8, 300), rng.normal(2, 1.5, 700)]
K = 2
mu, var, pi = np.array([-1.0, 1.0]), np.array([1.0, 1.0]), np.array([0.5, 0.5])

def densities(x):
    return pi * np.exp(-(x[:, None] - mu)**2 / (2 * var)) / np.sqrt(2 * np.pi * var)

for it in range(1, 61):
    d = densities(x)
    ll = np.log(d.sum(axis=1)).sum()
    if it in (1, 2, 5, 20, 60):
        print(f"iter {it:2}: log-likelihood {ll:9.2f}  mu {mu.round(2).tolist()}  var {var.round(2).tolist()}  pi {pi.round(2).tolist()}")
    r = d / d.sum(axis=1, keepdims=True)           # E step
    nk = r.sum(axis=0)                             # M step
    mu = (r * x[:, None]).sum(axis=0) / nk
    var = (r * (x[:, None] - mu)**2).sum(axis=0) / nk
    pi = nk / len(x)

probe = densities(np.array([-2.0, -1.0, 0.0, 2.0]))
print("responsibility of the left component at x = -2, -1, 0, 2:",
      (probe / probe.sum(axis=1, keepdims=True))[:, 0].round(2).tolist())
```

The fit lands close to the true means of -2 and 2 and weights of 0.3 and 0.7. Its variances are 0.5 and 2.28, against true values of 0.64 and 2.25, and that gap comes from having finite data with overlapping clusters. The log-likelihood never falls. A point between the clusters gets a split responsibility, which is the extra information a soft assignment gives you.

:::trap A GMM's likelihood can go to infinity
If a component collapses onto a single point, its variance goes to zero and its density there goes to infinity. So the highest possible likelihood is a useless answer. Implementations add a small constant to the variance to prevent this. That's also why "maximise likelihood to pick the number of components" fails: use BIC or AIC, or held-out likelihood.
:::

## kNN and Naive Bayes {#ch02-knn-nb .th}

**k-nearest neighbours** stores the training data, and predicts from the `k` closest points. There's no training step, and prediction costs a distance computation per training point unless you use an index. Small `k` gives low bias and high variance, and `k = 1` always has zero training error if no two identical points have different labels. Large `k` smooths more. kNN needs scaled features, and it suffers from the **curse of dimensionality**: in high dimensions, a point's nearest and farthest neighbours end up at similar distances.

```python run=mf-c02-knn
import numpy as np

rng = np.random.default_rng(0)
print("relative contrast (max-min)/min of distances from one point")
for d in (2, 10, 100, 1000):
    D = rng.random((1000, d))
    dist = np.linalg.norm(D[1:] - D[0], axis=1)
    print(f"  d={d:<5} {(dist.max() - dist.min()) / dist.min():.2f}")

def blobs(n):
    y = rng.integers(0, 2, n)
    X = np.c_[y * 2 + rng.normal(0, 0.8, n), rng.normal(0, 1, n)]
    return X, y

Xtr, ytr = blobs(400)
Xte, yte = blobs(1000)

def knn(Xtr, Xte, k):
    d = ((Xte[:, None] - Xtr[None])**2).sum(axis=2)
    nearest = np.argpartition(d, k - 1, axis=1)[:, :k]
    return (ytr[nearest].mean(axis=1) > 0.5).astype(int)

for k in (1, 15, 101, 399):
    print(f"k={k:<4} test accuracy {np.mean(knn(Xtr, Xte, k) == yte):.3f}")

scale = np.array([1.0, 1000.0])    # the noise feature in much larger units
print(f"k=15, noise feature scaled by 1000: {np.mean(knn(Xtr * scale, Xte * scale, 15) == yte):.3f}")
```

Distances lose their contrast as dimension grows. On the classification data, moderate `k` beats `k = 1`, and `k = 399` is close to always predicting the majority class of nearly the whole training set, so it's near chance. With unscaled features, the noise column dominates distance, and accuracy again falls to around chance.

**Naive Bayes** applies Bayes' rule, and assumes features are **conditionally independent given the class**:

```text
P(c | x) ∝ P(c) Π P(xⱼ | c)
```

It's a **generative** model, because it models how `x` arises from each class. Logistic regression is **discriminative**, because it models `P(c | x)` directly. The independence assumption is usually false, but classification only needs the highest score, so it often works well with little data, as in spam filtering. Training is counting, which makes it fast. Compute in log-space to avoid underflow, and use **Laplace smoothing** so a word never seen with a class doesn't force that class's probability to zero.

```python run=mf-c02-nb
import math
from collections import Counter

train = [("win cash now", "spam"), ("cheap cash offer", "spam"), ("win a prize now", "spam"),
         ("meeting at noon", "ham"), ("project review at noon", "ham"), ("lunch offer at noon", "ham")]

counts = {"spam": Counter(), "ham": Counter()}
docs = Counter()
for text, c in train:
    docs[c] += 1
    counts[c].update(text.split())
vocab = sorted(set(w for c in counts for w in counts[c]))

def scores(text, alpha=1.0):
    out = {}
    for c in sorted(counts):
        total = sum(counts[c].values())
        s = math.log(docs[c] / len(train))
        for w in text.split():
            if alpha == 0 and counts[c][w] == 0:
                s = -math.inf
                break
            s += math.log((counts[c][w] + alpha) / (total + alpha * len(vocab)))
        out[c] = s
    return out

def p_spam(text, alpha=1.0):
    s = scores(text, alpha)
    if s["spam"] == s["ham"] == -math.inf:
        return float("nan")
    m = max(s.values())
    e = {c: math.exp(v - m) for c, v in s.items()}
    return e["spam"] / sum(e.values())

print(f"vocabulary size {len(vocab)}")
for t in ("win cash", "meeting at noon", "cash at noon"):
    print(f"{t!r:18} P(spam) with smoothing {p_spam(t):.3f}, without {p_spam(t, 0):.3f}")
for repeat in (1, 3, 10):
    print(f"'win' repeated {repeat:2} times: P(spam) = {p_spam(' '.join(['win'] * repeat)):.4f}")
```

Without smoothing, one unseen word decides everything. "win cash" and "meeting at noon" get a hard 1.000 and 0.000. "cash at noon" has a zero count in both classes, so the model has no answer at all, and that's the `nan`. Smoothing gives a usable number in each case. Repeating a word counts as separate evidence each time, and the probability is pushed towards 1. This same effect with correlated features is why Naive Bayes probabilities are often overconfident, even when its ranking is good.

## Choosing a model {#ch02-choose .th}

Interviewers usually want a process: start from the data, propose a baseline, and say what would change your mind.

| Situation | Try first | Why |
|---|---|---|
| Tabular, mixed types, medium size | Gradient boosting, or a random forest | Handles interactions, non-linearity and scale without much feature work |
| Need explanation, or little data | Regularised linear or logistic regression, or a shallow tree | Stable and easy to explain, and a good baseline for anything else |
| Very wide sparse features such as text | Linear models or Naive Bayes | Works well in high dimensions, and is fast |
| Many rows and need quick predictions | Linear models or boosted trees | Small models with cheap prediction |
| A few thousand rows or fewer, clear margin | SVM, possibly with an RBF kernel | Works well if scaled, but kernels don't scale to huge data |
| Need similar items, simple local structure | kNN with an index | No training, but costly and memory-heavy at prediction |
| No labels, want groups | k-means, then a GMM if clusters are elongated or soft | Simple and fast, and needs checking with domain knowledge |
| Images, audio, language | Neural networks | Learns features where hand-crafted ones are hard |

Questions that actually drive the choice: how much labelled data is there, how noisy is it, do you need probabilities or an explanation, what limits prediction latency and memory, and how often will data drift? Always compare against a trivial baseline, such as predicting the mean or the majority class.

## Drills {#ch02-drills .dr}

:::drill concept
List the assumptions of linear regression, and say which ones matter if you only care about prediction.
---
Linearity in the parameters, independent errors, constant variance, no perfect collinearity, and Gaussian errors for exact small-sample inference. For prediction, linearity matters most (you can add transformed features), and independence affects how you validate. Non-constant variance and non-Gaussian errors mainly damage standard errors and p-values. Note that the assumption of normality is about the errors, and not about `X` or `y` by themselves.
:::

:::drill tricky
You copy a feature so it appears twice in the data. What happens in OLS and in ridge?

```python run=mf-c02-d-dup
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=100)
y = 3 * x + rng.normal(0, 0.1, 100)
X1, X2 = x[:, None], np.c_[x, x]
print("one column, ridge ", np.linalg.solve(X1.T @ X1 + np.eye(1), X1.T @ y).round(2).tolist())
print("two copies, ridge ", np.linalg.solve(X2.T @ X2 + np.eye(2), X2.T @ y).round(2).tolist())
print("two copies, rank of X'X", int(np.linalg.matrix_rank(X2.T @ X2)))
print("two copies, lstsq ", np.linalg.lstsq(X2, y, rcond=None)[0].round(2).tolist())
```
---
OLS has no unique solution, since `XᵀX` is singular and any split of the weight that sums to about 3 is equally good. `lstsq` returns the minimum-norm solution, which splits the weight evenly. Ridge has a unique solution, and it also splits the weight evenly, because that's the smallest penalty for the same prediction.

Lasso would be indifferent between the possible splits, since the L1 norm is the same for any same-sign split. The result is arbitrary, and depends on the solver.
:::

:::drill concept
Why does L1 give sparse weights and L2 doesn't? Give two different explanations.
---
**Geometry.** The L1 ball has corners on the axes, so the expanding loss contours often touch it at a corner, where some coordinates are zero. The L2 ball is round, so contact is rarely on an axis.

**Calculus.** The L1 penalty pulls with a constant force `λ` no matter how small the weight is, so a small weight gets pulled to zero. The L2 force is proportional to `w`, which vanishes as `w` shrinks, so the weight gets close to zero and doesn't reach it.

**Bonus, the prior.** A Laplace prior has a sharp peak at zero. A Gaussian prior is smooth there.
:::

:::drill output
A node has 8 positives and 2 negatives. What's its Gini impurity, and its entropy in bits? What's the weighted Gini after a split into (6+, 0-) and (2+, 2-)?

```python run=mf-c02-d-gini
import math

gini = lambda p: 1 - p**2 - (1 - p)**2
ent = lambda p: 0.0 if p in (0, 1) else -p * math.log2(p) - (1 - p) * math.log2(1 - p)
print(f"gini {gini(0.8):.3f}  entropy {ent(0.8):.3f}")
print(f"after split {(6 * gini(1.0) + 4 * gini(0.5)) / 10:.3f}")
```
---
**Answer.** Gini is `1 - 0.64 - 0.04 = 0.32`. Entropy is about 0.722 bits. After the split, the weighted Gini is `0.6 × 0 + 0.4 × 0.5 = 0.20`, so the gain is 0.12.

**Why.** Children are weighted by size, otherwise a tiny pure leaf would look great.
:::

:::drill tricky
Does adding more trees overfit a random forest? Does it overfit gradient boosting?
---
A random forest's test error levels off as you add trees, since it's averaging, and the extra trees only reduce the Monte Carlo part of the variance. It can still overfit for other reasons, for example with noisy deep trees, but the number of trees isn't the cause.

Boosting can overfit with too many rounds. Each round fits what's left, including noise, so training error keeps falling and validation error eventually rises. This is why you use a small learning rate and early stopping. The rise can be slow, so plot the curve to see it.
:::

:::drill concept
Bagging reduces what, and boosting reduces what? Why does each use the base learner it does?
---
Bagging mainly reduces variance by averaging, so it wants low-bias, high-variance learners: deep trees. Averaging can't remove bias. Boosting mainly reduces bias by adding corrections in sequence, so it wants high-bias, low-variance learners: shallow trees or stumps. A deep tree as a booster's base learner would fit the training data early, and leave nothing useful for later rounds.
:::

:::drill output
A gradient-boosted model is trained on `y = 2x` with `x` from 0 to 10. What does it predict at `x = 20`? And a linear model?

```python run=mf-c02-d-extrap
import numpy as np

x = np.linspace(0, 10, 101)
y = 2 * x
pred = np.full_like(y, y.mean())
model = []
for _ in range(500):
    r = y - pred
    best = None
    for t in (x[:-1] + x[1:]) / 2:
        a, b = r[x <= t].mean(), r[x > t].mean()
        sse = np.sum((r - np.where(x <= t, a, b))**2)
        if best is None or sse < best[0]:
            best = (sse, t, a, b)
    _, t, a, b = best
    model.append((t, a, b))
    pred += 0.1 * np.where(x <= t, a, b)

def boosted(v):
    return y.mean() + 0.1 * sum(a if v <= t else b for t, a, b in model)

print(f"boosted at x=5 {boosted(5.0):.2f}, x=10 {boosted(10.0):.2f}, x=20 {boosted(20.0):.2f}")
line = np.polyfit(x, y, 1)
print(f"linear  at x=20 {np.polyval(line, 20.0):.2f}")
```
---
**Answer.** The tree model gives about 20 at `x = 20`, the same as at `x = 10`, since any `x` beyond the training range falls into the rightmost leaves. The linear model gives 40.

**Why.** Trees and their ensembles can't continue a trend beyond the range they were trained on. On trending data, such as prices or forecasting problems, this is a real risk. A common fix is to model the difference or the detrended series, or to use a linear component for the trend.
:::

:::drill tricky
Does k-means always converge? Does it always find the best clustering? What if a cluster goes empty?
---
It always terminates, since each step lowers or preserves the inertia, and there's a finite number of assignments. Convergence is to a local optimum, and finding the global optimum is NP-hard in general. Empty clusters can happen. Implementations usually re-seed the empty centre, for example at the point farthest from its centre, or simply keep it where it is. The mean is the best centre only for squared Euclidean distance. With another distance it may not be, and k-medoids is one alternative.
:::

:::drill bug
This clustering ignores age entirely. Why, and how would you fix it?

```python run=mf-c02-d-kmscale
import numpy as np

rng = np.random.default_rng(0)
age = np.r_[rng.normal(25, 3, 200), rng.normal(55, 3, 200)]
income = rng.normal(50_000, 15_000, 400)
X = np.c_[age, income]
truth = np.r_[np.zeros(200), np.ones(200)]

def two_means(X, starts=10):
    r = np.random.default_rng(1)
    best, labels = np.inf, None
    for _ in range(starts):
        C = X[r.choice(len(X), 2, replace=False)]
        for _ in range(50):
            d = ((X[:, None] - C[None])**2).sum(axis=2)
            a = d.argmin(axis=1)
            C = np.array([X[a == j].mean(axis=0) for j in range(2)])
        if d.min(axis=1).sum() < best:
            best, labels = d.min(axis=1).sum(), a
    return labels

def agree(a):
    return max(np.mean(a == truth), np.mean(a != truth))

print(f"raw features:          agreement with age groups {agree(two_means(X)):.3f}")
Z = (X - X.mean(axis=0)) / X.std(axis=0)
print(f"standardised features: agreement with age groups {agree(two_means(Z)):.3f}")
```
---
**Bug.** Income's variance is millions of times larger than age's, so Euclidean distance is effectively income alone. The clustering splits by income, and its agreement with the age groups is at chance level.

**Fix.** Standardise, or choose a scale that reflects what similarity means for the problem. After standardising, the age groups come out exactly. Any distance-based method has this issue: k-means, kNN, RBF SVM and PCA.
:::

:::drill tricky
Impurity-based feature importance ranks a random ID-like column at the top. Why, and what would you use instead?
---
Impurity importance adds up training-set gain, and a high-cardinality feature offers many possible splits, so it can find spurious ones. Noise looks useful because it's measured on the data the tree fitted. **Permutation importance** on held-out data measures how much the score drops when a column is shuffled, and a useless column drops near zero. It has its own weakness: with correlated features, shuffling one leaves the other to carry the signal, so both can look unimportant. Group correlated features, or use SHAP values for a more detailed view, keeping in mind that none of these give causal claims.
:::

:::drill concept
Explain `C` and `γ` for an RBF SVM. You see 99% training accuracy and 70% validation. Which way do you move them?
---
`C` is the cost of margin violations: larger `C` fits training points harder. `γ` is the inverse width of the kernel: larger `γ` means each point's influence is more local, so boundaries get more wiggly. The numbers describe overfitting, so lower `γ`, or lower `C`, or both. Search them together on a log scale, because they interact. Also check that the features were scaled, since an RBF kernel relies on distances.
:::

:::drill tricky
Which of these models need feature scaling, and why? Linear regression, ridge, logistic regression with gradient descent, decision tree, random forest, kNN, k-means, SVM, PCA, Naive Bayes.
---
**Trees and forests**: no, since only feature order matters. **OLS**: not for predictions, as the coefficients rescale to match, though scale can help numerics. **Ridge, lasso, SVM**: yes, since a penalty is on the weights. **Logistic regression with gradient descent**: yes for speed through a lower condition number, and for fair penalties if regularised. **kNN, k-means, RBF kernels**: yes, since they use distances. **PCA**: usually yes, since it maximises variance. **Gaussian Naive Bayes**: no, each feature gets its own per-class mean and variance.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1500
Write a binary decision tree classifier with Gini, `max_depth` and `min_leaf`, using an efficient split search that sorts each feature once per node. Show that training accuracy rises with depth while test accuracy peaks.
---
Sort a feature, then keep a running count of positives on the left. Each candidate threshold takes `O(1)`, so one feature takes `O(n log n)`, which is much cheaper than recomputing the counts at each threshold.

```python run=mf-c02-c-tree
import numpy as np

class Tree:
    def __init__(self, max_depth=5, min_leaf=1):
        self.max_depth, self.min_leaf = max_depth, min_leaf

    def fit(self, X, y):
        self.root = self.grow(X, y, 0)
        return self

    def best_split(self, X, y):
        best_score, best = np.inf, None
        n = len(y)
        for f in range(X.shape[1]):
            order = np.argsort(X[:, f])
            xs, ys = X[order, f], y[order]
            left_pos = np.cumsum(ys)[:-1]
            nl = np.arange(1, n)
            nr = n - nl
            pl, pr = left_pos / nl, (ys.sum() - left_pos) / nr
            score = nl * 2 * pl * (1 - pl) + nr * 2 * pr * (1 - pr)
            ok = (xs[1:] > xs[:-1]) & (nl >= self.min_leaf) & (nr >= self.min_leaf)
            if ok.any():
                score = np.where(ok, score, np.inf)
                i = int(np.argmin(score))
                if score[i] < best_score:
                    best_score, best = score[i], (f, (xs[i] + xs[i + 1]) / 2)
        return best

    def grow(self, X, y, depth):
        leaf = float(y.mean())
        if depth == self.max_depth or leaf in (0.0, 1.0):
            return leaf
        split = self.best_split(X, y)
        if split is None:
            return leaf
        f, t = split
        m = X[:, f] <= t
        return (f, t, self.grow(X[m], y[m], depth + 1), self.grow(X[~m], y[~m], depth + 1))

    def one(self, x):
        node = self.root
        while isinstance(node, tuple):
            f, t, a, b = node
            node = a if x[f] <= t else b
        return node

    def predict(self, X):
        return np.array([self.one(x) for x in X]) > 0.5

rng = np.random.default_rng(0)
X = rng.uniform(-1, 1, size=(1400, 5))
y = ((X[:, 0] * X[:, 1] > 0) ^ (rng.random(1400) < 0.15)).astype(float)
Xtr, ytr, Xte, yte = X[:400], y[:400], X[400:], y[400:]
for depth in (1, 2, 3, 5, 8, 12, 20):
    t = Tree(max_depth=depth).fit(Xtr, ytr)
    print(f"depth {depth:2}: train {np.mean(t.predict(Xtr) == ytr):.3f}  test {np.mean(t.predict(Xte) == yte):.3f}")
```

Training accuracy rises with depth up to 1.000, and test accuracy peaks at depth 5 in this list, then settles lower. The first levels make almost no progress, since this target has an XOR shape, and that's the greedy weakness from earlier. The 15% label noise puts the best possible accuracy at 0.85, so a training score above that is fitting noise.
:::

:::drill code rating=1300
Write k-means++ initialisation, and compare its worst-case result with random initialisation on data with many clusters.
---
Pick the first centre uniformly. Each later centre is a data point chosen with probability proportional to squared distance from its nearest chosen centre.

```python run=mf-c02-c-kmpp
import numpy as np

data = np.random.default_rng(0)
grid = np.array([[i, j] for i in range(5) for j in range(5)], dtype=float) * 10
X = np.vstack([c + data.normal(0, 1, (40, 2)) for c in grid])

def init_random(X, k, r):
    return X[r.choice(len(X), k, replace=False)]

def init_pp(X, k, r):
    C = [X[r.integers(len(X))]]
    d = np.sum((X - C[0])**2, axis=1)
    for _ in range(k - 1):
        C.append(X[r.choice(len(X), p=d / d.sum())])
        d = np.minimum(d, np.sum((X - C[-1])**2, axis=1))
    return np.array(C)

def lloyd(X, C):
    a = None
    for _ in range(100):
        dist = ((X[:, None] - C[None])**2).sum(axis=2)
        new = dist.argmin(axis=1)
        if a is not None and np.array_equal(new, a):
            break
        a = new
        C = np.array([X[a == j].mean(axis=0) if np.any(a == j) else C[j] for j in range(len(C))])
    return dist.min(axis=1).sum()

for name, init in [("random", init_random), ("k-means++", init_pp)]:
    r = np.random.default_rng(1)
    res = np.array([lloyd(X, init(X, 25, r)) for _ in range(30)])
    print(f"{name:10} best {res.min():8.0f}  median {np.median(res):8.0f}  worst {res.max():8.0f}")
```

A cluster has about 2 squared-distance units of inertia per point here, so finding all 25 clusters gives a total near 2000. k-means++ gets close to that in its best run, and its median and worst runs are far better than random initialisation. It still doesn't always find every cluster, so running it several times remains standard. Its published guarantee is an expected inertia within an `O(log k)` factor of optimal.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- OLS: `XᵀXw = Xᵀy`. The fit is a projection, and residuals are orthogonal to the columns. Collinearity makes coefficients unstable and leaves predictions fine.
- Logistic: linear log-odds, convex cross-entropy, gradient `Xᵀ(p - y)/n`. Separable data has no finite MLE without regularisation.
- L2 shrinks and shares, and has a closed form. L1 zeros out and selects. Elastic net does both. Standardise first, and don't penalise the intercept.
- Bias-variance: `bias² + variance + noise`. Training and validation both bad suggests bias. A large gap suggests variance. More data doesn't help bias.
- SVM: maximise margin, hinge loss, support vectors, `C` trades margin against violations. Kernels replace dot products. RBF's `γ` controls locality. Outputs aren't probabilities.
- Trees: greedy Gini or entropy, no scaling, axis-aligned, unstable, no extrapolation. Impurity importance favours high-cardinality features.
- Random forest: bagging plus random features. `Var = ρσ² + (1-ρ)σ²/B`. Out-of-bag is about 36.8%. More trees don't cause overfitting.
- Boosting: sequential fits to the negative gradient. Shallow trees, small learning rate, early stopping. Mainly reduces bias, and is more sensitive to noise.
- k-means: assign then update, monotonic inertia, local optima, k-means++, spherical assumption, scale first. GMM: soft assignment via EM, elongated clusters, watch for collapsing variances.
- kNN: no training, scale first, curse of dimensionality. Naive Bayes: conditional independence, log-space, Laplace smoothing, fast, overconfident.
- Choosing: start from data size, types and constraints, and compare against a trivial baseline. Boosting for tabular, linear for wide or explainable.
