/* Computer Networks — IP Addressing & Subnetting */
window.QUESTIONS.push(
  {
    id: "cn-ip-001", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "concept",
    question: "How is an IPv4 address structured?",
    options: ["48 bits written in hex", "128 bits in eight groups", "32 bits written as four decimal octets (e.g. 192.168.1.10), split into a network part and a host part by the subnet mask / prefix length", "16 bits plus a port"],
    answer: 2,
    explanation: "2³² ≈ 4.3 billion addresses. The prefix (e.g. /24) says how many leading bits identify the network; the remaining bits identify the host within it.",
    optionExplanations: ["That describes MAC addresses.", "That's IPv6.", "Correct.", "Ports belong to the transport layer."]
  },
  {
    id: "cn-ip-002", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "concept",
    question: "In classful addressing, which first-octet ranges and default masks belong to classes A, B and C?",
    options: ["A 0–63 /8, B 64–127 /16, C 128–191 /24", "A 1–126 /8 (leading bit 0), B 128–191 /16 (leading bits 10), C 192–223 /24 (leading bits 110); D 224–239 is multicast, E 240–255 reserved", "A 1–100, B 101–200, C 201–255", "All classes use /24"],
    answer: 1,
    explanation: "127.x.x.x is reserved for loopback, so class A unicast networks effectively run 1–126. Classful addressing was replaced by CIDR in 1993, but the ranges remain common interview material.",
    optionExplanations: ["The leading-bit boundaries are 128 and 192.", "Correct.", "The ranges follow leading bits, not round numbers.", "Default masks differ by class."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-ip-003", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "numerical",
    question: "How many usable host addresses does a /24 network have?",
    options: ["256", "254", "255", "252"],
    answer: 1,
    explanation: "A /24 leaves 8 host bits: 2⁸ = 256 addresses. The all-zeros host part is the network address and all-ones is the broadcast address, so usable hosts = 2⁸ − 2 = 254.",
    optionExplanations: ["Two addresses are reserved.", "Correct.", "Both network and broadcast addresses are reserved.", "That's only 4 fewer."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-ip-004", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "numerical",
    question: "What is the subnet mask for a /26 prefix, and how many usable hosts does it allow?",
    options: ["255.255.255.0, 254 hosts", "255.255.255.192, 62 hosts", "255.255.255.224, 30 hosts", "255.255.255.128, 126 hosts"],
    answer: 1,
    explanation: "/26 = 24 ones + 2 more ones in the last octet: 11000000 = 192 → 255.255.255.192. Host bits = 6: 2⁶ − 2 = 62 usable hosts.",
    optionExplanations: ["That's /24.", "Correct.", "That's /27.", "That's /25."]
  },
  {
    id: "cn-ip-005", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "concept",
    question: "Which are the private IPv4 address ranges (RFC 1918)?",
    options: ["1.0.0.0/8, 2.0.0.0/8, 3.0.0.0/8", "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16", "127.0.0.0/8 only", "192.0.0.0/8 and 172.0.0.0/8"],
    answer: 1,
    explanation: "Private addresses aren't routed on the public Internet; hosts using them reach the Internet through NAT. Note 172.16.0.0/12 covers only 172.16.0.0–172.31.255.255, so 172.32.0.1 is public.",
    optionExplanations: ["Those are public ranges.", "Correct.", "127/8 is loopback, not RFC 1918.", "Only parts of these are private."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-ip-006", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "For host 192.168.10.77/26, what are the network address and broadcast address?",
    options: ["192.168.10.0 and 192.168.10.255", "192.168.10.77 and 192.168.10.127", "192.168.10.64 and 192.168.10.127", "192.168.10.64 and 192.168.10.128"],
    answer: 2,
    explanation: "A /26 has block size 256 − 192 = 64, so subnets start at 0, 64, 128, 192. 77 falls in the 64 block: network 192.168.10.64, broadcast 192.168.10.127 (next block − 1). Usable hosts: .65–.126.",
    optionExplanations: ["That's the /24.", "77 is a host, not the network address.", "Correct.", ".128 starts the next subnet."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-ip-007", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "For 172.16.45.200/20, what is the network address and the range of usable hosts?",
    options: ["172.16.45.0; .45.1–.45.254", "172.16.40.0; 172.16.40.1–172.16.55.254", "172.16.0.0; 172.16.0.1–172.16.15.254", "172.16.32.0; 172.16.32.1–172.16.47.254"],
    answer: 3,
    explanation: "/20 means the third octet has 4 network bits: block size 256 − 240 = 16 in the third octet → blocks 0, 16, 32, 48... 45 is in the 32 block. Network 172.16.32.0, broadcast 172.16.47.255, usable 172.16.32.1–172.16.47.254 (4,094 hosts).",
    optionExplanations: ["That treats it as a /24.", "Blocks are multiples of 16.", "45 isn't in the 0–15 block.", "Correct."]
  },
  {
    id: "cn-ip-008", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "For 200.1.1.130/27, what are the first and last usable host addresses?",
    options: ["200.1.1.129 – 200.1.1.158", "200.1.1.128 – 200.1.1.159", "200.1.1.131 – 200.1.1.160", "200.1.1.1 – 200.1.1.254"],
    answer: 0,
    explanation: "/27 → block size 32: subnets at .0, .32, .64, .96, .128, .160... 130 is in the .128 subnet: network .128, broadcast .159, usable .129–.158 (30 hosts).",
    optionExplanations: ["Correct.", "Those are the network and broadcast addresses.", "The range is shifted.", "That's the /24 range."]
  },
  {
    id: "cn-ip-009", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "A company is given 172.16.0.0/16 and divides it into /20 subnets. How many subnets result, and how many usable hosts are in each?",
    options: ["16 subnets, 4,094 hosts each", "20 subnets, 4,096 hosts each", "4 subnets, 16,382 hosts each", "16 subnets, 4,096 hosts each"],
    answer: 0,
    explanation: "Borrowed bits = 20 − 16 = 4 → 2⁴ = 16 subnets. Host bits = 32 − 20 = 12 → 2¹² − 2 = 4,094 usable hosts per subnet.",
    optionExplanations: ["Correct.", "The prefix length isn't the subnet count.", "4 borrowed bits give 16 subnets.", "Network and broadcast addresses aren't usable."]
  },
  {
    id: "cn-ip-010", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "You need subnets of at least 50 usable hosts each. What's the longest prefix (smallest subnet) that works?",
    options: ["/26", "/25", "/27", "/28"],
    answer: 0,
    explanation: "Need 2^h − 2 ≥ 50 → h = 6 (62 hosts); h = 5 gives only 30. Prefix = 32 − 6 = /26.",
    optionExplanations: ["Correct.", "Works, but wastes addresses (126 hosts).", "Only 30 usable hosts.", "Only 14 usable hosts."]
  },
  {
    id: "cn-ip-011", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "Are 192.168.10.70 and 192.168.10.130 in the same subnet if the mask is 255.255.255.192?",
    options: ["Yes, both are in 192.168.10.0/24", "It depends on the gateway", "Yes, both are in 192.168.10.64/26", "No: .70 is in 192.168.10.64/26 (.64–.127) and .130 is in 192.168.10.128/26"],
    answer: 3,
    explanation: "AND each address with the mask: 70 AND 192 = 64; 130 AND 192 = 128. Different network addresses → different subnets, so traffic between them must go through a router.",
    optionExplanations: ["The mask is /26, not /24.", "Subnet membership depends only on address and mask.", ".130 is beyond .127.", "Correct."]
  },
  {
    id: "cn-ip-012", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "What is CIDR (Classless Inter-Domain Routing)?",
    options: ["A new class E", "A NAT technique", "A routing protocol", "Allocating and routing addresses with arbitrary prefix lengths (a.b.c.d/n) instead of fixed class boundaries, which reduces address waste and allows route aggregation"],
    answer: 3,
    explanation: "Classful allocation forced organisations to take a /16 (65,534 hosts) when a /24 was too small. CIDR lets them get, say, a /22, and lets ISPs advertise many customer blocks as one aggregate route.",
    optionExplanations: ["It abolished classes.", "NAT is separate.", "BGP/OSPF are routing protocols that carry CIDR prefixes.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-ip-013", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "numerical",
    question: "Which single prefix summarises (supernets) 200.1.0.0/24, 200.1.1.0/24, 200.1.2.0/24 and 200.1.3.0/24 exactly?",
    options: ["200.1.0.0/23", "200.1.0.0/21", "200.1.0.0/16", "200.1.0.0/22"],
    answer: 3,
    explanation: "Four contiguous /24s, starting on a boundary divisible by 4 in the third octet (0), combine into one /22: 22 = 24 − log₂4. The /22 covers 200.1.0.0–200.1.3.255 exactly.",
    optionExplanations: ["A /23 covers only two /24s.", "That would also include 200.1.4.0–200.1.7.255.", "Far too broad.", "Correct."]
  },
  {
    id: "cn-ip-014", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "concept",
    question: "Can 200.1.1.0/24 and 200.1.2.0/24 be combined into a single /23?",
    options: ["Yes: 200.1.1.0/23", "Yes: 200.1.2.0/23", "No: a /23 must start at an even third octet; 200.1.0.0/23 covers .0 and .1, and 200.1.2.0/23 covers .2 and .3, so these two blocks fall into different /23s", "Only with NAT"],
    answer: 2,
    explanation: "Supernetting requires contiguous blocks, a power-of-two count, AND alignment: the first block's network number must be divisible by the number of blocks. 1 isn't divisible by 2, so they can't merge without including extra space.",
    optionExplanations: ["200.1.1.0 isn't a valid /23 network address.", "200.1.2.0/23 covers .2 and .3, not .1.", "Correct.", "NAT doesn't merge routes."],
    tags: ["trap"]
  },
  {
    id: "cn-ip-015", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "numerical",
    question: "A router's table has: 0.0.0.0/0 → D, 131.16.0.0/16 → A, 131.16.4.0/22 → B, 131.16.4.0/24 → C. Which next hops are used for 131.16.5.9 and 131.16.4.200?",
    options: ["A and A", "B and C", "C and B", "D and D"],
    answer: 1,
    explanation: "Longest prefix match: pick the most specific matching route. 131.16.5.9 matches /0, /16 and /22 (4.0–7.255) but not the /24 (4.x only) → B. 131.16.4.200 matches all four → /24 wins → C.",
    optionExplanations: ["More specific routes win.", "Correct.", "Reversed.", "The default route is used only when nothing else matches."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-ip-016", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "concept",
    question: "What is special about 127.0.0.1?",
    options: ["It's the default gateway", "It's a public DNS server", "It's a broadcast address", "It's the loopback address (127.0.0.0/8): packets never leave the host and are delivered back to it, used for testing local services"],
    answer: 3,
    explanation: "'localhost' resolves to 127.0.0.1 (and ::1 in IPv6). A server listening only on 127.0.0.1 can't be reached from other machines.",
    optionExplanations: ["Gateways are configured per network.", "Public DNS servers have public IPs.", "Broadcasts end in all-ones host bits.", "Correct."]
  },
  {
    id: "cn-ip-017", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "What do 0.0.0.0 and 169.254.x.x addresses usually indicate?",
    options: ["Both are public addresses", "0.0.0.0 means 'this host/unspecified' (e.g. a DHCP client before it has an address, or 'all interfaces' for a listening server); 169.254.0.0/16 is link-local (APIPA), self-assigned when DHCP fails", "169.254.x.x is loopback", "0.0.0.0 is the broadcast address"],
    answer: 1,
    explanation: "A host showing 169.254.x.x typically couldn't reach a DHCP server. Other special ranges: 255.255.255.255 limited broadcast, 100.64.0.0/10 carrier-grade NAT, 224.0.0.0/4 multicast.",
    optionExplanations: ["Neither is a normal public address.", "Correct.", "Loopback is 127/8.", "Limited broadcast is 255.255.255.255."]
  },
  {
    id: "cn-ip-018", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "What's the difference between a limited broadcast and a directed broadcast?",
    options: ["They're identical", "Limited broadcasts are routed across the Internet", "Directed broadcasts stay local", "Limited broadcast 255.255.255.255 reaches all hosts on the LOCAL network and is never forwarded by routers; a directed broadcast (e.g. 192.168.10.127 for 192.168.10.64/26) targets all hosts of a specific subnet and could be forwarded to it (usually disabled to prevent smurf attacks)"],
    answer: 3,
    explanation: "DHCP Discover uses the limited broadcast because the client doesn't yet know its network. Routers drop directed broadcasts by default since they were abused for amplification attacks.",
    optionExplanations: ["Their scope differs.", "Limited broadcasts never cross routers.", "Reversed.", "Correct."]
  },
  {
    id: "cn-ip-019", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "numerical",
    question: "What is 192.168.1.255/23?",
    options: ["A usable host address", "An invalid address", "The network address of 192.168.0.0/23", "The broadcast address of 192.168.0.0/23"],
    answer: 3,
    explanation: "A /23 has block size 2 in the third octet, so 192.168.1.255 lies in 192.168.0.0/23, whose range is 192.168.0.0–192.168.1.255. The last address of the block is the broadcast address.",
    optionExplanations: ["It's the last address of the block, reserved for broadcast.", "It's a valid (broadcast) address.", "The network address is 192.168.0.0.", "Correct."],
    tags: ["trap"]
  },
  {
    id: "cn-ip-020", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "concept",
    question: "In 192.168.0.0/23, is 192.168.0.255 a valid host address?",
    options: ["No, addresses ending in .255 are always broadcasts", "No, it's the network address", "Yes: the /23 spans 192.168.0.0–192.168.1.255, so .0.255 is in the middle of the range and is an ordinary host address", "Only for routers"],
    answer: 2,
    explanation: "Whether an address is a network/broadcast address depends on the prefix, not on the last octet. In a /23 the broadcast is 192.168.1.255 and the network is 192.168.0.0; 192.168.0.255 and 192.168.1.0 are usable hosts.",
    optionExplanations: ["That's only true for /24 and longer prefixes.", "The network address is 192.168.0.0.", "Correct.", "Any host can use it."],
    tags: ["trap"]
  },
  {
    id: "cn-ip-021", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "numerical",
    question: "Using VLSM on 192.168.1.0/24, you allocate subnets for departments needing 100, 50 and 25 hosts and one point-to-point link (2 hosts), largest first. Which allocation is correct?",
    options: ["/25 .0, /26 .128, /27 .192, /30 .224", "/24 .0 for all", "/26 .0, /26 .64, /26 .128, /26 .192", "/25 .0, /26 .64, /27 .192, /30 .224"],
    answer: 0,
    explanation: "Sizes: 100 → /25 (126 hosts); 50 → /26 (62); 25 → /27 (30); 2 → /30 (2). Allocating largest first keeps blocks aligned: 192.168.1.0/25, 192.168.1.128/26, 192.168.1.192/27, 192.168.1.224/30, leaving .228–.255 free. Equal /26s couldn't fit 100 hosts.",
    optionExplanations: ["Correct.", "One subnet can't separate departments.", "A /26 holds only 62 hosts, not 100.", "The /26 at .64 overlaps the /25, which already covers .0–.127."]
  },
  {
    id: "cn-ip-022", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "What is VLSM (Variable Length Subnet Masking), and why use it?",
    options: ["Using the same mask everywhere", "A routing protocol", "Using different prefix lengths for different subnets of the same network, sizing each to its host count (e.g. /30 for router links, /24 for a big LAN), which avoids wasting addresses", "A way to hide subnets"],
    answer: 2,
    explanation: "Fixed-length subnetting gives a 2-host router link the same size as a 200-host office. VLSM requires classless routing protocols (RIPv2, OSPF, EIGRP, BGP) that carry the mask with each route.",
    optionExplanations: ["That's fixed-length subnetting.", "It's an addressing technique.", "Correct.", "It's about sizing, not hiding."]
  },
  {
    id: "cn-ip-023", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "Why are /31 and /32 prefixes special?",
    options: ["They're invalid", "Both have 254 hosts", "A /32 identifies a single host (used for host routes and loopbacks); a /31 has just 2 addresses and, per RFC 3021, both are usable on point-to-point links because no broadcast is needed", "They're reserved for multicast"],
    answer: 2,
    explanation: "Normally 2^h − 2 applies, which would give 0 hosts for /31. RFC 3021 makes an exception for point-to-point links, saving half the space compared with /30.",
    optionExplanations: ["Both are valid in specific uses.", "They're tiny.", "Correct.", "Multicast is 224.0.0.0/4."]
  },
  {
    id: "cn-ip-024", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "Which is a valid CIDR network address (network part correctly aligned)?",
    options: ["10.20.32.0/20", "192.168.1.100/26", "172.16.10.0/20", "192.168.1.64/25"],
    answer: 0,
    explanation: "The network address must have all host bits zero, i.e. be divisible by the block size. /20 has block size 16 in the third octet: 32 is divisible by 16 ✓. 100 isn't a multiple of 64; 10 isn't a multiple of 16; 64 isn't a multiple of 128.",
    optionExplanations: ["Correct.", "The /26 network would be .64.", "The /20 network would be 172.16.0.0.", "The /25 network would be .0."]
  },
  {
    id: "cn-ip-025", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "numerical",
    question: "How many addresses (total, including network and broadcast) are in a /28?",
    options: ["16", "14", "28", "32"],
    answer: 0,
    explanation: "32 − 28 = 4 host bits → 2⁴ = 16 addresses, of which 14 are usable for hosts. Block size 16 → mask 255.255.255.240.",
    optionExplanations: ["Correct.", "That's the usable count.", "The prefix length isn't the size.", "That's a /27."]
  },
  {
    id: "cn-ip-026", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "How many networks and hosts per network did classful Class B provide?",
    options: ["126 networks, 16,777,214 hosts", "2,097,152 networks, 254 hosts", "16,384 networks, 65,534 hosts each", "65,536 networks, 65,536 hosts"],
    answer: 2,
    explanation: "Class B: leading bits 10, so 14 network bits remain: 2¹⁴ = 16,384 networks. 16 host bits: 2¹⁶ − 2 = 65,534 hosts each. Class A: 2⁷ − 2 = 126 networks; Class C: 2²¹ = 2,097,152 networks of 254 hosts.",
    optionExplanations: ["That's Class A.", "That's Class C.", "Correct.", "The leading bits and reserved addresses reduce these."]
  },
  {
    id: "cn-ip-027", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "For 131.107.2.89/22, what is the broadcast address?",
    options: ["131.107.3.255", "131.107.2.255", "131.107.255.255", "131.107.7.255"],
    answer: 0,
    explanation: "/22 → block size 4 in the third octet: blocks 0, 4, 8... The address's third octet 2 is in the 0 block: network 131.107.0.0, broadcast 131.107.3.255.",
    optionExplanations: ["Correct.", "That treats it as /24.", "That treats it as /16.", "That's a /21 broadcast."]
  },
  {
    id: "cn-ip-028", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "What is a wildcard (inverse) mask, as used in Cisco ACLs and OSPF, for a /27?",
    options: ["255.255.255.224", "0.0.0.31", "0.0.0.32", "255.255.255.31"],
    answer: 1,
    explanation: "A wildcard mask is the bitwise inverse of the subnet mask: 255.255.255.255 − 255.255.255.224 = 0.0.0.31. 0 bits must match, 1 bits are 'don't care'.",
    optionExplanations: ["That's the subnet mask.", "Correct.", "That's the block size, not the inverse.", "That mixes both."]
  },
  {
    id: "cn-ip-029", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "numerical",
    question: "How many IPv4 addresses are in the range 10.0.1.0 to 10.0.3.255 inclusive?",
    options: ["512", "768", "1,024", "255"],
    answer: 1,
    explanation: "From 10.0.1.0 to 10.0.3.255 spans three full /24s (1, 2, 3): 3 × 256 = 768. Note this range isn't a single CIDR block (it would need a /23 plus a /24).",
    optionExplanations: ["That's two /24s.", "Correct.", "That's four /24s.", "That's one /24 minus one."]
  },
  {
    id: "cn-ip-030", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "numerical",
    question: "Host A is 10.0.5.10 with mask /23 and host B is 10.0.6.1. Does A send packets for B directly or via its default gateway?",
    options: ["Directly: both are in 10.0.0.0/16", "It can't decide without DNS", "Directly: they differ only in the last octet", "Via the gateway: A's subnet is 10.0.4.0/23 (10.0.4.0–10.0.5.255), and B is outside it"],
    answer: 3,
    explanation: "A computes its network (10.0.4.0/23) and checks whether B falls inside it. 10.0.6.1 doesn't, so A ARPs for its gateway and sends the frame there.",
    optionExplanations: ["A's mask is /23, not /16.", "DNS isn't involved in this decision.", "They differ in the third octet.", "Correct."]
  },
  {
    id: "cn-ip-031", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "concept",
    question: "Which of these addresses is PRIVATE?",
    options: ["172.32.0.1", "8.8.8.8", "172.20.0.1", "193.168.1.1"],
    answer: 2,
    explanation: "172.16.0.0/12 spans 172.16.0.0–172.31.255.255, so 172.20.0.1 is private while 172.32.0.1 is public. 193.168.x.x isn't 192.168 and is public.",
    optionExplanations: ["172.32 is just outside the /12.", "That's Google's public DNS.", "Correct.", "Not the 192.168 range."],
    tags: ["trap"]
  },
  {
    id: "cn-ip-032", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "What is the 'block size' (magic number) method for subnetting quickly?",
    options: ["Divide the address by the prefix", "In the interesting octet, block size = 256 − mask value; subnets start at multiples of the block size, and each broadcast is the next start minus 1", "Count the number of 1s in the address", "Multiply all octets"],
    answer: 1,
    explanation: "For mask 255.255.255.224: block size 32 → subnets .0, .32, .64... An address .77 is in the .64 subnet with broadcast .95. This avoids converting everything to binary.",
    optionExplanations: ["That isn't a method.", "Correct.", "Counting 1s in the mask gives the prefix length.", "That's meaningless."]
  },
  {
    id: "cn-ip-033", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "numerical",
    question: "An ISP owns 10.0.0.0/8. How many /20 customer blocks can it allocate, and what is the 3rd block's network address?",
    options: ["4,096 blocks; 10.0.32.0/20", "4,096 blocks; 10.0.2.0/20", "256 blocks; 10.0.32.0/20", "12 blocks; 10.0.48.0/20"],
    answer: 0,
    explanation: "Borrowed bits = 20 − 8 = 12 → 2¹² = 4,096 blocks. Each /20 spans 16 in the third octet: 10.0.0.0, 10.0.16.0, 10.0.32.0 (third block), ...",
    optionExplanations: ["Correct.", "/20 blocks step by 16 in the third octet.", "There are 12 borrowed bits.", "12 is the number of borrowed bits, not blocks."]
  },
  {
    id: "cn-ip-034", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "medium", type: "concept",
    question: "Why did classful addressing waste addresses, contributing to IPv4 exhaustion?",
    options: ["It didn't", "Classful addresses were 16 bits", "Organisations had to take fixed sizes: a company needing 2,000 addresses got a Class B (65,534), wasting over 60,000; Class C (254) was too small for many. CIDR, private addressing + NAT, and IPv6 were the responses", "Classes required encryption"],
    answer: 2,
    explanation: "IANA's free pool ran out in 2011. Today IPv4 addresses are traded and leased, CGNAT is common, and IPv6 adoption continues to grow.",
    optionExplanations: ["The waste was large.", "IPv4 is 32 bits.", "Correct.", "Encryption is unrelated."]
  },
  {
    id: "cn-ip-035", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "hard", type: "numerical",
    question: "A /22 is split into /26 subnets. How many subnets and total usable hosts result?",
    options: ["16 subnets, 992 usable hosts", "16 subnets, 1,022 usable hosts", "4 subnets, 248 usable hosts", "64 subnets, 3,968 usable hosts"],
    answer: 0,
    explanation: "Borrowed bits = 26 − 22 = 4 → 16 subnets. Each /26 has 62 usable hosts: 16 × 62 = 992. Splitting costs 2 addresses per subnet compared with one /22's 1,022 usable hosts.",
    optionExplanations: ["Correct.", "That's the unsplit /22.", "4 borrowed bits give 16 subnets.", "That's too many subnets."]
  },
  {
    id: "cn-ip-036", subject: "networks", subtopic: "IP Addressing & Subnetting", difficulty: "easy", type: "concept",
    question: "What does the subnet mask do on a host?",
    options: ["Encrypts traffic", "Chooses the DNS server", "Assigns MAC addresses", "Tells the host which part of an IP address is the network part, so it can decide whether a destination is on its local subnet (send directly) or remote (send to the default gateway)"],
    answer: 3,
    explanation: "The host ANDs its address and the destination with the mask; if the network parts match, the destination is local.",
    optionExplanations: ["Masks don't encrypt.", "DNS is configured separately.", "MACs are hardware addresses.", "Correct."]
  }
);
