# Coverage Checklist

Every concept a placement interview or online assessment can test, per domain → subdomain.
`[x]` = covered, followed by the question ids that test it. A subdomain is **Done** only when every
concept is covered and its Easy, Medium and Hard sections are each properly populated.

Run `node scripts/validate.js` for live question counts.

## Final coverage report

All 73 subdomains are **Done**: every concept below is ticked `[x]` and linked to the questions that test it, and every subdomain has Easy, Medium and Hard questions.

| Domain | Subdomains | Easy | Medium | Hard | Total |
|---|---|---|---|---|---|
| Computer Networks | 14 | 122 | 219 | 103 | 444 |
| Operating Systems | 12 | 101 | 209 | 100 | 410 |
| SQL / DBMS | 12 | 106 | 212 | 111 | 429 |
| Python | 14 | 138 | 265 | 137 | 540 |
| Finance | 21 | 135 | 273 | 132 | 540 |
| **All** | **73** | **602** | **1178** | **583** | **2363** |

The correct answer is spread evenly across positions: A 25%, B 26%, C 25%, D 24%.

How answers were checked:
- Python code-output questions were run on CPython 3.14.
- SQL queries were run on SQLite 3.46, with dialect differences noted in the explanations.
- fork() programs were compiled with gcc and run both on a terminal and redirected to a file.
- Scheduling, page-replacement, disk-scheduling and Banker's numericals were checked with simulators.
- Subnetting was checked with Python's ipaddress module.
- Normal-form and key questions were checked with an FD closure tool, and schedules with a precedence-graph checker.
- RSA and Diffie-Hellman were checked with modular arithmetic, and the delay and throughput numericals were recomputed.
- Every Finance numerical (TVM, bond pricing and duration, NPV/IRR, WACC, DCF, forward and futures pricing, swap rates, binomial trees, Black-Scholes prices and Greeks, GARCH, VaR, LBO returns, probability puzzles) was recomputed in Python; probability puzzles were also checked by simulation.
- The Finance quant subdomains follow the Week 1, 2, 4, 5 and 6 course notes supplied by the user. Errors found in those notes were corrected in the questions rather than copied:
  - Week 1: free-float market cap described as all outstanding shares × price.
  - Week 4: the gold-futures margin table's day 5–6 P&L.
  - Week 4: the "10n observations for k regressors" rule.
  - Week 4: the contradictory bull calendar spread definition.
  - Week 5: swap DV01 off by 10×.
  - Week 5: bank swap hedge direction.
  - Week 5: dividends making early put exercise "more likely".

## Status

| Domain | Subdomain | Status |
|---|---|---|
| Networks | OSI & TCP/IP Models | Done (35) |
| Networks | Physical & Data Link Layer | Done (36) |
| Networks | Error Detection & Correction | Done (28) |
| Networks | Flow Control & ARQ | Done (25) |
| Networks | IP Addressing & Subnetting | Done (36) |
| Networks | NAT, IPv6, ICMP & Fragmentation | Done (32) |
| Networks | Routing Algorithms & Protocols | Done (28) |
| Networks | TCP & UDP | Done (34) |
| Networks | TCP Flow & Congestion Control | Done (26) |
| Networks | HTTP & Web Protocols | Done (36) |
| Networks | DNS, DHCP, Email & FTP | Done (30) |
| Networks | Network Security | Done (34) |
| Networks | Delays & Performance | Done (32) |
| Networks | Web Infrastructure & Scenarios | Done (32) |
| OS | OS Basics & Kernel | Done (35) |
| OS | Processes & fork() | Done (36) |
| OS | Inter-Process Communication | Done (28) |
| OS | Threads | Done (28) |
| OS | CPU Scheduling | Done (40) |
| OS | Process Synchronization | Done (38) |
| OS | Deadlocks | Done (30) |
| OS | Memory Management & Paging | Done (38) |
| OS | Virtual Memory & Page Replacement | Done (36) |
| OS | File Systems | Done (30) |
| OS | Disk Scheduling & RAID | Done (31) |
| OS | Virtualization & Linux | Done (40) |
| SQL | DBMS Fundamentals & Keys | Done (38) |
| SQL | SQL Basics & NULL Handling | Done (40) |
| SQL | Aggregation & GROUP BY | Done (36) |
| SQL | Joins | Done (33) |
| SQL | Subqueries & Set Operations | Done (33) |
| SQL | Window Functions | Done (33) |
| SQL | Classic Interview Queries | Done (32) |
| SQL | Advanced SQL Features | Done (40) |
| SQL | Indexing | Done (33) |
| SQL | Normalization | Done (38) |
| SQL | Transactions & Concurrency | Done (38) |
| SQL | NoSQL & Distributed Databases | Done (35) |
| Python | Data Types & Object Model | Done (46) |
| Python | Strings | Done (47) |
| Python | Lists, Tuples, Sets & Dicts | Done (48) |
| Python | Comprehensions & Generator Expressions | Done (36) |
| Python | Control Flow | Done (38) |
| Python | Functions & Scope | Done (44) |
| Python | Iterators & Generators | Done (37) |
| Python | Decorators & Closures | Done (31) |
| Python | OOP Basics | Done (35) |
| Python | Inheritance, MRO & Special Methods | Done (35) |
| Python | Exceptions & Context Managers | Done (37) |
| Python | Modules & Packages | Done (30) |
| Python | Memory, GIL & Concurrency | Done (34) |
| Python | Built-ins & Standard Library | Done (42) |
| Finance | Time Value of Money & Discounting | Done (35) |
| Finance | Accounting & Financial Statements | Done (26) |
| Finance | Financial Ratios & Working Capital | Done (20) |
| Finance | Capital Budgeting | Done (20) |
| Finance | Cost of Capital & Capital Structure | Done (18) |
| Finance | Valuation: DCF & Multiples | Done (20) |
| Finance | Bonds, Yields & Term Structure | Done (25) |
| Finance | Investing & Equity Markets | Done (27) |
| Finance | Technical Analysis & Trading Strategies | Done (24) |
| Finance | Risk, Return & Portfolio Theory | Done (23) |
| Finance | Probability for Quant Finance | Done (35) |
| Finance | Stochastic Calculus & GBM | Done (28) |
| Finance | Time Series: Stationarity & Forecasting | Done (34) |
| Finance | Volatility Models & Backtesting | Done (29) |
| Finance | Futures, Forwards & Hedging | Done (36) |
| Finance | Swaps | Done (22) |
| Finance | Options: Payoffs, Bounds & Strategies | Done (29) |
| Finance | Option Pricing: Binomial & Black-Scholes | Done (22) |
| Finance | The Greeks & Risk Management | Done (25) |
| Finance | Economics, Banking & Monetary Policy | Done (22) |
| Finance | M&A, LBOs & Corporate Actions | Done (20) |

---

# Computer Networks

## OSI & TCP/IP Models (`cn-models`)
- [x] Why layered architecture (modularity, abstraction, interoperability) — cn-models-002, cn-models-035
- [x] OSI 7 layers in order (and mnemonic) — cn-models-001
- [x] Responsibilities of each OSI layer (physical, data link, network, transport, session, presentation, application) — cn-models-003, cn-models-030, cn-models-031
- [x] Session layer functions (dialog control, synchronization/checkpoints) — cn-models-006
- [x] Presentation layer functions (translation, encryption, compression) — cn-models-005
- [x] TCP/IP model layers (4-layer and 5-layer variants) — cn-models-007
- [x] Mapping OSI ↔ TCP/IP layers — cn-models-007, cn-models-008
- [x] OSI vs TCP/IP differences (reference vs implementation, protocol-first vs model-first) — cn-models-008
- [x] PDUs per layer: bits, frame, packet/datagram, segment/datagram, data/message — cn-models-004
- [x] Encapsulation and decapsulation; header/trailer added per layer — cn-models-012, cn-models-034
- [x] Overhead / efficiency numericals from headers added at each layer — cn-models-013, cn-models-029
- [x] Addressing per layer: port (transport), IP (network), MAC (data link) — cn-models-010
- [x] Which addresses change hop-by-hop (MAC) vs end-to-end (IP) — cn-models-011
- [x] Devices per layer: hub/repeater (L1), switch/bridge (L2), router (L3), L4/L7 load balancers, gateways — cn-models-009, cn-models-033
- [x] Protocols mapped to layers (HTTP, DNS, TCP, UDP, IP, ICMP, ARP, Ethernet, TLS ambiguity) — cn-models-014, cn-models-016, cn-models-028
- [x] ARP/ICMP layer placement edge cases — cn-models-015
- [x] Peer-to-peer (logical) vs actual (physical) communication between layers — cn-models-017
- [x] Services: connection-oriented vs connectionless; reliable vs unreliable — cn-models-019
- [x] Error control / flow control occur at both data link (hop) and transport (end-to-end) — cn-models-018
- [x] Network topologies (bus, star, ring, mesh) and link counts n(n-1)/2 — cn-models-020, cn-models-021
- [x] Transmission modes: simplex, half-duplex, full-duplex — cn-models-022
- [x] LAN / MAN / WAN / PAN — cn-models-023
- [x] Unicast, multicast, broadcast, anycast — cn-models-024
- [x] Circuit switching vs packet switching vs message switching — cn-models-025, cn-models-026
- [x] Datagram vs virtual-circuit networks — cn-models-027
- [x] Layer-wise troubleshooting — cn-models-032

## Physical & Data Link Layer (`cn-datalink`)
- [x] Physical layer: signals, transmission media (guided/unguided), bit rate vs baud rate — cn-datalink-001, cn-datalink-034
- [x] Line coding basics (NRZ, Manchester) and clock recovery — cn-datalink-035
- [x] Nyquist and Shannon capacity formulas (numericals) — cn-datalink-002, cn-datalink-003
- [x] Data link sublayers: LLC and MAC — cn-datalink-004
- [x] Framing: character count, byte stuffing, bit stuffing (numerical on stuffed output) — cn-datalink-005, cn-datalink-006, cn-datalink-007, cn-datalink-008
- [x] MAC address: 48 bits, OUI, unicast/multicast bit, broadcast FF:FF:FF:FF:FF:FF — cn-datalink-009
- [x] ARP: request broadcast / reply unicast, ARP cache, gratuitous ARP — cn-datalink-010
- [x] ARP for a remote host → resolves default gateway MAC — cn-datalink-011
- [x] RARP / BOOTP / DHCP lineage; proxy ARP; ARP spoofing link — cn-datalink-012, cn-datalink-036
- [x] Ethernet frame format (preamble, SFD, dest, src, type, payload 46–1500, FCS) — cn-datalink-013
- [x] Minimum frame size 64 bytes and why (collision detection) — cn-datalink-013, cn-datalink-015
- [x] CSMA/CD: carrier sense, collision detection, jam signal, binary exponential backoff — cn-datalink-014, cn-datalink-019
- [x] CSMA/CD numerical: minimum frame size = 2 × Tp × bandwidth — cn-datalink-015
- [x] Efficiency of CSMA/CD (1/(1+6.44a)) — cn-datalink-016
- [x] CSMA/CA (Wi-Fi): RTS/CTS, ACK, hidden terminal problem, why not CD in wireless — cn-datalink-020
- [x] ALOHA: pure (18.4%) vs slotted (36.8%) efficiency and vulnerable time — cn-datalink-017, cn-datalink-018
- [x] Token passing / controlled access; channelization (FDMA/TDMA/CDMA) basics — cn-datalink-032, cn-datalink-033
- [x] Hub vs switch vs bridge vs repeater vs router — cn-datalink-021, cn-datalink-030
- [x] Collision domains and broadcast domains counting (numerical) — cn-datalink-023
- [x] Switch MAC learning, forwarding, flooding, filtering — cn-datalink-022, cn-datalink-036
- [x] Switching methods: store-and-forward vs cut-through — cn-datalink-024, cn-datalink-025
- [x] Spanning Tree Protocol (STP) purpose: loop prevention, broadcast storms — cn-datalink-026
- [x] VLANs: purpose, broadcast domain separation, 802.1Q tagging, trunk vs access ports — cn-datalink-027, cn-datalink-028
- [x] Inter-VLAN routing requires a router / L3 switch — cn-datalink-029
- [x] Full-duplex switched Ethernet has no collisions — cn-datalink-031

## Error Detection & Correction (`cn-error`)
- [x] Single-bit vs burst errors — cn-error-001
- [x] Simple parity (even/odd): detects odd number of bit errors only — cn-error-002, cn-error-003
- [x] Two-dimensional parity: detection and correction capability — cn-error-004
- [x] Checksum (Internet checksum, one's complement sum) computation — cn-error-005, cn-error-006, cn-error-027
- [x] Checksum weaknesses (reordering of words undetected) — cn-error-007
- [x] CRC: generator polynomial, appending r zeros, modulo-2 division (numerical) — cn-error-008, cn-error-009, cn-error-011, cn-error-025
- [x] CRC remainder/transmitted frame numericals — cn-error-008, cn-error-009, cn-error-010, cn-error-025
- [x] CRC detection properties (all burst errors ≤ r bits, odd errors if (x+1) factor) — cn-error-012, cn-error-023
- [x] Hamming distance definition and computation — cn-error-013
- [x] Detect d errors needs d_min = d+1; correct t errors needs d_min = 2t+1 — cn-error-014, cn-error-024
- [x] Hamming code redundant bits: 2^r ≥ m + r + 1 (numerical) — cn-error-015, cn-error-021
- [x] Hamming code parity positions (powers of 2) and syndrome → error position (numerical) — cn-error-016, cn-error-017, cn-error-018
- [x] Error detection vs correction trade-off; FEC vs ARQ — cn-error-019, cn-error-026, cn-error-028
- [x] Which layers use which: Ethernet CRC, IP header checksum, TCP/UDP checksum — cn-error-020
- [x] CRC vs cryptographic integrity — cn-error-022

## Flow Control & ARQ (`cn-flow`)
- [x] Flow control vs error control vs congestion control — cn-flow-001
- [x] Stop-and-Wait protocol; efficiency = 1/(1+2a), a = Tp/Tt (numerical) — cn-flow-002, cn-flow-004, cn-flow-018, cn-flow-023
- [x] Stop-and-Wait ARQ: sequence numbers 0/1 and why needed (duplicate detection) — cn-flow-003
- [x] Lost frame vs lost ACK vs delayed ACK handling; timeout — cn-flow-019, cn-flow-025
- [x] Throughput = efficiency × bandwidth (numerical) — cn-flow-005
- [x] Sliding window concept; window size for 100% utilisation = 1 + 2a (numerical) — cn-flow-006, cn-flow-017, cn-flow-022
- [x] Go-Back-N: sender window up to 2^k − 1, receiver window 1, cumulative ACK — cn-flow-007, cn-flow-008, cn-flow-020, cn-flow-024
- [x] GBN retransmission count numericals (frames resent after a loss) — cn-flow-011
- [x] Selective Repeat: sender = receiver window ≤ 2^(k−1); individual ACKs, buffering — cn-flow-008, cn-flow-010
- [x] Why SR window must be ≤ half the sequence space (ambiguity trap) — cn-flow-009
- [x] Bits needed for sequence numbers given window (numerical) — cn-flow-006, cn-flow-021
- [x] GBN vs SR comparison (bandwidth vs buffer/complexity) — cn-flow-010, cn-flow-011
- [x] Piggybacking — cn-flow-013
- [x] NAK (negative acknowledgement) usage — cn-flow-014
- [x] Efficiency with errors / retransmissions (expected transmissions 1/(1−p)) — cn-flow-015
- [x] Bandwidth-delay product and pipe filling — cn-flow-016
- [x] Cumulative acknowledgements — cn-flow-012

## IP Addressing & Subnetting (`cn-ip`)
- [x] IPv4 address structure: 32 bits, dotted decimal, network/host parts — cn-ip-001, cn-ip-036
- [x] Classful addressing: classes A–E ranges, default masks, leading bits — cn-ip-002
- [x] Number of networks/hosts per class (numerical) — cn-ip-026
- [x] Network address, broadcast address, usable hosts = 2^h − 2 — cn-ip-003, cn-ip-025
- [x] Subnet mask and prefix length (CIDR notation) — cn-ip-004, cn-ip-012
- [x] Subnetting: borrow bits, number of subnets and hosts (numerical) — cn-ip-009, cn-ip-010, cn-ip-033, cn-ip-035
- [x] Find network/broadcast/first/last host for an address/prefix (numerical) — cn-ip-006, cn-ip-007, cn-ip-008, cn-ip-027
- [x] Is a host in the same subnet as another? (numerical) — cn-ip-011, cn-ip-030
- [x] Block size / magic number method — cn-ip-032
- [x] /31 and /32 special cases — cn-ip-023
- [x] VLSM design numericals — cn-ip-021, cn-ip-022
- [x] Supernetting / route aggregation (numerical, contiguity conditions) — cn-ip-013, cn-ip-014
- [x] CIDR block validity (first address divisible by block size) — cn-ip-024
- [x] Longest prefix match in forwarding table (numerical) — cn-ip-015
- [x] Private ranges (10/8, 172.16/12, 192.168/16) — cn-ip-005, cn-ip-031
- [x] Special addresses: loopback 127/8, 0.0.0.0, 255.255.255.255, link-local 169.254/16, CGNAT 100.64/10 — cn-ip-016, cn-ip-017
- [x] Limited vs directed broadcast — cn-ip-018
- [x] Wildcard / inverse masks — cn-ip-028
- [x] Count addresses in a range / prefix (numerical) — cn-ip-029
- [x] Classful vs classless trade-offs; address exhaustion — cn-ip-034
- [x] Broadcast vs host addresses in wider prefixes (.255 trap) — cn-ip-019, cn-ip-020

## NAT, IPv6, ICMP & Fragmentation (`cn-netlayer`)
- [x] IPv4 header fields (version, IHL, TOS, total length, ID, flags, offset, TTL, protocol, checksum, src, dst) — cn-netlayer-001, cn-netlayer-006
- [x] Header length 20–60 bytes; IHL units of 4 bytes (numerical) — cn-netlayer-001, cn-netlayer-002
- [x] TTL purpose and decrement; checksum recomputed per hop — cn-netlayer-003, cn-netlayer-029
- [x] Protocol field values (1 ICMP, 6 TCP, 17 UDP) — cn-netlayer-004
- [x] Fragmentation: why, MTU, which devices fragment, reassembly at destination only — cn-netlayer-005, cn-netlayer-027
- [x] Fragment offset in 8-byte units; MF and DF flags (numerical) — cn-netlayer-006, cn-netlayer-007, cn-netlayer-028
- [x] Fragment count and sizes numerical (payload multiple of 8) — cn-netlayer-007, cn-netlayer-008
- [x] Path MTU discovery using DF + ICMP "fragmentation needed" — cn-netlayer-009
- [x] NAT: purpose, static vs dynamic, PAT/NAPT (port translation) — cn-netlayer-010, cn-netlayer-011, cn-netlayer-032
- [x] NAT problems: breaks end-to-end, inbound connections, port forwarding, NAT traversal — cn-netlayer-012, cn-netlayer-026
- [x] ICMP: purpose, message types (echo request/reply, destination unreachable, time exceeded, redirect) — cn-netlayer-013, cn-netlayer-015, cn-netlayer-030
- [x] ping and traceroute mechanisms (TTL expiry) — cn-netlayer-014, cn-netlayer-015
- [x] IPv6: 128-bit addresses, hex notation, :: compression rules (numerical) — cn-netlayer-016, cn-netlayer-017, cn-netlayer-018, cn-netlayer-019
- [x] IPv6 header simplifications: fixed 40 bytes, no checksum, extension headers, flow label — cn-netlayer-020
- [x] IPv6 no router fragmentation (source only), minimum MTU 1280 — cn-netlayer-021
- [x] IPv6 address types: unicast, multicast, anycast (no broadcast); link-local fe80::/10; ::1 — cn-netlayer-022, cn-netlayer-031
- [x] IPv6 auto-configuration (SLAAC), NDP replaces ARP — cn-netlayer-023
- [x] IPv4–IPv6 transition: dual stack, tunneling, translation — cn-netlayer-024
- [x] Router forwarding vs routing (data plane vs control plane) — cn-netlayer-025

## Routing Algorithms & Protocols (`cn-routing`)
- [x] Static vs dynamic routing; default route — cn-routing-001, cn-routing-002
- [x] Routing table entries; next hop — cn-routing-022
- [x] Distance vector: Bellman-Ford, neighbors exchange vectors (numerical table update) — cn-routing-003, cn-routing-004, cn-routing-026
- [x] Count-to-infinity problem (scenario) — cn-routing-005, cn-routing-019, cn-routing-028
- [x] Solutions: split horizon, poison reverse, hold-down timers, max hop count — cn-routing-006
- [x] Link state: flooding LSAs, every router has full topology, Dijkstra (numerical) — cn-routing-007
- [x] Dijkstra shortest path computation on a small graph — cn-routing-008, cn-routing-009, cn-routing-023
- [x] DV vs LS comparison (convergence, message complexity, robustness) — cn-routing-010
- [x] RIP: hop count metric, max 15 / 16 = infinity, 30-second updates, UDP 520 — cn-routing-011
- [x] OSPF: link state, areas, backbone area 0, cost metric, runs directly on IP (89) — cn-routing-012, cn-routing-027
- [x] BGP: path vector, inter-AS (EGP), TCP 179, policy-based routing, eBGP vs iBGP — cn-routing-013, cn-routing-021, cn-routing-025
- [x] Autonomous systems, IGP vs EGP — cn-routing-014, cn-routing-024
- [x] Hierarchical routing benefits — cn-routing-015
- [x] Administrative distance / route preference basics — cn-routing-016
- [x] Flooding and broadcast routing basics; multicast routing basics — cn-routing-018, cn-routing-020
- [x] Routing loops and TTL as a safeguard — cn-routing-017

## TCP & UDP (`cn-transport`)
- [x] Transport layer role: process-to-process delivery, multiplexing/demultiplexing — cn-transport-001
- [x] Port numbers: well-known (0–1023), registered, ephemeral; 16-bit — cn-transport-003
- [x] Common ports (20/21, 22, 23, 25, 53, 67/68, 80, 110, 143, 443, 3306) — cn-transport-004
- [x] Socket = (IP, port); TCP connection identified by 4-tuple (5-tuple with protocol) — cn-transport-026, cn-transport-034
- [x] TCP features: connection-oriented, reliable, ordered, byte-stream, full duplex — cn-transport-002, cn-transport-029
- [x] UDP features: connectionless, unreliable, message-oriented, low overhead — cn-transport-002, cn-transport-016
- [x] TCP vs UDP use cases (DNS, streaming, gaming, VoIP, file transfer) — cn-transport-025, cn-transport-032
- [x] UDP header 8 bytes; TCP header 20–60 bytes; fields — cn-transport-016, cn-transport-017
- [x] TCP flags: SYN, ACK, FIN, RST, PSH, URG — cn-transport-017
- [x] 3-way handshake: SYN, SYN-ACK, ACK; ISN randomisation — cn-transport-005, cn-transport-015
- [x] SYN and FIN consume one sequence number (numerical) — cn-transport-006, cn-transport-008
- [x] Sequence and acknowledgment number numericals — cn-transport-006, cn-transport-007
- [x] Connection teardown: 4-way FIN/ACK, half-close — cn-transport-009
- [x] TCP state diagram: LISTEN, SYN_SENT, SYN_RCVD, ESTABLISHED, FIN_WAIT_1/2, CLOSE_WAIT, LAST_ACK, TIME_WAIT, CLOSED — cn-transport-012, cn-transport-011
- [x] TIME_WAIT purpose and 2×MSL — cn-transport-010
- [x] Simultaneous open/close (edge case) — cn-transport-030
- [x] RST usage (closed port, abort) — cn-transport-013
- [x] SYN flood attack and SYN cookies — cn-transport-014
- [x] Reliability mechanisms: ACKs, retransmission timers, checksum, sequence numbers — cn-transport-018, cn-transport-031
- [x] RTT estimation and RTO (EWMA, Jacobson/Karn's algorithm) — cn-transport-019, cn-transport-020
- [x] Sequence number wrap-around time (numerical) — cn-transport-021
- [x] Nagle's algorithm and delayed ACK — cn-transport-022
- [x] Head-of-line blocking in TCP — cn-transport-023
- [x] MSS vs MTU — cn-transport-024
- [x] Keep-alive — cn-transport-028
- [x] Socket API calls: socket, bind, listen, accept, connect, send/recv, close — cn-transport-027
- [x] Handshake latency and TCP Fast Open — cn-transport-033

## TCP Flow & Congestion Control (`cn-congestion`)
- [x] Flow control (receiver) vs congestion control (network) — cn-congestion-001
- [x] Receiver window (rwnd) advertisement; zero window and persist timer — cn-congestion-003
- [x] Silly window syndrome and its fixes (Clark's, Nagle) — cn-congestion-004
- [x] Window scaling option (why 16-bit window is insufficient) — cn-congestion-006
- [x] Throughput = window / RTT (numerical) — cn-congestion-005, cn-congestion-026
- [x] Effective window = min(cwnd, rwnd) — cn-congestion-002, cn-congestion-026
- [x] Slow start: exponential growth per RTT, ssthresh — cn-congestion-007, cn-congestion-024
- [x] Congestion avoidance: additive increase (+1 MSS per RTT) — cn-congestion-015
- [x] AIMD and fairness — cn-congestion-008, cn-congestion-022
- [x] Timeout reaction (Tahoe): ssthresh = cwnd/2, cwnd = 1 — cn-congestion-009
- [x] Triple duplicate ACK: fast retransmit — cn-congestion-010
- [x] Fast recovery (Reno): cwnd = ssthresh (+3) — cn-congestion-011
- [x] Tahoe vs Reno differences — cn-congestion-011, cn-congestion-012, cn-congestion-013
- [x] cwnd evolution numericals over RTTs — cn-congestion-012, cn-congestion-013
- [x] Time to reach a window size numerical — cn-congestion-014
- [x] Congestion signals: loss vs delay; ECN — cn-congestion-016, cn-congestion-021
- [x] Modern variants: CUBIC (Linux default), BBR basics — cn-congestion-017, cn-congestion-023, cn-congestion-025
- [x] Open-loop vs closed-loop congestion control; leaky bucket vs token bucket (numerical) — cn-congestion-018, cn-congestion-019, cn-congestion-020

## HTTP & Web Protocols (`cn-http`)
- [x] HTTP basics: stateless request/response, over TCP (HTTP/3 over QUIC/UDP) — cn-http-001
- [x] Request structure: method, path, headers, body; response: status line, headers, body — cn-http-002
- [x] Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS — cn-http-003, cn-http-031
- [x] Safe vs idempotent methods — cn-http-004, cn-http-026, cn-http-036
- [x] Status code classes 1xx–5xx — cn-http-005
- [x] Specific codes: 200, 201, 204, 301, 302, 304, 307/308, 400, 401, 403, 404, 405, 409, 429, 500, 502, 503, 504 — cn-http-009, cn-http-030, cn-http-032
- [x] 401 vs 403; 301 vs 302 vs 307/308; 502 vs 504 — cn-http-006, cn-http-007, cn-http-008
- [x] HTTP/1.0 vs 1.1: persistent connections, Host header, pipelining — cn-http-010, cn-http-023, cn-http-029
- [x] HTTP/2: binary framing, multiplexing streams, HPACK header compression, server push — cn-http-011, cn-http-027, cn-http-033
- [x] HTTP/3: QUIC over UDP, 0-RTT/1-RTT, no TCP HOL blocking, connection migration — cn-http-012
- [x] Persistent vs non-persistent connection RTT numericals — cn-http-013, cn-http-034
- [x] Cookies: Set-Cookie, attributes (Secure, HttpOnly, SameSite, Domain, Path, Expires) — cn-http-014, cn-http-015
- [x] Sessions vs cookies vs tokens (JWT) — cn-http-016
- [x] Caching headers: Cache-Control, ETag, Last-Modified, conditional GET (304) — cn-http-009, cn-http-017, cn-http-035
- [x] Content negotiation and common headers (Content-Type, Accept, Authorization, User-Agent) — cn-http-025, cn-http-023
- [x] CORS basics and preflight OPTIONS request — cn-http-018
- [x] REST principles — cn-http-024
- [x] WebSockets: upgrade handshake (101), full duplex, use cases — cn-http-020
- [x] Polling vs long polling vs SSE vs WebSockets — cn-http-021
- [x] HTTPS = HTTP over TLS, port 443 — cn-http-022
- [x] gRPC/HTTP2 mention; URL structure (scheme, host, port, path, query, fragment) — cn-http-028, cn-http-019

## DNS, DHCP, Email & FTP (`cn-appproto`)
- [x] DNS purpose, hierarchy (root, TLD, authoritative) — cn-appproto-001, cn-appproto-002
- [x] Recursive vs iterative resolution — cn-appproto-003
- [x] DNS resolution flow (browser cache → OS → resolver → root → TLD → authoritative) — cn-appproto-004
- [x] Record types: A, AAAA, CNAME, MX, NS, TXT, PTR, SOA, SRV — cn-appproto-005, cn-appproto-028
- [x] CNAME restrictions (not at zone apex, cannot coexist) — cn-appproto-006
- [x] TTL and caching; negative caching — cn-appproto-007, cn-appproto-029
- [x] DNS uses UDP 53 (TCP for large responses/zone transfers) — cn-appproto-008
- [x] Reverse DNS (PTR, in-addr.arpa) — cn-appproto-009
- [x] DNS-based load balancing / GeoDNS — cn-appproto-011
- [x] DNS spoofing/cache poisoning, DNSSEC — cn-appproto-012, cn-appproto-030
- [x] Number of RTTs for iterative resolution (numerical) — cn-appproto-010
- [x] DHCP purpose; DORA (Discover, Offer, Request, Ack) — cn-appproto-013
- [x] DHCP uses UDP 67/68; broadcast because client has no IP — cn-appproto-014
- [x] DHCP lease, renewal (T1/T2), DHCP relay agent — cn-appproto-016, cn-appproto-027
- [x] What DHCP provides (IP, mask, gateway, DNS) — cn-appproto-015
- [x] APIPA when DHCP fails — cn-appproto-017
- [x] SMTP (push, port 25/587), POP3 (110, download+delete), IMAP (143, server-side sync) — cn-appproto-018
- [x] Email flow: user agent → MTA → MTA → mailbox → retrieval — cn-appproto-019, cn-appproto-028
- [x] MIME for attachments — cn-appproto-020
- [x] FTP: control 21 + data 20, active vs passive mode, out-of-band control — cn-appproto-021, cn-appproto-022
- [x] SFTP vs FTPS; TFTP (UDP 69) — cn-appproto-023
- [x] Telnet vs SSH (22) — cn-appproto-024
- [x] SNMP, NTP (123) basics — cn-appproto-025
- [x] DNS debugging tools (dig/nslookup) — cn-appproto-026

## Network Security (`cn-security`)
- [x] CIA triad; authentication vs authorization — cn-security-001, cn-security-002
- [x] Symmetric encryption (AES, DES), key distribution problem — cn-security-003
- [x] Asymmetric encryption (RSA, ECC), public/private key usage — cn-security-003, cn-security-005
- [x] Number of keys needed for n users: n(n−1)/2 vs 2n (numerical) — cn-security-004
- [x] Hybrid encryption (asymmetric to exchange symmetric key) — cn-security-032
- [x] RSA numerical (small primes, compute d / encrypt) — cn-security-006
- [x] Diffie-Hellman key exchange (numerical) and forward secrecy — cn-security-007, cn-security-008
- [x] Hashing properties (one-way, collision resistance); MD5/SHA-1 weaknesses, SHA-256 — cn-security-009
- [x] Hashing vs encryption vs encoding (Base64) — cn-security-010
- [x] Password storage: salt, slow hashes (bcrypt/scrypt/Argon2) — cn-security-011
- [x] MAC / HMAC for integrity + authenticity — cn-security-012, cn-security-029
- [x] Digital signatures: sign with private key, verify with public key; non-repudiation — cn-security-013
- [x] Certificates, CAs, chain of trust, X.509 — cn-security-014
- [x] TLS handshake steps (1.2 vs 1.3), session keys, 1-RTT / 0-RTT — cn-security-015, cn-security-008
- [x] Firewalls: packet filtering, stateful, application-level (proxy), WAF — cn-security-016
- [x] IDS vs IPS — cn-security-017
- [x] VPN, IPsec (AH vs ESP; transport vs tunnel) — cn-security-018, cn-security-027
- [x] DoS vs DDoS, amplification attacks, SYN flood, mitigations — cn-security-019, cn-security-020, cn-security-033
- [x] MITM, ARP spoofing, DNS spoofing, IP spoofing — cn-security-021, cn-security-022, cn-security-034
- [x] Replay attacks and nonces/timestamps — cn-security-023
- [x] Phishing, session hijacking, XSS, CSRF, SQL injection basics — cn-security-031, cn-security-030, cn-security-024, cn-security-025
- [x] HSTS and SSL stripping — cn-security-026
- [x] Defense in depth; DMZ — cn-security-028

## Delays & Performance (`cn-perf`)
- [x] Bandwidth vs throughput vs latency vs goodput — cn-perf-001, cn-perf-031
- [x] Transmission delay = L/R (numerical) — cn-perf-002, cn-perf-030
- [x] Propagation delay = d/v (numerical) — cn-perf-003, cn-perf-030
- [x] Queuing delay and processing delay — cn-perf-004
- [x] Total end-to-end delay over multiple hops (store-and-forward numerical) — cn-perf-005, cn-perf-006, cn-perf-008
- [x] Packet switching with multiple packets pipelining (numerical) — cn-perf-007, cn-perf-032
- [x] Round-trip time (RTT) — cn-perf-009, cn-perf-027
- [x] Bandwidth-delay product (numerical) and meaning — cn-perf-010, cn-perf-011, cn-perf-028
- [x] Units trap: bits vs bytes; KB = 1000 vs 1024 in networking — cn-perf-012, cn-perf-013, cn-perf-029
- [x] Throughput bottleneck = min link rate (numerical) — cn-perf-014
- [x] File transfer time numericals — cn-perf-013, cn-perf-014, cn-perf-021
- [x] Jitter — cn-perf-015
- [x] Traffic intensity La/R and queue behaviour — cn-perf-016, cn-perf-017, cn-perf-019
- [x] Packet loss and its effect — cn-perf-024, cn-perf-025
- [x] Little's law basics — cn-perf-018, cn-perf-019
- [x] Latency vs bandwidth: which matters for which application — cn-perf-020
- [x] Circuit switching vs packet switching delay numericals — cn-perf-021, cn-perf-022, cn-perf-023

## Web Infrastructure & Scenarios (`cn-infra`)
- [x] "What happens when you type a URL" — full sequence ordering — cn-infra-001, cn-infra-030
- [x] URL parsing, HSTS check, browser cache, DNS lookup, TCP + TLS handshakes, HTTP request, rendering — cn-infra-002, cn-infra-001, cn-infra-030
- [x] Minimum RTTs before first byte (DNS + TCP + TLS + HTTP numerical) — cn-infra-003, cn-infra-004
- [x] Forward proxy vs reverse proxy — cn-infra-005
- [x] Load balancer: L4 vs L7 — cn-infra-006
- [x] Load-balancing algorithms: round robin, weighted, least connections, IP hash, consistent hashing — cn-infra-007, cn-infra-008, cn-infra-009
- [x] Health checks, sticky sessions — cn-infra-010, cn-infra-028
- [x] CDN: edge caching, origin, cache hit ratio, latency reduction — cn-infra-011, cn-infra-012, cn-infra-027
- [x] Cache invalidation and TTLs at CDN — cn-infra-013
- [x] API gateway — cn-infra-014
- [x] Horizontal vs vertical scaling (from network perspective) — cn-infra-016
- [x] DNS role in failover, anycast for CDNs — cn-infra-017, cn-infra-031
- [x] SSL termination at load balancer — cn-infra-015
- [x] Debugging tools: ping, traceroute, nslookup/dig, netstat/ss, curl, tcpdump/Wireshark — cn-infra-018, cn-infra-019, cn-infra-020, cn-infra-021, cn-infra-029, cn-infra-032
- [x] Rate limiting basics — cn-infra-022, cn-infra-023
- [x] Browser same-origin policy & mixed content basics — cn-infra-024, cn-infra-025, cn-infra-026

---

# Operating Systems

## OS Basics & Kernel (`os-basics`)
- [x] OS goals: resource manager, abstraction, convenience vs efficiency — os-basics-001
- [x] Types of OS: batch, multiprogramming, multitasking/time-sharing, multiprocessing, real-time (hard/soft), distributed, embedded — os-basics-002, os-basics-004, os-basics-027, os-basics-028, os-basics-032
- [x] Multiprogramming vs multitasking vs multiprocessing vs multithreading — os-basics-002, os-basics-003
- [x] Kernel: monolithic, microkernel, hybrid, exokernel; examples (Linux, Minix/QNX, Windows NT/XNU) — os-basics-005, os-basics-006
- [x] Monolithic vs microkernel trade-offs (performance vs reliability) — os-basics-005, os-basics-029
- [x] Loadable kernel modules — os-basics-007
- [x] User mode vs kernel mode; mode bit; privileged instructions — os-basics-008, os-basics-025
- [x] Which instructions must be privileged (I/O, timer, interrupts disable, page table) vs not (read clock) — os-basics-009
- [x] System calls: purpose, trap/software interrupt, mode switch — os-basics-010, os-basics-031, os-basics-035
- [x] System call categories (process control, file, device, info, communication, protection) — os-basics-011
- [x] System call vs library function (printf vs write) — os-basics-012
- [x] Interrupts: hardware vs software (trap), exceptions; interrupt vector, ISR — os-basics-013, os-basics-014, os-basics-033
- [x] Polling vs interrupts; DMA — os-basics-015, os-basics-016, os-basics-024
- [x] Timer interrupt enabling preemption — os-basics-017
- [x] Booting: BIOS/UEFI, POST, bootloader (GRUB), MBR vs GPT, kernel init, init/systemd — os-basics-018, os-basics-019
- [x] Dual-mode protection; rings — os-basics-030
- [x] Spooling and buffering — os-basics-022
- [x] Shell vs kernel — os-basics-020
- [x] Mode switch vs context switch cost — os-basics-021, os-basics-031
- [x] Real-time OS determinism — os-basics-026
- [x] Multiprogramming CPU utilisation numerical (1 − p^n) — os-basics-023, os-basics-034

## Processes & fork() (`os-proc`)
- [x] Program vs process — os-proc-001
- [x] Process memory layout: text, data, BSS, heap, stack — os-proc-002, os-proc-036
- [x] PCB contents (PID, state, PC, registers, scheduling info, memory info, open files) — os-proc-003
- [x] Process states: new, ready, running, waiting/blocked, terminated — os-proc-004
- [x] Valid/invalid state transitions — os-proc-005
- [x] Suspended states (ready-suspend, blocked-suspend); medium-term scheduler — os-proc-007
- [x] Long/short/medium-term schedulers; degree of multiprogramming — os-proc-006
- [x] Context switch steps and overhead — os-proc-008
- [x] CPU-bound vs I/O-bound processes — os-proc-029
- [x] fork(): returns 0 to child, child PID to parent, −1 on error — os-proc-009
- [x] Number of processes after n forks = 2^n (numerical) — os-proc-010, os-proc-011, os-proc-035
- [x] fork() in loops output counting (numerical) — os-proc-012, os-proc-018, os-proc-019, os-proc-020, os-proc-030
- [x] fork() with && / || short-circuit (hard) — os-proc-013, os-proc-014
- [x] printf buffering duplication across fork (hard trap) — os-proc-016, os-proc-017
- [x] Copy-on-write — os-proc-022
- [x] Parent/child variable independence after fork — os-proc-015
- [x] exec family: replaces image, same PID, no return on success — os-proc-023, os-proc-024
- [x] wait()/waitpid(), exit status — os-proc-027, os-proc-028
- [x] Zombie process: definition, cause, removal — os-proc-025, os-proc-027
- [x] Orphan process: adopted by init/systemd — os-proc-026
- [x] getpid/getppid — os-proc-032
- [x] vfork vs fork — os-proc-031
- [x] Process creation tree; process termination & cascading termination — os-proc-021, os-proc-033, os-proc-035
- [x] Daemon processes — os-proc-034

## Inter-Process Communication (`os-ipc`)
- [x] Why IPC; independent vs cooperating processes — os-ipc-001
- [x] Shared memory vs message passing trade-offs — os-ipc-002, os-ipc-027
- [x] Pipes: unidirectional, parent-child, pipe() fds[0] read / fds[1] write — os-ipc-003, os-ipc-007
- [x] Pipe behaviour: read blocks on empty, EOF when all writers closed, SIGPIPE on write with no readers — os-ipc-007, os-ipc-008, os-ipc-009, os-ipc-010, os-ipc-011
- [x] Named pipes (FIFOs) — os-ipc-004
- [x] Message queues — os-ipc-013
- [x] Shared memory (shmget/mmap) requires synchronization — os-ipc-012
- [x] Signals: SIGINT, SIGTERM, SIGKILL, SIGSTOP, SIGCHLD, SIGSEGV; which cannot be caught — os-ipc-005, os-ipc-006, os-ipc-026, os-ipc-028
- [x] Signal handlers, kill command/system call — os-ipc-014, os-ipc-015, os-ipc-016
- [x] Sockets as IPC (Unix domain sockets) — os-ipc-017, os-ipc-024
- [x] Direct vs indirect communication; blocking vs non-blocking send/receive; rendezvous — os-ipc-018, os-ipc-019
- [x] Buffering capacity (zero, bounded, unbounded) — os-ipc-019, os-ipc-025
- [x] Memory-mapped files — os-ipc-020
- [x] RPC basics — os-ipc-021
- [x] Shell pipeline `a | b` uses pipes — os-ipc-022, os-ipc-023

## Threads (`os-threads`)
- [x] Thread definition; what threads share (code, data, heap, files) vs own (stack, registers, PC, TID) — os-threads-001, os-threads-020
- [x] Process vs thread (creation cost, context switch cost, isolation) — os-threads-002, os-threads-003, os-threads-025
- [x] Benefits: responsiveness, resource sharing, economy, scalability — os-threads-002, os-threads-010
- [x] User-level vs kernel-level threads — os-threads-004, os-threads-026
- [x] Blocking system call in user-level threads blocks whole process — os-threads-007
- [x] Multithreading models: many-to-one, one-to-one, many-to-many, two-level — os-threads-007, os-threads-008, os-threads-019
- [x] Linux threads: clone(), one-to-one (NPTL) — os-threads-008, os-threads-009
- [x] pthread API: pthread_create, pthread_join, detach — os-threads-006, os-threads-022
- [x] Thread pools — os-threads-010
- [x] Concurrency vs parallelism — os-threads-005
- [x] Amdahl's law (numerical) — os-threads-011, os-threads-012, os-threads-013, os-threads-027
- [x] Thread safety, reentrancy — os-threads-014, os-threads-023
- [x] Thread-local storage — os-threads-015
- [x] fork() in a multithreaded process (only calling thread duplicated) — os-threads-016
- [x] Thread cancellation (async vs deferred) — os-threads-017
- [x] Hyper-threading/SMT basics; green threads/coroutines — os-threads-018, os-threads-019
- [x] exit() vs pthread_exit; oversubscription; signals in multithreaded processes — os-threads-021, os-threads-024, os-threads-028

## CPU Scheduling (`os-sched`)
- [x] Scheduling criteria: CPU utilisation, throughput, turnaround, waiting, response time — os-sched-008, os-sched-039
- [x] Formulas: TAT = CT − AT; WT = TAT − BT; RT = first run − AT — os-sched-001
- [x] Preemptive vs non-preemptive scheduling — os-sched-005
- [x] Dispatcher and dispatch latency — os-sched-009
- [x] FCFS: Gantt chart numericals, convoy effect — os-sched-002, os-sched-003, os-sched-004, os-sched-012
- [x] FCFS with idle CPU gaps (arrival after completion) — os-sched-015
- [x] SJF (non-preemptive) numericals; optimal average WT — os-sched-006, os-sched-010, os-sched-016, os-sched-032
- [x] SRTF (preemptive SJF) numericals — os-sched-011, os-sched-017, os-sched-030, os-sched-031
- [x] Predicting burst: exponential averaging τ(n+1) = αt(n) + (1−α)τ(n) (numerical) — os-sched-018, os-sched-038
- [x] Priority scheduling (preemptive/non-preemptive) numericals; low number = high priority convention — os-sched-013, os-sched-028
- [x] Starvation and aging — os-sched-007, os-sched-023
- [x] Round Robin numericals; time quantum effects (large → FCFS, small → overhead) — os-sched-014, os-sched-020, os-sched-027, os-sched-029, os-sched-037
- [x] RR with context-switch overhead numerical — os-sched-022, os-sched-040
- [x] RR response time bound (n−1)q — os-sched-021
- [x] HRRN: response ratio = (W + S)/S numerical — os-sched-019
- [x] Multilevel queue scheduling — os-sched-025
- [x] Multilevel feedback queue — os-sched-024
- [x] Tie-breaking conventions (arrival order / process id) — os-sched-016, os-sched-027, os-sched-031
- [x] Which algorithms can cause starvation — os-sched-023
- [x] CPU utilisation with context switch overhead numerical — os-sched-015, os-sched-022
- [x] Multiprocessor scheduling: load balancing, processor affinity — os-sched-036
- [x] Real-time scheduling: rate monotonic, EDF basics — os-sched-033, os-sched-034
- [x] Linux CFS basics (vruntime) — os-sched-035
- [x] Throughput numerical — os-sched-026

## Process Synchronization (`os-sync`)
- [x] Race condition definition and example (counter++ non-atomic) — os-sync-001
- [x] Race-condition final-value range numericals (hard) — os-sync-019, os-sync-020, os-sync-031
- [x] Critical section problem; requirements: mutual exclusion, progress, bounded waiting — os-sync-002, os-sync-003, os-sync-038
- [x] Software solutions: strict alternation (turn variable) and which property it violates — os-sync-012
- [x] Flag-only solution deadlock/violation — os-sync-013
- [x] Peterson's solution: flag + turn, proof of properties, needs memory ordering — os-sync-014
- [x] Hardware support: test-and-set, compare-and-swap, disabling interrupts (uniprocessor only) — os-sync-015, os-sync-016, os-sync-017, os-sync-028
- [x] Mutex locks; ownership — os-sync-006
- [x] Spinlocks / busy waiting: when appropriate (multiprocessor, short CS) — os-sync-018, os-sync-030
- [x] Semaphores: wait/P and signal/V semantics, atomicity — os-sync-004, os-sync-033
- [x] Counting vs binary semaphore; mutex vs binary semaphore — os-sync-005, os-sync-006
- [x] Semaphore value numericals (P/V sequences, number of blocked processes) — os-sync-007, os-sync-008
- [x] Semaphore initial value interpretations (ordering with S=0) — os-sync-009, os-sync-032
- [x] Producer-consumer with bounded buffer (empty, full, mutex) and wrong-order deadlock — os-sync-010, os-sync-011
- [x] Readers-writers problem (first/second variants, writer starvation) — os-sync-023, os-sync-036
- [x] Dining philosophers: deadlock and solutions (asymmetric, at most n−1, waiter) — os-sync-024, os-sync-037
- [x] Sleeping barber / cigarette smokers (awareness) — os-sync-035
- [x] Monitors and condition variables (wait/signal), Hoare vs Mesa semantics — os-sync-021, os-sync-034
- [x] Why condition-variable waits use while loop (spurious wakeups) — os-sync-022
- [x] Priority inversion and priority inheritance (Mars Pathfinder) — os-sync-025
- [x] Atomic operations; memory barriers basics — os-sync-027, os-sync-028
- [x] Deadlock vs starvation vs livelock in synchronization — os-sync-026, os-sync-029, os-sync-037

## Deadlocks (`os-deadlock`)
- [x] Deadlock definition — os-deadlock-001
- [x] Four Coffman conditions: mutual exclusion, hold and wait, no preemption, circular wait — os-deadlock-002, os-deadlock-026
- [x] Resource allocation graph (RAG): request/assignment edges — os-deadlock-003
- [x] Cycle in RAG ⇒ deadlock iff single instance per resource type — os-deadlock-004, os-deadlock-029
- [x] Multi-instance RAG with cycle but no deadlock (scenario) — os-deadlock-005
- [x] Prevention: negate each condition (e.g., resource ordering for circular wait) — os-deadlock-006, os-deadlock-007, os-deadlock-024, os-deadlock-026
- [x] Avoidance: safe vs unsafe state; unsafe ≠ deadlock — os-deadlock-008, os-deadlock-015, os-deadlock-030
- [x] Banker's algorithm: Need = Max − Allocation (numerical) — os-deadlock-009, os-deadlock-010
- [x] Banker's safe sequence finding (numerical) — os-deadlock-011, os-deadlock-014
- [x] Banker's resource request algorithm: grant or not (numerical) — os-deadlock-012, os-deadlock-013, os-deadlock-015
- [x] Minimum resources to guarantee no deadlock: Σ(maxᵢ − 1) + 1 (numerical) — os-deadlock-016, os-deadlock-018
- [x] Maximum processes for given resources (numerical) — os-deadlock-017
- [x] Detection algorithm (wait-for graph, single-instance) and frequency — os-deadlock-019, os-deadlock-020, os-deadlock-021
- [x] Recovery: process termination (all vs one at a time), resource preemption, rollback, victim selection — os-deadlock-022, os-deadlock-028
- [x] Ostrich algorithm (ignore) — used by most OSes — os-deadlock-023, os-deadlock-027
- [x] Livelock and starvation vs deadlock — os-deadlock-025
- [x] Deadlock in code scenarios (two mutexes acquired in different order) — os-deadlock-024 (see also os-sync-029)

## Memory Management & Paging (`os-mem`)
- [x] Logical vs physical address; MMU; address binding (compile/load/execution time) — os-mem-001, os-mem-002
- [x] Base and limit registers; relocation — os-mem-003
- [x] Contiguous allocation: fixed vs variable partitions — os-mem-035
- [x] First fit, best fit, worst fit, next fit (numerical allocation) — os-mem-005, os-mem-006, os-mem-007
- [x] Internal vs external fragmentation — os-mem-004, os-mem-035
- [x] Compaction; 50-percent rule — os-mem-008, os-mem-036
- [x] Paging: pages and frames, no external fragmentation — os-mem-009
- [x] Address split: page number + offset (numerical, bits) — os-mem-010, os-mem-033
- [x] Page table size numericals (entries × entry size) — os-mem-011
- [x] Number of frames/pages numericals; physical address bits — os-mem-012, os-mem-033
- [x] Page table entry bits: frame number, valid, dirty, reference, protection — os-mem-014, os-mem-038
- [x] Internal fragmentation in paging (average half page) — os-mem-015
- [x] Multilevel paging: levels needed, page-table-fits-in-a-page numerical — os-mem-020, os-mem-021, os-mem-022, os-mem-023, os-mem-034
- [x] Inverted page table; hashed page tables — os-mem-024, os-mem-037
- [x] TLB: purpose, hit ratio, EAT = h(t+m) + (1−h)(t+2m) (numerical) — os-mem-016, os-mem-017, os-mem-018
- [x] EAT with multilevel paging and TLB (numerical) — os-mem-019
- [x] TLB flush on context switch, ASIDs — os-mem-025
- [x] Segmentation: logical view, segment table (base, limit), external fragmentation — os-mem-026
- [x] Segmentation address translation and trap on limit violation (numerical) — os-mem-027
- [x] Segmented paging — os-mem-028
- [x] Shared pages (reentrant code) — os-mem-029
- [x] Swapping — os-mem-030
- [x] Locality of reference — os-mem-031
- [x] Optimal page size trade-off (√(2·s·e)) — os-mem-032
- [x] Address translation numerical — os-mem-013

## Virtual Memory & Page Replacement (`os-vm`)
- [x] Virtual memory concept and benefits — os-vm-001, os-vm-036
- [x] Demand paging, lazy loading, pure demand paging — os-vm-002
- [x] Page fault handling steps — os-vm-003, os-vm-004
- [x] Effective access time with page faults (numerical) — os-vm-005
- [x] Maximum acceptable page-fault rate numerical — os-vm-006
- [x] Dirty bit and write-back on replacement (numerical with dirty pages) — os-vm-007, os-vm-032
- [x] FIFO page replacement (fault count numericals) — os-vm-008, os-vm-012, os-vm-014
- [x] Optimal (OPT/MIN) replacement numericals; why not implementable — os-vm-010, os-vm-011
- [x] LRU numericals; implementation (counters, stack) — os-vm-009, os-vm-014, os-vm-034, os-vm-035
- [x] LRU approximations: reference bit, second chance/clock, enhanced second chance — os-vm-016, os-vm-017
- [x] LFU / MFU — os-vm-018
- [x] Belady's anomaly: FIFO with 3 vs 4 frames; stack algorithms immune — os-vm-012, os-vm-013, os-vm-031
- [x] Frame allocation: equal vs proportional (numerical); global vs local — os-vm-022, os-vm-023
- [x] Thrashing: cause, symptoms, solutions — os-vm-019, os-vm-030, os-vm-033
- [x] Working set model and window Δ (numerical) — os-vm-020
- [x] Page-fault frequency scheme — os-vm-021
- [x] Copy-on-write in VM — os-vm-025
- [x] Memory-mapped files — os-vm-026
- [x] Program structure affecting page faults (row vs column traversal numerical) — os-vm-024
- [x] Minimum frames needed per process (instruction architecture) — os-vm-027
- [x] Hit ratio numericals with given reference strings — os-vm-015, os-vm-028, os-vm-029

## File Systems (`os-fs`)
- [x] File concept, attributes, operations, file descriptors and open-file table — os-fs-021, os-fs-022
- [x] Access methods: sequential, direct, indexed — os-fs-023
- [x] Directory structures: single-level, two-level, tree, acyclic graph, general graph — os-fs-016, os-fs-030
- [x] Allocation methods: contiguous, linked, indexed (pros/cons) — os-fs-005, os-fs-006, os-fs-009, os-fs-025
- [x] FAT as linked-allocation variant — os-fs-007, os-fs-008
- [x] Unix inode: metadata stored (not file name), direct/single/double/triple indirect pointers — os-fs-001
- [x] Maximum file size numerical with inode pointers — os-fs-010, os-fs-011
- [x] Disk blocks accessed to read a block via indirection (numerical) — os-fs-012
- [x] Hard link vs soft (symbolic) link; link count; cross-filesystem; dangling symlink — os-fs-002, os-fs-004, os-fs-017, os-fs-026
- [x] Deleting original file with hard link vs symlink (scenario) — os-fs-003, os-fs-027
- [x] Free-space management: bit vector (numerical), linked list, grouping, counting — os-fs-013, os-fs-014
- [x] Journaling file systems, consistency, fsck — os-fs-018, os-fs-028
- [x] Mounting — os-fs-020
- [x] Virtual file system (VFS) layer — os-fs-019
- [x] File permissions rwx, chmod octal (numerical) — os-fs-015
- [x] Buffer cache / page cache — os-fs-024
- [x] Common file systems: ext4, NTFS, FAT32 (4 GB limit), XFS, Btrfs — os-fs-008, os-fs-029

## Disk Scheduling & RAID (`os-disk`)
- [x] Disk structure: platters, tracks, sectors, cylinders — os-disk-004
- [x] Access time = seek + rotational latency + transfer (numerical) — os-disk-001, os-disk-003
- [x] Average rotational latency = half revolution (numerical) — os-disk-002
- [x] Disk capacity numerical — os-disk-004
- [x] FCFS head movement numerical — os-disk-005
- [x] SSTF numerical; starvation — os-disk-006, os-disk-012, os-disk-014
- [x] SCAN (elevator) numerical (goes to end) — os-disk-007, os-disk-008, os-disk-013, os-disk-029
- [x] C-SCAN numerical (jump back counted or not — stated convention) — os-disk-010
- [x] LOOK numerical — os-disk-009, os-disk-013, os-disk-028
- [x] C-LOOK numerical — os-disk-011
- [x] Comparisons: which gives uniform wait time, which minimises seek — os-disk-015, os-disk-027
- [x] SSD vs HDD (no seek, TRIM, wear levelling); scheduling irrelevance for SSDs — os-disk-016, os-disk-025
- [x] RAID 0 (striping), RAID 1 (mirroring), RAID 5 (distributed parity), RAID 6 (dual parity), RAID 10 — os-disk-017, os-disk-018, os-disk-019, os-disk-024
- [x] RAID usable capacity numericals — os-disk-020
- [x] RAID fault tolerance (disks that can fail) — os-disk-021, os-disk-030
- [x] RAID write penalty; RAID is not backup — os-disk-022, os-disk-023
- [x] Disk formatting, boot block, bad blocks — os-disk-026
- [x] Interleaving / sector numbering basics — os-disk-031

## Virtualization & Linux (`os-virt`)
- [x] Virtualization concept; hypervisor — os-virt-001, os-virt-040
- [x] Type 1 (bare-metal) vs Type 2 (hosted) hypervisors with examples — os-virt-002
- [x] Full virtualization vs paravirtualization; hardware-assisted (VT-x/AMD-V) — os-virt-003
- [x] Containers vs VMs: shared kernel, startup, isolation, size — os-virt-004
- [x] Linux namespaces and cgroups underpin containers — os-virt-005, os-virt-031, os-virt-038
- [x] Docker image vs container; layers; Kubernetes basics — os-virt-006, os-virt-007, os-virt-037
- [x] Linux commands: ls, cd, pwd, cp, mv, rm, mkdir, cat, less, head, tail — os-virt-008, os-virt-032
- [x] grep, find, awk, sed, sort, uniq, wc, cut basics — os-virt-009, os-virt-010, os-virt-011, os-virt-012, os-virt-013, os-virt-014, os-virt-039
- [x] ps, top, kill, nice/renice, jobs/bg/fg, nohup, & — os-virt-015, os-virt-016, os-virt-017, os-virt-018
- [x] chmod, chown, umask (numerical) — os-virt-019, os-virt-033 (see also os-fs-015)
- [x] df vs du, free, uptime/load average — os-virt-020, os-virt-021, os-virt-036
- [x] Pipes and redirection: >, >>, 2>&1, <, | — os-virt-017, os-virt-022
- [x] Exit codes, $?, &&, || — os-virt-023
- [x] Links: ln vs ln -s — os-virt-035 (see also os-fs-002)
- [x] Linux filesystem hierarchy (/etc, /var, /proc, /dev, /tmp, /home, /bin) — os-virt-024
- [x] /proc pseudo-filesystem — os-virt-025
- [x] Environment variables, PATH — os-virt-026, os-virt-027
- [x] netstat/ss, lsof, strace basics — os-virt-028, os-virt-034
- [x] Runlevels/systemd, cron — os-virt-029, os-virt-030

---

# SQL / DBMS

## DBMS Fundamentals & Keys (`sql-fund`)
- [x] File system vs DBMS advantages — sql-fund-001
- [x] DBMS vs RDBMS — sql-fund-002
- [x] Three-schema architecture; data independence (logical vs physical) — sql-fund-021
- [x] Schema vs instance — sql-fund-011
- [x] Data models: relational, hierarchical, network, document — sql-fund-036
- [x] Relational terminology: relation, tuple, attribute, domain, degree, cardinality — sql-fund-010
- [x] Super key, candidate key, primary key, alternate key, composite key, foreign key — sql-fund-003, sql-fund-004, sql-fund-005, sql-fund-006, sql-fund-007
- [x] Candidate key identification from FDs (numerical) — sql-fund-015 (more in sql-norm)
- [x] Number of super keys numerical — sql-fund-012, sql-fund-013, sql-fund-014
- [x] Primary key vs unique key (NULLs, count per table) — sql-fund-008, sql-fund-033
- [x] Surrogate vs natural key — sql-fund-020
- [x] Constraints: NOT NULL, UNIQUE, CHECK, DEFAULT, PRIMARY KEY, FOREIGN KEY — sql-fund-019, sql-fund-035, sql-fund-038
- [x] Referential integrity actions: CASCADE, SET NULL, RESTRICT/NO ACTION — sql-fund-016, sql-fund-017, sql-fund-034
- [x] Entity integrity — sql-fund-018
- [x] ER model: entity, attributes (simple, composite, multivalued, derived, key), weak entity, identifying relationship — sql-fund-025, sql-fund-026
- [x] Relationship cardinality: 1:1, 1:N, M:N; participation (total/partial) — sql-fund-022, sql-fund-027, sql-fund-037
- [x] ER to relational mapping: tables needed (numerical) — sql-fund-023, sql-fund-024
- [x] Generalization, specialization, aggregation — sql-fund-028
- [x] Relational algebra: select, project, join, union, difference, division basics — sql-fund-029, sql-fund-030, sql-fund-031, sql-fund-032
- [x] DDL / DML / DCL / TCL / DQL classification — sql-fund-009

## SQL Basics & NULL Handling (`sql-basics`)
- [x] SELECT, FROM, WHERE, ORDER BY basics — sql-basics-006, sql-basics-040
- [x] DISTINCT on one vs multiple columns — sql-basics-001, sql-basics-018
- [x] ORDER BY multiple columns, ASC/DESC, ordering by alias/position — sql-basics-019, sql-basics-040
- [x] NULL ordering differences (MySQL NULLs first in ASC, PostgreSQL last) — sql-basics-020
- [x] LIMIT/OFFSET (MySQL/PostgreSQL) vs TOP / FETCH FIRST — sql-basics-006, sql-basics-036
- [x] Pagination OFFSET pitfalls — sql-basics-025, sql-basics-026
- [x] WHERE operators: BETWEEN (inclusive), IN, LIKE with % and _, ESCAPE — sql-basics-002, sql-basics-003, sql-basics-022
- [x] Operator precedence AND before OR (trap) — sql-basics-011
- [x] NULL semantics: unknown, three-valued logic — sql-basics-015, sql-basics-034
- [x] `= NULL` vs `IS NULL` — sql-basics-004, sql-basics-035
- [x] NOT IN with NULL in list returns no rows (trap) — sql-basics-012
- [x] NULL in arithmetic and string concatenation — sql-basics-013, sql-basics-014
- [x] COALESCE, NULLIF, IFNULL/ISNULL — sql-basics-007, sql-basics-013, sql-basics-016
- [x] NULL in comparisons and boolean logic (TRUE OR NULL, FALSE AND NULL) — sql-basics-015, sql-basics-017, sql-basics-029, sql-basics-039
- [x] COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col) with NULLs — sql-basics-005, sql-basics-033
- [x] Column aliases and their visibility in WHERE — sql-basics-008
- [x] INSERT (single, multi-row, INSERT ... SELECT), UPDATE, DELETE syntax — sql-basics-010, sql-basics-028
- [x] UPDATE without WHERE affects all rows — sql-basics-009
- [x] CREATE TABLE, ALTER TABLE ADD/DROP/MODIFY column — sql-basics-027
- [x] Data types: INT, DECIMAL, FLOAT, CHAR, VARCHAR, TEXT, DATE, TIMESTAMP, BOOLEAN — sql-basics-031, sql-basics-032
- [x] Integer division behaviour (PostgreSQL 7/2 = 3, MySQL 7/2 = 3.5000) — sql-basics-021
- [x] String comparisons and case sensitivity (collation) — sql-basics-023
- [x] Single vs double quotes in standard SQL — sql-basics-024
- [x] SQL injection awareness and parameterized queries — sql-basics-030
- [x] DISTINCT + ORDER BY restriction; UPDATE assignment semantics across dialects — sql-basics-037, sql-basics-038

## Aggregation & GROUP BY (`sql-agg`)
- [x] Aggregate functions: COUNT, SUM, AVG, MIN, MAX — sql-agg-006, sql-agg-033, sql-agg-036
- [x] Aggregates ignore NULLs; AVG over NULL-containing column (numerical) — sql-agg-002, sql-agg-014, sql-agg-023
- [x] Aggregate on empty set: COUNT = 0, SUM/AVG/MAX = NULL — sql-agg-004, sql-agg-024
- [x] GROUP BY single and multiple columns: number of groups (numerical) — sql-agg-001, sql-agg-007
- [x] NULLs form one group in GROUP BY — sql-agg-001, sql-agg-023
- [x] Non-aggregated columns must appear in GROUP BY (MySQL ONLY_FULL_GROUP_BY) — sql-agg-008, sql-agg-035
- [x] WHERE vs HAVING — sql-agg-003, sql-agg-005, sql-agg-015, sql-agg-022
- [x] HAVING without GROUP BY — sql-agg-016
- [x] Logical query processing order: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT — sql-agg-009
- [x] Alias usage in HAVING/ORDER BY (allowed where) — sql-agg-010
- [x] COUNT(DISTINCT) and SUM(DISTINCT) — sql-agg-011, sql-agg-032
- [x] Conditional aggregation: SUM(CASE WHEN ...) / COUNT with FILTER — sql-agg-012, sql-agg-013
- [x] Aggregate output numericals on sample tables — sql-agg-017, sql-agg-026, sql-agg-029, sql-agg-034
- [x] Nested aggregates not allowed directly (MAX(AVG(x))) → use subquery — sql-agg-025, sql-agg-028
- [x] GROUP BY with ORDER BY of aggregate — sql-agg-017
- [x] ROLLUP / CUBE / GROUPING SETS basics — sql-agg-018, sql-agg-019
- [x] STRING_AGG / GROUP_CONCAT — sql-agg-020
- [x] Integer average truncation (PostgreSQL AVG returns numeric; integer division trap) — sql-agg-021, sql-agg-031
- [x] COUNT(*) vs COUNT(1) vs COUNT(pk); DISTINCT vs GROUP BY equivalence — sql-agg-027, sql-agg-030

## Joins (`sql-joins`)
- [x] INNER JOIN semantics — sql-joins-001, sql-joins-032
- [x] LEFT/RIGHT OUTER JOIN semantics; NULL-filled columns — sql-joins-002, sql-joins-003, sql-joins-022, sql-joins-026
- [x] FULL OUTER JOIN (MySQL lacks it: emulate with UNION) — sql-joins-004, sql-joins-014, sql-joins-028
- [x] CROSS JOIN row count = m × n — sql-joins-005, sql-joins-029
- [x] Self join use (employee-manager) — sql-joins-006, sql-joins-021, sql-joins-031
- [x] Natural join and USING pitfalls — sql-joins-011, sql-joins-012
- [x] Equi-join vs non-equi join (range join) — sql-joins-013, sql-joins-033
- [x] Row-count numericals with duplicate keys (many-to-many multiplication) — sql-joins-007, sql-joins-008
- [x] NULL join keys never match — sql-joins-007, sql-joins-001
- [x] Filter in ON vs WHERE for LEFT JOIN (turns into inner join trap) — sql-joins-009, sql-joins-027
- [x] Anti-join: LEFT JOIN ... WHERE right.key IS NULL — sql-joins-010
- [x] Semi-join concept — sql-joins-018
- [x] Joining 3+ tables — sql-joins-019, sql-joins-030
- [x] Bounds on row counts for inner/left/full joins (min/max numericals) — sql-joins-017
- [x] Join algorithms: nested loop, hash join, sort-merge join (when each used) — sql-joins-024
- [x] Join order and indexes on join keys — sql-joins-025
- [x] Implicit join syntax (comma) vs explicit JOIN — sql-joins-015
- [x] COUNT(*) vs COUNT(child col) after LEFT JOIN — sql-joins-016
- [x] Fan-out double counting when joining multiple child tables — sql-joins-020
- [x] Ambiguous column references — sql-joins-023

## Subqueries & Set Operations (`sql-subq`)
- [x] Scalar subquery; error if it returns more than one row — sql-subq-001, sql-subq-006, sql-subq-026
- [x] Subquery in WHERE with IN, comparison operators — sql-subq-003, sql-subq-018, sql-subq-032
- [x] Subquery in FROM (derived table, needs alias) — sql-subq-015, sql-subq-033
- [x] Subquery in SELECT — sql-subq-014, sql-subq-026
- [x] Correlated subqueries: execution per outer row — sql-subq-007, sql-subq-024
- [x] EXISTS / NOT EXISTS semantics (true if any row; SELECT list irrelevant) — sql-subq-004, sql-subq-025
- [x] IN vs EXISTS performance and semantics — sql-subq-016, sql-subq-027
- [x] NOT IN vs NOT EXISTS with NULLs (trap) — sql-subq-008, sql-subq-031
- [x] ANY / SOME / ALL; `> ALL (empty)` is true — sql-subq-012, sql-subq-013
- [x] UNION vs UNION ALL (dedup, performance) — sql-subq-002, sql-subq-019, sql-subq-030
- [x] INTERSECT and EXCEPT/MINUS; ALL variants; MySQL 8.0.31+ support — sql-subq-005, sql-subq-009, sql-subq-021
- [x] Set operation rules: same column count, compatible types, column names from first query — sql-subq-010, sql-subq-028
- [x] ORDER BY applies to the whole set operation result — sql-subq-011
- [x] Set-operation output row-count numericals — sql-subq-002, sql-subq-005, sql-subq-009, sql-subq-020
- [x] Rewriting subqueries as joins — sql-subq-017
- [x] Subqueries for "max per group" — sql-subq-018, sql-subq-024
- [x] Relational division with double NOT EXISTS; subquery in HAVING; LATERAL — sql-subq-022, sql-subq-023, sql-subq-029

## Window Functions (`sql-window`)
- [x] Window function concept: aggregate without collapsing rows; OVER clause — sql-window-001, sql-window-005
- [x] PARTITION BY vs GROUP BY — sql-window-001, sql-window-006, sql-window-022, sql-window-031
- [x] ORDER BY inside OVER — sql-window-016
- [x] ROW_NUMBER vs RANK vs DENSE_RANK on ties (numerical output) — sql-window-002, sql-window-003, sql-window-004, sql-window-023
- [x] NTILE — sql-window-013
- [x] LAG / LEAD with offset and default — sql-window-007, sql-window-008, sql-window-021, sql-window-027, sql-window-032
- [x] FIRST_VALUE / LAST_VALUE (default frame trap) / NTH_VALUE — sql-window-011, sql-window-012, sql-window-029
- [x] Running totals with SUM() OVER (ORDER BY) — sql-window-016
- [x] Default frame: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW; ties in running sum (trap) — sql-window-009
- [x] ROWS vs RANGE frames; moving averages (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — sql-window-010, sql-window-026
- [x] Window functions not allowed in WHERE → wrap in subquery/CTE — sql-window-014
- [x] Top-N per group with ROW_NUMBER/DENSE_RANK — sql-window-015, sql-window-030
- [x] PERCENT_RANK / CUME_DIST basics — sql-window-017
- [x] Aggregate window without ORDER BY gives partition total — sql-window-005, sql-window-016, sql-window-024
- [x] Gaps-and-islands with ROW_NUMBER difference — sql-window-018
- [x] Logical processing: windows evaluated after WHERE/GROUP BY/HAVING — sql-window-019, sql-window-028, sql-window-033
- [x] Named windows (WINDOW clause) — sql-window-020
- [x] Ranking without ORDER BY — sql-window-025

## Classic Interview Queries (`sql-classic`)
- [x] Second highest salary (subquery with MAX, LIMIT OFFSET, DENSE_RANK) — sql-classic-001, sql-classic-004, sql-classic-006, sql-classic-007
- [x] Nth highest salary with DENSE_RANK; handling ties and missing N (NULL) — sql-classic-005, sql-classic-030
- [x] Find duplicate rows/emails (GROUP BY HAVING COUNT > 1) — sql-classic-002, sql-classic-027
- [x] Delete duplicates keeping one (ROW_NUMBER / self join) — sql-classic-011
- [x] Employees earning more than their manager (self join) — sql-classic-008
- [x] Department-wise highest salary — sql-classic-009
- [x] Department-wise top N salaries — sql-classic-010
- [x] Customers who never ordered (anti-join / NOT EXISTS) — sql-classic-003
- [x] Consecutive records (e.g., numbers appearing 3 times consecutively; LAG/LEAD or self join) — sql-classic-012
- [x] Consecutive days login (gaps-and-islands) — sql-classic-024, sql-classic-028
- [x] Rising temperature (compare with previous day) — sql-classic-013
- [x] Running totals and cumulative sums — sql-classic-014
- [x] Median calculation — sql-classic-015
- [x] Pivot rows to columns with conditional aggregation — sql-classic-016
- [x] Year-over-year / month-over-month growth — sql-classic-017
- [x] Percentage of total — sql-classic-029
- [x] Count employees per department including empty departments (LEFT JOIN + COUNT(col)) — sql-classic-018
- [x] Swap values / conditional update with CASE — sql-classic-019, sql-classic-026
- [x] Find managers with ≥ N reports — sql-classic-020
- [x] Latest record per group — sql-classic-021
- [x] Odd/even rows, fetch every nth row — sql-classic-022
- [x] Hierarchy traversal (recursive CTE) — sql-classic-023
- [x] Missing ids / gaps in a sequence — sql-classic-025
- [x] Top-N overall; above-department-average employees — sql-classic-031, sql-classic-032

## Advanced SQL Features (`sql-adv`)
- [x] CASE: simple vs searched; ELSE default NULL; evaluation order — sql-adv-001, sql-adv-002, sql-adv-008, sql-adv-009, sql-adv-038
- [x] String functions: CONCAT, CONCAT_WS, SUBSTRING, LENGTH vs CHAR_LENGTH, UPPER/LOWER, TRIM, REPLACE, POSITION/INSTR, LPAD — sql-adv-007, sql-adv-010, sql-adv-011, sql-adv-040
- [x] `||` concatenation (PostgreSQL) vs logical OR (MySQL default) — sql-adv-012
- [x] Date functions: CURRENT_DATE, NOW, DATE_ADD/INTERVAL, DATEDIFF, EXTRACT, DATE_TRUNC, DATE_FORMAT — sql-adv-013, sql-adv-014, sql-adv-015
- [x] CAST / type conversion; implicit conversion traps ('10' vs 9 comparison) — sql-adv-016, sql-adv-039
- [x] Views: definition, updatable views, WITH CHECK OPTION, security use — sql-adv-005, sql-adv-017, sql-adv-018
- [x] Materialized views vs views — sql-adv-019
- [x] CTEs (WITH): readability, multiple CTEs, reference earlier CTEs — sql-adv-006, sql-adv-020
- [x] Recursive CTEs: anchor + recursive member, termination; output numericals — sql-adv-021, sql-adv-022 (see also sql-classic-023)
- [x] Stored procedures vs functions (return values, use in SELECT, transactions) — sql-adv-023
- [x] Triggers: BEFORE/AFTER, row vs statement level, NEW/OLD; use cases and pitfalls — sql-adv-024, sql-adv-025, sql-adv-028
- [x] DELETE vs TRUNCATE vs DROP (rollback, WHERE, triggers, identity reset, DDL vs DML) — sql-adv-003, sql-adv-026, sql-adv-027, sql-adv-028
- [x] CHAR vs VARCHAR (padding, storage, trailing spaces) — sql-adv-004, sql-adv-029
- [x] VARCHAR vs TEXT — sql-adv-030
- [x] AUTO_INCREMENT / SERIAL / IDENTITY; gaps after rollback — sql-adv-027, sql-adv-031
- [x] UPSERT: INSERT ... ON CONFLICT (PostgreSQL) / ON DUPLICATE KEY UPDATE (MySQL), MERGE — sql-adv-032
- [x] Cursors basics — sql-adv-037
- [x] DCL: GRANT/REVOKE; roles — sql-adv-033
- [x] Temporary tables — sql-adv-034
- [x] JSON column basics — sql-adv-035
- [x] Prepared statements — sql-adv-036

## Indexing (`sql-index`)
- [x] Purpose of indexes; read vs write trade-off — sql-index-001, sql-index-029
- [x] B-tree / B+ tree structure: leaf-linked, range queries, height ~ log — sql-index-002, sql-index-003
- [x] B+ tree vs B tree differences — sql-index-003
- [x] B+ tree order/fan-out and height numericals — sql-index-022, sql-index-023
- [x] Hash index: equality only, no range — sql-index-004
- [x] Clustered vs non-clustered index; one clustered per table — sql-index-005
- [x] InnoDB clusters on primary key; secondary index stores PK (double lookup) — sql-index-006, sql-index-033
- [x] Covering index / index-only scan — sql-index-007
- [x] Composite index and leftmost-prefix rule (which queries use it) — sql-index-008, sql-index-009
- [x] Column order in composite index (equality first, then range) — sql-index-010
- [x] When indexes are not used: functions on column, leading wildcard LIKE, implicit casts, OR on different columns, low selectivity — sql-index-011, sql-index-012, sql-index-013, sql-index-031, sql-index-026
- [x] When indexes hurt: write-heavy tables, small tables, low-cardinality columns — sql-index-014, sql-index-029
- [x] Selectivity and cardinality — sql-index-015
- [x] Primary key / unique constraints auto-create indexes — sql-index-016
- [x] Dense vs sparse index; primary vs secondary index (textbook) — sql-index-017, sql-index-019, sql-index-020
- [x] Multi-level index; index blocks numericals (records per block) — sql-index-018, sql-index-019, sql-index-020, sql-index-021
- [x] Bitmap index for low-cardinality analytics — sql-index-024
- [x] Full-text indexes — sql-index-025
- [x] EXPLAIN / query plan basics; full table scan vs index seek — sql-index-026, sql-index-032
- [x] Partial / functional (expression) indexes — sql-index-027, sql-index-028
- [x] Index on foreign keys for joins — covered in sql-joins-025
- [x] Index-assisted ORDER BY ... LIMIT — sql-index-030

## Normalization (`sql-norm`)
- [x] Redundancy and anomalies: insertion, update, deletion — sql-norm-001
- [x] Functional dependency definition; trivial vs non-trivial — sql-norm-002, sql-norm-003
- [x] Armstrong's axioms (reflexivity, augmentation, transitivity) and derived rules (union, decomposition, pseudo-transitivity) — sql-norm-008, sql-norm-014, sql-norm-015
- [x] Attribute closure computation (numerical) — sql-norm-009, sql-norm-010, sql-norm-036
- [x] Finding all candidate keys (numerical) — sql-norm-026, sql-norm-028, sql-norm-029, sql-norm-030
- [x] Prime vs non-prime attributes — sql-norm-016
- [x] FD implication / equivalence of FD sets — sql-norm-023, sql-norm-036
- [x] Minimal / canonical cover (numerical) — sql-norm-022
- [x] 1NF: atomic values, no repeating groups — sql-norm-004
- [x] 2NF: no partial dependency (only matters with composite keys) — sql-norm-005, sql-norm-012, sql-norm-020
- [x] 3NF: no transitive dependency; formal condition (X superkey or A prime) — sql-norm-006, sql-norm-025
- [x] BCNF: every determinant is a superkey — sql-norm-007, sql-norm-013
- [x] Highest normal form identification (numerical, hard) — sql-norm-011, sql-norm-027, sql-norm-030, sql-norm-031, sql-norm-032
- [x] 3NF vs BCNF: BCNF may lose dependency preservation — sql-norm-019, sql-norm-025
- [x] Lossless-join decomposition test (common attribute is key of one side) — sql-norm-017, sql-norm-018
- [x] Dependency-preserving decomposition — sql-norm-019, sql-norm-037
- [x] Multivalued dependency and 4NF; join dependency and 5NF (awareness) — sql-norm-034, sql-norm-038
- [x] Denormalization: when and why (read performance, analytics) — sql-norm-021
- [x] Relation with all attributes in key is in BCNF; two-attribute relation is always BCNF — sql-norm-024, sql-norm-035
- [x] Super key counting from candidate keys — sql-norm-029, sql-norm-033

## Transactions & Concurrency (`sql-txn`)
- [x] Transaction definition; BEGIN/COMMIT/ROLLBACK; SAVEPOINT — sql-txn-004
- [x] ACID properties and which component ensures each (log/recovery, concurrency control) — sql-txn-001, sql-txn-002, sql-txn-003
- [x] Transaction states: active, partially committed, committed, failed, aborted — sql-txn-033
- [x] Autocommit behaviour; DDL implicit commit in MySQL — sql-txn-032, sql-txn-037
- [x] Concurrency problems: dirty read, non-repeatable read, phantom read, lost update — sql-txn-005, sql-txn-006, sql-txn-007, sql-txn-010
- [x] Isolation levels: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE — sql-txn-008
- [x] Which anomalies each level prevents (table) — sql-txn-006, sql-txn-008
- [x] Default isolation: MySQL InnoDB REPEATABLE READ, PostgreSQL READ COMMITTED — sql-txn-009
- [x] Schedules: serial, concurrent, serializable — sql-txn-012, sql-txn-035
- [x] Conflict serializability: conflicting operations, precedence graph (numerical) — sql-txn-011, sql-txn-012, sql-txn-013, sql-txn-014, sql-txn-036
- [x] View serializability (awareness; blind writes) — sql-txn-015
- [x] Recoverable, cascadeless, strict schedules — sql-txn-016
- [x] Locks: shared vs exclusive; compatibility matrix — sql-txn-017
- [x] Two-phase locking (2PL): growing/shrinking; strict 2PL; guarantees serializability not deadlock-freedom — sql-txn-018, sql-txn-019
- [x] Lock granularity, intention locks — sql-txn-034
- [x] Database deadlocks: detection, wait-for graph, victim; wait-die vs wound-wait — sql-txn-020, sql-txn-021
- [x] Timestamp ordering protocol, Thomas write rule — sql-txn-022
- [x] Optimistic vs pessimistic concurrency control; version columns — sql-txn-023, sql-txn-024
- [x] MVCC and snapshot isolation; write skew — sql-txn-025, sql-txn-026, sql-txn-038
- [x] SELECT ... FOR UPDATE — sql-txn-024, sql-txn-038
- [x] Write-ahead logging, undo/redo, checkpoints — sql-txn-027, sql-txn-028, sql-txn-029
- [x] Shadow paging basics — sql-txn-030
- [x] Distributed transactions: two-phase commit — sql-txn-031

## NoSQL & Distributed Databases (`sql-nosql`)
- [x] SQL vs NoSQL: schema, scaling, consistency, query flexibility — sql-nosql-001
- [x] NoSQL types: key-value, document, column-family (wide-column), graph — with examples — sql-nosql-002, sql-nosql-003
- [x] When to choose SQL vs NoSQL (use cases) — sql-nosql-003, sql-nosql-033
- [x] BASE vs ACID — sql-nosql-007
- [x] CAP theorem statement; partition tolerance is mandatory in practice — sql-nosql-004, sql-nosql-008
- [x] CP vs AP system examples — sql-nosql-009
- [x] PACELC extension — sql-nosql-010
- [x] Consistency models: strong, eventual, read-your-writes, causal — sql-nosql-011, sql-nosql-012, sql-nosql-032, sql-nosql-035
- [x] Replication: master-slave (leader-follower), multi-master, leaderless — sql-nosql-013, sql-nosql-015
- [x] Synchronous vs asynchronous replication; replication lag — sql-nosql-014, sql-nosql-012
- [x] Quorum reads/writes: R + W > N (numerical) — sql-nosql-016, sql-nosql-017, sql-nosql-018
- [x] Sharding / horizontal partitioning; vertical partitioning — sql-nosql-005, sql-nosql-023
- [x] Shard key choice, hotspots, range vs hash sharding — sql-nosql-019, sql-nosql-020, sql-nosql-034
- [x] Consistent hashing and virtual nodes — sql-nosql-021, sql-nosql-022
- [x] Resharding / rebalancing — sql-nosql-021
- [x] Sharding vs replication purpose (scale writes/data vs availability/reads) — sql-nosql-005
- [x] Read replicas for read scaling — sql-nosql-006
- [x] Denormalization in NoSQL; joins absent — sql-nosql-024
- [x] Indexes in document DBs; MongoDB basics — sql-nosql-024, sql-nosql-031
- [x] Redis basics (in-memory, data structures, persistence) and caching patterns (cache-aside, write-through, write-back) — sql-nosql-025, sql-nosql-026, sql-nosql-027
- [x] OLTP vs OLAP; row vs columnar storage — sql-nosql-028, sql-nosql-029
- [x] Split brain and majority quorums — sql-nosql-030

---

# Python (3.11+)

## Data Types & Object Model (`py-types`)
- [x] Mutable vs immutable built-in types — py-types-001, py-types-010, py-types-046
- [x] Everything is an object: identity, type, value; id() — py-types-004, py-types-046
- [x] Variables are names bound to objects (references) — py-types-015, py-types-046
- [x] Aliasing with assignment — py-types-002, py-types-031
- [x] Dynamic typing vs strong typing ("1" + 1 TypeError) — py-types-008
- [x] `is` vs `==` — py-types-005, py-types-029
- [x] Small integer caching (−5 to 256) and why not to rely on it — py-types-025, py-types-035
- [x] String interning — py-types-036
- [x] None singleton; `is None` idiom — py-types-009
- [x] Numeric types: int (arbitrary precision), float (IEEE 754), complex — py-types-014, py-types-032, py-types-033
- [x] Float precision trap: 0.1 + 0.2 != 0.3; math.isclose; Decimal — py-types-017, py-types-045, py-types-042
- [x] True division `/` vs floor division `//` with negatives; `%` sign follows divisor — py-types-006, py-types-011, py-types-016, py-types-039
- [x] `divmod`, `**` precedence and right-associativity (-2**2, 2**3**2) — py-types-012, py-types-018, py-types-039, py-types-044
- [x] bool is subclass of int (True + True, sum of booleans) — py-types-013, py-types-023, py-types-044
- [x] Truthiness of values (0, '', [], {}, None, 0.0, empty containers) — py-types-007, py-types-033, py-types-040
- [x] `and`/`or` return operands, not booleans; short-circuit — py-types-019
- [x] Chained comparisons (1 < 2 < 3, 1 < 3 > 2, False == False in [False]) — py-types-037, py-types-038
- [x] type() vs isinstance(); bool isinstance int — py-types-023, py-types-032
- [x] Type conversion: int('3.5') error, int(3.9) truncation, round() banker's rounding — py-types-020, py-types-021, py-types-022
- [x] Hashability: immutable types hashable; tuple with list not hashable — py-types-024, py-types-034, py-types-041
- [x] `+=` on mutable vs immutable (in-place vs rebinding) — py-types-002, py-types-026, py-types-031
- [x] Tuple containing list `+=` trap — py-types-003
- [x] Integer arbitrary precision; no overflow — py-types-014, py-types-042
- [x] Bitwise operators and ~x = −x−1 — py-types-027
- [x] Type hints are not enforced at runtime — py-types-028
- [x] NaN != NaN; float('inf') — py-types-029
- [x] `None == False` is False; comparing None with < raises TypeError — py-types-030, py-types-043

## Strings (`py-strings`)
- [x] String immutability (item assignment TypeError) — py-strings-001
- [x] Indexing and negative indexing — py-strings-002
- [x] Slicing [start:stop:step], defaults, out-of-range slices don't raise — py-strings-002, py-strings-015, py-strings-016
- [x] Reversal [::-1] and negative step edge cases — py-strings-004, py-strings-017, py-strings-039, py-strings-044
- [x] Concatenation, repetition ('ab' * 3), `in` operator — py-strings-003, py-strings-046
- [x] Methods: split (with/without sep, maxsplit), join, strip/lstrip/rstrip (char set semantics) — py-strings-008, py-strings-009, py-strings-011, py-strings-014, py-strings-029
- [x] find vs index (−1 vs ValueError), count, replace (count arg) — py-strings-005, py-strings-018, py-strings-040, py-strings-046
- [x] upper/lower/title/capitalize/swapcase, startswith/endswith (tuple arg) — py-strings-012, py-strings-027, py-strings-028
- [x] isdigit/isalpha/isalnum/isspace edge cases — py-strings-026
- [x] split() vs split(' ') on multiple spaces — py-strings-013
- [x] f-strings: expressions, format spec (:.2f, :>10, :08.3f, :,), `=` debug specifier, !r — py-strings-010, py-strings-020, py-strings-021, py-strings-022, py-strings-042
- [x] str.format and % formatting — py-strings-023, py-strings-043
- [x] Raw strings and escape sequences; len of escaped strings — py-strings-024
- [x] Multiline strings, implicit concatenation of adjacent literals — py-strings-025, py-strings-037
- [x] String comparison is lexicographic by code point ('Z' < 'a', '10' < '9') — py-strings-019, py-strings-041
- [x] ord/chr — py-strings-007
- [x] Efficient building: join vs += in loop (O(n²) concern) — py-strings-030
- [x] Unicode, encode/decode, bytes vs str — py-strings-031, py-strings-035
- [x] String methods return new strings (s.upper() without assignment trap) — py-strings-006
- [x] str.partition, zfill, center, removeprefix/removesuffix — py-strings-027, py-strings-033, py-strings-047
- [x] Counting characters / palindromes / anagrams (interview patterns) — py-strings-034, py-strings-045, py-strings-038
- [x] repr vs str — py-strings-032
- [x] Full-slice identity for immutable str vs list copy — py-strings-036

## Lists, Tuples, Sets & Dicts (`py-containers`)
- [x] List operations: append vs extend vs insert; + vs += — py-containers-001, py-containers-026, py-containers-040
- [x] pop(), pop(i), remove(x) (first occurrence), del, clear — py-containers-008, py-containers-009, py-containers-031
- [x] List methods return None (x = lst.sort() trap; append returns None) — py-containers-002, py-containers-033
- [x] Time complexities: list index O(1), append amortised O(1), insert(0)/pop(0) O(n), `in` O(n) — py-containers-025, py-containers-007
- [x] Set/dict `in` average O(1); worst case — py-containers-007, py-containers-046
- [x] List multiplication with nested lists `[[0]*3]*3` aliasing trap — py-containers-014, py-containers-038
- [x] Shallow vs deep copy: slicing, list(), copy(), copy.deepcopy — py-containers-015, py-containers-016, py-containers-037
- [x] Modifying a list while iterating over it (skipping elements) — py-containers-017, py-containers-036
- [x] List slicing assignment (replacing/inserting/deleting slices) — py-containers-018, py-containers-039, py-containers-040, py-containers-042
- [x] Tuples: immutability, single-element tuple `(1,)`, packing/unpacking, star unpacking — py-containers-004, py-containers-011, py-containers-019, py-containers-032
- [x] Tuple comparison lexicographic — py-containers-020
- [x] Sets: unordered, unique, hashable elements, set operations (| & - ^), {} is dict — py-containers-003, py-containers-012, py-containers-041, py-containers-044
- [x] frozenset — py-containers-028
- [x] Dicts: insertion order preserved (3.7+), keys must be hashable — py-containers-010, py-containers-045
- [x] Dict access: [] KeyError vs get() vs setdefault — py-containers-005, py-containers-006, py-containers-024, py-containers-047
- [x] Dict keys equal-hash collisions: {1: 'a', True: 'b', 1.0: 'c'} — py-containers-041 (see also py-types-041)
- [x] Dict views (keys/values/items) are dynamic — py-containers-021
- [x] Modifying dict size during iteration RuntimeError — py-containers-022
- [x] Dict merge | and |= (3.9+), update, unpacking {**a, **b} — py-containers-023, py-containers-045
- [x] dict.fromkeys with mutable default trap — py-containers-034
- [x] Sorting dicts by value — py-containers-027
- [x] Unpacking: a, b = b, a; a, *b, c = ... — py-containers-011, py-containers-019, py-containers-043
- [x] list.index, count; min/max on lists — py-containers-032
- [x] Equality vs identity of containers; nested structures — py-containers-029, py-containers-035, py-containers-048
- [x] Memory: tuples smaller/faster than lists — py-containers-013
- [x] Negative indexing and IndexError vs slicing safety — py-containers-030
- [x] `del lst[::2]` etc. advanced slicing — py-containers-031, py-containers-039

## Comprehensions & Generator Expressions (`py-comp`)
- [x] List comprehension syntax and equivalence to loop — py-comp-001, py-comp-007
- [x] Conditional filtering `if` vs conditional expression `x if c else y` placement — py-comp-002, py-comp-006, py-comp-014, py-comp-022
- [x] Nested comprehensions order of loops (flattening) — py-comp-008, py-comp-009, py-comp-020, py-comp-034
- [x] Nested comprehension for matrices (transpose) — py-comp-010, py-comp-028, py-comp-033
- [x] Dict comprehension; duplicate keys overwrite — py-comp-004, py-comp-011, py-comp-021, py-comp-032
- [x] Set comprehension dedup — py-comp-003, py-comp-019
- [x] Generator expressions: lazy, single-use, memory efficient — py-comp-005, py-comp-015
- [x] Generator exhausted after one pass (sum twice trap) — py-comp-012, py-comp-029
- [x] Parentheses: no tuple comprehension; `(x for x in ...)` is a generator — py-comp-005
- [x] Comprehension variable scope (doesn't leak in Python 3) — py-comp-013
- [x] Class-scope comprehension name lookup gotcha — py-comp-026
- [x] Late binding of lambdas created in comprehensions — py-comp-024, py-comp-025
- [x] Walrus in comprehensions — py-comp-018
- [x] Performance of comprehensions vs loops vs map — py-comp-023
- [x] Generator expression as sole argument (sum(x for x in ...)) — py-comp-030, py-comp-035
- [x] any/all with generator short-circuit — py-comp-016, py-comp-017
- [x] Early evaluation of the first `for` iterable in generator expressions — py-comp-027, py-comp-036
- [x] zip inside comprehensions — py-comp-031

## Control Flow (`py-control`)
- [x] if/elif/else; conditional expression — py-control-008, py-control-009
- [x] for loop over iterables; range(start, stop, step) semantics and empty ranges — py-control-002, py-control-032
- [x] while loop — py-control-006
- [x] break, continue, pass — py-control-003, py-control-004, py-control-005
- [x] for/else: else runs when no break — py-control-001, py-control-010, py-control-029, py-control-035
- [x] while/else semantics — py-control-011, py-control-012, py-control-034
- [x] Loop variable persists after loop (leaks) — py-control-013, py-control-014
- [x] Reassigning loop variable inside for has no effect on iteration — py-control-015
- [x] Modifying range bound during loop has no effect — py-control-016
- [x] enumerate with start; zip in loops — py-control-007, py-control-033
- [x] Walrus operator `:=` semantics and precedence — py-control-017, py-control-018
- [x] match-case: literal, capture, wildcard, OR patterns, guards — py-control-019, py-control-021, py-control-037
- [x] match-case: sequence and mapping patterns, class patterns — py-control-020, py-control-023, py-control-024, py-control-025, py-control-026
- [x] match-case: capture pattern vs dotted constant gotcha — py-control-022, py-control-038
- [x] Short-circuit evaluation in conditions — py-control-030
- [x] Nested loop break only exits inner loop — py-control-027, py-control-035
- [x] try/finally interplay with break/continue/return in loops — py-control-028
- [x] `else` on `try` — covered in Exceptions (py-exc)
- [x] Infinite loops and iteration over changing collections — py-control-031, py-control-036
- [x] Ternary chaining and readability — py-control-009

## Functions & Scope (`py-func`)
- [x] def, return; implicit return None — py-func-001, py-func-043
- [x] Positional, keyword, default arguments — py-func-002, py-func-042
- [x] *args and **kwargs; unpacking at call site — py-func-003, py-func-018, py-func-032, py-func-039
- [x] Keyword-only (after *) and positional-only (/) parameters — py-func-015, py-func-016, py-func-042
- [x] Argument order rules and errors (positional after keyword) — py-func-017, py-func-033
- [x] Mutable default argument pitfall (evaluated once) — py-func-008, py-func-027, py-func-040
- [x] None-sentinel idiom — py-func-009
- [x] Default argument evaluated at definition time (time-dependent defaults) — py-func-026, py-func-034
- [x] Pass-by-object-reference (mutation vs rebinding inside function) — py-func-013, py-func-014
- [x] LEGB scope resolution — py-func-007, py-func-036
- [x] UnboundLocalError when assigning to a global name in function — py-func-010, py-func-028
- [x] global keyword — py-func-011, py-func-029
- [x] nonlocal keyword — py-func-012, py-func-030, py-func-031
- [x] Lambda: single expression, closures with late binding (lambdas in loop) — py-func-005, py-func-034 (see also py-comp-024)
- [x] Default-argument trick to capture loop variable — py-func-034 (see also py-comp-025)
- [x] map, filter, reduce (functools); map returns iterator — py-func-006, py-func-019, py-func-020, py-func-035
- [x] Functions are first-class objects; higher-order functions — py-func-021
- [x] Recursion and recursion limit (~1000) — py-func-022, py-func-037
- [x] Docstrings, annotations, __name__ — py-func-023, py-func-044
- [x] Function attributes and __defaults__ — py-func-023, py-func-038
- [x] Multiple return values (tuple) — py-func-004
- [x] functools.partial — py-func-024
- [x] Built-in shadowing (list = ..., then list() fails) — py-func-025, py-func-036
- [x] Late binding of global names at call time — py-func-041

## Iterators & Generators (`py-iter`)
- [x] Iterable vs iterator; __iter__ and __next__ — py-iter-001, py-iter-034
- [x] iter() and next(); StopIteration — py-iter-002, py-iter-035
- [x] for-loop protocol under the hood — py-iter-017
- [x] Iterators are single-pass (exhaustion) — py-iter-007, py-iter-027, py-iter-032
- [x] Custom iterator class — py-iter-014, py-iter-015
- [x] Generator functions; yield pauses state — py-iter-003, py-iter-004
- [x] Generator object creation does not run body until next() — py-iter-008
- [x] Generator return value and StopIteration.value — py-iter-009, py-iter-028
- [x] yield from delegation — py-iter-010, py-iter-011
- [x] send() and generator as coroutine; first send must be None — py-iter-012, py-iter-013, py-iter-033
- [x] close(), throw(), GeneratorExit — py-iter-020, py-iter-021
- [x] Infinite generators; itertools.islice — py-iter-016
- [x] Lazy evaluation and memory benefits — py-iter-019, py-iter-025, py-iter-026
- [x] Generator pipelines — py-iter-018
- [x] next() with default — py-iter-005
- [x] zip/map/filter/reversed/enumerate return iterators — py-iter-007, py-iter-022, py-iter-025, py-iter-031
- [x] range is a lazy sequence, not an iterator (reusable, len, indexing) — py-iter-006
- [x] Dict iteration views vs iterators — py-iter-024, py-iter-036
- [x] Iterating while a generator is modified / generator in membership test consumes — py-iter-032 (see also py-comp-029)
- [x] Generator expression vs generator function — py-iter-037
- [x] iter(callable, sentinel) form — py-iter-023
- [x] PEP 479: StopIteration inside a generator becomes RuntimeError — py-iter-030
- [x] return inside a generator ends it — py-iter-029

## Decorators & Closures (`py-deco`)
- [x] Closures: inner function capturing enclosing variables; __closure__/cells — py-deco-004, py-deco-005, py-deco-031
- [x] Late binding in closures — py-deco-016, py-deco-025
- [x] nonlocal in closures (counter factory) — py-deco-017, py-deco-018 (see also py-func-031)
- [x] Decorator concept: function taking and returning a function — py-deco-001, py-deco-003, py-deco-030
- [x] @ syntax equivalence f = deco(f) — py-deco-002
- [x] Decorator execution time (at definition/import) — py-deco-006, py-deco-010
- [x] Wrapper with *args, **kwargs — py-deco-029
- [x] functools.wraps preserving __name__/__doc__ — py-deco-007, py-deco-024
- [x] Decorators with arguments (three-level nesting) — py-deco-008, py-deco-022
- [x] Stacked decorators: application order bottom-up, execution order top-down — py-deco-009, py-deco-010, py-deco-023, py-deco-028
- [x] Class-based decorators (__call__) — py-deco-013, py-deco-026
- [x] Decorating classes — py-deco-019
- [x] Built-in decorators: @staticmethod, @classmethod, @property — py-deco-020
- [x] functools.lru_cache / cache (memoization); hashable arguments requirement — py-deco-014, py-deco-015, py-deco-027
- [x] Decorator that counts calls / timing decorator — py-deco-021, py-deco-013
- [x] Decorator forgetting to return wrapper / result (returns None trap) — py-deco-011, py-deco-012
- [x] Decorator state shared across calls — py-deco-021, py-deco-027

## OOP Basics (`py-oop`)
- [x] Class vs instance; self — py-oop-001
- [x] __init__ is initializer; __new__ creates the instance — py-oop-002
- [x] __new__ returning non-instance skips __init__ — py-oop-026
- [x] Instance vs class attributes; shadowing via instance assignment — py-oop-003, py-oop-004, py-oop-029
- [x] Mutable class attribute shared across instances (trap) — py-oop-009, py-oop-030
- [x] Instance methods, @classmethod (cls), @staticmethod — py-oop-005, py-oop-035
- [x] Alternative constructors with classmethod — py-oop-010, py-oop-034
- [x] Encapsulation conventions: _protected, __private name mangling — py-oop-012
- [x] Name mangling output (_ClassName__attr) — py-oop-011
- [x] @property getter/setter/deleter; read-only property — py-oop-013, py-oop-014
- [x] __dict__ and dynamic attribute addition — py-oop-007, py-oop-022
- [x] __slots__ — py-oop-015
- [x] Abstract classes: abc.ABC, @abstractmethod; instantiation TypeError — py-oop-016
- [x] Dataclasses: auto __init__/__repr__/__eq__; field(default_factory=list); frozen; order — py-oop-017, py-oop-019, py-oop-020, py-oop-033
- [x] Dataclass mutable default error — py-oop-018
- [x] Polymorphism and duck typing — py-oop-024
- [x] Composition vs inheritance — py-oop-025
- [x] getattr/setattr/hasattr — py-oop-022
- [x] Class attribute lookup order (instance → class → bases) — py-oop-023, py-oop-031
- [x] Methods are functions bound at attribute access (bound methods) — py-oop-021, py-oop-028, py-oop-032
- [x] Singleton pattern in Python — py-oop-027
- [x] Equality default is identity (no __eq__) — py-oop-006
- [x] Class-level counters via the class name — py-oop-008

## Inheritance, MRO & Special Methods (`py-oopadv`)
- [x] Single, multiple, multilevel, hierarchical inheritance — py-oopadv-001, py-oopadv-006
- [x] Method overriding — py-oopadv-001
- [x] super() basics and calling parent __init__ — py-oopadv-002
- [x] Forgetting super().__init__ → missing attributes — py-oopadv-007
- [x] MRO and C3 linearization; ClassName.__mro__ / mro() — py-oopadv-008, py-oopadv-028
- [x] Diamond problem and cooperative super() (MRO-based call chains, output) — py-oopadv-009, py-oopadv-029
- [x] Inconsistent MRO TypeError — py-oopadv-027
- [x] isinstance/issubclass with inheritance — py-oopadv-003
- [x] __str__ vs __repr__; fallback rules — py-oopadv-004, py-oopadv-030
- [x] __eq__ and __hash__ relationship (defining __eq__ sets __hash__ to None) — py-oopadv-010
- [x] __lt__ and total_ordering; sorting custom objects — py-oopadv-011, py-oopadv-012
- [x] __len__, __getitem__ (iteration fallback), __contains__ — py-oopadv-005, py-oopadv-013, py-oopadv-014
- [x] __iter__/__next__ in classes — covered in py-iter-014, py-iter-015
- [x] __call__ — py-oopadv-015
- [x] __add__, __radd__, __iadd__; NotImplemented — py-oopadv-016, py-oopadv-017, py-oopadv-032, py-oopadv-035
- [x] __bool__ / __len__ truthiness fallback — py-oopadv-018
- [x] __getattr__ vs __getattribute__ — py-oopadv-019, py-oopadv-020
- [x] __setattr__ recursion trap — py-oopadv-021, py-oopadv-022
- [x] __enter__/__exit__ (link to context managers) — covered in py-exc
- [x] __del__ (finalizer) caveats — py-oopadv-023
- [x] Metaclasses basics (type is the metaclass of classes) — py-oopadv-024, py-oopadv-025
- [x] Mixins — py-oopadv-026
- [x] Method resolution with class attributes in multiple bases — py-oopadv-028
- [x] Operator overloading output questions — py-oopadv-031, py-oopadv-033
- [x] __init_subclass__ hook — py-oopadv-034

## Exceptions & Context Managers (`py-exc`)
- [x] try/except/else/finally execution order — py-exc-002, py-exc-006, py-exc-008
- [x] else runs only if no exception — py-exc-002, py-exc-028
- [x] finally always runs; return in finally overrides return in try (and swallows exceptions) — py-exc-013, py-exc-014, py-exc-027, py-exc-029, py-exc-031, py-exc-034
- [x] Exception hierarchy: BaseException, Exception, KeyboardInterrupt, SystemExit — py-exc-016
- [x] Common exceptions: ValueError, TypeError, KeyError, IndexError, AttributeError, ZeroDivisionError, NameError — py-exc-001, py-exc-003, py-exc-005
- [x] Order of except clauses (subclass before superclass) — py-exc-009
- [x] Catching multiple exceptions with tuple — py-exc-005
- [x] raise, re-raise with bare raise — py-exc-010, py-exc-033
- [x] Exception chaining: raise ... from ...; __cause__ vs __context__ — py-exc-011, py-exc-012
- [x] Custom exceptions (subclass Exception) — py-exc-004, py-exc-026
- [x] Bare except catches everything (anti-pattern) — py-exc-037
- [x] Exception variable cleared after except block (NameError) — py-exc-015
- [x] assert statements (disabled with -O) — py-exc-017
- [x] EAFP vs LBYL — py-exc-018
- [x] Context managers: with statement, __enter__/__exit__ — py-exc-007, py-exc-019
- [x] __exit__ returning True suppresses exception — py-exc-020
- [x] contextlib.contextmanager generator-based — py-exc-021, py-exc-022
- [x] Multiple context managers in one with — py-exc-023
- [x] File handling with with (auto-close) — py-exc-007, py-exc-032
- [x] ExceptionGroup and except* (3.11) — py-exc-024
- [x] add_note (3.11) — py-exc-025
- [x] Exceptions in generators/loops (StopIteration conversions) — py-exc-031 (see also py-iter-030)
- [x] warnings vs exceptions — py-exc-036
- [x] Exception args and str(KeyError) quirk — py-exc-030, py-exc-035

## Modules & Packages (`py-modules`)
- [x] Module = .py file; package = directory (with __init__.py; namespace packages) — py-modules-001, py-modules-025
- [x] import x vs from x import y vs import as — py-modules-004, py-modules-005, py-modules-030
- [x] Module code runs once on first import (module caching, sys.modules) — py-modules-006, py-modules-019
- [x] `if __name__ == "__main__"` purpose — py-modules-003, py-modules-016
- [x] __name__ value when imported vs run — py-modules-002, py-modules-007
- [x] from module import * and __all__ — py-modules-008, py-modules-029
- [x] Underscore-prefixed names not imported by * — py-modules-009
- [x] Module search path: sys.path order, current dir — py-modules-010
- [x] Shadowing standard library modules (random.py trap) — py-modules-010, py-modules-017
- [x] Relative vs absolute imports — py-modules-012
- [x] Circular imports and partially initialized modules — py-modules-013, py-modules-015
- [x] importlib.reload — py-modules-020, py-modules-028
- [x] __init__.py role — py-modules-014, py-modules-025
- [x] pip, virtual environments, requirements.txt — py-modules-022
- [x] python -m module — py-modules-023
- [x] .pyc and __pycache__ — py-modules-021
- [x] `from x import y` binds a name copy (rebinding in module not reflected) — py-modules-011, py-modules-028
- [x] dir(), help() — py-modules-027, py-modules-018
- [x] Standard library awareness (os, sys, math, json, datetime, re, pathlib) — py-modules-024
- [x] Imports bind names in the current scope (function-local imports) — py-modules-026

## Memory, GIL & Concurrency (`py-memory`)
- [x] Reference counting; sys.getrefcount — py-memory-001, py-memory-006, py-memory-029
- [x] del removes a name, not necessarily the object — py-memory-002, py-memory-029
- [x] Cyclic garbage collector; gc module; generations — py-memory-007, py-memory-030
- [x] Reference cycles and __del__ — py-memory-030
- [x] weakref basics — py-memory-008
- [x] Memory: everything on private heap; pymalloc — py-memory-033
- [x] sys.getsizeof shallow size — py-memory-031
- [x] GIL: what it is, why (refcount safety), effect on CPU-bound threads — py-memory-003, py-memory-009
- [x] GIL released on I/O; threads good for I/O-bound — py-memory-010
- [x] Free-threaded build (3.13+, PEP 703) awareness — py-memory-028
- [x] threading module: Thread, start, join, daemon threads — py-memory-012, py-memory-013
- [x] Race conditions in threads; Lock — py-memory-011, py-memory-034
- [x] multiprocessing: separate processes, separate memory, pickling, Pool — py-memory-014, py-memory-015, py-memory-032
- [x] multiprocessing for CPU-bound work — py-memory-004
- [x] asyncio: event loop, coroutines, async/await, single-threaded cooperative — py-memory-005, py-memory-016, py-memory-021, py-memory-022
- [x] asyncio.gather vs sequential awaits (timing numerical) — py-memory-017, py-memory-018
- [x] Calling coroutine without await (creates coroutine object; warning) — py-memory-019
- [x] Blocking call (time.sleep) inside async code blocks event loop — py-memory-020
- [x] concurrent.futures ThreadPoolExecutor/ProcessPoolExecutor — py-memory-024
- [x] Choosing threads vs processes vs asyncio — py-memory-025, py-memory-004
- [x] Queue for thread-safe communication — py-memory-026
- [x] Deadlocks with locks; RLock — py-memory-027
- [x] asyncio timeouts (wait_for) — py-memory-023
- [x] Interned strings & small ints memory sharing link — covered in py-types-025, py-types-036

## Built-ins & Standard Library (`py-stdlib`)
- [x] sorted() vs list.sort(): new list vs in-place, return value — py-stdlib-001
- [x] Sort stability; multi-key sorting with tuples — py-stdlib-009, py-stdlib-010, py-stdlib-034
- [x] key functions; reverse=True; key=len, key=str.lower — py-stdlib-008, py-stdlib-011
- [x] Sorting with lambda returning tuple (descending numeric via negative) — py-stdlib-010
- [x] min/max with key and default — py-stdlib-008, py-stdlib-012, py-stdlib-039
- [x] enumerate(start=) — py-stdlib-002
- [x] zip stops at shortest; zip(*matrix) transpose; strict=True; itertools.zip_longest — py-stdlib-002, py-stdlib-013, py-stdlib-014
- [x] any/all on empty iterables — py-stdlib-003
- [x] sum with start; sum of lists trap — py-stdlib-015
- [x] round() banker's rounding; abs, pow with mod — py-stdlib-016 (see also py-types-020)
- [x] reversed(), range — py-stdlib-008
- [x] map/filter with None — py-stdlib-030 (see also py-func-019)
- [x] collections.Counter: most_common, arithmetic, missing key returns 0 — py-stdlib-004, py-stdlib-017, py-stdlib-036
- [x] collections.defaultdict: default_factory, accessing missing key inserts it — py-stdlib-005, py-stdlib-018, py-stdlib-037
- [x] collections.deque: O(1) appends/pops both ends, maxlen, rotate — py-stdlib-006, py-stdlib-019
- [x] collections.namedtuple: immutability, _replace, field access — py-stdlib-020
- [x] collections.OrderedDict move_to_end (LRU cache use) — py-stdlib-021, py-stdlib-042
- [x] ChainMap awareness — py-stdlib-040
- [x] itertools: count, cycle, repeat, chain, islice, product, permutations, combinations (counts numericals) — py-stdlib-022, py-stdlib-024, py-stdlib-041
- [x] itertools.groupby requires sorted input (trap) — py-stdlib-023, py-stdlib-035
- [x] itertools.accumulate — py-stdlib-024
- [x] heapq: min-heap, heappush/heappop, heapify O(n), nlargest/nsmallest, max-heap via negation — py-stdlib-007, py-stdlib-025, py-stdlib-038
- [x] heapq with tuples ordering — py-stdlib-026
- [x] bisect module — py-stdlib-027
- [x] functools.reduce, partial, cmp_to_key — py-stdlib-028 (reduce/partial in py-func-020, py-func-024)
- [x] Time complexities of built-in operations (sort O(n log n), Timsort) — py-stdlib-029, py-stdlib-038
- [x] isinstance with tuple of types; type checks — py-stdlib-030
- [x] Built-ins id, hash, dir, vars, getattr — py-stdlib-033
- [x] eval/exec dangers — py-stdlib-032
- [x] Integer conversion bases int('ff', 16), bin/hex/oct — py-stdlib-031

---

# Finance

## Time Value of Money & Discounting (`fin-tvm`)
- [x] Why money today is worth more than tomorrow; interest rate as opportunity cost — fin-tvm-001
- [x] Simple vs compound interest (numerical) — fin-tvm-002
- [x] Future value and present value of a lump sum (numerical) — fin-tvm-003, fin-tvm-004
- [x] Compounding frequency; effective annual rate vs nominal/APR (numerical) — fin-tvm-005, fin-tvm-006, fin-tvm-028, fin-tvm-029
- [x] Continuous compounding (numerical) — fin-tvm-007
- [x] Rule of 72 (numerical) — fin-tvm-008
- [x] Ordinary annuity: future value and present value (numerical) — fin-tvm-009, fin-tvm-010
- [x] Annuity due vs ordinary annuity (numerical) — fin-tvm-011, fin-tvm-031
- [x] Perpetuity and growing perpetuity (numerical) — fin-tvm-012, fin-tvm-013, fin-tvm-027
- [x] Growing annuity — fin-tvm-014
- [x] Loan amortisation: EMI/payment, interest vs principal split, outstanding balance (numerical) — fin-tvm-015, fin-tvm-016, fin-tvm-017, fin-tvm-018
- [x] Present value of uneven cash flows (numerical) — fin-tvm-019
- [x] Real vs nominal rates; Fisher equation (numerical) — fin-tvm-020
- [x] How discount rate and time affect present value — fin-tvm-021, fin-tvm-026
- [x] Solving for the rate or the number of periods (numerical) — fin-tvm-022, fin-tvm-023
- [x] Savings and retirement goal problems (numerical) — fin-tvm-024, fin-tvm-025, fin-tvm-030
- [x] Components of the discount rate: risk-free, inflation, risk, liquidity and term premiums — fin-tvm-032
- [x] Choosing discount rates by risk level (government, corporate, equity/CAPM, risky projects) — fin-tvm-033
- [x] Continuous discounting PV = FV·e^(−rt) (numerical) — fin-tvm-034
- [x] Perpetuity due (numerical) — fin-tvm-035

## Accounting & Financial Statements (`fin-acct`)
- [x] The three financial statements and what each shows — fin-acct-001
- [x] Accounting equation: Assets = Liabilities + Equity — fin-acct-002
- [x] Accrual vs cash accounting; revenue recognition and matching principle — fin-acct-003, fin-acct-022, fin-acct-025
- [x] Income statement structure: revenue → gross profit → EBITDA → EBIT → EBT → net income (numerical) — fin-acct-004
- [x] Balance sheet: current vs non-current assets and liabilities; shareholders' equity components — fin-acct-005, fin-acct-021
- [x] Cash flow statement: operating, investing, financing; indirect method (numerical) — fin-acct-006, fin-acct-020
- [x] How the three statements link together — fin-acct-007
- [x] Walk-through: effect of a change (e.g. depreciation +10) on all three statements (numerical) — fin-acct-008, fin-acct-019, fin-acct-020
- [x] Depreciation methods: straight-line, declining balance (numerical) — fin-acct-009
- [x] Inventory methods: FIFO, LIFO, weighted average; effect under inflation (numerical) — fin-acct-010
- [x] Working-capital accounts: receivables, payables, inventory, prepaid expenses, deferred revenue — fin-acct-011, fin-acct-025, fin-acct-006
- [x] Capitalising vs expensing; capex vs opex — fin-acct-012
- [x] Goodwill and intangibles; amortisation and impairment — fin-acct-013
- [x] Debits and credits; double-entry basics — fin-acct-014
- [x] Retained earnings roll-forward (numerical) — fin-acct-015
- [x] Free cash flow (numerical) — fin-acct-016
- [x] Non-cash items and deferred taxes basics — fin-acct-017, fin-acct-019
- [x] EBITDA: uses and limitations — fin-acct-018
- [x] GAAP vs IFRS basics; auditors and going concern — fin-acct-023, fin-acct-024, fin-acct-026

## Financial Ratios & Working Capital (`fin-ratios`)
- [x] Liquidity ratios: current, quick, cash (numerical) — fin-ratios-001, fin-ratios-015
- [x] Leverage/solvency ratios: debt-to-equity, debt-to-capital, interest coverage, net debt/EBITDA (numerical) — fin-ratios-002, fin-ratios-018
- [x] Profitability: gross, operating and net margin; ROA, ROE, ROCE/ROIC (numerical) — fin-ratios-003, fin-ratios-004, fin-ratios-006
- [x] DuPont analysis, three-step (numerical) — fin-ratios-004, fin-ratios-005
- [x] Efficiency: asset turnover, inventory turnover, DSO, DIO, DPO (numerical) — fin-ratios-007, fin-ratios-019
- [x] Cash conversion cycle (numerical) — fin-ratios-008
- [x] Net working capital; how a change in NWC affects cash (numerical) — fin-ratios-009, fin-ratios-020
- [x] EPS: basic vs diluted (numerical) — fin-ratios-010
- [x] Dividend payout ratio, retention ratio and sustainable growth rate (numerical) — fin-ratios-011, fin-ratios-016
- [x] Operating leverage and financial leverage (DOL, DFL) (numerical) — fin-ratios-012
- [x] Break-even analysis and contribution margin (numerical) — fin-ratios-013
- [x] Interpreting ratios: industry context, trends, limitations, window dressing — fin-ratios-014, fin-ratios-017

## Capital Budgeting (`fin-capbud`)
- [x] NPV: definition and decision rule (numerical) — fin-capbud-001, fin-capbud-002
- [x] IRR: definition and decision rule (numerical) — fin-capbud-003
- [x] NPV vs IRR conflicts: scale, timing, mutually exclusive projects; reinvestment assumption — fin-capbud-004, fin-capbud-019
- [x] Multiple IRRs with non-conventional cash flows — fin-capbud-005
- [x] MIRR (numerical) — fin-capbud-006
- [x] Payback and discounted payback period (numerical) — fin-capbud-007, fin-capbud-018
- [x] Profitability index and capital rationing (numerical) — fin-capbud-008
- [x] Relevant cash flows: sunk costs, opportunity costs, side effects/cannibalisation, allocated overhead, financing costs excluded — fin-capbud-009, fin-capbud-020
- [x] Incremental cash flows incl. working-capital investment and recovery (numerical) — fin-capbud-010, fin-capbud-013
- [x] Depreciation tax shield (numerical) — fin-capbud-011, fin-capbud-010
- [x] After-tax salvage value (numerical) — fin-capbud-012
- [x] Equivalent annual annuity for projects with unequal lives (numerical) — fin-capbud-014
- [x] Sensitivity, scenario and break-even analysis — fin-capbud-015
- [x] Real options basics (expand, abandon, delay) — fin-capbud-016
- [x] Inflation consistency: nominal cash flows with nominal rates — fin-capbud-017

## Cost of Capital & Capital Structure (`fin-wacc`)
- [x] Cost of equity via CAPM (numerical) — fin-wacc-001
- [x] Cost of equity via the dividend growth model (numerical) — fin-wacc-002
- [x] Cost of debt: yield to maturity, after-tax cost (numerical) — fin-wacc-003
- [x] Cost of preferred stock (numerical) — fin-wacc-004
- [x] WACC formula with market-value weights (numerical) — fin-wacc-005
- [x] Why market values and target weights, not book values — fin-wacc-006
- [x] Levered vs unlevered beta (Hamada) (numerical) — fin-wacc-007
- [x] Risk-free rate and equity risk premium choice — fin-wacc-008
- [x] Project-specific discount rate vs company WACC — fin-wacc-009
- [x] Modigliani-Miller without and with taxes; value of the interest tax shield (numerical) — fin-wacc-010, fin-wacc-011, fin-wacc-017
- [x] Trade-off theory and costs of financial distress — fin-wacc-012, fin-wacc-018
- [x] Pecking order theory and signalling — fin-wacc-013
- [x] Debt vs equity financing: pros and cons — fin-wacc-014
- [x] Effect of leverage on EPS and ROE (numerical) — fin-wacc-015
- [x] Why the cost of debt is lower than the cost of equity — fin-wacc-016

## Valuation: DCF & Multiples (`fin-valuation`)
- [x] Intrinsic vs relative valuation — fin-valuation-001
- [x] Enterprise value vs equity value and the bridge (net debt, preferred, minority interest) (numerical) — fin-valuation-002, fin-valuation-018
- [x] Matching multiples to EV or equity value (EV/EBITDA vs P/E) — fin-valuation-003, fin-valuation-020
- [x] Unlevered free cash flow calculation (numerical) — fin-valuation-004
- [x] DCF steps end to end — fin-valuation-005, fin-valuation-019
- [x] Terminal value: Gordon growth and exit multiple (numerical) — fin-valuation-006, fin-valuation-007
- [x] Discounting the terminal value; share of value in TV — fin-valuation-006, fin-valuation-008
- [x] DCF sensitivity to WACC and growth; why g must be below WACC (numerical) — fin-valuation-008
- [x] Trading comparables: choosing peers, calendarisation, applying multiples (numerical) — fin-valuation-009
- [x] Precedent transactions and control premium — fin-valuation-010
- [x] Football-field chart — fin-valuation-016
- [x] Dividend discount model (numerical) — fin-valuation-011
- [x] Implied share price from enterprise value (numerical) — fin-valuation-017, fin-valuation-009
- [x] Diluted shares via treasury stock method (numerical) — fin-valuation-012
- [x] P/E, PEG, P/B (e.g. for banks); valuing loss-making companies — fin-valuation-013, fin-valuation-014
- [x] Levered vs unlevered FCF and the matching discount rate — fin-valuation-015

## Bonds, Yields & Term Structure (`fin-bonds`)
- [x] Bond terms: face value, coupon, maturity, yield to maturity — fin-bonds-001
- [x] Bond pricing as present value of cash flows (numerical) — fin-bonds-002, fin-bonds-004
- [x] Inverse price-yield relationship; premium, discount and par bonds — fin-bonds-003, fin-bonds-020
- [x] Current yield vs YTM (numerical) — fin-bonds-005
- [x] Zero-coupon bond pricing (numerical) — fin-bonds-006, fin-bonds-021
- [x] Yield to call; callable and puttable bonds — fin-bonds-007, fin-bonds-018, fin-bonds-022
- [x] Accrued interest; clean vs dirty price (numerical) — fin-bonds-008
- [x] Macaulay and modified duration; price change estimate (numerical) — fin-bonds-009, fin-bonds-024, fin-bonds-025
- [x] Convexity — fin-bonds-011, fin-bonds-022
- [x] Yield curve shapes; inverted curve meaning — fin-bonds-012
- [x] Term-structure theories (expectations, liquidity preference, segmentation) — fin-bonds-013
- [x] Credit risk, ratings, spreads; investment grade vs high yield — fin-bonds-016, fin-bonds-023
- [x] Interest-rate risk vs reinvestment risk — fin-bonds-017
- [x] Bond types: government, corporate, municipal, convertible, floating-rate, inflation-linked — fin-bonds-018, fin-bonds-019, fin-bonds-021
- [x] Spot rates and implied forward rates (numerical) — fin-bonds-014, fin-bonds-015
- [x] Yield to worst; call premium — fin-bonds-007
- [x] Factors affecting price sensitivity: maturity, coupon, yield level — fin-bonds-010, fin-bonds-024
- [x] Rating scales (AAA…D, Aaa…C) and junk bonds — fin-bonds-016

## Investing & Equity Markets (`fin-equity`)
- [x] Common vs preferred stock — fin-equity-004
- [x] Primary vs secondary markets; IPO process, underwriting, book building — fin-equity-005
- [x] Order types: market, limit, stop — fin-equity-006
- [x] Bid-ask spread, liquidity, market makers — fin-equity-007
- [x] Market capitalisation (numerical) — fin-equity-008, fin-equity-009
- [x] Indices: price-weighted vs market-cap-weighted (numerical) — fin-equity-010, fin-equity-025
- [x] Dividend dates (declaration, ex-dividend, record, payment); price drop on ex-date — fin-equity-011
- [x] Stock splits and bonus issues (numerical) — fin-equity-012, fin-equity-026
- [x] Rights issues and theoretical ex-rights price (numerical) — fin-equity-013
- [x] Buybacks vs dividends — fin-equity-014
- [x] Short selling; buying on margin and margin calls (numerical) — fin-equity-015, fin-equity-016, fin-equity-027
- [x] Efficient market hypothesis: weak, semi-strong, strong — fin-equity-017
- [x] Fundamental vs technical analysis — fin-equity-018
- [x] Mutual funds, ETFs, index funds, hedge funds, private equity; NAV (numerical) — fin-equity-019, fin-equity-021
- [x] Active vs passive investing; expense ratio impact (numerical) — fin-equity-020, fin-equity-024
- [x] Behavioural finance biases — fin-equity-023
- [x] Why invest; asset classes (fixed income, equity, real estate, commodities, crypto) and their trade-offs — fin-equity-001, fin-equity-002
- [x] Market participants: retail, institutional, brokers, exchanges (NSE/BSE), regulator (SEBI) — fin-equity-003
- [x] What moves stock prices: supply/demand, earnings, macro, sentiment, events (COVID-19 crash) — fin-equity-022
- [x] Free-float market capitalisation index weighting (numerical) — fin-equity-009

## Technical Analysis & Trading Strategies (`fin-technical`)
- [x] Technical vs fundamental analysis; uses and limitations — fin-technical-001, fin-technical-019
- [x] Assumptions: markets discount everything, prices trend, history repeats, psychology — fin-technical-001
- [x] OHLC data and Japanese candlesticks: body, shadows, bullish vs bearish (numerical) — fin-technical-002, fin-technical-021
- [x] Candlestick patterns: doji, hammer, engulfing — fin-technical-003
- [x] Indicator families: momentum, trend, volume, volatility — fin-technical-004
- [x] Moving averages: SMA, WMA, EMA (numerical) — fin-technical-005, fin-timeseries-023, fin-timeseries-024, fin-timeseries-025
- [x] Moving-average crossovers: golden cross / death cross; lag — fin-technical-005
- [x] RSI calculation and overbought/oversold (numerical) — fin-technical-006, fin-technical-007, fin-technical-024
- [x] MACD line, signal line, histogram — fin-technical-008
- [x] Bollinger Bands and ATR (numerical) — fin-technical-009, fin-technical-010
- [x] OBV and volume confirmation — fin-technical-011
- [x] Support and resistance; breakouts — fin-technical-012, fin-technical-020
- [x] Strategy styles: trend following, momentum, mean reversion, breakout — fin-technical-013
- [x] Combining indicators; avoiding redundant signals — fin-technical-014
- [x] Backtesting purpose and limits — fin-technical-018, fin-technical-022
- [x] Risk management: stop loss, position sizing, risk-reward ratio (numerical) — fin-technical-015, fin-technical-016, fin-technical-017, fin-technical-023

## Risk, Return & Portfolio Theory (`fin-risk`)
- [x] Holding-period return (numerical) — fin-risk-001
- [x] Arithmetic vs geometric average return (numerical) — fin-risk-002, fin-stoch-026
- [x] Expected return, variance and standard deviation (numerical) — fin-risk-003
- [x] Risk-return trade-off; risk aversion — fin-risk-020
- [x] Diversification; systematic vs unsystematic risk — fin-risk-004, fin-risk-021
- [x] Covariance, correlation; two-asset portfolio variance (numerical) — fin-risk-005, fin-risk-006
- [x] Efficient frontier; minimum-variance portfolio — fin-risk-007, fin-risk-006
- [x] CAPM, security market line, beta interpretation (numerical) — fin-risk-008, fin-risk-009, fin-risk-010, fin-risk-015
- [x] Capital market line vs security market line — fin-risk-011
- [x] Jensen's alpha (numerical) — fin-risk-012
- [x] Sharpe, Treynor and Sortino ratios (numerical) — fin-risk-013, fin-risk-022, fin-risk-023
- [x] Portfolio beta (numerical) — fin-risk-014
- [x] Value at Risk basics (numerical) — fin-risk-016
- [x] Risk types: market, credit, liquidity, operational, currency — fin-risk-018
- [x] Multi-factor models (APT, Fama-French) — fin-risk-019
- [x] Normal distribution and the 68-95-99.7 rule (numerical) — fin-risk-017

## Probability for Quant Finance (`fin-prob`)
- [x] Random variables, PMF/PDF; expectation and linearity (even without independence) — fin-prob-001, fin-prob-002
- [x] Indicator trick for expected counts (numerical) — fin-prob-003, fin-prob-004
- [x] Variance properties: Var(aX+b), Var(X+Y) with covariance (numerical) — fin-prob-005, fin-prob-006
- [x] Distributions: Bernoulli, binomial, Poisson, uniform, normal — means and variances (numerical) — fin-prob-007, fin-prob-008, fin-prob-009, fin-prob-010, fin-prob-032
- [x] Independence vs zero correlation — fin-prob-011
- [x] Covariance and correlation (numerical) — fin-prob-012, fin-prob-006
- [x] Conditional probability and Bayes' theorem; base-rate fallacy (numerical) — fin-prob-013, fin-prob-014, fin-prob-035
- [x] Conditional expectation as a random variable; tower property — fin-prob-015
- [x] Law of total expectation and first-step recursion (numerical) — fin-prob-016, fin-prob-017
- [x] Coupon collector (numerical) — fin-prob-018
- [x] Symmetry arguments, e.g. expected position of first ace (numerical) — fin-prob-019
- [x] Markov and Chebyshev inequalities (numerical) — fin-prob-020, fin-prob-021
- [x] Markov chains: transition matrix, n-step probabilities, stationary distribution (numerical) — fin-prob-022, fin-prob-023, fin-prob-024
- [x] Joint, marginal and conditional distributions; linear combinations of joint normals — fin-prob-025, fin-prob-035
- [x] Convergence types: almost sure, in probability, in distribution — fin-prob-026
- [x] Law of large numbers and central limit theorem (numerical) — fin-prob-027, fin-prob-028, fin-prob-033
- [x] Classic interview puzzles: expected tosses to a pattern, gambler's ruin, dice games (numerical) — fin-prob-017, fin-prob-029, fin-prob-030, fin-prob-031, fin-prob-034

## Stochastic Calculus & GBM (`fin-stoch`)
- [x] Symmetric random walk: mean, variance, martingale property — fin-stoch-001, fin-stoch-002
- [x] Quadratic variation of a random walk and of Brownian motion — fin-stoch-003, fin-stoch-007
- [x] Brownian motion: definition, independent normal increments, W(t)−W(s) ~ N(0, t−s) (numerical) — fin-stoch-004, fin-stoch-005, fin-stoch-006, fin-stoch-025
- [x] Paths continuous but nowhere differentiable; scaling ±√h — fin-stoch-004, fin-stoch-007
- [x] Why ordinary calculus fails: (dW)² = dt — fin-stoch-008, fin-stoch-028
- [x] Itô's lemma statement and the extra ½σ²f'' term — fin-stoch-009, fin-stoch-023
- [x] Applying Itô to f(W) = W² and to log S (numerical) — fin-stoch-010, fin-stoch-012
- [x] Geometric Brownian motion SDE dS = μS dt + σS dW — fin-stoch-011, fin-stoch-020
- [x] GBM solution S(t) = S(0)·exp((μ − ½σ²)t + σW(t)) — fin-stoch-012, fin-stoch-016
- [x] Lognormal distribution of prices; mean vs median growth; E[S(t)] = S(0)e^(μt) (numerical) — fin-stoch-013, fin-stoch-014, fin-stoch-015, fin-stoch-021, fin-stoch-022, fin-stoch-026
- [x] Martingales; drift under the risk-neutral measure (μ replaced by r) — fin-stoch-017, fin-stoch-018
- [x] Simulating GBM / Monte Carlo basics — fin-stoch-019, fin-stoch-024, fin-stoch-027

## Time Series: Stationarity & Forecasting (`fin-timeseries`)
- [x] What a time series is; why it matters in finance; prices vs returns — fin-timeseries-001, fin-timeseries-009
- [x] Trend (deterministic vs stochastic), seasonality, cycles, volatility, non-linearity — fin-timeseries-002, fin-timeseries-003
- [x] White noise; random walk; link to the efficient market hypothesis — fin-timeseries-004, fin-timeseries-005, fin-timeseries-006, fin-timeseries-007
- [x] Simple vs log returns; additivity of log returns (numerical) — fin-timeseries-008
- [x] Decomposition: trend, seasonal, cyclical, residual; additive vs multiplicative — fin-timeseries-010
- [x] Classical moving-average decomposition — fin-timeseries-010, fin-timeseries-032
- [x] Stationarity: strict vs weak (covariance) stationarity; why it matters — fin-timeseries-011, fin-timeseries-009
- [x] Checking stationarity: plots, rolling statistics, ADF and KPSS tests and their null hypotheses — fin-timeseries-012
- [x] Making a series stationary: differencing, log, Box-Cox; over-differencing pitfall — fin-timeseries-013, fin-timeseries-014, fin-timeseries-015, fin-timeseries-002
- [x] Seasonality testing and seasonal differencing — fin-timeseries-016, fin-timeseries-003
- [x] ACF and PACF patterns for identifying AR and MA orders — fin-timeseries-020, fin-timeseries-021, fin-timeseries-033
- [x] AR(p), MA(q) and ARIMA(p,d,q); stationarity condition for AR(1) (numerical) — fin-timeseries-017, fin-timeseries-018, fin-timeseries-019
- [x] SARIMA notation — fin-timeseries-022
- [x] Smoothing: SMA, WMA, EMA, simple exponential smoothing (numerical) — fin-timeseries-023, fin-timeseries-024, fin-timeseries-025, fin-timeseries-026
- [x] Holt's linear trend, damped trend, Holt-Winters — fin-timeseries-027, fin-timeseries-028, fin-timeseries-034
- [x] Train/test split without shuffling; naive baselines — fin-timeseries-029, fin-timeseries-031
- [x] Error metrics: MAE, RMSE, MAPE, sMAPE (numerical) — fin-timeseries-030, fin-timeseries-031
- [x] STL decomposition, Hodrick-Prescott filter, multiple seasonalities — fin-timeseries-032

## Volatility Models & Backtesting (`fin-volmodels`)
- [x] Why model volatility; stylised facts: fat tails, volatility clustering, leverage effect — fin-volmodels-001, fin-volmodels-002, fin-volmodels-027
- [x] Historical and EWMA volatility; annualising volatility (numerical) — fin-volmodels-003, fin-volmodels-004, fin-volmodels-026, fin-volmodels-028
- [x] ARCH(q) model — fin-volmodels-005
- [x] GARCH(1,1): equation, persistence α+β, long-run variance (numerical) — fin-volmodels-006, fin-volmodels-007, fin-volmodels-008, fin-volmodels-009
- [x] Parameter constraints and interpretation — fin-volmodels-010
- [x] EGARCH, GJR/TGARCH (asymmetry), GARCH-M — fin-volmodels-011, fin-volmodels-012, fin-volmodels-013, fin-volmodels-014
- [x] Walk-forward (expanding) vs rolling-window validation — fin-volmodels-015
- [x] Combinatorial purged cross-validation and leakage — fin-volmodels-016
- [x] Information criteria: AIC, BIC, HQIC (numerical) — fin-volmodels-017, fin-volmodels-029
- [x] Residual diagnostics: Ljung-Box, ARCH-LM — fin-volmodels-018
- [x] Diebold-Mariano test for comparing forecasts — fin-volmodels-019
- [x] Backtesting pitfalls: look-ahead bias, survivorship bias, data snooping, selection bias, costs, overfitting — fin-volmodels-020, fin-volmodels-021, fin-volmodels-022, fin-volmodels-023, fin-volmodels-024, fin-volmodels-025

## Futures, Forwards & Hedging (`fin-futures`)
- [x] Why derivatives exist: risk transfer; hedgers, speculators, arbitrageurs — fin-futures-001
- [x] Exchange-traded vs OTC; clearing house, novation, CCP default waterfall — fin-futures-002, fin-futures-003, fin-futures-004
- [x] Initial margin, maintenance margin, variation margin; SPAN — fin-futures-005, fin-futures-009
- [x] OTC counterparty risk; collateral — fin-futures-010
- [x] Netting: bilateral, multilateral, payment, close-out (numerical) — fin-futures-011, fin-futures-012, fin-futures-013
- [x] Daily mark-to-market and margin calls (numerical) — fin-futures-006, fin-futures-007, fin-futures-008
- [x] No-arbitrage, law of one price — fin-futures-014, fin-futures-015
- [x] Forward price F₀ = S₀e^(rT); cash-and-carry and reverse cash-and-carry arbitrage (numerical) — fin-futures-016, fin-futures-017, fin-futures-026
- [x] Forward price with known income, known yield, storage costs, convenience yield (numerical) — fin-futures-018, fin-futures-019, fin-futures-020, fin-futures-021, fin-futures-023
- [x] Investment vs consumption assets — fin-futures-022
- [x] Value of a forward contract after inception (numerical) — fin-futures-024
- [x] Forward vs futures prices: when they are equal — fin-futures-025
- [x] Contango vs backwardation; Samuelson effect — fin-futures-027, fin-futures-028, fin-futures-023
- [x] Calendar spreads; crack and crush spreads (numerical) — fin-futures-029, fin-futures-030
- [x] Basis and basis risk; convergence at expiry (numerical) — fin-futures-031, fin-futures-032
- [x] Minimum-variance hedge ratio h* = ρσS/σF; hedge effectiveness (numerical) — fin-futures-033, fin-futures-034
- [x] Optimal number of contracts; tailing the hedge (numerical) — fin-futures-033, fin-futures-036
- [x] Beta hedging an equity portfolio with index futures (numerical) — fin-futures-035

## Swaps (`fin-swaps`)
- [x] Plain vanilla interest rate swap: fixed vs floating legs, notional, net payments (numerical) — fin-swaps-001, fin-swaps-002, fin-swaps-020
- [x] Who uses swaps and why; converting liabilities and assets — fin-swaps-003, fin-swaps-021
- [x] Swap spread; day count conventions — fin-swaps-012, fin-swaps-011
- [x] Swap as a portfolio of bonds; floating leg prices at par at reset — fin-swaps-004, fin-swaps-005
- [x] Discount factors and deriving the par swap rate (numerical) — fin-swaps-006, fin-swaps-007
- [x] Yield curve bootstrapping; multi-curve framework — fin-swaps-008, fin-swaps-019
- [x] Valuing a swap after inception (numerical) — fin-swaps-009, fin-swaps-018
- [x] DV01 of a swap (numerical) — fin-swaps-010
- [x] Counterparty risk; CVA and XVA basics — fin-swaps-017, fin-swaps-022
- [x] Comparative advantage argument and its critique (numerical) — fin-swaps-013
- [x] LIBOR scandal and the LIBOR-to-SOFR transition — fin-swaps-014
- [x] Currency swaps: exchange of principal, structures, uses (numerical) — fin-swaps-015
- [x] Covered interest rate parity in currency-swap pricing (numerical) — fin-swaps-016

## Options: Payoffs, Bounds & Strategies (`fin-options`)
- [x] Calls and puts: rights vs obligations; the premium as the price of asymmetry — fin-options-001
- [x] Payoff vs profit for long/short calls and puts (numerical) — fin-options-002, fin-options-003
- [x] American vs European options — fin-options-006
- [x] Moneyness; intrinsic value vs time value (numerical) — fin-options-004
- [x] Six factors affecting option prices and their directions — fin-options-005
- [x] No-arbitrage bounds for European calls and puts (numerical) — fin-options-007
- [x] Bounds for American options — fin-options-008, fin-options-026
- [x] Put-call parity and arbitrage from violations (numerical) — fin-options-009, fin-options-010, fin-options-021
- [x] Early exercise: never for an American call on a non-dividend stock; sometimes for puts — fin-options-011, fin-options-012, fin-options-025
- [x] Protective put, covered call (numerical) — fin-options-013, fin-options-014
- [x] Bull and bear spreads (numerical) — fin-options-015, fin-options-029
- [x] Butterfly spread; box spread value (numerical) — fin-options-016, fin-options-017
- [x] Straddle and strangle; breakevens (numerical) — fin-options-018, fin-options-019, fin-options-027, fin-options-028
- [x] Strategy selection by view on direction and volatility — fin-options-020, fin-options-019
- [x] Portfolio insurance and Black Monday 1987 — fin-options-022, fin-options-023, fin-options-024

## Option Pricing: Binomial & Black-Scholes (`fin-optpricing`)
- [x] Why you can't just discount expected payoffs at the real-world rate — fin-optpricing-001
- [x] One-step binomial model: replicating portfolio and delta (numerical) — fin-optpricing-002, fin-optpricing-003, fin-optpricing-004
- [x] Risk-neutral probability q = (e^(rΔt) − d)/(u − d) (numerical) — fin-optpricing-002, fin-optpricing-006
- [x] No-arbitrage condition d < e^(rΔt) < u — fin-optpricing-005
- [x] Multi-step CRR tree: u = e^(σ√Δt) (numerical) — fin-optpricing-007, fin-optpricing-022
- [x] American options via backward induction; early-exercise check (numerical) — fin-optpricing-008, fin-optpricing-018
- [x] Black-Scholes assumptions — fin-optpricing-009
- [x] Black-Scholes PDE and its interpretation — fin-optpricing-010, fin-optpricing-021
- [x] Black-Scholes formula, d1, d2, N(d2) meaning (numerical) — fin-optpricing-011, fin-optpricing-012, fin-optpricing-013, fin-optpricing-014
- [x] Dividend yield adjustment (Merton) — fin-optpricing-016
- [x] Risk-neutral pricing as a unified framework — fin-optpricing-017
- [x] Implied volatility and the volatility smile/skew — fin-optpricing-015, fin-optpricing-019
- [x] Model risk and implementation risk (Kidder Peabody) — fin-optpricing-020, fin-optpricing-019

## The Greeks & Risk Management (`fin-greeks`)
- [x] Why Greeks: hedging sensitivities, not predicting direction; Taylor-series view — fin-greeks-001
- [x] Delta: definition, call/put ranges, N(d1), delta hedging (numerical) — fin-greeks-002, fin-greeks-003, fin-greeks-004
- [x] Gamma: convexity, highest ATM near expiry, gamma scalping (numerical) — fin-greeks-005, fin-greeks-006, fin-greeks-024
- [x] Theta: time decay; theta-gamma trade-off in the BS PDE — fin-greeks-007, fin-greeks-025
- [x] Vega: highest ATM, long-dated options; vega of a straddle — fin-greeks-009, fin-greeks-024
- [x] Rho: calls vs puts; equities vs rates products — fin-greeks-010
- [x] Second-order Greeks: vanna, volga, charm — fin-greeks-011
- [x] P&L attribution: Δ·δS + ½Γ·δS² + Θ·δt + V·δσ (numerical) — fin-greeks-012, fin-greeks-008
- [x] Explained vs unexplained P&L — fin-greeks-013
- [x] Portfolio Greeks add up (numerical) — fin-greeks-014
- [x] Delta-, gamma- and vega-neutral construction; why two options are needed (numerical) — fin-greeks-015, fin-greeks-016
- [x] Scenario grids and stress tests across spot and vol — fin-greeks-017
- [x] VaR: parametric, historical, Monte Carlo; square-root-of-time scaling (numerical) — fin-greeks-018, fin-greeks-019
- [x] What VaR doesn't tell you; expected shortfall — fin-greeks-020
- [x] Greeks under jumps; gap risk and why delta hedging fails — fin-greeks-021, fin-greeks-022
- [x] Niederhoffer 1997 and selling naked puts — fin-greeks-023

## Economics, Banking & Monetary Policy (`fin-macro`)
- [x] GDP measurement; nominal vs real GDP and the deflator (numerical) — fin-macro-001, fin-macro-002
- [x] Inflation: CPI, demand-pull vs cost-push; real interest rate (numerical) — fin-macro-003, fin-macro-004
- [x] Central bank tools: policy rate, open market operations, reserve requirement, QE — fin-macro-005, fin-macro-021
- [x] Monetary policy transmission; hawkish vs dovish — fin-macro-006
- [x] Fiscal vs monetary policy — fin-macro-015
- [x] Money multiplier (numerical) — fin-macro-008
- [x] Commercial bank balance sheet; net interest margin (numerical) — fin-macro-009
- [x] Capital adequacy ratio and Basel basics (numerical) — fin-macro-010
- [x] Repo and reverse repo — fin-macro-007
- [x] Exchange rates: appreciation/depreciation, quotes and cross rates (numerical) — fin-macro-011, fin-macro-012
- [x] Interest rate parity (numerical) — fin-macro-013
- [x] Purchasing power parity — fin-macro-014
- [x] Business cycle and economic indicators — fin-macro-016, fin-macro-022
- [x] Unemployment types; Phillips curve — fin-macro-017
- [x] Balance of payments; current account — fin-macro-018
- [x] Investment banking vs commercial banking; front, middle and back office — fin-macro-019
- [x] 2008 financial crisis basics; systemic risk — fin-macro-020

## M&A, LBOs & Corporate Actions (`fin-ma`)
- [x] Types of mergers: horizontal, vertical, conglomerate; merger vs acquisition — fin-ma-001, fin-ma-018
- [x] Synergies: revenue vs cost; valuing synergies (numerical) — fin-ma-002
- [x] Accretion/dilution analysis (numerical) — fin-ma-003, fin-ma-004
- [x] Cash vs stock consideration — fin-ma-005
- [x] Purchase premium (numerical) — fin-ma-006, fin-ma-019
- [x] Goodwill created in an acquisition (numerical) — fin-ma-007
- [x] M&A process and due diligence — fin-ma-008
- [x] Hostile takeovers and defences — fin-ma-009
- [x] LBO structure; why debt; ideal LBO candidate — fin-ma-010, fin-ma-020
- [x] LBO returns: IRR and MOIC (numerical) — fin-ma-011, fin-ma-012
- [x] LBO value-creation levers: EBITDA growth, multiple expansion, deleveraging — fin-ma-013, fin-ma-012
- [x] Divestitures, spin-offs, carve-outs — fin-ma-014
- [x] Dividend policy theories — fin-ma-015
- [x] Buybacks: effect on EPS (numerical) — fin-ma-016
- [x] Bankruptcy, restructuring and priority of claims (numerical) — fin-ma-017
