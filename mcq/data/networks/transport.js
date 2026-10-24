/* Computer Networks — TCP & UDP */
window.QUESTIONS.push(
  {
    id: "cn-transport-001", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "What does the transport layer add on top of IP's host-to-host delivery?",
    options: ["Routing between networks", "MAC addressing", "Process-to-process delivery using port numbers (multiplexing at the sender, demultiplexing at the receiver), plus optional reliability, ordering, flow and congestion control (TCP)", "Physical signalling"],
    answer: 2,
    explanation: "IP gets a packet to the right machine; ports get it to the right application. A UDP socket is identified by (destination IP, destination port); a TCP connection by the 4-tuple (src IP, src port, dst IP, dst port).",
    optionExplanations: ["That's the network layer.", "That's the data link layer.", "Correct.", "That's the physical layer."]
  },
  {
    id: "cn-transport-002", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "What are the main differences between TCP and UDP?",
    options: ["They're identical", "UDP is reliable and TCP isn't", "TCP: connection-oriented, reliable, in-order byte stream, flow and congestion control, 20–60-byte header. UDP: connectionless, unreliable, message (datagram) oriented, no ordering or congestion control, 8-byte header, lower latency", "TCP is used only for video"],
    answer: 2,
    explanation: "Choose TCP when every byte must arrive in order (web, email, file transfer, databases); UDP when timeliness matters more than completeness or the app handles reliability itself (DNS queries, VoIP, gaming, video streaming, QUIC).",
    optionExplanations: ["They differ substantially.", "Reversed.", "Correct.", "Video often uses UDP-based protocols."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-transport-003", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "Which port numbers belong to which category?",
    options: ["All ports are well-known", "Ports are 32-bit numbers", "0–65535 are all ephemeral", "0–1023 well-known (system services, require privileges to bind on Unix), 1024–49151 registered, 49152–65535 dynamic/ephemeral (client-side ports)"],
    answer: 3,
    explanation: "Port numbers are 16-bit (0–65535). Linux's default ephemeral range is actually 32768–60999, but the IANA categories are what interviews ask about.",
    optionExplanations: ["There are three categories.", "Ports are 16-bit.", "Server ports are fixed and well-known.", "Correct."]
  },
  {
    id: "cn-transport-004", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "Match the default ports: SSH, DNS, HTTP, HTTPS, SMTP.",
    options: ["22, 53, 80, 443, 25", "21, 53, 8080, 443, 110", "22, 67, 80, 8443, 25", "23, 53, 80, 443, 143"],
    answer: 0,
    explanation: "Others worth knowing: FTP 20/21, Telnet 23, DHCP 67/68, POP3 110, IMAP 143, SNMP 161, LDAP 389, SMTP submission 587, MySQL 3306, PostgreSQL 5432, Redis 6379, RDP 3389.",
    optionExplanations: ["Correct.", "21 is FTP, 8080 is an alternate HTTP port, and 110 is POP3.", "67 is DHCP and 8443 is an alternate HTTPS port.", "23 is Telnet and 143 is IMAP."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-transport-005", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "What are the three steps of the TCP three-way handshake?",
    options: ["SYN, ACK, FIN", "ACK, SYN, RST", "SYN, SYN, SYN", "Client sends SYN (with its initial sequence number); server replies SYN-ACK (its own ISN, acknowledging client ISN + 1); client sends ACK (server ISN + 1)"],
    answer: 3,
    explanation: "The handshake synchronises both sides' sequence numbers and confirms both can send and receive. Data can be sent with the third packet; TCP Fast Open allows data in the SYN for repeat connections.",
    optionExplanations: ["FIN closes connections.", "RST aborts connections.", "The server must acknowledge.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-transport-006", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "numerical",
    question: "A client's initial sequence number is 1000. It completes the handshake and sends 500 bytes of data. What's the sequence number of the first data byte, and what ACK number does the server send after receiving it?",
    options: ["1000 and 1500", "1001 and 1501", "1000 and 1501", "1001 and 1500"],
    answer: 1,
    explanation: "The SYN consumes one sequence number (1000), so the first data byte is 1001. 500 bytes occupy 1001–1500. TCP's ACK is the NEXT byte expected: 1501.",
    optionExplanations: ["The SYN consumes sequence number 1000.", "Correct.", "Data starts at 1001.", "The ACK is the next expected byte, 1501."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-transport-007", subject: "networks", subtopic: "TCP & UDP", difficulty: "hard", type: "numerical",
    question: "A TCP sender transmits three segments with sequence numbers 2001 (300 bytes), 2301 (200 bytes) and 2501 (400 bytes). The second segment is lost; the other two arrive. What cumulative ACK does the receiver send after each arrival?",
    options: ["2301, then 2301 (a duplicate ACK, since 2301 is still missing)", "2301, then 2901", "2300, then 2900", "2301, then 2501"],
    answer: 0,
    explanation: "After the first segment (bytes 2001–2300), ACK = 2301. The third segment (2501–2900) arrives out of order; the next expected byte is still 2301, so the receiver sends a duplicate ACK 2301 (and buffers the data). Three duplicate ACKs trigger fast retransmit.",
    optionExplanations: ["Correct.", "Cumulative ACKs can't skip a gap.", "ACK numbers are the next expected byte.", "2501 would imply bytes 2301–2500 arrived."]
  },
  {
    id: "cn-transport-008", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "Which TCP segments consume a sequence number even though they carry no data?",
    options: ["SYN and FIN (each counts as one byte in the sequence space)", "Pure ACKs", "RST only", "None"],
    answer: 0,
    explanation: "SYN and FIN must be reliably acknowledged, so they take sequence numbers. Pure ACKs with no data don't advance the sequence number.",
    optionExplanations: ["Correct.", "Pure ACKs consume nothing.", "RST isn't acknowledged.", "SYN and FIN do."]
  },
  {
    id: "cn-transport-009", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "How is a TCP connection normally closed?",
    options: ["A four-way exchange: one side sends FIN, the other ACKs; later the other side sends its own FIN, which is ACKed. Each direction closes independently (half-close is possible)", "A single RST", "Both sides just stop sending", "SYN-FIN-ACK"],
    answer: 0,
    explanation: "The side that closes first ends in TIME_WAIT; the other passes through CLOSE_WAIT and LAST_ACK. The middle ACK and FIN can be combined, giving three segments.",
    optionExplanations: ["Correct.", "RST aborts abnormally.", "TCP signals closure explicitly.", "SYN isn't used for closing."]
  },
  {
    id: "cn-transport-010", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "Which TCP state does the side that closes the connection FIRST (active closer) end in, and why?",
    options: ["CLOSE_WAIT, waiting for the application", "SYN_SENT", "LISTEN", "TIME_WAIT, for 2 × MSL (maximum segment lifetime): to retransmit the final ACK if it's lost, and to let old duplicate segments die so they can't be mistaken for a new connection using the same 4-tuple"],
    answer: 3,
    explanation: "Busy servers that actively close many connections can accumulate thousands of TIME_WAIT sockets; letting clients close first, connection reuse (keep-alive) or SO_REUSEADDR mitigate this.",
    optionExplanations: ["CLOSE_WAIT is the passive closer's state.", "SYN_SENT is during opening.", "LISTEN is for servers awaiting connections.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-transport-011", subject: "networks", subtopic: "TCP & UDP", difficulty: "hard", type: "concept",
    question: "A server shows many sockets stuck in CLOSE_WAIT. What's the most likely cause?",
    options: ["The peer has closed its side (sent FIN, which the kernel ACKed), but the server APPLICATION never called close() on its socket — usually a bug such as a leaked connection", "Network congestion", "Too many SYN packets", "The TIME_WAIT timer is too long"],
    answer: 0,
    explanation: "CLOSE_WAIT means 'remote closed, waiting for local close'. Only the application can move the socket on by closing it; growing CLOSE_WAIT counts usually indicate a resource leak.",
    optionExplanations: ["Correct.", "Congestion doesn't produce CLOSE_WAIT.", "That would show SYN_RECV.", "TIME_WAIT affects the active closer."],
    tags: ["trap"]
  },
  {
    id: "cn-transport-012", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "What is the correct sequence of TCP states for a CLIENT that opens a connection and later closes it first?",
    options: ["LISTEN → ESTABLISHED → CLOSED", "CLOSED → SYN_RCVD → ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED", "CLOSED → SYN_SENT → ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED", "SYN_SENT → LISTEN → CLOSED"],
    answer: 2,
    explanation: "The server path is CLOSED → LISTEN → SYN_RCVD → ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED when the client closes first.",
    optionExplanations: ["Clients don't LISTEN.", "That's the passive (server) side.", "Correct.", "Out of order."]
  },
  {
    id: "cn-transport-013", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "What does a TCP RST segment indicate?",
    options: ["A normal graceful close", "An abrupt reset: e.g. a SYN arrived for a port with no listening socket, a segment doesn't belong to any connection, or an application aborts the connection; no acknowledgement or TIME_WAIT follows", "A request to slow down", "A retransmission request"],
    answer: 1,
    explanation: "Connecting to a closed port yields 'Connection refused' (RST) rather than a timeout. Firewalls that silently drop instead produce timeouts.",
    optionExplanations: ["Graceful close uses FIN.", "Correct.", "Flow control uses the window.", "Duplicate ACKs signal loss."]
  },
  {
    id: "cn-transport-014", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "How does a SYN flood attack work, and how do SYN cookies defend against it?",
    options: ["It floods DNS servers", "Attackers send many SYNs (often with spoofed source IPs) and never complete the handshake, filling the server's half-open connection queue so legitimate clients can't connect. SYN cookies encode the connection state in the server's ISN, so no state is stored until the client's valid ACK returns", "It sends too many FINs", "SYN cookies block all SYN packets"],
    answer: 1,
    explanation: "Other mitigations include larger backlogs, shorter SYN-RECEIVED timeouts, and upstream DDoS scrubbing.",
    optionExplanations: ["It targets TCP servers.", "Correct.", "FIN floods are different.", "Legitimate SYNs are still answered."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-transport-015", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "Why are TCP initial sequence numbers (ISNs) randomised rather than starting at 0?",
    options: ["To save memory", "Because 0 is invalid", "To prevent old delayed segments from a previous connection with the same 4-tuple being accepted, and to make it hard for off-path attackers to guess sequence numbers and inject or spoof segments", "To speed up the handshake"],
    answer: 2,
    explanation: "Predictable ISNs enabled classic TCP session hijacking (e.g. the Mitnick attack). Modern stacks generate ISNs from a clock plus a keyed hash of the connection 4-tuple.",
    optionExplanations: ["Memory isn't the reason.", "0 is a valid number.", "Correct.", "Speed is unaffected."]
  },
  {
    id: "cn-transport-016", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "How big is the UDP header and which fields does it contain?",
    options: ["8 bytes: source port, destination port, length and checksum", "20 bytes: ports, sequence and ACK numbers", "4 bytes: ports only", "40 bytes like IPv6"],
    answer: 0,
    explanation: "UDP adds almost nothing to IP: ports for demultiplexing, length, and a checksum (optional in IPv4, mandatory in IPv6). Its simplicity is why QUIC, DNS and real-time media build on it.",
    optionExplanations: ["Correct.", "That describes TCP.", "Length and checksum are also included.", "That's IPv6's base header."]
  },
  {
    id: "cn-transport-017", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "Which TCP header flags exist and what do they mean?",
    options: ["Only SYN and FIN", "SYN (synchronise/open), ACK (acknowledgement field valid), FIN (no more data), RST (reset), PSH (push data to the application promptly), URG (urgent pointer valid), plus ECE/CWR for ECN", "GET and POST", "ACK and NAK"],
    answer: 1,
    explanation: "After the handshake, essentially every segment has the ACK flag set. The 4-bit data offset field gives the header length (20–60 bytes) in 32-bit words.",
    optionExplanations: ["There are several more.", "Correct.", "Those are HTTP methods.", "TCP has no NAK flag."]
  },
  {
    id: "cn-transport-018", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "Which mechanisms make TCP reliable over unreliable IP?",
    options: ["Sequence numbers (ordering and duplicate detection), acknowledgements, retransmission on timeout or duplicate ACKs, checksums (corruption detection), and receive-window flow control", "Encryption", "Larger packets", "Using UDP underneath"],
    answer: 0,
    explanation: "TCP provides an ordered, error-checked byte stream; the application never sees losses, only delays.",
    optionExplanations: ["Correct.", "Encryption is TLS's job.", "Size doesn't add reliability.", "TCP runs directly over IP."]
  },
  {
    id: "cn-transport-019", subject: "networks", subtopic: "TCP & UDP", difficulty: "hard", type: "numerical",
    question: "TCP estimates RTT with SRTT ← 0.875·SRTT + 0.125·sample and RTTVAR ← 0.75·RTTVAR + 0.25·|SRTT − sample| (RTTVAR updated first, using the old SRTT); RTO = SRTT + 4·RTTVAR. With SRTT = 100 ms, RTTVAR = 10 ms and a new sample of 140 ms, what's the new RTO?",
    options: ["175 ms", "140 ms", "145 ms", "200 ms"],
    answer: 0,
    explanation: "RTTVAR = 0.75 × 10 + 0.25 × |100 − 140| = 7.5 + 10 = 17.5. SRTT = 0.875 × 100 + 0.125 × 140 = 105. RTO = 105 + 4 × 17.5 = 175 ms. The variance term makes the timeout grow when RTTs fluctuate.",
    optionExplanations: ["Correct.", "That's just the sample.", "Recompute the 4·RTTVAR term.", "That's 2 × SRTT, the old rule."]
  },
  {
    id: "cn-transport-020", subject: "networks", subtopic: "TCP & UDP", difficulty: "hard", type: "concept",
    question: "What is Karn's algorithm in TCP RTT estimation?",
    options: ["A congestion control method", "A way to choose ports", "A checksum algorithm", "Don't use RTT samples from RETRANSMITTED segments (it's ambiguous whether the ACK belongs to the original or the retransmission), and back off the RTO exponentially after each timeout"],
    answer: 3,
    explanation: "Without Karn's rule, an ACK for the original transmission matched to the retransmission produces a falsely small RTT (or vice versa), destabilising the timeout. TCP timestamps also resolve the ambiguity.",
    optionExplanations: ["It's about RTT estimation.", "Not related to ports.", "Not related to checksums.", "Correct."]
  },
  {
    id: "cn-transport-021", subject: "networks", subtopic: "TCP & UDP", difficulty: "hard", type: "numerical",
    question: "TCP sequence numbers are 32 bits. Roughly how long does it take for them to wrap around on a 1 Gbps link, and on a 10 Gbps link?",
    options: ["4.3 s and 0.43 s", "About 9 hours and 1 hour", "About 34 s and about 3.4 s", "Never"],
    answer: 2,
    explanation: "2³² bytes ≈ 4.29 × 10⁹ bytes. At 1 Gbps = 125 MB/s: 4.29e9 / 1.25e8 ≈ 34.4 s; at 10 Gbps ≈ 3.4 s. That's shorter than a packet could linger in the network, so high-speed TCP uses timestamps (PAWS) to reject old wrapped segments.",
    optionExplanations: ["Sequence numbers count bytes, not bits.", "Far too long.", "Correct.", "Wrap-around is inevitable with 32 bits."]
  },
  {
    id: "cn-transport-022", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "What do Nagle's algorithm and delayed ACKs do, and why can they interact badly?",
    options: ["They're unrelated", "They increase the window size", "They encrypt data", "Nagle buffers small writes until previous data is ACKed (fewer tiny packets); delayed ACK waits up to ~200 ms hoping to piggyback the ACK. Together, a sender waiting for an ACK and a receiver delaying it can add ~200 ms latency for request/response traffic; latency-sensitive apps set TCP_NODELAY"],
    answer: 3,
    explanation: "The classic symptom is interactive or RPC traffic taking ~200 ms per small exchange. Disabling Nagle (TCP_NODELAY) is common in games, databases and HTTP/2 servers.",
    optionExplanations: ["They interact in practice.", "Neither changes the window.", "Neither encrypts.", "Correct."]
  },
  {
    id: "cn-transport-023", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "What is head-of-line (HOL) blocking in TCP?",
    options: ["A router queueing issue", "A type of attack", "Because TCP delivers a single in-order byte stream, one lost segment stalls delivery of all later data (even independent messages) until it's retransmitted", "Blocking new connections"],
    answer: 2,
    explanation: "HTTP/2 multiplexes many streams over one TCP connection, so one loss stalls all streams. QUIC (HTTP/3) gives each stream independent delivery over UDP, avoiding transport-level HOL blocking.",
    optionExplanations: ["Router HOL blocking is a different concept.", "It's a protocol property.", "Correct.", "It's about in-order delivery."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-transport-024", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "numerical",
    question: "On Ethernet (MTU 1500) with IPv4 and TCP headers without options, what is the typical TCP MSS?",
    options: ["1500 bytes", "1518 bytes", "1480 bytes", "1460 bytes"],
    answer: 3,
    explanation: "MSS (maximum segment size) is the largest TCP payload: MTU − IP header (20) − TCP header (20) = 1460. With IPv6 (40-byte header) it's 1440. Each side announces its MSS in the SYN.",
    optionExplanations: ["That's the MTU.", "That's the maximum Ethernet frame size.", "That's the IP payload size.", "Correct."]
  },
  {
    id: "cn-transport-025", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "Which applications typically use UDP rather than TCP?",
    options: ["Email (SMTP) and file transfer (FTP)", "DNS queries, DHCP, VoIP and video calls, online games, live streaming, and QUIC/HTTP/3", "Web browsing with HTTP/1.1", "SSH"],
    answer: 1,
    explanation: "UDP avoids handshakes and retransmission delays; for real-time media, a late packet is useless anyway. Apps add their own reliability or forward error correction as needed.",
    optionExplanations: ["These need reliable delivery over TCP.", "Correct.", "HTTP/1.1 runs over TCP.", "SSH runs over TCP."]
  },
  {
    id: "cn-transport-026", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "A server listens on port 443. How can it handle thousands of simultaneous client connections on the same port?",
    options: ["It can't; each connection needs its own server port", "It uses UDP for extra connections", "Each TCP connection is identified by the full 4-tuple (client IP, client port, server IP, server port); accept() creates a new socket per connection, all sharing local port 443 but differing in the client's address/port", "Clients share one connection"],
    answer: 2,
    explanation: "Demultiplexing uses the whole 4-tuple, so the listening port isn't 'used up'. The real limits are memory, file descriptors and CPU.",
    optionExplanations: ["The 4-tuple distinguishes connections.", "Not needed.", "Correct.", "Each client has its own connection."]
  },
  {
    id: "cn-transport-027", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "In the sockets API, which sequence does a TCP server use, and which does a client use?",
    options: ["Both just call connect()", "Server: socket → bind → listen → accept → recv/send → close. Client: socket → connect → send/recv → close", "Server: connect → accept; client: listen", "Both use sendto/recvfrom"],
    answer: 1,
    explanation: "connect() triggers the three-way handshake; accept() returns a new connected socket. UDP sockets skip listen/accept and use sendto/recvfrom with explicit addresses.",
    optionExplanations: ["Servers listen and accept.", "Correct.", "Reversed.", "That's typical for UDP."]
  },
  {
    id: "cn-transport-028", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "What does TCP keep-alive do?",
    options: ["Keeps HTTP connections persistent", "After a long idle period (Linux default 2 hours), TCP sends probe segments; if the peer doesn't answer after several probes, the connection is declared dead. It detects crashed peers and keeps NAT/firewall mappings alive", "Increases throughput", "Prevents TIME_WAIT"],
    answer: 1,
    explanation: "HTTP keep-alive is a different concept (reusing one TCP connection for multiple requests). Applications often use their own heartbeat messages with shorter intervals.",
    optionExplanations: ["That's HTTP persistent connections.", "Correct.", "It doesn't affect throughput.", "Unrelated."]
  },
  {
    id: "cn-transport-029", subject: "networks", subtopic: "TCP & UDP", difficulty: "hard", type: "concept",
    question: "TCP is a byte-stream protocol. A client calls send() with 100 bytes and then again with 100 bytes. What might the server's recv() calls return?",
    options: ["Any split: one 200-byte read, or 50 + 150, or 100 + 100 — TCP preserves byte ORDER but not message boundaries, so applications must frame messages (length prefixes or delimiters)", "Always exactly two 100-byte messages", "Always one 200-byte read", "The data may arrive reordered"],
    answer: 0,
    explanation: "This 'TCP message boundary' misconception causes real bugs. HTTP uses Content-Length or chunked encoding; many protocols use length-prefixed frames. UDP, by contrast, preserves datagram boundaries.",
    optionExplanations: ["Correct.", "TCP doesn't preserve write boundaries.", "It depends on timing and buffering.", "TCP guarantees order."],
    tags: ["trap"]
  },
  {
    id: "cn-transport-030", subject: "networks", subtopic: "TCP & UDP", difficulty: "hard", type: "concept",
    question: "What happens with a TCP 'simultaneous open', where both hosts send SYN to each other at the same time?",
    options: ["Both connections fail", "Two separate connections are created", "Each side receives a SYN in SYN_SENT, replies SYN-ACK and moves to SYN_RCVD; when each gets the other's ACK, a SINGLE connection is established (four segments instead of three)", "The host with the higher IP wins and the other gets RST"],
    answer: 2,
    explanation: "TCP's state machine explicitly supports this rare case (it's used by some NAT hole-punching techniques). Simultaneous close is likewise allowed: both sides go through CLOSING to TIME_WAIT.",
    optionExplanations: ["TCP handles it.", "One connection results, identified by the 4-tuple.", "Correct.", "No reset is needed."]
  },
  {
    id: "cn-transport-031", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "What does the TCP/UDP checksum cover?",
    options: ["Only the header", "The Ethernet frame", "Only the data", "A pseudo-header (source IP, destination IP, protocol, length) plus the transport header and the data — so misdelivered packets (wrong IP) are also detected"],
    answer: 3,
    explanation: "Including IP addresses ties the segment to its intended endpoints; it's also why NAT must adjust transport checksums when rewriting addresses.",
    optionExplanations: ["The data is covered too.", "That's the Ethernet CRC.", "The header is covered too.", "Correct."]
  },
  {
    id: "cn-transport-032", subject: "networks", subtopic: "TCP & UDP", difficulty: "easy", type: "concept",
    question: "Why does DNS normally use UDP rather than TCP for queries?",
    options: ["UDP is more reliable", "A query and answer usually fit in one small packet each; UDP avoids the handshake's extra round trip and connection state on busy servers. DNS falls back to TCP for large responses (truncated answers) and zone transfers", "TCP is blocked on the Internet", "DNS doesn't need ports"],
    answer: 1,
    explanation: "If a UDP query is lost, the client simply retries after a timeout. DNS over TLS/HTTPS uses TCP (or QUIC) for privacy.",
    optionExplanations: ["UDP isn't reliable.", "Correct.", "TCP works fine.", "DNS uses port 53."]
  },
  {
    id: "cn-transport-033", subject: "networks", subtopic: "TCP & UDP", difficulty: "hard", type: "concept",
    question: "How many round trips does it take before a client can send its first byte of application data on a fresh TCP connection, and what does TCP Fast Open change?",
    options: ["Zero in both cases", "Data can go with the third packet, after 1 RTT (SYN, SYN-ACK). TFO lets a client that has a cookie from a previous connection put data in the SYN itself, so the server can respond after 0 extra RTTs", "Two RTTs, and TFO removes the ACK", "TFO removes the need for SYN"],
    answer: 1,
    explanation: "Each saved round trip matters for latency, especially on mobile networks. TLS 1.3 and QUIC push further toward 1-RTT and 0-RTT setups.",
    optionExplanations: ["The handshake costs one RTT first.", "Correct.", "Only one RTT precedes the data.", "TFO still uses SYN."]
  },
  {
    id: "cn-transport-034", subject: "networks", subtopic: "TCP & UDP", difficulty: "medium", type: "concept",
    question: "What is a socket?",
    options: ["A physical network port", "A routing table entry", "A type of cable", "An endpoint for communication identified by an IP address and port (plus protocol); applications read and write through socket file descriptors"],
    answer: 3,
    explanation: "A TCP connection is the pair of sockets at its two ends. On Unix, sockets are file descriptors, so read/write/close and select/epoll work on them.",
    optionExplanations: ["It's a software abstraction.", "Not related to routing.", "Not hardware.", "Correct."]
  }
);
