/* Operating Systems — CPU Scheduling */
window.QUESTIONS.push(
  {
    id: "os-sched-001", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "concept",
    question: "For a process with arrival time AT, burst time BT and completion time CT, which formulas are correct?",
    options: ["TAT = CT − BT; WT = TAT − AT", "TAT = BT − AT; WT = CT − BT", "TAT = CT − AT; WT = TAT − BT", "TAT = CT + AT; WT = TAT + BT"],
    answer: 2,
    explanation: "Turnaround time is the total time in the system (completion − arrival). Waiting time is turnaround minus the time actually spent running (for CPU-only processes). Response time is the time from arrival until the process first gets the CPU.",
    optionExplanations: ["TAT subtracts arrival time, not burst time.", "TAT is measured from arrival to completion.", "Correct.", "Times are differences, not sums."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sched-002", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "numerical",
    question: "Processes arrive at time 0 in the order P1 (burst 24), P2 (3), P3 (3). What is the average waiting time under FCFS?",
    options: ["3", "17", "27", "10"],
    answer: 1,
    explanation: "Gantt: P1 [0–24], P2 [24–27], P3 [27–30]. Waiting times: P1 = 0, P2 = 24, P3 = 27. Average = 51 / 3 = 17.",
    optionExplanations: ["That's the average if the short jobs ran first.", "Correct.", "That's the average turnaround time.", "Recompute: (0 + 24 + 27) / 3."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sched-003", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "numerical",
    question: "The same three processes P1 (24), P2 (3), P3 (3) arrive at time 0, but now in the order P2, P3, P1. What's the average waiting time under FCFS?",
    options: ["3", "17", "6", "13"],
    answer: 0,
    explanation: "Gantt: P2 [0–3], P3 [3–6], P1 [6–30]. Waiting: P2 = 0, P3 = 3, P1 = 6. Average = 9 / 3 = 3. The huge difference from 17 shows FCFS's sensitivity to arrival order: the CONVOY EFFECT, where short jobs wait behind a long one.",
    optionExplanations: ["Correct.", "That's the result with P1 first.", "That's P1's waiting time only.", "That's the average turnaround time."]
  },
  {
    id: "os-sched-004", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "concept",
    question: "What is the convoy effect?",
    options: ["Processes moving between CPUs", "In FCFS, many short (often I/O-bound) processes wait behind one long CPU-bound process, lowering CPU and device utilisation and increasing average waiting time", "Too many context switches in Round Robin", "Priority inversion"],
    answer: 1,
    explanation: "While the long job hogs the CPU, I/O devices sit idle; then all short jobs rush through the CPU and queue at the devices while the CPU idles. Preemptive or shortest-job-first policies avoid it.",
    optionExplanations: ["That's migration.", "Correct.", "That's RR overhead with a tiny quantum.", "Priority inversion is a synchronisation issue."]
  },
  {
    id: "os-sched-005", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "concept",
    question: "What distinguishes preemptive from non-preemptive scheduling?",
    options: ["Preemptive scheduling never switches processes", "In preemptive scheduling, the OS can take the CPU away from a running process (e.g. when its quantum expires or a higher-priority process arrives); in non-preemptive scheduling a process keeps the CPU until it blocks or terminates", "Non-preemptive scheduling uses time quanta", "They differ only in tie-breaking"],
    answer: 1,
    explanation: "FCFS and SJF are non-preemptive; SRTF, Round Robin and preemptive priority are preemptive. Preemption improves responsiveness but adds context switches and requires care with shared data (race conditions).",
    optionExplanations: ["Preemption is exactly about switching.", "Correct.", "Time quanta are a preemptive mechanism.", "The difference is fundamental."]
  },
  {
    id: "os-sched-006", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "concept",
    question: "Which scheduling algorithm minimises the average waiting time for a given set of processes that all arrive at the same time?",
    options: ["FCFS", "Priority with random priorities", "Round Robin", "Shortest Job First (SJF)"],
    answer: 3,
    explanation: "Running shorter jobs first reduces how long the remaining jobs wait (an exchange argument proves optimality). With arrivals over time and preemption allowed, SRTF is optimal. The catch: burst lengths must be known or predicted, and long jobs can starve.",
    optionExplanations: ["FCFS ignores job length.", "Random priorities aren't optimal.", "RR improves response time, not average waiting time.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sched-007", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "concept",
    question: "What are starvation and aging?",
    options: ["Starvation: a ready process waits indefinitely because others are always preferred (e.g. low priority, long job in SJF); aging: gradually raising a waiting process's priority so it eventually runs", "Starvation: a process runs too long; aging: it's killed", "Both refer to memory leaks", "Aging lowers a process's priority over time"],
    answer: 0,
    explanation: "Aging fixes starvation in priority and shortest-job schemes: e.g. increase priority by 1 every 15 minutes of waiting. Legend says a low-priority job on an MIT IBM 7094 shut down in 1973 had been waiting since 1967.",
    optionExplanations: ["Correct.", "That's not starvation.", "They concern scheduling fairness.", "Aging RAISES priority of waiting processes."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sched-008", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "concept",
    question: "Which scheduling criteria should normally be MAXIMISED?",
    options: ["Waiting time and turnaround time", "Context-switch count", "Response time and waiting time", "CPU utilisation and throughput"],
    answer: 3,
    explanation: "Maximise CPU utilisation (keep the CPU busy) and throughput (processes completed per unit time). Minimise turnaround time, waiting time and response time. Different systems weight these differently (batch vs interactive vs real-time).",
    optionExplanations: ["These should be minimised.", "Context switches are overhead.", "These should be minimised.", "Correct."]
  },
  {
    id: "os-sched-009", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "concept",
    question: "What is the dispatcher, and what is dispatch latency?",
    options: ["The long-term scheduler and the time to load a program", "The module that gives the CPU to the process chosen by the short-term scheduler (context switch, switch to user mode, jump to the right instruction); dispatch latency is the time this takes", "The interrupt handler and interrupt latency", "The I/O scheduler and disk latency"],
    answer: 1,
    explanation: "The scheduler decides WHICH process runs next; the dispatcher performs the switch. Dispatch latency is pure overhead and should be as small as possible, since it occurs on every context switch.",
    optionExplanations: ["The dispatcher works with the short-term scheduler.", "Correct.", "Interrupt latency is a related but different measure.", "Disk scheduling is unrelated."]
  },
  {
    id: "os-sched-010", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "P1 (arrival 0, burst 8), P2 (1, 4), P3 (2, 9), P4 (3, 5). What is the average waiting time under non-preemptive SJF?",
    options: ["8.75", "7.00", "6.50", "7.75"],
    answer: 3,
    explanation: "At t = 0 only P1 is present, so it runs to completion [0–8]. Then the shortest ready job: P2 (4) [8–12], P4 (5) [12–17], P3 (9) [17–26]. WT = TAT − BT: P1 = 8 − 8 = 0; P2 = 11 − 4 = 7; P4 = 14 − 5 = 9; P3 = 24 − 9 = 15. Average = 31 / 4 = 7.75.",
    optionExplanations: ["That's FCFS.", "Recompute: (0 + 7 + 9 + 15) / 4 = 7.75.", "That's SRTF (preemptive).", "Correct."]
  },
  {
    id: "os-sched-011", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "P1 (arrival 0, burst 8), P2 (1, 4), P3 (2, 9), P4 (3, 5). What is the average waiting time under SRTF (preemptive SJF)?",
    options: ["7.75", "8.75", "5.75", "6.50"],
    answer: 3,
    explanation: "Gantt: P1 [0–1] (P2 arrives with 4 < P1's remaining 7, preempt), P2 [1–5], P4 [5–10] (5 < 7), P1 [10–17], P3 [17–26]. WT: P1 = 17 − 0 − 8 = 9; P2 = 5 − 1 − 4 = 0; P4 = 10 − 3 − 5 = 2; P3 = 26 − 2 − 9 = 15. Average = 26 / 4 = 6.5.",
    optionExplanations: ["That's non-preemptive SJF.", "That's FCFS.", "Recompute P1's waiting time: it waits 9 units.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-sched-012", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "P1 (arrival 0, burst 8), P2 (1, 4), P3 (2, 9), P4 (3, 5). What is the average turnaround time under FCFS?",
    options: ["15.25", "13.00", "14.25", "8.75"],
    answer: 0,
    explanation: "Gantt: P1 [0–8], P2 [8–12], P3 [12–21], P4 [21–26]. TAT = CT − AT: 8, 11, 19, 23. Average = 61 / 4 = 15.25. (The average waiting time is 8.75.)",
    optionExplanations: ["Correct.", "That's the SRTF average TAT.", "That's the SJF average TAT.", "That's FCFS's average waiting time."]
  },
  {
    id: "os-sched-013", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "All arrive at time 0: P1 (burst 10, priority 3), P2 (1, 1), P3 (2, 4), P4 (1, 5), P5 (5, 2). Lower number = higher priority. What is the average waiting time under non-preemptive priority scheduling?",
    options: ["8.2", "6.0", "12.0", "9.6"],
    answer: 0,
    explanation: "Order by priority: P2 [0–1], P5 [1–6], P1 [6–16], P3 [16–18], P4 [18–19]. Waiting times (= start times, since all arrive at 0): P2 0, P5 1, P1 6, P3 16, P4 18. Average = 41 / 5 = 8.2.",
    optionExplanations: ["Correct.", "That's only P1's waiting time.", "That's the average turnaround time.", "Recheck the order: P2, P5, P1, P3, P4."]
  },
  {
    id: "os-sched-014", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "P1 (burst 24), P2 (3), P3 (3) all arrive at time 0 in that order. With Round Robin and quantum 4, what is the average waiting time?",
    options: ["17.00", "4.00", "5.67", "3.00"],
    answer: 2,
    explanation: "Gantt: P1 [0–4], P2 [4–7], P3 [7–10], then P1 runs alone [10–30]. WT: P1 = 30 − 24 = 6; P2 = 7 − 3 = 4; P3 = 10 − 3 = 7. Average = 17 / 3 ≈ 5.67 — far better than FCFS's 17 for this workload.",
    optionExplanations: ["That's FCFS with P1 first.", "That's P2's waiting time.", "Correct.", "That's FCFS with the short jobs first."]
  },
  {
    id: "os-sched-015", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "FCFS: P1 (arrival 0, burst 3), P2 (5, 2), P3 (6, 4). What is the CPU utilisation from time 0 until all processes finish?",
    options: ["100%", "75%", "81.8%", "90%"],
    answer: 2,
    explanation: "Gantt: P1 [0–3], idle [3–5] (nothing has arrived), P2 [5–7], P3 [7–11]. Busy time = 3 + 2 + 4 = 9 out of 11 → 9 / 11 ≈ 81.8%. Remember idle gaps when a process arrives after the CPU becomes free.",
    optionExplanations: ["The CPU is idle from 3 to 5.", "Recompute: 9 / 11.", "Correct.", "The schedule length is 11, not 10."]
  },
  {
    id: "os-sched-016", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "P1 (arrival 0, burst 7), P2 (2, 4), P3 (4, 1), P4 (5, 4). What is the average waiting time under non-preemptive SJF?",
    options: ["4.00", "4.75", "3.00", "5.00"],
    answer: 0,
    explanation: "P1 runs [0–7] (only process at 0, non-preemptive). At 7, ready: P2 (4), P3 (1), P4 (4) → P3 [7–8]; then P2 and P4 tie at 4, broken by earlier arrival → P2 [8–12], P4 [12–16]. WT: P1 0, P3 = 8 − 4 − 1 = 3, P2 = 12 − 2 − 4 = 6, P4 = 16 − 5 − 4 = 7. Average = 16 / 4 = 4.0.",
    optionExplanations: ["Correct.", "That's FCFS.", "That's SRTF.", "That's Round Robin with quantum 2."]
  },
  {
    id: "os-sched-017", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "P1 (arrival 0, burst 7), P2 (2, 4), P3 (4, 1), P4 (5, 4). Under SRTF, when does P1 complete, and what is the average waiting time?",
    options: ["P1 at 16; average 3.0", "P1 at 7; average 4.0", "P1 at 11; average 3.5", "P1 at 16; average 4.0"],
    answer: 0,
    explanation: "Gantt: P1 [0–2] (P2 arrives with 4 < 5 remaining), P2 [2–4], P3 [4–5] (1 < 2 remaining of P2), P2 [5–7], P4 [7–11] (4 < P1's 5), P1 [11–16]. WT = TAT − BT: P1 = 16 − 7 = 9, P2 = 5 − 4 = 1, P3 = 1 − 1 = 0, P4 = 6 − 4 = 2. Average = 12 / 4 = 3.0.",
    optionExplanations: ["Correct.", "P1 is preempted at time 2.", "P1 resumes only at 11.", "Recompute the waiting times: 9, 1, 0, 2."]
  },
  {
    id: "os-sched-018", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "SJF predicts CPU bursts with exponential averaging τ(n+1) = α·t(n) + (1 − α)·τ(n). With α = 0.5, τ₀ = 10, and actual bursts t₀ = 6 and t₁ = 4, what is τ₂?",
    options: ["5", "8", "6", "7"],
    answer: 2,
    explanation: "τ₁ = 0.5 × 6 + 0.5 × 10 = 8. τ₂ = 0.5 × 4 + 0.5 × 8 = 6. α controls how much weight recent history gets: α = 0 ignores actual bursts, α = 1 uses only the last burst.",
    optionExplanations: ["That's the plain average of 6 and 4.", "That's τ₁.", "Correct.", "Recompute τ₂ = 2 + 4."]
  },
  {
    id: "os-sched-019", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "Under Highest Response Ratio Next (HRRN), the CPU becomes free and three processes are waiting: P2 (waited 5, burst 3), P3 (waited 3, burst 1), P4 (waited 8, burst 8). Which runs next?",
    options: ["P2", "P4", "P3", "They tie"],
    answer: 2,
    explanation: "Response ratio = (waiting time + burst) / burst. P2: (5 + 3) / 3 = 2.67; P3: (3 + 1) / 1 = 4.0; P4: (8 + 8) / 8 = 2.0. P3 has the highest ratio. HRRN favours short jobs but long jobs' ratios grow while they wait, preventing starvation.",
    optionExplanations: ["2.67 < 4.0.", "P4's ratio is only 2.0.", "Correct.", "The ratios differ."]
  },
  {
    id: "os-sched-020", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "concept",
    question: "How does the size of the Round Robin time quantum affect behaviour?",
    options: ["It has no effect", "A very large quantum makes RR behave like FCFS; a very small quantum gives better responsiveness but spends a large fraction of time on context switches", "A small quantum always improves throughput", "A large quantum causes starvation"],
    answer: 1,
    explanation: "Rule of thumb: choose the quantum so that about 80% of CPU bursts finish within one quantum, and keep it much larger than the context-switch time (e.g. quantum 10–100 ms vs switch ~ µs).",
    optionExplanations: ["It strongly affects behaviour.", "Correct.", "Overhead reduces throughput.", "RR doesn't starve processes."]
  },
  {
    id: "os-sched-021", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "Round Robin with 5 ready processes and a quantum of 20 ms (ignore switch overhead). What is the maximum time a process waits before getting its next turn on the CPU?",
    options: ["20 ms", "80 ms", "100 ms", "40 ms"],
    answer: 1,
    explanation: "With n processes, each one waits for the other n − 1 to use (at most) one quantum each: (n − 1) × q = 4 × 20 = 80 ms. This bounded wait is why RR suits interactive systems.",
    optionExplanations: ["The other 4 processes each get a quantum.", "Correct.", "That counts the process's own quantum too.", "4 processes run before it, not 2."]
  },
  {
    id: "os-sched-022", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "Round Robin with quantum 4 ms and a context-switch cost of 1 ms after every quantum (all processes are CPU-bound). What fraction of CPU time does useful work?",
    options: ["100%", "96%", "75%", "80%"],
    answer: 3,
    explanation: "Each cycle is 4 ms of work plus 1 ms of switching: efficiency = q / (q + s) = 4 / 5 = 80%. With q = 100 ms it would be ≈ 99%, but responsiveness would suffer.",
    optionExplanations: ["Switching costs time.", "That would require a much larger quantum.", "Recompute: 4 / (4 + 1).", "Correct."]
  },
  {
    id: "os-sched-023", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "concept",
    question: "Which scheduling algorithms can cause starvation (without aging)?",
    options: ["FCFS and Round Robin", "None", "Only Round Robin", "SJF, SRTF and priority scheduling"],
    answer: 3,
    explanation: "Algorithms that always pick the 'best' process by some metric can postpone the others indefinitely if better ones keep arriving (long jobs under SJF/SRTF, low priorities under priority scheduling). FCFS and RR guarantee every process eventually runs (assuming each burst finishes).",
    optionExplanations: ["These are starvation-free.", "Several algorithms can starve processes.", "RR cycles through everyone.", "Correct."]
  },
  {
    id: "os-sched-024", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "concept",
    question: "In a multilevel FEEDBACK queue (MLFQ), what happens to a process that uses its entire time quantum at the highest-priority level?",
    options: ["It's demoted to a lower-priority queue (often with a longer quantum); processes that block early stay at high priority, so interactive jobs stay responsive and CPU-bound jobs sink", "It's terminated", "It's promoted to a higher queue", "It stays in the same queue forever"],
    answer: 0,
    explanation: "MLFQ learns burst behaviour without knowing it in advance. To avoid starvation of demoted jobs, periodic 'priority boosts' move everything back to the top (aging). Unlike a plain multilevel queue, processes can move between queues.",
    optionExplanations: ["Correct.", "Using the quantum isn't an error.", "Promotion happens through aging/boosts, not for using the full quantum.", "Feedback queues move processes."]
  },
  {
    id: "os-sched-025", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "concept",
    question: "How does a plain multilevel queue (without feedback) differ from MLFQ?",
    options: ["They're identical", "Processes change queues every quantum", "Processes are permanently assigned to a queue (e.g. foreground interactive using RR, background batch using FCFS) and never move; scheduling between queues uses fixed priority or time slicing", "It uses a single queue"],
    answer: 2,
    explanation: "With fixed-priority scheduling between queues, lower queues run only when higher ones are empty, which can starve background jobs; time-slicing between queues (e.g. 80% foreground, 20% background) avoids that.",
    optionExplanations: ["MLFQ allows movement; multilevel queue doesn't.", "That's feedback behaviour.", "Correct.", "It uses several queues."]
  },
  {
    id: "os-sched-026", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "numerical",
    question: "A schedule completes 5 processes, and the last one finishes at time 25 ms (starting from 0). What is the throughput?",
    options: ["5 processes/ms", "25 processes/ms", "0.2 processes/ms (200 per second)", "0.04 processes/ms"],
    answer: 2,
    explanation: "Throughput = completed processes / elapsed time = 5 / 25 ms = 0.2 processes per ms = 200 processes per second.",
    optionExplanations: ["That's inverted units.", "That's the elapsed time.", "Correct.", "That's 1 / 25."]
  },
  {
    id: "os-sched-027", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "P1 (arrival 0, burst 8), P2 (1, 4), P3 (2, 9), P4 (3, 5). Round Robin with quantum 2; a process arriving at the same moment a quantum expires enters the ready queue before the preempted process. What is the average waiting time?",
    options: ["11.75", "10.25", "6.50", "12.75"],
    answer: 3,
    explanation: "Gantt: P1[0–2] P2[2–4] P3[4–6] P1[6–8] P4[8–10] P2[10–12] P3[12–14] P1[14–16] P4[16–18] P3[18–20] P1[20–22] P4[22–23] P3[23–26]. Completion: P1 22, P2 12, P3 26, P4 23. WT = CT − AT − BT: 14, 7, 15, 15. Average = 51 / 4 = 12.75. Small quanta improve response time (average 2) but can hurt waiting time.",
    optionExplanations: ["That's the result with quantum 4.", "Recompute the completion times.", "That's SRTF.", "Correct."]
  },
  {
    id: "os-sched-028", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "P1 (arrival 0, burst 5, priority 3), P2 (1, 3, 1), P3 (2, 8, 4), P4 (3, 6, 2); lower number = higher priority. Under PREEMPTIVE priority scheduling, what is P1's completion time and the average waiting time?",
    options: ["P1 at 5; average 5.25", "P1 at 14; average 5.25", "P1 at 14; average 5.5", "P1 at 22; average 5.5"],
    answer: 2,
    explanation: "Gantt: P1 [0–1], P2 (priority 1) preempts [1–4], P4 (priority 2) [4–10], P1 resumes [10–14], P3 [14–22]. WT: P1 = 14 − 0 − 5 = 9; P2 = 4 − 1 − 3 = 0; P4 = 10 − 3 − 6 = 1; P3 = 22 − 2 − 8 = 12. Average = 22 / 4 = 5.5. (Non-preemptive would give 5.25.)",
    optionExplanations: ["That's the non-preemptive schedule.", "5.25 is the non-preemptive average.", "Correct.", "P3 finishes at 22, not P1."]
  },
  {
    id: "os-sched-029", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "P1 (arrival 0, burst 7), P2 (2, 4), P3 (4, 1), P4 (5, 4). Round Robin with quantum 2 (new arrivals queue before a preempted process). What is the average turnaround time?",
    options: ["7.0", "9.0", "8.0", "8.75"],
    answer: 1,
    explanation: "Gantt: P1[0–2] P2[2–4] P1[4–6] P3[6–7] P2[7–9] P4[9–11] P1[11–13] P4[13–15] P1[15–16]. Completion: P1 16, P2 9, P3 7, P4 15. TAT = CT − AT: 16, 7, 3, 10. Average = 36 / 4 = 9.0.",
    optionExplanations: ["That's SRTF's average turnaround.", "Correct.", "That's non-preemptive SJF.", "That's FCFS."]
  },
  {
    id: "os-sched-030", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "P1 (arrival 0, burst 8), P2 (1, 4), P3 (2, 9), P4 (3, 5). Under SRTF, how many context switches occur after the first dispatch (count each change of the running process)?",
    options: ["3", "4", "5", "6"],
    answer: 1,
    explanation: "Gantt: P1 [0–1] → P2 [1–5] → P4 [5–10] → P1 [10–17] → P3 [17–26]. There are 4 transitions between different processes. Counting switches matters for overhead-aware questions; preemptive schedulers usually switch more than non-preemptive ones.",
    optionExplanations: ["Count each boundary between different processes.", "Correct.", "There are only five segments, so four switches.", "Too many."]
  },
  {
    id: "os-sched-031", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "P1 (arrival 0, burst 6), P2 (1, 8), P3 (2, 7), P4 (3, 3). Under SRTF (ties broken in favour of the running process), what is the average waiting time?",
    options: ["6.25", "8.75", "5.25", "7.00"],
    answer: 0,
    explanation: "No arrival ever has a strictly shorter remaining time than P1: at t = 1, P1 has 5 left vs P2's 8; at t = 3, P1 has 3 left vs P4's 3 (tie → keep P1). So P1 [0–6], then shortest available: P4 [6–9], P3 [9–16], P2 [16–24]. WT: P1 0, P4 = 9 − 3 − 3 = 3, P3 = 16 − 2 − 7 = 7, P2 = 24 − 1 − 8 = 15. Average = 25 / 4 = 6.25 — the same as non-preemptive SJF here.",
    optionExplanations: ["Correct.", "That's FCFS.", "Recompute P2's waiting time: 15.", "That isn't this schedule's average."]
  },
  {
    id: "os-sched-032", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "numerical",
    question: "Four processes arrive at time 0 with bursts P1 = 6, P2 = 8, P3 = 7, P4 = 3. What is the average waiting time under SJF?",
    options: ["7", "10.25", "6", "8"],
    answer: 0,
    explanation: "SJF order: P4 (3), P1 (6), P3 (7), P2 (8). Waiting times are the start times: P4 0, P1 3, P3 9, P2 16. Average = 28 / 4 = 7. FCFS in the order P1, P2, P3, P4 would give (0 + 6 + 14 + 21) / 4 = 10.25.",
    optionExplanations: ["Correct.", "That's FCFS in arrival order.", "Recompute: 0 + 3 + 9 + 16 = 28.", "Recompute the sum of start times."]
  },
  {
    id: "os-sched-033", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "Two periodic real-time tasks: T1 with period 50 ms and execution time 20 ms; T2 with period 100 ms and execution time 35 ms. Is the set guaranteed schedulable under Rate-Monotonic scheduling by the Liu–Layland bound?",
    options: ["No, utilisation exceeds 100%", "No: U = 0.75 > 0.69", "Yes: U = 20/50 + 35/100 = 0.75 ≤ 2(2^(1/2) − 1) ≈ 0.828", "It can't be determined"],
    answer: 2,
    explanation: "RM assigns higher priority to shorter periods. A sufficient test is U ≤ n(2^(1/n) − 1): 0.828 for n = 2, approaching ln 2 ≈ 0.693 as n grows. 0.75 ≤ 0.828, so the deadlines are guaranteed. (EDF can schedule any set with U ≤ 1.)",
    optionExplanations: ["U is 0.75, below 1.", "0.69 is the bound only as n → ∞; for n = 2 it's 0.828.", "Correct.", "The bound gives a clear answer here."]
  },
  {
    id: "os-sched-034", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "concept",
    question: "What is Earliest Deadline First (EDF) scheduling?",
    options: ["Static priorities by period", "Dynamic priority: at each moment, run the ready task whose absolute deadline is nearest; on a single preemptive processor it can meet all deadlines whenever total utilisation ≤ 100%", "FCFS with deadlines", "Round Robin with deadlines"],
    answer: 1,
    explanation: "EDF is optimal for uniprocessor preemptive scheduling of independent tasks. Its downside is unpredictable behaviour under overload (cascading deadline misses), whereas RM degrades more gracefully for high-priority tasks.",
    optionExplanations: ["That's Rate-Monotonic.", "Correct.", "Priorities change with deadlines.", "EDF isn't time-sliced."]
  },
  {
    id: "os-sched-035", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "concept",
    question: "How does Linux's Completely Fair Scheduler (CFS) decide which task runs next?",
    options: ["Strict FCFS", "It picks the runnable task with the smallest virtual runtime (vruntime), kept in a red-black tree; vruntime grows more slowly for higher-weight (lower nice) tasks, approximating ideal fair sharing", "Random selection", "Fixed time slices of 100 ms in a circular queue"],
    answer: 1,
    explanation: "CFS (and its successor EEVDF in Linux 6.6+) aims to give each task a CPU share proportional to its weight. The leftmost red-black tree node is the task that has received the least weighted CPU time. Interactive tasks that sleep a lot have small vruntimes and get scheduled quickly when they wake.",
    optionExplanations: ["CFS isn't FCFS.", "Correct.", "Selection is deterministic.", "Time slices are computed dynamically, not fixed."]
  },
  {
    id: "os-sched-036", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "concept",
    question: "In multiprocessor scheduling, what is processor affinity and why does it matter?",
    options: ["Processes prefer slower CPUs", "Assigning all processes to CPU 0", "Keeping a process on the CPU it last ran on, because its data is still in that CPU's caches (and on NUMA systems, near its memory); migrating loses that warmth", "Running a process on all CPUs simultaneously"],
    answer: 2,
    explanation: "Schedulers balance two forces: affinity (avoid migration) and load balancing (push/pull tasks so no CPU is idle while others are overloaded). Linux supports soft affinity by default and hard affinity via sched_setaffinity/taskset.",
    optionExplanations: ["CPU speed isn't the concern.", "That would waste the other CPUs.", "Correct.", "A thread runs on one CPU at a time."]
  },
  {
    id: "os-sched-037", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "P1 (arrival 0, burst 8), P2 (1, 4), P3 (2, 9), P4 (3, 5). Round Robin with quantum 4 (new arrivals queue before a preempted process). In what order do the processes COMPLETE?",
    options: ["P2, P1, P4, P3", "P1, P2, P3, P4", "P2, P4, P1, P3", "P1, P2, P4, P3"],
    answer: 0,
    explanation: "Gantt: P1 [0–4], P2 [4–8] (done at 8), P3 [8–12], P4 [12–16], P1 [16–20] (done at 20), P3 [20–24], P4 [24–25] (done at 25), P3 [25–26] (done at 26). Completion order: P2, P1, P4, P3.",
    optionExplanations: ["Correct.", "P1 needs two quanta.", "P1 finishes at 20, before P4 at 25.", "P2 finishes before P1."]
  },
  {
    id: "os-sched-038", subject: "os", subtopic: "CPU Scheduling", difficulty: "medium", type: "concept",
    question: "Why is pure SJF hard to implement in a general-purpose OS's short-term scheduler?",
    options: ["It needs too much memory", "It requires multiple CPUs", "It can't handle more than 10 processes", "The length of the next CPU burst isn't known in advance; it must be predicted (e.g. by exponential averaging of past bursts), and predictions can be wrong"],
    answer: 3,
    explanation: "Batch systems could use user-supplied time limits. Interactive systems approximate SJF using history (exponential averaging) or structures like MLFQ that infer burst behaviour.",
    optionExplanations: ["Memory isn't the issue.", "SJF works on one CPU.", "There's no such limit.", "Correct."]
  },
  {
    id: "os-sched-039", subject: "os", subtopic: "CPU Scheduling", difficulty: "easy", type: "concept",
    question: "What is response time, and which algorithm is designed primarily to keep it low for interactive users?",
    options: ["Time from arrival to completion; FCFS", "Time between two context switches; priority scheduling", "Time spent waiting for I/O; SJF", "Time from arrival until the process FIRST gets the CPU (first response); Round Robin"],
    answer: 3,
    explanation: "Interactive users care about how soon the system reacts, not when the whole job finishes. RR gives every ready process a turn within (n − 1)q, keeping response times low even when turnaround times are longer.",
    optionExplanations: ["That's turnaround time.", "That's a time slice.", "That's I/O time.", "Correct."]
  },
  {
    id: "os-sched-040", subject: "os", subtopic: "CPU Scheduling", difficulty: "hard", type: "numerical",
    question: "Three CPU-bound processes, each with burst 10, arrive at time 0. Round Robin, quantum 5, and every switch between different processes costs 1 time unit. When does the LAST process complete?",
    options: ["30", "36", "33", "35"],
    answer: 3,
    explanation: "Timeline: P1 [0–5], switch, P2 [6–11], switch, P3 [12–17], switch, P1 [18–23] (done), switch, P2 [24–29] (done), switch, P3 [30–35] (done). 30 units of work + 5 switches = 35.",
    optionExplanations: ["That ignores switching overhead.", "No switch is needed after the last process finishes.", "There are 5 switches, not 3.", "Correct."]
  }
);
