/* Computer Networks — NAT, IPv6, ICMP & Fragmentation */
window.QUESTIONS.push(
  {
    id: "cn-netlayer-001", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "easy", type: "concept",
    question: "What is the size range of an IPv4 header, and what does the IHL field hold?",
    options: ["Always 40 bytes; IHL is the TTL", "8 bytes; IHL is the checksum", "20 to 60 bytes; IHL (Internet Header Length) gives the header length in 4-byte (32-bit) words, from 5 to 15", "Up to 1500 bytes; IHL is the payload length"],
    answer: 2,
    explanation: "The fixed part is 20 bytes; up to 40 bytes of options can follow. IHL = 5 means 20 bytes, IHL = 15 means 60 bytes. Total Length (16 bits) covers header + data, up to 65,535 bytes.",
    optionExplanations: ["40 bytes is the IPv6 base header.", "8 bytes is the UDP header.", "Correct.", "That's the Ethernet MTU, and IHL isn't the payload length."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-netlayer-002", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "numerical",
    question: "An IPv4 header's IHL field contains 8. How long is the header, and how many bytes of options does it carry?",
    options: ["8 bytes, no options", "32 bytes, 12 bytes of options", "40 bytes, 20 bytes of options", "64 bytes, 44 bytes of options"],
    answer: 1,
    explanation: "Header length = IHL × 4 = 8 × 4 = 32 bytes. The fixed header is 20 bytes, so options occupy 32 − 20 = 12 bytes.",
    optionExplanations: ["IHL counts 4-byte words.", "Correct.", "That would be IHL = 10.", "IHL can't exceed 15 (60 bytes)."]
  },
  {
    id: "cn-netlayer-003", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "easy", type: "concept",
    question: "What does the IPv4 TTL (Time To Live) field do?",
    options: ["Stores the packet's creation time in seconds", "Each router decrements it by 1; when it reaches 0 the packet is discarded and an ICMP Time Exceeded message is sent back, preventing packets from looping forever", "Measures latency", "Counts retransmissions"],
    answer: 1,
    explanation: "Typical initial TTLs are 64 (Linux/macOS) or 128 (Windows). Because TTL changes at each hop, routers must recompute the IPv4 header checksum every hop. Traceroute exploits TTL expiry.",
    optionExplanations: ["Despite its name, it's a hop count in practice.", "Correct.", "It doesn't measure time directly.", "TCP handles retransmissions."]
  },
  {
    id: "cn-netlayer-004", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "easy", type: "concept",
    question: "What values does the IPv4 Protocol field take for ICMP, TCP and UDP?",
    options: ["1, 6, 17", "6, 17, 1", "17, 6, 1", "80, 443, 53"],
    answer: 0,
    explanation: "The Protocol field tells the receiving host which upper-layer handler gets the payload: 1 = ICMP, 6 = TCP, 17 = UDP (also 89 = OSPF, 50 = ESP). IPv6 calls it Next Header.",
    optionExplanations: ["Correct.", "Shuffled.", "Reversed.", "Those are port numbers."]
  },
  {
    id: "cn-netlayer-005", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "In IPv4, which devices may fragment a packet, and where are fragments reassembled?",
    options: ["Only the source; reassembled at each router", "Any router whose outgoing link MTU is smaller than the packet (unless DF is set); reassembly happens ONLY at the final destination host", "Only the destination", "Switches fragment and routers reassemble"],
    answer: 1,
    explanation: "Reassembling at routers would require buffering and state in the network core. Fragments may take different paths, and losing any one fragment means the whole datagram is lost. IPv6 forbids router fragmentation entirely.",
    optionExplanations: ["Routers can fragment in IPv4; they don't reassemble.", "Correct.", "Routers fragment; destinations reassemble.", "Switches don't fragment IP packets."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-netlayer-006", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "Which IPv4 header fields support fragmentation?",
    options: ["TTL and checksum", "Source and destination ports", "Identification (same for all fragments of one datagram), Flags (DF = Don't Fragment, MF = More Fragments) and Fragment Offset (position of the data in 8-byte units)", "Type of Service only"],
    answer: 2,
    explanation: "The receiver groups fragments by (source, destination, protocol, identification), orders them by offset, and knows it has the last one when MF = 0. Offsets are in 8-byte units, so every fragment except the last carries a multiple of 8 data bytes.",
    optionExplanations: ["Those aren't fragmentation fields.", "Ports are in TCP/UDP headers (and only in the first fragment).", "Correct.", "ToS/DSCP is about QoS."]
  },
  {
    id: "cn-netlayer-007", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "hard", type: "numerical",
    question: "A 4,000-byte IPv4 datagram (20-byte header, 3,980 bytes of data) must cross a link with MTU 1,500. What are the fragments' total lengths and offset field values?",
    options: ["1500, 1500, 1040 with offsets 0, 185, 370", "1500, 1500, 1000 with offsets 0, 1500, 3000", "1480, 1480, 1040 with offsets 0, 185, 370", "1500, 1500, 1040 with offsets 0, 1480, 2960"],
    answer: 0,
    explanation: "Max data per fragment = 1,500 − 20 = 1,480 (a multiple of 8 ✓). Data split: 1,480 + 1,480 + 1,020 = 3,980. Total lengths: 1,500, 1,500, 1,040. Offsets in 8-byte units: 0, 1480/8 = 185, 2960/8 = 370. MF = 1, 1, 0.",
    optionExplanations: ["Correct.", "Each fragment carries its own 20-byte header, and offsets are in 8-byte units.", "Total length includes the header.", "Offsets are stored in 8-byte units."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-netlayer-008", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "hard", type: "numerical",
    question: "A 1,420-byte datagram (20-byte header, 1,400 bytes of data) crosses a link with MTU 576. How much data does each fragment carry?",
    options: ["556, 556, 288", "576, 576, 268", "552, 552, 296", "560, 560, 280"],
    answer: 2,
    explanation: "Room for data = 576 − 20 = 556, but non-final fragments must carry a multiple of 8 bytes: ⌊556 / 8⌋ × 8 = 552. 1,400 = 552 + 552 + 296. Offsets: 0, 69, 138. This 'round down to 8' step is a common trap.",
    optionExplanations: ["556 isn't a multiple of 8.", "Each fragment needs room for a 20-byte header.", "Correct.", "560 + 20 exceeds the MTU."],
    tags: ["trap"]
  },
  {
    id: "cn-netlayer-009", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "How does Path MTU Discovery (PMTUD) work in IPv4?",
    options: ["Routers broadcast their MTUs", "TCP negotiates it with DNS", "The sender sets the DF (Don't Fragment) bit; a router whose next link is too small drops the packet and returns ICMP 'Fragmentation Needed' with the link MTU; the sender then uses smaller packets", "The receiver tells the sender the MTU"],
    answer: 2,
    explanation: "PMTUD avoids fragmentation overhead. It breaks if firewalls block those ICMP messages ('black hole' connections that hang on large transfers), which is why MSS clamping is common on VPNs and PPPoE links.",
    optionExplanations: ["Routers don't broadcast MTUs.", "DNS isn't involved.", "Correct.", "Intermediate links are unknown to the receiver."]
  },
  {
    id: "cn-netlayer-010", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "easy", type: "concept",
    question: "What problem does NAT (Network Address Translation) solve?",
    options: ["It encrypts traffic", "It assigns IP addresses", "It speeds up routing", "It lets many devices with private IP addresses share one (or a few) public IPv4 addresses by rewriting source addresses (and ports) as traffic leaves the network, conserving IPv4 space"],
    answer: 3,
    explanation: "Home routers do this for every device in the house. NAT also hides internal addressing, but it isn't a security mechanism by itself.",
    optionExplanations: ["NAT doesn't encrypt.", "That's DHCP.", "It adds per-packet work.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-netlayer-011", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "How does PAT (Port Address Translation / NAPT) let two internal hosts both browse from one public IP?",
    options: ["It alternates which host may connect", "It rewrites each outgoing connection's (private IP, source port) to (public IP, unique public port) and records the mapping in a translation table, so replies to that port are sent back to the right internal host", "It assigns each host a different MAC", "It uses IPv6 internally"],
    answer: 1,
    explanation: "With ~64,000 ports per public IP per protocol and destination, thousands of internal connections can share one address. Static NAT maps one private IP to one public IP; dynamic NAT uses a pool.",
    optionExplanations: ["Connections run simultaneously.", "Correct.", "MAC addresses don't cross routers.", "PAT works within IPv4."]
  },
  {
    id: "cn-netlayer-012", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "Why can't someone on the Internet directly connect to a web server running on a laptop behind a home NAT router, and what fixes it?",
    options: ["Web servers can't run on laptops", "HTTP doesn't work through routers", "The laptop's MAC is hidden", "Inbound packets arrive at the router's public IP with no existing translation entry, so the router doesn't know which internal host to forward them to; configure port forwarding (static mapping), or use NAT traversal techniques (UPnP, STUN/TURN, hole punching)"],
    answer: 3,
    explanation: "NAT breaks the end-to-end model: only internally initiated flows get mappings. Peer-to-peer apps and VoIP use STUN to discover public mappings and TURN relays as a fallback.",
    optionExplanations: ["Any machine can run a server.", "HTTP works through NAT for outbound connections.", "MAC addresses never reach the Internet anyway.", "Correct."]
  },
  {
    id: "cn-netlayer-013", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "easy", type: "concept",
    question: "What is ICMP used for?",
    options: ["Reporting errors and diagnostics for IP: destination unreachable, time exceeded, fragmentation needed, redirect, and echo request/reply (ping)", "Transferring files", "Assigning addresses", "Encrypting packets"],
    answer: 0,
    explanation: "ICMP messages travel inside IP packets (protocol 1). Common types: 0 Echo Reply, 3 Destination Unreachable, 5 Redirect, 8 Echo Request, 11 Time Exceeded.",
    optionExplanations: ["Correct.", "That's FTP/HTTP.", "That's DHCP.", "That's IPsec/TLS."]
  },
  {
    id: "cn-netlayer-014", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "How does traceroute discover the routers along a path?",
    options: ["It reads routing tables remotely", "It sends probes with TTL = 1, 2, 3, …; each router where the TTL hits 0 replies with ICMP Time Exceeded, revealing its address and the round-trip time; the destination finally replies (ICMP Port Unreachable or Echo Reply)", "It asks DNS for the path", "It uses ARP"],
    answer: 1,
    explanation: "Unix traceroute uses UDP probes to high ports by default; Windows tracert uses ICMP Echo. '* * *' means a hop didn't reply (often filtered), not necessarily that it's down.",
    optionExplanations: ["Routing tables aren't remotely readable.", "Correct.", "DNS only names the hops.", "ARP works on one link."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-netlayer-015", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "easy", type: "concept",
    question: "Which ICMP messages does ping use?",
    options: ["Echo Request (type 8) and Echo Reply (type 0)", "Time Exceeded", "Destination Unreachable", "Redirect"],
    answer: 0,
    explanation: "ping measures reachability and round-trip time. A host that blocks ICMP may be up even though ping fails, so it's not a definitive test.",
    optionExplanations: ["Correct.", "That's used by traceroute.", "That reports delivery failures.", "That suggests a better next hop."]
  },
  {
    id: "cn-netlayer-016", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "easy", type: "concept",
    question: "How large is an IPv6 address and how is it written?",
    options: ["32 bits, dotted decimal", "48 bits, as six bytes", "64 bits, as a MAC address", "128 bits, as eight groups of four hex digits separated by colons, with leading zeros droppable and one run of zero groups compressible to ::"],
    answer: 3,
    explanation: "2¹²⁸ ≈ 3.4 × 10³⁸ addresses. Example: 2001:0db8:0000:0000:0000:ff00:0042:8329 → 2001:db8::ff00:42:8329.",
    optionExplanations: ["That's IPv4.", "That's a MAC address.", "64 bits is the usual interface-ID length.", "Correct."]
  },
  {
    id: "cn-netlayer-017", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "numerical",
    question: "What is the correct compressed form of 2001:0db8:0000:0000:0000:ff00:0042:8329?",
    options: ["2001:db8::ff00:42:8329", "2001:db8:0:0:0:ff00:42:8329:", "2001:db8::ff:42:8329", "2001:db8:::ff00:42:8329"],
    answer: 0,
    explanation: "Drop leading zeros in each group (0db8 → db8, 0042 → 42) and replace the single longest run of all-zero groups with ::. You can't drop trailing zeros (ff00 stays ff00), and ::: is invalid.",
    optionExplanations: ["Correct.", "There's a stray trailing colon and the zeros could be compressed.", "Trailing zeros of ff00 can't be removed.", "Only :: is allowed."]
  },
  {
    id: "cn-netlayer-018", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "hard", type: "concept",
    question: "Why is 2001:db8::1::1 an INVALID IPv6 address?",
    options: ["It's too short", "db8 must be written as 0db8", "IPv6 can't end in 1", "'::' may appear only once: with two, the receiver can't tell how many zero groups each one represents"],
    answer: 3,
    explanation: "With one '::', the number of omitted groups is 8 minus the groups shown. Two compressions make that ambiguous (e.g. 1:0:0 or 0:1:0 splits).",
    optionExplanations: ["Shortened addresses are fine.", "Leading zeros may be dropped.", "Any hex value is allowed.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "cn-netlayer-019", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "hard", type: "numerical",
    question: "What is the canonical (RFC 5952) compressed form of 2001:db8:0:0:1:0:0:1?",
    options: ["2001:db8::1:0:0:1", "2001:db8:0:0:1::1", "2001:db8::1::1", "2001:db8:0:0:1:0:0:1"],
    answer: 0,
    explanation: "Both zero runs are two groups long. When runs tie, RFC 5952 compresses the FIRST one. Compressing either run gives a valid address, but the canonical form is 2001:db8::1:0:0:1; using :: twice is never valid.",
    optionExplanations: ["Correct.", "Valid, but not canonical: the first of equal runs should be compressed.", "Two :: are never allowed.", "Valid but not compressed."]
  },
  {
    id: "cn-netlayer-020", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "Which IPv4 header features were removed or changed in the IPv6 base header?",
    options: ["None", "IPv6 added a header checksum", "The IPv6 header is a fixed 40 bytes with no header checksum (handled by link and transport layers), no router fragmentation fields (moved to an extension header used only by the source), options moved to extension headers, and a Flow Label added", "IPv6 headers vary from 20 to 60 bytes"],
    answer: 2,
    explanation: "A fixed, simpler header speeds up router processing. 'Hop Limit' replaces TTL, 'Next Header' replaces Protocol and chains extension headers.",
    optionExplanations: ["The header was redesigned.", "The checksum was removed.", "Correct.", "That describes IPv4."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-netlayer-021", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "An IPv6 router receives a 2,000-byte packet for a link with MTU 1,500. What does it do?",
    options: ["Fragments it like IPv4", "Forwards it anyway", "Truncates it", "Drops it and sends an ICMPv6 'Packet Too Big' message to the source, which must fragment (or reduce its packet size) itself; IPv6 routers never fragment"],
    answer: 3,
    explanation: "IPv6 requires every link to support at least 1,280 bytes and relies on Path MTU Discovery. Only the source may fragment, using the Fragment extension header.",
    optionExplanations: ["Routers don't fragment in IPv6.", "It doesn't fit the link.", "Truncation would corrupt data.", "Correct."]
  },
  {
    id: "cn-netlayer-022", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "Which IPv6 address types exist, and what replaces broadcast?",
    options: ["Unicast, broadcast, multicast", "Only unicast", "Unicast, multicast and anycast; there is no broadcast — multicast groups (e.g. ff02::1 all-nodes) are used instead", "Broadcast and anycast"],
    answer: 2,
    explanation: "Notable addresses: ::1 loopback, :: unspecified, fe80::/10 link-local (every interface has one), fc00::/7 unique local (like private IPv4), 2000::/3 global unicast, ff00::/8 multicast.",
    optionExplanations: ["IPv6 has no broadcast.", "Multicast and anycast also exist.", "Correct.", "Broadcast was removed."]
  },
  {
    id: "cn-netlayer-023", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "How does an IPv6 host typically get an address without DHCP, and what replaces ARP?",
    options: ["It can't", "It uses RARP", "SLAAC (Stateless Address Autoconfiguration): it learns the network prefix from Router Advertisements and generates its own interface identifier (randomised for privacy). Neighbor Discovery Protocol (NDP, over ICMPv6) replaces ARP", "It copies the router's address"],
    answer: 2,
    explanation: "Duplicate Address Detection checks the self-chosen address is unique. DHCPv6 is still available for managed configuration (e.g. DNS servers).",
    optionExplanations: ["SLAAC exists for this.", "RARP is obsolete IPv4 technology.", "Correct.", "Addresses must be unique."]
  },
  {
    id: "cn-netlayer-024", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "Which techniques help IPv4 and IPv6 coexist during the transition?",
    options: ["None are needed", "Running IPv6 only on Wi-Fi", "Converting all IPv4 addresses to MAC addresses", "Dual stack (hosts/routers run both), tunnelling (carry IPv6 inside IPv4, e.g. 6in4), and translation (NAT64/DNS64 lets IPv6-only clients reach IPv4 servers)"],
    answer: 3,
    explanation: "Most networks today are dual-stack; mobile carriers often run IPv6-only with NAT64. Happy Eyeballs makes clients try both protocols and use whichever connects first.",
    optionExplanations: ["The protocols aren't directly compatible.", "Not a transition mechanism.", "Not a real technique.", "Correct."]
  },
  {
    id: "cn-netlayer-025", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "What's the difference between forwarding and routing in a router?",
    options: ["They're the same", "Routing happens per packet; forwarding happens once a day", "Forwarding (data plane) moves each arriving packet to the correct output port using the forwarding table, in nanoseconds; routing (control plane) runs protocols/algorithms to build that table, over seconds", "Forwarding is done by DNS"],
    answer: 2,
    explanation: "Software-Defined Networking separates them physically: a central controller computes routes and installs forwarding rules in switches (e.g. OpenFlow).",
    optionExplanations: ["They're distinct functions.", "Reversed.", "Correct.", "DNS doesn't forward packets."]
  },
  {
    id: "cn-netlayer-026", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "hard", type: "concept",
    question: "Why must a NAT device that rewrites a packet's source IP also update the TCP/UDP checksum?",
    options: ["It doesn't need to", "TCP/UDP checksums cover a pseudo-header that includes the source and destination IP addresses, so changing the IP (or port) invalidates the transport checksum as well as the IPv4 header checksum", "Because NAT encrypts the payload", "Because the MAC address changes"],
    answer: 1,
    explanation: "NAT must also handle protocols that embed addresses in their payload (FTP's PORT command, SIP), using application-level gateways — another way NAT complicates the end-to-end model.",
    optionExplanations: ["The checksum would fail at the receiver.", "Correct.", "NAT doesn't encrypt.", "MAC changes don't affect transport checksums."]
  },
  {
    id: "cn-netlayer-027", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "hard", type: "concept",
    question: "One fragment of a 3-fragment IPv4 datagram is lost. What happens?",
    options: ["The receiver delivers the 2 fragments it has", "The destination can't reassemble the datagram; after a reassembly timeout it discards the received fragments, and the whole datagram must be resent by a higher layer (e.g. TCP retransmits the entire segment)", "The router resends the missing fragment", "IP requests the fragment again"],
    answer: 1,
    explanation: "IP itself has no retransmission. Fragmentation multiplies the effective loss probability: if each fragment is lost with probability p, the datagram survives with (1 − p)^n. That's a key reason to avoid fragmentation.",
    optionExplanations: ["Partial datagrams aren't delivered.", "Correct.", "Routers don't keep copies.", "IP is unreliable; it doesn't request retransmission."]
  },
  {
    id: "cn-netlayer-028", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "hard", type: "numerical",
    question: "A 2,400-byte datagram (20-byte header) crosses a link with MTU 820. What is the fragment offset field of the LAST fragment?",
    options: ["160", "100", "1600", "200"],
    answer: 3,
    explanation: "Data = 2,380 bytes. Max data per fragment = 820 − 20 = 800 (a multiple of 8 ✓). Fragments carry 800, 800, 780 bytes. The last starts at byte 1,600 → offset field = 1,600 / 8 = 200.",
    optionExplanations: ["Recompute 1,600 / 8.", "That's the second fragment's offset.", "Offsets are stored in 8-byte units.", "Correct."]
  },
  {
    id: "cn-netlayer-029", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "Why must IPv4 routers recompute the header checksum at every hop?",
    options: ["Because the TTL field (and sometimes other fields, e.g. by NAT) changes at each hop, and the checksum covers the header", "Because the payload changes", "Because the checksum includes the MAC address", "They don't"],
    answer: 0,
    explanation: "The IPv4 checksum protects only the header. IPv6 removed it to save this per-hop work, since link layers (CRC) and transport layers already check integrity.",
    optionExplanations: ["Correct.", "The checksum doesn't cover the payload.", "MAC addresses aren't in the IP header.", "IPv4 routers must update it."]
  },
  {
    id: "cn-netlayer-030", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "medium", type: "concept",
    question: "A host receives ICMP 'Destination Unreachable — Port Unreachable' after sending a UDP packet. What does it mean?",
    options: ["The network is down", "The packet reached the destination host, but no process was listening on that UDP port", "The router has no route", "The TTL expired"],
    answer: 1,
    explanation: "Destination Unreachable has codes: network unreachable (0), host unreachable (1), protocol unreachable (2), port unreachable (3), fragmentation needed and DF set (4), administratively prohibited (13).",
    optionExplanations: ["That would be network unreachable.", "Correct.", "That's network/host unreachable from a router.", "That's Time Exceeded."]
  },
  {
    id: "cn-netlayer-031", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "easy", type: "concept",
    question: "What does the IPv6 loopback address look like?",
    options: ["127.0.0.1", "ff02::1", "fe80::1", "::1"],
    answer: 3,
    explanation: "::1 is 0:0:0:0:0:0:0:1. fe80::/10 is link-local, ff02::1 is the all-nodes multicast address, and 127.0.0.1 is the IPv4 loopback.",
    optionExplanations: ["That's IPv4.", "That's multicast.", "That's a link-local address.", "Correct."]
  },
  {
    id: "cn-netlayer-032", subject: "networks", subtopic: "NAT, IPv6, ICMP & Fragmentation", difficulty: "hard", type: "concept",
    question: "What is carrier-grade NAT (CGNAT), and what's one downside?",
    options: ["The ISP itself NATs many customers behind shared public IPv4 addresses (customers get addresses from 100.64.0.0/10), so users sit behind two layers of NAT; downsides include no inbound connections/port forwarding, shared IP reputation and harder abuse tracing", "NAT for IPv6 only", "A faster type of NAT hardware", "NAT that encrypts traffic"],
    answer: 0,
    explanation: "CGNAT stretches scarce IPv4 addresses further. It requires logging port allocations to identify users, and complicates gaming, hosting and P2P. IPv6 avoids it.",
    optionExplanations: ["Correct.", "It's an IPv4 technique.", "It's about where NAT happens.", "NAT doesn't encrypt."]
  }
);
