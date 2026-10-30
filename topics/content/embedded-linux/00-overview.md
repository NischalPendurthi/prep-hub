---
name: Embedded Linux & kernel
short: Embedded Linux
icon: EL
version: Recent mainline Linux; version-sensitive APIs are flagged
eyebrow: boot · drivers · interrupts · DMA · PREEMPT_RT · debugging · Yocto
headline: Explain what happens <em>below</em> your program.
lede: Six chapters on the Linux work done close to the hardware, for technical interviews where you must explain a mechanism and survive the follow-up questions. You should already know C and basic operating system ideas. Every userspace claim that can be demonstrated comes with a program and its real output, and every chapter ends with drills, coding problems and a cheat sheet.
card: How a board boots, how drivers talk to hardware, interrupts and kernel locks, DMA and cache coherency, real-time latency tuning, reading an oops, cross-toolchains, Yocto and containers.
cta: Start with the boot chain|#ch01; Jump to DMA|#ch03; Latency tuning|#ch04
search: Search: device tree, copy_to_user, spinlock, cyclictest, oops…
---

:::hero A small predict-the-output drill
```c run=el-home-hero
#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

int main(void) {
    int fd = open("/dev/zero", O_RDONLY);
    char *volatile bad = (char *)1;      /* an address no page is mapped at */
    ssize_t n = read(fd, bad, 16);
    printf("read returned %zd: %s\n", n, strerror(errno));
    printf("the process is still alive\n");
    close(fd);
}
```

The kernel writes to user memory through `copy_to_user`, which survives a bad pointer. The driver gets told the copy failed and returns `-EFAULT`, so the program sees **-1 and "Bad address"** instead of a crash. Chapter 2 explains how.
:::

## How to use the drills

Answer each drill out loud or on paper before you open it, and treat a wrong answer as the thing to revise. Many interview questions here are explanation questions, so practise saying the mechanism in order: what triggers it, who runs, in what context, what can go wrong.

## What can and cannot run here

Output shown under a code block comes from really running that block, on an ordinary machine with no special privileges. Blocks that need root or real hardware are shown as code with no output. That covers kernel modules, device tree compilation, Yocto, JTAG, ftrace and cyclictest. Any sample log in those sections is labelled illustrative, so read it for its shape and do not memorise its numbers.

The runnable programs are userspace demonstrations of a kernel idea. Some are real (a real `read` on `/dev/zero` going through a real driver), and some are simulations that the text labels as simulations (a small cache model, a scheduler model). Programs marked with varying output depend on the machine they ran on.

## Suggested plan

| Week | Read | Drill |
|---|---|---|
| 1 | Ch 1 (boot chain, device tree, BSP) and Ch 2 (modules, char drivers) | All drills in both, then write the echo driver from memory on paper |
| 2 | Ch 3 (interrupts, locking, DMA, barriers) | All drills, then draw the stale-read and dirty-eviction figure from memory |
| 3 | Ch 4 (PREEMPT_RT, latency tuning) | All drills, then explain the full tuning checklist out loud in order |
| 4 | Ch 5 (debugging) and Ch 6 (toolchains, Yocto, containers) | All drills, then redo every drill you missed in earlier chapters |

If you have a Linux laptop, build an out-of-tree module against your running kernel's headers, and boot a kernel in QEMU with an emulated ARM board. Both are safe, cost nothing and give you real stories to tell.

## Kernel versions

Kernel-internal APIs change between releases, and there is no stable in-kernel API. The guide names a version wherever an API is known to have moved, and the driver examples were compile-checked, but never loaded, against 7.0 headers and all but one also against 6.14. In an interview, saying "this changed around 6.x, so I would check the tree I am working on" is a good answer.
