---
title: Boot chain, device tree and BSP porting
part: Part A · Getting a board running
lede: Between power-on and your first process, several small programs run in sequence, and each one exists because the next one needs something it cannot set up alone. This chapter follows that chain from ROM to init, explains how the kernel learns about hardware it cannot discover, compares ARMv7, ARMv8 and x86_64, and lists what BSP porting involves. Interviewers use these questions to check whether you have thought about the machine before the kernel is running.
desc: ROM, SPL, U-Boot, kernel handover, init, device tree, ARM vs x86, BSP bring-up, errata
hours: 3
prereqs: C, virtual memory basics, what a process and a device driver are
---

## The boot chain {#ch01-chain .th}

When a board powers on, DRAM does not work yet. The DRAM controller needs clock and timing settings that only software can program, and that software has to run somewhere. Everything about the early boot chain follows from this constraint: each stage runs from memory that already works and makes more memory or more hardware available to the next stage.

<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 720 210" role="img" aria-label="Boot stages in order: ROM in on-chip memory, first stage loader in SRAM, U-Boot in DRAM, kernel in DRAM, init in user space">
  <rect x="10" y="40" width="120" height="86" rx="8" class="d-soft"/><text x="70" y="64" text-anchor="middle" class="t-bold">Boot ROM</text><text x="70" y="86" text-anchor="middle" class="t-small">fixed in silicon</text><text x="70" y="106" text-anchor="middle" class="t-small">runs in place</text>
  <path d="M130 83 L 152 83" class="d-line"/>
  <rect x="152" y="40" width="120" height="86" rx="8" class="d-soft"/><text x="212" y="64" text-anchor="middle" class="t-bold">SPL</text><text x="212" y="86" text-anchor="middle" class="t-small">runs in SRAM</text><text x="212" y="106" text-anchor="middle" class="t-small">starts DRAM</text>
  <path d="M272 83 L 294 83" class="d-line"/>
  <rect x="294" y="40" width="120" height="86" rx="8" class="d-acc"/><text x="354" y="64" text-anchor="middle" class="t-bold">U-Boot</text><text x="354" y="86" text-anchor="middle" class="t-small">runs in DRAM</text><text x="354" y="106" text-anchor="middle" class="t-small">loads the kernel</text>
  <path d="M414 83 L 436 83" class="d-line"/>
  <rect x="436" y="40" width="120" height="86" rx="8" class="d-key"/><text x="496" y="64" text-anchor="middle" class="t-bold">Kernel</text><text x="496" y="86" text-anchor="middle" class="t-small">MMU on, drivers</text><text x="496" y="106" text-anchor="middle" class="t-small">mounts rootfs</text>
  <path d="M556 83 L 578 83" class="d-line"/>
  <rect x="578" y="40" width="130" height="86" rx="8" class="d-box"/><text x="643" y="64" text-anchor="middle" class="t-bold">init (PID 1)</text><text x="643" y="86" text-anchor="middle" class="t-small">user space</text><text x="643" y="106" text-anchor="middle" class="t-small">starts services</text>
  <text x="212" y="160" text-anchor="middle" class="t-small">Each stage finds, loads and jumps to the next.</text>
  <text x="212" y="182" text-anchor="middle" class="t-small">With secure boot, each stage also verifies the next.</text>
</svg></div><figcaption><b>A typical ARM boot.</b> Names and the number of stages vary by SoC. ARMv8 systems often add trusted firmware between the SPL and U-Boot.</figcaption></figure>

### Boot ROM

The CPU leaves reset and fetches from a fixed address inside the SoC, where mask ROM lives. This code cannot be changed after manufacture. It reads boot-mode pins or fuses to choose a boot device (SD, eMMC, NAND, SPI flash, sometimes USB or UART), loads a small image into on-chip SRAM, and jumps to it. If secure boot is enabled in fuses, the ROM verifies a signature on that image first, which makes it the root of trust.

### First-stage loader (SPL)

On-chip SRAM is small, often tens or hundreds of kilobytes, so the first stage has to be small too. U-Boot provides a cut-down build called **SPL** (Secondary Program Loader) for this job, and some SoCs use vendor loaders instead. It sets up clocks, the power management IC where needed, and the DRAM controller. Then it loads the full bootloader into DRAM.

On ARMv8, this is often where **Trusted Firmware-A** (TF-A) fits in. It stays resident at the highest exception level, EL3, and provides services such as PSCI, the standard interface the kernel uses to power CPUs on and off. U-Boot then runs as the non-secure bootloader at a lower level.

### U-Boot proper

U-Boot has a shell, drivers, and an environment of variables. Its job is to load a kernel image, a device tree blob and optionally an initramfs into DRAM, then jump to the kernel. A plain boot from an SD card looks like this:

```text
# U-Boot commands. Addresses are board-specific and illustrative.
setenv bootargs console=ttyS0,115200 root=/dev/mmcblk0p2 rootwait rw
fatload mmc 0:1 ${kernel_addr_r} Image
fatload mmc 0:1 ${fdt_addr_r} board.dtb
booti ${kernel_addr_r} - ${fdt_addr_r}
```

`booti` boots an arm64 `Image`, `bootz` boots a 32-bit ARM `zImage`, and `bootm` boots a legacy uImage or a FIT image. A FIT image bundles kernel, device trees and initramfs into a single file that can be signed, which is the usual route for verified boot in U-Boot. The `-` in the `booti` line means "no initramfs".

### The handover contract

The kernel documents what it expects on entry (`Documentation/arch/arm64/booting.rst`, `Documentation/arch/arm/booting.rst`).

| | 32-bit ARM | arm64 |
|---|---|---|
| Device tree pointer | physical address in `r2` | physical address in `x0` |
| Other argument registers | `r0` = 0, `r1` = machine type (ignored when a device tree is used) | `x1`, `x2`, `x3` = 0 |
| MMU | off | off |
| Data cache | off | off, with the kernel image cleaned to memory |
| Privilege | SVC mode, or HYP mode for virtualization | EL2 recommended, or non-secure EL1 |

### Kernel start to init

1. Early assembly (`head.S`) checks the CPU, builds initial page tables and enables the MMU. A `zImage` first decompresses itself. An arm64 `Image` does not self-decompress, so the bootloader has to do that for `Image.gz`.
2. `start_kernel()` parses the device tree and command line, then sets up memory management, interrupts, timers and the scheduler.
3. `rest_init()` creates two kernel threads: `kernel_init`, which will become PID 1, and `kthreadd`, PID 2, the parent of other kernel threads.
4. `kernel_init` runs the initcalls, which register drivers, and drivers start probing devices.
5. The kernel unpacks an initramfs if present and runs its `/init`. Without one, it mounts the root filesystem named by `root=` and tries `init=`, then the standard paths such as `/sbin/init`.
6. PID 1 `execve`s into user space. It must never exit. If it does, the kernel panics.

:::trap Silence after "Starting kernel ..."
This is the classic bring-up failure. U-Boot has handed over and nothing else prints. Common causes: the console is not set correctly in `bootargs` or the device tree, the kernel image and device tree overlap in memory, the DTB is for another board, or the kernel crashed before its console driver loaded. Boot with `earlycon` (and a matching `stdout-path` or explicit UART address) to get output before the real console driver registers.
:::

Two panics are worth recognising. `VFS: Unable to mount root fs` usually means a missing storage driver or a wrong `root=`, and `rootwait` helps when the device appears late, as SD cards do. `No working init found` means the root mounted but the init binary could not run, often because it was built for another architecture or its dynamic loader is missing.

## Device tree {#ch01-dt .th}

PCI and USB devices can be discovered: software asks the bus what is attached. A UART at a fixed address on a SoC cannot be discovered. Reading a random address may hang the bus. The kernel has to be told where such devices are, what interrupt each one uses and which clocks feed it. On ARM and many other embedded platforms, the **device tree** supplies this as data, so that a single kernel binary can support many boards.

```text
// board.dts: a fragment, for shape. Not compiled in this guide's CI.
#include "soc.dtsi"                       // shared SoC description

/ {
    model = "Example Board";
    compatible = "acme,example-board", "acme,example-soc";

    chosen {
        stdout-path = "serial0:115200n8"; // console choice
    };
};

&uart0 {                                  // modify a node from soc.dtsi
    status = "okay";
    pinctrl-names = "default";
    pinctrl-0 = <&uart0_pins>;
};

&i2c1 {
    status = "okay";
    sensor@48 {                           // 0x48 is the I2C address
        compatible = "acme,temp-sensor";
        reg = <0x48>;
        interrupt-parent = <&gpio2>;
        interrupts = <5 IRQ_TYPE_EDGE_FALLING>;
    };
};
```

The vocabulary interviewers expect:

- **`compatible`**: the list of strings a driver matches on, most specific first. This is the main link between hardware description and driver code.
- **`reg`**: address and size, whose meaning depends on the parent bus. On a memory-mapped bus it is a physical address range. On I2C it is the device address.
- **`#address-cells` and `#size-cells`**: how many 32-bit cells the children's `reg` entries use for address and size.
- **`status`**: `"okay"` enables a node, and `"disabled"` leaves the device unused. SoC files commonly disable everything so that boards enable what they wire up.
- **phandle**: a reference to another node, such as `<&gpio2>`.
- **`.dtsi`** files are includes for shared descriptions, usually the SoC. **`.dts`** is the board. `dtc` compiles the result to a flat **`.dtb`** blob.
- **Overlays** (`.dtbo`) patch a base tree later, typically for add-on boards.
- **Bindings** in `Documentation/devicetree/bindings/` are YAML schemas stating which properties a device needs. `make dtbs_check` validates your tree against them.

:::key
The device tree describes hardware. It does not contain driver policy or software configuration. A good test for a new property is: would this still be true if another operating system ran on the board?
:::

### What is inside a DTB

Cells in a DTB are stored as 32-bit big-endian values, whatever the CPU's endianness. A blob starts with a 40-byte header of ten such values, beginning with the magic number `d00dfeed`. This program builds such a header and decodes it, then decodes a `reg` property with two address cells and one size cell:

```python run=el-c01-dtb
import struct

header = struct.pack(">10I", 0xd00dfeed, 4096, 56, 3000, 40, 17, 16, 0, 200, 2900)
names = "magic totalsize off_dt_struct off_dt_strings off_mem_rsvmap version last_comp_version boot_cpuid_phys size_dt_strings size_dt_struct".split()
fields = dict(zip(names, struct.unpack(">10I", header)))
print(len(header), format(fields["magic"], "x"), fields["version"])
print("first bytes on disk:", header[:4].hex())

# reg = <0x1 0x40000000 0x1000>; with #address-cells = <2>, #size-cells = <1>
reg = struct.pack(">3I", 0x1, 0x40000000, 0x1000)
hi, lo, size = struct.unpack(">3I", reg)
print("address", format(hi << 32 | lo, "x"), "size", hex(size))
```

A kernel can read the same data at runtime through `/proc/device-tree` (a link into `/sys/firmware/devicetree/base`) on systems booted with a device tree. An x86 PC normally has no such directory.

### How a driver gets chosen

When the kernel creates a device from a node, the driver core compares each driver's match table against the node's `compatible` list. The strings are tried in the order the node lists them, so a specific driver wins over a generic fallback. This small program models that order:

```c run=el-c01-compat
#include <stdio.h>
#include <string.h>

static const char *generic_driver[] = { "acme,uart-generic", NULL };
static const char *v2_driver[]      = { "acme,uart-v2", NULL };

static int table_has(const char **table, const char *s) {
    for (; *table; table++)
        if (strcmp(*table, s) == 0) return 1;
    return 0;
}

static void bind(const char **node) {
    for (; *node; node++) {
        if (table_has(v2_driver, *node))      { printf("%s -> v2 driver\n", *node); return; }
        if (table_has(generic_driver, *node)) { printf("%s -> generic driver\n", *node); return; }
    }
    printf("no driver: device stays unbound\n");
}

int main(void) {
    const char *newer[] = { "acme,uart-v3", "acme,uart-v2", "acme,uart-generic", NULL };
    const char *older[] = { "acme,uart-v1", "acme,uart-generic", NULL };
    const char *odd[]   = { "other,uart", NULL };
    bind(newer);
    bind(older);
    bind(odd);
}
```

The first node shows why fallbacks matter. No driver knows `acme,uart-v3` yet, but the node says it is compatible with v2, so the existing driver binds without any kernel change. The kernel's `of_match_node` does this by giving earlier strings in the node a higher score.

:::trap
Three different mistakes all give "my driver's probe never ran": the `compatible` string does not match exactly, the node has `status = "disabled"`, or the driver is not built into the kernel or loaded as a module. Check them in that order. A fourth case is a probe that ran and returned `-EPROBE_DEFER` because a clock or regulator is not ready, which `/sys/kernel/debug/devices_deferred` reports when debugfs is mounted.
:::

## ARMv7, ARMv8 and x86_64 {#ch01-arch .th}

The kernel hides many of these differences, but they explain why embedded and PC bring-up feel so different.

| Topic | ARMv7-A (32-bit) | ARMv8-A (AArch64) | x86_64 |
|---|---|---|---|
| Privilege | Processor modes: USR, SVC, IRQ, FIQ, and more | Exception levels EL0 to EL3 | Rings 0 to 3 (Linux uses 0 and 3), plus firmware and virtualization modes |
| Early firmware | ROM, SPL, U-Boot | ROM, often TF-A, U-Boot | UEFI or legacy BIOS firmware, which initialises DRAM itself |
| Bootloader | U-Boot | U-Boot, or UEFI on servers | GRUB, systemd-boot, or the kernel's EFI stub |
| Hardware description | Device tree | Device tree; ACPI on servers | ACPI tables and PCI enumeration |
| Kernel image | `zImage` | `Image`, `Image.gz` | `bzImage` |
| Interrupt controller | GIC | GIC | Local APIC and I/O APIC |
| Memory ordering | Weak | Weak | Strong (TSO): only store-load reordering is visible |
| DMA and caches | Often not hardware coherent | Depends on the SoC; often partly coherent | Generally coherent |
| Page sizes | 4 KB base | 4, 16 or 64 KB base, chosen at kernel build time | 4 KB base, plus 2 MB and 1 GB huge pages |
| System call | `svc #0` | `svc #0` | `syscall` |
| Secondary CPU start | PSCI or platform code | PSCI or spin-table | INIT and SIPI interrupts |
| `long` and pointers | 32-bit | 64-bit | 64-bit |

The two rows that cause the most bugs are memory ordering and DMA coherency. Code tested only on x86 can hide a missing barrier or a missing cache sync that fails on ARM (Chapter 3). Also, driver code that stores a pointer in an `int` compiles on 32-bit ARM and truncates on 64-bit, so use `uintptr_t`, `size_t`, and fixed-width types for anything shared with hardware.

## BSP porting {#ch01-bsp .th}

A **Board Support Package** is everything needed to run Linux on a specific board: the bootloader port, kernel configuration, device tree, any drivers missing from mainline, and often the root filesystem recipe and toolchain. "Porting a BSP" can mean two things: bringing up a new board that uses a supported SoC, which is common, or adding a new SoC to the kernel, which is much more work. Say which one you mean.

### A typical order for a new board

Start from the closest reference design and change as little as possible. Each step depends on the one before it, so the order is close to fixed.

1. **Read the schematic and the SoC manual.** Note the boot pins, DRAM part, console UART, PMIC and pin muxing.
2. **Get a serial console or a JTAG connection working.** Without output, you are guessing.
3. **Port the SPL and DRAM setup.** DRAM timing for your exact part and board layout is the most hardware-sensitive step. Run a memory test before going further.
4. **Port U-Boot.** Add storage and network so you can load kernels quickly, usually over TFTP during development.
5. **Write the board device tree.** Include the SoC `.dtsi`, set memory, console, pin muxing, regulators and clocks.
6. **Create a kernel defconfig** and boot to a shell with a minimal initramfs.
7. **Enable peripherals one at a time**: storage, Ethernet, USB, I2C and SPI devices, display. Test each one before moving on.
8. **Then do the long tests**: power management, suspend and resume, thermal, stress and long-running stability.
9. **Package and maintain**: integrate with Yocto or Buildroot (Chapter 6), keep patches small, and upstream what you can to reduce rebase work.

### What usually goes wrong

- **Pin muxing**: the peripheral driver is right, but the pin is configured for a different function. Nothing appears on the wire and no error is logged.
- **Clocks and regulators**: the device has no clock or no power, so register access may hang the whole bus or read back zeros.
- **Wrong interrupt number or trigger type**: the device works once and then stops, or the kernel reports an interrupt storm and disables the line.
- **Vendor kernel versus mainline**: vendor trees may ship features early but sit on old kernels, and rebasing their patches is costly.

### Hardware errata

Silicon has bugs. Vendors publish **errata** documents listing each known issue, the affected revisions and any workaround. Software commonly carries these workarounds, so reading the errata is part of bring-up. Interviewers like this topic because it separates people who have seen real hardware from people who have only read about it.

Workarounds live at several levels:

- **Bootloader or firmware**: sets a chicken bit in a CPU or controller register early, so that the kernel never sees the problem.
- **Kernel, CPU level**: arm64 has a list of workarounds selected by `CONFIG_ARM64_ERRATUM_*` options and documented in `Documentation/arch/arm64/silicon-errata.rst`. The kernel reads the CPU ID at boot and patches code in only on affected parts, using its "alternatives" mechanism.
- **Kernel, driver level**: a driver checks a revision or a `compatible` string and sets a quirk flag, for example to avoid a broken DMA mode.
- **Compiler or linker**: some CPU errata need code generation changes, such as GCC's `-mfix-cortex-a53-835769` and the linker's `--fix-cortex-a53-843419`.
- **Device tree**: a property or a revision-specific `compatible` tells the driver to use a workaround.

On x86, CPU microcode updates fix or mitigate many issues, loaded by firmware or early in kernel boot.

:::key
A good errata workaround has a comment or Kconfig entry naming the erratum number, tests the affected revision at runtime, and costs nothing on fixed silicon. Applying one blindly to all revisions can slow down good parts, or break them.
:::

## Drills {#ch01-drills .dr}

:::drill concept
Why can't the very first code on a SoC just load the kernel into DRAM?
---
**Answer.** DRAM is not usable at reset. Its controller needs clock and timing configuration done by software. So early code runs from ROM and on-chip SRAM, configures DRAM, and only then loads larger stages. **Why.** This is also why the chain has several stages: SRAM is too small for a full bootloader with drivers and a shell.
:::

:::drill concept
What does U-Boot pass to the kernel on arm64, and in what state must the CPU be?
---
**Answer.** The physical address of the device tree in `x0`, with `x1` to `x3` zero. The MMU must be off, and the CPU should be at EL2 (or non-secure EL1). The data cache must be off and the kernel image cleaned to memory, as `Documentation/arch/arm64/booting.rst` specifies. **Why.** The kernel command line is not a separate argument here. U-Boot writes `bootargs` into the `/chosen` node of the device tree before the jump.
:::

:::drill tricky
A board prints "Starting kernel ..." and then nothing. How do you narrow this down?
---
**Answer.** Add `earlycon` so the kernel prints before its console driver loads. If you then see output, read where it stops. If you still see nothing, check for overlapping load addresses of kernel, DTB and initramfs, check the DTB is for this board, and use JTAG to read where the CPU's program counter is. You can also read the kernel log buffer from memory with a debugger, which shows messages the console never printed. **Why.** A common and unsatisfying finding is that the kernel booted fine and only the console setting was wrong.
:::

:::drill concept
Why does a PC not need a device tree, and why do most ARM SoCs need one?
---
**Answer.** A PC describes its non-discoverable hardware through ACPI tables from firmware, and most other devices sit on PCI, which can be enumerated. Peripherals on a SoC sit at fixed memory-mapped addresses with no enumeration protocol, so software has to be told about them. **Why.** Before device trees, ARM kernels had board files compiled in, one per board. The device tree moved that data out of the kernel, so a single image can run on many boards. ARM servers usually use ACPI as well.
:::

:::drill output
What does this print?

```python run=el-c01-d-cells
import struct
blob = bytes.fromhex("0000000080000000" "0000000040000000")
parts = struct.unpack(">4I", blob)
base = parts[0] << 32 | parts[1]
size = parts[2] << 32 | parts[3]
print(format(base, "x"), format(size, "x"), size // (1024 * 1024))
```
---
**Answer.** The blob is a `memory` node's `reg` with two address cells and two size cells, in big-endian. Base is 2 GB and size is 1 GB. **Why.** Reading DTB bytes with a little-endian assumption is a typical bug when you parse a blob by hand. The kernel's helpers (`be32_to_cpu`, `of_read_number`) handle it.
:::

:::drill bug
This node is for a sensor on I2C address 0x48. The driver's probe never runs. Name two things to check in the node, given that the driver's table has `"acme,temp-sensor"`.

```text
&i2c1 {
    sensor@48 {
        compatible = "acme,temp_sensor";
        reg = <0x48>;
    };
};
```
---
**Answer.** First, the `compatible` string uses an underscore and the driver uses a hyphen, so they do not match. Second, `&i2c1` has no `status = "okay"`. If the SoC file disables that bus by default, as is common, its children are never created. **Why.** Matching is an exact string compare, and nothing logs "almost matched".
:::

:::drill tricky
What is the difference between `initramfs` and the root filesystem? Do you always need an initramfs?
---
**Answer.** An initramfs is a cpio archive unpacked into a RAM-based filesystem early in boot, and the kernel runs its `/init`. It is used to load modules, unlock or assemble storage, then switch to the real root. It is optional: if the kernel has built-in drivers for the root device, it can mount `root=` directly. Small systems sometimes use only an initramfs and never switch. **Why.** A follow-up is `initrd` versus `initramfs`: an initrd is a block device image that needs a filesystem driver, and an initramfs is a cpio archive unpacked into tmpfs or ramfs.
:::

:::drill bug
A driver is ported from 32-bit ARM to arm64 and crashes. The code below worked before. What is wrong, and what is the fix?

```text
unsigned int cookie = (unsigned int)ptr;
ptr = (void *)cookie;
```
---
**Answer.** `unsigned int` stays 32 bits on arm64 while pointers grow to 64, so the cast drops the upper half of the address. Use `uintptr_t`, or keep the pointer as a pointer. **Why.** A related bug is a structure shared with a device using plain C layout rules. Use fixed-width types, explicit reserved fields and a compile-time size check, so that the layout matches the datasheet on every architecture.
:::

:::drill concept
What are the steps of porting Linux to a new board that uses an already supported SoC?
---
**Answer.** Start from the closest reference design. Bring up the console, then DRAM in the SPL with a memory test, then U-Boot with storage and network. Write the board device tree including the SoC `.dtsi`, build a defconfig, boot a minimal initramfs, then enable and test peripherals one at a time, and finish with power management and long stress tests. **Why.** Interviewers listen for the order and for reasons. Each step gives you the tool you need for the next.
:::

:::drill tricky
What is a hardware erratum, and where might its workaround be? Give an example of how the kernel avoids slowing down unaffected chips.
---
**Answer.** It is a documented defect in a specific silicon revision. The workaround can live in firmware, kernel CPU code, a driver quirk, compiler or linker flags, or the device tree. For CPU errata on arm64, the kernel reads the CPU ID at boot and patches the workaround into the running kernel only if the CPU is affected, using alternatives, so other CPUs run the original instructions. **Why.** A follow-up: what about a system with mixed CPU types? The kernel checks each CPU, and late-onlined CPUs have to be checked too.
:::

## Write the code {#ch01-coding .cd}

:::drill code rating=1100
A boot script loads a kernel, a device tree and an initramfs at given addresses. Write a check that reports any two images overlapping, since a silent overlap is a classic cause of a hang after "Starting kernel ...".
---
Sort by start address, then compare each image's end with the next image's start.

```c run=el-c01-c-overlap
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

struct image { const char *name; uint64_t addr, size; };

static int by_addr(const void *a, const void *b) {
    const struct image *x = a, *y = b;
    return (x->addr > y->addr) - (x->addr < y->addr);
}

static int check(struct image *img, int n) {
    int bad = 0;
    qsort(img, n, sizeof(*img), by_addr);
    for (int i = 0; i + 1 < n; i++)
        if (img[i].addr + img[i].size > img[i + 1].addr) {
            printf("%s overlaps %s\n", img[i].name, img[i + 1].name);
            bad++;
        }
    return bad;
}

int main(void) {
    struct image a[] = {
        { "kernel", 0x40200000, 0x01800000 },   /* 24 MB */
        { "dtb",    0x41000000, 0x00010000 },   /* inside the kernel */
        { "initrd", 0x44000000, 0x00800000 },
    };
    printf("problems: %d\n", check(a, 3));
    struct image b[] = {
        { "kernel", 0x40200000, 0x00800000 },
        { "dtb",    0x41000000, 0x00010000 },
        { "initrd", 0x44000000, 0x00800000 },
    };
    printf("problems: %d\n", check(b, 3));
}
```

Remember that a compressed image expands. Check the decompressed size, plus the memory the kernel uses just past its image, as its boot document describes.
:::

:::drill code rating=1300
An erratum affects a CPU part `0xd03` from revision r0p0 up to and including r0p4. Write `is_affected(midr)` using the MIDR fields, the way a kernel errata table does.
---
Compare the implementer and part, then combine variant and revision into a single comparable number.

```c run=el-c01-c-errata
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

#define IMPL(m)  ((m) >> 24)
#define PART(m)  (((m) >> 4) & 0xfff)
#define VARREV(m) ((((m) >> 20) & 0xf) << 4 | ((m) & 0xf))

static bool is_affected(uint32_t midr) {
    return IMPL(midr) == 0x41 && PART(midr) == 0xd03 && VARREV(midr) <= 0x04;
}

int main(void) {
    uint32_t cases[] = { 0x410fd030, 0x410fd034, 0x410fd035, 0x411fd030, 0x410fd080 };
    for (int i = 0; i < 5; i++)
        printf("%08x r%up%u %s\n", cases[i], (cases[i] >> 20) & 0xf, cases[i] & 0xf,
               is_affected(cases[i]) ? "affected" : "ok");
}
```

Combining variant and revision makes `r1p0` sort after `r0p4`. Comparing the two fields separately gets this wrong. That is why the kernel has helpers for variant and revision ranges.
:::

## Cheat sheet {#ch01-cheatsheet .th}

- Order: ROM, SPL in SRAM, optional TF-A, U-Boot in DRAM, kernel, init. The reason for the chain is that DRAM needs software to start.
- U-Boot loads kernel, DTB and initramfs, then jumps with `booti`, `bootz` or `bootm`. The command line goes in `/chosen`.
- arm64 entry: `x0` holds the DTB's physical address, MMU off, EL2 or EL1.
- `start_kernel`, then `rest_init`, then `kernel_init` (PID 1) and `kthreadd` (PID 2). PID 1 must not exit.
- Debug silence with `earlycon`. Debug root failures with `root=` and `rootwait`, and check the storage driver.
- Device tree describes non-discoverable hardware. `compatible` selects the driver, most specific first. `reg` depends on the parent bus. Cells are 32-bit big-endian.
- `.dtsi` for the SoC, `.dts` for the board, `status` enables, overlays patch.
- x86 uses firmware and ACPI, and its memory ordering is stronger. ARM uses a weaker model and often has non-coherent DMA.
- Bring-up order: console, DRAM, U-Boot, device tree, minimal kernel, one peripheral at a time, stress tests.
- Errata: find them in vendor documents and work around them in firmware, kernel, driver or compiler. Check the revision at runtime.
