---
title: Feedback control and PID
part: Part B · Control
lede: A controller measures what a system is doing, compares it with what you want, and corrects the difference. This chapter covers the responses you are expected to recognise, what poles say about stability, what each PID term does, and how the loop looks as code, including two common bugs in a first implementation: windup and a poorly handled derivative. It ends with a short state-space view.
desc: open and closed loop, first and second order, poles, PID terms, tuning, windup, discrete PID, state space
hours: 4
prereqs: basic differential equations, complex numbers, Chapter 1 for discrete-time poles
---

## Open loop and closed loop {#ch02-loops .th}

An **open-loop** controller applies a fixed command with no measurement, such as a toaster running on a timer. It is simple and adds no stability risk of its own, but it cannot correct for disturbances or model errors. A **closed-loop** controller measures the output `y`, computes the error `e = r - y` against the setpoint `r`, and acts on the error.

Feedback reduces sensitivity to disturbances and plant changes, and it can stabilise a plant that is unstable by itself. The price is a sensor, and the risk that a delayed correction arrives at the wrong time and causes oscillation.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 220" role="img" aria-label="PID block diagram: the error goes through parallel P, I and D paths, is summed, limited, drives the plant, and the measured output is fed back and subtracted from the setpoint">
  <text x="16" y="92" class="t-mono">r</text>
  <path d="M30 100 L 76 100" class="d-line"/><path d="M76 96 L 84 100 L 76 104 Z" class="d-fill-ink"/>
  <circle cx="96" cy="100" r="12" class="d-box"/><text x="96" y="105" text-anchor="middle" class="t-mono">Σ</text>
  <text x="74" y="130" class="t-mono t-trap">−</text>
  <path d="M108 100 L 145 100 M145 50 L 145 150 M145 50 L 175 50 M145 100 L 175 100 M145 150 L 175 150" class="d-line"/>
  <text x="122" y="92" class="t-mono">e</text>
  <rect x="175" y="30" width="125" height="40" rx="6" class="d-acc"/><text x="237" y="55" text-anchor="middle" class="t-mono">Kp · e</text>
  <rect x="175" y="80" width="125" height="40" rx="6" class="d-acc"/><text x="237" y="105" text-anchor="middle" class="t-mono">Ki · ∫e dt</text>
  <rect x="175" y="130" width="125" height="40" rx="6" class="d-acc"/><text x="237" y="155" text-anchor="middle" class="t-mono">Kd · de/dt</text>
  <path d="M300 50 L 335 50 L 335 88 M300 100 L 323 100 M300 150 L 335 150 L 335 112" class="d-line"/>
  <circle cx="335" cy="100" r="12" class="d-box"/><text x="335" y="105" text-anchor="middle" class="t-mono">Σ</text>
  <path d="M347 100 L 380 100" class="d-line"/><text x="357" y="92" class="t-mono">u</text>
  <rect x="380" y="78" width="70" height="44" rx="6" class="d-trap"/><text x="415" y="105" text-anchor="middle" class="t-small">limit</text>
  <path d="M450 100 L 490 100" class="d-line"/>
  <rect x="490" y="72" width="100" height="56" rx="6" class="d-key"/><text x="540" y="105" text-anchor="middle" class="t-mono">plant</text>
  <path d="M590 100 L 690 100" class="d-line"/><path d="M682 96 L 690 100 L 682 104 Z" class="d-fill-ink"/>
  <text x="696" y="105" class="t-mono">y</text>
  <path d="M640 100 L 640 196 L 96 196 L 96 112" class="d-line"/>
  <rect x="330" y="182" width="90" height="28" rx="6" class="d-soft"/><text x="375" y="201" text-anchor="middle" class="t-small">sensor</text>
</svg></div><figcaption><b>A PID loop.</b> The controller sums three functions of the error. The actuator limit is part of the real loop, and it is the reason integral windup exists.</figcaption></figure>

## First-order and second-order responses {#ch02-responses .th}

A **first-order** system, `tau * dy/dt + y = K * u`, models a heater or an RC circuit. A step in `u` gives `y(t) = K * u * (1 - exp(-t / tau))`, with no overshoot. It reaches 63.2% at `tau`, 86.5% at `2 tau`, 95.0% at `3 tau` and 98.2% at `4 tau`.

A **second-order** system adds a second energy store, such as a mass on a spring: `y'' + 2 zeta wn y' + wn^2 y = wn^2 u`. The natural frequency `wn` sets speed and the damping ratio `zeta` sets shape:

- `zeta < 1`: underdamped, oscillates while settling. Overshoot is `exp(-pi zeta / sqrt(1 - zeta^2))`, and peak time is `pi / (wn sqrt(1 - zeta^2))`.
- `zeta = 1`: critically damped, the fastest response with no overshoot.
- `zeta > 1`: overdamped, slow with no overshoot.

Settling to within 2% takes about `4 / (zeta wn)` when `zeta` is well below 1. The program simulates the step and compares it with these formulas:

```python run=sh-c02-second-order
import math
def step(zeta, wn, T=6.0, dt=0.0005):
    y, v, peak, last_out = 0.0, 0.0, 0.0, 0.0
    for i in range(int(T / dt)):
        a = wn * wn * (1 - y) - 2 * zeta * wn * v
        v += a * dt
        y += v * dt
        peak = max(peak, y)
        if abs(y - 1) > 0.02:
            last_out = (i + 1) * dt
    return peak, last_out
wn = 10.0
print("zeta  overshoot%  formula%  settle s  4/(zeta wn)")
for zeta in (0.2, 0.5, 0.7, 1.0, 2.0):
    peak, ts = step(zeta, wn)
    os_sim = max(peak - 1, 0) * 100
    os_f = 100 * math.exp(-math.pi * zeta / math.sqrt(1 - zeta ** 2)) if zeta < 1 else 0.0
    print(f"{zeta:4.1f} {os_sim:11.1f} {os_f:9.1f} {ts:9.2f} {4 / (zeta * wn):12.2f}")
```

The 2% formula is a good estimate at `zeta` of 0.2 to 0.7. It underestimates badly at `zeta = 1` and above, so do not use it there.

## Stability and poles {#ch02-stability .th}

A system is **BIBO stable** if every bounded input gives a bounded output. For a linear system the test is on the **poles**, the roots of the characteristic polynomial. A pole `s = sigma + j w` contributes a term `exp(sigma t) * cos(w t)` to the response:

- Real part below 0 means the term decays. Real part above 0 means it grows.
- A non-zero imaginary part means oscillation at `w`.
- A pole further left decays faster, so the slowest (rightmost) poles dominate the response.

In discrete time the same question moves to the z-plane, where a pole `z` contributes `z^k`. The stable region is `|z| < 1`. Sampling a continuous pole `s` with period `dt` gives `z = exp(s dt)`.

The next program uses the classic plant `1 / (s + 1)^3` with proportional gain `K`. The closed-loop polynomial is `(s + 1)^3 + K`, or `s^3 + 3 s^2 + 3 s + 1 + K`:

```python run=sh-c02-poles
import numpy as np
for K in (1, 8, 10):
    poles = np.roots([1, 3, 3, 1 + K])
    worst = max(p.real for p in poles)
    state = "stable" if worst < -1e-9 else ("marginal" if worst < 1e-9 else "unstable")
    print(f"K={K:2d} rightmost real part {round(worst, 3) + 0.0:+.3f}  largest |imag| {max(abs(p.imag) for p in poles):.3f}  {state}")
```

At `K = 8` a pole pair sits on the imaginary axis and the loop oscillates steadily at 1.732 rad/s. Above that it diverges. Raising the gain of a plant with enough lag eventually destabilises it.

**Gain and phase margin** say how far a loop is from this point. Phase margin is the extra lag the loop tolerates at the frequency where loop gain is 1. Gain margin is the extra gain it tolerates at the frequency where phase reaches -180°. Delay adds lag without changing gain, `w * Td` radians at frequency `w`, which is why slow sensors and long control periods hurt.

## The P, I and D terms {#ch02-pid .th}

`u(t) = Kp * e + Ki * integral(e dt) + Kd * de/dt`

- **P** reacts to the present error. Alone it leaves a steady-state error whenever a plant needs a non-zero input to hold the setpoint. With plant DC gain `K`, the final error for a unit step is `1 / (1 + Kp K)`.
- **I** reacts to accumulated error. It keeps changing `u` until the error is zero, so it removes steady-state error, and it adds lag that can cause overshoot.
- **D** reacts to the error's rate of change. It adds damping by opposing fast movement, and it amplifies measurement noise.

The program runs a discrete loop on a first-order plant with `K = 1`, `tau = 1` s and a 0.1 s control period. Between control updates the plant is solved exactly: `y = a * y + (1 - a) * u` with `a = exp(-dt / tau)`.

```python run=sh-c02-p-vs-pi
import math
def run(Kp, Ki, T=10.0, dt=0.1):
    a = math.exp(-dt)
    y = integ = 0.0
    out = []
    for _ in range(int(T / dt) + 1):
        out.append(y)
        e = 1.0 - y
        integ += Ki * e * dt
        y = a * y + (1 - a) * (Kp * e + integ)
    return out
cases = [("P 2", 2, 0), ("P 8", 8, 0), ("PI 2,2", 2, 2), ("PI 2,4", 2, 4)]
rows = [run(kp, ki) for _, kp, ki in cases]
print("t s  " + "".join(f"{name:>8}" for name, _, _ in cases))
for t in (0, 0.2, 0.5, 1, 2, 3, 5, 10):
    print(f"{t:4.1f} " + "".join(f"{r[int(t * 10 + 0.5)]:8.3f}" for r in rows))
print("peak " + "".join(f"{max(r):8.3f}" for r in rows))
```

The final values with P alone match the formula: `Kp = 2` stops at `2/3`, and `Kp = 8` stops at `8/9`. Both PI loops reach 1.000. With `Kp = 2, Ki = 4` the closed-loop poles are the roots of `s^2 + 3 s + 4` (`wn = 2`, `zeta = 0.75`). The pure second-order formula predicts 2.8% overshoot, and this loop overshoots about 8% because the PI controller also adds a zero, and the control period adds some delay.

### Tuning effects

| Increase | Rise time | Overshoot | Steady-state error | Stability |
|---|---|---|---|---|
| `Kp` | faster | more | smaller, not zero | often worse |
| `Ki` | faster | more | removed | worse |
| `Kd` | small change | less | none | better if noise and delay are small |

These are the usual directions, and real plants can differ. A common manual recipe is: raise `Kp` until the response is quick with some overshoot, add `Ki` to remove the remaining error, and add `Kd` only if overshoot is a problem and the signal is clean. The classic **Ziegler-Nichols** method raises P-only gain until the loop oscillates steadily at gain `Ku` and period `Tu`, then uses `Kp = 0.6 Ku`, `Ti = Tu / 2`, `Td = Tu / 8`, where `Ki = Kp / Ti` and `Kd = Kp Td`. It gives an aggressive starting point.

## Integral windup {#ch02-windup .th}

Real actuators saturate. While `u` sits at its limit, the error stays large and the integrator keeps growing, although the actuator can do nothing more. When `y` reaches the setpoint, the integrator is far too large, and the error has to stay on the other side long enough to bring it down. That is **windup**: large overshoot and slow recovery.

The simplest fix is **clamping**, or conditional integration: skip the integrator update whenever the output is saturated.

```python run=sh-c02-windup
import math
def run(clamp, Kp=5.0, Ki=5.0, umax=1.2, T=20.0, dt=0.1):
    a = math.exp(-dt)
    y = integ = 0.0
    out = []
    for _ in range(int(T / dt) + 1):
        out.append(y)
        e = 1.0 - y
        u = Kp * e + integ + Ki * e * dt
        limited = max(-umax, min(umax, u))
        if not clamp or u == limited:
            integ += Ki * e * dt
        y = a * y + (1 - a) * limited
    return out
free, clamped = run(False), run(True)
print(" t s    no clamp   clamped")
for t in (1, 2, 3, 4, 5, 6, 8):
    print(f"{t:4d} {free[t * 10]:11.3f} {clamped[t * 10]:9.3f}")
def settle(r):
    return max(i for i, v in enumerate(r) if abs(v - 1) > 0.02) * 0.1
print(f"peak   {max(free):9.3f} {max(clamped):9.3f}")
print(f"settle {settle(free):9.1f} {settle(clamped):9.1f}")
```

The same gains and the same actuator give very different results. Without clamping the output overshoots by 18% and takes 6.5 s to settle within 2%. With clamping the peak is 1.000 to three decimals, and it settles in 3.4 s.

:::trap Saturation hides in the plant model
A simulation without actuator limits will never show windup. Add the limit to any simulated plant, and add other anti-windup methods, such as back-calculation, only if clamping is not enough.
:::

## Discrete-time implementation {#ch02-discrete .th}

A controller in firmware runs at a fixed period `dt`. The usual form is:

```c
/* Run once every dt seconds from a timer. */
float pid_step(Pid *c, float setpoint, float measured) {
    float e = setpoint - measured;
    float d = -(measured - c->prev_meas) / c->dt;      /* derivative on measurement */
    c->d_filt += c->alpha * (d - c->d_filt);           /* lowpass the derivative */
    float u = c->kp * e + c->integ + c->ki * e * c->dt + c->kd * c->d_filt;
    float out = u > c->umax ? c->umax : (u < c->umin ? c->umin : u);
    if (u == out) c->integ += c->ki * e * c->dt;       /* clamp anti-windup */
    c->prev_meas = measured;
    return out;
}
```

Five details matter:

- **Constant `dt`.** Run the loop from a timer, because jitter changes the effective gains of the I and D terms.
- **Derivative on measurement.** Differentiating `e` produces a huge spike on a setpoint step, called **derivative kick**. Differentiating `-y` gives the same damping with no kick.
- **Filter the derivative.** Noise of size `n` becomes `2n / dt` in the worst case, so small `dt` makes this worse.
- **Sampling rate.** A common rule of thumb is 10 to 30 samples per period of the closed-loop bandwidth.
- **Delay.** Sampling and computing add delay, so a discrete loop can go unstable where the continuous model cannot.

The last point is easy to show. A first-order plant under P control is stable at any gain in continuous time. With sampling, the closed-loop pole is `z = a - (1 - a) Kp`, which leaves the unit circle when `Kp` exceeds `(1 + a) / (1 - a)`, about 20 for `a = exp(-0.1)`:

```python run=sh-c02-discrete-limit
import math
a = math.exp(-0.1)
print(f"limit Kp = {(1 + a) / (1 - a):.2f}")
for Kp in (2, 15, 25):
    z = a - (1 - a) * Kp
    y, ys = 0.0, []
    for k in range(13):
        ys.append(y)
        y = a * y + (1 - a) * Kp * (1 - y)
    print(f"Kp={Kp:2d} pole {z:+.3f} |", " ".join(f"{v:.2f}" for v in ys[::3]))
```

## A simple state-space view {#ch02-state-space .th}

State space writes the system as first-order vector equations: `x' = A x + B u` and `y = C x + D u`. The state `x` holds what you must remember, such as position and velocity. The poles are the eigenvalues of `A`, so the stability test becomes an eigenvalue check, and the form handles many inputs and outputs naturally.

**State feedback** `u = -K x` changes the dynamics to `A - B K`, which moves the poles if the system is **controllable**. If you cannot measure the full state, an **observer** estimates it from `y`. A Kalman filter (Chapter 1) is the observer that is optimal under Gaussian noise.

The discrete double integrator below models a mass pushed by a force, with `dt = 0.1`. The gains `K = [4, 3.8]` were found by matching the characteristic polynomial of `A - B K` to `(z - 0.8)^2`:

```python run=sh-c02-state-space
import numpy as np
A = np.array([[1.0, 0.1], [0.0, 1.0]])
B = np.array([[0.005], [0.1]])
K = np.array([[4.0, 3.8]])
print("open-loop |eig| :", np.round(np.abs(np.linalg.eigvals(A)), 3))
print("closed-loop eig :", np.round(np.sort(np.linalg.eigvals(A - B @ K).real), 3))
x = np.array([[1.0], [0.0]])
for k in range(41):
    if k % 10 == 0:
        print(f"k={k:2d} position {x[0, 0]:+.4f} velocity {x[1, 0]:+.4f}")
    x = (A - B @ K) @ x
```

Open-loop eigenvalues of 1 mean the mass keeps drifting. Feedback moves both to 0.8, and the state decays to near zero.

## Drills {#ch02-drills .dr}

:::drill concept
A first-order plant has `K = 5` and `tau = 2` s. For a step input `u = 2`, find the final value and the output at 2 s and at 6 s.
---
**Answer.** The final value is 10. At `t = tau = 2` s, `y = 6.32`. At `t = 3 tau = 6` s, `y = 9.50`.

**Why.** `y = K u (1 - exp(-t / tau))`, with 63.2% and 95.0% at those times.
:::

:::drill concept
A closed-loop characteristic polynomial is `s^2 + 4 s + 25`. Find `wn`, `zeta`, the poles and the percentage overshoot.
---
**Answer.** `wn = 5`, and `2 zeta wn = 4` gives `zeta = 0.4`. Poles are `-2 ± j 4.58`. Overshoot is `exp(-pi * 0.4 / sqrt(0.84)) = 25.4%`.

**Why.** Compare with `s^2 + 2 zeta wn s + wn^2`. The imaginary part is `wn sqrt(1 - zeta^2)`.
:::

:::drill concept
With `zeta = 0.5` and `wn = 10` rad/s, estimate overshoot, peak time and 2% settling time.
---
**Answer.** Overshoot 16.3%. Peak time `pi / (10 * 0.866) = 0.363` s. Settling time about `4 / 5 = 0.8` s.

**Why.** These are the standard formulas from the second-order section, and the simulation there measured the overshoot as 16.3%.
:::

:::drill concept
A plant has DC gain 2 and is under proportional control with `Kp = 4`. What is the steady-state error for a unit step?
---
**Answer.** `1 / (1 + 2 * 4) = 1/9 = 0.111`.

**Why.** At steady state `y = K Kp (1 - y)`, so `y = 8/9`.
:::

:::drill concept
Which of these discrete poles are stable: 0.9, -0.95, 1.1, `0.6 ± j 0.7`? What does each response look like?
---
**Answer.** Stable: 0.9 (smooth decay), -0.95 (decay with alternating sign), `0.6 ± j 0.7` (magnitude 0.922, a decaying oscillation). Unstable: 1.1 (exponential growth).

**Why.** Only `|z|` decides stability. `sqrt(0.36 + 0.49) = 0.922`.
:::

:::drill tricky
You simulate `tau dy/dt = u - y` with forward Euler. For which step sizes is the free response stable, and how does this compare with the true system?
---
**Answer.** `y[k+1] = (1 - dt / tau) y[k]`, which is stable only for `dt < 2 tau`. The true system is stable for all `tau > 0`.

**Why.** Instability at large `dt` comes from the numerical method. The exact discretisation `a = exp(-dt / tau)` always has `|a| < 1`.
:::

:::drill concept
With `G(s) = 1 / (s + 1)` and PI gains `Kp` and `Ki`, write the closed-loop characteristic polynomial. Choose gains for `wn = 2` and `zeta = 1`.
---
**Answer.** `s^2 + (1 + Kp) s + Ki`. `Ki = wn^2 = 4`, and `1 + Kp = 2 zeta wn = 4`, so `Kp = 3`.

**Why.** Loop transfer is `(Kp s + Ki) / (s (s + 1))`. Setting 1 plus that to zero gives the polynomial.
:::

:::drill concept
Do one step of a discrete PID by hand. `Kp = 1`, `Ki = 5`, `Kd = 0.1`, `dt = 0.01`, previous error 1.0, current error 0.8, and accumulated `integral(e dt) = 0.2` before this step. Find `u`, using the difference of errors for D.
---
**Answer.** The integral becomes `0.2 + 0.8 * 0.01 = 0.208`. The derivative is `(0.8 - 1.0) / 0.01 = -20`. So `u = 0.8 + 5 * 0.208 + 0.1 * (-20) = 0.8 + 1.04 - 2 = -0.16`.

**Why.** The D term is the largest here. A small change in error divided by a small `dt` is a large number, which is why noise matters.
:::

:::drill concept
A P-only test gives sustained oscillation at `Ku = 10` with `Tu = 2` s. Find classic Ziegler-Nichols PID gains.
---
**Answer.** `Kp = 6`, `Ti = 1` s, `Td = 0.25` s. So `Ki = 6 / 1 = 6` and `Kd = 6 * 0.25 = 1.5`.

**Why.** The rule is `Kp = 0.6 Ku`, `Ti = Tu / 2`, `Td = Tu / 8`.
:::

:::drill tricky
A loop has 45° of phase margin at a crossover of 10 rad/s. How much pure delay can it tolerate before going unstable? How much phase does a 50 ms delay cost at that frequency?
---
**Answer.** 45° is 0.785 rad, so the delay margin is `0.785 / 10 = 78.5` ms. A 50 ms delay costs `10 * 0.05 = 0.5` rad, or 28.6°.

**Why.** Delay adds lag `w Td` and leaves gain unchanged.
:::

:::drill tricky
A constant disturbance acts on the plant input in a stable PI loop. What is the steady-state error, and why?
---
**Answer.** Zero. If the error were non-zero at steady state, the integrator would still be changing, so it would not be a steady state.

**Why.** The integrator settles at whatever value cancels the disturbance. A P-only loop has a non-zero error here.
:::

:::drill concept
For `A = [[0, 1], [-4, -2]]`, find the poles, `wn` and `zeta`.
---
**Answer.** The characteristic polynomial is `s^2 + 2 s + 4`, so poles are `-1 ± j 1.732`, `wn = 2`, `zeta = 0.5`.

**Why.** The eigenvalues of `A` are the poles. For this companion form, the bottom row gives the coefficients.
:::

:::drill output
This plant has a negative gain, and the code uses the usual error sign. What does this print?

```python run=sh-c02-d-sign
y = 0.0
for k in range(5):
    e = 1.0 - y
    u = 0.5 * e
    y = 0.8 * y - 0.2 * u
print(f"{y:.3f}")
y = 0.0
for k in range(200):
    y = 0.8 * y - 0.2 * 0.5 * (1.0 - y)
print(f"{y:.3f}")
```
---
**Answer.** The output moves away from the setpoint of 1. It is -0.410 after 5 steps and settles at -1.000. The plant's DC gain is `-0.2 / (1 - 0.8) = -1`, so at steady state `y = -1 * 0.5 * (1 - y)`, which gives `y = -1`.

**Why.** A negative plant gain turns the loop into positive feedback unless `Kp` is negative too. The pole here is `0.8 + 0.2 Kp`, which reaches 1 at `Kp = 1`, so a larger positive gain makes the loop unstable.
:::

:::drill bug
This integral term has two bugs. Name them.

```python
integral += Ki * error          # called from a loop with varying dt
u = Kp * error + integral
actuator(min(u, 100))           # limit at 100
```
---
**Answer.** First, the integral ignores `dt`, so its effect depends on the loop rate. Use `integral += Ki * error * dt`. Second, the integrator keeps growing while `u` is above 100, which is windup. Skip the update when the output is saturated.

**Why.** Scaling by `dt` is also why you must re-tune `Ki` if the code assumed a fixed rate that later changes.
:::

:::drill bug
After a setpoint change, the actuator jumps to its limit for one sample, and then behaves normally. The code uses `d = (error - prev_error) / dt`. What is the cause and the fix?
---
**Answer.** This is derivative kick. A setpoint step makes `error` jump in one sample, and dividing by a small `dt` gives a huge D term. Use `d = -(measured - prev_measured) / dt`.

**Why.** Between setpoint changes, `de/dt` equals `-dy/dt`, so the damping behaviour is unchanged.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1300
Write a PID in C with derivative on measurement and clamp anti-windup, and run it on the first-order plant `y = 0.9 y + 0.1 u` for a unit step, with `dt = 0.1`.
---
Keep the integrator, the previous measurement and the limits in a struct.

```c run=sh-c02-c-pid
#include <stdio.h>
typedef struct { double kp, ki, kd, dt, umin, umax, integ, prev; } Pid;

static double pid_step(Pid *c, double r, double y) {
    double e = r - y;
    double d = -(y - c->prev) / c->dt;
    double u = c->kp * e + c->integ + c->ki * e * c->dt + c->kd * d;
    double out = u > c->umax ? c->umax : (u < c->umin ? c->umin : u);
    if (out == u) c->integ += c->ki * e * c->dt;
    c->prev = y;
    return out;
}

int main(void) {
    Pid c = {.kp = 2, .ki = 2, .kd = 0.1, .dt = 0.1, .umin = 0, .umax = 3};
    double y = 0;
    for (int k = 0; k <= 50; k++) {
        if (k % 10 == 0) printf("t=%.0f y=%.3f\n", k * c.dt, y);
        y = 0.9 * y + 0.1 * pid_step(&c, 1.0, y);
    }
    return 0;
}
```

The derivative uses the measurement, so the unit step at the start causes no spike. `prev` starts at 0, which matches the plant's initial output.
:::

:::drill code rating=1200
Write `step_metrics(t, y, final=1.0)`, which returns the 10-90% rise time, the percentage overshoot and the 2% settling time. Test it on a known second-order step.
---
Find the first crossings for rise time, the maximum for overshoot, and the last sample outside the band for settling.

```python run=sh-c02-c-metrics
import numpy as np
def step_metrics(t, y, final=1.0):
    t10 = t[np.argmax(y >= 0.1 * final)]
    t90 = t[np.argmax(y >= 0.9 * final)]
    overshoot = max(y.max() / final - 1, 0) * 100
    outside = np.nonzero(np.abs(y - final) > 0.02 * final)[0]
    settle = t[outside[-1] + 1] if len(outside) else t[0]
    return t90 - t10, overshoot, settle

zeta, wn = 0.5, 10.0
wd = wn * np.sqrt(1 - zeta ** 2)
t = np.arange(0, 3, 0.001)
y = 1 - np.exp(-zeta * wn * t) * (np.cos(wd * t) + zeta * wn / wd * np.sin(wd * t))
rise, over, settle = step_metrics(t, y)
print(f"rise {rise:.3f} s, overshoot {over:.1f}%, settle {settle:.3f} s")
```

Overshoot matches the 16.3% from the formula. Using the analytic response gives a test that does not depend on any simulator.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- Open loop has no measurement. Closed loop rejects disturbances, and it can oscillate if delay and gain are too high.
- First order: 63.2% at `tau`, 95% at `3 tau`, no overshoot.
- Second order: overshoot `exp(-pi zeta / sqrt(1 - zeta^2))`, peak time `pi / wd`, 2% settling `≈ 4 / (zeta wn)`. `zeta = 0.5` gives 16.3%.
- Stable: continuous poles have negative real parts, discrete poles have `|z| < 1`, and `z = exp(s dt)`.
- P only: error `1 / (1 + Kp K)`. I removes the error and adds lag. D adds damping and amplifies noise.
- Windup: the integrator grows during saturation. The fix is to clamp, or skip integration when the output is limited.
- Discrete PID: fixed `dt`, derivative on measurement, filtered derivative, integrator scaled by `dt`.
- Delay costs `w Td` radians of phase. Margins measure how far the loop is from instability.
- Ziegler-Nichols PID: `Kp = 0.6 Ku`, `Ti = Tu / 2`, `Td = Tu / 8`.
- State space: `x' = A x + B u`. Poles are the eigenvalues of `A`, and state feedback gives `A - B K`.
