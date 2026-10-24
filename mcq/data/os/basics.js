/* Operating Systems — OS Basics & Kernel */
window.QUESTIONS.push(
  {
    id: "os-basics-001", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "What are the two classic roles of an operating system?",
    options: ["Resource manager (allocating CPU, memory, devices fairly and efficiently) and extended machine (providing clean abstractions like processes, files and sockets over raw hardware)", "Compiler and linker", "Web server and database", "Antivirus and firewall"],
    answer: 0,
    explanation: "The OS multiplexes hardware among programs (time-multiplexing the CPU, space-multiplexing memory) and hides hardware complexity behind abstractions and system calls, also enforcing protection between programs and users.",
    optionExplanations: ["Correct.", "Those are development tools.", "Those are applications running on the OS.", "Security software is optional, not the OS's core role."]
  },
  {
    id: "os-basics-002", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "What is the key idea of a MULTIPROGRAMMING operating system?",
    options: ["Several CPUs run in parallel", "Several jobs are kept in memory; when the running job waits for I/O, the CPU switches to another job, increasing CPU utilisation", "Each user gets a dedicated computer", "Programs are written in multiple languages"],
    answer: 1,
    explanation: "Multiprogramming overlaps CPU work with I/O waits. Time-sharing (multitasking) extends it with frequent timer-driven switches so many interactive users get quick response. Multiprocessing means multiple CPUs; multithreading means multiple threads within a process.",
    optionExplanations: ["That's multiprocessing.", "Correct.", "That's the opposite of sharing.", "Unrelated to scheduling."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-basics-003", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "Match the terms: (1) multitasking, (2) multiprocessing, (3) multithreading.",
    options: ["(1) several CPUs; (2) several threads; (3) several users", "(1) batch jobs; (2) virtual memory; (3) paging", "All three mean the same thing", "(1) one CPU rapidly switching between tasks (time-sharing); (2) a system with two or more CPUs/cores executing truly in parallel; (3) several threads of execution within one process"],
    answer: 3,
    explanation: "Multitasking gives the illusion of simultaneity via time slicing (concurrency). Multiprocessing provides real parallelism on multiple processors (SMP is the common symmetric form). Multithreading lets one process run multiple threads that share its address space.",
    optionExplanations: ["The definitions are scrambled.", "Those are unrelated concepts.", "They refer to different mechanisms.", "Correct."]
  },
  {
    id: "os-basics-004", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "Which type of OS must guarantee that tasks complete within strict deadlines, where a missed deadline counts as a system failure (e.g. an airbag controller)?",
    options: ["Batch OS", "Time-sharing OS", "Soft real-time OS", "Hard real-time OS"],
    answer: 3,
    explanation: "Hard real-time systems need deterministic, bounded response times (VxWorks, QNX, FreeRTOS in safety-critical modes). Soft real-time systems (video streaming, gaming) tolerate occasional misses with degraded quality. General-purpose OSes optimise average throughput rather than worst-case latency.",
    optionExplanations: ["Batch systems run jobs without interaction or deadlines.", "Time-sharing optimises interactivity, not hard deadlines.", "Soft real-time tolerates occasional misses.", "Correct."]
  },
  {
    id: "os-basics-005", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "What is the main difference between a monolithic kernel and a microkernel?",
    options: ["Monolithic kernels can't run drivers", "Monolithic kernels have no system calls", "Microkernels are always faster", "A monolithic kernel runs all OS services (file systems, drivers, networking) in kernel space; a microkernel keeps only essentials (IPC, scheduling, basic memory management) in the kernel and runs other services as user-space servers"],
    answer: 3,
    explanation: "Monolithic (Linux, traditional Unix): fast, because services call each other directly, but a buggy driver can crash the whole system. Microkernel (Minix 3, QNX, seL4): more modular and fault-isolated, but services communicate via message-passing IPC, adding overhead. Hybrid kernels (Windows NT, macOS XNU) mix both.",
    optionExplanations: ["Drivers run inside monolithic kernels.", "Both expose system calls.", "IPC overhead usually makes microkernels slower.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-basics-006", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "Which pairing of operating systems and kernel architecture is correct?",
    options: ["Linux: microkernel; QNX: monolithic", "All modern OSes are microkernels", "Windows: microkernel; Linux: hybrid", "Linux: monolithic (with loadable modules); QNX/Minix 3: microkernel; Windows NT and macOS XNU: hybrid"],
    answer: 3,
    explanation: "Linux is monolithic but modular: drivers can be loaded as kernel modules at runtime (still in kernel space). QNX and Minix 3 are microkernels. Windows NT and XNU (Mach + BSD) are described as hybrid kernels.",
    optionExplanations: ["Reversed.", "Most popular OSes are monolithic or hybrid.", "Windows NT is hybrid and Linux is monolithic.", "Correct."]
  },
  {
    id: "os-basics-007", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "What are Linux loadable kernel modules (LKMs)?",
    options: ["User-space programs", "Kernel configuration files", "Virtual machines", "Code (often drivers or file systems) that can be inserted into and removed from the running kernel (insmod/modprobe/rmmod) without rebooting; it runs in kernel space with full privileges"],
    answer: 3,
    explanation: "LKMs give monolithic kernels some microkernel-like flexibility (load only needed drivers) but not its fault isolation: a buggy module can still crash the kernel.",
    optionExplanations: ["Modules run inside the kernel.", "They're executable kernel code.", "Modules aren't VMs.", "Correct."]
  },
  {
    id: "os-basics-008", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "Why does the CPU have separate user mode and kernel mode?",
    options: ["To run two programs at once", "To protect the system: privileged instructions (I/O, changing page tables, disabling interrupts) can only execute in kernel mode, so a user program can't take over the hardware or other processes", "To save power", "To support different programming languages"],
    answer: 1,
    explanation: "A mode bit in the CPU records the current privilege level (x86 uses rings 0–3; OSes use ring 0 for the kernel and ring 3 for users). Attempting a privileged instruction in user mode causes a trap to the OS. Entering kernel mode happens only via controlled gates: system calls, interrupts and exceptions.",
    optionExplanations: ["Concurrency comes from scheduling, not modes.", "Correct.", "Power management is unrelated.", "Languages are unrelated to CPU privilege."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-basics-009", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "Which of these instructions does NOT need to be privileged?",
    options: ["Setting the timer interrupt value", "Disabling interrupts", "Reading the current time of day (clock)", "Loading the page-table base register / modifying memory-management registers"],
    answer: 2,
    explanation: "Instructions that could let a program seize control or break isolation must be privileged: setting the timer (could prevent preemption), disabling interrupts, I/O instructions, changing memory mappings, switching to kernel mode. Merely READING the clock is harmless (Linux even provides vDSO calls for it without entering the kernel).",
    optionExplanations: ["A program could disable preemption by changing the timer.", "A program could monopolise the CPU.", "Correct.", "A program could map other processes' memory."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-basics-010", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "What is a system call?",
    options: ["A function call between two user programs", "A call to the BIOS during boot", "A hardware interrupt from the keyboard", "The programming interface through which a user program requests a service from the kernel (e.g. read, write, fork); it executes a trap instruction that switches the CPU into kernel mode"],
    answer: 3,
    explanation: "The program places a system-call number and arguments in registers and executes a special instruction (syscall on x86-64, svc on ARM). The CPU switches to kernel mode and jumps to the kernel's handler, which validates the arguments, performs the work and returns to user mode.",
    optionExplanations: ["User programs can't call each other's functions directly.", "BIOS calls are firmware services during boot.", "That's a hardware interrupt.", "Correct."]
  },
  {
    id: "os-basics-011", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "Classify these Unix system calls: fork(), open(), ioctl(), getpid(), pipe().",
    options: ["All file management", "Process control, file management, device management, information maintenance, communication", "Communication, process control, file management, device management, information maintenance", "All process control"],
    answer: 1,
    explanation: "Common categories: process control (fork, exec, exit, wait), file management (open, read, write, close), device management (ioctl, read/write on devices), information maintenance (getpid, time, alarm), communication (pipe, socket, shmget, mmap), and protection (chmod, chown).",
    optionExplanations: ["Only open is purely file management.", "Correct.", "The categories are shifted.", "Only fork is process control."]
  },
  {
    id: "os-basics-012", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "What is the relationship between the C library function printf() and the system call write()?",
    options: ["They're the same thing", "printf() is a user-space library function that formats text into a buffer and eventually calls the write() system call to hand bytes to the kernel", "write() calls printf()", "printf() talks directly to the screen hardware"],
    answer: 1,
    explanation: "Library functions (libc) run in user mode and may make zero, one or many system calls. printf buffers output (line-buffered for terminals, fully buffered otherwise), so several printf calls may cost a single write(). This buffering explains some surprising fork() outputs.",
    optionExplanations: ["One is a library function, the other a kernel entry point.", "Correct.", "The dependency is the other way round.", "User programs can't access hardware directly."]
  },
  {
    id: "os-basics-013", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "What is the difference between a hardware interrupt and a trap (software interrupt / exception)?",
    options: ["They are identical", "Only traps switch to kernel mode", "Traps come from devices; interrupts from programs", "A hardware interrupt is an asynchronous signal from a device (e.g. disk done, key pressed); a trap is synchronous, caused by the running instruction itself (system call instruction, divide by zero, page fault)"],
    answer: 3,
    explanation: "Both transfer control to a kernel handler located through the interrupt vector table (IDT on x86). Interrupts can occur at any time independent of the current instruction; traps/exceptions happen as a direct result of executing an instruction.",
    optionExplanations: ["Their sources and timing differ.", "Both enter kernel mode.", "Reversed.", "Correct."]
  },
  {
    id: "os-basics-014", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "What happens when a hardware interrupt arrives while a user program is running?",
    options: ["The CPU finishes the current instruction, saves state (PC, flags), switches to kernel mode, looks up the handler in the interrupt vector table, runs the interrupt service routine (ISR), then restores state and resumes (possibly scheduling a different process)", "The program is terminated", "The interrupt is ignored until the program ends", "The program handles the interrupt itself"],
    answer: 0,
    explanation: "ISRs must be short; deferred work goes to 'bottom halves' (softirqs, tasklets, workqueues in Linux). If the interrupt made a higher-priority process ready (or the time slice expired), the kernel may perform a context switch before returning.",
    optionExplanations: ["Correct.", "Interrupts are handled transparently.", "Interrupts are serviced promptly.", "The kernel handles hardware interrupts."]
  },
  {
    id: "os-basics-015", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "Why is DMA (Direct Memory Access) used for transferring large blocks from disk or network cards?",
    options: ["It makes the CPU faster", "The DMA controller transfers the whole block between device and memory by itself and raises ONE interrupt when done, instead of the CPU moving each byte/word (programmed I/O) or handling an interrupt per byte", "DMA encrypts data", "DMA avoids using memory"],
    answer: 1,
    explanation: "With programmed I/O the CPU busy-polls or is interrupted for every unit of data. DMA offloads the copying; the CPU only sets up the transfer (address, count, direction) and handles completion. Bus contention ('cycle stealing') is the small cost.",
    optionExplanations: ["The CPU's speed is unchanged; its time is freed.", "Correct.", "DMA doesn't encrypt.", "DMA writes directly into memory."]
  },
  {
    id: "os-basics-016", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "When is POLLING (busy-waiting on a device status register) preferable to interrupts?",
    options: ["Never", "When the device is slow and rarely ready", "When the device is very fast and events are frequent or expected almost immediately (e.g. high-speed NICs/NVMe under heavy load), so the overhead of interrupt handling and context switches exceeds the cost of polling", "When the CPU is idle and must save power"],
    answer: 2,
    explanation: "Interrupts are efficient when events are infrequent (CPU does useful work meanwhile). At very high event rates, per-interrupt overhead dominates; Linux NAPI and NVMe/io_uring polling modes switch to polling under load. Polling a slow device wastes CPU cycles.",
    optionExplanations: ["High-rate devices often benefit from polling.", "Slow devices waste CPU when polled.", "Correct.", "Polling keeps the CPU busy and burns power."]
  },
  {
    id: "os-basics-017", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "How does the OS regain control from a user program stuck in an infinite loop that never makes a system call?",
    options: ["A hardware TIMER raises a periodic interrupt; the handler runs in kernel mode and the scheduler can preempt the looping process", "It can't; the machine must be rebooted", "The program eventually calls exit()", "The compiler inserts checks"],
    answer: 0,
    explanation: "The timer interrupt is the foundation of preemptive multitasking. Because only the kernel can program the timer (a privileged instruction), user code can't disable it. Early cooperative systems (Windows 3.x, classic Mac OS) relied on programs yielding voluntarily and could freeze.",
    optionExplanations: ["Correct.", "Preemptive OSes handle this routinely.", "An infinite loop never exits.", "Compilers don't insert scheduler checks."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-basics-018", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "What is the correct order of a typical PC boot sequence with UEFI and Linux?",
    options: ["Firmware (UEFI/BIOS) runs POST → loads the bootloader (e.g. GRUB) from disk → bootloader loads the kernel (and initramfs) → kernel initialises hardware and mounts the root file system → starts PID 1 (init/systemd) → services and login", "Kernel → bootloader → firmware → init", "init → kernel → firmware → bootloader", "Bootloader → firmware → kernel → shell"],
    answer: 0,
    explanation: "Legacy BIOS loads a 512-byte boot sector from the MBR; UEFI reads boot entries from an EFI System Partition (GPT disks). The bootloader passes control and parameters to the kernel, which eventually launches the first user-space process (PID 1).",
    optionExplanations: ["Correct.", "The firmware runs first.", "init is started last by the kernel.", "Firmware runs before the bootloader."]
  },
  {
    id: "os-basics-019", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "What is the difference between MBR and GPT partitioning?",
    options: ["They're file systems", "MBR supports unlimited partitions", "GPT is older than MBR", "MBR (legacy BIOS) supports up to 4 primary partitions and disks up to 2 TiB using 32-bit sector addresses; GPT (used with UEFI) supports very large disks and many partitions (128 by default) with a backup header and CRC checks"],
    answer: 3,
    explanation: "With 512-byte sectors and 32-bit LBA, MBR tops out at 2 TiB. GPT uses 64-bit LBAs, stores a redundant header at the end of the disk, and identifies partitions by GUIDs.",
    optionExplanations: ["They're partition table formats.", "MBR is limited to 4 primary partitions.", "MBR is the legacy scheme.", "Correct."]
  },
  {
    id: "os-basics-020", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "What is the difference between the shell and the kernel?",
    options: ["The shell (bash, zsh) is a user-space command interpreter that reads commands and asks the kernel (via system calls) to create processes, open files, etc.; the kernel is the privileged core managing hardware and resources", "They're the same program", "The kernel is a GUI", "The shell runs in kernel mode"],
    answer: 0,
    explanation: "Typing `ls` in bash makes the shell fork() a child, which exec()s /bin/ls, while the shell wait()s. The kernel does the real work of creating processes and reading directories. The shell is replaceable; the kernel is not.",
    optionExplanations: ["Correct.", "They're separate components.", "GUIs are user-space programs too.", "Shells are ordinary user processes."]
  },
  {
    id: "os-basics-021", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "Which is cheaper: a MODE switch (user → kernel for a system call) or a CONTEXT switch (switching from one process to another)?",
    options: ["A context switch, because it doesn't enter the kernel", "They cost exactly the same", "A mode switch: it only changes privilege level and saves a few registers, while a context switch saves/restores the full CPU state, changes the address space (page tables, often TLB flushes) and loses cache warmth", "Mode switches require rebooting"],
    answer: 2,
    explanation: "Every context switch includes mode switches, but not vice versa: a getpid() call enters and leaves the kernel without changing processes. Switching between threads of the same process is cheaper than between processes because the address space stays the same.",
    optionExplanations: ["Context switches happen inside the kernel.", "Context switches do much more work.", "Correct.", "Mode switches happen millions of times per second."]
  },
  {
    id: "os-basics-022", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "Several users send documents to one printer simultaneously. How does SPOOLING help?",
    options: ["It prints all documents at once", "Each job's output is written to a disk queue (spool) at full speed, and a printer daemon feeds jobs to the slow device one at a time, so programs don't wait for the printer and outputs don't interleave", "It compresses the documents", "It cancels duplicate jobs"],
    answer: 1,
    explanation: "SPOOL = Simultaneous Peripheral Operations On-Line. It decouples fast producers from a slow, non-shareable device. BUFFERING is related but smaller-scale: temporary memory that smooths speed mismatches during a single transfer.",
    optionExplanations: ["A printer handles one job at a time.", "Correct.", "Spooling doesn't compress.", "It queues jobs; it doesn't deduplicate them."]
  },
  {
    id: "os-basics-023", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "hard", type: "numerical",
    question: "In a multiprogrammed system, each process spends 80% of its time waiting for I/O. Assuming independent waits, approximately what is the CPU utilisation with 4 processes in memory?",
    options: ["20%", "80%", "59%", "100%"],
    answer: 2,
    explanation: "The CPU is idle only when ALL n processes wait simultaneously, with probability p^n. Utilisation = 1 − p^n = 1 − 0.8⁴ = 1 − 0.4096 = 0.5904 ≈ 59%. With 1 process it would be only 20%, which shows why multiprogramming helps.",
    optionExplanations: ["That's the single-process utilisation.", "80% is the I/O wait fraction.", "Correct.", "The CPU is still idle when all four wait."]
  },
  {
    id: "os-basics-024", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "hard", type: "numerical",
    question: "A device raises 20,000 interrupts per second, and handling each interrupt (save state, ISR, restore) costs 15 µs of CPU time. What fraction of the CPU is spent on interrupt handling?",
    options: ["3%", "0.3%", "30%", "15%"],
    answer: 2,
    explanation: "CPU time per second = 20,000 × 15 µs = 300,000 µs = 0.3 s, i.e. 30% of each second. Such overhead motivates interrupt coalescing, DMA and polling modes for high-rate devices.",
    optionExplanations: ["That's off by a factor of 10.", "That's off by a factor of 100.", "Correct.", "The 15 is microseconds per interrupt, not a percentage."]
  },
  {
    id: "os-basics-025", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "hard", type: "concept",
    question: "A user program executes a privileged instruction (e.g. `cli` to disable interrupts on x86) in user mode. What happens?",
    options: ["Interrupts are disabled system-wide", "The instruction is silently executed for that process only", "The CPU raises a general-protection exception (trap); the kernel handles it, typically by sending the process a signal (SIGSEGV) that terminates it", "The machine reboots"],
    answer: 2,
    explanation: "Hardware enforces privilege: the attempt never takes effect. The resulting exception transfers control to the kernel, which treats it as a fault in the process. This is how dual-mode operation protects the system from user programs.",
    optionExplanations: ["The hardware blocks the instruction.", "Privileged instructions never run in user mode.", "Correct.", "Only the offending process is affected."]
  },
  {
    id: "os-basics-026", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "What distinguishes a real-time OS (RTOS) scheduler from a general-purpose OS scheduler?",
    options: ["It always runs processes in FIFO order", "It never uses interrupts", "It aims for predictable, bounded worst-case latency (deterministic priority-based preemptive scheduling, bounded interrupt latency, priority inheritance), rather than maximising average throughput or fairness", "It runs only one process"],
    answer: 2,
    explanation: "RTOS design minimises jitter: fixed-priority preemptive scheduling (rate-monotonic) or EDF, short non-preemptible sections, and protocols against priority inversion. Average performance may be lower than a general-purpose OS, but timing is predictable.",
    optionExplanations: ["RTOS schedulers are priority-driven.", "Interrupts are essential in real-time systems.", "Correct.", "RTOSes run many tasks."]
  },
  {
    id: "os-basics-027", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "In a distributed operating system, what is the main goal?",
    options: ["To make a collection of networked computers appear to users as a single coherent system (transparent resource sharing, location transparency)", "To run one program on one computer", "To speed up a single CPU", "To store all files on one disk"],
    answer: 0,
    explanation: "Distributed OSes (and middleware) hide the fact that resources are spread across machines. Modern practice often achieves this at higher levels: distributed file systems, cluster schedulers (Kubernetes) and distributed databases, rather than a single distributed kernel.",
    optionExplanations: ["Correct.", "That's a single-machine OS.", "Speeding up one CPU isn't the goal.", "Distributed systems spread storage."]
  },
  {
    id: "os-basics-028", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "Which statement about batch operating systems is correct?",
    options: ["Similar jobs are grouped and run one after another without user interaction; turnaround time can be long, and the CPU may sit idle during I/O unless multiprogramming is used", "Users interact with jobs while they run", "They provide real-time guarantees", "They're used only on smartphones"],
    answer: 0,
    explanation: "Early mainframes ran batches of punched-card jobs sequentially. Their CPU idling during I/O motivated multiprogramming, and the lack of interactivity motivated time-sharing. Batch processing survives today in scheduled jobs (payroll, ETL).",
    optionExplanations: ["Correct.", "Batch jobs run without interaction.", "Batch systems have no deadline guarantees.", "Smartphones use interactive OSes."]
  },
  {
    id: "os-basics-029", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "hard", type: "concept",
    question: "Why does a microkernel-based system typically incur more overhead for a file read than a monolithic kernel?",
    options: ["The request becomes IPC messages: application → kernel → file-system server (user space) → disk-driver server → back, each crossing involving mode switches and context switches, versus direct function calls inside a monolithic kernel", "Microkernels have no file systems", "Microkernels can't use DMA", "Microkernels run without virtual memory"],
    answer: 0,
    explanation: "Moving services to user space buys isolation (a crashed driver can be restarted) and a smaller trusted kernel (seL4 is formally verified), at the cost of extra boundary crossings. Fast IPC designs (L4) narrow but don't eliminate the gap.",
    optionExplanations: ["Correct.", "File systems run as user-space servers.", "Drivers in microkernels can use DMA.", "Microkernels support virtual memory."]
  },
  {
    id: "os-basics-030", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "medium", type: "concept",
    question: "On x86, which protection rings do mainstream OSes like Linux and Windows actually use?",
    options: ["All four rings: 0, 1, 2, 3", "Only ring 3", "Ring 0 for the kernel and ring 3 for user programs (rings 1 and 2 are mostly unused; hypervisors use hardware virtualisation 'root mode' instead)", "Ring 1 for the kernel and ring 0 for users"],
    answer: 2,
    explanation: "Using just two levels keeps the design portable to architectures with only two privilege modes (ARM's EL0/EL1, RISC-V's U/S modes). Lower ring numbers are more privileged.",
    optionExplanations: ["Rings 1 and 2 are generally unused.", "The kernel needs ring 0.", "Correct.", "Ring 0 is the most privileged and belongs to the kernel."]
  },
  {
    id: "os-basics-031", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "hard", type: "concept",
    question: "A program calls getpid() 1,000,000 times in a loop; another calls a function that just returns a stored integer 1,000,000 times. Why is the first loop much slower (on systems without a cached getpid)?",
    options: ["getpid() reads from disk", "Each getpid() is a system call: it traps into the kernel (mode switch, saving registers, security mitigations like page-table switching), runs the handler and returns, costing ~100+ ns versus ~1 ns for a plain function call", "getpid() creates a new process", "The compiler can't optimise loops with getpid()"],
    answer: 1,
    explanation: "System calls are far more expensive than ordinary function calls because of the privilege transition and kernel entry/exit work. That's why libc buffers I/O, why Linux exposes some calls via the vDSO (e.g. clock_gettime) without entering the kernel, and why batching interfaces like io_uring exist.",
    optionExplanations: ["The PID is in memory.", "Correct.", "getpid doesn't create processes.", "Compiler optimisation isn't the main factor."]
  },
  {
    id: "os-basics-032", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "easy", type: "concept",
    question: "What is an embedded operating system?",
    options: ["An OS hidden inside another OS", "An OS designed for a dedicated device with limited resources and a specific purpose (routers, smart TVs, microcontrollers), often with real-time requirements and minimal user interface", "Any OS running in a virtual machine", "An OS stored in the cloud"],
    answer: 1,
    explanation: "Examples include FreeRTOS, Zephyr, embedded Linux (OpenWrt, Yocto builds) and VxWorks. They prioritise small footprint, reliability and predictable timing over general-purpose features.",
    optionExplanations: ["That would be virtualisation.", "Correct.", "VMs can run any OS.", "Embedded OSes run on the device itself."]
  },
{
    id: "os-basics-033", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "hard", type: "concept",
    question: "Which of these events does NOT cause the CPU to switch from user mode to kernel mode?",
    options: ["A page fault on the first access to a newly allocated page", "A timer interrupt arriving while the program runs", "An integer division by zero", "Calling strlen() on a string that is already in memory"],
    answer: 3,
    explanation: "Kernel mode is entered only via interrupts, exceptions (traps/faults) or explicit system calls. A page fault and divide-by-zero are exceptions; a timer interrupt is a hardware interrupt. strlen() is an ordinary library function that runs entirely in user mode (unless it happens to touch a non-resident page).",
    optionExplanations: ["Page faults are exceptions handled by the kernel.", "Interrupts always enter the kernel.", "Division by zero raises an exception handled by the kernel.", "Correct: a plain user-space function call."]
  },
  {
    id: "os-basics-034", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "hard", type: "numerical",
    question: "Processes each spend 50% of their time waiting for I/O (independently). What is the minimum number of processes that must be in memory for CPU utilisation to reach at least 90%?",
    options: ["2", "3", "4", "10"],
    answer: 2,
    explanation: "Utilisation = 1 − pⁿ with p = 0.5. Need 0.5ⁿ ≤ 0.1: n = 3 gives 0.125 (87.5% utilisation), n = 4 gives 0.0625 (93.75%). So at least 4 processes.",
    optionExplanations: ["2 processes give 75%.", "3 processes give 87.5%, just short of 90%.", "Correct.", "Far more than needed."]
  },
  {
    id: "os-basics-035", subject: "os", subtopic: "OS Basics & Kernel", difficulty: "hard", type: "concept",
    question: "Put the steps of a system call such as read() in order: (a) the kernel looks up the handler in the system-call table; (b) the libc wrapper puts the call number and arguments in registers; (c) the handler validates arguments and does the work; (d) a trap instruction switches the CPU to kernel mode at the kernel's entry point; (e) the return-from-trap instruction restores user mode and the result is returned.",
    options: ["b, d, a, c, e", "d, b, a, c, e", "b, a, d, c, e", "a, b, d, c, e"],
    answer: 0,
    explanation: "User code (often a libc wrapper) prepares the call number and arguments, then executes the trap (syscall/svc). The CPU switches to kernel mode at a fixed entry point, the kernel dispatches through the system-call table, the handler runs (checking user pointers carefully), and a special return instruction drops back to user mode with the return value (or -1 and errno).",
    optionExplanations: ["Correct.", "Arguments must be prepared before trapping.", "The table lookup happens in kernel mode, after the trap.", "The table lookup can't happen before entering the kernel."]
  }
);
