import type { Doc, Report, AnalyzeOptions } from '../types';
import { FILTER_WORDS } from '../wordlists';
import { analyzeFromSet } from './crutch';

// FILTER WORDS — verbs that filter the action through the POV character ("she
// saw", "he felt", "I noticed"), distancing the reader from direct experience.
export function analyzeFilterWords(doc: Doc, opts: AnalyzeOptions): Report {
  return analyzeFromSet(
    doc,
    'filter',
    'Filter words',
    'Verbs like "saw", "felt", "noticed" and "realized" that filter the scene through the narrator and hold readers at a distance.',
    FILTER_WORDS,
    'Filter word',
    opts.densityWarn,
  );
}
