/// <reference lib="webworker" />
import { analyze } from '../engine';
import type { AnalyzeOptions } from '../engine';

interface RequestMsg {
  id: number;
  text: string;
  options: Partial<AnalyzeOptions>;
}

// Runs the (potentially heavy) analysis off the main thread so the UI never
// freezes, even on a full-length novel.
self.onmessage = (e: MessageEvent<RequestMsg>) => {
  const { id, text, options } = e.data;
  try {
    const result = analyze(text, options);
    (self as DedicatedWorkerGlobalScope).postMessage({ id, result });
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      id,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
