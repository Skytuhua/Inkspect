import type { AnalysisResult, Severity } from '../engine';

const PENALTY: Record<Severity, number> = { good: 0, info: 2, warn: 7, high: 14 };

export interface Score {
  value: number;
  caption: string;
}

/**
 * A rough 0–100 "polish" score derived from how many reports flag issues and
 * how severe they are. It is a heuristic at-a-glance signal, not a grade — the
 * individual reports are where the real guidance lives.
 */
export function computeScore(result: AnalysisResult | null): Score {
  if (!result || result.stats.words === 0) return { value: 0, caption: 'No text yet' };
  let penalty = 0;
  for (const r of result.reports) penalty += PENALTY[r.severity];
  const value = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  let caption: string;
  if (value >= 90) caption = 'Very clean prose';
  else if (value >= 75) caption = 'Solid — a few things to tighten';
  else if (value >= 55) caption = 'Some recurring patterns to address';
  else if (value >= 35) caption = 'Several areas need attention';
  else caption = 'Lots to tighten up';
  return { value, caption };
}
