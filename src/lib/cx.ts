/**
 * Joins class names, dropping anything falsy.
 *
 * Deliberately tiny — Deck's variant APIs are simple enough that a full
 * `clsx`/`cva` dependency would not earn its place.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
