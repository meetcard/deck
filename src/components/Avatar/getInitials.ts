/**
 * Derives avatar initials from a name.
 *
 * "Ada Lovelace" → "AL", "MeetCard" → "M". Middle names are ignored, so the
 * result stays two characters at most and fits the smallest avatar size.
 *
 * Lives in its own module so `Avatar.tsx` only exports components, which is
 * what keeps React Fast Refresh working for that file.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  return (first + last).toUpperCase()
}
