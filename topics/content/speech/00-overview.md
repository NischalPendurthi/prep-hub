---
name: Real-time speech & serving
short: Speech
icon: SP
version: Toy simulations in Python 3.12 and NumPy 1.26, with synthetic audio
eyebrow: VAD · ASR · TTS · diarization · streaming · WebRTC · latency budgets · Docker · Kubernetes · monitoring
headline: How a <em>voice agent</em> hears, thinks and replies in under a second, and how you keep it running.
lede: Three chapters for students who know Python and basic deep learning and have not worked with speech. Chapter 1 explains the models and the audio underneath them, Chapter 2 explains streaming and the network, and Chapter 3 covers running it all in production. You build an energy VAD, a mel filterbank, a CTC decoder, a jitter buffer, a pipeline simulator and an autoscaler, and every output shown comes from running that code on synthetic data.
card: Audio basics, VAD and endpointing, CTC and WER, TTS, diarization and DER, latency budgets, streaming into TTS, jitter buffers, WebRTC with ICE, STUN and TURN, debugging audio, Docker, GPU containers, Kubernetes, autoscaling, drift, canaries and cost per minute.
cta: Start with audio and VAD|#ch01; Jump to latency budgets|#ch02; Serving and monitoring|#ch03
search: Search: hangover, CTC blank, jitter buffer, TURN, readiness probe, PSI…
---

:::hero Everything happens in 20 ms ticks
```python run=sp-home-hero
sample_rate, bytes_per_sample, frame_ms = 16000, 2, 20
samples = sample_rate * frame_ms // 1000
print("one frame:", samples, "samples,", samples * bytes_per_sample, "bytes")
print("one second:", sample_rate * bytes_per_sample, "bytes")
print("frames in an 800 ms budget:", 800 // frame_ms)
```

Voice systems run on a clock. Audio arrives as small frames, and each stage has to finish its share of the work before the next ones arrive. An 800 ms reply delay is only 40 of those ticks. Chapter 2 breaks that budget down, stage by stage.
:::

## What this guide covers

| Chapter | Topic | You build |
|---|---|---|
| [1](#ch01) | VAD, ASR, TTS and diarization | Log-mel features, energy VAD with hangover, CTC greedy decoding, WER, speaker clustering, DER |
| [2](#ch02) | Streaming inference, WebRTC and latency budgets | Per-stage budget, partial-result stabiliser, sentence chunker, discrete-event pipeline, jitter buffers, a small echo canceller, percentile checks |
| [3](#ch03) | Docker, Kubernetes and monitoring ML services | Layer-cache model, HPA formula, load balancer and autoscaler simulations, bucketed percentiles, PSI, canary statistics, cost per minute |

## Suggested plan

| Sessions | Read | Drill |
|---|---|---|
| 1 | Ch 1, audio to VAD | Change the VAD's hangover and threshold, and predict the segments before you run it |
| 2 | Ch 1, ASR to diarization | Decode CTC paths and compute WER by hand, then do all the drills |
| 3 | Ch 2, budget to jitter | Draw the pipeline from memory with a number on each stage |
| 4 | Ch 2, WebRTC to measuring | Talk through one-way audio out loud, then do all the drills |
| 5 | Ch 3, images to load balancing | Explain the three probes and a rolling update that does not drop calls |
| 6 | Ch 3, autoscaling to cost | Estimate a cost per minute on paper with your own assumptions, then do all the drills |

## How to use the drills

Answer each drill out loud before opening it, and include your reasoning. Interviewers in this area often start from a symptom, such as "the agent interrupts itself" or "latency grows during a call", and then ask what you would check first and why. Practise giving an ordered list of checks. For latency questions, write the stages down and add up the numbers, and say which ones you assumed. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## What is real and what is illustrative

Every block with an output below it was executed when the site was built, and the output is the real one. All audio is synthetic and made with NumPy, so VAD results here are cleaner than they would be on real recordings. The simulations are small models that show the shape of a trade-off, and their absolute numbers mean nothing outside the assumptions in the code.

**Latency budgets, service times, prices and capacities are example figures, chosen to make the arithmetic clear.** They are not benchmarks of any model, product or cloud. In an interview, say that you would measure them.

Dockerfiles, Kubernetes YAML, browser JavaScript and SDP samples cannot run in this site's build, so they appear as plain blocks with no output, and are labelled illustrative. Their syntax follows the real formats, and field names can change between versions, so check them against the documentation for your version. Model names such as Whisper, Silero VAD and pyannote.audio are given for orientation. Their details change, so check the current release before quoting specifics.

You should know Python and basic deep learning. TCP and UDP themselves are covered in the C++ guide's [networking chapter](../../guide/#ch08), and sampling and the FFT in the [signals guide](../signals-hw/#ch01).
