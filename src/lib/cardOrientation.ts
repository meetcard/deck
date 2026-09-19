import { createContext, useContext } from 'react'
import { mediaQuery } from '../foundations/tokens'
import { useMediaQuery } from './useMediaQuery'

/**
 * Which way up a card sits, once decided. Internal — `lib/` is not part of
 * Deck's public API; components re-export the names they need.
 */
export type ResolvedCardOrientation = 'landscape' | 'portrait'

/**
 * What a caller may ask for: a fixed way up, or `responsive` — let the
 * surrounding pile, else the viewport, decide. Public, as `CardOrientation`.
 */
export type CardOrientation = ResolvedCardOrientation | 'responsive'

/**
 * Set by a container that has already decided which way up its cards sit —
 * `CardPile` — so every card inside it agrees with the pile rather than
 * each measuring the viewport for itself.
 */
export const CardOrientationContext = createContext<ResolvedCardOrientation | null>(
  null,
)

/**
 * The one place a card's orientation is decided, so that every card in Deck
 * answers the question the same way:
 *
 * 1. An explicit `landscape` or `portrait` from the caller wins.
 * 2. Otherwise a surrounding container that has decided (`CardPile`) wins —
 *    a card in a pile is the pile's shape, not its own.
 * 3. Otherwise the viewport: portrait below `sm`, landscape from `sm` up.
 *
 * Asked as the negation of `sm`, so every environment that cannot answer —
 * jsdom, a server render — lands on landscape. That keeps a render without a
 * viewport stable, and landscape is what tests and snapshots were written
 * against.
 *
 * The result is resolved — never `responsive` — and components publish it as
 * `data-card-orientation` on their root, which is what their CSS keys off.
 */
export function useCardOrientation(
  preference: CardOrientation = 'responsive',
): ResolvedCardOrientation {
  const fromContainer = useContext(CardOrientationContext)
  const isNarrow = useMediaQuery(`not all and ${mediaQuery('sm')}`)

  if (preference !== 'responsive') return preference
  if (fromContainer) return fromContainer
  return isNarrow ? 'portrait' : 'landscape'
}
