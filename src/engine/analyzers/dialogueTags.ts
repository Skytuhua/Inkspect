import type { Doc, Report, Finding, ReportRow } from '../types';
import { NEUTRAL_TAGS, SAID_BOOKISMS } from '../wordlists';
import { density } from './util';

// DIALOGUE TAGS — count neutral tags ("said"/"asked") against "said-bookisms"
// (exclaimed, retorted, hissed…). The craft guidance: lean on invisible tags;
// flashy tags call attention to themselves. We highlight the bookisms.

export function analyzeDialogueTags(doc: Doc): Report {
  const findings: Finding[] = [];
  const bookismCounts = new Map<string, number>();
  let neutral = 0;
  let bookisms = 0;

  for (const w of doc.words) {
    if (NEUTRAL_TAGS.has(w.lower)) {
      neutral++;
    } else if (SAID_BOOKISMS.has(w.lower)) {
      bookisms++;
      bookismCounts.set(w.lower, (bookismCounts.get(w.lower) ?? 0) + 1);
      findings.push({
        start: w.start,
        end: w.end,
        group: w.lower,
        message: `Said-bookism "${w.text}" — a plain "said" is usually less obtrusive`,
      });
    }
  }

  const rows: ReportRow[] = [...bookismCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const ratio = neutral + bookisms > 0 ? bookisms / (neutral + bookisms) : 0;
  const severity = bookisms === 0 ? 'good' : ratio > 0.4 || bookisms > 10 ? 'high' : ratio > 0.2 ? 'warn' : 'info';

  return {
    id: 'dialogue-tags',
    label: 'Dialogue tags',
    description:
      '"Said-bookisms" — ornate dialogue tags (exclaimed, hissed, retorted) that draw attention. Invisible "said"/"asked" usually serve better.',
    severity,
    summary:
      neutral + bookisms === 0
        ? 'No dialogue tags found'
        : `${bookisms} fancy / ${neutral} plain (${(density(bookisms, doc.words.length)).toFixed(1)}/1k)`,
    findings,
    rows: rows.slice(0, 50),
  };
}
