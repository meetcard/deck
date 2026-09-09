/**
 * The little bit of formatting the manifest's prose needs.
 *
 * Component and story descriptions come out of JSDoc comments, so they are
 * plain text using a small, countable set of markdown conventions: across all
 * 311 of them there are 217 backticked spans, 9 italics, 3 bolds, 2 list
 * bullets, and no links or headings at all. Reaching for a markdown parser to
 * handle that would be more dependency than the job needs — and would happily
 * render links and images that were never meant to be there.
 *
 * Bullets are left as text. Two of them, in prose that reads fine as a
 * sentence, is not worth a list parser; if they multiply, that is the moment
 * to reconsider this whole file.
 *
 * Everything is escaped before any tag is inserted, so a description
 * containing `<Button>` renders as text rather than markup.
 */
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

/** Escaped text with `code`, `**bold**` and `*italic*` spans marked up. */
export function inline(text: string): string {
  return (
    escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold before italic: `*` matches inside `**`, so the other order would
      // eat the outer pair and leave stray asterisks.
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
  )
}

/** Escaped text as one or more `<p>`, split on blank lines. */
export function paragraphs(text: string | undefined): string {
  if (!text) return ''
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${inline(block)}</p>`)
    .join('\n')
}
