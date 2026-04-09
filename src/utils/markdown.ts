// lib/utils/markdown.ts
import { marked } from 'marked';

// Patterns that might be incomplete at the end of a chunk
const INCOMPLETE_PATTERNS = [
  /\*{1,2}[^*]*$/,        // bold/italic: ** or *
  /_{1,2}[^_]*$/,         // bold/italic: __ or _
  /`{1,3}[^`]*$/,         // inline code or code fence
  /\[([^\]]*$)/,           // link text
  /#{1,6}\s*[^\n]*$/,     // heading with no newline yet
];

export function renderStreamingMarkdown(text: string): string {
  // Check if the text ends with something that looks incomplete
  const incomplete = INCOMPLETE_PATTERNS.some(p => p.test(text));

  // If the tail looks incomplete, only render everything up to the last
  // newline (or safe boundary) and leave the rest as plain text
  let safe = text;
  let tail = '';

  if (incomplete) {
    const lastNewline = text.lastIndexOf('\n');
    if (lastNewline !== -1) {
      safe = text.slice(0, lastNewline);
      tail = text.slice(lastNewline);
    } else {
      // Nothing safe to render yet, return plain text
      return `<span>${text}</span>`;
    }
  }

  const html = marked.parse(safe, { async: false }) as string;
  // Append the "in-progress" tail as plain escaped text
  return html + (tail ? `<span>${escapeHtml(tail)}</span>` : '');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}