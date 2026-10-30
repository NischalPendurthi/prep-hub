---
title: Streaming inference, WebRTC and latency budgets
part: Part B · Real-time systems
lede: A voice agent has to feel like a conversation, so every stage streams, and the slowest moment counts more than the average. This chapter breaks a sub-second budget down per stage, then simulates the pieces: queueing in a pipeline, sentence chunking for TTS, jitter buffers, head-of-line blocking, echo cancellation and percentile arithmetic. It also explains WebRTC well enough to debug one-way audio.
desc: voice pipeline, per-stage budget, streaming ASR, sentence-boundary TTS, jitter, UDP vs TCP, ICE, STUN, TURN, SRTP, Opus, WebSockets vs WebRTC, audio debugging, p50 and p95
hours: 6
prereqs: Chapter 1. TCP and UDP basics from the C++ guide's networking chapter.
---

## The pipeline and the budget {#ch02-budget .th}

A voice agent is a loop: audio goes in, gets turned into text, a reply is generated, the reply is turned into audio, and it plays. The number people feel is **voice-to-voice latency**, the time from the moment the user stops speaking to the moment they hear the first sound of the reply. It is often called turn latency. Many teams aim for under about one second. That is a common target, and no standard sets it. The right value depends on the task.

Latency adds up across stages, so build the answer as a table. The figures below are **example figures, picked to make arithmetic easy**. Your numbers depend on models, hardware, geography and network, and you should measure your own.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 262" role="img" aria-label="Voice agent pipeline in two rows of stages from microphone to speaker, with an 800 ms example budget drawn as a bar whose segments are proportional to each stage.">
  <text x="6" y="14" class="t-small">user side and server input</text> <rect x="6" y="22" width="132" height="44" rx="6" class="d-box"/><text x="72.0" y="40" text-anchor="middle" class="t-small">mic capture, encode</text><text x="72.0" y="57" text-anchor="middle" class="t-mono">30 ms</text> <path d="M138 44 L 150 44" class="d-line"/> <rect x="150" y="22" width="132" height="44" rx="6" class="d-soft"/><text x="216.0" y="40" text-anchor="middle" class="t-small">uplink</text><text x="216.0" y="57" text-anchor="middle" class="t-mono">40 ms</text> <path d="M282 44 L 294 44" class="d-line"/>
  <rect x="294" y="22" width="132" height="44" rx="6" class="d-acc"/><text x="360.0" y="40" text-anchor="middle" class="t-small">server jitter buffer</text><text x="360.0" y="57" text-anchor="middle" class="t-mono">20 ms</text> <path d="M426 44 L 438 44" class="d-line"/> <rect x="438" y="22" width="132" height="44" rx="6" class="d-trap"/><text x="504.0" y="40" text-anchor="middle" class="t-small">endpointing wait</text><text x="504.0" y="57" text-anchor="middle" class="t-mono">250 ms</text> <path d="M570 44 L 582 44" class="d-line"/>
  <rect x="582" y="22" width="132" height="44" rx="6" class="d-key"/><text x="648.0" y="40" text-anchor="middle" class="t-small">ASR final</text><text x="648.0" y="57" text-anchor="middle" class="t-mono">40 ms</text> <text x="6" y="88" class="t-small">reply path</text> <rect x="6" y="96" width="132" height="44" rx="6" class="d-key"/><text x="72.0" y="114" text-anchor="middle" class="t-small">LLM to first clause</text><text x="72.0" y="131" text-anchor="middle" class="t-mono">220 ms</text> <path d="M138 118 L 150 118" class="d-line"/>
  <rect x="150" y="96" width="132" height="44" rx="6" class="d-key"/><text x="216.0" y="114" text-anchor="middle" class="t-small">TTS to first audio</text><text x="216.0" y="131" text-anchor="middle" class="t-mono">100 ms</text> <path d="M282 118 L 294 118" class="d-line"/> <rect x="294" y="96" width="132" height="44" rx="6" class="d-soft"/><text x="360.0" y="114" text-anchor="middle" class="t-small">downlink</text><text x="360.0" y="131" text-anchor="middle" class="t-mono">40 ms</text> <path d="M426 118 L 438 118" class="d-line"/>
  <rect x="438" y="96" width="132" height="44" rx="6" class="d-acc"/><text x="504.0" y="114" text-anchor="middle" class="t-small">client jitter buffer</text><text x="504.0" y="131" text-anchor="middle" class="t-mono">40 ms</text> <path d="M570 118 L 582 118" class="d-line"/> <rect x="582" y="96" width="132" height="44" rx="6" class="d-box"/><text x="648.0" y="114" text-anchor="middle" class="t-small">decode, playout</text><text x="648.0" y="131" text-anchor="middle" class="t-mono">20 ms</text> <path d="M702 66 L 702 78 L 3 78 L 3 118 L 6 118" class="d-line"/>
  <text x="6" y="158" class="t-small">the same stages on one time line, end of speech at 0 and first audio heard at 800 ms</text> <rect x="10.0" y="166" width="26.2" height="30" class="d-box"/> <text x="23.1" y="186" text-anchor="middle" class="t-mono">30</text> <rect x="36.2" y="166" width="35.0" height="30" class="d-soft"/> <text x="53.8" y="186" text-anchor="middle" class="t-mono">40</text> <rect x="71.2" y="166" width="17.5" height="30" class="d-acc"/> <text x="80.0" y="186" text-anchor="middle" class="t-mono">20</text> <rect x="88.8" y="166" width="218.8" height="30" class="d-trap"/>
  <text x="198.1" y="186" text-anchor="middle" class="t-mono">250</text> <rect x="307.5" y="166" width="35.0" height="30" class="d-key"/> <text x="325.0" y="186" text-anchor="middle" class="t-mono">40</text> <rect x="342.5" y="166" width="192.5" height="30" class="d-key"/> <text x="438.8" y="186" text-anchor="middle" class="t-mono">220</text> <rect x="535.0" y="166" width="87.5" height="30" class="d-key"/> <text x="578.8" y="186" text-anchor="middle" class="t-mono">100</text> <rect x="622.5" y="166" width="35.0" height="30" class="d-soft"/>
  <text x="640.0" y="186" text-anchor="middle" class="t-mono">40</text> <rect x="657.5" y="166" width="35.0" height="30" class="d-acc"/> <text x="675.0" y="186" text-anchor="middle" class="t-mono">40</text> <rect x="692.5" y="166" width="17.5" height="30" class="d-box"/> <text x="701.2" y="186" text-anchor="middle" class="t-mono">20</text> <path d="M10.0 196 L 10.0 202" class="d-line"/><text x="10.0" y="216" text-anchor="middle" class="t-mono">0</text> <path d="M185.0 196 L 185.0 202" class="d-line"/><text x="185.0" y="216" text-anchor="middle" class="t-mono">200</text>
  <path d="M360.0 196 L 360.0 202" class="d-line"/><text x="360.0" y="216" text-anchor="middle" class="t-mono">400</text> <path d="M535.0 196 L 535.0 202" class="d-line"/><text x="535.0" y="216" text-anchor="middle" class="t-mono">600</text> <path d="M710.0 196 L 710.0 202" class="d-line"/><text x="696.0" y="216" text-anchor="middle" class="t-mono">800</text> <rect x="10" y="228" width="14" height="14" class="d-trap"/><text x="30" y="240" class="t-small">waiting for silence</text>
  <rect x="170" y="228" width="14" height="14" class="d-key"/><text x="190" y="240" class="t-small">model time</text> <rect x="290" y="228" width="14" height="14" class="d-soft"/><text x="310" y="240" class="t-small">network</text> <rect x="390" y="228" width="14" height="14" class="d-acc"/><text x="410" y="240" class="t-small">buffering</text> <rect x="490" y="228" width="14" height="14" class="d-box"/><text x="510" y="240" class="t-small">device</text>
</svg></div><figcaption><b>Where 800 ms can go in a voice turn.</b> These are example figures for a good network and a tuned system. They are not measurements or a benchmark of any product. The stage list and values are the ones in the program below.</figcaption></figure>

```python run=sp-c02-budget
# Example figures for a good network and a well-tuned system. They are not measurements.
STAGES = [("mic capture and encode", 30, "device"),
          ("uplink network", 40, "network"),
          ("server jitter buffer", 20, "buffer"),
          ("endpointing silence wait", 250, "wait"),
          ("ASR final result", 40, "model"),
          ("LLM to first clause", 220, "model"),
          ("TTS to first audio", 100, "model"),
          ("downlink network", 40, "network"),
          ("client jitter buffer", 40, "buffer"),
          ("decode and playout", 20, "device")]
total = sum(ms for _, ms, _ in STAGES)
running = 0
for name, ms, kind in STAGES:
    running += ms
    print(f"{name:26}{ms:5} ms {running:5} ms  {ms / total:4.0%}  {kind}")
print("total", total, "ms")
groups = {}
for _, ms, kind in STAGES:
    groups[kind] = groups.get(kind, 0) + ms
print({k: groups[k] for k in sorted(groups)})
```

Three points from this table are worth saying out loud in an interview:

- **The largest stage is waiting.** Endpointing is 250 ms of pure silence, 31% of the total, with no model involved. A faster ASR cannot help here. Chapter 1 covers why you cannot just cut it.
- **Models take 360 ms and everything else takes 440 ms.** An LLM that replied instantly would still leave 580 ms.
- **The network appears twice and so do buffers.** A user far from your servers can add 100 ms or more each way, which is why regional deployment matters.

:::trap Two different starts for the clock
Measured from when the VAD fired, the number leaves out the hangover and endpointing wait, so it looks much better than what the user experiences. Decide on the start and stop, and write it down. The honest definition is from the last sound of the user's speech to the first sound of the reply at the user's ear.
:::

## Streaming ASR {#ch02-asr .th}

Batch ASR waits for the whole utterance. **Streaming ASR** takes audio in small chunks (commonly 10 to 100 ms at a time) and emits text continually.

- **Partial results** (or interim results) are the current best guess, and they can change.
- **Final results** are committed, and do not change. They are usually produced at an endpoint.

An encoder that uses future context has to wait for it, so a look-ahead of `L` ms adds at least `L` ms of delay. So algorithmic latency is about `chunk + look-ahead + compute`. Less look-ahead means a worse model, which is a direct trade-off between accuracy and latency.

The server must also keep up. If processing one second of audio takes more than one second (RTF above 1), the backlog grows without limit, and a call gets later and later. For a GPU shared by many streams, the per-stream RTF is the thing to watch.

Partials are useful for live captions, for barge-in checks and for starting the LLM early. They need care, since the words can be revised. A simple rule commits a word only once it has stayed unchanged across two updates.

```python run=sp-c02-partials
# Each line is what streaming ASR reports as more audio arrives.
partials = ["i", "i want", "i want to", "i want to book", "i want two book a", "i want to book a table",
            "i want to book a table for", "i want to book a table for two", "i want to book a table for two"]

def stable_prefix(history, updates):
    """Words that have not changed for the last `updates` partials."""
    recent = [p.split() for p in history[-updates:]]
    out = []
    for words in zip(*recent):
        if len(set(words)) > 1:
            break
        out.append(words[0])
    return out

committed, flickers = [], 0
for n, partial in enumerate(partials, 1):
    words = partial.split()
    if n > 1:
        prev = partials[n - 2].split()
        flickers += sum(a != b for a, b in zip(prev, words))
    stable = stable_prefix(partials[:n], 2) if n >= 2 else []
    if len(stable) > len(committed):
        committed = stable
    print(f"{n:2} partial: {partial:32} committed: {' '.join(committed)}")
print("words revised between partials:", flickers)
```

At update 5 the model briefly hears "two" in place of "to". Consumers that read raw partials see the text flicker, while the committed line never goes backwards. The cost is a one-update lag, shown by the committed text trailing the partial. At an endpoint the final result replaces the partials, so the lag does not delay the last word.

**Pre-roll.** VAD fires after speech has begun, so if you start sending audio only at that moment, the first consonant is gone. Keep a ring buffer of the last few hundred ms, and send it along when VAD fires.

## Streaming the LLM into TTS {#ch02-llm .th}

The LLM streams tokens, and the TTS wants enough text to get intonation right. If you wait for the complete reply, you pay for the whole generation before any sound. If you send every token, the voice has no sense of the sentence and sounds wrong. The usual solution is to **cut at a sentence or clause boundary**, and to send each piece to TTS as soon as it is complete.

The chunker below sends text at sentence ends, optionally at commas too, keeps a small abbreviation list, and has a minimum length. Timing uses example figures: 150 ms to the first token, 30 ms per token and 100 ms for TTS to produce first audio. Words stand in for tokens here.

```python run=sp-c02-chunker
ABBREV = {"dr.", "mr.", "ms.", "vs.", "e.g.", "i.e."}
MIN_WORDS = 3

def chunk(tokens, clause=False):
    """Yield (token_index, text) at sentence ends, and optionally at commas."""
    buf = []
    for i, tok in enumerate(tokens):
        buf.append(tok)
        word = tok.strip().lower()
        at_end = word.endswith((".", "!", "?")) and word not in ABBREV
        at_clause = clause and word.endswith((",", ";", ":"))
        if (at_end or at_clause) and len(buf) >= MIN_WORDS:
            yield i, " ".join(t.strip() for t in buf)
            buf = []
    if buf:
        yield len(tokens) - 1, " ".join(t.strip() for t in buf)

text = ("Dr. Rao can see you at 3.30 on Tuesday, and the visit takes about 20 minutes. "
        "Please bring your old reports. Would that time work for you?")
tokens = text.split()

naive = [s for s in text.replace(". ", ".|").split("|")]
print("naive split on '. ':", naive[:2])

FIRST_TOKEN_MS, PER_TOKEN_MS, TTS_FIRST_AUDIO_MS = 150, 30, 100      # example figures
def first_audio(i):
    return FIRST_TOKEN_MS + i * PER_TOKEN_MS + TTS_FIRST_AUDIO_MS

whole = first_audio(len(tokens) - 1)
print(f"wait for the whole reply: first audio at {whole} ms")
for name, clause in (("sentences", False), ("clauses", True)):
    print(name)
    for i, chunk_text in chunk(tokens, clause):
        print(f"  ready at {FIRST_TOKEN_MS + i * PER_TOKEN_MS:4} ms, audio at {first_audio(i):4} ms: {chunk_text}")
```

Waiting for the whole reply gives first audio at 1030 ms. Sentence chunking gives 700 ms, and clause chunking gives 490 ms, using the same model speed. Later chunks arrive well before the first one finishes playing, because speech is slow: at around 150 words per minute, the 9-word first clause takes more than 3 seconds to say. So the LLM has a lot of slack after the first chunk, and it is only the time to the first chunk that users feel.

Naive splitting on `". "` breaks at `Dr.`, and the TTS would speak "Doctor" with a falling sentence ending and then pause. Clause splitting also has a cost: some engines give each chunk its own intonation contour, and a short chunk can sound choppy. It is a choice to test by ear.

:::trap Tokens are not words
Real LLM tokens can split anywhere. `3.30` can arrive as `3`, `.`, `30`, so a chunker that sees a period may be wrong for one token. Wait until the next non-space character appears, or a small timeout passes. Numbers, URLs and code all need the same care. Also strip markdown such as `**` and lists before TTS, or the voice may read it aloud.
:::

**Barge-in** must cancel in reverse order of what you have started: stop playback at the client first, as that is what the user hears, then drop queued TTS, then cancel the LLM stream so that you stop paying for tokens. Each stage should accept cancellation by turn ID, so that late results from an old turn cannot play over a new one.

## Queueing: where latency goes under load {#ch02-queue .th}

A stage's latency equals its queue wait plus its service time, and that wait grows sharply as utilisation approaches 1. This discrete-event simulation runs turns through ASR, LLM and TTS worker pools. All service times are example figures. The capacity is 40 turns/s for ASR, 20 for LLM and 25 for TTS, so LLM is the bottleneck.

```python run=sp-c02-des
import heapq, random

STAGES = [("asr", 2, 0.05), ("llm", 4, 0.20), ("tts", 2, 0.08)]   # name, workers, mean service seconds (example figures)

def percentile(values, q):
    values = sorted(values)
    return values[min(len(values) - 1, int(q * len(values)))]

def simulate(rate, n_turns=20000, seed=1):
    rng = random.Random(seed)
    events, seq, t = [], 0, 0.0
    for turn in range(n_turns):
        t += rng.expovariate(rate)
        heapq.heappush(events, (t, seq, "arrive", turn, 0))
        seq += 1
    free = [workers for _, workers, _ in STAGES]
    queues = [[] for _ in STAGES]
    entered = {}
    spent = [[] for _ in STAGES]
    total = {}
    done = []

    def start(stage, turn, now):
        nonlocal seq
        free[stage] -= 1
        mean = STAGES[stage][2]
        service = mean * rng.lognormvariate(-0.125, 0.5)              # mean about 1, with a long tail
        heapq.heappush(events, (now + service, seq, "finish", turn, stage))
        seq += 1

    while events:
        now, _, kind, turn, stage = heapq.heappop(events)
        if kind == "arrive":
            total[turn] = now
        else:
            spent[stage].append(now - entered[turn, stage])
            free[stage] += 1
            if queues[stage]:
                start(stage, queues[stage].pop(0), now)
            stage += 1
            if stage == len(STAGES):
                done.append(now - total[turn])
                continue
        entered[turn, stage] = now
        if free[stage]:
            start(stage, turn, now)
        else:
            queues[stage].append(turn)
    return spent, done

print("turns/s  stage p50 ms  p95 ms")
for rate in (5, 12, 18):
    spent, done = simulate(rate)
    row = [f"{name} {percentile(s, .5) * 1000:5.0f} {percentile(s, .95) * 1000:6.0f}" for (name, _, _), s in zip(STAGES, spent)]
    print(f"{rate:4}  " + "  ".join(row) + f"  total {percentile(done, .5) * 1000:5.0f} {percentile(done, .95) * 1000:6.0f}")
```

From 5 to 12 turns per second, almost nothing changes: total p95 goes from 558 to 630 ms. At 18 turns/s, the LLM is at 90% of its capacity, and its p95 jumps to 1172 ms, while ASR barely moves. The same model and the same code gives a much worse user experience. So capacity planning must target a utilisation with a margin, and alerts should fire on queue depth before the p95 has moved. Also note that total p95 at low load is below the sum of stage p95s, which the percentile section below returns to.

## Buffering and jitter {#ch02-jitter .th}

Packets are sent evenly, every 20 ms, and arrive unevenly. **Jitter** is that variation in delay. Audio must play at a steady rate, so the receiver holds packets in a **jitter buffer** and plays them on a fixed grid. A deeper buffer loses fewer packets to lateness and adds delay to every packet. A packet that arrives after its slot is as useless as a lost one.

```python run=sp-c02-jitter
import random

rng = random.Random(4)
INTERVAL = 20                 # one packet every 20 ms for 30 s
N = 1500
delay = [30 + rng.expovariate(1 / 8) + (rng.uniform(40, 120) if rng.random() < 0.01 else 0) for _ in range(N)]
arrive = [i * INTERVAL + d for i, d in enumerate(delay)]
print(f"network delay: min {min(delay):.0f} ms, median {sorted(delay)[N // 2]:.0f} ms, max {max(delay):.0f} ms")

def play(depth):
    """Fixed buffer: the first packet plays `depth` ms after it arrives, and every later packet on a fixed grid."""
    start = arrive[0] + depth
    late = sum(arrive[i] > start + i * INTERVAL for i in range(N))
    return late / N, start                # packet 0 was sent at time 0, so this is the end-to-end delay

print("depth   late packets   mouth-to-ear delay")
for depth in (0, 10, 20, 40, 60, 80, 120):
    late, total_delay = play(depth)
    print(f"{depth:4} ms {late:10.1%} {total_delay:12.0f} ms")

# RFC 3550 interarrival jitter estimate
j, previous = 0.0, None
for d in delay:
    if previous is not None:
        j += (abs(d - previous) - j) / 16
    previous = d
print(f"RFC 3550 jitter estimate at the end: {j:.1f} ms")
```

Going from a 0 to a 20 ms buffer takes late packets from about 76% to about 6%. Going from 80 to 120 ms removes the last 0.4% and costs 40 ms for everyone. The very late packets are from the 1% that hit a delay spike, and no small buffer can catch them. So the buffer should cover most of the jitter, and **packet loss concealment** (PLC) can handle the rest: the decoder synthesises a short piece of audio from what it had just before, which is hard to notice for one packet and audible for many in a row.

The last line is the interarrival jitter estimator from RFC 3550, an exponential average of delay differences. It reads 5.5 ms for this trace, which summarises the normal variation. It says little about the rare spikes, so do not size a buffer from that number alone.

Conditions change during a call, so real buffers adapt. They estimate a high percentile of recent delay and set their depth from it, so they stay shallow on a good network and grow when it gets worse. Real buffers such as NetEq in WebRTC's audio stack change depth smoothly, by stretching or compressing audio slightly, so that nothing clicks.

## UDP vs TCP for media {#ch02-udp .th}

The C++ guide's [TCP and UDP chapter](../../guide/#ch08) covers the protocols: handshakes, retransmission, congestion control and the sockets API. This chapter only deals with what they mean for live audio.

TCP delivers bytes in order. If one segment is lost, all later data waits in the kernel until the retransmission arrives, even though that data is already on the machine. This is **head-of-line blocking**. In this simulation, each packet has a 2% chance of being lost, and a retransmission costs 200 ms. That number is an example. A fast retransmit on a steady stream can be quicker, and the effect has the same shape.

```python run=sp-c02-hol
import random

rng = random.Random(2)
INTERVAL, N, LOSS, BASE, RETRANSMIT = 20, 3000, 0.02, 40, 200    # ms; example figures
lost = [rng.random() < LOSS for _ in range(N)]

def pct(v, q):
    v = sorted(v)
    return v[int(q * (len(v) - 1))]

# UDP: each packet arrives on its own or never. Lost ones become concealment.
udp = [BASE for i in range(N) if not lost[i]]

# TCP: bytes are delivered in order, so everything waits behind a lost segment.
tcp, ready = [], 0
for i in range(N):
    sent = i * INTERVAL
    arrival = sent + BASE + (RETRANSMIT if lost[i] else 0)
    ready = max(ready, arrival)                  # cannot be delivered before earlier data
    tcp.append(ready - sent)

DEADLINE = 100
print(f"lost in network: {sum(lost)} of {N}")
print(f"UDP delivered {len(udp)}, late 0, concealed {N - len(udp)} ({(N - len(udp)) / N:.1%})")
late = sum(d > DEADLINE for d in tcp)
print(f"TCP delivered {len(tcp)}, p50 {pct(tcp, .5)} ms, p95 {pct(tcp, .95)} ms, max {pct(tcp, 1)} ms")
print(f"TCP packets past a {DEADLINE} ms deadline: {late} ({late / N:.1%})")
```

With UDP, 2% of packets are missing, and PLC hides most of that. With TCP nothing is lost, and 13.9% of packets are past a 100 ms deadline, since one loss delays every packet behind it. So 2% of isolated gaps have become bursts of lateness that are much more audible. For live speech, a sample that arrives late has no value. That is why media uses UDP: the application chooses what to do about loss, whether that is forward error correction, NACK-based retransmission or concealment.

TCP is still fine when the network is short and clean, for example server to server within a data centre. It also gets through firewalls that block UDP.

## WebRTC {#ch02-webrtc .th}

WebRTC is a set of protocols and browser APIs for real-time media. Here are the parts you should be able to name.

| Piece | What it does |
|---|---|
| **Signalling** | Exchanges SDP offers and answers between peers. WebRTC does not define it; commonly HTTPS or WebSocket |
| **SDP** | A text description of codecs, directions, DTLS fingerprints and candidates |
| **ICE** | Finds a working network path by gathering candidate addresses and testing pairs |
| **STUN** | A small server that tells a client its public address and port as seen from outside the NAT |
| **TURN** | A relay server that forwards media when no direct path works |
| **DTLS-SRTP** | DTLS negotiates keys on the media path, and SRTP then encrypts and authenticates RTP |
| **RTP and RTCP** | RTP carries media with sequence numbers and timestamps. RTCP carries feedback such as loss, jitter and timing |
| **Opus** | The usual audio codec: variable bitrate, 2.5 to 60 ms frames, built-in PLC and optional in-band FEC |
| **Audio processing** | Echo cancellation, noise suppression and automatic gain, on the capture side |
| **Data channels** | SCTP over DTLS, for control messages and events alongside media |

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 240" role="img" aria-label="A browser behind NAT uses signalling over HTTPS to exchange SDP with a server. STUN tells it the public address. Media takes a direct UDP path, or falls back to a TURN relay.">
  <rect x="10" y="90" width="110" height="60" rx="6" class="d-box"/><text x="65" y="115" text-anchor="middle" class="t-small">browser</text><text x="65" y="133" text-anchor="middle" class="t-mono">10.0.0.5</text>
  <rect x="160" y="90" width="60" height="60" rx="6" class="d-soft"/><text x="190" y="124" text-anchor="middle" class="t-small">NAT</text>
  <rect x="590" y="90" width="120" height="60" rx="6" class="d-box"/><text x="650" y="115" text-anchor="middle" class="t-small">media server</text><text x="650" y="133" text-anchor="middle" class="t-mono">voice agent</text>
  <rect x="300" y="8" width="130" height="36" rx="6" class="d-soft"/><text x="365" y="31" text-anchor="middle" class="t-small">signalling (HTTPS)</text>
  <rect x="250" y="186" width="90" height="40" rx="6" class="d-acc"/><text x="295" y="211" text-anchor="middle" class="t-small">STUN</text>
  <rect x="400" y="186" width="90" height="40" rx="6" class="d-trap"/><text x="445" y="211" text-anchor="middle" class="t-small">TURN relay</text>
  <path d="M120 112 L 160 112" class="d-line-acc"/><path d="M220 112 L 590 112" class="d-line-acc"/><text x="405" y="105" text-anchor="middle" class="t-small t-acc">direct path: SRTP over UDP</text>
  <path d="M120 96 L 300 30" class="d-line"/><path d="M430 26 L 590 96" class="d-line"/><text x="110" y="56" class="t-small">1. SDP offer</text><text x="510" y="50" class="t-small">SDP answer</text>
  <path d="M205 150 L 260 186" class="d-line"/><text x="70" y="176" class="t-small">2. what is my address?</text>
  <path d="M220 136 L 400 196" class="d-line-trap"/><path d="M490 196 L 620 150" class="d-line-trap"/><text x="540" y="196" class="t-small t-trap">3. relay if needed</text>
</svg></div><figcaption><b>How a connection is set up.</b> Signalling exchanges descriptions. ICE gathers candidates (local, from STUN, from TURN), tests pairs with connectivity checks, and uses the best pair that works.</figcaption></figure>

An ICE candidate is an address that might work, and an SDP carries them as lines. The sample below is **illustrative**, with made-up documentation addresses.

```text
a=candidate:1 1 udp 2122260223 192.168.1.5 54321 typ host
a=candidate:2 1 udp 1686052607 203.0.113.7 61000 typ srflx raddr 192.168.1.5 rport 54321
a=candidate:3 1 udp 41885439 198.51.100.9 49152 typ relay raddr 203.0.113.7 rport 61000
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
```

`host` is a local address, `srflx` (server reflexive) is the public address learned from STUN, and `relay` is an address on a TURN server. ICE prefers direct paths, and relays are the fallback. TURN costs bandwidth, so it costs money, and it adds a hop. It is also what rescues users on networks with restrictive NATs or blocked UDP, since a TURN server can accept TCP or TLS on port 443.

**Opus bitrate and headers.** Packet headers are a real part of the cost. Each 20 ms packet carries IPv4, UDP and RTP headers, and an SRTP authentication tag, whose length depends on the configuration. A 10-byte tag is common.

```python run=sp-c02-bw
IP, UDP, RTP, SRTP_TAG = 20, 8, 12, 10       # bytes, IPv4 with a common SRTP auth tag length
FRAME_MS = 20
pps = 1000 // FRAME_MS
overhead = IP + UDP + RTP + SRTP_TAG
print(f"packets per second {pps}, overhead per packet {overhead} bytes, {overhead * 8 * pps / 1000:.0f} kbit/s")
for codec_kbps in (16, 24, 32, 64):
    payload = codec_kbps * 1000 * FRAME_MS / 1000 / 8
    print(f"opus {codec_kbps:3} kbit/s: {payload:5.0f} byte payload, {codec_kbps + overhead * 8 * pps / 1000:5.0f} kbit/s on the wire")
print("raw 16 kHz PCM:", 16000 * 16 // 1000, "kbit/s before headers")
```

Headers cost 20 kbit/s at 20 ms frames, as much as a low-bitrate Opus stream. A shorter frame reduces packetisation delay, and costs more headers. 20 ms is the usual default.

### WebSockets vs WebRTC {#ch02-ws}

Both can carry audio to a voice agent, and both are used in practice.

| | WebRTC | WebSocket |
|---|---|---|
| Transport | Usually UDP (SRTP), with TCP/TLS fallback via TURN | TCP, usually with TLS |
| Loss behaviour | Conceal and move on | Retransmit and stall behind the gap |
| Jitter buffer, PLC, AEC, Opus | Included in browsers | Build it or skip it |
| Setup | Signalling, ICE, DTLS and TURN to operate | One HTTP upgrade |
| Server work | Media server or library, such as aiortc or Pion | Any web server |
| Best for | Browsers and apps on the public internet | Server-to-server, telephony bridges, prototypes |

A reasonable answer: use WebRTC when the last mile is the public internet, especially mobile and Wi-Fi, since that is where loss and jitter happen. Use WebSocket for short and clean links, for example from a telephony gateway to your server in the same region. There you still need to pace the audio yourself: send it in real-time-sized chunks, and keep a playout buffer.

## Debugging audio problems {#ch02-debug .th}

Start with what each side is sending and receiving. WebRTC's stats API gives you the counters, and Chromium-based browsers show the same data at `chrome://webrtc-internals`.

```javascript
// illustrative: run in a browser against a live RTCPeerConnection
const stats = await pc.getStats();
stats.forEach((r) => {
  if (r.type === "inbound-rtp" && r.kind === "audio")
    console.log(r.packetsReceived, r.packetsLost, r.jitter, r.concealedSamples);
  if (r.type === "outbound-rtp" && r.kind === "audio") console.log(r.packetsSent);
  if (r.type === "candidate-pair" && r.nominated)
    console.log(r.state, r.currentRoundTripTime);
});
```

### One-way audio {#ch02-oneway}

Follow the media hop by hop, and look for where the count stops rising. Work through these in order:

1. Is the local track live, unmuted, and allowed by the permission prompt? Is the input level above zero?
2. Is `packetsSent` rising on the sender?
3. Is `packetsReceived` rising on the other side? If it is sent and not received, it is a network problem or a firewall problem. Check the chosen ICE pair, and whether TURN is configured and reachable.
4. Does the SDP direction match? `sendonly` or `recvonly` on the wrong side gives you exactly this symptom.
5. Is it being received and not played? Then look at decode and playout. Browsers can block autoplay of audio until the user interacts with the page, and a wrong output device or muted element sounds the same.

### Echo {#ch02-echo}

Echo means the agent hears itself. On speakerphone and laptops, the sound from the speaker reaches the microphone. An **acoustic echo canceller** (AEC) gets the played signal as a **reference**, learns the path from speaker to mic with an adaptive filter, and subtracts its prediction. The toy below measures the delay by cross-correlation, then runs a small NLMS adaptive filter, using a noise-like test signal. Real speech makes the filter converge more slowly, and real AEC adds more stages.

```python run=sp-c02-echo
import numpy as np

sr = 8000
rng = np.random.default_rng(3)
far = rng.normal(0, 0.1, 4 * sr)                    # what the agent played (noise-like test signal)
delay = int(0.120 * sr)                             # 120 ms from speaker to mic
echo_path = np.zeros(delay + 40)
echo_path[delay], echo_path[delay + 25] = 0.4, -0.15
echo = np.convolve(far, echo_path)[:len(far)]
mic = echo + rng.normal(0, 0.002, len(far))

# 1. measure the delay by cross-correlating mic with the reference
corr = np.fft.irfft(np.fft.rfft(mic) * np.conj(np.fft.rfft(far)))
lag = int(np.argmax(np.abs(corr[:sr])))
print(f"estimated echo delay {1000 * lag / sr:.1f} ms")

# 2. a small NLMS echo canceller: learn the path and subtract its prediction
def cancel(reference, L=1200, mu=0.5):
    w, out = np.zeros(L), np.zeros(len(mic))
    for n in range(L, len(mic)):
        x = reference[n - L + 1:n + 1][::-1]
        e = mic[n] - np.sum(w * x)
        w += mu * e * x / (np.sum(x * x) + 1e-6)
        out[n] = e
    return out, w

def db(s):
    return 10 * np.log10(np.mean(s ** 2))

out, w = cancel(far)
second = len(mic) // 4
print(f"last 1 s: mic {db(mic[-second:]):6.1f} dB, after canceller {db(out[-second:]):6.1f} dB")
print(f"largest learned tap at {1000 * int(np.argmax(np.abs(w))) / sr:.1f} ms")

# 3. the same canceller with a reference that is 200 ms out of date cannot find the path
stale = np.concatenate([np.zeros(int(0.2 * sr)), far[:-int(0.2 * sr)]])
out, _ = cancel(stale)
print(f"reference arrives after the echo: last 1 s {db(out[-second:]):6.1f} dB")
```

The cross-correlation finds the 120 ms delay exactly. By the last second the canceller has reduced the mic level from -27.3 dB to -52.7 dB, close to the added noise. The last line is the important one: when the reference arrives *after* the echo has already reached the mic, the filter cannot predict anything, and the output (-26.1 dB) is no better than the input. So a canceller needs the reference early and with a roughly stable delay. This is why AEC is best done where playback actually happens, on the device. A server-side AEC does not know about the device's own buffers.

### Clipping {#ch02-clipping}

The word has two meanings, so ask which is meant.

**Level clipping** happens when samples hit full scale and flatten, which sounds harsh and hurts ASR. Check peak level and the share of samples at the limit.

```python run=sp-c02-levels
import numpy as np

sr = 16000
t = np.arange(sr) / sr
speechy = 0.25 * sum(np.sin(2 * np.pi * 150 * k * t) / k for k in range(1, 10))

def report(name, x):
    pcm = np.clip(np.round(x * 32767), -32768, 32767).astype(np.int16)
    y = pcm / 32768
    rms = 10 * np.log10(np.mean(y ** 2))
    peak = 20 * np.log10(np.max(np.abs(y)))
    at_limit = np.mean(np.abs(pcm) >= 32767)
    print(f"{name:12} rms {rms:6.1f} dBFS  peak {peak:6.1f} dBFS  samples at full scale {at_limit:6.1%}")

report("normal", speechy)
report("gain x 2", speechy * 2)
report("gain x 6", speechy * 6)
report("too quiet", speechy * 0.01)
```

With gain 6, 27.8% of samples sit at full scale, while RMS only reads -1.6 dBFS. Causes include AGC turned off with a hot mic, a resampler that overshoots, or mixing without limiting. The "too quiet" line matters too: at -53 dBFS the speech is close to the noise floor of many mics, and your VAD will not fire.

**Front or back clipping** means words are cut off at the start or end. The first word goes missing when the VAD fires late with no pre-roll, or when a stream only opens after speech starts. The last word goes missing when endpointing is too eager. At the output, TTS audio can be cut if a client stops a buffer early, or if the first chunk is dropped while the player is still starting.

### Desync and chipmunks {#ch02-desync}

A wrong sample rate is a very common bug. Raw PCM has no header, so a receiver just trusts what it has been told. A slow clock mismatch is more subtle: two devices never agree exactly about what a second is.

```python run=sp-c02-drift
# Two clocks that disagree slightly. Sender writes at 48000 Hz, receiver reads at 48000 * (1 + ppm / 1e6).
for ppm in (20, 100):
    per_second = 48000 * ppm / 1e6
    minutes = 10
    samples = per_second * 60 * minutes
    print(f"{ppm:3} ppm: {per_second:.2f} samples/s, {samples / 48:.0f} ms after {minutes} minutes")

# Sample-rate mismatch: raw 16 kHz samples played back as if they were 24 kHz.
seconds, wrote, played = 3.0, 16000, 24000
print(f"plays for {seconds * wrote / played:.2f} s, pitch x {played / wrote:.2f}")
print(f"the reverse: plays for {seconds * played / wrote:.2f} s, pitch x {wrote / played:.2f}")
```

Audio that sounds high and fast is a rate mismatch, here 16 kHz played as 24 kHz, for 1.5 times the pitch and two thirds of the duration. Drift of 100 ppm moves things by 60 ms in 10 minutes. If nothing corrects it, a buffer slowly fills or runs out, so latency climbs during a call, or there are periodic glitches. Jitter buffers and resamplers compensate for this. **Audio-to-transcript desync** often comes from counting time in the wrong units, such as measuring from a stream's start when the first chunk was dropped. Use RTP timestamps or sample counts as your clock, and not wall-clock arrival.

| Symptom | First things to check |
|---|---|
| Agent hears nothing | Permissions, track muted, `packetsSent`, ICE state, TURN |
| User hears nothing | `packetsReceived`, autoplay policy, output device, SDP direction |
| Works on Wi-Fi, fails on office network | UDP blocked: is TURN over TLS on 443 configured? |
| Agent interrupts itself | Echo cancellation, reference signal, partial transcripts matching the agent's words |
| Robotic or choppy | Loss and concealment counters, CPU starvation, undersized buffer |
| Harsh, distorted | Samples at full scale, double gain |
| Chipmunk or slow-motion | Sample-rate mismatch on raw PCM |
| First word missing | Pre-roll, VAD start threshold, stream opened late |
| Latency grows over a call | Unbounded queue, RTF above 1, clock drift |

## Measuring p50 and p95 {#ch02-measure .th}

Average latency hides the turns that feel bad. Report percentiles: **p50** is the typical turn, and **p95** is how bad the worst 1 in 20 turns gets. A call has many turns, so most users on a long call will experience their p95 several times.

Record a timestamp at every boundary for every turn: last speech frame, endpoint decision, ASR final, LLM first token, TTS first audio, first packet sent, and first sample played on the client if you can get it. Use a monotonic clock within a machine, and be careful comparing clocks between machines. For a true end-to-end number, you can play a known clip into a client, record the output and measure the gap, which includes everything.

Percentiles have rules that surprise people.

```python run=sp-c02-pct
import numpy as np

rng = np.random.default_rng(6)
n = 20000
asr = rng.lognormal(np.log(60), 0.3, n)
llm = rng.lognormal(np.log(250), 0.5, n)
tts = rng.lognormal(np.log(100), 0.4, n)
total = asr + llm + tts

print("stage     p50     p95     p99    mean")
for name, v in (("asr", asr), ("llm", llm), ("tts", tts), ("total", total)):
    p50, p95, p99 = np.percentile(v, [50, 95, 99])
    print(f"{name:6}{p50:7.0f} {p95:7.0f} {p99:7.0f} {v.mean():7.0f}")
print(f"sum of stage p95s {sum(np.percentile(v, 95) for v in (asr, llm, tts)):.0f}, p95 of the total {np.percentile(total, 95):.0f}")

# Ten pods: nine healthy and one slow. Averaging their p95s is not the p95 of the traffic.
pods = [rng.lognormal(np.log(100), 0.3, 2000) for _ in range(9)] + [rng.lognormal(np.log(400), 0.3, 2000)]
print(f"mean of pod p95s {np.mean([np.percentile(p, 95) for p in pods]):.0f}, true p95 {np.percentile(np.concatenate(pods), 95):.0f}")

# Small samples: p95 of a handful of turns is mostly noise.
for size in (20, 100, 1000):
    estimates = [np.percentile(rng.choice(llm, size), 95) for _ in range(500)]
    print(f"{size:5} samples: p95 estimate ranges {np.percentile(estimates, 5):.0f} to {np.percentile(estimates, 95):.0f}")
```

- **Percentiles do not add.** The stage p95s sum to 866 and the true p95 of the total is 756, because it is rare for all stages to be slow at the same turn. The p50s do not add up either (409 against 423). If stages are correlated, for example under load, the gap gets smaller. So keep a per-turn total and calculate its percentile directly.
- **Percentiles do not average.** Nine healthy pods and one slow pod give a mean of p95s of 212, and the true traffic p95 is 398. Aggregate histograms, and then compute the percentile. Chapter 3 shows how.
- **Sample size matters.** With 20 samples, the estimated p95 ranges from 379 to 705 in this run, and with 1000 samples from 545 to 603. Do not act on a p95 from a handful of turns.

Also watch **who is missing from your data**: when a pipeline overloads and calls fail, those calls no longer report latency, and your p95 can improve as things get worse. Keep failure rates next to latency, and slice by region, device and network type.

## Drills {#ch02-drills .dr}

:::drill concept
Define voice-to-voice latency precisely. A teammate reports 300 ms from their logs, and the product feels slow. What are the likely reasons for the gap?
---
**Answer.** It runs from the end of the user's speech to the first sound of the reply at their ear. The 300 ms probably starts at the endpoint decision and ends when audio leaves the server.

**Why.** That leaves out the endpointing wait, capture, network in both directions, jitter buffers and playout. In this chapter's example budget, those add up to 440 of the 800 ms.
:::

:::drill output
Take the 800 ms example budget, with endpointing at 250 and LLM at 220. What is the total if (a) endpointing becomes 500 ms, (b) instead you add 150 ms each way for a distant user, (c) both, with an LLM twice as fast?

```python run=sp-c02-d-budget
total = 800
endpoint, llm = 250, 220
print("endpoint at 500:", total - endpoint + 500)
print("add 150 ms network each way:", total + 300)
print("all three:", total - endpoint + 500 + 300 - llm + 110)
```
---
**Answer.** (a) 1050, (b) 1100, (c) 1240 ms.

**Why.** For (c): 800 + 250 + 300 - 110. Halving the LLM's time only recovers 110 ms and does not undo either of the other two changes. So region placement and endpointing can matter more than a faster model.
:::

:::drill bug
This chunker sends `I paid $3.` to TTS and later `50 for it.` Find the bug and fix it.

```python
def on_token(buf, tok, send):
    buf.append(tok)
    if "." in tok:
        send("".join(buf))
        buf.clear()
```
---
**Answer.** It treats any period as a sentence end. Require a boundary character followed by whitespace, which means holding the period until the next token shows up, plus a short timeout so the last sentence still gets sent.

**Why.** Abbreviations and decimals both break it. Tokens can split anywhere, so this check must work on the buffered text.
:::

:::drill bug
On barge-in the agent keeps talking for two more seconds. Find the bug.

```python
async def on_barge_in(self):
    self.llm_task.cancel()
    self.state = "listening"
```
---
**Answer.** It cancels generation, and audio that is already queued keeps playing. Clear the client's playback buffer first, then cancel queued TTS, then cancel the LLM.

**Why.** Audio is usually sent ahead of real time, so seconds of it can sit in buffers at the client or server. You also need to update the history to what was actually heard, and tag messages with a turn ID so that stale chunks are dropped.
:::

:::drill output
Packets are sent every 20 ms and these are their arrival times. The buffer starts playback 40 ms after the first arrival. Which packets are on time?

```python run=sp-c02-d-jitter
arrive = [30, 52, 125, 91, 112, 130]
start = arrive[0] + 40
for i, a in enumerate(arrive):
    due = start + i * 20
    print(i, "due", due, "arrive", a, "late" if a > due else "ok")
```
---
**Answer.** All except packet 2, which arrives at 125 and is due at 110.

**Why.** Packet 3 arrives before packet 2, so reordering is not a problem by itself: a buffer sorts by sequence number. A 60 ms buffer would have saved packet 2, at the cost of 20 ms on every packet. PLC fills the gap meanwhile.
:::

:::drill tricky
A user's network has 2% packet loss, and you are sending audio over a WebSocket. Nothing is lost, so why does it sound bad, and why does latency keep creeping up?
---
**Answer.** TCP retransmission holds up later data behind each lost segment, so playback runs out during the stall. If the sender keeps sending in real time, the delayed data then arrives in a burst, and an unmanaged buffer plays it behind schedule from then on.

**Why.** In this chapter's simulation, 2% loss puts 13.9% of packets past a 100 ms deadline. To stop the creep, keep a target buffer depth, and drop or speed up audio when the buffer is over it. Better yet, use a transport with loss concealment on the lossy link.
:::

:::drill concept
What is the difference between STUN and TURN? Which one carries media, and what does each cost?
---
**Answer.** STUN tells a client its public address, and does not touch the media. TURN relays all the media through a server. STUN is cheap, and TURN costs bandwidth and adds a network hop.

**Why.** Direct paths fail on some NATs and firewalls. A TURN server listening on TLS and port 443 gets through many restrictive networks. Your product will need one for those users, so size and place it, and monitor the share of calls using a relay.
:::

:::drill tricky
Users report one-way audio: they hear the agent, and the agent hears nothing. Walk through how you would debug it.
---
**Answer.** Follow the packets. Check that the user's mic has permission and the track is unmuted, that `packetsSent` rises on the client, that `packetsReceived` rises on the server, and that the audio decoded on the server has a non-zero level. Then look at VAD and ASR.

**Why.** Each check rules out half of the problem. If the server receives non-silent audio and ASR gets nothing, the bug is within your pipeline, perhaps a wrong sample rate or a dropped stream. Downlink audio working shows that ICE is up, which excludes many network causes. An all-zero stream is a classic sign of a muted or wrong device.
:::

:::drill tricky
The agent's transcripts contain its own previous sentence, and it replies to itself. AEC is on in the client. What else could be wrong?
---
**Answer.** The call may be coming through a path with no AEC, such as a bridge or native app, or AEC's reference may be wrong, for example when playback happens outside the browser's own output path. Headphones hiding the problem in testing is a clue.

**Why.** AEC works only if it sees what was played. If your app plays audio by a route that the echo canceller cannot see, there is no reference. The toy in this chapter shows a late reference gives no reduction at all. Check by recording the processed mic signal during playback.
:::

:::drill concept
ASR consistently loses users' first word, and it gets worse on slow networks. What is your hypothesis?
---
**Answer.** Audio from before the VAD's trigger is dropped, or the stream is only opened after speech has started, so connection setup eats the start of speech.

**Why.** Add a pre-roll ring buffer of a few hundred ms, keep the stream open before the turn, and send buffered audio when VAD fires. If network conditions change how much is lost, the stream setup is in the path. Compare the client's recorded audio with what the server received.
:::

:::drill tricky
Latency is fine in the first minutes of a call, and 2 seconds behind after 30 minutes. Name three causes.
---
**Answer.** First, an RTF above 1 in some stage, so a backlog keeps growing. Second, an unbounded queue with no dropping when the receiver falls behind. Third, clock drift with no correction, or a buffer that never shrinks after a network burst.

**Why.** Drift by itself is small: at 100 ppm, 30 minutes is 180 ms. So 2 seconds points more to queues. Graph buffer depth over time for each stage. Also consider growing LLM context, which increases time to first token as a conversation gets longer.
:::

:::drill tricky
Can you add up the p95s of ASR, LLM and TTS to get the p95 of the turn? Which way is the error?
---
**Answer.** No. If the stages are independent, the sum overestimates, since all three rarely peak on the same turn. In this chapter's run, the sum was 866 and the true value 756.

**Why.** Correlated slowness, such as a shared overloaded GPU, narrows the gap. Log per-turn totals, so that you can compute it directly.
:::

:::drill bug
Latency numbers show occasional negative values and huge spikes around the same time every day. Find the bug.

```python
start = time.time()
result = model.infer(chunk)
metrics.observe("infer_seconds", time.time() - start)
```
---
**Answer.** `time.time()` is the wall clock, and it can jump when the system clock is adjusted. Use `time.perf_counter()` or `time.monotonic()`.

**Why.** Monotonic clocks only move forward. Across machines, neither helps by itself, so propagate trace IDs and keep the per-machine durations separate.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1300
Given packets with sequence number, send time and receive time, in arrival order, compute the stats you would use for debugging: expected, lost, reordered and the RFC 3550 jitter.
---
Loss comes from the sequence range. Reordering shows up in arrival order. Jitter uses differences of transit time between consecutive packets. This version sorts by sequence number for simplicity, while real receivers update in arrival order, and the two can differ slightly.

```python run=sp-c02-c-rtp
import random

def receiver_stats(packets):
    """packets: (seq, send_ms, recv_ms) in arrival order. Returns the counters that a debug view shows."""
    seqs = [p[0] for p in packets]
    expected = max(seqs) - min(seqs) + 1
    lost = expected - len(set(seqs))
    reordered = sum(a > b for a, b in zip(seqs, seqs[1:]))
    j, prev = 0.0, None
    for seq, send, recv in sorted(packets):
        if prev is not None:
            d = (recv - send) - prev
            j += (abs(d) - j) / 16
        prev = recv - send
    return dict(expected=expected, lost=lost, reordered=reordered, jitter_ms=round(j, 1))

rng = random.Random(10)
packets = []
for seq in range(500):
    if rng.random() < 0.03:
        continue
    send = seq * 20
    packets.append((seq, send, send + 30 + rng.expovariate(1 / 10)))
packets.sort(key=lambda p: p[2])
print(receiver_stats(packets))
```

Jitter comes out at 9.6 ms, close to the 10 ms mean of the simulated exponential delay. For two independent exponential values, the mean absolute difference equals the mean, so that is what you would expect.
:::

:::drill code rating=1400
Write a jitter buffer playout simulator. Given arrival times by sequence number, and a depth, label each slot as play, late or lost. Run it at several depths.
---
Fix the playout grid from the earliest arrival, then compare each packet with its slot.

```python run=sp-c02-c-jb
def jitter_buffer(arrivals, depth_ms, interval=20):
    """Playout simulator: returns the outcome per slot. arrivals: {seq: arrival time}. Missing seqs are lost."""
    t0 = min(arrivals.values()) + depth_ms
    log = []
    for seq in range(max(arrivals) + 1):
        due = t0 + seq * interval
        if seq not in arrivals:
            log.append((seq, "conceal lost"))
        elif arrivals[seq] > due:
            log.append((seq, "conceal late"))
        else:
            log.append((seq, "play"))
    return log

arrivals = {0: 35, 1: 52, 2: 150, 4: 118, 5: 136, 6: 151}
for depth in (20, 60, 100):
    log = jitter_buffer(arrivals, depth)
    print(depth, [what.split()[-1] for _, what in log])
```

Packet 2 arrives at 150. It is late at 20 and at 60 ms depth, and plays at 100 ms depth, where its slot is at 175. Packet 3 never arrives, so no depth can help, and that is a case for PLC. The grid depends on the first arrival: a slow first packet gives an accidental extra margin, and a fast one removes it. Real buffers keep measuring and adjusting.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- Voice-to-voice: end of user's speech to first sound heard. Under about 1 s is a common goal. Budget it stage by stage, using your own measurements.
- Endpointing is often the largest slice, and it is waiting time with no model involved.
- Streaming ASR: chunks, partials that can change, finals that do not. Look-ahead adds latency directly. RTF must stay below 1. Keep a pre-roll buffer.
- LLM to TTS: cut at clause or sentence boundaries. Only the first chunk's latency is felt. Tokens split anywhere, so buffer on text.
- Barge-in: stop playback, drop queued TTS, cancel the LLM, fix history. Tag everything with a turn ID.
- Queueing: latency stays flat and then rises sharply near capacity. Keep a margin and watch queue depth.
- Jitter buffer: depth trades lateness against delay. Adapt to conditions. PLC covers the rest.
- UDP for media, since late audio is useless and TCP's head-of-line blocking turns small loss into stalls. Protocol details are in the [C++ guide](../../guide/#ch08).
- WebRTC: signalling and SDP, ICE with host, srflx and relay candidates, STUN for address discovery, TURN as a relay, DTLS-SRTP for encryption, RTP and RTCP, Opus, AEC, data channels.
- WebSocket: simple, TCP, no media features. Good for clean server-to-server links.
- Debugging: follow counters hop by hop. One-way: permissions, sent, received, direction, playout. Echo: AEC reference. Clipping: level or front/back. Chipmunk: sample-rate mismatch. Growing delay: queues, RTF, drift.
- Percentiles do not add, and do not average. Aggregate histograms, keep per-turn totals, watch sample sizes and failures.
