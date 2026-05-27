import type { AnalysisResult } from '../engine';
import { computeScore } from './score';

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function readingTime(min: number): string {
  if (min < 1) return '<1 min';
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}m`;
}

function fleschLabel(score: number): string {
  if (score >= 90) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 60) return 'Plain English';
  if (score >= 50) return 'Fairly hard';
  if (score >= 30) return 'Hard';
  return 'Very hard';
}

function RhythmChart({ rhythm, mean }: { rhythm: number[]; mean: number }) {
  if (rhythm.length === 0) return null;
  // Downsample to keep the chart legible for long manuscripts.
  let data = rhythm;
  const MAX_BARS = 140;
  if (rhythm.length > MAX_BARS) {
    const bucket = Math.ceil(rhythm.length / MAX_BARS);
    data = [];
    for (let i = 0; i < rhythm.length; i += bucket) {
      const slice = rhythm.slice(i, i + bucket);
      data.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
  }
  const max = Math.max(...data, 1);
  const n = data.length;
  const meanY = 100 - (mean / max) * 100;
  return (
    <div className="rhythm">
      <svg viewBox={`0 0 ${n} 100`} preserveAspectRatio="none" role="img" aria-label="Sentence length across the manuscript">
        {data.map((v, i) => {
          const h = (v / max) * 100;
          return <rect key={i} className="bar" x={i + 0.1} y={100 - h} width={0.8} height={h} />;
        })}
        <line className="mean-line" x1={0} x2={n} y1={meanY} y2={meanY} />
      </svg>
      <div className="rhythm-legend">
        <span>start</span>
        <span>avg {mean.toFixed(0)} words/sentence</span>
        <span>end</span>
      </div>
    </div>
  );
}

export function Dashboard({ result }: { result: AnalysisResult | null }) {
  const s = result?.stats;
  const score = computeScore(result);
  return (
    <>
      <div className="section">
        <h3>Overview</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="score-badge">
              <span className="num" style={{ color: score.value >= 75 ? 'var(--good)' : score.value >= 45 ? 'var(--warn)' : 'var(--high)' }}>
                {score.value}
              </span>
              <span className="den">/ 100</span>
            </div>
            <div className="score-caption">{score.caption}</div>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat"><div className="v">{fmt(s?.words ?? 0)}</div><div className="k">words</div></div>
          <div className="stat"><div className="v">{fmt(s?.sentences ?? 0)}</div><div className="k">sentences</div></div>
          <div className="stat"><div className="v">{fmt(s?.paragraphs ?? 0)}</div><div className="k">paragraphs</div></div>
          <div className="stat"><div className="v">{fmt(s?.uniqueWords ?? 0)}</div><div className="k">unique words</div></div>
          <div className="stat"><div className="v">{s?.avgSentenceLength ?? 0}</div><div className="k">avg sentence</div></div>
          <div className="stat"><div className="v">{readingTime(s?.readingTimeMin ?? 0)}</div><div className="k">reading time</div></div>
        </div>
        <div className="read-row">
          <div className="read-card">
            <div className="v">{s?.fleschReadingEase ?? 0}</div>
            <div className="k">Flesch reading ease</div>
            <div className="grade">{s ? fleschLabel(s.fleschReadingEase) : ''}</div>
          </div>
          <div className="read-card">
            <div className="v">{s?.fleschKincaidGrade ?? 0}</div>
            <div className="k">Grade level</div>
            <div className="grade">{s ? `≈ US grade ${Math.round(s.fleschKincaidGrade)}` : ''}</div>
          </div>
        </div>
      </div>
      <div className="section">
        <h3>Sentence rhythm</h3>
        {result && result.rhythm.length > 0 ? (
          <RhythmChart rhythm={result.rhythm} mean={s?.avgSentenceLength ?? 0} />
        ) : (
          <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>No sentences yet.</div>
        )}
      </div>
    </>
  );
}
