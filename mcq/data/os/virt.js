/* Operating Systems — Virtualization & Linux */
window.QUESTIONS.push(
  {
    id: "os-virt-001", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "What is a hypervisor (virtual machine monitor)?",
    options: ["A faster CPU", "A container runtime", "Software (or firmware) that creates and runs virtual machines, multiplexing physical CPU, memory and devices among several guest operating systems while isolating them", "A type of file system"],
    answer: 2,
    explanation: "Each VM believes it owns a full machine and runs its own kernel. The hypervisor intercepts privileged operations and maps virtual hardware to real hardware.",
    optionExplanations: ["It's software.", "Containers share the host kernel; hypervisors run whole OSes.", "Correct.", "It's unrelated to file systems."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-virt-002", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "What's the difference between Type 1 and Type 2 hypervisors?",
    options: ["Type 1 runs inside a browser", "Type 2 is always faster", "Type 1 (bare-metal: VMware ESXi, Xen, Hyper-V, KVM) runs directly on the hardware; Type 2 (hosted: VirtualBox, VMware Workstation) runs as an application on top of a conventional host OS", "They're the same"],
    answer: 2,
    explanation: "Type 1 hypervisors have less overhead and are used in data centres and clouds. Type 2 is convenient on desktops. KVM turns the Linux kernel itself into a Type 1 hypervisor.",
    optionExplanations: ["Neither runs in a browser.", "Type 2 adds a host-OS layer.", "Correct.", "Their placement differs."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-virt-003", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "How do full virtualization, paravirtualization and hardware-assisted virtualization differ?",
    options: ["They're identical", "Paravirtualization needs no guest changes", "Full: unmodified guest OS, privileged instructions trapped/translated (e.g. binary translation). Para: guest kernel is modified to call the hypervisor directly (hypercalls), reducing overhead. Hardware-assisted: CPU extensions (Intel VT-x, AMD-V) let unmodified guests run with efficient trapping", "Hardware-assisted virtualization requires a modified guest"],
    answer: 2,
    explanation: "Classic x86 wasn't easily virtualizable (some sensitive instructions didn't trap), hence binary translation and paravirtualization (Xen). VT-x/AMD-V and nested page tables (EPT/NPT) made efficient full virtualization standard; paravirtual device drivers (virtio) remain common for I/O speed.",
    optionExplanations: ["They take different approaches.", "Paravirtualization requires guest modifications.", "Correct.", "Hardware assistance lets unmodified guests run."]
  },
  {
    id: "os-virt-004", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "What is the key architectural difference between containers and virtual machines?",
    options: ["Containers share the host's kernel and isolate processes using kernel features, so they start in milliseconds and use little overhead; VMs each run a full guest OS kernel on virtualised hardware, giving stronger isolation at higher cost", "Containers are just smaller VMs with their own kernels", "VMs share the host kernel", "Containers require a hypervisor"],
    answer: 0,
    explanation: "Because containers share the kernel, a Linux container can't run a Windows kernel, and a kernel vulnerability can affect all containers. VMs provide stronger security boundaries; lightweight VMs (Firecracker, Kata) combine both ideas.",
    optionExplanations: ["Correct.", "Containers don't have their own kernels.", "Each VM has its own kernel.", "Containers run on the host kernel directly."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-virt-005", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "Which two Linux kernel features are the foundation of containers (Docker, Kubernetes pods)?",
    options: ["Pipes and signals", "Namespaces (isolating what a process can SEE: PIDs, mounts, network, users, hostnames) and cgroups (limiting what it can USE: CPU, memory, I/O)", "Inodes and journaling", "Paging and swapping"],
    answer: 1,
    explanation: "A process in a new PID namespace sees itself as PID 1; a network namespace gives it its own interfaces; cgroups cap its memory so it gets OOM-killed instead of starving the host. Seccomp and capabilities further restrict system calls and privileges.",
    optionExplanations: ["Those are IPC mechanisms.", "Correct.", "Those are file-system features.", "Those are memory-management features."]
  },
  {
    id: "os-virt-006", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "In Docker, what's the difference between an image and a container?",
    options: ["An image is a read-only template made of stacked layers (filesystem + metadata); a container is a running (or stopped) instance of an image with its own thin writable layer on top", "They're the same thing", "A container is stored in a registry; an image runs", "Images are virtual machines"],
    answer: 0,
    explanation: "Many containers can run from one image. Layers are shared and cached (each Dockerfile instruction typically creates a layer), which makes builds and pulls efficient. Changes inside a container are lost when it's removed unless stored in volumes.",
    optionExplanations: ["Correct.", "One is a template, the other an instance.", "Images live in registries; containers run.", "Images aren't VMs."]
  },
  {
    id: "os-virt-007", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "What is a Kubernetes Pod?",
    options: ["A virtual machine", "A cluster of nodes", "The smallest deployable unit: one or more tightly coupled containers scheduled together on one node, sharing a network namespace (same IP/port space) and optionally volumes", "A Docker image"],
    answer: 2,
    explanation: "Kubernetes schedules Pods onto nodes, restarts failed ones and scales them via controllers (Deployments, StatefulSets). Sidecar containers (e.g. logging, proxies) share the Pod's network with the main container.",
    optionExplanations: ["Pods run containers, not VMs.", "That's the cluster.", "Correct.", "Images are templates for containers."]
  },
  {
    id: "os-virt-008", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "Which `ls` option shows hidden files (names starting with '.') in long format?",
    options: ["ls -la", "ls -h", "ls -r", "ls -1"],
    answer: 0,
    explanation: "-l gives the long listing (permissions, links, owner, size, date) and -a includes hidden entries like .bashrc, '.' and '..'. -h makes sizes human-readable, -r reverses the order, -1 lists one name per line.",
    optionExplanations: ["Correct.", "-h only formats sizes.", "-r reverses the sort order.", "-1 prints one entry per line."]
  },
  {
    id: "os-virt-009", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "code-output",
    question: "fruits.txt contains the lines: apple, banana, apple, cherry, banana, apple. What does this pipeline print?",
    code: "sort fruits.txt | uniq -c | sort -rn | head -1",
    options: ["3 apple", "apple 3", "2 banana", "1 cherry"],
    answer: 0,
    explanation: "sort groups identical lines together; uniq -c collapses adjacent duplicates and prefixes counts; sort -rn sorts numerically in reverse (highest count first); head -1 takes the top line. This is the classic 'most frequent line' one-liner.",
    optionExplanations: ["Correct.", "uniq -c puts the count first.", "banana appears twice, apple three times.", "That's the least frequent."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-virt-010", subject: "os", subtopic: "Virtualization & Linux", difficulty: "hard", type: "code-output",
    question: "fruits.txt contains (unsorted): apple, banana, apple, cherry, banana, apple. What do these print?",
    code: "uniq fruits.txt | wc -l\nsort -u fruits.txt | wc -l",
    options: ["3 and 3", "6 and 6", "3 and 6", "6 and 3"],
    answer: 3,
    explanation: "uniq removes only ADJACENT duplicate lines; in this file no two identical lines are adjacent, so all 6 lines remain. sort -u (or sort | uniq) sorts first, so duplicates become adjacent and are removed, leaving 3 unique lines.",
    optionExplanations: ["uniq alone doesn't remove non-adjacent duplicates.", "sort -u removes duplicates.", "Reversed.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "os-virt-011", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "code-output",
    question: "emp.csv contains:\nid,name,dept\n1,Asha,HR\n2,Ben,IT\nWhat do these commands print (each output joined on one line)?",
    code: "cut -d, -f2 emp.csv | tail -n +2\nawk -F, 'NR > 1 {print $3}' emp.csv",
    options: ["Asha Ben | HR IT", "name Asha Ben | dept HR IT", "1 2 | Asha Ben", "Asha Ben | 1 2"],
    answer: 0,
    explanation: "cut -d, -f2 takes the 2nd comma-separated field; tail -n +2 starts from line 2, skipping the header. awk -F, sets the field separator; NR > 1 skips the header line; $3 is the third field.",
    optionExplanations: ["Correct.", "The header line is skipped in both.", "-f2 is the name column, and $3 is dept.", "$3 is the dept column."]
  },
  {
    id: "os-virt-012", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "Which command counts the number of lines in app.log that contain the word ERROR?",
    options: ["grep -v ERROR app.log", "grep -c ERROR app.log", "wc -c app.log", "find ERROR app.log"],
    answer: 1,
    explanation: "grep -c prints the count of matching lines. `grep ERROR app.log | wc -l` is equivalent. -v inverts the match, -i ignores case, -n shows line numbers, -r searches recursively.",
    optionExplanations: ["-v prints NON-matching lines.", "Correct.", "wc -c counts bytes.", "find searches for files, not text."]
  },
  {
    id: "os-virt-013", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "Which command finds all .log files under /var/log modified more than 7 days ago?",
    options: ["grep -r .log /var/log", "find /var/log -name \"*.log\" -mtime +7", "ls /var/log/*.log -7", "locate -7 .log"],
    answer: 1,
    explanation: "find walks the directory tree applying tests: -name matches the pattern (quoted so the shell doesn't expand it), -mtime +7 means modified more than 7 days ago (-7 would mean within 7 days). Add -delete or -exec rm {} + to act on matches.",
    optionExplanations: ["grep searches file contents.", "Correct.", "ls has no age filter like that.", "locate uses a prebuilt database and doesn't filter by age this way."]
  },
  {
    id: "os-virt-014", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "code-output",
    question: "What does this print?",
    code: "echo 'foo foo' | sed 's/foo/bar/'\necho 'foo foo' | sed 's/foo/bar/g'",
    options: ["bar bar / bar bar", "bar foo / bar foo", "foo bar / bar bar", "bar foo / bar bar"],
    answer: 3,
    explanation: "sed's s/pattern/replacement/ replaces only the FIRST match on each line; the g flag replaces all matches. sed -i edits files in place.",
    optionExplanations: ["Without g, only the first match changes.", "With g, both are replaced.", "The first occurrence is replaced, not the last.", "Correct."]
  },
  {
    id: "os-virt-015", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "Which pair shows running processes and then terminates one forcefully?",
    options: ["ls and rm", "df and du", "jobs and exit", "ps aux (or top) to find the PID, then kill -9 <PID> (SIGKILL)"],
    answer: 3,
    explanation: "ps aux lists all processes with PID, CPU and memory usage; top/htop show them live. Prefer `kill <PID>` (SIGTERM) first to allow cleanup; use -9 only if the process won't exit. pkill/killall select by name.",
    optionExplanations: ["Those manage files.", "Those report disk usage.", "jobs lists the shell's jobs; exit closes the shell.", "Correct."]
  },
  {
    id: "os-virt-016", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "You run a long build with `make` in the foreground and press Ctrl+Z. How do you continue it in the background and later bring it back?",
    options: ["Run it again with &", "Use kill -9", "Use `bg` to resume it in the background, and `fg` (or fg %1) to bring it back to the foreground; `jobs` lists the shell's jobs", "It can't be resumed"],
    answer: 2,
    explanation: "Ctrl+Z sends SIGTSTP, stopping the job. bg sends SIGCONT and lets it run in the background; fg brings it to the foreground. Starting a command with & runs it in the background directly; nohup (or disown, tmux, screen) keeps it alive after logout.",
    optionExplanations: ["That starts a new build.", "That would kill it.", "Correct.", "Stopped jobs can be resumed."]
  },
  {
    id: "os-virt-017", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "What does `nohup ./server > server.log 2>&1 &` do?",
    options: ["Runs the server with higher priority", "Runs the server in the background, immune to the SIGHUP sent when the terminal closes, with stdout and stderr both written to server.log", "Kills the server", "Runs the server only until the terminal closes"],
    answer: 1,
    explanation: "& backgrounds the process, nohup ignores hang-up signals, `> server.log` redirects stdout and `2>&1` sends stderr to the same place. For real services, use systemd units instead.",
    optionExplanations: ["Priority is set with nice.", "Correct.", "It starts the server.", "nohup keeps it running after the terminal closes."]
  },
  {
    id: "os-virt-018", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "What does `nice -n 10 ./backup.sh` do, and which nice values are highest priority?",
    options: ["Runs the script 10 times", "Limits it to 10 seconds of CPU", "Gives it the highest priority", "Starts the script with a niceness of +10, i.e. LOWER scheduling priority; niceness ranges from −20 (highest priority, root only) to 19 (lowest)"],
    answer: 3,
    explanation: "Being 'nice' means yielding CPU to others. renice changes the niceness of a running process. Under CFS, niceness maps to a weight that determines the process's CPU share.",
    optionExplanations: ["nice doesn't repeat commands.", "CPU time limits use ulimit or cgroups.", "Positive niceness lowers priority.", "Correct."]
  },
  {
    id: "os-virt-019", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "numerical",
    question: "With `umask 022`, what permissions do newly created regular files and directories get (typical defaults of 666 for files, 777 for directories)?",
    options: ["Files 644, directories 755", "Files 755, directories 644", "Files 666, directories 777", "Files 622, directories 755"],
    answer: 0,
    explanation: "The umask removes permission bits: 666 & ~022 = 644 (rw-r--r--) for files; 777 & ~022 = 755 (rwxr-xr-x) for directories. With umask 027, files get 640 and directories 750. Execute isn't granted to new files by default.",
    optionExplanations: ["Correct.", "Reversed.", "The umask removes the write bits for group and others.", "622 isn't what masking 022 from 666 gives."]
  },
  {
    id: "os-virt-020", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "What's the difference between `df -h` and `du -sh /var/log`?",
    options: ["They're identical", "df shows directories; du shows partitions", "df reports free/used space per mounted FILE SYSTEM; du reports how much space files under a given DIRECTORY use", "Both show memory usage"],
    answer: 2,
    explanation: "-h prints human-readable sizes; -s in du summarises the total. If df says the disk is full but du can't find the files, look for deleted-but-open files (lsof | grep deleted).",
    optionExplanations: ["They measure different things.", "Reversed.", "Correct.", "free shows memory usage."]
  },
  {
    id: "os-virt-021", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "`uptime` shows `load average: 3.50, 2.10, 1.00` on a 4-core machine. What does this indicate?",
    options: ["The CPU is 350% busy", "Over the last 1, 5 and 15 minutes, on average 3.5, 2.1 and 1.0 processes were runnable (or in uninterruptible I/O wait); load is rising, and at 3.5 it's still below the 4 cores available", "The system has been up 3.5 days", "Memory usage percentages"],
    answer: 1,
    explanation: "Load average counts tasks wanting CPU (plus D-state I/O waits on Linux), averaged exponentially. Compare it with the number of cores: sustained values above the core count suggest saturation.",
    optionExplanations: ["Load isn't a utilisation percentage.", "Correct.", "Uptime is shown separately.", "Memory is shown by free."]
  },
  {
    id: "os-virt-022", subject: "os", subtopic: "Virtualization & Linux", difficulty: "hard", type: "code-output",
    question: "`ls nonexist` writes one error line to stderr. Where does that error line go in each case?",
    code: "ls nonexist > out1.txt 2>&1\nls nonexist 2>&1 > out2.txt",
    options: ["Case 1: into out1.txt; case 2: to the terminal (out2.txt stays empty)", "Both into the files", "Case 1: terminal; case 2: out2.txt", "Both to the terminal"],
    answer: 0,
    explanation: "Redirections are processed left to right. Case 1: stdout → out1.txt, then stderr → wherever stdout points now (the file). Case 2: stderr → wherever stdout points NOW (the terminal), then stdout → out2.txt. Order matters!",
    optionExplanations: ["Correct.", "The second case duplicates stderr before stdout is redirected.", "Reversed.", "The first case captures stderr in the file."],
    tags: ["trap"]
  },
  {
    id: "os-virt-023", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "code-output",
    question: "What does this print?",
    code: "false && echo A || echo B\ntrue || echo C\nls nonexist 2>/dev/null; echo $?",
    options: ["A then C then 0", "B then C then 0", "B then (nothing) then a non-zero status (2 with GNU ls)", "A then nothing then 1"],
    answer: 2,
    explanation: "&& runs the next command only if the previous succeeded (exit status 0); || runs it only if the previous failed. false fails, so echo A is skipped and echo B runs. true succeeds, so echo C is skipped. $? holds the last command's exit status: GNU ls returns 2 for a missing file.",
    optionExplanations: ["false fails, so A isn't printed.", "true succeeds, so C is skipped.", "Correct.", "B is printed."]
  },
  {
    id: "os-virt-024", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "Which directory typically holds each of these on Linux: system-wide configuration, log files, device files, process information?",
    options: ["/bin, /tmp, /home, /usr", "/etc, /var/log, /dev, /proc", "/var, /etc, /proc, /dev", "/usr, /opt, /srv, /boot"],
    answer: 1,
    explanation: "Filesystem Hierarchy Standard highlights: /etc config, /var variable data (logs in /var/log), /dev device nodes, /proc and /sys kernel-provided pseudo-files, /home user directories, /tmp temporary files, /bin and /usr/bin programs, /boot kernel and bootloader files.",
    optionExplanations: ["Those hold binaries, temp files, home dirs and user programs.", "Correct.", "The order is shuffled.", "Those hold other things."]
  },
  {
    id: "os-virt-025", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "What is /proc?",
    options: ["A directory of saved processes on disk", "A pseudo-file system generated by the kernel on the fly, exposing process information (/proc/<pid>/status, /proc/<pid>/fd) and system data (/proc/cpuinfo, /proc/meminfo); reading its files queries kernel data structures", "A backup of /etc", "A compiler directory"],
    answer: 1,
    explanation: "Tools like ps and top read /proc. Its files have size 0 on disk because nothing is stored; some entries (e.g. /proc/sys) are writable to tune kernel parameters (sysctl).",
    optionExplanations: ["Nothing is stored on disk.", "Correct.", "It's unrelated to /etc.", "It holds kernel information."]
  },
  {
    id: "os-virt-026", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "code-output",
    question: "In bash, what do these lines print?",
    code: "x=5\nbash -c 'echo \"child sees: [$x]\"'\nexport x\nbash -c 'echo \"after export: [$x]\"'",
    options: ["child sees: [] / after export: [5]", "child sees: [5] / after export: [5]", "child sees: [5] / after export: []", "child sees: [] / after export: []"],
    answer: 0,
    explanation: "A plain assignment creates a SHELL variable visible only in the current shell. export marks it as an ENVIRONMENT variable, which is copied into the environment of child processes. That's why PATH changes must be exported to affect programs you launch.",
    optionExplanations: ["Correct.", "Unexported variables aren't inherited.", "Reversed.", "After export, the child inherits x."]
  },
  {
    id: "os-virt-027", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "You type `mytool` and get 'command not found', although the binary is at /opt/mytool/bin/mytool. What's the likely fix?",
    options: ["Rename it to .exe", "chmod 000 mytool", "Reboot", "Add its directory to PATH, e.g. `export PATH=\"$PATH:/opt/mytool/bin\"` (persist it in ~/.bashrc), or run it with its full path"],
    answer: 3,
    explanation: "The shell searches the directories listed in PATH, in order, for commands without a slash. `which mytool` / `command -v mytool` shows what would run. Also make sure the file is executable (chmod +x).",
    optionExplanations: ["Linux doesn't use extensions for executables.", "That removes all permissions.", "Rebooting doesn't change PATH.", "Correct."]
  },
  {
    id: "os-virt-028", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "A server fails to start with 'address already in use' on port 8080. Which command identifies the process using the port?",
    options: ["df -h", "top -p 8080", "chmod 8080", "ss -tlnp | grep 8080 (or lsof -i :8080, or netstat -tlnp)"],
    answer: 3,
    explanation: "ss/netstat list sockets: -t TCP, -l listening, -n numeric, -p owning process. lsof -i :PORT shows processes with that socket open. strace -p PID traces a process's system calls when debugging deeper problems.",
    optionExplanations: ["df reports disk usage.", "-p in top takes a PID, not a port.", "chmod changes permissions.", "Correct."]
  },
  {
    id: "os-virt-029", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "What schedule does the crontab entry `*/15 2 * * 1` describe?",
    options: ["Every 15 minutes, every day", "Every 2 hours on the 15th", "At 2:15 on the 1st of every month", "Every 15 minutes during the 2 AM hour (2:00, 2:15, 2:30, 2:45) on Mondays"],
    answer: 3,
    explanation: "Fields: minute, hour, day-of-month, month, day-of-week (0 or 7 = Sunday, 1 = Monday). */15 in the minute field means every 15 minutes; hour 2 restricts it to 2 AM; day-of-week 1 restricts it to Monday.",
    optionExplanations: ["The hour and weekday fields restrict it.", "Fields are misread.", "The last field is day-of-week, not day-of-month.", "Correct."]
  },
  {
    id: "os-virt-030", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "With systemd, which command makes the nginx service start automatically at boot AND starts it now?",
    options: ["systemctl enable --now nginx", "systemctl status nginx", "service nginx boot", "init nginx"],
    answer: 0,
    explanation: "systemctl start runs a unit now; enable creates the links that start it at boot; --now does both. journalctl -u nginx shows its logs. systemd (PID 1) replaced SysV init runlevels with targets (multi-user.target, graphical.target).",
    optionExplanations: ["Correct.", "status only reports state.", "Not a valid command.", "init isn't used this way."]
  },
  {
    id: "os-virt-031", subject: "os", subtopic: "Virtualization & Linux", difficulty: "hard", type: "concept",
    question: "A container is given a cgroup memory limit of 512 MB, and its process tries to allocate 1 GB. What typically happens?",
    options: ["The host's swap is used without limit", "The kernel's OOM killer terminates a process inside that cgroup when it exceeds its limit (exit code 137 in Docker / Kubernetes 'OOMKilled'), protecting the host and other containers", "The allocation is silently ignored", "The whole host reboots"],
    answer: 1,
    explanation: "cgroups enforce resource limits per group of processes. Memory limits are hard caps; CPU limits throttle rather than kill. This is how Kubernetes enforces requests/limits.",
    optionExplanations: ["The limit applies regardless of host swap (unless swap is configured for the cgroup).", "Correct.", "Exceeding the limit triggers OOM handling.", "Only the offending cgroup is affected."]
  },
  {
    id: "os-virt-032", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "code-output",
    question: "What does this print?",
    code: "seq 1 10 | head -n 3 | tail -n 1",
    options: ["1", "10", "3", "8"],
    answer: 2,
    explanation: "seq prints 1 to 10, head -n 3 keeps the first three lines (1, 2, 3), and tail -n 1 keeps the last of those: 3. Combining head and tail like this extracts the Nth line (sed -n '3p' also works).",
    optionExplanations: ["That's the first line.", "head limits the input to 3 lines first.", "Correct.", "That would be from the end of the full sequence."]
  },
  {
    id: "os-virt-033", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "What's the difference between `chown alice:devs report.txt` and `chmod g+w report.txt`?",
    options: ["They're the same", "chown changes the file's owner (alice) and group (devs); chmod g+w adds write permission for the file's group", "chmod changes the owner", "chown adds permissions"],
    answer: 1,
    explanation: "Ownership decides WHICH permission triplet applies to a user (owner, group, others); chmod sets the bits in each triplet. Changing ownership usually requires root.",
    optionExplanations: ["They modify different attributes.", "Correct.", "chmod changes permission bits.", "chown changes ownership only."]
  },
  {
    id: "os-virt-034", subject: "os", subtopic: "Virtualization & Linux", difficulty: "hard", type: "concept",
    question: "A program fails mysteriously with 'Permission denied' but doesn't say which file. Which tool shows every system call it makes, including the failing open()?",
    options: ["top", "chmod", "df", "strace (e.g. strace -f -e trace=openat ./prog)"],
    answer: 3,
    explanation: "strace intercepts system calls and prints their arguments and results (e.g. openat(...) = -1 EACCES), revealing the exact path. ltrace traces library calls; perf profiles; gdb debugs.",
    optionExplanations: ["top shows resource usage, not syscalls.", "chmod changes permissions.", "df shows disk usage.", "Correct."]
  },
  {
    id: "os-virt-035", subject: "os", subtopic: "Virtualization & Linux", difficulty: "medium", type: "concept",
    question: "What does `ln -s /data/app/current /srv/app` create, and what happens if /data/app/current is later replaced by a new release directory with the same path?",
    options: ["A hard link; it keeps pointing to the old directory", "An error, because symlinks can't point to directories", "A copy of the directory", "A symbolic link at /srv/app pointing to the PATH /data/app/current; since it stores a path, it automatically follows whatever is at that path now"],
    answer: 3,
    explanation: "Atomic deployments often switch a 'current' symlink between release directories. Hard links can't point to directories, and a hard link would follow the inode, not the path.",
    optionExplanations: ["-s creates a symbolic link.", "Symlinks can point to directories.", "Links don't copy data.", "Correct."]
  },
  {
    id: "os-virt-036", subject: "os", subtopic: "Virtualization & Linux", difficulty: "easy", type: "concept",
    question: "Which command shows memory usage, including the 'available' memory the system can give to new applications?",
    options: ["df -h", "du -sh", "free -h", "ls -l /mem"],
    answer: 2,
    explanation: "free shows total, used, free, buff/cache and available memory. Linux uses spare RAM as page cache, so 'free' looks small; 'available' estimates memory usable without swapping because caches can be dropped.",
    optionExplanations: ["df shows disk space.", "du shows directory sizes.", "Correct.", "There's no such file."]
  },
{
    id: "os-virt-037", subject: "os", subtopic: "Virtualization & Linux", difficulty: "hard", type: "concept",
    question: "A Dockerfile does `COPY . /app` and then `RUN pip install -r /app/requirements.txt`. Why does every small code change make builds slow, and what's the fix?",
    options: ["Docker never caches layers", "Each instruction's layer is cached until its inputs change; copying the whole source tree first invalidates the cache for every later layer, so dependencies reinstall on every code edit. Copy requirements.txt alone, run pip install, then copy the rest", "pip is slow inside containers", "COPY must always be the last instruction"],
    answer: 1,
    explanation: "Order Dockerfile instructions from least to most frequently changing. A separate dependency layer is reused across builds as long as requirements.txt is unchanged. Multi-stage builds further shrink final images.",
    optionExplanations: ["Layer caching exists; it's being defeated here.", "Correct.", "The slowness comes from cache invalidation.", "Order matters for caching, but COPY needn't be last."]
  },
  {
    id: "os-virt-038", subject: "os", subtopic: "Virtualization & Linux", difficulty: "hard", type: "concept",
    question: "Why do some multi-tenant platforms run untrusted customers' containers inside lightweight VMs (e.g. Firecracker microVMs, Kata Containers) or user-space kernels (gVisor)?",
    options: ["Containers can't run without VMs", "All containers on a host share one kernel, so a kernel vulnerability can allow a container escape affecting other tenants; a VM boundary (or a sandboxed kernel) gives much stronger isolation while keeping container-like startup speed", "VMs use less memory than containers", "To support Windows containers only"],
    answer: 1,
    explanation: "Namespaces and cgroups isolate resources but the attack surface is the entire Linux system-call interface. MicroVMs boot in ~100 ms with minimal device models, combining VM isolation with container ergonomics (used by AWS Lambda and Fargate).",
    optionExplanations: ["Containers run directly on Linux.", "Correct.", "VMs generally use more memory.", "Isolation, not Windows support, is the motivation."]
  },
  {
    id: "os-virt-039", subject: "os", subtopic: "Virtualization & Linux", difficulty: "hard", type: "concept",
    question: "`find . -name \"*.txt\" | xargs rm` fails to delete a file named 'a b.txt'. Why, and what's a robust alternative?",
    options: ["rm can't delete text files", "xargs splits its input on whitespace, so 'a b.txt' becomes two arguments ('./a' and 'b.txt') that don't exist; use `find . -name \"*.txt\" -print0 | xargs -0 rm` or `find . -name \"*.txt\" -exec rm {} +`", "find doesn't list files with spaces", "The pattern must be unquoted"],
    answer: 1,
    explanation: "-print0 separates names with NUL bytes (which can't appear in file names) and xargs -0 splits on NUL. -exec ... {} + avoids the pipe altogether and batches arguments efficiently.",
    optionExplanations: ["rm deletes any file type.", "Correct.", "find lists it correctly; xargs mis-splits it.", "Unquoted patterns may be expanded by the shell too early."],
    tags: ["trap"]
  },
  {
    id: "os-virt-040", subject: "os", subtopic: "Virtualization & Linux", difficulty: "hard", type: "numerical",
    question: "With hardware nested paging (Intel EPT / AMD NPT), a guest uses 4-level page tables and the host also uses 4-level tables. In the worst case (all TLBs and page-walk caches miss), how many memory references does translating one guest virtual address require?",
    options: ["4", "8", "16", "24"],
    answer: 3,
    explanation: "Each of the guest's 4 page-table pointers is a guest-physical address that must itself be translated through the host's 4-level table (4 + 1 references each: 4 host lookups plus reading the guest entry) = 4 × 5 = 20, plus translating the final guest-physical data address (4 more) = 24. In general (n + 1)(m + 1) − 1. That's why TLB misses are much costlier in VMs and why huge pages help.",
    optionExplanations: ["That's a native 4-level walk.", "That just adds the two walks.", "That multiplies the levels without the extra entry reads.", "Correct: (4 + 1)(4 + 1) − 1 = 24."]
  }
);
