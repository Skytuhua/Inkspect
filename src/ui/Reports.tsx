import type { Report, Finding } from '../engine';
import { IconChevron, IconUp, IconDown } from './icons';

interface Props {
  reports: Report[];
  openId: string | null;
  findingIndex: number;
  /** Findings currently active for the open report (after any row focus). */
  activeFindings: Finding[];
  focus: string | null;
  onToggle: (id: string) => void;
  onStep: (delta: number) => void;
  onFocusRow: (match: string) => void;
}

function RowList({ report, focus, onFocusRow }: { report: Report; focus: string | null; onFocusRow: (m: string) => void }) {
  if (!report.rows || report.rows.length === 0) return null;
  const max = Math.max(...report.rows.map((r) => r.count), 1);
  return (
    <div className="rows">
      {report.rows.slice(0, 12).map((row, i) => {
        const clickable = !!row.match;
        const active = !!row.match && row.match === focus;
        return (
          <button
            type="button"
            className={`row-item${clickable ? ' clickable' : ''}${active ? ' active' : ''}`}
            key={i}
            title={clickable ? `Highlight "${row.label}" in the text` : row.label}
            disabled={!clickable}
            onClick={() => row.match && onFocusRow(row.match)}
          >
            <span className="rl">{row.label}</span>
            <span className="rc">{row.count}</span>
            <span className="rd">{row.density !== undefined ? `${row.density.toFixed(1)}${report.id === 'openers' ? '%' : '/1k'}` : ''}</span>
            <span className="row-bar-wrap">
              <span className="row-bar" style={{ width: `${(row.count / max) * 100}%` }} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Reports({ reports, openId, findingIndex, activeFindings, focus, onToggle, onStep, onFocusRow }: Props) {
  return (
    <div className="section" style={{ borderBottom: 'none' }}>
      <h3>Reports</h3>
      {reports.map((report) => {
        const open = report.id === openId;
        const fcount = open ? activeFindings.length : report.findings.length;
        const current = open && activeFindings.length > 0 ? activeFindings[Math.min(findingIndex, activeFindings.length - 1)] : null;
        return (
          <div className={`report${open ? ' open active' : ''}`} key={report.id}>
            <button className="report-head" onClick={() => onToggle(report.id)} aria-expanded={open}>
              <span className={`sev-dot sev-${report.severity}`} />
              <span className="label">{report.label}</span>
              <span className="summary">{report.summary}</span>
              <span className="chev"><IconChevron size={16} /></span>
            </button>
            {open && (
              <div className="report-body">
                <p className="report-desc">{report.description}</p>
                <RowList report={report} focus={focus} onFocusRow={onFocusRow} />
                {report.findings.length > 0 ? (
                  <>
                    <div className="findings-nav">
                      <span className="count">
                        {focus ? (
                          <>
                            <button className="focus-clear" onClick={() => onFocusRow(focus)}>“{focus}” ✕</button>
                            {' '}{fcount} highlight{fcount === 1 ? '' : 's'}
                          </>
                        ) : (
                          <>{fcount} highlight{fcount === 1 ? '' : 's'} in text</>
                        )}
                      </span>
                      <button className="mini-btn" onClick={() => onStep(-1)} aria-label="Previous highlight" disabled={fcount === 0}>
                        <IconUp size={15} />
                      </button>
                      <span style={{ minWidth: 44, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                        {fcount === 0 ? '0 / 0' : `${Math.min(findingIndex + 1, fcount)} / ${fcount}`}
                      </span>
                      <button className="mini-btn" onClick={() => onStep(1)} aria-label="Next highlight" disabled={fcount === 0}>
                        <IconDown size={15} />
                      </button>
                    </div>
                    {current && <div className="finding-msg">{current.message}</div>}
                  </>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--good)' }}>Nothing flagged here.</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
