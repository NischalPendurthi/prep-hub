---
name: Embedded C & microcontrollers
short: Embedded C
icon: EC
version: C17, simulated on a hosted machine with GCC
eyebrow: volatile · bits · registers · startup · interrupts · RTOS · UART · SPI · I2C · CAN
headline: Explain what your C does to the <em>hardware</em>.
lede: Four chapters for campus technical interviews on embedded C. They assume you know C and basic OS ideas, and they aim at being able to explain a topic and survive the follow-up questions. Each chapter teaches one layer, shows real program output, and gives you at least fifteen drills in the style interviewers use.
card: The C traps that matter on a microcontroller, memory-mapped registers, startup code and linker scripts, interrupts and RTOS scheduling, and the four serial buses.
cta: Start with C for hardware|#ch01; Jump to interrupts|#ch03; Jump to buses|#ch04
search: Search: volatile, W1C, .bss, ring buffer, priority inversion, I2C ACK…
---

:::hero A small predict-the-output drill
```c run=ec-home-hero
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint8_t x = 0x0F;
    puts(~x == 0xF0 ? "equal" : "not equal");
    printf("%d\n", ~x);
    return 0;
}
```

`x` is promoted to `int` before `~` runs, so the result has all the upper bits set and is **-16**, which never equals 0xF0. This is called integer promotion, and Chapter 1 explains it.
:::

## How to use the drills

Answer each drill out loud or on paper before you open it, and treat a wrong answer as the thing to revise. Press <kbd>/</kbd> to search, and use the contents list on the right to move around a chapter.

Every printed output in this guide comes from a program that was really run on a hosted machine: C compiled with `gcc -std=c17 -O1 -Wall` unless the example shows another command, plus some small Python simulators. That machine has no peripherals, so the examples stand in for hardware with ordinary variables, simulated registers and POSIX signals, and each one says so. Startup assembly, linker scripts and code that needs a real microcontroller appear as plain listings with no output.

## Suggested plan

| Day | Read | Drill |
|---|---|---|
| 1 | Ch 1 (`volatile`, promotion, bits, padding, undefined behaviour) | All predict-the-output drills, then write the bit-field helpers |
| 2 | Ch 2 (registers, startup, linker scripts, bootloaders) | Register and section drills, then trace reset to `main` from memory |
| 3 | Ch 3 (interrupts, shared data, ring buffers, watchdog) | ISR drills, then write the ring buffer without looking |
| 4 | Ch 3 (RTOS scheduling, mutexes, priority inversion, rate-monotonic) | Scheduling drills, then do a response-time calculation by hand |
| 5 | Ch 4 (UART, SPI, I2C, CAN, DMA, debouncing, ADC, PWM) | Bus drills, then draw each timing diagram on paper |
| 6 | All cheat sheets | Redo every drill you missed |

## What "embedded" means here

The guide targets bare-metal and small RTOS firmware on a 32-bit microcontroller. Cortex-M is the running example because its reset and interrupt behaviour is defined by the architecture, so the same explanation applies across many chips. Register addresses that are not defined by the architecture are made up for illustration, so on a real part you take them from the datasheet.
