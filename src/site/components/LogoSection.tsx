import { Mark, Wordmark } from '../../foundations/brand'

/**
 * The landing page lockup.
 *
 * `Wordmark` is the full lockup (mark + type) but is drawn "Full Color —
 * Light": its Ink-colored type needs a light backdrop to read, and its own
 * docs say to fall back to `Mark` alone on dark fills. This page has a dark
 * scheme, so both are rendered and CSS shows whichever the scheme calls for
 * — see `.wordmark` / `.mark` in index.astro.
 */
export function LogoSection() {
  return (
    <div className="logo-section">
      <Wordmark className="wordmark" aria-label="Deck by MeetCard" />
      <Mark className="mark" aria-label="Deck by MeetCard" />
    </div>
  )
}
