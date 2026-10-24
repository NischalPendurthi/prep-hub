/* Computer Networks — HTTP & Web Protocols */
window.QUESTIONS.push(
  {
    id: "cn-http-001", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "What does it mean that HTTP is 'stateless'?",
    options: ["Each request is independent: the server keeps no memory of previous requests from the same client by default; state (logins, carts) is added on top with cookies, sessions or tokens", "HTTP can't transfer files", "HTTP has no headers", "HTTP connections can't be reused"],
    answer: 0,
    explanation: "Statelessness makes servers simple and horizontally scalable (any server can handle any request). Applications reintroduce state explicitly, often in a shared store like Redis.",
    optionExplanations: ["Correct.", "HTTP transfers any content.", "Headers are central to HTTP.", "Persistent connections are about transport, not application state."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-http-002", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "What are the parts of an HTTP/1.1 request?",
    options: ["Only a URL", "A status code and body", "A request line (method, path, version, e.g. GET /index.html HTTP/1.1), headers (Host, User-Agent, Accept, Cookie...), a blank line, and an optional body", "Binary frames only"],
    answer: 2,
    explanation: "A response has a status line (HTTP/1.1 200 OK), headers (Content-Type, Content-Length, Set-Cookie...), a blank line, and the body. HTTP/2 encodes the same semantics in binary frames.",
    optionExplanations: ["Requests have methods and headers too.", "Status codes belong to responses.", "Correct.", "That's HTTP/2's wire format."]
  },
  {
    id: "cn-http-003", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "Which HTTP method is typically used for each action: fetch a resource, create a resource, replace a resource, partially update it, delete it?",
    options: ["GET, PUT, POST, DELETE, PATCH", "POST, GET, PATCH, PUT, DELETE", "GET, POST, PUT, PATCH, DELETE", "GET, GET, POST, POST, DELETE"],
    answer: 2,
    explanation: "REST conventions: GET reads, POST creates (or triggers processing), PUT replaces the full resource at a known URI, PATCH applies partial changes, DELETE removes. HEAD is GET without a body; OPTIONS asks what's allowed (used in CORS preflight).",
    optionExplanations: ["POST and PUT are swapped.", "GET and POST are swapped.", "Correct.", "Different actions use different methods."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-http-004", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "Which HTTP methods are idempotent, and which is NOT?",
    options: ["GET, HEAD, PUT, DELETE (and OPTIONS) are idempotent — repeating them has the same effect as doing them once; POST is not (two POSTs may create two orders). PATCH is not guaranteed idempotent", "Only GET is idempotent", "All methods are idempotent", "DELETE isn't idempotent"],
    answer: 0,
    explanation: "SAFE methods (GET, HEAD, OPTIONS) don't change server state at all. Idempotency matters for retries: clients and proxies can safely retry idempotent requests after timeouts; for POST, idempotency keys are used.",
    optionExplanations: ["Correct.", "PUT and DELETE are idempotent too.", "POST isn't.", "Deleting twice leaves the same state."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-http-005", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "What do the HTTP status code classes mean?",
    options: ["1xx error, 2xx redirect, 3xx success", "1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error", "They're random", "4xx is success"],
    answer: 1,
    explanation: "Examples: 101 Switching Protocols, 200 OK, 201 Created, 204 No Content, 301/302 redirects, 304 Not Modified, 400 Bad Request, 404 Not Found, 500 Internal Server Error, 503 Service Unavailable.",
    optionExplanations: ["Shuffled.", "Correct.", "They follow a scheme.", "4xx are client errors."]
  },
  {
    id: "cn-http-006", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What's the difference between 401 Unauthorized and 403 Forbidden?",
    options: ["401: the request lacks valid authentication — log in / send credentials (sent with WWW-Authenticate); 403: the server knows who you are (or doesn't care) but you're not allowed to access the resource", "They're identical", "403 means not found", "401 is a server error"],
    answer: 0,
    explanation: "Despite its name, 401 is about authentication; 403 is about authorization. Some APIs return 404 instead of 403 to avoid revealing that a resource exists.",
    optionExplanations: ["Correct.", "They signal different problems.", "Not found is 404.", "Both are client errors."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-http-007", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "How do 301, 302, 307 and 308 redirects differ?",
    options: ["They're all the same", "302 is permanent", "301 Moved Permanently and 308 Permanent Redirect are permanent (cached, search engines update links); 302 Found and 307 Temporary Redirect are temporary. 307/308 forbid changing the method (a POST stays a POST), while browsers historically turned 301/302 POSTs into GETs", "307 changes the method to GET"],
    answer: 2,
    explanation: "Use 301/308 for permanent moves (e.g. HTTP → HTTPS), 302/307 for temporary ones. 303 See Other explicitly tells the client to GET another URL after a POST (Post/Redirect/Get pattern).",
    optionExplanations: ["They differ in permanence and method handling.", "302 is temporary.", "Correct.", "307 preserves the method."]
  },
  {
    id: "cn-http-008", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What's the difference between 502 Bad Gateway and 504 Gateway Timeout?",
    options: ["Both come from a proxy/load balancer: 502 means the upstream server returned an invalid response (e.g. crashed, closed the connection); 504 means the upstream didn't respond in time", "They're identical", "502 is a client error", "504 means the page doesn't exist"],
    answer: 0,
    explanation: "503 Service Unavailable means the server itself is overloaded or in maintenance (often with Retry-After). 429 Too Many Requests means the client exceeded a rate limit.",
    optionExplanations: ["Correct.", "They indicate different upstream failures.", "5xx are server-side errors.", "That's 404."]
  },
  {
    id: "cn-http-009", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "What does 304 Not Modified mean?",
    options: ["The resource was deleted", "The server is down", "The client sent a conditional request (If-None-Match with an ETag, or If-Modified-Since) and the resource hasn't changed, so the server returns no body and the client uses its cached copy", "The request was malformed"],
    answer: 2,
    explanation: "Conditional requests save bandwidth: the cache revalidates rather than re-downloading. Strong caching (Cache-Control: max-age) avoids even that round trip until the content expires.",
    optionExplanations: ["That's 404/410.", "That's 5xx.", "Correct.", "That's 400."]
  },
  {
    id: "cn-http-010", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What did HTTP/1.1 add over HTTP/1.0?",
    options: ["Binary framing", "Persistent connections by default (keep-alive), the mandatory Host header (enabling virtual hosting of many sites on one IP), chunked transfer encoding, pipelining (rarely used), and better caching controls", "Server push", "QUIC transport"],
    answer: 1,
    explanation: "HTTP/1.0 opened a new TCP connection per request by default. Pipelining in 1.1 suffered from head-of-line blocking and was disabled in browsers; browsers opened ~6 parallel connections per host instead.",
    optionExplanations: ["That's HTTP/2.", "Correct.", "That's HTTP/2 (now deprecated).", "That's HTTP/3."]
  },
  {
    id: "cn-http-011", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What are HTTP/2's key features?",
    options: ["Text-based messages over UDP", "Binary framing, multiplexing many concurrent streams over ONE TCP connection, header compression (HPACK), stream prioritisation, and server push (now deprecated by browsers)", "No headers at all", "A new set of methods"],
    answer: 1,
    explanation: "Multiplexing removes HTTP-level head-of-line blocking and the need for many connections. But all streams share one TCP connection, so a single packet loss stalls every stream (TCP-level HOL blocking).",
    optionExplanations: ["HTTP/2 runs over TCP and is binary.", "Correct.", "Headers are compressed, not removed.", "Methods are unchanged."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-http-012", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "How does HTTP/3 differ from HTTP/2 at the transport level?",
    options: ["It uses SCTP", "It uses raw IP", "It removes encryption", "It runs over QUIC on UDP: TLS 1.3 is built in (1-RTT, or 0-RTT for resumed connections), streams are independent so one loss doesn't block others, and connections can migrate across networks (Wi-Fi → mobile) via connection IDs"],
    answer: 3,
    explanation: "QUIC implements reliability and congestion control in user space, enabling faster evolution than kernel TCP. Because UDP may be blocked, clients fall back to HTTP/2 over TCP.",
    optionExplanations: ["SCTP isn't used.", "It runs over UDP.", "QUIC mandates encryption.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-http-013", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "hard", type: "numerical",
    question: "A page has a base HTML file plus 10 small images on the same server. Ignoring transmission times, how many RTTs does it take with (a) non-persistent HTTP, one connection at a time, (b) persistent HTTP without pipelining, (c) persistent HTTP with pipelining?",
    options: ["(a) 11, (b) 11, (c) 2", "(a) 22, (b) 22, (c) 12", "(a) 20, (b) 10, (c) 1", "(a) 22, (b) 12, (c) 3"],
    answer: 3,
    explanation: "(a) Each of 11 objects needs a TCP handshake (1 RTT) + request/response (1 RTT): 22 RTTs. (b) One handshake (1) + base file (1) + 10 sequential requests (10) = 12. (c) Handshake (1) + base (1) + all 10 images requested back-to-back (1) = 3 RTTs.",
    optionExplanations: ["Each non-persistent object costs 2 RTTs.", "Persistence avoids repeated handshakes.", "The base HTML also costs RTTs.", "Correct."]
  },
  {
    id: "cn-http-014", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "What is an HTTP cookie?",
    options: ["A cached copy of a page", "A type of virus", "A small name=value piece of data the server sets via the Set-Cookie response header; the browser stores it and sends it back in the Cookie header on later requests to that site, enabling sessions and preferences", "An encryption key"],
    answer: 2,
    explanation: "Cookies make stateless HTTP stateful from the application's point of view: e.g. a session ID cookie maps to server-side session data.",
    optionExplanations: ["That's caching.", "Cookies are plain data.", "Correct.", "Cookies aren't keys (though they may hold tokens)."]
  },
  {
    id: "cn-http-015", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What do the cookie attributes Secure, HttpOnly and SameSite do?",
    options: ["They encrypt the cookie", "Secure: send only over HTTPS. HttpOnly: JavaScript can't read it (limits theft via XSS). SameSite (Strict/Lax/None): restricts sending the cookie on cross-site requests (mitigates CSRF)", "They set expiry dates", "They compress the cookie"],
    answer: 1,
    explanation: "Expires/Max-Age control lifetime; Domain and Path control scope. Session cookies should normally be Secure; HttpOnly; SameSite=Lax (or Strict).",
    optionExplanations: ["They don't encrypt.", "Correct.", "That's Expires/Max-Age.", "No compression is involved."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-http-016", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "How do server-side sessions differ from stateless tokens such as JWTs?",
    options: ["They're identical", "Sessions don't use cookies", "JWTs are encrypted passwords", "Sessions: the cookie holds a random session ID; user data lives on the server (easy to revoke, needs shared storage). JWT: a signed token carries the claims itself, so any server can verify it without a lookup (scales easily, but hard to revoke before expiry)"],
    answer: 3,
    explanation: "JWTs are signed (integrity), not encrypted by default, so they shouldn't contain secrets. Short lifetimes plus refresh tokens are the common revocation compromise.",
    optionExplanations: ["They store state in different places.", "Sessions commonly use cookies.", "JWTs aren't passwords.", "Correct."]
  },
  {
    id: "cn-http-017", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What does `Cache-Control: max-age=3600` mean, and how does `no-cache` differ from `no-store`?",
    options: ["Delete after 1 hour; they're identical", "no-cache forbids storing", "max-age is in minutes", "The response may be reused from cache for 3600 seconds without contacting the server. no-cache: you may store it but must revalidate before each use; no-store: don't store it at all (sensitive data)"],
    answer: 3,
    explanation: "Other directives: public/private (shared caches like CDNs vs only the browser), immutable, s-maxage for CDNs. ETags enable cheap revalidation.",
    optionExplanations: ["They differ importantly.", "That's no-store.", "max-age is in seconds.", "Correct."]
  },
  {
    id: "cn-http-018", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What is CORS, and when does the browser send a preflight OPTIONS request?",
    options: ["Cross-Origin Resource Sharing lets a server allow pages from other origins to read its responses (via Access-Control-Allow-Origin etc.). Browsers send a preflight OPTIONS request before 'non-simple' cross-origin requests (e.g. PUT/DELETE, JSON content type, custom headers) to ask permission", "A server-side firewall", "A compression standard", "A cookie attribute"],
    answer: 0,
    explanation: "CORS relaxes the browser's same-origin policy; it's enforced by browsers, not servers, so it doesn't protect APIs from non-browser clients.",
    optionExplanations: ["Correct.", "It's a browser mechanism.", "Not compression.", "Not a cookie attribute."]
  },
  {
    id: "cn-http-019", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "Which are the components of the URL https://shop.example.com:8443/items/42?sort=price#reviews?",
    options: ["Only a domain", "Protocol, IP, MAC, port", "Scheme (https), host (shop.example.com), port (8443), path (/items/42), query string (sort=price), fragment (reviews)", "Domain, cookie, session"],
    answer: 2,
    explanation: "The fragment is handled by the browser only and isn't sent to the server. Without an explicit port, https implies 443 and http implies 80.",
    optionExplanations: ["URLs have several parts.", "MAC addresses never appear in URLs.", "Correct.", "Cookies and sessions aren't URL parts."]
  },
  {
    id: "cn-http-020", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "How does a WebSocket connection start, and what does it provide?",
    options: ["It's a new transport protocol over UDP", "It starts as an HTTP/1.1 request with `Upgrade: websocket`; the server replies 101 Switching Protocols, after which the same TCP connection carries full-duplex, low-overhead message frames in both directions", "It polls the server every second", "It requires HTTP/3"],
    answer: 1,
    explanation: "WebSockets suit chat, live dashboards, multiplayer games and collaborative editing, where the server must push updates without the client asking.",
    optionExplanations: ["It runs over TCP.", "Correct.", "That's polling.", "It works over HTTP/1.1 (and HTTP/2 via extended CONNECT)."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-http-021", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "Compare short polling, long polling, Server-Sent Events (SSE) and WebSockets for real-time updates.",
    options: ["They're identical", "Short polling: repeated requests on a timer (simple, wasteful). Long polling: the server holds each request open until there's data. SSE: one long-lived HTTP response streaming server→client events. WebSockets: full-duplex messages both ways", "WebSockets are one-way", "SSE requires UDP"],
    answer: 1,
    explanation: "SSE is great for one-way feeds (notifications, stock tickers) with automatic reconnection; WebSockets are needed when clients also send frequent messages.",
    optionExplanations: ["They have different trade-offs.", "Correct.", "WebSockets are bidirectional.", "SSE uses HTTP over TCP."]
  },
  {
    id: "cn-http-022", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "What is HTTPS?",
    options: ["HTTP sent over a TLS-encrypted connection (default port 443), providing confidentiality, integrity and server authentication via certificates", "A different protocol from HTTP with new methods", "HTTP over UDP", "HTTP with compression"],
    answer: 0,
    explanation: "The HTTP messages are unchanged; TLS wraps the TCP connection. Browsers mark plain HTTP as 'Not secure', and HSTS can force HTTPS.",
    optionExplanations: ["Correct.", "The HTTP semantics are identical.", "That's closer to HTTP/3.", "Compression is separate."]
  },
  {
    id: "cn-http-023", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "Which request header lets one IP address host many different websites, and why?",
    options: ["User-Agent", "Content-Length", "Accept-Language", "Host: the client states which domain it wants (e.g. Host: blog.example.com), so the server picks the matching virtual host; for HTTPS, the TLS SNI extension does the same during the handshake so the right certificate is presented"],
    answer: 3,
    explanation: "Host became mandatory in HTTP/1.1. Without it (and SNI), each HTTPS site would need its own IP address.",
    optionExplanations: ["That identifies the client software.", "That's the body size.", "That's for content negotiation.", "Correct."]
  },
  {
    id: "cn-http-024", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "Which are core REST principles?",
    options: ["Every request must use POST", "Persistent server-side sessions for every client", "Binary-only payloads", "Resources identified by URIs, uniform interface via standard HTTP methods and status codes, stateless requests, cacheable responses, client–server separation and a layered system"],
    answer: 3,
    explanation: "Good REST design uses nouns for resources (/users/42/orders) and HTTP methods for actions, rather than verbs in URLs (/getOrders).",
    optionExplanations: ["REST uses all methods appropriately.", "Statelessness is a REST constraint.", "JSON/XML are common.", "Correct."]
  },
  {
    id: "cn-http-025", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What does the Content-Type header specify, and how does the client indicate preferred formats?",
    options: ["The media (MIME) type of the body, e.g. application/json; charset=utf-8. Clients use Accept (and Accept-Language, Accept-Encoding) for content negotiation", "The response size", "The cookie format", "The TLS version"],
    answer: 0,
    explanation: "Content-Encoding (gzip, br) describes compression; Content-Length gives the body size; Authorization carries credentials such as Bearer tokens.",
    optionExplanations: ["Correct.", "That's Content-Length.", "Cookies have their own headers.", "TLS isn't negotiated with headers."]
  },
  {
    id: "cn-http-026", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "hard", type: "concept",
    question: "A client retries a POST /payments request after a network timeout, and the customer is charged twice. What's the standard fix?",
    options: ["Make the operation idempotent: the client sends a unique Idempotency-Key header; the server stores the key with the result and returns the same result for retries instead of charging again", "Switch to GET", "Increase the timeout to infinity", "Use HTTP/2"],
    answer: 0,
    explanation: "Timeouts are ambiguous: the request may have succeeded. Payment APIs (e.g. Stripe) use idempotency keys so retries are safe.",
    optionExplanations: ["Correct.", "GET must not change state.", "Timeouts can't be eliminated.", "The protocol version doesn't fix duplicates."]
  },
  {
    id: "cn-http-027", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "hard", type: "concept",
    question: "How does HTTP/2's HPACK header compression save bandwidth?",
    options: ["It gzips the whole connection", "Both sides maintain a static table of common headers and a dynamic table of previously sent headers; repeated headers (cookies, user agent) are sent as small index references, and new values use Huffman coding", "It removes all headers", "It encrypts headers"],
    answer: 1,
    explanation: "HTTP/1.1 resends verbose headers on every request. HPACK's design avoids the CRIME attack that made compressing headers with plain DEFLATE over TLS dangerous. HTTP/3 uses QPACK, adapted to out-of-order streams.",
    optionExplanations: ["Whole-connection DEFLATE is avoided for security.", "Correct.", "Headers still exist.", "Encryption is TLS's job."]
  },
  {
    id: "cn-http-028", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What is gRPC, and why does it use HTTP/2?",
    options: ["A database", "A replacement for TCP", "An RPC framework using Protocol Buffers for compact binary messages over HTTP/2, whose multiplexed streams enable many concurrent calls and bidirectional streaming over one connection", "A JSON-only REST library"],
    answer: 2,
    explanation: "gRPC is popular for internal microservice communication; browsers need gRPC-Web via a proxy since they can't control HTTP/2 framing directly.",
    optionExplanations: ["It's an RPC framework.", "It runs on top of HTTP/2 and TCP.", "Correct.", "It uses protobuf, not JSON."]
  },
  {
    id: "cn-http-029", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "hard", type: "concept",
    question: "Why did browsers using HTTP/1.1 open about six TCP connections per host, and why did 'domain sharding' become an anti-pattern with HTTP/2?",
    options: ["To bypass firewalls", "HTTP/1.1 handles one outstanding request per connection (pipelining unusable), so parallelism required multiple connections; with HTTP/2's multiplexing, one connection suffices and extra connections/domains add handshakes, defeat prioritisation and hurt congestion control", "Because servers required it", "HTTP/2 can't handle multiple domains"],
    answer: 1,
    explanation: "Many HTTP/1.1-era optimisations (sprites, concatenated bundles, sharding) became unnecessary or counterproductive with HTTP/2.",
    optionExplanations: ["It was about request parallelism.", "Correct.", "Browsers chose the limit.", "HTTP/2 works with any domain."]
  },
  {
    id: "cn-http-030", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "What does 429 Too Many Requests indicate, and which header helps clients respond?",
    options: ["A server crash", "Authentication failed", "The resource was moved", "The client exceeded a rate limit; the server may include Retry-After to say how long to wait, and clients should back off (often exponentially with jitter)"],
    answer: 3,
    explanation: "Rate limiting protects APIs from abuse and overload. Many APIs also expose X-RateLimit-Remaining-style headers.",
    optionExplanations: ["That's 5xx.", "That's 401.", "That's 3xx.", "Correct."]
  },
  {
    id: "cn-http-031", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "easy", type: "concept",
    question: "What does the HEAD method do?",
    options: ["Deletes headers", "Returns only the body", "Uploads headers", "Same as GET but the server returns only the status line and headers, no body — useful to check existence, size (Content-Length) or freshness without downloading"],
    answer: 3,
    explanation: "HEAD is safe and idempotent. Download managers use it to learn file sizes before ranged GETs.",
    optionExplanations: ["It doesn't modify anything.", "The body is omitted.", "It's a read operation.", "Correct."]
  },
  {
    id: "cn-http-032", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "medium", type: "concept",
    question: "When is 201 Created preferred over 200 OK, and when is 204 No Content used?",
    options: ["Never", "201 is an error", "201 after a request (typically POST) creates a new resource, often with a Location header pointing to it; 204 when the request succeeded but there's no body to return (e.g. a DELETE or a PUT without a response body)", "204 means not found"],
    answer: 2,
    explanation: "Precise status codes let clients and intermediaries react correctly without parsing bodies.",
    optionExplanations: ["They have specific uses.", "2xx means success.", "Correct.", "Not found is 404."]
  },
{
    id: "cn-http-033", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "hard", type: "concept",
    question: "On a lossy mobile network, why can HTTP/2 over one TCP connection sometimes load a page SLOWER than HTTP/1.1 with six parallel connections?",
    options: ["HTTP/2 has bigger headers", "Every HTTP/2 stream shares one TCP connection: a single lost packet stalls all streams (TCP head-of-line blocking) and halves one congestion window, whereas six HTTP/1.1 connections lose only one connection's progress and have six independent windows", "HTTP/2 doesn't support images", "HTTP/1.1 uses UDP"],
    answer: 1,
    explanation: "This weakness motivated HTTP/3 over QUIC, where streams are independent at the transport layer.",
    optionExplanations: ["HPACK makes HTTP/2 headers smaller.", "Correct.", "HTTP/2 carries any content.", "HTTP/1.1 uses TCP."]
  },
  {
    id: "cn-http-034", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "hard", type: "numerical",
    question: "A page has a base HTML file and 10 images. The browser uses non-persistent HTTP with up to 5 parallel connections for the images. Ignoring transmission time, how many RTTs until everything is loaded?",
    options: ["4", "6", "12", "22"],
    answer: 1,
    explanation: "Base HTML: TCP handshake + request = 2 RTTs. The 10 images go in 2 rounds of 5 parallel connections, each round costing 2 RTTs (handshake + request) = 4 RTTs. Total = 2 + 4 = 6.",
    optionExplanations: ["Each round needs a handshake too.", "Correct.", "That's persistent without parallelism or pipelining.", "That's fully sequential non-persistent HTTP."]
  },
  {
    id: "cn-http-035", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "hard", type: "concept",
    question: "A response was generated at 10:00:00 with `Cache-Control: max-age=600` and an ETag. What does the browser do for the same URL at 10:08:00 and at 10:12:00?",
    options: ["Re-downloads both times", "At 10:08 (age 480 s < 600) it uses the cached copy without contacting the server; at 10:12 (stale) it revalidates with If-None-Match: <etag>, and if unchanged the server replies 304 Not Modified with no body", "Uses the cache both times without checking", "Deletes the cache at 10:10"],
    answer: 1,
    explanation: "Freshness avoids requests entirely; validation (ETag/Last-Modified) avoids re-downloading unchanged content. Together they minimise both latency and bandwidth.",
    optionExplanations: ["The first request is served from a fresh cache.", "Correct.", "After 600 s the response is stale.", "Stale entries are revalidated, not necessarily deleted."]
  },
  {
    id: "cn-http-036", subject: "networks", subtopic: "HTTP & Web Protocols", difficulty: "hard", type: "concept",
    question: "The first `DELETE /items/5` returns 204 and a retry returns 404. Does this violate DELETE's idempotency?",
    options: ["Yes, because the responses differ", "No: idempotency is about the resulting SERVER STATE (the item is gone after one call or many), not about identical responses", "Yes, DELETE must always return 204", "No, because DELETE isn't idempotent"],
    answer: 1,
    explanation: "RFC 9110 defines idempotent methods by their intended effect on the server. Retrying a DELETE leaves the same state, even though the status code may change.",
    optionExplanations: ["Responses may differ; the effect is what matters.", "Correct.", "404 on repeat is common and acceptable.", "DELETE is idempotent."],
    tags: ["trap"]
  }
);
