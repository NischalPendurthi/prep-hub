---
title: Kernel modules and character drivers
part: Part B · Talking to hardware
lede: A driver is kernel code that turns file operations from user space into register reads and writes. This chapter covers how a module loads and unloads, how a read call reaches your function, why you must use `copy_to_user`, when to use ioctl or sysfs, and how a platform driver gets connected to a device tree node through probe. These are the most common kernel coding questions in interviews, and small mistakes in them are what interviewers look for.
desc: module lifecycle, file_operations, copy_to_user, ioctl, sysfs, platform drivers and probe
hours: 4
prereqs: Chapter 1, C function pointers, file descriptors
---

## Modules and how kernel code differs {#ch02-modules .th}

A module is an object file (`.ko`) that the kernel links into itself at runtime. It runs in kernel mode with full privileges and shares the kernel's address space, so a bad pointer in a module can bring down the machine. There is no process boundary around it.

A module exports two entry points with `module_init` and `module_exit`, and declares a license with `MODULE_LICENSE`. You will see a complete one below. Building one takes a single line of Makefile:

```text
# Makefile
obj-m += foo.o

# Build against the running kernel's headers. Loading needs root.
make -C /lib/modules/$(uname -r)/build M=$PWD modules
sudo insmod foo.ko && sudo rmmod foo
```

The lifecycle in order:

1. `insmod` or `modprobe` passes the file to the kernel with a system call (`init_module` or `finit_module`). `modprobe` also loads dependencies listed in `modules.dep`, which is why you normally prefer it.
2. The kernel checks version information (**vermagic**), and the signature if module signing is enforced, then resolves symbols against those exported with `EXPORT_SYMBOL` or `EXPORT_SYMBOL_GPL`.
3. It runs the init function. If that returns a negative error, the module is removed. Code marked `__init` is freed after a successful load.
4. `rmmod` calls the exit function, unless the module's reference count is non-zero. Open files hold a count through `.owner = THIS_MODULE`, so you cannot unload a driver while someone has its device open.

`MODULE_LICENSE` matters: a module without a GPL-compatible license cannot use `EXPORT_SYMBOL_GPL` symbols, and it taints the kernel.

### What is different from user space

- There is no libc. You have `printk`, `kmalloc`, `memcpy` and kernel versions of many familiar functions.
- The stack is small and fixed, commonly 8 or 16 KB depending on the architecture. Large local arrays and deep recursion can overflow it.
- No floating point without special calls, because the kernel does not save FPU state on entry by default.
- Errors are returned as negative errno values such as `-ENOMEM`. Pointers that can fail use `ERR_PTR` and `IS_ERR`.
- Memory allocation needs a context flag: `GFP_KERNEL` can sleep, and `GFP_ATOMIC` cannot but fails more often.
- There is no `exit` that cleans up for you. Everything you acquire, you must release, on both the error path and the unload path. The usual pattern is `goto` labels that undo steps in reverse order.
- Kernel code can be preempted and run on several CPUs at once, so all shared data needs locking (Chapter 3).

## Character drivers and file_operations {#ch02-chardev .th}

A character device is a byte stream with a device number and a node in `/dev`. The number has two parts: the **major** usually identifies the driver, and the **minor** identifies an instance. When you open the node, the VFS uses this number to find the driver's `file_operations`, a table of function pointers. After that, `read(fd, …)` calls your `.read`.

The kernel's own memory devices are char drivers you can use right now. Major 1 is the `mem` driver, and each minor is a different behaviour:

```c run=el-c02-memdevs
#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/sysmacros.h>
#include <unistd.h>

int main(void) {
    const char *names[] = { "/dev/null", "/dev/zero", "/dev/full" };
    for (int i = 0; i < 3; i++) {
        struct stat st;
        stat(names[i], &st);
        printf("%-10s char=%d major=%u minor=%u\n", names[i], S_ISCHR(st.st_mode),
               major(st.st_rdev), minor(st.st_rdev));
    }
    char buf[4] = { 9, 9, 9, 9 };
    int z = open("/dev/zero", O_RDONLY);
    ssize_t r = read(z, buf, 4);
    printf("zero: read %zd, buf[0]=%d\n", r, buf[0]);
    int f = open("/dev/full", O_WRONLY);
    ssize_t w = write(f, "x", 1);
    printf("full: write %zd, %s\n", w, strerror(errno));
    int n = open("/dev/null", O_RDONLY);
    r = read(n, buf, 4);
    printf("null: read %zd (end of file)\n", r);
}
```

Each behaviour is a small function behind `file_operations`, in `drivers/char/mem.c`.

Here is a complete driver. It uses `misc_register`, the simplest way to get a `/dev` node, because a misc device shares major 10 and gets a dynamic minor. This code compiled against 6.14 and 7.0 headers. It is shown without output since loading it needs root.

```c
// echodev.c: write stores a buffer, read returns it.
#include <linux/fs.h>
#include <linux/miscdevice.h>
#include <linux/module.h>
#include <linux/mutex.h>
#include <linux/uaccess.h>

#define BUF_SIZE 256

static char buf[BUF_SIZE];
static size_t len;
static DEFINE_MUTEX(lock);

static ssize_t echo_read(struct file *f, char __user *ubuf,
			 size_t count, loff_t *ppos)
{
	ssize_t ret;

	mutex_lock(&lock);
	ret = simple_read_from_buffer(ubuf, count, ppos, buf, len);
	mutex_unlock(&lock);
	return ret;
}

static ssize_t echo_write(struct file *f, const char __user *ubuf,
			  size_t count, loff_t *ppos)
{
	if (count > BUF_SIZE)
		count = BUF_SIZE;

	mutex_lock(&lock);
	if (copy_from_user(buf, ubuf, count)) {
		mutex_unlock(&lock);
		return -EFAULT;
	}
	len = count;
	mutex_unlock(&lock);
	return count;
}

static const struct file_operations echo_fops = {
	.owner	= THIS_MODULE,
	.read	= echo_read,
	.write	= echo_write,
	.llseek	= default_llseek,
};

static struct miscdevice echo_misc = {
	.minor	= MISC_DYNAMIC_MINOR,
	.name	= "echodev",
	.fops	= &echo_fops,
};

static int __init echo_init(void)
{
	return misc_register(&echo_misc);
}

static void __exit echo_exit(void)
{
	misc_deregister(&echo_misc);
}

module_init(echo_init);
module_exit(echo_exit);
MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Echo buffer character device");
```

The longer way uses `alloc_chrdev_region` to reserve a number, `cdev_init` and `cdev_add` to attach your fops, then `class_create` and `device_create` so udev or devtmpfs creates the node. `class_create` lost its module argument in 6.4, a typical example of how in-kernel APIs move. Unload undoes these in reverse.

The contract of `.read`: return the number of bytes copied, which may be fewer than asked; return 0 for end of file; return a negative errno for failure; and advance `*ppos` yourself. `cat` loops until it sees 0, so a driver that always returns `count` makes `cat` run forever.

## copy_to_user and copy_from_user {#ch02-uaccess .th}

A pointer from user space cannot be trusted. It may be null, unmapped, swapped out, or even point into kernel memory on purpose. `memcpy` on it would fault in kernel mode or leak or overwrite kernel data. `copy_to_user` and `copy_from_user` handle this in three ways:

- They check that the range lies in the user part of the address space (`access_ok`).
- They run the copy so that a fault is recoverable. The faulting instruction has an **exception table** entry, and the page-fault handler jumps to a fixup instead of oopsing.
- They briefly allow user access where the CPU forbids it by default (SMAP on x86, PAN on ARM).

They return the number of bytes **not** copied, so 0 means success. They can sleep, since the page may have to be brought in from disk, so they must not be called with a spinlock held or in interrupt context. You can watch all of this from user space, because `read` on `/dev/zero` writes into your buffer through the same machinery. Here the buffer's last 10 bytes sit just before an inaccessible page:

```c run=el-c02-fault nondet
#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>

int main(void) {
    long page = sysconf(_SC_PAGESIZE);
    char *p = mmap(NULL, 2 * page, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    mprotect(p + page, page, PROT_NONE);
    int fd = open("/dev/zero", O_RDONLY);

    ssize_t a = read(fd, p + page - 10, 100);     /* starts valid, runs into the bad page */
    printf("straddling: %zd\n", a);

    errno = 0;
    ssize_t b = read(fd, p + page, 100);          /* entirely in the bad page */
    printf("all bad: %zd, %s\n", b, strerror(errno));
}
```

The second read fails with `EFAULT` and the first one, on the kernel that recorded this, reports the bytes it managed. The exact behaviour of a partial fault is up to each driver, so this example is marked as varying. A driver using `simple_read_from_buffer` gets the same pattern: it returns `-EFAULT` only if nothing was copied, and otherwise a short count.

:::trap The return value
`return copy_to_user(ubuf, kbuf, n);` is a very common bug. On success it returns 0, which the caller reads as end of file. On failure it returns a positive count, which looks like a successful short read. The correct form is `if (copy_to_user(ubuf, kbuf, n)) return -EFAULT; return n;`.
:::

Two security points often come up as follow-ups:

- **Information leak**: copying a struct with padding from the kernel stack sends uninitialised kernel bytes to user space. Zero it first with `memset` or use `kzalloc`.
- **Double fetch**: reading a length from user memory, checking it, then reading it again lets another thread change it in between. Read it once into a kernel variable.

## ioctl and sysfs {#ch02-control .th}

`read` and `write` carry data. Control operations such as "set baud rate" go through another interface, and you should choose by shape:

| Interface | Good for | Watch out for |
|---|---|---|
| `ioctl` | Device-specific commands, especially structured or atomic ones | Binary ABI: must stay stable, and needs care between 32-bit and 64-bit |
| sysfs | One simple value per file, for scripts and humans | Not for bulk data or multi-field atomic updates |
| `read`, `write`, `mmap` | Data streams and buffers | Not for commands |
| debugfs | Debug information with no stable ABI | Often not mounted on production systems |

### ioctl

An ioctl command number encodes four fields: direction, argument size, a "magic" type byte, and a sequence number. The macros `_IO`, `_IOR`, `_IOW` and `_IOWR` build it. "Read" and "write" are from the application's point of view: `_IOR` means the kernel writes to the user's buffer.

```c run=el-c02-ioctl
#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <sys/ioctl.h>
#include <unistd.h>

struct cfg { int rate; int mode; };
#define FOO_GET_CFG _IOR('k', 1, struct cfg)
#define FOO_RESET   _IO('k', 2)

int main(void) {
    printf("GET_CFG: %08x type=%c nr=%d size=%d read=%d\n", (unsigned)FOO_GET_CFG,
           (int)_IOC_TYPE(FOO_GET_CFG), (int)_IOC_NR(FOO_GET_CFG), (int)_IOC_SIZE(FOO_GET_CFG),
           (_IOC_DIR(FOO_GET_CFG) & _IOC_READ) != 0);
    printf("RESET:   %08x size=%d\n", (unsigned)FOO_RESET, (int)_IOC_SIZE(FOO_RESET));

    struct winsize ws;
    int fd = open("/dev/null", O_RDONLY);
    int r = ioctl(fd, TIOCGWINSZ, &ws);
    printf("terminal ioctl on /dev/null: %d, %s\n", r, strerror(errno));
}
```

The raw value depends on the architecture's encoding, shared by x86 and ARM and different on some others, so use the macros and do not hard-code it. The `/dev/null` line shows the convention for an unknown command: the driver returns `-ENOTTY`, which `strerror` prints as "Inappropriate ioctl for device" for historical reasons.

```c
static long foo_ioctl(struct file *f, unsigned int cmd, unsigned long arg)
{
	struct foo *foo = f->private_data;
	struct cfg cfg;

	switch (cmd) {
	case FOO_GET_CFG:
		cfg.rate = foo->rate;
		cfg.mode = foo->mode;
		if (copy_to_user((void __user *)arg, &cfg, sizeof(cfg)))
			return -EFAULT;
		return 0;
	case FOO_RESET:
		return foo_reset(foo);
	default:
		return -ENOTTY;
	}
}
```

Point `.unlocked_ioctl` at this. It gets its name from the old big kernel lock that it no longer takes, so your own locking is required. A 32-bit program on a 64-bit kernel goes through `.compat_ioctl`. Avoid `long` and pointers in ioctl structs, since they change size between the two. Use `__u32` and `__u64`.

### sysfs

Each kernel object with a device model entry appears as a directory under `/sys`, and attributes are files. The rule is one value per file. You can read one now:

```bash run=el-c02-sysfs
cat /sys/class/mem/null/dev
grep -w mem /proc/devices
stat -c 'type=%F major=%t minor=%T' /dev/null
```

```c
static ssize_t threshold_show(struct device *dev,
			      struct device_attribute *attr, char *buf)
{
	struct foo *foo = dev_get_drvdata(dev);

	return sysfs_emit(buf, "%d\n", foo->threshold);
}

/* threshold_store parses buf with kstrtoint and returns count. */
static DEVICE_ATTR_RW(threshold);
```

The buffer is one page and has already been copied to or from kernel space for you, so `copy_*_user` is not needed here. `sysfs_emit` (since 5.10) knows the page limit, and it replaces `sprintf`. Register attributes through `.dev_groups` in the driver, so they exist before user space gets the uevent.

## Platform drivers and probe {#ch02-platform .th}

On a SoC, peripherals are not on a discoverable bus, so the kernel models them on a virtual **platform bus**. An enabled device tree node on a memory-mapped bus typically becomes a `platform_device`. A `platform_driver` registers a match table, and the driver core calls `probe` once for each device it matches. A driver can therefore serve several identical UARTs, so per-device state belongs in an allocated struct, never in globals.

```c
static int foo_probe(struct platform_device *pdev)
{
	struct device *dev = &pdev->dev;
	struct foo *foo;
	int irq, ret;

	foo = devm_kzalloc(dev, sizeof(*foo), GFP_KERNEL);
	if (!foo)
		return -ENOMEM;

	foo->regs = devm_platform_ioremap_resource(pdev, 0);	/* from "reg" */
	if (IS_ERR(foo->regs))
		return PTR_ERR(foo->regs);

	foo->clk = devm_clk_get_enabled(dev, NULL);		/* from "clocks" */
	if (IS_ERR(foo->clk))
		return dev_err_probe(dev, PTR_ERR(foo->clk), "no clock\n");

	irq = platform_get_irq(pdev, 0);			/* from "interrupts" */
	if (irq < 0)
		return irq;

	ret = devm_request_irq(dev, irq, foo_irq, 0, dev_name(dev), foo);
	if (ret)
		return ret;

	platform_set_drvdata(pdev, foo);
	return 0;
}

static const struct of_device_id foo_of_match[] = {
	{ .compatible = "acme,foo-v2" },
	{ /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, foo_of_match);

static struct platform_driver foo_driver = {
	.probe = foo_probe,
	.driver = {
		.name = "foo",
		.of_match_table = foo_of_match,
		.dev_groups = foo_groups,
	},
};
module_platform_driver(foo_driver);
```

Points to explain from this:

- **`devm_` resources** are tied to the device and released automatically in reverse order after `remove` returns or when `probe` fails. That removes most `goto` chains.
- **`MODULE_DEVICE_TABLE`** exports the match table, so udev can autoload the module when the device appears.
- **`-EPROBE_DEFER`** means a dependency, such as a clock or regulator, is not ready yet. The driver core retries later. `dev_err_probe` stays quiet about this case and logs real errors.
- **MMIO access** uses `readl` and `writel` on an `__iomem` pointer. They use the correct access width, ordering and endianness, and `sparse` flags a plain dereference.
- **`remove`** returned `int` for years. It was changed to return `void` around 6.11, after a transition period using `remove_new`. Check the tree you are building against.

## Drills {#ch02-drills .dr}

:::drill concept
Walk through what happens from `read(fd, buf, n)` in a program to your driver's function.
---
**Answer.** The system call enters the kernel. `sys_read` finds the `struct file` from the descriptor and calls `vfs_read`, which calls `file->f_op->read` (or `read_iter`). Those fops were attached when `open` looked up the inode's device number. Your function runs in process context on behalf of the caller, so it may sleep. **Why.** "Process context" is the phrase to use. It tells the interviewer you know why `copy_to_user` and `mutex_lock` are allowed here, and not in an interrupt handler.
:::

:::drill bug
Find two bugs in this driver write function.

```c
static ssize_t foo_write(struct file *f, const char __user *ubuf,
                         size_t count, loff_t *pos)
{
	char kbuf[64];

	copy_from_user(kbuf, ubuf, count);
	kbuf[count] = '\0';
	return count;
}
```
---
**Answer.** First, `count` is never checked, so a user can overflow the kernel stack with a long write, and `kbuf[count]` can write out of bounds. Clamp it to `sizeof(kbuf) - 1`. Second, the return value of `copy_from_user` is ignored, so a bad pointer leaves `kbuf` holding stale stack contents. Check it and return `-EFAULT`. **Why.** This is a privilege escalation bug and an unprivileged user may trigger it, depending on the node's permissions. Helpers like `strncpy_from_user` or `memdup_user_nul` avoid writing this code by hand.
:::

:::drill tricky
A driver's `.read` always returns `count` and fills the buffer with the same message. What happens when you run `cat /dev/foo`?
---
**Answer.** `cat` never sees 0, so it prints the message forever, until interrupted. **Why.** The driver has to use `*ppos` to know how much has already been read, and return 0 at the end. `simple_read_from_buffer` handles this for you.
:::

:::drill concept
What is the difference between `EXPORT_SYMBOL` and `EXPORT_SYMBOL_GPL`? What does "tainted" mean?
---
**Answer.** Both make a symbol available to modules. The GPL version allows only modules declaring a GPL-compatible license. A tainted kernel has a flag recording that something unusual happened, such as a proprietary or out-of-tree module loading, or an earlier warning or oops. The flags appear in crash reports. **Why.** Maintainers often decline bug reports from a kernel tainted by a proprietary module, because they cannot see all the code running.
:::

:::drill bug
This runs under a spinlock in a driver. What is wrong?

```c
spin_lock_irqsave(&dev->lock, flags);
if (copy_to_user(ubuf, dev->data, n))
	ret = -EFAULT;
spin_unlock_irqrestore(&dev->lock, flags);
```
---
**Answer.** `copy_to_user` can fault and sleep, and sleeping with a spinlock held and interrupts off is not allowed. Copy the data to a local buffer under the lock, release it, then call `copy_to_user`. Or use a mutex if no interrupt handler shares the data. **Why.** It may pass all your tests, because it only fails when the user page is not present. A kernel built with `CONFIG_DEBUG_ATOMIC_SLEEP` catches it every time through `might_fault`.
:::

:::drill output
What does this print?

```c run=el-c02-d-ioc
#include <stdint.h>
#include <stdio.h>
#include <sys/ioctl.h>

struct s { uint32_t a; uint16_t b; };
#define A _IOW('x', 3, struct s)
#define B _IOWR('x', 4, uint64_t)

int main(void) {
    printf("%d %d\n", (int)_IOC_NR(A), (int)_IOC_SIZE(A));
    printf("%d %d\n", (int)_IOC_NR(B), (int)_IOC_SIZE(B));
    printf("%d\n", _IOC_TYPE(A) == _IOC_TYPE(B));
}
```
---
**Answer.** `struct s` is 8 bytes after padding, since the struct is aligned to 4. So A has number 3 and size 8, B has number 4 and size 8, and both have type `'x'`. **Why.** The size encoded in the command includes padding, which is one more reason to lay out ioctl structs with explicit padding. If the size changes, the number changes, and old binaries get `-ENOTTY`.
:::

:::drill bug
The init function below leaks on failure. Find the problem and show the correct shape.

```c
static int __init foo_init(void)
{
	alloc_chrdev_region(&devno, 0, 1, "foo");
	cdev_init(&cdev, &fops);
	cdev_add(&cdev, devno, 1);
	cls = class_create("foo");
	device_create(cls, NULL, devno, NULL, "foo");
	return 0;
}
```
---
**Answer.** No return value is checked, and failures leave earlier steps registered. Check each step, and on failure jump to a label that undoes only what succeeded, in reverse order: `device_destroy`, `class_destroy`, `cdev_del`, `unregister_chrdev_region`. `class_create` returns an `ERR_PTR` on failure, so test it with `IS_ERR`. **Why.** If init fails, the module's memory is freed, while the fops pointer could still be registered. A later open would then jump into freed memory.
:::

:::drill tricky
Why does `devm_request_irq` sometimes cause a crash at unload, when it is meant to be safer?
---
**Answer.** `devm_` resources are released after `remove` returns. If `remove` frees data or stops a clock itself, the interrupt is still registered until later, so a late interrupt can run the handler on a dead device or freed state. Quiesce the device's interrupts in `remove`, or also manage the clock and the data with `devm_` so they are released in the correct reverse order. **Why.** Reverse order of acquisition is what makes `devm_` correct, and mixing manual and managed cleanup can break that order.
:::

:::drill concept
Your driver's probe returns `-EPROBE_DEFER`. Is that an error? What should it log?
---
**Answer.** It is a request to retry later, because a dependency's driver has not probed yet. The kernel moves the device to a deferred list and retries after other drivers bind. It should not log an error, which is why `dev_err_probe` exists. **Why.** Boot order between drivers is not guaranteed, and this mechanism makes it not matter. A device stuck forever in deferred state usually has a missing dependency driver.
:::

:::drill bug
This struct is copied to user space. What can it leak?

```c
struct info { u8 version; u32 flags; } info;
info.version = 1;
info.flags = dev->flags;
if (copy_to_user(uptr, &info, sizeof(info)))
	return -EFAULT;
```
---
**Answer.** Three padding bytes between `version` and `flags` keep whatever was on the kernel stack, which may include pointers or secrets. Set the whole struct to zero first with `memset(&info, 0, sizeof(info))`, or use explicit padding fields initialised to zero. **Why.** Leaks of this type have been real kernel CVEs, and leaked pointers help defeat kernel address randomisation. A designated initialiser does not reliably clear padding, so use `memset`.
:::

:::drill concept
Should a new "set sampling rate" control use ioctl or sysfs? What about streaming samples?
---
**Answer.** A single rate suits a sysfs attribute, which scripts can use with `echo`. If setting it has to be atomic with other fields, or if there is an existing subsystem ABI, use that or an ioctl. Stream samples through `read`, or through `mmap` with a ring buffer for high rates. Check first whether a subsystem such as IIO, ALSA or V4L2 already defines the interface. **Why.** A custom char device for a device class that already has a subsystem is usually the wrong design, and reviewers will say so.
:::

:::drill tricky
Why use `readl(base + 4)` over `*(volatile u32 *)(base + 4)`?
---
**Answer.** `volatile` stops the compiler from removing or merging the access. It does not provide the hardware ordering against other memory and DMA that `readl` and `writel` do, and it says nothing about device endianness: `readl` treats the register as little-endian. The `__iomem` annotation also lets `sparse` catch direct dereferences. **Why.** On x86 the plain version may well work, which is how such bugs travel to ARM unnoticed. `readl_relaxed` drops the ordering guarantee for fast paths where it is not needed.
:::

## Write the code {#ch02-coding .cd}

:::drill code rating=1200
Write `sim_read_from_buffer(to, count, ppos, from, available)` in user space, with the same behaviour as the kernel's `simple_read_from_buffer`. Show that repeated reads with a small buffer return all data and then 0.
---
Handle out-of-range positions first, clamp the count to what remains, copy, and advance the position.

```c run=el-c02-c-simpleread
#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <sys/types.h>

static ssize_t sim_read_from_buffer(char *to, size_t count, off_t *ppos,
                                    const char *from, size_t available) {
    off_t pos = *ppos;
    if (pos < 0) return -EINVAL;
    if ((size_t)pos >= available || !count) return 0;
    if (count > available - pos) count = available - pos;
    memcpy(to, from + pos, count);   /* the kernel uses copy_to_user here */
    *ppos = pos + count;
    return count;
}

int main(void) {
    const char *msg = "hello driver";
    char out[5];
    off_t pos = 0;
    ssize_t n;
    while ((n = sim_read_from_buffer(out, 5, &pos, msg, strlen(msg))) > 0)
        printf("got %zd: %.*s\n", n, (int)n, out);
    printf("then %zd at pos %ld\n", n, (long)pos);
}
```
:::

:::drill code rating=1000
A callback receives a `struct cdev *` that is embedded in your `struct my_dev`. Write `container_of` and use it to get back to the device.
---
Subtract the member's offset from the member's address.

```c run=el-c02-c-container
#include <stddef.h>
#include <stdio.h>

#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

struct cdev { int dummy; };
struct my_dev { int id; struct cdev cdev; char name[8]; };

static void callback(struct cdev *c) {
    struct my_dev *d = container_of(c, struct my_dev, cdev);
    printf("id=%d name=%s offset=%zu\n", d->id, d->name, offsetof(struct my_dev, cdev));
}

int main(void) {
    struct my_dev d = { .id = 7, .name = "uart0" };
    callback(&d.cdev);
}
```

The same pattern gets you from a `struct work_struct *` or a `struct list_head *` back to its owner. The kernel's version adds a type check.
:::

## Cheat sheet {#ch02-cheatsheet .th}

- `insmod`/`modprobe`, then checks, symbol resolution, and init. Non-zero from init means the load fails. `rmmod` is refused while the refcount is held.
- Kernel rules: no libc, small stack, no casual floating point, negative errnos, explicit cleanup in reverse order, `GFP_KERNEL` may sleep and `GFP_ATOMIC` will not.
- Char device: major and minor, `cdev` or `misc_register`, then `file_operations`. Read returns a count, 0 at EOF, negative on error, and updates `*ppos`.
- `copy_to_user` returns bytes not copied, so check non-zero and return `-EFAULT`. It may sleep. It uses `access_ok` and exception-table fixups.
- Watch for padding leaks, double fetches and unchecked lengths.
- ioctl: `_IOR`, `_IOW` and `_IOWR` are from the user's viewpoint, `-ENOTTY` for unknown, `__u32` and `__u64` for 32/64 safety.
- sysfs: one value per file, `sysfs_emit`, register via `.dev_groups`.
- Platform driver: `of_match_table`, then `probe` per device. Use `devm_`, return `-EPROBE_DEFER` when dependencies are missing, and keep state in `drvdata`.
- MMIO: `ioremap`, then `readl`/`writel`, and do not dereference directly.
- `container_of` gets you from an embedded member to the outer struct.
