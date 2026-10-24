/* Computer Networks — OSI & TCP/IP Models */
window.QUESTIONS.push(
  {
    id: "cn-models-001", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "What is the correct order of the OSI layers from bottom (1) to top (7)?",
    options: ["Physical, Network, Data Link, Transport, Session, Presentation, Application", "Physical, Data Link, Transport, Network, Presentation, Session, Application", "Physical, Data Link, Network, Transport, Session, Presentation, Application", "Application, Presentation, Session, Transport, Network, Data Link, Physical"],
    answer: 2,
    explanation: "Bottom-up mnemonic: 'Please Do Not Throw Sausage Pizza Away' (Physical, Data Link, Network, Transport, Session, Presentation, Application). Top-down: 'All People Seem To Need Data Processing'.",
    optionExplanations: ["Data Link (2) comes before Network (3).", "Network (3) is below Transport (4), and Session (5) is below Presentation (6).", "Correct.", "That's the top-down order."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-models-002", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Why are network protocols organised into layers?",
    options: ["To make packets larger", "Each layer offers services to the layer above and uses the layer below, so layers can be designed, implemented and replaced independently (modularity, abstraction and interoperability between vendors)", "To encrypt every packet", "Because hardware requires seven layers"],
    answer: 1,
    explanation: "For example, HTTP doesn't care whether the bits travel over Wi-Fi or fibre, and Ethernet doesn't care whether it carries IPv4 or IPv6. The costs are some header overhead and occasional duplicated functionality.",
    optionExplanations: ["Layering adds headers but that's a cost, not the goal.", "Correct.", "Encryption is one optional function.", "Layer counts are a design choice."]
  },
  {
    id: "cn-models-003", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Which OSI layer is responsible for end-to-end (process-to-process) delivery, segmentation, reliability and flow control?",
    options: ["Network layer", "Session layer", "Data link layer", "Transport layer"],
    answer: 3,
    explanation: "Layer 4 (TCP/UDP) delivers data between processes on two hosts using port numbers. The network layer (3) delivers packets host-to-host across networks; the data link layer (2) delivers frames across a single link (hop-to-hop).",
    optionExplanations: ["The network layer handles host-to-host routing.", "The session layer manages dialogues.", "Data link works hop by hop.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-models-004", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "What is the PDU (protocol data unit) name at the transport, network and data link layers respectively (with TCP)?",
    options: ["Frame, packet, segment", "Packet, frame, bit", "Segment, packet (datagram), frame", "Message, segment, packet"],
    answer: 2,
    explanation: "Application: data/message; Transport: segment (TCP) or datagram (UDP); Network: packet (IP datagram); Data link: frame; Physical: bits.",
    optionExplanations: ["Reversed.", "The network layer's PDU is the packet; frames are layer 2.", "Correct.", "These are shifted one layer up."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-models-005", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Which OSI layer handles data translation, encryption and compression (e.g. character encoding, TLS-style transformations in the model)?",
    options: ["Presentation", "Session", "Application", "Transport"],
    answer: 0,
    explanation: "Layer 6 (Presentation) deals with syntax and representation: encoding (ASCII/UTF-8), serialisation, compression, encryption. In the TCP/IP world these functions are folded into the application (or into libraries like TLS).",
    optionExplanations: ["Correct.", "Session manages dialogs and checkpoints.", "The application layer provides network services to programs.", "Transport delivers segments between processes."]
  },
  {
    id: "cn-models-006", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "What does the OSI session layer do?",
    options: ["Establishes, manages and terminates dialogues between applications, including dialogue control (half/full duplex) and synchronisation checkpoints for recovery", "Routes packets", "Converts data formats", "Detects bit errors"],
    answer: 0,
    explanation: "Checkpoints let a long transfer resume from the last sync point after a failure rather than from the beginning. In TCP/IP, these responsibilities are handled by applications or protocols like RPC frameworks.",
    optionExplanations: ["Correct.", "That's the network layer.", "That's the presentation layer.", "That's the data link layer."]
  },
  {
    id: "cn-models-007", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Which are the layers of the TCP/IP (Internet) model in its common 4-layer form?",
    options: ["Physical, Data Link, Network, Transport", "Physical, Session, Presentation, Application", "Link (Network Access), Internet, Transport, Application", "Network, Transport, Session, Application"],
    answer: 2,
    explanation: "The TCP/IP model merges OSI's physical + data link into Link and session + presentation + application into Application. Many textbooks use a 5-layer hybrid: Physical, Data Link, Network, Transport, Application.",
    optionExplanations: ["That omits the application layer.", "Those are mostly OSI's upper layers.", "Correct.", "Session isn't a TCP/IP layer."]
  },
  {
    id: "cn-models-008", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "Which statement best contrasts the OSI model and the TCP/IP model?",
    options: ["OSI is a generic 7-layer reference model defined before its protocols (model first); TCP/IP grew out of working protocols (protocols first) and has 4–5 layers; the Internet runs on TCP/IP while OSI is used mainly for teaching and terminology", "OSI is what the Internet actually runs", "TCP/IP has more layers than OSI", "They're identical"],
    answer: 0,
    explanation: "We still say 'layer 2 switch' or 'layer 7 load balancer' using OSI numbering, even though the protocols are TCP/IP. OSI's distinctions (e.g. presentation vs application) are useful conceptually but don't map cleanly onto real protocols.",
    optionExplanations: ["Correct.", "The Internet uses the TCP/IP suite.", "TCP/IP has fewer layers.", "Their origins and structure differ."]
  },
  {
    id: "cn-models-009", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Which device operates primarily at which layer? Hub, switch, router.",
    options: ["Hub L3, switch L2, router L1", "Hub L1 (physical), switch L2 (data link, MAC addresses), router L3 (network, IP addresses)", "All operate at L2", "Hub L2, switch L3, router L4"],
    answer: 1,
    explanation: "A hub (or repeater) simply regenerates bits on all ports. A switch (or bridge) forwards frames by MAC address. A router forwards packets between networks by IP address. Multilayer switches and load balancers can work at L3/L4/L7.",
    optionExplanations: ["Reversed.", "Correct.", "They work at different layers.", "Shifted up by one layer."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-models-010", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Which address types are used at the transport, network and data link layers?",
    options: ["MAC, IP, port", "Hostname, port, IP", "IP, MAC, port", "Port number, IP address, MAC address"],
    answer: 3,
    explanation: "Ports identify processes/applications on a host (L4), IP addresses identify hosts/interfaces across networks (L3), and MAC addresses identify network interfaces on the local link (L2). Hostnames are resolved to IPs by DNS at the application layer.",
    optionExplanations: ["Reversed.", "Hostnames aren't used for forwarding.", "The order is shuffled.", "Correct."]
  },
  {
    id: "cn-models-011", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "As a packet travels from a laptop through two routers to a web server, which addresses in its headers change at each hop (ignoring NAT)?",
    options: ["The source and destination MAC addresses change at every hop (each link uses its own L2 addressing), while the source and destination IP addresses stay the same end to end", "The source and destination IP addresses", "Nothing changes", "The port numbers change at every router"],
    answer: 0,
    explanation: "Each router strips the incoming frame, decides the next hop from the destination IP, and builds a new frame addressed to the next hop's MAC. IP is end-to-end; MAC is hop-to-hop. (NAT devices do rewrite IPs/ports.)",
    optionExplanations: ["Correct.", "IP addresses stay the same without NAT.", "Layer 2 headers are rebuilt per hop.", "Routers don't change ports (NAT does)."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-models-012", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "What is encapsulation in a layered network stack?",
    options: ["Encrypting packets", "Each layer adds its own header (and sometimes a trailer) around the data passed down from the layer above; the receiver strips them in reverse order (decapsulation)", "Compressing data", "Combining several packets into one"],
    answer: 1,
    explanation: "HTTP data → TCP segment (TCP header + data) → IP packet (IP header + segment) → Ethernet frame (Ethernet header + packet + FCS trailer) → bits on the wire.",
    optionExplanations: ["Encryption is optional and separate.", "Correct.", "Compression is separate.", "That's aggregation, not encapsulation."]
  },
  {
    id: "cn-models-013", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "numerical",
    question: "An application sends 1,000 bytes of data. The transport, network and data link layers each add a 20-byte header, and the data link layer also adds a 4-byte trailer. What fraction of the transmitted frame is overhead?",
    options: ["About 6.0%", "About 6.4%", "About 4.0%", "About 8.0%"],
    answer: 0,
    explanation: "Overhead = 3 × 20 + 4 = 64 bytes; frame size = 1,000 + 64 = 1,064 bytes. Overhead fraction = 64 / 1,064 ≈ 0.060, i.e. about 6.0%. Note the denominator is the whole frame, not just the payload.",
    optionExplanations: ["Correct.", "That divides by the payload (64 / 1,000) instead of the frame size.", "That ignores two of the headers.", "That's more overhead than the headers add."]
  },
  {
    id: "cn-models-014", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "At which layer do these protocols belong: HTTP, TCP, IP, Ethernet?",
    options: ["Application, Transport, Network, Data link", "Transport, Network, Data link, Physical", "Application, Network, Transport, Physical", "Session, Transport, Network, Data link"],
    answer: 0,
    explanation: "HTTP/DNS/SMTP are application protocols; TCP/UDP are transport; IP (and ICMP, routing protocols' payloads) network; Ethernet/Wi-Fi (802.11) data link (with physical-layer specs too).",
    optionExplanations: ["Correct.", "Each is shifted down one layer.", "TCP and IP are swapped.", "HTTP is an application protocol."]
  },
  {
    id: "cn-models-015", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "hard", type: "concept",
    question: "ARP and ICMP are often called 'layer 2.5' and 'layer 3' helpers. Which statement about their placement is most accurate?",
    options: ["Both are application-layer protocols", "ARP runs over TCP", "ICMP is part of the network layer (carried inside IP packets, protocol number 1); ARP maps IP to MAC addresses and is carried directly in Ethernet frames (EtherType 0x0806), sitting between layers 2 and 3", "ICMP runs over UDP"],
    answer: 2,
    explanation: "ICMP messages are encapsulated in IP but serve the network layer (error reporting, diagnostics). ARP isn't carried in IP at all; it supports the network layer by resolving next-hop MAC addresses. Questions about 'which layer' for these protocols are classic traps.",
    optionExplanations: ["Neither is an application protocol.", "ARP isn't carried over IP or TCP.", "Correct.", "ICMP is carried directly in IP."],
    tags: ["trap"]
  },
  {
    id: "cn-models-016", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "hard", type: "concept",
    question: "Which layer does TLS belong to?",
    options: ["Strictly the transport layer, replacing TCP", "It doesn't fit cleanly: it runs on top of TCP (transport) and below HTTP, providing presentation/session-like functions (encryption, authentication); in the TCP/IP model it's usually treated as part of the application layer", "The network layer", "The data link layer"],
    answer: 1,
    explanation: "The name 'Transport Layer Security' is historical. TLS needs a reliable byte stream (TCP), while DTLS and QUIC provide similar security over UDP. Interviewers accept the nuanced answer: between transport and application.",
    optionExplanations: ["TLS runs over TCP; it doesn't replace it.", "Correct.", "IPsec, not TLS, works at the network layer.", "TLS is far above layer 2."]
  },
  {
    id: "cn-models-017", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "What does it mean that each layer communicates 'logically' with its peer layer?",
    options: ["Layers talk directly over the wire", "Each layer behaves as if it talks to the same layer on the remote host using its protocol (e.g. TCP to TCP via headers), while the actual data passes down the local stack, across the physical medium, and up the remote stack", "Layers never exchange information", "Only the physical layer has a protocol"],
    answer: 1,
    explanation: "Horizontal (peer-to-peer) communication is defined by protocols; vertical communication between adjacent layers on one host is defined by service interfaces (e.g. the sockets API between application and transport).",
    optionExplanations: ["Only the physical layer touches the medium.", "Correct.", "Peers exchange header information.", "Every layer has protocols."]
  },
  {
    id: "cn-models-018", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "Error control and flow control appear in both the data link and transport layers. What's the difference?",
    options: ["There's no difference", "Data link control works per LINK (hop-to-hop, between adjacent nodes); transport control works END-TO-END between the communicating hosts, catching problems (e.g. losses inside routers) that link-level checks can't see", "Transport layer controls only physical errors", "Data link layer controls only routing"],
    answer: 1,
    explanation: "A packet can pass every link's CRC check and still be dropped in a congested router queue. Only the end-to-end transport layer (TCP) can guarantee delivery to the application — a classic 'end-to-end argument' example.",
    optionExplanations: ["Their scopes differ.", "Correct.", "Transport handles end-to-end issues.", "Routing is the network layer's job."]
  },
  {
    id: "cn-models-019", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "How do connection-oriented and connectionless services differ?",
    options: ["They're the same", "Connectionless services are always reliable", "Connection-oriented services set up a connection before data transfer and tear it down afterwards (e.g. TCP); connectionless services send each message independently without setup (e.g. UDP, IP)", "Connection-oriented services can't be used on the Internet"],
    answer: 2,
    explanation: "Connection-oriented doesn't automatically mean reliable (and vice versa), but TCP combines both. Connectionless designs have lower latency for small exchanges, such as a DNS query.",
    optionExplanations: ["Their setup differs.", "IP and UDP are connectionless and unreliable.", "Correct.", "TCP is connection-oriented and ubiquitous."]
  },
  {
    id: "cn-models-020", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "numerical",
    question: "How many links are needed to connect 6 devices in a full mesh, and how many ports does each device need?",
    options: ["6 links, 1 port each", "12 links, 2 ports each", "30 links, 6 ports each", "15 links, 5 ports each"],
    answer: 3,
    explanation: "A full mesh has a dedicated link between every pair: n(n − 1)/2 = 6 × 5 / 2 = 15 links. Each device connects to the other n − 1 = 5 devices. A star needs only n links (one per device to the hub/switch).",
    optionExplanations: ["That's a star or ring.", "That's not a full mesh.", "That counts each link twice.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-models-021", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Which topology connects every device to a central switch, so a single cable failure affects only one device, but the central device is a single point of failure?",
    options: ["Bus", "Mesh", "Ring", "Star"],
    answer: 3,
    explanation: "Star topology is the norm in modern Ethernet LANs. A bus shares one backbone cable (a break disrupts everything), a ring passes data around a loop, and a mesh offers redundant paths at high cabling cost.",
    optionExplanations: ["A bus uses one shared cable.", "A mesh connects devices to many others.", "A ring connects devices in a loop.", "Correct."]
  },
  {
    id: "cn-models-022", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Which transmission mode allows data to flow in both directions, but only one direction at a time?",
    options: ["Simplex", "Full-duplex", "Half-duplex", "Multiplex"],
    answer: 2,
    explanation: "Simplex is one-way only (keyboard to computer, broadcast TV). Half-duplex is two-way alternating (walkie-talkies, classic hub-based Ethernet, Wi-Fi on one channel). Full-duplex is simultaneous two-way (telephone calls, switched Ethernet).",
    optionExplanations: ["Simplex is one-way only.", "Full-duplex is simultaneous.", "Correct.", "Multiplexing shares a medium among signals."]
  },
  {
    id: "cn-models-023", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Order these networks by geographic scope from smallest to largest: LAN, WAN, PAN, MAN.",
    options: ["LAN, PAN, MAN, WAN", "LAN, MAN, PAN, WAN", "PAN, MAN, LAN, WAN", "PAN, LAN, MAN, WAN"],
    answer: 3,
    explanation: "PAN (personal: Bluetooth around one person) < LAN (a building or campus) < MAN (a city) < WAN (countries/continents; the Internet is the largest WAN).",
    optionExplanations: ["A PAN is smaller than a LAN.", "A PAN is the smallest.", "A LAN is smaller than a MAN.", "Correct."]
  },
  {
    id: "cn-models-024", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "How do unicast, broadcast, multicast and anycast differ?",
    options: ["They're all the same", "Unicast: one sender to one receiver. Broadcast: to all hosts on a network. Multicast: to a group of interested receivers. Anycast: to the 'nearest' of several hosts sharing the same address", "Anycast sends to every host", "Multicast is used only in IPv6"],
    answer: 1,
    explanation: "Anycast is widely used by DNS root servers and CDNs: the same IP is announced from many locations and routing delivers traffic to the closest. IPv6 has no broadcast; it uses multicast instead.",
    optionExplanations: ["They have different delivery semantics.", "Correct.", "That's broadcast.", "IPv4 supports multicast too (224.0.0.0/4)."]
  },
  {
    id: "cn-models-025", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "How does packet switching differ from circuit switching?",
    options: ["Circuit switching reserves a dedicated path and bandwidth for the whole call (predictable but wasteful when idle, e.g. the old telephone network); packet switching splits data into packets that share links on demand (efficient, but delays and losses vary under load, e.g. the Internet)", "They're identical", "Packet switching reserves bandwidth", "Circuit switching splits data into packets"],
    answer: 0,
    explanation: "Packet switching uses statistical multiplexing: bursty users share capacity. Message switching (store-and-forward of whole messages) is an older, less efficient approach.",
    optionExplanations: ["Correct.", "Their resource models differ.", "That's circuit switching.", "That's packet switching."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-models-026", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "hard", type: "numerical",
    question: "A link has 1 Mbps capacity. Each user transmits at 100 kbps but is active only 10% of the time. How many users can circuit switching support, and why can packet switching support far more (e.g. 35 users) with low risk of overload?",
    options: ["10 users with circuits; with 35 users, the probability that more than 10 are active at once is very small (≈ 0.0004), thanks to statistical multiplexing", "35 users with circuits too", "100 users with circuits", "1 user with circuits"],
    answer: 0,
    explanation: "Circuit switching reserves 100 kbps per user: 1 Mbps / 100 kbps = 10 users. With packet switching, users share capacity on demand; with 35 users each active with probability 0.1, more than 10 simultaneous senders is extremely unlikely (binomial tail ≈ 0.0004). This is the classic Kurose & Ross example.",
    optionExplanations: ["Correct.", "Circuits reserve peak bandwidth for each user.", "That ignores the 100 kbps per user.", "Each circuit uses only 100 kbps."]
  },
  {
    id: "cn-models-027", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "How do datagram networks differ from virtual-circuit networks?",
    options: ["They're identical", "Virtual circuits are connectionless", "Datagram networks (like IP) route each packet independently using the destination address, with no per-connection state in routers; virtual-circuit networks (ATM, Frame Relay, MPLS paths) set up a path first, and routers keep per-circuit state and forward by circuit identifier", "Datagram networks reserve bandwidth"],
    answer: 2,
    explanation: "Datagrams of the same flow may take different routes and arrive out of order; routers stay simple and robust. Virtual circuits enable QoS reservations but require setup and state.",
    optionExplanations: ["Their forwarding models differ.", "Virtual circuits require setup.", "Correct.", "Datagram networks don't reserve resources."]
  },
  {
    id: "cn-models-028", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "A firewall rule blocks TCP port 22 traffic. At which OSI layer is this firewall inspecting traffic, at minimum?",
    options: ["Layer 2", "Layer 7 only", "Layer 4 (transport), since port numbers are in TCP/UDP headers", "Layer 1"],
    answer: 2,
    explanation: "Packet filters work at layers 3–4 (IP addresses, protocols, ports). Application-layer (layer 7) firewalls and WAFs inspect content such as HTTP paths or SQL in requests.",
    optionExplanations: ["MAC filtering is layer 2.", "Port filtering doesn't require layer-7 inspection.", "Correct.", "Layer 1 deals with signals."]
  },
  {
    id: "cn-models-029", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "hard", type: "numerical",
    question: "A 1,460-byte application payload is sent with TCP (20-byte header), IPv4 (20-byte header) and Ethernet (14-byte header + 4-byte FCS, plus 8-byte preamble and 12-byte inter-frame gap on the wire). What is the payload efficiency on the wire?",
    options: ["About 97.5%", "About 90.0%", "About 99.0%", "About 94.9%"],
    answer: 3,
    explanation: "Bytes on the wire = 1,460 + 20 + 20 + 14 + 4 + 8 + 12 = 1,538. Efficiency = 1,460 / 1,538 ≈ 94.9%. That's why a 1 Gbps link delivers at most ~949 Mbps of TCP goodput with standard frames.",
    optionExplanations: ["That ignores the preamble and inter-frame gap.", "Too low for full-size frames.", "Too high: 78 bytes of overhead per frame.", "Correct."]
  },
  {
    id: "cn-models-030", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "easy", type: "concept",
    question: "Which layer is responsible for routing packets between different networks and logical (IP) addressing?",
    options: ["Data link", "Session", "Transport", "Network"],
    answer: 3,
    explanation: "Layer 3 chooses paths through interconnected networks and handles logical addressing and fragmentation. Routers are the characteristic layer-3 devices.",
    optionExplanations: ["Data link moves frames across one link.", "Session manages dialogues.", "Transport handles end-to-end delivery between processes.", "Correct."]
  },
  {
    id: "cn-models-031", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "medium", type: "concept",
    question: "What do the physical and data link layers each handle?",
    options: ["Both handle routing", "Data link converts bits to voltages", "Physical handles MAC addresses", "Physical: transmission of raw bits over the medium (voltages, light, radio; connectors; bit rate). Data link: framing, MAC addressing, error detection (CRC) and medium access control on a single link"],
    answer: 3,
    explanation: "The data link layer is often split into LLC (logical link control: interface to the network layer) and MAC (medium access control: who transmits when, addressing).",
    optionExplanations: ["Routing is layer 3.", "That's the physical layer.", "MAC addresses are layer 2.", "Correct."]
  },
  {
    id: "cn-models-032", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "hard", type: "concept",
    question: "A user's browser shows 'Connection timed out' to a website, but `ping` to the server's IP works. Which layer is most likely at fault, and why?",
    options: ["Physical layer: the cable is unplugged", "Above the network layer: ICMP reaches the host (layers 1–3 work), but the TCP connection to port 443 fails, e.g. a firewall blocking the port or the web service not listening", "Data link layer: wrong MAC address", "The ping proves the website is fine"],
    answer: 1,
    explanation: "Troubleshooting bottom-up: a successful ping shows physical, data link and IP routing work. Next test the transport layer: `nc -vz host 443` or `curl -v`, and check firewalls/security groups and whether the service is running.",
    optionExplanations: ["Ping wouldn't work without connectivity.", "Correct.", "Layer 2 problems would break ping too.", "Ping uses ICMP, not the web server's TCP port."]
  },
  {
    id: "cn-models-033", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "hard", type: "concept",
    question: "A packet goes from host A through a switch, then a router, then another switch, to host B. Up to which layer does each device process it?",
    options: ["Every device processes all 7 layers", "Switches up to layer 3, router up to layer 4", "Switches up to layer 2 (read the MAC header), the router up to layer 3 (reads the IP header, decrements TTL, rebuilds the frame), and host B up through all layers to the application", "Only host B processes anything"],
    answer: 2,
    explanation: "Intermediate devices only go as high as needed to forward: switches use frame headers, routers use packet headers. Middleboxes like NAT gateways, stateful firewalls and L7 load balancers deliberately look higher, which is why they can break protocols that assume end-to-end transparency.",
    optionExplanations: ["Forwarding devices don't need upper layers.", "Plain switches don't read IP headers; plain routers don't read TCP headers.", "Correct.", "Every forwarding device inspects some headers."]
  },
  {
    id: "cn-models-034", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "hard", type: "concept",
    question: "In a VPN or GRE tunnel, an entire IP packet is carried as the payload of another IP packet. What does this show about layering?",
    options: ["Layering isn't strictly linear: a protocol can be encapsulated inside the same (or a lower) layer — e.g. IP-in-IP, or Ethernet frames inside UDP (VXLAN) — giving an overlay network whose inner headers are hidden from the underlay routers", "Tunnels violate IP and can't work", "Tunnels remove the inner IP header", "Encapsulation only happens once per layer"],
    answer: 0,
    explanation: "Overlays power VPNs, cloud virtual networks (VXLAN, Geneve) and container networking. The cost is extra header overhead, which reduces the effective MTU and can cause fragmentation if not accounted for.",
    optionExplanations: ["Correct.", "Tunnels are widely used.", "The inner header is preserved inside the payload.", "Tunnels encapsulate the same layer again."]
  },
  {
    id: "cn-models-035", subject: "networks", subtopic: "OSI & TCP/IP Models", difficulty: "hard", type: "concept",
    question: "The 'end-to-end argument' in network design says what?",
    options: ["Every router should guarantee reliable delivery", "Functions like reliability or security can only be completely implemented with knowledge at the communicating endpoints, so the network core should stay simple (best-effort IP), with such functions placed in the end hosts; in-network versions are at most performance optimisations", "Networks should use circuit switching", "Only the physical layer matters"],
    answer: 1,
    explanation: "Even if every link were reliable, data could be corrupted in a router's memory or lost in a crash, so the endpoints must still check (e.g. TCP checksums and acknowledgements, application-level hashes). This principle shaped the Internet's 'dumb network, smart edges' architecture.",
    optionExplanations: ["That's the opposite of the argument.", "Correct.", "It's unrelated to switching style.", "Higher layers matter most for these functions."]
  }
);
