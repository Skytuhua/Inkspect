import type { Doc, Report, Finding, AnalyzeOptions } from '../types';
import { stem } from '../stem';
import { STOPWORDS } from '../wordlists';

// ECHOES — the headline analysis. A word *stem* repeated within a short window
// of words is an "echo": jarring on the page even when the exact form differs
// ("walked"… "walking"). This is the feature ProWritingAid/Grammarly gate behind
// a subscription. We slide a window of `echoWindow` words and report any stem
// that recurs at least `echoMinCount` times inside it, de-duplicating clusters.

interface Cluster {
  stem: string;
  positions: number[]; // indices into doc.words
}

export function analyzeEchoes(doc: Doc, opts: AnalyzeOptions): Report {
  const { words } = doc;
  const window = opts.echoWindow;
  const minCount = opts.echoMinCount;

  // Pre-compute stems, skipping stopwords and very short words.
  const stems: (string | null)[] = words.map((w) => {
    if (w.lower.length < 3) return null;
    if (STOPWORDS.has(w.lower)) return null;
    if (!/[a-z]/i.test(w.lower)) return null; // skip pure numbers
    return stem(w.lower);
  });

  // For each stem occurrence, look back within the window for prior occurrences
  // and grow clusters. We track the last cluster per stem to merge chains.
  const clusters: Cluster[] = [];
  const lastClusterForStem = new Map<string, Cluster>();
  const lastIndexForStem = new Map<string, number>();

  for (let i = 0; i < words.length; i++) {
    const s = stems[i];
    if (!s) continue;
    const prev = lastIndexForStem.get(s);
    if (prev !== undefined && i - prev <= window) {
      let cluster = lastClusterForStem.get(s);
      const lastPos = cluster ? cluster.positions[cluster.positions.length - 1] : -1;
      if (cluster && lastPos === prev) {
        cluster.positions.push(i);
      } else {
        cluster = { stem: s, positions: [prev, i] };
        clusters.push(cluster);
        lastClusterForStem.set(s, cluster);
      }
    }
    lastIndexForStem.set(s, i);
  }

  const findings: Finding[] = [];
  let clusterCount = 0;
  for (const c of clusters) {
    if (c.positions.length < minCount) continue;
    clusterCount++;
    const forms = c.positions.map((p) => words[p].lower);
    const distinct = [...new Set(forms)];
    const label =
      distinct.length === 1
        ? `"${distinct[0]}"`
        : `"${distinct.join('" / "')}"`;
    for (const p of c.positions) {
      const w = words[p];
      findings.push({
        start: w.start,
        end: w.end,
        group: c.stem,
        message: `Echo: ${label} repeats ${c.positions.length}× within ~${window} words`,
      });
    }
  }

  const severity = clusterCount === 0 ? 'good' : clusterCount > doc.sentences.length * 0.3 ? 'high' : 'warn';
  return {
    id: 'echoes',
    label: 'Echoes',
    description:
      'Words (by root) that repeat within a short span — the close repetition readers notice even when the exact form differs.',
    severity,
    summary: clusterCount === 0 ? 'No echoes found' : `${clusterCount} echo${clusterCount === 1 ? '' : 'es'}`,
    findings,
  };
}
