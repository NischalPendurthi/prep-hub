/* Operating Systems — Virtual Memory & Page Replacement */
window.QUESTIONS.push(
  {
    id: "os-vm-001", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "easy", type: "concept",
    question: "What is virtual memory?",
    options: ["Memory on a remote server", "Extra RAM added to a CPU", "A technique giving each process a large private address space that may exceed physical RAM: only needed pages are kept in memory, the rest live on disk and are loaded on demand", "A cache inside the CPU"],
    answer: 2,
    explanation: "Benefits: programs aren't limited by physical memory size, more processes fit in memory (higher multiprogramming), isolation and protection via per-process mappings, and efficient sharing (libraries, copy-on-write).",
    optionExplanations: ["It's a local OS/MMU mechanism.", "Virtual memory isn't physical RAM.", "Correct.", "That's a CPU cache."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-vm-002", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "easy", type: "concept",
    question: "What is demand paging?",
    options: ["Loading the whole program before it starts", "Writing every page to disk on each access", "Paging only at the user's request", "Loading a page into memory only when it's first accessed; an access to a non-resident page triggers a page fault that brings it in"],
    answer: 3,
    explanation: "Demand paging is lazy loading: unused parts of a program (error handlers, rarely used features) never consume memory. 'Pure' demand paging starts a process with zero pages resident.",
    optionExplanations: ["That's the opposite of demand paging.", "Writes happen only for dirty pages being evicted.", "'Demand' refers to the program's accesses.", "Correct."]
  },
  {
    id: "os-vm-003", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "easy", type: "concept",
    question: "When does a page fault occur?",
    options: ["When a program has a bug", "When memory is full", "When the TLB misses", "When a process accesses a page whose page-table entry is marked invalid/not present (e.g. it's on disk or not yet allocated); the MMU traps to the OS"],
    answer: 3,
    explanation: "A page fault isn't necessarily an error: the OS checks if the address is legal; if so it finds a free frame (evicting one if needed), reads the page from disk, updates the page table and restarts the faulting instruction. Illegal addresses result in SIGSEGV.",
    optionExplanations: ["Most faults are normal demand paging.", "Faults can occur even with free memory.", "A TLB miss is resolved from the page table without a fault if the page is resident.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-vm-004", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "Put the main steps of servicing a page fault in order: (a) restart the faulting instruction; (b) trap to the OS and check the reference is valid; (c) read the page from disk into the frame; (d) find a free frame (evicting a victim if needed); (e) update the page table.",
    options: ["b, d, c, e, a", "d, b, c, a, e", "b, c, d, e, a", "a, b, c, d, e"],
    answer: 0,
    explanation: "Trap and validate the address, obtain a frame (writing back the victim if dirty), schedule the disk read (the process blocks meanwhile, and another process may run), mark the PTE valid with the new frame, then restart the instruction as though the page had always been there.",
    optionExplanations: ["Correct.", "The trap and validation come first.", "A frame must be chosen before reading into it.", "The instruction is restarted last."]
  },
  {
    id: "os-vm-005", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "numerical",
    question: "Memory access time is 200 ns and servicing a page fault takes 8 ms. If 1 in 1,000 accesses causes a page fault, what is the effective access time?",
    options: ["About 200 ns", "About 8 ms", "About 8.2 µs (≈ 40× slower)", "About 400 ns"],
    answer: 2,
    explanation: "EAT = (1 − p) × 200 ns + p × 8,000,000 ns = 0.999 × 200 + 0.001 × 8,000,000 = 199.8 + 8,000 ≈ 8,200 ns. Even a 0.1% fault rate slows memory by a factor of ~40, so fault rates must be tiny.",
    optionExplanations: ["Page faults dominate even when rare.", "Only 0.1% of accesses fault.", "Correct.", "The fault cost is 8 ms, not 200 ns."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-vm-006", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "numerical",
    question: "Memory access 200 ns, page-fault service 8 ms. To keep the slowdown under 10% (EAT < 220 ns), the page-fault rate p must be below roughly:",
    options: ["1 in 1,000", "1 in 10", "1 in 400,000", "1 in 20,000,000"],
    answer: 2,
    explanation: "220 > 200 + p × (8,000,000 − 200) → p < 20 / 7,999,800 ≈ 2.5 × 10⁻⁶, i.e. fewer than one fault per ~400,000 memory accesses.",
    optionExplanations: ["1 in 1,000 gives a 40× slowdown.", "That would be catastrophic.", "Correct.", "Stricter than needed."]
  },
  {
    id: "os-vm-007", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "numerical",
    question: "Replacing a clean page costs 8 ms; replacing a dirty page costs 20 ms (it must be written back first). If 70% of victim pages are dirty, what is the average page-fault service time?",
    options: ["14 ms", "11.6 ms", "20 ms", "16.4 ms"],
    answer: 3,
    explanation: "Average = 0.3 × 8 + 0.7 × 20 = 2.4 + 14 = 16.4 ms. The dirty (modify) bit lets the OS skip the write-back for clean pages, and replacement policies often prefer clean victims.",
    optionExplanations: ["That's the plain average of 8 and 20.", "The weights are swapped.", "Not every victim is dirty.", "Correct."]
  },
  {
    id: "os-vm-008", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "numerical",
    question: "Reference string 7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1 with 3 frames (initially empty). How many page faults does FIFO produce?",
    options: ["15", "12", "9", "10"],
    answer: 0,
    explanation: "FIFO evicts the page that has been in memory longest. Tracing gives faults on the first three loads plus 12 more replacements, for 15 faults in total (hits only at the 5th, 12th, 13th, 16th and 17th references).",
    optionExplanations: ["Correct.", "That's LRU's count.", "That's the optimal (OPT) count.", "That's FIFO with 4 frames."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-vm-009", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "numerical",
    question: "Same reference string (7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1), 3 frames. How many page faults does LRU produce?",
    options: ["15", "9", "12", "11"],
    answer: 2,
    explanation: "LRU evicts the page unused for the longest time. Tracing the string gives 12 faults — between FIFO (15) and the optimal algorithm (9).",
    optionExplanations: ["That's FIFO.", "That's OPT.", "Correct.", "Recount: LRU gives 12 here."]
  },
  {
    id: "os-vm-010", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "numerical",
    question: "Same reference string (7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1), 3 frames. How many faults does the OPTIMAL algorithm produce?",
    options: ["9", "12", "15", "6"],
    answer: 0,
    explanation: "OPT (Belady's MIN) evicts the page whose next use is farthest in the future. It yields 9 faults here, the minimum possible for this string and frame count.",
    optionExplanations: ["Correct.", "That's LRU.", "That's FIFO.", "Even OPT must fault on each of the 6 distinct pages at least once, and more due to limited frames."]
  },
  {
    id: "os-vm-011", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "Why isn't the optimal (OPT/MIN) page-replacement algorithm used in real operating systems?",
    options: ["It's too slow to compute", "It needs special hardware", "It produces more faults than FIFO", "It requires knowing the future reference string, which isn't available; it's used as a benchmark to evaluate practical algorithms"],
    answer: 3,
    explanation: "Like SJF in CPU scheduling, OPT is provably optimal but needs future knowledge. Practical algorithms (LRU approximations like clock) use the past to predict the future.",
    optionExplanations: ["Computation isn't the problem.", "Hardware isn't the issue.", "It produces the fewest faults.", "Correct."]
  },
  {
    id: "os-vm-012", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "numerical",
    question: "Reference string 1 2 3 4 1 2 5 1 2 3 4 5 with FIFO replacement. How many faults occur with 3 frames and with 4 frames?",
    options: ["3 frames: 9; 4 frames: 8", "3 frames: 10; 4 frames: 9", "3 frames: 9; 4 frames: 10", "3 frames: 12; 4 frames: 10"],
    answer: 2,
    explanation: "This is the classic demonstration of BELADY'S ANOMALY: with FIFO, adding a frame INCREASES faults (9 → 10) for this string. Stack algorithms such as LRU and OPT never suffer from it.",
    optionExplanations: ["FIFO with 4 frames gives 10 here.", "The counts are swapped.", "Correct.", "Recount: 9 with 3 frames."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-vm-013", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "What is Belady's anomaly, and which algorithms are immune to it?",
    options: ["For some algorithms (notably FIFO), increasing the number of frames can increase the number of page faults; 'stack algorithms' such as LRU and OPT are immune because the set of pages in n frames is always a subset of those in n + 1 frames", "More frames always mean fewer faults for every algorithm", "LRU suffers from it, FIFO doesn't", "It's about CPU scheduling"],
    answer: 0,
    explanation: "The inclusion (stack) property guarantees monotonic behaviour: with more frames, a stack algorithm keeps everything it would have kept with fewer, so it can't fault more.",
    optionExplanations: ["Correct.", "FIFO can violate this.", "Reversed.", "It's a page-replacement phenomenon."]
  },
  {
    id: "os-vm-014", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "numerical",
    question: "Reference string 1 2 3 4 2 1 5 6 2 1 2 3 7 6 3 2 1 2 3 6 with 4 frames. How many faults do LRU and FIFO produce?",
    options: ["LRU 10, FIFO 14", "LRU 14, FIFO 10", "LRU 8, FIFO 10", "LRU 15, FIFO 16"],
    answer: 0,
    explanation: "Simulating each algorithm: FIFO incurs 14 faults, LRU 10 (and OPT 8). With 3 frames the counts would be FIFO 16, LRU 15, OPT 11. LRU's use of recency generally beats FIFO's arrival order on strings with locality.",
    optionExplanations: ["Correct.", "Reversed.", "8 is OPT's count.", "Those are the 3-frame counts."]
  },
  {
    id: "os-vm-015", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "numerical",
    question: "Reference string 1 2 3 2 4 1 3 2 4 1 with 3 frames. Which algorithm produces MORE faults: LRU or FIFO?",
    options: ["FIFO (9) vs LRU (6)", "They tie at 6", "LRU (9) vs FIFO (6)", "They tie at 9"],
    answer: 2,
    explanation: "LRU is usually better, but not always. Here the cyclic pattern 4 1 3 2 4 1 keeps evicting exactly the page needed next under LRU (9 faults), while FIFO's eviction order happens to align better (6 faults). OPT gives 5. No practical algorithm is best for every string.",
    optionExplanations: ["Reversed for this string.", "They differ.", "Correct.", "They differ."],
    tags: ["trap"]
  },
  {
    id: "os-vm-016", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "Why is exact LRU rarely implemented in hardware/OS, and what's used instead?",
    options: ["Exact LRU needs updating a timestamp or stack on EVERY memory reference, which is too expensive; OSes approximate it with the hardware reference bit, e.g. the clock (second-chance) algorithm", "LRU is patented", "LRU causes Belady's anomaly", "LRU can't be implemented at all"],
    answer: 0,
    explanation: "Clock keeps frames in a circle with a hand: if the page's reference bit is 1, clear it and move on (second chance); if 0, evict it. The enhanced version also considers the dirty bit, preferring (0,0) pages.",
    optionExplanations: ["Correct.", "Patents aren't the reason.", "LRU is immune to Belady's anomaly.", "It can be implemented, just expensively."]
  },
  {
    id: "os-vm-017", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "In the enhanced second-chance algorithm, which (reference bit, dirty bit) class is the BEST victim?",
    options: ["(1, 1): recently used and modified", "(0, 1)", "(1, 0)", "(0, 0): neither recently used nor modified — evicting it needs no write-back and it's unlikely to be needed soon"],
    answer: 3,
    explanation: "Preference order: (0,0) best, (0,1) next (not used recently but needs write-back), (1,0) (used recently, clean), (1,1) worst. This balances access recency against I/O cost.",
    optionExplanations: ["That's the worst victim.", "It requires a costly write-back.", "Recently used pages are likely to be needed again.", "Correct."]
  },
  {
    id: "os-vm-018", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "How do LFU and MFU page replacement differ?",
    options: ["They're identical", "LFU evicts the page with the smallest reference count (assumes heavily used pages will stay useful); MFU evicts the page with the LARGEST count (assumes a page with a small count was just brought in and is about to be used)", "LFU evicts the newest page", "MFU is the same as LRU"],
    answer: 1,
    explanation: "Neither is common in practice: counts are expensive to maintain, and LFU keeps pages that were heavily used long ago (often fixed with decaying counts). They mostly appear as textbook contrasts.",
    optionExplanations: ["They use opposite rules.", "Correct.", "LFU is based on counts, not age.", "MFU is count-based."]
  },
  {
    id: "os-vm-019", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "easy", type: "concept",
    question: "What is thrashing?",
    options: ["Very fast CPU utilisation", "A state where processes don't have enough frames for their working sets, so they page-fault constantly; the system spends most of its time swapping pages and CPU utilisation collapses", "Deleting unused files", "A type of deadlock"],
    answer: 1,
    explanation: "A vicious cycle: low CPU utilisation tempts the scheduler to admit more processes, which takes frames away from others and increases faults further. Remedies: reduce the degree of multiprogramming, working-set or page-fault-frequency control, more RAM.",
    optionExplanations: ["CPU utilisation drops during thrashing.", "Correct.", "Unrelated to files.", "Processes aren't waiting on each other in a cycle."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-vm-020", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "numerical",
    question: "With working-set window Δ = 10, the last 10 page references of a process (oldest to newest) are: 2 6 1 5 7 7 7 7 5 1. What is the working-set size?",
    options: ["10", "4", "5", "3"],
    answer: 2,
    explanation: "The working set is the set of DISTINCT pages referenced in the most recent Δ references: {1, 2, 5, 6, 7} → size 5. If the sum of all processes' working-set sizes exceeds available frames, the OS should suspend a process to prevent thrashing.",
    optionExplanations: ["Repeated references count once.", "Page 6 is also referenced in the window.", "Correct.", "Five distinct pages appear."]
  },
  {
    id: "os-vm-021", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "How does the page-fault frequency (PFF) scheme control thrashing?",
    options: ["It disables page faults", "It monitors each process's fault rate: above an upper bound, the process gets more frames; below a lower bound, frames are taken away; if no free frames exist for a high-fault process, a process is suspended", "It sorts pages by frequency", "It doubles the page size"],
    answer: 1,
    explanation: "PFF directly targets the symptom (fault rate) rather than estimating working sets. Both approaches aim to give each process roughly its working set.",
    optionExplanations: ["Faults can't be disabled.", "Correct.", "That's LFU-like replacement.", "Page size is fixed by hardware."]
  },
  {
    id: "os-vm-022", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "numerical",
    question: "62 free frames are split between two processes of 10 pages and 127 pages using PROPORTIONAL allocation. Approximately how many frames does each get?",
    options: ["4 and 57", "31 and 31", "10 and 52", "1 and 61"],
    answer: 0,
    explanation: "aᵢ = (sᵢ / S) × m with S = 137 and m = 62: 10 / 137 × 62 ≈ 4.5 → 4; 127 / 137 × 62 ≈ 57.5 → 57. Equal allocation would give 31 each, wasting frames on the small process.",
    optionExplanations: ["Correct.", "That's equal allocation.", "Allocation is proportional to size.", "The small process gets about 4 frames."]
  },
  {
    id: "os-vm-023", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "What's the difference between global and local page replacement?",
    options: ["They're the same", "Local replacement uses disk, global uses RAM", "Global: a faulting process may take a frame from ANY process (better throughput, but a process's fault rate depends on others); local: it may only replace its own frames (more predictable per-process performance, possibly underused memory)", "Global replacement is only for the kernel"],
    answer: 2,
    explanation: "Most general-purpose OSes use global replacement with mechanisms (working sets, cgroups memory limits) to keep processes from starving each other.",
    optionExplanations: ["They differ in victim scope.", "Both evict to disk.", "Correct.", "Both apply to user processes."]
  },
  {
    id: "os-vm-024", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "numerical",
    question: "int A[128][128] is stored row-major; each page holds 128 ints (exactly one row), and the process has only ONE frame for A. How many page faults occur when zeroing the array with `for i: for j: A[i][j] = 0` versus `for j: for i: A[i][j] = 0`?",
    options: ["128 vs 128", "128 vs 16,384", "16,384 vs 128", "16,384 vs 16,384"],
    answer: 1,
    explanation: "Row-by-row traversal touches each row (page) once: 128 faults. Column-by-column traversal jumps to a different row on every access, and with one frame each access faults: 128 × 128 = 16,384. Program structure that respects locality matters enormously.",
    optionExplanations: ["The column order changes the access pattern.", "Correct.", "Reversed.", "Row order touches each page once."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-vm-025", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "How does copy-on-write interact with virtual memory after fork()?",
    options: ["All pages are copied immediately", "Pages are swapped to disk", "The child gets no memory", "Parent and child share the same physical frames marked read-only; the first write to a page by either process triggers a protection fault, and the kernel copies just that page"],
    answer: 3,
    explanation: "COW makes fork() fast and saves memory when the child execs soon after. Linux also uses COW-style tricks for zero pages: untouched pages map a shared zero page until written.",
    optionExplanations: ["Copying is deferred.", "Disk isn't involved.", "The child shares the parent's memory initially.", "Correct."]
  },
  {
    id: "os-vm-026", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "What does mmap()-ing a file do in a demand-paged system?",
    options: ["Reads the entire file into a buffer immediately", "Copies the file to swap space", "Encrypts the file", "Maps the file into the process's address space; pages are loaded lazily on first access via page faults, and (with MAP_SHARED) modified pages are written back to the file"],
    answer: 3,
    explanation: "Memory-mapped I/O replaces read()/write() calls with ordinary memory accesses and lets the page cache serve as the buffer. It's how executables and shared libraries are loaded.",
    optionExplanations: ["Loading is lazy.", "File-backed pages are paged to the file itself.", "mmap doesn't encrypt.", "Correct."]
  },
  {
    id: "os-vm-027", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "concept",
    question: "Why must the OS guarantee each process a MINIMUM number of frames, determined by the instruction-set architecture?",
    options: ["To make fairness easier", "Because pages can't be shared", "Because the TLB needs it", "A single instruction may touch several pages (instruction spanning two pages, memory operands, indirect references); if fewer frames than that are available, the instruction can never complete because servicing one fault evicts another page it needs"],
    answer: 3,
    explanation: "Example: a memory-to-memory move whose instruction and both operands each straddle page boundaries may need 6 pages resident simultaneously. The maximum is bounded by physical memory; the minimum by the ISA.",
    optionExplanations: ["It's about forward progress, not fairness.", "Sharing is unrelated.", "It's about pages per instruction.", "Correct."]
  },
  {
    id: "os-vm-028", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "numerical",
    question: "Reference string 1 2 3 2 4 1 3 2 4 1 with 4 frames. How many faults do FIFO, LRU and OPT each produce?",
    options: ["4, 4, 4", "6, 9, 5", "5, 5, 4", "4, 6, 4"],
    answer: 0,
    explanation: "Only 4 distinct pages appear (1, 2, 3, 4), so with 4 frames every page stays resident after its first (compulsory) fault: 4 faults for every algorithm. Replacement policy matters only when pages must be evicted.",
    optionExplanations: ["Correct.", "Those are the 3-frame counts.", "No evictions are ever needed with 4 frames.", "No evictions are needed."]
  },
  {
    id: "os-vm-029", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "What are the three categories of cache/page misses in the '3 Cs' model?",
    options: ["CPU, cache, compiler", "Clean, changed, copied", "Compulsory (first reference), capacity (working set larger than memory), conflict (mapping restrictions, e.g. in set-associative caches)", "Clock, counter, cycle"],
    answer: 2,
    explanation: "Compulsory (cold) misses are unavoidable without prefetching; capacity misses fall with more frames/cache; conflict misses arise from limited associativity. Fully associative page frames have no conflict misses, so page faults are compulsory or capacity.",
    optionExplanations: ["Not the miss categories.", "Those relate to page states.", "Correct.", "Those relate to algorithms."]
  },
  {
    id: "os-vm-030", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "During thrashing, how do CPU utilisation and disk (paging device) utilisation behave?",
    options: ["Both near 100%", "Both drop to zero", "CPU utilisation rises, disk is idle", "CPU utilisation drops sharply while the paging disk is saturated"],
    answer: 3,
    explanation: "Processes spend their time blocked waiting for page-ins, so the CPU idles while the disk queue is full. A naive long-term scheduler that admits more processes because the CPU looks idle makes things worse.",
    optionExplanations: ["The CPU sits idle waiting for pages.", "The disk is extremely busy.", "The disk is the bottleneck.", "Correct."]
  },
  {
    id: "os-vm-031", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "numerical",
    question: "Reference string 0 1 2 3 0 1 4 0 1 2 3 4 with FIFO. Compare the faults with 3 frames and with 4 frames.",
    options: ["3 frames: 9; 4 frames: 10 (Belady's anomaly)", "3 frames: 10; 4 frames: 9", "3 frames: 9; 4 frames: 8", "Both 12"],
    answer: 0,
    explanation: "This string has the same structure as 1 2 3 4 1 2 5 1 2 3 4 5 (relabelled), so FIFO shows the anomaly: 9 faults with 3 frames but 10 with 4. Under LRU the counts are 10 and 8 — more frames never hurt a stack algorithm.",
    optionExplanations: ["Correct.", "Reversed.", "FIFO doesn't improve here.", "Some references hit."]
  },
  {
    id: "os-vm-032", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "easy", type: "concept",
    question: "What does the dirty (modified) bit of a page indicate?",
    options: ["The page contains malware", "The page has been written to since it was loaded, so it must be written back to disk before its frame is reused", "The page is in the TLB", "The page belongs to the kernel"],
    answer: 1,
    explanation: "Clean pages can simply be discarded (their copy on disk is still valid), halving the I/O cost of a replacement. Hardware sets the dirty bit automatically on writes.",
    optionExplanations: ["It's about modifications.", "Correct.", "TLB residency isn't tracked by this bit.", "Ownership uses other bits."]
  },
  {
    id: "os-vm-033", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "concept",
    question: "A process's working set is 400 pages, but it's allocated only 300 frames under local replacement. What behaviour do you expect?",
    options: ["Normal performance", "Persistent high fault rates (thrashing for this process): pages it actively needs keep getting evicted and faulted back in", "The process is killed immediately", "The process uses the CPU more efficiently"],
    answer: 1,
    explanation: "When allocated frames are below the working-set size, the process can't hold its active pages. The OS should give it more frames or suspend it (or another process) until enough memory is available.",
    optionExplanations: ["Its active pages don't fit.", "Correct.", "The OS doesn't kill it for this.", "It spends time waiting for page-ins."]
  },
  {
    id: "os-vm-034", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "medium", type: "concept",
    question: "What does LRU replacement evict?",
    options: ["The page loaded earliest", "The page that hasn't been referenced for the longest time", "The page referenced least often in total", "The page that will be used farthest in the future"],
    answer: 1,
    explanation: "FIFO uses load time, LFU uses reference counts, OPT uses future references, and LRU uses the most recent reference time, betting that the recent past predicts the near future (temporal locality).",
    optionExplanations: ["That's FIFO.", "Correct.", "That's LFU.", "That's OPT."]
  },
  {
    id: "os-vm-035", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "hard", type: "concept",
    question: "How can LRU be implemented exactly, and why is each approach costly?",
    options: ["It can't be implemented", "With a timestamp/counter written to each PTE on every reference (search for the minimum on replacement) or a stack/doubly-linked list moved on every reference — both require work on every memory access, so hardware support would be needed", "With the dirty bit alone", "By sorting pages once per second"],
    answer: 1,
    explanation: "Updating structures at memory-access speed is impractical in software, so real systems approximate LRU with reference bits (clock, aging with shift registers, Linux's active/inactive lists).",
    optionExplanations: ["It can, but expensively.", "Correct.", "The dirty bit tracks writes, not recency.", "That's an approximation, not exact LRU."]
  },
  {
    id: "os-vm-036", subject: "os", subtopic: "Virtual Memory & Page Replacement", difficulty: "easy", type: "concept",
    question: "Which is a benefit of virtual memory?",
    options: ["Programs must fit entirely in RAM", "Programs can be larger than physical memory, more processes can be kept in memory at once, and processes are isolated from each other", "It eliminates all disk I/O", "It makes the CPU faster"],
    answer: 1,
    explanation: "Virtual memory decouples logical address spaces from physical RAM. The cost is page faults when the active set doesn't fit and the hardware/OS complexity of translation.",
    optionExplanations: ["That's the limitation virtual memory removes.", "Correct.", "Paging adds disk I/O.", "CPU speed is unchanged."]
  }
);
