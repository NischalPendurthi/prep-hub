---
title: Memory-mapped registers, startup code and linker scripts
part: Part B · From reset to main
lede: A peripheral is a block of addresses, and a load or store to one of them is a message to hardware. This chapter covers how C code reaches those registers safely, what runs between reset and `main`, how the linker script places code and data, and what a bootloader must do before it jumps. Follow-ups here usually probe read-modify-write hazards and the difference between `.data` and `.bss`.
desc: MMIO, register structs, W1C, read-modify-write, reset vector, .data/.bss, linker scripts, stack and heap, bootloaders
hours: 3
prereqs: Chapter 1, what a compiler and linker do
---

## Registers are addresses {#ch02-mmio .th}

On a memory-mapped CPU there are no special I/O instructions. The peripheral's registers sit at fixed addresses, and an ordinary load or store becomes a bus transaction that the peripheral responds to. Cortex-M defines the large regions architecturally, and each chip places its own memories and peripherals inside them:

| Address range | Default use |
|---|---|
| `0x00000000`–`0x1FFFFFFF` | Code: flash and the vector table |
| `0x20000000`–`0x3FFFFFFF` | SRAM |
| `0x40000000`–`0x5FFFFFFF` | Peripherals |
| `0xE0000000`–`0xE00FFFFF` | Private peripheral bus: interrupt controller (NVIC), SysTick, system control |

A register differs from RAM in ways that matter to code:

- A read can have a **side effect**: reading a data register may pop a FIFO, and reading a status register may clear a flag.
- A write can mean something other than "store": a write-1-to-clear bit is cleared by writing 1, and a command register starts an action.
- Values change on their own, and some bits read back differently from what you wrote. A write-only register might read as 0.

So the access must be `volatile`, and it must be the width the hardware expects. The classic forms are below. The address is an example, and on a real part it comes from the reference manual.

```c
#define UART0_DR (*(volatile uint32_t *)0x40001004u)   // one register, used like a variable
UART0_DR = 'A';                                        // store: sends a byte
uint32_t c = UART0_DR;                                 // load: receives a byte
```

The conversion from integer to pointer is implementation-defined in C, and compilers for these targets define it as you would expect.

## Register structs {#ch02-structs .th}

Peripherals repeat, so vendor headers describe a register block as a struct and point it at each instance's base address. Every member is `volatile`, and `_Static_assert` checks that no padding has crept in.

This machine has no UART, so the example below is a simulation. `sim_uart` is an ordinary variable standing in for the peripheral, and nothing is transmitted. The driver code is the same shape as on a target, where only the `UART0` definition would change.

```c run=ec-c02-regstruct
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
typedef struct {
    volatile uint32_t SR;    /* 0x00 status  */
    volatile uint32_t DR;    /* 0x04 data    */
    volatile uint32_t BAUD;  /* 0x08 divider */
    volatile uint32_t CR;    /* 0x0C control */
} uart_regs;
_Static_assert(offsetof(uart_regs, CR) == 0x0C, "register layout");
#define SR_TXE (1u << 7)
#define CR_EN  (1u << 0)
static uart_regs sim_uart;   /* simulation; on a target: #define UART0 ((uart_regs *)0x40001000u) */
#define UART0 (&sim_uart)
static void uart_init(uint32_t clk, uint32_t baud) {
    UART0->BAUD = (clk + baud / 2) / baud;   /* rounded divider */
    UART0->CR |= CR_EN;
}
static void uart_putc(char c) {
    while (!(UART0->SR & SR_TXE)) { }        /* wait until the transmit register is empty */
    UART0->DR = (uint8_t)c;
}
int main(void) {
    UART0->SR = SR_TXE;                      /* simulation only: pretend the hardware set TXE */
    uart_init(48000000u, 115200u);
    uart_putc('K');
    printf("BAUD=%u CR=%u DR=%c\n", (unsigned)UART0->BAUD, (unsigned)UART0->CR, (char)UART0->DR);
    printf("actual baud=%u\n", 48000000u / (unsigned)UART0->BAUD);
    return 0;
}
```

A real header would make the status register `volatile const` so that a write cannot compile. Here the simulation has to set it, so the member stays writable. Note the rounding too: the divider must be an integer, so the actual baud rate is slightly below 115200, an error of about 0.08 percent. Chapter 4 explains why that small error is acceptable.

## Read-modify-write hazards {#ch02-rmw .th}

`REG |= BIT` is three steps: load, OR, store. Three things go wrong with it. The simulation below models hardware behaviour with small functions, since a plain variable has no special write behaviour:

```c run=ec-c02-rmw
#include <stdio.h>
#include <stdint.h>
#define RX 0x01u
#define TX 0x02u
static uint32_t sr_hw = RX | TX;             /* simulated write-1-to-clear status register */
static uint32_t sr_read(void) { return sr_hw; }
static void sr_write(uint32_t v) { sr_hw &= ~v; }
static volatile uint32_t out;                /* simulated output register */
static void isr(void) { out |= 0x10u; }      /* an interrupt that sets another pin */
int main(void) {
    sr_write(sr_read() | RX);                /* looks like "clear RX" */
    printf("after RMW on W1C:    %02X\n", (unsigned)sr_read());
    sr_hw = RX | TX;
    sr_write(RX);                            /* correct: write only the bit to clear */
    printf("after direct write:  %02X\n", (unsigned)sr_read());
    uint32_t tmp = out;                      /* main starts out |= 0x01 */
    isr();                                   /* interrupt arrives between load and store */
    out = tmp | 0x01u;
    printf("after interrupted RMW: %02X\n", (unsigned)out);
    return 0;
}
```

- **Write-1-to-clear flags.** The OR reads every flag that is currently set and writes them all back as 1s, so it clears them all and may lose an event. Write only the bit you mean.
- **Interrupted update.** If an ISR changes the same register between the load and the store, its change is overwritten. In the output, pin 0x10 was lost. Hardware often provides separate set and clear registers for this reason, where a single write takes effect atomically. Otherwise use a critical section (Chapter 3).
- **Read side effects.** A read-modify-write on a register that clears or pops when read loses data, and so can a debugger's watch window that reads it.

:::trap Two registers in one expression
In `x = REG_A + REG_B` the order of the two volatile reads is unspecified. When order matters, read them in separate statements, because each statement ends with a sequence point.
:::

## From reset to `main` {#ch02-startup .th}

C code assumes a stack exists, globals have their initial values and zero-initialised data is zero. Nothing provides this at power-up, so startup code has to. On a Cortex-M the sequence is:

1. The CPU loads the stack pointer from word 0 of the vector table and the program counter from word 1, the reset vector. Handler addresses have bit 0 set to mark Thumb code.
2. `Reset_Handler` runs. It copies `.data` from flash to RAM, and it zeroes `.bss`.
3. It sets up clocks and, if used, the floating-point unit. Some startup files do this first so that the copy runs faster.
4. It runs C library initialisation and C++ constructors, then calls `main`.
5. If `main` returns, it loops forever, as there is nothing to return to.

Because the hardware loads the stack pointer, Cortex-M startup can be written in C, provided it does not use the data it is about to initialise. Cores that do not load it automatically need a few lines of assembly first. This listing is for a target, so it has no output:

```c
extern uint32_t _sidata, _sdata, _edata, _sbss, _ebss, _estack;   // defined by the linker script
int main(void);

void Reset_Handler(void) {
    uint32_t *src = &_sidata, *dst = &_sdata;
    while (dst < &_edata) *dst++ = *src++;      // .data: flash image to RAM
    for (dst = &_sbss; dst < &_ebss; ) *dst++ = 0;   // .bss: zero
    main();
    for (;;) { }
}
void Default_Handler(void) { for (;;) { } }
void NMI_Handler(void)       __attribute__((weak, alias("Default_Handler")));
void HardFault_Handler(void) __attribute__((weak, alias("Default_Handler")));

__attribute__((section(".isr_vector"), used))
void (*const vector_table[])(void) = {
    (void (*)(void))&_estack,   // word 0: initial stack pointer
    Reset_Handler,              // word 1: reset vector
    NMI_Handler,
    HardFault_Handler,
    // ... other system exceptions, then one entry per peripheral interrupt
};
```

Linker symbols such as `_sdata` have an address and no storage, so the code always uses `&_sdata`.

Weak aliases are how the vector table gets a default for every interrupt: your strong definition replaces the weak one at link time. This is real linker behaviour, so it runs on the host. The script builds the same program with and without a handler:

```bash run=ec-c02-weak
cat > vectors.c <<'EOF'
#include <stdio.h>
void Default_Handler(void) { puts("Default_Handler"); }
void UART_IRQHandler(void) __attribute__((weak, alias("Default_Handler")));
int main(void) { UART_IRQHandler(); return 0; }
EOF
cat > uart.c <<'EOF'
#include <stdio.h>
void UART_IRQHandler(void) { puts("my UART handler"); }
EOF
gcc -std=c17 -Wall vectors.c -o a && ./a
gcc -std=c17 -Wall vectors.c uart.c -o b && ./b
```

## Sections: where things go {#ch02-sections .th}

The compiler sorts everything into named sections, and you can check its choices with `nm` on a host object file. The letters mean: `T` code, `R` read-only data, `D` initialised data, `B` zero-initialised data. Lowercase means the symbol is local to the file.

```c run=ec-c02-nm nondet cmd="gcc -std=c17 -O0 -c main.c && nm main.o | awk '{print $(NF-1), $NF}' | sed -E 's/\.[0-9]+$//'"
int initialised = 42;
int zeroed;
int explicit_zero = 0;
const int konst = 7;
static int file_local = 1;
int func(void) {
    static int counter;
    int on_stack = 1;
    return on_stack + counter++ + file_local;
}
```

| Section | Holds | Stored in flash? | Lives at run time in |
|---|---|---|---|
| `.text` | Code | Yes | Flash (usually run in place) |
| `.rodata` | `const` data, strings | Yes | Flash |
| `.data` | Globals with non-zero initial values | Yes, the initial values | RAM, after the startup copy |
| `.bss` | Globals that start at zero | No, only the size | RAM, after the startup zeroing |

`.bss` exists so that zeros take no space in the image. The `size` tool shows it. The two numbers printed here are its `data` and `bss` columns, for a 16-byte initialised array and a 400-byte zeroed one:

```c run=ec-c02-size nondet cmd="gcc -std=c17 -O0 -c main.c && size main.o | tail -1 | awk '{print $2, $3}'"
int table[4] = {1, 2, 3, 4};
int buffer[100];
```

Marking a lookup table `const` moves it from RAM to flash, which is often the easiest RAM saving on a small part. `on_stack` has no symbol, since it exists only in the function's frame.

## Linker scripts {#ch02-linker .th}

The linker script says which memories exist and where each section goes. It also creates the symbols used by the startup code. This is a minimal example for a Cortex-M with made-up sizes, so copy the real origin and length from your datasheet:

```text
MEMORY {
    FLASH (rx)  : ORIGIN = 0x00000000, LENGTH = 256K
    RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 64K
}
_estack = ORIGIN(RAM) + LENGTH(RAM);       /* stack starts at the top of RAM */
_Min_Stack = 4K;
ENTRY(Reset_Handler)

SECTIONS {
    .isr_vector : { KEEP(*(.isr_vector)) } > FLASH   /* first; KEEP stops garbage collection */
    .text   : { *(.text*) *(.rodata*) } > FLASH
    .data : {                                        /* runs in RAM, loaded from flash */
        _sdata = .;
        *(.data*)
        . = ALIGN(4);
        _edata = .;
    } > RAM AT > FLASH
    _sidata = LOADADDR(.data);
    .bss (NOLOAD) : {
        _sbss = .;
        *(.bss*) *(COMMON)
        . = ALIGN(4);
        _ebss = .;
    } > RAM
    _heap_start = _ebss;
    ASSERT(_estack - _ebss >= _Min_Stack, "not enough RAM left for the stack")
}
```

`> RAM AT > FLASH` gives `.data` two addresses. The **VMA** (virtual memory address) is where the code expects it at run time, in RAM. The **LMA** (load memory address) is where its initial bytes sit in the image, in flash. `LOADADDR` gives the startup code the LMA.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 240" role="img" aria-label="Flash holds vectors, text, rodata and the .data image. RAM holds .data, .bss, the heap growing upward and the stack growing downward">
  <text x="130" y="20" text-anchor="middle" class="t-small">Flash</text>
  <rect x="50" y="30" width="160" height="34" class="d-acc"/><text x="130" y="52" text-anchor="middle" class="t-mono">.isr_vector</text>
  <rect x="50" y="64" width="160" height="60" class="d-soft"/><text x="130" y="98" text-anchor="middle" class="t-mono">.text .rodata</text>
  <rect x="50" y="124" width="160" height="40" class="d-key"/><text x="130" y="149" text-anchor="middle" class="t-mono">.data image</text>
  <text x="510" y="20" text-anchor="middle" class="t-small">RAM (top of the figure is the low address)</text>
  <rect x="430" y="30" width="160" height="40" class="d-key"/><text x="510" y="55" text-anchor="middle" class="t-mono">.data</text>
  <rect x="430" y="70" width="160" height="34" class="d-soft"/><text x="510" y="92" text-anchor="middle" class="t-mono">.bss</text>
  <rect x="430" y="104" width="160" height="30" class="d-acc"/><text x="510" y="124" text-anchor="middle" class="t-mono">heap, grows up</text>
  <rect x="430" y="134" width="160" height="50" class="d-box"/><text x="510" y="164" text-anchor="middle" class="t-small">free</text>
  <rect x="430" y="184" width="160" height="40" class="d-trap"/><text x="510" y="209" text-anchor="middle" class="t-mono">stack, grows down</text>
  <path d="M210 144 L 330 144 L 330 50 L 430 50" class="d-line-key"/>
  <text x="240" y="136" class="t-small t-key">startup copy</text>
</svg></div><figcaption><b>Two copies of .data.</b> The initial bytes live in flash, and the variables live in RAM. Without memory protection, a stack that grows into the heap or <code>.bss</code> overwrites them silently.</figcaption></figure>

The stack and heap usually share what is left of RAM, growing toward each other. With no MMU, nothing stops a collision by default. Teams measure stack use by filling it with a known pattern and checking how much survived. Other defences are an MPU guard region, or placing the stack at the bottom of RAM so that an overflow runs off the end of RAM and faults. Many firmware projects avoid `malloc` after startup, because fragmentation and allocation failures are hard to bound on a device that runs for years. They use static buffers and fixed-size pools.

## Bootloader basics {#ch02-boot .th}

A bootloader is a small program at the reset address that decides what to run and can update the main application. A typical flow:

1. Run minimal init, and check whether an update was requested (a pin, a flag in RAM, or a command).
2. Validate the application image, typically a magic number, a length and a CRC or signature in a header.
3. If it is valid, jump to it. Otherwise stay in update mode, or fall back to a second image slot.

Before jumping, it should disable interrupts and put the peripherals it used back into their reset state, as the application expects a clean start. Then it points the vector table base register at the application's table, loads the stack pointer from word 0 and branches to word 1. A target-only sketch:

```c
#define VTOR (*(volatile uint32_t *)0xE000ED08u)    // vector table offset register
void jump_to_app(uint32_t app_base) {
    const uint32_t *vt = (const uint32_t *)app_base;
    disable_interrupts_and_peripherals();
    VTOR = app_base;                                // must meet the architecture's alignment rule
    __asm volatile ("msr msp, %0" : : "r" (vt[0]));
    ((void (*)(void))vt[1])();
}
```

The application must be linked for its slot: its linker script's flash origin is the slot address. Flash has its own rule that shapes update code. Erasing works on whole sectors and sets all bits to 1, and programming can only change 1s to 0s. A power cut during an update is the case to design for, which is why robust designs keep two slots and switch to the new one only after it validates.

## Drills {#ch02-drills .dr}

:::drill concept
Why must registers be accessed through `volatile`? Give a concrete failure without it.
---
**Answer.** Without it the compiler may read a status register once and loop on the cached value, so `while (!(SR & READY));` hangs forever at `-O2`. It may also merge or drop writes to a command register.
:::

:::drill bug
This register is write-1-to-clear. The handler sometimes loses transmit events. Find the bug.
```c
void UART_IRQHandler(void) {
    if (UART0->SR & RX_DONE) {
        handle_rx();
        UART0->SR |= RX_DONE;   // acknowledge
    }
}
```
---
**Answer.** `|=` reads all set flags and writes them back, which also clears `TX_DONE` if it is pending. Fix: `UART0->SR = RX_DONE;`.
:::

:::drill output
Bits are write-1-to-clear in this simulated register. What does this print?
```c run=ec-c02-d-w1c
#include <stdio.h>
static unsigned sr = 0x0F;
static void write_sr(unsigned v) { sr &= ~v; }
int main(void) {
    write_sr(0x01);
    printf("%02X\n", sr);
    write_sr(sr & 0x06);
    printf("%02X\n", sr);
    write_sr(sr | 0x10);
    printf("%02X\n", sr);
    return 0;
}
```
---
**Answer.** `0E`, then `08` (bits 1 and 2 were written as 1), then `00`, because the last write includes every bit that was still set.
:::

:::drill output
What does this print? It runs on a host, and the layout here matches a 32-bit target because everything is `uint32_t` or `uint16_t`.
```c run=ec-c02-d-reserved
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
typedef struct {
    volatile uint32_t A;
    uint32_t RESERVED[3];
    volatile uint32_t B;
    volatile uint16_t C;
} regs;
int main(void) {
    printf("%zu %zu %zu\n", offsetof(regs, B), offsetof(regs, C), sizeof(regs));
    return 0;
}
```
---
**Answer.** `16 20 24`. The reserved array skips the hole in the register map. The last 2 bytes are trailing padding, so the struct's alignment of 4 is kept.
:::

:::drill output
Flash programming can only turn 1s into 0s, so a program is an AND with what is already there. What does this simulation print?
```c run=ec-c02-d-flash
#include <stdio.h>
#include <stdint.h>
int main(void) {
    uint8_t cell = 0xFF;      /* erased */
    cell &= 0xF0;             /* program 0xF0 */
    printf("%02X\n", cell);
    cell &= 0x0F;             /* program 0x0F without erasing */
    printf("%02X\n", cell);
    return 0;
}
```
---
**Answer.** `F0`, then `00`. The second write cannot bring back any 1s, so the cell does not hold 0x0F. You must erase the whole sector first.
:::

:::drill output
Predict the `nm` letter for each symbol. `B` is zero-initialised, `D` initialised and `R` read-only.
```c run=ec-c02-d-nm nondet cmd="gcc -std=c17 -O0 -c main.c && nm main.o | awk '{print $(NF-1), $NF}'"
#include <stdint.h>
char buf[64];
char text[] = "hi";
const char *msg = "hi";
const uint16_t table[2] = {1, 2};
```
---
**Answer.** `buf` is `B`. `text` is `D`, since it is a writable array with initial contents. `msg` is `D` as well: the pointer is a writable variable, and only the string it points to is read-only. `table` is `R`.
**Why.** To put the pointer in read-only memory too, you write `const char *const msg`.
:::

:::drill concept
What are the first two words of a Cortex-M vector table, and why does the reset vector value look odd?
---
**Answer.** Word 0 is the initial stack pointer and word 1 is the address of `Reset_Handler`. The value has bit 0 set to mark Thumb state, so `Reset_Handler` at `0x100` appears as `0x101`.
:::

:::drill concept
Explain `.data` versus `.bss`. Which uses flash, which uses RAM?
---
**Answer.** Both use RAM at run time. `.data` also uses flash for its initial values, which startup copies. `.bss` takes no flash, only a size, and startup fills it with zeros.
:::

:::drill tricky
`int x = 0;` and `static int y;`: which section? And what is a global's value if startup skips the zeroing?
---
**Answer.** Both go in `.bss`. Without the zero loop, they hold whatever SRAM contained. The C rule that globals start at zero is delivered by the startup code, and SRAM contents are not defined at power-up.
:::

:::drill bug
Startup code copies `.data`, but all initial values come out wrong. Why?
```c
extern uint32_t _sidata, _sdata, _edata;
uint32_t *src = (uint32_t *)_sidata;
```
---
**Answer.** `_sidata` used as a value reads the word stored at that address. Linker symbols carry their information in their address, so it must be `&_sidata`.
:::

:::drill concept
What is the difference between LMA and VMA, and which section needs them to differ?
---
**Answer.** The load address is where bytes sit in the image, and the virtual address is where the code uses them at run time. `.data` is the usual case, with LMA in flash and VMA in RAM. Code copied to RAM for speed or during flash updates also needs both.
:::

:::drill tricky
A task crashes at random, and a global changes value without being written. Your stack is above `.bss`. What do you suspect, and how do you confirm it?
---
**Answer.** Stack overflow into the data below it. Confirm by filling the stack with a known pattern and checking the high-water mark, or by adding an MPU guard region so that an overflow faults at the exact instruction.
:::

:::drill tricky
Why is an empty delay loop `for (i = 0; i < 100000; i++) { }` a bad idea?
---
**Answer.** With a non-volatile `i` the optimiser removes the loop. With a volatile `i` the delay still changes with clock speed, flash wait states and interrupts. Use a timer or a cycle counter.
:::

:::drill concept
Name the steps a bootloader takes between deciding to run the application and the application's `main`.
---
**Answer.** Disable interrupts and de-initialise the peripherals it used, set the vector table base to the application's table, load the stack pointer from the application's word 0, and branch to its word 1. The application's own `Reset_Handler` then sets up `.data` and `.bss`.
**Why.** If the vector base stays unchanged, the application's first interrupt runs a bootloader handler.
:::

:::drill tricky
Why do many firmware projects forbid `malloc` after initialisation?
---
**Answer.** Allocation time is not bounded, fragmentation can make it fail after days of uptime, and a small system has no good way to recover. Static buffers and fixed-block pools have predictable timing and fail in a way you can test.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1200
A 64-bit timer is read through two 32-bit registers, and the counter can carry between the two reads. Write a safe read. The simulation advances the timer on every register read.
---
Read high, low, then high again, and retry if the high word changed.

```c run=ec-c02-c-hilo
#include <stdio.h>
#include <stdint.h>
static uint64_t timer = 0xFFFFFFFFull;     /* simulated: about to carry into the high word */
static uint32_t read_hi(void) { uint32_t v = (uint32_t)(timer >> 32); timer++; return v; }
static uint32_t read_lo(void) { uint32_t v = (uint32_t)timer; timer++; return v; }
static uint64_t naive(void) {
    uint64_t hi = read_hi();
    return hi << 32 | read_lo();
}
static uint64_t safe(void) {
    uint32_t hi, lo;
    do { hi = read_hi(); lo = read_lo(); } while (hi != read_hi());
    return (uint64_t)hi << 32 | lo;
}
int main(void) {
    printf("naive %016llX\n", (unsigned long long)naive());
    timer = 0xFFFFFFFFull;
    printf("safe  %016llX\n", (unsigned long long)safe());
    return 0;
}
```

The naive read combines the old high word with the low word from after the carry, so the time appears to jump back by about 2^32 ticks. The retry loop sees the high word change and reads again.
:::

:::drill code rating=1300
A bootloader has two image slots, each with a header holding a magic number, a length and a CRC-32 of the payload. Write the check, and have it pick the valid slot with the higher version.
---
The CRC here is the common reflected CRC-32 (polynomial 0xEDB88320). The standard check value for `"123456789"` is CBF43926, so the program tests that first.

```c run=ec-c02-c-crc
#include <stdio.h>
#include <stdint.h>
#include <string.h>
static uint32_t crc32(const uint8_t *p, size_t n) {
    uint32_t c = 0xFFFFFFFFu;
    while (n--) {
        c ^= *p++;
        for (int i = 0; i < 8; i++) c = (c >> 1) ^ (0xEDB88320u & (0u - (c & 1u)));
    }
    return ~c;
}
#define MAGIC 0x41505031u
struct slot { uint32_t magic, version, len, crc; uint8_t payload[16]; };
static int valid(const struct slot *s) {
    return s->magic == MAGIC && s->len <= sizeof s->payload && crc32(s->payload, s->len) == s->crc;
}
static int choose(const struct slot *a, const struct slot *b) {
    int va = valid(a), vb = valid(b);
    if (va && vb) return a->version >= b->version ? 0 : 1;
    return va ? 0 : vb ? 1 : -1;
}
int main(void) {
    printf("%08X\n", (unsigned)crc32((const uint8_t *)"123456789", 9));
    struct slot a = {MAGIC, 3, 5, 0, "appV3"}, b = {MAGIC, 4, 5, 0, "appV4"};
    a.crc = crc32(a.payload, a.len);
    b.crc = crc32(b.payload, b.len);
    printf("both valid: slot %d\n", choose(&a, &b));
    b.payload[0] ^= 1;      /* flash corruption or an interrupted update */
    printf("b corrupt:  slot %d\n", choose(&a, &b));
    a.magic = 0;
    printf("none valid: slot %d\n", choose(&a, &b));
    return 0;
}
```

Checking `len` before computing the CRC matters, since the header itself may be corrupt.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- MMIO: registers are addresses. Use `volatile`, the correct width, and `_Static_assert` on struct layouts.
- Regions on Cortex-M: code at `0x00000000`, SRAM at `0x20000000`, peripherals at `0x40000000`, system control at `0xE0000000`.
- `REG |= x` is load, OR, store. It is unsafe on write-1-to-clear flags and when an ISR shares the register. Prefer set and clear registers where they exist.
- Reads can have side effects: a FIFO pop, a clear-on-read flag, and also a debugger read.
- Reset: load SP from word 0, PC from word 1, copy `.data`, zero `.bss`, clocks, constructors, `main`, then loop forever.
- `.text` and `.rodata` live in flash. `.data` has LMA in flash and VMA in RAM. `.bss` is RAM only, with no image bytes.
- Linker symbols are addresses, so use `&_sdata`. `KEEP` protects the vector table, and `ASSERT` catches a RAM overrun at link time.
- Stack and heap grow toward each other. Measure the high-water mark and use an MPU guard where possible. Prefer static allocation or pools.
- Bootloader: validate the image, de-initialise, set the vector table base, load SP, branch to the reset vector. Keep two slots to survive power loss.
- Flash: erase is by sector and gives all 1s. Programming only clears bits.
