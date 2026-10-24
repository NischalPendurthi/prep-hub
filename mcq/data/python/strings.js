/* Python — Strings */
window.QUESTIONS.push(
  {
    id: "py-strings-001", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What happens when this code runs?",
    code: "s = 'hello'\ns[0] = 'H'\nprint(s)",
    options: ["It prints Hello", "It prints hello", "It raises TypeError", "It raises IndexError"],
    answer: 2,
    explanation: "Strings are immutable: their characters cannot be changed after creation, so item assignment raises `TypeError: 'str' object does not support item assignment`. To 'change' a string, build a new one, e.g. `s = 'H' + s[1:]`.",
    optionExplanations: ["No in-place modification is possible for str.", "The error happens before print is reached.", "Correct: str does not support item assignment.", "Index 0 is valid; the problem is assignment, not the index."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-strings-002", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "s = 'Python'\nprint(s[-1], s[1:4])",
    options: ["n yth", "n ytho", "P yth", "o yth"],
    answer: 0,
    explanation: "Negative indices count from the end: `s[-1]` is the last character 'n'. A slice `s[1:4]` includes the start index and excludes the stop index, so it takes indices 1, 2, 3: 'y', 't', 'h'.",
    optionExplanations: ["Correct: last character, then indices 1 to 3.", "The stop index 4 is excluded, so 'o' is not included.", "s[-1] is the last character, not the first.", "'o' is s[-2]; s[-1] is 'n'."]
  },
  {
    id: "py-strings-003", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print('ab' * 3, 'bc' in 'abcd')",
    options: ["ab3 True", "TypeError", "ababab False", "ababab True"],
    answer: 3,
    explanation: "`str * int` repeats the string, giving 'ababab'. The `in` operator on strings performs a substring test, and 'bc' occurs inside 'abcd', so it is True.",
    optionExplanations: ["* repeats; it doesn't append the number.", "str * int is a valid operation.", "'bc' is a contiguous substring of 'abcd'.", "Correct: repetition and substring membership."]
  },
  {
    id: "py-strings-004", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print('hello'[::-1])",
    options: ["hello", "h", "olleh", "o"],
    answer: 2,
    explanation: "In `[start:stop:step]`, a step of -1 walks backwards; with start and stop omitted it covers the whole string from the end to the beginning, producing a reversed copy. This is the idiomatic way to reverse a string.",
    optionExplanations: ["A step of -1 reverses the order.", "The slice covers every character, not just one.", "Correct: [::-1] reverses the string.", "It returns the whole reversed string, not only the last character."]
  },
  {
    id: "py-strings-005", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "s = 'banana'\nprint(s.find('z'), s.find('an'))",
    options: ["-1 1", "ValueError", "None 1", "-1 3"],
    answer: 0,
    explanation: "`find()` returns the lowest index where the substring starts, or -1 if it is not found. 'an' first occurs at index 1. `index()` behaves the same except it raises ValueError when the substring is missing.",
    optionExplanations: ["Correct: -1 for not found, 1 for the first 'an'.", "find() never raises; index() would.", "find() returns -1, not None.", "find() returns the first (lowest) occurrence, which is index 1."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-strings-006", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "s = 'abc'\ns.upper()\nprint(s)",
    options: ["ABC", "Abc", "None", "abc"],
    answer: 3,
    explanation: "String methods never modify the string (strings are immutable); they return a new string. Because the result of `s.upper()` is discarded, `s` is still 'abc'. Write `s = s.upper()` to keep the result.",
    optionExplanations: ["upper() returned 'ABC', but it was never assigned.", "That would be capitalize(), and it still wouldn't modify s.", "s still refers to 'abc'; nothing assigned None to it.", "Correct: the original string is unchanged."],
    tags: ["trap"]
  },
  {
    id: "py-strings-007", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(ord('A'), chr(97))",
    options: ["65 a", "97 A", "65 A", "a 65"],
    answer: 0,
    explanation: "`ord()` returns the Unicode code point of a single character ('A' is 65) and `chr()` does the reverse (97 is 'a'). Lowercase letters are 32 code points after their uppercase counterparts.",
    optionExplanations: ["Correct: ord('A') = 65 and chr(97) = 'a'.", "97 is 'a', and ord('A') is 65.", "chr(97) is lowercase 'a'.", "The order of the two results is reversed."]
  },
  {
    id: "py-strings-008", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print('a,b,,c'.split(','))",
    options: ["['a', 'b', 'c']", "['a', 'b', ',', 'c']", "['a,b,,c']", "['a', 'b', '', 'c']"],
    answer: 3,
    explanation: "With an explicit separator, `split()` splits on every occurrence, so two adjacent commas produce an empty string between them. Only `split()` with no argument collapses runs of whitespace and drops empty strings.",
    optionExplanations: ["Empty fields are kept when a separator is given.", "The separator itself never appears in the result.", "The string does contain the separator, so it is split.", "Correct: the empty field between ',,' is preserved."]
  },
  {
    id: "py-strings-009", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print('-'.join(['a', 'b', 'c']))",
    options: ["a-b-c-", "-a-b-c", "a-b-c", "['a', 'b', 'c']"],
    answer: 2,
    explanation: "`sep.join(iterable)` concatenates the strings in the iterable with `sep` placed only between consecutive elements, never at the ends. All elements must be strings, otherwise join raises TypeError.",
    optionExplanations: ["No trailing separator is added.", "No leading separator is added.", "Correct: the separator goes between elements only.", "join returns a string, not a list."]
  },
  {
    id: "py-strings-010", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "x = 3.14159\nprint(f'{x:.2f}')",
    options: ["3.14", "3.1", "3.14159", "3.15"],
    answer: 0,
    explanation: "In an f-string, the format spec after the colon controls rendering. `.2f` means fixed-point notation with exactly 2 digits after the decimal point, rounded: 3.14159 → 3.14.",
    optionExplanations: ["Correct: two decimal places.", ".2f keeps two decimals, not one.", "The format spec rounds the displayed value.", "3.14159 rounds to 3.14, since the third decimal (1) is below 5."]
  },
  {
    id: "py-strings-011", subject: "python", subtopic: "Strings", difficulty: "easy", type: "concept",
    question: "Which string method removes whitespace from both the beginning and the end of a string?",
    options: ["trim()", "strip()", "lstrip()", "remove()"],
    answer: 1,
    explanation: "`strip()` removes leading and trailing whitespace (or a given set of characters). `lstrip()` and `rstrip()` handle only the left or right side. Python has no `trim()` method on str, unlike JavaScript and Java.",
    optionExplanations: ["trim() exists in JavaScript/Java, not Python.", "Correct: strip() handles both ends.", "lstrip() strips only the left side.", "str has no remove() method."]
  },
  {
    id: "py-strings-012", subject: "python", subtopic: "Strings", difficulty: "easy", type: "code-output",
    question: "What is the output?",
    code: "print(len('hi there'), 'Hello'.startswith('he'))",
    options: ["7 True", "8 True", "8 False", "7 False"],
    answer: 2,
    explanation: "len counts every character including the space, so 'hi there' has 8 characters. `startswith` is case-sensitive: 'Hello' starts with 'He', not 'he', so the result is False.",
    optionExplanations: ["The space counts as a character, and the case check fails.", "startswith is case-sensitive, so it's False.", "Correct: 8 characters, and 'he' doesn't match 'He'.", "The length is 8 because the space is counted."]
  },
  {
    id: "py-strings-013", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = '  a  b  '\nprint(s.split(), s.split(' '))",
    options: ["['a', 'b'] ['a', 'b']", "['a', 'b'] ['', '', 'a', '', 'b', '', '']", "['', 'a', 'b', ''] ['a', 'b']", "['a', 'b'] ['', 'a', '', 'b', '']"],
    answer: 1,
    explanation: "`split()` with no argument splits on runs of whitespace and discards leading/trailing whitespace, so you get ['a', 'b']. `split(' ')` splits on every single space, so each extra space creates an empty string: two leading spaces give two '', the double space between a and b gives one '', and two trailing spaces give two ''.",
    optionExplanations: ["An explicit ' ' separator keeps the empty strings.", "Correct: whitespace-run splitting vs single-character splitting.", "split() with no argument drops leading/trailing empties.", "Every single space is a split point, so there are more empty strings."],
    tags: ["trap"]
  },
  {
    id: "py-strings-014", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print('www.example.com'.strip('w.moc'))",
    options: ["example.com", "www.example", "example", "xample"],
    answer: 2,
    explanation: "The argument to `strip()` is a SET of characters, not a prefix/suffix. Python removes characters in {w, ., m, o, c} from both ends until it hits one not in the set. From the left it removes 'www.' and stops at 'e'; from the right it removes 'moc.' and stops at 'e'. Use removeprefix/removesuffix for exact substrings.",
    optionExplanations: ["The trailing '.com' characters are all in the set and get stripped.", "The leading 'www.' characters are all in the set and get stripped.", "Correct: stripping stops at the first 'e' on each side.", "'e' is not in the set, so stripping stops before it."],
    tags: ["trap"]
  },
  {
    id: "py-strings-015", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = 'abc'\nprint(s[1:100] + '|' + s[10:] + '|')",
    options: ["IndexError", "bc|c|", "bc||", "bc|None|"],
    answer: 2,
    explanation: "Slicing is forgiving: out-of-range start/stop values are clamped to the string's bounds, so `s[1:100]` is 'bc' and `s[10:]` is the empty string. Only single-element indexing like `s[10]` raises IndexError.",
    optionExplanations: ["Slices never raise IndexError; only direct indexing does.", "s[10:] starts beyond the end, so it is empty.", "Correct: slices are clamped to valid bounds.", "A slice always returns a str, never None."]
  },
  {
    id: "py-strings-016", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = 'abcdef'\nprint(s[-2:], s[:-2], s[::2])",
    options: ["ef abcd ace", "fe abcd ace", "ef abcde ace", "ef abcd bdf"],
    answer: 0,
    explanation: "`s[-2:]` takes the last two characters 'ef'. `s[:-2]` takes everything except the last two: 'abcd'. `s[::2]` takes every second character starting at index 0: a, c, e.",
    optionExplanations: ["Correct.", "A positive step keeps the original order, so it's 'ef'.", ":-2 excludes the last two characters, giving 'abcd'.", "A step of 2 starts at index 0, giving 'ace'."]
  },
  {
    id: "py-strings-017", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = 'abcdef'\nprint(repr(s[5:1:-1]), repr(s[1:5:-1]))",
    options: ["'fedc' 'bcde'", "'fedcb' ''", "'edcb' ''", "'fedc' ''"],
    answer: 3,
    explanation: "With a negative step the slice runs from start down to (but excluding) stop: `s[5:1:-1]` takes indices 5, 4, 3, 2 = 'fedc'. `s[1:5:-1]` asks to walk backwards from 1 to 5, which is impossible, so the result is empty rather than an error.",
    optionExplanations: ["A backward step from 1 can never reach 5, so the second slice is empty.", "The stop index 1 is excluded, so 'b' is not included.", "The start index 5 ('f') is included.", "Correct: indices 5..2, then an empty slice."],
    tags: ["trap"]
  },
  {
    id: "py-strings-018", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print('banana'.count('ana'), 'banana'.replace('a', 'o', 2))",
    options: ["2 bonona", "1 bonona", "1 bonono", "2 bonono"],
    answer: 1,
    explanation: "`count()` counts NON-overlapping occurrences scanning left to right: 'ana' matches at index 1, and the next search starts at index 4 ('na'), so the count is 1 even though a second overlapping 'ana' starts at index 3. `replace(old, new, count)` replaces only the first `count` occurrences: the first two 'a's become 'o'.",
    optionExplanations: ["The overlapping match at index 3 is not counted.", "Correct: non-overlapping count, limited replacement.", "Only the first 2 'a's are replaced.", "Both parts are wrong: count is 1 and only 2 replacements happen."],
    tags: ["trap"]
  },
  {
    id: "py-strings-019", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print('Z' < 'a', '10' < '9', 'apple' < 'apples')",
    options: ["True True True", "False False True", "False True True", "True False True"],
    answer: 0,
    explanation: "Strings compare lexicographically by Unicode code point, character by character. 'Z' (90) < 'a' (97): all uppercase letters sort before lowercase. '10' vs '9': '1' (49) < '9' (57), so '10' is smaller even though 10 > 9 numerically. 'apple' is a prefix of 'apples', and a prefix sorts first.",
    optionExplanations: ["Correct: code-point ordering makes all three True.", "Uppercase letters have smaller code points than lowercase.", "'Z' (90) is less than 'a' (97).", "String comparison is not numeric: '1' < '9'."],
    tags: ["trap"]
  },
  {
    id: "py-strings-020", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "n = 1234567.891\nprint(f'{n:,.2f}')",
    options: ["1234567.89", "1,234,567.891", "1.234.567,89", "1,234,567.89"],
    answer: 3,
    explanation: "The `,` option in a format spec inserts thousands separators, and `.2f` gives two decimal places. Python's format mini-language always uses ',' for thousands and '.' for decimals; locale-aware formatting needs the 'n' type or the locale module.",
    optionExplanations: ["The ',' option adds separators.", ".2f rounds to two decimals.", "That's a European locale format; f-strings don't use it by default.", "Correct: separators plus two decimals."]
  },
  {
    id: "py-strings-021", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(f\"{'hi':*>5}|{'hi':-<5}|{'hi':*^6}\")",
    options: ["hi***|---hi|**hi**", "***hi|hi---|***hi*", "***hi|hi---|*hi***", "***hi|hi---|**hi**"],
    answer: 3,
    explanation: "Format spec `[fill][align][width]`: `>` right-aligns, `<` left-aligns, `^` centres, padding with the fill character. 'hi' in width 5 right-aligned gives '***hi'; left-aligned gives 'hi---'; centred in width 6 leaves 4 fill characters split evenly, 2 on each side.",
    optionExplanations: ["> means right-align (padding on the left), and < is the reverse.", "Centring splits the padding evenly.", "With 4 padding characters, centring puts 2 on each side.", "Correct."]
  },
  {
    id: "py-strings-022", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "x = 5\nprint(f'{x=}, {x*2=}')",
    options: ["5, 10", "x=5, x*2=10", "{x=}, {x*2=}", "x=x, x*2=x*2"],
    answer: 1,
    explanation: "The `=` specifier (Python 3.8+) is a debugging aid: `f'{expr=}'` prints the expression text, an equals sign, and the expression's repr. It works with arbitrary expressions, so `{x*2=}` renders as 'x*2=10'.",
    optionExplanations: ["The = specifier also prints the expression text.", "Correct: self-documenting expressions.", "These are valid replacement fields, so they are evaluated.", "The values are evaluated, not repeated as text."]
  },
  {
    id: "py-strings-023", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print('{1}{0}{1}'.format('a', 'b'), '%s=%d' % ('n', 7))",
    options: ["aba n=7", "bab n=7", "bab n7", "ab n=7"],
    answer: 1,
    explanation: "In `str.format`, `{0}` and `{1}` refer to positional arguments by index and can be repeated in any order: {1}{0}{1} → 'b','a','b'. The older printf-style `%` operator substitutes `%s` with str() and `%d` with an integer.",
    optionExplanations: ["{1} is 'b', the second argument.", "Correct.", "The '=' is literal text in the template.", "Indices can repeat; the template has three fields."]
  },
  {
    id: "py-strings-024", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(len('a\\nb'), len(r'a\\nb'))",
    options: ["3 3", "4 4", "3 4", "4 3"],
    answer: 2,
    explanation: "In a normal string literal, `\\n` is an escape sequence for ONE newline character, so 'a\\nb' has 3 characters. A raw string (r prefix) disables escape processing, so the backslash and 'n' are two separate characters: 4 in total. Raw strings are common for regex patterns and Windows paths.",
    optionExplanations: ["The raw string keeps the backslash as a separate character.", "The normal string's escape sequence is a single character.", "Correct: escape = 1 char; raw = 2 chars.", "The reverse: the raw string is longer."]
  },
  {
    id: "py-strings-025", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "items = ['a' 'b', 'c']\nprint(len(items), items)",
    options: ["3 ['a', 'b', 'c']", "2 ['ab', 'c']", "SyntaxError", "2 ['a b', 'c']"],
    answer: 1,
    explanation: "Adjacent string literals are concatenated at compile time: 'a' 'b' becomes 'ab'. This is useful for splitting long strings across lines, but a forgotten comma in a list silently merges two elements, which is a classic bug.",
    optionExplanations: ["Without a comma the two literals merge into one element.", "Correct: implicit literal concatenation.", "Adjacent literals are valid syntax.", "Concatenation adds no space."],
    tags: ["trap"]
  },
  {
    id: "py-strings-026", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print('123'.isdigit(), '-1'.isdigit(), '1.5'.isdigit(), ''.isalpha())",
    options: ["True True False False", "True False False True", "True False True False", "True False False False"],
    answer: 3,
    explanation: "`isdigit()` is True only if every character is a digit and the string is non-empty, so '-' and '.' make it False; it is not a 'can I parse this number' test. All is-methods return False for an empty string.",
    optionExplanations: ["'-' is not a digit character.", "is-methods return False for an empty string.", "'.' is not a digit character.", "Correct: only '123' consists entirely of digits."],
    tags: ["trap"]
  },
  {
    id: "py-strings-027", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print('photo.png'.endswith(('.jpg', '.png')), 'key=val=x'.partition('='))",
    options: ["True ('key', '=', 'val=x')", "True ['key', 'val', 'x']", "False ('key', '=', 'val=x')", "True ('key', 'val=x')"],
    answer: 0,
    explanation: "`startswith`/`endswith` accept a tuple and return True if any option matches. `partition(sep)` splits at the FIRST occurrence and always returns a 3-tuple (head, sep, tail); the rest of the string, including later separators, stays in the tail.",
    optionExplanations: ["Correct.", "partition returns a 3-tuple and splits only once.", "'.png' is in the tuple, so endswith is True.", "partition keeps the separator as the middle element."]
  },
  {
    id: "py-strings-028", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = 'hello wORLD'\nprint(s.capitalize(), '|', s.title())",
    options: ["Hello WORLD | Hello WORLD", "Hello wORLD | Hello World", "Hello world | Hello WORLD", "Hello world | Hello World"],
    answer: 3,
    explanation: "`capitalize()` uppercases the first character and LOWERCASES all the rest. `title()` uppercases the first letter of each word and lowercases the remaining letters of each word.",
    optionExplanations: ["Both methods lowercase the non-initial letters.", "capitalize() lowercases the remaining characters.", "title() lowercases the rest of each word, giving 'World'.", "Correct."]
  },
  {
    id: "py-strings-029", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print('a b c d'.split(' ', 2), 'a.b.c'.rsplit('.', 1))",
    options: ["['a', 'b', 'c', 'd'] ['a', 'b', 'c']", "['a', 'b', 'c d'] ['a', 'b.c']", "['a', 'b c d'] ['a.b', 'c']", "['a', 'b', 'c d'] ['a.b', 'c']"],
    answer: 3,
    explanation: "`maxsplit` limits the number of splits, so split(' ', 2) produces at most 3 pieces; the remainder 'c d' stays together. `rsplit` performs the splits starting from the right, so with maxsplit 1 it separates only the last component — handy for splitting off a file extension.",
    optionExplanations: ["maxsplit limits how many splits happen.", "rsplit splits from the right, not the left.", "maxsplit=2 allows two splits, producing three pieces.", "Correct."]
  },
  {
    id: "py-strings-030", subject: "python", subtopic: "Strings", difficulty: "medium", type: "concept",
    question: "You need to build one large string from 1 million small pieces. Which approach is recommended and why?",
    options: ["`s += piece` in a loop, because strings are mutable", "`''.join(pieces)`, because it computes the final size once and copies each piece once (O(n) total)", "`s = s + piece`, because + is faster than join", "Use `%` formatting, because it avoids creating strings"],
    answer: 1,
    explanation: "Because strings are immutable, repeated concatenation can copy the growing string on each step, which is O(n²) in the worst case (CPython sometimes optimises +=, but you shouldn't rely on it). `''.join()` sums the lengths, allocates once and copies each piece once, which is linear time.",
    optionExplanations: ["Strings are immutable; += creates a new string each time in general.", "Correct: join is linear and the idiomatic choice.", "Repeated + is the quadratic pattern join avoids.", "Formatting still creates new strings and does not solve the problem."],
    tags: ["interview-favourite"]
  },
  {
    id: "py-strings-031", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = 'héllo'\nprint(len(s), len(s.encode('utf-8')), type(s.encode()).__name__)",
    options: ["5 5 str", "6 6 bytes", "5 6 bytes", "5 6 bytearray"],
    answer: 2,
    explanation: "A `str` is a sequence of Unicode code points, so 'héllo' has 5 characters. Encoding to UTF-8 produces a `bytes` object; 'é' needs 2 bytes in UTF-8, so the encoded length is 6. Decode bytes back with `.decode('utf-8')`.",
    optionExplanations: ["encode() returns bytes, and 'é' takes 2 bytes.", "len(str) counts code points, which is 5.", "Correct.", "encode() returns immutable bytes, not bytearray."]
  },
  {
    id: "py-strings-032", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "print(str('hi'), repr('hi'), [ 'hi' ])",
    options: ["hi hi ['hi']", "'hi' 'hi' ['hi']", "hi 'hi' ['hi']", "hi 'hi' [hi]"],
    answer: 2,
    explanation: "`str()` gives the human-readable form (no quotes) and `repr()` gives the unambiguous developer form (with quotes). Printing a container uses the repr of its elements, which is why lists of strings show quotes.",
    optionExplanations: ["repr() includes quotes.", "str('hi') has no quotes.", "Correct.", "Containers display their elements with repr(), so quotes appear."]
  },
  {
    id: "py-strings-033", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = 'ababc'\nprint(s.lstrip('ab'), s.removeprefix('ab'))",
    options: ["abc abc", "c c", "c abc", "abc c"],
    answer: 2,
    explanation: "`lstrip('ab')` removes any leading characters that are 'a' or 'b' (character-set semantics), so it strips 'abab' and leaves 'c'. `removeprefix('ab')` (Python 3.9+) removes the exact substring 'ab' once if present, leaving 'abc'.",
    optionExplanations: ["lstrip removes all leading a/b characters, not just one 'ab'.", "removeprefix removes the prefix only once.", "Correct: char-set stripping vs exact prefix removal.", "The results are swapped."],
    tags: ["trap"]
  },
  {
    id: "py-strings-034", subject: "python", subtopic: "Strings", difficulty: "medium", type: "code-output",
    question: "What is the output?",
    code: "s = 'Racecar'\nprint(s == s[::-1], s.lower() == s.lower()[::-1])",
    options: ["True True", "True False", "False False", "False True"],
    answer: 3,
    explanation: "Comparison is case-sensitive: reversed 'Racecar' is 'racecaR', which differs from the original. Normalising the case first makes it a palindrome. Typical interview solutions also strip non-alphanumeric characters before comparing.",
    optionExplanations: ["'R' != 'r', so the first comparison fails.", "It's the other way round.", "After lower() the string is a palindrome.", "Correct: case normalisation is required."]
  },
  {
    id: "py-strings-035", subject: "python", subtopic: "Strings", difficulty: "easy", type: "concept",
    question: "What type does `'abc'.encode()` return?",
    options: ["str", "bytes", "list of ints", "bytearray"],
    answer: 1,
    explanation: "`str.encode()` converts text (Unicode code points) into a `bytes` object using an encoding (UTF-8 by default). `bytes.decode()` goes the other way. Text is str; binary data (files, network) is bytes.",
    optionExplanations: ["encode() converts away from str.", "Correct: it returns bytes, e.g. b'abc'.", "Indexing bytes yields ints, but the object itself is bytes.", "bytearray is the mutable variant and is not returned by encode()."]
  },
  {
    id: "py-strings-036", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output in CPython?",
    code: "s = 'abc'\na = [1, 2]\nprint(s[:] is s, a[:] is a)",
    options: ["True False", "True True", "False False", "False True"],
    answer: 0,
    explanation: "A full slice of a list must create a new list (it's the standard shallow-copy idiom), so `a[:] is a` is False. For an immutable str, copying would be pointless, so CPython returns the same object for `s[:]`, making `s[:] is s` True.",
    optionExplanations: ["Correct: immutable str returns itself, list returns a copy.", "A list slice always creates a new list.", "CPython optimises the full slice of an immutable str to return itself.", "The behaviours are reversed."],
    tags: ["trap"]
  },
  {
    id: "py-strings-037", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print('a' 'b' * 2)",
    options: ["abab", "abb", "aab", "SyntaxError"],
    answer: 0,
    explanation: "Adjacent-literal concatenation happens at compile time, before any operator is applied, so 'a' 'b' is a single literal 'ab'. Then `'ab' * 2` gives 'abab'. If concatenation had lower priority you might expect 'abb'.",
    optionExplanations: ["Correct: the literals merge first, then repetition applies.", "That would require * to bind before literal concatenation.", "The repetition applies to the whole 'ab'.", "Adjacent literals are legal syntax."],
    tags: ["trap"]
  },
  {
    id: "py-strings-038", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print(''.join(sorted('banana', reverse=True)))",
    options: ["ananab", "nnbaaa", "nnaaab", "bnnaaa"],
    answer: 1,
    explanation: "`sorted()` on a string returns a list of its characters sorted by code point. reverse=True gives descending order: n, n, b, a, a, a. `''.join` turns the list back into a string. (Reversing the string itself would give 'ananab'.)",
    optionExplanations: ["That's 'banana' reversed, not sorted.", "Correct: descending order n > b > a.", "'b' sorts after 'a', so in descending order it comes before the a's.", "'n' > 'b', so the n's come first."]
  },
  {
    id: "py-strings-039", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print('abc'[::-1][::2][1:])",
    options: ["a", "c", "ca", "b"],
    answer: 0,
    explanation: "Evaluate left to right: 'abc'[::-1] → 'cba'; 'cba'[::2] takes indices 0 and 2 → 'ca'; 'ca'[1:] drops the first character → 'a'.",
    optionExplanations: ["Correct.", "The final [1:] removes 'c'.", "[1:] removes the first character of 'ca'.", "'b' is skipped by the [::2] step."]
  },
  {
    id: "py-strings-040", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "s = 'Mississippi'\nprint(s.find('ss'), s.rfind('ss'), s.index('ss', 3))",
    options: ["2 5 3", "2 5 5", "2 2 5", "3 6 6"],
    answer: 1,
    explanation: "'ss' occurs at indices 2 and 5. `find` returns the first (2), `rfind` returns the last (5). `index(sub, start)` searches from index 3 onward, so it finds the occurrence at 5; the returned index is still relative to the whole string, not to the start position.",
    optionExplanations: ["Index 3 is 's' followed by 'i', so 'ss' isn't found there.", "Correct.", "rfind returns the LAST occurrence, which is 5.", "Indices are 0-based: 'M' is index 0."]
  },
  {
    id: "py-strings-041", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "words = ['apple', 'Banana', 'cherry']\nprint(max(words), min(words), min(words, key=str.lower))",
    options: ["cherry apple apple", "cherry Banana apple", "Banana apple apple", "cherry Banana Banana"],
    answer: 1,
    explanation: "Plain comparison uses code points: uppercase 'B' (66) is smaller than lowercase 'a' (97) and 'c' (99). So the max is 'cherry' and the min is 'Banana'. With `key=str.lower` the comparison is case-insensitive, so 'apple' becomes the minimum.",
    optionExplanations: ["Without a key, 'Banana' (uppercase B) is the smallest.", "Correct.", "'c' (99) is the largest first character, so cherry is the max.", "With key=str.lower, 'apple' < 'banana'."],
    tags: ["trap"]
  },
  {
    id: "py-strings-042", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "width = 6\nprint(f'[{3.14159:{width}.3f}]')",
    options: ["[3.142]", "[ 3.142]", "[3.14159]", "[  3.14]"],
    answer: 1,
    explanation: "Format specs can contain nested replacement fields, so `{width}` is substituted first giving `6.3f`: total width 6, 3 decimals. '3.142' is 5 characters, so one space of padding is added; numbers are right-aligned by default.",
    optionExplanations: ["The width 6 adds one space of padding.", "Correct: nested field → width 6, right-aligned.", ".3f rounds to three decimals.", "The precision is 3 decimals, not 2."]
  },
  {
    id: "py-strings-043", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print('%05.1f %x %o' % (3.14159, 255, 8))",
    options: ["3.1 ff 10", "003.1 FF 8", "003.1 ff 10", "03.14 ff 10"],
    answer: 2,
    explanation: "`%05.1f` means width 5, zero-padded, 1 decimal: '3.1' padded to '003.1'. `%x` formats an integer in lowercase hexadecimal (255 → ff) and `%o` in octal (8 → 10).",
    optionExplanations: ["The 0 flag with width 5 adds leading zeros.", "%x is lowercase hex and %o is octal (8 is 10 in octal).", "Correct.", "The precision .1 gives one decimal place."]
  },
  {
    id: "py-strings-044", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "s = 'hello'\nprint(s[1:4:2], s[-1:-4:-1], s[::-2])",
    options: ["el oll olh", "el lle olh", "elo oll ole", "el oll ol"],
    answer: 0,
    explanation: "`s[1:4:2]` takes indices 1 and 3 ('e', 'l'). `s[-1:-4:-1]` walks backward from index -1 (4) down to, but excluding, -4 (1): indices 4, 3, 2 → 'oll'. `s[::-2]` starts at the end with step -2: indices 4, 2, 0 → 'olh'.",
    optionExplanations: ["Correct.", "The backward slice starts at 'o', so it reads 'oll'.", "Index 4 is excluded from s[1:4:2].", "s[::-2] includes index 0 ('h')."]
  },
  {
    id: "py-strings-045", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "from collections import Counter\nprint(Counter('listen') == Counter('silent'), sorted('abc') == 'abc')",
    options: ["True True", "False False", "True False", "False True"],
    answer: 2,
    explanation: "Two strings are anagrams if their character counts match, which Counter comparison checks in O(n). `sorted()` always returns a LIST, so `sorted('abc')` is ['a', 'b', 'c'], which is never equal to the string 'abc'. You'd need `''.join(sorted(s))`.",
    optionExplanations: ["sorted() returns a list, which never equals a str.", "listen and silent have identical character counts.", "Correct.", "Both results are reversed."],
    tags: ["trap", "interview-favourite"]
  },
  {
    id: "py-strings-046", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print('abc'.count(''), 'a-b-c'.split('-', 0), repr('ab' * -1))",
    options: ["0 ['a', 'b', 'c'] ''", "3 ['a-b-c'] ValueError", "4 ['a', 'b', 'c'] ''", "4 ['a-b-c'] ''"],
    answer: 3,
    explanation: "The empty string matches at every position between characters, including both ends, so a 3-character string contains it len + 1 = 4 times. maxsplit=0 means 'do not split', returning the whole string in a list. Multiplying a string by a negative number gives an empty string, not an error.",
    optionExplanations: ["count('') is len(s) + 1, and maxsplit=0 does no splitting.", "count('') is 4, and negative repetition just gives ''.", "maxsplit=0 performs zero splits.", "Correct."]
  },
  {
    id: "py-strings-047", subject: "python", subtopic: "Strings", difficulty: "hard", type: "code-output",
    question: "What is the output?",
    code: "print('-42'.zfill(5), '7'.center(4, '*'), 'ab'.ljust(4, '.'))",
    options: ["-0042 *7** ab..", "000-42 *7** ..ab", "-0042 **7* ab..", "00-42 *7** ab.."],
    answer: 0,
    explanation: "`zfill(width)` pads with zeros on the left but keeps a leading sign in front, so '-42' becomes '-0042'. `center(4, '*')` adds 3 fill characters; CPython puts the extra one on the right here, giving '*7**'. `ljust` left-justifies and pads on the right.",
    optionExplanations: ["Correct.", "zfill pads up to the total width 5, keeping the sign first, and ljust pads on the right.", "With 3 padding characters for a 1-char string, CPython places 1 on the left and 2 on the right.", "zfill inserts zeros after the sign, not before it."]
  }
);
