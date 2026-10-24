---
title: Strings, bytes and Unicode
part: Part C · Data structures inside
lede: A Python `str` is an immutable sequence of Unicode code points, and CPython stores it in one of three widths chosen by the largest character it contains. This chapter covers that flexible representation, why indexing is O(1) when the text is not stored as UTF-8, when `+=` in a loop is fast and when it is quadratic, how `bytes`, `bytearray` and `memoryview` differ, and the Unicode details (normalisation, case folding, grapheme clusters) that break naive string code.
desc: PEP 393 storage, O(1) indexing, += vs join, bytes/bytearray/memoryview, encodings, Unicode traps
hours: 3
prereqs: Chapters 1 and 5
---

## How CPython stores a str {#ch06-pep393 .th}

Since 3.3 (PEP 393), CPython stores each string's characters in a fixed-width array whose width is picked from the **largest code point** in the string:

| Largest character | Storage ("kind") | Bytes per character |
|---|---|---|
| U+0000 – U+007F | ASCII (compact, smaller header) | 1 |
| U+0080 – U+00FF | Latin-1 (UCS-1) | 1 |
| U+0100 – U+FFFF | UCS-2 | 2 |
| U+10000 – U+10FFFF | UCS-4 | 4 |

Every character occupies the same number of bytes, so `s[i]` is a direct array access and `len(s)` is stored in the header. Both are O(1). An ASCII string has a 40-byte header; any other kind uses a 56-byte header, which has room for a cached UTF-8 copy. A terminating NUL character is always included.

```python run=c06-kinds
import sys
samples = {
    "ascii": "a" * 100,
    "latin-1": "é" * 100,
    "ucs-2": "ā" * 100,
    "ucs-4": "😀" * 100,
    "one emoji": "a" * 99 + "😀",
}
for name, s in samples.items():
    print(f"{name:>9}: len {len(s)}, {sys.getsizeof(s)} bytes")
```

The last line is the surprise: a single emoji forces the **whole** string to 4 bytes per character, so 99 ASCII letters plus one emoji take as much memory as 100 emoji.

:::key
Languages that store strings as UTF-8 (Go, Rust, Swift) give O(1) access to *bytes* but O(n) access to the n-th character. CPython chose fixed-width storage, so indexing by character is O(1) at the cost of more memory for mixed text. Encoding to UTF-8 (`s.encode()`) is a separate copy, cached for non-ASCII strings when C code asks for it.
:::

### Strings are immutable

Every string method returns a new string. Immutability is what allows strings to be hashed (and the hash to be cached in the object after the first computation), interned and shared safely between threads.

```python run=c06-immutable
s = "hello"
try:
    s[0] = "H"
except TypeError as e:
    print("TypeError:", e)
t = s.replace("h", "H")
print(s, t, s is t)
u = s.replace("z", "Z")
print(u is s)
```

When a method has nothing to change, CPython often returns the original object (`replace` with no match returns `s` itself). That is an optimisation you can see with `is`, not a guarantee.

## Building strings: += versus join {#ch06-concat .th}

Because strings are immutable, `s = s + t` must allocate a new string and copy both parts. Doing that n times in a loop copies 1 + 2 + … + n characters, which is O(n²).

CPython has an optimisation for the common case: when the left operand of `+=` is a local variable and **this is the only reference to the string**, it resizes the string in place with `realloc`, which is usually amortised O(1). The moment any other reference exists, the optimisation is off and the loop becomes quadratic:

```python run=c06-plus-equals nondet
import timeit

def build_plus(n):
    s = ""
    for _ in range(n):
        s += "x"
    return s

def build_plus_shared(n):
    s = ""
    snapshots = []
    for _ in range(n):
        snapshots.append(s)    # a second reference to s
        s += "x"
    return s

def build_join(n):
    return "".join("x" for _ in range(n))

n = 20_000
t_plus = timeit.timeit(lambda: build_plus(n), number=3)
t_shared = timeit.timeit(lambda: build_plus_shared(n), number=3)
t_join = timeit.timeit(lambda: build_join(n), number=3)
print("shared += is 10x slower:", t_shared > 10 * t_plus)
print("join within 3x of fast +=:", t_join < 3 * t_plus)
```

`str.join` computes the total length first, allocates once and copies each piece once, so it is O(total length) on every implementation. That is why the standard advice is to collect pieces in a list and join at the end, or to use `io.StringIO`.

:::trap
Do not explain the `+=` speed-up as "Python strings are mutable". They are not. The interpreter reuses the memory only when no one else can observe the old value, and PyPy and other implementations do not do it at all.
:::

### Formatting

f-strings compile to dedicated bytecode (`FORMAT_VALUE` and `BUILD_STRING`), so they are usually the fastest way to format. Since 3.12 (PEP 701) they are parsed by the real grammar, so you can reuse the same quote character and write comments and backslashes inside the braces:

```python run=c06-fstrings
user = {"name": "Ada", "score": 0.91234}
print(f"{user["name"]} scored {user["score"]:.1%}")
width = 8
print(f"[{'left':<{width}}] [{'right':>{width}}] [{42:08b}]")
x = 3
print(f"{x = }, {x * 2 = }")
```

The `=` specifier (3.8+) prints the expression text and its value, which is handy for debugging.

## bytes, bytearray and memoryview {#ch06-bytes .th}

Text and binary data are separate types in Python 3:

- `str` is text: code points. It has no byte length until you **encode** it.
- `bytes` is an immutable sequence of integers 0–255. `b[0]` is an `int`, not a one-byte `bytes`.
- `bytearray` is the mutable version, with the same over-allocation strategy as `list`, so appending is amortised O(1).
- `memoryview` is a window onto any object that supports the **buffer protocol** (`bytes`, `bytearray`, `array.array`, NumPy arrays). Slicing a memoryview does not copy.

```python run=c06-bytes
data = "naïve café".encode("utf-8")
print(len("naïve café"), len(data), data[:6], data[2])
print(data.decode("utf-8"), data.decode("latin-1"))

buf = bytearray(b"hello world")
buf[0] = ord("H")
buf.extend(b"!")
print(buf, buf.upper())

view = memoryview(buf)[6:11]
view[:] = b"WORLD"
print(buf, view.nbytes, view.obj is buf)
```

Decoding UTF-8 bytes as Latin-1 never fails (every byte is a valid Latin-1 character) but produces "mojibake" such as `naÃ¯ve`. Writing through the memoryview changed the underlying bytearray in place, with no copy.

### Why memoryview matters

Slicing `bytes` or `bytearray` creates a copy. A parser that slices a large buffer repeatedly therefore copies over and over. A memoryview slice is O(1) and shares memory:

```python run=c06-memoryview nondet
import timeit

payload = bytes(10_000_000)
t_copy = timeit.timeit(lambda: payload[1:], number=20)
mv = memoryview(payload)
t_view = timeit.timeit(lambda: mv[1:], number=20)
print("view slicing 100x faster:", t_view * 100 < t_copy)
print(mv[1:].nbytes, mv.readonly)
```

Sockets (`sock.recv_into`), files (`readinto`) and `struct.unpack_from` all accept buffers, so a network server can fill one pre-allocated `bytearray` and parse it through memoryviews without ever copying.

### Encodings

UTF-8 encodes each code point in 1 to 4 bytes: ASCII stays 1 byte, most European and Middle Eastern letters take 2, most other BMP characters 3, and emoji 4. It is the default for `encode()` and `decode()`. `open()` without `encoding=` still uses the locale's encoding in 3.12 (PEP 686 makes UTF-8 the default from 3.15), so always pass `encoding="utf-8"` for files that must work on every machine.

```python run=c06-encodings
for ch in ["A", "é", "€", "😀"]:
    print(ch, hex(ord(ch)), len(ch.encode("utf-8")), ch.encode("utf-8"))
print("€".encode("utf-16-le"), len("😀".encode("utf-16-le")))
try:
    "€".encode("ascii")
except UnicodeEncodeError as e:
    print("UnicodeEncodeError:", e.reason)
print("€".encode("ascii", errors="replace"), "€".encode("ascii", errors="xmlcharrefreplace"))
print(b"\xff\xfe".decode("utf-8", errors="replace"))
```

## Unicode traps {#ch06-unicode .th}

### One visible character is not one code point

What a user sees as one character (a **grapheme cluster**) can be several code points: a base letter plus combining accents, an emoji with a skin-tone modifier, or a family emoji joined with zero-width joiners. `len()` counts code points:

```python run=c06-graphemes
family = "👨‍👩‍👧"
print(family, len(family), len(family.encode()))
print([f"U+{ord(c):04X}" for c in family])
print(family[::-1] == family, len(family[:2]))
```

Reversing or slicing such a string by code points breaks the cluster apart. Correct grapheme handling needs a library such as `regex` (with `\X`) or `grapheme`.

### The same text, two encodings in code points

`é` can be the single code point U+00E9 or `e` followed by the combining acute accent U+0301. They look identical, but they are not equal until you **normalise** them:

```python run=c06-normalise
import unicodedata

composed = "café"
decomposed = "café"
print(composed == decomposed, len(composed), len(decomposed))
nfc = unicodedata.normalize("NFC", decomposed)
print(nfc == composed, len(nfc))
print(unicodedata.name("́"))
```

Normalise user input (usually to NFC) before comparing, hashing or using it as a dict key. macOS file names, for example, have historically been stored decomposed.

### Case and digits

`lower()` is not the right tool for case-insensitive comparison. `casefold()` applies the full Unicode folding rules, and some mappings change the length of the string:

```python run=c06-case
print("Straße".lower(), "Straße".casefold(), "Straße".upper())
print("STRASSE".casefold() == "Straße".casefold())
print(len("İ".lower()), "ﬁ".upper())
print("²".isdigit(), "²".isdecimal(), "٣".isdecimal(), int("٣") + 1)
```

`isdigit()` accepts superscripts that `int()` cannot parse; `isdecimal()` is the check that matches what `int()` accepts, and `int()` happily parses Arabic-Indic digits. Validating input with `isdigit()` and then calling `int()` is a classic crash.

## Concept and tricky questions {#ch06-concept .dr}

:::drill concept
How does CPython store a `str`, and why is `s[i]` O(1)?
---
**Answer.** As a fixed-width array of 1, 2 or 4 bytes per code point, chosen by the largest code point in the string (PEP 393). Because every character has the same width, the i-th character is at offset `i * width`.

**Why.** A UTF-8 representation would need a scan to find the i-th code point. The trade-off is memory: one wide character widens the entire string.
:::

:::drill tricky
Why can `s += t` in a loop be fast in CPython, and when does it become quadratic?
---
**Answer.** When `s` is a local whose string has no other references, CPython resizes it in place instead of copying. If any other reference exists (it is stored in a list, it is an attribute, a global, or another name points at it), each `+=` must copy, and the loop is O(n²).

**Why.** The optimisation checks the refcount at run time. It is CPython-specific, so `"".join(parts)` remains the portable linear approach.
:::

:::drill concept
What is the difference between `bytes`, `bytearray` and `memoryview`?
---
**Answer.** `bytes` is immutable binary data, `bytearray` is mutable (and over-allocates for cheap appends), and `memoryview` is a zero-copy view onto another object's buffer that supports slicing and, for writable buffers, assignment.

**Why.** Interviews about high-throughput parsing want you to say "slice a memoryview instead of the bytes, and read into a pre-allocated bytearray".
:::

:::drill tricky
`len("é")` returns 1 on one machine and 2 on another for text that looks identical. Why?
---
**Answer.** One string uses the precomposed code point U+00E9; the other is `e` plus the combining accent U+0301. Normalise with `unicodedata.normalize("NFC", s)` before comparing or measuring.

**Why.** Unicode allows several code point sequences for the same visible text. Input from different systems (keyboards, macOS file names, copy-paste) mixes them.
:::

:::drill concept
Why should you use `casefold()` rather than `lower()` for case-insensitive matching?
---
**Answer.** `casefold()` applies Unicode's full case folding, which handles characters such as German `ß` (folded to `ss`) that `lower()` leaves alone. So `"STRASSE".casefold() == "straße".casefold()` is `True`, while the `lower()` versions differ.

**Why.** Case conversion is locale- and language-dependent and can change string length. For identifiers like usernames, normalise (NFKC) and then casefold.
:::

:::drill tricky
`"²".isdigit()` is `True`. Is it safe to call `int(x)` after checking `x.isdigit()`?
---
**Answer.** No. `isdigit()` accepts characters such as superscripts that `int()` rejects. Check with `isdecimal()`, or better, just call `int()` and catch `ValueError`.

**Why.** Unicode has three numeric categories; `isdecimal()` (Nd) matches what `int()` accepts, including non-Latin digits.
:::

## Predict the output and find the bug {#ch06-reading .dr}

:::drill output
What does this print?

```python run=c06-d-sizes
import sys
a = "x" * 1000
b = a + "€"
c = a + "é"
print(sys.getsizeof(a), sys.getsizeof(b), sys.getsizeof(c))
```
---
**Answer.** `a` is ASCII: 40 + 1000 + 1 bytes. Adding `€` (U+20AC) forces UCS-2: 56 + 2 × 1002 bytes. Adding `é` (U+00E9) needs only Latin-1: 56 + 1002 bytes.

**Why.** The width is decided by the largest code point, so the same 1000 ASCII letters cost twice as much once a euro sign joins them.
:::

:::drill output
What does this print?

```python run=c06-d-bytes-index
b = b"abc"
print(b[0], b[0:1], list(b), bytes([97, 98]))
print(b"a" in b, 97 in b, b.hex())
```
---
**Answer.** Indexing bytes gives an `int` (97), while slicing gives `bytes` (`b'a'`). Membership accepts both a sub-sequence and an int. The hex is `'616263'`.

**Why.** This is the main difference from Python 2, where `b[0]` was a one-character string. Code ported from Python 2 often compares `b[0] == "a"`, which is now always `False`.
:::

:::drill output
What does this print?

```python run=c06-d-split
print("a,b,,c".split(","), "  a  b ".split(), " a b ".split(" "))
print("".split(","), "".split())
print("a-b-c".rsplit("-", 1), "a\nb\r\nc".splitlines())
```
---
**Answer.** `split(",")` keeps empty fields; `split()` with no argument splits on runs of whitespace and drops empties; `split(" ")` keeps them. Splitting an empty string with a separator gives `['']`, without one gives `[]`.

**Why.** The no-argument form is a different algorithm, not "split on space". The `''.split(',')` case often causes an off-by-one when parsing empty CSV lines.
:::

:::drill output
What does this print?

```python run=c06-d-decode
raw = "Grüße".encode("utf-8")
print(len(raw))
print(raw.decode("latin-1"))
print(raw.decode("latin-1").encode("latin-1").decode("utf-8"))
```
---
**Answer.** 7 bytes (`ü` and `ß` take 2 each). Decoding as Latin-1 produces mojibake, `GrÃ¼Ã\x9fe`, printed with the control character. Re-encoding the mojibake as Latin-1 gets the original bytes back, which then decode correctly.

**Why.** Latin-1 maps every byte to one code point, so it never fails and round-trips any bytes, which is also how you repair text that was decoded with the wrong codec.
:::

:::drill bug
This report builder is fine in tests and takes minutes on real data. Find the problem.

```python run=c06-d-bug-report nondet
import timeit

class Report:
    def __init__(self):
        self.text = ""
    def add(self, line):
        self.text += line + "\n"

class FastReport:
    def __init__(self):
        self.parts = []
    def add(self, line):
        self.parts.append(line)
    @property
    def text(self):
        return "\n".join(self.parts) + "\n"

def fill(cls, n):
    r = cls()
    for i in range(n):
        r.add("line %d" % i)
    return r.text

print(fill(Report, 3) == fill(FastReport, 3))
slow = timeit.timeit(lambda: fill(Report, 20_000), number=1)
fast = timeit.timeit(lambda: fill(FastReport, 20_000), number=1)
print("list + join much faster:", fast * 5 < slow)
```
---
**Answer.** `self.text += …` concatenates onto an **attribute**, so the in-place resize optimisation never applies (the instance dict holds a reference). Each append copies the whole report, which is O(n²). Collect parts in a list and join once.

**Why.** The fast path only exists for local variables with a single reference.
:::

:::drill bug
A username check lets two accounts that look identical register. Fix the comparison.

```python run=c06-d-bug-username
import unicodedata

existing = {"josé"}

def canonical(name):
    return unicodedata.normalize("NFKC", name).casefold()

new = "JOSÉ"
print(new.lower() in existing)
print(canonical(new) in {canonical(n) for n in existing})
```
---
**Answer.** `new.lower()` is `jose` plus a combining accent, which is not equal to the precomposed `josé`. Normalise (NFKC also folds compatibility forms such as full-width letters) and casefold both sides before comparing, as `canonical` does.

**Why.** Store the canonical form as the unique key. This is the approach recommended for identifiers in Unicode TR #36 and used by many sign-up systems.
:::

## Write the code {#ch06-coding .cd}

:::drill code rating=1200
Write `utf8_char_count(data: bytes)` that counts code points in UTF-8 bytes **without decoding**, by counting bytes that are not continuation bytes (`0b10xxxxxx`). Check it against `len(data.decode())`.
---
```python run=c06-c-utf8count
def utf8_char_count(data):
    return sum(1 for b in data if b & 0xC0 != 0x80)

samples = ["hello", "naïve café", "€100", "😀👍", "日本語"]
for s in samples:
    raw = s.encode()
    print(s, len(raw), utf8_char_count(raw), utf8_char_count(raw) == len(s))
```

Every UTF-8 sequence has exactly one lead byte (`0xxxxxxx`, `110xxxxx`, `1110xxxx` or `11110xxx`) followed by continuation bytes, so counting lead bytes counts code points. This is how `len()` on a UTF-8 string would have to work.
:::

:::drill code rating=1400
Write a zero-copy line splitter: `iter_lines(buf)` takes a `bytes` or `bytearray` and yields `memoryview` slices for each line (without the newline), never copying the data. Show that the slices share memory with the buffer.
---
```python run=c06-c-lines
def iter_lines(buf):
    view = memoryview(buf)
    start = 0
    while True:
        end = buf.find(b"\n", start)
        if end == -1:
            if start < len(buf):
                yield view[start:]
            return
        yield view[start:end]
        start = end + 1

data = bytearray(b"GET / HTTP/1.1\nHost: example.com\nAccept: */*")
lines = list(iter_lines(data))
print([bytes(l) for l in lines])
data[0:3] = b"PUT"
print(bytes(lines[0]), lines[0].obj is data)
```

Changing the buffer changes what the first view shows, which proves it is not a copy. Note that while views exist, a `bytearray` cannot be resized (it raises `BufferError`).
:::

:::drill code rating=1300
Write `truncate_utf8(s, max_bytes)` that returns the longest prefix of `s` whose UTF-8 encoding fits in `max_bytes`, without splitting a multi-byte character (a common requirement for database columns and protocol headers).
---
Encode once, cut at the byte limit, and step back over continuation bytes.

```python run=c06-c-truncate
def truncate_utf8(s, max_bytes):
    raw = s.encode("utf-8")
    if len(raw) <= max_bytes:
        return s
    cut = max_bytes
    while cut > 0 and raw[cut] & 0xC0 == 0x80:
        cut -= 1
    return raw[:cut].decode("utf-8")

text = "Grüße 😀!"
for n in range(3, 12, 2):
    out = truncate_utf8(text, n)
    print(n, repr(out), len(out.encode()))
```

`raw[cut]` is the first byte that does not fit. If it is a continuation byte, the character it belongs to started earlier and must be dropped entirely.
:::

:::drill code rating=1500
Implement `StringBuilder` with `append(s)`, `__len__` and `build()`, storing pieces in a list but merging them periodically so that memory stays bounded when millions of tiny pieces are appended. Compare its result with `"".join`.
---
```python run=c06-c-builder
class StringBuilder:
    def __init__(self, chunk=4096):
        self._parts = []
        self._pending = []
        self._pending_len = 0
        self._len = 0
        self._chunk = chunk

    def append(self, s):
        self._pending.append(s)
        self._pending_len += len(s)
        self._len += len(s)
        if self._pending_len >= self._chunk:
            self._parts.append("".join(self._pending))
            self._pending.clear()
            self._pending_len = 0

    def __len__(self):
        return self._len

    def build(self):
        return "".join(self._parts) + "".join(self._pending)

sb = StringBuilder()
for i in range(100_000):
    sb.append(str(i % 10))
result = sb.build()
print(len(sb), result[:12], result == "".join(str(i % 10) for i in range(100_000)), len(sb._parts))
```

A list of a million one-character strings holds a million pointers (8 MB) even though the one-character strings themselves are cached singletons. Merging pieces into 4 KB chunks keeps the list short, and the final `join` still copies each character a bounded number of times.
:::

## Cheat sheet {#ch06-cheatsheet .th}

- `str` = immutable code points. PEP 393 width per string: ASCII/Latin-1 1 byte, UCS-2 2, UCS-4 4. ASCII header 40 bytes, others 56. One emoji widens the whole string.
- `len(s)` and `s[i]` are O(1). UTF-8 is a separate encoding (`s.encode()`).
- Methods return new strings; unchanged results may return the same object.
- `s += t` in a loop is fast only for an unshared local in CPython; use `"".join(parts)` or `io.StringIO`.
- f-strings are the fastest formatting; 3.12 allows nested same quotes. `f"{x = }"` for debugging.
- `bytes` immutable (`b[0]` is an int), `bytearray` mutable and over-allocated, `memoryview` zero-copy slices over the buffer protocol.
- UTF-8: 1–4 bytes per code point; continuation bytes are `10xxxxxx`. Latin-1 decodes any bytes. Pass `encoding="utf-8"` to `open()`.
- Graphemes ≠ code points (combining marks, ZWJ emoji). Normalise (NFC/NFKC) before comparing; use `casefold()` for caseless matching.
- `isdecimal()` matches `int()`; `isdigit()` accepts superscripts that `int()` rejects.
