---
title: Digital logic, RTL, timing and SoC buses
part: Part C · Digital hardware
lede: Hardware runs in parallel and everything happens on clock edges, which is the main mental shift for a software background. This chapter goes from gates and state machines to Verilog, then to the timing rules every synchronous design has to meet, crossing between clock domains, and how a chip is built. It ends with the system view: handshakes, memory hierarchy, and the trade between power and performance.
desc: FSMs, Verilog, blocking vs non-blocking, setup and hold, CDC, pipelining, FPGA vs ASIC, design flow, AXI, power
hours: 5
prereqs: binary numbers, Boolean algebra, basic computer organisation
---

## Combinational and sequential logic {#ch03-logic .th}

**Combinational** logic has no memory: its output depends only on its present inputs, after a propagation delay. Gates, multiplexers and adders are combinational. **Sequential** logic has state, so its output also depends on the past.

- NAND and NOR are each **universal**: any Boolean function can be built from one of them alone.
- A full adder computes `sum = a ^ b ^ cin` and `cout = (a & b) | (cin & (a ^ b))`. In a ripple-carry adder the carry passes through every bit, so its delay grows with width.
- A **latch** is level-sensitive: it follows its input while enabled. A **flip-flop** is edge-triggered: it samples its input only at the clock edge. Synchronous design uses flip-flops because the edge gives the whole chip one timing reference.
- The **critical path** is the slowest combinational path between two flip-flops, and it limits the clock frequency.

## FSMs: Moore and Mealy {#ch03-fsm .th}

A finite state machine is a state register, next-state logic and output logic. The two standard forms differ in where the output comes from:

| | Moore | Mealy |
|---|---|---|
| Output depends on | state only | state and current input |
| Timing | one cycle later, and glitch-free if the output is registered | same cycle as the input, and input glitches can reach the output |
| States | usually more | usually fewer |

The classic question is a detector for the sequence `1011`, with overlaps allowed. Each state records how much of the pattern has been seen. The Moore version needs a fifth state to hold the output. The Mealy version has four, and fires on the transition out of `S3`:

```python run=sh-c03-fsm
MOORE = {"S0": ("S0", "S1"), "S1": ("S2", "S1"), "S2": ("S0", "S3"),
         "S3": ("S2", "S4"), "S4": ("S2", "S1")}             # state: (next on 0, next on 1)
MEALY = {"S0": ("S0", "S1"), "S1": ("S2", "S1"), "S2": ("S0", "S3"),
         "S3": ("S2", "S1")}

bits = [int(c) for c in "101101110110"]
moore = mealy = "S0"
print("cycle in moore_state moore_out mealy_state mealy_out")
hits_moore, hits_mealy = [], []
for i, b in enumerate(bits):
    moore_out = int(moore == "S4")                  # depends only on the state
    mealy_out = int(mealy == "S3" and b == 1)       # depends on the state and the input
    print(f"{i:5d} {b:2d} {moore:>11} {moore_out:9d} {mealy:>11} {mealy_out:9d}")
    if moore_out: hits_moore.append(i)
    if mealy_out: hits_mealy.append(i)
    moore = MOORE[moore][b]
    mealy = MEALY[mealy][b]
text = "".join(map(str, bits))
print("pattern ends at", [i + 3 for i in range(len(text) - 3) if text[i:i + 4] == "1011"])
print("mealy hits", hits_mealy, " moore hits", hits_moore)
```

The Mealy output pulses in the cycle of the last bit, and the Moore output pulses one cycle later. Here is the Moore machine in Verilog, with the two-block style: one combinational block for the next state, and one clocked block for the register.

```verilog
module det1011_moore (
  input  wire clk, rst_n, din,
  output wire hit
);
  localparam S0 = 3'd0, S1 = 3'd1, S2 = 3'd2, S3 = 3'd3, S4 = 3'd4;
  reg [2:0] state, nxt;

  always @(*) begin
    case (state)
      S0:      nxt = din ? S1 : S0;
      S1:      nxt = din ? S1 : S2;
      S2:      nxt = din ? S3 : S0;
      S3:      nxt = din ? S4 : S2;
      S4:      nxt = din ? S1 : S2;
      default: nxt = S0;
    endcase
  end

  always @(posedge clk or negedge rst_n)
    if (!rst_n) state <= S0;
    else        state <= nxt;

  assign hit = (state == S4);
endmodule
```

For the Mealy version, remove `S4`, send `S3` to `din ? S1 : S2`, and write `assign hit = (state == S3) && din;`.

State encoding is a design choice. Binary uses the fewest flops, `ceil(log2 N)`. One-hot uses one flop per state and makes next-state logic simple and fast. It suits FPGAs, where flops are plentiful. Gray encoding changes one bit per transition on a linear sequence.

## Verilog basics {#ch03-verilog .th}

Verilog describes hardware, so every `assign` and `always` block runs in parallel. The usual building blocks are below.

```verilog
module counter #(parameter WIDTH = 8) (
  input  wire             clk, rst_n, en,
  output reg  [WIDTH-1:0] count
);
  always @(posedge clk or negedge rst_n)
    if (!rst_n)  count <= {WIDTH{1'b0}};
    else if (en) count <= count + 1'b1;
endmodule
```

Combinational logic can be written with `assign` or with `always @(*)`. These two describe the same multiplexer, and you would use one of them:

```verilog
assign y = sel ? a : b;

always @(*) begin
  y = b;              // a default value prevents a latch
  if (sel) y = a;
end
```

`wire` is driven by `assign` or by a module output. `reg` is any variable assigned inside `always`. A `reg` becomes a flip-flop only when the block is clocked, so `reg` does not by itself mean a register.

### Blocking and non-blocking

A **blocking** assignment (`=`) updates at once, so the next line sees the new value. A **non-blocking** assignment (`<=`) reads all right-hand sides first, then updates all left-hand sides together. The second behaviour matches real flip-flops, which all sample at the same edge.

```verilog
// Three flip-flops: a shift register
always @(posedge clk) begin
  q1 <= d;
  q2 <= q1;
  q3 <= q2;
end

// Bug: q1, q2 and q3 all get d, which is effectively one flip-flop
always @(posedge clk) begin
  q1 = d;
  q2 = q1;
  q3 = q2;
end
```

The Python model below applies each rule at every clock edge:

```python run=sh-c03-blocking
def blocking(q, d):
    q = q[:]
    q[0] = d
    q[1] = q[0]
    q[2] = q[1]
    return q

def nonblocking(q, d):
    return [d, q[0], q[1]]          # all right-hand sides read the old values

a = b = [0, 0, 0]
print("d  blocking   non-blocking")
for d in [1, 0, 0, 1]:
    a, b = blocking(a, d), nonblocking(b, d)
    print(d, a, b)
```

The rule to state in an interview: use `<=` in clocked blocks, use `=` in combinational blocks, and never drive one signal from two `always` blocks.

:::trap Inferred latches
A combinational block that fails to assign an output on some path has to remember the old value, so synthesis builds a latch. `always @(*) if (en) q = d;` is the classic example. Give every output a default, cover every `if` with an `else`, and add a `default` to every `case`.
:::

Some constructs only make sense in simulation: `#10` delays, `$display` and file I/O. `initial` blocks work on many FPGAs and are not usable for ASIC logic, so reset your state explicitly.

## Setup and hold {#ch03-timing .th}

A flip-flop needs its data input stable around the capturing clock edge. **Setup time** `t_su` is how long before the edge the data must be stable. **Hold time** `t_h` is how long after the edge it must stay stable. The output changes `t_cq` after the edge.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 230" role="img" aria-label="Timing diagram: D must be stable for the setup time before the rising clock edge and for the hold time after it, and Q changes one clock-to-Q delay after the edge">
  <rect x="270" y="92" width="90" height="58" class="d-acc"/>
  <rect x="360" y="92" width="50" height="58" class="d-key"/>
  <path d="M360 16 L 360 218" class="d-line-trap d-dash"/>
  <text x="20" y="50" class="t-mono">CLK</text>
  <path d="M60 60 H360 V30 H580 V60 H700" class="d-line"/>
  <text x="20" y="125" class="t-mono">D</text>
  <path d="M60 106 H200 L215 136 H430 L445 106 H700 M60 136 H200 L215 106 H430 L445 136 H700" class="d-line-acc"/>
  <text x="315" y="86" text-anchor="middle" class="t-small t-acc">t_su</text>
  <text x="385" y="86" text-anchor="middle" class="t-small t-key">t_h</text>
  <text x="130" y="92" text-anchor="middle" class="t-small">D may change</text>
  <text x="570" y="92" text-anchor="middle" class="t-small">D may change</text>
  <text x="20" y="195" class="t-mono">Q</text>
  <path d="M60 180 H415 L430 210 H700 M60 210 H415 L430 180 H700" class="d-line-key"/>
  <path d="M360 170 H422" class="d-line"/>
  <text x="392" y="164" text-anchor="middle" class="t-small">t_cq</text>
</svg></div><figcaption><b>The stability window.</b> D must not change inside the shaded region. A violation can leave the flip-flop metastable. Q is valid <code>t_cq</code> after the edge.</figcaption></figure>

For a path from a launch flop to a capture flop, with combinational delay `t_comb`, period `T`, and `skew` defined as capture clock arrival minus launch clock arrival:

- **Setup check:** `t_cq + t_comb_max + t_su <= T + skew`. New data must arrive before the next edge.
- **Hold check:** `t_cq + t_comb_min >= t_h + skew`. New data must not arrive so early that it corrupts the capture at the same edge.

`T` does not appear in the hold check, so a hold violation fails at every frequency. A setup violation can be fixed with a slower clock, less logic or a pipeline stage. A hold violation is fixed by adding delay on the short path, which is usually a job for buffers after clock tree synthesis.

```python run=sh-c03-slack
def slacks(T, cq, tmax, tmin, su, h, skew=0.0):
    setup = T + skew - (cq + tmax + su)
    hold = cq + tmin - (h + skew)
    return setup, hold, 1000 / (cq + tmax + su - skew)

cases = [("clean",            10, 1.0, 6.0, 1.0, 1.0, 0.5, 0.0),
         ("too much logic",   10, 1.0, 9.0, 1.0, 1.0, 0.5, 0.0),
         ("positive skew",    10, 1.0, 6.0, 1.0, 1.0, 0.5, 1.0),
         ("short path",       10, 0.5, 6.0, 0.1, 1.0, 0.4, 0.5),
         ("short, slower clk", 20, 0.5, 6.0, 0.1, 1.0, 0.4, 0.5)]
print(f"{'case':18} {'setup ns':>9} {'hold ns':>8} {'fmax MHz':>9}")
for name, *args in cases:
    s, h, f = slacks(*args)
    print(f"{name:18} {s:9.2f} {h:8.2f} {f:9.1f}")
```

Positive skew gives setup 1 ns more slack and takes the same 1 ns from hold. In the last two rows, doubling the period improves setup slack and leaves the -0.30 ns hold slack unchanged.

## Clock domain crossing and metastability {#ch03-cdc .th}

If a signal comes from an unrelated clock, it will eventually change inside a flip-flop's stability window. The flop can then go **metastable**, sitting between 0 and 1 for an unbounded but usually short time. You cannot remove this. You can only make failure very unlikely by giving it time to resolve:

`MTBF = exp(t_r / tau) / (T0 * f_clk * f_data)`

`t_r` is the time available to resolve, and `tau` and `T0` are flop constants. Because `t_r` is in an exponent, a second flop adds nearly one clock period and helps enormously. This is why a **two-flop synchronizer** is standard:

```verilog
module sync2 (
  input  wire clk_dst, rst_n, d_async,
  output wire q
);
  reg ff1, ff2;
  always @(posedge clk_dst or negedge rst_n)
    if (!rst_n) {ff2, ff1} <= 2'b00;
    else        {ff2, ff1} <= {ff1, d_async};
  assign q = ff2;
endmodule
```

```python run=sh-c03-mtbf
import math
tau, T0, f_clk, f_data = 0.2e-9, 1e-10, 100e6, 1e6      # made-up constants
year = 365.25 * 24 * 3600
for name, t_r in [("logic after one flop", 1e-9), ("one spare period", 9e-9)]:
    mtbf = math.exp(t_r / tau) / (T0 * f_clk * f_data)
    print(f"{name:21} t_r={t_r * 1e9:.0f} ns  MTBF={mtbf:.3g} s = {mtbf / year:.3g} years")
```

Eight extra nanoseconds change the result from about 15 ms to about 110 million years with these constants.

Rules for crossings:

- **Single-bit level:** use a two-flop synchronizer in the destination domain, and drive the source from a flop with no logic before the crossing.
- **Pulse from fast to slow:** the slow clock can miss it. Stretch it, or convert it to a toggle and detect the toggle's edge on the other side.
- **Multi-bit values:** synchronizing each bit separately can capture a mix of old and new bits. Use a handshake with a stable bus, an asynchronous FIFO, or Gray code for values that change by one.
- **Reset:** assert asynchronously and release synchronously, so all flops leave reset on the same edge.

An **asynchronous FIFO** passes Gray-coded read and write pointers across the domains, because only one bit changes per increment. A pointer sampled during a change reads as either the old value or the new one, and the synchronized pointer may lag behind. Full or empty can stay asserted a few cycles longer than necessary, which is safe.

```python run=sh-c03-gray
def to_gray(n):
    return n ^ (n >> 1)
def flips(a, b):
    return bin(a ^ b).count("1")
print("n  binary  gray")
for n in (5, 6, 7, 8, 9):
    print(f"{n}  {n:04b}    {to_gray(n):04b}")
seq = range(16)
print("max flips, binary:", max(flips(i, (i + 1) % 16) for i in seq))
print("max flips, gray:  ", max(flips(to_gray(i), to_gray((i + 1) % 16)) for i in seq))
```

:::trap A synchronizer on each bit does not make a bus safe
Going from `0111` to `1000`, all four bits change. If the destination catches some of them on one edge and others on the next, it can see any 4-bit value for a cycle. Each bit is individually valid, and the word is wrong.
:::

## Pipelining {#ch03-pipelining .th}

A pipeline splits a long combinational path by adding registers. The clock period becomes the slowest stage plus register overhead (`t_cq + t_su`). Throughput rises, and latency in time usually rises as well, because every stage takes a full period.

```python run=sh-c03-pipeline
logic, overhead = 12.0, 1.0        # ns
print("stages  period ns  MHz    latency ns  time for 1000 items, us")
for n in (1, 2, 3, 4, 6, 12):
    T = logic / n + overhead
    print(f"{n:6d} {T:9.1f} {1000 / T:6.1f} {n * T:11.1f} {(n + 999) * T / 1000:14.2f}")
print("unbalanced 6+3+3:", 6.0 + overhead, "ns period")
```

Going from 1 stage to 3 raises the rate by 2.6 times, and going from 6 to 12 raises it by only 1.5 times, because the overhead begins to dominate. An unbalanced split is limited by its slowest stage. Pipelining also costs flops, and it creates hazards when a later stage needs a result that an earlier stage has not yet produced.

## FPGA, ASIC and the chip design flow {#ch03-flow .th}

| | FPGA | ASIC |
|---|---|---|
| Logic | lookup tables, flops, block RAM and DSP blocks on a programmable fabric | custom standard cells and memories |
| Change after build | reprogram it | new silicon needed |
| Upfront cost | low | very high (mask set and engineering) |
| Unit cost at high volume | higher | lower |
| Speed and power for the same function | worse, because of programmable routing overhead | better |

FPGAs suit low volume, prototyping and logic that changes. ASICs suit high volume and tight power or performance targets. FPGA prototyping is also a common step in verifying an ASIC.

A digital chip usually goes through these stages:

1. **Specification and architecture.** Define features, blocks, and targets for performance, power and area.
2. **RTL design.** Write the blocks in Verilog or VHDL.
3. **Functional verification.** Use simulation, assertions, coverage and formal checks. This often takes more effort than design.
4. **Logic synthesis.** Map RTL to a gate netlist using timing constraints.
5. **Design for test.** Insert scan chains and memory self-test so that manufactured parts can be tested.
6. **Floorplanning and placement.** Arrange blocks, power grid and standard cells.
7. **Clock tree synthesis.** Distribute the clock with balanced skew. Hold fixing starts here, because real skew is now known.
8. **Routing.** Connect the cells with metal.
9. **Signoff.** Run static timing analysis, power and IR-drop analysis, equivalence checks, and physical checks (DRC and LVS).
10. **Tapeout.** Send the final layout (GDSII) to the fab, and validate the first silicon in the lab.

## AXI-style handshake and SoC buses {#ch03-axi .th}

Blocks on a chip use **handshakes** because either side may need to stall. In the VALID/READY style used by AXI, the sender drives `VALID` and the data, and the receiver drives `READY`. A transfer happens at a rising clock edge when both are high.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 210" role="img" aria-label="Waveform with clock, VALID, READY and DATA: transfers of D0, D1 and D2 happen at the rising edges where VALID and READY are both high">
  <path d="M90 40 H90 V14 H140 V40 H190 V14 H240 V40 H290 V14 H340 V40 H390 V14 H440 V40 H490 V14 H540 V40 H590 V14 H640 V40 H690 V14" class="d-line"/>
  <path d="M90 88 V88 H190 V62 H290 V62 H390 V62 H490 V62 H590 V62 H690" class="d-line-acc"/>
  <path d="M90 132 V132 H190 V132 H290 V106 H390 V132 H490 V106 H590 V106 H690" class="d-line-key"/>
  <rect x="90" y="150" width="100" height="26" class="d-soft"/>
  <rect x="190" y="150" width="100" height="26" class="d-acc"/>
  <text x="240" y="168" text-anchor="middle" class="t-mono">D0</text>
  <rect x="290" y="150" width="100" height="26" class="d-acc"/>
  <text x="340" y="168" text-anchor="middle" class="t-mono">D0</text>
  <rect x="390" y="150" width="100" height="26" class="d-acc"/>
  <text x="440" y="168" text-anchor="middle" class="t-mono">D1</text>
  <rect x="490" y="150" width="100" height="26" class="d-acc"/>
  <text x="540" y="168" text-anchor="middle" class="t-mono">D1</text>
  <rect x="590" y="150" width="100" height="26" class="d-acc"/>
  <text x="640" y="168" text-anchor="middle" class="t-mono">D2</text>
  <path d="M390 12 L 390 180" class="d-line-trap d-dash"/><circle cx="390" cy="194" r="4" class="d-fill-trap"/>
  <path d="M590 12 L 590 180" class="d-line-trap d-dash"/><circle cx="590" cy="194" r="4" class="d-fill-trap"/>
  <path d="M690 12 L 690 180" class="d-line-trap d-dash"/><circle cx="690" cy="194" r="4" class="d-fill-trap"/>
  <text x="20" y="32" class="t-mono">ACLK</text>
  <text x="20" y="80" class="t-mono">VALID</text>
  <text x="20" y="124" class="t-mono">READY</text>
  <text x="20" y="168" class="t-mono">DATA</text>
</svg></div><figcaption><b>VALID/READY.</b> The dashed lines mark the three rising edges where both are high. D0 waits one cycle for READY, and so does D1. D2 goes straight through.</figcaption></figure>

The rules that prevent deadlock and data loss:

- Once `VALID` is high, the sender must hold it and keep the data stable until the transfer.
- The sender must not wait for `READY` before raising `VALID`. The receiver may wait for `VALID` before raising `READY`.

```python run=sh-c03-axi
items = ["D0", "D1", "D2"]
want  = [0, 1, 1, 1, 1, 1]         # sender has something to offer
ready = [0, 0, 1, 0, 1, 1]
i = valid = 0
print("cycle valid ready data transfer")
for c in range(len(ready)):
    if not valid and i < len(items) and want[c]:
        valid = 1
    data = items[i] if valid else "--"
    fire = valid and ready[c]
    print(f"{c:5d} {valid:5d} {ready[c]:5d} {data:>4} {'yes' if fire else ''}")
    if fire:
        i += 1
        valid = 0
print("transfers:", i)
```

A full AXI interface has five independent channels, each with its own handshake: write address (AW), write data (W), write response (B), read address (AR) and read data (R). A burst sends one address and a length, then many data beats. IDs let a slave complete transactions out of order across different IDs. AXI-Lite drops bursts for simple register access, and AXI-Stream keeps only a data channel with no addresses.

## Memory hierarchy on an SoC {#ch03-memory .th}

An SoC connects CPU cores, accelerators and peripherals through an interconnect to memories that trade speed against size:

| Level | Built from | Role |
|---|---|---|
| Registers | flops | operands of the current instruction |
| L1 caches | SRAM | fastest cache, split into instruction and data |
| L2 or shared cache | SRAM | larger and slower, may be shared across cores |
| Tightly coupled memory or scratchpad | SRAM | software-managed, with predictable latency for real-time code |
| Main memory | off-chip DRAM behind a controller | large, needs refresh, and much slower |
| Flash | non-volatile | stores boot code and data |

SRAM holds a bit in a six-transistor cell and needs no refresh. DRAM uses one transistor and one capacitor, so it is denser and needs refresh. **Average memory access time** is `hit time + miss rate * miss penalty`, applied at each level.

Accelerators and peripherals often use **DMA** to move data with no CPU copy. If the CPU caches the same memory, software or hardware has to keep it coherent. Without hardware coherence, clean the cache before a device reads a buffer, and invalidate it before the CPU reads data that a device wrote.

## Power and performance {#ch03-power .th}

Dynamic power is `P = alpha * C * V^2 * f`: activity factor, switched capacitance, voltage squared, and frequency. Static power is leakage, which flows whenever the block has power. Since a lower voltage usually forces a lower maximum frequency, **DVFS** lowers both together when demand is low.

```python run=sh-c03-power
print("option                         power  task time  energy")
opts = [("baseline", 1, 1.0, 1.0),
        ("same V, half f", 1, 1.0, 0.5),
        ("0.9 V, 0.9 f", 1, 0.9, 0.9),
        ("two units, 0.7 V, half f each", 2, 0.7, 0.5)]
for name, units, V, f in opts:
    power = units * V ** 2 * f
    time = 1 / (units * f)
    print(f"{name:30} {power:5.3f} {time:10.2f} {power * time:7.3f}")
```

These figures are relative and count dynamic power only. The second row shows that lowering `f` alone reduces power but does not reduce energy per task, because the task runs for longer. Lowering voltage is what saves energy. The last row spends area on parallelism to get the same throughput at about half the power, assuming the work can be split and the lower voltage supports the lower frequency.

Common techniques:

- **Clock gating** stops the clock to idle flops, which removes their dynamic power. Use an integrated clock-gating cell. Gating with a plain AND gate in RTL can glitch and create false clock edges.
- **Power gating** cuts the supply to idle blocks, which also stops leakage. It needs isolation cells and state retention, and it takes time to wake up.
- **Reduce activity** with better encodings, fewer memory accesses, and shorter wires between frequently communicating blocks.

## Drills {#ch03-drills .dr}

:::drill concept
Show how a 2:1 multiplexer can act as a NOT gate and as an AND gate. How many 2-input NAND gates does an XOR take?
---
**Answer.** With `y = s ? i1 : i0`, NOT `a` is `s = a, i1 = 0, i0 = 1`, and `a AND b` is `s = a, i1 = b, i0 = 0`. XOR takes 4 NANDs.

**Why.** With NOT and AND available, the mux is universal. XOR uses `n = NAND(a,b)`, then `NAND(NAND(a,n), NAND(b,n))`.
:::

:::drill output
What does this print? Treat values as 8-bit two's complement.

```python run=sh-c03-d-twos
def to_signed(x):
    x &= 0xFF
    return x - 256 if x >= 128 else x
print(to_signed(127 + 1), to_signed(-128 - 1), to_signed(100 + 100))
print(f"{(-5) & 0xFF:08b}", to_signed(0b11111011))
```
---
**Answer.** Each addition overflows and wraps: 127 + 1 gives -128, -128 - 1 gives 127, and 100 + 100 gives -56. The value -5 is `11111011`.

**Why.** Overflow occurs when adding two numbers of the same sign gives a result of the opposite sign. In hardware it is the XOR of the carry into and the carry out of the top bit.
:::

:::drill output
Here the same `1011` detector runs with overlap allowed and with overlap disabled. How many hits does each count?

```python run=sh-c03-d-overlap
OVER   = {0: (0, 1), 1: (2, 1), 2: (0, 3), 3: (2, 4), 4: (2, 1)}
NOOVER = {0: (0, 1), 1: (2, 1), 2: (0, 3), 3: (2, 4), 4: (0, 1)}
def count(table, text):
    s = hits = 0
    for c in text:
        s = table[s][int(c)]
        hits += s == 4
    return hits
for text in ("1011011", "10111011"):
    print(text, count(OVER, text), count(NOOVER, text))
```
---
**Answer.** `1011011` gives 2 with overlap, because the last `1` of the first match starts the second, and 1 without overlap. `10111011` has two separate matches, so both count 2.

**Why.** The only difference is where `S4` goes on input 0. With overlap it goes to `S2`, because the `1` and `0` form a prefix. Without overlap it restarts at `S0`.
:::

:::drill tricky
`a = 1` and `b = 0` before the clock edge. Give `a` and `b` after the edge, taking each version as the only block in the design.

```verilog
always @(posedge clk) begin a = b;  b = a;  end   // version 1
always @(posedge clk) begin a <= b; b <= a; end   // version 2
```
---
**Answer.** Version 1: `a = 0`, then `b` gets the new `a`, so both are 0. Version 2: they swap, so `a = 0` and `b = 1`.

**Why.** Non-blocking assignments sample every right-hand side before any update. This reasoning comes from the language's scheduling rules, and no simulator was run.
:::

:::drill bug
Find the problem with this combinational block.

```verilog
always @(*) begin
  case (sel)
    2'b00: y = a;
    2'b01: y = b;
    2'b10: y = c;
  endcase
end
```
---
**Answer.** `sel = 2'b11` assigns nothing, so synthesis infers a latch on `y`. Add `default: y = 1'b0;` or a default assignment before the `case`.

**Why.** A combinational output must be assigned on every path.
:::

:::drill concept
A path has `t_cq = 2`, `t_comb_max = 7` and `t_su = 1` ns, with no skew. Find the minimum period and maximum frequency. What is the setup slack at `T = 8` ns?
---
**Answer.** `T_min = 10` ns, so `fmax = 100` MHz. At 8 ns the slack is -2 ns.

**Why.** Everything on the path must fit in one period.
:::

:::drill tricky
A path has `t_cq = 0.3`, `t_comb_min = 0.1`, `t_h = 0.2` and skew 0.4 ns. Find the hold slack. Does a slower clock fix it, and if not what does?
---
**Answer.** `0.3 + 0.1 - (0.2 + 0.4) = -0.2` ns, a violation. A slower clock does not help, because `T` is not in the check. Add at least 0.2 ns of delay on the short path, or reduce the skew.

**Why.** Hold compares data launched by an edge with the capture flop's same edge.
:::

:::drill concept
A 20 ns combinational block is cut into stages of 6, 4, 5 and 5 ns, with 1 ns of register overhead. Find the period, the latency, and the time for 1000 items, and compare with no pipeline.
---
**Answer.** Period `6 + 1 = 7` ns, latency `4 * 7 = 28` ns, and 1000 items take `(4 + 999) * 7 = 7021` ns. With no pipeline, the period is 21 ns and 1000 items take 21000 ns, so the speedup is about 3.

**Why.** The ideal factor of 4 is lost to the slowest stage and the overhead.
:::

:::drill concept
A writer sends a burst of 100 words at 100 MHz. A reader continuously reads at 50 MHz. What is the minimum FIFO depth?
---
**Answer.** The burst takes 1 us. In that time the reader takes 50 words, so the FIFO needs depth 50.

**Why.** Depth equals `burst * (1 - f_read / f_write)`, when the reader runs at the same time as the writer. Add margin for synchronizer delay when the two clocks are unrelated.
:::

:::drill concept
Convert binary `0110` to Gray, and Gray `0101` back to binary.
---
**Answer.** `0110 ^ 0011 = 0101`, and Gray `0101` converts back to binary `0110`.

**Why.** To go back, `b[i] = g[i] ^ b[i+1]`, starting from the top bit: 0, then 1, then 1, then 0.
:::

:::drill tricky
Why does a two-flop synchronizer not guarantee that a value is correct, and what does it guarantee?
---
**Answer.** It makes metastability on the output very unlikely, with a very long MTBF, and gives a clean 0 or 1. It does not say which edge the change was caught on, so the value can arrive one cycle sooner or later.

**Why.** For one bit, this uncertainty is acceptable. For a multi-bit bus it causes mixed values.
:::

:::drill tricky
An AXI-style master waits for `READY` before it raises `VALID`, and the connected slave waits for `VALID` before it raises `READY`. What happens, and who is at fault?
---
**Answer.** They deadlock. The master breaks the protocol, because the sender must not wait for `READY`. The slave's behaviour is allowed.

**Why.** Making one side responsible for going first removes the circular wait.
:::

:::drill concept
L1 hit time is 1 cycle, L1 miss rate 5%, L2 hit time 10 cycles, L2 miss rate 20% of L1 misses, DRAM 100 cycles. Find the average access time.
---
**Answer.** `1 + 0.05 * (10 + 0.20 * 100) = 1 + 0.05 * 30 = 2.5` cycles.

**Why.** Apply the formula from the inside out. L2's average access time is the L1's miss penalty.
:::

:::drill concept
A block has `alpha = 0.1`, `C = 1` nF, `V = 1` V and `f = 100` MHz. Find its dynamic power. What is it after a 20% voltage cut at the same `f`?
---
**Answer.** `0.1 * 1e-9 * 1 * 1e8 = 10` mW. With `0.8 V`, it is `10 * 0.64 = 6.4` mW.

**Why.** Power goes with `V^2`, so voltage is the strongest lever.
:::

:::drill concept
Where in the design flow do these belong: scan insertion, clock tree synthesis, LVS? Why is hold fixing usually done after clock tree synthesis?
---
**Answer.** Scan insertion is part of design for test, around synthesis. Clock tree synthesis follows placement. LVS is a physical check at signoff. Hold fixing waits until then because hold depends strongly on real clock skew, which is unknown until the tree exists.

**Why.** Before the tree is built, the clock is modelled as ideal, so skew is an estimate.
:::

## Write the code {#ch03-coding .cd}

:::drill code rating=1000
Write a rising-edge detector for a synchronous signal in Verilog, which pulses for one cycle per rising edge. Model it in Python.
---
Store the previous value in a flop, then compare it with the current one.

```verilog
module rise_detect (
  input  wire clk, rst_n, d,
  output wire pulse
);
  reg d_prev;
  always @(posedge clk or negedge rst_n)
    if (!rst_n) d_prev <= 1'b0;
    else        d_prev <= d;
  assign pulse = d & ~d_prev;
endmodule
```

```python run=sh-c03-c-edge
def rise_detect(ds):
    d_prev, out = 0, []
    for d in ds:
        out.append(d & ~d_prev & 1)
        d_prev = d
    return out
print(rise_detect([0, 1, 1, 0, 1, 0, 0, 1]))
```

For an asynchronous input, put a two-flop synchronizer in front of it.
:::

:::drill code rating=1400
Write a synchronous FIFO in Verilog with full and empty flags, using one extra pointer bit. Model the flags in Python.
---
With pointers one bit wider than the address, empty means the pointers are equal, and full means the addresses match while the top bits differ.

```verilog
module sync_fifo #(parameter W = 8, parameter AW = 4) (
  input  wire         clk, rst_n, wr_en, rd_en,
  input  wire [W-1:0] wdata,
  output reg  [W-1:0] rdata,
  output wire         full, empty
);
  reg [W-1:0] mem [0:(1<<AW)-1];
  reg [AW:0]  wp, rp;

  assign empty = (wp == rp);
  assign full  = (wp[AW] != rp[AW]) && (wp[AW-1:0] == rp[AW-1:0]);

  wire do_wr = wr_en && !full;
  wire do_rd = rd_en && !empty;

  always @(posedge clk) begin
    if (do_wr) mem[wp[AW-1:0]] <= wdata;
    if (do_rd) rdata <= mem[rp[AW-1:0]];
  end

  always @(posedge clk or negedge rst_n)
    if (!rst_n) begin
      wp <= 0;
      rp <= 0;
    end else begin
      if (do_wr) wp <= wp + 1'b1;
      if (do_rd) rp <= rp + 1'b1;
    end
endmodule
```

```python run=sh-c03-c-fifo
AW = 2
DEPTH, MASK = 1 << AW, (1 << (AW + 1)) - 1
mem, wp, rp = [None] * DEPTH, 0, 0
def empty(): return wp == rp
def full(): return (wp ^ rp) == DEPTH            # top bits differ, address bits match
for x in "ABCDE":
    if not full():
        mem[wp & (DEPTH - 1)] = x
        wp = (wp + 1) & MASK
    print(f"offered {x} wp={wp:03b} rp={rp:03b} full={full()} empty={empty()}")
out = []
while not empty():
    out.append(mem[rp & (DEPTH - 1)])
    rp = (rp + 1) & MASK
print("read", out, f"wp={wp:03b} rp={rp:03b} full={full()} empty={empty()}")
```

The fifth write is dropped because the FIFO is full. After four reads the pointers are equal again, with the top bit set in both, which correctly means empty.
:::

## Cheat sheet {#ch03-cheatsheet .th}

- Moore output: state only, one cycle later. Mealy output: state and input, same cycle, fewer states.
- `<=` in clocked blocks, `=` in combinational blocks. Use `@(*)` so no signal is missing from the sensitivity list, and a default on every path to prevent latches.
- Setup: `t_cq + t_comb_max + t_su <= T + skew`. Hold: `t_cq + t_comb_min >= t_h + skew`. Hold does not depend on `T`.
- Fix setup with less logic, pipelining or a slower clock. Fix hold with delay on the short path.
- CDC: two flops for one bit, Gray for pointers, handshake or asynchronous FIFO for buses. MTBF grows exponentially with resolve time.
- Pipelining: period is the slowest stage plus overhead. More throughput, more latency, more flops.
- FPGA: reprogrammable and low upfront cost. ASIC: high upfront cost, with better speed, power and unit cost at volume.
- Flow: spec, RTL, verification, synthesis, DFT, floorplan and placement, CTS, routing, signoff, tapeout.
- AXI: transfer when VALID and READY are both high at the clock edge. VALID must not wait for READY, and must stay high until the transfer. Channels: AW, W, B, AR, R.
- AMAT: hit time plus miss rate times miss penalty. DMA and caches need cleaning and invalidating unless hardware keeps them coherent.
- `P = alpha C V^2 f`. Clock gating cuts dynamic power, power gating cuts leakage too, and DVFS lowers both V and f.
