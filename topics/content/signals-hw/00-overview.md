---
name: Signals, controls & digital hardware
short: Signals & HW
icon: SH
version: Python 3.12 with NumPy, and GCC
eyebrow: sampling · FFT · filters · PID · state space · RTL · timing · SoC buses
headline: First-round answers for <em>signals, control and chips</em>.
lede: Three chapters for software-leaning students who are preparing for technical interviews in roles that touch signal processing, controls or chip design. Each chapter covers the ideas that come up in a first round, proves them with small programs and their real output, and then gives you drills with worked numericals and short coding problems.
card: A practical refresher on sampling, FFT and filters, feedback control and PID, and digital logic, RTL timing and SoC buses, with runnable NumPy models and worked numericals.
cta: Start with sampling|#ch01; Jump to PID|#ch02; Digital logic and timing|#ch03
search: Search: aliasing, FFT, windup, setup time, FSM…
---

:::hero A one-minute aliasing check
```python run=sh-home-hero
import numpy as np
fs = 1000
t = np.arange(1000) / fs
x = np.sin(2 * np.pi * 700 * t)
peak_bin = np.argmax(np.abs(np.fft.rfft(x)))
print(f"700 Hz tone sampled at {fs} Hz shows a peak at {peak_bin * fs / 1000:.0f} Hz")
```

A 700 Hz tone is above the 500 Hz Nyquist limit, so its samples are the same as those of a 300 Hz tone with the sign flipped. Chapter 1 explains why, and how to prevent it.
:::

## How to use this guide

Read a chapter once, then answer the drills out loud or on paper before you open them. Do every worked numerical by hand, because first-round panels often ask for a number and then ask why. Python and C examples were run during the build, and the output under each one is what it printed. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

## Suggested plan

| Sitting | Read | Drill |
|---|---|---|
| 1 | Ch 1 up to the FFT and windows | Aliasing, bin spacing and SQNR numericals |
| 2 | Ch 1 from convolution to the Kalman filter | Filter drills, then write the streaming moving average |
| 3 | Ch 2 up to stability and poles | First-order, second-order and pole numericals |
| 4 | Ch 2 from PID to state space | PID drills, then write a PID with anti-windup |
| 5 | Ch 3 up to setup and hold | FSM, Verilog and timing numericals |
| 6 | Ch 3 from clock domain crossing to power | Bus, cache and power drills, then write the FIFO |

## About the Verilog

No Verilog simulator runs during this site's build, so Verilog appears as plain code with no output. It was checked by careful reading and is written to be synthesizable. Where behaviour matters, such as the sequence detector or the FIFO pointers, a Python model of the same logic runs next to it. Delays in the timing numericals are made-up textbook values, chosen to make the arithmetic easy, and do not describe any real process or chip.
