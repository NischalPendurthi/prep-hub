/* Computer Networks — Error Detection & Correction */
window.QUESTIONS.push(
  {
    id: "cn-error-001", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "easy", type: "concept",
    question: "What's the difference between a single-bit error and a burst error?",
    options: ["They're the same", "Single-bit errors are more common in long transmissions", "Burst errors only occur in wireless networks", "A single-bit error changes exactly one bit of a data unit; a burst error changes two or more bits, and its length is measured from the first corrupted bit to the last (bits in between may or may not be corrupted)"],
    answer: 3,
    explanation: "Noise usually lasts longer than one bit time, so burst errors are common, especially at high data rates. CRC is specifically good at detecting bursts.",
    optionExplanations: ["They differ in extent.", "Longer noise affects multiple bits, causing bursts.", "Bursts occur on wired links too.", "Correct."]
  },
  {
    id: "cn-error-002", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "easy", type: "numerical",
    question: "Using EVEN parity, what parity bit is appended to the 7-bit data 1011001?",
    options: ["0", "1", "It depends on the receiver", "2"],
    answer: 0,
    explanation: "The data has four 1s (1, 1, 1, 1). Even parity makes the total number of 1s even, so the parity bit is 0. With odd parity it would be 1.",
    optionExplanations: ["Correct.", "That would be odd parity.", "The sender computes parity from the data alone.", "A parity bit is a single bit."]
  },
  {
    id: "cn-error-003", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "easy", type: "concept",
    question: "What can a single parity bit detect?",
    options: ["All errors", "Any ODD number of bit errors (1, 3, 5...), but no even number (2, 4...) because they cancel out in the parity", "Only burst errors", "It can correct single-bit errors"],
    answer: 1,
    explanation: "Flipping two bits keeps the count of 1s' parity unchanged, so the receiver sees no problem. Parity also can't locate the error, so it can't correct it.",
    optionExplanations: ["Even numbers of errors slip through.", "Correct.", "Long bursts with even flips go undetected.", "Parity alone can't locate the error."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-error-004", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "concept",
    question: "What can two-dimensional parity (row and column parity over a block) do that single parity can't?",
    options: ["Nothing more", "Correct all multi-bit errors", "Detect all 1-, 2- and 3-bit errors and CORRECT any single-bit error (the failing row and column intersect at it); some 4-bit patterns (rectangle corners) still go undetected", "Detect only even numbers of errors"],
    answer: 2,
    explanation: "A single flipped bit causes exactly one row and one column parity to fail, pinpointing it. Four errors at the corners of a rectangle leave every row and column parity correct.",
    optionExplanations: ["It's significantly stronger.", "Correction is limited to single-bit errors.", "Correct.", "It detects odd counts too."]
  },
  {
    id: "cn-error-005", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "numerical",
    question: "Using 4-bit one's-complement arithmetic, what is the checksum for the data words 7, 11, 12, 0, 6?",
    options: ["9", "6", "36", "15"],
    answer: 0,
    explanation: "Sum = 7 + 11 + 12 + 0 + 6 = 36 = 100100₂. Wrap the carries: 0100 + 10 = 0110 (6). The checksum is the one's complement: 1001 = 9. The receiver adds all words plus the checksum; the wrapped sum should be 1111 (complement 0).",
    optionExplanations: ["Correct.", "That's the wrapped sum before complementing.", "That's the raw sum without wrapping.", "That's all ones, the receiver's expected result."]
  },
  {
    id: "cn-error-006", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "numerical",
    question: "The Internet checksum is computed over the 16-bit words 0x1234 and 0xF00F. What is the checksum?",
    options: ["0xFDBB", "0x0244", "0x10243", "0x0243"],
    answer: 0,
    explanation: "0x1234 + 0xF00F = 0x10243. The carry out of 16 bits wraps around (end-around carry): 0x0243 + 0x1 = 0x0244. The checksum is the one's complement: ~0x0244 = 0xFDBB. IPv4 headers, TCP and UDP use this algorithm.",
    optionExplanations: ["Correct.", "That's the wrapped sum, before complementing.", "That's the raw 17-bit sum.", "That ignores the end-around carry."]
  },
  {
    id: "cn-error-007", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "concept",
    question: "Which error pattern can the Internet checksum (one's-complement sum of 16-bit words) FAIL to detect?",
    options: ["Any single-bit error", "A completely zeroed packet with a non-zero checksum", "A single flipped bit in the header", "Two 16-bit words swapped in order (addition is commutative), or offsetting errors where one word increases and another decreases by the same amount"],
    answer: 3,
    explanation: "The checksum is cheap to compute in software but weaker than CRC. That's why link layers use CRC-32 (Ethernet) while the end-to-end checksum in TCP/UDP is a lighter backup.",
    optionExplanations: ["Single-bit errors are detected.", "That changes the sum, so it's detected.", "That's detected.", "Correct."]
  },
  {
    id: "cn-error-008", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "numerical",
    question: "Data 100100 is sent with CRC generator 1101 (x³ + x² + 1). What is the CRC (remainder) and the transmitted frame?",
    options: ["Remainder 001; frame 100100001", "Remainder 100; frame 100100100", "Remainder 011; frame 100100011", "Remainder 000; frame 100100000"],
    answer: 0,
    explanation: "Append 3 zeros (degree 3): 100100000. Divide by 1101 using modulo-2 (XOR) division; the remainder is 001. Transmit data followed by the remainder: 100100001, which is exactly divisible by 1101, so the receiver gets remainder 0 if there are no errors.",
    optionExplanations: ["Correct.", "Redo the XOR division.", "Redo the XOR division.", "100100000 isn't divisible by 1101."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-error-009", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "numerical",
    question: "Data 1101011011 with generator 10011 (x⁴ + x + 1). What frame is transmitted?",
    options: ["11010110110000", "11010110111110", "11010110111011", "1101011011111"],
    answer: 1,
    explanation: "Append 4 zeros: 11010110110000. Modulo-2 division by 10011 leaves remainder 1110. The transmitted frame is the data followed by the remainder: 11010110111110. (Classic Tanenbaum example.)",
    optionExplanations: ["That's the data with zeros appended, before division.", "Correct.", "Redo the division; the remainder is 1110.", "The remainder must be 4 bits for a degree-4 generator."]
  },
  {
    id: "cn-error-010", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "numerical",
    question: "A receiver using generator 10011 receives 11010110111010 (the correct frame was 11010110111110). What remainder does it compute, and what does it conclude?",
    options: ["0000; no error", "0100; error detected, frame discarded (or retransmission requested)", "1110; error corrected", "0001; bit 1 is wrong"],
    answer: 1,
    explanation: "Dividing the received frame by 10011 gives a non-zero remainder (0100), so an error is detected. Plain CRC detects but doesn't correct; recovery relies on retransmission (ARQ) or higher layers.",
    optionExplanations: ["The frame was corrupted, so the remainder isn't zero.", "Correct.", "CRC doesn't correct errors.", "CRC remainders don't directly point to bit positions."]
  },
  {
    id: "cn-error-011", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "easy", type: "concept",
    question: "In CRC, how many check bits are appended for a generator polynomial of degree r?",
    options: ["r + 1", "2r", "r", "1"],
    answer: 2,
    explanation: "A degree-r generator has r + 1 bits, and the remainder of modulo-2 division by it has r bits. CRC-32 (Ethernet's FCS) uses a degree-32 generator, appending 32 bits (4 bytes).",
    optionExplanations: ["That's the length of the generator itself.", "Too many.", "Correct.", "Only parity uses a single bit."]
  },
  {
    id: "cn-error-012", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "concept",
    question: "Which statement about CRC error-detection guarantees is correct for a well-chosen degree-r generator?",
    options: ["It detects all single-bit errors, all double-bit errors (with suitable generators), all odd numbers of errors if the generator has (x + 1) as a factor, and ALL burst errors of length ≤ r; longer bursts slip through with probability about 2^(−r)", "It detects every possible error", "It detects only single-bit errors", "It corrects all burst errors"],
    answer: 0,
    explanation: "These properties come from polynomial algebra over GF(2): an error polynomial goes undetected only if it's divisible by the generator. That's why CRC-32 is extremely effective for link-level corruption, yet not a cryptographic integrity check (an attacker can forge matching CRCs).",
    optionExplanations: ["Correct.", "Errors divisible by the generator go undetected.", "It detects much more.", "CRC is a detection code."]
  },
  {
    id: "cn-error-013", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "easy", type: "numerical",
    question: "What is the Hamming distance between 10101 and 11110?",
    options: ["1", "2", "3", "4"],
    answer: 2,
    explanation: "Hamming distance = number of positions in which two codewords differ = number of 1s in their XOR: 10101 ⊕ 11110 = 01011, which has three 1s.",
    optionExplanations: ["More than one bit differs.", "Recount the differing positions.", "Correct.", "Only three positions differ."]
  },
  {
    id: "cn-error-014", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "concept",
    question: "A code has minimum Hamming distance 5. How many bit errors can it always DETECT, and how many can it always CORRECT?",
    options: ["Detect 5, correct 5", "Detect 2, correct 4", "Detect 4, correct 2", "Detect 5, correct 2"],
    answer: 2,
    explanation: "To detect d errors you need d_min ≥ d + 1 → d = 4. To correct t errors you need d_min ≥ 2t + 1 → t = 2. Intuitively, a corrupted word must stay closer to the original codeword than to any other.",
    optionExplanations: ["5 errors could turn one codeword into another.", "Reversed.", "Correct.", "Detection needs d_min ≥ d + 1."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-error-015", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "numerical",
    question: "How many redundant (parity) bits does a Hamming code need to correct single-bit errors in 7 data bits?",
    options: ["3", "7", "5", "4"],
    answer: 3,
    explanation: "Condition: 2^r ≥ m + r + 1, so the syndrome can point at any of the m + r positions or 'no error'. For m = 7: r = 3 gives 8 < 11 ✗; r = 4 gives 16 ≥ 12 ✓. So 4 bits, giving an 11-bit codeword.",
    optionExplanations: ["2³ = 8 < 7 + 3 + 1.", "Far more than needed.", "4 is already enough.", "Correct."]
  },
  {
    id: "cn-error-016", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "numerical",
    question: "Hamming(7,4) with even parity: parity bits at positions 1, 2, 4 and data bits d1 d2 d3 d4 at positions 3, 5, 6, 7. What is the codeword for data 1011?",
    options: ["0110011", "1011010", "0110101", "1010011"],
    answer: 0,
    explanation: "Positions: 3 = 1, 5 = 0, 6 = 1, 7 = 1. p1 checks 1,3,5,7: 1 + 0 + 1 → p1 = 0. p2 checks 2,3,6,7: 1 + 1 + 1 → p2 = 1. p4 checks 4,5,6,7: 0 + 1 + 1 → p4 = 0. Codeword (positions 1–7): 0 1 1 0 0 1 1 = 0110011.",
    optionExplanations: ["Correct.", "The parity bits are in positions 1, 2 and 4.", "Recompute p4 and the data placement.", "Recompute the parity bits."],
    tags: ["interview-favourite"]
  },
  {
    id: "cn-error-017", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "numerical",
    question: "Hamming(7,4), even parity, parity at positions 1, 2, 4. The codeword 0110011 is received as 0110111. What does the syndrome indicate?",
    options: ["No error", "Two errors", "Syndrome 3: bit 3 is wrong", "Syndrome 5: bit 5 is wrong; flipping it restores 0110011"],
    answer: 3,
    explanation: "Recheck each parity: p1 over 1,3,5,7 = 0+1+1+1 = odd → fail (1). p2 over 2,3,6,7 = 1+1+1+1 = even → OK (0). p4 over 4,5,6,7 = 0+1+1+1 = odd → fail (4). Syndrome = 4 + 1 = 5, the position of the flipped bit.",
    optionExplanations: ["Two parity checks fail.", "A single flip explains the syndrome.", "Recompute: checks 1 and 4 fail → 5.", "Correct."]
  },
  {
    id: "cn-error-018", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "numerical",
    question: "Hamming(7,4), even parity, parity at positions 1, 2, 4. The received word is 1001101. Which bit (if any) is in error, and what are the corrected data bits (positions 3, 5, 6, 7)?",
    options: ["No error; data 0110", "Bit 1; data 0101", "Bit 4; data 0101", "Bit 7; corrected word 1001100, data 0100"],
    answer: 3,
    explanation: "Check p1 (1,3,5,7): 1+0+1+1 = odd → 1. p2 (2,3,6,7): 0+0+0+1 = odd → 2. p4 (4,5,6,7): 1+1+0+1 = odd → 4. Syndrome = 1 + 2 + 4 = 7 → flip bit 7: 1001100. Data bits at 3, 5, 6, 7 = 0, 1, 0, 0.",
    optionExplanations: ["All three checks fail.", "The syndrome is 7, not 1.", "The syndrome is 7, not 4.", "Correct."]
  },
  {
    id: "cn-error-019", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "concept",
    question: "When is forward error correction (FEC) preferred over error detection with retransmission (ARQ)?",
    options: ["Never", "When retransmission is expensive or impossible: high-latency links (satellite, deep space), one-way broadcast, real-time audio/video, or storage (ECC memory, disks); ARQ suits low-error, low-latency links because detection needs fewer redundant bits", "Only on wired LANs", "Only for TCP"],
    answer: 1,
    explanation: "FEC adds enough redundancy to repair errors at the receiver (Hamming, Reed-Solomon, LDPC, turbo codes). Wi-Fi, 4G/5G and QR codes rely on FEC; TCP and link-layer protocols use detection plus retransmission.",
    optionExplanations: ["FEC is widely used.", "Correct.", "Wireless and storage systems use FEC heavily.", "TCP uses detection and retransmission."]
  },
  {
    id: "cn-error-020", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "easy", type: "concept",
    question: "Which error-detection mechanism is used by Ethernet frames, and which by IPv4/TCP/UDP headers?",
    options: ["Both use parity", "Ethernet uses a 32-bit CRC (the Frame Check Sequence); IPv4 uses a 16-bit one's-complement header checksum, and TCP/UDP use a 16-bit checksum over a pseudo-header, header and data", "Ethernet uses a checksum; TCP uses CRC", "Neither uses error detection"],
    answer: 1,
    explanation: "Hardware computes CRC quickly; software-friendly checksums run end to end. IPv6 dropped its header checksum entirely, relying on link-layer CRC and upper-layer checksums.",
    optionExplanations: ["Parity is too weak for these.", "Correct.", "Reversed.", "Both layers detect errors."]
  },
  {
    id: "cn-error-021", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "numerical",
    question: "How many parity bits does a single-error-correcting Hamming code need for 16 data bits, and for 32 data bits?",
    options: ["4 and 5", "16 and 32", "6 and 7", "5 and 6"],
    answer: 3,
    explanation: "2^r ≥ m + r + 1. m = 16: r = 5 → 32 ≥ 22 ✓ (r = 4 gives 16 < 21). m = 32: r = 6 → 64 ≥ 39 ✓ (r = 5 gives 32 < 38). Overhead shrinks relative to data as m grows.",
    optionExplanations: ["4 bits can't cover 16 data bits.", "That would duplicate the data.", "One fewer suffices in each case.", "Correct."]
  },
  {
    id: "cn-error-022", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "concept",
    question: "Why can't a CRC protect a file download against a malicious attacker who modifies the data?",
    options: ["CRCs are too slow", "Attackers can't modify downloads", "CRCs can't be computed on files", "CRC is linear and has no secret: an attacker can modify data and recompute (or adjust a few bits to preserve) a valid CRC. Integrity against attackers needs a cryptographic MAC (e.g. HMAC-SHA256) or a digital signature"],
    answer: 3,
    explanation: "Error-detection codes defend against random noise; cryptographic hashes/MACs defend against intentional tampering. TLS uses AEAD ciphers (AES-GCM, ChaCha20-Poly1305) for this.",
    optionExplanations: ["Speed isn't the issue.", "Man-in-the-middle tampering is a real threat.", "CRCs work on any bit string.", "Correct."]
  },
  {
    id: "cn-error-023", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "concept",
    question: "Is the generator 1011 (x³ + x + 1) guaranteed to detect every odd number of bit errors?",
    options: ["Yes, every CRC detects odd errors", "Yes, because its degree is 3", "Not necessarily: that guarantee holds when the generator has (x + 1) as a factor (equivalently, an even number of terms); 1011 has three terms, so it isn't divisible by (x + 1)", "No CRC can detect odd numbers of errors"],
    answer: 2,
    explanation: "If (x + 1) divides G(x), every multiple of G evaluates to 0 at x = 1, i.e. has an even number of terms, so an error polynomial with an odd number of terms can never be a multiple. Many standard CRCs are chosen with this property (e.g. CRC-16 variants include (x + 1)).",
    optionExplanations: ["The property depends on the generator.", "Degree alone doesn't give this property.", "Correct.", "Suitable generators do detect them."]
  },
  {
    id: "cn-error-024", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "concept",
    question: "In the (7,4) Hamming code, what is the code rate and minimum Hamming distance?",
    options: ["4/7 and 3", "7/4 and 2", "3/7 and 4", "1/2 and 3"],
    answer: 0,
    explanation: "Rate = data bits / total bits = 4/7 ≈ 0.57. d_min = 3, so it corrects 1 error or detects 2 (but not both simultaneously). Adding an overall parity bit gives extended Hamming (8,4) with d_min = 4: SECDED (single-error correction, double-error detection), used in ECC memory.",
    optionExplanations: ["Correct.", "Rates are at most 1.", "The rate is data over total bits.", "The rate is 4/7, not 1/2."]
  },
  {
    id: "cn-error-025", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "numerical",
    question: "What is the transmitted frame for data 1001 with CRC generator 1011?",
    options: ["1001000", "1001110", "1001101", "1001011"],
    answer: 1,
    explanation: "Append 3 zeros: 1001000. XOR division by 1011: 1001 ⊕ 1011 = 0010 → bring down bits: 0100 → leading 0, 1000 ⊕ 1011 = 0011 → final remainder 110. Transmitted: 1001 followed by 110 = 1001110.",
    optionExplanations: ["That's before adding the remainder.", "Correct.", "Recompute the remainder (110).", "Recompute the XOR steps."]
  },
  {
    id: "cn-error-026", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "easy", type: "concept",
    question: "What is the difference between error detection and error correction?",
    options: ["They're the same", "Detection only determines THAT an error occurred (then discard/retransmit); correction also determines WHERE it occurred and fixes it, which needs more redundancy", "Correction needs less redundancy", "Detection fixes errors automatically"],
    answer: 1,
    explanation: "Parity, checksums and CRC are detection codes; Hamming, Reed-Solomon and LDPC are correction codes. The required minimum distance shows the cost difference: d + 1 to detect d errors vs 2t + 1 to correct t.",
    optionExplanations: ["They have different capabilities.", "Correct.", "Correction needs more redundancy.", "Detection doesn't fix anything."]
  },
  {
    id: "cn-error-027", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "hard", type: "concept",
    question: "A receiver computes the one's-complement sum of all received 16-bit words INCLUDING the checksum field. What result indicates no detected error?",
    options: ["0x0000", "Any even value", "0xFFFF (all ones), whose complement is 0", "The checksum value itself"],
    answer: 2,
    explanation: "The sender chose the checksum as the complement of the data sum, so data sum + checksum = 0xFFFF in one's-complement arithmetic. Receivers often complement the result and check for 0.",
    optionExplanations: ["The raw sum is all ones; its complement is 0.", "Parity of the sum isn't the test.", "Correct.", "That would be coincidental."]
  },
  {
    id: "cn-error-028", subject: "networks", subtopic: "Error Detection & Correction", difficulty: "medium", type: "concept",
    question: "Why does adding more redundancy improve error handling but reduce efficiency?",
    options: ["It doesn't reduce efficiency", "Redundancy increases the data rate", "Redundant bits carry no new data, so the fraction of useful bits (code rate) falls; the trade-off is choosing enough redundancy for the channel's error characteristics without wasting bandwidth", "Redundancy only affects latency"],
    answer: 2,
    explanation: "Noisy channels (wireless, deep space) justify heavy FEC; clean fibre links use lightweight CRC plus rare retransmissions. Adaptive systems (Wi-Fi MCS, 5G) change code rates with signal quality.",
    optionExplanations: ["Redundant bits consume capacity.", "Redundancy lowers the useful data rate.", "Correct.", "It affects throughput too."]
  }
);
