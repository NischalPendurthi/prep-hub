/* Operating Systems — Processes & fork() */
window.QUESTIONS.push(
  {
    id: "os-proc-001", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "concept",
    question: "What is the difference between a program and a process?",
    options: ["A program is a passive executable file on disk; a process is a program in execution, with its own address space, registers, program counter, open files and other OS state", "They are the same", "A process is stored on disk; a program lives in memory", "A program can have only one process"],
    answer: 0,
    explanation: "Running the same program twice (two terminals running vim) creates two independent processes from one executable, each with separate memory and state managed through its own PCB.",
    optionExplanations: ["Correct.", "One is static, the other is an active entity.", "Reversed.", "Many processes can run the same program."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-002", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "concept",
    question: "In a process's memory layout, where are these stored: (1) a global `int count = 5;`, (2) a global `int buf[100];` (uninitialised), (3) memory from malloc(), (4) a local variable inside a function?",
    options: ["(1) data segment, (2) BSS, (3) heap, (4) stack", "(1) stack, (2) heap, (3) data, (4) BSS", "(1) text, (2) data, (3) stack, (4) heap", "All on the heap"],
    answer: 0,
    explanation: "Typical layout from low to high addresses: text (code, read-only), data (initialised globals/statics), BSS (zero-initialised globals/statics, not stored in the file), heap (grows upward via brk/mmap), and the stack (grows downward, holding frames with locals and return addresses).",
    optionExplanations: ["Correct.", "Locals live on the stack and malloc memory on the heap.", "Text holds code, not variables.", "Each kind of data has its own region."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-003", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "concept",
    question: "Which information is stored in a Process Control Block (PCB)?",
    options: ["Process state, PID, program counter and saved CPU registers, scheduling info (priority, queues), memory-management info (page tables), open-file table, accounting info and parent/child links", "Only the program's source code", "Only the process name", "The contents of the process's heap"],
    answer: 0,
    explanation: "The PCB (task_struct in Linux) is the kernel's record of a process. During a context switch, the kernel saves the running process's CPU state into its PCB and restores the next process's state from its PCB.",
    optionExplanations: ["Correct.", "Code lives in the address space, not the PCB.", "Much more is tracked.", "The heap is part of the address space, not the PCB."]
  },
  {
    id: "os-proc-004", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "concept",
    question: "Which is the standard five-state process model?",
    options: ["New, Ready, Running, Waiting (Blocked), Terminated", "Start, Run, Stop", "Created, Sleeping, Zombie", "Active, Passive"],
    answer: 0,
    explanation: "New → (admitted) Ready → (dispatched) Running. Running can go to Ready (preempted/time slice over), Waiting (I/O or event wait) or Terminated (exit). Waiting → Ready when the event completes.",
    optionExplanations: ["Correct.", "That's not the standard model.", "These are some Linux states, not the textbook model.", "Too coarse."]
  },
  {
    id: "os-proc-005", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "Which process state transition is NOT possible in the standard model?",
    options: ["Running → Ready", "Running → Waiting", "Waiting → Running", "Waiting → Ready"],
    answer: 2,
    explanation: "When a waiting process's event completes, it becomes READY; only the dispatcher can move a ready process to running. Ready → Waiting is also impossible: a process must be running to request I/O.",
    optionExplanations: ["Happens on preemption or timer expiry.", "Happens when the process requests I/O.", "Correct.", "Happens when the awaited event completes."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-006", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "Which scheduler controls the DEGREE OF MULTIPROGRAMMING by deciding which jobs are admitted into memory?",
    options: ["Short-term (CPU) scheduler", "I/O scheduler", "Medium-term scheduler", "Long-term (job) scheduler"],
    answer: 3,
    explanation: "The long-term scheduler admits new jobs into the ready pool (more important in batch systems). The short-term scheduler picks the next ready process for the CPU many times per second. The medium-term scheduler swaps processes out to disk (suspend) and back to reduce memory pressure.",
    optionExplanations: ["It chooses among processes already in memory.", "It orders disk requests.", "It temporarily removes processes via swapping, but admission is the long-term scheduler's job.", "Correct."]
  },
  {
    id: "os-proc-007", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "What do the 'Ready-Suspended' and 'Blocked-Suspended' states represent?",
    options: ["Processes that have crashed", "Processes waiting for the CPU in a ready queue", "Processes swapped out of main memory to disk by the medium-term scheduler, either ready to run (once brought back) or still waiting for an event", "Zombie processes"],
    answer: 2,
    explanation: "The seven-state model adds suspension to relieve memory pressure. A blocked-suspended process whose event occurs becomes ready-suspended; it must be swapped back in before it can be dispatched.",
    optionExplanations: ["Crashed processes terminate.", "That's the normal Ready state.", "Correct.", "Zombies have terminated."]
  },
  {
    id: "os-proc-008", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "What happens during a context switch, and why is it considered pure overhead?",
    options: ["The process is restarted from the beginning", "The process is copied to a new CPU", "The kernel saves the running process's CPU state (registers, PC, stack pointer) into its PCB, chooses the next process, restores that process's state and switches its address space; no user work is done during this time, and caches/TLB entries become cold", "Files are closed and reopened"],
    answer: 2,
    explanation: "Context-switch time (typically a few microseconds, plus indirect cache/TLB effects) is wasted from the application's point of view. Very small time quanta in Round Robin increase the fraction of time spent switching.",
    optionExplanations: ["Processes resume where they left off.", "Migration is a separate concept.", "Correct.", "Open files stay open."]
  },
  {
    id: "os-proc-009", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "concept",
    question: "What does fork() return?",
    options: ["The child's PID in both processes", "The parent's PID in the child", "1 in the child and 0 in the parent", "0 in the child, the child's PID in the parent, and -1 in the parent if creation failed"],
    answer: 3,
    explanation: "fork() is called once but returns twice: once in each process. Code typically branches on the value: `if (pid == 0) { /* child */ } else if (pid > 0) { /* parent */ } else { /* error */ }`. The child can get its parent's PID with getppid().",
    optionExplanations: ["The child receives 0.", "The child gets 0; it uses getppid() for the parent's PID.", "Reversed and incorrect values.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-010", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "code-output",
    question: "How many times is \"hi\" printed?",
    code: "#include <stdio.h>\n#include <unistd.h>\n\nint main(void) {\n    fork();\n    fork();\n    fork();\n    printf(\"hi\\n\");\n    return 0;\n}",
    options: ["3", "6", "7", "8"],
    answer: 3,
    explanation: "Each fork() doubles the number of processes executing the following code: 1 → 2 → 4 → 8. All 8 processes reach printf. In general, n sequential forks produce 2ⁿ processes (2ⁿ − 1 of them new children).",
    optionExplanations: ["Each fork doubles, not adds one.", "Processes multiply, not add.", "7 is the number of CHILD processes created.", "Correct: 2³ = 8."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-011", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "code-output",
    question: "How many child processes are created (not counting the original process)?",
    code: "for (int i = 0; i < 4; i++)\n    fork();",
    options: ["4", "8", "15", "16"],
    answer: 2,
    explanation: "Every process alive at each iteration forks, so the total doubles 4 times: 2⁴ = 16 processes in total, of which 16 − 1 = 15 are newly created children.",
    optionExplanations: ["Every existing process forks each iteration, not just the original.", "That's 2³.", "Correct.", "16 includes the original process."]
  },
  {
    id: "os-proc-012", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "code-output",
    question: "With stdout connected to a terminal (line-buffered), how many times is \"x\" printed?",
    code: "for (int i = 0; i < 3; i++) {\n    fork();\n    printf(\"x\\n\");\n}",
    options: ["3", "8", "14", "24"],
    answer: 2,
    explanation: "After the 1st fork there are 2 processes (2 prints), after the 2nd 4 (4 prints), after the 3rd 8 (8 prints): 2 + 4 + 8 = 14. With a terminal, each line is flushed immediately, so nothing is duplicated by later forks. (If stdout were redirected to a file, buffered lines would be copied into children and you'd see 24.)",
    optionExplanations: ["The number of processes grows each iteration.", "That counts only the final processes' last print.", "Correct.", "That's the result when output is fully buffered (redirected to a file/pipe)."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-013", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "code-output",
    question: "How many processes print \"p\" (including the original)?",
    code: "if (fork() && fork())\n    fork();\nprintf(\"p\\n\");",
    options: ["3", "8", "5", "4"],
    answer: 3,
    explanation: "&& short-circuits. Original P: first fork() creates C1 and returns non-zero in P. In C1 the first fork() returned 0, so && stops: C1 skips the body. P evaluates the second fork(), creating C2 (which gets 0 → skips the body); P gets non-zero → enters the body and forks C3. Processes: P, C1, C2, C3 = 4.",
    optionExplanations: ["The body's fork() adds one more process.", "Short-circuiting stops several forks.", "That's the count for fork() || fork() variants.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "os-proc-014", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "code-output",
    question: "How many processes print \"p\" (including the original)?",
    code: "if (fork() || fork())\n    fork();\nprintf(\"p\\n\");",
    options: ["4", "8", "6", "5"],
    answer: 3,
    explanation: "With ||, evaluation stops when the left side is true (non-zero). P: fork() → creates C1, returns non-zero → condition true → P forks C3 in the body. C1: first fork() returned 0, so it evaluates the second fork() → creates C2; C1 gets non-zero → true → C1 forks C4. C2: second fork() returned 0 → false → skips the body. Total: P, C1, C2, C3, C4 = 5.",
    optionExplanations: ["The || version creates one more process than the && version.", "Short-circuiting prevents a full doubling.", "Only five processes exist.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "os-proc-015", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "code-output",
    question: "What does this program print?",
    code: "int x = 5;\nif (fork() == 0) {\n    x++;\n    printf(\"child %d\\n\", x);\n    exit(0);\n}\nwait(NULL);\nprintf(\"parent %d\\n\", x);",
    options: ["child 6, then parent 6", "child 5, then parent 6", "child 6, then parent 5", "parent 5, then child 6"],
    answer: 2,
    explanation: "After fork, the child has its OWN copy of the address space (implemented with copy-on-write). Incrementing x in the child doesn't affect the parent's x. wait(NULL) makes the parent print only after the child has finished.",
    optionExplanations: ["Processes don't share variables after fork.", "The child increments its own copy to 6.", "Correct.", "wait() forces the parent to print after the child."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-016", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "code-output",
    question: "How many times does \"A\" appear in the output?",
    code: "printf(\"A\");      /* note: no newline */\nfork();\nprintf(\"B\\n\");",
    options: ["1", "It depends on which process runs first", "0", "2"],
    answer: 3,
    explanation: "printf only copies \"A\" into the user-space stdio buffer; without a newline (or fflush) it isn't written before fork(). fork() duplicates the whole address space including that unflushed buffer, so each process later flushes \"AB\\n\": the output is AB twice. Call fflush(stdout) before forking to avoid this.",
    optionExplanations: ["The unflushed buffer is copied into the child.", "The count is 2 regardless of order.", "Each process prints its buffered A.", "Correct."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "os-proc-017", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "code-output",
    question: "The program runs as `./a.out > out.txt` (stdout redirected to a file). How many lines containing \"A\" does out.txt contain?",
    code: "printf(\"A\\n\");\nfork();\n/* both processes return from main normally */",
    options: ["1", "0", "2", "Unpredictable"],
    answer: 2,
    explanation: "On a terminal stdout is LINE-buffered, so \"A\\n\" is written immediately and appears once. Redirected to a file or pipe, stdout is FULLY buffered: \"A\\n\" still sits in the buffer at fork(), gets copied into the child, and both processes flush it at exit → 2 lines. The same program behaves differently depending on where output goes.",
    optionExplanations: ["That's the terminal behaviour.", "The line is printed at least once.", "Correct.", "The result is deterministic: 2."],
    tags: ["trap"]
  },
  {
    id: "os-proc-018", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "code-output",
    question: "Including the original, how many processes exist in total (and print \"p\")?",
    code: "for (int i = 0; i < 4; i++)\n    if (fork() == 0)\n        break;\nprintf(\"p\\n\");",
    options: ["4", "8", "16", "5"],
    answer: 3,
    explanation: "Each child breaks out of the loop immediately, so only the ORIGINAL process keeps forking: it creates 4 children (a 'fan' instead of a tree). 1 parent + 4 children = 5 processes, each printing once.",
    optionExplanations: ["The parent prints too.", "Only the parent forks.", "Children don't continue the loop.", "Correct."]
  },
  {
    id: "os-proc-019", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "code-output",
    question: "stdout is a terminal (line-buffered). How many times is \"c\" printed?",
    code: "for (int i = 0; i < 2; i++) {\n    if (fork() == 0)\n        printf(\"c\\n\");\n}",
    options: ["2", "3", "4", "1"],
    answer: 1,
    explanation: "i = 0: P forks C1, which prints c. i = 1: both P and C1 fork again: P's child C2 prints c, and C1's child C3 prints c. Total 3. (C1 continues the loop because there's no exit/break.) With fully-buffered output (redirected), C3 would inherit C1's unflushed \"c\" and you'd see 4.",
    optionExplanations: ["C1 also forks in the second iteration.", "Correct.", "That's the redirected-output count.", "More than one child prints."],
    tags: ["trap"]
  },
  {
    id: "os-proc-020", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "code-output",
    question: "Each process prints its final n. How many processes print the value 2?",
    code: "int n = 0;\nfor (int i = 0; i < 3; i++)\n    if (fork() == 0)\n        n++;\nprintf(\"%d\\n\", n);",
    options: ["1", "2", "3", "4"],
    answer: 2,
    explanation: "There are 2³ = 8 processes. Each process's n counts how many of the 3 fork() calls returned 0 in its own history (i.e. how many times it was the child). The counts follow C(3, k): one process with 0, three with 1, three with 2, one with 3.",
    optionExplanations: ["Only the 'child every time' process has 3.", "Count combinations: C(3, 2) = 3.", "Correct.", "Only 8 processes exist in total: 1 + 3 + 3 + 1."]
  },
  {
    id: "os-proc-021", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "code-output",
    question: "Which lines are printed (in any order)?",
    code: "if (fork() == 0) {\n    if (fork() == 0) printf(\"G\\n\");\n    else            printf(\"C\\n\");\n} else {\n    printf(\"P\\n\");\n}",
    options: ["P only", "P, C and G (one each)", "P and C only", "G only"],
    answer: 1,
    explanation: "The parent takes the else branch and prints P. The child forks again: its child (the grandchild) gets 0 and prints G, and the child itself prints C. Three processes, three lines; the order between them isn't guaranteed without wait().",
    optionExplanations: ["The child and grandchild also print.", "Correct.", "The grandchild prints G.", "The parent and child print too."]
  },
  {
    id: "os-proc-022", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "Why is fork() usually cheap even for a process using 2 GB of memory?",
    options: ["Copy-on-write: the child initially shares the parent's physical pages marked read-only; a page is copied only when either process writes to it", "fork() shares all memory permanently", "fork() doesn't copy page tables", "The child gets no memory until exec()"],
    answer: 0,
    explanation: "With COW, fork() copies page tables and kernel structures, not data. If the child immediately calls exec(), almost nothing is ever copied. Pages written later trigger a page fault and a private copy.",
    optionExplanations: ["Correct.", "Writes produce private copies, so memory isn't shared permanently.", "Page tables are duplicated (and pages marked read-only).", "The child has the parent's address space immediately."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-023", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "code-output",
    question: "Assuming /bin/ls exists and execl succeeds, what does the process print besides the directory listing?",
    code: "printf(\"before\\n\");\nexecl(\"/bin/ls\", \"ls\", NULL);\nprintf(\"after\\n\");",
    options: ["before and after", "after only", "before only", "Nothing"],
    answer: 2,
    explanation: "exec() replaces the calling process's program image (code, data, stack) with a new program; on success it never returns, so code after it never runs. The PID stays the same and open file descriptors are inherited (unless close-on-exec). 'after' prints only if exec fails. (Assume stdout is a terminal so 'before' is flushed.)",
    optionExplanations: ["exec doesn't return on success.", "'before' runs before exec.", "Correct.", "'before' is printed first."]
  },
  {
    id: "os-proc-024", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "concept",
    question: "How does a Unix shell typically run the command `ls -l`?",
    options: ["It calls exec() directly in the shell process", "It asks the kernel to open a new terminal", "It creates a thread", "It calls fork() to create a child, the child calls exec() to run ls, and the shell calls wait()/waitpid() for the child to finish"],
    answer: 3,
    explanation: "The fork-exec-wait pattern keeps the shell alive (exec without fork would replace the shell itself). Between fork and exec, the child can set up redirections and pipes (dup2), which is how `ls > out.txt` works. Appending & skips the wait (background job).",
    optionExplanations: ["That would replace the shell.", "No new terminal is needed.", "Shells run commands as separate processes.", "Correct."]
  },
  {
    id: "os-proc-025", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "concept",
    question: "What is a zombie process?",
    options: ["A process consuming 100% CPU", "A process that has terminated but whose parent hasn't yet collected its exit status with wait(); it keeps a process-table entry (PID and exit status) but no memory", "A process whose parent has died", "A process stuck in an infinite loop"],
    answer: 1,
    explanation: "Zombies (state Z, '<defunct>' in ps) are removed once the parent calls wait/waitpid. Many zombies can exhaust PIDs. If the parent itself dies, init/systemd adopts and reaps them. Handling SIGCHLD or setting SIGCHLD to SIG_IGN avoids accumulating zombies.",
    optionExplanations: ["That's a busy process.", "Correct.", "That's an orphan.", "That's a runaway process."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-026", subject: "os", subtopic: "Processes & fork()", difficulty: "easy", type: "concept",
    question: "What happens to an orphan process (one whose parent exits while it's still running)?",
    options: ["It's killed immediately", "It's adopted by init (PID 1) or a designated subreaper, which will reap it when it terminates", "It becomes a zombie forever", "It's paused until the parent restarts"],
    answer: 1,
    explanation: "Orphans keep running normally; only their parent changes (getppid() now returns 1 or the subreaper's PID). Daemons are often created intentionally as orphans (double fork) so they detach from the terminal.",
    optionExplanations: ["Orphans continue running.", "Correct.", "Its new parent reaps it when it exits.", "Parents don't restart."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-proc-027", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "code-output",
    question: "What is the state of the child between its exit and the parent's wait(), and what does the output order look like?",
    code: "pid_t p = fork();\nif (p == 0) { printf(\"A\\n\"); exit(0); }\nsleep(10);           /* child is <defunct> during this time */\nwait(NULL);\nprintf(\"B\\n\");",
    options: ["Zombie; A then B", "Orphan; B then A", "Running; order varies", "Stopped; B then A"],
    answer: 0,
    explanation: "The child prints A and exits immediately, but the parent doesn't reap it for 10 seconds, so it's a zombie during that time. wait() collects the exit status (removing the zombie), and then the parent prints B.",
    optionExplanations: ["Correct.", "The parent is alive, so the child isn't an orphan.", "The child has already exited.", "The child isn't stopped by a signal."]
  },
  {
    id: "os-proc-028", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "What is the difference between wait() and waitpid()?",
    options: ["wait() blocks until ANY child terminates; waitpid(pid, &status, options) can wait for a specific child and supports options like WNOHANG (return immediately if no child has exited)", "They're identical", "waitpid() kills the child", "wait() works only for zombies"],
    answer: 0,
    explanation: "Both return the reaped child's PID and fill an exit status, decoded with WIFEXITED/WEXITSTATUS (normal exit code) or WIFSIGNALED/WTERMSIG (killed by a signal). Non-blocking WNOHANG is handy in SIGCHLD handlers and event loops.",
    optionExplanations: ["Correct.", "waitpid is more flexible.", "Neither kills anything.", "wait blocks for a running child to finish too."]
  },
  {
    id: "os-proc-029", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "How do CPU-bound and I/O-bound processes differ, and why does the scheduler care?",
    options: ["CPU-bound processes have long CPU bursts and rarely block; I/O-bound processes have short CPU bursts between frequent I/O waits. Favouring I/O-bound processes keeps devices busy and interactive programs responsive, while CPU-bound ones soak up the remaining CPU time", "They differ only in memory usage", "I/O-bound processes never use the CPU", "Schedulers treat them identically"],
    answer: 0,
    explanation: "A good process mix keeps both the CPU and I/O devices busy. Multilevel feedback queues naturally detect this: processes that use their whole quantum sink to lower priority (CPU-bound), while those that block early stay high (interactive/I/O-bound).",
    optionExplanations: ["Correct.", "Their CPU burst patterns differ.", "They use the CPU briefly between I/O.", "Many schedulers adapt to burst behaviour."]
  },
  {
    id: "os-proc-030", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "code-output",
    question: "Each process forks one child and waits for it before exiting, forming a chain. With a terminal as stdout, how many times is \"x\" printed?",
    code: "for (int i = 0; i < 3; i++) {\n    if (fork() == 0) {\n        printf(\"x\\n\");     /* child: continue the loop */\n    } else {\n        wait(NULL);\n        break;             /* parent: stop forking */\n    }\n}",
    options: ["3", "7", "8", "14"],
    answer: 0,
    explanation: "Each parent forks once and then breaks; only the newest child continues the loop. This creates a chain P → C1 → C2 → C3, and each child prints once: 3 lines.",
    optionExplanations: ["Correct.", "Parents stop after one fork, so there's no doubling.", "Only 4 processes exist.", "Forking stops for each parent after one child."]
  },
  {
    id: "os-proc-031", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "What does vfork() do differently from fork()?",
    options: ["It creates a thread", "It doesn't create a new PID", "It copies memory eagerly", "It creates a child that SHARES the parent's address space and suspends the parent until the child calls exec() or _exit(); it's meant only for an immediate exec"],
    answer: 3,
    explanation: "vfork predates copy-on-write and avoids copying page tables. The child must not modify memory or return from the calling function. With modern COW fork() (and posix_spawn), vfork is rarely needed.",
    optionExplanations: ["The child is a separate process.", "The child gets its own PID.", "It copies nothing at all.", "Correct."]
  },
  {
    id: "os-proc-032", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "In a terminal, the process with PID 4200 runs a program that calls getpid() and getppid(). If the shell's PID is 4100 and the program was started from that shell, what do they return?",
    options: ["4100 and 4200", "4200 and 4100", "4200 and 1", "1 and 4200"],
    answer: 1,
    explanation: "getpid() returns the caller's PID; getppid() returns the PID of its parent — here the shell that forked it. If the shell exited first, getppid() would report init (1) or a subreaper.",
    optionExplanations: ["Reversed.", "Correct.", "The parent shell is still alive.", "The program isn't init."]
  },
  {
    id: "os-proc-033", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "What is cascading termination?",
    options: ["A process killing itself repeatedly", "Some systems terminate all of a process's children (and their descendants) when the parent terminates", "Restarting all processes after a crash", "Running processes in a pipeline"],
    answer: 1,
    explanation: "Some OSes enforce that children can't outlive their parent. Unix doesn't by default (orphans are re-parented), but closing a terminal sends SIGHUP to its session's processes, which often terminates them — hence nohup or daemonising for long-running jobs.",
    optionExplanations: ["That's not the concept.", "Correct.", "That's recovery, not cascading termination.", "Pipelines are unrelated."]
  },
  {
    id: "os-proc-034", subject: "os", subtopic: "Processes & fork()", difficulty: "medium", type: "concept",
    question: "What is a daemon process?",
    options: ["A malicious process", "A long-running background process with no controlling terminal that provides a service (e.g. sshd, cron, nginx), usually started at boot", "A zombie process", "A process with PID 0"],
    answer: 1,
    explanation: "Classic daemonisation: fork and let the parent exit, call setsid() to start a new session without a terminal, fork again, change directory to /, reset umask and redirect stdio. Today systemd usually manages services without self-daemonising.",
    optionExplanations: ["Daemons are ordinary services.", "Correct.", "Zombies have terminated.", "PID 0 is the kernel's idle/swapper task."]
  },
  {
    id: "os-proc-035", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "numerical",
    question: "A process creation tree: P forks 3 children; each child forks 2 children; each grandchild forks 1 child. How many processes are there in total (including P)?",
    options: ["10", "16", "12", "7"],
    answer: 1,
    explanation: "Level 0: 1 (P). Level 1: 3 children. Level 2: 3 × 2 = 6 grandchildren. Level 3: 6 × 1 = 6 great-grandchildren. Total = 1 + 3 + 6 + 6 = 16.",
    optionExplanations: ["That omits the last level.", "Correct.", "Recount each level: 1 + 3 + 6 + 6.", "That only adds the branching factors."]
  },
  {
    id: "os-proc-036", subject: "os", subtopic: "Processes & fork()", difficulty: "hard", type: "concept",
    question: "In C, a static local variable (`static int calls = 0;`) inside a function and a string literal (\"hello\") are stored where?",
    options: ["Both on the stack", "The static variable in the data/BSS segment (it persists across calls; here BSS since it's zero-initialised); the string literal in a read-only data section near the text segment", "Both on the heap", "The static variable on the stack; the literal on the heap"],
    answer: 1,
    explanation: "'static' gives a local variable static storage duration: it lives for the whole program, initialised once. Zero-initialised statics go to BSS, others to data. String literals are read-only (writing to one is undefined behaviour and usually segfaults).",
    optionExplanations: ["Stack variables disappear when the function returns.", "Correct.", "Neither is dynamically allocated.", "Static locals aren't on the stack."]
  }
);
