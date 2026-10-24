/* Operating Systems — Inter-Process Communication */
window.QUESTIONS.push(
  {
    id: "os-ipc-001", subject: "os", subtopic: "Inter-Process Communication", difficulty: "easy", type: "concept",
    question: "Why do operating systems provide inter-process communication (IPC) mechanisms?",
    options: ["Because processes share all memory by default", "Only to transfer files", "Because processes have isolated address spaces; cooperating processes need kernel-provided channels (pipes, shared memory, message queues, sockets, signals) to exchange data and coordinate", "To speed up single-threaded programs"],
    answer: 2,
    explanation: "Isolation protects processes from each other, but cooperating processes (a web server and its workers, a shell pipeline) must share information. Independent processes don't affect each other; cooperating ones do and therefore need IPC and synchronisation.",
    optionExplanations: ["Processes are isolated by default.", "IPC covers far more than file transfer.", "Correct.", "IPC is about communication, not speeding up one program."]
  },
  {
    id: "os-ipc-002", subject: "os", subtopic: "Inter-Process Communication", difficulty: "easy", type: "concept",
    question: "How do the two fundamental IPC models, shared memory and message passing, differ?",
    options: ["They are identical", "Shared memory works across networks", "Message passing is always faster", "Shared memory maps a common region into both address spaces: very fast after setup, but processes must synchronise access themselves. Message passing sends data through the kernel (send/receive): simpler and safer, works across machines, but each message costs system calls and copying"],
    answer: 3,
    explanation: "Shared memory avoids kernel involvement for each data transfer, which is ideal for large data on one machine. Message passing (pipes, message queues, sockets) has built-in synchronisation semantics and is natural for distributed systems and microkernels.",
    optionExplanations: ["Their performance and safety trade-offs differ.", "Shared memory is local to one machine (without special hardware).", "Shared memory is typically faster for bulk data.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-ipc-003", subject: "os", subtopic: "Inter-Process Communication", difficulty: "easy", type: "concept",
    question: "After `int fd[2]; pipe(fd);`, which end is which?",
    options: ["fd[0] is the read end, fd[1] is the write end", "fd[0] is the write end, fd[1] is the read end", "Both ends can read and write", "fd[0] is stdin and fd[1] is stdout"],
    answer: 0,
    explanation: "Mnemonic: 0 is like stdin (read), 1 is like stdout (write). Data written to fd[1] comes out of fd[0] in FIFO order. A pipe is unidirectional; two-way communication needs two pipes (or a socketpair).",
    optionExplanations: ["Correct.", "Reversed.", "A pipe is one-directional.", "They're new descriptors, though the numbering mirrors stdin/stdout."]
  },
  {
    id: "os-ipc-004", subject: "os", subtopic: "Inter-Process Communication", difficulty: "easy", type: "concept",
    question: "What advantage does a named pipe (FIFO, created with mkfifo) have over an anonymous pipe?",
    options: ["It's bidirectional by default", "It's faster", "It stores data permanently on disk", "It has a name in the file system, so UNRELATED processes (not parent/child) can open it and communicate"],
    answer: 3,
    explanation: "Anonymous pipes exist only as inherited file descriptors, so they connect related processes (typically parent and child after fork). A FIFO appears as a special file; any process with permission can open it. The data still passes through kernel memory, not disk.",
    optionExplanations: ["FIFOs are still unidirectional per open.", "Speed is similar.", "Data isn't persisted.", "Correct."]
  },
  {
    id: "os-ipc-005", subject: "os", subtopic: "Inter-Process Communication", difficulty: "easy", type: "concept",
    question: "Which two signals can NEVER be caught, blocked or ignored by a process?",
    options: ["SIGINT and SIGTERM", "SIGSEGV and SIGCHLD", "SIGKILL and SIGSTOP", "SIGHUP and SIGPIPE"],
    answer: 2,
    explanation: "SIGKILL (kill -9) always terminates and SIGSTOP always stops a process, guaranteeing the administrator can control any process. SIGTERM (the default for kill) and SIGINT (Ctrl+C) can be handled, which lets programs clean up before exiting.",
    optionExplanations: ["Both can be caught for graceful shutdown.", "Both can be handled.", "Correct.", "Both can be handled or ignored."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-ipc-006", subject: "os", subtopic: "Inter-Process Communication", difficulty: "easy", type: "concept",
    question: "Match each signal with its usual cause: SIGINT, SIGTERM, SIGSEGV, SIGCHLD.",
    options: ["Ctrl+C at the terminal; polite termination request (default of the kill command); invalid memory access; a child process stopped or terminated", "Child exited; Ctrl+C; timer expired; invalid memory access", "Invalid memory access; Ctrl+Z; Ctrl+C; pipe broken", "All four mean 'terminate immediately'"],
    answer: 0,
    explanation: "Other common signals: SIGKILL (forced kill), SIGSTOP/SIGTSTP (stop / Ctrl+Z), SIGCONT (continue), SIGHUP (terminal hang-up, often 'reload config' for daemons), SIGPIPE (write to a pipe with no readers), SIGALRM (timer).",
    optionExplanations: ["Correct.", "The pairings are scrambled.", "The pairings are scrambled.", "Their meanings and default actions differ."]
  },
  {
    id: "os-ipc-007", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "code-output",
    question: "What does this program print?",
    code: "int fd[2]; char buf[16] = {0};\npipe(fd);\nif (fork() == 0) {\n    close(fd[1]);\n    int n = read(fd[0], buf, 15);\n    printf(\"child got %d bytes: %s\\n\", n, buf);\n    n = read(fd[0], buf, 15);\n    printf(\"second read: %d\\n\", n);\n    return 0;\n}\nclose(fd[0]);\nwrite(fd[1], \"hi\", 2);\nclose(fd[1]);\nwait(NULL);",
    options: ["child got 2 bytes: hi / second read: 0", "child got 2 bytes: hi / the second read blocks forever", "child got 0 bytes / second read: 2", "child got 16 bytes: hi / second read: -1"],
    answer: 0,
    explanation: "The child reads the 2 bytes written by the parent. Once the parent closes the write end (and the child closed its own copy), no writers remain, so the next read() returns 0 — end of file — instead of blocking.",
    optionExplanations: ["Correct.", "read() returns 0 once all write ends are closed.", "The data is available on the first read.", "read returns the number of bytes actually read."]
  },
  {
    id: "os-ipc-008", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "A child reads from a pipe in a loop until read() returns 0, but it hangs forever even after the parent finished writing and closed its write end. What's the most likely bug?",
    options: ["The pipe is full", "read() never returns 0", "The CHILD never closed its own inherited copy of the write end (fd[1]); EOF is reported only when ALL write descriptors are closed, so the child itself keeps the pipe 'open for writing'", "The parent used the wrong signal"],
    answer: 2,
    explanation: "After fork(), both processes hold both ends. Each process must close the end it doesn't use: the reader closes fd[1], the writer closes fd[0]. Forgetting this is the classic pipe deadlock.",
    optionExplanations: ["A full pipe blocks the writer, not the reader.", "read() returns 0 at EOF.", "Correct.", "Signals aren't involved."],
    tags: ["trap"]
  },
  {
    id: "os-ipc-009", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "A process writes to a pipe whose read end has been closed by every process. What happens by default?",
    options: ["The data is stored until a reader appears", "The writer receives SIGPIPE, which terminates it by default; if SIGPIPE is ignored or handled, write() fails with errno EPIPE ('Broken pipe')", "write() returns 0", "The system blocks the writer forever"],
    answer: 1,
    explanation: "This is why `yes | head -1` terminates: once head exits, yes gets SIGPIPE. Network servers usually ignore SIGPIPE so a disconnected client causes an EPIPE error instead of killing the server.",
    optionExplanations: ["Pipes don't hold data for future readers.", "Correct.", "It fails with an error or a signal.", "There's no reader to wait for."]
  },
  {
    id: "os-ipc-010", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "A writer keeps writing to a pipe while the reader is slow. What happens when the pipe's buffer (64 KiB by default on Linux) fills up?",
    options: ["write() blocks until the reader consumes data (unless the descriptor is non-blocking, in which case it fails with EAGAIN)", "Data is discarded", "The pipe grows without limit", "The reader is killed"],
    answer: 0,
    explanation: "The bounded kernel buffer provides natural flow control (back-pressure): fast producers are slowed to the consumer's pace. Similarly, reading an empty pipe blocks while writers remain.",
    optionExplanations: ["Correct.", "Pipes never silently drop data.", "The capacity is bounded.", "Nothing is killed."]
  },
  {
    id: "os-ipc-011", subject: "os", subtopic: "Inter-Process Communication", difficulty: "hard", type: "concept",
    question: "Several processes write log lines into the same pipe concurrently. Under what condition is each write guaranteed not to interleave with others?",
    options: ["Never", "When the writers use printf", "When the pipe is empty", "When each write() is at most PIPE_BUF bytes (4096 on Linux; POSIX requires at least 512): such writes are atomic"],
    answer: 3,
    explanation: "POSIX guarantees atomicity for pipe writes of up to PIPE_BUF bytes; larger writes may be split and interleaved with other writers' data. printf may itself split or merge writes depending on buffering, so the guarantee is about individual write() system calls.",
    optionExplanations: ["Small writes are atomic.", "stdio buffering doesn't guarantee atomic writes.", "Atomicity doesn't depend on the current contents.", "Correct."]
  },
  {
    id: "os-ipc-012", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "Two processes share a memory segment (shmget/shmat or mmap with MAP_SHARED) and both update a counter in it. What else do they need?",
    options: ["Nothing; shared memory is automatically synchronised", "A synchronisation mechanism (e.g. a process-shared semaphore or mutex, or atomic operations), because concurrent read-modify-write updates race", "A pipe between them", "Separate copies of the counter"],
    answer: 1,
    explanation: "The kernel sets up the shared mapping but doesn't mediate accesses, which is exactly why shared memory is fast. Correctness is the programmer's responsibility: POSIX named semaphores, pthread mutexes with PTHREAD_PROCESS_SHARED, or atomics.",
    optionExplanations: ["The kernel doesn't serialise memory accesses.", "Correct.", "A pipe isn't needed to share memory.", "Separate copies defeat the purpose."]
  },
  {
    id: "os-ipc-013", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "How do message queues (POSIX mq_* or System V msg*) differ from pipes?",
    options: ["They're identical", "Message queues work only within one process", "Message queues preserve message boundaries (each receive returns one whole message), can support priorities/types, and persist in the kernel independent of a particular process; pipes are unstructured byte streams", "Pipes support message priorities"],
    answer: 2,
    explanation: "With a pipe, two writes of 10 bytes may be read as one 20-byte chunk; the reader must frame messages itself. Message queues deliver discrete messages and let receivers pick by priority (POSIX) or type (System V).",
    optionExplanations: ["Their semantics differ.", "They're designed for communication between processes.", "Correct.", "Pipes are plain FIFO byte streams."]
  },
  {
    id: "os-ipc-014", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "What does `kill -TERM 1234` (or `kill 1234`) actually do?",
    options: ["It sends the SIGTERM signal to process 1234; the process may handle it (e.g. clean up and exit), ignore it, or be terminated by the default action", "It always terminates process 1234 immediately", "It deletes the program file", "It sends SIGKILL"],
    answer: 0,
    explanation: "Despite the name, kill sends any signal. SIGTERM politely asks a process to exit; use SIGKILL (-9) only as a last resort, since the process can't clean up (temporary files, locks, buffered data).",
    optionExplanations: ["Correct.", "SIGTERM can be caught.", "Files aren't affected.", "The default signal is SIGTERM."]
  },
  {
    id: "os-ipc-015", subject: "os", subtopic: "Inter-Process Communication", difficulty: "hard", type: "concept",
    question: "Why is calling printf() inside a signal handler considered unsafe?",
    options: ["Signals interrupt the program asynchronously; if the main code was inside printf (holding stdio locks or mid-update of its buffer), re-entering printf can deadlock or corrupt state. Only async-signal-safe functions (e.g. write(), _exit()) should be used, or just set a volatile sig_atomic_t flag", "printf is too slow", "Signal handlers can't produce output", "printf disables signals"],
    answer: 0,
    explanation: "POSIX lists async-signal-safe functions; malloc and stdio aren't among them. A common pattern is to set a flag in the handler and act on it in the main loop, or use signalfd/self-pipe tricks to turn signals into events.",
    optionExplanations: ["Correct.", "Speed isn't the issue.", "write() can be used safely.", "printf doesn't change signal masks."]
  },
  {
    id: "os-ipc-016", subject: "os", subtopic: "Inter-Process Communication", difficulty: "hard", type: "concept",
    question: "Five children exit at almost the same moment, but the parent's SIGCHLD handler (which calls wait() once) runs only twice. Why, and what's the fix?",
    options: ["Some children didn't really exit", "SIGCHLD can be caught only twice", "Standard signals aren't queued: while a SIGCHLD is pending, further SIGCHLDs merge into it. The handler should loop with waitpid(-1, &status, WNOHANG) until it returns 0 or -1, reaping every exited child", "wait() kills the remaining children"],
    answer: 2,
    explanation: "Each standard signal type is a single pending bit. Assuming one signal per event leaks zombies. (Real-time signals SIGRTMIN+n are queued, but SIGCHLD isn't.)",
    optionExplanations: ["They did exit; their signals merged.", "There's no such limit.", "Correct.", "wait() doesn't kill anything."],
    tags: ["trap"]
  },
  {
    id: "os-ipc-017", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "When would you choose Unix domain sockets over TCP sockets on 127.0.0.1 for communication between a web server and an application server on the same machine?",
    options: ["Never; they're identical", "Unix domain sockets avoid the TCP/IP stack (no checksums, routing or ports), so they're faster, and access can be controlled with file permissions; they only work locally", "Unix sockets work across the internet", "TCP is faster on the same machine"],
    answer: 1,
    explanation: "Unix domain sockets (AF_UNIX) are addressed by file system paths and support stream and datagram modes. They can even pass file descriptors between processes (SCM_RIGHTS). Databases (PostgreSQL, MySQL) and Docker's API commonly use them locally.",
    optionExplanations: ["They have different performance and features.", "Correct.", "They're limited to one host.", "Loopback TCP has more overhead."]
  },
  {
    id: "os-ipc-018", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "In message passing, what's the difference between direct and indirect communication?",
    options: ["Direct: processes name each other explicitly (send(P, msg), receive(Q, msg)); indirect: messages go through mailboxes/ports that several processes can share (send(mailbox, msg))", "Direct uses shared memory", "Indirect communication is always slower", "There's no difference"],
    answer: 0,
    explanation: "Indirect communication decouples senders from receivers: a mailbox can have multiple senders and receivers, and processes can be replaced without changing peers. Message queues and ports are mailbox implementations.",
    optionExplanations: ["Correct.", "Both are message passing.", "Performance depends on implementation.", "The naming schemes differ."]
  },
  {
    id: "os-ipc-019", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "What is a 'rendezvous' in message passing?",
    options: ["A shared memory region", "A broadcast to all processes", "Communication with blocking send AND blocking receive: the sender waits until the receiver takes the message, so the two processes synchronise at that point (zero-capacity buffer)", "A signal handler"],
    answer: 2,
    explanation: "Buffering choices: zero capacity (rendezvous — sender always blocks until received), bounded capacity (sender blocks only when the queue is full), unbounded capacity (sender never blocks). Non-blocking operations return immediately, possibly with no message.",
    optionExplanations: ["It's a synchronisation pattern in message passing.", "Rendezvous is point-to-point.", "Correct.", "Signals are a different mechanism."]
  },
  {
    id: "os-ipc-020", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "How do memory-mapped files (mmap) enable IPC?",
    options: ["They copy the file into each process separately", "Two processes mmap the same file with MAP_SHARED; both see each other's writes through the shared page cache, and the file provides persistence", "mmap only works for reading", "mmap sends messages through the kernel"],
    answer: 1,
    explanation: "The kernel maps the same physical pages (the file's page cache) into both address spaces. MAP_PRIVATE instead gives copy-on-write private copies. Synchronisation is still needed for concurrent updates.",
    optionExplanations: ["MAP_SHARED shares the same pages.", "Correct.", "Mappings can be writable.", "Accesses are ordinary memory loads/stores."]
  },
  {
    id: "os-ipc-021", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "How does a Remote Procedure Call (RPC) make a network call look like a local function call?",
    options: ["It sends the function's code to the server", "It uses shared memory across machines", "Client and server stubs marshal (serialise) arguments into a message, send it over the network, unmarshal it and call the real function on the server, then send the result back the same way", "It compiles both programs together"],
    answer: 2,
    explanation: "Frameworks like gRPC (Protocol Buffers over HTTP/2) and Thrift generate stubs from an interface definition. Unlike local calls, RPCs can fail partially, time out or be slow, so idempotency and retries matter.",
    optionExplanations: ["Only arguments and results travel.", "RPC uses messages over a network.", "Correct.", "The programs remain separate."]
  },
  {
    id: "os-ipc-022", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "numerical",
    question: "For the shell command `cat log.txt | grep ERROR | sort | uniq -c`, how many processes and how many pipes does the shell create?",
    options: ["4 processes, 4 pipes", "3 processes, 4 pipes", "1 process, 3 pipes", "4 processes, 3 pipes"],
    answer: 3,
    explanation: "Each command runs in its own process (n = 4), and each '|' connects one process's stdout to the next's stdin with a pipe (n − 1 = 3). The shell uses dup2() to wire the pipe ends to file descriptors 0 and 1 before exec.",
    optionExplanations: ["There are only three '|' symbols.", "Four commands need four processes and three pipes.", "Each command is a separate process.", "Correct."]
  },
  {
    id: "os-ipc-023", subject: "os", subtopic: "Inter-Process Communication", difficulty: "hard", type: "concept",
    question: "To implement `ls | wc -l`, the child running ls must send its standard output into the pipe. Which call does it make before exec?",
    options: ["dup2(STDOUT_FILENO, fd[1])", "pipe(STDOUT_FILENO)", "close(fd[1])", "dup2(fd[1], STDOUT_FILENO), then close the original pipe descriptors"],
    answer: 3,
    explanation: "dup2(oldfd, newfd) makes newfd refer to the same open file as oldfd. After dup2(fd[1], 1), anything ls writes to stdout goes into the pipe. The child then closes fd[0] and fd[1] (no longer needed) so EOF works correctly for wc.",
    optionExplanations: ["The argument order is reversed.", "pipe() creates new pipes; it doesn't redirect.", "Closing the write end would disconnect it.", "Correct."]
  },
  {
    id: "os-ipc-024", subject: "os", subtopic: "Inter-Process Communication", difficulty: "easy", type: "concept",
    question: "Which IPC mechanism is the natural choice for processes running on DIFFERENT machines?",
    options: ["Anonymous pipes", "Sockets (TCP/UDP), or higher-level protocols built on them (HTTP, gRPC, message brokers)", "Shared memory segments", "Signals"],
    answer: 1,
    explanation: "Pipes, shared memory and signals are local to one kernel. Network sockets carry messages between hosts; message brokers (Kafka, RabbitMQ) add queuing and durability.",
    optionExplanations: ["Pipes are local.", "Correct.", "Shared memory is local.", "Signals are local."]
  },
  {
    id: "os-ipc-025", subject: "os", subtopic: "Inter-Process Communication", difficulty: "hard", type: "concept",
    question: "A producer and consumer exchange messages through a bounded buffer of capacity 5 with blocking send/receive. The producer sends 8 messages quickly while the consumer hasn't started yet. What happens?",
    options: ["All 8 are buffered", "The first 5 messages are buffered; the producer blocks on the 6th send until the consumer receives at least one message", "Messages 6–8 are dropped", "The producer receives an error immediately"],
    answer: 1,
    explanation: "With bounded capacity, send blocks when the buffer is full and receive blocks when it's empty. This back-pressure keeps memory bounded. An unbounded buffer would accept all 8; a zero-capacity (rendezvous) channel would block on the very first send.",
    optionExplanations: ["The capacity is only 5.", "Correct.", "Blocking semantics don't drop messages.", "Blocking sends wait rather than fail."]
  },
  {
    id: "os-ipc-026", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "What is the default action of most signals (e.g. SIGTERM, SIGINT) if the process hasn't installed a handler?",
    options: ["Ignore the signal", "Restart the process", "Pause the process", "Terminate the process (some, like SIGSEGV and SIGQUIT, also dump core; SIGCHLD is ignored by default; SIGSTOP stops; SIGCONT continues)"],
    answer: 3,
    explanation: "Each signal has a default disposition: terminate, terminate + core dump, ignore, stop or continue. sigaction() installs a handler or sets SIG_IGN / SIG_DFL. Handlers are reset to default after exec().",
    optionExplanations: ["Only a few signals are ignored by default.", "Signals don't restart processes.", "Only stop signals pause a process.", "Correct."]
  },
  {
    id: "os-ipc-027", subject: "os", subtopic: "Inter-Process Communication", difficulty: "hard", type: "concept",
    question: "Which IPC mechanism would you pick to stream 2 GB video frames per second between two processes on one machine with minimal copying?",
    options: ["A pipe, because it's simplest", "A TCP socket over loopback", "Signals carrying the data", "Shared memory (e.g. a ring buffer in a shared mmap region) with lightweight synchronisation, because data isn't copied through the kernel for each transfer"],
    answer: 3,
    explanation: "Pipes and sockets copy data from the writer into the kernel and again into the reader: two copies plus system calls per chunk. Shared memory lets both processes access the same pages, so only small control messages (indices, semaphores) need synchronisation.",
    optionExplanations: ["Pipes add copies and syscalls per chunk.", "Loopback TCP copies data and adds protocol overhead.", "Signals carry no payload (beyond a small integer for real-time signals).", "Correct."]
  },
  {
    id: "os-ipc-028", subject: "os", subtopic: "Inter-Process Communication", difficulty: "medium", type: "concept",
    question: "Ctrl+Z in a terminal sends which signal, and how do you resume the job?",
    options: ["SIGKILL; it can't be resumed", "SIGTSTP (terminal stop); resume with `fg` (foreground) or `bg` (background), which send SIGCONT", "SIGINT; restart the program", "SIGHUP; reconnect the terminal"],
    answer: 1,
    explanation: "SIGTSTP stops the foreground process group (it can be caught, unlike SIGSTOP). Shell job control then uses SIGCONT to continue it. Ctrl+C sends SIGINT and Ctrl+\\ sends SIGQUIT.",
    optionExplanations: ["Ctrl+Z doesn't kill the process.", "Correct.", "That's Ctrl+C.", "SIGHUP is sent when a terminal closes."]
  }
);
