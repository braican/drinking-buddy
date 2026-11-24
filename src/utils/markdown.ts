import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Browser-only build: sanitize() is a no-op pass-through when there's no `window`
// (SSR). Safe here because ChatDrawer's chat history starts empty, so this only
// ever runs client-side — but don't call this from server-rendered content.

/**
 * Renders markdown that may still be streaming in.
 *
 * While `streaming` is true, the text can end mid-token (an opened `**` with no
 * closer yet, half a link). Rather than show raw markers until the closer arrives,
 * we temporarily close whatever is open so the partial text renders as it will
 * look once complete. Once streaming ends, the text is rendered as-is.
 */
export function renderStreamingMarkdown(text: string, streaming = false): string {
  const source = streaming ? closeOpenMarkdown(text) : text;
  const html = marked.parse(source, { async: false, breaks: true }) as string;
  return DOMPurify.sanitize(html);
}

function closeOpenMarkdown(text: string): string {
  // An unterminated code fence: close it and skip inline fixes (it's all code).
  const fences = text.match(/^\s*```/gm)?.length ?? 0;
  if (fences % 2 === 1) return `${text}\n\`\`\``;

  let result = text;

  // A half-written link — `[text` or `[text](url` — is dropped until it completes.
  result = result.replace(/\[[^\]\n]*(?:\]\([^)\n]*)?$/, '');

  // A marker with nothing after it yet (e.g. text ending in "**") is dropped, so we
  // don't render an empty pair.
  result = result.replace(/(\*{1,2}|`)\s*$/, '');

  // Ignore inline code when counting emphasis markers.
  const withoutCode = result.replace(/`[^`]*`/g, '');
  if ((result.match(/`/g)?.length ?? 0) % 2 === 1) return `${result}\``;

  const bold = withoutCode.match(/\*\*/g)?.length ?? 0;
  // Single `*` that aren't part of `**` and aren't list bullets.
  const italic =
    withoutCode
      .replace(/\*\*/g, '')
      .replace(/^\s*\* /gm, '')
      .match(/\*/g)?.length ?? 0;

  if (italic % 2 === 1) result += '*';
  if (bold % 2 === 1) result += '**';

  return result;
}
