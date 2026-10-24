/* Computer Networks — DNS, DHCP, Email & FTP */
window.QUESTIONS.push(
  {
    id: "cn-appproto-001", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "easy", type: "concept",
    question: "What does DNS do?",
    options: ["Assigns IP addresses", "Encrypts web traffic", "Translates human-readable domain names (www.example.com) into IP addresses (and other records) using a distributed, hierarchical database", "Routes packets"],
    answer: 2,
    explanation: "DNS is distributed for scalability and resilience: no single server knows every name. It's often called the Internet's phone book.",
    optionExplanations: ["That's DHCP.", "That's TLS.", "Correct.", "That's routing."]
  },
  {
    id: "cn-appproto-002", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "easy", type: "concept",
    question: "What is the hierarchy of DNS servers involved in resolving www.example.com?",
    options: ["Only one global server", "Root servers (know the TLD servers) → TLD servers for .com (know example.com's authoritative servers) → the authoritative name servers for example.com (hold the actual records)", "ISP → browser → router", "TLD → root → host"],
    answer: 1,
    explanation: "There are 13 root server identities (A–M), each replicated worldwide via anycast. Recursive resolvers (ISP, 8.8.8.8, 1.1.1.1) walk this hierarchy on behalf of clients and cache the results.",
    optionExplanations: ["DNS is distributed.", "Correct.", "Those aren't DNS server roles.", "The order is reversed."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-appproto-003", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "What's the difference between recursive and iterative DNS queries?",
    options: ["They're identical", "In a recursive query, the server must return the final answer (doing all the work itself); in an iterative query, the server returns the best answer it has — often a referral to another server — and the asker continues. Clients query resolvers recursively; resolvers query root/TLD/authoritative servers iteratively", "Iterative queries use TCP", "Recursive queries go directly to root servers"],
    answer: 1,
    explanation: "Making root and TLD servers answer only iteratively keeps them lightweight; the recursive resolver carries the burden and benefits from caching.",
    optionExplanations: ["The division of work differs.", "Correct.", "Transport doesn't define the type.", "Stub clients ask their resolver, not the root."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-appproto-004", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "In what order are caches and servers consulted when you visit a website?",
    options: ["Authoritative server first", "Browser cache → OS resolver cache (and /etc/hosts) → recursive resolver's cache → if needed, the resolver queries root → TLD → authoritative servers, then caches the answer for its TTL", "Root server → browser cache", "Only the ISP's server"],
    answer: 1,
    explanation: "Most lookups are answered from some cache, so full resolution is relatively rare. The hosts file can override DNS locally (useful for testing).",
    optionExplanations: ["Caches are checked first.", "Correct.", "Local caches come first.", "Several caches are involved."]
  },
  {
    id: "cn-appproto-005", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "easy", type: "concept",
    question: "Match DNS record types: A, AAAA, CNAME, MX, NS.",
    options: ["A: IPv6, AAAA: IPv4", "NS: IPv4 address", "MX: web server", "A: IPv4 address; AAAA: IPv6 address; CNAME: alias to another name; MX: mail server(s) for the domain with priority; NS: authoritative name servers for the zone"],
    answer: 3,
    explanation: "Other types: TXT (arbitrary text, used for SPF/DKIM/verification), PTR (reverse lookup), SOA (zone authority info), SRV (service location with port), CAA (allowed certificate authorities).",
    optionExplanations: ["Reversed.", "NS names name servers.", "MX is for mail.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-appproto-006", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "hard", type: "concept",
    question: "Why can't you put a CNAME record at a zone apex (example.com itself)?",
    options: ["CNAMEs are deprecated", "The apex has no IP", "A CNAME can't coexist with any other record for the same name, but the apex must have SOA and NS records; so the apex can't be an alias. Providers offer 'ALIAS/ANAME' or 'CNAME flattening' to work around it", "CNAMEs only work for subdomains of .com"],
    answer: 2,
    explanation: "That's why www.example.com can be a CNAME to a CDN, while the bare domain often needs A records or provider-specific flattening.",
    optionExplanations: ["CNAMEs are widely used.", "The apex can have A/AAAA records.", "Correct.", "Any domain's subdomains can use CNAMEs."],
    tags: ["trap"]
  },
  {
    id: "cn-appproto-007", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "What does a DNS record's TTL control, and what's a trade-off?",
    options: ["Packet hop limit", "Encryption strength", "The record's creation time", "How long resolvers may cache the record. Long TTLs reduce query load and latency but make changes (migrations, failover) propagate slowly; short TTLs allow fast changes at the cost of more queries"],
    answer: 3,
    explanation: "Before a planned migration, operators lower the TTL in advance. Negative answers (NXDOMAIN) are also cached, based on the SOA's minimum/negative TTL.",
    optionExplanations: ["That's the IP TTL.", "Unrelated.", "It's a duration.", "Correct."]
  },
  {
    id: "cn-appproto-008", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "easy", type: "concept",
    question: "Which transport and port does DNS use?",
    options: ["TCP 80", "TCP 443 only", "UDP 67", "UDP port 53 for most queries; TCP port 53 for zone transfers and responses too large for UDP (when a response is truncated, the client retries over TCP)"],
    answer: 3,
    explanation: "EDNS0 allows larger UDP responses. DNS over HTTPS (port 443) and DNS over TLS (port 853) encrypt queries for privacy.",
    optionExplanations: ["80 is HTTP.", "DoH uses 443, but classic DNS uses 53.", "67 is DHCP.", "Correct."]
  },
  {
    id: "cn-appproto-009", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "How does reverse DNS work for the IPv4 address 203.0.113.7?",
    options: ["It reads the MAC address", "It uses DHCP", "It queries the A record of 203.0.113.7", "A PTR record is looked up for 7.113.0.203.in-addr.arpa (octets reversed under the in-addr.arpa domain), returning a hostname"],
    answer: 3,
    explanation: "Reversing the octets puts the most significant part on the right, matching DNS's right-to-left hierarchy. Mail servers often check that a sender's IP has matching forward and reverse DNS.",
    optionExplanations: ["MAC addresses aren't involved.", "DHCP is unrelated.", "A records map names to addresses, not the reverse.", "Correct."]
  },
  {
    id: "cn-appproto-010", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "hard", type: "numerical",
    question: "A client asks its recursive resolver for www.example.com. The resolver's cache is empty, and it must contact root, .com TLD and example.com's authoritative server in turn (one RTT each). Counting the client↔resolver exchange, how many RTTs does resolution take? How many if the resolver already has the .com TLD server cached?",
    options: ["3 and 2", "4 and 3", "1 and 1", "4 and 2"],
    answer: 1,
    explanation: "Cold: client→resolver (1) + root (1) + TLD (1) + authoritative (1) = 4 RTTs. With the TLD server's address cached, the root query is skipped: 1 + 1 + 1 = 3. If the final answer were cached, it would be just 1.",
    optionExplanations: ["The client↔resolver round trip also counts.", "Correct.", "Only a fully cached answer takes 1 RTT.", "Only the root query is saved."]
  },
  {
    id: "cn-appproto-011", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "How can DNS be used for load balancing and geographic routing?",
    options: ["Authoritative servers can return multiple A records (round-robin), or different answers based on the resolver's location or server health (GeoDNS, latency-based routing), directing users to nearby or healthy data centres", "It can't", "By changing MAC addresses", "By modifying TCP windows"],
    answer: 0,
    explanation: "Limitations: caching delays changes, and the resolver's location may not match the user's (EDNS Client Subnet helps). CDNs combine DNS steering with anycast.",
    optionExplanations: ["Correct.", "It's widely used.", "Unrelated.", "Unrelated."]
  },
  {
    id: "cn-appproto-012", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "hard", type: "concept",
    question: "What is DNS cache poisoning, and what defends against it?",
    options: ["Deleting the cache", "A DDoS against root servers", "An attacker gets a forged answer accepted into a resolver's cache (e.g. by racing the real response and guessing the 16-bit query ID), redirecting all its users. Defences: randomised source ports and IDs, and DNSSEC, which cryptographically signs records so forgeries fail validation", "An expired TTL"],
    answer: 2,
    explanation: "The 2008 Kaminsky attack showed how practical poisoning was, leading to source-port randomisation everywhere. DNSSEC provides integrity, not confidentiality.",
    optionExplanations: ["Poisoning inserts false data.", "That's a different attack.", "Correct.", "Expiry is normal behaviour."]
  },
  {
    id: "cn-appproto-013", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "easy", type: "concept",
    question: "What are the four steps of DHCP address assignment (DORA)?",
    options: ["Discover, Offer, Request, Acknowledge", "Detect, Obtain, Reserve, Accept", "Dial, Open, Read, Answer", "Deliver, Order, Route, Assign"],
    answer: 0,
    explanation: "The client broadcasts DHCPDISCOVER; servers reply with DHCPOFFER; the client broadcasts DHCPREQUEST for one offer (informing other servers it declined theirs); the chosen server confirms with DHCPACK.",
    optionExplanations: ["Correct.", "Not the DHCP message names.", "Not the DHCP message names.", "Not the DHCP message names."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-appproto-014", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "Why does a DHCP client broadcast its Discover message, and which ports are used?",
    options: ["To save bandwidth", "It has no IP address yet and doesn't know the server's address, so it sends from 0.0.0.0 to 255.255.255.255; DHCP runs over UDP with server port 67 and client port 68", "Because TCP requires broadcast", "It uses DNS to find the server"],
    answer: 1,
    explanation: "Since broadcasts don't cross routers, networks without a local DHCP server use a DHCP relay agent (ip helper-address) that forwards requests as unicast to a central server.",
    optionExplanations: ["Broadcast is used out of necessity.", "Correct.", "DHCP uses UDP.", "DNS can't be used without an address."]
  },
  {
    id: "cn-appproto-015", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "easy", type: "concept",
    question: "Besides an IP address, what configuration does DHCP typically provide?",
    options: ["Only the IP address", "The MAC address", "Subnet mask, default gateway, DNS server addresses, lease duration (and optionally domain name, NTP servers, etc.)", "Website passwords"],
    answer: 2,
    explanation: "This is why a device can join a network with zero manual configuration.",
    optionExplanations: ["Several settings are provided.", "The client already has its MAC.", "Correct.", "Not network configuration."]
  },
  {
    id: "cn-appproto-016", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "numerical",
    question: "A DHCP lease lasts 8 hours. At what times does the client normally try to renew (T1) and to rebind (T2)?",
    options: ["T1 at 4 h (50%): unicast renewal to the original server; T2 at 7 h (87.5%): broadcast to any server if renewal failed", "At 8 h only", "T1 at 1 h, T2 at 2 h", "T1 at 7 h, T2 at 4 h"],
    answer: 0,
    explanation: "If the lease expires without renewal, the client must stop using the address and start DORA again.",
    optionExplanations: ["Correct.", "Renewal starts well before expiry.", "Those aren't the default fractions.", "Reversed."]
  },
  {
    id: "cn-appproto-017", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "A Windows laptop shows the IP address 169.254.37.12. What most likely happened?",
    options: ["DHCP failed (no server reachable), so it self-assigned a link-local APIPA address; it can talk only to other link-local devices on the same segment", "It connected to a public network", "It has a static IP", "DNS failed"],
    answer: 0,
    explanation: "Troubleshoot the cable/Wi-Fi, the DHCP server, or relay configuration. IPv4 link-local (169.254.0.0/16) is the counterpart of IPv6's fe80::/10.",
    optionExplanations: ["Correct.", "169.254/16 isn't routable.", "It's self-assigned, not static.", "DNS doesn't assign addresses."]
  },
  {
    id: "cn-appproto-018", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "easy", type: "concept",
    question: "What are the roles of SMTP, POP3 and IMAP in email?",
    options: ["SMTP sends (pushes) mail from clients to servers and between servers; POP3 and IMAP retrieve mail from a mailbox — POP3 typically downloads and removes it, IMAP keeps mail on the server synchronised across devices", "All three send email", "POP3 sends, SMTP receives", "IMAP encrypts email"],
    answer: 0,
    explanation: "Ports: SMTP 25 (server-to-server), 587 (client submission), POP3 110 (995 with TLS), IMAP 143 (993 with TLS). Webmail uses HTTP between browser and server.",
    optionExplanations: ["Correct.", "Only SMTP sends.", "Reversed.", "IMAP is a retrieval protocol."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-appproto-019", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "Alice (alice@a.com) emails Bob (bob@b.com). What's the path of the message?",
    options: ["Alice's mail client → SMTP submission to a.com's mail server → it looks up b.com's MX record in DNS → SMTP to b.com's mail server → stored in Bob's mailbox → Bob's client retrieves it with IMAP/POP3 (or webmail)", "Directly from Alice's laptop to Bob's laptop", "Through FTP", "Via DHCP"],
    answer: 0,
    explanation: "Mail servers queue and retry when the destination is unavailable. SPF, DKIM and DMARC (published in DNS TXT records) help receivers detect forged senders.",
    optionExplanations: ["Correct.", "Email uses store-and-forward servers.", "FTP transfers files.", "DHCP configures hosts."]
  },
  {
    id: "cn-appproto-020", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "Why was MIME needed for email?",
    options: ["To encrypt email", "To route email", "To compress email", "Original email (RFC 822/SMTP) supported only 7-bit ASCII text; MIME adds headers (Content-Type, Content-Transfer-Encoding such as Base64) to carry non-ASCII text, attachments, images and multipart messages"],
    answer: 3,
    explanation: "MIME types (text/html, image/png, application/pdf) were later reused by HTTP's Content-Type header. Base64 inflates binary attachments by about 33%.",
    optionExplanations: ["S/MIME adds encryption, but MIME itself is about content types.", "Routing uses MX records.", "Not compression.", "Correct."]
  },
  {
    id: "cn-appproto-021", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "How does FTP use connections, and what's 'out-of-band' about it?",
    options: ["It uses one UDP socket", "It uses DNS for transfers", "It uses a single TCP connection for everything", "FTP uses a separate control connection (TCP port 21) for commands and replies and separate data connections (port 20 in active mode, or a server-chosen port in passive mode) for file transfers — control information travels 'out of band'"],
    answer: 3,
    explanation: "FTP is stateful (current directory, login) and sends credentials in plain text. SFTP (over SSH, port 22) or FTPS (FTP over TLS) are used today.",
    optionExplanations: ["FTP uses TCP.", "DNS isn't a transfer protocol.", "Control and data are separate.", "Correct."]
  },
  {
    id: "cn-appproto-022", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "hard", type: "concept",
    question: "Why does passive-mode FTP work better than active mode for clients behind NAT/firewalls?",
    options: ["In active mode the SERVER opens the data connection back to the client's announced IP/port, which a NAT or firewall usually blocks; in passive mode the CLIENT opens both connections to the server, so only outbound connections are needed", "It's encrypted", "Passive mode uses UDP", "Passive mode doesn't need a control connection"],
    answer: 0,
    explanation: "Active mode also leaks private addresses in the PORT command, requiring NAT application-level gateways.",
    optionExplanations: ["Correct.", "Neither mode is encrypted.", "Both use TCP.", "The control connection is always used."]
  },
  {
    id: "cn-appproto-023", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "How do SFTP, FTPS and TFTP differ?",
    options: ["They're identical", "SFTP runs over UDP", "TFTP is encrypted FTP", "SFTP: a file-transfer subsystem of SSH (port 22), encrypted. FTPS: classic FTP wrapped in TLS. TFTP: Trivial FTP over UDP port 69, no authentication, used for network booting and device firmware"],
    answer: 3,
    explanation: "Despite the similar names, SFTP isn't FTP at all. TFTP's simplicity suits PXE boot ROMs with tiny code space.",
    optionExplanations: ["They're different protocols.", "SFTP runs over SSH/TCP.", "TFTP has no security.", "Correct."]
  },
  {
    id: "cn-appproto-024", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "easy", type: "concept",
    question: "Why should SSH be used instead of Telnet for remote login?",
    options: ["Telnet is faster", "Telnet (port 23) sends everything, including passwords, in plain text; SSH (port 22) encrypts the session and authenticates the server (host keys) and user (passwords or public keys)", "SSH uses UDP", "Telnet doesn't support commands"],
    answer: 1,
    explanation: "SSH also supports port forwarding, SCP/SFTP file transfer and key-based authentication without passwords.",
    optionExplanations: ["Security is the issue.", "Correct.", "SSH uses TCP.", "Telnet works; it's just insecure."]
  },
  {
    id: "cn-appproto-025", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "What do SNMP and NTP do?",
    options: ["Both send email", "SNMP (UDP 161/162) monitors and manages network devices (counters, status, traps); NTP (UDP 123) synchronises clocks across machines", "SNMP synchronises time; NTP monitors devices", "Both are routing protocols"],
    answer: 1,
    explanation: "Accurate time matters for TLS certificate validation, Kerberos authentication, log correlation and distributed databases. SNMPv3 adds security missing from v1/v2c.",
    optionExplanations: ["Neither is an email protocol.", "Correct.", "Reversed.", "Neither routes packets."]
  },
  {
    id: "cn-appproto-026", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "hard", type: "concept",
    question: "Which tool and command would you use to see exactly which IP addresses and TTLs a domain's A records return from a specific resolver?",
    options: ["ping", "traceroute", "dig @8.8.8.8 example.com A (or nslookup example.com 8.8.8.8)", "netstat"],
    answer: 2,
    explanation: "dig shows the answer section with TTLs, the responding server and query time; `dig +trace` walks the hierarchy from the root, showing each referral.",
    optionExplanations: ["ping resolves the name but shows only one address.", "traceroute shows the network path.", "Correct.", "netstat shows sockets."]
  },
  {
    id: "cn-appproto-027", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "What is a DHCP relay agent?",
    options: ["A backup DHCP server", "A DNS server", "A router feature that listens for DHCP broadcasts on a subnet and forwards them as unicast to a DHCP server on another subnet (adding the subnet information), then relays the replies back", "A firewall rule"],
    answer: 2,
    explanation: "Relays let one central DHCP server serve many VLANs/subnets. The giaddr field tells the server which subnet's address pool to use.",
    optionExplanations: ["It doesn't assign addresses itself.", "Unrelated.", "Correct.", "Unrelated."]
  },
  {
    id: "cn-appproto-028", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "hard", type: "concept",
    question: "Which DNS record would a mail server look up to deliver email to user@b.com, and what if several exist?",
    options: ["The A record of b.com only", "The MX records of b.com; each has a preference number, and the sender tries the LOWEST preference value first, falling back to higher values if unreachable", "The NS record", "The PTR record"],
    answer: 1,
    explanation: "MX targets must be hostnames with A/AAAA records (not CNAMEs or IPs). If no MX exists, SMTP falls back to the domain's A record.",
    optionExplanations: ["MX records take precedence.", "Correct.", "NS identifies name servers.", "PTR is for reverse lookups."]
  },
  {
    id: "cn-appproto-029", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "medium", type: "concept",
    question: "What is negative caching in DNS?",
    options: ["Resolvers cache NXDOMAIN (name doesn't exist) and 'no data' answers for a period given by the zone's SOA record, avoiding repeated queries for non-existent names", "Caching only bad servers", "Deleting cache entries", "Caching IPv6 records only"],
    answer: 0,
    explanation: "Negative caching reduces load (e.g. from typos or malware probing random names), but a newly created record may stay 'missing' for clients until the negative TTL expires.",
    optionExplanations: ["Correct.", "It's about non-existent names.", "It's about storing answers.", "It applies to all types."]
  },
  {
    id: "cn-appproto-030", subject: "networks", subtopic: "DNS, DHCP, Email & FTP", difficulty: "hard", type: "concept",
    question: "What does DNSSEC provide, and what doesn't it provide?",
    options: ["Encryption of queries", "Faster lookups", "Authenticity and integrity of DNS answers through digital signatures (RRSIG records) and a chain of trust from the root (DS/DNSKEY); it does NOT encrypt queries — privacy needs DNS over TLS/HTTPS", "Load balancing"],
    answer: 2,
    explanation: "With DNSSEC, a validating resolver can detect forged or tampered records, defeating cache poisoning. Adoption remains partial.",
    optionExplanations: ["DNSSEC signs but doesn't encrypt.", "Validation adds work.", "Correct.", "Unrelated."]
  }
);
