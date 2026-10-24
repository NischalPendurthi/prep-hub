/* Computer Networks — Flow Control & ARQ */
window.QUESTIONS.push(
  {
    id: "cn-flow-001", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "easy", type: "concept",
    question: "How do flow control, error control and congestion control differ?",
    options: ["They're the same", "Congestion control protects the receiver", "Flow control stops a fast sender from overwhelming a slow RECEIVER; error control detects and recovers lost/corrupted data (ACKs, retransmissions); congestion control stops senders from overwhelming the NETWORK", "Flow control fixes bit errors"],
    answer: 2,
    explanation: "Flow control is end-to-end (or per link) between two parties; congestion control concerns shared network capacity. TCP does all three: receive window (flow), ACK/retransmission (error), cwnd algorithms (congestion).",
    optionExplanations: ["They address different problems.", "That's flow control.", "Correct.", "That's error control."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-flow-002", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "easy", type: "concept",
    question: "How does the Stop-and-Wait protocol work?",
    options: ["The sender transmits all frames at once", "The receiver requests frames by number", "The sender transmits one frame and waits for its acknowledgement before sending the next; with ARQ, it retransmits after a timeout if no ACK arrives", "Frames are never acknowledged"],
    answer: 2,
    explanation: "Stop-and-Wait is simple but leaves the link idle while waiting for each ACK, which is very inefficient on links with a large bandwidth-delay product (e.g. satellite).",
    optionExplanations: ["That's unrestricted sending.", "That's a different scheme.", "Correct.", "ACKs are central to it."]
  },
  {
    id: "cn-flow-003", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "concept",
    question: "Why does Stop-and-Wait ARQ need sequence numbers (alternating 0 and 1)?",
    options: ["To encrypt frames", "To count bytes", "To order frames from different senders", "If an ACK is lost, the sender retransmits the same frame; without a sequence number the receiver couldn't tell a retransmission from a new frame and would accept a duplicate"],
    answer: 3,
    explanation: "A 1-bit sequence number suffices because only one frame is outstanding at a time. ACKs also carry numbers so a delayed ACK for an old frame isn't mistaken for the current one.",
    optionExplanations: ["Sequence numbers don't encrypt.", "They identify frames, not bytes.", "There's one sender in this context.", "Correct."]
  },
  {
    id: "cn-flow-004", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "numerical",
    question: "A 1 Mbps link carries 1,000-bit frames with a one-way propagation delay of 20 ms. What is the efficiency (utilisation) of Stop-and-Wait, ignoring ACK transmission time?",
    options: ["50%", "4.76%", "2.44%", "97.6%"],
    answer: 2,
    explanation: "Transmission time Tt = 1,000 / 10⁶ = 1 ms. a = Tp / Tt = 20. Efficiency = Tt / (Tt + 2Tp) = 1 / (1 + 2a) = 1 / 41 ≈ 2.44%. The sender spends 1 ms sending and 40 ms waiting for the ACK.",
    optionExplanations: ["That would require a = 0.5.", "That uses 1 / (1 + a).", "Correct.", "That's the idle fraction."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-flow-005", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "numerical",
    question: "Same link (1 Mbps, 1,000-bit frames, 20 ms one-way delay, Stop-and-Wait). What is the effective throughput?",
    options: ["1 Mbps", "About 2.44 kbps", "About 500 kbps", "About 24.4 kbps"],
    answer: 3,
    explanation: "Throughput = efficiency × bandwidth = (1/41) × 1 Mbps ≈ 24.4 kbps; equivalently, 1,000 bits delivered every 41 ms.",
    optionExplanations: ["That's the raw link rate.", "That's off by a factor of 10.", "That's off by a factor of 20.", "Correct."]
  },
  {
    id: "cn-flow-006", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "hard", type: "numerical",
    question: "Same link (Tt = 1 ms, Tp = 20 ms). What sender window size (in frames) is needed for 100% utilisation with a sliding-window protocol, and how many sequence-number bits does Go-Back-N then need?",
    options: ["21 frames; 5 bits", "40 frames; 6 bits", "41 frames; 6 bits", "41 frames; 7 bits"],
    answer: 2,
    explanation: "To keep the pipe full, the sender must transmit for a full round trip: W = (Tt + 2Tp) / Tt = 1 + 2a = 41 frames. GBN requires W ≤ 2^k − 1 → 2^k ≥ 42 → k = 6 (63). Selective Repeat would need W ≤ 2^(k−1) → k = 7.",
    optionExplanations: ["The window must cover the whole round trip (2Tp).", "1 + 2a = 41, not 40.", "Correct.", "7 bits is the Selective Repeat requirement."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-flow-007", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "easy", type: "concept",
    question: "In Go-Back-N ARQ, what happens when a frame is lost?",
    options: ["Only the lost frame is resent", "The receiver discards all later out-of-order frames; on timeout the sender retransmits the lost frame AND all frames sent after it", "The connection is reset", "The receiver buffers later frames"],
    answer: 1,
    explanation: "GBN keeps the receiver simple (window size 1, cumulative ACKs, no buffering) at the cost of wasted bandwidth after losses. Selective Repeat retransmits only the missing frames.",
    optionExplanations: ["That's Selective Repeat.", "Correct.", "Losses are handled by retransmission.", "GBN receivers don't buffer out-of-order frames."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-flow-008", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "numerical",
    question: "With k-bit sequence numbers, what are the maximum sender window sizes for Go-Back-N and for Selective Repeat?",
    options: ["2^k and 2^k", "2^k − 1 and 2^(k−1)", "2^(k−1) and 2^k − 1", "k and 2k"],
    answer: 1,
    explanation: "GBN: W ≤ 2^k − 1 (e.g. 7 with 3 bits), so a full window of new frames can't be confused with retransmissions. SR: sender and receiver windows ≤ 2^(k−1) (e.g. 4 with 3 bits), so the receiver's new window never overlaps the old one.",
    optionExplanations: ["Using all 2^k numbers causes ambiguity.", "Correct.", "Reversed.", "Window limits are powers of two."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-flow-009", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "hard", type: "concept",
    question: "Selective Repeat uses 2-bit sequence numbers (0–3) but a window of 3. Frames 0, 1, 2 arrive correctly, but all three ACKs are lost. What goes wrong?",
    options: ["Nothing", "The receiver rejects all frames", "The sender crashes", "The receiver's window has moved to expect 3, 0, 1. When the sender times out and resends the OLD frame 0, the receiver accepts it as a NEW frame 0 — duplicate data is delivered. Hence SR's window must be ≤ 2^(k−1) = 2"],
    answer: 3,
    explanation: "When windows overlap in sequence space, the receiver can't distinguish retransmissions from new frames. Limiting the window to half the sequence space guarantees the old and new windows are disjoint.",
    optionExplanations: ["The overlap causes a silent duplicate.", "The duplicate is accepted, not rejected.", "The sender just retransmits.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "cn-flow-010", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "concept",
    question: "How does Selective Repeat differ from Go-Back-N?",
    options: ["They're the same", "SR retransmits everything after a loss", "SR acknowledges frames individually, the receiver buffers out-of-order frames, and only lost or corrupted frames are retransmitted — more efficient on lossy links but needs receiver buffers and more complex logic", "SR uses cumulative ACKs only"],
    answer: 2,
    explanation: "GBN wastes bandwidth resending good frames; SR wastes memory and complexity. TCP behaves like a hybrid: cumulative ACKs with buffering of out-of-order data, and SACK options for selective retransmission.",
    optionExplanations: ["Their recovery differs.", "That's GBN.", "Correct.", "SR uses individual ACKs."]
  },
  {
    id: "cn-flow-011", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "hard", type: "numerical",
    question: "A sender must deliver frames 0–6 with window size 4. Frame 2 is lost once; everything else arrives. Assume the sender keeps transmitting whatever its window allows until a timeout. How many frame transmissions occur with Go-Back-N and with Selective Repeat?",
    options: ["GBN 8, SR 8", "GBN 14, SR 11", "GBN 9, SR 7", "GBN 11, SR 8"],
    answer: 3,
    explanation: "GBN: sends 0–3; ACKs for 0 and 1 slide the window, so 4 and 5 are sent (6 transmissions, window now 2–5). Frame 2 times out → resend 2, 3, 4, 5 (4), then 6 (1). Total 11. SR: sends 0–6 once (7) plus only frame 2 again (1) = 8.",
    optionExplanations: ["GBN resends frames after the loss.", "Too many retransmissions.", "GBN keeps sending until the timeout.", "Correct."]
  },
  {
    id: "cn-flow-012", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "concept",
    question: "What is a cumulative acknowledgement?",
    options: ["An ACK for every byte separately", "A negative acknowledgement", "An ACK sent only at the end of a transfer", "An ACK numbered n means all frames/bytes up to (and excluding, in TCP's convention) n have been received correctly, so a single ACK can confirm many frames and lost ACKs are covered by later ones"],
    answer: 3,
    explanation: "GBN and TCP use cumulative ACKs. In TCP, the acknowledgement number is the NEXT byte expected. Selective ACKs (SACK) supplement this by reporting received blocks beyond a gap.",
    optionExplanations: ["One ACK can cover many frames.", "A NAK reports a missing frame.", "ACKs flow continuously.", "Correct."]
  },
  {
    id: "cn-flow-013", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "easy", type: "concept",
    question: "What is piggybacking?",
    options: ["Sending duplicate frames", "Attaching an acknowledgement to an outgoing DATA frame travelling in the reverse direction, instead of sending a separate ACK frame, saving bandwidth in two-way communication", "Compressing headers", "Routing through multiple paths"],
    answer: 1,
    explanation: "TCP piggybacks ACKs on data segments; delayed ACKs wait briefly (up to ~200 ms or every second segment) to give data a chance to carry the ACK.",
    optionExplanations: ["Not about duplicates.", "Correct.", "Not header compression.", "Not about routing."]
  },
  {
    id: "cn-flow-014", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "concept",
    question: "What's the advantage of a receiver sending a NAK (negative acknowledgement) when it detects a missing or corrupted frame?",
    options: ["The sender can retransmit immediately instead of waiting for a timeout, reducing recovery delay", "It slows the sender down", "It replaces all ACKs", "It encrypts the retransmission"],
    answer: 0,
    explanation: "NAKs speed up recovery when the receiver notices a gap (e.g. frame 3 arrives but 2 didn't). TCP's analogue is the duplicate ACK, which triggers fast retransmit after three duplicates.",
    optionExplanations: ["Correct.", "It speeds up recovery.", "ACKs are still used.", "NAKs don't encrypt."]
  },
  {
    id: "cn-flow-015", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "numerical",
    question: "Each frame is lost independently with probability p = 0.2, and lost frames are retransmitted until successful. What's the expected number of transmissions per frame?",
    options: ["1.2", "1.25", "5", "0.8"],
    answer: 1,
    explanation: "The number of attempts is geometric with success probability 1 − p, so the expectation is 1 / (1 − p) = 1 / 0.8 = 1.25. Effective Stop-and-Wait efficiency drops by the same factor: (1 − p) / (1 + 2a).",
    optionExplanations: ["That's 1 + p, an approximation.", "Correct.", "That's 1 / p.", "At least one transmission is always needed."]
  },
  {
    id: "cn-flow-016", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "numerical",
    question: "A path has bandwidth 1 Gbps and RTT 100 ms. What is the bandwidth-delay product, and why does it matter?",
    options: ["10 MB; it's the maximum file size", "12.5 MB (100 Mbit): the amount of data 'in flight' needed to keep the pipe full, so the sender's window must be at least this large to use the full bandwidth", "100 KB; it's the MTU", "1 GB; it's the buffer size of the router"],
    answer: 1,
    explanation: "BDP = 10⁹ bit/s × 0.1 s = 10⁸ bits = 12.5 MB. With TCP's original 64 KB maximum window, throughput would cap at 64 KB / 0.1 s ≈ 5.2 Mbps on this path, which is why window scaling exists.",
    optionExplanations: ["Recompute: 10⁸ bits = 12.5 MB, and it isn't a file limit.", "Correct.", "The MTU is unrelated.", "That's off by orders of magnitude."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-flow-017", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "hard", type: "numerical",
    question: "Sliding window with W = 7 frames and a = Tp/Tt = 10. What is the link utilisation?",
    options: ["33.3%", "100%", "70%", "4.8%"],
    answer: 0,
    explanation: "Utilisation = W / (1 + 2a) if W < 1 + 2a, else 100%. Here 1 + 2a = 21 > 7, so U = 7 / 21 ≈ 33.3%. A window of 21 or more would keep the link fully busy.",
    optionExplanations: ["Correct.", "The window is smaller than 1 + 2a.", "Utilisation isn't W × 10%.", "That's Stop-and-Wait (W = 1)."]
  },
  {
    id: "cn-flow-018", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "hard", type: "numerical",
    question: "A 10 Mbps link with one-way propagation delay 5 ms sends 4 KB (4,096-byte) frames using Stop-and-Wait. Approximately what is the utilisation?",
    options: ["About 25%", "About 50%", "About 76%", "About 3%"],
    answer: 0,
    explanation: "Tt = 4,096 × 8 / 10⁷ ≈ 3.28 ms. a = 5 / 3.28 ≈ 1.53. U = 1 / (1 + 2a) ≈ 1 / 4.05 ≈ 24.7%. Larger frames or a window > 1 would improve it.",
    optionExplanations: ["Correct.", "That would require a ≈ 0.5.", "That's the idle fraction.", "That would require a much longer delay."]
  },
  {
    id: "cn-flow-019", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "concept",
    question: "In Stop-and-Wait ARQ, how are these three failures handled: (1) data frame lost, (2) ACK lost, (3) ACK delayed beyond the timeout?",
    options: ["All are ignored", "The connection is closed in all cases", "(1) Sender times out and retransmits; (2) sender times out and retransmits, and the receiver uses the sequence number to discard the duplicate (re-ACKing it); (3) sender retransmits, and the late ACK is recognised by its number and doesn't confuse the next frame", "Only (1) is handled"],
    answer: 2,
    explanation: "Timeouts plus sequence-numbered frames and ACKs handle all three cases correctly. The timeout must be longer than the round-trip time, or unnecessary retransmissions occur.",
    optionExplanations: ["The protocol recovers from all three.", "Recovery happens via retransmission.", "Correct.", "All three are handled."]
  },
  {
    id: "cn-flow-020", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "concept",
    question: "In Go-Back-N, what is the receiver's window size, and what does that imply?",
    options: ["Equal to the sender window; it buffers out-of-order frames", "1: it accepts only the next expected frame in order and discards everything else, so no reordering buffer is needed", "2^k", "0"],
    answer: 1,
    explanation: "A window of 1 means the receiver keeps track of a single expected sequence number. Selective Repeat uses equal sender and receiver windows to buffer out-of-order frames.",
    optionExplanations: ["That's Selective Repeat.", "Correct.", "That's not GBN's receiver window.", "It must accept the next frame."]
  },
  {
    id: "cn-flow-021", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "hard", type: "numerical",
    question: "A Selective Repeat sender needs a window of 41 frames to fill the pipe. What's the minimum number of sequence-number bits?",
    options: ["7", "6", "5", "8"],
    answer: 0,
    explanation: "SR requires W ≤ 2^(k−1): 2^(k−1) ≥ 41 → k − 1 = 6 → k = 7 (sequence space 128, window up to 64). GBN would need only 6 bits (W ≤ 63).",
    optionExplanations: ["Correct.", "6 bits allow an SR window of only 32.", "Far too few.", "7 bits already suffice."]
  },
  {
    id: "cn-flow-022", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "easy", type: "concept",
    question: "What does a sliding-window protocol allow that Stop-and-Wait doesn't?",
    options: ["Error detection", "Multiple frames to be outstanding (sent but not yet acknowledged) at once, up to the window size, keeping the link busy during the round trip (pipelining)", "Encryption", "Variable frame sizes"],
    answer: 1,
    explanation: "As ACKs arrive, the window 'slides' forward to allow new frames. GBN and Selective Repeat are the two classic sliding-window ARQ protocols.",
    optionExplanations: ["Stop-and-Wait also detects errors.", "Correct.", "Unrelated.", "Frame size is a separate issue."]
  },
  {
    id: "cn-flow-023", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "concept",
    question: "When does Stop-and-Wait perform reasonably well?",
    options: ["When the propagation delay is small relative to the frame transmission time (a = Tp/Tt is small), e.g. short LAN links with large frames", "On long satellite links", "When frames are tiny", "When the bandwidth is very high"],
    answer: 0,
    explanation: "Efficiency 1/(1 + 2a) approaches 100% as a → 0. High bandwidth or long distances increase a, which is why pipelining is essential on modern networks.",
    optionExplanations: ["Correct.", "Long delays make a large.", "Small frames increase a.", "High bandwidth shrinks Tt, increasing a."]
  },
  {
    id: "cn-flow-024", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "hard", type: "concept",
    question: "In Go-Back-N with 3-bit sequence numbers, why is a sender window of 8 unsafe?",
    options: ["It's safe", "The receiver window would be 8", "8 frames don't fit in memory", "If the sender sends frames 0–7 and all 8 ACKs are lost, it retransmits frame 0; the receiver, now expecting the NEXT frame numbered 0 (after 7), accepts the old frame 0 as new data. With W ≤ 7 this ambiguity can't occur"],
    answer: 3,
    explanation: "With W = 2^k, the set of possible 'next expected' numbers after a full window wraps onto the old window. Leaving one sequence number unused (W ≤ 2^k − 1) breaks the tie.",
    optionExplanations: ["It causes a silent duplicate.", "GBN's receiver window is 1.", "Memory isn't the concern.", "Correct."]
  },
  {
    id: "cn-flow-025", subject: "networks", subtopic: "Flow Control & ARQ", difficulty: "medium", type: "concept",
    question: "How should an ARQ retransmission timeout be chosen?",
    options: ["Slightly larger than the expected round-trip time (frame + propagation both ways + processing + ACK): too short causes needless retransmissions; too long slows recovery from real losses", "As small as possible", "Exactly equal to the frame transmission time", "Random"],
    answer: 0,
    explanation: "On variable-delay paths (the Internet), TCP adapts its timeout using RTT measurements (SRTT and RTTVAR, Jacobson's algorithm) rather than a fixed value.",
    optionExplanations: ["Correct.", "Too short triggers spurious retransmissions.", "The ACK needs a full round trip.", "It should track the RTT."]
  }
);
