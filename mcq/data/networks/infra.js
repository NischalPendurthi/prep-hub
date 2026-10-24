/* Computer Networks — Web Infrastructure & Scenarios */
window.QUESTIONS.push(
  {
    id: "cn-infra-001", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "You type https://example.com into a browser that has never visited the site. What is the correct order of the main network steps?",
    options: ["TCP handshake → DNS lookup → HTTP request → TLS handshake", "HTTP request → DNS lookup → TCP handshake → TLS handshake", "TLS handshake → DNS lookup → TCP handshake → HTTP request", "DNS lookup → TCP handshake → TLS handshake → HTTP request → response and rendering"],
    answer: 3,
    explanation: "The browser needs the IP (DNS) before it can connect (TCP), must secure the connection (TLS) before sending the request (HTTP GET), then parses the HTML and fetches sub-resources.",
    optionExplanations: ["TCP needs an IP address first.", "The request can't be sent without a connection.", "TLS runs over an existing TCP connection.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-infra-002", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "Before doing any network lookup for a typed URL, which local steps can a browser take?",
    options: ["None; it always queries DNS first", "Ask the CDN which server to use", "Open a TLS session immediately", "Parse the URL (scheme, host, port, path), check the HSTS list to upgrade http to https, look in its own HTTP cache (possibly serving the page without any network access), and check browser/OS DNS caches and the hosts file"],
    answer: 3,
    explanation: "Only on cache misses does it go to the network: DNS resolver, then TCP/TLS (or QUIC), then HTTP. Service workers can also intercept requests.",
    optionExplanations: ["Caches are checked first.", "The CDN is reached via DNS.", "TLS needs a TCP connection to a known IP.", "Correct."]
  },
  {
    id: "cn-infra-003", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "numerical",
    question: "RTT to every server is 50 ms. With nothing cached, the DNS lookup costs 1 RTT, then TCP and TLS 1.3 are used. How long until the first byte of the HTTP response arrives (ignoring transmission and processing)?",
    options: ["100 ms", "150 ms", "200 ms", "250 ms"],
    answer: 2,
    explanation: "DNS 1 RTT + TCP handshake 1 RTT + TLS 1.3 handshake 1 RTT + HTTP request/response 1 RTT = 4 RTT = 200 ms. With TLS 1.2 (2 RTTs) it would be 5 RTT = 250 ms.",
    optionExplanations: ["That leaves out two steps.", "That leaves out one step.", "Correct.", "That's TLS 1.2."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-infra-004", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "hard", type: "numerical",
    question: "Same as before: RTT 50 ms and DNS costs 1 RTT. How long to the first response byte with HTTP/3 over QUIC on a first visit, and on a resumed visit using 0-RTT with a cached DNS answer?",
    options: ["150 ms and 50 ms", "200 ms and 100 ms", "150 ms and 0 ms", "100 ms and 50 ms"],
    answer: 0,
    explanation: "QUIC combines the transport and TLS 1.3 handshakes into 1 RTT: DNS 1 + QUIC 1 + HTTP 1 = 3 RTT = 150 ms. With 0-RTT resumption and DNS cached, the request goes out with the first packet, so the response arrives after 1 RTT = 50 ms.",
    optionExplanations: ["Correct.", "That's TCP + TLS 1.3.", "Even 0-RTT needs one round trip for the response.", "First visit still needs DNS."]
  },
  {
    id: "cn-infra-005", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "What's the difference between a forward proxy and a reverse proxy?",
    options: ["They're the same", "A reverse proxy is only used by clients", "A forward proxy acts for CLIENTS (e.g. corporate filtering, caching, anonymity: servers see the proxy); a reverse proxy acts for SERVERS, sitting in front of them (load balancing, TLS termination, caching, hiding backends: clients see the proxy)", "Forward proxies only work for DNS"],
    answer: 2,
    explanation: "Nginx, HAProxy and Envoy are common reverse proxies; Squid is a classic forward proxy.",
    optionExplanations: ["They serve opposite sides.", "Reversed.", "Correct.", "They proxy HTTP and other traffic."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-infra-006", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "How does a Layer 4 load balancer differ from a Layer 7 load balancer?",
    options: ["They're the same", "L4 balances on IP addresses and ports (TCP/UDP connections) without reading content — fast and protocol-agnostic. L7 parses application data (HTTP path, headers, cookies) so it can route /api to one pool and /images to another, but costs more CPU and usually terminates TLS", "L7 is faster because it reads less", "L4 can route by URL path"],
    answer: 1,
    explanation: "Examples: AWS NLB (L4) vs ALB (L7). L7 enables content-based routing, header rewriting and per-request balancing across HTTP/2 streams.",
    optionExplanations: ["They operate at different layers.", "Correct.", "L7 does more work.", "L4 doesn't see URLs."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-infra-007", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "Which load-balancing algorithm sends each new request to the server with the fewest active connections?",
    options: ["Least connections", "Round robin", "IP hash", "Random"],
    answer: 0,
    explanation: "Least connections suits requests with varied durations. Round robin rotates in order, weighted round robin favours bigger servers, and IP hash maps a client to a consistent server.",
    optionExplanations: ["Correct.", "That rotates regardless of load.", "That uses the client address.", "That ignores load."]
  },
  {
    id: "cn-infra-008", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "numerical",
    question: "A weighted round-robin balancer has servers A, B and C with weights 3, 1 and 1. How many of 1,000 requests does each receive?",
    options: ["333, 333, 334", "600, 200, 200", "750, 125, 125", "500, 250, 250"],
    answer: 1,
    explanation: "Total weight = 5. A gets 3/5 × 1,000 = 600, B and C get 1/5 × 1,000 = 200 each.",
    optionExplanations: ["That ignores the weights.", "Correct.", "Wrong arithmetic.", "Wrong arithmetic."]
  },
  {
    id: "cn-infra-009", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "hard", type: "numerical",
    question: "Keys are assigned to cache servers with hash(key) mod N. When N goes from 4 to 5, what fraction of keys move to a different server, and roughly what fraction move with consistent hashing?",
    options: ["20% with mod N; 80% with consistent hashing", "25% in both cases", "80% with mod N; about 20% (1/5) with consistent hashing", "100% with mod N; 0% with consistent hashing"],
    answer: 2,
    explanation: "A key stays only if h mod 4 = h mod 5, which holds for h mod 20 ∈ {0, 1, 2, 3}: 4/20 = 20%, so 80% move, causing a cache stampede. Consistent hashing places servers on a ring; the new server takes about 1/N_new = 1/5 of the keys, only from its neighbours.",
    optionExplanations: ["Reversed.", "Mod-N remapping is far worse.", "Correct.", "Some keys do stay, and consistent hashing moves some."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-infra-010", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "What are load-balancer health checks and sticky sessions?",
    options: ["Health checks periodically probe backends (TCP connect or HTTP /health) and remove failing ones from rotation. Sticky sessions (session affinity) route a client to the same backend each time, via a cookie or IP hash — useful for in-memory session state, but it hurts even load distribution and failover", "Both are DNS settings", "Sticky sessions improve failover", "Health checks encrypt traffic"],
    answer: 0,
    explanation: "Stateless backends with shared session storage (e.g. Redis) avoid the need for stickiness.",
    optionExplanations: ["Correct.", "They're LB features.", "They make failover harder.", "Unrelated."]
  },
  {
    id: "cn-infra-011", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "How does a CDN reduce latency for users?",
    options: ["It increases the origin server's CPU", "It caches content on edge servers close to users, so most requests are served over a short RTT without travelling to the origin; it also absorbs traffic spikes and DDoS attacks", "It compresses DNS", "It replaces TCP with UDP"],
    answer: 1,
    explanation: "On a cache miss the edge fetches from the origin (often over optimised, warm connections) and caches the result according to its TTL.",
    optionExplanations: ["Not how it works.", "Correct.", "Unrelated.", "Not the mechanism."]
  },
  {
    id: "cn-infra-012", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "numerical",
    question: "A CDN has a 90% cache hit ratio. Hits take 20 ms; misses take 220 ms (edge plus origin fetch). What is the average response time, and how many of 10,000 requests per second reach the origin?",
    options: ["40 ms and 1,000 req/s", "200 ms and 9,000 req/s", "22 ms and 100 req/s", "120 ms and 1,000 req/s"],
    answer: 0,
    explanation: "Average = 0.9 × 20 + 0.1 × 220 = 18 + 22 = 40 ms. Origin load = 10% × 10,000 = 1,000 req/s. Raising the hit ratio to 99% gives 22 ms and only 100 req/s.",
    optionExplanations: ["Correct.", "That swaps the hit and miss fractions.", "That's the 99% hit-ratio case.", "That's a simple average of 20 and 220."]
  },
  {
    id: "cn-infra-013", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "You deploy a new CSS file but users still get the old one from the CDN for hours. What's the best long-term fix?",
    options: ["Turn off the CDN", "Ask users to clear their caches", "Use content-hashed (fingerprinted) file names like app.3f9a2c.css with long cache TTLs, so each deployment references a new URL; use purge/invalidation APIs for urgent changes, and short TTLs for HTML", "Set all TTLs to one year including HTML"],
    answer: 2,
    explanation: "Cache invalidation is hard; versioned URLs avoid it entirely for static assets. HTML that references them is cached briefly or revalidated with ETags.",
    optionExplanations: ["That gives up the benefits.", "Not reliable.", "Correct.", "HTML would then reference stale assets for a year."]
  },
  {
    id: "cn-infra-014", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "What does an API gateway do?",
    options: ["A single entry point in front of backend services that handles cross-cutting concerns: routing requests to services, authentication, rate limiting, TLS termination, request transformation, caching and metrics", "It stores the database", "It replaces DNS", "It's a type of firewall hardware only"],
    answer: 0,
    explanation: "It's a specialised reverse proxy common in microservice architectures (Kong, AWS API Gateway, Envoy-based gateways).",
    optionExplanations: ["Correct.", "Not storage.", "DNS still resolves its name.", "It's usually software."]
  },
  {
    id: "cn-infra-015", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "What is SSL/TLS termination at a load balancer, and what's a trade-off?",
    options: ["Blocking all TLS traffic", "Ending a TCP connection early", "The load balancer decrypts HTTPS and forwards plain HTTP (or re-encrypted traffic) to backends. It centralises certificates and offloads crypto CPU from servers and enables L7 routing, but traffic behind the LB is unencrypted unless re-encrypted, which matters for zero-trust and compliance", "Removing certificates from servers permanently"],
    answer: 2,
    explanation: "Options are TLS termination, TLS passthrough (L4, backends decrypt) and re-encryption (terminate then open a new TLS connection to the backend).",
    optionExplanations: ["Not blocking.", "Not about TCP teardown.", "Correct.", "Backends may still use TLS."]
  },
  {
    id: "cn-infra-016", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "How do horizontal and vertical scaling differ, and what does horizontal scaling need from the network?",
    options: ["They're identical", "Vertical scaling makes one machine bigger (more CPU/RAM), up to a limit. Horizontal scaling adds more machines, which needs a load balancer (or DNS) to spread traffic, and works best with stateless servers", "Horizontal scaling means faster network cables", "Vertical scaling adds servers"],
    answer: 1,
    explanation: "Horizontal scaling also improves availability: losing one of many servers is survivable.",
    optionExplanations: ["They differ.", "Correct.", "Not the meaning.", "Reversed."]
  },
  {
    id: "cn-infra-017", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "How do DNS-based failover and anycast help availability and latency?",
    options: ["They encrypt traffic", "DNS failover returns different IPs when health checks fail (limited by record TTLs and resolver caching). Anycast announces the same IP from many locations via BGP, so routing delivers each user to the nearest healthy site — used by CDNs and public DNS resolvers like 1.1.1.1", "Anycast sends every packet to all servers", "DNS failover is instant regardless of TTL"],
    answer: 1,
    explanation: "Low TTLs speed up DNS failover at the cost of more queries. Anycast also spreads DDoS traffic across many sites.",
    optionExplanations: ["Neither encrypts.", "Correct.", "That's broadcast.", "Cached answers delay failover."]
  },
  {
    id: "cn-infra-018", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "Which tool shows the sequence of routers (hops) that packets take to a destination?",
    options: ["ping", "nslookup", "traceroute (tracert on Windows)", "netstat"],
    answer: 2,
    explanation: "traceroute sends packets with increasing TTL values; each router that decrements TTL to 0 returns an ICMP Time Exceeded message, revealing itself and the RTT to it.",
    optionExplanations: ["ping only tests reachability and RTT.", "That queries DNS.", "Correct.", "That lists local sockets."]
  },
  {
    id: "cn-infra-019", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "Users say api.example.com is unreachable. Which sequence of tools best narrows down the problem?",
    options: ["Reinstall the OS, then check", "Restart the router repeatedly", "Only check the browser console", "dig/nslookup to confirm the name resolves to the expected IP → ping/traceroute to check reachability and where packets stop → curl -v to see whether TCP/TLS connect and what HTTP status returns → ss/netstat on the server to confirm it's listening → tcpdump/Wireshark if still unclear"],
    answer: 3,
    explanation: "Work up the layers: DNS, then network reachability, then transport/TLS, then the application. Note that ICMP may be blocked even when HTTP works.",
    optionExplanations: ["Not diagnostic.", "Not systematic.", "That's too narrow.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-infra-020", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "Which command shows which local ports a Linux server is listening on and which processes own them?",
    options: ["dig", "ping -c 4", "traceroute", "ss -tlnp (or netstat -tlnp)"],
    answer: 3,
    explanation: "-t TCP, -l listening, -n numeric, -p processes. Add -u for UDP. ss is the modern replacement for netstat.",
    optionExplanations: ["That queries DNS.", "That tests reachability.", "That traces routes.", "Correct."]
  },
  {
    id: "cn-infra-021", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "When would you use tcpdump or Wireshark instead of curl?",
    options: ["Never", "To resolve DNS names", "Only to download files", "When you need to see the actual packets on the wire: handshake failures, retransmissions, resets, MTU problems or which side stops responding. curl shows only what the HTTP client experiences"],
    answer: 3,
    explanation: "Example: tcpdump -i eth0 port 443 captures HTTPS traffic; Wireshark decodes protocols graphically (TLS payloads stay encrypted without keys).",
    optionExplanations: ["Packet capture is often essential.", "That's dig/nslookup.", "That's curl/wget.", "Correct."]
  },
  {
    id: "cn-infra-022", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "numerical",
    question: "A token-bucket rate limiter holds at most 10 tokens and refills at 5 tokens per second; each request uses one token. Starting full, what's the maximum number of requests allowed in the first 3 seconds?",
    options: ["15", "30", "10", "25"],
    answer: 3,
    explanation: "An initial burst of 10 uses the full bucket, then 5 new tokens per second for 3 s add 15: 10 + 15 = 25. Token buckets allow bursts up to capacity while enforcing a long-term average rate.",
    optionExplanations: ["That ignores the initial burst.", "That double-counts.", "That ignores the refill.", "Correct."]
  },
  {
    id: "cn-infra-023", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "Why do APIs use rate limiting, and how is exceeding the limit usually signalled?",
    options: ["To make responses faster for everyone", "To protect backends from overload and abuse (scraping, brute-force logins, runaway clients) and to share capacity fairly; exceeding it returns HTTP 429 Too Many Requests, often with a Retry-After header", "To encrypt traffic; with HTTP 403", "To reduce DNS lookups; with HTTP 500"],
    answer: 1,
    explanation: "Common algorithms: token bucket, leaky bucket, fixed window and sliding window counters, often keyed by API key, user or IP, and stored in shared state such as Redis.",
    optionExplanations: ["It sheds load; it doesn't speed things up.", "Correct.", "Not encryption; 403 means forbidden.", "Unrelated."]
  },
  {
    id: "cn-infra-024", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "Which URL has the same origin as https://example.com/app?",
    options: ["https://example.com:443/other/page", "http://example.com/app", "https://api.example.com/app", "https://example.com:8443/app"],
    answer: 0,
    explanation: "An origin is scheme + host + port. 443 is the default HTTPS port, so https://example.com:443 equals https://example.com. A different scheme, subdomain or port is a different origin.",
    optionExplanations: ["Correct.", "Different scheme.", "Different host.", "Different port."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-infra-025", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "hard", type: "concept",
    question: "What does the browser's same-origin policy restrict, and how does CORS relax it?",
    options: ["It blocks all cross-origin requests from being sent", "Scripts can't READ responses from another origin by default. The server opts in with CORS headers such as Access-Control-Allow-Origin; for non-simple requests (e.g. PUT, custom headers, JSON content type) the browser first sends an OPTIONS preflight", "It only applies to images", "CORS is enforced by the server, not the browser"],
    answer: 1,
    explanation: "Simple cross-origin requests may still be SENT (which is why CSRF protection is separately needed); SOP blocks reading the response. CORS is enforced by the browser based on the server's headers; non-browser clients like curl ignore it.",
    optionExplanations: ["Simple requests are sent; responses are hidden.", "Correct.", "It covers scripts, fetch/XHR and more.", "The browser enforces it."]
  },
  {
    id: "cn-infra-026", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "What is mixed content, and why do browsers block it?",
    options: ["Pages with images and text", "Combining HTTP/1.1 and HTTP/2", "An HTTPS page loading resources (scripts, iframes, images) over plain HTTP. Those resources could be read or modified by a network attacker, undermining the page's security, so browsers block active mixed content and upgrade or block passive content", "Content in multiple languages"],
    answer: 2,
    explanation: "Fix: load every resource over HTTPS; the Content-Security-Policy upgrade-insecure-requests directive helps migrate old pages.",
    optionExplanations: ["Not the meaning.", "Unrelated.", "Correct.", "Unrelated."]
  },
  {
    id: "cn-infra-027", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "hard", type: "concept",
    question: "A site loads in 3 s for users in Asia but 300 ms in the US, where its only server is. The page needs about 40 sequential round trips at 250 ms RTT from Asia. What helps most?",
    options: ["Doubling the server's bandwidth", "Increasing the DNS TTL to one week", "Upgrading the server's CPU", "Reducing round trips and their length: serve static assets and terminate TLS at nearby CDN edges, use HTTP/2 or HTTP/3 to multiplex requests, enable connection reuse and 0-RTT, and add a regional replica for dynamic content"],
    answer: 3,
    explanation: "The page is latency-bound (40 × 250 ms ≈ 10 s of RTTs if unoptimised, partly overlapped). Bandwidth and CPU don't shorten round trips; proximity and fewer round trips do.",
    optionExplanations: ["Bandwidth isn't the bottleneck.", "That saves at most one lookup.", "Not the bottleneck.", "Correct."]
  },
  {
    id: "cn-infra-028", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "hard", type: "concept",
    question: "After a deployment behind a load balancer, about 1 in 4 requests fails with 502 Bad Gateway. What's the most likely cause and the first check?",
    options: ["The client's DNS is broken", "The client's browser cache is full", "The TLS certificate expired", "One of four backends is unhealthy or not listening (e.g. crashed, wrong port), and the LB still routes to it: check its health-check status, logs and whether the process is listening; tighten health checks so failing backends are removed"],
    answer: 3,
    explanation: "502 means the gateway got an invalid response (or none) from the upstream. A failure rate of exactly one in N suggests one bad backend in round robin. An expired certificate would fail every request.",
    optionExplanations: ["DNS failure wouldn't produce a 502 from your LB.", "Unrelated to 502.", "That would break all requests.", "Correct."]
  },
  {
    id: "cn-infra-029", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "curl https://example.com works from your laptop, but the server's own healthcheck to http://localhost:8080 fails with 'connection refused'. What does that indicate?",
    options: ["Nothing is listening on port 8080 on that host (the app crashed, listens on a different port, or binds only to another interface); the request reached the host and got a TCP RST", "A DNS failure", "A firewall silently dropping packets", "An expired certificate"],
    answer: 0,
    explanation: "'Connection refused' means a RST came back: the host is up but no socket listens on that port. A silent drop by a firewall shows up as a timeout instead. Check with ss -tlnp.",
    optionExplanations: ["Correct.", "localhost doesn't depend on DNS servers.", "Drops cause timeouts, not refusals.", "Plain HTTP uses no certificate."]
  },
  {
    id: "cn-infra-030", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "medium", type: "concept",
    question: "What happens after the browser receives the HTML response?",
    options: ["Nothing; the page is complete", "It closes all connections immediately", "It parses HTML into the DOM, discovers CSS, JS and images and fetches them (reusing connections), builds the CSSOM, runs scripts, computes layout and paints. Render-blocking CSS and synchronous scripts delay first paint", "It sends the HTML back to the server"],
    answer: 2,
    explanation: "Optimisations: async/defer scripts, preload hints, inlining critical CSS, compressing and caching assets.",
    optionExplanations: ["Sub-resources still load.", "Connections are kept alive for reuse.", "Correct.", "Not the case."]
  },
  {
    id: "cn-infra-031", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "hard", type: "concept",
    question: "Why can a DNS change to a new server IP still leave some users hitting the old server a day later, even with a 5-minute TTL?",
    options: ["Some resolvers, OS/browser caches and long-lived clients don't honour TTLs, or apps cache the IP for the life of a process or keep persistent connections open; and if the TTL was high before the change, caches hold the old record until that original TTL expires", "DNS TTLs are ignored entirely", "DNS updates take exactly 24 hours", "The new server rejects requests"],
    answer: 0,
    explanation: "Best practice: lower the TTL well in advance of a migration, keep the old server serving (or redirecting) for a while, and drain connections gradually.",
    optionExplanations: ["Correct.", "Most resolvers honour them.", "Propagation isn't a fixed delay.", "Not implied."]
  },
  {
    id: "cn-infra-032", subject: "networks", subtopic: "Web Infrastructure & Scenarios", difficulty: "easy", type: "concept",
    question: "Which tool would you use to see exactly which IP address a hostname resolves to and which DNS server answered?",
    options: ["ping", "dig (or nslookup)", "ss", "tcpdump"],
    answer: 1,
    explanation: "dig example.com shows the answer records, TTLs and the responding server; dig +trace follows the delegation from the root servers.",
    optionExplanations: ["ping shows the IP but not DNS details.", "Correct.", "That lists sockets.", "Possible, but overkill."]
  }
);
