/* Computer Networks — TCP Flow & Congestion Control */
window.QUESTIONS.push(
  {
    id: "cn-congestion-001", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "easy", type: "concept",
    question: "In TCP, what's the difference between flow control and congestion control?",
    options: ["Flow control protects the RECEIVER's buffer using the advertised receive window (rwnd); congestion control protects the NETWORK using the sender's congestion window (cwnd), inferred from loss or delay", "They're the same mechanism", "Flow control is done by routers", "Congestion control uses the receiver's buffer size"],
    answer: 0,
    explanation: "The sender may have at most min(cwnd, rwnd) unacknowledged bytes in flight. A fast receiver on a congested path is limited by cwnd; a slow receiver on an idle path by rwnd.",
    optionExplanations: ["Correct.", "They address different bottlenecks.", "Routers don't run TCP flow control.", "That's flow control."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-congestion-002", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "easy", type: "concept",
    question: "How large is a TCP sender's effective window?",
    options: ["min(cwnd, rwnd)", "cwnd + rwnd", "max(cwnd, rwnd)", "Always 64 KB"],
    answer: 0,
    explanation: "Both constraints must hold at once: the network (cwnd) and the receiver (rwnd). Throughput is roughly effective window / RTT.",
    optionExplanations: ["Correct.", "The limits don't add.", "Using the larger would overrun one of them.", "Windows vary dynamically."]
  },
  {
    id: "cn-congestion-003", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "A receiver's buffer fills up and it advertises a window of 0. How does the sender avoid deadlock if the later window update is lost?",
    options: ["It closes the connection", "It keeps sending at full speed", "It starts a persist timer and periodically sends small window probes; the receiver's response reveals when space is available again", "The receiver sends RST"],
    answer: 2,
    explanation: "Without probes, a lost window-update ACK would leave the sender waiting for a window that the receiver thinks it already announced: a deadlock. Window probes are sent with exponential backoff.",
    optionExplanations: ["The connection stays open.", "It must not overrun the receiver.", "Correct.", "There's no error."]
  },
  {
    id: "cn-congestion-004", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "What is silly window syndrome, and how is it avoided?",
    options: ["A slow-reading receiver advertises tiny windows (e.g. 1 byte) and the sender sends tiny segments, wasting bandwidth on 40-byte headers. Fixes: the receiver waits until it can advertise a reasonable window (Clark's solution, e.g. one MSS or half the buffer), and the sender uses Nagle's algorithm to avoid tiny segments", "Using windows that are too large", "A Windows OS bug", "Sending too many ACKs"],
    answer: 0,
    explanation: "Both ends contribute: receivers shouldn't announce tiny increments and senders shouldn't send tiny payloads when larger ones can be accumulated.",
    optionExplanations: ["Correct.", "It's about tiny windows.", "It's a protocol-level issue.", "ACK frequency isn't the cause."]
  },
  {
    id: "cn-congestion-005", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "numerical",
    question: "A TCP connection has a 64 KB window and an RTT of 50 ms. What is its maximum throughput (ignoring other limits)?",
    options: ["About 1.3 Mbps", "About 64 Mbps", "About 10.5 Mbps", "About 105 Mbps"],
    answer: 2,
    explanation: "Throughput ≤ window / RTT = (64 × 1024 × 8 bits) / 0.05 s ≈ 10.49 Mbps. Doubling the RTT halves the throughput — why long-distance transfers need large windows.",
    optionExplanations: ["Recompute: 524,288 bits / 0.05 s.", "That confuses the window size with a rate.", "Correct.", "Off by a factor of 10."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-congestion-006", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "hard", type: "numerical",
    question: "To fully use a 1 Gbps path with 100 ms RTT, the window must be about 12.5 MB, but TCP's window field is 16 bits (max 65,535). What minimum window-scale shift is needed?",
    options: ["8", "4", "16", "14"],
    answer: 0,
    explanation: "Needed scale ≈ 12.5 × 10⁶ / 65,535 ≈ 191, so the multiplier must be at least 191: 2⁷ = 128 is too small, 2⁸ = 256 works → shift 8. The window-scale option (max shift 14) is negotiated in the SYN.",
    optionExplanations: ["Correct.", "2⁴ = 16 is far too small.", "The maximum allowed shift is 14.", "14 works but isn't the minimum."]
  },
  {
    id: "cn-congestion-007", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "easy", type: "concept",
    question: "During TCP slow start, how does the congestion window grow?",
    options: ["By 1 MSS per RTT", "Exponentially: cwnd increases by 1 MSS for each ACK received, which roughly doubles cwnd every RTT, until it reaches ssthresh or a loss occurs", "It stays constant", "It halves every RTT"],
    answer: 1,
    explanation: "'Slow' refers to starting from a small window (1–10 MSS), not to the growth rate. Above ssthresh, TCP switches to congestion avoidance (+1 MSS per RTT).",
    optionExplanations: ["That's congestion avoidance.", "Correct.", "It grows.", "Halving happens on loss."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-congestion-008", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "easy", type: "concept",
    question: "What does AIMD mean in TCP congestion control?",
    options: ["Always Increase, Maybe Decrease", "Asynchronous Increase, Multiple Drops", "Adaptive Internet Message Delivery", "Additive Increase, Multiplicative Decrease: grow cwnd by about 1 MSS per RTT while no loss occurs, and cut it (typically in half) when loss signals congestion"],
    answer: 3,
    explanation: "AIMD produces TCP's 'sawtooth' and, as Chiu and Jain showed, converges to a fair and efficient share among competing flows.",
    optionExplanations: ["Not the acronym.", "Not the acronym.", "Not the acronym.", "Correct."]
  },
  {
    id: "cn-congestion-009", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "In TCP Tahoe, what happens on a retransmission TIMEOUT?",
    options: ["ssthresh is set to half the current cwnd, and cwnd is reset to 1 MSS; slow start begins again", "cwnd is halved", "cwnd doubles", "Nothing; only the segment is resent"],
    answer: 0,
    explanation: "A timeout suggests severe congestion (nothing is getting through), so TCP restarts cautiously. All TCP variants (including Reno) still react to timeouts this way.",
    optionExplanations: ["Correct.", "That's Reno's reaction to triple duplicate ACKs.", "It shrinks drastically.", "The window is reduced too."]
  },
  {
    id: "cn-congestion-010", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "What triggers fast retransmit, and why?",
    options: ["A timeout", "A RST segment", "Receiving three DUPLICATE ACKs for the same sequence number: later segments are arriving, so a single segment was probably lost; retransmitting it immediately avoids waiting for the timeout", "A zero window"],
    answer: 2,
    explanation: "Three duplicates (four identical ACKs) are used rather than one to tolerate mild reordering. SACK lets the sender know exactly which blocks are missing.",
    optionExplanations: ["Fast retransmit happens before the timeout.", "RST aborts the connection.", "Correct.", "That's flow control."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-congestion-011", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "How does TCP Reno react to three duplicate ACKs, compared with Tahoe?",
    options: ["Reno performs fast retransmit and FAST RECOVERY: ssthresh = cwnd/2 and cwnd = ssthresh (plus 3 MSS temporarily for the duplicate ACKs), then continues with congestion avoidance — instead of dropping to 1 MSS like Tahoe", "Exactly like Tahoe", "Reno closes the connection", "Reno doubles cwnd"],
    answer: 0,
    explanation: "Duplicate ACKs prove packets are still flowing, so mild congestion is assumed and a full slow-start restart is unnecessary. NewReno improves recovery from multiple losses in one window.",
    optionExplanations: ["Correct.", "Tahoe resets to 1 MSS; Reno doesn't.", "The connection continues.", "It halves the window."]
  },
  {
    id: "cn-congestion-012", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "hard", type: "numerical",
    question: "TCP Tahoe starts with cwnd = 1 MSS and ssthresh = 16. cwnd doubles each RTT in slow start (capped at ssthresh) and grows by 1 per RTT above it. A timeout occurs during RTT 9, when cwnd = 20. What is cwnd during RTTs 10 through 15?",
    options: ["10, 11, 12, 13, 14, 15", "1, 2, 4, 8, 10, 11", "1, 2, 4, 8, 16, 17", "20, 21, 22, 23, 24, 25"],
    answer: 1,
    explanation: "RTTs 1–9: 1, 2, 4, 8, 16, 17, 18, 19, 20. Timeout → ssthresh = 20/2 = 10, cwnd = 1. Slow start again: 1, 2, 4, 8, then the next doubling (16) is capped at ssthresh 10, after which congestion avoidance adds 1: 11.",
    optionExplanations: ["That's Reno's reaction to duplicate ACKs.", "Correct.", "The new ssthresh is 10, not 16.", "A timeout shrinks the window."]
  },
  {
    id: "cn-congestion-013", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "hard", type: "numerical",
    question: "Same scenario, but TCP Reno detects the loss in RTT 9 (cwnd = 20) via triple duplicate ACKs (ignore the temporary +3 inflation). What is cwnd during RTTs 10 through 13?",
    options: ["1, 2, 4, 8", "20, 21, 22, 23", "10, 11, 12, 13", "10, 20, 40, 80"],
    answer: 2,
    explanation: "Fast recovery: ssthresh = 10 and cwnd = 10, then additive increase continues: 10, 11, 12, 13. Avoiding the restart from 1 MSS is why Reno recovers throughput much faster than Tahoe after isolated losses.",
    optionExplanations: ["That's Tahoe / a timeout.", "The window is halved first.", "Correct.", "Slow start isn't re-entered."]
  },
  {
    id: "cn-congestion-014", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "numerical",
    question: "With MSS = 1 KB, cwnd starting at 1 MSS and ssthresh larger than 64 KB, how many RTTs of slow start does it take until cwnd reaches 64 KB?",
    options: ["64", "8", "6", "32"],
    answer: 2,
    explanation: "cwnd doubles each RTT: 1, 2, 4, 8, 16, 32, 64 KB — after 6 doublings (log₂64 = 6 RTTs). Linear growth would need 63 RTTs.",
    optionExplanations: ["That's linear growth.", "Recount the doublings.", "Correct.", "Growth is exponential."]
  },
  {
    id: "cn-congestion-015", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "Why does congestion avoidance increase cwnd by only about 1 MSS per RTT?",
    options: ["To save memory", "Once near the estimated capacity (ssthresh), the sender probes for extra bandwidth gently; exponential growth there would overshoot and cause many losses", "Because ACKs are slower", "Because the receiver requires it"],
    answer: 1,
    explanation: "In practice TCP adds MSS × MSS / cwnd for each ACK, which totals about 1 MSS per RTT.",
    optionExplanations: ["Memory isn't the concern.", "Correct.", "ACK timing isn't the reason.", "rwnd is separate."]
  },
  {
    id: "cn-congestion-016", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "What is ECN (Explicit Congestion Notification)?",
    options: ["A router drops packets randomly", "A new transport protocol", "An encryption scheme", "Routers MARK packets (using bits in the IP header) instead of dropping them when queues build up; the receiver echoes the mark to the sender (TCP ECE flag), which reduces cwnd as if a loss had occurred — signalling congestion without loss"],
    answer: 3,
    explanation: "ECN avoids retransmissions and latency spikes. Data-centre congestion control (DCTCP) relies heavily on ECN marks.",
    optionExplanations: ["ECN marks rather than drops.", "It extends IP and TCP.", "Unrelated to encryption.", "Correct."]
  },
  {
    id: "cn-congestion-017", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "Which congestion control algorithms are commonly used today?",
    options: ["Only Tahoe", "CUBIC (the Linux and Windows default: cwnd grows as a cubic function of time since the last loss, suited to high-BDP paths) and BBR (Google: models bottleneck bandwidth and min RTT rather than reacting to loss)", "Stop-and-wait", "RIP and OSPF"],
    answer: 1,
    explanation: "Loss-based algorithms fill buffers before reacting, contributing to 'bufferbloat'. BBR aims to keep queues short while achieving high throughput.",
    optionExplanations: ["Tahoe is historical.", "Correct.", "That's an ARQ protocol.", "Those are routing protocols."]
  },
  {
    id: "cn-congestion-018", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "How do open-loop and closed-loop congestion control differ?",
    options: ["They're the same", "Open-loop prevents congestion in advance through good design (admission control, traffic shaping, policing); closed-loop detects congestion and reacts with feedback (e.g. TCP reducing cwnd on loss or ECN)", "Closed-loop means no feedback", "Open-loop is used only in TCP"],
    answer: 1,
    explanation: "Networks typically combine both: shaping at the edges plus end-to-end feedback control.",
    optionExplanations: ["They act at different times.", "Correct.", "Closed-loop relies on feedback.", "TCP is closed-loop."]
  },
  {
    id: "cn-congestion-019", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "How does the leaky bucket algorithm shape traffic?",
    options: ["It allows unlimited bursts", "It speeds up transmission", "It drops all packets", "Packets enter a bucket (queue) and leave at a CONSTANT rate, smoothing bursts; packets arriving when the bucket is full are dropped"],
    answer: 3,
    explanation: "Leaky bucket produces a steady output stream regardless of input burstiness. The token bucket, by contrast, permits controlled bursts.",
    optionExplanations: ["That's the opposite.", "It limits the rate.", "Only overflow is dropped.", "Correct."]
  },
  {
    id: "cn-congestion-020", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "hard", type: "numerical",
    question: "A token bucket has capacity 1 MB, a token fill rate of 2 MB/s, and the line's maximum output rate is 10 MB/s. Starting with a full bucket, how long can the host transmit at the full 10 MB/s, and how much data is sent in that burst?",
    options: ["0.125 s, 1.25 MB", "0.1 s, 1 MB", "0.5 s, 5 MB", "1 s, 10 MB"],
    answer: 0,
    explanation: "During a burst of length S, tokens consumed = M·S = C + r·S → S = C / (M − r) = 1 / (10 − 2) = 0.125 s. Data sent = 10 MB/s × 0.125 s = 1.25 MB (the initial 1 MB of tokens plus 0.25 MB refilled during the burst).",
    optionExplanations: ["Correct.", "That ignores tokens refilled during the burst.", "Recompute C / (M − r).", "The bucket only holds 1 MB."]
  },
  {
    id: "cn-congestion-021", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "What signals do TCP congestion control algorithms use to detect congestion?",
    options: ["DNS errors", "Packet loss (timeouts, duplicate ACKs), increasing delay/RTT (delay-based algorithms like Vegas, BBR's model), and explicit ECN marks", "Port numbers", "The MAC address"],
    answer: 1,
    explanation: "On wireless links, losses may come from interference rather than congestion, which can mislead loss-based algorithms.",
    optionExplanations: ["DNS is unrelated.", "Correct.", "Ports are unrelated.", "MACs are unrelated."]
  },
  {
    id: "cn-congestion-022", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "hard", type: "concept",
    question: "Two TCP flows using AIMD share a bottleneck, starting with very different windows. Why do they converge toward equal shares?",
    options: ["Routers enforce equal shares", "They don't converge", "The faster flow stops sending", "Additive increase adds the SAME amount to both windows (preserving their difference), while multiplicative decrease halves both (halving their difference). Repeated cycles shrink the gap, moving the system toward the fairness line"],
    answer: 3,
    explanation: "This Chiu-Jain argument assumes equal RTTs; flows with shorter RTTs increase faster and get larger shares in practice (RTT unfairness).",
    optionExplanations: ["Standard routers don't enforce fairness.", "AIMD does converge (with equal RTTs).", "Both keep sending.", "Correct."]
  },
  {
    id: "cn-congestion-023", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "hard", type: "concept",
    question: "What is bufferbloat?",
    options: ["Packets that are too large", "Excessively large router/modem buffers let loss-based TCP keep filling queues before any packet is dropped, so latency balloons (seconds) under load without improving throughput; fixes include active queue management (CoDel, FQ-CoDel) and delay-aware congestion control", "A memory leak in browsers", "Too many TCP connections"],
    answer: 1,
    explanation: "Symptom: video calls stutter whenever someone uploads a big file at home. Smart queue management keeps queues short while still absorbing bursts.",
    optionExplanations: ["It's about queues, not packet size.", "Correct.", "It's a network phenomenon.", "It can happen with one connection."]
  },
  {
    id: "cn-congestion-024", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "easy", type: "concept",
    question: "What is ssthresh in TCP congestion control?",
    options: ["The receiver's buffer size", "The retransmission timeout", "The maximum segment size", "The slow-start threshold: the cwnd value at which TCP switches from exponential slow start to linear congestion avoidance; it's set to half the window when a loss is detected"],
    answer: 3,
    explanation: "ssthresh remembers roughly where congestion was last seen, so TCP grows quickly up to that point and cautiously beyond it.",
    optionExplanations: ["That's rwnd.", "That's RTO.", "That's MSS.", "Correct."]
  },
  {
    id: "cn-congestion-025", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "medium", type: "concept",
    question: "Why do UDP-based applications (e.g. video streaming over QUIC or WebRTC) still implement congestion control?",
    options: ["UDP requires it", "To encrypt data", "Without it they could overload links and starve TCP flows sharing the network (congestion collapse); being good network citizens, they implement their own rate adaptation (QUIC uses CUBIC/BBR-like algorithms; WebRTC uses GCC)", "To reduce the header size"],
    answer: 2,
    explanation: "The 1986 Internet congestion collapse — throughput dropping by a factor of ~1000 — is what led to TCP's congestion control in the first place.",
    optionExplanations: ["UDP provides no congestion control.", "Unrelated.", "Correct.", "Unrelated."]
  },
  {
    id: "cn-congestion-026", subject: "networks", subtopic: "TCP Flow & Congestion Control", difficulty: "hard", type: "concept",
    question: "A sender has cwnd = 40 segments but the receiver advertises rwnd = 10 segments. The RTT is 100 ms and MSS 1,460 bytes. What limits throughput and roughly what is it?",
    options: ["cwnd; about 4.7 Mbps", "cwnd; about 1.17 Mbps", "The link speed; unknown", "rwnd; about 1.17 Mbps"],
    answer: 3,
    explanation: "Effective window = min(40, 10) = 10 segments = 14,600 bytes per RTT. Throughput ≈ 14,600 × 8 / 0.1 ≈ 1.17 Mbps. Here the receiver (flow control), not the network, is the bottleneck.",
    optionExplanations: ["The smaller window applies.", "rwnd, not cwnd, is the limit.", "The windows give a bound.", "Correct."]
  }
);
