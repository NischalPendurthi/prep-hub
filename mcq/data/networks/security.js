/* Computer Networks — Network Security */
window.QUESTIONS.push(
  {
    id: "cn-security-001", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "What does the CIA triad stand for in information security?",
    options: ["Central Intelligence Agency", "Cryptography, Identity, Access", "Confidentiality (only authorised parties can read data), Integrity (data isn't altered undetected), Availability (systems and data are accessible when needed)", "Control, Inspection, Audit"],
    answer: 2,
    explanation: "Encryption protects confidentiality, hashes/MACs/signatures protect integrity, and redundancy plus DDoS protection preserve availability. Authentication and non-repudiation are often added.",
    optionExplanations: ["Not the security term.", "Not the triad.", "Correct.", "Not the triad."]
  },
  {
    id: "cn-security-002", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "What's the difference between authentication and authorization?",
    options: ["Authentication verifies WHO you are (password, key, biometrics); authorization decides WHAT you're allowed to do (permissions, roles)", "They're the same", "Authorization comes first", "Authentication is only for servers"],
    answer: 0,
    explanation: "HTTP mirrors this: 401 for failed authentication, 403 for failed authorization. OAuth is an authorization delegation framework; OpenID Connect adds authentication on top.",
    optionExplanations: ["Correct.", "They're distinct steps.", "Identity must be established first.", "Users authenticate too."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-security-003", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "How do symmetric and asymmetric encryption differ?",
    options: ["Symmetric uses two keys", "They're identical", "Asymmetric is always faster", "Symmetric (AES, ChaCha20) uses one shared secret key for both encryption and decryption — fast, but the key must be distributed securely. Asymmetric (RSA, ECC) uses a public/private key pair — solves key distribution but is much slower"],
    answer: 3,
    explanation: "Practical protocols (TLS, PGP, SSH) combine them: asymmetric crypto to authenticate and agree on a key, then symmetric crypto for bulk data (hybrid encryption).",
    optionExplanations: ["Symmetric uses one shared key.", "They differ fundamentally.", "Asymmetric is orders of magnitude slower.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-security-004", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "numerical",
    question: "100 users each need to communicate privately with every other user. How many keys are needed with symmetric encryption (one shared key per pair) and with asymmetric encryption (one key pair per user)?",
    options: ["100 and 100", "200 and 4,950", "9,900 and 100", "4,950 symmetric keys and 200 keys (100 key pairs)"],
    answer: 3,
    explanation: "Symmetric: one key per pair = n(n − 1)/2 = 100 × 99 / 2 = 4,950. Asymmetric: each user has a public and private key = 2n = 200 keys. Symmetric key management scales quadratically.",
    optionExplanations: ["Pairwise keys grow quadratically.", "Reversed.", "That double-counts each pair.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-security-005", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "To send Bob a confidential message with public-key cryptography, which key does Alice encrypt with?",
    options: ["Alice's private key", "Alice's public key", "Bob's private key", "Bob's PUBLIC key — only Bob's private key can decrypt it"],
    answer: 3,
    explanation: "Confidentiality: encrypt with the recipient's public key. Digital signatures work the other way: the signer uses their own PRIVATE key and anyone verifies with the signer's public key.",
    optionExplanations: ["That would be a signature, readable by anyone.", "Only Alice could decrypt that.", "Alice doesn't have Bob's private key.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-security-006", subject: "networks", subtopic: "Network Security", difficulty: "hard", type: "numerical",
    question: "RSA with p = 3, q = 11 and public exponent e = 3. What is the private exponent d, and what ciphertext results from encrypting m = 4?",
    options: ["d = 3, c = 64", "d = 20, c = 31", "d = 11, c = 4", "d = 7, c = 31"],
    answer: 3,
    explanation: "n = 33, φ(n) = (3 − 1)(11 − 1) = 20. d is the inverse of e mod φ: 3 × 7 = 21 ≡ 1 (mod 20) → d = 7. Encrypt: c = 4³ mod 33 = 64 mod 33 = 31. Check: 31⁷ mod 33 = 4.",
    optionExplanations: ["d must satisfy e·d ≡ 1 mod 20, and c is reduced mod 33.", "20 is φ(n), not d.", "11 × 3 = 33 ≢ 1 (mod 20).", "Correct."]
  },
  {
    id: "cn-security-007", subject: "networks", subtopic: "Network Security", difficulty: "hard", type: "numerical",
    question: "Diffie-Hellman with prime p = 23 and generator g = 5. Alice picks secret a = 6, Bob picks b = 15. What public values do they exchange, and what's the shared secret?",
    options: ["A = 8, B = 19, secret = 2", "A = 30, B = 75, secret = 90", "A = 6, B = 15, secret = 21", "A = 19, B = 8, secret = 5"],
    answer: 0,
    explanation: "A = gᵃ mod p = 5⁶ mod 23 = 8. B = gᵇ mod p = 5¹⁵ mod 23 = 19. Alice computes Bᵃ = 19⁶ mod 23 = 2; Bob computes Aᵇ = 8¹⁵ mod 23 = 2. An eavesdropper sees p, g, 8 and 19 but must solve a discrete logarithm to get the secret.",
    optionExplanations: ["Correct.", "Exponentiation is modular, not multiplication.", "The secrets themselves are never sent.", "The values are swapped and the secret is wrong."]
  },
  {
    id: "cn-security-008", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is forward secrecy, and how does TLS 1.3 achieve it?",
    options: ["Encrypting data twice", "Using longer passwords", "Sending keys ahead of time", "Even if a server's long-term private key is stolen later, past sessions can't be decrypted, because each session's key came from an ephemeral Diffie-Hellman exchange (ECDHE) whose secrets were discarded. TLS 1.3 only allows ephemeral key exchange"],
    answer: 3,
    explanation: "With older RSA key transport, recorded traffic could be decrypted retroactively by anyone who later obtained the server's private key.",
    optionExplanations: ["Not the definition.", "Unrelated.", "Keys aren't sent in advance.", "Correct."]
  },
  {
    id: "cn-security-009", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "Which properties should a cryptographic hash function (e.g. SHA-256) have?",
    options: ["Reversible output", "One-way (preimage resistance: can't find the input from the hash), second-preimage resistance, collision resistance (hard to find two inputs with the same hash), and fixed-size output where a tiny input change flips about half the bits", "Output as long as the input", "Requires a secret key"],
    answer: 1,
    explanation: "MD5 and SHA-1 are broken for collision resistance and shouldn't be used for security. Hashes alone have no key; adding a key gives an HMAC.",
    optionExplanations: ["Hashes are one-way.", "Correct.", "Output size is fixed.", "Plain hashes are keyless."]
  },
  {
    id: "cn-security-010", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "What's the difference between encoding, hashing and encryption?",
    options: ["All three provide security", "Base64 is encryption", "Hashing is reversible with a key", "Encoding (Base64) changes representation and is trivially reversible — no security. Hashing is one-way, for integrity and password verification. Encryption is reversible only with a key, for confidentiality"],
    answer: 3,
    explanation: "Storing passwords 'encrypted with Base64' is a classic security mistake.",
    optionExplanations: ["Encoding provides none.", "Base64 is just encoding.", "Hashes aren't reversible.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-security-011", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "How should a server store user passwords?",
    options: ["In plain text", "As salted hashes from a deliberately slow password-hashing function (bcrypt, scrypt, Argon2), so each password has a unique random salt (defeating precomputed rainbow tables) and brute-forcing is expensive", "Encrypted with a key stored on the same server", "As unsalted SHA-256 hashes"],
    answer: 1,
    explanation: "Fast hashes like SHA-256 let attackers test billions of guesses per second on GPUs. Salts ensure identical passwords produce different hashes.",
    optionExplanations: ["A breach would expose everything.", "Correct.", "The key would be stolen along with the data.", "Unsalted fast hashes are easily cracked."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-security-012", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What does an HMAC provide that a plain hash doesn't?",
    options: ["Encryption", "Authenticity as well as integrity: it's computed with a shared SECRET key, so only key holders can produce a valid tag; an attacker who modifies a message can't recompute it (unlike a plain hash)", "Compression", "Non-repudiation"],
    answer: 1,
    explanation: "HMAC is used in API request signing, JWT (HS256) and TLS. Because both parties share the key, it doesn't provide non-repudiation; digital signatures do.",
    optionExplanations: ["HMAC doesn't hide content.", "Correct.", "No compression.", "Either key holder could have created it."]
  },
  {
    id: "cn-security-013", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "How does a digital signature work, and what does it guarantee?",
    options: ["The sender encrypts the message with the receiver's public key", "It uses a shared secret key", "It encrypts the whole message for confidentiality", "The signer hashes the message and signs the hash with their PRIVATE key; anyone verifies it with the signer's PUBLIC key. It guarantees integrity, authenticity and non-repudiation"],
    answer: 3,
    explanation: "Signatures underpin certificates, software updates, Git commit signing and code signing. They don't provide confidentiality by themselves.",
    optionExplanations: ["That's encryption for confidentiality.", "That's an HMAC.", "Signatures don't hide content.", "Correct."]
  },
  {
    id: "cn-security-014", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is an X.509 certificate, and how does a browser decide to trust a server's certificate?",
    options: ["A document binding a public key to an identity (domain name), signed by a Certificate Authority. The browser checks the chain of signatures up to a trusted root CA in its store, plus validity dates, the domain name and revocation status", "A file containing the server's private key", "A password file", "A list of allowed IP addresses"],
    answer: 0,
    explanation: "Typical chains: server certificate → intermediate CA → root CA. Let's Encrypt automated certificate issuance; Certificate Transparency logs make mis-issuance detectable.",
    optionExplanations: ["Correct.", "Private keys never go in certificates.", "Not a password store.", "Not an ACL."]
  },
  {
    id: "cn-security-015", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What happens during a TLS 1.3 handshake (simplified)?",
    options: ["The client sends its password", "ClientHello (supported ciphers, key share) → ServerHello (chosen cipher, server key share) + certificate + signature + Finished, encrypted after the key share; the client verifies the certificate and sends Finished. Both derive session keys from the ECDHE exchange — 1 RTT before application data (0-RTT on resumption)", "The server sends its private key", "It takes 3 RTTs"],
    answer: 1,
    explanation: "TLS 1.2 needed 2 RTTs. TLS 1.3 also removed obsolete ciphers, RSA key transport and compression, and encrypts most of the handshake.",
    optionExplanations: ["Passwords aren't part of TLS.", "Correct.", "Private keys never leave the server.", "TLS 1.3 needs 1 RTT."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-security-016", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "How do packet-filtering, stateful and application-layer firewalls differ?",
    options: ["They're identical", "Only application firewalls use rules", "Packet filters check each packet's headers (IP, port, protocol) against rules. Stateful firewalls track connections, allowing replies to established flows automatically. Application-layer firewalls/proxies (and WAFs) inspect content such as HTTP requests", "Stateful firewalls can't block ports"],
    answer: 2,
    explanation: "Cloud security groups are stateful filters. A WAF can block SQL injection or XSS payloads that port-based filtering can't see.",
    optionExplanations: ["They inspect different depths.", "All use rules.", "Correct.", "They can."]
  },
  {
    id: "cn-security-017", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What's the difference between an IDS and an IPS?",
    options: ["An Intrusion Detection System monitors traffic and ALERTS on suspicious activity (passive); an Intrusion Prevention System sits inline and can BLOCK it automatically", "They're identical", "An IDS blocks; an IPS logs", "Both are antivirus programs"],
    answer: 0,
    explanation: "Both use signatures and/or anomaly detection. IPS false positives can block legitimate traffic, so tuning matters.",
    optionExplanations: ["Correct.", "One is passive, the other inline.", "Reversed.", "They monitor network traffic."]
  },
  {
    id: "cn-security-018", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "In IPsec, how do AH and ESP differ, and how do transport and tunnel modes differ?",
    options: ["AH authenticates packets (integrity + origin) without encryption; ESP provides encryption (and usually integrity). Transport mode protects the payload between two hosts; tunnel mode wraps the entire original packet in a new IP header (used for site-to-site VPNs)", "They're the same", "AH encrypts, ESP doesn't", "Tunnel mode is for host-to-host only"],
    answer: 0,
    explanation: "AH is incompatible with NAT (it covers IP addresses), so ESP (often with NAT traversal over UDP 4500) is dominant. WireGuard and TLS-based VPNs are modern alternatives.",
    optionExplanations: ["Correct.", "They differ.", "Reversed.", "Tunnel mode is typical for gateways."]
  },
  {
    id: "cn-security-019", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "What distinguishes a DDoS attack from a DoS attack?",
    options: ["Nothing", "DoS only targets DNS", "DDoS steals data", "A DoS comes from one source; a Distributed DoS comes from many sources (often a botnet of compromised devices), making it much harder to block by source address and able to generate far more traffic"],
    answer: 3,
    explanation: "Types: volumetric (flooding bandwidth), protocol (SYN floods exhausting state) and application-layer (expensive HTTP requests). Mitigation uses CDNs/scrubbing centres, anycast, rate limiting and filtering.",
    optionExplanations: ["Distribution is the key difference.", "Any service can be targeted.", "DDoS attacks availability, not confidentiality.", "Correct."]
  },
  {
    id: "cn-security-020", subject: "networks", subtopic: "Network Security", difficulty: "hard", type: "concept",
    question: "How does a DNS (or NTP/memcached) amplification attack work?",
    options: ["The attacker sends small UDP queries with the VICTIM's spoofed source IP to open servers that return much larger responses; the servers 'reflect' and amplify the traffic onto the victim (amplification factors of 50× for DNS to 50,000× for memcached)", "It guesses passwords", "It overloads the attacker's own network", "It poisons caches"],
    answer: 0,
    explanation: "Defences: ISPs filtering spoofed source addresses (BCP 38), closing open resolvers/reflectors, rate limiting responses, and upstream DDoS protection.",
    optionExplanations: ["Correct.", "Unrelated.", "The victim receives the traffic.", "That's a different DNS attack."]
  },
  {
    id: "cn-security-021", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is a man-in-the-middle (MITM) attack, and how does TLS prevent it?",
    options: ["A DDoS variant", "A virus on the server", "The attacker secretly relays (and possibly alters) traffic between two parties who think they're talking directly. TLS prevents it by authenticating the server with a CA-signed certificate: the attacker can't present a valid certificate for the domain without the private key", "A firewall misconfiguration"],
    answer: 2,
    explanation: "Users clicking through certificate warnings, or a malicious root CA installed on the device, can still enable MITM. Certificate pinning and HSTS reduce the risk.",
    optionExplanations: ["Different attack.", "Not necessarily.", "Correct.", "Not the definition."]
  },
  {
    id: "cn-security-022", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "How does ARP spoofing enable a MITM attack on a LAN?",
    options: ["It changes DNS records", "The attacker sends forged ARP replies associating its own MAC with the gateway's IP (and the victim's IP to the gateway), so traffic flows through the attacker. ARP has no authentication. Defences: dynamic ARP inspection, static ARP entries, encrypted protocols", "It floods the switch with MACs", "It spoofs TCP sequence numbers"],
    answer: 1,
    explanation: "Related spoofing attacks: IP spoofing (forging source addresses, used in reflection attacks), DNS spoofing (forged answers), and MAC flooding.",
    optionExplanations: ["That's DNS spoofing.", "Correct.", "That's MAC flooding.", "That's TCP hijacking."]
  },
  {
    id: "cn-security-023", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is a replay attack, and how is it prevented?",
    options: ["Re-running old software", "Replaying videos", "An attacker records a valid message (e.g. an authentication or payment request) and resends it later to repeat its effect. Defences: nonces, timestamps with short validity windows, sequence numbers, and session-bound tokens", "Brute-forcing passwords"],
    answer: 2,
    explanation: "Encryption alone doesn't stop replay: a recorded encrypted message may still be valid. TLS uses sequence numbers within records; TLS 1.3 0-RTT data is replayable, so it must be idempotent.",
    optionExplanations: ["Not the attack.", "Unrelated.", "Correct.", "Different attack."]
  },
  {
    id: "cn-security-024", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "How do XSS and CSRF attacks differ?",
    options: ["They're the same", "CSRF injects scripts", "XSS (cross-site scripting) injects malicious script into a trusted site's pages, running in victims' browsers (stealing data/sessions); CSRF (cross-site request forgery) tricks a logged-in user's browser into sending an unwanted request to a site that trusts its cookies", "XSS forges requests from other sites"],
    answer: 2,
    explanation: "XSS defences: output encoding, Content Security Policy, HttpOnly cookies. CSRF defences: SameSite cookies, anti-CSRF tokens, checking Origin headers.",
    optionExplanations: ["They differ.", "Reversed.", "Correct.", "Reversed."]
  },
  {
    id: "cn-security-025", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "What is SQL injection, and what's the primary defence?",
    options: ["A database backup method", "Injecting indexes into tables", "Untrusted input is concatenated into a SQL query so attackers can alter its logic (e.g. ' OR '1'='1). Use parameterised queries / prepared statements, plus least-privilege database accounts", "A network-layer attack"],
    answer: 2,
    explanation: "Input validation and WAFs help, but parameterisation is the reliable fix because data can never become code.",
    optionExplanations: ["It's an attack.", "Unrelated.", "Correct.", "It's application-layer."]
  },
  {
    id: "cn-security-026", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is HSTS, and which attack does it prevent?",
    options: ["A hashing algorithm", "A firewall", "HTTP Strict Transport Security: a response header telling browsers to use only HTTPS for the site for a period; it prevents SSL-stripping attacks where a MITM downgrades the first HTTP request before the redirect to HTTPS", "A DNS record"],
    answer: 2,
    explanation: "HSTS preload lists bake the policy into browsers so even the very first visit uses HTTPS.",
    optionExplanations: ["Not a hash.", "It's a browser policy.", "Correct.", "It's an HTTP header."]
  },
  {
    id: "cn-security-027", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is a VPN?",
    options: ["A Virtual Private Network creates an encrypted tunnel over a public network, letting remote users or sites communicate as if on a private network (protocols: IPsec, WireGuard, OpenVPN/TLS)", "A faster Internet connection", "A type of firewall rule", "An antivirus"],
    answer: 0,
    explanation: "VPNs provide confidentiality on untrusted networks and access to internal resources. Zero-trust architectures increasingly replace network-level trust with per-request identity checks.",
    optionExplanations: ["Correct.", "Speed isn't the goal.", "It's a tunnel.", "Unrelated."]
  },
  {
    id: "cn-security-028", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is a DMZ in network design?",
    options: ["A separate network segment for public-facing servers (web, mail) between the Internet and the internal network, with firewall rules so a compromised DMZ server can't freely reach internal systems", "A malware type", "The Wi-Fi network", "A DNS zone"],
    answer: 0,
    explanation: "It's an example of defence in depth: multiple layers (perimeter firewall, segmentation, host hardening, monitoring) so one failure doesn't expose everything.",
    optionExplanations: ["Correct.", "Not malware.", "Not necessarily.", "Not DNS."]
  },
  {
    id: "cn-security-029", subject: "networks", subtopic: "Network Security", difficulty: "hard", type: "concept",
    question: "Why is 'encrypt-then-MAC' (or an AEAD cipher like AES-GCM) preferred over encryption alone?",
    options: ["Encryption hides content but doesn't stop tampering: attackers can flip ciphertext bits (e.g. in CTR mode, flipping a bit flips the same plaintext bit) or exploit padding oracles. Authenticating the ciphertext detects any modification before decryption", "Encryption alone is too slow", "MACs compress data", "It's only needed for passwords"],
    answer: 0,
    explanation: "TLS 1.3 allows only AEAD ciphers (AES-GCM, ChaCha20-Poly1305), ending older MAC-then-encrypt designs that enabled attacks like Lucky 13 and POODLE.",
    optionExplanations: ["Correct.", "Speed isn't the reason.", "MACs don't compress.", "It applies to all data."]
  },
  {
    id: "cn-security-030", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is session hijacking, and which measures reduce the risk?",
    options: ["Stealing a laptop", "Rebooting a server", "An attacker steals or predicts a valid session token (via XSS, sniffing plain HTTP, or malware) and impersonates the user. Mitigations: HTTPS everywhere, Secure + HttpOnly + SameSite cookies, regenerating session IDs at login, short expiries", "Spoofing MAC addresses only"],
    answer: 2,
    explanation: "Session fixation (forcing a known session ID before login) is prevented by issuing a new ID after authentication.",
    optionExplanations: ["It's about tokens.", "Unrelated.", "Correct.", "That alone doesn't steal a session."]
  },
  {
    id: "cn-security-031", subject: "networks", subtopic: "Network Security", difficulty: "easy", type: "concept",
    question: "What is phishing?",
    options: ["A network scanning tool", "A social-engineering attack where messages impersonate trusted entities to trick people into revealing credentials, clicking malicious links or installing malware", "A DDoS technique", "A firewall misconfiguration"],
    answer: 1,
    explanation: "Defences include user training, email authentication (SPF, DKIM, DMARC), link scanning and phishing-resistant MFA such as security keys (FIDO2/passkeys).",
    optionExplanations: ["Not a tool.", "Correct.", "Different attack.", "Unrelated."]
  },
  {
    id: "cn-security-032", subject: "networks", subtopic: "Network Security", difficulty: "hard", type: "concept",
    question: "Why is hybrid encryption used, for example in TLS and PGP?",
    options: ["Because symmetric encryption is insecure", "Asymmetric cryptography solves key exchange/authentication but is slow and limited in message size, while symmetric ciphers are fast for bulk data; so a public-key mechanism establishes a random session key, and that key encrypts the data", "To double the key length", "Because hashes require it"],
    answer: 1,
    explanation: "PGP encrypts a random session key with the recipient's public key and the message with AES; TLS derives session keys from (EC)DHE.",
    optionExplanations: ["Symmetric ciphers are secure.", "Correct.", "Not the purpose.", "Unrelated."]
  },
  {
    id: "cn-security-033", subject: "networks", subtopic: "Network Security", difficulty: "hard", type: "concept",
    question: "How does a SYN flood exhaust a server, and how do SYN cookies defend against it?",
    options: ["It sends huge HTTP bodies; SYN cookies compress them", "The attacker sends many SYNs (often from spoofed IPs) and never completes the handshake, filling the server's half-open connection (SYN) backlog so real clients are refused. With SYN cookies the server keeps no state for a SYN: it encodes the connection details in its initial sequence number and rebuilds the state only when a valid ACK returns", "It floods ARP tables; SYN cookies are static ARP entries", "It guesses TCP sequence numbers; SYN cookies are browser cookies"],
    answer: 1,
    explanation: "Because spoofed sources never reply to the SYN-ACK, each half-open entry lingers until timeout. SYN cookies remove the per-SYN memory cost; other mitigations are larger backlogs, shorter SYN-RECEIVED timeouts and upstream filtering.",
    optionExplanations: ["That's an application-layer attack.", "Correct.", "Unrelated to ARP.", "SYN cookies are TCP sequence-number encodings, not HTTP cookies."]
  },
  {
    id: "cn-security-034", subject: "networks", subtopic: "Network Security", difficulty: "medium", type: "concept",
    question: "What is DNS cache poisoning (DNS spoofing), and what defends against it?",
    options: ["Deleting a DNS zone", "An attacker gets a resolver to cache a forged answer (e.g. by racing the real response with guessed transaction IDs), sending users to a malicious IP. Defences: randomised source ports and transaction IDs, and DNSSEC, which signs records so forgeries fail validation", "Registering a similar domain name", "Flooding a DNS server with queries"],
    answer: 1,
    explanation: "The 2008 Kaminsky attack showed that 16-bit transaction IDs alone were too easy to guess; source-port randomisation adds entropy. HTTPS still protects users because a forged IP can't present a valid certificate.",
    optionExplanations: ["Not the attack.", "Correct.", "That's typosquatting.", "That's a DoS."]
  }
);
