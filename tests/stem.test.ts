import { describe, it, expect } from 'vitest';
import { stem } from '../src/engine/stem';
import { countSyllables } from '../src/engine/syllables';

describe('stem', () => {
  it('groups regular verb forms', () => {
    const s = stem('walk');
    expect(stem('walks')).toBe(s);
    expect(stem('walked')).toBe(s);
    expect(stem('walking')).toBe(s);
  });

  it('handles consonant doubling', () => {
    expect(stem('running')).toBe(stem('run'));
    expect(stem('stopped')).toBe(stem('stop'));
  });

  it('handles -ies plurals', () => {
    expect(stem('cities')).toBe(stem('city'));
  });

  it('maps common irregulars', () => {
    expect(stem('ran')).toBe('run');
    expect(stem('went')).toBe('go');
    expect(stem('children')).toBe('child');
    expect(stem('was')).toBe('be');
  });

  it('strips -ly adverbs to their base', () => {
    expect(stem('quickly')).toBe('quick');
  });

  it('leaves short words alone', () => {
    expect(stem('cat')).toBe('cat');
    expect(stem('the')).toBe('the');
  });
});

describe('countSyllables', () => {
  it('counts common words reasonably', () => {
    expect(countSyllables('cat')).toBe(1);
    expect(countSyllables('happy')).toBe(2);
    expect(countSyllables('beautiful')).toBe(3);
    expect(countSyllables('table')).toBe(2);
  });

  it('always returns at least one for a word', () => {
    expect(countSyllables('a')).toBe(1);
    expect(countSyllables('rhythm')).toBeGreaterThanOrEqual(1);
  });

  it('returns zero for non-words', () => {
    expect(countSyllables('123')).toBe(0);
    expect(countSyllables('')).toBe(0);
  });
});
