const NUL = String.fromCharCode(0);

export interface ImportResult {
  text: string;
  name: string;
}

/**
 * Read a user-selected file into plain text, entirely in the browser.
 * `.docx` is parsed with mammoth; everything else is read as UTF-8 text.
 * Throws a friendly error for unsupported or unreadable files.
 */
export async function readFile(file: File): Promise<ImportResult> {
  const name = file.name;
  const lower = name.toLowerCase();

  if (lower.endsWith('.docx')) {
    try {
      // Lazy-loaded: mammoth is only pulled in when a .docx is actually opened,
      // keeping it out of the initial bundle.
      const mammoth = (await import('mammoth')).default;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      if (!text) throw new Error('The document appears to contain no text.');
      return { text, name };
    } catch (err) {
      throw new Error(
        `Could not read "${name}" as a Word document. ${err instanceof Error ? err.message : ''}`.trim(),
      );
    }
  }

  if (lower.endsWith('.doc')) {
    throw new Error('Legacy .doc files are not supported - please save as .docx, .txt, or .md.');
  }
  if (lower.endsWith('.pdf')) {
    throw new Error('PDF text extraction is unreliable and out of scope - please paste the text or use .docx/.txt.');
  }

  const text = await file.text();
  // Guard against binary files read as text (presence of NUL bytes).
  if (text.slice(0, 2000).includes(NUL)) {
    throw new Error(`"${name}" doesn't look like a text document.`);
  }
  return { text, name };
}
