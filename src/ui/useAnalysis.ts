import { useEffect, useRef, useState } from 'react';
import type { AnalysisResult, AnalyzeOptions } from '../engine';
import { analyze } from '../engine';

// Manages the analysis Web Worker with a debounce. Falls back to synchronous
// in-thread analysis if Workers are unavailable or fail to load (e.g. some
// file:// contexts block module workers).
export function useAnalysis(text: string, options: Partial<AnalyzeOptions>, debounceMs = 350) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const lastApplied = useRef(0);
  // Latest inputs, so a worker failure can recompute synchronously.
  const textRef = useRef(text);
  const optsRef = useRef(options);
  textRef.current = text;
  optsRef.current = options;

  useEffect(() => {
    const runSyncLatest = () => {
      lastApplied.current = ++reqId.current;
      setResult(analyze(textRef.current, optsRef.current));
      setAnalyzing(false);
    };
    try {
      const w = new Worker(new URL('../worker/analysis.worker.ts', import.meta.url), {
        type: 'module',
      });
      w.onmessage = (e: MessageEvent<{ id: number; result?: AnalysisResult; error?: string }>) => {
        const { id, result: r } = e.data;
        if (id < lastApplied.current) return; // stale
        lastApplied.current = id;
        if (r) {
          setResult(r);
          setAnalyzing(false);
        }
      };
      w.onerror = () => {
        // Worker failed to load/run — drop it and fall back to sync analysis.
        try { w.terminate(); } catch { /* ignore */ }
        workerRef.current = null;
        if (textRef.current.trim().length > 0) runSyncLatest();
      };
      workerRef.current = w;
      return () => w.terminate();
    } catch {
      workerRef.current = null; // constructor unsupported — sync path is used
    }
  }, []);

  useEffect(() => {
    if (text.trim().length === 0) {
      setResult(analyze(''));
      setAnalyzing(false);
      return;
    }
    setAnalyzing(true);
    const handle = window.setTimeout(() => {
      const id = ++reqId.current;
      const w = workerRef.current;
      if (w) {
        w.postMessage({ id, text, options });
      } else {
        lastApplied.current = id;
        setResult(analyze(text, options));
        setAnalyzing(false);
      }
    }, debounceMs);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, options.echoWindow, options.echoMinCount, options.densityWarn, options.monotonyRun]);

  return { result, analyzing };
}
