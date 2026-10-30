---
name: ML foundations
short: ML foundations
icon: ML
version: Python 3.12 and NumPy 1.26, built from scratch
eyebrow: Probability · linear algebra · optimisation · classical ML · validation · metrics · forecasting
headline: The maths and models behind <em>most campus ML interviews</em>, written so you can explain them.
lede: Three chapters for final-year students preparing for ML and data-science interviews. They cover the probability, linear algebra and optimisation you get asked about, the classical models and when to choose each, and how to validate a model and backtest a forecast. Everything is built in plain NumPy, so you can see what a library call would do, and every output shown comes from running that code.
card: Bayes, MLE and MAP, p-values, SVD and PCA, gradient descent and Adam, linear models, trees, boosting, clustering, cross-validation, leakage, ROC and PR curves, calibration, ARIMA intuition and backtesting, with from-scratch NumPy code.
cta: Start with the maths|#ch01; Classical models|#ch02; Validation and metrics|#ch03
search: Search: p-value, SVD, bias-variance, leakage, PR-AUC, calibration, ARIMA…
---

:::hero A 99% accurate model that finds nothing
```python run=mf-home-hero
import numpy as np

rng = np.random.default_rng(0)
y = (rng.random(100_000) < 0.01).astype(int)   # 1% of cases are positive
pred = np.zeros_like(y)                        # the "model" always says negative

print(f"accuracy {(pred == y).mean():.3f}")
print(f"recall   {pred[y == 1].mean():.3f}")
```

The model scores about **99%** accuracy and catches **no** positive case. Spotting this kind of problem, and explaining what to measure in its place, is what these chapters prepare you to do. Chapter 3 returns to it with precision, recall and PR curves.
:::

## What this guide covers

Interviewers at this level rarely want a proof. They want to hear you explain an idea in your own words, and then see whether the explanation survives a follow-up such as "what breaks if the features are correlated?" or "why is your validation score higher than your test score?". The chapters are written for that: each idea comes with what it assumes, how it fails, and a small program that shows the failure.

| Chapter | Topic | You build |
|---|---|---|
| [1](#ch01) | Probability, linear algebra and optimisation | Bayes calculations, MLE and MAP, a permutation test, PCA from SVD, a gradient check, momentum and Adam |
| [2](#ch02) | Classical ML: linear models, trees, ensembles, clustering | Least squares, lasso by coordinate descent, a decision tree, gradient boosting with stumps, k-means and k-means++, EM for a mixture, Naive Bayes |
| [3](#ch03) | Validation, metrics and forecasting | k-fold, AUC from ranks, precision-recall curves, Platt scaling, out-of-fold target encoding, an AR fit and a rolling-origin backtest |

The chapters build on each other in that order, but each one can be read alone if you already know the earlier material.

## How to use the drills

Answer each drill out loud before opening it, and give the reason along with the answer. For `output` drills, work out the result before you look. For `bug` drills, name the defect and say what symptom you would see in a real project, since a silent bug in ML usually shows up as a score that is too good or too bad. Then close the page and write the `code` drills from memory: a from-scratch k-means or AUC is a common live-coding request. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## Suggested plan

| Sessions | Read | Drill |
|---|---|---|
| 1 | Ch 1: Bayes, distributions, MLE and MAP | Redo the disease-test numbers on paper, then derive MSE from Gaussian noise |
| 2 | Ch 1: CLT, tests and p-values | State what a p-value is without notes, and do the probability drills |
| 3 | Ch 1: eigenvalues, SVD, PCA, optimisers | Write PCA from SVD without looking, then finish the drills |
| 4 | Ch 2: linear and logistic regression, regularisation, bias-variance | Explain L1 versus L2 with the geometry figure and the MAP view |
| 5 | Ch 2: SVM, trees, forests, boosting | Write a decision tree from scratch, then compare bagging and boosting aloud |
| 6 | Ch 2: clustering, kNN, Naive Bayes, choosing a model | Write k-means, then pick a model for three made-up datasets and defend the choice |
| 7 | Ch 3: splits, leakage, imbalance, metrics, calibration | Compute AUC from ranks by hand, and list every leak you can think of |
| 8 | Ch 3: tuning, features, time series, backtesting | Write a rolling-origin backtest and beat the seasonal naive baseline |

## What is real and what is illustrative

Every block with an output below it was executed when the site was built, and the output is the real one. Python examples use only NumPy, with fixed random seeds. The datasets are small and synthetic, chosen so that the effect being taught is easy to see, so don't quote their numbers as typical of real data. Library calls that can't run in this site's build, such as scikit-learn or statsmodels, appear as plain code blocks with no output and are labelled **illustrative**.
