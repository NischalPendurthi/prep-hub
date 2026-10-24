/* Computer Networks — Routing Algorithms & Protocols */
window.QUESTIONS.push(
  {
    id: "cn-routing-001", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "easy", type: "concept",
    question: "What's the difference between static and dynamic routing?",
    options: ["They're the same", "Static routing is used only on the Internet backbone", "Static routes are configured manually and don't adapt to failures (simple, predictable, good for small networks or default routes); dynamic routing protocols (RIP, OSPF, BGP) exchange information and recompute routes automatically when topology changes", "Dynamic routing requires no configuration at all"],
    answer: 2,
    explanation: "Small branch offices often use one static default route to their ISP; enterprises and ISPs run dynamic protocols for resilience and scale.",
    optionExplanations: ["Their adaptability differs.", "The backbone uses BGP, a dynamic protocol.", "Correct.", "Dynamic protocols still need configuration."]
  },
  {
    id: "cn-routing-002", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "easy", type: "concept",
    question: "What is a default route (0.0.0.0/0)?",
    options: ["A route to the loopback address", "The route with the highest priority", "The route used when no more specific route matches — typically pointing to the gateway towards the Internet; being /0, it matches every address but loses every longest-prefix comparison", "A route that drops all packets"],
    answer: 2,
    explanation: "Hosts use a default gateway in the same way. Routers without a default route drop packets for unknown destinations and return ICMP Destination Unreachable.",
    optionExplanations: ["Loopback is 127/8.", "It has the lowest specificity.", "Correct.", "That would be a null route."]
  },
  {
    id: "cn-routing-003", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "easy", type: "concept",
    question: "How does a distance-vector routing protocol work?",
    options: ["Each router floods its links to everyone and runs Dijkstra", "A central controller computes all routes", "Each router periodically sends its whole distance table (cost to each destination) to its DIRECT NEIGHBOURS; each router updates its costs using Bellman-Ford: D(x→y) = min over neighbours v of [c(x,v) + Dv(y)]", "Routers learn routes from DNS"],
    answer: 2,
    explanation: "Distance-vector ('routing by rumour') routers know only what neighbours tell them, not the full topology. RIP is the classic example.",
    optionExplanations: ["That's link-state.", "That's SDN.", "Correct.", "DNS doesn't provide routes."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-routing-004", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "numerical",
    question: "Router X has neighbours A (link cost 2) and B (link cost 5). A advertises cost 7 to destination D; B advertises cost 3 to D. What is X's cost to D and its next hop?",
    options: ["7 via A", "8 via B", "9 via A", "3 via B"],
    answer: 1,
    explanation: "Bellman-Ford: via A = 2 + 7 = 9; via B = 5 + 3 = 8. The minimum is 8, so the next hop is B even though the link to A is cheaper.",
    optionExplanations: ["The link cost to A must be added.", "Correct.", "The route via B is cheaper overall.", "The link cost to B must be added."]
  },
  {
    id: "cn-routing-005", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "What is the count-to-infinity problem?",
    options: ["Routers counting packets forever", "A DNS caching issue", "A loop in Dijkstra's algorithm", "In distance-vector routing, after a link fails, neighbours keep advertising stale routes through each other, so their costs to the unreachable destination increase slowly one step at a time ('bad news travels slowly') until they reach 'infinity'"],
    answer: 3,
    explanation: "Example: A–B–C, and the B–C link fails. B hears A advertise 'C at cost 2' (which goes through B!) and updates to 3; A then updates to 4, and so on. Good news (a cheaper route) propagates quickly; bad news slowly.",
    optionExplanations: ["It's about routing costs.", "DNS is unrelated.", "Link-state routing with Dijkstra doesn't suffer from it.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-routing-006", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "Which techniques mitigate count-to-infinity in distance-vector protocols?",
    options: ["Using larger packets", "Increasing the TTL", "Encryption", "Split horizon (don't advertise a route back to the neighbour you learned it from), poison reverse (advertise it back with infinite cost), hold-down timers, triggered updates, and a small 'infinity' (RIP uses 16)"],
    answer: 3,
    explanation: "Split horizon with poison reverse fixes two-node loops but not loops involving three or more routers; the maximum metric bounds how long counting can last.",
    optionExplanations: ["Packet size is unrelated.", "TTL limits packet lifetime, not route counting.", "Encryption doesn't affect routing logic.", "Correct."]
  },
  {
    id: "cn-routing-007", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "easy", type: "concept",
    question: "How does link-state routing (e.g. OSPF) work?",
    options: ["Routers only talk to neighbours about distances", "Routes are configured manually", "Routers ask a central server", "Every router floods link-state advertisements (its directly connected links and costs) to ALL routers in the area, so each builds the complete topology map and computes shortest paths itself with Dijkstra's algorithm"],
    answer: 3,
    explanation: "Because each router has the full map, link-state converges faster and doesn't suffer count-to-infinity, at the cost of more memory and CPU and the flooding overhead.",
    optionExplanations: ["That's distance-vector.", "That's static routing.", "That's centralised/SDN routing.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-routing-008", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "numerical",
    question: "Links: A–B 2, A–C 5, B–C 1, B–D 4, C–D 1, C–E 3, D–F 2, E–F 1. Using Dijkstra from A, what are the shortest distances to D and to F?",
    options: ["D 6, F 8", "D 4, F 6", "D 4, F 7", "D 5, F 6"],
    answer: 1,
    explanation: "Settle nodes in order: A 0; B 2; C 3 (via B, cheaper than direct 5); D 4 (A–B–C–D); E 6 (A–B–C–E); F 6 via D (4 + 2), beating via E (6 + 1 = 7).",
    optionExplanations: ["The direct A–C link isn't on the shortest paths.", "Correct.", "F via D costs 6.", "D via C costs 2 + 1 + 1 = 4."]
  },
  {
    id: "cn-routing-009", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "hard", type: "numerical",
    question: "Same graph (A–B 2, A–C 5, B–C 1, B–D 4, C–D 1, C–E 3, D–F 2, E–F 1). In what order does Dijkstra from A settle (finalise) the nodes, and what is the shortest path to F?",
    options: ["A, B, C, D, E, F; path A–B–C–D–F", "A, C, B, D, E, F; path A–C–E–F", "A, B, D, C, F, E; path A–B–D–F", "A, B, C, E, D, F; path A–B–C–E–F"],
    answer: 0,
    explanation: "Dijkstra always settles the unsettled node with the smallest tentative distance: A (0), B (2), C (3), D (4), then E (6) and F (6) tie (settled in either order). F's predecessor is D, so the path is A–B–C–D–F with cost 6.",
    optionExplanations: ["Correct.", "C (5 directly) is improved to 3 via B and settled after B.", "D's best cost is 4 via C, not via B (6).", "A–B–C–E–F costs 7."]
  },
  {
    id: "cn-routing-010", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "Which statement contrasts distance-vector and link-state routing correctly?",
    options: ["Distance-vector knows the whole topology", "They converge at the same speed", "Link-state uses Bellman-Ford", "Link-state: global topology knowledge, flooding of small updates to all routers, fast convergence, more CPU/memory. Distance-vector: local knowledge only, periodic table exchange with neighbours, slower convergence and possible count-to-infinity"],
    answer: 3,
    explanation: "Robustness differs too: in DV, one router's wrong advertisement spreads through the network; in LS, each router computes its own table, so errors stay more localised.",
    optionExplanations: ["That's link-state.", "Link-state usually converges faster.", "Link-state uses Dijkstra.", "Correct."]
  },
  {
    id: "cn-routing-011", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "easy", type: "concept",
    question: "Which facts describe RIP (Routing Information Protocol)?",
    options: ["Link-state, uses bandwidth as cost", "Distance-vector, metric = hop count, maximum 15 hops (16 = unreachable), periodic updates every 30 seconds, runs over UDP port 520", "Path-vector between autonomous systems over TCP 179", "Runs directly over IP with protocol number 89"],
    answer: 1,
    explanation: "RIP is simple but suits only small networks: hop count ignores link speed, and slow convergence plus the 15-hop limit restrict its scale. RIPv2 adds subnet masks (classless) and authentication.",
    optionExplanations: ["That's closer to OSPF.", "Correct.", "That's BGP.", "That's OSPF."]
  },
  {
    id: "cn-routing-012", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "Which facts describe OSPF?",
    options: ["Distance-vector with a 15-hop limit", "Link-state IGP using Dijkstra, cost based on link bandwidth, hierarchical areas connected to backbone area 0, fast convergence, runs directly over IP (protocol 89)", "Used between ISPs", "Runs over TCP port 179"],
    answer: 1,
    explanation: "Areas limit flooding and SPF computations: routers within an area share a detailed map; area border routers summarise routes between areas.",
    optionExplanations: ["That's RIP.", "Correct.", "Between ISPs, BGP is used.", "That's BGP."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-routing-013", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "What is BGP, and what makes it different from OSPF/RIP?",
    options: ["An intra-domain protocol based on hop count", "The Internet's inter-domain (exterior gateway) protocol between autonomous systems; it's a path-vector protocol over TCP port 179 that advertises full AS paths and chooses routes based on POLICY (business relationships), not just shortest distance", "A link-state protocol for LANs", "A DNS replacement"],
    answer: 1,
    explanation: "Including the AS path lets BGP detect loops (reject routes containing your own AS number). eBGP runs between ASes; iBGP distributes external routes inside one AS. BGP misconfigurations or hijacks can disrupt large parts of the Internet.",
    optionExplanations: ["That's RIP's characteristics.", "Correct.", "BGP works between ASes.", "BGP carries routes, not names."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-routing-014", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "easy", type: "concept",
    question: "What is an Autonomous System (AS)?",
    options: ["A self-driving router", "A DNS zone", "A single LAN", "A network or group of networks under a single administrative control with a unified routing policy (e.g. an ISP, a large company or a cloud provider), identified by an AS number"],
    answer: 3,
    explanation: "Inside an AS, an interior gateway protocol (IGP) such as OSPF or IS-IS is used; between ASes, the exterior gateway protocol BGP is used.",
    optionExplanations: ["Not related.", "DNS zones are about names.", "An AS can contain thousands of LANs.", "Correct."]
  },
  {
    id: "cn-routing-015", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "Why does the Internet use hierarchical routing (IGPs within ASes, BGP between them) instead of one global link-state protocol?",
    options: ["It's historical accident only", "OSPF can't run on the Internet", "BGP is faster than OSPF", "Scale (billions of hosts and ~1 million prefixes would overwhelm flooding and Dijkstra), administrative autonomy (each organisation runs its own network) and policy (ASes choose routes for business reasons, not just shortest paths)"],
    answer: 3,
    explanation: "Hierarchy also enables route aggregation: an AS advertises a few summarised prefixes rather than every internal subnet.",
    optionExplanations: ["There are strong technical reasons.", "OSPF runs inside ASes on the Internet.", "Speed isn't the reason.", "Correct."]
  },
  {
    id: "cn-routing-016", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "hard", type: "concept",
    question: "A router learns a route to 10.1.0.0/16 from both OSPF and RIP. Which does it install, and why?",
    options: ["RIP, because it has fewer hops", "Both, alternately", "OSPF, because routers prefer the source with lower administrative distance (Cisco defaults: OSPF 110, RIP 120; static 1; connected 0); metrics from different protocols can't be compared directly", "Neither"],
    answer: 2,
    explanation: "Administrative distance ranks trustworthiness of route sources. Longest prefix match still comes first: a more specific route always wins regardless of source.",
    optionExplanations: ["Hop counts can't be compared with OSPF costs.", "Only the preferred source is installed (unless equal-cost multipath within one protocol).", "Correct.", "One route is installed."]
  },
  {
    id: "cn-routing-017", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "During routing convergence, a transient loop can make packets circulate between routers. What prevents them from circulating forever?",
    options: ["The IP TTL / IPv6 Hop Limit: each hop decrements it, and the packet is discarded when it reaches 0", "The checksum", "The MAC address", "DNS caching"],
    answer: 0,
    explanation: "Loops still waste bandwidth until routing converges, but TTL guarantees each looping packet eventually dies (and ICMP Time Exceeded is returned).",
    optionExplanations: ["Correct.", "Checksums detect corruption.", "MACs change per hop.", "DNS is unrelated."]
  },
  {
    id: "cn-routing-018", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "What is flooding as a routing technique, and how is infinite flooding prevented?",
    options: ["Forwarding every incoming packet on all links except the one it arrived on; duplicates are suppressed with sequence numbers (forward each packet only once) or a hop counter", "Sending each packet on one random link", "Sending packets only to the default gateway", "Dropping all broadcast packets"],
    answer: 0,
    explanation: "Flooding is robust (finds every path) but wasteful. Link-state protocols use reliable flooding with sequence numbers to distribute LSAs to every router.",
    optionExplanations: ["Correct.", "That's random routing.", "That's default routing.", "That isn't flooding."]
  },
  {
    id: "cn-routing-019", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "hard", type: "concept",
    question: "Nodes A–B–C in a line, all link costs 1. A reaches C at cost 2 via B. The B–C link fails. With plain distance-vector (no split horizon), A still advertises 'C at cost 2'. What happens next?",
    options: ["B updates its route to C as 1 + 2 = 3 via A (a route that actually goes through B itself); A then updates to 4 via B, B to 5... the costs count upward until reaching the infinity value", "B immediately marks C unreachable", "A immediately marks C unreachable", "The packets are delivered via a backup path"],
    answer: 0,
    explanation: "This is count-to-infinity in action. With split horizon, A wouldn't advertise C back to B (it learned the route from B), so B would see C as unreachable at once.",
    optionExplanations: ["Correct.", "B trusts A's stale advertisement.", "A only learns slowly through B's increasing costs.", "There's no alternative path in a line."],
    tags: ["trap"]
  },
  {
    id: "cn-routing-020", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "How does multicast routing differ from unicast routing?",
    options: ["It doesn't", "Multicast uses broadcast on every link", "Packets are delivered to a group of receivers along a distribution tree, so each packet crosses each link at most once; hosts join groups with IGMP, and routers build trees with protocols like PIM", "Multicast only works with TCP"],
    answer: 2,
    explanation: "Multicast is efficient for one-to-many streaming within networks (IPTV, market data feeds), but it's rarely available across the public Internet, where CDNs replicate unicast streams instead.",
    optionExplanations: ["The delivery model differs.", "Trees avoid sending to uninterested links.", "Correct.", "Multicast typically uses UDP."]
  },
  {
    id: "cn-routing-021", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "hard", type: "concept",
    question: "In BGP, why would an ISP prefer a LONGER AS path through a customer over a shorter path through a peer or provider?",
    options: ["BGP always picks the longest path", "Peers never accept traffic", "Longer paths are more secure", "Economics: traffic sent via a customer earns money, via a peer is free, and via a provider costs money; BGP's 'local preference' attribute, evaluated before AS-path length, encodes these policies"],
    answer: 3,
    explanation: "BGP's decision process roughly: highest local preference → shortest AS path → lowest origin type → lowest MED → eBGP over iBGP → lowest IGP cost to next hop → tie-breakers. Policy beats distance.",
    optionExplanations: ["AS-path length is only one criterion.", "Peering links carry traffic between the peers' customers.", "Path length isn't a security property.", "Correct."]
  },
  {
    id: "cn-routing-022", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "What does a router's routing table entry typically contain?",
    options: ["Only the destination MAC", "Destination prefix (network/mask), next-hop IP address and/or outgoing interface, metric, and the source of the route (connected, static, OSPF, BGP...)", "The full path of every packet", "Port numbers of applications"],
    answer: 1,
    explanation: "Example `ip route` output: `10.2.0.0/16 via 10.0.0.2 dev eth1 proto ospf metric 20`. The forwarding table derived from it is optimised for fast longest-prefix lookups (tries, TCAM).",
    optionExplanations: ["MACs are resolved separately via ARP.", "Correct.", "Routers only know the next hop.", "Ports are irrelevant to routing."]
  },
  {
    id: "cn-routing-023", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "hard", type: "numerical",
    question: "In the graph A–B 2, A–C 5, B–C 1, B–D 4, C–D 1, C–E 3, D–F 2, E–F 1, the link C–D fails. What is A's new shortest distance to F?",
    options: ["6", "8", "7", "9"],
    answer: 2,
    explanation: "Without C–D: to D, best is A–B–D = 6. To F: via D = 6 + 2 = 8, or via E: A–B–C–E = 6, then E–F 1 → 7. So the new distance is 7 via E.",
    optionExplanations: ["That path used the failed C–D link.", "That's the route via D, which is now longer.", "Correct.", "Recompute A–B–C–E–F = 7."]
  },
  {
    id: "cn-routing-024", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "What's the difference between an IGP and an EGP? Give examples.",
    options: ["An Interior Gateway Protocol routes within one AS (RIP, OSPF, IS-IS, EIGRP); an Exterior Gateway Protocol routes between ASes (BGP is the one in use)", "They're identical", "IGPs run between ISPs", "EGPs run inside LANs"],
    answer: 0,
    explanation: "IGPs optimise technical metrics within a trusted domain; BGP focuses on reachability and policy across independent organisations.",
    optionExplanations: ["Correct.", "They serve different scopes.", "Reversed.", "Reversed."]
  },
  {
    id: "cn-routing-025", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "hard", type: "concept",
    question: "What is a BGP route hijack?",
    options: ["Stealing a router physically", "An AS (maliciously or by mistake) announces IP prefixes it doesn't own, often more specific ones; because routers prefer longer prefixes and BGP trusts announcements, traffic for those addresses is diverted to the wrong AS. RPKI route-origin validation helps prevent it", "A DNS spoofing attack", "A type of DDoS amplification"],
    answer: 1,
    explanation: "Incidents like the 2008 Pakistan Telecom/YouTube event showed how one bad announcement can black-hole global traffic. Filtering customer announcements and RPKI are the main defences.",
    optionExplanations: ["It's a routing-protocol attack.", "Correct.", "DNS spoofing targets name resolution.", "It's about route announcements."]
  },
  {
    id: "cn-routing-026", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "easy", type: "concept",
    question: "Which algorithm does each routing approach use: distance-vector and link-state?",
    options: ["Both use Dijkstra", "Distance-vector uses Dijkstra; link-state uses Bellman-Ford", "Distance-vector uses (distributed) Bellman-Ford; link-state uses Dijkstra's shortest-path algorithm", "Both use Kruskal"],
    answer: 2,
    explanation: "Bellman-Ford fits a distributed setting where each node only knows neighbours' estimates; Dijkstra needs the full graph, which link-state flooding provides.",
    optionExplanations: ["Only link-state uses Dijkstra.", "Reversed.", "Correct.", "Kruskal builds spanning trees, not shortest paths."]
  },
  {
    id: "cn-routing-027", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "OSPF's default cost for an interface is reference bandwidth / interface bandwidth. With a 100 Mbps reference, what's the cost of a 10 Mbps link and of a 1 Gbps link?",
    options: ["10 and 1 (costs can't go below 1)", "10 and 0.1", "1 and 10", "100 and 1000"],
    answer: 0,
    explanation: "100 / 10 = 10. 100 / 1000 = 0.1, but OSPF costs are integers ≥ 1, so 1 Gbps (and 100 Mbps, and 10 Gbps) all get cost 1 — which is why administrators raise the reference bandwidth on modern networks.",
    optionExplanations: ["Correct.", "OSPF costs are integers ≥ 1.", "Faster links get lower costs.", "Costs decrease with bandwidth."]
  },
  {
    id: "cn-routing-028", subject: "networks", subtopic: "Routing Algorithms & Protocols", difficulty: "medium", type: "concept",
    question: "In distance-vector routing, why does 'good news' (a new cheaper route) spread quickly but 'bad news' (a failure) spread slowly?",
    options: ["A cheaper route is adopted immediately by neighbours and propagates one hop per exchange; after a failure, routers keep believing stale, slightly longer alternatives offered by neighbours, so costs increase only gradually", "Because routers prefer good news", "Bad news is sent less often", "Good news uses TCP"],
    answer: 0,
    explanation: "Bellman-Ford's min() operation accepts improvements at once but can be fooled by circular stale information when costs go up.",
    optionExplanations: ["Correct.", "Not a preference mechanism.", "Update frequency is the same.", "Transport isn't the reason."]
  }
);
