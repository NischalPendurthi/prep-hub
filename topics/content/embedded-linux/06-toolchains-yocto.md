---
title: Cross-toolchains, Yocto, containers and CI
part: Part D · Tools of the trade
lede: A product is more than a kernel and a driver. You have to build every piece for another CPU in a repeatable way, ship it as an image, test it automatically and keep it maintained. This chapter covers toolchains and sysroots, Yocto and Buildroot layers, namespaces and cgroups, virtualization versus containers, CI for embedded projects, and how to send work upstream.
desc: triplets, sysroot, Yocto layers, Buildroot, namespaces, cgroups, VMs vs containers, CI, upstreaming
hours: 3
prereqs: Chapters 1 and 2, how compiling and linking work
---

## Cross-toolchains and sysroots {#ch06-toolchain .th}

A cross-compiler runs on one machine and produces code for another. The terms: **build** is where the compiler is built, **host** is where it runs, and **target** is what it generates code for. In normal cross-compilation of an app, you run on x86_64 and generate arm64.

A toolchain has four parts that must agree: the compiler (GCC or Clang), binutils (assembler and linker), a C library (glibc, musl, uClibc-ng), and the kernel headers. A compiler is named by its **triplet**, in the form `arch-vendor-os-abi`, where the vendor is often omitted:

| Triplet | Meaning |
|---|---|
| `aarch64-linux-gnu` | 64-bit ARM, Linux, glibc |
| `arm-linux-gnueabihf` | 32-bit ARM, Linux, glibc, hard-float ABI |
| `arm-linux-gnueabi` | Same, soft-float calling convention. Not binary compatible with the above |
| `x86_64-linux-musl` | 64-bit x86, Linux, musl libc |
| `arm-none-eabi` | Bare metal, no OS. For microcontrollers, not for Linux user space |

Inspect any binary to see what it was built for. This shows the machine that ran the example. The full `readelf -h` output also has a `Machine` field, which names the target on a cross-built file:

```bash run=el-c06-inspect nondet
cat > a.c <<'EOF_C'
#include <stdio.h>
int main(void) { puts("hi"); }
EOF_C
gcc -o a a.c
gcc -dumpmachine
readelf -h a | grep Class
readelf -d a | grep NEEDED
readelf -l a | grep -o 'interpreter: [^]]*'
```

The `interpreter` line matters. The kernel loads that exact dynamic loader path to start the program, so a binary built for another libc fails with a confusing "not found" message when its file is clearly there. The loader is what is missing.

### The sysroot

A **sysroot** is a directory shaped like the target's root filesystem, holding its headers and libraries. Cross-compiling uses it in place of the host's `/usr/include` and `/usr/lib`. If you link against your host's libraries by mistake, the build fails or, worse, the binary ends up needing library versions the board does not have. This example makes a tiny sysroot and shows that it replaces the normal search path:

```bash run=el-c06-sysroot nondet
mkdir -p sysroot/usr/include
echo '#define BOARD_REV 7' > sysroot/usr/include/board.h

cat > a.c <<'EOF_C'
#include <board.h>
int rev = BOARD_REV;
EOF_C
gcc --sysroot="$PWD/sysroot" -E -P a.c

cat > b.c <<'EOF_C'
#include <stdio.h>
EOF_C
gcc --sysroot="$PWD/sysroot" -E -P b.c 2>&1 | grep -o 'stdio.h: No such file or directory'
```

`board.h` was found under the sysroot's `usr/include`, and the host's `stdio.h` was no longer visible. A real target sysroot has a libc, so `stdio.h` is found there, as the target's own version.

A kernel cross-build only needs a compiler prefix, because the kernel does not use a C library:

```text
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- defconfig
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- -j"$(nproc)" Image dtbs modules
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- INSTALL_MOD_PATH=/path/to/rootfs modules_install
```

:::trap
Glibc is backward compatible: a binary built against an older glibc runs on a newer one, and the reverse fails with `version 'GLIBC_2.xx' not found`. So build against a sysroot that is no newer than your target. Also, a Clang-built or newly configured kernel may need matching module builds, and vermagic stops mismatched modules from loading.
:::

## Yocto and Buildroot {#ch06-yocto .th}

Both build a whole system image from source: toolchain, kernel, bootloader, libraries, applications. They differ in how much structure they add.

| | Buildroot | Yocto / OpenEmbedded |
|---|---|---|
| Configuration | Kconfig, `make menuconfig` | Recipes and layered config files |
| Build engine | Make | BitBake |
| Output | Root filesystem image, kernel, bootloader | Images, plus packages and an SDK |
| Package updates on the device | Not by default | Possible with `rpm`, `deb` or `ipk` |
| Learning curve | Low | High |
| Rebuild behaviour | Major changes usually need a full clean rebuild | Task-level caching with shared state |
| Best for | Small, fixed products | Large or long-lived products, several boards, several teams |

### The Yocto vocabulary

- **BitBake** is the task engine. **OpenEmbedded-Core** is the base metadata. **Poky** is the reference distribution, used as a starting point.
- A **recipe** (`.bb`) says how to fetch, patch, configure, build and package one piece of software. A **`.bbappend`** modifies a recipe from another layer without editing it.
- A **layer** (`meta-*`) is a directory of related recipes and config, with a priority. Keep them separated by purpose: a BSP layer for the board, a distro layer for policy, and an application layer for your software. Do not edit layers you got from someone else.
- **`MACHINE`** selects the board, **`DISTRO`** the policy, and an **image recipe** selects what goes in the root filesystem.
- **Shared state (`sstate`)** caches each task's output, keyed by a hash of its inputs. A change rebuilds only what depends on it. Sharing this cache between developers and CI saves hours.
- Each recipe runs tasks in order: `do_fetch`, `do_unpack`, `do_patch`, `do_configure`, `do_compile`, `do_install`, `do_package`, then `do_rootfs` in the image.

```text
# meta-acme/recipes-apps/app/app_1.0.bb. A sketch, not built in this guide.
SUMMARY = "Example application"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://LICENSE;md5=<checksum of the license file>"

SRC_URI = "git://example.org/app.git;protocol=https;branch=main"
SRCREV = "<full commit id>"

inherit cmake

# meta-acme/recipes-kernel/linux/linux-yocto_%.bbappend
FILESEXTRAPATHS:prepend := "${THISDIR}/files:"
SRC_URI += "file://0001-fix-my-driver.patch"

# conf/local.conf, for development only
MACHINE = "myboard"
IMAGE_INSTALL:append = " app"
```

The colon syntax in `IMAGE_INSTALL:append` replaced the older form around release 3.4, so older tutorials showing `_append` are out of date. Details such as the default source directory `S` have changed between releases too, so check the manual for your release.

A BSP layer's main file is `conf/machine/myboard.conf`, which picks the CPU tuning, kernel provider (`PREFERRED_PROVIDER_virtual/kernel`), device tree (`KERNEL_DEVICETREE`) and bootloader configuration. Commands to know: `bitbake core-image-minimal`, `bitbake -e recipe | grep ^VAR=` to see a variable's final value, `bitbake-layers show-appends`, `devtool modify recipe` to work on source, and `bitbake core-image-minimal -c populate_sdk` to produce a cross SDK for application developers.

Buildroot's workflow is shorter: `make list-defconfigs`, `make myboard_defconfig`, `make menuconfig`, `make`, then find results in `output/images/`. Keep your own board files out of the tree with `BR2_EXTERNAL`.

## Namespaces and cgroups {#ch06-containers .th}

A container is an ordinary process that the kernel shows a restricted view of the system. There is no "container" object in the kernel. It is built from two main features, plus others such as capabilities, seccomp and overlayfs:

- **Namespaces** control what a process can **see**. There are eight types: mount, UTS (hostname), IPC, PID, network, user, cgroup and time. They are created with `clone` or `unshare`, and joined with `setns`.
- **cgroups** control what a process can **use**: CPU time (`cpu.max`), memory (`memory.max`), process count (`pids.max`), which CPUs (`cpuset.cpus`) and more. Version 2 has a single hierarchy under `/sys/fs/cgroup`.

```bash run=el-c06-ns-list nondet
ls /proc/self/ns | tr '\n' ' '
echo
stat -fc 'cgroup filesystem: %T' /sys/fs/cgroup
```

A user namespace lets an unprivileged process have "root" inside its own namespace, where it can change a UTS namespace's hostname without affecting the rest of the system. Some systems restrict this, so the program handles refusal:

```c run=el-c06-unshare nondet
#define _GNU_SOURCE
#include <errno.h>
#include <sched.h>
#include <stdio.h>
#include <string.h>
#include <sys/utsname.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    struct utsname before, after;
    uname(&before);
    pid_t pid = fork();
    if (pid == 0) {
        if (unshare(CLONE_NEWUSER | CLONE_NEWUTS) != 0) {
            printf("unshare refused: %s\n", strerrorname_np(errno));
            fflush(stdout);
            _exit(0);
        }
        if (sethostname("sandbox", 7) != 0) {
            printf("sethostname refused: %s\n", strerrorname_np(errno));
            fflush(stdout);
            _exit(0);
        }
        struct utsname u;
        uname(&u);
        printf("inside the namespace: %s\n", u.nodename);
        fflush(stdout);
        _exit(0);
    }
    waitpid(pid, NULL, 0);
    uname(&after);
    printf("parent's hostname unchanged: %d\n", strcmp(before.nodename, after.nodename) == 0);
}
```

A container image is typically layers of files combined with **overlayfs**: read-only lower layers and a writable upper layer, where changed files are copied up on write. A runtime such as `runc` sets up the namespaces and cgroups and starts the process, and tools such as Docker and Podman manage images on top of that.

### Virtualization versus containers

| | Virtual machine | Container |
|---|---|---|
| Kernel | Its own guest kernel | Shares the host kernel |
| Isolation | Hardware-enforced with a hypervisor | Kernel-enforced. A kernel bug can affect all containers |
| Start time | Longer, boots an OS | Short, starts a process |
| Overhead | Higher, more memory | Low |
| Different OS or kernel | Yes | No, same kernel |
| Kernel modules | Load freely in the guest | Would change the shared host kernel |
| Real-time | Extra jitter from the hypervisor layer | Same scheduler as the host, if you allow it |

A **type 1** hypervisor runs directly on hardware. A **type 2** runs on a host OS. **KVM** makes the Linux kernel act as a hypervisor using CPU virtualization extensions, such as EL2 on ARM, and **QEMU** usually provides device models. QEMU can also emulate another CPU entirely. Its user-mode emulation with `binfmt_misc` lets an x86 machine run ARM binaries, which is handy for building or testing ARM containers, though it is slow.

For embedded systems, containers are used for updating applications independently of the base system. Real-time tasks in containers need extra permissions (`CAP_SYS_NICE`, an `rtprio` limit, the right CPUs, and device access), and the host's kernel must be the RT one. A container cannot bring its own.

## CI for embedded projects {#ch06-ci .th}

Embedded CI has to deal with toolchains and hardware. Typical stages:

1. **Pin the build environment.** Build inside a container image with a fixed toolchain, so that every developer and server gets the same result. Pin layer revisions too.
2. **Fast checks on each change.** `checkpatch.pl`, `make W=1`, `sparse` with `make C=1`, and `make dtbs_check` for device trees. Build all supported configs.
3. **Tests without hardware.** Unit tests with KUnit, and boot tests in QEMU with `kselftest`.
4. **Tests on real boards.** A test farm with a remote power switch, a serial console and network boot. These catch what QEMU cannot, such as timing, real devices and caches. Expect flakiness, and record failures to tell board faults from software faults.
5. **Performance gates.** Run `cyclictest` on hardware with load, and fail if the maximum regresses.
6. **Release artifacts.** Keep the image, the debug symbols (Chapter 5), the SBOM and license information, and build metadata together.

Share Yocto's `sstate` and download directories across runners to keep build times reasonable.

**Reproducible builds** mean the same inputs give identical binaries, so you can verify what shipped. Timestamps and build paths are common obstacles. This example compiles the same file in two directories, with and without a path remap:

```bash run=el-c06-repro nondet
mkdir one two
printf 'int f(void) { return 1; }\n' | tee one/f.c > two/f.c

(cd one && gcc -g -c f.c -o f.o)
(cd two && gcc -g -c f.c -o f.o)
cmp -s one/f.o two/f.o && echo "plain -g: identical" || echo "plain -g: differ"

(cd one && gcc -g -ffile-prefix-map="$PWD"=. -c f.c -o f.o)
(cd two && gcc -g -ffile-prefix-map="$PWD"=. -c f.c -o f.o)
cmp -s one/f.o two/f.o && echo "with -ffile-prefix-map: identical" || echo "with -ffile-prefix-map: differ"
```

The debug info records the build directory. `-ffile-prefix-map` rewrites that path, and `SOURCE_DATE_EPOCH` handles timestamps in tools that honour it.

## Upstreaming {#ch06-upstream .th}

Carrying private patches costs you at every kernel update. Patches accepted upstream are maintained with the kernel, and they get review from experts. The Linux workflow is email-based:

1. Make one logical change per commit. Each commit must build and work, so that bisection stays possible.
2. Explain **why** in the commit message, in imperative mood, and add `Signed-off-by`, which certifies the Developer Certificate of Origin. Add `Fixes:` with the short ID and subject of the commit a bug fix repairs.
3. Run `scripts/checkpatch.pl`, and find recipients with `scripts/get_maintainer.pl`.
4. Send with `git send-email`, as plain text. Device tree binding patches come first in a series.
5. Reply to review comments, and send a new version (`v2`), with a list of changes under the `---` line so that they stay out of the final commit message.

Timing: each kernel cycle has a merge window of about two weeks, followed by weekly release candidates. Maintainers apply new work to subsystem trees ahead of the window. Bug fixes for released kernels get a `Cc: stable@vger.kernel.org` tag. Here is a real patch, as `git format-patch` produces it, with a fictional author:

```bash run=el-c06-patch
export GIT_AUTHOR_NAME="A Developer" GIT_AUTHOR_EMAIL="dev@example.org"
export GIT_COMMITTER_NAME="A Developer" GIT_COMMITTER_EMAIL="dev@example.org"
export GIT_AUTHOR_DATE="2024-01-15T12:00:00+0000" GIT_COMMITTER_DATE="2024-01-15T12:00:00+0000"
export GIT_CONFIG_NOSYSTEM=1 HOME="$PWD"

git init -q --object-format=sha1 .
printf 'static int rate = 100;\n' > foo.c
git add foo.c && git commit -q -m "foo: add driver"
good=$(git rev-parse --short=12 HEAD)

printf 'static int rate = 1000;\n' > foo.c
git add foo.c
git commit -q -s -F - <<EOF_MSG
foo: fix default sample rate

The default of 100 Hz undersamples the sensor, which needs at least
1 kHz to avoid aliasing. Raise the default to 1000.

Fixes: $good ("foo: add driver")
EOF_MSG
git format-patch -1 --stdout --no-signature --abbrev=12
```

Expect several rounds of review, since that is the normal path. For other open source projects, read the contribution guide first, start with a small fix, and discuss large changes before writing them. Out-of-tree drivers have no stable in-kernel API to rely on, which is another practical reason to upstream.

## Drills {#ch06-drills .dr}

:::drill concept
What's in a sysroot, and why not just use the host's libraries when cross-compiling?
---
**Answer.** It has the target's headers and libraries, arranged like its root filesystem. Host libraries are for the wrong CPU, so the link fails, and host headers can describe the wrong ABI or the wrong library version, which can compile cleanly and fail on the board. **Why.** A follow-up: `--sysroot` affects both the compiler's include search and the linker's library search.
:::

:::drill tricky
You copy a program to a board. Running it prints `./app: not found`, but `ls` shows the file. Why?
---
**Answer.** The dynamic loader named in its ELF `PT_INTERP` header does not exist on the board, for example glibc's loader on a musl system. The kernel reports the missing loader as `ENOENT`, and the shell prints "not found". Check with `readelf -l app | grep interpreter`, and with `readelf -h` for the architecture. **Why.** A wrong architecture gives a different error ("Exec format error").
:::

:::drill output
What does this print?

```python run=el-c06-d-triplet
def parse(t):
    p = t.split("-")
    if len(p) == 3:
        arch, os_, abi = p
        return arch, os_, abi
    arch, _vendor, os_, abi = p
    return arch, os_, abi

for t in ["aarch64-linux-gnu", "arm-linux-gnueabihf", "riscv64-unknown-linux-musl"]:
    print(parse(t))
print(parse("arm-none-eabi"))
```
---
**Answer.** The first three give the architecture, `linux` and the ABI, with `unknown` dropped as the vendor. The last gives `('arm', 'none', 'eabi')`, where `none` means bare metal. **Why.** The vendor field is optional, which is why tools that split triplets by position can go wrong. `config.sub` is the official normaliser.
:::

:::drill concept
Should a board's kernel patch go in a `.bbappend` or by editing the upstream recipe?
---
**Answer.** A `.bbappend` in your own layer, adding a `SRC_URI` patch. Editing another layer's files in place makes updates painful and loses the boundary. **Why.** `bitbake-layers show-appends` shows what modifies a recipe, and layer priority decides which recipe wins if two provide the same one.
:::

:::drill tricky
Your team changes a compiler flag in a Yocto config and most things rebuild. A colleague changes a recipe's comment and nothing rebuilds. Explain both.
---
**Answer.** Sstate keys each task on a hash of its inputs: the variables it uses, the task code and dependencies. A global compiler flag feeds many tasks, so they all get new hashes. A comment isn't an input to any task, so hashes stay the same and cached output is reused. **Why.** `bitbake-dumpsig` and `bitbake-diffsigs` explain why a task reran.
:::

:::drill concept
What do namespaces do, and what do cgroups do? Which one limits memory?
---
**Answer.** Namespaces limit what a process can see, and cgroups limit what it can use. Memory is limited by cgroups, using `memory.max`. **Why.** A PID namespace can make a process think it is PID 1, but it has no effect on how much CPU it gets.
:::

:::drill output
A container's cgroup v2 file `cpu.max` holds "quota period" in microseconds, or `max` for no limit. What share of a CPU does each line allow?

```python run=el-c06-d-cpumax
for line in ["50000 100000", "200000 100000", "max 100000"]:
    quota, period = line.split()
    print(line, "->", "unlimited" if quota == "max" else f"{int(quota) / int(period):.1f} CPUs")
```
---
**Answer.** 0.5, 2.0 and unlimited. The quota can exceed the period when the group has several CPUs. **Why.** Hitting the quota means throttling until the next period, which shows up as latency spikes in a container, even when the machine has idle CPUs.
:::

:::drill bug
A team wants to run a container with a newer kernel module for a custom device, using a container image based on a newer distribution. What is wrong with the plan?
---
**Answer.** A container shares the host's kernel. Its image does not bring a kernel, so a module must be built for and loaded into the host kernel, which then affects all containers. If a separate kernel is really required, use a virtual machine. **Why.** A container also needs the device node and permissions passed in, but those only work once the host driver is present.
:::

:::drill concept
When do you choose a VM over a container in a product?
---
**Answer.** Use a VM when you need a different kernel or OS, strong isolation between mutually untrusting workloads, or a separate certified environment. Choose containers for lower overhead, fast startup, and packaging applications on one kernel. **Why.** Kernel-enforced isolation has a larger attack surface than a hypervisor, as all containers share one kernel's system call interface.
:::

:::drill tricky
A QEMU boot test in CI passes and the same image fails on the board. Give some reasons.
---
**Answer.** QEMU's models are simple and generally coherent, so missing cache maintenance or barriers don't show. Timing differs, so races stay hidden. Real devices have errata, clocks, pin muxing and power sequencing that a model skips, and the device tree can differ too. **Why.** This is why CI needs both layers. QEMU is cheap and catches a lot of logic errors, and real boards catch the rest.
:::

:::drill bug
A patch is sent upstream with this commit message. Name the problems.

```text
Fixed some bugs in driver and cleaned up the code, also added new
feature for the sensor. Tested on our board.
```
---
**Answer.** It mixes a fix, cleanup and a feature, so split them into separate patches. The subject has no subsystem prefix and is not in imperative mood. It does not explain what was wrong or why. It has no `Signed-off-by`, and a bug fix should have `Fixes:`. **Why.** Separate patches are easier to review, to bisect and to backport to stable kernels.
:::

:::drill concept
Name three things that stop a build being reproducible, and how to handle each.
---
**Answer.** Timestamps (`__DATE__`, archive times) are handled by `SOURCE_DATE_EPOCH`, and by avoiding `__DATE__`. Build paths in debug info are handled by `-ffile-prefix-map`. Unpinned inputs are handled by locking source revisions and the toolchain. **Why.** Others include file ordering and parallel build order. Reproducibility lets you verify a binary against its source, and caching works better too.
:::

## Write the code {#ch06-coding .cd}

:::drill code rating=1000
Several Yocto layers provide the same recipe. Write a resolver that picks the recipe from the highest-priority layer, and then applies every `.bbappend` for that recipe in priority order, lowest first.
---
This is a simple model of the rule. Real BitBake also considers versions and `PREFERRED_VERSION`.

```python run=el-c06-c-layers
layers = {"meta": 5, "meta-oe": 6, "meta-acme-bsp": 10}
recipes = [("meta", "linux"), ("meta-acme-bsp", "linux"), ("meta", "busybox")]
appends = [("meta-acme-bsp", "busybox"), ("meta-oe", "busybox"), ("meta", "linux")]

def resolve(name):
    chosen = max((l for l, r in recipes if r == name), key=layers.get)
    order = sorted((l for l, r in appends if r == name), key=layers.get)
    return chosen, order

print(resolve("linux"))
print(resolve("busybox"))
```
:::

:::drill code rating=1100
Write a cgroup-style limiter model: a task needs `work` microseconds of CPU, and has `quota` per `period`. Compute the wall-clock time until it completes, and the number of times it is throttled.
---
Each full period gives `quota`. The last one may finish partway. A period that uses its whole quota and has work left is one throttle.

```c run=el-c06-c-throttle
#include <stdio.h>

static void run(long work, long quota, long period) {
    long full = (work - 1) / quota;           /* periods that end throttled */
    long rest = work - full * quota;
    long wall = full * period + rest;
    printf("work %ld quota %ld period %ld: wall %ld, throttled %ld\n", work, quota, period, wall, full);
}

int main(void) {
    run(30000, 50000, 100000);
    run(50000, 50000, 100000);
    run(120000, 50000, 100000);
}
```

The third case shows why a 120 ms burst takes much longer on a 0.5 CPU limit: it takes 220 ms of wall time with two throttles, so a latency-sensitive container should not sit near its quota.
:::

## Cheat sheet {#ch06-cheatsheet .th}

- Build, host, target. Triplet `arch-vendor-os-abi`. `gnueabihf` and `gnueabi` are incompatible. `none` means bare metal.
- A toolchain is compiler, binutils, libc and kernel headers. Sysroot holds the target's headers and libraries. Kernel build uses `ARCH` and `CROSS_COMPILE`.
- `readelf -h`, `-d`, `-l` show machine, libraries and interpreter. "not found" on an existing file means a missing loader.
- Glibc: build against the oldest version you must run on.
- Yocto: BitBake, recipes, `.bbappend`, layers, `MACHINE`, `DISTRO`, image, sstate. Do not edit others' layers.
- Buildroot: Kconfig and Make, simpler, for smaller fixed products. `BR2_EXTERNAL` for your files.
- Namespaces limit what you see (eight types). cgroups limit what you use. Overlayfs provides layers. No kernel object is called a container.
- VM has its own kernel. A container shares the host's kernel. KVM plus QEMU is the common Linux stack. RT and modules are decided by the host.
- CI: pinned toolchain, static checks, QEMU tests, real boards, latency gates, kept symbols, SBOM. Reproducible builds need path and timestamp control.
- Upstream: one change per commit, explain why, `Signed-off-by`, `Fixes:`, `checkpatch`, `get_maintainer`, `git send-email`, versioned resends.
