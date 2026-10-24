/* Computer Networks — Delays & Performance */
window.QUESTIONS.push(
  {
    id: "cn-perf-001", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "concept",
    question: "How do bandwidth, throughput, latency and goodput differ?",
    options: ["They're all the same measure of speed", "Goodput is always higher than throughput", "Latency is measured in bits per second", "Bandwidth is a link's maximum data rate; throughput is the rate actually achieved; latency is the time for a bit to travel from source to destination; goodput is the throughput of useful application data, excluding headers and retransmissions"],
    answer: 3,
    explanation: "Goodput ≤ throughput ≤ bandwidth. A 100 Mbps link (bandwidth) may achieve 90 Mbps throughput, of which 85 Mbps is goodput after protocol overhead.",
    optionExplanations: ["They measure different things.", "Goodput excludes overhead, so it can't exceed throughput.", "Latency is measured in time (ms).", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-perf-002", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "numerical",
    question: "What is the transmission delay of a 1,500-byte packet on a 10 Mbps link?",
    options: ["1.2 ms", "0.15 ms", "12 ms", "150 µs × 8 = 1.5 ms"],
    answer: 0,
    explanation: "Transmission delay = L / R = (1,500 × 8 bits) / (10 × 10⁶ bit/s) = 12,000 / 10,000,000 = 1.2 ms. It's the time to push all the packet's bits onto the link, and doesn't depend on distance.",
    optionExplanations: ["Correct.", "That forgets to convert bytes to bits.", "Off by a factor of 10.", "The arithmetic is wrong: 1,500 × 8 / 10⁷ s = 1.2 ms."]
  },
  {
    id: "cn-perf-003", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "numerical",
    question: "A signal propagates at 2 × 10⁸ m/s through a 2,000 km fibre. What is the propagation delay?",
    options: ["10 ms", "1 ms", "100 ms", "0.1 ms"],
    answer: 0,
    explanation: "Propagation delay = d / v = 2 × 10⁶ m / 2 × 10⁸ m/s = 0.01 s = 10 ms. It depends on distance and the medium, not on packet size or link rate.",
    optionExplanations: ["Correct.", "Off by a factor of 10.", "Off by a factor of 10.", "Off by a factor of 100."]
  },
  {
    id: "cn-perf-004", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "concept",
    question: "What are the four components of nodal delay at a router?",
    options: ["Processing delay (examining the header, checking errors, choosing the output link), queuing delay (waiting in the output buffer), transmission delay (L/R) and propagation delay (d/v)", "Encoding, decoding, routing, switching", "DNS, TCP, TLS and HTTP delays", "Only propagation delay"],
    answer: 0,
    explanation: "d_nodal = d_proc + d_queue + d_trans + d_prop. Processing is usually microseconds, queuing varies with load (0 to very large), transmission depends on the link rate, and propagation on distance.",
    optionExplanations: ["Correct.", "Not the standard components.", "Those are connection set-up steps.", "Several delays add up."]
  },
  {
    id: "cn-perf-005", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "A 1,000-byte packet travels over a 1 Mbps link that is 1,000 km long (propagation speed 2 × 10⁸ m/s). Ignoring processing and queuing, how long until the last bit arrives?",
    options: ["5 ms", "8 ms", "13 ms", "3 ms"],
    answer: 2,
    explanation: "Transmission = 8,000 bits / 10⁶ bit/s = 8 ms. Propagation = 10⁶ m / 2 × 10⁸ m/s = 5 ms. The last bit leaves at 8 ms and arrives 5 ms later: total 13 ms.",
    optionExplanations: ["That's only the propagation delay.", "That's only the transmission delay.", "Correct.", "That subtracts the delays instead of adding them."]
  },
  {
    id: "cn-perf-006", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "A 1,000-byte packet goes from host A to host B through 2 store-and-forward routers (3 links). Every link is 1 Mbps and has 1 ms propagation delay. Ignoring processing and queuing, what is the end-to-end delay?",
    options: ["9 ms", "11 ms", "24 ms", "27 ms"],
    answer: 3,
    explanation: "Each router must receive the whole packet before forwarding it, so every link adds its own transmission delay: 3 × (8,000 / 10⁶ s) = 24 ms. Add 3 × 1 ms propagation = 27 ms. In general, for N links: N × (L/R + d_prop).",
    optionExplanations: ["That counts transmission only once.", "That counts transmission once and propagation on all links, which ignores store-and-forward.", "That leaves out propagation.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-perf-007", subject: "networks", subtopic: "Delays & Performance", difficulty: "hard", type: "numerical",
    question: "5 packets, each taking 8 ms to transmit, are sent back to back over a path of 3 store-and-forward links of equal rate. Ignoring propagation, processing and queuing, when does the last packet fully arrive?",
    options: ["24 ms", "40 ms", "56 ms", "120 ms"],
    answer: 2,
    explanation: "With pipelining, the first packet arrives after N × L/R = 3 × 8 = 24 ms, and each subsequent packet arrives one transmission time later: (N + P − 1) × L/R = (3 + 5 − 1) × 8 = 56 ms. Without pipelining it would be 5 × 24 = 120 ms.",
    optionExplanations: ["That's only the first packet.", "That's only the time to send the 5 packets onto the first link.", "Correct.", "That ignores pipelining between links."]
  },
  {
    id: "cn-perf-008", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "A packet of 10,000 bits crosses two store-and-forward links in sequence: the first at 10 Mbps, the second at 1 Mbps. Ignoring propagation, what is the total delay?",
    options: ["11 ms", "10 ms", "2 ms", "20 ms"],
    answer: 0,
    explanation: "Link 1: 10,000 / 10⁷ = 1 ms. Link 2: 10,000 / 10⁶ = 10 ms. Store-and-forward means these add: 11 ms.",
    optionExplanations: ["Correct.", "That leaves out the first link.", "That uses 10 Mbps for both links.", "That uses 1 Mbps for both links."]
  },
  {
    id: "cn-perf-009", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "concept",
    question: "What is RTT, and how is it commonly measured?",
    options: ["The time to transmit one bit", "Round-trip time: the time for a small packet to travel from client to server and for the response to come back (two propagation delays plus queuing and processing). ping measures it with ICMP echo request/reply", "The router's processing time", "The bandwidth of the slowest link"],
    answer: 1,
    explanation: "RTT drives TCP timeouts and handshake costs: a TCP handshake costs 1 RTT before data, and TLS 1.3 adds 1 more.",
    optionExplanations: ["That's 1/R.", "Correct.", "That's only one component.", "That's the bottleneck rate."]
  },
  {
    id: "cn-perf-010", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "A path has 100 Mbps bandwidth and 50 ms RTT. What is the bandwidth-delay product, and what does it mean?",
    options: ["5 Mb = 625 KB: the amount of data that must be in flight (unacknowledged) to keep the pipe full, so the sender's window must be at least this large", "2 Mb: the router buffer size", "5,000 Mb: the total data that can be sent", "50 KB: the TCP segment size"],
    answer: 0,
    explanation: "BDP = R × RTT = 100 × 10⁶ × 0.05 = 5 × 10⁶ bits = 625,000 bytes. A smaller window leaves the link idle while waiting for ACKs, which is why TCP window scaling exists.",
    optionExplanations: ["Correct.", "Wrong arithmetic and meaning.", "Off by a factor of 1,000.", "Unrelated to segment size."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-perf-011", subject: "networks", subtopic: "Delays & Performance", difficulty: "hard", type: "numerical",
    question: "A TCP connection without window scaling has a 64 KiB (65,536-byte) window over a 1 Gbps path with 10 ms RTT. What is its maximum throughput, and what fraction of the link does it use?",
    options: ["1 Gbps, 100%", "6.5 Mbps, about 0.65%", "524 Mbps, about 52%", "52.4 Mbps, about 5.2%"],
    answer: 3,
    explanation: "Throughput ≤ window / RTT = 65,536 × 8 / 0.01 = 52,428,800 bit/s ≈ 52.4 Mbps. BDP = 10⁹ × 0.01 / 8 = 1.25 MB, so utilisation = 65,536 / 1,250,000 ≈ 5.2%. That's why long fat networks need window scaling.",
    optionExplanations: ["The window limits throughput.", "Off by a factor of 8 (bits vs bytes).", "Off by a factor of 10.", "Correct."]
  },
  {
    id: "cn-perf-012", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "numerical",
    question: "An ISP advertises a 100 Mbps connection. What is the best-case download rate in megabytes per second?",
    options: ["100 MB/s", "1 MB/s", "800 MB/s", "12.5 MB/s"],
    answer: 3,
    explanation: "Network rates are in bits: 100 Mbps / 8 bits per byte = 12.5 MB/s, and slightly less in practice due to protocol overhead.",
    optionExplanations: ["That confuses bits with bytes.", "Not the conversion.", "That multiplies instead of dividing.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-perf-013", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "How long does a 10 MB file (1 MB = 10⁶ bytes) take to transmit on a 100 Mbps link, and how does the answer change if the file is 10 MiB (1 MiB = 2²⁰ bytes)?",
    options: ["0.1 s for both", "0.8 s for both", "8 s and 8.4 s", "0.8 s for 10 MB; about 0.84 s for 10 MiB"],
    answer: 3,
    explanation: "10 MB = 8 × 10⁷ bits; 8 × 10⁷ / 10⁸ = 0.8 s. 10 MiB = 10 × 1,048,576 × 8 = 83,886,080 bits → 0.839 s. Data rates always use decimal prefixes (1 Mbps = 10⁶ bit/s), while file sizes are often binary.",
    optionExplanations: ["That forgets bits vs bytes.", "The binary unit is about 4.9% larger.", "Off by a factor of 10.", "Correct."]
  },
  {
    id: "cn-perf-014", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "A path from server to client crosses links of 100 Mbps, 10 Mbps and 50 Mbps. Ignoring other traffic and delays, how long does a 25 MB file take to download?",
    options: ["2 s", "4 s", "20 s", "2.5 s"],
    answer: 2,
    explanation: "End-to-end throughput is limited by the bottleneck: min(100, 10, 50) = 10 Mbps. 25 MB = 200 Mb, so 200 / 10 = 20 s.",
    optionExplanations: ["That uses the fastest link.", "That uses the 50 Mbps link.", "Correct.", "That forgets bits vs bytes."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-perf-015", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "concept",
    question: "What is jitter, and why does it matter?",
    options: ["Packet loss", "Variation in packet delay (mostly from varying queuing delays). It disrupts real-time audio/video, so receivers use a playout (jitter) buffer that adds delay to smooth it out", "The bandwidth of a link", "A type of routing loop"],
    answer: 1,
    explanation: "VoIP and video calls are sensitive to jitter and latency; file downloads mostly care about throughput.",
    optionExplanations: ["Different metric.", "Correct.", "Not bandwidth.", "Unrelated."]
  },
  {
    id: "cn-perf-016", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "1,500-byte packets arrive at a router's 10 Mbps output link at an average of 500 packets per second. What is the traffic intensity, and what happens if it exceeds 1?",
    options: ["0.6; if La/R > 1, packets arrive faster than they can be sent, so the queue grows without bound and delay heads to infinity (with finite buffers, packets are dropped)", "6; nothing changes", "0.06; the link is idle", "0.6; above 1 the link speeds up"],
    answer: 0,
    explanation: "Traffic intensity = La / R = (12,000 bits × 500/s) / 10⁷ bit/s = 6 × 10⁶ / 10⁷ = 0.6. Average queuing delay grows sharply as intensity approaches 1, even before it reaches 1.",
    optionExplanations: ["Correct.", "Wrong arithmetic, and queues do grow.", "Off by a factor of 10.", "Links don't speed up."]
  },
  {
    id: "cn-perf-017", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "concept",
    question: "Why does average queuing delay rise so steeply as link utilisation approaches 100%?",
    options: ["Routers slow down when hot", "Arrivals are bursty: with little spare capacity, any burst builds a queue that takes a long time to drain. In simple queueing models delay scales like 1/(1 − ρ), which blows up as ρ → 1", "Propagation delay increases", "Packets get longer"],
    answer: 1,
    explanation: "This is why networks are provisioned with headroom, and why bufferbloat (oversized buffers) causes huge latency under load.",
    optionExplanations: ["Not the reason.", "Correct.", "Propagation is fixed by distance.", "Packet size doesn't change."]
  },
  {
    id: "cn-perf-018", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "A web service handles 200 requests per second, each taking 50 ms on average. By Little's law, how many requests are in progress at any time on average?",
    options: ["4", "250", "10", "40"],
    answer: 2,
    explanation: "Little's law: L = λ × W = 200/s × 0.05 s = 10. It holds for any stable system and is used to size thread pools and connection pools.",
    optionExplanations: ["That divides instead of multiplying.", "That adds the values.", "Correct.", "Wrong arithmetic."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-perf-019", subject: "networks", subtopic: "Delays & Performance", difficulty: "hard", type: "numerical",
    question: "A link serves packets at μ = 1,000 packets/s and receives Poisson arrivals at λ = 800 packets/s (an M/M/1 queue, where average time in system W = 1/(μ − λ)). What is W, and how many packets are in the system on average?",
    options: ["1.25 ms and 1", "5 ms and 4", "1 ms and 0.8", "50 ms and 40"],
    answer: 1,
    explanation: "W = 1 / (1000 − 800) = 1/200 s = 5 ms. Little's law: L = λW = 800 × 0.005 = 4 packets. At λ = 900, W doubles to 10 ms, showing the steep rise near full utilisation.",
    optionExplanations: ["That uses 1/λ.", "Correct.", "That uses 1/μ.", "Off by a factor of 10."]
  },
  {
    id: "cn-perf-020", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "concept",
    question: "Which applications are most sensitive to latency, and which to bandwidth?",
    options: ["All applications care only about bandwidth", "File downloads are latency-sensitive only", "Gaming needs high bandwidth most", "Latency-sensitive: online gaming, VoIP and video calls, interactive web/API calls with many round trips. Bandwidth-sensitive: large downloads, backups, video streaming at high bitrates"],
    answer: 3,
    explanation: "Many small web requests are dominated by RTTs, so doubling bandwidth barely speeds up page loads once it's past a few Mbps, while halving RTT helps a lot.",
    optionExplanations: ["Latency matters for interactive apps.", "Large transfers are throughput-bound.", "Games send small packets and need low latency.", "Correct."]
  },
  {
    id: "cn-perf-021", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "Over a circuit-switched network, a 1.536 Mbps link is divided into 24 TDM slots. Sending a 640,000-bit file needs one slot and a 500 ms circuit setup. How long does the transfer take?",
    options: ["0.92 s", "10 s", "10.5 s", "0.42 s"],
    answer: 2,
    explanation: "Each slot gets 1.536 Mbps / 24 = 64 kbps. Transmission = 640,000 / 64,000 = 10 s, plus 0.5 s setup = 10.5 s. The circuit's rate is fixed even if other slots are idle.",
    optionExplanations: ["That uses the full link rate plus setup.", "That leaves out setup.", "Correct.", "That uses the full link rate and no setup."]
  },
  {
    id: "cn-perf-022", subject: "networks", subtopic: "Delays & Performance", difficulty: "hard", type: "numerical",
    question: "A 1 Mbps link is shared by users who each need 100 kbps when active and are active 10% of the time independently. How many users can circuit switching support, and with 35 users on packet switching, what is the probability that more than 10 are active at once?",
    options: ["10 users; about 0.0004", "35 users; about 0.1", "10 users; about 0.35", "100 users; 0"],
    answer: 0,
    explanation: "Circuit switching reserves 100 kbps per user: 1 Mbps / 100 kbps = 10 users. With 35 users, the number active is Binomial(35, 0.1); P(X > 10) = Σ C(35, k) 0.1ᵏ 0.9³⁵⁻ᵏ for k = 11..35 ≈ 0.00042. Packet switching supports 3.5× the users with almost no congestion: statistical multiplexing.",
    optionExplanations: ["Correct.", "Circuit switching reserves capacity per user.", "The probability is far smaller.", "1 Mbps can't reserve 100 kbps for 100 users."]
  },
  {
    id: "cn-perf-023", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "concept",
    question: "How do circuit switching and packet switching compare?",
    options: ["Packet switching reserves resources for each call", "Circuit switching reserves a dedicated path and rate for the whole session (guaranteed performance, set-up delay, idle capacity wasted); packet switching sends packets on demand through shared links (efficient for bursty traffic, but queuing delay and loss are possible)", "Circuit switching has queuing delay at every hop", "They're identical"],
    answer: 1,
    explanation: "The traditional phone network used circuit switching; the Internet uses packet switching because data traffic is bursty.",
    optionExplanations: ["That describes circuit switching.", "Correct.", "Reserved circuits don't queue.", "They differ fundamentally."]
  },
  {
    id: "cn-perf-024", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "concept",
    question: "What effects does packet loss have on a TCP connection?",
    options: ["None, TCP ignores loss", "Throughput increases", "Lost segments must be retransmitted (after a timeout or duplicate ACKs), and TCP treats loss as congestion and cuts its window, so even small loss rates sharply reduce throughput, especially on high-RTT paths", "The connection is immediately closed"],
    answer: 2,
    explanation: "Loss also causes head-of-line blocking: later data already received waits for the retransmission. UDP-based real-time apps instead tolerate or conceal loss.",
    optionExplanations: ["TCP reacts strongly.", "It decreases.", "Correct.", "TCP recovers from loss."]
  },
  {
    id: "cn-perf-025", subject: "networks", subtopic: "Delays & Performance", difficulty: "hard", type: "numerical",
    question: "The Mathis approximation for steady-state TCP Reno throughput is 1.22 × MSS / (RTT × √p). With MSS = 1,460 bytes, RTT = 100 ms and loss rate p = 0.01%, what is the approximate throughput?",
    options: ["About 1.4 Mbps", "About 1.8 Mbps", "About 142 Mbps", "About 14 Mbps"],
    answer: 3,
    explanation: "MSS = 11,680 bits. √0.0001 = 0.01. Throughput ≈ 1.22 × 11,680 / (0.1 × 0.01) = 14,249.6 / 0.001 ≈ 14.2 Mbps, regardless of link capacity. Halving RTT doubles it; quadrupling loss halves it.",
    optionExplanations: ["Off by a factor of 10.", "That forgets to convert bytes to bits.", "Off by a factor of 10.", "Correct."]
  },
  {
    id: "cn-perf-026", subject: "networks", subtopic: "Delays & Performance", difficulty: "hard", type: "numerical",
    question: "On Gigabit Ethernet, each full-size frame carries 1,460 bytes of TCP payload, but occupies 1,538 bytes of wire time (1,518-byte frame + 8-byte preamble + 12-byte inter-frame gap; IP and TCP headers are inside the frame). What is the maximum TCP goodput?",
    options: ["1,000 Mbps", "About 949 Mbps", "About 962 Mbps", "About 987 Mbps"],
    answer: 1,
    explanation: "Goodput = 1,000 Mbps × 1,460 / 1,538 = 949.3 Mbps. Overheads: 38 bytes of Ethernet framing on the wire and 40 bytes of IP + TCP headers. Using 1,500/1,538 gives the IP-level throughput of about 975 Mbps instead.",
    optionExplanations: ["Headers and framing take capacity.", "Correct.", "Wrong ratio.", "Wrong ratio."]
  },
  {
    id: "cn-perf-027", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "A geostationary satellite orbits about 36,000 km above the equator. Ignoring other delays, what is the minimum RTT between two ground stations communicating through it (signal speed 3 × 10⁸ m/s)?",
    options: ["120 ms", "240 ms", "480 ms", "36 ms"],
    answer: 2,
    explanation: "One way (up and down) is 72,000 km / 3 × 10⁸ m/s = 240 ms. A round trip goes up and down twice: 480 ms. That's why low-earth-orbit constellations (a few hundred km up) have much lower latency.",
    optionExplanations: ["That's one hop up or down.", "That's one way only.", "Correct.", "Wrong arithmetic."]
  },
  {
    id: "cn-perf-028", subject: "networks", subtopic: "Delays & Performance", difficulty: "hard", type: "numerical",
    question: "A 1 Gbps link is 2,000 km long (propagation speed 2 × 10⁸ m/s). How many bits are on the wire at once when it's fully busy, and how does that compare with a 1,500-byte packet?",
    options: ["10,000 bits, smaller than one packet", "10⁷ bits, about 833 full packets in flight on the wire", "10⁹ bits", "12,000 bits, exactly one packet"],
    answer: 1,
    explanation: "Propagation delay = 2 × 10⁶ / 2 × 10⁸ = 10 ms. Bits in flight = R × d_prop = 10⁹ × 0.01 = 10⁷ bits. 10⁷ / 12,000 ≈ 833 packets. On a short LAN cable, by contrast, a packet is far 'longer' than the link.",
    optionExplanations: ["Off by a factor of 1,000.", "Correct.", "That's one second of data.", "Wrong arithmetic."]
  },
  {
    id: "cn-perf-029", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "concept",
    question: "In networking, what does 1 kbps equal?",
    options: ["1,024 bits per second", "8,000 bytes per second", "1,024 bytes per second", "1,000 bits per second"],
    answer: 3,
    explanation: "Data rates use SI (decimal) prefixes: 1 kbps = 10³ bit/s, 1 Mbps = 10⁶ bit/s, 1 Gbps = 10⁹ bit/s. Binary prefixes (KiB, MiB) apply to memory and sometimes file sizes.",
    optionExplanations: ["That's the binary kibi prefix.", "Wrong unit.", "Wrong unit and prefix.", "Correct."]
  },
  {
    id: "cn-perf-030", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "concept",
    question: "Which is true when comparing transmission delay and propagation delay?",
    options: ["Both depend on packet size", "Propagation delay shrinks on faster links", "Transmission delay depends on packet size and link rate but not distance; propagation delay depends on distance and medium but not packet size or rate. A faster link shrinks transmission delay but can't reduce propagation delay", "Transmission delay depends only on distance"],
    answer: 2,
    explanation: "An analogy: transmission is the time for a convoy of cars to pass a toll booth; propagation is the time for a car to drive between booths.",
    optionExplanations: ["Propagation doesn't.", "Signal speed is fixed by the medium.", "Correct.", "Distance affects propagation."]
  },
  {
    id: "cn-perf-031", subject: "networks", subtopic: "Delays & Performance", difficulty: "easy", type: "concept",
    question: "A speed test on a '1 Gbps' plan shows 600 Mbps. Which is NOT a likely reason?",
    options: ["The Wi-Fi link is the bottleneck", "The speed of light in fibre is slower than in a vacuum", "The test server or an intermediate link is congested", "TCP's window or the device's CPU can't keep up"],
    answer: 1,
    explanation: "Light's speed in fibre affects latency (propagation), not achievable throughput. Throughput is limited by the bottleneck link, congestion, TCP window/RTT and end-host capacity.",
    optionExplanations: ["Home Wi-Fi often caps throughput.", "Correct: that's latency, not throughput.", "Congestion lowers throughput.", "End hosts can be the bottleneck."]
  },
  {
    id: "cn-perf-032", subject: "networks", subtopic: "Delays & Performance", difficulty: "medium", type: "numerical",
    question: "A sender transmits 4 packets of 1,000 bits back to back over a single 1 Mbps link with 10 ms propagation delay. When does the last packet fully arrive?",
    options: ["14 ms", "11 ms", "40 ms", "44 ms"],
    answer: 0,
    explanation: "Each packet takes 1 ms to transmit. The last packet finishes transmitting at 4 × 1 = 4 ms and arrives 10 ms later: 14 ms. Propagation is paid once because the packets travel simultaneously.",
    optionExplanations: ["Correct.", "That's only the first packet.", "That pays propagation for every packet.", "That pays transmission and propagation for every packet."]
  }
);
