---
title: UART, SPI, I2C and CAN
part: Part D · Talking to other chips
lede: Almost every interview on embedded systems asks you to compare these four buses and draw at least one timing diagram. This chapter covers how each one frames, clocks, addresses and arbitrates, then how to move the data with polling, interrupts or DMA. It closes with the peripherals that come up alongside them: debouncing, ADCs, PWM and timers.
desc: UART framing, SPI modes, I2C pull-ups and ACK, CAN arbitration, polling vs interrupt vs DMA, debouncing, ADC, PWM, timers
hours: 4
prereqs: Chapters 1 and 3, binary and hex
---

## Which bus when {#ch04-compare .th}

| | UART | SPI | I2C | CAN |
|---|---|---|---|---|
| Wires (plus ground) | TX, RX | SCLK, MOSI, MISO, one CS per device | SCL, SDA | CANH, CANL (differential) |
| Clock | None; both sides agree a baud rate | From the controller | From the controller; a target can stretch it | None; nodes sync to bit edges |
| Topology | Point to point | One controller, several devices | Multi-drop, multi-controller | Multi-drop bus, all nodes equal |
| Who is addressed | Only one receiver | Selected by CS | 7-bit address (10-bit also exists) | Nobody; a message ID says what the data is |
| Duplex | Full | Full | Half | Half |
| Delivery check | Optional parity | None | ACK per byte | CRC, ACK slot, automatic retransmit |
| Typical use | Debug console, modules | Fast flash, displays, ADCs | Sensors, EEPROMs, config chips | Vehicles, industrial networks |

Rules of thumb for "which would you use?": SPI for short-distance speed. I2C when many slow devices should share two wires. UART for a simple link to one device or a console. CAN when many nodes must share a long, noisy cable with priorities and error handling. The MCU's free pins often decide the question.

## UART {#ch04-uart .th}

UART has no clock wire, so both sides must agree on the bit rate and the frame format in advance. The line idles high. A frame is a start bit (low), 5 to 9 data bits with the **least significant bit first**, an optional parity bit, then one or two stop bits (high). The falling edge of the start bit tells the receiver when to begin timing, and it then samples near the middle of each bit. Receivers commonly oversample, often 16 times per bit, to find that middle.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 120" role="img" aria-label="UART frame for 0x41: line idles high, start bit low, data bits least significant first, stop bit high">
  <rect x="60" y="30" width="58" height="60" class="d-acc"/>
  <text x="89" y="22" text-anchor="middle" class="t-small">start</text>
  <text x="89" y="108" text-anchor="middle" class="t-mono">0</text>
  <path d="M89 30 L 89 90" class="d-grid d-dash"/>
  <rect x="118" y="30" width="58" height="60" class="d-soft"/>
  <text x="147" y="22" text-anchor="middle" class="t-small">bit 0</text>
  <text x="147" y="108" text-anchor="middle" class="t-mono">1</text>
  <path d="M147 30 L 147 90" class="d-grid d-dash"/>
  <rect x="176" y="30" width="58" height="60" class="d-soft"/>
  <text x="205" y="22" text-anchor="middle" class="t-small">bit 1</text>
  <text x="205" y="108" text-anchor="middle" class="t-mono">0</text>
  <path d="M205 30 L 205 90" class="d-grid d-dash"/>
  <rect x="234" y="30" width="58" height="60" class="d-soft"/>
  <text x="263" y="22" text-anchor="middle" class="t-small">bit 2</text>
  <text x="263" y="108" text-anchor="middle" class="t-mono">0</text>
  <path d="M263 30 L 263 90" class="d-grid d-dash"/>
  <rect x="292" y="30" width="58" height="60" class="d-soft"/>
  <text x="321" y="22" text-anchor="middle" class="t-small">bit 3</text>
  <text x="321" y="108" text-anchor="middle" class="t-mono">0</text>
  <path d="M321 30 L 321 90" class="d-grid d-dash"/>
  <rect x="350" y="30" width="58" height="60" class="d-soft"/>
  <text x="379" y="22" text-anchor="middle" class="t-small">bit 4</text>
  <text x="379" y="108" text-anchor="middle" class="t-mono">0</text>
  <path d="M379 30 L 379 90" class="d-grid d-dash"/>
  <rect x="408" y="30" width="58" height="60" class="d-soft"/>
  <text x="437" y="22" text-anchor="middle" class="t-small">bit 5</text>
  <text x="437" y="108" text-anchor="middle" class="t-mono">0</text>
  <path d="M437 30 L 437 90" class="d-grid d-dash"/>
  <rect x="466" y="30" width="58" height="60" class="d-soft"/>
  <text x="495" y="22" text-anchor="middle" class="t-small">bit 6</text>
  <text x="495" y="108" text-anchor="middle" class="t-mono">1</text>
  <path d="M495 30 L 495 90" class="d-grid d-dash"/>
  <rect x="524" y="30" width="58" height="60" class="d-soft"/>
  <text x="553" y="22" text-anchor="middle" class="t-small">bit 7</text>
  <text x="553" y="108" text-anchor="middle" class="t-mono">0</text>
  <path d="M553 30 L 553 90" class="d-grid d-dash"/>
  <rect x="582" y="30" width="58" height="60" class="d-key"/>
  <text x="611" y="22" text-anchor="middle" class="t-small">stop</text>
  <text x="611" y="108" text-anchor="middle" class="t-mono">1</text>
  <path d="M611 30 L 611 90" class="d-grid d-dash"/>
  <path d="M16 40 L 60 40 L 60 80 L 118 80 L 118 40 L 176 40 L 176 80 L 234 80 L 292 80 L 350 80 L 408 80 L 466 80 L 466 40 L 524 40 L 524 80 L 582 80 L 582 40 L 640 40 L 640 40 L 680 40" class="d-line-acc"/>
  <text x="36" y="30" text-anchor="middle" class="t-small">idle</text>
  <text x="660" y="30" text-anchor="middle" class="t-small">idle</text>
</svg></div><figcaption><b>UART frame for 0x41 in 8N1.</b> The start edge sets the timing, and the receiver samples at the dashed lines, near the middle of each bit. Data goes least significant bit first.</figcaption></figure>

The usual format is 8N1: 8 data bits, no parity, 1 stop bit. It uses 10 bit times per byte, so 115200 baud carries 11520 bytes per second. Since timing restarts at every start bit, the two clocks only need to agree for one frame. This simulation samples a frame with a receiver clock that is too slow, to show how far the error can go. It uses ideal mid-bit sampling. A common rule of thumb for real designs is to stay within about 2 percent, as both ends and the signal edges add error.

```python run=ec-c04-uart
def frame(byte):          # 8N1: start, LSB first, stop
    return [0] + [(byte >> i) & 1 for i in range(8)] + [1]

def receive(line, ratio):  # sample at the middle of each receiver bit
    at = lambda k: line[min(int((k + 0.5) * ratio), len(line) - 1)]
    data = sum(at(i + 1) << i for i in range(8))
    return data, at(9)     # data and the stop bit

line = frame(0x41) + [1] * 4
print("".join(map(str, line[:10])))
for ratio in (1.00, 1.03, 1.05, 1.06):
    data, stop = receive(line, ratio)
    print(f"rx bit time x{ratio:.2f}: data={data:02X} stop={stop}")
```

The frame prints in wire order, which is why 0x41 (binary 01000001) shows its low bit first. At 5 percent the ideal receiver still gets it right, and at 6 percent it samples the stop bit in place of bit 7 and reads the wrong byte. A wrong stop bit level is reported as a **framing error**. A byte that arrives before the last was read causes an **overrun error**. Hardware flow control (RTS and CTS) lets the receiver pause the sender. Logic-level UART is not the same as RS-232, whose voltages are higher and inverted, so connecting them directly can damage a chip.

:::trap Check the clock first
A wrong baud rate does not always produce framing errors. A receiver can find what looks like a start bit in the middle of the data and print plausible garbage with few errors reported. So check the clock configuration before you suspect the wiring.
:::

## SPI {#ch04-spi .th}

SPI is a pair of shift registers connected in a ring. The controller (older documents say master, and call the device a slave) selects a device by pulling its CS low and generates the clock, and on each clock one bit moves each way. So every transfer is an exchange. To read, the controller must still send something (dummy bytes), and to write, it receives something that it may ignore. There is no address, no acknowledgement and no flow control, which makes SPI simple and fast. Speed is limited mostly by the device and the wiring, and tens of MHz is common for short traces. Data is usually sent most significant bit first.

Clock polarity (CPOL) sets the idle level, and clock phase (CPHA) sets which edge samples:

| Mode | CPOL | CPHA | Clock idles | Data sampled on | Data changes on |
|---|---|---|---|---|---|
| 0 | 0 | 0 | Low | Rising edge | Falling edge |
| 1 | 0 | 1 | Low | Falling edge | Rising edge |
| 2 | 1 | 0 | High | Falling edge | Rising edge |
| 3 | 1 | 1 | High | Rising edge | Falling edge |

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 225" role="img" aria-label="SPI mode 0 timing: CS low, clock idles low, data changes on falling edges, sampled on rising edges">
  <text x="10" y="52" text-anchor="start" class="t-mono">CS</text>
  <text x="10" y="102" text-anchor="start" class="t-mono">SCLK</text>
  <text x="10" y="152" text-anchor="start" class="t-mono">MOSI</text>
  <text x="10" y="202" text-anchor="start" class="t-mono">MISO</text>
  <path d="M125 70 L 125 215" class="d-grid d-dash"/>
  <path d="M195 70 L 195 215" class="d-grid d-dash"/>
  <path d="M265 70 L 265 215" class="d-grid d-dash"/>
  <path d="M335 70 L 335 215" class="d-grid d-dash"/>
  <path d="M405 70 L 405 215" class="d-grid d-dash"/>
  <path d="M475 70 L 475 215" class="d-grid d-dash"/>
  <path d="M545 70 L 545 215" class="d-grid d-dash"/>
  <path d="M615 70 L 615 215" class="d-grid d-dash"/>
  <path d="M60 30 L 76 30 L 76 60 L 664 60 L 664 30 L 680 30" class="d-line-trap"/>
  <path d="M60 110 L 125 110 L 125 80 L 160 80 L 160 110 L 195 110 L 195 80 L 230 80 L 230 110 L 265 110 L 265 80 L 300 80 L 300 110 L 335 110 L 335 80 L 370 80 L 370 110 L 405 110 L 405 80 L 440 80 L 440 110 L 475 110 L 475 80 L 510 80 L 510 110 L 545 110 L 545 80 L 580 80 L 580 110 L 615 110 L 615 80 L 650 80 L 650 110 L 680 110" class="d-line"/>
  <path d="M90 130 L 160 130 L 160 160 L 230 160 L 230 130 L 300 130 L 300 160 L 370 160 L 440 160 L 440 130 L 510 130 L 510 160 L 580 160 L 580 130 L 650 130" class="d-line-acc"/>
  <text x="135" y="152" text-anchor="middle" class="t-mono">1</text>
  <text x="205" y="152" text-anchor="middle" class="t-mono">0</text>
  <text x="275" y="152" text-anchor="middle" class="t-mono">1</text>
  <text x="345" y="152" text-anchor="middle" class="t-mono">0</text>
  <text x="415" y="152" text-anchor="middle" class="t-mono">0</text>
  <text x="485" y="152" text-anchor="middle" class="t-mono">1</text>
  <text x="555" y="152" text-anchor="middle" class="t-mono">0</text>
  <text x="625" y="152" text-anchor="middle" class="t-mono">1</text>
  <path d="M90 210 L 160 210 L 230 210 L 230 180 L 300 180 L 370 180 L 440 180 L 510 180 L 510 210 L 580 210 L 650 210" class="d-line-acc"/>
  <text x="135" y="202" text-anchor="middle" class="t-mono">0</text>
  <text x="205" y="202" text-anchor="middle" class="t-mono">0</text>
  <text x="275" y="202" text-anchor="middle" class="t-mono">1</text>
  <text x="345" y="202" text-anchor="middle" class="t-mono">1</text>
  <text x="415" y="202" text-anchor="middle" class="t-mono">1</text>
  <text x="485" y="202" text-anchor="middle" class="t-mono">1</text>
  <text x="555" y="202" text-anchor="middle" class="t-mono">0</text>
  <text x="625" y="202" text-anchor="middle" class="t-mono">0</text>
</svg></div><figcaption><b>SPI mode 0.</b> CS goes low, then each rising clock edge (dashed) samples both data lines, and each falling edge shifts the next bit out. MOSI carries 0xA5 and MISO carries 0x3C, most significant bit first.</figcaption></figure>

```c run=ec-c04-spi
#include <stdio.h>
#include <stdint.h>
int main(void) {
    uint8_t ctrl = 0xA5, dev = 0x3C;     /* simulated shift registers, mode 0 */
    for (int clk = 0; clk < 8; clk++) {
        int mosi = ctrl >> 7, miso = dev >> 7;   /* MSB is on the wire */
        ctrl = (uint8_t)(ctrl << 1 | miso);      /* rising edge: both sample */
        dev  = (uint8_t)(dev << 1 | mosi);
    }
    printf("controller=%02X device=%02X\n", ctrl, dev);
    return 0;
}
```

After 8 clocks the two values have swapped. A wrong mode usually shows up as data shifted by one bit or as random errors that depend on speed. A device that is absent is not detected, and you just read a constant value such as 0x00 or 0xFF. Many designs therefore read a known ID register at startup.

## I2C {#ch04-i2c .th}

I2C uses two shared lines, and every device can only pull a line low or let go of it (open-drain). **Pull-up resistors** bring the line high. This makes the bus a wired-AND: it is low if anyone pulls it low. No device ever drives high, so two devices that disagree cannot short each other, and this is what makes multiple controllers and clock stretching possible.

A transaction looks like this:

- **START**: SDA falls while SCL is high. **STOP**: SDA rises while SCL is high. All other SDA changes happen while SCL is low.
- **Address byte**: 7 address bits, then R/W (0 write, 1 read).
- **ACK**: on the ninth clock, the transmitter releases SDA and the receiver pulls it low. If SDA stays high, that is a NACK.
- **Data bytes**: 8 bits, most significant first, each followed by an ACK bit.
- **Repeated START**: a new START with no STOP, used to change direction and keep the bus. A register read is write(register number), repeated START, read(data).

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 170" role="img" aria-label="I2C transaction: START, seven address bits for 0x50, write bit, ACK from the target, STOP">
  <text x="10" y="60" text-anchor="start" class="t-mono">SCL</text>
  <text x="10" y="130" text-anchor="start" class="t-mono">SDA</text>
  <rect x="112" y="88" width="52" height="16" class="d-soft"/>
  <text x="138" y="100" text-anchor="middle" class="t-small">A6</text>
  <text x="151" y="160" text-anchor="middle" class="t-mono">1</text>
  <rect x="164" y="88" width="52" height="16" class="d-soft"/>
  <text x="190" y="100" text-anchor="middle" class="t-small">A5</text>
  <text x="203" y="160" text-anchor="middle" class="t-mono">0</text>
  <rect x="216" y="88" width="52" height="16" class="d-soft"/>
  <text x="242" y="100" text-anchor="middle" class="t-small">A4</text>
  <text x="255" y="160" text-anchor="middle" class="t-mono">1</text>
  <rect x="268" y="88" width="52" height="16" class="d-soft"/>
  <text x="294" y="100" text-anchor="middle" class="t-small">A3</text>
  <text x="307" y="160" text-anchor="middle" class="t-mono">0</text>
  <rect x="320" y="88" width="52" height="16" class="d-soft"/>
  <text x="346" y="100" text-anchor="middle" class="t-small">A2</text>
  <text x="359" y="160" text-anchor="middle" class="t-mono">0</text>
  <rect x="372" y="88" width="52" height="16" class="d-soft"/>
  <text x="398" y="100" text-anchor="middle" class="t-small">A1</text>
  <text x="411" y="160" text-anchor="middle" class="t-mono">0</text>
  <rect x="424" y="88" width="52" height="16" class="d-soft"/>
  <text x="450" y="100" text-anchor="middle" class="t-small">A0</text>
  <text x="463" y="160" text-anchor="middle" class="t-mono">0</text>
  <rect x="476" y="88" width="52" height="16" class="d-soft"/>
  <text x="502" y="100" text-anchor="middle" class="t-small">W</text>
  <text x="515" y="160" text-anchor="middle" class="t-mono">0</text>
  <rect x="528" y="88" width="52" height="16" class="d-key"/>
  <text x="554" y="100" text-anchor="middle" class="t-small">ACK</text>
  <text x="567" y="160" text-anchor="middle" class="t-mono">0</text>
  <path d="M50 40 L 112 40 L 112 40 L 112 74 L 138 74 L 138 40 L 164 40 L 164 74 L 164 74 L 190 74 L 190 40 L 216 40 L 216 74 L 216 74 L 242 74 L 242 40 L 268 40 L 268 74 L 268 74 L 294 74 L 294 40 L 320 40 L 320 74 L 320 74 L 346 74 L 346 40 L 372 40 L 372 74 L 372 74 L 398 74 L 398 40 L 424 40 L 424 74 L 424 74 L 450 74 L 450 40 L 476 40 L 476 74 L 476 74 L 502 74 L 502 40 L 528 40 L 528 74 L 528 74 L 554 74 L 554 40 L 580 40 L 580 74 L 598 74 L 598 40 L 650 40" class="d-line"/>
  <path d="M50 110 L 84 110 L 84 144 L 120 144 L 120 110 L 172 110 L 172 144 L 224 144 L 224 110 L 276 110 L 276 144 L 616 144 L 616 110 L 650 110" class="d-line-acc"/>
  <text x="84" y="30" text-anchor="middle" class="t-small t-key">START</text>
  <text x="616" y="30" text-anchor="middle" class="t-small t-trap">STOP</text>
  <path d="M84 36 L 84 144" class="d-grid d-dash"/>
  <path d="M616 36 L 616 144" class="d-grid d-dash"/>
</svg></div><figcaption><b>Address 0x50, write.</b> START and STOP are SDA edges while SCL is high. Otherwise SDA changes only while SCL is low. On the ninth clock the target pulls SDA low to acknowledge. A real write would send data bytes before the STOP.</figcaption></figure>

Standard speeds are 100 kbit/s (Standard mode), 400 kbit/s (Fast mode), 1 Mbit/s (Fast mode Plus) and 3.4 Mbit/s (High-speed mode). A target can hold SCL low to make the controller wait, which is **clock stretching**. If two controllers start together, each one watches SDA as it transmits. One that sends a 1 and reads a 0 has lost the **arbitration** and stops without damaging the other's message.

### Sizing the pull-ups

The pull-up and the bus capacitance set the rising edge. A large resistor gives a slow rise, and a small one wastes current and may exceed what a device can sink. The I2C specification sets the limits used here: at most 400 pF of bus capacitance, rise time from 30 to 70 percent of the supply equal to 0.8473·R·C, and a low level of 0.4 V at 3 mA sink current.

```python run=ec-c04-pullup
vdd, cap = 3.3, 100e-12        # 3.3 V supply, 100 pF bus
rmin = (vdd - 0.4) / 3e-3
for name, tr in (("Standard", 1000e-9), ("Fast", 300e-9)):
    rmax = tr / (0.8473 * cap)
    print(f"{name}: rise limit {tr*1e9:.0f} ns, R from {rmin:.0f} to {rmax:.0f} ohm")
```

The answer is a range, and a higher speed narrows it. That is why values of a few kilohms are common.

## CAN {#ch04-can .th}

CAN sends bits on a differential pair, so noise that hits both wires equally cancels. It has two bus states: **dominant** (logic 0, driven) and **recessive** (logic 1, not driven). As with I2C, a dominant bit from anyone beats a recessive bit. The bus must have a 120 ohm terminator at each end, so you measure about 60 ohm between CANH and CANL with the power off.

A classic frame carries: start of frame, identifier, control bits including the data length, 0 to 8 data bytes, a 15-bit CRC, an ACK slot and an end of frame. The identifier is 11 bits, or 29 in the extended format. It names the message's content and also sets its priority. Classic CAN runs at up to 1 Mbit/s, with long cables needing lower rates. CAN FD allows up to 64 data bytes and a faster data phase.

**Arbitration** decides which node sends. Any node may start when the bus is idle. While sending its ID, a node watches the bus, and if it sent recessive and sees dominant, it stops and retries later. So the lowest ID always wins, and the winner's frame is not damaged, which means no time is lost:

```python run=ec-c04-can-arb
def arbitrate(ids, width=11):
    alive = list(ids)
    for bit in range(width - 1, -1, -1):
        bus = min((i >> bit) & 1 for i in alive)     # dominant 0 wins
        lost = [i for i in alive if (i >> bit) & 1 != bus]
        for i in lost:
            print(f"bit {bit:2}: {i:03X} sent 1, read 0, backs off")
        alive = [i for i in alive if i not in lost]
    return alive[0]

print("winner", format(arbitrate([0x65A, 0x658, 0x7FF]), "03X"))
```

**Bit stuffing**: after five equal bits in a row, the sender adds one opposite bit, and the receiver removes it. This guarantees edges for clock sync, and a run of six equal bits signals an error. **Acknowledgement**: the sender transmits a recessive ACK slot, and any node that received a good frame overwrites it with dominant. **Errors**: a node that detects a problem sends an error frame and the sender retransmits automatically. Each node keeps transmit and receive error counters. Above 127 it becomes error passive, and when its transmit counter passes 255 it goes bus off and stops transmitting, so that one faulty node cannot jam the bus.

## Polling, interrupts or DMA {#ch04-dma .th}

| Method | How it works | Good for | Cost |
|---|---|---|---|
| Polling | Loop on a status flag | Very short waits, startup code, slow simple tasks | CPU is busy; can miss data if it does something else |
| Interrupt | Peripheral interrupts per byte or per FIFO level | Moderate rates, variable-length data | Entry and exit overhead per event |
| DMA | Hardware copies between peripheral and memory | Large blocks at high rates | Setup complexity; shared buffers need care |

The decision comes from the byte rate:

```python run=ec-c04-rates
def show(name, bits_per_byte, rate):
    print(f"{name:<14} {bits_per_byte / rate * 1e6:8.2f} us per byte")
show("UART 9600", 10, 9600)
show("UART 115200", 10, 115200)
show("I2C 400k", 9, 400e3)
show("SPI 10M", 8, 10e6)
```

A per-byte interrupt is comfortable at 87 microseconds. At 0.8 microseconds per byte a 100 MHz CPU has only 80 cycles for each one, and that is DMA territory. With DMA, use half-complete and complete interrupts to process a circular buffer. Keep the buffer alive during the transfer, so never use a local variable from a function that has returned. On cores with a data cache, clean or invalidate the buffer's cache lines, or the CPU and the DMA engine see different data.

## Debouncing, ADC, PWM and timers {#ch04-periph .th}

**Debouncing.** A mechanical switch bounces for a few milliseconds when it closes or opens, so one press can look like many edges. A hardware fix is an RC filter with a Schmitt-trigger input. In software, sample at a fixed rate from a timer and accept a new state only after several equal samples. Do not put a blocking delay in the pin's ISR.

**Timers.** A timer counts clock ticks divided by a prescaler and resets at a top value, so on a typical part the update rate is `f = clk / ((PSC + 1) × (ARR + 1))`. PSC and ARR are the prescaler and auto-reload registers, and the +1 convention varies, so check the manual. Input capture records the count at an edge, to measure a pulse. Output compare changes a pin at a chosen count.

**PWM.** The timer sets the period, and a compare register sets how long the pin stays high in each period. The duty cycle is the fraction of time high, and after filtering, the average voltage is duty × supply. It drives LED brightness, motors and simple analog outputs.

**ADC.** Most microcontroller ADCs use successive approximation, which is a binary search: test each bit from the top against a DAC and keep it if the input is higher. An N-bit ADC has a step of Vref / 2^N. The sampling capacitor needs enough time to charge through the source's impedance, and the signal must be below half the sample rate (Nyquist), or it aliases.

```python run=ec-c04-adc-pwm
def sar(vin, vref, bits):
    code = 0
    for b in range(bits - 1, -1, -1):
        trial = code | (1 << b)
        if vin >= trial * vref / (1 << bits):
            code = trial
    return code

vref, bits = 3.3, 12
print(f"LSB = {vref / 2**bits * 1000:.3f} mV")
print("code for 1.65 V =", sar(1.65, vref, bits), " for 1.00 V =", sar(1.00, vref, bits))
clk, psc, arr, ccr = 48_000_000, 47, 999, 250
print("PWM frequency =", clk / ((psc + 1) * (arr + 1)), "Hz, duty =", ccr / (arr + 1))
```

## Drills {#ch04-drills .dr}

:::drill output
How long does 1000 bytes take on a UART at 9600 baud, 8N1 and 8E1 (parity adds a bit)?
```python run=ec-c04-d-uart
for name, bits in (("8N1", 10), ("8E1", 11)):
    print(name, round(1000 * bits / 9600, 3), "s")
```
---
**Answer.** Each byte costs its data bits plus start, stop and any parity, so 10 or 11 bit times. Forgetting the framing bits is the common mistake.
:::

:::drill output
Even parity makes the total number of 1s even. What parity bit goes with each byte?
```c run=ec-c04-d-parity
#include <stdio.h>
#include <stdint.h>
static int parity(uint8_t b) { int p = 0; for (; b; b &= (uint8_t)(b - 1)) p ^= 1; return p; }
int main(void) {
    printf("%d %d %d\n", parity(0x41), parity(0x07), parity(0xFF));
    return 0;
}
```
---
**Answer.** `0 1 0`. 0x41 has two 1s, 0x07 has three and 0xFF has eight. Parity catches any odd number of flipped bits and misses an even number.
:::

:::drill tricky
A UART link prints garbage. Name three likely causes before blaming the code.
---
**Answer.** Mismatched baud rate (often a wrong clock setting), TX and RX wired to their counterparts wrongly (TX must go to RX), and no common ground. Mismatched frame format and a voltage level mismatch are next on the list.
:::

:::drill concept
Why does UART need start bits while SPI does not?
---
**Answer.** With no shared clock, the receiver needs an event to synchronise its timing to each frame, and the start bit's falling edge is that event. SPI's clock wire tells the receiver exactly when each bit is valid, and CS marks the frame.
:::

:::drill tricky
You send a read command to an SPI flash and the first received byte is junk. Is this a bug, and how do you get the data?
---
**Answer.** It is normal. While the command goes out, the device has nothing to return yet. Keep clocking with dummy bytes after the command, and keep CS low throughout, since raising CS usually ends the command.
:::

:::drill tricky
What is the usual symptom of using SPI mode 0 with a device that expects mode 3? And why can it still seem to work?
---
**Answer.** Both sample on the rising edge, so many devices work anyway, and some support both. They differ in idle clock level, which can create a false edge around CS. Mode 1 versus mode 0 is worse, since the sample edges differ and data can appear shifted by a bit.
:::

:::drill output
A device has the 7-bit address 0x50. What bytes go on the wire for write and for read?
```python run=ec-c04-d-addr
addr = 0x50
print(format(addr << 1 | 0, "02X"), format(addr << 1 | 1, "02X"))
```
---
**Answer.** The 7-bit address goes in the upper bits, with R/W in bit 0. Datasheets quote either form, so if a device never ACKs, check whether its documented address is already shifted.
:::

:::drill concept
Why are I2C lines open-drain rather than push-pull?
---
**Answer.** So that several devices can share a line safely. A device can only pull low, so a conflict is resolved by the wired-AND and creates no short circuit. That enables ACK from the other side, clock stretching and arbitration.
:::

:::drill tricky
What happens with pull-ups that are too large? Too small? Is there a pull-up inside the MCU you can use instead?
---
**Answer.** Too large: slow rising edges, and bits misread at speed. Too small: too much current, and a device may not manage to pull the line low enough. Internal pull-ups are usually tens of kilohms, too weak for most buses except at low speed with little capacitance.
:::

:::drill concept
Draw or describe START and STOP, and give the rule for when SDA may change.
---
**Answer.** START: SDA falls while SCL is high. STOP: SDA rises while SCL is high. During data, SDA changes only while SCL is low and stays stable while SCL is high. Those two exceptions are what make START and STOP recognisable.
:::

:::drill tricky
The controller reads two bytes and sends NACK after the last one. Is something wrong? Separately, give three causes of a NACK on the address byte.
---
**Answer.** It is correct. The controller NACKs the last byte to tell the device to stop driving SDA, so that it can send STOP. Address NACK causes: wrong address or forgotten shift, device not powered or still in reset, and device busy (an EEPROM during its internal write cycle does this).
:::

:::drill tricky
After a reset mid-transaction, SDA is stuck low and the bus never goes idle. Why, and how do you recover without power-cycling?
---
**Answer.** A target was sending a 0 when the controller reset, and it is waiting for clocks to finish the byte. Toggle SCL as a GPIO up to nine times until SDA goes high, then generate a STOP.
:::

:::drill output
These IDs start to transmit at once. Which frames go out, in what order?
```python run=ec-c04-d-can
pending = [0x123, 0x0F0, 0x124, 0x400]
order = []
while pending:
    w = min(pending)
    order.append(format(w, "03X"))
    pending.remove(w)
print(" ".join(order))
```
---
**Answer.** Each arbitration picks the numerically lowest ID, since 0 is dominant. The losers retry as soon as the bus goes idle. This is why CAN IDs are assigned by urgency.
:::

:::drill output
Apply CAN-style bit stuffing to these bits. What goes on the wire?
```python run=ec-c04-d-stuff
def stuff(bits):
    out, run, last = [], 0, None
    for b in bits:
        out.append(b)
        run = run + 1 if b == last else 1
        last = b
        if run == 5:
            out.append("1" if b == "0" else "0")
            last, run = out[-1], 1
    return "".join(out)
print(stuff("00000111110000"))
print(stuff("11111111"))
```
---
**Answer.** After five equal bits, one opposite bit is added, and that stuff bit counts toward the next run. Look at the first output: the 1 added after the zeros is part of the following run of ones, so the next stuff bit comes earlier than you might expect.
:::

:::drill tricky
A single CAN node on a bench keeps transmitting the same frame and its error counter climbs. The wiring is good. What is happening?
---
**Answer.** Nobody is there to drive the ACK slot, so the sender sees an ACK error and retransmits. Test with a second node, or use the controller's loopback mode. Also check for the two terminators, as a bench setup commonly lacks them.
:::

:::drill concept
You must connect: a temperature sensor read once a second, an SD card, a GPS module with a text output, and a motor controller 20 m away in a noisy cabinet. Which bus for each?
---
**Answer.** Sensor: I2C, since it is slow and can share two wires. SD card: SPI (or its native interface), for speed. GPS: UART, since such modules usually stream text. Motor controller: CAN, thanks to the differential pair, CRC and retransmit, which suit distance and noise.
:::

:::drill bug
Find the bug in this button handler.
```c
void BUTTON_IRQHandler(void) {
    delay_ms(20);              // wait out the bounce
    if (pin_is_low()) presses++;
    clear_flag();
}
```
---
**Answer.** It blocks for 20 ms inside an ISR, adding that delay to all equal and lower priority interrupts. Instead, have a 1 to 5 ms timer sample the pin and debounce it there, or have the edge ISR start a timer and return.
:::

:::drill concept
A 12-bit ADC with a 3.3 V reference reads 1024. What is the input voltage? What limits the accuracy beyond the arithmetic?
---
**Answer.** 1024 / 4096 × 3.3 V, which is 0.825 V. Accuracy also depends on reference noise and drift, the source impedance against the sampling time, and the ADC's own errors, such as offset and gain.
:::

## Write the code {#ch04-coding .cd}

:::drill code rating=1500
Write an I2C controller and a target as bit-level state machines on a simulated wired-AND bus. The target has address 0x50 and 16 register bytes. Show a write, then a register read with a repeated START, and a NACK from a wrong address.
---
Nothing here touches real pins. `update` recomputes the bus after any line change, and the target reacts to edges, as hardware does: START and STOP from SDA edges while SCL is high, sampling on rising SCL, and driving on falling SCL.

```c run=ec-c04-c-i2c
#include <stdio.h>
#include <stdint.h>
enum st { IDLE, ADDR, ACK_A, RX, ACK_D, TX, ACK_M };
static int m_scl = 1, m_sda = 1, t_sda = 1, p_scl = 1, p_sda = 1;
static enum st st = IDLE;
static int bits, rw, have_ptr, nack;
static uint8_t byte, ptr, mem[16];
static void load_tx(void) { byte = mem[ptr++ & 15]; bits = 0; t_sda = byte >> 7; st = TX; }
static void update(void) {
    int scl = m_scl, sda = m_sda & t_sda;   /* wired-AND */
    if (scl && p_scl && p_sda && !sda) { st = ADDR; bits = 0; byte = 0; t_sda = 1; }  /* START */
    else if (scl && p_scl && !p_sda && sda) { st = IDLE; t_sda = 1; }                 /* STOP */
    else if (scl && !p_scl) {                                                         /* rising */
        if (st == ADDR || st == RX) { byte = (uint8_t)(byte << 1 | sda); bits++; }
        else if (st == TX) bits++;
        else if (st == ACK_M) nack = sda;
    } else if (!scl && p_scl) {                                                       /* falling */
        if (st == ADDR && bits == 8) {
            if (byte >> 1 == 0x50) { rw = byte & 1; t_sda = 0; st = ACK_A; have_ptr = rw; }
            else st = IDLE;
        } else if (st == RX && bits == 8) {
            if (!have_ptr) { ptr = byte; have_ptr = 1; } else mem[ptr++ & 15] = byte;
            t_sda = 0; st = ACK_D;
        } else if (st == ACK_A) {
            t_sda = 1;
            if (rw) load_tx(); else { st = RX; bits = 0; byte = 0; }
        } else if (st == ACK_D) { t_sda = 1; st = RX; bits = 0; byte = 0; }
        else if (st == TX) {
            if (bits == 8) { t_sda = 1; st = ACK_M; }
            else t_sda = (byte >> (7 - bits)) & 1;
        } else if (st == ACK_M) {
            if (nack) { t_sda = 1; st = IDLE; } else load_tx();
        }
    }
    p_scl = scl; p_sda = sda;
}
static void scl(int v) { m_scl = v; update(); }
static void sda(int v) { m_sda = v; update(); }
static void start(void) { sda(1); scl(1); sda(0); scl(0); }
static void stop(void)  { sda(0); scl(1); sda(1); }
static int bit_io(int v) {
    sda(v); scl(1);
    int r = m_sda & t_sda;
    scl(0);
    return r;
}
static int write_byte(uint8_t b) {           /* returns 1 on ACK */
    for (int i = 7; i >= 0; i--) bit_io((b >> i) & 1);
    return bit_io(1) == 0;
}
static uint8_t read_byte(int ack) {
    uint8_t b = 0;
    for (int i = 0; i < 8; i++) b = (uint8_t)(b << 1 | bit_io(1));
    bit_io(!ack);
    return b;
}
int main(void) {
    start();
    int a = write_byte(0x50 << 1), b = write_byte(2), c = write_byte(0xAB), d = write_byte(0xCD);
    stop();
    printf("write: ACKs %d %d %d %d, mem[2]=%02X mem[3]=%02X\n", a, b, c, d, mem[2], mem[3]);
    start();
    a = write_byte(0x50 << 1); b = write_byte(2);
    start();                                 /* repeated START */
    c = write_byte(0x50 << 1 | 1);
    uint8_t x = read_byte(1), y = read_byte(0);
    stop();
    printf("read:  ACKs %d %d %d, got %02X %02X\n", a, b, c, x, y);
    start();
    a = write_byte(0x51 << 1);
    stop();
    printf("wrong address: ACK %d\n", a);
    return 0;
}
```

The controller's last read uses a NACK, and the target then releases SDA so that the STOP can happen. Interviewers often ask about the details this forces you to handle: the target must release SDA after each ACK, and it drives new bits only after SCL falls.
:::

:::drill code rating=1000
Write a debouncer that is called once per timer tick with the raw pin level, and reports a change only after 4 equal samples in a row.
---
```c run=ec-c04-c-debounce
#include <stdio.h>
#define STABLE 4
static int state = 1, count;       /* pin idles high; pressed reads 0 */
static int debounce(int raw) {     /* returns 1 when the state changes */
    if (raw == state) { count = 0; return 0; }
    if (++count < STABLE) return 0;
    state = raw;
    count = 0;
    return 1;
}
int main(void) {
    const int raw[] = {1,1,0,1,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,1,1};
    for (int t = 0; t < (int)(sizeof raw / sizeof raw[0]); t++)
        if (debounce(raw[t])) printf("tick %d: state=%d\n", t, state);
    return 0;
}
```

The press bounces at the start, and the release bounces too, yet each produces one event. The count restarts whenever the sample matches the current state, so isolated glitches never reach the threshold.
:::

:::drill code rating=1100
Write the CRC-15 used by classic CAN (polynomial 0x4599, initial value 0). The standard check value for the bytes of `"123456789"` is 0x59E. Note how CAN feeds bits MSB first.
---
```python run=ec-c04-c-crc15
def crc15(data):
    crc = 0
    for byte in data:
        for i in range(7, -1, -1):
            top = ((byte >> i) & 1) ^ (crc >> 14)
            crc = (crc << 1) & 0x7FFF
            if top:
                crc ^= 0x4599
    return crc

print(format(crc15(b"123456789"), "X"))
```

Each step shifts one input bit in, and XORs the polynomial when the bit shifted out differs. A real CAN controller computes this in hardware over the frame's bits, so you rarely write it yourself, though it is a common whiteboard question.
:::

## Cheat sheet {#ch04-cheatsheet .th}

- UART: no clock, idle high, start low, LSB first, stop high. 8N1 is 10 bit times per byte. Errors: framing, parity, overrun.
- SPI: SCLK, MOSI, MISO, CS (active low). Full-duplex exchange, MSB usually first. Reads need dummy bytes. No ACK.
- SPI modes: 0 (idle low, sample rising), 1 (idle low, sample falling), 2 (idle high, sample falling), 3 (idle high, sample rising).
- I2C: open-drain with pull-ups, wired-AND. START and STOP are SDA edges while SCL is high. Each byte is 9 clocks. 0x50 becomes 0xA0 for write, 0xA1 for read.
- I2C speeds: 100 k, 400 k, 1 M, 3.4 Mbit/s. Recovery from stuck SDA: up to nine clocks, then STOP.
- Register read over I2C: START, addr+W, reg, repeated START, addr+R, data, NACK, STOP.
- CAN: differential, dominant 0 beats recessive 1, 120 ohm at each end. The lowest ID wins arbitration without damage. Stuff a bit after five equal bits. Any receiver ACKs. Counters lead to error passive, then bus off.
- Polling for short waits, interrupts for moderate rates, DMA for blocks. DMA needs live buffers and cache care.
- Debounce with timer sampling and N equal readings, never with a delay in an ISR.
- ADC step = Vref / 2^N. Respect sampling time and Nyquist. Timer rate = clk / ((PSC+1)(ARR+1)). PWM duty = high time / period.
