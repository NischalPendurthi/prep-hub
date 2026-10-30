---
title: Sampling, FFT and filters
part: Part A · Signals
lede: Most digital signal processing questions in a first round come down to a few ideas. Sampling folds high frequencies onto low ones, the FFT trades observation time for frequency resolution, and a filter is a convolution whose frequency response you can compute. This chapter covers those ideas, then extends convolution to images and ends with the intuition behind the Kalman filter.
desc: Nyquist, aliasing, quantization, DFT/FFT, windows, convolution, FIR vs IIR, image kernels, Kalman
hours: 4
prereqs: basic Python and NumPy, sine waves, complex exponentials
---

## Sampling and aliasing {#ch01-sampling .th}

Sampling takes a value every `Ts` seconds, so the sample rate is `fs = 1/Ts`. The **sampling theorem** says a signal whose frequencies all lie below `fmax` can be rebuilt exactly from its samples if `fs > 2 * fmax`. The limit `fs/2` is the **Nyquist frequency**.

A tone above `fs/2` produces the same samples as a lower tone, which is called **aliasing**. The apparent frequency is the distance from `f` to the nearest integer multiple of `fs`: `f_alias = |f - fs * round(f / fs)|`.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 210" role="img" aria-label="A 7 hertz cosine and a 3 hertz cosine pass through the same ten samples per second">
  <path d="M40 100 L 700 100" class="d-grid"/>
  <path d="M40 30.0 L43 31.4 L46 35.5 L49 42.2 L52 51.2 L55 62.2 L58 74.6 L61 88.1 L64 102.0 L67 115.9 L70 129.1 L73 141.1 L76 151.6 L79 159.9 L82 165.9 L85 169.3 L88 169.9 L91 167.7 L94 162.8 L97 155.4 L100 145.8 L103 134.4 L106 121.6 L109 108.0 L112 94.0 L115 80.3 L118 67.3 L121 55.7 L124 45.8 L127 38.1 L130 32.8 L133 30.3 L136 30.5 L139 33.4 L142 39.0 L145 47.1 L148 57.3 L151 69.1 L154 82.2 L157 96.0 L160 110.0 L163 123.5 L166 136.1 L169 147.3 L172 156.6 L175 163.7 L178 168.2 L181 170.0 L184 169.0 L187 165.2 L190 158.9 L193 150.2 L196 139.5 L199 127.2 L202 113.9 L205 100.0 L208 86.1 L211 72.8 L214 60.5 L217 49.8 L220 41.1 L223 34.8 L226 31.0 L229 30.0 L232 31.8 L235 36.3 L238 43.4 L241 52.7 L244 63.9 L247 76.5 L250 90.0 L253 104.0 L256 117.8 L259 130.9 L262 142.7 L265 152.9 L268 161.0 L271 166.6 L274 169.5 L277 169.7 L280 167.2 L283 161.9 L286 154.2 L289 144.3 L292 132.7 L295 119.7 L298 106.0 L301 92.0 L304 78.4 L307 65.6 L310 54.2 L313 44.6 L316 37.2 L319 32.3 L322 30.1 L325 30.7 L328 34.1 L331 40.1 L334 48.4 L337 58.9 L340 70.9 L343 84.1 L346 98.0 L349 111.9 L352 125.4 L355 137.8 L358 148.8 L361 157.8 L364 164.5 L367 168.6 L370 170.0 L373 168.6 L376 164.5 L379 157.8 L382 148.8 L385 137.8 L388 125.4 L391 111.9 L394 98.0 L397 84.1 L400 70.9 L403 58.9 L406 48.4 L409 40.1 L412 34.1 L415 30.7 L418 30.1 L421 32.3 L424 37.2 L427 44.6 L430 54.2 L433 65.6 L436 78.4 L439 92.0 L442 106.0 L445 119.7 L448 132.7 L451 144.3 L454 154.2 L457 161.9 L460 167.2 L463 169.7 L466 169.5 L469 166.6 L472 161.0 L475 152.9 L478 142.7 L481 130.9 L484 117.8 L487 104.0 L490 90.0 L493 76.5 L496 63.9 L499 52.7 L502 43.4 L505 36.3 L508 31.8 L511 30.0 L514 31.0 L517 34.8 L520 41.1 L523 49.8 L526 60.5 L529 72.8 L532 86.1 L535 100.0 L538 113.9 L541 127.2 L544 139.5 L547 150.2 L550 158.9 L553 165.2 L556 169.0 L559 170.0 L562 168.2 L565 163.7 L568 156.6 L571 147.3 L574 136.1 L577 123.5 L580 110.0 L583 96.0 L586 82.2 L589 69.1 L592 57.3 L595 47.1 L598 39.0 L601 33.4 L604 30.5 L607 30.3 L610 32.8 L613 38.1 L616 45.8 L619 55.7 L622 67.3 L625 80.3 L628 94.0 L631 108.0 L634 121.6 L637 134.4 L640 145.8 L643 155.4 L646 162.8 L649 167.7 L652 169.9 L655 169.3 L658 165.9 L661 159.9 L664 151.6 L667 141.1 L670 129.1 L673 115.9 L676 102.0 L679 88.1 L682 74.6 L685 62.2 L688 51.2 L691 42.2 L694 35.5 L697 31.4 L700 30.0" class="d-line-acc"/>
  <path d="M40 30.0 L43 30.3 L46 31.0 L49 32.3 L52 34.1 L55 36.3 L58 39.0 L61 42.2 L64 45.8 L67 49.8 L70 54.2 L73 58.9 L76 63.9 L79 69.1 L82 74.6 L85 80.3 L88 86.1 L91 92.0 L94 98.0 L97 104.0 L100 110.0 L103 115.9 L106 121.6 L109 127.2 L112 132.7 L115 137.8 L118 142.7 L121 147.3 L124 151.6 L127 155.4 L130 158.9 L133 161.9 L136 164.5 L139 166.6 L142 168.2 L145 169.3 L148 169.9 L151 170.0 L154 169.5 L157 168.6 L160 167.2 L163 165.2 L166 162.8 L169 159.9 L172 156.6 L175 152.9 L178 148.8 L181 144.3 L184 139.5 L187 134.4 L190 129.1 L193 123.5 L196 117.8 L199 111.9 L202 106.0 L205 100.0 L208 94.0 L211 88.1 L214 82.2 L217 76.5 L220 70.9 L223 65.6 L226 60.5 L229 55.7 L232 51.2 L235 47.1 L238 43.4 L241 40.1 L244 37.2 L247 34.8 L250 32.8 L253 31.4 L256 30.5 L259 30.0 L262 30.1 L265 30.7 L268 31.8 L271 33.4 L274 35.5 L277 38.1 L280 41.1 L283 44.6 L286 48.4 L289 52.7 L292 57.3 L295 62.2 L298 67.3 L301 72.8 L304 78.4 L307 84.1 L310 90.0 L313 96.0 L316 102.0 L319 108.0 L322 113.9 L325 119.7 L328 125.4 L331 130.9 L334 136.1 L337 141.1 L340 145.8 L343 150.2 L346 154.2 L349 157.8 L352 161.0 L355 163.7 L358 165.9 L361 167.7 L364 169.0 L367 169.7 L370 170.0 L373 169.7 L376 169.0 L379 167.7 L382 165.9 L385 163.7 L388 161.0 L391 157.8 L394 154.2 L397 150.2 L400 145.8 L403 141.1 L406 136.1 L409 130.9 L412 125.4 L415 119.7 L418 113.9 L421 108.0 L424 102.0 L427 96.0 L430 90.0 L433 84.1 L436 78.4 L439 72.8 L442 67.3 L445 62.2 L448 57.3 L451 52.7 L454 48.4 L457 44.6 L460 41.1 L463 38.1 L466 35.5 L469 33.4 L472 31.8 L475 30.7 L478 30.1 L481 30.0 L484 30.5 L487 31.4 L490 32.8 L493 34.8 L496 37.2 L499 40.1 L502 43.4 L505 47.1 L508 51.2 L511 55.7 L514 60.5 L517 65.6 L520 70.9 L523 76.5 L526 82.2 L529 88.1 L532 94.0 L535 100.0 L538 106.0 L541 111.9 L544 117.8 L547 123.5 L550 129.1 L553 134.4 L556 139.5 L559 144.3 L562 148.8 L565 152.9 L568 156.6 L571 159.9 L574 162.8 L577 165.2 L580 167.2 L583 168.6 L586 169.5 L589 170.0 L592 169.9 L595 169.3 L598 168.2 L601 166.6 L604 164.5 L607 161.9 L610 158.9 L613 155.4 L616 151.6 L619 147.3 L622 142.7 L625 137.8 L628 132.7 L631 127.2 L634 121.6 L637 115.9 L640 110.0 L643 104.0 L646 98.0 L649 92.0 L652 86.1 L655 80.3 L658 74.6 L661 69.1 L664 63.9 L667 58.9 L670 54.2 L673 49.8 L676 45.8 L679 42.2 L682 39.0 L685 36.3 L688 34.1 L691 32.3 L694 31.0 L697 30.3 L700 30.0" class="d-line-trap d-dash"/>
  <circle cx="40" cy="30.0" r="4.5" class="d-fill-ink"/>
  <circle cx="106" cy="121.6" r="4.5" class="d-fill-ink"/>
  <circle cx="172" cy="156.6" r="4.5" class="d-fill-ink"/>
  <circle cx="238" cy="43.4" r="4.5" class="d-fill-ink"/>
  <circle cx="304" cy="78.4" r="4.5" class="d-fill-ink"/>
  <circle cx="370" cy="170.0" r="4.5" class="d-fill-ink"/>
  <circle cx="436" cy="78.4" r="4.5" class="d-fill-ink"/>
  <circle cx="502" cy="43.4" r="4.5" class="d-fill-ink"/>
  <circle cx="568" cy="156.6" r="4.5" class="d-fill-ink"/>
  <circle cx="634" cy="121.6" r="4.5" class="d-fill-ink"/>
  <circle cx="700" cy="30.0" r="4.5" class="d-fill-ink"/>
  <text x="40" y="196" class="t-small t-acc">solid: true 7 Hz cosine</text>
  <text x="220" y="196" class="t-small t-trap">dashed: 3 Hz alias</text>
  <text x="380" y="196" class="t-small">dots: samples at fs = 10 Hz over one second</text>
</svg></div><figcaption><b>Same samples, two frequencies.</b> With <code>fs = 10</code> Hz, a 7 Hz cosine and a 3 Hz cosine agree at every sample, so nothing after the sampler can tell them apart.</figcaption></figure>

The program below samples several tones at 1 kHz and reports where the FFT peak lands:

```python run=sh-c01-alias
import numpy as np
fs, N = 1000, 1000
t = np.arange(N) / fs
print(" true Hz  peak Hz")
for f in [100, 300, 700, 1300, 1700]:
    X = np.abs(np.fft.rfft(np.sin(2 * np.pi * f * t)))
    print(f"{f:8d} {np.argmax(X) * fs / N:8.1f}")
s300 = np.sin(2 * np.pi * 300 * t)
print("700 Hz equals -(300 Hz):", np.allclose(np.sin(2 * np.pi * 700 * t), -s300))
print("1300 Hz equals +(300 Hz):", np.allclose(np.sin(2 * np.pi * 1300 * t), s300))
print(f"500 Hz sine, largest sample: {np.max(np.abs(np.sin(2 * np.pi * 500 * t))):.3f}")
```

The last line explains why the inequality in the theorem is strict. At exactly `fs = 2f`, a sine can land on its zero crossings every time, and all the samples are zero.

:::trap The anti-aliasing filter must come before the ADC
Once a tone has aliased, it sits in the same band as real signal, and no digital filter can separate them. An analog low-pass filter has to cut the band above `fs/2` before sampling. The same rule applies inside software: lowpass before you decimate.
:::

## Quantization {#ch01-quantization .th}

An ADC with `N` bits over a full-scale range `R` has a step `Q = R / 2^N`, also called one LSB. Rounding leaves an error between `-Q/2` and `+Q/2`. If that error is treated as uniform noise, its power is `Q^2 / 12`. For a full-scale sine this gives the rule **SQNR ≈ 6.02 N + 1.76 dB**, or about 6 dB per bit.

```python run=sh-c01-quant
import numpy as np
n = np.arange(100000)
x = 0.999 * np.sin(2 * np.pi * 0.1234567 * n)    # range is about -1 to +1, so R = 2
print("bits       Q  measured  rule")
for bits in (4, 8, 12, 16):
    Q = 2 / 2 ** bits
    err = np.round(x / Q) * Q - x
    sqnr = 10 * np.log10(np.mean(x ** 2) / np.mean(err ** 2))
    print(f"{bits:4d} {Q:7.5f} {sqnr:9.1f} {6.02 * bits + 1.76:5.1f}")
```

Measured values track the rule closely. A signal that uses only part of the range loses SQNR: at half scale you lose 6 dB, which is one bit of useful resolution. Oversampling helps too. Each doubling of `fs`, followed by a digital lowpass and decimation, gains about 3 dB because the same noise power spreads over a wider band.

## DFT, FFT and frequency resolution {#ch01-fft .th}

The DFT of `N` samples is `X[k] = sum over n of x[n] * exp(-j 2 pi k n / N)`. It correlates the signal with `N` complex tones. The **FFT** is a fast algorithm for the same result. Computing the DFT directly costs `N^2` complex multiplications, and a radix-2 FFT costs about `(N/2) log2 N`.

Three facts answer most questions:

- Bin `k` corresponds to frequency `k * fs / N`. The bin spacing is `fs / N`, which equals `1 / T`, where `T = N / fs` is the observation time.
- For real input, `X[N-k]` is the conjugate of `X[k]`, so only bins 0 to `N/2` carry new information.
- `X[0]` is the sum of the samples, so the mean is `X[0] / N`. A tone of amplitude `A` centred on a bin gives `|X[k]| = A * N / 2`.

```python run=sh-c01-dft
import numpy as np
N = 8
n = np.arange(N)
x = 1 + 3 * np.cos(2 * np.pi * 2 * n / N)
X = np.fft.fft(x)
direct = np.array([np.sum(x * np.exp(-2j * np.pi * k * n / N)) for k in range(N)])
print("|X|:", np.round(np.abs(X), 3) + 0.0)
print("direct DFT matches:", np.allclose(X, direct))
print(f"mean = {abs(X[0]) / N:.3f}, amplitude at bin 2 = {2 * abs(X[2]) / N:.3f}")
for size in (1024, 4096):
    fast = size // 2 * int(np.log2(size))
    print(f"N={size}: direct {size ** 2}, FFT {fast}, ratio {size ** 2 / fast:.0f}")
```

Frequency **resolution** is the ability to separate two nearby tones, and it depends on `T`. Zero padding interpolates the spectrum, which gives a smoother plot, but it adds no new information. Here two tones 4 Hz apart are analysed at `fs = 1000` Hz:

```python run=sh-c01-resolution
import numpy as np
fs = 1000
def peaks(mag):
    return [i for i in range(1, len(mag) - 1)
            if mag[i] > mag[i - 1] and mag[i] > mag[i + 1] and mag[i] > 0.5 * mag.max()]
for N, nfft in [(100, 100), (100, 1000), (1000, 1000)]:
    t = np.arange(N) / fs
    x = np.sin(2 * np.pi * 100 * t) + np.sin(2 * np.pi * 104 * t)
    mag = np.abs(np.fft.rfft(x, nfft))
    found = [f"{i * fs / nfft:.0f}" for i in peaks(mag)]
    print(f"samples={N:4d} fft size={nfft:4d} bin={fs / nfft:4.1f} Hz peaks at {found} Hz")
```

Padding 100 samples to 1000 gives 1 Hz bins and the two tones stay merged. Taking 1000 real samples, which means observing for 1 s, separates them.

:::trap Raising fs does not improve resolution
With `N` fixed, a higher `fs` shortens the observation time and makes the bin spacing larger. To resolve closer tones you must observe for longer.
:::

## Windowing and leakage {#ch01-window .th}

The FFT treats the `N` samples as one period of a repeating signal. If the tone does not fit a whole number of cycles, the repeat has a jump at the seam and energy **leaks** across the spectrum. A window tapers both ends to zero and reduces the jump. The cost is a wider main lobe: 4 bins null to null for a Hann window against 2 bins for no window.

```python run=sh-c01-window
import numpy as np
N = 64
n = np.arange(N)
hann = 0.5 - 0.5 * np.cos(2 * np.pi * n / N)
print("cycles window  dB at bin 14  dB at bin 20  dB at bin 30")
for cycles in (10.0, 10.5):
    x = np.sin(2 * np.pi * cycles * n / N)
    for name, w in [("rect", np.ones(N)), ("hann", hann)]:
        mag = np.abs(np.fft.rfft(x * w))
        db = 20 * np.log10(np.maximum(mag / mag.max(), 1e-12))
        print(f"{cycles:6.1f} {name:6s} {db[14]:13.1f} {db[20]:13.1f} {db[30]:13.1f}")
```

The value -240.0 is the floor set by `1e-12`, and it means there was no leakage to measure. With exactly 10 cycles nothing reaches these bins, with or without the window. At 10.5 cycles the rectangular window leaks strongly, and Hann pushes the far bins down by tens of dB. Use a window when a weak tone may sit near a strong one. Use no window when the tone is known to fit the frame, or when you need the narrowest main lobe.

## Convolution {#ch01-convolution .th}

A linear time-invariant system is fully described by its impulse response `h`, and its output is the **convolution** `y[n] = sum over k of h[k] * x[n-k]`. An input of length `L` and a filter of length `M` give an output of length `L + M - 1`.

Convolution in time equals multiplication in frequency. The DFT version of that theorem gives **circular** convolution, so you must pad both inputs to at least `L + M - 1` to get the linear result:

```python run=sh-c01-conv
import numpy as np
x = np.array([1.0, 2.0, 3.0])
h = np.array([1.0, 1.0])
print("direct:      ", np.convolve(x, h))
print("FFT size 4:  ", np.round(np.fft.ifft(np.fft.fft(x, 4) * np.fft.fft(h, 4)).real, 6) + 0.0)
print("FFT size 3:  ", np.round(np.fft.ifft(np.fft.fft(x, 3) * np.fft.fft(h, 3)).real, 6) + 0.0)
```

The size 3 result is wrong because the last output sample wrapped around and added to the first.

## FIR, IIR and the moving average {#ch01-fir-iir .th}

| Property | FIR | IIR |
|---|---|---|
| Output depends on | past inputs only | past inputs and past outputs |
| Impulse response | finite | infinite in principle |
| Stability | always stable | poles must lie inside the unit circle |
| Phase | exactly linear if coefficients are symmetric | generally nonlinear |
| Cost for a sharp filter | many taps | few coefficients |
| Fixed-point concerns | few | coefficient sensitivity, limit cycles |

The **moving average** is the simplest FIR: `M` equal taps of `1/M`. It reduces white noise power by a factor of `M` and delays the signal by `(M-1)/2` samples. Its magnitude response is `|sin(pi f M / fs) / (M sin(pi f / fs))|`, with nulls at multiples of `fs/M`. The program measures the gain by passing real sines through the filter and compares it with the formula:

```python run=sh-c01-moving-average
import numpy as np
M, fs = 5, 1000
h = np.ones(M) / M
t = np.arange(2000) / fs
print("  f Hz  measured  formula      dB")
for f in [50, 100, 150, 200, 250, 300, 400]:
    y = np.convolve(np.sin(2 * np.pi * f * t), h, mode="valid")[:1000]
    gain = np.sqrt(2 * np.mean(y ** 2))
    formula = abs(np.sin(np.pi * f * M / fs) / (M * np.sin(np.pi * f / fs)))
    db = 20 * np.log10(max(gain, 1e-6))
    print(f"{f:6d} {gain:9.3f} {formula:8.3f} {db:7.1f}")
```

The -120.0 entries are the floor from `1e-6`, at the nulls of 200 and 400 Hz. Between them, the response rises again to 0.247 at 300 Hz (-12.1 dB), so a moving average is a poor frequency-domain lowpass even though it is excellent at smoothing in time.

A one-pole IIR, the **exponential moving average**, needs one coefficient and one stored value: `y[n] = a * y[n-1] + (1-a) * x[n]`. Its pole is at `a`, its DC gain is 1, and its time constant is about `-1 / ln(a)` samples.

:::trap An IIR can be unstable, a FIR cannot
With `a = 1.1` the output grows without limit. Quantized coefficients can also move a pole that started just inside the unit circle to the outside. FIR filters have no feedback, so bounded input always gives bounded output.
:::

## Image filtering as 2-D convolution {#ch01-image .th}

An image filter slides a small **kernel** over the image and computes a weighted sum at each pixel. Blur kernels sum to 1, so overall brightness stays the same. Edge kernels sum to 0, so flat regions give 0. Strictly, convolution flips the kernel. Most image code computes correlation without the flip, and the distinction changes the sign of an asymmetric kernel such as Sobel.

```python run=sh-c01-image
import numpy as np
def filter2d(img, k):     # correlation with no flip; output shrinks at the borders
    kh, kw = k.shape
    out = np.zeros((img.shape[0] - kh + 1, img.shape[1] - kw + 1), dtype=int)
    for r in range(out.shape[0]):
        for c in range(out.shape[1]):
            out[r, c] = np.sum(img[r:r + kh, c:c + kw] * k)
    return out
img = np.array([[0, 0, 0, 9, 9, 9]] * 4)
sobel_x = np.outer([1, 2, 1], [-1, 0, 1])
print("kernel:\n", sobel_x, sep="")
print("response:\n", filter2d(img, sobel_x), sep="")
row = np.array([5, 5, 5, 200, 5, 5, 5])
print("mean of 3:  ", [round(float(np.mean(row[i:i + 3])), 1) for i in range(5)])
print("median of 3:", [float(np.median(row[i:i + 3])) for i in range(5)])
```

The Sobel kernel responds only along the vertical edge. It is also **separable**, as the `np.outer` call shows: a `k × k` filter that factors this way costs `2k` multiplications per pixel in place of `k^2`. The last two lines compare smoothing filters on a single bright pixel. The mean spreads the outlier over its neighbours, and the median removes it. A median filter is nonlinear, so it cannot be written as a convolution.

## Kalman filter intuition {#ch01-kalman .th}

A Kalman filter keeps an estimate `x` and its variance `P`, and it alternates two steps:

1. **Predict.** Move the estimate forward with a model, and add the process noise variance `Q`: `P = P + Q`.
2. **Update.** Blend in a measurement `z` that has noise variance `R`: `K = P / (P + R)`, `x = x + K * (z - x)`, `P = (1 - K) * P`.

The gain `K` is a trust ratio. If the measurement is noisy (large `R`), `K` is small and the filter trusts its prediction. If the model is unreliable (large `Q`), `K` is large and the filter follows the measurement. For linear systems with Gaussian noise this blend is the minimum-variance estimate.

```python run=sh-c01-kalman
zs = [10.8, 9.4, 10.3, 9.7, 10.6, 9.9, 10.2, 9.6]
x, P, Q, R = 0.0, 1000.0, 0.0, 1.0
for z in zs[:4]:
    P += Q
    K = P / (P + R)
    x += K * (z - x)
    P *= 1 - K
    print(f"z={z:5.1f}  K={K:.3f}  x={x:.3f}  P={P:.3f}")
print("running mean of 4:", f"{sum(zs[:4]) / 4:.3f}")
for Q in (0.0, 0.01, 0.1, 1.0):
    P = 1000.0
    for _ in range(200):
        P += Q
        K = P / (P + R)
        P *= 1 - K
    print(f"Q={Q:<5} gain after 200 steps: {K:.3f}")
```

With `Q = 0` and a large initial `P`, the gain falls roughly as `1/n`, and the filter behaves like a running mean of a constant. With `Q > 0` the gain settles at a constant value, and the update becomes an exponential moving average with `a = 1 - K`. That link is a good answer to "what is a Kalman filter doing, intuitively?"

## Drills {#ch01-drills .dr}

:::drill concept
A 5 kHz tone is sampled at 8 kHz. Where does it appear? Where would 13 kHz appear?
---
**Answer.** Both appear at 3 kHz. `|5 - 8| = 3` and `|13 - 16| = 3`.

**Why.** Each tone folds to its distance from the nearest multiple of `fs`, and the result always lies between 0 and `fs/2`.
:::

:::drill output
What does this print?

```python run=sh-c01-d-decimate
import numpy as np
fs = 1000
t = np.arange(1000) / fs
x = np.sin(2 * np.pi * 450 * t)
y = x[::2]
X = np.abs(np.fft.rfft(y))
print(f"{np.argmax(X) * (fs / 2) / len(y):.0f} Hz")
```
---
**Answer.** After taking every second sample, `fs` is 500 Hz, so the Nyquist limit is 250 Hz. The 450 Hz tone aliases to `|450 - 500| = 50` Hz.

**Why.** Decimating without a lowpass filter is sampling without an anti-aliasing filter.
:::

:::drill concept
A 12-bit ADC spans 0 to 3.3 V. What is one LSB, what is the RMS quantization noise, and what is the ideal SQNR for a full-scale sine?
---
**Answer.** `Q = 3.3 / 4096 = 0.806 mV`. The RMS noise is `Q / sqrt(12) = 0.233 mV`. SQNR is `6.02 * 12 + 1.76 = 74.0 dB`.

**Why.** Uniform error over a width of `Q` has variance `Q^2 / 12`.
:::

:::drill tricky
How many bits of resolution do you gain by oversampling by a factor of 4, then lowpass filtering and decimating, with noise-like quantization error?
---
**Answer.** About one bit. Each doubling gains about 3 dB, so a factor of 4 gains about 6 dB.

**Why.** The noise power spreads over a four times wider band, and the lowpass filter keeps a quarter of it.
:::

:::drill concept
An FFT has `N = 1024` and `fs = 48` kHz. Find the bin spacing, the observation time, the highest bin's frequency for real input, and where a 1 kHz tone falls.
---
**Answer.** Spacing is `48000 / 1024 = 46.875` Hz. Time is `1024 / 48000 = 21.33` ms. Bin 512 is 24 kHz. The tone falls at `1000 / 46.875 = 21.33`, between bins 21 and 22, so it will leak.

**Why.** A tone on a bin centre needs a whole number of cycles in the frame.
:::

:::drill concept
You need to separate two tones 1 Hz apart, and `fs = 8` kHz. How many samples do you need with no window? What changes with a Hann window?
---
**Answer.** At least `T = 1` s, or 8000 samples (8192 for a radix-2 FFT). A Hann main lobe is twice as wide, so plan for about 2 s, or 16000 samples.

**Why.** Resolution is about `1 / T` for a rectangular window. Sample rate does not enter into it.
:::

:::drill tricky
A colleague zero-pads a 256-point capture to 4096 points and says the frequency resolution improved 16 times. What is correct and what is wrong?
---
**Answer.** The bin spacing did shrink 16 times, and peak locations are easier to read. The ability to separate close tones did not improve, because `T` is the same.

**Why.** Zero padding interpolates the same underlying spectrum. It contains no new data.
:::

:::drill output
What does this print? Work out the first bin by hand.

```python run=sh-c01-d-fft4
import numpy as np
X = np.fft.fft([1, 2, 3, 4])
print(np.round(X, 3) + 0)
print(f"{np.sum(np.abs(np.array([1, 2, 3, 4])) ** 2)} {np.sum(np.abs(X) ** 2) / 4:.1f}")
```
---
**Answer.** `X[0]` is the sum, 10. `X[1]` is `1 - 2j - 3 + 4j = -2 + 2j`, and `X[3]` is its conjugate. `X[2]` is `1 - 2 + 3 - 4 = -2`. The second line checks Parseval's theorem: the energy is 30 in both domains.

**Why.** `sum |x|^2 = (1/N) sum |X|^2` for the DFT.
:::

:::drill concept
A signal of 1000 samples is filtered by a 31-tap FIR using the FFT. How long is the result, and what is the smallest power-of-two FFT size that avoids wraparound? How many multiplications per input sample does direct filtering need?
---
**Answer.** Length `1000 + 31 - 1 = 1030`. FFT size 2048. Direct filtering takes 31 multiply-accumulates per sample.

**Why.** The FFT multiplies point by point, which gives circular convolution, so the size must cover the full linear length.
:::

:::drill concept
An 8-tap moving average runs at 8 kHz. Find its DC gain, first null and delay.
---
**Answer.** DC gain is 1. The first null is `8000 / 8 = 1` kHz. Delay is `(8 - 1) / 2 = 3.5` samples, or 0.4375 ms.

**Why.** Symmetric coefficients give linear phase, which is a constant delay at all frequencies.
:::

:::drill tricky
For `y[n] = 0.9 y[n-1] + 0.1 x[n]`, is the filter stable, what is its DC gain, and how many samples does it take to reach about 63% of a step?
---
**Answer.** Stable, because the pole 0.9 is inside the unit circle. DC gain is `0.1 / (1 - 0.9) = 1`. It reaches 63% after about 10 samples: the time constant is `-1 / ln(0.9) = 9.49`.

**Why.** The step response is `1 - 0.9^(n+1)`, and at `n + 1 = 10` that is 0.651.
:::

:::drill concept
A 1000 × 1000 image is filtered with a 5 × 5 Gaussian kernel. How many multiplications does the direct method take, and how many does the separable method take? Ignore borders.
---
**Answer.** Direct: `25 * 10^6`. Separable: `(5 + 5) * 10^6 = 10^7`.

**Why.** A Gaussian kernel is the outer product of two 1-D Gaussians, so you can filter rows, then columns.
:::

:::drill concept
Your Kalman filter has predicted `x = 10` with `P = 4`. A measurement `z = 12` arrives with `R = 1`. Give the gain, new estimate and new variance.
---
**Answer.** `K = 4 / 5 = 0.8`. `x = 10 + 0.8 * 2 = 11.6`. `P = 0.2 * 4 = 0.8`.

**Why.** The new variance is smaller than either the prediction's or the measurement's, because two independent sources of information were combined.
:::

:::drill bug
This code should report a 50 Hz peak. Find the bug.

```python run=sh-c01-d-bug-freq
import numpy as np
fs, N = 1000, 256
x = np.sin(2 * np.pi * 50 * np.arange(N) / fs)
X = np.abs(np.fft.fft(x))
print(f"{np.argmax(X) * fs / (N - 1):.2f} Hz")
print(f"{np.argmax(X[:N // 2 + 1]) * fs / N:.2f} Hz")
```
---
**Answer.** Bin spacing is `fs / N`, and the first line divides by `N - 1`. The second line is correct: it gives 50.78 Hz, the bin closest to 50 Hz for this frame length (spacing 3.906 Hz).

**Why.** The bins cover `0` to `fs` without including `fs`. Taking `argmax` over all bins can also land on the mirror image, so search only up to `N/2` for real input.
:::

:::drill bug
A sensor log is sampled at 1 kHz. To save space, a script keeps every tenth sample and reports strange slow oscillations that a lab instrument does not show. What is the bug and the fix?
---
**Answer.** The script decimates without a lowpass filter, so anything above 50 Hz folds into the new 0 to 50 Hz band. Filter first with a cutoff well below 50 Hz, then keep every tenth sample.

**Why.** A moving average of length 10 is a cheap first step, and it has nulls at multiples of 100 Hz, the new sample rate.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1100
Write a streaming moving average in C with a fixed-size circular buffer. Each new sample must take O(1) time, and the code must not use `malloc`.
---
Keep a running sum: add the new sample and subtract the one it replaces.

```c run=sh-c01-c-ma
#include <stdio.h>
#define M 4
typedef struct { int buf[M]; int idx, count; long sum; } Avg;

static double avg_push(Avg *a, int x) {
    a->sum += x - a->buf[a->idx];
    a->buf[a->idx] = x;
    a->idx = (a->idx + 1) % M;
    if (a->count < M) a->count++;
    return (double)a->sum / a->count;
}

int main(void) {
    Avg a = {0};
    int xs[] = {4, 8, 6, 2, 10, 10};
    for (int i = 0; i < 6; i++) printf("%.2f ", avg_push(&a, xs[i]));
    printf("\n");
    return 0;
}
```

An integer sum avoids the rounding drift a floating-point running sum collects over time.
:::

:::drill code rating=1300
Write `goertzel(x, k)`, which returns `|X[k]|^2` for a single DFT bin without computing the whole FFT. Check it against NumPy.
---
Goertzel is a second-order IIR that is run once per sample, followed by one final calculation. It costs O(N) per bin.

```python run=sh-c01-c-goertzel
import numpy as np
def goertzel(x, k):
    coeff = 2 * np.cos(2 * np.pi * k / len(x))
    s1 = s2 = 0.0
    for v in x:
        s1, s2 = v + coeff * s1 - s2, s1
    return s1 * s1 + s2 * s2 - coeff * s1 * s2

N = 200
x = np.sin(2 * np.pi * 13 * np.arange(N) / N) + 0.5 * np.cos(2 * np.pi * 40 * np.arange(N) / N)
for k in (13, 40, 7):
    print(f"bin {k:2d}: goertzel {goertzel(x, k):12.3f}  fft {np.abs(np.fft.fft(x)[k]) ** 2:12.3f}")
```

Goertzel beats an FFT when you need only a few bins, as in tone detection.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- `fs > 2 fmax`. Alias: `|f - fs * round(f / fs)|`. Anti-alias with an analog filter before the ADC, and lowpass before decimating.
- `Q = R / 2^N`, noise power `Q^2 / 12`, SQNR `≈ 6.02 N + 1.76` dB for a full-scale sine.
- Bin `k` is at `k fs / N`. Spacing is `fs / N = 1 / T`. Only longer observation improves resolution, and zero padding only interpolates.
- `|X[k]| = A N / 2` for a tone on a bin, `X[0] = sum`. FFT cost is about `(N/2) log2 N`.
- Windows trade a wider main lobe for lower leakage. Hann main lobe: 4 bins. Rectangular: 2 bins.
- Linear convolution length is `L + M - 1`. Pad the FFT to at least that length.
- FIR: always stable, can be linear phase, needs more taps. IIR: compact, needs poles inside the unit circle.
- Moving average: nulls at `k fs / M`, delay `(M-1)/2`, noise power divided by `M`.
- EMA: `y = a y + (1-a) x`, time constant `≈ -1 / ln(a)` samples.
- Blur kernels sum to 1, edge kernels sum to 0. Separable filters cost `2k` per pixel instead of `k^2`. Median is nonlinear.
- Kalman: `K = P / (P + R)`. Large `R` means trust the model, large `Q` means trust the measurement.
