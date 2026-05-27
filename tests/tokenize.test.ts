import { describe, it, expect } from 'vitest';
import { tokenize, normalize } from '../src/engine/tokenize';

describe('tokenize', () => {
  it('splits words with exact offsets', () => {
    const text = 'Hello, world!';
    const t = tokenize(text);
    expect(t.map((x) => x.text)).toEqual(['Hello', 'world']);
    expect(text.slice(t[0].start, t[0].end)).toBe('Hello');
    expect(text.slice(t[1].start, t[1].end)).toBe('world');
  });

  it('keeps contractions and hyphenated words whole', () => {
    const t = tokenize("don't mother-in-law rock'n'roll");
    expect(t.map((x) => x.lower)).toEqual(["don't", 'mother-in-law', "rock'n'roll"]);
  });

  it('normalizes curly apostrophes', () => {
    expect(normalize('Don’t')).toBe("don't");
    const t = tokenize('It’s');
    expect(t[0].lower).toBe("it's");
  });

  it('handles empty and whitespace-only input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   \n\t ')).toEqual([]);
  });

  it('does not crash on non-Latin text and counts tokens', () => {
    const t = tokenize('café naïve 北京 привет');
    expect(t.length).toBe(4);
  });
});
