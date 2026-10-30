---
title: Docker, Kubernetes and monitoring ML services
part: Part C · Serving
lede: A speech model is only useful when it runs for many users at once and you can tell when it goes wrong. This chapter covers images, GPU containers and the Kubernetes objects you will be asked about, then the parts specific to ML: slow model loading, long-lived connections, what to autoscale on, how to see quality drift, how to roll out safely, and how to estimate cost per minute. Cluster behaviour is simulated in plain Python, since Kubernetes cannot run in this site's build.
desc: images and layers, GPU containers, pods, deployments, services, HPA, readiness probes, cold starts, streaming load balancing, sticky sessions, autoscaling signals, metrics, tracing, drift, canaries, cost per minute
hours: 6
prereqs: Chapter 2 (pipeline, percentiles). Comfortable with a Linux shell.
---

## Images and layers {#ch03-images .th}

A **container** is a normal Linux process with isolated views of the system, using namespaces, and with resource limits from cgroups. It shares the host's kernel, so it starts quickly, and it is not a virtual machine. An **image** is the packaged filesystem and start command it runs from.

An image is a stack of read-only **layers**. Each filesystem-changing instruction in a Dockerfile adds a layer, and layers are shared between images and cached between builds. A layer's cache key depends on its parent, on the instruction, and on the files it copies. So once one layer changes, every layer after it must be rebuilt. This gives the main rule: **put what changes least at the top**.

```python run=sp-c03-layers
import hashlib

def build(steps, inputs, cache):
    """Each layer's key is its parent's key plus the instruction plus a hash of the files it copies."""
    parent, rebuilt, pushed = "", [], 0
    for name, size_mb, files in steps:
        content = "".join(inputs[f] for f in files)
        key = hashlib.sha256((parent + name + content).encode()).hexdigest()
        if key not in cache:
            cache.add(key)
            rebuilt.append(name)
            pushed += size_mb
        parent = key
    return rebuilt, pushed

BAD = [("FROM python-slim", 130, []), ("COPY . /app", 2, ["app.py", "requirements.txt"]),
       ("pip install -r requirements.txt", 2500, ["requirements.txt"])]
GOOD = [("FROM python-slim", 130, []), ("COPY requirements.txt", 1, ["requirements.txt"]),
        ("pip install -r requirements.txt", 2500, ["requirements.txt"]), ("COPY . /app", 2, ["app.py"])]

for label, steps in (("COPY all first", BAD), ("requirements first", GOOD)):
    cache = set()
    inputs = {"app.py": "v1", "requirements.txt": "torch==x"}
    build(steps, inputs, cache)
    inputs["app.py"] = "v2"                        # a one-line code change
    rebuilt, pushed = build(steps, inputs, cache)
    print(f"{label}: code change rebuilds {rebuilt}, {pushed} MB of new layers")
```

With code copied first, a one-line edit reinstalls every dependency and produces 2502 MB of new layers (the sizes are example figures). With requirements copied first, the same edit produces 2 MB. A practical Dockerfile for a GPU service looks like this. It is illustrative and is not built by this site.

```dockerfile
# illustrative
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

USER 1000
EXPOSE 8080
CMD ["python", "-m", "src.server"]
```

Things to be able to explain from this file:

- The `rm` is in the same `RUN` as the install. A later `RUN rm` hides files without shrinking the image, since the earlier layer still holds them.
- `CMD` uses the exec form, so that your process is PID 1 and receives SIGTERM directly. The shell form can swallow it, and then a graceful drain never starts.
- A **multi-stage build** compiles in one stage and copies only the results into a smaller final image.
- `.dockerignore` keeps datasets, checkpoints and `.git` out of the build context.
- Pin dependency versions, and for reproducibility pin the base image by digest.

**Where do weights go?** There are three common choices. Baking them into the image gives simple versioning and slow pulls. Downloading at start keeps the image small, and each start is slow and depends on the store. A node-level cache or a shared read-only volume is fast at the cost of more moving parts. Whichever you pick, record the model version in your metrics.

## GPU containers {#ch03-gpu .th}

The GPU's **kernel driver is on the host**, and the container shares the host's kernel, so the driver is not in the image. The image holds the user-space libraries such as CUDA and your framework. A runtime component from the GPU vendor (the Container Toolkit, on the usual CUDA setup) makes the device files and driver libraries visible inside the container.

```bash
# illustrative: needs a GPU host with the toolkit installed
docker run --rm --gpus all my-speech-image nvidia-smi
```

That gives three layers that have to agree: host driver, CUDA libraries in the image, and framework build. A framework built for a newer CUDA than the driver supports is a common cause of `torch.cuda.is_available()` returning `False`. When debugging that, run `nvidia-smi` in the container first. If it fails, the problem is with the runtime or the host. If it works and your framework cannot see the GPU, the problem is in the image, such as a CPU-only framework build.

**Batching** is what makes a GPU cost-effective, and it trades against latency. Streaming ASR and TTS servers gather requests from many streams into one forward pass. The coding section simulates this. A GPU can also be split with hardware partitioning or shared with time-slicing, and each has isolation trade-offs. Memory, more than compute, is often what limits how many models fit on a GPU.

## Kubernetes objects {#ch03-k8s .th}

Kubernetes keeps a cluster in the state that you declare. You describe what you want, and controllers keep working to make it true. You will be asked about these objects:

| Object | What it is |
|---|---|
| **Pod** | The smallest unit: one or more containers that share a network identity. Pods are disposable, and they get a new IP when replaced |
| **Deployment** | Declares a pod template and a replica count. Manages rolling updates through ReplicaSets |
| **Service** | A stable virtual IP and DNS name that forwards to the current healthy pods matching a label |
| **Ingress or Gateway** | HTTP routing from outside the cluster |
| **HPA** | Horizontal Pod Autoscaler. Changes a Deployment's replica count from metrics |
| **ConfigMap, Secret** | Configuration and credentials, kept out of the image |

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 196" role="img" aria-label="Traffic flows from clients through a load balancer to a Service and on to three pods. One pod is not ready and gets no traffic. An HPA reads metrics from pods and changes the replica count of the Deployment.">
  <rect x="8" y="70" width="80" height="44" rx="6" class="d-box"/><text x="48" y="96" text-anchor="middle" class="t-small">clients</text>
  <rect x="118" y="70" width="110" height="44" rx="6" class="d-soft"/><text x="173" y="96" text-anchor="middle" class="t-small">load balancer</text>
  <rect x="258" y="70" width="90" height="44" rx="6" class="d-acc"/><text x="303" y="96" text-anchor="middle" class="t-small">Service</text>
  <rect x="420" y="10" width="120" height="44" rx="6" class="d-key"/><text x="480" y="30" text-anchor="middle" class="t-small">pod, ready</text><text x="480" y="46" text-anchor="middle" class="t-mono">GPU, model</text>
  <rect x="420" y="70" width="120" height="44" rx="6" class="d-key"/><text x="480" y="90" text-anchor="middle" class="t-small">pod, ready</text><text x="480" y="106" text-anchor="middle" class="t-mono">GPU, model</text>
  <rect x="420" y="130" width="120" height="44" rx="6" class="d-trap"/><text x="480" y="150" text-anchor="middle" class="t-small">pod, not ready</text><text x="480" y="166" text-anchor="middle" class="t-mono">loading weights</text>
  <rect x="590" y="70" width="122" height="44" rx="6" class="d-soft"/><text x="651" y="90" text-anchor="middle" class="t-small">HPA and</text><text x="651" y="106" text-anchor="middle" class="t-small">metrics</text>
  <path d="M88 92 L 118 92" class="d-line"/><path d="M228 92 L 258 92" class="d-line"/><path d="M348 86 L 420 32" class="d-line-acc"/><path d="M348 92 L 420 92" class="d-line-acc"/>
  <path d="M540 92 L 590 92" class="d-line"/><path d="M540 32 L 600 70" class="d-line"/><path d="M540 150 L 600 114" class="d-line"/>
  <text x="651" y="134" text-anchor="middle" class="t-small">sets replicas</text>
</svg></div><figcaption><b>Traffic and scaling in one picture.</b> A pod that is not ready stays out of the Service's list. The HPA reads metrics and changes the replica count.</figcaption></figure>

This is a Deployment for a GPU service. Like all the YAML in this chapter, it is illustrative, and you should check field names against your cluster's version.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: asr
spec:
  replicas: 4
  selector:
    matchLabels: { app: asr }
  template:
    metadata:
      labels: { app: asr }
    spec:
      terminationGracePeriodSeconds: 900     # let live calls finish
      containers:
        - name: server
          image: registry.example.com/asr:1.8.2
          ports: [{ containerPort: 8080 }]
          resources:
            requests: { cpu: "4", memory: 16Gi }
            limits: { memory: 16Gi, nvidia.com/gpu: 1 }
          startupProbe:                      # up to 10 minutes for loading
            httpGet: { path: /ready, port: 8080 }
            periodSeconds: 10
            failureThreshold: 60
          readinessProbe:                    # may this pod get new traffic?
            httpGet: { path: /ready, port: 8080 }
            periodSeconds: 5
          livenessProbe:                     # is it stuck, so that only a restart helps?
            httpGet: { path: /live, port: 8080 }
            periodSeconds: 10
            failureThreshold: 3
          lifecycle:
            preStop:
              exec: { command: ["/app/drain.sh"] }
```

### Readiness, liveness and startup probes {#ch03-probes}

These three look alike, and do different things.

- **Readiness** failing removes the pod from Service endpoints. The pod is left running. Use it for "cannot take new work now": still loading, or at session capacity.
- **Liveness** failing restarts the container. Use it only for "stuck and a restart would help", like a deadlocked event loop. It should stay cheap and not depend on anything outside the process.
- **Startup** holds the other two off until it first succeeds. It exists for slow starters such as ML services.

:::trap A liveness probe that kills model loading
If liveness allows 30 s and loading takes 90 s, the pod is restarted partway through every load, and it never comes up. The symptom is `CrashLoopBackOff` with no error in the logs. Use a startup probe with a long enough limit. Similarly, a liveness check that calls the database can restart your whole fleet when the database has a brief problem.
:::

The readiness endpoint must reflect the truth. Here is the usual shape, again illustrative.

```python
# illustrative: framework-neutral server skeleton
model = None
draining = False

def load_in_background():
    global model
    m = load_weights("/models/asr-1.8.2")
    m.warm_up()               # first inference is often slow: run one before taking traffic
    model = m

def ready():                  # GET /ready
    ok = model is not None and not draining and active_sessions() < MAX_SESSIONS
    return (200 if ok else 503)

def on_sigterm():
    global draining
    draining = True           # stop getting new sessions; existing ones finish
```

## Model loading and cold starts {#ch03-cold .th}

A web service starts in seconds. A GPU model service can take minutes, and this changes how you scale it.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 128" role="img" aria-label="Pod start timeline of 245 seconds as a proportional bar. Pulling the image takes 150 seconds, downloading weights 60, loading to GPU 20, and the other three steps 5 seconds each. The pod reports ready only at the end.">
  <rect x="15.0" y="30" width="14.1" height="30" class="d-box"/>
  <rect x="29.1" y="30" width="422.4" height="30" class="d-trap"/>
  <text x="240.3" y="50" text-anchor="middle" class="t-small">pull image 150 s</text>
  <rect x="451.5" y="30" width="14.1" height="30" class="d-box"/>
  <rect x="465.6" y="30" width="169.0" height="30" class="d-soft"/>
  <text x="550.1" y="50" text-anchor="middle" class="t-small">download weights 60 s</text>
  <rect x="634.6" y="30" width="56.3" height="30" class="d-acc"/>
  <rect x="690.9" y="30" width="14.1" height="30" class="d-key"/>
  <text x="15" y="20" class="t-small">traffic must not reach the pod anywhere in this bar</text>
  <path d="M705.0 24 L 705.0 74" class="d-line-key"/><text x="705.0" y="90" text-anchor="end" class="t-small t-key">readiness passes at 245 s</text>
  <text x="15" y="90" class="t-small">narrow steps: schedule 5 s, start process 5 s, load to GPU 20 s, warm-up 5 s</text>
  <text x="15" y="112" class="t-small">with the image and weights already on the node, only 35 s of this remains</text>
</svg></div><figcaption><b>Why cold starts dominate GPU scaling.</b> Example figures from the program below. Measure your own, since image size, weight size and storage speed change them a lot.</figcaption></figure>

```python run=sp-c03-coldstart
# Example figures in seconds for one pod starting on a node. Change them to your own.
STEPS = {"schedule, attach GPU": 5, "pull image": 150, "start process": 5,
         "download weights": 60, "load to GPU": 20, "warm-up inference": 5}

def total(skip=()):
    return sum(v for k, v in STEPS.items() if k not in skip)

print("nothing cached:             ", total(), "s")
print("image on node:              ", total(["pull image"]), "s")
print("image and weights on node:  ", total(["pull image", "download weights"]), "s")

# How much spare capacity covers that start time during a ramp?
ramp_per_minute = 12                    # new concurrent sessions per minute at the steepest
for start_s in (total(), total(["pull image"]), total(["pull image", "download weights"])):
    print(f"start {start_s:3} s: sessions that arrive before a new pod is ready: {ramp_per_minute * start_s / 60:.0f}")
```

With nothing cached, a pod needs 245 s, and in that time 49 more sessions arrive on this ramp. With the image and weights on the node, it needs 35 s, and only 7 sessions arrive. Common ways of shortening it:

- Preload the image on GPU nodes, or keep a warm pool of nodes.
- Cache weights on the node or use a fast volume. Lazy loading formats such as safetensors can help too.
- Run warm-up inference before reporting ready, so the first user does not pay for lazy initialisation, JIT compiling and memory allocation.
- Keep a floor of replicas, since a new GPU node may itself take minutes to arrive.

## Load balancing streaming connections {#ch03-lb .th}

A request-response API distributes well, since requests are short and new ones arrive constantly. A voice session is a connection that can last for many minutes, with **all its load staying on one pod**. This changes what works.

- Connection-level (L4) balancers pick a backend once for each connection. That is correct for voice, and HTTP-style per-request balancing has nothing to act on after the WebSocket upgrade.
- **Round robin** ignores how long connections last, so pods drift out of balance. **Least connections** uses the actual load.
- **Scaling out** does not move existing sessions. A new pod starts empty, and round robin only gives it its fair share of new sessions, while old pods stay full.

```python run=sp-c03-lb
import heapq, random

def run(policy, seed=5):
    rng = random.Random(seed)
    active, ends = [0, 0, 0], []
    t, rr, spreads, peak, new_pod_load = 0.0, 0, [], 0, None
    while t < 7200:
        t += rng.expovariate(0.1)                                    # 0.1 new sessions per second
        while ends and ends[0][0] <= t:
            _, p = heapq.heappop(ends)
            active[p] -= 1
        if len(active) == 3 and t > 3600:                            # scale out half-way through
            active.append(0)
        if policy == "round robin":
            p = rr % len(active)
            rr += 1
        else:
            p = min(range(len(active)), key=lambda i: (active[i], i))
        active[p] += 1
        heapq.heappush(ends, (t + rng.lognormvariate(5.3, 1.0), p))  # median 200 s, with a long tail
        spreads.append(max(active) - min(active))
        peak = max(peak, max(active))
        if new_pod_load is None and t > 3900:                        # 5 minutes after scale-out
            new_pod_load = list(active)
    return peak, sum(spreads) / len(spreads), new_pod_load

for policy in ("round robin", "least connections"):
    peak, spread, snapshot = run(policy)
    print(f"{policy:18} peak on one pod {peak:3}  mean busiest-minus-idlest {spread:4.1f}  5 min after scale-out {snapshot}")
```

The two policies get the same sessions, with long-tailed durations. Round robin's busiest and idlest pods differ by 4.1 sessions on average, and with least connections the difference is 1.0. Five minutes after a fourth pod joins, round robin still has one old pod at 12 sessions against 5 on the new one, while least connections is at [7, 8, 7, 7], since it gave the new pod most of the arrivals. For a GPU pod with a hard session limit, that peak matters.

**Sticky sessions.** A streaming session has state on the pod: audio buffers, ASR hidden state, conversation history in memory. So all of its traffic must reach the same pod. Over a single WebSocket that happens automatically. It becomes a design question when a client reconnects, or when several requests belong to one session. Options are cookie or header affinity at the proxy, consistent hashing on the session ID (see the coding section), or a session directory that records which pod holds each session.

Stickiness costs you in balance, and it means a pod's failure drops the sessions on it. Keep the state you cannot afford to lose, such as conversation history, in a shared store, so a reconnect can resume on another pod. ASR hidden state can just be rebuilt from the next utterance, and losing a little context there is usually acceptable.

**WebRTC media** adds another twist. UDP media cannot go through an HTTP load balancer. The usual pattern is that the signalling request picks a media server, which then has a reachable address of its own, often behind TURN.

**Rolling updates and draining.** Default termination gives a pod 30 s after SIGTERM, then kills it, which drops any calls. So: on SIGTERM, fail readiness to stop new sessions, let current ones finish, and set `terminationGracePeriodSeconds` to about the longest call you will wait for. Decide what to do with the very long ones, for instance a graceful handoff or a spoken message. For the same reason, an autoscaler scaling down is a risk to active calls.

## Autoscaling signals {#ch03-autoscale .th}

The HPA's rule is a ratio: `desired = ceil(current * metric / target)`, with a default tolerance of 10% so it does not act on small changes, and a default scale-down stabilization window of 5 minutes.

```python run=sp-c03-hpa
from math import ceil

def desired(current, metric, target, tolerance=0.1):
    ratio = metric / target
    if abs(ratio - 1) <= tolerance:
        return current                  # close enough, so do nothing
    return ceil(current * ratio)

print("pods  metric target desired")
for current, metric, target in [(4, 80, 50), (4, 54, 50), (10, 20, 50), (3, 12, 8), (6, 8.5, 8)]:
    print(f"{current:4} {metric:7} {target:6} {desired(current, metric, target):7}")
```

The tolerance is why 54 against a target of 50 changes nothing. Choosing what to scale on is the real question.

| Signal | Good | Bad |
|---|---|---|
| CPU | Works out of the box | Often flat on GPU services, so it can miss the real bottleneck |
| GPU utilisation | Easy to get with an exporter | Non-linear, and high utilisation may be healthy with batching. Says little about memory |
| **Active sessions per pod** | Directly tracks load for streaming, and is simple to reason about | Needs a capacity number from load testing. Not all sessions cost the same |
| **Queue depth or wait time** | Leading signal of overload | Can be noisy; only useful if there is a queue |
| p95 latency | Measures what users feel | Lags, and it is too late by the time it rises. It can also rise for reasons that more pods will not fix |

A common choice for voice is active sessions per pod, with queue wait as a second metric, plus a schedule for known daily peaks. HPA takes the largest answer among several metrics. Custom metrics need a metrics adapter in the cluster.

```yaml
# illustrative: scale on a per-pod custom metric
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: asr
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: asr }
  minReplicas: 4
  maxReplicas: 40
  metrics:
    - type: Pods
      pods:
        metric: { name: active_sessions }
        target: { type: AverageValue, averageValue: "12" }
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 600
```

The simulation below runs a demand curve: 40 sessions, a ramp up to 200 over 5 minutes, then a drop to 60, with 10 sessions per pod. It compares a target utilisation with the startup times from the cold-start program.

```python run=sp-c03-autoscale
from math import ceil

CAPACITY = 10                     # concurrent sessions per pod

def demand(minute):
    if minute < 20:
        return 40
    if minute < 25:
        return 40 + (minute - 20) * 32       # ramp to 200 in 5 minutes
    if minute < 45:
        return 200
    return 60

def simulate(target_util, startup_s, step_s=10, hours=1.0):
    pods, starting, rejected, pod_seconds, peak, low_since = 5, [], 0.0, 0, 5, 0
    for tick in range(int(hours * 3600 / step_s)):
        now = tick * step_s
        pods += sum(1 for ready in starting if ready <= now)
        starting = [r for r in starting if r > now]
        load = demand(now / 60)
        rejected += max(0, load - pods * CAPACITY) * step_s / 60       # session-minutes turned away
        want = ceil(load / (CAPACITY * target_util))
        if want > pods + len(starting):
            starting += [now + startup_s] * (want - pods - len(starting))
        elif want < pods and now - low_since >= 300:                   # scale down only after 5 quiet minutes
            pods = want
        if want >= pods:
            low_since = now
        pod_seconds += (pods + len(starting)) * step_s
        peak = max(peak, pods + len(starting))
    return rejected, pod_seconds / 60, peak

print("target  startup  rejected session-min  pod-min  peak pods")
for target, startup in [(0.9, 245), (0.6, 245), (0.9, 35), (0.75, 35), (0.6, 35)]:
    rejected, pod_min, peak = simulate(target, startup)
    print(f"{target:5.2f} {startup:6} s {rejected:18.0f} {pod_min:9.0f} {peak:7}")
```

Headroom and startup time trade against each other, and startup time is the stronger lever in this scenario. With a 245 s start, dropping the target from 0.9 to 0.6 cuts rejected session-minutes from 546 to 310, and pod-minutes go up from 810 to 1186. With a 35 s start and the same cheap 0.9 target, only 24 session-minutes are rejected, and at 0.75 it is down to 1 with 952 pod-minutes. So reducing cold start buys capacity safety more cheaply than idle GPUs do, at least with this ramp. A sharper ramp would need more headroom.

## Metrics and tracing {#ch03-metrics .th}

Two simple checklists help. **RED** applies to services: rate, errors, duration. **USE** applies to resources: utilisation, saturation, errors. For a voice service, add stage-level latency and audio-specific quality signals.

| Layer | Metrics to have |
|---|---|
| Call | Active sessions, connect failures, voice-to-voice p50 and p95, call length, abnormal disconnects |
| Stage | ASR, LLM and TTS latency histograms, per-stage errors, queue wait, RTF, time to first audio |
| Media | Packet loss, jitter, concealed samples, share of calls using TURN, RTT |
| Resources | GPU memory and utilisation, CPU, per-pod sessions, pod restarts, model load time |
| Quality | ASR confidence, no-speech rate, barge-in rate, repeats, task success |

Metric types matter. A **counter** only goes up, and you look at its rate. A **gauge** goes up and down. A **histogram** counts values into buckets, and histograms from many pods can be added together. That is how you get a correct fleet-wide p95, which you cannot get by averaging each pod's p95, as [Chapter 2](#ch02-measure) showed. Bucket boundaries decide how good that estimate is.

```python run=sp-c03-hist
import numpy as np

rng = np.random.default_rng(12)
latency = rng.lognormal(np.log(300), 0.4, 50000)

def quantile_from_buckets(values, bounds, q):
    """Linear interpolation inside a bucket, the same idea as Prometheus histogram_quantile."""
    counts = [int(np.sum(values <= b)) for b in bounds]                      # cumulative, like `le` buckets
    rank = q * len(values)
    lower, seen = 0.0, 0
    for bound, c in zip(bounds, counts):
        if c >= rank:
            return lower + (bound - lower) * (rank - seen) / (c - seen)
        lower, seen = bound, c
    return bounds[-1]                                                        # above the top bucket

coarse = [100, 500, 1000, 5000]
fine = [100, 200, 300, 400, 500, 600, 700, 800, 1000, 1500, 5000]
print(f"true p50 {np.percentile(latency, 50):.0f}, true p95 {np.percentile(latency, 95):.0f}")
for name, bounds in (("coarse", coarse), ("fine", fine)):
    print(f"{name:7} p50 {quantile_from_buckets(latency, bounds, .5):.0f}, p95 {quantile_from_buckets(latency, bounds, .95):.0f}")
print(f"top bucket 400 ms: p95 reports {quantile_from_buckets(latency, [100, 200, 300, 400], .95):.0f}, whatever the truth")
```

With coarse buckets, the p95 reads 757 against a true 578, because interpolation inside one wide bucket is a guess. Finer buckets near the values you care about give 586. The last line shows the worst case: when the true value lies above your top finite bucket, the estimate is stuck at that bound. An alert on "p95 above 500 ms" would never fire if your top bucket is 400.

:::trap High-cardinality labels
Do not put `call_id` or `user_id` as a metric label. Each distinct value creates a new time series, and this can bring down your metrics system. Labels should have a small number of values: region, model version, stage. Per-call detail goes in traces and logs.
:::

**Tracing** follows a single turn through every service. A **trace** is one turn or call, and a **span** is one timed operation in it, with a parent. Pass the trace ID in every call between services. OpenTelemetry is the open standard for this.

```python run=sp-c03-trace
# One turn's spans, in ms from the start of the trace. Example data.
spans = [("turn", 0, 812), ("vad.endpoint", 0, 262), ("asr.final", 262, 304), ("llm.first_token", 330, 495),
         ("llm.first_clause", 495, 548), ("tts.first_audio", 548, 671), ("network.downlink", 671, 712),
         ("client.buffer_and_play", 712, 812)]

total = spans[0][2]
scale = 50 / total
for name, start, end in spans:
    bar = " " * int(start * scale) + "#" * max(1, int((end - start) * scale))
    print(f"{name:24}{end - start:4} ms |{bar}")

children = sorted(spans[1:], key=lambda s: s[1])
gaps = [(a[0], b[0], b[1] - a[2]) for a, b in zip(children, children[1:]) if b[1] > a[2]]
print("untraced gaps:", gaps)
print("slowest stage:", max(children, key=lambda s: s[2] - s[1])[0])
```

This one turn took 812 ms, and endpointing is the largest stage, at 262 ms. The trace also shows something no per-stage metric would: there is a 26 ms gap between the ASR's result and the LLM call. Something there is not instrumented, perhaps prompt assembly or a retrieval step. Metrics tell you that p95 is bad, traces tell you where the time went in a bad turn, and logs tell you what happened.

Sample traces at a low rate overall, and keep all of the slow or failed ones when your tooling allows it. Be careful with transcripts and audio: they often hold personal data. Do not put them in spans by default, and set a retention policy.

## Drift and quality monitoring {#ch03-drift .th}

A model can get worse with no change to the code, because the world moved. **Data drift** is a change in the inputs: a new microphone, a new codec, a new language mix or a launch in a noisier setting. **Concept drift** is a change in the right answer: new product names, for example, that the ASR has never seen.

The hard part in speech is that true quality needs human labels, and those arrive late and are costly. So combine:

- **Input monitors**, available right now: SNR, speech ratio, call length, sample rate, codec, language mix.
- **Proxy quality**, also immediate: ASR confidence, no-speech rate, repeats ("sorry, what?"), barge-in rate, early hang-ups, task completion. Each can move for reasons unrelated to the model, so treat them as prompts to investigate.
- **Ground truth**, slower: sample calls every week, have them transcribed by people where consent allows, compute WER by slice, and compare with the baseline.

The **population stability index** (PSI) compares two distributions over buckets taken from the baseline: `PSI = sum((a - e) * ln(a / e))`, where `e` and `a` are the baseline and current fractions. A common rule of thumb reads below 0.1 as stable, 0.1 to 0.25 as a moderate shift and above 0.25 as a large one. Those thresholds are conventions, so check them against your own data.

```python run=sp-c03-psi
import numpy as np

rng = np.random.default_rng(21)
baseline = rng.normal(25, 5, 20000)                    # training-time SNR of calls, in dB
same = rng.normal(25, 5, 5000)
mild = rng.normal(23, 5.5, 5000)
noisy = 0.7 * rng.normal(25, 5, 5000)                  # a noisier mix of calls after a mobile app launch

edges = np.percentile(baseline, np.arange(10, 100, 10))

def bucket_fractions(x):
    idx = np.searchsorted(edges, x)
    return np.bincount(idx, minlength=10) / len(x)

def psi(expected, actual):
    e = np.clip(bucket_fractions(expected), 1e-4, None)
    a = np.clip(bucket_fractions(actual), 1e-4, None)
    return float(np.sum((a - e) * np.log(a / e)))

for name, x in (("same distribution", same), ("mild shift", mild), ("large shift", noisy)):
    print(f"{name:18} mean SNR {x.mean():5.1f} dB  PSI {psi(baseline, x):.3f}")
```

The same distribution gives 0.002. A 2 dB drop in mean SNR gives 0.148, and the larger drop gives 3.410. PSI only tells you that the inputs moved. Check whether quality moved too, since a shift in inputs does not always hurt. On the other hand, a problem affecting a small slice may not show in a global PSI, so compute it per region or device.

## Canary rollouts {#ch03-canary .th}

A new ASR, LLM or TTS version can pass offline tests and still hurt production. Roll out in steps:

1. **Shadow**. Send a copy of live audio to the new version, and discard the output. This catches crashes, latency issues and capacity problems, with no user risk. It cannot measure effects on the conversation.
2. **Canary**. Send a small share of new calls to the new version, and compare it with the current one over the same period. Pin the assignment per call: a voice must not change mid-call.
3. **Ramp up** through stages with guardrails: voice-to-voice p95, error rate, task success, and cost. Roll back automatically when a guardrail breaks.
4. Keep the previous version deployed for a while, because a model version rollback should take minutes.

The trap is declaring a small canary healthy when it was too small to detect anything.

```python run=sp-c03-canary
from math import sqrt

def z_score(fail_a, n_a, fail_b, n_b):
    p_a, p_b = fail_a / n_a, fail_b / n_b
    pooled = (fail_a + fail_b) / (n_a + n_b)
    se = sqrt(pooled * (1 - pooled) * (1 / n_a + 1 / n_b))
    return p_a, p_b, (p_b - p_a) / se

def calls_needed(p, lift, z_alpha=1.96, z_power=0.84):
    """Approximate calls per arm to detect a change from p to p + lift."""
    q = p + lift
    return (z_alpha + z_power) ** 2 * (p * (1 - p) + q * (1 - q)) / lift ** 2

print("control vs canary, failed calls")
for fail_a, n_a, fail_b, n_b in [(500, 10000, 7, 100), (500, 10000, 70, 1000), (5000, 100000, 700, 10000)]:
    p_a, p_b, z = z_score(fail_a, n_a, fail_b, n_b)
    print(f"  {p_a:.1%} of {n_a} vs {p_b:.1%} of {n_b}: z = {z:.2f}")
for lift in (0.02, 0.01, 0.005):
    print(f"to detect 5.0% -> {0.05 + lift:.1%}: about {calls_needed(0.05, lift):.0f} calls per arm")
```

With 100 canary calls, 7% failures against 5% gives z = 0.91, which is not distinguishable from chance. The same rates with 1000 calls give z = 2.72, above the usual 1.96. To detect 5% rising to 6% takes about 8146 calls per arm under the usual assumptions (5% significance, 80% power). So low-traffic stages can catch disasters, and only a larger share or a longer run can catch a one-point regression. Compare at the same time, as traffic mix changes during the day. Also, calls from one user are not independent, so real uncertainty is somewhat larger than this calculation suggests.

## Cost per minute {#ch03-cost .th}

Voice products are often priced per minute, so this is the number that the business watches, and you may be asked to estimate one on a whiteboard. Add up each component per minute of call. **All prices in this program are invented round numbers, chosen to show the arithmetic.**

```python run=sp-c03-cost
# All prices below are invented round numbers, to show the arithmetic. Use your own.
GPU_PER_HOUR = 2.00
STREAMS_PER_GPU = {"asr": 40, "tts": 15}
SPEAK_SHARE = {"asr": 1.0, "tts": 0.4}            # ASR hears the whole call; TTS speaks 40% of it
UTILISATION = 0.5                                 # share of paid GPU time doing useful work
TOKENS_PER_MINUTE_IN, TOKENS_PER_MINUTE_OUT = 4000, 80
LLM_IN, LLM_OUT = 0.50 / 1e6, 2.00 / 1e6
TURN_SHARE, TURN_KBPS, EGRESS_PER_GB = 0.15, 2 * 52, 0.08

def gpu_cost(kind, util):
    per_stream_hour = GPU_PER_HOUR / STREAMS_PER_GPU[kind] / util
    return per_stream_hour / 60 * SPEAK_SHARE[kind]

llm = TOKENS_PER_MINUTE_IN * LLM_IN + TOKENS_PER_MINUTE_OUT * LLM_OUT
turn = TURN_SHARE * TURN_KBPS * 60 / 8 / 1e6 * EGRESS_PER_GB

def report(util):
    parts = {"asr": gpu_cost("asr", util), "tts": gpu_cost("tts", util), "llm": llm, "turn relay": turn}
    print(f"utilisation {util:.0%}: " + ", ".join(f"{k} {v * 100:.3f}c" for k, v in parts.items())
          + f", total {sum(parts.values()) * 100:.3f}c per minute")

report(UTILISATION)
report(0.25)
report(0.8)
```

The formula for a GPU stage is `gpu_price_per_hour / streams_per_gpu / utilisation / 60 × share_of_call_active`. At 50% utilisation, the total here is 0.561 cents per minute. ASR and TTS each cost about the same even though the TTS is only active 40% of the time, because this example fits fewer streams on a GPU. Halving utilisation to 25% adds about 0.345 cents, while the LLM's part is unchanged, since it is priced per token here. TURN comes to about 0.001 cents per minute, which is not much at the assumed egress price.

Where the assumptions come from: **streams per GPU** comes from a load test at your latency target, and that number matters most. **Output tokens** follow speaking rate: at about 150 words per minute, about 1.3 tokens per word and 40% talk time, you get about 80. **Input tokens** grow with the conversation, since context is usually re-sent each turn, so prompt caching and context trimming matter for long calls. Also add what is missing here: telephony, CPU pods, storage, logging, and reserve capacity.

Utilisation is the cheapest place to look for savings, and it conflicts directly with latency: batching and running hot both raise it, and both reduce the margin for spikes. A good interview answer says this out loud.

## Drills {#ch03-drills .dr}

:::drill bug
Every commit triggers a 12-minute image rebuild and a multi-gigabyte push. Find the problem.

```dockerfile
FROM python:3.12-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "server.py"]
```
---
**Answer.** `COPY . /app` comes before the install, so any changed file invalidates the cache for `pip install`. Copy `requirements.txt`, install, and copy the code last.

**Why.** A layer's cache depends on its parents and inputs. Add a `.dockerignore` too. Without one, datasets and checkpoints in the folder go into the build context, and any change to them invalidates the copy.
:::

:::drill tricky
A Dockerfile has `RUN curl -o /tmp/model.bin ...`, then `RUN convert /tmp/model.bin /app/model.onnx`, then `RUN rm /tmp/model.bin`. Why is the image still huge?
---
**Answer.** Each `RUN` makes a layer, and the file lives on in the first layer. The `rm` only records a deletion in a later layer.

**Why.** Do it in one `RUN`, or use a multi-stage build that copies only `model.onnx` into the final image. Multi-stage is also safer for secrets, since a credential that was used in an earlier layer stays readable there.
:::

:::drill tricky
`torch.cuda.is_available()` is `False` inside the container, on a GPU machine. Walk through your debugging.
---
**Answer.** First run `nvidia-smi` inside the container. If that fails, the container did not get the GPU: check `--gpus` or the pod's GPU limit, plus the runtime and device plugin on the host. If it works, the image is the problem: a CPU-only framework build, or a CUDA version that this driver cannot support.

**Why.** The kernel driver comes from the host and the user-space libraries from the image. This single command separates those two cases. On Kubernetes, also check that the pod landed on a GPU node, and has the GPU in `limits`.
:::

:::drill concept
What is the difference between a readiness and a liveness probe? What should each check on a model server?
---
**Answer.** Readiness failure removes the pod from traffic. Liveness failure restarts it. Readiness: the model is loaded, warm-up is complete, it is not draining, and it is below session capacity. Liveness: the process's main loop is responding, and nothing more.

**Why.** Putting dependencies in liveness means that a brief outage elsewhere restarts your whole fleet, with minutes of cold start each. Use startup probes to cover loading.
:::

:::drill output
Work out the HPA's desired replicas for: 5 pods at 90 with target 60, 8 pods at 30 with target 60, 3 pods at 63 with target 60.

```python run=sp-c03-d-hpa
from math import ceil
print(ceil(5 * 90 / 60))
print(ceil(8 * 30 / 60))
print(ceil(3 * 63 / 60) if abs(63 / 60 - 1) > 0.1 else 3)
```
---
**Answer.** 8, 4 and 3.

**Why.** `ceil(5 * 1.5) = 8`, `ceil(8 * 0.5) = 4`. The third has a ratio of 1.05, within the default 10% tolerance, so nothing happens. Scale-down also waits on the stabilization window, so the second one takes effect after that.
:::

:::drill output
You need 600 concurrent sessions. A GPU handles 20 within your latency target, and you keep a 70% target for headroom. How many GPUs?

```python run=sp-c03-d-gpu
import math

sessions, per_gpu, target = 600, 20, 0.7
print(f"{sessions / per_gpu:.1f} GPUs at 100% utilisation")
print(f"{sessions / (per_gpu * target):.2f} GPUs at the 70% target")
print(math.ceil(sessions / (per_gpu * target)), "whole GPUs")
```
---
**Answer.** 43.

**Why.** The extra 13 are the price of headroom. Add more for a zone failure if you need to survive one. You may also be able to pay for less by reducing start time, as the autoscaler simulation shows.
:::

:::drill tricky
You scale from 4 to 8 pods during a spike, and latency on the old pods stays bad for 10 minutes. Why doesn't scaling help immediately?
---
**Answer.** Long-lived sessions stay where they are. New pods only take new sessions, and the existing load on old pods falls only as calls end. If new pods take minutes to become ready, this is worse.

**Why.** It is the reason to scale before saturation, and to use least-connections so that new sessions go to new pods. You can also stop new sessions going to hot pods, by failing their readiness at a session limit. Migrating a live stream is possible, and rarely worth doing.
:::

:::drill tricky
During every deployment, some calls drop at about 30 seconds after the rollout begins. What is the cause, and what is the fix?
---
**Answer.** Kubernetes sends SIGTERM to old pods, and kills them after `terminationGracePeriodSeconds`, which defaults to 30 s. Live calls die with them.

**Why.** On SIGTERM, fail readiness and drain. Set the grace period near the longest call you want to protect. Check that SIGTERM reaches your process: a shell-form `CMD` can swallow it. Rollouts get slower as a result, and that is usually worth it. A `maxSurge` setting lets new pods come up first.
:::

:::drill bug
The metrics system has run out of memory since this was added. Find the problem.

```python
TURN_LATENCY = Histogram("turn_latency_seconds", "...", ["call_id", "stage", "region"])
TURN_LATENCY.labels(call_id=call.id, stage="llm", region=REGION).observe(dt)
```
---
**Answer.** `call_id` has a new value for every call, and each value creates new time series for each bucket. Remove it.

**Why.** Keep labels low in cardinality, such as `stage`, `region` and `model_version`. Put per-call information in traces and logs, and link them with a trace ID, or with an exemplar if your stack supports that.
:::

:::drill tricky
GPU utilisation shows 40%, and latency is high and queues are growing. How can both be true?
---
**Answer.** The bottleneck is elsewhere, or the GPU is idle between batches. Candidates are a single-threaded CPU step such as decoding or feature extraction, a Python GIL bottleneck, a batcher that waits too long, or memory limits that cap concurrency.

**Why.** A GPU utilisation figure is the share of time that any kernel was running. It does not tell you about capacity. Look at the time spent in each step of the server, and use a profiler.
:::

:::drill tricky
WER on the weekly sample rose by 3 points, and there has been no deployment. How do you investigate?
---
**Answer.** Slice by device, region, language, codec and noise, and look for a slice that explains most of it. Check input monitors such as SNR and sample rate for a change at the same time. Check that it is a real change in the data: did the labelling or the sampling method change?

**Why.** Likely causes are a new client app with different audio processing, a new traffic source or new vocabulary. Also check for an upstream change that nobody told you about, such as a gain or resampling change. The fix may well be outside the model.
:::

:::drill output
A feature has two buckets. In the baseline they hold 50% and 50%, and now they hold 90% and 10%. Compute the PSI.

```python run=sp-c03-d-psi
import math
e, a = [0.5, 0.5], [0.9, 0.1]
print(round(sum((x - y) * math.log(x / y) for x, y in zip(a, e)), 3))
```
---
**Answer.** 0.879, far above the 0.25 rule of thumb for a large shift.

**Why.** `0.4 * ln(1.8) + (-0.4) * ln(0.2)`. Both terms are positive: each bucket's difference and its log ratio have the same sign. Empty buckets would make the log blow up, so implementations clip fractions to a small value.
:::

:::drill tricky
A canary ran on 1% of traffic for an hour, with no alerts. Your manager wants to ship it to everyone. What do you ask?
---
**Answer.** How many calls did it see, and what size of regression could that have detected? Were the guardrails compared against a control over the same time period? Were any metrics slow to show up, such as task success?

**Why.** In this chapter's numbers, 100 calls cannot tell 7% failures from 5%. An hour may also miss peak load and rare slices. Ramp up in steps, and treat "no alerts" as weak evidence at low traffic.
:::

:::drill output
A GPU costs 3 per hour (an invented price), handles 25 streams, and runs at 60% average utilisation. What is the cost per stream-minute?

```python run=sp-c03-d-cost
gpu = 3.0
streams = 25
util = 0.6
print(f"{gpu / streams / util / 60 * 100:.2f} cents per stream-minute")
print(f"{gpu / streams / 60 * 100:.2f} cents at full utilisation")
```
---
**Answer.** 0.33 cents, or 0.20 cents at full utilisation.

**Why.** `3 / 25 / 0.6 / 60`. Idle capacity gets billed too, so low utilisation directly inflates the cost per minute. That is the case for batching and for scaling down off-peak, and each one has a latency or a cold-start cost.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1400
Sessions must route to the same pod without a central directory, and adding a pod should move as few sessions as possible. Implement rendezvous hashing, measure how many move when a pod is added, and compare with `hash mod N`.
---
For each session, score every pod with a stable hash, and choose the top score. Adding a pod only moves sessions for which the new pod gets the top score. Use `hashlib`, since Python's built-in `hash()` for strings changes between processes.

```python run=sp-c03-c-hash
import hashlib

def score(pod, session):
    return hashlib.sha256(f"{pod}:{session}".encode()).hexdigest()

def owner(pods, session):
    """Rendezvous hashing: every session goes to the pod with the top score. Python's hash() would change between runs."""
    return max(pods, key=lambda p: score(p, session))

pods = [f"pod-{i}" for i in range(4)]
sessions = [f"call-{i}" for i in range(2000)]
before = {s: owner(pods, s) for s in sessions}
print("load:", [sum(v == p for v in before.values()) for p in pods])

after = {s: owner(pods + ["pod-4"], s) for s in sessions}
moved = sum(before[s] != after[s] for s in sessions)
print(f"add one pod: {moved / len(sessions):.1%} of sessions move, ideal is {1 / 5:.1%}")

mod = {s: int(score("", s), 16) % 4 for s in sessions}
mod5 = {s: int(score("", s), 16) % 5 for s in sessions}
print(f"simple modulo: {sum(mod[s] != mod5[s] for s in sessions) / len(sessions):.1%} move")
```

Rendezvous hashing moves 19.0% of sessions when going from 4 to 5 pods, close to the ideal 20%. Modulo moves 80.8%. Hashing still balances by count only, so a long-tailed session length can leave load uneven, and you would add a capacity check on top.
:::

:::drill code rating=1500
Simulate one GPU with dynamic batching. A batch of `k` takes `20 + 4k` ms, a batch holds up to 8, and a request may wait up to some maximum for others to join. Report mean batch size and latency at low and high load.
---
Work through requests in arrival order. A batch starts when it is full, or when the server is free and the first request has waited long enough.

```python run=sp-c03-c-batch
import random

def simulate(rate, max_wait, max_batch=8, base=20, per_item=4, seed=3, n=20000):
    """One GPU. A batch of k takes base + per_item * k ms. Rate is requests per ms."""
    rng = random.Random(seed)
    t, arrivals = 0.0, []
    for _ in range(n):
        t += rng.expovariate(rate)
        arrivals.append(t)
    free, i, latencies, batches = 0.0, 0, [], 0
    while i < n:
        deadline = max(free, arrivals[i] + max_wait)       # server free, and the first item has waited enough
        j = i
        while j < n and j - i < max_batch and arrivals[j] <= deadline:
            j += 1
        start = deadline if j - i < max_batch else max(free, arrivals[j - 1])   # a full batch goes at once
        end = start + base + per_item * (j - i)
        latencies += [end - a for a in arrivals[i:j]]
        free, i = end, j
        batches += 1
    latencies.sort()
    return n / batches, latencies[n // 2], latencies[int(n * .95)]

for rate in (0.02, 0.08):
    print(f"{rate * 1000:.0f} requests/s")
    for wait in (0, 5, 20, 50):
        size, p50, p95 = simulate(rate, wait)
        print(f"  max wait {wait:2} ms: mean batch {size:4.1f}, p50 {p50:5.1f} ms, p95 {p95:6.1f} ms")
```

Without batching, the server tops out at about 42 requests/s (one per 24 ms), so 80 requests/s is only possible with batching. Batches form on their own under load: with a wait of 0 at 80 requests/s, requests pile up while the GPU is busy, and the mean batch is 2.5. At 20 requests/s, a longer wait just adds latency: a 50 ms wait takes the p50 from 24 to 74 ms and only raises batch size to 2.0. So a small wait, adjusted to load, is usually better than a large fixed one.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Container: process, namespaces, cgroups, shared kernel. Image: stacked read-only layers. Least-changing content first. Deleting in a later layer does not shrink. Use exec-form `CMD`, so SIGTERM reaches you.
- GPU: kernel driver on the host, CUDA libraries in the image, a runtime toolkit between. Run `nvidia-smi` in the container first when debugging.
- Pod, Deployment, Service, Ingress, HPA. Service tracks ready pods only.
- Probes: readiness removes from traffic. Liveness restarts. Startup covers slow loading. Keep liveness local and cheap.
- Cold start: scheduling, image pull, weights, GPU load, warm-up. Cache to reduce. Warm up before reporting ready.
- Streaming load balancing: per-connection, least connections, new pods start empty. Scale-out does not move calls. Sticky state on the pod, durable history in a shared store. Drain on SIGTERM, and set the grace period for calls.
- HPA: `ceil(current * metric / target)`, 10% tolerance, 5-minute default scale-down window. Scale on active sessions and queue wait, and be wary of CPU on GPU services.
- Headroom and startup time trade off. Reducing cold start is often the cheaper safety.
- RED and USE. Counters, gauges, histograms. Aggregate histograms for a fleet p95. Bucket boundaries set its accuracy. No high-cardinality labels.
- Tracing: one trace per turn, one span per stage, propagate IDs, look for gaps. Treat transcripts as sensitive.
- Drift: inputs (PSI, SNR, codec), proxies (confidence, repeats, hang-ups), sampled human WER, by slice.
- Canary: shadow, small share per call, guardrails, automatic rollback. Check sample size before believing "no change".
- Cost per minute: `price / streams / utilisation / 60 × active share` per GPU stage, plus LLM tokens and bandwidth. Streams per GPU comes from load tests.
