import { useEffect, useRef, useState } from 'react';
import type { AnalysisResult, AnalyzeOptions } from '../engine';
import { analyze } from '../engine';

// Manages the analysis Web Worker with a debounce. Falls back to synchronous
// in-thread analysis if Workers are unavailable (e.g. file:// in some browsers).
export function useAnalysis(text: string, options: Partial<AnalyzeOptions>, debounceMs = 350) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const lastApplied = useRef(0);

  useEffect(() => {
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
      workerRef.current = w;
      return () => w.terminate();
    } catch {
      workerRef.current = null; // fall back to sync
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
        // Synchronous fallback.
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
