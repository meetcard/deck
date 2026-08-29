import { useEffect, useState } from 'react'

/**
 * Subscribes to a media query and re-renders when it flips.
 *
 * Internal — `lib/` is not part of Deck's public API. Components should reach
 * for CSS first; this exists for the cases where a media query has to change
 * *markup* or a computed style, not just a rule, such as `CardPile` choosing
 * how its layers sit relative to one another.
 *
 * Reads the initial value during render rather than in an effect, so the
 * first paint is already correct instead of flashing the wrong layout. Guards
 * `matchMedia` because jsdom-based tests routinely render without it.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    // Re-read on subscribe: the query may have changed between the render
    // that seeded state and this effect.
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
