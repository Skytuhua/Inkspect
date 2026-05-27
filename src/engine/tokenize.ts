import type { Token } from './types';

// A "word" is a run of Unicode letters/digits, optionally joined by a single
// apostrophe or hyphen (so "don't", "mother-in-law", "rock'n'roll" stay whole).
// We use the `u` flag and Unicode property escapes so non-English text doesn't
// crash the tokenizer — it simply produces word tokens we can count.
const WORD_RE = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/** Normalize a word for matching: lower-case and fold curly apostrophes. */
export function normalize(word: string): string {
  return word.toLowerCase().replace(/’/g, "'");
}

/** Tokenize source text into word tokens with exact character offsets. */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  for (const m of text.matchAll(WORD_RE)) {
    const raw = m[0];
    const start = m.index ?? 0;
    tokens.push({
      text: raw,
      lower: normalize(raw),
      start,
      end: start + raw.length,
    });
  }
  return tokens;
}
