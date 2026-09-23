/**
 * Core LaTeX escape and Unicode mapping functions.
 *
 * Design decision: escapeLatex escapes only characters that have a special
 * syntactic meaning in LaTeX text mode, plus a small set of characters that
 * commonly need escaping in practice. It does not escape every non-ASCII
 * character; instead, mapUnicodeToLatex is available for that purpose.
 */

const LATEX_ESCAPES = new Map([
  ['\\', '\\textbackslash{}'],
  ['{', '\\{'],
  ['}', '\\}'],
  ['$', '\\$'],
  ['&', '\\&'],
  ['#', '\\#'],
  ['^', '\\textasciicircum{}'],
  ['_', '\\_'],
  ['~', '\\textasciitilde{}'],
  ['%', '\\%'],
]);

const LATEX_UNESCAPES = new Map([
  ['\\textbackslash{}', '\\'],
  ['\\textbackslash', '\\'],
  ['\\{', '{'],
  ['\\}', '}'],
  ['\\$', '$'],
  ['\\&', '&'],
  ['\\#', '#'],
  ['\\textasciicircum{}', '^'],
  ['\\textasciicircum', '^'],
  ['\\_', '_'],
  ['\\textasciitilde{}', '~'],
  ['\\textasciitilde', '~'],
  ['\\%', '%'],
]);

// A curated, deterministic mapping. Longer sequences must be checked before
// shorter ones to avoid partial matches such as \aa matching the start of
// \aacute.
const UNICODE_TO_LATEX = new Map([
  ['Á', "\\'A"],
  ['á', "\\'a"],
  ['É', "\\'E"],
  ['é', "\\'e"],
  ['Í', "\\'I"],
  ['í', "\\'i"],
  ['Ó', "\\'O"],
  ['ó', "\\'o"],
  ['Ú', "\\'U"],
  ['ú', "\\'u"],
  ['Ý', "\\'Y"],
  ['ý', "\\'y"],
  ['Ä', '\\"A'],
  ['ä', '\\"a'],
  ['Ë', '\\"E'],
  ['ë', '\\"e'],
  ['Ï', '\\"I'],
  ['ï', '\\"i'],
  ['Ö', '\\"O'],
  ['ö', '\\"o'],
  ['Ü', '\\"U'],
  ['ü', '\\"u'],
  ['Ÿ', '\\"Y'],
  ['ÿ', '\\"y'],
  ['Ñ', '\\~N'],
  ['ñ', '\\~n'],
  ['Ç', '\\c{C}'],
  ['ç', '\\c{c}'],
  ['Å', '\\AA'],
  ['å', '\\aa'],
  ['Æ', '\\AE'],
  ['æ', '\\ae'],
  ['Œ', '\\OE'],
  ['œ', '\\oe'],
  ['Ø', '\\O'],
  ['ø', '\\o'],
  ['Ł', '\\L'],
  ['ł', '\\l'],
  ['Ð', '\\DH'],
  ['ð', '\\dh'],
  ['Þ', '\\TH'],
  ['þ', '\\th'],
  ['ß', '\\ss'],
  ['–', '--'],
  ['—', '---'],
  ['‘', '`'],
  ['’', "'"],
  ['“', '``'],
  ['”', "''"],
  ['…', '\\ldots{}'],
  ['€', '\\euro{}'],
  ['£', '\\pounds{}'],
  ['©', '\\copyright{}'],
  ['®', '\\textregistered{}'],
  ['™', '\\texttrademark{}'],
  ['°', '\\textdegree{}'],
  ['¹', '\\textonesuperior{}'],
  ['²', '\\texttwosuperior{}'],
  ['³', '\\textthreesuperior{}'],
  ['½', '\\textonehalf{}'],
  ['¼', '\\textonequarter{}'],
  ['¾', '\\textthreequarters{}'],
  ['×', '\\texttimes{}'],
  ['÷', '\\textdiv{}'],
  ['±', '\\textpm{}'],
  ['µ', '\\textmu{}'],
  ['Ω', '\\textOmega{}'],
  ['π', '\\textpi{}'],
]);

// Reverse mapping. Since multiple Unicode characters can map to the same LaTeX
// sequence (e.g. Å and \AA), the first one encountered wins.
const LATEX_TO_UNICODE = new Map();
for (const [unicode, latex] of UNICODE_TO_LATEX) {
  if (!LATEX_TO_UNICODE.has(latex)) {
    LATEX_TO_UNICODE.set(latex, unicode);
  }
}

/**
 * Escape LaTeX special characters in a string.
 *
 * @param {string} input
 * @returns {string}
 */
export function escapeLatex(input) {
  let result = '';
  for (const char of input) {
    result += LATEX_ESCAPES.get(char) ?? char;
  }
  return result;
}

/**
 * Unescape LaTeX special character sequences in a string.
 *
 * Recognises both the braced and unbraced forms produced by escapeLatex.
 *
 * @param {string} input
 * @returns {string}
 */
export function unescapeLatex(input) {
  let result = '';
  let i = 0;
  while (i < input.length) {
    let matched = false;
    for (const [latex, char] of LATEX_UNESCAPES) {
      if (input.startsWith(latex, i)) {
        result += char;
        i += latex.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += input[i];
      i += 1;
    }
  }
  return result;
}

/**
 * Map supported Unicode characters to their LaTeX command sequences.
 *
 * Characters not in the mapping are left unchanged. Escape sequences for
 * LaTeX special characters are not applied here; use escapeLatex for that.
 *
 * @param {string} input
 * @returns {string}
 */
export function mapUnicodeToLatex(input) {
  let result = '';
  for (const char of input) {
    result += UNICODE_TO_LATEX.get(char) ?? char;
  }
  return result;
}

/**
 * Map LaTeX command sequences back to Unicode characters.
 *
 * Only sequences present in mapUnicodeToLatex's mapping are recognised.
 * Sequences with a following argument (e.g. \\c{c}) are matched exactly.
 *
 * @param {string} input
 * @returns {string}
 */
export function mapLatexToUnicode(input) {
  let result = '';
  let i = 0;
  const sortedLatexSequences = [...LATEX_TO_UNICODE.keys()].sort(
    (a, b) => b.length - a.length,
  );
  while (i < input.length) {
    let matched = false;
    for (const latex of sortedLatexSequences) {
      if (input.startsWith(latex, i)) {
        result += LATEX_TO_UNICODE.get(latex);
        i += latex.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += input[i];
      i += 1;
    }
  }
  return result;
}
