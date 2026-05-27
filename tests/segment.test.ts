import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/engine/tokenize';
import { segmentSentences, segmentParagraphs } from '../src/engine/segment';

function sentences(text: string) {
  return segmentSentences(text, tokenize(text)).map((s) => s.text);
}

describe('segmentSentences', () => {
  it('splits on terminal punctuation', () => {
    expect(sentences('I ran. She walked! Did you?')).toEqual([
      'I ran.',
      'She walked!',
      'Did you?',
    ]);
  });

  it('does not split on common abbreviations', () => {
    const s = sentences('Mr. Smith went to Washington. He was happy.');
    expect(s.length).toBe(2);
    expect(s[0]).toBe('Mr. Smith went to Washington.');
  });

  it('keeps the closing quote with the sentence', () => {
    const s = sentences('"Stop!" she cried. He left.');
    expect(s.length).toBe(2);
    expect(s[0]).toContain('"Stop!"');
  });

  it('treats trailing text without punctuation as a sentence', () => {
    expect(sentences('No period here')).toEqual(['No period here']);
  });

  it('does not split decimals or initials', () => {
    const s = sentences('It cost 3.50 dollars. J. R. R. Tolkien wrote it.');
    expect(s.length).toBe(2);
  });

  it('returns empty for empty input', () => {
    expect(sentences('')).toEqual([]);
  });

  it('preserves offsets that map back to the source', () => {
    const text = 'One. Two. Three.';
    const segs = segmentSentences(text, tokenize(text));
    for (const s of segs) {
      expect(text.slice(s.start, s.end)).toBe(s.text);
    }
  });
});

describe('segmentParagraphs', () => {
  it('splits on blank lines', () => {
    const text = 'Para one line.\n\nPara two here.\n\nPara three.';
    const p = segmentParagraphs(text, tokenize(text));
    expect(p.length).toBe(3);
    expect(p[0].wordCount).toBe(3);
  });

  it('ignores runs of blank lines', () => {
    const text = 'A b c.\n\n\n\nD e.';
    const p = segmentParagraphs(text, tokenize(text));
    expect(p.length).toBe(2);
  });
});
