---
title: Validation, metrics and forecasting
part: Part C · Measuring it
lede: A model is only as good as your estimate of how it will behave on data it hasn't seen. This chapter covers how to get an honest estimate, how leakage destroys one, which metric fits which problem, and how to tune and engineer features without fooling yourself. It finishes with time series, where the usual validation recipes break and backtesting replaces them.
desc: train/val/test, k-fold, leakage, class imbalance, precision, recall, F1, ROC-AUC, PR-AUC, calibration, regression metrics, hyperparameter tuning, feature engineering, time-series split, ARIMA, seasonality, backtesting
hours: 7
prereqs: Chapter 2 (linear models, trees, bias and variance), Chapter 1 (p-values, gradient descent)
---

## Train, validation, test {#ch03-split .th}

The three sets have different jobs. The **training** set fits parameters. The **validation** set chooses between models and hyperparameters. The **test** set gives one final estimate, and you look at it once. As soon as you make a decision based on a score, that score stops being an unbiased estimate, because you selected the option that looked best, partly by luck.

```python run=mf-c03-select
import numpy as np

rng = np.random.default_rng(0)
yval, ytest = rng.integers(0, 2, 200), rng.integers(0, 2, 2000)

# 500 "models" that guess at random. Any score above 0.5 is pure luck.
val_scores = np.array([np.mean(rng.integers(0, 2, 200) == yval) for _ in range(500)])
best = int(np.argmax(val_scores))
print(f"best validation score of 500 random models {val_scores[best]:.3f}")
print(f"the same model on new test data            {np.mean(rng.integers(0, 2, 2000) == ytest):.3f}")
```

No model here has any skill, yet the winner's validation score looks strong. A fresh test set reveals the truth. The effect grows with the number of options you try, and shrinks with a larger validation set.

**k-fold cross-validation** splits the data into `k` folds, trains on `k - 1` and scores on the rest, then averages. Every row gets used for both training and validation, so it's a better estimate with limited data, at `k` times the cost. Common choices:

- **`k = 5` or `10`** are the usual defaults. Larger `k` means training sets closer to full size, so less pessimistic bias, and more cost.
- **Stratified** k-fold keeps the class ratio in every fold. Use it for classification, especially with imbalance.
- **Group** k-fold keeps all rows from one group (user, patient, device) in the same fold.
- **Nested** cross-validation uses an inner loop to tune and an outer loop to estimate performance, so the estimate isn't contaminated by tuning.
- **Time series** data needs a forward split, covered later.

The spread across folds gives a rough sense of uncertainty, though folds share training data, so they aren't independent samples.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 560 296" role="img" aria-label="Top: five rows of five blocks with a different validation block in each row. Bottom: four rows where training grows from the left and the validation block always comes after it in time.">
  <text x="10" y="16" class="t-small">5-fold cross-validation: every block validates once</text><rect x="70" y="24" width="57" height="18" rx="3" class="d-acc"/><rect x="130" y="24" width="57" height="18" rx="3" class="d-soft"/><rect x="190" y="24" width="57" height="18" rx="3" class="d-soft"/><rect x="250" y="24" width="57" height="18" rx="3" class="d-soft"/><rect x="310" y="24" width="57" height="18" rx="3" class="d-soft"/><text x="10" y="38" class="t-small">fold 1</text><rect x="70" y="48" width="57" height="18" rx="3" class="d-soft"/><rect x="130" y="48" width="57" height="18" rx="3" class="d-acc"/><rect x="190" y="48" width="57" height="18" rx="3" class="d-soft"/><rect x="250" y="48" width="57" height="18" rx="3" class="d-soft"/><rect x="310" y="48" width="57" height="18" rx="3" class="d-soft"/><text x="10" y="62" class="t-small">fold 2</text><rect x="70" y="72" width="57" height="18" rx="3" class="d-soft"/><rect x="130" y="72" width="57" height="18" rx="3" class="d-soft"/><rect x="190" y="72" width="57" height="18" rx="3" class="d-acc"/><rect x="250" y="72" width="57" height="18" rx="3" class="d-soft"/><rect x="310" y="72" width="57" height="18" rx="3" class="d-soft"/><text x="10" y="86" class="t-small">fold 3</text><rect x="70" y="96" width="57" height="18" rx="3" class="d-soft"/><rect x="130" y="96" width="57" height="18" rx="3" class="d-soft"/><rect x="190" y="96" width="57" height="18" rx="3" class="d-soft"/><rect x="250" y="96" width="57" height="18" rx="3" class="d-acc"/>
  <rect x="310" y="96" width="57" height="18" rx="3" class="d-soft"/><text x="10" y="110" class="t-small">fold 4</text><rect x="70" y="120" width="57" height="18" rx="3" class="d-soft"/><rect x="130" y="120" width="57" height="18" rx="3" class="d-soft"/><rect x="190" y="120" width="57" height="18" rx="3" class="d-soft"/><rect x="250" y="120" width="57" height="18" rx="3" class="d-soft"/><rect x="310" y="120" width="57" height="18" rx="3" class="d-acc"/><text x="10" y="134" class="t-small">fold 5</text><text x="10" y="170" class="t-small">Forward split (expanding window): train only on the past, optional gap, score the next block</text><rect x="70" y="178" width="90" height="18" rx="3" class="d-soft"/><rect x="174" y="178" width="46" height="18" rx="3" class="d-acc"/><text x="10" y="192" class="t-small">cut 1</text><rect x="70" y="202" width="150" height="18" rx="3" class="d-soft"/><rect x="234" y="202" width="46" height="18" rx="3" class="d-acc"/><text x="10" y="216" class="t-small">cut 2</text><rect x="70" y="226" width="210" height="18" rx="3" class="d-soft"/><rect x="294" y="226" width="46" height="18" rx="3" class="d-acc"/><text x="10" y="240" class="t-small">cut 3</text><rect x="70" y="250" width="270" height="18" rx="3" class="d-soft"/><rect x="354" y="250" width="46" height="18" rx="3" class="d-acc"/><text x="10" y="264" class="t-small">cut 4</text><path d="M70.0 284.0 L 430.0 284.0" class="d-line-acc"/><text x="440" y="288" class="t-small">time</text><rect x="470" y="30" width="16" height="12" rx="2" class="d-soft"/><text x="490" y="40" class="t-small">train</text><rect x="470" y="50" width="16" height="12" rx="2" class="d-acc"/><text x="490" y="60" class="t-small">validate</text>
</svg></div><figcaption><b>k-fold and forward splits.</b> k-fold assumes rows can be exchanged. Time-ordered data needs validation to come after training in every row.</figcaption></figure>

## Leakage {#ch03-leak .th}

**Leakage** means information that won't be available at prediction time reaches the model during training or evaluation. It's the usual reason for a score that looks too good, and for a model that collapses in production.

| Kind | Example |
|---|---|
| Target leakage | A feature recorded after the outcome, such as "treatment given" when predicting diagnosis |
| Preprocessing on all data | Fitting a scaler, PCA or feature selection before splitting |
| Group leakage | Rows from the same patient or user in both train and validation |
| Duplicates | The same row appearing on both sides, often after oversampling |
| Temporal leakage | Random splits of time data, or features that use future values |

The most striking demonstration is feature selection before cross-validation. Here the labels are random and all 5000 features are noise, so honest accuracy has to be about 50%.

```python run=mf-c03-leak
import numpy as np

rng = np.random.default_rng(0)
n, p = 50, 5000
X = rng.normal(size=(n, p))
y = rng.integers(0, 2, n)

def top_features(X, y, k=20):
    corr = np.abs((X - X.mean(axis=0)).T @ (y - y.mean()))
    return np.argsort(-corr)[:k]

def centroid_accuracy(Xtr, ytr, Xte, yte):
    a, b = Xtr[ytr == 0].mean(axis=0), Xtr[ytr == 1].mean(axis=0)
    pred = ((Xte - b)**2).sum(axis=1) < ((Xte - a)**2).sum(axis=1)
    return np.mean(pred == yte)

folds = np.array_split(rng.permutation(n), 5)

def cv(select_inside):
    if not select_inside:
        keep = top_features(X, y)                     # looks at validation labels
    scores = []
    for f in folds:
        tr = np.setdiff1d(np.arange(n), f)
        k = top_features(X[tr], y[tr]) if select_inside else keep
        scores.append(centroid_accuracy(X[tr][:, k], y[tr], X[f][:, k], y[f]))
    return np.mean(scores)

print(f"features chosen before the split: accuracy {cv(False):.2f}")
print(f"features chosen inside each fold: accuracy {cv(True):.2f}")
```

Selecting features on all the data lets validation labels pick features that happen to correlate with them. The rule: **every step that learns from data goes inside the fold**. Scalers, imputers, PCA, target encoding, resampling and selection are all fitted on training rows only, and then applied to validation rows. A library pipeline object exists to enforce this.

:::tip A checklist for a suspiciously good score
Ask what each top feature means and when it's recorded. Check for duplicates across splits and for shared groups. Train a model to distinguish train rows from test rows: if it can, the sets differ. Compare the score with what's plausible in that domain.
:::

## Class imbalance {#ch03-imbalance .th}

With 1% positives, always predicting negative gives 99% accuracy, so accuracy isn't the metric. Options, roughly in the order to try them:

1. **Choose a suitable metric**: precision, recall, PR-AUC, or expected cost.
2. **Move the decision threshold**: 0.5 is rarely the right cut-off, so pick one on validation data based on the costs.
3. **Class weights**: multiply the loss on the rare class.
4. **Resampling**: undersample the majority, oversample the minority, or use a synthetic method such as SMOTE. Do it on training folds only, and never on validation or test data.

Weighting and resampling change what the model estimates. Its probabilities no longer match real-world rates, and they need correcting if you use them as probabilities.

```python run=mf-c03-imbalance
import numpy as np

rng = np.random.default_rng(0)

def make(n, rate=0.05):
    y = (rng.random(n) < rate).astype(float)
    return np.c_[np.ones(n), rng.normal(y * 1.5, 1.0)], y

Xtr, ytr = make(20_000)
Xte, yte = make(100_000)

def train(pos_weight):
    w = np.zeros(2)
    sw = np.where(ytr == 1, pos_weight, 1.0)
    for _ in range(2000):
        p = 1 / (1 + np.exp(-Xtr @ w))
        w -= 0.5 * Xtr.T @ (sw * (p - ytr)) / sw.sum()
    return w

def report(name, p, thr=0.5):
    pred = p >= thr
    tp = np.sum(pred & (yte == 1))
    prec = tp / max(pred.sum(), 1)
    print(f"{name:26} accuracy {np.mean(pred == yte):.3f}  precision {prec:.3f}  recall {tp / yte.sum():.3f}  mean p {p.mean():.3f}")

base = 1 / (1 + np.exp(-Xte @ train(1.0)))
report("no weights, threshold 0.5", base)
report("no weights, threshold 0.1", base, 0.1)
pw = (1 - ytr.mean()) / ytr.mean()
weighted = train(pw)
pweighted = 1 / (1 + np.exp(-Xte @ weighted))
report("balanced weights", pweighted)

logit = np.log(pweighted / (1 - pweighted)) - np.log(pw)   # undo the weighting
report("balanced, logit corrected", 1 / (1 + np.exp(-logit)))
```

With the default threshold, accuracy is high and recall is only about 10%. Moving the threshold to 0.1 lifts recall to about 59% with no retraining, at the cost of precision. Balanced weights give a similar trade-off, behaving much like a lower threshold, and they distort the probabilities: the mean prediction is 0.337 when the real rate is 0.05. Subtracting the log of the weight from the log-odds puts the mean back at 0.050, and the results nearly match the unweighted model.

## Classification metrics {#ch03-metrics .th}

```text
                 predicted +      predicted -
actual +         TP               FN
actual -         FP               TN

Precision = TP / (TP + FP)    of those flagged, how many were right
Recall    = TP / (TP + FN)    of real positives, how many were found (also TPR, sensitivity)
FPR       = FP / (FP + TN)    of real negatives, how many were wrongly flagged
F1        = 2PR / (P + R) = 2TP / (2TP + FP + FN)
```

F1 is a harmonic mean, so it's low if either component is low. It ignores true negatives. `Fβ` weights recall `β` times as much as precision. For multi-class problems, **macro** averaging gives each class equal weight, and **micro** pools all counts, so frequent classes dominate.

The **ROC curve** plots TPR against FPR across all thresholds. **ROC-AUC** has a useful interpretation: it's the probability that a random positive scores above a random negative. **PR-AUC** (usually computed as **average precision**) plots precision against recall. A random model's ROC-AUC is 0.5, while its PR-AUC equals the prevalence.

ROC uses TPR and FPR, which are each computed within one class, so for the same score distributions it doesn't change with prevalence. Precision mixes the two classes, so it does.

```python run=mf-c03-metrics
import numpy as np

rng = np.random.default_rng(0)

def sample(n_pos, n_neg):
    y = np.r_[np.ones(n_pos), np.zeros(n_neg)]
    s = np.r_[rng.normal(1.5, 1, n_pos), rng.normal(0, 1, n_neg)]
    return y, s

def auc_rank(y, s):
    r = np.argsort(np.argsort(s)) + 1              # no ties with continuous scores
    n1, n0 = y.sum(), (1 - y).sum()
    return (r[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0)

def curves(y, s):
    o = np.argsort(-s)
    tp, fp = np.cumsum(y[o]), np.cumsum(1 - y[o])
    return tp / y.sum(), fp / (1 - y).sum(), tp / (tp + fp)

for name, n1, n0 in [("balanced 50%", 20_000, 20_000), ("rare 1%", 2_000, 198_000)]:
    y, s = sample(n1, n0)
    recall, fpr, prec = curves(y, s)
    roc = np.sum(np.diff(np.r_[0, fpr]) * (recall + np.r_[0, recall[:-1]]) / 2)
    ap = np.sum(np.diff(np.r_[0, recall]) * prec)
    pred = s >= 1.0
    tp, fp, fn = np.sum(pred & (y == 1)), np.sum(pred & (y == 0)), np.sum(~pred & (y == 1))
    p, r = tp / (tp + fp), tp / (tp + fn)
    print(name)
    print(f"  ROC-AUC trapezoid {roc:.3f}  rank formula {auc_rank(y, s):.3f}")
    print(f"  average precision {ap:.3f}  (random model: {n1 / (n1 + n0):.3f})")
    print(f"  at threshold 1.0: precision {p:.3f}  recall {r:.3f}  F1 {2 * p * r / (p + r):.3f}")
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 650 270" role="img" aria-label="Two charts for the same scorer at 50 percent and 1 percent prevalence. The ROC curves lie on top of each other. The precision-recall curve for 1 percent lies far below the one for 50 percent.">
  <rect x="50" y="20" width="210" height="210" class="d-grid"/><text x="155.0" y="260" text-anchor="middle" class="t-small">false positive rate</text><text x="20" y="125.0" text-anchor="middle" class="t-small" transform="rotate(-90 20 125.0)">true positive rate</text><text x="155.0" y="14" text-anchor="middle" class="t-mono">ROC</text><text x="50" y="244" text-anchor="middle" class="t-small">0</text><text x="46" y="234" text-anchor="end" class="t-small">0</text><text x="155.0" y="244" text-anchor="middle" class="t-small">0.5</text><text x="46" y="129.0" text-anchor="end" class="t-small">0.5</text><text x="260" y="244" text-anchor="middle" class="t-small">1</text><text x="46" y="24" text-anchor="end" class="t-small">1</text><rect x="350" y="20" width="210" height="210" class="d-grid"/><text x="455.0" y="260" text-anchor="middle" class="t-small">recall</text><text x="320" y="125.0" text-anchor="middle" class="t-small" transform="rotate(-90 320 125.0)">precision</text><text x="455.0" y="14" text-anchor="middle" class="t-mono">precision-recall</text><text x="350" y="244" text-anchor="middle" class="t-small">0</text><text x="346" y="234" text-anchor="end" class="t-small">0</text><text x="455.0" y="244" text-anchor="middle" class="t-small">0.5</text><text x="346" y="129.0" text-anchor="end" class="t-small">0.5</text><text x="560" y="244" text-anchor="middle" class="t-small">1</text><text x="346" y="24" text-anchor="end" class="t-small">1</text><path d="M50.0 230.0 L 260.0 20.0" class="d-grid"/>
  <path d="M50.0 230.0 L 50.0 229.0 L 50.1 227.9 L 50.1 226.9 L 50.1 225.9 L 50.1 224.8 L 50.1 223.8 L 50.1 222.8 L 50.1 221.7 L 50.2 220.7 L 50.2 219.7 L 50.3 218.7 L 50.3 217.7 L 50.3 216.6 L 50.4 215.6 L 50.4 214.6 L 50.4 213.6 L 50.5 212.6 L 50.5 211.6 L 50.6 210.6 L 50.7 209.7 L 50.8 208.7 L 50.8 207.6 L 50.9 206.6 L 50.9 205.6 L 51.0 204.7 L 51.0 203.7 L 51.1 202.7 L 51.2 201.7 L 51.3 200.7 L 51.3 199.7 L 51.4 198.7 L 51.4 197.8 L 51.6 196.8 L 51.7 195.9 L 51.7 194.9 L 51.7 193.8 L 51.8 192.9 L 51.9 191.9 L 52.0 190.9 L 52.1 190.0 L 52.2 189.0 L 52.3 188.0 L 52.3 187.1 L 52.4 186.1 L 52.5 185.1 L 52.6 184.1 L 52.7 183.2 L 52.7 182.2 L 52.8 181.2 L 53.0 180.3 L 53.1 179.4 L 53.1 178.4 L 53.2 177.4 L 53.3 176.5 L 53.5 175.6 L 53.5 174.6 L 53.6 173.6 L 53.7 172.7 L 53.9 171.8 L 54.0 170.8 L 54.1 169.9 L 54.3 169.0 L 54.4 168.1 L 54.6 167.2 L 54.7 166.3 L 54.8 165.3 L 54.9 164.4 L 55.1 163.5 L 55.2 162.6 L 55.4 161.7 L 55.5 160.7 L 55.6 159.8 L 55.7 158.9 L 55.9 158.0 L 56.1 157.1 L 56.2 156.2 L 56.4 155.3 L 56.5 154.4 L 56.6 153.4 L 56.8 152.6 L 57.0 151.8 L 57.2 150.9 L 57.4 150.0 L 57.5 149.1 L 57.6 148.2 L 57.9 147.3 L 58.0 146.5 L 58.3 145.6 L 58.5 144.8 L 58.7 144.0 L 58.9 143.1 L 59.1 142.3 L 59.3 141.4 L 59.5 140.5 L 59.7 139.7 L 59.9 138.9 L 60.2 138.1 L 60.4 137.3 L 60.6 136.4 L 60.9 135.6 L 61.1 134.8 L 61.4 134.0 L 61.6 133.2 L 61.9 132.4 L 62.2 131.6 L 62.3 130.8 L 62.5 129.9 L 62.8 129.2 L 63.1 128.4 L 63.4 127.6 L 63.7 126.8 L 64.0 126.1 L 64.4 125.4 L 64.6 124.6 L 64.9 123.8 L 65.2 123.0 L 65.4 122.3 L 65.7 121.5 L 65.9 120.7 L 66.1 119.8 L 66.5 119.1 L 66.8 118.3 L 67.1 117.6 L 67.4 116.9 L 67.6 116.0 L 67.9 115.3 L 68.2 114.5 L 68.4 113.7 L 68.8 113.0 L 69.1 112.2 L 69.4 111.5 L 69.7 110.7 L 70.0 110.0 L 70.3 109.3 L 70.7 108.6 L 71.0 107.8 L 71.3 107.1 L 71.6 106.3 L 72.0 105.6 L 72.3 104.9 L 72.6 104.2 L 72.9 103.5 L 73.3 102.8 L 73.6 102.0 L 73.9 101.3 L 74.2 100.6 L 74.6 99.8 L 74.9 99.1 L 75.3 98.5 L 75.6 97.7 L 76.0 97.1 L 76.3 96.3 L 76.7 95.6 L 77.1 94.9 L 77.4 94.3 L 77.9 93.7 L 78.3 93.0 L 78.8 92.5 L 79.3 91.9 L 79.6 91.2 L 80.0 90.5 L 80.4 89.9 L 80.8 89.2 L 81.1 88.5 L 81.5 87.8 L 81.9 87.1 L 82.3 86.5 L 82.7 85.9 L 83.2 85.3 L 83.5 84.5 L 83.9 83.9 L 84.4 83.3 L 84.9 82.8 L 85.2 82.1 L 85.6 81.4 L 86.2 80.9 L 86.6 80.3 L 87.0 79.6 L 87.5 79.1 L 88.0 78.5 L 88.5 77.9 L 88.9 77.4 L 89.4 76.7 L 89.8 76.1 L 90.2 75.5 L 90.7 74.9 L 91.1 74.3 L 91.6 73.7 L 92.1 73.1 L 92.5 72.5 L 92.9 71.9 L 93.4 71.3 L 93.9 70.8 L 94.4 70.2 L 95.0 69.7 L 95.5 69.1 L 96.0 68.7 L 96.6 68.2 L 97.1 67.6 L 97.6 67.0 L 98.2 66.6 L 98.8 66.1 L 99.2 65.5 L 99.7 65.0 L 100.2 64.4 L 100.7 63.9 L 101.2 63.3 L 101.8 62.9 L 102.3 62.3 L 102.9 61.9 L 103.5 61.4 L 104.0 60.9 L 104.6 60.4 L 105.1 59.9 L 105.7 59.4 L 106.4 59.0 L 106.9 58.5 L 107.5 58.0 L 108.0 57.5 L 108.6 57.0 L 109.3 56.6 L 109.8 56.1 L 110.5 55.7 L 111.1 55.3 L 111.6 54.8 L 112.3 54.4 L 112.8 53.9 L 113.5 53.5 L 114.1 53.1 L 114.8 52.7 L 115.3 52.2 L 115.9 51.7 L 116.5 51.2 L 117.2 50.9 L 117.8 50.5 L 118.5 50.1 L 119.2 49.7 L 119.8 49.2 L 120.4 48.8 L 121.1 48.4 L 121.7 48.1 L 122.4 47.7 L 123.0 47.3 L 123.8 47.0 L 124.5 46.6 L 125.1 46.2 L 125.9 45.9 L 126.6 45.6 L 127.3 45.2 L 127.9 44.8 L 128.6 44.4 L 129.3 44.0 L 129.9 43.6 L 130.6 43.2 L 131.2 42.8 L 132.0 42.5 L 132.7 42.2 L 133.5 41.9 L 134.2 41.6 L 134.9 41.3 L 135.6 40.9 L 136.4 40.6 L 137.1 40.2 L 137.7 39.9 L 138.5 39.5 L 139.2 39.2 L 140.0 38.9 L 140.7 38.6 L 141.5 38.4 L 142.2 38.0 L 142.9 37.7 L 143.7 37.4 L 144.5 37.1 L 145.2 36.8 L 146.1 36.6 L 146.9 36.4 L 147.7 36.1 L 148.4 35.8 L 149.1 35.4 L 149.8 35.1 L 150.6 34.8 L 151.3 34.5 L 152.2 34.3 L 153.0 34.1 L 153.8 33.8 L 154.5 33.5 L 155.3 33.2 L 156.2 33.0 L 157.0 32.8 L 157.8 32.6 L 158.6 32.3 L 159.4 32.1 L 160.2 31.8 L 161.1 31.6 L 161.9 31.3 L 162.7 31.1 L 163.5 30.9 L 164.3 30.6 L 165.3 30.6 L 166.1 30.3 L 167.0 30.2 L 167.9 30.0 L 168.7 29.8 L 169.5 29.5 L 170.3 29.3 L 171.1 29.0 L 172.0 28.9 L 172.9 28.7 L 173.7 28.4 L 174.5 28.2 L 175.4 28.1 L 176.3 27.9 L 177.2 27.7 L 178.1 27.6 L 179.0 27.4 L 179.9 27.3 L 180.8 27.1 L 181.6 26.9 L 182.5 26.7 L 183.4 26.6 L 184.3 26.4 L 185.2 26.2 L 186.1 26.1 L 186.9 25.9 L 187.8 25.7 L 188.7 25.6 L 189.7 25.4 L 190.6 25.3 L 191.4 25.1 L 192.3 25.0 L 193.3 24.9 L 194.2 24.8 L 195.1 24.6 L 196.1 24.6 L 197.0 24.4 L 197.9 24.2 L 198.9 24.2 L 199.8 24.0 L 200.7 23.9 L 201.7 23.8 L 202.6 23.7 L 203.5 23.5 L 204.5 23.5 L 205.4 23.3 L 206.4 23.2 L 207.3 23.1 L 208.3 23.1 L 209.2 22.9 L 210.2 22.9 L 211.2 22.8 L 212.2 22.7 L 213.1 22.6 L 214.0 22.5 L 214.9 22.3 L 215.9 22.2 L 216.9 22.1 L 217.8 22.0 L 218.9 22.0 L 219.8 21.9 L 220.8 21.8 L 221.8 21.8 L 222.8 21.7 L 223.8 21.7 L 224.8 21.6 L 225.8 21.6 L 226.7 21.5 L 227.7 21.4 L 228.7 21.3 L 229.7 21.3 L 230.7 21.2 L 231.6 21.1 L 232.6 21.0 L 233.6 21.0 L 234.6 20.9 L 235.7 20.9 L 236.7 20.9 L 237.7 20.8 L 238.6 20.8 L 239.6 20.7 L 240.6 20.7 L 241.6 20.6 L 242.6 20.5 L 243.6 20.4 L 244.6 20.4 L 245.6 20.3 L 246.6 20.3 L 247.6 20.3 L 248.6 20.2 L 249.6 20.2 L 250.7 20.1 L 251.7 20.1 L 252.7 20.1 L 253.7 20.1 L 254.8 20.1 L 255.8 20.1 L 256.9 20.0 L 257.9 20.0 L 258.9 20.0 L 260.0 20.0" class="d-line-acc"/>
  <path d="M50.0 229.9 L 50.4 213.6 L 50.8 204.4 L 51.3 196.8 L 51.7 191.0 L 52.2 185.5 L 52.7 180.4 L 53.2 176.4 L 53.7 171.6 L 54.2 168.1 L 54.7 164.2 L 55.2 161.2 L 55.7 157.8 L 56.2 154.9 L 56.7 151.9 L 57.1 148.3 L 57.7 145.4 L 58.2 143.6 L 58.7 140.9 L 59.2 139.1 L 59.7 137.6 L 60.2 135.6 L 60.7 134.2 L 61.2 132.7 L 61.8 131.4 L 62.3 129.6 L 62.8 128.0 L 63.3 126.0 L 63.8 124.4 L 64.3 123.0 L 64.9 122.2 L 65.4 121.2 L 65.9 119.9 L 66.4 119.0 L 66.9 117.5 L 67.5 116.5 L 68.0 115.7 L 68.5 114.2 L 69.0 113.2 L 69.5 112.0 L 70.1 111.0 L 70.6 109.5 L 71.1 108.3 L 71.6 106.9 L 72.1 106.3 L 72.7 105.5 L 73.2 103.9 L 73.7 102.6 L 74.2 101.6 L 74.7 100.5 L 75.3 99.7 L 75.8 99.2 L 76.3 98.5 L 76.8 97.8 L 77.4 96.7 L 77.9 95.9 L 78.4 95.3 L 78.9 94.2 L 79.5 93.4 L 80.0 92.2 L 80.5 91.1 L 81.0 90.6 L 81.5 89.2 L 82.1 88.1 L 82.6 87.3 L 83.1 86.7 L 83.6 85.7 L 84.2 85.0 L 84.7 84.6 L 85.2 84.1 L 85.7 83.2 L 86.3 82.5 L 86.8 82.2 L 87.3 81.7 L 87.8 81.2 L 88.4 79.5 L 88.9 79.0 L 89.4 78.6 L 89.9 78.2 L 90.5 77.6 L 91.0 77.0 L 91.5 76.4 L 92.0 76.0 L 92.6 75.2 L 93.1 74.9 L 93.6 73.6 L 94.1 72.8 L 94.7 72.4 L 95.2 71.3 L 95.7 70.6 L 96.2 69.7 L 96.8 68.8 L 97.3 68.2 L 97.8 67.5 L 98.3 66.7 L 98.8 66.1 L 99.4 65.8 L 99.9 65.2 L 100.4 64.7 L 101.0 64.3 L 101.5 64.0 L 102.0 62.9 L 102.5 62.5 L 103.1 62.2 L 103.6 61.4 L 104.1 61.1 L 104.6 60.2 L 105.2 59.9 L 105.7 59.5 L 106.2 59.3 L 106.8 58.9 L 107.3 58.4 L 107.8 58.0 L 108.3 57.9 L 108.9 57.5 L 109.4 57.1 L 109.9 56.1 L 110.4 55.9 L 111.0 55.3 L 111.5 54.9 L 112.0 54.4 L 112.6 54.1 L 113.1 53.8 L 113.6 53.4 L 114.1 52.9 L 114.7 52.8 L 115.2 52.7 L 115.7 52.3 L 116.2 51.7 L 116.8 51.4 L 117.3 51.2 L 117.8 51.0 L 118.4 50.6 L 118.9 50.3 L 119.4 50.1 L 119.9 49.7 L 120.5 49.4 L 121.0 48.9 L 121.5 48.9 L 122.1 48.7 L 122.6 48.2 L 123.1 48.1 L 123.7 47.7 L 124.2 47.4 L 124.7 47.4 L 125.2 46.9 L 125.8 46.5 L 126.3 46.4 L 126.8 46.1 L 127.4 45.8 L 127.9 45.6 L 128.4 45.2 L 128.9 44.6 L 129.5 44.5 L 130.0 44.3 L 130.5 44.0 L 131.1 43.8 L 131.6 43.7 L 132.1 43.5 L 132.6 43.5 L 133.2 43.4 L 133.7 43.3 L 134.2 43.1 L 134.8 42.9 L 135.3 42.7 L 135.8 42.7 L 136.4 42.5 L 136.9 42.4 L 137.4 42.2 L 137.9 42.0 L 138.5 41.9 L 139.0 41.7 L 139.5 41.5 L 140.1 41.0 L 140.6 40.8 L 141.1 40.4 L 141.6 39.9 L 142.2 39.8 L 142.7 39.5 L 143.2 39.3 L 143.8 39.2 L 144.3 38.8 L 144.8 38.6 L 145.4 38.5 L 145.9 38.4 L 146.4 38.2 L 146.9 37.8 L 147.5 37.7 L 148.0 37.6 L 148.5 37.6 L 149.1 37.2 L 149.6 37.0 L 150.1 36.9 L 150.7 36.5 L 151.2 36.3 L 151.7 36.1 L 152.2 36.1 L 152.8 35.2 L 153.3 34.8 L 153.8 34.7 L 154.4 34.7 L 154.9 34.5 L 155.4 34.3 L 155.9 34.3 L 156.5 34.3 L 157.0 34.1 L 157.5 34.0 L 158.1 33.9 L 158.6 33.9 L 159.1 33.5 L 159.7 33.2 L 160.2 33.0 L 160.7 32.9 L 161.2 32.9 L 161.8 32.9 L 162.3 32.7 L 162.8 32.4 L 163.4 32.4 L 163.9 32.3 L 164.4 32.0 L 165.0 31.9 L 165.5 31.8 L 166.0 31.7 L 166.6 31.7 L 167.1 31.3 L 167.6 31.2 L 168.1 31.1 L 168.7 31.0 L 169.2 30.7 L 169.7 30.6 L 170.3 30.1 L 170.8 29.9 L 171.3 29.9 L 171.8 29.9 L 172.4 29.8 L 172.9 29.6 L 173.4 29.2 L 174.0 28.9 L 174.5 28.7 L 175.0 28.6 L 175.6 28.6 L 176.1 28.5 L 176.6 28.1 L 177.1 28.1 L 177.7 28.1 L 178.2 28.0 L 178.7 28.0 L 179.3 27.6 L 179.8 27.2 L 180.3 27.2 L 180.9 27.1 L 181.4 27.1 L 181.9 27.1 L 182.5 27.1 L 183.0 27.0 L 183.5 26.8 L 184.0 26.7 L 184.6 26.6 L 185.1 26.5 L 185.6 26.5 L 186.2 26.4 L 186.7 26.3 L 187.2 26.1 L 187.8 26.1 L 188.3 26.0 L 188.8 25.9 L 189.4 25.9 L 189.9 25.6 L 190.4 25.6 L 190.9 25.5 L 191.5 25.1 L 192.0 25.0 L 192.5 24.9 L 193.1 24.7 L 193.6 24.6 L 194.1 24.5 L 194.7 24.4 L 195.2 24.4 L 195.7 24.4 L 196.2 24.2 L 196.8 24.2 L 197.3 24.1 L 197.8 24.1 L 198.4 24.0 L 198.9 24.0 L 199.4 23.8 L 200.0 23.7 L 200.5 23.6 L 201.0 23.5 L 201.6 23.5 L 202.1 23.5 L 202.6 23.3 L 203.1 23.0 L 203.7 22.9 L 204.2 22.9 L 204.7 22.8 L 205.3 22.7 L 205.8 22.7 L 206.3 22.7 L 206.9 22.7 L 207.4 22.7 L 207.9 22.7 L 208.5 22.6 L 209.0 22.5 L 209.5 22.4 L 210.1 22.4 L 210.6 22.3 L 211.1 22.2 L 211.6 22.2 L 212.2 22.2 L 212.7 22.2 L 213.2 22.2 L 213.8 22.1 L 214.3 22.1 L 214.8 22.0 L 215.4 21.9 L 215.9 21.9 L 216.4 21.9 L 217.0 21.9 L 217.5 21.8 L 218.0 21.8 L 218.5 21.7 L 219.1 21.6 L 219.6 21.5 L 220.1 21.5 L 220.7 21.5 L 221.2 21.5 L 221.7 21.5 L 222.3 21.5 L 222.8 21.3 L 223.3 21.3 L 223.9 21.3 L 224.4 21.3 L 224.9 21.2 L 225.5 21.2 L 226.0 21.2 L 226.5 21.2 L 227.1 21.2 L 227.6 21.1 L 228.1 21.1 L 228.6 21.1 L 229.2 21.1 L 229.7 20.9 L 230.2 20.9 L 230.8 20.9 L 231.3 20.9 L 231.8 20.9 L 232.4 20.9 L 232.9 20.9 L 233.4 20.9 L 234.0 20.9 L 234.5 20.8 L 235.0 20.7 L 235.6 20.7 L 236.1 20.7 L 236.6 20.7 L 237.1 20.7 L 237.7 20.7 L 238.2 20.7 L 238.7 20.7 L 239.3 20.7 L 239.8 20.6 L 240.3 20.5 L 240.9 20.5 L 241.4 20.4 L 241.9 20.3 L 242.5 20.3 L 243.0 20.2 L 243.5 20.2 L 244.1 20.2 L 244.6 20.2 L 245.1 20.2 L 245.6 20.2 L 246.2 20.2 L 246.7 20.2 L 247.2 20.2 L 247.8 20.1 L 248.3 20.1 L 248.8 20.0 L 249.4 20.0 L 249.9 20.0 L 250.4 20.0 L 251.0 20.0 L 251.5 20.0 L 252.0 20.0 L 252.6 20.0 L 253.1 20.0 L 253.6 20.0 L 254.2 20.0 L 254.7 20.0 L 255.2 20.0 L 255.7 20.0 L 256.3 20.0 L 256.8 20.0 L 257.3 20.0 L 257.9 20.0 L 258.4 20.0 L 258.9 20.0 L 259.5 20.0 L 260.0 20.0" class="d-line-key d-dash"/>
  <path d="M352.1 25.1 L 353.1 24.1 L 354.1 24.7 L 355.2 23.8 L 356.2 23.8 L 357.3 23.6 L 358.3 23.7 L 359.3 24.0 L 360.3 24.0 L 361.3 24.6 L 362.3 24.9 L 363.3 25.0 L 364.3 25.2 L 365.4 25.2 L 366.4 25.4 L 367.4 25.8 L 368.4 25.8 L 369.3 26.5 L 370.3 26.9 L 371.3 27.3 L 372.3 27.4 L 373.3 27.5 L 374.3 27.4 L 375.2 27.9 L 376.2 28.1 L 377.2 28.0 L 378.2 28.3 L 379.2 28.7 L 380.1 28.9 L 381.2 28.7 L 382.1 29.1 L 383.1 29.4 L 384.0 29.6 L 385.0 29.7 L 386.0 29.6 L 387.0 29.8 L 387.9 30.1 L 388.9 30.1 L 389.9 30.3 L 390.8 30.6 L 391.8 30.7 L 392.8 30.8 L 393.7 31.0 L 394.7 31.1 L 395.7 31.1 L 396.7 31.2 L 397.6 31.3 L 398.6 31.5 L 399.5 31.7 L 400.4 32.0 L 401.4 32.1 L 402.3 32.2 L 403.3 32.2 L 404.2 32.5 L 405.2 32.6 L 406.1 32.7 L 407.1 32.8 L 408.0 33.0 L 408.9 33.2 L 409.8 33.5 L 410.7 33.8 L 411.6 33.9 L 412.6 34.1 L 413.5 34.3 L 414.4 34.4 L 415.3 34.6 L 416.2 34.8 L 417.1 35.0 L 418.1 35.1 L 419.0 35.4 L 419.9 35.5 L 420.8 35.7 L 421.7 35.8 L 422.5 36.2 L 423.5 36.2 L 424.4 36.4 L 425.3 36.6 L 426.2 36.7 L 427.1 36.8 L 427.9 37.2 L 428.8 37.5 L 429.7 37.6 L 430.6 37.8 L 431.5 37.9 L 432.3 38.2 L 433.2 38.4 L 434.0 38.7 L 434.9 38.8 L 435.7 39.1 L 436.5 39.5 L 437.4 39.6 L 438.3 39.8 L 439.1 39.9 L 440.0 40.2 L 440.8 40.4 L 441.6 40.8 L 442.4 41.1 L 443.2 41.4 L 444.0 41.7 L 444.8 41.8 L 445.6 42.1 L 446.4 42.4 L 447.2 42.6 L 448.0 42.9 L 448.8 43.2 L 449.7 43.2 L 450.4 43.6 L 451.2 43.9 L 452.0 44.1 L 452.8 44.4 L 453.6 44.7 L 454.2 45.1 L 454.9 45.5 L 455.7 45.7 L 456.5 45.9 L 457.2 46.3 L 458.1 46.5 L 458.8 46.7 L 459.7 46.8 L 460.5 47.0 L 461.2 47.2 L 462.0 47.5 L 462.7 47.8 L 463.5 48.0 L 464.3 48.2 L 465.0 48.5 L 465.8 48.6 L 466.6 48.8 L 467.3 49.1 L 468.0 49.4 L 468.8 49.6 L 469.6 49.8 L 470.3 50.1 L 471.0 50.4 L 471.7 50.6 L 472.4 50.9 L 473.2 51.0 L 473.9 51.3 L 474.6 51.6 L 475.3 51.8 L 476.0 52.1 L 476.8 52.3 L 477.4 52.6 L 478.2 52.7 L 478.9 53.0 L 479.7 53.2 L 480.4 53.4 L 481.1 53.6 L 481.7 54.0 L 482.5 54.1 L 483.1 54.4 L 483.9 54.6 L 484.5 54.9 L 485.2 55.1 L 485.9 55.4 L 486.5 55.7 L 487.1 56.0 L 487.7 56.4 L 488.3 56.8 L 489.0 57.0 L 489.6 57.2 L 490.3 57.5 L 490.9 57.7 L 491.7 57.9 L 492.3 58.1 L 492.9 58.4 L 493.6 58.7 L 494.2 58.9 L 494.9 59.2 L 495.6 59.3 L 496.2 59.6 L 496.8 59.9 L 497.3 60.2 L 498.0 60.4 L 498.7 60.6 L 499.2 61.0 L 499.8 61.3 L 500.5 61.5 L 501.0 61.8 L 501.5 62.2 L 502.1 62.4 L 502.7 62.7 L 503.3 63.0 L 504.0 63.1 L 504.6 63.4 L 505.1 63.7 L 505.7 63.9 L 506.3 64.2 L 506.9 64.4 L 507.6 64.6 L 508.2 64.9 L 508.7 65.1 L 509.3 65.4 L 509.8 65.7 L 510.3 66.0 L 510.9 66.3 L 511.4 66.6 L 511.8 67.0 L 512.4 67.2 L 513.0 67.5 L 513.4 67.8 L 513.9 68.2 L 514.5 68.4 L 515.0 68.6 L 515.6 68.9 L 516.1 69.1 L 516.7 69.3 L 517.1 69.7 L 517.7 69.9 L 518.1 70.3 L 518.5 70.6 L 519.1 70.8 L 519.6 71.1 L 520.1 71.4 L 520.6 71.7 L 521.0 72.0 L 521.5 72.3 L 521.9 72.6 L 522.5 72.8 L 522.9 73.1 L 523.3 73.5 L 523.8 73.7 L 524.2 74.1 L 524.7 74.4 L 525.1 74.6 L 525.6 74.9 L 526.0 75.2 L 526.5 75.5 L 526.9 75.8 L 527.3 76.2 L 527.8 76.4 L 528.2 76.6 L 528.7 76.9 L 529.1 77.2 L 529.5 77.5 L 529.9 77.9 L 530.2 78.2 L 530.7 78.4 L 531.1 78.7 L 531.5 79.0 L 531.8 79.4 L 532.3 79.6 L 532.6 79.9 L 533.0 80.3 L 533.3 80.6 L 533.7 80.9 L 534.1 81.2 L 534.4 81.5 L 534.8 81.8 L 535.1 82.1 L 535.5 82.4 L 535.9 82.7 L 536.3 82.9 L 536.7 83.2 L 537.0 83.5 L 537.4 83.8 L 537.8 84.1 L 538.0 84.5 L 538.3 84.8 L 538.6 85.1 L 539.0 85.4 L 539.3 85.7 L 539.6 86.0 L 540.0 86.2 L 540.4 86.5 L 540.8 86.8 L 541.0 87.1 L 541.3 87.4 L 541.6 87.7 L 541.9 88.0 L 542.2 88.3 L 542.5 88.6 L 542.8 88.9 L 543.1 89.2 L 543.3 89.6 L 543.6 89.9 L 543.8 90.2 L 544.1 90.5 L 544.5 90.7 L 544.7 91.1 L 545.1 91.3 L 545.3 91.6 L 545.6 91.9 L 545.8 92.2 L 546.1 92.5 L 546.4 92.8 L 546.7 93.0 L 546.9 93.4 L 547.2 93.7 L 547.3 94.0 L 547.5 94.4 L 547.8 94.6 L 548.1 94.9 L 548.3 95.2 L 548.5 95.5 L 548.8 95.8 L 549.0 96.1 L 549.2 96.4 L 549.4 96.7 L 549.6 97.1 L 549.7 97.4 L 549.9 97.7 L 550.2 98.0 L 550.4 98.3 L 550.6 98.6 L 550.9 98.8 L 551.1 99.1 L 551.3 99.4 L 551.4 99.7 L 551.6 100.0 L 551.8 100.3 L 552.0 100.6 L 552.2 100.9 L 552.4 101.2 L 552.5 101.5 L 552.6 101.8 L 552.8 102.1 L 553.0 102.4 L 553.2 102.7 L 553.3 103.0 L 553.5 103.3 L 553.7 103.6 L 553.9 103.8 L 554.0 104.2 L 554.2 104.4 L 554.3 104.7 L 554.5 105.0 L 554.6 105.3 L 554.8 105.6 L 554.9 105.9 L 555.1 106.1 L 555.2 106.5 L 555.3 106.8 L 555.4 107.1 L 555.5 107.4 L 555.7 107.6 L 555.8 107.9 L 555.9 108.2 L 556.0 108.5 L 556.1 108.8 L 556.3 109.1 L 556.4 109.4 L 556.5 109.7 L 556.6 110.0 L 556.7 110.2 L 556.8 110.5 L 556.9 110.8 L 557.0 111.1 L 557.1 111.4 L 557.2 111.7 L 557.2 112.0 L 557.3 112.2 L 557.5 112.5 L 557.6 112.8 L 557.7 113.0 L 557.8 113.3 L 557.9 113.6 L 558.0 113.9 L 558.0 114.2 L 558.1 114.4 L 558.2 114.7 L 558.2 115.0 L 558.3 115.3 L 558.3 115.6 L 558.4 115.9 L 558.4 116.1 L 558.6 116.4 L 558.6 116.6 L 558.7 116.9 L 558.8 117.2 L 558.8 117.5 L 558.9 117.7 L 559.0 118.0 L 559.0 118.2 L 559.1 118.5 L 559.1 118.8 L 559.1 119.1 L 559.2 119.3 L 559.2 119.6 L 559.3 119.9 L 559.4 120.1 L 559.5 120.3 L 559.5 120.6 L 559.6 120.9 L 559.6 121.1 L 559.7 121.4 L 559.7 121.6 L 559.7 121.9 L 559.8 122.1 L 559.8 122.4 L 559.9 122.7 L 559.9 122.9 L 559.9 123.2 L 559.9 123.4 L 559.9 123.7 L 559.9 124.0 L 560.0 124.2 L 560.0 124.5 L 560.0 124.7 L 560.0 125.0" class="d-line-acc"/>
  <path d="M352.1 113.3 L 366.9 167.0 L 376.6 178.8 L 383.5 186.5 L 389.4 191.4 L 394.8 194.7 L 399.7 197.3 L 404.0 199.5 L 408.4 201.1 L 412.3 202.6 L 416.0 203.8 L 419.1 205.1 L 422.7 206.0 L 425.3 207.0 L 428.5 207.7 L 431.9 208.3 L 434.8 208.9 L 436.6 209.7 L 439.4 210.3 L 441.0 211.0 L 442.4 211.6 L 444.5 212.1 L 445.9 212.7 L 447.4 213.1 L 448.9 213.6 L 450.5 214.0 L 452.2 214.4 L 454.1 214.7 L 455.6 215.0 L 457.0 215.3 L 457.9 215.7 L 458.8 216.0 L 460.1 216.3 L 461.0 216.6 L 462.5 216.8 L 463.5 217.1 L 464.4 217.3 L 465.9 217.5 L 467.2 217.7 L 468.0 217.9 L 469.1 218.1 L 470.6 218.3 L 471.8 218.4 L 473.1 218.6 L 473.7 218.8 L 474.6 219.0 L 476.1 219.1 L 477.6 219.2 L 478.4 219.3 L 479.5 219.5 L 480.4 219.6 L 480.8 219.8 L 481.5 219.9 L 482.4 220.0 L 483.5 220.2 L 484.2 220.3 L 484.7 220.4 L 485.8 220.5 L 486.7 220.6 L 487.8 220.7 L 488.9 220.8 L 489.4 220.9 L 490.9 220.9 L 491.9 221.0 L 492.8 221.1 L 493.3 221.2 L 494.3 221.3 L 495.0 221.4 L 495.4 221.5 L 496.1 221.6 L 496.9 221.6 L 497.5 221.7 L 497.8 221.8 L 498.3 221.9 L 499.1 222.0 L 500.5 222.0 L 501.0 222.1 L 501.4 222.2 L 501.8 222.2 L 502.4 222.3 L 503.1 222.4 L 503.6 222.4 L 504.1 222.5 L 504.8 222.6 L 505.3 222.6 L 506.4 222.7 L 507.2 222.7 L 507.7 222.8 L 508.7 222.8 L 509.4 222.9 L 510.3 222.9 L 511.2 222.9 L 511.8 223.0 L 512.5 223.0 L 513.3 223.1 L 513.9 223.1 L 514.3 223.2 L 514.9 223.2 L 515.3 223.3 L 515.8 223.3 L 516.1 223.4 L 517.2 223.4 L 517.5 223.5 L 517.8 223.5 L 518.6 223.5 L 518.9 223.6 L 519.8 223.6 L 520.2 223.7 L 520.5 223.7 L 520.7 223.8 L 521.1 223.8 L 521.6 223.8 L 522.0 223.9 L 522.1 223.9 L 522.5 224.0 L 522.9 224.0 L 523.9 224.0 L 524.1 224.1 L 524.7 224.1 L 525.1 224.1 L 525.6 224.2 L 525.9 224.2 L 526.2 224.2 L 526.7 224.3 L 527.1 224.3 L 527.2 224.3 L 527.5 224.4 L 527.8 224.4 L 528.3 224.4 L 528.6 224.5 L 528.8 224.5 L 529.0 224.5 L 529.4 224.6 L 529.7 224.6 L 529.9 224.6 L 530.3 224.7 L 530.6 224.7 L 531.1 224.7 L 531.1 224.8 L 531.3 224.8 L 531.8 224.8 L 531.9 224.9 L 532.3 224.9 L 532.6 224.9 L 532.6 224.9 L 533.2 225.0 L 533.5 225.0 L 533.6 225.0 L 533.9 225.0 L 534.2 225.1 L 534.4 225.1 L 534.8 225.1 L 535.4 225.1 L 535.5 225.2 L 535.7 225.2 L 536.0 225.2 L 536.2 225.2 L 536.3 225.3 L 536.5 225.3 L 536.5 225.3 L 536.6 225.3 L 536.7 225.4 L 536.9 225.4 L 537.1 225.4 L 537.3 225.4 L 537.3 225.5 L 537.5 225.5 L 537.6 225.5 L 537.8 225.5 L 538.0 225.6 L 538.1 225.6 L 538.3 225.6 L 538.5 225.6 L 539.0 225.6 L 539.2 225.7 L 539.6 225.7 L 540.0 225.7 L 540.3 225.7 L 540.5 225.7 L 540.7 225.8 L 540.8 225.8 L 541.2 225.8 L 541.4 225.8 L 541.5 225.8 L 541.6 225.8 L 541.8 225.9 L 542.1 225.9 L 542.3 225.9 L 542.4 225.9 L 542.4 225.9 L 542.8 226.0 L 543.0 226.0 L 543.1 226.0 L 543.5 226.0 L 543.7 226.0 L 543.9 226.0 L 543.9 226.1 L 544.8 226.1 L 545.2 226.1 L 545.3 226.1 L 545.3 226.1 L 545.6 226.1 L 545.7 226.1 L 545.7 226.2 L 545.7 226.2 L 545.9 226.2 L 546.0 226.2 L 546.1 226.2 L 546.1 226.2 L 546.5 226.3 L 546.8 226.3 L 547.0 226.3 L 547.1 226.3 L 547.1 226.3 L 547.1 226.3 L 547.3 226.3 L 547.6 226.4 L 547.6 226.4 L 547.7 226.4 L 548.0 226.4 L 548.1 226.4 L 548.2 226.4 L 548.3 226.4 L 548.3 226.5 L 548.7 226.5 L 548.8 226.5 L 548.9 226.5 L 549.0 226.5 L 549.3 226.5 L 549.5 226.5 L 549.9 226.5 L 550.1 226.5 L 550.1 226.6 L 550.1 226.6 L 550.2 226.6 L 550.4 226.6 L 550.8 226.6 L 551.1 226.6 L 551.3 226.6 L 551.4 226.6 L 551.4 226.7 L 551.5 226.7 L 551.9 226.7 L 551.9 226.7 L 551.9 226.7 L 552.0 226.7 L 552.0 226.7 L 552.4 226.7 L 552.8 226.7 L 552.8 226.8 L 552.9 226.8 L 552.9 226.8 L 552.9 226.8 L 552.9 226.8 L 553.0 226.8 L 553.2 226.8 L 553.3 226.8 L 553.4 226.8 L 553.5 226.9 L 553.5 226.9 L 553.6 226.9 L 553.7 226.9 L 553.9 226.9 L 553.9 226.9 L 554.0 226.9 L 554.1 226.9 L 554.1 226.9 L 554.4 226.9 L 554.4 227.0 L 554.5 227.0 L 554.9 227.0 L 555.0 227.0 L 555.1 227.0 L 555.3 227.0 L 555.4 227.0 L 555.5 227.0 L 555.6 227.0 L 555.6 227.0 L 555.7 227.0 L 555.8 227.1 L 555.8 227.1 L 555.9 227.1 L 556.0 227.1 L 556.0 227.1 L 556.0 227.1 L 556.2 227.1 L 556.3 227.1 L 556.4 227.1 L 556.5 227.1 L 556.5 227.1 L 556.5 227.2 L 556.7 227.2 L 557.0 227.2 L 557.1 227.2 L 557.1 227.2 L 557.2 227.2 L 557.3 227.2 L 557.3 227.2 L 557.3 227.2 L 557.3 227.2 L 557.3 227.2 L 557.3 227.3 L 557.4 227.3 L 557.5 227.3 L 557.6 227.3 L 557.6 227.3 L 557.7 227.3 L 557.8 227.3 L 557.8 227.3 L 557.8 227.3 L 557.8 227.3 L 557.8 227.3 L 557.9 227.3 L 557.9 227.3 L 558.0 227.4 L 558.1 227.4 L 558.1 227.4 L 558.1 227.4 L 558.1 227.4 L 558.2 227.4 L 558.2 227.4 L 558.3 227.4 L 558.5 227.4 L 558.5 227.4 L 558.5 227.4 L 558.5 227.4 L 558.5 227.4 L 558.5 227.5 L 558.5 227.5 L 558.7 227.5 L 558.7 227.5 L 558.7 227.5 L 558.7 227.5 L 558.8 227.5 L 558.8 227.5 L 558.8 227.5 L 558.8 227.5 L 558.8 227.5 L 559.0 227.5 L 559.0 227.5 L 559.0 227.5 L 559.1 227.6 L 559.1 227.6 L 559.1 227.6 L 559.1 227.6 L 559.1 227.6 L 559.1 227.6 L 559.1 227.6 L 559.1 227.6 L 559.1 227.6 L 559.1 227.6 L 559.2 227.6 L 559.3 227.6 L 559.3 227.6 L 559.3 227.6 L 559.3 227.6 L 559.3 227.7 L 559.3 227.7 L 559.3 227.7 L 559.3 227.7 L 559.3 227.7 L 559.4 227.7 L 559.5 227.7 L 559.5 227.7 L 559.6 227.7 L 559.7 227.7 L 559.7 227.7 L 559.8 227.7 L 559.8 227.7 L 559.8 227.7 L 559.8 227.7 L 559.8 227.7 L 559.8 227.7 L 559.8 227.8 L 559.8 227.8 L 559.8 227.8 L 559.9 227.8 L 559.9 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.8 L 560.0 227.9 L 560.0 227.9 L 560.0 227.9 L 560.0 227.9 L 560.0 227.9 L 560.0 227.9 L 560.0 227.9 L 560.0 227.9 L 560.0 227.9 L 560.0 227.9" class="d-line-key"/>
  <text x="568" y="50" class="t-small t-acc">50% positive</text><text x="568" y="68" class="t-small t-key">1% positive</text>
</svg></div><figcaption><b>The same scorer at two prevalences, from the program above.</b> The two ROC curves coincide, with the 1% curve dashed. The precision-recall curves don't.</figcaption></figure>

The same scorer has nearly the same ROC-AUC and recall in both worlds, and the small differences are sampling noise. Precision and average precision collapse when positives are rare, since even a small FPR on a huge negative class swamps the true positives. ROC-AUC isn't wrong here. It answers a different question, about ranking across classes, while PR-AUC reflects what you'd experience when you act on the flagged cases. Use PR-AUC when positives are rare and the flagged set is what matters.

:::trap ROC-AUC can hide a poor classifier
With 1% positives, an FPR of 5% can mean most of your alerts are false, as the Bayes example showed in [Chapter 1](#ch01). Quote precision and recall at the threshold you'd actually use.
:::

## Calibration {#ch03-cal .th}

A model is **calibrated** if, among cases where it says 0.8, about 80% are positive. You need this when the probability feeds a decision or gets combined with other numbers, for example expected cost or a ranking score multiplied by value. Ranking metrics can't see it: AUC only depends on order, so any monotonic transform leaves it unchanged. **Brier score** (mean squared error of the probability) and **log loss** do notice.

Check calibration with a **reliability diagram**: bin predictions, and compare the mean prediction in each bin with the fraction of positives. Boosted trees and neural networks often need calibration, and SVM outputs need it by nature. Two standard fixes, each fitted on held-out data:

- **Platt scaling**: fit a logistic regression on the model's score. Simple, with few parameters, and good for sigmoid-shaped distortion.
- **Isotonic regression**: fit a non-decreasing step function. More flexible, but it needs more data.

```python run=mf-c03-cal
import numpy as np

rng = np.random.default_rng(0)
n = 40_000
true_logit = rng.normal(-1, 1.5, n)
y = (rng.random(n) < 1 / (1 + np.exp(-true_logit))).astype(float)
raw = 3 * true_logit                       # right order, overconfident
sig = lambda z: 1 / (1 + np.exp(-z))
fit, ev = np.arange(n) < n // 2, np.arange(n) >= n // 2

def auc(y, s):
    r = np.argsort(np.argsort(s)) + 1
    n1 = y.sum()
    return (r[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * (len(y) - n1))

def brier(p, y):
    return np.mean((p - y)**2)

def logloss(p, y):
    p = np.clip(p, 1e-12, 1 - 1e-12)
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))

# Platt scaling on half the data, with a simple Newton loop
a, b = 0.0, 0.0
X = np.c_[raw[fit], np.ones(fit.sum())]
for _ in range(25):
    p = sig(X @ [a, b])
    g = X.T @ (p - y[fit])
    H = (X.T * (p * (1 - p))) @ X
    a, b = np.array([a, b]) - np.linalg.solve(H, g)
print(f"Platt fit: slope {a:.3f}  intercept {b:.3f}")

before, after = sig(raw[ev]), sig(a * raw[ev] + b)
print(f"{'':9} {'AUC':>6} {'Brier':>7} {'logloss':>8}")
for name, p in [("raw", before), ("calibrated", after)]:
    print(f"{name:10} {auc(y[ev], p):5.3f} {brier(p, y[ev]):7.3f} {logloss(p, y[ev]):8.3f}")

print("bin          mean raw   mean calibrated   actual")
edges = np.linspace(0, 1, 6)
idx = np.minimum((before * 5).astype(int), 4)
for k in range(5):
    m = idx == k
    print(f"[{edges[k]:.1f}, {edges[k + 1]:.1f})  {before[m].mean():8.3f} {after[m].mean():17.3f} {y[ev][m].mean():8.3f}")
```

The raw scores have the right order and are three times too confident. Platt scaling finds a slope near `1/3`, which undoes that. The AUC column doesn't change, while Brier and log loss improve, and the calibrated column tracks the actual rate. Fit the calibrator on data the model hasn't trained on, or it learns the training-set overconfidence.

## Regression metrics {#ch03-reg .th}

| Metric | Formula | Notes |
|---|---|---|
| MAE | mean of absolute errors | In target units, robust to outliers. The best constant is the median |
| MSE, RMSE | mean of squared errors, and its root | Punishes large errors. The best constant is the mean |
| R² | 1 - SSE/SST | Share of variance explained. Can be negative on new data |
| MAPE | mean of absolute error / actual | Scale-free, undefined at zero, favours under-forecasting |
| sMAPE | symmetrised MAPE | Bounded, but it still behaves oddly near zero |
| Pinball loss | asymmetric absolute error | Trains and scores a chosen quantile |

```python run=mf-c03-reg
import numpy as np

rng = np.random.default_rng(0)
y = np.exp(rng.normal(3, 1, 20_000))     # skewed positive target, such as order value
grid = np.linspace(1, 60, 2361)

def best(loss):
    return grid[np.argmin([loss(c) for c in grid])]

print(f"mean {y.mean():.1f}  median {np.median(y):.1f}")
print(f"best constant: MSE {best(lambda c: np.mean((y - c)**2)):.1f}  MAE {best(lambda c: np.mean(np.abs(y - c))):.1f}"
      f"  MAPE {best(lambda c: np.mean(np.abs(y - c) / y)):.1f}")

ybar = np.full_like(y, y.mean())
r2 = lambda p: 1 - np.sum((y - p)**2) / np.sum((y - y.mean())**2)
print(f"R^2 of predicting the mean {r2(ybar):.3f}")
print(f"R^2 of predicting the median {r2(np.full_like(y, np.median(y))):.3f}")

print("MAPE asymmetry: actual 100, forecast 50 gives", abs(100 - 50) / 100, " actual 50, forecast 100 gives", abs(50 - 100) / 50)

# Fitting on log(y) and exponentiating estimates the median, not the mean.
print(f"exp(mean(log y)) {np.exp(np.log(y).mean()):.1f}  against mean of y {y.mean():.1f}")
```

Each metric picks a different "best" constant on this skewed data: MSE the mean, MAE the median, and MAPE a value far below both, near `exp(μ - σ²)` for a log-normal. So if you tune on MAPE you get systematic under-forecasts. Predicting the median gives a negative R², as R² compares against the mean. The same skew matters when you train on `log(y)`: exponentiating the prediction gives something close to the median, 20.2 here against a mean of 33.0, so totals come out too low unless you correct for it.

## Hyperparameter tuning {#ch03-tune .th}

- **Grid search** tries all combinations. Its cost grows exponentially with the number of dimensions.
- **Random search** samples combinations. It usually beats grid search with the same budget when a few parameters matter most, since each trial tries a new value of every parameter (Bergstra and Bengio's argument).
- **Bayesian optimisation** fits a surrogate model of the score and picks promising trials. It helps when each trial is expensive.
- **Early stopping and successive halving** (Hyperband is a well-known variant) drop weak trials early to spend the budget on good ones.

Sample learning rates and regularisation strengths on a log scale. Tune on validation data, with the test set kept out, or use nested cross-validation for an honest estimate.

```python run=mf-c03-tune
import numpy as np

rng = np.random.default_rng(0)

def score(a, b, a0, b0):            # a matters a lot, b hardly at all
    return np.exp(-((a - a0) / 0.05)**2) + 0.05 * np.exp(-((b - b0) / 0.3)**2)

grid_vals = (np.arange(4) + 0.5) / 4
ga, gb = [g.ravel() for g in np.meshgrid(grid_vals, grid_vals)]
gr, ra = [], []
for _ in range(2000):
    a0, b0 = rng.random(2)
    gr.append(score(ga, gb, a0, b0).max())
    ra.append(score(rng.random(16), rng.random(16), a0, b0).max())
print(f"16 trials, average best score: grid {np.mean(gr):.3f}  random {np.mean(ra):.3f}")
print(f"distinct values of the important parameter: grid {len(set(ga.tolist()))}  random 16")
```

Sixteen grid trials try only four values of the important parameter, so the other twelve are spent on a parameter that hardly matters.

## Feature engineering {#ch03-feat .th}

Good features often matter more than the model, especially on tabular data. The usual toolkit:

- **Numeric**: standardise for linear and distance-based models, log-transform skewed values, clip or bin outliers.
- **Categorical**: one-hot for few levels. For many levels, consider hashing, embeddings, or **target encoding**, which replaces a category with its target mean.
- **Missing values**: impute (fit on training rows) and add an "is missing" indicator, since missingness often carries signal. Tree libraries such as XGBoost and LightGBM handle missing values natively.
- **Time**: lag values, rolling statistics of the past, day of week, holidays, and time since an event. Encode cyclic values with sine and cosine.
- **Interactions**: ratios, differences and products. Linear models need these explicitly. Trees can approximate them, with some effort.
- **Text**: TF-IDF is a strong baseline for classical models.

Target encoding is a common way to leak. A category seen once gets its own label as its encoding.

```python run=mf-c03-feat
import numpy as np

rng = np.random.default_rng(0)
n = 2000
cat_tr, cat_te = rng.integers(0, 500, n), rng.integers(0, 500, n)
ytr, yte = rng.integers(0, 2, n).astype(float), rng.integers(0, 2, n).astype(float)   # no relation at all

def auc(y, s):
    order = np.argsort(s, kind="stable")
    su = np.unique(s, return_inverse=True)[1]
    ranks = np.zeros(len(s))
    ranks[order] = np.arange(1, len(s) + 1)
    avg = np.bincount(su, ranks) / np.bincount(su)
    r = avg[su]
    n1 = y.sum()
    return (r[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * (len(y) - n1))

def encode(cat_fit, y_fit, cat_new, smooth=0.0):
    prior = y_fit.mean()
    s = np.bincount(cat_fit, y_fit, 500)
    c = np.bincount(cat_fit, minlength=500)
    return ((s + smooth * prior) / np.maximum(c + smooth, 1e-9))[cat_new] * (c[cat_new] > 0) + prior * (c[cat_new] == 0)

naive_tr = encode(cat_tr, ytr, cat_tr)
naive_te = encode(cat_tr, ytr, cat_te)
print(f"naive encoding:        train AUC {auc(ytr, naive_tr):.3f}  test AUC {auc(yte, naive_te):.3f}")

oof = np.zeros(n)
folds = np.array_split(rng.permutation(n), 5)
for f in folds:
    keep = np.setdiff1d(np.arange(n), f)
    oof[f] = encode(cat_tr[keep], ytr[keep], cat_tr[f], smooth=10.0)
print(f"out-of-fold encoding:  train AUC {auc(ytr, oof):.3f}  test AUC {auc(yte, encode(cat_tr, ytr, cat_te, 10.0)):.3f}")

# Hour 23 and hour 0 are neighbours, and a plain number hides that.
angle = lambda h: 2 * np.pi * h / 24
circ = lambda a, b: float(np.hypot(np.sin(angle(a)) - np.sin(angle(b)), np.cos(angle(a)) - np.cos(angle(b))))
print(f"hours 23 and 0: raw gap {abs(23 - 0)}, sin/cos distance {circ(23, 0):.3f}")
print(f"hours 11 and 12: raw gap {abs(11 - 12)}, sin/cos distance {circ(11, 12):.3f}")
```

Naive target encoding gets an AUC of 0.78 on training data from a feature with no information, and 0.50 on test data. A downstream model would trust it heavily and then fail. Encoding each row using only the other folds, plus smoothing towards the overall mean, removes the illusion, so the training score is now close to the test score. The sine and cosine pair puts hours 23 and 0 at the same distance as hours 11 and 12.

## Time-series splits {#ch03-tssplit .th}

Time-ordered data breaks the assumption behind random splits, since rows are correlated and the future isn't available when you predict. A random split lets the model interpolate between neighbours in time, which it can't do in production.

Use a **forward split**: train on the past, validate on the future. An **expanding window** keeps all history, and a **sliding window** keeps only recent history, which helps when old data no longer applies. Add a **gap** between train and validation if your features or labels span a window, or if real predictions have a delay.

```python run=mf-c03-tssplit
import numpy as np

rng = np.random.default_rng(0)
n = 1000
y = np.cumsum(rng.normal(0, 1, n))        # random walk: no pattern to learn
t = np.arange(n)

def nearest_in_time(train, test):
    idx = np.searchsorted(train, test).clip(1, len(train) - 1)
    left, right = train[idx - 1], train[idx]
    return y[np.where(test - left <= right - test, left, right)]

rmse = lambda test, p: float(np.sqrt(np.mean((y[test] - p)**2)))

perm = rng.permutation(n)
tr, te = np.sort(perm[:800]), np.sort(perm[800:])
print(f"random 80/20 split:  RMSE {rmse(te, nearest_in_time(tr, te)):.2f}")

tr, te = t[:800], t[800:]
print(f"forward 80/20 split: RMSE {rmse(te, nearest_in_time(tr, te)):.2f}")
```

The model simply copies the value at the nearest training time. With a random split, it always has a neighbour one or two steps away, and it looks very accurate on a series with no predictable pattern. A forward split shows the real error of predicting up to 200 steps ahead.

## ARIMA intuition and seasonality {#ch03-arima .th}

Many models assume **stationarity**: the mean, variance and autocorrelation structure don't change over time. Trends and seasonality break that. **Differencing**, `y′ₜ = yₜ - yₜ₋₁`, removes a trend. Seasonal differencing, `yₜ - yₜ₋₁₂` for monthly data, removes a repeating annual pattern. **ARIMA(p, d, q)** combines three ideas:

- **AR(p)**, autoregression: the value depends on its last `p` values. `yₜ = c + φ₁yₜ₋₁ + … + φₚyₜ₋ₚ + εₜ`.
- **I(d)**, integrated: difference the series `d` times first.
- **MA(q)**, moving average: the value depends on the last `q` forecast **errors**. `yₜ = c + εₜ + θ₁εₜ₋₁ + … + θ_qεₜ₋_q`. This has nothing to do with a rolling mean of values.

**SARIMA** adds seasonal terms, written `(p,d,q)(P,D,Q)ₛ` with season length `s`. To guess orders, look at the **ACF** (autocorrelation at each lag) and **PACF** (autocorrelation after removing shorter lags). An AR(p) has a PACF that cuts off after lag `p`. An MA(q) has an ACF that cuts off after lag `q`. In practice, people compare information criteria such as AIC, or use an automatic search, and check that residuals look like noise.

```python run=mf-c03-arima
import numpy as np

rng = np.random.default_rng(0)

def acf(x, lags):
    x = x - x.mean()
    return [float(x[:-k] @ x[k:] / (x @ x)) for k in lags]

fmt = lambda v: " ".join(f"{a:+.2f}" for a in v)
lags = (1, 2, 3, 6, 12, 24)
print("lags              ", lags)

e = rng.normal(size=5000)
walk = np.cumsum(e)
print("random walk ACF   ", fmt(acf(walk, lags)))
print("its differences   ", fmt(acf(np.diff(walk), lags)))

t = np.arange(600)
seasonal = 10 * np.sin(2 * np.pi * t / 12) + rng.normal(0, 3, 600)
print("seasonal ACF      ", fmt(acf(seasonal, lags)))
print("lag-12 differenced", fmt(acf(seasonal[12:] - seasonal[:-12], lags)))

# AR(2): phi1 and phi2 recovered by least squares on lagged values
y = np.zeros(5000)
for i in range(2, 5000):
    y[i] = 0.6 * y[i - 1] + 0.3 * y[i - 2] + e[i]
A = np.c_[y[1:-1], y[:-2], np.ones(4998)]
print("AR(2) fit [phi1, phi2]", np.linalg.lstsq(A, y[2:], rcond=None)[0][:2].round(2).tolist())
```

The random walk's ACF stays near 1 and barely decays, which is the sign that you need to difference. Its differences have an ACF near 0, since they are just the noise. The seasonal series has strong peaks at lags 12 and 24 and a trough at lag 6. Differencing at lag 12 removes the pattern and leaves a value near -0.5 at lag 12: this series was a fixed cycle plus noise, so differencing it creates a seasonal MA term. The least-squares fit recovers the AR coefficients 0.6 and 0.3.

An AR model fits with least squares, as above, but MA terms depend on unobserved errors, so ARIMA libraries use maximum likelihood. This is what a library call looks like, for reference only:

```python
# Illustrative: needs statsmodels, not run on this site, and no output is shown.
from statsmodels.tsa.statespace.sarimax import SARIMAX

model = SARIMAX(train, order=(1, 1, 1), seasonal_order=(0, 1, 1, 12))
fit = model.fit(disp=False)
forecast = fit.forecast(steps=12)
```

Other methods to name: **exponential smoothing** (ETS and Holt-Winters) for level, trend and season, and **gradient boosting on lag features**, which is popular when there are many related series. Recall from [Chapter 2](#ch02) that trees can't continue a trend, so difference or detrend first.

## Backtesting a forecast {#ch03-backtest .th}

A **backtest**, or rolling-origin evaluation, simulates forecasting in the past. Choose a cut-off, train on data up to it, forecast `h` steps, score, move the cut-off forward and repeat. Each origin gives one honest forecast for that horizon.

Always include simple baselines, because they're hard to beat on many real series:

- **Naive**: repeat the last value.
- **Seasonal naive**: repeat the value from one season ago.

**MASE** (mean absolute scaled error) divides your MAE by the in-sample MAE of a naive (or seasonal naive) forecast. It's scale-free, so you can average it across series, and below 1 means you beat the in-sample benchmark.

```python run=mf-c03-backtest
import numpy as np

rng = np.random.default_rng(0)
n, s, h = 144, 12, 12
t = np.arange(n)
noise = np.zeros(n)
for i in range(1, n):
    noise[i] = 0.6 * noise[i - 1] + rng.normal(0, 2)
y = 100 + 0.5 * t + 10 * np.sin(2 * np.pi * t / s) + noise

def naive(hist):
    return np.full(h, hist[-1])

def seasonal_naive(hist):
    return hist[-s:][:h].copy()

def seasonal_ar(hist):
    """AR(1) on seasonal differences, then undo the differencing. A small SARIMA relative."""
    d = hist[s:] - hist[:-s]
    A = np.c_[d[:-1], np.ones(len(d) - 1)]
    phi, c = np.linalg.lstsq(A, d[1:], rcond=None)[0]
    out = list(hist)
    last = d[-1]
    for _ in range(h):
        last = c + phi * last
        out.append(out[-s] + last)
    return np.array(out[-h:])

origins = range(84, n - h + 1, 6)
print(f"{len(origins)} origins, horizon {h}")
print(f"{'model':16} {'MAE':>6} {'MASE':>6} {'MAE h=1':>8} {'MAE h=12':>9}")
for name, model in [("naive", naive), ("seasonal naive", seasonal_naive), ("seasonal AR", seasonal_ar)]:
    errs, scaled = [], []
    for o in origins:
        hist, future = y[:o], y[o:o + h]
        e = np.abs(model(hist) - future)
        errs.append(e)
        scaled.append(e.mean() / np.mean(np.abs(hist[s:] - hist[:-s])))
    errs = np.array(errs)
    print(f"{name:16} {errs.mean():6.2f} {np.mean(scaled):6.2f} {errs[:, 0].mean():8.2f} {errs[:, -1].mean():9.2f}")
```

The MASE here divides by the in-sample seasonal naive error at each origin. Naive ignores the season, so it does worst, except at `h = 12` where its forecast is the same as seasonal naive: the last value is also the value one season before the target. Seasonal naive has a MASE near 1, as you'd expect, and it runs behind by the yearly trend of about 6 units. The seasonal AR model learns that trend from the seasonal differences, and it roughly halves the error. All three do worse at `h = 12` than at `h = 1`, so report error by horizon. This series was generated with the structure the last model assumes, so don't expect such a clean win on real data.

:::trap Common backtest mistakes
**Using actuals for future inputs.** If a feature such as weather or price is only known after the fact, a backtest with real values overstates performance. Use what was known at the forecast time. **Fitting on the full series.** A scaler, a differencing choice or a set of hyperparameters from all the data leaks the future. **Tuning on the backtest and reporting that score.** Hold out the final period. **Averaging over horizons only.** Report error by horizon, since it usually grows with distance.
:::

## Drills {#ch03-drills .dr}

:::drill concept
Why do we need a test set if we've got cross-validation?
---
Cross-validation estimates performance, and you also use it to choose hyperparameters and models. Once you've picked the best of many options using it, its score is optimistic. An untouched test set gives an unbiased final estimate. Nested cross-validation is an alternative when data is scarce.
:::

:::drill tricky
Your validation AUC is 0.92 and the test AUC is 0.78. List the possible causes, in the order you'd check them.
---
1. **Leakage** into validation: preprocessing on all data, shared groups, duplicates.
2. **Overfitting to validation**: many tuning rounds, especially on a small set.
3. **Distribution shift**: test data comes from a different time or population. Check with an adversarial classifier that tries to tell the sets apart.
4. **Different label quality or a different split procedure.** A random validation split against a time-based test split is a classic.
5. **Noise**: a small test set has a wide interval on its AUC.
:::

:::drill bug
The test accuracy of this 1-nearest-neighbour model looks great. Where's the bug?

```python run=mf-c03-d-oversample
import numpy as np

rng = np.random.default_rng(0)
n = 1000
y = (rng.random(n) < 0.1).astype(int)
X = rng.normal(size=(n, 5))                 # features are pure noise

def one_nn(Xtr, ytr, Xte):
    return ytr[((Xte[:, None] - Xtr[None])**2).sum(axis=2).argmin(axis=1)]

def score(p, t):
    return f"recall {np.mean(p[t == 1] == 1):.3f}"

pos = np.flatnonzero(y == 1)
idx = np.r_[np.arange(n), rng.choice(pos, 800)]    # oversample first ...
Xo, yo = X[idx], y[idx]
perm = rng.permutation(len(idx))
tr, te = perm[:1400], perm[1400:]                  # ... then split
print("oversample then split:", score(one_nn(Xo[tr], yo[tr], Xo[te]), yo[te]))

perm = rng.permutation(n)
tr, te = perm[:800], perm[800:]
keep = np.r_[tr, rng.choice(tr[y[tr] == 1], 600)]  # split first, oversample train only
print("split then oversample:", score(one_nn(X[keep], y[keep], X[te]), y[te]))
```
---
**Bug.** Oversampling happened before the split, so copies of the same positive row sit on both sides. 1-NN finds its own duplicate and appears to detect positives, although the features are noise.

**Fix.** Split first, then resample only the training rows. Evaluate on data with the real class ratio. The same rule applies to SMOTE, which interpolates between neighbours and leaks in the same way.
:::

:::drill output
A model has TP = 40, FP = 10, FN = 60, TN = 890. Give accuracy, precision, recall, F1 and FPR.

```python run=mf-c03-d-conf
tp, fp, fn, tn = 40, 10, 60, 890
p, r = tp / (tp + fp), tp / (tp + fn)
print(f"accuracy {(tp + tn) / 1000:.3f}  precision {p:.3f}  recall {r:.3f}  F1 {2 * p * r / (p + r):.3f}  FPR {fp / (fp + tn):.3f}")
```
---
**Answer.** Accuracy is 0.93, precision 0.80, recall 0.40, F1 about 0.53, and FPR about 0.011.

**Why.** The accuracy looks good, and 60% of positives are missed. F1 sits below the arithmetic mean of 0.60, because a harmonic mean is pulled towards the smaller value.
:::

:::drill output
Scores for positives are `[0.9, 0.6, 0.4]` and for negatives `[0.7, 0.3]`. What's the ROC-AUC?

```python run=mf-c03-d-auc
pos, neg = [0.9, 0.6, 0.4], [0.7, 0.3]
pairs = [(p, n) for p in pos for n in neg]
wins = sum(p > n for p, n in pairs)
print(f"{wins}/{len(pairs)} = {wins / len(pairs):.3f}")
```
---
**Answer.** 4 of the 6 positive-negative pairs are ordered correctly, so AUC is `4/6 ≈ 0.667`.

**Why.** AUC only depends on ranking. Multiplying all scores by 10 or passing them through a sigmoid gives the same answer. A tied pair counts as half a win.
:::

:::drill tricky
Does using class weights change ROC-AUC? Does it change calibration?
---
Class weights change the fitted weights, so ranking may change a little, though for a well-specified linear model it often barely moves. What it clearly changes is calibration: predicted probabilities shift upward for the upweighted class. If your decision only needs a ranking or a threshold, that's fine. If you need real probabilities, correct the log-odds by the log of the weight or recalibrate. In the imbalance program above, the correction brought the mean prediction back to the base rate.
:::

:::drill concept
How do you pick a threshold for a classifier that flags fraud? What would you do differently for a medical screening test?
---
Choose it on validation data to optimise expected cost: `cost_fp × FP + cost_fn × FN`, under any operational limits, such as how many cases a team can review each day. Fraud usually has a review capacity, so precision at a fixed number of alerts matters. Screening usually puts a high cost on missed cases, so you fix a high recall and take the best precision you can get, knowing a confirmatory test follows. Re-check the threshold when prevalence shifts.
:::

:::drill concept
MAE or RMSE? When is each right, and what do they each estimate?
---
Minimising RMSE targets the conditional mean, so it's right when large errors are disproportionately costly or you need an unbiased total, such as in inventory or demand totals. Minimising MAE targets the conditional median, and it's more robust to outliers. RMSE is always at least as large as MAE, and a big gap between them signals a few large errors. Choose the one that matches the real cost, and train with a loss consistent with it.
:::

:::drill output
What's the R² of these predictions?

```python run=mf-c03-d-r2
import numpy as np

y = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
r2 = lambda p: float(1 - np.sum((y - p)**2) / np.sum((y - y.mean())**2))
print(f"perfect       {r2(y):.2f}")
print(f"always 3      {r2(np.full(5, 3.0)):.2f}")
print(f"always 6      {r2(np.full(5, 6.0)):.2f}")
print(f"reversed      {r2(y[::-1]):.2f}")
```
---
**Answer.** 1, 0, -4.5 and -3. Predicting the mean scores 0 by definition, and anything worse is negative.

**Why.** R² isn't a squared correlation on new data, so "R² can't be negative" is only true for an OLS fit with an intercept on its own training set.
:::

:::drill bug
This feature improved the backtest a lot, and the model fails in production. Why?

```python run=mf-c03-d-roll
import numpy as np

rng = np.random.default_rng(0)
n = 2000
r = rng.normal(0, 1, n)                 # daily returns: unpredictable by construction
y = r[1:]                               # target: tomorrow's return

def centred(x, k=5):
    return np.convolve(x, np.ones(k) / k, mode="same")

def trailing(x, k=5):
    out = np.convolve(x, np.ones(k) / k, mode="full")[:len(x)]
    return out

for name, f in [("centred rolling mean", centred(r)[:-1]), ("trailing rolling mean", trailing(r)[:-1])]:
    tr, te = np.arange(1000), np.arange(1000, n - 1)
    A = np.c_[f, np.ones(n - 1)]
    w = np.linalg.lstsq(A[tr], y[tr], rcond=None)[0]
    pred = A[te] @ w
    print(f"{name:22} test correlation with target {np.corrcoef(pred, y[te])[0, 1]:+.3f}")
```
---
**Bug.** A centred window includes future values. At time `t`, it averages `t-2` to `t+2`, so it contains tomorrow's return, which is the target. The forward split doesn't save you here, because the leak is inside the feature.

**Fix.** Use only past values: trailing windows, shifted so they end at the last value known when you predict. Pandas' `rolling` is trailing unless you pass `center=True`, and `np.convolve` with `mode="same"` centres, as it does here. Check whichever tool you use.
:::

:::drill concept
Explain `p`, `d` and `q` in ARIMA, and what the ACF and PACF tell you. What's seasonal differencing for?
---
`p` is the number of autoregressive lags, `d` the number of differences needed for stationarity, and `q` the number of past forecast errors used. AR(p) shows a PACF that cuts off after lag `p`. MA(q) shows an ACF that cuts off after lag `q`. A slowly decaying ACF suggests you need to difference. A spike at the seasonal lag suggests seasonal terms. Seasonal differencing, such as `yₜ - yₜ₋₁₂`, removes a stable repeating pattern. Check by inspecting residuals, which should look like white noise.
:::

:::drill tricky
Your model's MASE is 1.2. Your manager says the MAPE of 8% sounds fine. What do you say?
---
A MASE above 1 means the forecast's average absolute error is worse than the benchmark's in-sample error, the simple naive or seasonal naive forecast. The 8% may sound small, but a stable series could have a benchmark at 6%. Note that MASE compares against the benchmark's in-sample error, so a value slightly above 1 can happen on longer horizons without the model being useless. The check is a direct one: run the baseline through the same backtest and compare by horizon.
:::

:::drill tricky
Grid or random search with a budget of 50 trials and 6 hyperparameters? What about early stopping?
---
Random search: a grid with 6 dimensions and 50 trials has fewer than 2 values for each parameter, while random search tries 50 values of each. If you have more budget and expensive trials, consider Bayesian optimisation, or Hyperband-style early stopping, which lets you try many more configurations. Use log scales where it makes sense. Early stopping's round count is itself chosen on validation data, so it's still a tuning decision and the test set stays out of it.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1200
Write stratified k-fold from scratch, and use it to choose a ridge penalty by cross-validation. Check that each fold has the same class ratio.
---
Shuffle within each class, then deal the rows out to folds. For a ridge classifier on labels `±1`, the fold scores give the penalty choice.

```python run=mf-c03-c-kfold
import numpy as np

def stratified_kfold(y, k, seed=0):
    rng = np.random.default_rng(seed)
    folds = [[] for _ in range(k)]
    for c in np.unique(y):
        idx = rng.permutation(np.flatnonzero(y == c))
        for i, chunk in enumerate(np.array_split(idx, k)):
            folds[i].extend(chunk.tolist())
    return [np.array(sorted(f)) for f in folds]

rng = np.random.default_rng(1)
n, d = 300, 40
y = (rng.random(n) < 0.2).astype(int)
X = rng.normal(size=(n, d))
X[:, :3] += y[:, None] * 1.0

folds = stratified_kfold(y, 5)
print("positives per fold", [int(y[f].sum()) for f in folds], " sizes", [len(f) for f in folds])

for lam in (0.01, 1.0, 100.0, 1000.0, 10000.0, 100000.0):
    scores = []
    for f in folds:
        tr = np.setdiff1d(np.arange(n), f)
        mean, std = X[tr].mean(axis=0), X[tr].std(axis=0)       # fit the scaler inside the fold
        A, B = (X[tr] - mean) / std, (X[f] - mean) / std
        t = 2.0 * y[tr] - 1
        w = np.linalg.solve(A.T @ A + lam * np.eye(d), A.T @ (t - t.mean()))
        s = B @ w
        r = np.argsort(np.argsort(s)) + 1
        n1 = y[f].sum()
        scores.append((r[y[f] == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * (len(f) - n1)))
    print(f"lambda {lam:9}: AUC {np.mean(scores):.3f} +/- {np.std(scores):.3f}")
```

Stronger penalties help here, because 40 features on 300 rows, with only 3 useful, gives plain least squares room to fit noise. The score flattens out at very large `λ`, since AUC only depends on the direction of `w`, and that direction stops changing. If the best value sits at the edge of your grid, extend the grid.
:::

:::drill code rating=1250
Write `roc_auc` with correct handling of ties, using average ranks. Check it against a slow pair-counting version, and write `average_precision`.
---
Tied scores share the mean of their ranks, which is the same as counting a tied pair as half a win. Precision is taken at each new positive, and average precision is the mean of those values.

```python run=mf-c03-c-auc
import numpy as np

def roc_auc(y, s):
    u, inv, cnt = np.unique(s, return_inverse=True, return_counts=True)
    end = np.cumsum(cnt)
    avg_rank = end - (cnt - 1) / 2
    r = avg_rank[inv]
    n1 = y.sum()
    n0 = len(y) - n1
    return (r[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0)

def slow_auc(y, s):
    pos, neg = s[y == 1], s[y == 0]
    return (np.sum(pos[:, None] > neg) + 0.5 * np.sum(pos[:, None] == neg)) / (len(pos) * len(neg))

def average_precision(y, s):
    o = np.argsort(-s, kind="stable")
    hits = np.cumsum(y[o])
    prec = hits / np.arange(1, len(y) + 1)
    return prec[y[o] == 1].mean()

rng = np.random.default_rng(0)
y = rng.integers(0, 2, 2000)
s = np.round(rng.normal(y * 0.8, 1.0), 1)         # rounding creates many ties
print(f"ties: {len(s) - len(np.unique(s))} repeated values")
print(f"rank {roc_auc(y, s):.4f}  pairs {slow_auc(y, s):.4f}")

y2 = np.array([1, 0, 1, 1, 0, 0])
s2 = np.array([0.9, 0.8, 0.7, 0.6, 0.5, 0.4])
print(f"average precision {average_precision(y2, s2):.4f}  by hand {(1 / 1 + 2 / 3 + 3 / 4) / 3:.4f}")
```

The `kind="stable"` sort makes the tie order repeatable. For average precision with tied scores, the result depends on tie handling, and libraries group tied scores into one threshold.
:::

:::drill code rating=1400
Write a walk-forward evaluation of one-step-ahead forecasts for an ARIMA(1,1,0)-style model: difference, fit AR(1) on past data only, predict, and compare with the naive forecast. Prove there's no future data in the fit with a test.
---
Refit at each step on `y[:t]`. A simple no-leak test: change every value after `t`, and check that the forecast for `t` is unchanged.

```python run=mf-c03-c-walk
import numpy as np

rng = np.random.default_rng(0)
n = 400
d = np.zeros(n)
for i in range(1, n):
    d[i] = 0.2 + 0.5 * d[i - 1] + rng.normal(0, 1)
y = 50 + np.cumsum(d)

def forecast(hist):
    dh = np.diff(hist)
    A = np.c_[dh[:-1], np.ones(len(dh) - 1)]
    phi, c = np.linalg.lstsq(A, dh[1:], rcond=None)[0]
    return hist[-1] + c + phi * dh[-1], phi, c

errs, base = [], []
for t in range(200, n):
    f, phi, c = forecast(y[:t])
    errs.append(y[t] - f)
    base.append(y[t] - y[t - 1])
errs, base = np.array(errs), np.array(base)
print(f"last fit: phi {phi:.2f}  c {c:.2f}  (true 0.5 and 0.2)")
print(f"MAE: model {np.abs(errs).mean():.3f}  naive {np.abs(base).mean():.3f}")
print(f"MASE-style ratio {np.abs(errs).mean() / np.abs(base).mean():.3f}")

tampered = y.copy()
tampered[300:] += 1000
print("no leak:", forecast(y[:300])[0] == forecast(tampered[:300])[0])
```

The model beats the naive forecast by a modest amount, since the differences really are autocorrelated, and most of each step is still unpredictable noise. It's a useful habit to write a tamper test for any feature pipeline.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Train fits, validation selects, test reports once. Any score you select on becomes optimistic.
- k-fold: stratified for classes, group for repeated entities, nested for tuning plus an honest estimate, forward for time.
- Leakage: every learned step goes inside the fold. Watch for target leakage, duplicates, groups and future values. Too good to be true usually means leakage.
- Imbalance: choose a metric, tune the threshold, then try weights or resampling on training data only. Weights distort probabilities.
- Precision is `TP/(TP+FP)`. Recall is `TP/(TP+FN)`. F1 is `2TP/(2TP+FP+FN)`. ROC-AUC is the chance a positive outranks a negative, and it doesn't depend on prevalence. Random PR-AUC equals prevalence.
- Calibration: compare mean prediction with the actual rate in each bin. AUC can't see it, Brier and log loss can. Fix with Platt or isotonic on held-out data.
- MSE targets the mean, MAE the median. R² can be negative on new data. MAPE breaks at zero and favours under-forecasting.
- Random search over grid, log scales for rates, Bayesian or Hyperband when trials are expensive.
- Features: fit on train only, one-hot or out-of-fold target encoding, missing indicators, sine and cosine for cycles, lags from the past only.
- ARIMA(p,d,q): AR lags, differences, MA of past errors. SARIMA adds seasonal terms. PACF suggests `p`, ACF suggests `q`. Trees need detrended input.
- Backtest: rolling origin, baselines naive and seasonal naive, MASE, error by horizon, no future inputs.
