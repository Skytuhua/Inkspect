import { describe, it, expect } from 'vitest';
import { analyze } from '../src/engine';

function report(text: string, id: string, opts = {}) {
  const r = analyze(text, opts).reports.find((x) => x.id === id);
  if (!r) throw new Error(`no report ${id}`);
  return r;
}

describe('echoes', () => {
  it('flags a stem repeated within the window', () => {
    const r = report('The dog barked and the dog ran while the dog slept.', 'echoes', { echoWindow: 20 });
    expect(r.findings.length).toBeGreaterThanOrEqual(3);
    expect(r.findings.every((f) => f.group === 'dog')).toBe(true);
  });

  it('groups inflected forms via the stemmer', () => {
    const r = report('She walked home, then walking back, she walks daily.', 'echoes', { echoWindow: 20 });
    const groups = new Set(r.findings.map((f) => f.group));
    expect(groups.has('walk')).toBe(true);
  });

  it('does not flag the same word when far apart', () => {
    // 60 distinct filler words so the filler itself never echoes.
    const filler = Array.from({ length: 60 }, (_, i) => `w${i}`).join(' ');
    const r = report(`apple ${filler} apple`, 'echoes', { echoWindow: 50 });
    expect(r.findings.some((f) => f.group === 'apple')).toBe(false);
  });

  it('ignores stopwords', () => {
    const r = report('the the the the the and and and', 'echoes', { echoWindow: 50 });
    expect(r.findings.length).toBe(0);
  });

  it('carries offsets that map to the source word', () => {
    const text = 'Smoke filled the smoke-filled room with smoke.';
    const r = report(text, 'echoes', { echoWindow: 20 });
    for (const f of r.findings) {
      expect(text.slice(f.start, f.end).toLowerCase()).toContain('smoke');
    }
  });
});

describe('repeated phrases', () => {
  it('finds verbatim repeated phrases', () => {
    const r = report('She shook her head slowly. Later she shook her head again.', 'phrases');
    expect(r.rows?.some((row) => row.label.includes('shook her head'))).toBe(true);
  });

  it('reports nothing when there are no repeats', () => {
    const r = report('Every single phrase here is wholly distinct from the others.', 'phrases');
    expect(r.findings.length).toBe(0);
  });
});

describe('crutch & filler words', () => {
  it('counts crutch words and computes density', () => {
    const r = report('I just really very actually simply wanted to literally go.', 'crutch');
    expect(r.findings.length).toBeGreaterThanOrEqual(5);
    expect(r.summary).toMatch(/\/1k/);
  });

  it('detects multi-word fillers', () => {
    const r = report('It was kind of nice, sort of like before.', 'crutch');
    expect(r.findings.some((f) => f.group === 'kind of')).toBe(true);
    expect(r.findings.some((f) => f.group === 'sort of')).toBe(true);
  });
});

describe('filter words', () => {
  it('flags filtering verbs', () => {
    const r = report('She saw the bird. He felt the cold. They heard a noise.', 'filter');
    const forms = r.findings.map((f) => f.group);
    expect(forms).toContain('saw');
    expect(forms).toContain('felt');
    expect(forms).toContain('heard');
  });
});

describe('adverbs', () => {
  it('flags -ly adverbs but not -ly non-adverbs', () => {
    const r = report('He quietly and quickly left. Only the family stayed.', 'adverbs');
    const words = r.findings.map((f) => f.message);
    expect(words.some((m) => m.includes('quietly'))).toBe(true);
    expect(words.some((m) => m.includes('quickly'))).toBe(true);
    expect(words.some((m) => m.includes('"only"') || m.includes('"family"'))).toBe(false);
  });

  it('specially marks adverbs on dialogue tags', () => {
    const r = report('"Go," he said quietly.', 'adverbs');
    expect(r.findings.some((f) => f.group === '-ly + tag')).toBe(true);
  });
});

describe('weak verbs & passive', () => {
  it('counts to-be verbs and detects passive voice', () => {
    const r = report('The ball was thrown by John. The window was broken.', 'weak-verbs');
    expect(r.findings.some((f) => f.group === 'passive')).toBe(true);
    expect(r.summary).toMatch(/passive/);
  });
});

describe('clichés', () => {
  it('matches cliché phrases case-insensitively with boundaries', () => {
    const r = report('At the end of the day, it was a piece of cake.', 'cliches');
    const labels = r.findings.map((f) => f.group);
    expect(labels).toContain('at the end of the day');
    expect(labels).toContain('piece of cake');
  });

  it('does not match inside larger words', () => {
    const r = report('The species will tell us nothing.', 'cliches');
    // "time will tell" must not match; ensure no false hit from "will tell"
    expect(r.findings.length).toBe(0);
  });
});

describe('dialogue tags', () => {
  it('separates neutral tags from said-bookisms', () => {
    const r = report('"Hi," she said. "Go!" he exclaimed. "Why?" she retorted.', 'dialogue-tags');
    expect(r.findings.length).toBe(2);
    expect(r.findings.map((f) => f.group).sort()).toEqual(['exclaimed', 'retorted']);
  });
});

describe('sentence rhythm', () => {
  it('flags a run of similar-length sentences', () => {
    const sentence = 'The cat sat on the mat today. ';
    const r = report(sentence.repeat(6), 'rhythm', { monotonyRun: 5 });
    expect(r.findings.length).toBeGreaterThanOrEqual(1);
  });

  it('does not flag varied sentence lengths', () => {
    const text = 'Run. The morning light spilled across the wide and waking valley below. She paused. Then everything, all at once and without any warning whatsoever, changed completely. Yes.';
    const r = report(text, 'rhythm', { monotonyRun: 5 });
    expect(r.findings.length).toBe(0);
  });
});

describe('overused words', () => {
  it('flags a stem used many times', () => {
    const r = report(('shadow ').repeat(10) + 'and light and dark and more', 'overused');
    expect(r.rows?.[0].label).toContain('shadow');
    expect(r.findings.length).toBeGreaterThan(0);
  });
});
