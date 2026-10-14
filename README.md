# LaTeX Escape Encoder

A dependency-free JavaScript library that escapes LaTeX special characters and maps a curated set of Unicode characters to LaTeX command sequences (and back).

## Usage

```javascript
import {
  escapeLatex,
  unescapeLatex,
  mapUnicodeToLatex,
  mapLatexToUnicode,
} from 'latex-escape-encoder';

escapeLatex('100% & done'); // '100\% \& done'
unescapeLatex('100\\% \\& done'); // '100% & done'
mapUnicodeToLatex('café'); // "caf\\'e"
mapLatexToUnicode("caf\\'e"); // 'café'
```

## Why this library exists

LaTeX reserves several ASCII characters for syntax, and Unicode characters such as accented letters require command sequences in standard LaTeX. This library provides a single, predictable place for those conversions.

Trade-off: the Unicode mapping is intentionally small and curated. It covers common Western European accented letters, typographic punctuation, and a few symbols. It does not attempt to map every Unicode code point. This keeps the library small and avoids depending on external data tables.

## Awkward edge

The backslash is both an escape character and a LaTeX command prefix. `escapeLatex` converts a literal backslash to `\textbackslash{}`, while `unescapeLatex` accepts both `\textbackslash{}` and `\textbackslash`. When combining `escapeLatex` with `mapUnicodeToLatex`, call `mapUnicodeToLatex` first, then `escapeLatex` on the result, so that LaTeX command sequences produced by the mapping are not escaped again.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

