import React, { useEffect, useLayoutEffect, useRef } from 'react';
import type { Finding } from '../engine';
import { IconFile, IconSparkle } from './icons';

interface Range {
  start: number;
  end: number;
  selected: boolean;
}

/** Clip findings into sorted, non-overlapping ranges for safe highlighting. */
function toRanges(findings: Finding[], selStart: number | null): Range[] {
  const sorted = [...findings].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: Range[] = [];
  let lastEnd = -1;
  for (const f of sorted) {
    const start = Math.max(f.start, lastEnd);
    if (start >= f.end) continue;
    out.push({ start, end: f.end, selected: selStart !== null && f.start === selStart });
    lastEnd = f.end;
  }
  return out;
}

interface Props {
  text: string;
  onChange: (t: string) => void;
  highlights: Finding[];
  selectedStart: number | null;
  onOpenFile: () => void;
  onLoadSample: () => void;
}

export function Editor({ text, onChange, highlights, selectedStart, onOpenFile, onLoadSample }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const selRef = useRef<HTMLElement>(null);

  const syncScroll = () => {
    const ta = taRef.current;
    const bd = backdropRef.current;
    if (ta && bd) {
      bd.scrollTop = ta.scrollTop;
      bd.scrollLeft = ta.scrollLeft;
    }
  };

  // Scroll to the selected finding when it changes.
  useEffect(() => {
    if (selectedStart === null) return;
    const sel = selRef.current;
    const ta = taRef.current;
    const bd = backdropRef.current;
    if (!sel || !ta || !bd) return;
    requestAnimationFrame(() => {
      sel.scrollIntoView({ block: 'center', behavior: 'smooth' });
      // Backdrop is the element that actually scrolled; mirror it to the textarea.
      requestAnimationFrame(() => {
        ta.scrollTop = bd.scrollTop;
        ta.scrollLeft = bd.scrollLeft;
      });
    });
  }, [selectedStart, highlights]);

  // Keep backdrop aligned if text/highlights change while scrolled.
  useLayoutEffect(syncScroll, [text, highlights]);

  const ranges = toRanges(highlights, selectedStart);
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    if (r.start > cursor) nodes.push(text.slice(cursor, r.start));
    nodes.push(
      <mark
        key={i}
        className={r.selected ? 'sel' : undefined}
        ref={r.selected ? (selRef as React.RefObject<HTMLElement>) : undefined}
      >
        {text.slice(r.start, r.end)}
      </mark>,
    );
    cursor = r.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  // Trailing newline so the backdrop's last line height matches the textarea.
  nodes.push('\n');

  const isEmpty = text.length === 0;

  return (
    <div className="editor-wrap">
      <div className="editor-backdrop" ref={backdropRef} aria-hidden="true">
        {nodes}
      </div>
      <textarea
        ref={taRef}
        className="editor-scroll"
        value={text}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder=""
        aria-label="Manuscript text"
      />
      {isEmpty && (
        <div className="empty-state">
          <div className="art">
            <IconFile size={48} />
          </div>
          <h2>Drop in your manuscript</h2>
          <p>
            Paste your text, open a <code>.txt</code>, <code>.md</code>, or Word
            <code>.docx</code> file, or load the sample. Everything is analyzed right
            here in your browser — nothing is uploaded.
          </p>
          <div className="cta">
            <button className="btn primary" onClick={onLoadSample}>
              <IconSparkle /> Load sample manuscript
            </button>
            <button className="btn" onClick={onOpenFile}>
              <IconFile /> Open a file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
