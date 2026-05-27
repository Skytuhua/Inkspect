import type { Token, Sentence, Paragraph } from './types';

// Abbreviations that end in a period but do not end a sentence. Kept lower-case
// and matched against the token immediately before a period.
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'mt', 'vs', 'etc',
  'inc', 'ltd', 'co', 'corp', 'no', 'vol', 'fig', 'al', 'ave', 'blvd',
  'gen', 'col', 'capt', 'sgt', 'lt', 'rev', 'hon', 'gov', 'pres',
  'ph', 'phd', 'ed', 'eds', 'pp', 'approx', 'dept', 'est', 'min', 'max',
]);

const SENTENCE_END = /[.!?]/;
// Characters that may legitimately trail a sentence terminator (closing quote,
// bracket, ellipsis continuation).
const TRAILING = new Set(['"', "'", '”', '’', ')', ']', '»', '…']);

/**
 * Split text into sentences, returning offset-preserving spans. Uses a
 * conservative rule set: a sentence ends at `.`/`!`/`?` (plus any trailing
 * quotes/brackets) when followed by whitespace and a likely sentence start,
 * unless the preceding word is a known abbreviation or a single initial.
 */
export function segmentSentences(text: string, words: Token[]): Sentence[] {
  const sentences: Sentence[] = [];
  if (words.length === 0) return sentences;

  const firstNonSpace = (from: number): number => {
    let p = from;
    while (p < text.length && /\s/.test(text[p])) p++;
    return p;
  };

  let sentStartOffset = firstNonSpace(0); // include a leading quote, e.g. "Stop!"
  let sentStartWord = 0;

  const push = (endOffset: number, wordEnd: number) => {
    const trimmed = text.slice(sentStartOffset, endOffset).replace(/\s+$/, '');
    if (trimmed.trim().length === 0) return;
    sentences.push({
      text: trimmed,
      start: sentStartOffset,
      end: sentStartOffset + trimmed.length,
      wordStart: sentStartWord,
      wordEnd,
      wordCount: wordEnd - sentStartWord,
    });
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const next = words[i + 1];
    const gapStart = word.end;
    const gapEnd = next ? next.start : text.length;
    const gap = text.slice(gapStart, gapEnd);

    // First sentence-ending punctuation in the gap after this word.
    let termIdx = -1;
    for (let k = 0; k < gap.length; k++) {
      if (SENTENCE_END.test(gap[k])) {
        termIdx = k;
        break;
      }
    }
    if (termIdx === -1) continue;

    // Don't break on abbreviations or single capital initials ("J. R. R.").
    const isAbbrev =
      ABBREVIATIONS.has(word.lower) ||
      (word.text.length === 1 && /\p{Lu}/u.test(word.text));
    if (isAbbrev && gap[termIdx] === '.') continue;

    // Extend over consecutive terminators and trailing quotes/brackets.
    let endPos = gapStart + termIdx + 1;
    while (endPos < gapEnd && (SENTENCE_END.test(text[endPos]) || TRAILING.has(text[endPos]))) {
      endPos++;
    }

    if (next) {
      // A real boundary needs whitespace after the terminator; without it this
      // is mid-token punctuation like "3.50".
      const afterChar = text[endPos];
      if (afterChar === undefined || !/\s/.test(afterChar)) continue;
      // A following lower-case word usually signals a continuation, e.g.
      // dialogue: `"Stop!" she cried.` — don't split before "she".
      if (/^\p{Ll}/u.test(next.text)) continue;
    }

    push(endPos, i + 1);
    sentStartOffset = next ? firstNonSpace(endPos) : endPos;
    sentStartWord = i + 1;
  }

  // Trailing text with no terminator is still a sentence.
  if (sentStartWord < words.length) {
    push(words[words.length - 1].end, words.length);
  }

  return sentences;
}

/** Split into paragraphs on blank lines, with offsets and word counts. */
export function segmentParagraphs(text: string, words: Token[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const re = /\n[ \t]*\n/g;
  let start = 0;
  let m: RegExpExecArray | null;
  const bounds: Array<[number, number]> = [];
  while ((m = re.exec(text)) !== null) {
    bounds.push([start, m.index]);
    start = m.index + m[0].length;
  }
  bounds.push([start, text.length]);

  let wi = 0;
  for (const [s, e] of bounds) {
    if (text.slice(s, e).trim().length === 0) continue;
    let count = 0;
    const firstWord = wi;
    while (wi < words.length && words[wi].start < e) {
      if (words[wi].start >= s) count++;
      wi++;
    }
    if (count === 0 && firstWord === wi) continue;
    paragraphs.push({ start: s, end: e, wordCount: count });
  }
  return paragraphs;
}
