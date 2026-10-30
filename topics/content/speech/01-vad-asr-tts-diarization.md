---
title: VAD, ASR, TTS and diarization
part: Part A · Speech models
lede: A voice system is a chain of four model families, and each one fails in a way you can explain once you know the audio underneath. This chapter starts from samples and frames, builds a mel spectrogram, then writes an energy VAD with hangover, endpointing trade-offs, CTC decoding, WER, and speaker clustering with DER. All the audio is synthetic, generated with NumPy.
desc: sample rate, frames, mel spectrograms, energy and model VAD, endpointing, barge-in, CTC and attention ASR, WER, TTS with acoustic model and vocoder, speech-to-speech, speaker embeddings, DER
hours: 6
prereqs: Python, NumPy, basic deep learning. The Fourier transform helps; see the signals guide if it is rusty.
---

## Audio is a list of numbers {#ch01-audio .th}

A microphone produces a voltage, and an analog-to-digital converter measures it at a fixed rate. The result is a one-dimensional array of samples. Three numbers describe it.

- **Sample rate.** Measurements per second. Telephone audio uses 8 kHz, most ASR models expect 16 kHz, and WebRTC usually works at 48 kHz internally. The highest frequency a rate can represent is half of it, called the Nyquist frequency.
- **Bit depth.** Precision of each sample. 16-bit PCM stores integers from -32768 to 32767. Models usually take floats in [-1, 1].
- **Channels.** Speech pipelines nearly always use mono.

Speech energy sits mostly below 4 kHz, which is why 8 kHz telephony is understandable. Consonants such as "s" and "f" have energy above that, and they are hard to tell apart on a phone line.

A **frame** is a short slice of samples, typically 25 ms, taken every 10 ms (the **hop**). Speech changes quickly over time, but over about 25 ms its spectrum is close to steady, so analysis is done per frame. The frame count without padding is `1 + (N - frame) // hop`.

```python run=sp-c01-frames
import numpy as np

sr = 16000                                   # samples per second
t = np.arange(sr) / sr                       # one second of time stamps
x = 0.1 * np.sin(2 * np.pi * 440 * t)        # a quiet 440 Hz tone, floats in [-1, 1]
pcm = np.round(x * 32767).astype(np.int16)   # the form it takes on the wire or in a WAV file
print("samples", len(pcm), "bytes", pcm.nbytes, "kbit/s", pcm.nbytes * 8 / 1000)

frame, hop = int(0.025 * sr), int(0.010 * sr)
n_frames = 1 + (len(x) - frame) // hop
print("frame", frame, "samples, hop", hop, "samples, frames", n_frames)

# sample too slowly and a high tone folds down to a false low one
tone = np.sin(2 * np.pi * 9000 * t)          # 9 kHz is above the 8 kHz Nyquist limit
peak = np.argmax(np.abs(np.fft.rfft(tone)))  # bins are 1 Hz wide for a 1 s signal
print("9000 Hz sampled at 16 kHz appears at", int(peak), "Hz")
```

One second of 16 kHz, 16-bit mono is 32,000 bytes, or 256 kbit/s, and that is the figure to remember for raw PCM. The last line shows **aliasing**: a 9 kHz tone sampled at 16 kHz is indistinguishable from a 7 kHz tone. So a resampler must low-pass filter before it reduces the rate. The [signals guide](../signals-hw/#ch01) covers sampling and the FFT in more depth.

:::trap Upsampling does not add information
Audio from a phone call resampled from 8 kHz to 16 kHz has the right rate for a 16 kHz model, and it still has nothing above 4 kHz. A model trained on full-band audio can lose a lot of accuracy on it. Fix this with narrowband training data or augmentation, or with a model trained for telephony.
:::

## Mel spectrograms {#ch01-mel .th}

Most speech models take a **log-mel spectrogram**, a 2D array with one row per frame and one column per mel band. It takes four steps to compute.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 96" role="img" aria-label="Pipeline from waveform through windowed frames, power spectrum and mel filterbank to a log-mel spectrogram, with array shapes for one second of audio">
  <rect x="6" y="14" width="120" height="44" rx="6" class="d-box"/><text x="66" y="33" text-anchor="middle" class="t-small">waveform</text><text x="66" y="50" text-anchor="middle" class="t-mono">(16000,)</text>
  <rect x="150" y="14" width="124" height="44" rx="6" class="d-soft"/><text x="212" y="33" text-anchor="middle" class="t-small">frames × window</text><text x="212" y="50" text-anchor="middle" class="t-mono">(98, 400)</text>
  <rect x="298" y="14" width="124" height="44" rx="6" class="d-soft"/><text x="360" y="33" text-anchor="middle" class="t-small">power, |FFT|²</text><text x="360" y="50" text-anchor="middle" class="t-mono">(98, 257)</text>
  <rect x="446" y="14" width="124" height="44" rx="6" class="d-acc"/><text x="508" y="33" text-anchor="middle" class="t-small">mel filterbank</text><text x="508" y="50" text-anchor="middle" class="t-mono">(98, 40)</text>
  <rect x="594" y="14" width="120" height="44" rx="6" class="d-key"/><text x="654" y="33" text-anchor="middle" class="t-small">log</text><text x="654" y="50" text-anchor="middle" class="t-mono">(98, 40)</text>
  <path d="M126 36 L 150 36" class="d-line"/><path d="M274 36 L 298 36" class="d-line"/><path d="M422 36 L 446 36" class="d-line"/><path d="M570 36 L 594 36" class="d-line"/>
  <text x="360" y="84" text-anchor="middle" class="t-small">phase is discarded at the power step, which is why TTS needs a vocoder later</text>
</svg></div><figcaption><b>From samples to model input.</b> Shapes are for one second at 16 kHz, with 25 ms frames, 10 ms hop, a 512-point FFT and 40 mel bands. The program below computes the filterbank and the final shape.</figcaption></figure>

The **mel scale** is a warping of frequency that approximates how people hear pitch: differences at low frequency are easier to notice than the same differences at high frequency. One common formula is `mel = 2595 * log10(1 + f / 700)`. Filters are evenly spaced in mel, which makes them narrow at low frequency and wide at high frequency.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 170" role="img" aria-label="Ten triangular mel filters between 0 and 8 kHz. Filters are narrow and close together at low frequency and wide at high frequency.">
  <path d="M40.0 130 L 54.9 30 L 73.6 130 Z" class="d-soft"/> <path d="M54.9 130 L 73.6 30 L 97.1 130 Z" class="d-acc"/> <path d="M73.6 130 L 97.1 30 L 126.6 130 Z" class="d-key"/> <path d="M97.1 130 L 126.6 30 L 163.8 130 Z" class="d-soft"/> <path d="M126.6 130 L 163.8 30 L 210.6 130 Z" class="d-acc"/> <path d="M163.8 130 L 210.6 30 L 269.3 130 Z" class="d-key"/> <path d="M210.6 130 L 269.3 30 L 343.2 130 Z" class="d-soft"/> <path d="M269.3 130 L 343.2 30 L 436.2 130 Z" class="d-acc"/> <path d="M343.2 130 L 436.2 30 L 553.0 130 Z" class="d-key"/>
  <path d="M436.2 130 L 553.0 30 L 700.0 130 Z" class="d-soft"/> <path d="M40 130 L 700 130" class="d-line"/> <text x="40" y="148" text-anchor="middle" class="t-mono">0</text> <text x="122" y="148" text-anchor="middle" class="t-mono">1000</text> <text x="205" y="148" text-anchor="middle" class="t-mono">2000</text> <text x="370" y="148" text-anchor="middle" class="t-mono">4000</text> <text x="535" y="148" text-anchor="middle" class="t-mono">6000</text> <text x="700" y="148" text-anchor="middle" class="t-mono">8000</text>
  <text x="370" y="165" text-anchor="middle" class="t-small">frequency in Hz</text> <text x="40" y="20" class="t-small">weight 1 at each centre, 0 at the neighbouring centres</text>
</svg></div><figcaption><b>A mel filterbank with 10 filters at 16 kHz.</b> Drawn from the same formula as the program below. Each filter adds up the power in its triangle, so low frequencies keep fine detail and high frequencies are summarised coarsely.</figcaption></figure>

```python run=sp-c01-mel
import numpy as np

def hz_to_mel(f):
    return 2595 * np.log10(1 + f / 700)

def mel_to_hz(m):
    return 700 * (10 ** (m / 2595) - 1)

def mel_filterbank(n_mels, n_fft, sr):
    edges = mel_to_hz(np.linspace(0, hz_to_mel(sr / 2), n_mels + 2))   # evenly spaced in mel
    bins = np.fft.rfftfreq(n_fft, 1 / sr)
    fb = np.zeros((n_mels, len(bins)))
    for m in range(n_mels):
        lo, mid, hi = edges[m], edges[m + 1], edges[m + 2]
        rise = (bins - lo) / (mid - lo)
        fall = (hi - bins) / (hi - mid)
        fb[m] = np.clip(np.minimum(rise, fall), 0, None)               # a triangle
    return fb, edges

def log_mel(x, sr, fb, n_fft=512, frame=400, hop=160):
    window = np.hanning(frame)
    frames = np.stack([x[i:i + frame] * window for i in range(0, len(x) - frame + 1, hop)])
    power = np.abs(np.fft.rfft(frames, n_fft)) ** 2                    # phase is thrown away here
    return np.log(power @ fb.T + 1e-10)

sr = 16000
fb, edges = mel_filterbank(40, 512, sr)
print("filterbank shape", fb.shape)
print(f"width of filter 0:  {edges[2] - edges[0]:7.1f} Hz")
print(f"width of filter 39: {edges[41] - edges[39]:7.1f} Hz")

t = np.arange(sr) / sr
for f in (300, 1000, 3000, 6000):
    S = log_mel(np.sin(2 * np.pi * f * t), sr, fb)
    best = int(np.argmax(S.mean(axis=0)))
    print(f"{f:5} Hz tone: spectrogram {S.shape}, loudest mel bin {best:2}, centre {edges[best + 1]:7.1f} Hz")
```

The first filter is about 92 Hz wide and the last about 1006 Hz wide, and 257 FFT bins shrink to 40 numbers per frame. The tones land in the band nearest to them, so each centre frequency is close to its tone. The 1000 Hz tone lands on a band centred at 955 Hz, and a 6000 Hz tone's band is centred about 104 Hz away from it, since high bands are wide.

The **log** matches the way loudness is perceived and compresses a very wide range. It also turns a constant gain into a constant offset, which per-utterance or running normalisation can remove. Models usually use 40 to 128 mel bands. Whisper, an open-source ASR model, takes 25 ms frames with a 10 ms hop and either 80 or 128 bands, depending on the version.

:::tip What to say about MFCCs
MFCCs apply a DCT to the log-mel features to decorrelate them. That suited older GMM acoustic models, which assumed diagonal covariance. Neural networks handle correlated inputs well, so most modern models keep log-mel, or learn from the waveform directly.
:::

## Voice activity detection {#ch01-vad .th}

A **voice activity detector** (VAD) labels each frame speech or non-speech. It runs first in the chain, because it decides when the expensive models run and when a user's turn has started and ended.

The simplest VAD compares frame energy to a threshold, in dBFS (decibels relative to digital full scale, where 0 is the loudest possible signal). Speech has natural dips between syllables, so a bare threshold chops one utterance into pieces. Two additions help. **Hangover** keeps the VAD in the speech state for some frames after energy drops. **Minimum speech length** drops very short bursts such as clicks. The program below builds a signal from a harmonic buzz, noise and one click.

```python run=sp-c01-vad
import numpy as np

SR, FRAME = 16000, 320                      # 20 ms frames
rng = np.random.default_rng(7)

def voiced(n, f0=120):
    """A buzz of harmonics with a syllable-like 4 Hz envelope. It stands in for speech as far as energy goes."""
    t = np.arange(n) / SR
    wave = sum(np.sin(2 * np.pi * f0 * k * t) / k for k in range(1, 12))
    return 0.15 * wave * (0.5 + 0.5 * np.sin(2 * np.pi * 4 * t))

x = rng.normal(0, 0.003, 4 * SR)            # background noise
truth = [(0.50, 1.20), (1.35, 2.00), (3.00, 3.60)]
for start, end in truth:
    a, b = int(start * SR), int(end * SR)
    x[a:b] += voiced(b - a)
x[int(2.5 * SR):int(2.51 * SR)] += 0.5      # a 10 ms click

n = len(x) // FRAME
db = np.array([10 * np.log10(np.mean(x[i * FRAME:(i + 1) * FRAME] ** 2) + 1e-12) for i in range(n)])
print(f"noise frames about {np.median(db[:20]):.1f} dBFS, speech frames about {np.median(db[30:55]):.1f} dBFS")

def vad(db, on, hang=0, min_speech=1):
    segs, start, quiet = [], None, 0
    for i, level in enumerate(db):
        if level > on:
            quiet = 0
            if start is None:
                start = i
        elif start is not None:
            quiet += 1
            if quiet > hang:
                end = i - quiet + 1
                if end - start >= min_speech:
                    segs.append((start, end))
                start = None
    if start is not None:
        segs.append((start, len(db)))
    return segs

def show(name, segs):
    print(f"{name:26}", [(round(a * .02, 2), round(b * .02, 2)) for a, b in segs])

print(f"{'truth':26}", truth)
show("threshold only", vad(db, -35))
show("+ hangover 200 ms", vad(db, -35, hang=10))
show("+ min speech 60 ms", vad(db, -35, hang=10, min_speech=3))
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 170" role="img" aria-label="Timeline of detected speech segments for the truth and three VAD settings. Threshold only breaks speech into ten pieces and catches the click. Adding hangover joins the pieces. Adding a minimum speech length removes the click.">
  <text x="124" y="25" text-anchor="end" class="t-small">truth</text> <rect x="201.2" y="10" width="99.8" height="20" rx="2" class="d-key"/> <rect x="322.4" y="10" width="92.6" height="20" rx="2" class="d-key"/> <rect x="557.5" y="10" width="85.5" height="20" rx="2" class="d-key"/> <text x="124" y="57" text-anchor="end" class="t-small">threshold only</text> <rect x="201.2" y="42" width="22.8" height="20" rx="2" class="d-trap"/> <rect x="232.6" y="42" width="25.7" height="20" rx="2" class="d-trap"/> <rect x="266.8" y="42" width="28.5" height="20" rx="2" class="d-trap"/>
  <rect x="321.0" y="42" width="22.8" height="20" rx="2" class="d-trap"/> <rect x="352.3" y="42" width="28.5" height="20" rx="2" class="d-trap"/> <rect x="389.4" y="42" width="25.6" height="20" rx="2" class="d-trap"/> <rect x="486.2" y="42" width="2.9" height="20" rx="2" class="d-trap"/> <rect x="557.5" y="42" width="22.8" height="20" rx="2" class="d-trap"/> <rect x="588.9" y="42" width="25.6" height="20" rx="2" class="d-trap"/> <rect x="623.0" y="42" width="20.0" height="20" rx="2" class="d-trap"/> <text x="124" y="89" text-anchor="end" class="t-small">+ hangover</text>
  <rect x="201.2" y="74" width="213.8" height="20" rx="2" class="d-soft"/> <rect x="486.2" y="74" width="2.9" height="20" rx="2" class="d-soft"/> <rect x="557.5" y="74" width="85.5" height="20" rx="2" class="d-soft"/> <text x="124" y="121" text-anchor="end" class="t-small">+ min speech</text> <rect x="201.2" y="106" width="213.8" height="20" rx="2" class="d-acc"/> <rect x="557.5" y="106" width="85.5" height="20" rx="2" class="d-acc"/> <path d="M130 142 L 700 142" class="d-line"/> <text x="130" y="160" text-anchor="middle" class="t-mono">0 s</text>
  <text x="272" y="160" text-anchor="middle" class="t-mono">1 s</text> <text x="415" y="160" text-anchor="middle" class="t-mono">2 s</text> <text x="558" y="160" text-anchor="middle" class="t-mono">3 s</text> <text x="700" y="160" text-anchor="middle" class="t-mono">4 s</text>
</svg></div><figcaption><b>The segments printed by the program above.</b> Hangover joins the pieces of one utterance and also bridges the 150 ms pause in the truth. The minimum length removes the 10 ms click.</figcaption></figure>

The bare threshold produces 10 segments, including the click at 2.5 s. Hangover joins each utterance's pieces, and also joins the two true segments across their 150 ms gap, which is usually what you want for a short pause within a sentence. The minimum length then removes the click. The printed end times exclude the hangover. A live system only knows a segment has ended 200 ms after the last loud frame, so this smoothing adds latency to every end-of-speech decision.

A fixed threshold fails when the noise level changes. Here a fan switches on at 4 s, about 24 dB louder than the earlier noise. The second detector estimates the noise floor as the quietest frame in the last second.

```python run=sp-c01-vad-noise
import numpy as np

SR, FRAME = 16000, 320
rng = np.random.default_rng(11)
x = rng.normal(0, 0.003, 8 * SR)
x[4 * SR:] += rng.normal(0, 0.05, 4 * SR)            # a fan switches on at t = 4 s
t = np.arange(int(0.6 * SR)) / SR
burst = 0.4 * sum(np.sin(2 * np.pi * 120 * k * t) / k for k in range(1, 12))
for start in (1.0, 2.5, 5.5, 7.0):
    x[int(start * SR):int(start * SR) + len(burst)] += burst
n = len(x) // FRAME
db = np.array([10 * np.log10(np.mean(x[i * FRAME:(i + 1) * FRAME] ** 2) + 1e-12) for i in range(n)])
speech = np.zeros(n, bool)
for start in (1.0, 2.5, 5.5, 7.0):
    speech[int(start / .02):int((start + .6) / .02)] = True

fixed = db > -35

WINDOW = 50                                          # 1 s of frames, longer than any one burst here
adaptive = np.zeros(n, bool)
for i in range(n):
    floor = db[max(0, i - WINDOW):i + 1].min()       # noise estimate: the quietest recent frame
    adaptive[i] = db[i] > floor + 10

before, after = np.arange(n) < 200, np.arange(n) >= 200
for name, d in (("fixed -35 dBFS", fixed), ("adaptive floor", adaptive)):
    print(f"{name:15} speech caught {d[speech].mean():.2f}  noise flagged before fan {d[~speech & before].mean():.2f}"
          f"  after fan {d[~speech & after].mean():.2f}")
first_bad = np.flatnonzero(adaptive & ~speech & after)
print(f"adaptive false alarms after the fan: {len(first_bad)} frames, last at {first_bad.max() * .02:.2f} s")
```

The fixed threshold labels every frame after the fan starts as speech. The adaptive one recovers once the noise has filled its window: it has 50 false-alarm frames, which is exactly its one second of memory, and the last one is at 4.98 s. Adaptive floors still fail on noise that looks like speech. A television or nearby conversation has the same energy pattern as your user.

**Model-based VADs** address this. A small neural network, or a Gaussian mixture model on band energies in older systems, takes spectral features for each short frame and outputs a speech probability. Silero VAD is a commonly used open-source example, and the WebRTC project includes a classic GMM-based one. They reject many kinds of noise and music better than energy does. They cost more CPU per stream, and are usually small enough to run on a CPU. Even a model VAD needs the same smoothing: probability thresholds, usually with separate start and stop values, plus hangover and minimum duration.

## Endpointing and turn-taking {#ch01-endpoint .th}

**Endpointing** decides that the user has finished. The basic rule is a silence timeout: declare the end of a turn after `T` ms without speech. This one number is a direct trade-off. A short `T` cuts people off when they pause to think, and a long `T` adds `T` to the response time of every turn. The toy below draws pause lengths from a made-up distribution. Real numbers depend on your users and on the task.

```python run=sp-c01-endpoint
import random

rng = random.Random(3)
utterances = []
for _ in range(5000):
    n_pauses = rng.randint(0, 4)
    utterances.append([rng.lognormvariate(5.5, 0.6) for _ in range(n_pauses)])   # median about 245 ms

print("timeout  cut too early  latency added to every turn")
for timeout in (200, 300, 500, 700, 1000):
    cut = sum(any(p > timeout for p in u) for u in utterances) / len(utterances)
    print(f"{timeout:5} ms {cut:12.1%} {timeout:12} ms")
```

Under this synthetic model, moving from 700 ms to 300 ms saves 400 ms on every turn and raises the share of cut-off utterances from about 7% to about 51%. People pause longer when reading out a card number than when saying "yes", so a single number rarely suits a whole conversation.

Common refinements:

- **Semantic endpointing.** Use the partial transcript or a small classifier. "My number is nine eight seven" probably has more coming, while "yes, that works" probably does not. Shorten or lengthen `T` accordingly.
- **Prosody.** Falling pitch tends to mark the end of a statement. Some turn detection models work directly on audio for this reason.
- **Speculative responses.** Start the LLM at a short silence, and discard the result if the user keeps talking. This spends compute to save latency.
- **Recovery.** If speech resumes soon after a cut, merge it with the previous turn and restart the response. Do not treat it as a new turn.

**Barge-in** means the user interrupts while the agent is speaking. A good implementation does the following:

1. Detects speech on the microphone channel during playback. Echo cancellation must remove the agent's own voice first, or the agent interrupts itself.
2. Confirms it is real speech, with a short minimum duration or a check that the partial transcript has words, so that a cough or an "uh-huh" does not stop the reply.
3. Stops everything downstream: client playback buffers, queued TTS and the LLM stream.
4. Records what the user actually heard, and truncates the assistant's message in the conversation history to that point. Otherwise the LLM believes it said things the user never heard.

:::trap Text generated is not text heard
The LLM may have produced three sentences while the user heard one and a half. If the context keeps all three, the next reply can refer to things the user never heard. Track playback position and map it back to text, ideally with the word timestamps that the TTS gives you.
:::

## ASR: from frames to text {#ch01-asr .th}

An **automatic speech recognition** model maps a sequence of feature frames to a shorter sequence of words. The hard part is alignment: you know the transcript for a training clip, and you do not know which frames belong to which letters. Three designs deal with this.

| Design | How it aligns | Streaming | Notes |
|---|---|---|---|
| **CTC** | Sums over all valid frame-to-label alignments | Natural, with a limited-context encoder | Simple and fast. Each frame's output is independent of the previous outputs, given the encoder |
| **Attention encoder-decoder** | The decoder attends over encoder frames while emitting tokens | Harder, since attention wants the whole clip | Good accuracy on clips. Whisper has this design, on 30 s windows |
| **Transducer (RNN-T)** | Encoder plus a prediction network over earlier outputs | Natural, emits frame by frame | Common in on-device and streaming systems. Fixes CTC's independence assumption |

### CTC {#ch01-ctc}

**CTC** adds a special **blank** symbol. The network outputs a distribution over labels plus blank for each frame. To turn a frame path into text, first **collapse repeated symbols, then remove blanks**. The blank serves two purposes: it lets the model say "nothing new here" during silence or a long sound, and it separates true double letters. The order of those two steps matters.

```python run=sp-c01-ctc
import numpy as np

SYMBOLS = "-helo"           # index 0 is the CTC blank
path = "hh-ee-ll-l-oo--"    # the best label for each of 15 frames
rng = np.random.default_rng(0)
probs = np.full((len(path), len(SYMBOLS)), 0.02) + rng.random((len(path), len(SYMBOLS))) * 0.05
for t, ch in enumerate(path):
    probs[t, SYMBOLS.index(ch)] = 0.9
probs /= probs.sum(axis=1, keepdims=True)

def ctc_greedy(probs):
    best = probs.argmax(axis=1)
    out, prev = [], None
    for s in best.tolist():
        if s != prev and s != 0:     # collapse repeats first, and blanks separate real repeats
            out.append(SYMBOLS[s])
        prev = s
    return "".join(out)

print("frame labels:", "".join(SYMBOLS[i] for i in probs.argmax(axis=1).tolist()))
print("CTC greedy:  ", ctc_greedy(probs))
print("no blanks:   ", "".join(ch for i, ch in enumerate("hheelllloo") if i == 0 or ch != "hheelllloo"[i - 1]))
```

Without a blank, frames reading `hheelllloo` always collapse to `helo`. No path can produce a double `l`. The blank between `ll` and `l` in the frame labels is what gives `hello`.

Training needs no alignment. The CTC loss is the negative log of the **sum of probabilities of all paths** that collapse to the target. It is computed in `O(T × L)` by a forward dynamic programme, in the same style as an HMM's forward algorithm, using log probabilities to avoid underflow. That sum is also why greedy decoding is only an approximation. Greedy finds the most probable path, while the text you want is the one with the largest total over its paths.

```python run=sp-c01-ctc-sum
from itertools import product

SYMBOLS = "-a"
P = [{"-": 0.6, "a": 0.4}, {"-": 0.6, "a": 0.4}]   # two frames

def collapse(path):
    out, prev = [], None
    for s in path:
        if s != prev and s != "-":
            out.append(s)
        prev = s
    return "".join(out)

totals = {}
for path in product(SYMBOLS, repeat=len(P)):
    p = 1.0
    for t, s in enumerate(path):
        p *= P[t][s]
    print("".join(path), f"p={p:.2f}", "->", repr(collapse(path)))
    totals[collapse(path)] = totals.get(collapse(path), 0) + p
print("total by text:", {k: round(v, 2) for k, v in sorted(totals.items())})
```

The best single path is `--` with 0.36, so greedy outputs an empty string. Yet the text `a` has total probability 0.64, split across three paths. **Prefix beam search** merges paths that share a text, and can also add a language model score, which is how CTC systems use word-level knowledge such as "their" versus "there".

### Attention and streaming {#ch01-attention}

An attention model has an encoder over frames and a decoder that emits one token at a time, attending over the encoder output. It learns a language model implicitly and needs no blank. Its costs are a slower, sequential decoder and a soft alignment that can repeat or skip words on long or silent audio. In practice, long files are cut into chunks. Whisper's window is 30 seconds, which is why using it for live transcripts needs extra machinery: re-running on a growing buffer, and handling text that changes between runs. Chapter 2 covers partials.

### WER {#ch01-wer}

**Word error rate** is the word-level edit distance between reference and hypothesis, divided by the number of **reference** words: `WER = (S + D + I) / N`.

```python run=sp-c01-wer
def align(ref, hyp):
    """Levenshtein on word lists, with counts of each error type from the backtrace."""
    n, m = len(ref), len(hyp)
    d = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        d[i][0] = i
    for j in range(m + 1):
        d[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            d[i][j] = min(d[i - 1][j - 1] + (ref[i - 1] != hyp[j - 1]), d[i - 1][j] + 1, d[i][j - 1] + 1)
    i, j, S, D, I = n, m, 0, 0, 0
    while i or j:
        if i and j and d[i][j] == d[i - 1][j - 1] + (ref[i - 1] != hyp[j - 1]):
            S += ref[i - 1] != hyp[j - 1]
            i, j = i - 1, j - 1
        elif i and d[i][j] == d[i - 1][j] + 1:
            D, i = D + 1, i - 1
        else:
            I, j = I + 1, j - 1
    return S, D, I

def wer(ref, hyp):
    r, h = ref.split(), hyp.split()
    S, D, I = align(r, h)
    return S, D, I, (S + D + I) / len(r)

for ref, hyp in [("turn the volume down please", "turn volume down to please"),
                 ("book a table for two", "book a table for two"),
                 ("call me at twenty five past", "call me at 25 past"),
                 ("hi", "oh hi there friend"),
                 ("oh hi there friend", "hi")]:
    S, D, I, w = wer(ref, hyp)
    print(f"S={S} D={D} I={I} WER={w:.2f}  ref={ref!r} hyp={hyp!r}")
```

Read these results closely, since each holds an interview point. The fourth case has a WER of 3.00: with only one reference word, three insertions make it 300%, so WER is **not bounded by 100%**. The last two cases swap the reference and hypothesis and give 3.00 and 0.75, so it is **not symmetric**. The third case counts `25` as one substitution plus one deletion against `twenty five`, even though a person reads them the same way. So normalise text before scoring: case, punctuation, numbers and dates. Report which normalisation you used, since two WER numbers with different normalisation are not comparable.

:::key WER is a proxy
A voice agent can have a low WER and still fail if it misses the digits of an order number. Track accuracy on the things that matter, such as entities, numbers and names, plus task success. Also slice WER by accent, noise level and device, since an overall average can hide a group that fails badly.
:::

## TTS: from text to waveform {#ch01-tts .th}

A classic **text-to-speech** pipeline has three stages.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 112" role="img" aria-label="TTS pipeline: text, text normalisation and phonemes, acoustic model, mel spectrogram, vocoder, waveform">
  <rect x="6" y="20" width="66" height="40" rx="6" class="d-box"/><text x="39" y="44" text-anchor="middle" class="t-small">text</text>
  <rect x="96" y="20" width="146" height="40" rx="6" class="d-soft"/><text x="169" y="37" text-anchor="middle" class="t-small">normalise, phonemes</text><text x="169" y="52" text-anchor="middle" class="t-mono">"$5" → five dollars</text>
  <rect x="266" y="20" width="118" height="40" rx="6" class="d-acc"/><text x="325" y="37" text-anchor="middle" class="t-small">acoustic model</text><text x="325" y="52" text-anchor="middle" class="t-mono">symbols → mel</text>
  <rect x="408" y="20" width="118" height="40" rx="6" class="d-acc"/><text x="467" y="37" text-anchor="middle" class="t-small">vocoder</text><text x="467" y="52" text-anchor="middle" class="t-mono">mel → samples</text>
  <rect x="550" y="20" width="164" height="40" rx="6" class="d-key"/><text x="632" y="37" text-anchor="middle" class="t-small">waveform</text><text x="632" y="52" text-anchor="middle" class="t-mono">sent in chunks</text>
  <path d="M72 40 L 96 40" class="d-line"/><path d="M242 40 L 266 40" class="d-line"/><path d="M384 40 L 408 40" class="d-line"/><path d="M526 40 L 550 40" class="d-line"/>
  <text x="325" y="90" text-anchor="middle" class="t-small">Tacotron 2, FastSpeech 2</text><text x="467" y="90" text-anchor="middle" class="t-small">WaveNet, HiFi-GAN</text>
</svg></div><figcaption><b>The classic TTS pipeline.</b> End-to-end models such as VITS train the acoustic and vocoder parts together, and the same stages still exist inside them.</figcaption></figure>

**Text normalisation** expands numbers, dates, currency and abbreviations, then **grapheme-to-phoneme** conversion turns words into sounds. A lot of real-world TTS bugs live here: "Dr." as doctor or drive, "1/2" as a date or a half, a phone number read as a very large number.

The **acoustic model** predicts a mel spectrogram. Tacotron 2 uses attention, and FastSpeech 2 predicts each phoneme's duration, then generates in parallel, which is faster and avoids attention failures. Non-autoregressive models produce a whole phrase in one pass, which is good for throughput, but they need enough text at once to get the intonation right. That is why voice agents send whole clauses or sentences to TTS.

The **vocoder** turns mel frames into samples. The mel spectrogram has no phase, and fine detail was lost in the filterbank, so the vocoder has to produce a plausible waveform. The program below shows why phase matters: two signals with identical magnitude spectra look very different as waveforms.

```python run=sp-c01-phase
import numpy as np

sr, n = 16000, 1600
t = np.arange(n) / sr
rng = np.random.default_rng(1)
freqs = [200 * k for k in range(1, 21)]              # 20 harmonics of 200 Hz, 100 ms long
a = sum(np.cos(2 * np.pi * f * t) for f in freqs)
b = sum(np.cos(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi)) for f in freqs)

Ma, Mb = np.abs(np.fft.rfft(a)), np.abs(np.fft.rfft(b))
print(f"largest magnitude difference {np.max(np.abs(Ma - Mb)):.3f} out of peak {Ma.max():.1f}")
print(f"largest sample difference    {np.max(np.abs(a - b)):.3f}")
print(f"peak of a {np.max(np.abs(a)):.2f}, peak of b {np.max(np.abs(b)):.2f}")
```

The magnitudes match, and the waveforms differ by up to 22.5 with a peak nearly twice as high in one of them. Griffin-Lim recovers phase with an iterative method, with audible artefacts. Neural vocoders learn the mapping. WaveNet generates one sample at a time and is slow, and GAN vocoders such as HiFi-GAN generate many samples in parallel, often faster than real time on a CPU or GPU.

Two numbers describe TTS in production. **Real-time factor** (RTF) is synthesis time divided by audio duration, so RTF below 1 is needed to keep up. **Time to first audio** matters more for an agent, since a reply that starts quickly feels responsive even if the full clip takes longer.

:::trap RTF below 1 is necessary and not sufficient
An RTF of 0.2 on a 10 s reply means 2 s of work. If the engine only returns audio when it finishes, the user waits 2 s in silence. You need chunked output, and you need to send text in small units. Chapter 2 does the arithmetic.
:::

### Speech-to-speech models {#ch01-s2s}

A **speech-to-speech** model takes audio in and generates audio out, without separate ASR, LLM and TTS stages. It can hear tone and hesitation, it can respond with matching prosody, and it avoids some delays between stages.

| | ASR + LLM + TTS pipeline | Speech-to-speech model |
|---|---|---|
| Latency | Sum of stages and handoffs | Potentially lower, since audio flows through one model |
| Tone and emotion | Mostly lost in the transcript | Can be used and produced |
| Swapping parts | Pick the best model per stage | One model, one voice set |
| Debugging | Inspect text between each stage | Harder; there may be no transcript to read |
| Control | Text guardrails, exact phrasing and pronunciation | Harder to force exact wording |
| Cost and tools | Mature tool calling, per-stage cost | Depends on the model; audio tokens can cost more |

An interview answer should name the trade: pipelines are easier to debug, to constrain and to evaluate, and speech-to-speech has a shorter path and keeps more of the signal. Many teams pair them, for example a speech-to-speech model plus a separate ASR for logs and safety checks.

## Diarization: who spoke when {#ch01-diar .th}

**Diarization** splits audio by speaker without knowing who the speakers are in advance. A typical offline system works like this:

1. **Segment** with VAD, and cut speech into short windows, often 1 to 2 seconds.
2. **Embed** each window into a fixed-size **speaker embedding**, a vector where the same speaker's windows land close together. x-vectors and ECAPA-TDNN are the well-known architectures. They are trained on speaker classification, and the classifier is thrown away after training.
3. **Cluster** the vectors, using cosine similarity. Agglomerative hierarchical clustering (AHC) and spectral clustering are common. The number of speakers is usually unknown, so AHC stops at a similarity threshold.
4. **Refine** boundaries and handle overlap. End-to-end models and open-source toolkits such as pyannote.audio use neural segmentation for this.

The program uses synthetic vectors in place of real embeddings: three speaker centres with noise added. A real system's clusters would overlap more.

```python run=sp-c01-diar
import numpy as np

rng = np.random.default_rng(42)
DIM, SPEAKERS, SEGS = 32, 3, 30
centres = rng.normal(size=(SPEAKERS, DIM))
labels = rng.integers(0, SPEAKERS, SEGS)
emb = centres[labels] + rng.normal(0, 0.45, (SEGS, DIM))           # one noisy vector per segment
emb /= np.linalg.norm(emb, axis=1, keepdims=True)
sim = emb @ emb.T

same = sim[labels[:, None] == labels[None, :]]
same = same[same < 0.999]                                          # drop self-similarity
diff = sim[labels[:, None] != labels[None, :]]
print(f"cosine, same speaker: mean {same.mean():.2f} min {same.min():.2f}")
print(f"cosine, different:    mean {diff.mean():.2f} max {diff.max():.2f}")

def ahc(sim, threshold):
    """Average-linkage agglomerative clustering: merge the closest pair until none is above threshold."""
    clusters = [[i] for i in range(len(sim))]
    while len(clusters) > 1:
        best, pair = -2.0, None
        for i in range(len(clusters)):
            for j in range(i + 1, len(clusters)):
                s = sim[np.ix_(clusters[i], clusters[j])].mean()
                if s > best:
                    best, pair = s, (i, j)
        if best < threshold:
            break
        i, j = pair
        clusters[i] += clusters.pop(j)
    return clusters

for threshold in (0.95, 0.5, 0.2, -0.5):
    clusters = ahc(sim, threshold)
    pure = sum(np.bincount(labels[c], minlength=SPEAKERS).max() for c in clusters) / SEGS
    print(f"threshold {threshold:5.2f}: {len(clusters):2} clusters, purity {pure:.2f}")
```

Between thresholds of 0.5 and 0.2 this gives the right answer, 3 clusters with purity 1.00, because the worst same-speaker similarity (0.59) is above the best different-speaker one (0.35). A threshold of 0.95 merges nothing, and -0.5 merges everything. On real audio the two distributions overlap, and the threshold is tuned on labelled data from similar audio. Channel changes, for example a speaker switching to a headset, can make one person's vectors look like two people.

**Diarization error rate** (DER) measures the fraction of reference speech time that was wrongly labelled: `DER = (miss + false alarm + confusion) / total reference speech`. Cluster names are arbitrary, so scoring first finds the mapping from hypothesis clusters to reference speakers that gives the lowest confusion.

```python run=sp-c01-der
from itertools import permutations

# one label per 100 ms frame; "." is silence
ref = "AAAAAAAAAA....BBBBBBBBBB..AAAAAABBBBBB"
hyp = "xxxxxxxx......yyyyyyyyxxx.xxxxxxyyyyyy"

def der(ref, hyp):
    rs = sorted(set(ref) - {"."})
    hs = sorted(set(hyp) - {"."})
    speech = sum(r != "." for r in ref)
    miss = sum(r != "." and h == "." for r, h in zip(ref, hyp))
    fa = sum(r == "." and h != "." for r, h in zip(ref, hyp))
    best = None
    for perm in permutations(rs, len(hs)):                 # try every way of naming clusters
        mapping = dict(zip(hs, perm))
        conf = sum(r != "." and h != "." and mapping[h] != r for r, h in zip(ref, hyp))
        if best is None or conf < best[0]:
            best = (conf, mapping)
    conf, mapping = best
    return speech, miss, fa, conf, mapping

speech, miss, fa, conf, mapping = der(ref, hyp)
print("reference speech frames", speech)
print("best mapping", mapping)
print(f"miss {miss}  false alarm {fa}  confusion {conf}  DER {(miss + fa + conf) / speech:.3f}")

_, _, _, conf_bad, _ = der(ref, hyp.replace("x", "#").replace("y", "x").replace("#", "y"))
print("swapping the cluster names changes confusion?", conf_bad != conf)
```

Here 2 speech frames were missed, 1 silent frame was labelled as speech and 2 frames had the wrong speaker, which gives 5 / 32 = 0.156. Because of the best-mapping step, swapping the names of the clusters changes nothing. Scoring often allows a collar around each boundary, commonly 0.25 s, so compare DERs only with the same collar and overlap rules. False alarms can push DER over 1, the same way insertions do for WER.

**Streaming diarization** is harder, since an online system must label a speaker before it has heard the whole conversation, and it cannot go back and revise easily. The usual approach compares each new embedding to running centroids, as the coding drill below does. A call with one user and one agent is often easier still: if the two come in on separate channels, you may not need diarization at all.

## Drills {#ch01-drills .dr}

:::drill concept
Your 16 kHz ASR model does badly on phone calls, though the audio has been resampled to 16 kHz. Why, and what do you do?
---
**Answer.** Telephone audio has nothing above 4 kHz, and upsampling cannot restore it. The model was trained on full-band speech, so its inputs now look different. Codec artefacts from the phone network add more mismatch.

**Why.** Fix it by training or fine-tuning on narrowband audio, by augmenting training data through a telephony codec simulation, or by using a telephony-specific model. Check by slicing WER by source.
:::

:::drill output
How many frames from one second at 16 kHz, with a 25 ms frame and a 10 ms hop? Work it out, both without padding and with `center=True`-style padding, where frames are centred on hop positions.

```python run=sp-c01-d-frames
n, frame, hop = 16000, 400, 160
print("no padding:", 1 + (n - frame) // hop)
print("centre padding:", 1 + n // hop)
```
---
**Answer.** 98 and 101.

**Why.** Without padding: `1 + (16000 - 400) // 160 = 98`. With centring, half a frame of padding on each side gives `1 + 16000 // 160 = 101`. Different libraries have different defaults, and that is a common cause of off-by-one shape errors when porting feature code.
:::

:::drill tricky
The VAD works well in the office, and it stays "speech" constantly in a car. Energy VAD with a fixed threshold. What is going on, and name two fixes.
---
**Answer.** Road noise is above the threshold, so every frame looks like speech. The turn never ends, and the agent never replies.

**Why.** Fix one: track the noise floor and threshold relative to it. Fix two: use a model-based VAD trained on noisy speech. Also add a maximum turn length as a safety limit, so a stuck VAD cannot hang a call. Logging the noise floor per call helps you to spot this in production.
:::

:::drill bug
This energy VAD reports silence for nearly everything, including loud speech. Find the bug.

```python
def is_speech(frame, threshold=1e-4):
    return abs(np.mean(frame)) > threshold
```
---
**Answer.** It takes the mean of the signal instead of the mean of its square. Audio swings around zero, so the mean is close to zero however loud it is. Use `np.mean(frame ** 2)`.

**Why.** A DC offset from cheap hardware would also make this code report speech constantly when the mic is quiet, which makes the bug look intermittent. Remove DC first with a high-pass filter or by subtracting the mean.
:::

:::drill tricky
A product manager asks you to reduce the silence timeout from 700 ms to 300 ms to make replies faster. What do you say?
---
**Answer.** You gain 400 ms on every turn, and more users will be cut off mid-sentence. In this chapter's toy model the cut-off share rises from about 7% to about 51%. Measure this on real pauses before you commit.

**Why.** A cut-off costs more than the latency it saves: the reply is wrong, the user repeats, and the turn takes much longer. Better options: make the timeout depend on the partial transcript, start the LLM speculatively at 300 ms and commit at 700 ms, or find the saving in other stages.
:::

:::drill output
A CTC model outputs these label ids for 11 frames, where 0 is blank. What is the decoded sequence?

```python run=sp-c01-d-ctc
ids = [0, 3, 3, 0, 3, 1, 1, 0, 0, 2, 0]
out, prev = [], None
for s in ids:
    if s != prev and s != 0:
        out.append(s)
    prev = s
print(out)
```
---
**Answer.** `[3, 3, 1, 2]`.

**Why.** Consecutive repeats collapse first, so `3 3` becomes one `3`. The blank before the next `3` keeps it separate. The two `1`s collapse, and blanks disappear. A blank between identical labels is the only way to output a double.
:::

:::drill bug
This CTC decoder outputs `helo` for frame labels `hh-ee-ll-l-oo--`. Find the bug.

```python
def decode(labels):
    no_blank = [c for c in labels if c != "-"]
    out = []
    for c in no_blank:
        if not out or out[-1] != c:
            out.append(c)
    return "".join(out)
```
---
**Answer.** It removes blanks before collapsing repeats, so the two groups of `l` become adjacent and merge. Collapse first, then remove blanks.

**Why.** The blank's job is to separate a true double letter. Removing it first destroys the only signal that the letter was doubled.
:::

:::drill concept
Compare CTC, attention and transducer models for a live voice agent. Which do you pick, and why?
---
**Answer.** A CTC or transducer model with a limited-context encoder suits live partials, since each one emits as frames arrive. An attention model on chunks is more accurate on clips, and it adds delay and revisions when used for streaming.

**Why.** Transducers condition on previous outputs, so they drop CTC's independence assumption and usually need less help from an external language model. Mention the follow-up: encoder look-ahead sets a lower bound on latency, since the model must wait for its future context.
:::

:::drill tricky
Model A has 5% WER and model B has 8%. Is A better for a booking agent?
---
**Answer.** Not necessarily. Check where the errors fall, how text was normalised, the latency of each, and whether both were tested on the same audio.

**Why.** B could be more accurate on digits and names, which decide whether the task succeeds, while A could do better on filler words. Also check that the test set resembles your traffic. A difference of 3 points on a small test set can be noise, so look at confidence intervals, and slices by accent and noise.
:::

:::drill output
A TTS engine takes 0.8 s to synthesise 4 s of audio at 22.05 kHz with hop 256. Find the RTF, the time per mel frame, and the number of frames.

```python run=sp-c01-d-rtf
seconds_of_audio = 4.0
synth_seconds = 0.8
print("RTF", synth_seconds / seconds_of_audio)
hop, sr = 256, 22050
print(f"mel frame = {1000 * hop / sr:.1f} ms, frames in 4 s = {int(seconds_of_audio * sr / hop)}")
print("samples per mel frame the vocoder must produce:", hop)
```
---
**Answer.** RTF 0.2, 11.6 ms per frame, 344 frames, with 256 samples per frame from the vocoder.

**Why.** RTF is synthesis time over audio time. At 0.2, one worker could in theory keep up with about 5 streams, and fewer once you leave room for bursts. If this engine does not stream, the first audio arrives after the whole 0.8 s.
:::

:::drill concept
A diarization run reports 100 s of reference speech, 5 s missed, 3 s false alarm and 7 s confusion. Find the DER. Which term does a better speaker embedding help, and which does a better VAD help?
---
**Answer.** (5 + 3 + 7) / 100 = 15%. Better embeddings reduce confusion. A better VAD reduces miss and false alarm.

**Why.** This split tells you where to invest. Overlapped speech also shows up in miss and confusion: a system that outputs one speaker per frame cannot get an overlap frame fully correct.
:::

:::drill tricky
A diarizer labels one long-call participant as two speakers after 20 minutes. Give two likely causes and what you would check.
---
**Answer.** First, a change of channel or conditions, such as moving to speakerphone or new background noise, which moves embeddings. Second, a threshold that is too strict for this audio, so that a natural spread of embeddings forms two clusters.

**Why.** Check by plotting similarity between windows over time, looking for a step at the change point. Raising merge tolerance can fix this, and may then merge truly different speakers, so tune it on labelled data that has the same kind of channel change.
:::

:::drill tricky
On speakerphone, the agent keeps stopping itself mid-sentence. No user is talking. What is the cause, and how would you confirm it?
---
**Answer.** Its own audio reaches the mic, passes the VAD, and triggers barge-in. Echo cancellation is off, is failing, or is not getting the right playback reference.

**Why.** Confirm it by checking the recorded mic channel: you will hear the agent's voice, and its partial transcripts will match what the agent was saying. Fix the echo cancellation first. Also compare partial transcripts with the current TTS text, and ignore matches. Require a minimum speech duration too. Chapter 2 has a section on echo.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1300
Write a VAD with **hysteresis**: one threshold to start, a lower one to stop, plus hangover. Test it on a tone that fades out, and report each detection's end time.
---
A single threshold ends the segment as soon as the fading part drops below it. A lower stop threshold follows the quiet tail, and hangover adds a safety margin on top.

```python run=sp-c01-c-vad
import numpy as np

def vad_frames(x, frame, on_db, off_db, hang):
    """Two thresholds: rise above on_db to start, stay below off_db for hang frames to stop."""
    out, active, quiet = [], False, 0
    for i in range(len(x) // frame):
        db = 10 * np.log10(np.mean(x[i * frame:(i + 1) * frame] ** 2) + 1e-12)
        if not active and db > on_db:
            active, quiet = True, 0
        elif active:
            quiet = quiet + 1 if db < off_db else 0
            if quiet > hang:
                active = False
        out.append(active)
    return np.array(out)

rng = np.random.default_rng(5)
sr, frame = 16000, 320
x = rng.normal(0, 0.003, 2 * sr)
t = np.arange(sr // 2) / sr
amp = np.linspace(0.3, 0.02, len(t))                 # speech that fades towards the end
x[sr // 2:sr] += amp * np.sin(2 * np.pi * 200 * t)
for name, kw in {"single -30 dB": dict(on_db=-30, off_db=-30, hang=0),
                 "on -30, off -40": dict(on_db=-30, off_db=-40, hang=0),
                 "on -30, off -40, hang 5": dict(on_db=-30, off_db=-40, hang=5)}.items():
    a = vad_frames(x, frame, **kw)
    idx = np.flatnonzero(a)
    print(f"{name:24} active {idx[0] * .02:.2f} s to {(idx[-1] + 1) * .02:.2f} s")
```

The tone runs from 0.5 s to 1.0 s. The single threshold loses the last 40 ms of it, and the lower stop threshold reaches the true end. Hangover keeps going to 1.10 s. In a real system you pass that tail to the ASR, because a clipped final consonant can change a word.
:::

:::drill code rating=1400
Write online speaker assignment: for each new embedding, compare it to running cluster means, join the best one if similarity is over a threshold, otherwise start a new speaker. Use synthetic vectors.
---
This is the simplest form of streaming diarization. Keep a sum of unit vectors per cluster, since the direction of the sum is a fine mean for cosine similarity.

```python run=sp-c01-c-speaker
import numpy as np

rng = np.random.default_rng(9)
DIM = 16
centres = rng.normal(size=(2, DIM))
stream = [0, 0, 1, 1, 0, 1, 0, 0, 1, 1]
emb = centres[stream] + rng.normal(0, 0.4, (len(stream), DIM))

def online(emb, threshold):
    means, counts, out = [], [], []
    for e in emb:
        e = e / np.linalg.norm(e)
        sims = [float(e @ (m / np.linalg.norm(m))) for m in means]
        if sims and max(sims) >= threshold:
            k = int(np.argmax(sims))
            means[k] = means[k] + e
            counts[k] += 1
        else:
            k = len(means)
            means.append(e.copy())
            counts.append(1)
        out.append(k)
    return out, counts

labels, counts = online(emb, 0.5)
print("truth ", stream)
print("online", labels, "cluster sizes", counts)
```

Here the labels match the truth, since the synthetic clusters are well separated. On real audio, the first few windows of a speaker can be poor, and a bad early centroid then pulls later windows towards it. Offline clustering avoids this by seeing all windows before making any decision, which is one reason offline DER is usually lower.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- 16 kHz, 16-bit, mono PCM is 32,000 B/s or 256 kbit/s. Nyquist is half the sample rate. Upsampling adds no information.
- Frames: 25 ms window, 10 ms hop. Frame count without padding: `1 + (N - frame) // hop`.
- Log-mel: window, FFT power, triangular mel filters, log. Phase is discarded.
- VAD: frame energy or a small model, then thresholds, hangover and minimum duration. Smoothing adds latency. Fixed thresholds fail when noise changes.
- Endpointing: silence timeout trades cut-offs against latency on every turn. Improve it with transcript and prosody, or speculative LLM calls.
- Barge-in: echo cancellation, confirm speech, stop playback and queues, truncate history to what was heard.
- CTC: blank symbol, collapse repeats and then drop blanks, loss sums all paths with a forward DP. Greedy finds the best path, and that is not always the best text. Beam search merges paths.
- Attention: emits tokens using the encoder output, strong on clips, awkward for streaming. Transducer: a prediction network over outputs, natural for streaming.
- WER: `(S + D + I) / N_ref`. It can exceed 1 and is not symmetric. Normalise before scoring, and slice results.
- TTS: normalise, phonemes, acoustic model, mel, vocoder. RTF below 1 is necessary. Time to first audio is what users feel.
- Speech-to-speech: shorter path and keeps tone. Harder to debug and to constrain.
- Diarization: VAD, windows, embeddings, cosine clustering with a threshold. DER: `(miss + FA + confusion) / reference speech`, after the best label mapping. Check the collar.
