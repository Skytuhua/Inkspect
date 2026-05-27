import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnalyzeOptions } from '../engine';
import { DEFAULT_OPTIONS } from '../engine';
import { SAMPLE_TEXT, SAMPLE_TITLE } from '../sample';
import { useAnalysis } from './useAnalysis';
import { Editor } from './Editor';
import { Dashboard } from './Dashboard';
import { Reports } from './Reports';
import { readFile } from './fileImport';
import { reportToMarkdown, downloadText } from './exportReport';
import {
  IconLogo, IconFile, IconSparkle, IconTrash, IconCopy, IconDownload,
  IconSun, IconMoon, IconShield,
} from './icons';

type Theme = 'dark' | 'light';
type Toast = { kind: 'error' | 'info'; msg: string } | null;

const STORE_TEXT = 'inkspect:text';
const STORE_THEME = 'inkspect:theme';

export default function App() {
  const [text, setText] = useState<string>(() => localStorage.getItem(STORE_TEXT) ?? '');
  const [sourceName, setSourceName] = useState('manuscript');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(STORE_THEME) as Theme) || 'dark');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [findingIndex, setFindingIndex] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);

  const [echoWindow, setEchoWindow] = useState(DEFAULT_OPTIONS.echoWindow);
  const [densityWarn, setDensityWarn] = useState(DEFAULT_OPTIONS.densityWarn);
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number>();
  const dragDepth = useRef(0);

  const options = useMemo<Partial<AnalyzeOptions>>(
    () => ({ echoWindow, densityWarn }),
    [echoWindow, densityWarn],
  );
  const { result, analyzing } = useAnalysis(text, options);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORE_THEME, theme);
  }, [theme]);

  useEffect(() => {
    const id = window.setTimeout(() => localStorage.setItem(STORE_TEXT, text), 500);
    return () => window.clearTimeout(id);
  }, [text]);

  const showToast = useCallback((kind: 'error' | 'info', msg: string) => {
    setToast({ kind, msg });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  const openReport = useMemo(
    () => result?.reports.find((r) => r.id === openReportId) ?? null,
    [result, openReportId],
  );
  // When a breakdown row is focused, restrict highlights/navigation to that word.
  const activeFindings = useMemo(() => {
    const all = openReport?.findings ?? [];
    if (!focus) return all;
    return all.filter(
      (f) => f.group === focus || text.slice(f.start, f.end).toLowerCase() === focus,
    );
  }, [openReport, focus, text]);
  const highlights = activeFindings;
  const selectedStart =
    activeFindings.length > 0
      ? activeFindings[Math.min(findingIndex, activeFindings.length - 1)]?.start ?? null
      : null;

  const handleToggleReport = (id: string) => {
    setFocus(null);
    if (id === openReportId) {
      setOpenReportId(null);
    } else {
      setOpenReportId(id);
      setFindingIndex(0);
    }
  };

  const handleStep = (delta: number) => {
    const n = activeFindings.length;
    if (n === 0) return;
    setFindingIndex((i) => (i + delta + n) % n);
  };

  const handleFocusRow = (match: string) => {
    setFocus((cur) => (cur === match ? null : match));
    setFindingIndex(0);
  };

  const handleOpenFile = () => fileRef.current?.click();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const { text: t, name } = await readFile(file);
      setText(t);
      setSourceName(name.replace(/\.[^.]+$/, ''));
      setOpenReportId(null);
      showToast('info', `Loaded "${name}" (${t.length.toLocaleString('en-US')} characters)`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Could not read that file.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes('Files')) return;
    dragDepth.current += 1;
    setDragging(true);
  };
  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const loadSample = () => {
    setText(SAMPLE_TEXT);
    setSourceName(SAMPLE_TITLE);
    setOpenReportId('echoes');
    setFindingIndex(0);
    setFocus(null);
  };

  const clearAll = () => {
    setText('');
    setSourceName('manuscript');
    setOpenReportId(null);
    setFocus(null);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('info', 'Manuscript copied to clipboard');
    } catch {
      showToast('error', 'Clipboard not available in this browser');
    }
  };

  const exportReport = () => {
    if (!result || result.stats.words === 0) {
      showToast('error', 'Nothing to export yet — add some text first.');
      return;
    }
    const md = reportToMarkdown(result, sourceName);
    downloadText(`inkspect-report-${sourceName.replace(/\s+/g, '-').toLowerCase()}.md`, md);
    showToast('info', 'Report downloaded');
  };

  const hasText = text.trim().length > 0;

  return (
    <div
      className="app"
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {dragging && (
        <div className="drop-overlay">
          <div className="drop-card">
            <IconFile size={40} />
            <strong>Drop to load your manuscript</strong>
            <span>.txt, .md, or Word .docx — analyzed locally</span>
          </div>
        </div>
      )}
      <header className="header">
        <div className="brand">
          <span className="logo"><IconLogo /></span>
          Inkspect
          <span className="tag">private self-editing for fiction writers</span>
        </div>
        <div className="spacer" />
        <span className="privacy-pill"><IconShield /> Private · runs in your browser</span>
        <button
          className="icon-btn"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          aria-label="Toggle colour theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
        </button>
      </header>

      <div className="toolbar">
        <button className="btn" onClick={handleOpenFile} disabled={busy}>
          <IconFile /> {busy ? 'Reading…' : 'Open file'}
        </button>
        <button className="btn" onClick={loadSample}><IconSparkle /> Sample</button>
        <button className="btn" onClick={clearAll} disabled={!hasText}><IconTrash /> Clear</button>
        <button className="btn" onClick={copyText} disabled={!hasText}><IconCopy /> Copy text</button>
        <button className="btn" onClick={exportReport} disabled={!hasText}><IconDownload /> Export report</button>
        <div className="spacer" />
        <div className="options">
          <label title="Words within which a repeated root counts as an echo">
            Echo window
            <input
              type="range" min={15} max={120} step={5}
              value={echoWindow}
              onChange={(e) => setEchoWindow(Number(e.target.value))}
            />
            <span className="val">{echoWindow}</span>
          </label>
          <label title="Lower = stricter about crutch / filter word density">
            Strictness
            <input
              type="range" min={4} max={16} step={1}
              value={20 - densityWarn}
              onChange={(e) => setDensityWarn(20 - Number(e.target.value))}
            />
            <span className="val">{20 - densityWarn}</span>
          </label>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.markdown,.text,.rtf,.srt,.vtt,.docx"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="main">
        <div className="editor-col">
          <Editor
            text={text}
            onChange={setText}
            highlights={highlights}
            selectedStart={selectedStart}
            onOpenFile={handleOpenFile}
            onLoadSample={loadSample}
          />
          <div className="editor-status">
            <span>
              {sourceName ? <strong>{sourceName}</strong> : 'Untitled'} · editable — type to re-analyze
            </span>
            {analyzing ? (
              <span className="analyzing"><span className="dot-pulse" /> analyzing…</span>
            ) : (
              <span>{result?.stats.words ?? 0} words</span>
            )}
          </div>
        </div>

        <aside className="sidebar" aria-label="Analysis">
          {hasText ? (
            <>
              <Dashboard result={result} />
              {result && (
                <Reports
                  reports={result.reports}
                  openId={openReportId}
                  findingIndex={findingIndex}
                  activeFindings={activeFindings}
                  focus={focus}
                  onToggle={handleToggleReport}
                  onStep={handleStep}
                  onFocusRow={handleFocusRow}
                />
              )}
            </>
          ) : (
            <div className="sidebar-empty">
              Paste or open a manuscript to see your overview, readability, sentence
              rhythm, and the full set of craft reports here.
            </div>
          )}
        </aside>
      </div>

      {toast && <div className={`toast ${toast.kind === 'info' ? 'info' : ''}`} role="status">{toast.msg}</div>}
    </div>
  );
}
