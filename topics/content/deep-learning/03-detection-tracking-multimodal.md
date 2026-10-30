---
title: Detection, tracking, behaviour prediction and multimodal models
part: Part B · Perception systems
lede: Perception interviews move quickly from a metric to a system. This chapter covers IoU, NMS, anchors and mAP, then segmentation, tracking by detection with a Kalman filter, trajectory prediction and its metrics, sensor fusion and vision-language models. It finishes with two questions research-engineer interviews ask directly, how to design an experiment you can trust, and what changes when a model has to run on a physical system.
desc: IoU, NMS, anchors vs anchor-free, mAP, segmentation, tracking by detection, Kalman filter, association, ADE and FDE, pedestrian and scene understanding, fusion, vision-language models, experiment design, deployment
hours: 8
prereqs: Chapter 2 (CNNs, attention), basic probability and linear algebra
---

## Boxes and IoU {#ch03-iou .th}

Detectors output boxes and class scores. Boxes come in several formats, including `(x1, y1, x2, y2)` corners, `(cx, cy, w, h)` centres and `(x, y, w, h)` as used in COCO annotations, and mixing formats is one of the most common detection bugs. **Intersection over union** (IoU, also called the Jaccard index) measures overlap: intersection area divided by union area.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 130" role="img" aria-label="Two overlapping boxes with the intersection highlighted, and the IoU formula">
  <rect x="40" y="20" width="120" height="80" class="d-soft"/>
  <rect x="100" y="40" width="120" height="80" class="d-soft"/>
  <rect x="100" y="40" width="60" height="60" class="d-acc"/>
  <text x="60" y="38" class="t-small">A</text><text x="202" y="114" class="t-small">B</text>
  <text x="130" y="74" text-anchor="middle" class="t-mono">A∩B</text>
  <text x="280" y="30" class="t-mono">w     = max(0, min(x2s) - max(x1s))</text>
  <text x="280" y="52" class="t-mono">h     = max(0, min(y2s) - max(y1s))</text>
  <text x="280" y="74" class="t-mono">inter = w * h</text>
  <text x="280" y="96" class="t-mono">union = area(A) + area(B) - inter</text>
  <text x="280" y="118" class="t-mono">IoU   = inter / union</text>
</svg></div><figcaption><b>IoU.</b> The <code>max(0, ...)</code> handles boxes that don't overlap. Without it, two negative sides multiply to a positive area.</figcaption></figure>

```python run=dl-c03-iou
def iou(a, b):
    w = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    h = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = w * h
    area = lambda r: (r[2] - r[0]) * (r[3] - r[1])
    return inter / (area(a) + area(b) - inter)

A = (0, 0, 10, 10)
for name, B in [("same", A), ("half shifted", (5, 0, 15, 10)), ("touching", (10, 0, 20, 10)),
                ("disjoint in both axes", (20, 20, 30, 30)), ("inside", (2.5, 2.5, 7.5, 7.5))]:
    print(f"{name:22} {iou(A, B):.3f}")
for size in (10, 40, 160):
    print(f"{size}px box, 2px error: {iou((0, 0, size, size), (2, 2, size + 2, size + 2)):.3f}")
```

Two facts come up in follow-ups. Shifting a box by half its width gives an IoU of 1/3, lower than people guess. The same pixel error costs far more on a small object, which is why small-object AP is usually the lowest. IoU also has zero gradient when boxes don't overlap, which motivates GIoU, DIoU and CIoU as regression losses.

## Non-maximum suppression {#ch03-nms .th}

Detectors fire many overlapping boxes per object. **Greedy NMS** keeps the highest-scoring box, removes others that overlap it by more than a threshold, and repeats on what remains. Run it per class, or two different classes in the same place suppress each other.

```python run=dl-c03-nms
def iou(a, b):
    w = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    h = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    area = lambda r: (r[2] - r[0]) * (r[3] - r[1])
    return w * h / (area(a) + area(b) - w * h)

def nms(boxes, scores, thr):
    order = sorted(range(len(boxes)), key=lambda i: (-scores[i], i))
    keep = []
    while order:
        best = order.pop(0)
        keep.append(best)
        order = [i for i in order if iou(boxes[best], boxes[i]) <= thr]
    return keep

boxes = [(0, 0, 10, 10), (1, 1, 11, 11), (0, 1, 10, 11), (30, 30, 40, 40)]
scores = [0.9, 0.8, 0.7, 0.6]
print("one object plus one far away:", nms(boxes, scores, 0.5))

crowd = [(0, 0, 10, 20), (4, 0, 14, 20)]     # two real people, overlapping
print(f"crowd IoU {iou(*crowd):.3f}")
for thr in (0.3, 0.5):
    print(f"  thr {thr}: keeps", nms(crowd, [0.9, 0.8], thr))
```

:::trap NMS removes real objects in crowds
The two boxes above are two real people with an IoU of about 0.43. At a threshold of 0.3, NMS deletes one person. Raising the threshold keeps both, but also leaves more duplicates. **Soft-NMS** decays overlapping scores rather than deleting boxes. Set-based detectors in the DETR family learn to avoid duplicates and skip NMS.
:::

## Detector families: anchors and beyond {#ch03-anchors .th}

| Family | Examples | How it predicts | Notes |
|---|---|---|---|
| Two-stage | Faster R-CNN | A region proposal network, then per-region classification and refinement | Often accurate, with more moving parts |
| One-stage, anchor-based | RetinaNet, YOLOv3 | Offsets from preset boxes at each grid cell | Anchor sizes and matching are hyperparameters |
| Anchor-free | FCOS, CenterNet, YOLOX | Distances to box sides from a point, or a centre heatmap | Fewer box hyperparameters |
| Set-based | DETR | Fixed set of queries matched one-to-one to objects with the Hungarian algorithm | No NMS, slower convergence in its original form |

An **anchor** is a preset box at each feature-map location, and the network predicts offsets from it. Anchors are assigned to ground truth by IoU, with those above a high threshold as positive and those below a low one as negative. With `A` anchors per cell on a `W × H` map, you get `W * H * A` candidates, which is why most are negatives.

That imbalance is why **focal loss** exists. It multiplies cross-entropy by `(1 - p_t)^gamma`, which shrinks the loss from easy examples.

```python run=dl-c03-focal
import math

print("  p_t      CE   focal(gamma=2)")
for p in (0.99, 0.9, 0.5, 0.1):
    ce = -math.log(p)
    print(f"{p:5.2f}  {ce:6.3f}  {(1 - p) ** 2 * ce:10.5f}")

n_easy, n_hard = 100_000, 100
for name, f in [("CE", lambda p: -math.log(p)), ("focal", lambda p: (1 - p) ** 2 * -math.log(p))]:
    easy, hard = n_easy * f(0.99), n_hard * f(0.1)
    print(f"{name:6} total from easy {easy:9.2f}, from hard {hard:7.2f}")
print("grid 50 x 50 with 9 anchors:", 50 * 50 * 9, "candidates")
```

With cross-entropy, 100,000 easy negatives outweigh 100 hard examples, even at `p_t = 0.99`. Focal loss flips that balance. Anchor-free methods have similar imbalance over grid points, so they use it too.

## mAP {#ch03-map .th}

**Average precision** summarises one class's ranking. Sort all detections by score, walk down the list, and mark each as a true positive if it matches an unused ground truth at the IoU threshold, otherwise as a false positive. A duplicate of an already matched object is a false positive. Each prefix of the list gives one precision and recall point. AP is the area under the precision-recall curve, after making precision non-increasing. **mAP** averages AP over classes, and it is a separate thing from the mean of precision.

```python run=dl-c03-ap
import numpy as np

def iou(a, b):
    w = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    h = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    area = lambda r: (r[2] - r[0]) * (r[3] - r[1])
    return w * h / (area(a) + area(b) - w * h)

gts = {0: [(0, 0, 10, 10), (20, 20, 40, 40)], 1: [(5, 5, 15, 15), (30, 0, 50, 20), (0, 30, 20, 50)]}
dets = [(0, 0.95, (0, 0, 10, 10)), (1, 0.90, (5, 5, 15, 16)), (0, 0.85, (1, 1, 11, 11)),
        (1, 0.80, (31, 1, 51, 21)), (0, 0.70, (60, 60, 70, 70)), (0, 0.60, (22, 22, 42, 42)),
        (1, 0.50, (40, 40, 50, 50)), (1, 0.40, (3, 34, 23, 54))]

def flags(thr):
    used, out = set(), []
    for img, _, box in sorted(dets, key=lambda d: -d[1]):
        cand = [(iou(box, g), i) for i, g in enumerate(gts[img]) if (img, i) not in used]
        best, i = max(cand, default=(0.0, -1))
        out.append(int(best >= thr))
        if best >= thr:
            used.add((img, i))
    return np.array(out)

def ap(tp, n_gt):
    rec = np.cumsum(tp) / n_gt
    prec = np.cumsum(tp) / np.arange(1, len(tp) + 1)
    r = np.r_[0.0, rec]
    p = np.maximum.accumulate(prec[::-1])[::-1]     # precision envelope
    return float(((r[1:] - r[:-1]) * p).sum())

n_gt = sum(len(v) for v in gts.values())
tp = flags(0.5)
print("TP flags at 0.5:", tp.tolist())
print("precision:", np.round(np.cumsum(tp) / np.arange(1, 9), 3).tolist())
print("recall:   ", np.round(np.cumsum(tp) / n_gt, 3).tolist())
thresholds = np.arange(0.5, 1.0, 0.05)
values = [ap(flags(t), n_gt) for t in thresholds]
print(f"AP50 {values[0]:.3f}  AP75 {values[5]:.3f}  AP50:95 {np.mean(values):.3f}")
```

The third detection is a duplicate of an object already matched, so it counts as a false positive, even though its box is good. At IoU 0.5, four of the five ground truths are matched by the first six detections and the last one by detection 8, so recall reaches 1.0, and AP50 is 0.808. Stricter thresholds reject the looser boxes, so AP75 falls to 0.550. The average over thresholds, 0.551, rewards precise localisation.

Benchmarks differ in details, so name the one you mean. PASCAL VOC reports AP at IoU 0.5. It used 11-point interpolation in its earlier years, and all-point later. COCO's "AP" averages over ten IoU thresholds from 0.50 to 0.95, across classes, with 101-point interpolation, up to 100 detections per image, and it also reports AP by object size. The code above uses all-point interpolation, so its numbers can differ slightly from the COCO tool's. Use `pycocotools` for anything you report.

## Semantic and instance segmentation {#ch03-seg .th}

- **Semantic segmentation** gives each pixel a class, and two touching people get the same label. FCN, U-Net and DeepLab are common designs. They use an encoder-decoder with skip connections, or dilated convolutions, to recover resolution.
- **Instance segmentation** gives each object its own mask. Mask R-CNN adds a mask branch to Faster R-CNN, and predicts a mask per detected box.
- **Panoptic segmentation** gives every pixel a class, and an instance id for countable "things", so it combines both.

Metrics: **mIoU** averages per-class pixel IoU, and is the standard for semantic segmentation. **Dice** is `2|A∩B| / (|A| + |B|)`, the F1 score on pixels, and it relates to IoU by `Dice = 2 IoU / (1 + IoU)`. Instance segmentation uses mask AP, which is mAP computed with mask IoU.

```python run=dl-c03-seg
import numpy as np

truth = np.zeros((100, 100), dtype=int)
truth[40:62, 40:62] = 1                     # 22x22 object, about 5% of pixels
def report(name, pred):
    ious = [((pred == c) & (truth == c)).sum() / ((pred == c) | (truth == c)).sum() for c in (0, 1)]
    i = ious[1]
    print(f"{name:18} pixel acc {(pred == truth).mean():.3f}  IoU {ious[0]:.3f}/{i:.3f}  mIoU {np.mean(ious):.3f}  Dice {2 * i / (1 + i):.3f}")

report("all background", np.zeros_like(truth))
shifted = np.zeros_like(truth); shifted[44:66, 44:66] = 1
report("object shifted 4px", shifted)
```

An all-background prediction scores 0.95 pixel accuracy on this image, and mIoU exposes it at 0.476. A 4 pixel shift on this 22 pixel object still costs half of its IoU. Touching objects of one class form a single connected region in a semantic mask, so instance methods need boxes, embeddings or boundary predictions to separate them.

## Tracking by detection {#ch03-track .th}

**Tracking by detection** runs a detector on each frame, then links detections over time. SORT is the simple reference design: a Kalman filter predicts each track, and the Hungarian algorithm assigns detections to predictions using IoU. DeepSORT adds an appearance embedding, which helps after occlusion. ByteTrack keeps low-score detections for a second association pass, instead of discarding them.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 130" role="img" aria-label="Tracking loop: detector output and Kalman predictions go into association, which updates matched tracks, starts new tracks and ages unmatched ones">
  <rect x="10" y="10" width="130" height="38" rx="5" class="d-box"/><text x="75" y="33" text-anchor="middle" class="t-mono">detections(t)</text>
  <rect x="10" y="74" width="130" height="38" rx="5" class="d-key"/><text x="75" y="97" text-anchor="middle" class="t-mono">Kalman predict</text>
  <rect x="190" y="42" width="150" height="38" rx="5" class="d-acc"/><text x="265" y="65" text-anchor="middle" class="t-mono">associate (IoU)</text>
  <rect x="400" y="4" width="290" height="30" rx="5" class="d-soft"/><text x="545" y="24" text-anchor="middle" class="t-mono">matched: Kalman update</text>
  <rect x="400" y="46" width="290" height="30" rx="5" class="d-soft"/><text x="545" y="66" text-anchor="middle" class="t-mono">unmatched detection: new track</text>
  <rect x="400" y="88" width="290" height="30" rx="5" class="d-soft"/><text x="545" y="108" text-anchor="middle" class="t-mono">unmatched track: age, delete after N</text>
  <path d="M140 30 L 190 54 M140 92 L 190 68 M340 56 L 400 20 M340 61 H400 M340 66 L 400 102" class="d-line"/>
</svg></div><figcaption><b>One frame of a SORT-style tracker.</b> The tracks feed back into the prediction step at the next frame.</figcaption></figure>

### The Kalman filter {#ch03-kalman}

A **Kalman filter** tracks a Gaussian belief over a state, for a linear model with Gaussian noise. **Predict:** `x = F x`, `P = F P F^T + Q`. **Update:** `K = P H^T (H P H^T + R)^-1`, `x = x + K (z - H x)`, `P = (I - K H) P`. The **Kalman gain** `K` trades off the prediction against the measurement. A larger `R` (noisier sensor) means less trust in the measurement, and a larger `Q` (less predictable motion) means more trust in it.

```python run=dl-c03-kalman
import numpy as np

rng = np.random.default_rng(0)
F = np.array([[1.0, 1.0], [0.0, 1.0]])          # constant velocity, dt = 1
H = np.array([[1.0, 0.0]])
Q = 0.01 * np.array([[0.25, 0.5], [0.5, 1.0]])
R = np.array([[4.0]])                           # measurement std 2
x, P = np.zeros(2), np.eye(2) * 100.0
raw, filtered = [], []
print(" t  truth  meas  est    vel   std(pos)")
for t in range(40):
    truth = 1.5 * t
    z = truth + rng.normal(0, 2.0)
    x, P = F @ x, F @ P @ F.T + Q
    if not 25 <= t < 30:                        # no detections for 5 frames
        K = P @ H.T @ np.linalg.inv(H @ P @ H.T + R)
        x = x + K @ (np.array([z]) - H @ x)
        P = (np.eye(2) - K @ H) @ P
        if t >= 10:
            raw.append(z - truth); filtered.append(x[0] - truth)
    if t in (1, 10, 24, 29, 30, 39):
        print(f"{t:2} {truth:6.1f} {z:6.1f} {x[0]:6.1f} {x[1]:5.2f} {P[0, 0] ** 0.5:7.2f}")
rms = lambda e: np.sqrt(np.mean(np.square(e)))
print(f"RMS error, t >= 10: measurements {rms(raw):.2f}, filter {rms(filtered):.2f}")
```

The filter's error of 1.09 is well below the raw measurements' 1.68. From `t = 25` to 29 there are no updates, so the filter coasts on its velocity estimate of 1.71 and its position standard deviation grows from 1.04 to 2.16. Its estimate has drifted to 45.6 against a truth of 43.5 by then. The first measurement after the gap pulls the estimate back, and the uncertainty falls to 1.55. This is how a tracker survives short occlusions, and the growing covariance is why gates should widen as a track ages.

### Association and tracking metrics {#ch03-assoc}

Assigning tracks to detections is a bipartite matching problem. The **Hungarian algorithm** (Kuhn-Munkres) finds the optimum in `O(n^3)`. Greedy matching can do worse.

```python run=dl-c03-assoc
from itertools import permutations
import numpy as np

m = np.array([[0.9, 0.8], [0.7, 0.0]])     # IoU, rows tracks, columns detections
i, j = np.unravel_index(m.argmax(), m.shape)
print("greedy:", [(int(i), int(j))], "then track 1 has only IoU", float(m[1 - i, 1 - j]))
best = max(permutations(range(2)), key=lambda p: sum(m[r, p[r]] for r in range(2)))
print("optimal:", list(enumerate(best)), "total IoU", round(float(sum(m[r, best[r]] for r in range(2))), 2))
```

In practice, gate out pairs below a minimum IoU, or by Mahalanobis distance using the Kalman covariance. Use `scipy.optimize.linear_sum_assignment` in real code.

Tracking metrics: **MOTA** is `1 - (FN + FP + IDSW) / GT`, dominated by detection quality. **IDF1** measures how long identities stay correct. **HOTA** balances detection and association. A tracker can have a high MOTA and still swap identities often, so report more than one.

## Trajectory prediction and scene understanding {#ch03-traj .th}

Given a person's or agent's past positions, predict future positions. Pedestrian benchmarks such as ETH/UCY commonly observe 8 steps and predict 12, at 0.4 s per step, and evaluate with leave-one-scene-out.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 150" role="img" aria-label="Observed points, then predicted and true future paths, with pointwise errors. ADE averages all errors and FDE uses the last.">
  <path d="M30 110 L 90 100 L 150 90 L 210 80" class="d-line"/>
  <circle cx="30" cy="110" r="3" class="d-fill-ink"/><circle cx="90" cy="100" r="3" class="d-fill-ink"/><circle cx="150" cy="90" r="3" class="d-fill-ink"/><circle cx="210" cy="80" r="3" class="d-fill-ink"/>
  <path d="M210 80 L 300 65 L 390 50 L 480 35 L 570 20" class="d-line-key"/>
  <path d="M210 80 L 300 70 L 390 70 L 480 75 L 570 90" class="d-line-acc"/>
  <path d="M300 65 V70 M390 50 V70 M480 35 V75" class="d-line d-dash"/>
  <path d="M570 20 V90" class="d-line-trap"/>
  <text x="120" y="130" text-anchor="middle" class="t-small">observed</text>
  <text x="520" y="20" text-anchor="end" class="t-small t-key">prediction</text>
  <text x="430" y="100" class="t-small t-acc">truth</text>
  <text x="580" y="60" class="t-small t-trap">FDE: last error</text>
  <text x="330" y="130" class="t-small">ADE: mean of all pointwise errors</text>
</svg></div><figcaption><b>ADE and FDE.</b> Average displacement error averages the L2 error over all future steps. Final displacement error uses the last step only.</figcaption></figure>

The future is multimodal, since a person at a junction may turn either way. Models therefore output `K` samples or modes, and the common metrics are **minADE_K** and **minFDE_K**, which keep the best of `K`.

```python run=dl-c03-traj
import numpy as np

rng = np.random.default_rng(0)
N, OBS, PRED, dt = 500, 8, 12, 0.4
speed = rng.uniform(0.8, 1.8, N)
heading = rng.uniform(0, 2 * np.pi, N)
turn = rng.normal(0, 0.08, N)                  # radians per step
T = OBS + PRED
theta = heading[:, None] + turn[:, None] * np.arange(T)
step = np.stack([np.cos(theta), np.sin(theta)], -1) * (speed[:, None] * dt)[..., None]
path = np.cumsum(step, 1) + rng.normal(0, 0.03, (N, T, 2))
past, future = path[:, :OBS], path[:, OBS:]

def ade_fde(pred):                              # pred: (N, PRED, 2)
    e = np.linalg.norm(pred - future, axis=-1)
    return e.mean(), e[:, -1].mean()

ahead = np.arange(1, PRED + 1)[None, :, None]
stay = np.repeat(past[:, -1:], PRED, axis=1)
v_last = past[:, -1:] - past[:, -2:-1]
v_mean = (past[:, -1:] - past[:, :1]) / (OBS - 1)
for name, pred in [("stay still", stay), ("CV, last step", past[:, -1:] + v_last * ahead),
                   ("CV, mean velocity", past[:, -1:] + v_mean * ahead)]:
    print(f"{name:20} ADE {ade_fde(pred)[0]:.3f} m  FDE {ade_fde(pred)[1]:.3f} m")

def noisy_samples(K):
    angle = rng.normal(0, 0.6, (N, K, 1, 1))
    v = v_mean[:, None]
    rot = np.concatenate([v[..., :1] * np.cos(angle) - v[..., 1:] * np.sin(angle),
                          v[..., :1] * np.sin(angle) + v[..., 1:] * np.cos(angle)], -1)
    return past[:, -1][:, None, None] + rot * ahead[:, None]

for K in (1, 5, 20):
    e = np.linalg.norm(noisy_samples(K) - future[:, None], axis=-1)
    print(f"random heading spread, K={K:2}: minADE {e.mean(2).min(1).mean():.3f}  minFDE {e[:, :, -1].min(1).mean():.3f}")
```

This synthetic data is a guide to the metrics only, and the people in it turn at a steady rate. Constant velocity cuts ADE from 3.39 m (standing still) to 1.12 m, and FDE is much larger than ADE, as is typical. Here the last step's velocity beats the mean velocity, since the turning makes old velocities stale. With noisier observations, averaging would help more. The last three rows use a sampler with no knowledge of the future, only random spread around the heading. Its `minADE` falls from 2.20 at `K=1` to 0.41 at `K=20`, which is far below the constant-velocity result.

:::trap Best-of-K rewards spread
`minADE_K` only checks whether one sample is close, so it improves with more spread and more samples, even if most samples are implausible. Always state `K`, and add a metric that scores the whole distribution, such as negative log-likelihood, a calibration check, or a miss rate. Also compare with a constant-velocity baseline, which is known to be hard to beat on some pedestrian benchmarks.
:::

### Pedestrian and scene understanding {#ch03-scene}

Past motion alone misses much of what predicts behaviour. Common additional inputs are:

- **Pose and orientation.** Body and head direction are early signals of intent, often before motion changes. Keypoint detectors provide them.
- **Social context.** People avoid each other and walk in groups. Models encode neighbours with pooling, attention or graph neural networks, as in Social LSTM and Trajectron++.
- **Scene context.** Sidewalks, crossings, walls and signals constrain paths. Inputs include semantic maps, bird's-eye-view (BEV) grids, depth and occupancy.
- **Intent.** Crossing or not crossing is often posed as classification, as in the JAAD and PIE datasets.

Monocular depth has a scale ambiguity unless the scale comes from another source, such as a known camera height or a second sensor. Rare events matter most in this area, so report results by scenario (for example, crossing versus walking along), since averages hide them.

## Fusion strategies {#ch03-fusion .th}

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 190" role="img" aria-label="Three fusion strategies: early fuses inputs, intermediate fuses features, late fuses outputs">
  <text x="10" y="32" class="t-bold">Early</text>
  <rect x="90" y="14" width="70" height="28" rx="5" class="d-soft"/><text x="125" y="33" text-anchor="middle" class="t-mono">A + B</text>
  <rect x="200" y="14" width="150" height="28" rx="5" class="d-acc"/><text x="275" y="33" text-anchor="middle" class="t-mono">one network</text>
  <path d="M160 28 H200 M350 28 H390" class="d-line"/><text x="400" y="33" class="t-small">Raw correlations, needs tight sync, calibration</text>
  <text x="10" y="92" class="t-bold">Middle</text>
  <rect x="90" y="62" width="70" height="26" rx="5" class="d-soft"/><text x="125" y="80" text-anchor="middle" class="t-mono">enc A</text>
  <rect x="90" y="94" width="70" height="26" rx="5" class="d-soft"/><text x="125" y="112" text-anchor="middle" class="t-mono">enc B</text>
  <rect x="200" y="76" width="150" height="28" rx="5" class="d-acc"/><text x="275" y="95" text-anchor="middle" class="t-mono">fuse features</text>
  <path d="M160 75 L 200 86 M160 107 L 200 94 M350 90 H390" class="d-line"/><text x="400" y="95" class="t-small">Concat, BEV grid or cross-attention</text>
  <text x="10" y="162" class="t-bold">Late</text>
  <rect x="90" y="134" width="150" height="24" rx="5" class="d-soft"/><text x="165" y="151" text-anchor="middle" class="t-mono">model A output</text>
  <rect x="90" y="162" width="150" height="24" rx="5" class="d-soft"/><text x="165" y="179" text-anchor="middle" class="t-mono">model B output</text>
  <rect x="280" y="146" width="70" height="28" rx="5" class="d-acc"/><text x="315" y="165" text-anchor="middle" class="t-mono">merge</text>
  <path d="M240 146 L 280 156 M240 174 L 280 164 M350 160 H390" class="d-line"/><text x="400" y="165" class="t-small">Modular, tolerates a lost sensor, misses interactions</text>
</svg></div><figcaption><b>Where modalities combine.</b> The earlier they combine, the more interactions the model can learn, and the more it depends on alignment.</figcaption></figure>

Late fusion in its simplest form is a weighted average, and the best weights for independent, unbiased sensors are inverse variances. The Kalman update has the same form. Weights assume the sensors are unbiased and their noise is known, and the program also shows what a miscalibrated sensor does.

```python run=dl-c03-fusion
import numpy as np

rng = np.random.default_rng(0)
truth, s1, s2, n = 10.0, 1.0, 2.0, 200_000
a = truth + rng.normal(0, s1, n)
b = truth + rng.normal(0, s2, n)
w = (1 / s1 ** 2) / (1 / s1 ** 2 + 1 / s2 ** 2)
fused = w * a + (1 - w) * b
print(f"weight on the better sensor {w:.2f}, theory var {1 / (1 / s1 ** 2 + 1 / s2 ** 2):.3f}")
print(f"var: a {a.var():.3f}, b {b.var():.3f}, fused {fused.var():.3f}")
biased = w * a + (1 - w) * (b + 3.0)
print(f"sensor b offset by 3: fused error mean {biased.mean() - truth:.3f}, MSE {((biased - truth) ** 2).mean():.3f}, sensor a alone MSE {((a - truth) ** 2).mean():.3f}")
```

Fusion reduces variance from 1 to 0.8 when the assumptions hold. With a 3-unit offset, the fused MSE is above that of the good sensor alone, which is the numerical form of "fusing a bad sensor can hurt". Check calibration before blaming the model. Geometric fusion, such as projecting lidar points into an image, is sensitive to it.

```python run=dl-c03-project
import numpy as np

fx, cx = 1000.0, 640.0
def u(point):
    return fx * point[0] / point[2] + cx

yaw = np.radians(1.0)
R = np.array([[np.cos(yaw), 0, np.sin(yaw)], [0, 1, 0], [-np.sin(yaw), 0, np.cos(yaw)]])
print("depth  1deg yaw err  0.1m shift err  0.05s at 10m/s  person width (0.5m)")
for z in (5.0, 20.0, 50.0):
    p = np.array([1.0, 0.0, z])
    print(f"{z:5.0f}  {abs(u(R @ p) - u(p)):12.1f}  {abs(u(p + [0.1, 0, 0]) - u(p)):14.1f}"
          f"  {abs(u(p + [0.5, 0, 0]) - u(p)):14.1f}  {fx * 0.5 / z:19.1f}")
```

In pixels, a 1 degree rotation error is nearly the same at every depth, while translation errors shrink with depth. At 50 m, a person is 10 pixels wide, so a 17 pixel rotation error puts the lidar points entirely off the person. A 50 ms clock offset on a target crossing at 10 m/s moves it 0.5 m, which equals this person's width at every depth.

Plan for a **missing modality**: a sensor will fail. Train with modality dropout, carry an availability flag, and test each failure case. Middle-fusion models that were always trained with all inputs can fail badly when one is zeroed.

## Vision-language models {#ch03-vlm .th}

**CLIP** trains an image encoder and a text encoder so that matching pairs have high cosine similarity. It uses a symmetric **InfoNCE** loss: for a batch of `N` pairs, form the `N × N` similarity matrix, divide by a temperature, and use cross-entropy with the diagonal as the target, in both directions. Other pairs in the batch act as negatives, so larger batches give a harder problem. **Zero-shot classification** embeds prompts such as "a photo of a dog", and picks the closest to the image.

```python run=dl-c03-clip
import numpy as np

def unit(x):
    return x / np.linalg.norm(x, axis=-1, keepdims=True)

def infonce(img, txt, tau):
    s = unit(img) @ unit(txt).T / tau
    def ce(s):
        s0 = s - s.max(1, keepdims=True)
        p = np.exp(s0) / np.exp(s0).sum(1, keepdims=True)
        return -np.log(np.diag(p) + 1e-30).mean()
    return (ce(s) + ce(s.T)) / 2, (s.argmax(1) == np.arange(len(s))).mean()

rng = np.random.default_rng(0)
N, d = 64, 128
img = rng.normal(size=(N, d))
txt_related = img + 0.5 * rng.normal(size=(N, d))
txt_random = rng.normal(size=(N, d))
print(f"ln(N) = {np.log(N):.3f}")
for name, txt in [("matched pairs", txt_related), ("random pairs", txt_random)]:
    for tau in (1.0, 0.07):
        loss, acc = infonce(img, txt, tau)
        print(f"{name:14} tau {tau:4}: loss {loss:7.3f}, image-to-text accuracy {acc:.3f}")
```

Matched pairs reach perfect accuracy at both temperatures, because the toy pairs are strongly correlated, but at `tau = 1` the loss stays high at 3.288, since unscaled cosine similarities can't produce confident probabilities. Lower temperature sharpens the softmax, which is why the learned value is usually small. For random pairs, `tau = 1` gives a loss near `ln(64)`, and `tau = 0.07` gives 5.139, above that level, because low temperature makes wrong guesses confident. Chance accuracy is 1/64 here, so 0.000 in one batch is unremarkable.

Larger vision-language models connect a vision encoder to a language model. One way, used in the LLaVA family, projects image patch features into the language model's token space, and feeds them in with the text. Another uses cross-attention from text to image features, as in several BLIP models. Open-vocabulary detectors such as OWL-ViT and Grounding DINO use text to define classes at run time.

Evaluation is the weak spot. Use retrieval metrics for embeddings (recall at K), and test generative models on specific tasks, with questions about absent objects, since **hallucination** is common. Prompt wording changes results, so fix prompts before comparing.

## Designing and evaluating a research experiment {#ch03-research .th}

A good answer to "how would you test this idea?" goes through these steps:

1. **Hypothesis.** State what should improve, by how much, and why. "Adding scene context lowers FDE on turning pedestrians" can fail, which makes it useful.
2. **Baselines.** Start with a simple one (constant velocity, or a linear model), and reproduce a published method. If you can't reproduce it, your pipeline may be wrong.
3. **Metric.** Choose a primary metric before you look at results, along with what you would count as a meaningful change.
4. **Split.** Split by scene, video, subject or location, whichever matches the deployment. Tune on validation, and touch the test set once.
5. **Ablation.** Change one component at a time, and report what each contributes.
6. **Variation.** Run several seeds, and compare per scene with paired statistics.
7. **Error analysis.** Look at the worst cases and by scenario. An average gain can hide a regression.
8. **Reproducibility.** Log the config, commit, seed, data version and environment. Record negative results too.

Leakage is the classic way to get an excellent, false result. Here each video has one label, and features contain video identity but nothing about the label. A 1-nearest-neighbour model looks excellent if frames from one video land on both sides of the split.

```python run=dl-c03-leak
import numpy as np

rng = np.random.default_rng(0)
videos, frames, d = 40, 30, 16
centre = rng.normal(0, 1, (videos, d))
X = np.repeat(centre, frames, axis=0) + rng.normal(0, 0.1, (videos * frames, d))
group = np.repeat(np.arange(videos), frames)
y = np.repeat(rng.integers(0, 2, videos), frames)     # one random label per video

def nn_accuracy(train, test):
    dist = ((X[test][:, None] - X[train][None]) ** 2).sum(-1)
    return (y[train][dist.argmin(1)] == y[test]).mean()

idx = rng.permutation(len(X))
print(f"random frame split: {nn_accuracy(idx[240:], idx[:240]):.3f}")
held = rng.permutation(videos)[:8]
is_test = np.isin(group, held)
print(f"split by video:     {nn_accuracy(np.flatnonzero(~is_test), np.flatnonzero(is_test)):.3f}")
```

The same model on the same data scores 1.000 or 0.383. The random split finds a near-duplicate frame from the same video every time. The split by video shows the truth: there is nothing to learn, and any score around 0.5 is noise, given only 8 held-out videos.

For a comparison, use a **paired** analysis over scenes, so that scene difficulty cancels. The bootstrap gives an interval without distribution assumptions. Scenes and seeds are both sources of variation, so report both.

```python run=dl-c03-boot
import numpy as np

rng = np.random.default_rng(0)
scenes = 40
difficulty = rng.lognormal(0, 0.5, scenes)
A = difficulty * (1 + rng.normal(0, 0.05, scenes))
B = difficulty * (0.97 + rng.normal(0, 0.05, scenes))
print(f"mean error A {A.mean():.3f}, B {B.mean():.3f}, mean A-B {(A - B).mean():.3f}")

def ci(values, reps=5000):
    draws = rng.integers(0, len(values), (reps, len(values)))
    return np.percentile(values[draws].mean(1), [2.5, 97.5])

lo, hi = ci(A - B)
print(f"paired 95% CI of A-B:   [{lo:.3f}, {hi:.3f}]")
i, j = rng.integers(0, scenes, (2, 5000, scenes))
lo, hi = np.percentile(A[i].mean(1) - B[j].mean(1), [2.5, 97.5])
print(f"unpaired 95% CI of A-B: [{lo:.3f}, {hi:.3f}]")
seeds_a = 1.00 + rng.normal(0, 0.02, 5)
seeds_b = 0.98 + rng.normal(0, 0.02, 5)
print(f"5 seeds: A {seeds_a.mean():.3f} +- {seeds_a.std(ddof=1):.3f}, B {seeds_b.mean():.3f} +- {seeds_b.std(ddof=1):.3f}")
```

The paired interval excludes zero, and the unpaired one is far wider and includes it, because it counts differences in scene difficulty as noise. The same data gives both results, so a comparison needs the right analysis as well as the right numbers. Five seeds give a rough view of training variation, and with so few runs the standard deviations are themselves uncertain. This data is simulated with a true 3% gain, so the program shows how to read such a result. It isn't evidence for any method.

## Moving a model onto a physical system {#ch03-deploy .th}

A model that scores well offline can fail on a robot for reasons that have nothing to do with its metric. Work through these areas.

- **Sensors and data.** The lens, exposure, motion blur, rain and mounting all differ from the training set. Collect data on the real platform, and treat simulation as a head start, since the sim-to-real gap needs measuring.
- **Calibration and time.** Check intrinsics, extrinsics and timestamps first. Use hardware triggers or synchronised clocks where possible.
- **Frames.** Be explicit about camera, body and world coordinates. A sign error here looks like a bad model.
- **Latency.** Measure end to end on the target, from photon to actuation, and look at the tail. Throughput isn't latency: batching or pipelining can raise frames per second while each frame takes longer.
- **Model optimisation.** Reduce input resolution first, since it is often the largest gain, then consider a smaller backbone, pruning and quantisation. Re-measure accuracy after each step, on the target's runtime.
- **Export.** Check that outputs match between the training framework and the exported model on real samples. Preprocessing must match exactly.
- **Failure behaviour.** Decide what happens with stale or missing data, or low confidence. Use a watchdog and a safe fallback. Perception output should expire.
- **Rollout.** Replay logged data, then run in **shadow mode** (the model runs and logs but doesn't act), then a limited trial with safety limits and a human able to stop it.
- **Monitoring.** Log inputs, latency, confidence and disagreements, and feed interesting cases back into training.

```python
# Illustrative export and check. Details vary with library versions.
import numpy as np, onnxruntime as ort, torch

model.eval()
dummy = torch.randn(1, 3, 384, 640)
torch.onnx.export(model, dummy, "detector.onnx", input_names=["image"], output_names=["out"])

session = ort.InferenceSession("detector.onnx")
onnx_out = session.run(None, {"image": dummy.numpy()})[0]
with torch.no_grad():
    torch_out = model(dummy).numpy()
assert np.allclose(onnx_out, torch_out, atol=1e-3)
```

Averages hide what breaks a real-time loop. The numbers below are synthetic, and a real system needs its own measurements. The point is how to read them.

```python run=dl-c03-latency
import numpy as np

rng = np.random.default_rng(0)
n = 100_000
stages = {"capture + transfer": (5, 0.2), "preprocess": (3, 0.2), "inference": (15, 0.25), "track + publish": (2, 0.5)}
total = np.zeros(n)
for name, (median, sigma) in stages.items():
    t = median * rng.lognormal(0, sigma, n)
    total += t
    print(f"{name:20} mean {t.mean():5.1f} ms, p99 {np.percentile(t, 99):5.1f} ms")
print(f"{'end to end':20} mean {total.mean():5.1f} ms, p50 {np.percentile(total, 50):5.1f}, p99 {np.percentile(total, 99):5.1f}, max {total.max():5.1f}")
print(f"over a 33.3 ms frame budget: {(total > 33.3).mean() * 100:.1f}% of frames")
for speed in (1.5, 10.0):
    print(f"object at {speed} m/s moves {speed * np.percentile(total, 99) / 1000:.3f} m during p99 latency")
```

The mean of 25.9 ms looks safe against a 33.3 ms frame budget, yet 5.5% of frames miss it, and the p99 is 37.9 ms. Tails don't add: the stage p99s sum to about 46 ms, more than the end-to-end p99, since the stages rarely peak at the same time. For a fast object, the motion during a p99 delay is 0.38 m, so downstream code should use timestamps and predict forward instead of assuming the data is current.

## Drills {#ch03-drills .dr}

:::drill output
Boxes in `(x, y, w, h)` format are passed to an `(x1, y1, x2, y2)` IoU function. What goes wrong?

```python run=dl-c03-d-format
def iou(a, b):
    w = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    h = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    area = lambda r: (r[2] - r[0]) * (r[3] - r[1])
    return w * h / (area(a) + area(b) - w * h)

a, b = (10, 10, 20, 20), (12, 12, 20, 20)         # x, y, w, h
to_xyxy = lambda r: (r[0], r[1], r[0] + r[2], r[1] + r[3])
print("wrong format:", round(iou(a, b), 3), " correct:", round(iou(to_xyxy(a), to_xyxy(b)), 3))
```
---
**Answer.** The wrong format gives 0.64 here and the correct IoU is about 0.68. The error depends on position, so nothing crashes, and results degrade silently.

**Why.** Treating `w` and `h` as corners changes the box. Far from the origin, a box can even have a negative "width", which produces nonsense. Visualise boxes on an image before training.
:::

:::drill concept
Explain mAP to someone who knows precision and recall.
---
**Answer.** For one class, rank detections by score and plot precision against recall as you go down the list, using IoU to decide true positives. AP is the area under that curve. mAP averages AP across classes, and in COCO's case across IoU thresholds as well.

**Why.** It rates a ranking without choosing one score threshold. Name the IoU convention, since AP50 and AP50:95 are very different numbers.
:::

:::drill tricky
You raise the confidence threshold before evaluation, from 0.01 to 0.5. Can AP go up?
---
**Answer.** No, if the threshold is applied to the same ranked list. Removing low-score detections only cuts the tail of the ranking, so the earlier precision and recall points stay the same, and any lost true positives reduce the maximum recall.

**Why.** Low-score detections come last in the ranking, so their false positives don't affect precision earlier on. Thresholding helps in deployment, where you must pick an operating point.
:::

:::drill bug
Find the bug in this NMS.

```python
keep = []
order = list(range(len(boxes)))
while order:
    best = order.pop(0)
    keep.append(best)
    order = [i for i in order if iou(boxes[best], boxes[i]) <= thr]
```
---
**Answer.** It never sorts by score, so `best` is just the first remaining box, and a low-score box can suppress a better one.

**Why.** Sort indices by descending score first. For deterministic results, break ties in a fixed way. Also run it per class, or use a class-aware variant.
:::

:::drill tricky
How does DETR avoid NMS? What did it give up?
---
**Answer.** It has a fixed set of learned queries, and training uses Hungarian matching to assign each ground truth to exactly one query. Other queries are pushed to "no object", so the model learns to avoid duplicates, partly through attention between queries.

**Why.** The original design was slow to converge and weak on small objects, and later variants address those issues. One-to-one matching removes NMS, and the attention cost remains.
:::

:::drill concept
In a Kalman filter, what do `Q` and `R` control? What happens if `R` is set far too low?
---
**Answer.** `Q` is process noise, or how much the motion model can be wrong. `R` is measurement noise. If `R` is too low, the filter trusts each detection, so the estimate is jittery, and the velocity estimate is noisy.

**Why.** The gain depends on the ratio of prediction uncertainty to measurement uncertainty. Only the balance sets the gain in steady state, so tune using innovation statistics, or by the tracking metric on validation data.
:::

:::drill tricky
Your tracker's ID switches rise after you improve the detector's recall. How can this happen?
---
**Answer.** More low-quality or occluded detections enter association, including boxes that overlap neighbours, so mismatches rise. Tracks may also survive longer in crowded scenes, where switches occur.

**Why.** Detection and association interact. MOTA may go up while IDF1 falls, so look at both. Options include better gating, an appearance model, and a two-stage association as in ByteTrack.
:::

:::drill concept
A paper reports a low `minADE_20`. What else do you want to know before believing the model is better?
---
**Answer.** `K`, the split, a constant-velocity baseline, a likelihood or miss-rate metric, per-scenario results, and the number of seeds.

**Why.** Best-of-K rewards spread, as the program in this chapter shows, and it says nothing about how probable the good sample was. A planner can't use a sample it can't identify.
:::

:::drill concept
When would you pick early, middle or late fusion?
---
**Answer.** Early when sensors are well aligned, and raw correlations matter. Middle by default, using shared BEV or cross-attention. Late when modules must be independent or sensors can fail, or when teams maintain models separately.

**Why.** Earlier fusion can model more interactions, and is more exposed to misalignment and missing inputs. A good follow-up is how you test with one sensor off.
:::

:::drill tricky
You report a 2% improvement in mean error from one run of each model. Your lead asks whether it is real. What do you do?
---
**Answer.** Repeat with several seeds, compute paired differences per scene, and give a confidence interval. Check the gain isn't from one scene, and that it holds on a held-out test set not used in tuning.

**Why.** Seed variation can be as large as the gain. Pairing removes scene difficulty from the comparison, so it has more power. Also compare the cost: latency and memory may make a small gain not worth it.
:::

:::drill bug
Validation accuracy on a pedestrian-intent model is 97%, and on new sites it is 62%. The split code is below. What is the likely problem?

```python
idx = np.random.permutation(len(frames))
train, val = idx[:split], idx[split:]
```
---
**Answer.** Frames from one video are in both sets, so nearby frames leak. Split by video, and for this deployment question, by site.

**Why.** Adjacent frames are almost the same image, so the model can recognise a scene and recall its label. The chapter's leakage program shows this on data with no real signal.
:::

:::drill concept
A detector with good offline mAP misses people on your robot. Walk through your first checks.
---
**Answer.** Replay a recording from the robot through the offline pipeline, and compare outputs with those on the robot. Check preprocessing (RGB or BGR, resize, normalisation), exposure and blur, camera height and angle, object sizes against the training set, score thresholds, and latency causing stale results. Then label some real frames, and measure AP on them.

**Why.** First separate a software difference from a data difference. If replay matches, it is a domain gap, which needs data from the platform. If it doesn't, there is a pipeline bug.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1300
Write a vectorised pairwise IoU and NMS in NumPy, and test them against a brute-force version on random boxes.
---
Broadcasting computes the whole matrix. Testing against a slow, obvious version catches off-by-one and format errors.

```python run=dl-c03-c-nms
import numpy as np

def pairwise_iou(a, b):
    lt = np.maximum(a[:, None, :2], b[None, :, :2])
    rb = np.minimum(a[:, None, 2:], b[None, :, 2:])
    inter = np.clip(rb - lt, 0, None).prod(-1)
    area = lambda r: (r[:, 2:] - r[:, :2]).prod(-1)
    return inter / (area(a)[:, None] + area(b)[None] - inter)

def nms(boxes, scores, thr):
    order = np.argsort(-scores, kind="stable")
    keep = []
    while order.size:
        best = order[0]
        keep.append(int(best))
        order = order[1:][pairwise_iou(boxes[best:best + 1], boxes[order[1:]])[0] <= thr]
    return keep

def slow_nms(boxes, scores, thr):
    def iou(a, b):
        w = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
        h = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
        return w * h / ((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - w * h)
    order = sorted(range(len(boxes)), key=lambda i: (-scores[i], i))
    keep = []
    while order:
        best = order.pop(0)
        keep.append(best)
        order = [i for i in order if iou(boxes[best], boxes[i]) <= thr]
    return keep

rng = np.random.default_rng(0)
agree = 0
for _ in range(200):
    n = 40
    xy = rng.uniform(0, 100, (n, 2))
    wh = rng.uniform(5, 40, (n, 2))
    boxes = np.hstack([xy, xy + wh])
    scores = rng.random(n)
    agree += nms(boxes, scores, 0.5) == slow_nms(boxes, scores, 0.5)
print("agreement on random trials:", agree, "of 200")
print(np.round(pairwise_iou(np.array([[0.0, 0, 10, 10]]), np.array([[5.0, 0, 15, 10], [0, 0, 10, 10], [20, 20, 30, 30]])), 3).tolist())
```
:::

:::drill code rating=1600
Build a small tracker: Kalman predict, IoU association and track management. Run it on two people who cross paths, with a detection dropout, then compare against association using each track's last box instead of a prediction. Count ID switches and compute MOTA.
---
Each detection carries its true object id, used only for scoring. The two people pass through each other around frame 10, and person A has no detections for frames 4 to 6. All detections are real here, so false positives are 0 in the MOTA. The program averages over 100 noise seeds, since one run can get lucky.

```python run=dl-c03-c-track
from itertools import permutations
import numpy as np

def iou(a, b, size=10.0):
    dx, dy = abs(a[0] - b[0]), abs(a[1] - b[1])
    inter = max(0.0, size - dx) * max(0.0, size - dy)
    return inter / (2 * size * size - inter)

F = np.eye(4); F[0, 2] = F[1, 3] = 1.0
H = np.eye(2, 4)
Q, R = np.eye(4) * 0.01, np.eye(2) * 0.25

class Track:
    def __init__(self, tid, z):
        self.id, self.age = tid, 0
        self.x = np.array([z[0], z[1], 0.0, 0.0])
        self.P = np.diag([1.0, 1.0, 25.0, 25.0])
    def predict(self):
        self.x, self.P = F @ self.x, F @ self.P @ F.T + Q
        self.age += 1
    def update(self, z):
        K = self.P @ H.T @ np.linalg.inv(H @ self.P @ H.T + R)
        self.x = self.x + K @ (z - H @ self.x)
        self.P = (np.eye(4) - K @ H) @ self.P
        self.age = 0

def assign(tracks, dets, gate=0.2, use_motion=True):
    if not tracks or not dets:
        return []
    swap = len(tracks) > len(dets)
    rows, cols = (dets, tracks) if swap else (tracks, dets)
    pos = lambda t: t.x[:2] if use_motion else t.last
    score = lambda r, c: iou(pos(c), r) if swap else iou(pos(r), c)
    best = max(permutations(range(len(cols)), len(rows)),
               key=lambda p: sum(score(rows[i], cols[j]) for i, j in enumerate(p)))
    pairs = [(best[i], i) if swap else (i, best[i]) for i in range(len(rows))]
    return [(t, d) for t, d in pairs if iou(pos(tracks[t]), dets[d]) >= gate]

def run(use_motion, seed, frames=21):
    rng = np.random.default_rng(seed)
    tracks, next_id, fn, switches, last_id = [], 0, 0, 0, {}
    def seen(gt, tid):
        nonlocal switches
        switches += gt in last_id and last_id[gt] != tid
        last_id[gt] = tid
    for t in range(frames):
        truth = {"A": np.array([2.0 * t, 20.0]), "B": np.array([40.0 - 2.0 * t, 21.0])}
        obs = [(k, v + rng.normal(0, 0.3, 2)) for k, v in truth.items() if not (k == "A" and 4 <= t < 7)]
        fn += 2 - len(obs)
        dets = [z for _, z in obs]
        for tr in tracks:
            tr.predict()
        pairs = assign(tracks, dets, use_motion=use_motion)
        for ti, di in pairs:
            tracks[ti].update(dets[di])
            tracks[ti].last = dets[di]
            seen(obs[di][0], tracks[ti].id)
        matched = [d for _, d in pairs]
        for di in [d for d in range(len(dets)) if d not in matched]:
            tr = Track(next_id, dets[di])
            tr.last = dets[di]
            tracks.append(tr)
            seen(obs[di][0], next_id)
            next_id += 1
        tracks = [tr for tr in tracks if tr.age <= 3]
    return switches, 1 - (fn + switches) / (2 * frames), next_id

for name, motion in [("last box", False), ("Kalman prediction", True)]:
    results = np.array([run(motion, seed) for seed in range(100)])
    print(f"{name:18} mean ID switches {results[:, 0].mean():.2f}, mean MOTA {results[:, 1].mean():.3f}, "
          f"mean tracks created {results[:, 2].mean():.2f}")
```

The last-box tracker loses person A in the dropout, since a box that far behind fails the IoU gate. It creates a third track, and that accounts for one switch. It adds about half a switch more at the crossing, where matching two nearly equal boxes is close to a coin flip. The Kalman tracker keeps predicting through the gap with 2 tracks in every run, and its velocity estimates resolve almost all crossings, leaving 0.08 switches on average. MOTA moves only from 0.892 to 0.927, because the 3 missed detections are in both scores and one switch counts the same as one missed box. That is one reason to read IDF1 or HOTA as well.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- IoU: `inter / (a + b - inter)`, with `max(0, ...)` on each side. Half-width shift gives 1/3. Check the box format first.
- NMS: sort by score, keep the best, drop overlaps above the threshold, per class. Crowds suffer. Soft-NMS decays scores. DETR uses set matching, with no NMS.
- Anchors: preset boxes and offsets. Anchor-free: points and distances, or centre heatmaps. Focal loss: `(1 - p_t)^gamma * CE`, for the imbalance.
- AP: area under the precision-recall curve from a ranked list, where duplicates count as false positives. mAP: across classes, and in COCO across IoU 0.50 to 0.95.
- Segmentation: semantic per pixel, instance per object, panoptic both. mIoU, Dice `= 2 IoU / (1 + IoU)`. Pixel accuracy misleads under imbalance.
- SORT: Kalman predict, Hungarian on IoU, update, new tracks, age out. DeepSORT adds appearance. ByteTrack uses low-score boxes.
- Kalman: `Q` for motion uncertainty, `R` for measurement noise, gain balances them. Prediction bridges missed frames, as uncertainty grows.
- MOTA `= 1 - (FN + FP + IDSW)/GT`. IDF1 for identity. HOTA for balance.
- ADE: mean L2 over horizon. FDE: last step. minADE_K rewards spread, so always state K and use a baseline.
- Fusion: early, middle, late. Inverse-variance weights for independent unbiased sensors. A miscalibrated sensor can hurt. Test with a sensor missing.
- CLIP: two encoders, symmetric InfoNCE, temperature. Loss at uniform similarity is `ln(N)`, so it isn't comparable across batch sizes.
- Experiment: hypothesis, baselines, primary metric, split by group, ablation, seeds, paired CI, error analysis, logs.
- Deployment: calibration, time sync, frames, end-to-end tail latency, export equality checks, stale-data behaviour, shadow mode, monitoring.
