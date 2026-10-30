---
name: Deep learning & perception
short: Deep learning
icon: DL
version: From-scratch code in Python 3.12 and NumPy, with PyTorch shown as plain code
eyebrow: backprop · initialisation · normalisation · CNNs · attention · detection · tracking · fusion · research method
headline: From <em>the chain rule</em> to a perception model on a real system.
lede: Three chapters for students preparing for ML engineer and research-engineer interviews. The goal is to explain each idea plainly and to survive the follow-up questions. You write a small autograd engine, a shape and parameter calculator, scaled dot-product attention, IoU, NMS, mAP and a simple multi-object tracker, and every output shown comes from running that code.
card: Backprop and training diagnostics, CNN shape arithmetic and parameter counting, attention and transformer blocks, detection metrics, tracking, trajectory prediction, sensor fusion, vision-language models and experiment design, with NumPy implementations you can run.
cta: Start with backprop|#ch01; Jump to attention|#ch02; Detection and tracking|#ch03
search: Search: he init, batch norm, receptive field, multi-head, NMS, mAP, ADE…
---

:::hero Backprop in five lines
```python run=dl-home-hero
w, x, t = 2.0, 3.0, 4.0
loss = lambda w: (w * x - t) ** 2

by_chain_rule = 2 * (w * x - t) * x
by_finite_difference = (loss(w + 1e-6) - loss(w - 1e-6)) / 2e-6
print(f"{by_chain_rule:.3f} {by_finite_difference:.3f}")
```

The chain rule and a numerical estimate agree. Reverse-mode autodiff applies that same rule to every parameter in one backward pass. Chapter 1 builds it from scratch.
:::

## What this guide covers

| Chapter | Topic | You build |
|---|---|---|
| [1](#ch01) | Neural network operations and backprop | Hand backprop with a gradient check, batch norm, Adam, a tiny autograd engine, a from-scratch MLP |
| [2](#ch02) | CNNs and transformers | Shape and receptive-field calculators, ResNet-18 and ViT-B/16 parameter counts, conv2d, scaled dot-product and multi-head attention, encoder and decoder blocks |
| [3](#ch03) | Detection, tracking, behaviour prediction and multimodal models | IoU, NMS, AP, a Kalman filter, a tracker, ADE and FDE, InfoNCE, a paired bootstrap, a leakage demonstration |

## Suggested plan

| Sessions | Read | Drill |
|---|---|---|
| 1 and 2 | Ch 1, up to normalisation | Derive the MLP gradients on paper, then do the autodiff drills |
| 3 | Ch 1, the rest | Write the debugging routine from memory, then write the `Value` class without looking |
| 4 | Ch 2, CNNs | Do shape and parameter arithmetic for a network you know, on paper |
| 5 and 6 | Ch 2, transformers | Write scaled dot-product attention from a blank file, then count the parameters of an encoder layer |
| 7 and 8 | Ch 3, detection and tracking | Write IoU and NMS from memory, compute one AP by hand, trace a Kalman step |
| 9 and 10 | Ch 3, prediction, fusion, research, deployment | Explain out loud how you would design one experiment and how you would ship one model |

## How to use the drills

Answer each drill out loud before opening it, and include the reason. Interviewers in this area ask follow-ups such as "what happens if you double the stride?" or "how do you know that improvement is real?", so a bare formula is rarely enough. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## What is real and what is illustrative

Every block with an output below it was executed when the site was built, and the output is the real one. Those programs use only Python and NumPy, with fixed seeds and synthetic data. A result on toy data shows a mechanism, and it tells you nothing about how a method ranks on a real benchmark.

PyTorch code appears as plain blocks without output, since it doesn't run in this site's build. Check details against the documentation of your installed version, since APIs change between releases. This guide avoids quoting benchmark scores, because they age quickly and depend on setup.
