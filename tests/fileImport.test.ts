import { describe, it, expect } from 'vitest';
import { readFile } from '../src/ui/fileImport';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const docxPath = path.resolve(here, '..', 'review', 'fixtures', 'sample.docx');

function makeFile(bytes: Uint8Array | string, name: string): File {
  return new File([bytes], name);
}

describe('readFile', () => {
  it('reads a plain .txt file', async () => {
    const f = makeFile('Hello world.\nSecond line.', 'note.txt');
    const r = await readFile(f);
    expect(r.text).toContain('Hello world.');
    expect(r.name).toBe('note.txt');
  });

  // The full `readFile` .docx path (which passes `{ arrayBuffer }` to mammoth's
  // browser build) is verified end-to-end in scripts/screenshot.mjs against a
  // real browser. Here we assert the fixture itself parses via mammoth — under
  // the node test runner mammoth's node build takes a Buffer.
  it('extracts text from the real .docx fixture via mammoth', async () => {
    const mammoth = (await import('mammoth')).default;
    const r = await mammoth.extractRawText({ buffer: readFileSync(docxPath) });
    expect(r.value).toContain('Chapter One');
    expect(r.value).toContain('she felt');
  });

  it('rejects .pdf with a helpful message', async () => {
    await expect(readFile(makeFile('%PDF-1.4', 'doc.pdf'))).rejects.toThrow(/PDF/);
  });

  it('rejects legacy .doc', async () => {
    await expect(readFile(makeFile('x', 'old.doc'))).rejects.toThrow(/\.docx/);
  });

  it('rejects a binary blob masquerading as text', async () => {
    const bin = new Uint8Array([0x89, 0x50, 0x00, 0x00, 0x01, 0x02]);
    await expect(readFile(makeFile(bin, 'image.txt'))).rejects.toThrow(/text document/);
  });
});
