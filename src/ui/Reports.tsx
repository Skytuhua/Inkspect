import type { Report } from '../engine';
import { IconChevron, IconUp, IconDown } from './icons';

interface Props {
  reports: Report[];
  openId: string | null;
  findingIndex: number;
  onToggle: (id: string) => void;
  onStep: (delta: number) => void;
}

function RowList({ report }: { report: Report }) {
  if (!report.rows || report.rows.length === 0) return null;
  const max = Math.max(...report.rows.map((r) => r.count), 1);
  return (
    <div className="rows">
      {report.rows.slice(0, 12).map((row, i) => (
        <div className="row-item" key={i} title={row.label}>
          <div className="rl">{row.label}</div>
          <div className="rc">{row.count}</div>
          <div className="rd">{row.density !== undefined ? `${row.density.toFixed(1)}/1k` : ''}</div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="row-bar" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Reports({ reports, openId, findingIndex, onToggle, onStep }: Props) {
  return (
    <div className="section" style={{ borderBottom: 'none' }}>
      <h3>Reports</h3>
      {reports.map((report) => {
        const open = report.id === openId;
        const fcount = report.findings.length;
        const current = open && fcount > 0 ? report.findings[Math.min(findingIndex, fcount - 1)] : null;
        return (
          <div className={`report${open ? ' open active' : ''}`} key={report.id}>
            <button
              className="report-head"
              onClick={() => onToggle(report.id)}
              aria-expanded={open}
            >
              <span className={`sev-dot sev-${report.severity}`} />
              <span className="label">{report.label}</span>
              <span className="summary">{report.summary}</span>
              <span className="chev"><IconChevron size={16} /></span>
            </button>
            {open && (
              <div className="report-body">
                <p className="report-desc">{report.description}</p>
                <RowList report={report} />
                {fcount > 0 ? (
                  <>
                    <div className="findings-nav">
                      <span className="count">
                        {fcount} highlight{fcount === 1 ? '' : 's'} in text
                      </span>
                      <button className="mini-btn" onClick={() => onStep(-1)} aria-label="Previous highlight">
                        <IconUp size={15} />
                      </button>
                      <span style={{ minWidth: 44, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                        {Math.min(findingIndex + 1, fcount)} / {fcount}
                      </span>
                      <button className="mini-btn" onClick={() => onStep(1)} aria-label="Next highlight">
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
