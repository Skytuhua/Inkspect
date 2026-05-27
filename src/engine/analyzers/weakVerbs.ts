import type { Doc, Report, Finding, AnalyzeOptions, ReportRow } from '../types';
import { TO_BE } from '../wordlists';
import { density, severityFromDensity } from './util';

// A small set of common irregular past participles for the passive heuristic.
const IRREGULAR_PARTICIPLES = new Set<string>([
  'taken', 'given', 'seen', 'done', 'made', 'known', 'shown', 'thrown',
  'broken', 'spoken', 'chosen', 'driven', 'written', 'eaten', 'beaten',
  'forgotten', 'hidden', 'held', 'told', 'caught', 'taught', 'brought',
  'bought', 'built', 'sent', 'spent', 'kept', 'left', 'lost', 'found',
  'felt', 'meant', 'heard', 'led', 'paid', 'said', 'laid', 'struck',
  'hung', 'swung', 'worn', 'torn', 'born', 'sworn', 'frozen', 'stolen',
  'bound', 'wound', 'ground', 'shaken',
]);

function looksLikeParticiple(lower: string): boolean {
  if (IRREGULAR_PARTICIPLES.has(lower)) return true;
  return lower.length > 3 && lower.endsWith('ed');
}

// WEAK / "TO BE" VERBS + PASSIVE — high "to be" density makes prose static;
// passive voice (to-be + past participle) often weakens action.
export function analyzeWeakVerbs(doc: Doc, opts: AnalyzeOptions): Report {
  const findings: Finding[] = [];
  const counts = new Map<string, number>();
  let toBeTotal = 0;
  let passiveCount = 0;

  doc.words.forEach((w, i) => {
    if (!TO_BE.has(w.lower)) return;
    counts.set(w.lower, (counts.get(w.lower) ?? 0) + 1);
    toBeTotal++;

    // Passive heuristic: to-be, optionally an adverb, then a past participle.
    let j = i + 1;
    if (doc.words[j] && doc.words[j].lower.endsWith('ly')) j++;
    const part = doc.words[j];
    if (part && looksLikeParticiple(part.lower)) {
      passiveCount++;
      findings.push({
        start: w.start,
        end: part.end,
        group: 'passive',
        message: `Possible passive voice: "${doc.text.slice(w.start, part.end)}"`,
      });
    }
  });

  const d = density(toBeTotal, doc.words.length);
  const rows: ReportRow[] = [...counts.entries()]
    .map(([label, count]) => ({ label, count, density: density(count, doc.words.length) }))
    .sort((a, b) => b.count - a.count);

  // Severity blends to-be density with passive count.
  let severity = severityFromDensity(d, opts.densityWarn * 3); // to-be is naturally common
  if (passiveCount > doc.sentences.length * 0.15 && severity !== 'high') severity = 'warn';

  return {
    id: 'weak-verbs',
    label: 'Weak verbs & passive',
    description:
      '"To be" verb density (is/was/were…) and likely passive-voice constructions. Both tend to flatten and distance action.',
    severity,
    summary:
      toBeTotal === 0
        ? 'None found'
        : `${toBeTotal} "to be" (${d.toFixed(1)}/1k), ${passiveCount} passive`,
    findings,
    rows: rows.slice(0, 50),
  };
}
