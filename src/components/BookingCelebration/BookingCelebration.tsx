import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Heading } from '../Heading/Heading'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import './BookingCelebration.css'

/* ---- The plate --------------------------------------------------------- */

/**
 * The plate's check. Hand-drawn rather than imported: components take no icon
 * dependency, which is what keeps `dist/deck.js` free of one.
 */
const PlateCheck = (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true" focusable="false">
    <path
      d="m6 12.5 4 4 8-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/* ---- Confetti ---------------------------------------------------------- */

type PieceTone = 'brand' | 'accent' | 'muted'

interface Piece {
  /** Offset from the plate's centre, in em, at the top of the arc. */
  dx: number
  dy: number
  /** Fraction of the stagger to wait before leaving. 0–1. */
  delay: number
  /** How far through a full turn the piece tumbles. */
  spin: number
  tone: PieceTone
  /** Ribbons are rectangles; the rest are dots, for rhythm between them. */
  ribbon: boolean
}

/*
 * A fixed arrangement, not a random scatter. Randomness would make the pop
 * untestable and would hand Chromatic a different image on every run; the
 * spread is hand-placed instead so it reads as balanced at any size.
 *
 * Offsets are geometry rather than design values, so they are plain numbers
 * here and become `em` in the stylesheet — they scale with the plate instead
 * of being pinned to a spacing step.
 */
const PIECES: readonly Piece[] = [
  { dx: -6.6, dy: -4.5, delay: 0, spin: -0.45, tone: 'brand', ribbon: true },
  { dx: 6.3, dy: -4.8, delay: 0.15, spin: 0.52, tone: 'accent', ribbon: true },
  { dx: -3.2, dy: -6.5, delay: 0.35, spin: 0.38, tone: 'brand', ribbon: false },
  { dx: 3.6, dy: -6.8, delay: 0.05, spin: -0.6, tone: 'muted', ribbon: true },
  { dx: -8.0, dy: -1.8, delay: 0.5, spin: 0.7, tone: 'accent', ribbon: false },
  { dx: 7.7, dy: -2.3, delay: 0.25, spin: -0.34, tone: 'brand', ribbon: true },
  { dx: -5.1, dy: 0.9, delay: 0.7, spin: -0.55, tone: 'muted', ribbon: false },
  { dx: 5.4, dy: 0.6, delay: 0.6, spin: 0.48, tone: 'accent', ribbon: true },
  { dx: -1.4, dy: -7.7, delay: 0.45, spin: 0.66, tone: 'accent', ribbon: true },
  { dx: 1.7, dy: -8.0, delay: 0.8, spin: -0.42, tone: 'brand', ribbon: false },
  { dx: -9.0, dy: 2.1, delay: 0.9, spin: 0.3, tone: 'brand', ribbon: true },
  { dx: 8.7, dy: 2.6, delay: 1, spin: -0.68, tone: 'muted', ribbon: false },
]

/* ---- Component --------------------------------------------------------- */

export interface BookingCelebrationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Headline on the confirmation. Defaults to “You’re booked.” */
  headline?: ReactNode
  /** The line under it — usually where the invite went. */
  caption?: ReactNode
  /** Read-only recap of what was booked. */
  summary?: ReactNode
  /**
   * Render the confirmation without the confetti. The screen is otherwise
   * identical; `prefers-reduced-motion` does the same thing in the
   * stylesheet, whatever this is set to.
   */
  skipAnimation?: boolean
}

/**
 * The moment a meeting is booked.
 *
 * The confirmation is on screen in the first frame — headline, caption and
 * recap all present, nothing revealed on a timer. Booking is finished by the
 * time this renders, so anything that withholds the outcome is describing
 * work that is not happening; a staged reveal reads as confirming rather than
 * confirmed, on the one screen where that misread is expensive.
 *
 * The confetti is decoration laid over a complete screen, marked `aria-hidden`
 * and holding no state. It pops once and it is gone. Turning it off removes
 * pieces from a finished design rather than skipping to the end of one.
 *
 * @example
 * <BookingCelebration
 *   caption="A calendar invite is on its way to ben@meetcard.com."
 *   summary={<BookingSummary items={items} />}
 * />
 */
export const BookingCelebration = forwardRef<HTMLDivElement, BookingCelebrationProps>(
  function BookingCelebration(
    { headline = 'You’re booked.', caption, summary, skipAnimation = false, className, ...props },
    ref,
  ) {
    /*
     * The only gate in JS, and a deterministic one. Reduced motion is handled
     * entirely in the stylesheet: reading it here would branch rendering on a
     * browser-only API, which is the sort of thing that renders one tree on a
     * server and a different one on hydration.
     */
    const confetti = !skipAnimation

    return (
      <div ref={ref} className={cx('deck-booking-celebration', className)} {...props}>
        <span className="deck-booking-celebration__mark" aria-hidden="true">
          {confetti
            ? PIECES.map((piece, index) => (
                <span
                  key={index}
                  className={cx(
                    'deck-booking-celebration__particle',
                    `deck-booking-celebration__particle--${piece.tone}`,
                    piece.ribbon
                      ? 'deck-booking-celebration__particle--ribbon'
                      : 'deck-booking-celebration__particle--dot',
                  )}
                  style={
                    {
                      '--deck-celebration-dx': `${piece.dx}em`,
                      '--deck-celebration-dy': `${piece.dy}em`,
                      '--deck-celebration-delay': `${piece.delay}`,
                      '--deck-celebration-spin': `${piece.spin}turn`,
                    } as CSSProperties
                  }
                />
              ))
            : null}
          <span className="deck-booking-celebration__check">{PlateCheck}</span>
        </span>

        {/*
          The confetti is decorative and silent, so the outcome has to be
          spoken. This carries the confirmation itself rather than a working
          message: there is nothing in flight to narrate.
        */}
        <div role="status" aria-live="polite" className="deck-booking-celebration__status">
          <Stack gap={8} align="center">
            <Heading level={2} size="lg">
              {headline}
            </Heading>
            {caption ? <Text tone="muted">{caption}</Text> : null}
          </Stack>
        </div>

        {summary ? (
          <div className="deck-booking-celebration__summary">{summary}</div>
        ) : null}
      </div>
    )
  },
)
