/* Operating Systems — Disk Scheduling & RAID */
window.QUESTIONS.push(
  {
    id: "os-disk-001", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "easy", type: "concept",
    question: "What are the components of the time to access a block on a hard disk drive?",
    options: ["Only the transfer time", "Boot time + seek time", "CPU time + memory time", "Seek time (move the arm to the track) + rotational latency (wait for the sector to rotate under the head) + transfer time"],
    answer: 3,
    explanation: "Seek time (several ms) and rotational latency (several ms) dominate; transfer of a small block takes microseconds. Disk scheduling algorithms try to minimise seek time by ordering requests.",
    optionExplanations: ["Mechanical delays dominate.", "Boot time is irrelevant.", "Those are CPU/memory costs.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-disk-002", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "easy", type: "numerical",
    question: "A disk spins at 7,200 RPM. What is the AVERAGE rotational latency?",
    options: ["8.33 ms", "4.17 ms", "7.2 ms", "0.12 ms"],
    answer: 1,
    explanation: "One revolution takes 60 s / 7,200 = 8.33 ms. On average the desired sector is half a revolution away: 8.33 / 2 ≈ 4.17 ms. (A 15,000 RPM disk averages 2 ms.)",
    optionExplanations: ["That's a full revolution.", "Correct.", "That just reuses the RPM number.", "Far too small for a spinning disk."]
  },
  {
    id: "os-disk-003", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "numerical",
    question: "Average seek time 5 ms, 7,200 RPM, transfer rate 100 MB/s. Approximately how long does it take to read one randomly located 4 KB block?",
    options: ["About 5 ms", "About 13.4 ms", "About 9.2 ms", "About 0.04 ms"],
    answer: 2,
    explanation: "Seek 5 ms + average rotational latency 4.17 ms + transfer 4 KB / 100 MB/s ≈ 0.04 ms ≈ 9.2 ms. For small random reads, the mechanical delays dominate, which is why SSDs (no seek or rotation) are so much faster for random I/O.",
    optionExplanations: ["Rotational latency is missing.", "That uses a full rotation instead of half.", "Correct.", "That's only the transfer time."]
  },
  {
    id: "os-disk-004", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "numerical",
    question: "A disk has 4 platters (both surfaces used), 1,000 tracks per surface, 500 sectors per track and 512 bytes per sector. What is its capacity?",
    options: ["1.024 GB", "4.096 GB", "2.048 GB", "256 MB"],
    answer: 2,
    explanation: "Surfaces = 4 × 2 = 8. Capacity = 8 × 1,000 × 500 × 512 bytes = 2,048,000,000 bytes ≈ 2.048 GB (about 1.91 GiB). A cylinder is the set of tracks at the same arm position across all surfaces.",
    optionExplanations: ["That counts one surface per platter.", "That double counts.", "Correct.", "Far too small."]
  },
  {
    id: "os-disk-005", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "easy", type: "numerical",
    question: "Head at cylinder 53; request queue (in arrival order): 98, 183, 37, 122, 14, 124, 65, 67. What is the total head movement under FCFS?",
    options: ["236", "331", "640", "299"],
    answer: 2,
    explanation: "53→98 (45), 98→183 (85), 183→37 (146), 37→122 (85), 122→14 (108), 14→124 (110), 124→65 (59), 65→67 (2). Sum = 640 cylinders. FCFS is fair but causes wild swings across the disk.",
    optionExplanations: ["That's SSTF.", "That's SCAN moving upward.", "Correct.", "That's LOOK moving upward."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-disk-006", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "numerical",
    question: "Head at 53; queue: 98, 183, 37, 122, 14, 124, 65, 67. What is the total head movement under SSTF (shortest seek time first)?",
    options: ["236", "640", "208", "322"],
    answer: 0,
    explanation: "Always serve the nearest request: 53→65 (12), →67 (2), →37 (30), →14 (23), →98 (84), →122 (24), →124 (2), →183 (59). Total = 236. SSTF is efficient but can starve requests far from the head.",
    optionExplanations: ["Correct.", "That's FCFS.", "That's LOOK moving downward.", "That's C-LOOK moving upward."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-disk-007", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "numerical",
    question: "Cylinders 0–199. Head at 53 moving toward 0; queue: 98, 183, 37, 122, 14, 124, 65, 67. What is the total head movement under SCAN (elevator), which goes all the way to the end before reversing?",
    options: ["208", "236", "331", "382"],
    answer: 1,
    explanation: "Moving down: 53→37→14→0 (53 cylinders). Reverse and go up to the farthest request: 0→183 (183). Total = 53 + 183 = 236. (Its sequence: 37, 14, [0], 65, 67, 98, 122, 124, 183.)",
    optionExplanations: ["That's LOOK, which reverses at 14 without touching 0.", "Correct.", "That's SCAN moving upward first.", "That's C-SCAN moving upward."]
  },
  {
    id: "os-disk-008", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "numerical",
    question: "Cylinders 0–199. Head at 53 moving toward HIGHER cylinders; queue: 98, 183, 37, 122, 14, 124, 65, 67. What is the total head movement under SCAN?",
    options: ["299", "331", "236", "382"],
    answer: 1,
    explanation: "Up: 53→65→67→98→122→124→183→199 (end of disk) = 146. Then reverse: 199→37→14 = 185. Total = 331. Going all the way to cylinder 199 even though no request is there is what distinguishes SCAN from LOOK.",
    optionExplanations: ["That's LOOK (reverses at 183).", "Correct.", "That's SCAN moving downward first.", "That's C-SCAN."]
  },
  {
    id: "os-disk-009", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "numerical",
    question: "Head at 53 moving toward higher cylinders; queue: 98, 183, 37, 122, 14, 124, 65, 67. What is the total head movement under LOOK?",
    options: ["299", "331", "322", "236"],
    answer: 0,
    explanation: "LOOK goes only as far as the last request in each direction: up 53→183 (130), then reverse 183→37→14 (169). Total = 299, saving the 2 × 16 cylinders SCAN wastes going to 199 and back.",
    optionExplanations: ["Correct.", "That's SCAN.", "That's C-LOOK.", "That's SSTF / SCAN moving downward."]
  },
  {
    id: "os-disk-010", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "hard", type: "numerical",
    question: "Cylinders 0–199. Head at 53 moving up; queue: 98, 183, 37, 122, 14, 124, 65, 67. Under C-SCAN (counting the return sweep from 199 to 0 as head movement), what is the total?",
    options: ["322", "331", "382", "183"],
    answer: 2,
    explanation: "Up to the end: 53→199 = 146 (serving 65, 67, 98, 122, 124, 183). Jump back to the start: 199→0 = 199. Continue up: 0→14→37 = 37. Total = 146 + 199 + 37 = 382. If the return sweep isn't counted (some textbooks), it's 183. C-SCAN treats the disk as circular, giving more uniform waiting times.",
    optionExplanations: ["That's C-LOOK.", "That's SCAN.", "Correct.", "That's the total without counting the return sweep."]
  },
  {
    id: "os-disk-011", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "hard", type: "numerical",
    question: "Head at 53 moving up; queue: 98, 183, 37, 122, 14, 124, 65, 67. Under C-LOOK (counting the jump back), what is the total head movement?",
    options: ["299", "382", "322", "353"],
    answer: 2,
    explanation: "Up to the last request: 53→183 = 130. Jump to the LOWEST pending request: 183→14 = 169. Then up: 14→37 = 23. Total = 322.",
    optionExplanations: ["That's LOOK.", "That's C-SCAN.", "Correct.", "Recompute the jump: 183 − 14 = 169."]
  },
  {
    id: "os-disk-012", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "numerical",
    question: "Head at 50; queue: 82, 170, 43, 140, 24, 16, 190 (cylinders 0–199). What is the total head movement under SSTF?",
    options: ["642", "314", "208", "332"],
    answer: 2,
    explanation: "Nearest first: 50→43 (7) →24 (19) →16 (8) →82 (66) →140 (58) →170 (30) →190 (20). Total = 208.",
    optionExplanations: ["That's FCFS.", "That's LOOK moving up.", "Correct.", "That's SCAN moving up."]
  },
  {
    id: "os-disk-013", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "hard", type: "numerical",
    question: "Head at 50 moving toward higher cylinders; queue: 82, 170, 43, 140, 24, 16, 190 (cylinders 0–199). What are the total head movements for SCAN and LOOK?",
    options: ["SCAN 332, LOOK 314", "SCAN 314, LOOK 332", "SCAN 391, LOOK 341", "SCAN 208, LOOK 208"],
    answer: 0,
    explanation: "SCAN: 50→199 (149) then 199→16 (183) = 332. LOOK: 50→190 (140) then 190→16 (174) = 314. The difference (18) is the unnecessary trip from 190 to 199 and back.",
    optionExplanations: ["Correct.", "Reversed.", "Those are C-SCAN (with return) and C-LOOK.", "That's SSTF."]
  },
  {
    id: "os-disk-014", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "Which disk-scheduling algorithm can cause STARVATION of requests far from the current head position?",
    options: ["FCFS", "C-LOOK", "C-SCAN", "SSTF"],
    answer: 3,
    explanation: "SSTF always picks the closest request; a steady stream of nearby requests can postpone distant ones indefinitely (like SJF in CPU scheduling). FCFS is fair; SCAN-family algorithms sweep across the disk, bounding waits.",
    optionExplanations: ["FCFS serves in arrival order.", "C-LOOK sweeps through all pending requests.", "C-SCAN sweeps across all cylinders.", "Correct."]
  },
  {
    id: "os-disk-015", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "Why does C-SCAN give more UNIFORM waiting times than SCAN?",
    options: ["It moves faster", "It uses SSTF internally", "It skips requests", "SCAN serves cylinders near the middle twice per round trip but the ends only once (and requests just behind the head wait a full round trip); C-SCAN serves in one direction only and jumps back, treating cylinders as a circular list so each gets similar service frequency"],
    answer: 3,
    explanation: "After SCAN reverses at one end, the requests densest at the other end have waited longest. C-SCAN's one-way service evens this out at the cost of the non-servicing return sweep.",
    optionExplanations: ["Head speed is the same.", "It's a sweep algorithm.", "All requests are served.", "Correct."]
  },
  {
    id: "os-disk-016", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "Why are classic seek-optimising disk schedulers (SSTF, SCAN) largely irrelevant for SSDs?",
    options: ["SSDs are slower", "SSDs don't support queues", "SSDs can only read sequentially", "SSDs have no moving heads, so access time doesn't depend on the distance between addresses; Linux typically uses 'none' or simple deadline-based schedulers for NVMe SSDs"],
    answer: 3,
    explanation: "SSD concerns are different: limited erase cycles (wear leveling), erase-before-write in large blocks (garbage collection, TRIM to tell the drive which blocks are free) and internal parallelism (deep queues).",
    optionExplanations: ["SSDs are much faster for random I/O.", "NVMe supports many deep queues.", "SSDs excel at random access.", "Correct."]
  },
  {
    id: "os-disk-017", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "easy", type: "concept",
    question: "What does RAID 0 provide?",
    options: ["Striping data across disks for higher throughput and full combined capacity, but NO redundancy — one disk failure loses the whole array", "Mirroring for fault tolerance", "Parity for single-disk fault tolerance", "Backups"],
    answer: 0,
    explanation: "RAID 0 increases performance and capacity, but its failure probability is higher than a single disk's (any one of N disks failing kills it). Use it for scratch data, not for anything you can't lose.",
    optionExplanations: ["Correct.", "That's RAID 1.", "That's RAID 5.", "RAID isn't a backup."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-disk-018", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "easy", type: "concept",
    question: "What does RAID 1 provide?",
    options: ["Striping without redundancy", "Mirroring: each block is written to two (or more) disks; survives a disk failure, reads can be served from either copy, but usable capacity is halved", "Distributed parity", "Double parity"],
    answer: 1,
    explanation: "RAID 1 is simple and fast to rebuild (just copy the mirror) but costs 50% of raw capacity. RAID 10 combines mirroring with striping for both performance and redundancy.",
    optionExplanations: ["That's RAID 0.", "Correct.", "That's RAID 5.", "That's RAID 6."]
  },
  {
    id: "os-disk-019", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "How does RAID 5 provide fault tolerance?",
    options: ["By mirroring every disk", "By striping data with parity blocks DISTRIBUTED across all disks; if one disk fails, its contents are reconstructed by XOR-ing the corresponding blocks on the remaining disks", "By storing parity on one dedicated disk", "By keeping two parity blocks per stripe"],
    answer: 1,
    explanation: "Distributing parity (unlike RAID 4's dedicated parity disk) avoids a parity-disk bottleneck. RAID 5 tolerates exactly one disk failure; a second failure (or an unreadable sector) during the long rebuild of large disks loses data — one reason RAID 6 became popular.",
    optionExplanations: ["That's RAID 1.", "Correct.", "That's RAID 4.", "That's RAID 6."]
  },
  {
    id: "os-disk-020", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "numerical",
    question: "You have four 2 TB disks. What is the usable capacity with RAID 0, RAID 5, RAID 6 and RAID 10?",
    options: ["8, 6, 4, 4 TB", "8, 4, 6, 4 TB", "4, 6, 4, 8 TB", "8, 6, 6, 2 TB"],
    answer: 0,
    explanation: "RAID 0: all disks = 4 × 2 = 8 TB. RAID 5: one disk's worth of parity → (4 − 1) × 2 = 6 TB. RAID 6: two disks' worth → (4 − 2) × 2 = 4 TB. RAID 10: mirrored pairs → half = 4 TB.",
    optionExplanations: ["Correct.", "RAID 5 loses one disk, RAID 6 two.", "RAID 0 uses all capacity.", "RAID 6 and RAID 10 both give 4 TB here."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-disk-021", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "How many simultaneous disk failures can each level survive without data loss: RAID 0, RAID 1 (2-disk mirror), RAID 5, RAID 6?",
    options: ["0, 1, 1, 2", "1, 1, 2, 2", "0, 2, 1, 1", "0, 1, 2, 3"],
    answer: 0,
    explanation: "RAID 0 has no redundancy. A 2-way mirror survives one failure. RAID 5 (single parity) survives one. RAID 6 (dual parity, e.g. P + Q Reed-Solomon) survives any two. RAID 10 survives one per mirror pair (sometimes more, depending on which disks fail).",
    optionExplanations: ["Correct.", "RAID 0 tolerates none, and RAID 5 only one.", "RAID 1 with two disks survives one failure; RAID 6 survives two.", "RAID 5 tolerates one, RAID 6 two."]
  },
  {
    id: "os-disk-022", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "hard", type: "numerical",
    question: "In RAID 5, a small write that modifies one data block (read-modify-write) requires how many disk I/O operations, and how many in RAID 6?",
    options: ["1 and 1", "3 and 4", "2 and 3", "4 and 6"],
    answer: 3,
    explanation: "RAID 5: read old data, read old parity, write new data, write new parity (new parity = old parity ⊕ old data ⊕ new data) = 4 I/Os. RAID 6 must also update the second parity: read and write it too = 6 I/Os. This 'write penalty' makes parity RAID slow for small random writes; RAID 10 needs only 2 writes.",
    optionExplanations: ["Parity must also be updated.", "Recount the reads and writes.", "Parity updates need reads of old values too.", "Correct."]
  },
  {
    id: "os-disk-023", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "easy", type: "concept",
    question: "Why is RAID NOT a substitute for backups?",
    options: ["RAID protects only against disk hardware failure; accidental deletion, corruption, ransomware or controller bugs are faithfully replicated to all disks, so you still need independent, versioned backups", "RAID is slower than backups", "RAID deletes old data automatically", "Backups and RAID are the same thing"],
    answer: 0,
    explanation: "Redundancy (availability) and backups (recoverability of past states) solve different problems. The 3-2-1 rule: 3 copies, 2 media types, 1 off-site.",
    optionExplanations: ["Correct.", "Speed isn't the issue.", "RAID doesn't delete data by itself.", "They serve different purposes."]
  },
  {
    id: "os-disk-024", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "What does RAID 10 (1+0) combine, and why is it popular for databases?",
    options: ["Parity and striping", "Compression and deduplication", "Two RAID 0 arrays without redundancy", "Mirroring and striping: data is striped across mirrored pairs, giving high read/write performance (no parity write penalty) and fast rebuilds, at 50% capacity cost"],
    answer: 3,
    explanation: "Write-heavy random workloads (OLTP databases) suffer under RAID 5/6 write penalties; RAID 10 keeps writes cheap and rebuilds by simply copying from the surviving mirror.",
    optionExplanations: ["That's RAID 5/6.", "Those aren't RAID levels.", "RAID 10 includes mirroring.", "Correct."]
  },
  {
    id: "os-disk-025", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "How do SSDs handle the fact that flash cells wear out after a limited number of program/erase cycles?",
    options: ["They don't; they fail quickly", "The flash translation layer (FTL) performs wear leveling, spreading writes across all blocks, plus over-provisioning and garbage collection; the TRIM command tells the SSD which blocks the file system no longer uses", "They write only once", "They use RAID internally only"],
    answer: 1,
    explanation: "Flash must be erased in large blocks before pages can be rewritten, so SSDs write updates out of place and remap logical addresses. TRIM reduces unnecessary copying during garbage collection, improving performance and lifespan.",
    optionExplanations: ["Modern SSDs last years under normal workloads.", "Correct.", "They rewrite constantly via remapping.", "Wear leveling is the key mechanism."]
  },
  {
    id: "os-disk-026", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "What happens during low-level formatting, partitioning and high-level (logical) formatting of a disk?",
    options: ["All three are the same", "Low-level formatting divides the disk into sectors (done at the factory); partitioning divides it into separate regions (MBR/GPT); logical formatting (mkfs) creates a file system's structures (superblock, inode tables, free-space maps) in a partition", "Partitioning creates files", "Logical formatting writes sectors"],
    answer: 1,
    explanation: "After these steps the disk can hold a boot block (bootstrap loader in the first sector or EFI partition) and file systems. Bad sectors are hidden by the drive through sector sparing (remapping to spares) or slipping.",
    optionExplanations: ["They operate at different levels.", "Correct.", "Partitioning creates regions, not files.", "Low-level formatting defines sectors."]
  },
  {
    id: "os-disk-027", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "hard", type: "concept",
    question: "In the disk-scheduling algorithms above, which two consistently have the LOWEST total head movement for typical random workloads, and what's the caveat?",
    options: ["FCFS and C-SCAN, with no caveats", "SSTF and LOOK tend to minimise movement, but SSTF can starve distant requests, and minimising seek distance doesn't guarantee fairness or minimal rotational latency", "C-SCAN and SCAN always minimise movement", "All algorithms give the same total"],
    answer: 1,
    explanation: "On the classic example (head 53), SSTF gives 236 and LOOK (downward) 208, versus 640 for FCFS. Real drives also do their own reordering (NCQ) using rotational position, which the OS can't see.",
    optionExplanations: ["FCFS is usually worst.", "Correct.", "Their extra sweeps add distance.", "Totals differ significantly."]
  },
  {
    id: "os-disk-028", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "hard", type: "numerical",
    question: "Head at 53 moving toward 0; queue: 98, 183, 37, 122, 14, 124, 65, 67. What is the total head movement under LOOK?",
    options: ["236", "183", "299", "208"],
    answer: 3,
    explanation: "Down only as far as the lowest request: 53→37→14 (39). Reverse and go up to the highest request: 14→183 (169). Total = 39 + 169 = 208. Compared with SCAN downward (236), LOOK saves the 14→0→14 detour (28).",
    optionExplanations: ["That's SCAN downward.", "That's only the upward leg's endpoint.", "That's LOOK moving up first.", "Correct."]
  },
  {
    id: "os-disk-029", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "easy", type: "concept",
    question: "Why is SCAN called the 'elevator' algorithm?",
    options: ["It was invented for elevators", "It moves randomly", "Like an elevator, the head moves in one direction serving all requests along the way until it reaches the end, then reverses and serves requests in the other direction", "It serves the nearest request first"],
    answer: 2,
    explanation: "LOOK is the smarter elevator that turns around at the last requested floor instead of going to the top floor every time.",
    optionExplanations: ["The analogy describes its behaviour.", "It moves systematically.", "Correct.", "That's SSTF."]
  },
  {
    id: "os-disk-030", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "In RAID 5 with disks D1–D4, D2 fails. A stripe's blocks on D1, D3, D4 are 1011, 0110 and parity 1100. What was D2's block (parity = XOR of the data blocks)?",
    options: ["0001", "1010", "0101", "1111"],
    answer: 0,
    explanation: "Parity P = D1 ⊕ D2 ⊕ D3, so D2 = D1 ⊕ D3 ⊕ P = 1011 ⊕ 0110 ⊕ 1100. 1011 ⊕ 0110 = 1101; 1101 ⊕ 1100 = 0001. XOR's self-inverse property is what makes single-parity reconstruction work.",
    optionExplanations: ["Correct.", "Recompute the XOR step by step.", "Recompute: 1101 ⊕ 1100 = 0001.", "XOR doesn't produce all ones here."]
  },
{
    id: "os-disk-031", subject: "os", subtopic: "Disk Scheduling & RAID", difficulty: "medium", type: "concept",
    question: "On old disks, sectors were 'interleaved' (e.g. 2:1, numbering logical sectors on every other physical sector). Why?",
    options: ["To store more data per track", "Slow controllers needed time to process one sector before reading the next; if logically consecutive sectors were physically adjacent, the next one would already have passed under the head, costing a full rotation. Interleaving gave the controller time. Modern drives buffer whole tracks, so they use 1:1", "To encrypt data", "To reduce seek time between tracks"],
    answer: 1,
    explanation: "With 1:1 numbering and a slow controller, reading a track sequentially could take one rotation per sector. A suitable interleave factor let the next logical sector arrive just as the controller was ready. Track buffers and faster electronics made this unnecessary.",
    optionExplanations: ["Interleaving doesn't change capacity.", "Correct.", "It's unrelated to encryption.", "It affects rotational timing within a track, not seeks."]
  }
);
