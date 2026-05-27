import { describe, it, expect } from 'vitest';
import { analyze } from '../src/engine';

describe('analyze — stats and robustness', () => {
  it('produces sane stats for a simple text', () => {
    const { stats } = analyze('The quick brown fox jumps. The lazy dog sleeps.');
    expect(stats.words).toBe(9);
    expect(stats.sentences).toBe(2);
    expect(stats.fleschReadingEase).toBeGreaterThan(0);
    expect(stats.readingTimeMin).toBeGreaterThanOrEqual(0);
  });

  it('handles empty input without throwing', () => {
    const r = analyze('');
    expect(r.stats.words).toBe(0);
    expect(r.stats.sentences).toBe(0);
    expect(r.reports.length).toBeGreaterThan(0);
    expect(r.reports.every((rep) => rep.findings.length === 0)).toBe(true);
  });

  it('handles whitespace-only input', () => {
    const r = analyze('   \n\n\t   ');
    expect(r.stats.words).toBe(0);
  });

  it('handles non-English / Unicode input without crashing', () => {
    const r = analyze('Привет мир. 北京是中国的首都。café déjà vu.');
    expect(r.stats.words).toBeGreaterThan(0);
  });

  it('always returns all expected reports', () => {
    const ids = analyze('Hello there. This is a test.').reports.map((r) => r.id).sort();
    expect(ids).toEqual(
      [
        'adverbs', 'cliches', 'crutch', 'dialogue-tags', 'echoes',
        'filter', 'openers', 'overused', 'phrases', 'rhythm', 'weak-verbs',
      ].sort(),
    );
  });

  it('computes a dialogue ratio from quoted text', () => {
    const narrationOnly = analyze('The room was cold and silent and empty.');
    expect(narrationOnly.stats.dialogueRatio).toBe(0);
    const withDialogue = analyze('"Hello there, my old friend," she said.');
    expect(withDialogue.stats.dialogueRatio).toBeGreaterThan(0.4);
  });

  it('is deterministic', () => {
    const text = 'She walked. She walked again. The dog ran really fast suddenly.';
    expect(JSON.stringify(analyze(text))).toBe(JSON.stringify(analyze(text)));
  });

  it('completes on a large (~100k word) input quickly', () => {
    const para =
      'The weary traveller walked slowly through the silent and shadowed forest, ' +
      'wondering whether she had seen this very path before, and she felt afraid. ';
    const big = para.repeat(6000); // ~150k words
    const t0 = Date.now();
    const r = analyze(big);
    const elapsed = Date.now() - t0;
    expect(r.stats.words).toBeGreaterThan(100000);
    expect(elapsed).toBeLessThan(8000);
  });

  it('respects custom options', () => {
    const text = 'apple banana apple';
    const tight = analyze(text, { echoWindow: 1 }).reports.find((r) => r.id === 'echoes')!;
    const loose = analyze(text, { echoWindow: 10 }).reports.find((r) => r.id === 'echoes')!;
    expect(loose.findings.length).toBeGreaterThanOrEqual(tight.findings.length);
  });
});
