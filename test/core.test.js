import test from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeLatex,
  unescapeLatex,
  mapUnicodeToLatex,
  mapLatexToUnicode,
} from '../src/core.js';

test('escapeLatex escapes all special characters', () => {
  const input = '\\{}_$#&^~%';
  const expected =
    '\\textbackslash{}\\{\\}\\_\\$\\#\\&\\textasciicircum{}\\textasciitilde{}\\%';
  assert.equal(escapeLatex(input), expected);
});

test('escapeLatex leaves ordinary text untouched', () => {
  assert.equal(escapeLatex('Hello, world! 123'), 'Hello, world! 123');
});

test('escapeLatex handles empty string', () => {
  assert.equal(escapeLatex(''), '');
});

test('unescapeLatex reverses escapeLatex', () => {
  const original = 'A \\ B { C } $ D & E # F ^ G _ H ~ I % J';
  assert.equal(unescapeLatex(escapeLatex(original)), original);
});

test('unescapeLatex handles unbraced forms', () => {
  assert.equal(unescapeLatex('\\textbackslash'), '\\');
  assert.equal(unescapeLatex('\\textasciicircum'), '^');
  assert.equal(unescapeLatex('\\textasciitilde'), '~');
});

test('unescapeLatex leaves unknown commands intact', () => {
  assert.equal(unescapeLatex('\\foo{}'), '\\foo{}');
});

test('mapUnicodeToLatex maps accented characters', () => {
  assert.equal(mapUnicodeToLatex('café'), "caf\\'e");
  assert.equal(mapUnicodeToLatex('Ångström'), '\\AAngstr\\"om');
});

test('mapUnicodeToLatex maps punctuation and symbols', () => {
  assert.equal(
    mapUnicodeToLatex('– — ‘ ’ “ ” …'),
    '-- --- ` \' `` \'\' \\ldots{}',
  );
});

test('mapUnicodeToLatex leaves unmapped characters unchanged', () => {
  assert.equal(mapUnicodeToLatex('abc 123'), 'abc 123');
});

test('mapLatexToUnicode reverses mapUnicodeToLatex for supported sequences', () => {
  const original = 'café Ångström – — “ ” …';
  assert.equal(mapLatexToUnicode(mapUnicodeToLatex(original)), original);
});

test('mapLatexToUnicode matches longer sequences before shorter', () => {
  // \aa is a prefix of \aacute in some mappings; ensure longer wins.
  assert.equal(mapLatexToUnicode('\\aa'), 'å');
  assert.equal(mapLatexToUnicode('\\AA'), 'Å');
});

test('mapLatexToUnicode leaves unknown LaTeX commands intact', () => {
  assert.equal(mapLatexToUnicode('\\foo{}'), '\\foo{}');
});
