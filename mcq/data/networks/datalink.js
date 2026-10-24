/* Computer Networks — Physical & Data Link Layer */
window.QUESTIONS.push(
  {
    id: "cn-datalink-001", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "What is the difference between bit rate and baud rate?",
    options: ["Bit rate is bits per second; baud rate is signal changes (symbols) per second. If each symbol carries n bits, bit rate = baud × n", "They're always equal", "Baud rate is always higher", "Bit rate measures latency"],
    answer: 0,
    explanation: "With 4 signal levels, each symbol carries log₂4 = 2 bits, so 1,000 baud = 2,000 bps. Modulation schemes like QAM-256 carry 8 bits per symbol.",
    optionExplanations: ["Correct.", "Only with binary signalling (1 bit per symbol).", "Baud ≤ bit rate when symbols carry ≥ 1 bit.", "Neither measures latency."]
  },
  {
    id: "cn-datalink-002", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "numerical",
    question: "A NOISELESS channel has bandwidth 3,000 Hz and uses 4 signal levels. What is its maximum data rate by Nyquist's theorem?",
    options: ["6,000 bps", "12,000 bps", "24,000 bps", "3,000 bps"],
    answer: 1,
    explanation: "Nyquist: C = 2 × B × log₂(L) = 2 × 3,000 × log₂4 = 2 × 3,000 × 2 = 12,000 bps. More levels raise the rate on a noiseless channel; with noise, Shannon's limit applies.",
    optionExplanations: ["That ignores the 2 bits per symbol.", "Correct.", "That double-counts.", "That's just the bandwidth."]
  },
  {
    id: "cn-datalink-003", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "numerical",
    question: "A channel has bandwidth 3,000 Hz and a signal-to-noise ratio of 1,023 (about 30 dB). What is its Shannon capacity?",
    options: ["3,000 bps", "30,000 bps", "12,000 bps", "1,023,000 bps"],
    answer: 1,
    explanation: "Shannon: C = B × log₂(1 + SNR) = 3,000 × log₂(1,024) = 3,000 × 10 = 30,000 bps. This is an upper bound no modulation can exceed, regardless of the number of levels. (SNR in dB = 10 log₁₀(SNR); 30 dB ≈ 1,000.)",
    optionExplanations: ["That's just the bandwidth.", "Correct.", "That's a Nyquist-style answer with 4 levels.", "SNR isn't multiplied directly."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-004", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "What are the two sublayers of the data link layer in IEEE 802?",
    options: ["TCP and UDP", "PHY and DNS", "IP and ARP", "LLC (Logical Link Control: interface to the network layer, multiplexing protocols) and MAC (Medium Access Control: addressing and deciding who may transmit on a shared medium)"],
    answer: 3,
    explanation: "MAC protocols include CSMA/CD (classic Ethernet), CSMA/CA (Wi-Fi) and token passing. The 48-bit hardware address is called a MAC address because it lives in this sublayer.",
    optionExplanations: ["Those are transport protocols.", "PHY is the physical layer and DNS is an application.", "Those are network-layer protocols.", "Correct."]
  },
  {
    id: "cn-datalink-005", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "Why does the data link layer need FRAMING?",
    options: ["To encrypt bits", "To compress data", "To route packets", "The physical layer delivers a raw bit stream; framing marks where each frame starts and ends (using length fields, flag bytes with byte stuffing, or flag bit patterns with bit stuffing) so errors can be detected per frame"],
    answer: 3,
    explanation: "Ethernet uses a preamble + start frame delimiter and fixed header structure; HDLC/PPP use the flag 01111110 with bit or byte stuffing so the flag pattern never appears inside the data.",
    optionExplanations: ["Framing doesn't encrypt.", "Framing doesn't compress.", "Routing is layer 3.", "Correct."]
  },
  {
    id: "cn-datalink-006", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "numerical",
    question: "HDLC uses the flag 01111110 and bit stuffing (insert a 0 after every five consecutive 1s in the data). What is transmitted for the data bits 01111110?",
    options: ["01111110", "0111110110", "011111010", "011111100"],
    answer: 2,
    explanation: "Scan the data: after the first 0 come five 1s → insert a 0, then continue with the remaining '1' and '0': 0 11111 0 1 0 = 011111010. The receiver removes any 0 that follows five consecutive 1s, so the flag can never appear inside a frame.",
    optionExplanations: ["The flag pattern would be ambiguous.", "Only one 0 needs stuffing.", "Correct.", "The stuffed 0 goes right after the fifth 1."]
  },
  {
    id: "cn-datalink-007", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "hard", type: "numerical",
    question: "With HDLC bit stuffing (insert 0 after five consecutive 1s), what is transmitted for the data 0111111111110?",
    options: ["0111111111110", "0111110111110", "01111101111110", "011111011111010"],
    answer: 3,
    explanation: "0, then 11111 → stuff 0, then the counter restarts: the next 1s are 11111 → stuff 0, then the remaining '1' and the final '0'. Result: 0 11111 0 11111 0 1 0 = 011111011111010 (15 bits from 13).",
    optionExplanations: ["The data contains runs of five 1s that must be stuffed.", "Recount the 1s after the first stuffed bit.", "A second stuffing is needed after the next five 1s.", "Correct."]
  },
  {
    id: "cn-datalink-008", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "In byte-oriented framing (e.g. PPP-style) with FLAG and ESC bytes, how is a FLAG or ESC byte that appears inside the payload handled?",
    options: ["The sender inserts an ESC byte before it (byte stuffing); the receiver removes the ESC and treats the next byte as ordinary data", "It's deleted", "The frame is split", "It's replaced by zeros"],
    answer: 0,
    explanation: "Escaping ESC itself ensures the escape mechanism is unambiguous. Byte stuffing can grow the frame in the worst case (payload full of FLAG bytes), while bit stuffing has smaller worst-case overhead.",
    optionExplanations: ["Correct.", "Data can't be dropped.", "Frames aren't split for this.", "The data must be preserved."]
  },
  {
    id: "cn-datalink-009", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "Which statement about MAC addresses is correct?",
    options: ["They're 32 bits and assigned by DHCP", "They're globally routable", "They're 48 bits, written as six hex bytes (e.g. 3C:22:FB:12:34:56); the first 3 bytes are the manufacturer's OUI; FF:FF:FF:FF:FF:FF is the broadcast address", "They change at every router hop by design of the sender"],
    answer: 2,
    explanation: "MAC addresses identify interfaces on a local link. The least significant bit of the first byte marks multicast (group) addresses; the next bit marks locally administered addresses (used for randomised Wi-Fi MACs).",
    optionExplanations: ["That describes IPv4 addresses.", "Routing uses IP addresses.", "Correct.", "Routers rebuild frames, but MAC addresses aren't chosen per hop by the sender."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-010", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "How does ARP find the MAC address for an IP address on the local network?",
    options: ["It asks a DNS server", "The router assigns it", "It reads the MAC from the IP address bits", "The host broadcasts an ARP request ('Who has 192.168.1.20? Tell 192.168.1.5'); the owner replies with its MAC address via unicast, and the answer is cached in the ARP table"],
    answer: 3,
    explanation: "ARP cache entries expire after a while. `arp -a` or `ip neigh` shows the table. Gratuitous ARP (announcing your own mapping) is used after IP changes and failovers.",
    optionExplanations: ["DNS maps names to IPs.", "Routers don't assign MACs.", "IP and MAC addresses are unrelated.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-011", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "Host 192.168.1.5/24 sends a packet to 8.8.8.8. Whose MAC address does it ARP for?",
    options: ["8.8.8.8's MAC address", "Its default gateway's MAC address (e.g. 192.168.1.1), since the destination is outside the local subnet", "The DNS server's MAC", "The broadcast MAC as destination of the data frame"],
    answer: 1,
    explanation: "The host compares the destination with its own subnet. For remote destinations, the frame goes to the next hop (the router), so the destination MAC is the gateway's, while the destination IP remains 8.8.8.8.",
    optionExplanations: ["MAC addresses only matter on the local link.", "Correct.", "DNS isn't involved in forwarding.", "Data frames are unicast to the gateway."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-012", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "What do RARP and proxy ARP do?",
    options: ["RARP (obsolete): a diskless host learns its own IP from its MAC (replaced by BOOTP/DHCP). Proxy ARP: a router answers ARP requests on behalf of hosts on another network, so hosts can reach them as if local", "They're the same as DNS", "Both encrypt ARP", "Both assign MAC addresses"],
    answer: 0,
    explanation: "Proxy ARP can glue networks together without proper routing configuration, but it hides topology and enlarges ARP traffic. ARP's lack of authentication also enables ARP spoofing attacks.",
    optionExplanations: ["Correct.", "DNS resolves names.", "Neither encrypts.", "MAC addresses are burned in or configured."]
  },
  {
    id: "cn-datalink-013", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "In an Ethernet II frame, what are the payload size limits, and what happens with a 20-byte payload?",
    options: ["0–9000 bytes, sent as is", "64–1518 bytes; it's rejected", "46–1500 bytes; a 20-byte payload is padded with 26 bytes so the frame reaches the 64-byte minimum (14-byte header + 46 + 4-byte FCS)", "Exactly 1500 bytes always"],
    answer: 2,
    explanation: "Frame fields: preamble (7) + SFD (1), destination MAC (6), source MAC (6), EtherType (2), payload (46–1500), FCS/CRC (4). Jumbo frames (up to ~9000 bytes) are a non-standard extension.",
    optionExplanations: ["Standard Ethernet's MTU is 1500.", "64–1518 refers to the whole frame.", "Correct.", "Payloads vary in size."]
  },
  {
    id: "cn-datalink-014", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "How does CSMA/CD (classic shared Ethernet) work?",
    options: ["Stations transmit whenever they want and never check", "Collisions are avoided with RTS/CTS", "A token circulates and only its holder may send", "Listen before transmitting (carrier sense); if the medium is idle, transmit while listening; on detecting a collision, stop, send a jam signal, and retry after a random binary exponential backoff"],
    answer: 3,
    explanation: "After the k-th collision, a station waits a random number of slot times in [0, 2^k − 1] (capped at 2^10 − 1; gives up after 16 attempts). Modern full-duplex switched Ethernet has no collisions, so CSMA/CD is effectively unused.",
    optionExplanations: ["That's pure ALOHA-like behaviour without carrier sense.", "That's CSMA/CA in Wi-Fi.", "That's token passing.", "Correct."]
  },
  {
    id: "cn-datalink-015", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "hard", type: "numerical",
    question: "A 10 Mbps CSMA/CD network has a maximum cable length of 2,500 m and propagation speed 2 × 10⁸ m/s (ignore repeaters). What is the minimum frame size needed so collisions are always detected while transmitting?",
    options: ["250 bits", "125 bits", "500 bits", "1,000 bits"],
    answer: 0,
    explanation: "A sender must still be transmitting when news of a collision at the far end returns: Tt ≥ 2 × Tp. Tp = 2,500 / 2 × 10⁸ = 12.5 µs. Minimum frame = 2 × Tp × bandwidth = 25 µs × 10 Mbps = 250 bits. (Real Ethernet uses 512 bits to allow for repeaters and margins.)",
    optionExplanations: ["Correct.", "That's only one-way propagation.", "That double-counts.", "Recompute: 25 µs × 10 Mbps."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-016", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "hard", type: "numerical",
    question: "For CSMA/CD, efficiency ≈ 1 / (1 + 6.44a), where a = propagation delay / transmission time. If a = 0.1, what is the approximate efficiency?",
    options: ["60.8%", "90.9%", "36.8%", "18.4%"],
    answer: 0,
    explanation: "1 / (1 + 0.644) = 1 / 1.644 ≈ 0.608. Efficiency falls as a grows (longer cables, higher speeds, shorter frames), which is why gigabit shared Ethernet needed carrier extension and why switched full-duplex replaced it.",
    optionExplanations: ["Correct.", "That would be 1 / (1 + a).", "That's slotted ALOHA's maximum.", "That's pure ALOHA's maximum."]
  },
  {
    id: "cn-datalink-017", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "numerical",
    question: "What are the maximum throughputs of pure ALOHA and slotted ALOHA?",
    options: ["50% and 100%", "10% and 20%", "36.8% and 18.4%", "18.4% (1/2e, at G = 0.5) and 36.8% (1/e, at G = 1)"],
    answer: 3,
    explanation: "Pure ALOHA throughput S = G·e^(−2G) because the vulnerable period is 2 frame times; slotted ALOHA S = G·e^(−G) halves the vulnerable period by aligning transmissions to slots, doubling the maximum.",
    optionExplanations: ["Random access can't approach 100%.", "Those aren't the derived maxima.", "Reversed.", "Correct."]
  },
  {
    id: "cn-datalink-018", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "hard", type: "numerical",
    question: "In pure ALOHA with offered load G = 1 frame per frame time, what is the throughput S = G·e^(−2G)?",
    options: ["13.5%", "36.8%", "18.4%", "50%"],
    answer: 0,
    explanation: "S = 1 × e^(−2) ≈ 0.135. Pure ALOHA peaks at G = 0.5 (18.4%); pushing more load causes so many collisions that throughput falls.",
    optionExplanations: ["Correct.", "That's slotted ALOHA at G = 1.", "That's pure ALOHA's maximum at G = 0.5.", "Collisions keep throughput much lower."]
  },
  {
    id: "cn-datalink-019", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "numerical",
    question: "Two Ethernet stations collide once. Each picks a random backoff of 0 or 1 slot times (binary exponential backoff after the 1st collision). What's the probability they collide again on the next attempt?",
    options: ["1/4", "1/8", "1", "1/2"],
    answer: 3,
    explanation: "They collide if they pick the same value: (0, 0) or (1, 1) → 2 of 4 equally likely outcomes = 1/2. After the 2nd collision, each picks from {0, 1, 2, 3} and the probability drops to 1/4; doubling the range quickly resolves contention.",
    optionExplanations: ["That's after the second collision.", "That's after the third collision.", "They might pick different slots.", "Correct."]
  },
  {
    id: "cn-datalink-020", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "Why does Wi-Fi use CSMA/CA instead of CSMA/CD?",
    options: ["Wi-Fi has no collisions", "A wireless radio generally can't detect collisions while transmitting (its own signal drowns out others) and some stations can't hear each other (hidden terminals); so Wi-Fi avoids collisions with random backoff before sending, ACKs for every frame, and optional RTS/CTS", "CSMA/CD is patented", "CSMA/CA is faster on cables"],
    answer: 1,
    explanation: "Hidden terminal problem: A and C both reach access point B but not each other, so carrier sense fails. RTS/CTS lets B announce who may send, silencing hidden stations (they hear B's CTS).",
    optionExplanations: ["Collisions do happen in Wi-Fi.", "Correct.", "Not a licensing issue.", "CSMA/CA is used for wireless."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-021", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "What's the key difference between a hub and a switch?",
    options: ["They're the same", "A hub repeats every incoming signal out of all other ports (one shared collision domain, half duplex); a switch learns MAC addresses and forwards each frame only to the port where the destination is, giving each port its own collision domain and full-duplex operation", "A hub routes IP packets", "A switch broadcasts every frame"],
    answer: 1,
    explanation: "Switches make Ethernet scale: simultaneous conversations on different ports, no collisions on full-duplex links, and better security (frames aren't seen by every host). Hubs are obsolete.",
    optionExplanations: ["Their forwarding differs fundamentally.", "Correct.", "Routers route packets.", "Switches flood only unknown/broadcast destinations."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-022", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "A new switch has an empty MAC table. Host A (port 1) sends a frame to host B (port 3). What does the switch do?",
    options: ["Learns that A's MAC is on port 1, and FLOODS the frame out of all ports except port 1 because B's location is unknown; when B replies, it learns B is on port 3 and later frames are forwarded only there", "Drops the frame", "Sends it to the router", "Asks DNS where B is"],
    answer: 0,
    explanation: "Switches learn from SOURCE addresses and forward based on DESTINATION addresses: forward (known), flood (unknown or broadcast), or filter (destination on the same port as the source). Entries age out after a timeout (often 300 s).",
    optionExplanations: ["Correct.", "Unknown destinations are flooded, not dropped.", "The switch handles it at layer 2.", "Switches don't use DNS."]
  },
  {
    id: "cn-datalink-023", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "hard", type: "numerical",
    question: "A router has two interfaces. Interface 1 connects to switch S1, which connects PC1, PC2 and hub H1 (with 3 PCs on the hub). Interface 2 connects to hub H2 with 4 PCs. How many broadcast domains and collision domains are there?",
    options: ["1 broadcast, 9 collision", "3 broadcast, 4 collision", "2 broadcast, 9 collision", "2 broadcast, 5 collision"],
    answer: 3,
    explanation: "Broadcast domains: each router interface bounds one → 2. Collision domains: every switch port is its own domain — S1's ports to PC1, PC2, H1 (the hub and its 3 PCs share one domain) and to the router → 4; the H2 segment (router interface + hub + 4 PCs) is one shared domain → 1. Total 5.",
    optionExplanations: ["Routers split broadcast domains, and hubs don't create new collision domains.", "There are only two router interfaces.", "Hub-connected PCs share a collision domain.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-024", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "numerical",
    question: "A 1,500-byte frame crosses 3 store-and-forward switches on 1 Gbps links (ignore propagation and processing). How much total transmission delay accumulates from sender to receiver?",
    options: ["12 µs", "36 µs", "48 µs", "1.5 µs"],
    answer: 2,
    explanation: "Transmission time per link = 1,500 × 8 / 10⁹ = 12 µs. Store-and-forward means each switch receives the whole frame before sending it on: 4 links (sender → S1 → S2 → S3 → receiver) × 12 µs = 48 µs. Cut-through switching starts forwarding after reading the destination MAC, cutting latency.",
    optionExplanations: ["That's one link.", "There are 4 links, not 3.", "Correct.", "Recompute: 12,000 bits / 1 Gbps."]
  },
  {
    id: "cn-datalink-025", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "What's the trade-off between store-and-forward and cut-through switching?",
    options: ["Store-and-forward receives the entire frame and checks its CRC before forwarding (drops corrupt frames, adds latency per hop); cut-through forwards as soon as the destination MAC is read (lower latency, but corrupt frames are propagated)", "There's none", "Cut-through checks CRC first", "Store-and-forward is used only in hubs"],
    answer: 0,
    explanation: "Low-latency environments (trading, HPC) favour cut-through; most enterprise switches are store-and-forward. Fragment-free is a middle ground that checks the first 64 bytes.",
    optionExplanations: ["Correct.", "Latency vs error checking differs.", "Cut-through can't check the trailing CRC first.", "Hubs don't store frames."]
  },
  {
    id: "cn-datalink-026", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "What problem does the Spanning Tree Protocol (STP, IEEE 802.1D) solve?",
    options: ["Redundant links between switches create loops in which broadcast frames circulate forever (broadcast storms) and MAC tables thrash; STP blocks redundant ports to form a loop-free tree, re-enabling them if an active link fails", "IP address conflicts", "Slow DNS lookups", "Wireless interference"],
    answer: 0,
    explanation: "Ethernet frames have no TTL, so a single loop can melt a network within seconds. STP elects a root bridge and computes least-cost paths; RSTP (802.1w) converges much faster.",
    optionExplanations: ["Correct.", "That's an IP issue.", "DNS is unrelated.", "STP is about switch topology."]
  },
  {
    id: "cn-datalink-027", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "What does a VLAN do?",
    options: ["Speeds up Wi-Fi", "Assigns IP addresses", "Encrypts Ethernet frames", "Logically divides one physical switch infrastructure into multiple separate layer-2 networks; each VLAN is its own broadcast domain, improving security and reducing broadcast traffic"],
    answer: 3,
    explanation: "For example, HR and Engineering ports on the same switch can be placed in different VLANs. Hosts in different VLANs can only communicate through a router or layer-3 switch (inter-VLAN routing).",
    optionExplanations: ["VLANs are about segmentation.", "That's DHCP.", "VLAN tagging doesn't encrypt.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-datalink-028", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "How do access ports and trunk ports differ, and how many VLAN IDs does an IEEE 802.1Q tag support?",
    options: ["They're the same; 256 VLANs", "An access port carries one VLAN (untagged frames to end hosts); a trunk port carries many VLANs between switches, adding a 4-byte 802.1Q tag with a 12-bit VLAN ID (4,094 usable IDs: 1–4094)", "Trunk ports connect only to PCs", "802.1Q supports 65,536 VLANs"],
    answer: 1,
    explanation: "VLAN IDs 0 and 4095 are reserved. The tag also includes a 3-bit priority field (802.1p) used for QoS. Large clouds outgrow 4,094 IDs and use VXLAN's 24-bit identifiers.",
    optionExplanations: ["Port roles and the ID space differ.", "Correct.", "Trunks connect switches/routers.", "The VLAN ID is only 12 bits."]
  },
  {
    id: "cn-datalink-029", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "Two hosts are on different VLANs of the same switch. Can they communicate directly at layer 2?",
    options: ["Yes, always", "Only if they have the same MAC vendor", "No: VLANs are separate broadcast domains; traffic between them must be routed by a router ('router on a stick' over a trunk) or a layer-3 switch", "Only through a hub"],
    answer: 2,
    explanation: "Each VLAN typically maps to its own IP subnet, and the router (or SVI on an L3 switch) acts as the default gateway for each. Firewall rules can then control inter-VLAN traffic.",
    optionExplanations: ["VLANs isolate layer-2 traffic.", "MAC vendors are irrelevant.", "Correct.", "A hub doesn't bridge VLANs."]
  },
  {
    id: "cn-datalink-030", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "Which statement about bridges, repeaters and routers is correct?",
    options: ["A repeater filters frames by MAC", "A repeater regenerates signals (L1); a bridge connects two LAN segments and filters frames by MAC (L2, essentially a 2-port switch); a router connects different networks and forwards by IP (L3)", "A bridge forwards by IP address", "A router extends a single collision domain"],
    answer: 1,
    explanation: "Each step up the stack lets a device make smarter forwarding decisions and split more kinds of domains: switches/bridges split collision domains; routers split broadcast domains too.",
    optionExplanations: ["Repeaters don't understand addresses.", "Correct.", "Bridges use MAC addresses.", "Routers separate networks."]
  },
  {
    id: "cn-datalink-031", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "Why do modern full-duplex switched Ethernet links never experience collisions?",
    options: ["They use CSMA/CD more aggressively", "Because frames are smaller", "Each link connects exactly two devices (host and switch port) with separate transmit and receive paths, so both can send simultaneously and there's no shared medium to collide on", "Because switches are faster than hubs"],
    answer: 2,
    explanation: "CSMA/CD only matters on shared half-duplex media. On switched networks, congestion appears instead as queueing and drops in switch buffers, handled by higher layers (e.g. TCP).",
    optionExplanations: ["CSMA/CD is disabled in full duplex.", "Frame size isn't the reason.", "Correct.", "Speed alone wouldn't prevent collisions on a shared medium."]
  },
  {
    id: "cn-datalink-032", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "How do FDMA, TDMA and CDMA share a channel among users?",
    options: ["They're identical", "FDMA gives each user a different frequency band; TDMA gives each user different time slots on the same frequency; CDMA lets users transmit simultaneously on the same band using different orthogonal codes", "CDMA uses time slots", "FDMA uses codes"],
    answer: 1,
    explanation: "These channel-partitioning schemes avoid collisions entirely, unlike random access (ALOHA, CSMA). Taking-turns protocols (polling, token passing) are a third family of MAC protocols.",
    optionExplanations: ["Each partitions a different dimension.", "Correct.", "That's TDMA.", "That's CDMA."]
  },
  {
    id: "cn-datalink-033", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "medium", type: "concept",
    question: "In token passing (e.g. Token Ring), how is access to the medium controlled?",
    options: ["Stations transmit randomly", "A central server assigns IP addresses", "A special token frame circulates; only the station holding it may transmit (for a bounded time), then passes it on — no collisions and bounded worst-case access delay, but token loss/duplication must be managed", "Stations use RTS/CTS"],
    answer: 2,
    explanation: "Controlled-access protocols trade some efficiency at low load (waiting for the token) for predictability at high load, which suited industrial and real-time networks.",
    optionExplanations: ["That's random access.", "That's DHCP.", "Correct.", "That's Wi-Fi's mechanism."]
  },
  {
    id: "cn-datalink-034", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "easy", type: "concept",
    question: "Which are guided (wired) and which are unguided (wireless) transmission media?",
    options: ["All media are guided", "Fibre is unguided", "Guided: twisted pair, coaxial cable, optical fibre; unguided: radio waves, microwaves, infrared (and satellite links)", "Radio is guided"],
    answer: 2,
    explanation: "Fibre offers huge bandwidth, low attenuation and immunity to electromagnetic interference; twisted pair (Cat5e/6) is cheap for LANs; wireless trades reliability and bandwidth for mobility.",
    optionExplanations: ["Wireless media aren't guided.", "Fibre guides light through glass.", "Correct.", "Radio propagates through free space."]
  },
  {
    id: "cn-datalink-035", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "hard", type: "concept",
    question: "Why does Manchester encoding (used in 10 Mbps Ethernet) need twice the signalling rate of NRZ for the same bit rate, and what does it gain?",
    options: ["It doesn't need more bandwidth", "It compresses data", "Every bit has a transition in the middle (e.g. high→low for 1, low→high for 0), so 10 Mbps requires 20 Mbaud; in return the receiver can recover the clock from the signal and there's no DC component, even for long runs of identical bits", "It encrypts the signal"],
    answer: 2,
    explanation: "Plain NRZ can lose synchronisation during long runs of 0s or 1s. Faster Ethernet variants use more efficient block codes (4B/5B, 8B/10B, 64B/66B) that guarantee transitions with less overhead.",
    optionExplanations: ["Two signal levels per bit double the baud rate.", "Line coding doesn't compress.", "Correct.", "Line coding isn't encryption."]
  },
  {
    id: "cn-datalink-036", subject: "networks", subtopic: "Physical & Data Link Layer", difficulty: "hard", type: "concept",
    question: "A switch's MAC table is flooded with thousands of fake source MAC addresses until it's full. What happens, and what's the defence?",
    options: ["The switch reboots and nothing else happens", "New legitimate entries can't be learned, so frames to unknown destinations are flooded to all ports, letting an attacker sniff traffic like on a hub (MAC flooding). Defences: port security (limit MACs per port), 802.1X authentication", "The switch blocks all traffic permanently", "It only affects Wi-Fi"],
    answer: 1,
    explanation: "Related layer-2 attacks include ARP spoofing (poisoning hosts' ARP caches to intercept traffic) and VLAN hopping (double tagging). Dynamic ARP inspection and DHCP snooping mitigate the former.",
    optionExplanations: ["The attack aims to turn the switch into a hub.", "Correct.", "Traffic continues, but flooded.", "It targets wired switches."]
  }
);
