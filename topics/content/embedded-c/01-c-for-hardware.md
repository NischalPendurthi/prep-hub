---
title: C for hardware
part: Part A · The language close to the metal
lede: Firmware uses the corners of C that desktop code can ignore. A register changes without the program touching it, an 8-bit value silently becomes an `int`, a struct picks up invisible padding, and undefined behaviour can delete your check. This chapter covers the rules you need to read and explain low-level C, and the predict-the-output questions that test them.
desc: volatile, const volatile, set/clear/toggle, promotion, fixed-width types, padding, endianness, UB
hours: 3
prereqs: C pointers and structs
---

## What `volatile` does {#ch01-volatile .th}

The compiler assumes that memory only changes when your code changes it. So it may keep a value in a register, merge two reads and drop a write that is overwritten straight away. That is correct for ordinary variables and wrong for a hardware status register, whose value changes on its own.

`volatile` tells the compiler that every read and write of this object is an observable event. It must perform each access the source asks for, and it must keep volatile accesses in order relative to each other. You can see this in GCC's optimised intermediate code. The command below compiles at `-O2` and counts the loads and stores that remain:

```c run=ec-c01-volatile-counts nondet cmd="gcc -std=c17 -O2 -c -fdump-tree-optimized=dump.txt main.c && echo plain: $(grep -c '= plain;' dump.txt) read, $(grep -c '^ *plain = ' dump.txt) write && echo volatile: $(grep -c '={v} reg;' dump.txt) reads, $(grep -c '^ *reg ={v} ' dump.txt) writes"
int plain;
volatile int reg;
int read_plain(void)   { return plain + plain; }
int read_reg(void)     { return reg + reg; }
void write_plain(void) { plain = 1; plain = 2; }
void write_reg(void)   { reg = 1; reg = 2; }
```

The plain variable is read once and written once. The volatile one keeps both reads and both writes, which is what a polling loop or a command register needs.

`volatile` gives you three things only: no caching in a CPU register, no removed accesses, and no reordering against other volatile accesses. It does **not** make an operation atomic, because `count++` on a volatile is still a separate read and write. It does not order ordinary variables against volatile ones. It does not stop the CPU or a cache from reordering, which needs barriers or the right memory attributes. Use it for hardware registers and for data shared with an interrupt handler, and use real synchronisation for everything else.

### `const volatile` and where the qualifier goes

`const` means this code may not write through the name. `volatile` means the value can change anyway. They do not conflict, and a read-only status register is the textbook case. Read a declaration from the name outwards:

```c
volatile uint32_t *p;              // p can move; the pointed-to register is volatile
uint32_t * volatile q;             // q itself is volatile (changed by an ISR); the data is not
volatile uint32_t * const r;       // fixed pointer to a volatile register, the usual form
const volatile uint32_t *status;   // program may read only; the hardware changes it
```

The compiler rejects a write through `status`, so a read-only register cannot be written by mistake:

```c run=ec-c01-cv-error nondet cmd="gcc -std=c17 -c main.c 2>&1 | grep -o 'assignment of read-only location' | head -1"
#include <stdint.h>
void f(const volatile uint32_t *status) {
    *status = 1;
}
```

## Fixed-width types and integer promotion {#ch01-promotion .th}

`int` is only guaranteed to be at least 16 bits, and it really is 16 bits on some small microcontrollers. Register and protocol code therefore uses `<stdint.h>`: `uint8_t`, `uint16_t`, `uint32_t`, and `uintptr_t` for an address stored in an integer. Use `int` only where the exact width does not matter. Constants need care too: `60000 * 60` overflows where `int` is 16 bits, while `UINT32_C(60000) * 60` does not.

Two rules cause most C puzzles:

- **Integer promotion.** Before arithmetic, anything narrower than `int` becomes `int` if `int` can hold all its values. This includes `uint8_t` and, on a 32-bit machine, `uint16_t`.
- **Usual arithmetic conversions.** If an `int` meets an `unsigned int`, the `int` is converted to unsigned, so -1 becomes the largest unsigned value.

```c run=ec-c01-promotion
#include <stdio.h>
#include <stdint.h>
int main(void) {
    uint8_t a = 200, b = 100, x = 0x0F;
    printf("%d %d\n", a + b, (uint8_t)(a + b));
    printf("%d %d\n", ~x, (uint8_t)~x == 0xF0);
    printf("%zu %zu\n", sizeof a, sizeof(a + b));
    printf("%d %d\n", -1 < 1, -1 < 1u);
    return 0;
}
```

`a + b` is computed in `int`, so it is 300 until you cast it back, and the cast keeps the low 8 bits (44). The size line shows that the sum has `int` type: 4 bytes on this machine and on 32-bit ARM, 2 where `int` is 16 bits. The last line is 1 and then 0, since -1 converted to unsigned is huge.

:::trap Unsigned types can overflow as signed
`uint16_t a = 65535; a * a` promotes both sides to signed `int` on a 32-bit machine, and the product does not fit. That is signed overflow, which is undefined, even though every variable you declared is unsigned. Write `(uint32_t)a * a`.
:::

## Set, clear, toggle, test {#ch01-bits .th}

These four lines come up in almost every embedded interview. Write `1u` and keep the parentheses in macros, because `1 << 31` shifts into the sign bit of an `int`.

```c run=ec-c01-bits
#include <stdio.h>
#include <stdint.h>
#define BIT(n)            (1u << (n))
#define MASK(width)       ((1u << (width)) - 1u)   /* width < 32 */
#define GET(v, pos, w)    (((v) >> (pos)) & MASK(w))
#define SET(v, pos, w, f) (((v) & ~(MASK(w) << (pos))) | (((f) & MASK(w)) << (pos)))
int main(void) {
    uint32_t r = 0;
    r |= BIT(3);                  /* set bit 3 */
    r |= BIT(0);                  /* set bit 0 */
    printf("%02X\n", (unsigned)r);
    r &= ~BIT(3);                 /* clear bit 3 */
    r ^= BIT(7);                  /* toggle bit 7 */
    printf("%02X %d\n", (unsigned)r, (r & BIT(7)) != 0);
    r = SET(r, 4, 3, 5u);         /* write 5 into the field at bits 6..4 */
    printf("%02X %u\n", (unsigned)r, (unsigned)GET(r, 4, 3));
    return 0;
}
```

To change a multi-bit field, clear it first and then OR in the new value. If you only OR, the field ends up as the OR of the old and new values. Shifts on a signed negative value are also out: a right shift of a negative number is implementation-defined, and a left shift is undefined.

Avoid C bit-fields (`unsigned en : 1;`) for registers and wire formats. The standard leaves their order and packing to the compiler, and the access width may not be the one the hardware needs.

## Alignment, padding and the memory map {#ch01-layout .th}

Most types have an alignment: a `uint32_t` wants an address divisible by 4. The compiler keeps members in declared order and inserts padding to satisfy this, and it pads the end so that array elements stay aligned.

```c run=ec-c01-padding
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
struct bad  { uint8_t a; uint32_t b; uint8_t c; };
struct good { uint32_t b; uint8_t a; uint8_t c; };
struct __attribute__((packed)) wire { uint8_t a; uint32_t b; uint8_t c; };
int main(void) {
    printf("bad  %zu, b at %zu, c at %zu\n", sizeof(struct bad),
           offsetof(struct bad, b), offsetof(struct bad, c));
    printf("good %zu\n", sizeof(struct good));
    printf("wire %zu, b at %zu\n", sizeof(struct wire), offsetof(struct wire, b));
    return 0;
}
```

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 150" role="img" aria-label="struct bad uses 12 bytes with 6 bytes of padding, struct good uses 8 bytes with 2 bytes of padding">
  <text x="20" y="44" class="t-mono">bad</text>
  <rect x="80" y="20" width="40" height="36" class="d-acc"/><text x="100" y="43" text-anchor="middle" class="t-mono">a</text>
  <rect x="120" y="20" width="120" height="36" class="d-soft"/><text x="180" y="43" text-anchor="middle" class="t-small">3 bytes padding</text>
  <rect x="240" y="20" width="160" height="36" class="d-key"/><text x="320" y="43" text-anchor="middle" class="t-mono">b</text>
  <rect x="400" y="20" width="40" height="36" class="d-acc"/><text x="420" y="43" text-anchor="middle" class="t-mono">c</text>
  <rect x="440" y="20" width="120" height="36" class="d-soft"/><text x="500" y="43" text-anchor="middle" class="t-small">3 bytes padding</text>
  <text x="20" y="114" class="t-mono">good</text>
  <rect x="80" y="90" width="160" height="36" class="d-key"/><text x="160" y="113" text-anchor="middle" class="t-mono">b</text>
  <rect x="240" y="90" width="40" height="36" class="d-acc"/><text x="260" y="113" text-anchor="middle" class="t-mono">a</text>
  <rect x="280" y="90" width="40" height="36" class="d-acc"/><text x="300" y="113" text-anchor="middle" class="t-mono">c</text>
  <rect x="320" y="90" width="80" height="36" class="d-soft"/><text x="360" y="113" text-anchor="middle" class="t-small">padding</text>
</svg></div><figcaption><b>Order sets the size.</b> The same three members take 12 bytes or 8 bytes. Sorting members from largest to smallest usually gives the smallest struct.</figcaption></figure>

These sizes hold on x86-64, arm64 and 32-bit ARM. Layout is set by each platform's ABI, though, so another target can differ. For example, a pointer is 8 bytes on arm64 and 4 on a Cortex-M, and the alignment of `uint64_t` varies between 32-bit ABIs. When layout must match hardware, check it at compile time with `_Static_assert(offsetof(struct wire, b) == 1, "layout")`.

`packed` removes padding, and that makes `b` misaligned. The compiler then generates safe access code when it can see the member through the struct. Taking `&w.b` loses that knowledge, which is why GCC warns about it. Whether a misaligned load works depends on the core: a Cortex-M0 faults on it, while a Cortex-M3 or M4 allows it for single word and halfword loads and stores. Padding bytes also hold unspecified values, so `memcmp` on two structs can report a difference between equal structs.

### The memory map

A microcontroller has one address space, shared by flash, RAM and peripherals. A load from one address fetches from flash, and the same instruction at another address reads a peripheral register. Chapter 2 shows the regions. Two points follow here. Address 0 can be valid memory, and a null dereference may read data silently instead of faulting. Also, registers usually require a specific access width, which is one more reason to use fixed-width types.

## Endianness {#ch01-endian .th}

Endianness is the order in which a multi-byte value is stored in memory. Little-endian puts the least significant byte at the lowest address. Network protocols conventionally use big-endian. Most Cortex-M devices, x86-64 and arm64 Linux run little-endian, but the output below depends on the machine, so it is marked as varying:

```c run=ec-c01-endian nondet
#include <stdio.h>
#include <stdint.h>
int main(void) {
    uint32_t v = 0x11223344;
    const unsigned char *p = (const unsigned char *)&v;   /* char pointers may alias anything */
    printf("%02X %02X %02X %02X\n", p[0], p[1], p[2], p[3]);
    return 0;
}
```

Shifts work on values, so code built from shifts gives the same answer on any host. Prefer it when you parse a packet. This also avoids casting a `uint8_t *` buffer to `uint32_t *`, which is both a possible misaligned access and a strict-aliasing violation.

```c run=ec-c01-wire
#include <stdio.h>
#include <stdint.h>
static uint32_t read_be32(const uint8_t *b) {
    return (uint32_t)b[0] << 24 | (uint32_t)b[1] << 16 | (uint32_t)b[2] << 8 | b[3];
}
static uint32_t read_le32(const uint8_t *b) {
    return (uint32_t)b[3] << 24 | (uint32_t)b[2] << 16 | (uint32_t)b[1] << 8 | b[0];
}
int main(void) {
    const uint8_t buf[] = {0x11, 0x22, 0x33, 0x44};
    printf("%08X %08X\n", (unsigned)read_be32(buf), (unsigned)read_le32(buf));
    return 0;
}
```

## Undefined behaviour that bites firmware {#ch01-ub .th}

Undefined behaviour (UB) means the standard places no requirement on the program. The compiler assumes UB never happens and optimises on that basis, so a bug can appear only at `-O2` or only on a new compiler. There is no correct output to predict. GCC's `-fsanitize=undefined` reports these at run time on a hosted build, which is a good reason to test your logic on a PC. The command here keeps only the message text:

```c run=ec-c01-ubsan nondet cmd="gcc -std=c17 -O0 -Wall -fsanitize=undefined -o main main.c && ./main 2>&1 | sed -E 's/^.*runtime error: //'"
#include <limits.h>
#include <stdint.h>
volatile int big = INT_MAX, shift = 32, one = 1, sink;
volatile uint16_t u16 = 65535;
int main(void) {
    sink = big + 1;       /* signed overflow */
    sink = one << shift;  /* shift >= width of the type */
    sink = u16 * u16;     /* promoted to int, then overflows */
    sink = one << 31;     /* shift into the sign bit */
    return 0;
}
```

The rest of the list to know:

- **Null or out-of-bounds access.** GCC can remove a null check that comes after a dereference, since the pointer "cannot" be null. Firmware that really uses address 0 can build with `-fno-delete-null-pointer-checks`.
- **Strict aliasing.** Reading an object through a pointer to an incompatible type, such as a `float` through a `uint32_t *`. Use `memcpy`. Unions also work for this in C, though C++ does not allow it.
- **Reading an uninitialised local.** Its stack slot holds whatever was left there.
- **Two unsequenced changes.** `i = i++` and `a[i] = i++` are undefined.
- **Flowing off the end of a non-void function and using the value.**
- **Signed overflow in a loop test.** `i + 1 > i` can be folded to true.

Some results are only **implementation-defined**, so the compiler documents a choice and you can rely on it for that target. Examples are the signedness of plain `char` (signed on x86-64, unsigned on arm64 Linux) and a right shift of a negative number. Unsigned arithmetic is fully defined and wraps modulo 2^N, which is why timer code uses it.

## Drills {#ch01-drills .dr}

:::drill concept
What does `volatile` guarantee, and name two things it does not guarantee.
---
**Answer.** Each read and write in the source happens, and volatile accesses stay in order relative to each other. It does not make read-modify-write atomic, and it does not order non-volatile accesses or stop reordering by the CPU.
**Why.** It is an instruction to the compiler only. Shared-data problems need critical sections, atomics or barriers (Chapter 3).
:::

:::drill output
What does this print?
```c run=ec-c01-d-shift8
#include <stdio.h>
#include <stdint.h>
int main(void) {
    uint8_t a = 0x80;
    printf("%d %d\n", a << 1, (uint8_t)(a << 1));
    uint8_t m = 0xFF;
    printf("%d %d\n", m + 1 == 0, (uint8_t)(m + 1) == 0);
    return 0;
}
```
---
**Answer.** `a << 1` happens in `int`, so it is 256, and the cast truncates it to 0. Likewise `m + 1` is 256, not 0, until it is cast.
:::

:::drill output
What does this print?
```c run=ec-c01-d-signcmp
#include <stdio.h>
int main(void) {
    printf("%d\n", -1 < 1u);
    printf("%d\n", sizeof(int) > -1);
    printf("%d\n", (1 ? -1 : 1u) > 0);
    return 0;
}
```
---
**Answer.** 0, 0, 1. In each line a signed -1 meets an unsigned operand and becomes a huge unsigned value. `sizeof` yields unsigned `size_t`. The conditional expression has one common type, so its -1 is already unsigned before the comparison.
**Why.** `gcc -Wextra` warns about these through `-Wsign-compare`. Plain `-Wall` in C does not.
:::

:::drill output
What does this print?
```c run=ec-c01-d-macro
#include <stdio.h>
#define SQ(x) x * x
#define TWICE(x) x + x
#define MAX(a, b) ((a) > (b) ? (a) : (b))
int main(void) {
    printf("%d %d\n", SQ(1 + 2), 3 * TWICE(2));
    int i = 5, j = 3;
    int m = MAX(i++, j);
    printf("%d %d\n", m, i);
    return 0;
}
```
---
**Answer.** `SQ(1 + 2)` expands to `1 + 2 * 1 + 2`, which is 5. `3 * TWICE(2)` is `3 * 2 + 2`, which is 8. `MAX` evaluates `i++` twice when it wins: the test sees 5, then the result takes 6, and `i` ends at 7.
**Why.** The `?:` has a sequence point after its condition, so this one is well defined, though still a bug. Prefer `static inline` functions.
:::

:::drill output
What does this print on x86-64 or arm64? Which numbers could differ on another target?
```c run=ec-c01-d-structs
#include <stdio.h>
#include <stdint.h>
struct s1 { uint8_t a; uint16_t b; uint8_t c; uint32_t d; };
struct s2 { uint8_t a[3]; uint16_t b; };
struct s3 { uint8_t c; double d; };
int main(void) {
    printf("%zu %zu %zu\n", sizeof(struct s1), sizeof(struct s2), sizeof(struct s3));
    return 0;
}
```
---
**Answer.** 12, 6, 16. In `s1`, `b` sits at 2, `c` at 4, then 3 padding bytes put `d` at 8. In `s2`, `b` is aligned to offset 4. In `s3`, `d` is at 8.
**Why.** `s3` depends on the ABI's alignment for `double`. It is 8 here, and some 32-bit ABIs use 4, which would give 12.
:::

:::drill output
What does this print? `sizeof(int)` is 4 here.
```c run=ec-c01-d-sizeof
#include <stdio.h>
#include <string.h>
int main(void) {
    char s[] = "abc\0def";
    int x = 5;
    size_t n = sizeof(x++);
    printf("%zu %zu %zu %d %zu\n", sizeof s, strlen(s), sizeof('a'), x, n);
    return 0;
}
```
---
**Answer.** 8, 3, 4, 5, 4. The array holds 7 characters plus a final NUL. `strlen` stops at the first NUL. A character constant has type `int` in C (in C++ it is `char`, size 1). The operand of `sizeof` is not evaluated, so `x` stays 5.
:::

:::drill output
What does this print on a machine with 32-bit `int`, and which line is implementation-defined?
```c run=ec-c01-d-sext
#include <stdio.h>
#include <stdint.h>
int main(void) {
    int8_t s = -1;
    printf("%u %08X\n", (uint8_t)s, (unsigned)(uint32_t)s);
    uint8_t u = 0xFF;
    printf("%d %d\n", (int)u, -8 >> 1);
    return 0;
}
```
---
**Answer.** First line: `255 FFFFFFFF`. Conversion to unsigned is defined as modulo 2^N, so widening a negative value sign-extends. Second line: `255 -4`. A `uint8_t` has no sign to extend. `-8 >> 1` is implementation-defined, and GCC shifts arithmetically, giving -4.
:::

:::drill output
Plain `char` is the trap here. What does this print, and why can two machines disagree?
```c run=ec-c01-d-char nondet
#include <stdio.h>
int main(void) {
    char c = 0xFF;
    printf("%d %d\n", c == 0xFF, c);
    return 0;
}
```
---
**Answer.** The recorded output is from one machine and is not portable. On x86-64, `char` is signed, so `c` is -1 and the comparison is 0. On arm64 Linux, `char` is unsigned, so `c` is 255 and the comparison is 1.
**Why.** Signedness of plain `char` is implementation-defined. Use `uint8_t` for bytes and `char` only for text.
:::

:::drill output
What does this print?
```c run=ec-c01-d-float
#include <stdio.h>
int main(void) {
    float f = 0.1;
    printf("%d %d\n", f == 0.1, f == 0.1f);
    return 0;
}
```
---
**Answer.** `0 1`. `f` holds 0.1 rounded to `float`. In `f == 0.1` it is widened to `double` and compared with the closer `double` value of 0.1, so they differ. Compared with a `float` constant, the values match.
**Why.** Many small microcontrollers have no hardware `double`, so an unsuffixed `0.1` can also pull in slow software routines.
:::

:::drill output
A 32-bit tick counter wraps around. A wait started at `start` with a timeout of 0x100 ticks. For each `now`, the program prints the elapsed ticks and then two timeout checks. Which check is right?
```c run=ec-c01-d-wrap
#include <stdio.h>
#include <stdint.h>
int main(void) {
    uint32_t start = 0xFFFFFFF0u, timeout = 0x100u;
    uint32_t times[] = {0xFFFFFFF8u, 0x10u, 0x200u};
    for (int i = 0; i < 3; i++) {
        uint32_t now = times[i];
        printf("%u %d %d\n", (unsigned)(now - start), now - start >= timeout, now >= start + timeout);
    }
    return 0;
}
```
---
**Answer.** The first check, `now - start >= timeout`, is right. On the first row only 8 ticks have passed, yet the second check prints 1 and fires early, because `start + timeout` wrapped to the small value 0xF0.
**Why.** Unsigned subtraction is modulo 2^32, so `now - start` is the true elapsed time as long as the wait is shorter than one full wrap. Rows two and three show it staying correct across the wrap.
:::

:::drill bug
This parser fails on some packets. Find the bug. The answer shows what the sanitizer reports.
```c run=ec-c01-d-bug-shift nondet cmd="gcc -std=c17 -O0 -Wall -fsanitize=undefined -o main main.c && ./main 2>&1 | sed -E 's/^.*runtime error: //' | grep -v '^[0-9A-F]*$'"
#include <stdio.h>
#include <stdint.h>
uint32_t be32(const uint8_t *b) {
    return b[0] << 24 | b[1] << 16 | b[2] << 8 | b[3];
}
int main(void) {
    const uint8_t pkt[] = {0xFF, 0, 0, 1};
    printf("%08X\n", (unsigned)be32(pkt));
    return 0;
}
```
---
**Answer.** `b[0]` is promoted to signed `int`, and `0xFF << 24` does not fit. Fix: `(uint32_t)b[0] << 24`.
**Why.** It works for bytes below 0x80 and breaks only when the top bit is set, so tests with small values pass.
:::

:::drill bug
Intended: print "clear" when bit 1 is clear. Find the bug. The answer shows the warning tag and the program's result.
```c run=ec-c01-d-bug-prec nondet cmd="gcc -std=c17 -O1 -Wall -o main main.c 2>&1 | grep -o '.-Wparentheses.' | head -1; ./main"
#include <stdio.h>
#define FLAG 0x02
int main(void) {
    unsigned flags = 0x01;
    if (flags & FLAG == 0) puts("clear");
    else puts("set");
    return 0;
}
```
---
**Answer.** `==` binds tighter than `&`, so this is `flags & (FLAG == 0)`, which is `flags & 0`, always false. Fix: `(flags & FLAG) == 0`.
:::

:::drill bug
`uint64_t mask = 1 << 40;` looks fine because the target is 64 bits. What is wrong? And what is wrong with `for (uint8_t i = 0; i < 256; i++)`?
---
**Answer.** The shift happens in `int` before the assignment, and 40 is at least the width of `int`, so it is UB. GCC warns with `-Wshift-count-overflow`. Use `UINT64_C(1) << 40`. The loop never ends, since `i` wraps from 255 to 0 and is always below 256.
:::

:::drill tricky
What does `*(volatile uint32_t *)0` do on a Cortex-M whose flash is mapped at address 0?
---
**Answer.** It can silently return the first word of the vector table, the initial stack pointer, with no fault.
**Why.** Address 0 is ordinary memory on such a part. So a null pointer bug may stay hidden there, even though the C standard treats it as undefined and the compiler may optimise on that basis.
:::

:::drill tricky
You receive bytes in `uint8_t buf[]` and write `uint32_t v = *(uint32_t *)&buf[1];`. Give two reasons this is wrong and the fix.
---
**Answer.** The address may be misaligned, which faults on some cores. It also reads a `uint8_t` object through a `uint32_t` lvalue, which violates strict aliasing. Use `memcpy(&v, &buf[1], 4)`, then fix the byte order, or build the value with shifts.
**Why.** Compilers turn a small `memcpy` into a single load when the target allows it, so it costs nothing.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1100
Write `is_pow2`, `popcount`, `lowest_set` and `reverse8` for unsigned values, without library calls.
---
`x & (x - 1)` clears the lowest set bit, which gives both the power-of-two test and a loop that runs once per set bit (Kernighan's method).

```c run=ec-c01-c-tricks
#include <stdio.h>
#include <stdint.h>
static int is_pow2(uint32_t x) { return x != 0 && (x & (x - 1)) == 0; }
static int popcount(uint32_t x) { int n = 0; for (; x; x &= x - 1) n++; return n; }
static uint32_t lowest_set(uint32_t x) { return x & (~x + 1u); }
static uint8_t reverse8(uint8_t b) {
    b = (uint8_t)((b & 0xF0) >> 4 | (b & 0x0F) << 4);
    b = (uint8_t)((b & 0xCC) >> 2 | (b & 0x33) << 2);
    b = (uint8_t)((b & 0xAA) >> 1 | (b & 0x55) << 1);
    return b;
}
int main(void) {
    printf("%d %d %d\n", is_pow2(64), is_pow2(0), is_pow2(65));
    printf("%d %u\n", popcount(0xF0F0u), (unsigned)lowest_set(0x68u));
    printf("%02X %02X\n", reverse8(0x01), reverse8(0xB4));
    return 0;
}
```

`reverse8` swaps nibbles, then pairs, then single bits. An interviewer may ask for the loop version too, which is 8 shifts.
:::

:::drill code rating=1200
Write functions that extract and insert a bit field in a 32-bit value. They must handle a width of 32, where `1u << 32` would be UB.
---
Build the mask from the top so that no shift reaches 32.

```c run=ec-c01-c-field
#include <stdio.h>
#include <stdint.h>
static uint32_t mask32(unsigned width) {   /* 1 <= width <= 32 */
    return UINT32_MAX >> (32u - width);
}
static uint32_t field_get(uint32_t v, unsigned pos, unsigned w) {
    return (v >> pos) & mask32(w);
}
static uint32_t field_set(uint32_t v, unsigned pos, unsigned w, uint32_t f) {
    uint32_t m = mask32(w) << pos;
    return (v & ~m) | ((f << pos) & m);
}
int main(void) {
    uint32_t r = 0xABCD1234u;
    printf("%X %X\n", (unsigned)field_get(r, 8, 8), (unsigned)field_get(r, 0, 32));
    printf("%08X\n", (unsigned)field_set(r, 8, 8, 0xFFu));
    printf("%08X\n", (unsigned)field_set(r, 0, 32, 0u));
    return 0;
}
```

The value is masked after shifting, so an oversized `f` cannot spill into neighbouring fields.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- `volatile`: every access happens, volatile accesses stay in order. Not atomic, not a CPU barrier.
- `const volatile`: read-only for code, still changed by hardware. `volatile uint32_t *const` is a fixed pointer to a register.
- Set `r |= m`, clear `r &= ~m`, toggle `r ^= m`, test `(r & m) != 0`. Use `1u << n`, and clear a field before writing it.
- Narrow types promote to `int` before arithmetic. So `~x` on a `uint8_t` has its upper bits set, and `uint16_t * uint16_t` can overflow as signed.
- `int` meets `unsigned`: the `int` becomes unsigned. `-1 < 1u` is false.
- Use `<stdint.h>` types and `UINT32_C`. Plain `char` has platform-dependent sign, so use `uint8_t` for bytes.
- Padding comes from alignment. Sort members large to small, assert layout with `_Static_assert`, and do not `memcmp` structs.
- `packed` removes padding and can create misaligned access, and a Cortex-M0 faults on that.
- Parse wire data with shifts or `memcpy`, and cast each byte before a big shift.
- UB to name: signed overflow, shift at or above width, shift into the sign bit, aliasing violations, uninitialised reads, `i = i++`, null dereference.
- Time arithmetic: `now - start >= timeout` with unsigned types survives wraparound.
