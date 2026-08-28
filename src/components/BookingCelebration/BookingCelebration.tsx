import { forwardRef, useEffect, useRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Heading } from '../Heading/Heading'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import './BookingCelebration.css'

/* ---- Glyphs ----------------------------------------------------------- */

/*
 * Hand-drawn rather than imported: components take no icon dependency, which
 * is what keeps `dist/deck.js` free of one. Same 16x16 / 1.4-stroke idiom the
 * booking flow already draws with.
 */
const glyphProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const,
}

const CalendarGlyph = (
  <svg {...glyphProps}>
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5 1.5v3M11 1.5v3" />
  </svg>
)

const ClockGlyph = (
  <svg {...glyphProps}>
    <circle cx="8" cy="8" r="6.2" />
    <path d="M8 4.4V8l2.4 1.6" />
  </svg>
)

const CheckGlyph = (
  <svg {...glyphProps}>
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
)

/** The settled plate's check, at the size the booking flow already draws it. */
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

/* ---- Particles -------------------------------------------------------- */

type ParticleTone = 'brand' | 'accent' | 'muted'

interface Particle {
  /** Offset from the plate's centre, in em, at the end of the burst. */
  dx: number
  dy: number
  /** Fraction of the burst to wait before leaving. 0–1. */
  delay: number
  /** How far through a full turn the piece tumbles. */
  spin: number
  tone: ParticleTone
  glyph: ReactNode | null
}

/*
 * A fixed arrangement, not a random scatter. Randomness would make the burst
 * untestable and would hand Chromatic a different image on every run; the
 * spread is hand-placed instead so it reads as balanced at any size.
 *
 * Offsets are geometry rather than design values, so they are plain numbers
 * here and become `em` in the stylesheet — they scale with the plate instead
 * of being pinned to a spacing step.
 */
const PARTICLES: readonly Particle[] = [
  { dx: -3.6, dy: -2.1, delay: 0, spin: -0.12, tone: 'brand', glyph: CalendarGlyph },
  { dx: 3.4, dy: -2.4, delay: 0.08, spin: 0.1, tone: 'brand', glyph: ClockGlyph },
  { dx: -4.2, dy: 0.9, delay: 0.16, spin: 0.08, tone: 'muted', glyph: null },
  { dx: 4.1, dy: 1.2, delay: 0.04, spin: -0.09, tone: 'brand', glyph: CheckGlyph },
  { dx: -2.4, dy: 2.9, delay: 0.2, spin: 0.14, tone: 'accent', glyph: CalendarGlyph },
  { dx: 2.6, dy: 3.1, delay: 0.12, spin: -0.11, tone: 'muted', glyph: null },
  { dx: 0.4, dy: -3.6, delay: 0.24, spin: 0.06, tone: 'accent', glyph: null },
  { dx: -0.8, dy: 3.8, delay: 0.28, spin: -0.07, tone: 'brand', glyph: ClockGlyph },
]

/* ---- Beats ------------------------------------------------------------ */

/**
 * The five beats of the celebration. `settled` is the terminal state and is
 * also the whole component when motion is off, which is why the sequence is
 * a state machine rather than a boolean and a timer: "no animation" is
 * expressible as "start at the end" instead of "run the same thing faster".
 */
export type CelebrationStage = 'confirm' | 'pulse' | 'burst' | 'cascade' | 'settled'

/** How long each beat holds, in ms. Totals 1200ms to the settled state. */
const BEAT: Record<Exclude<CelebrationStage, 'settled'>, number> = {
  confirm: 200,
  pulse: 300,
  burst: 300,
  cascade: 400,
}

const NEXT: Record<Exclude<CelebrationStage, 'settled'>, CelebrationStage> = {
  confirm: 'pulse',
  pulse: 'burst',
  burst: 'cascade',
  cascade: 'settled',
}

/* ---- Component -------------------------------------------------------- */

export interface BookingCelebrationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Headline on the settled card. Defaults to “You’re booked.” */
  headline?: ReactNode
  /** The line under it — usually where the invite went. */
  caption?: ReactNode
  /** Read-only recap, rendered once settled. */
  summary?: ReactNode
  /**
   * Announced while the beats play, before the headline exists to be read.
   * Kept to one message for the whole sequence: a caption per beat would
   * interrupt a screen reader four times to say nothing actionable.
   */
  pendingLabel?: string
  /**
   * Skip the beats and render the settled state immediately. Stories and
   * tests set this directly; at runtime `prefers-reduced-motion` does the
   * same thing.
   */
  skipAnimation?: boolean
  /** Fires once, when the sequence reaches `settled`. */
  onSettled?: () => void
}

/**
 * The moment a meeting is booked.
 *
 * A confirmation that behaves like one. The beats are short and they end —
 * this is punctuation on a completed task, not a loading state, so nothing
 * here loops and nothing waits on a network. The settled state is the whole
 * component with the motion removed, which means turning the animation off
 * is not a second design to maintain: it is this one, started at the end.
 *
 * The burst is decorative and marked `aria-hidden`. What a screen reader
 * gets is the live region: one “working” message while the beats play, then
 * the headline and caption when they land.
 *
 * @example
 * <BookingCelebration
 *   caption="A calendar invite is on its way to ben@meetcard.com."
 *   summary={<BookingSummary items={items} />}
 * />
 */
export const BookingCelebration = forwardRef<HTMLDivElement, BookingCelebrationProps>(
  function BookingCelebration(
    {
      headline = 'You’re booked.',
      caption,
      summary,
      pendingLabel = 'Confirming your booking',
      skipAnimation = false,
      onSettled,
      className,
      ...props
    },
    ref,
  ) {
    /*
     * Read once rather than subscribed: the sequence is over in 1.2s, so a
     * person changing the system setting mid-flight has nothing to gain from
     * a re-render. Deck collapses its duration tokens to 0ms under reduce,
     * which for a sequence that carries state would flash every beat in a
     * single frame — so this skips the beats rather than shortening them.
     */
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const instant = skipAnimation || prefersReducedMotion

    // Lazy, and seeded from `instant`, so a skipped sequence never renders a
    // first frame of motion before the effect can stop it.
    const [stage, setStage] = useState<CelebrationStage>(() =>
      instant ? 'settled' : 'confirm',
    )

    // Advances one beat at a time. Re-running on each change means exactly
    // one timer is ever outstanding, and unmounting clears it.
    useEffect(() => {
      if (stage === 'settled') return
      const timer = setTimeout(() => setStage(NEXT[stage]), BEAT[stage])
      return () => clearTimeout(timer)
    }, [stage])

    /*
     * Held in a ref so the effect below can depend on the stage alone. An
     * inline arrow from the caller changes identity every render, and as a
     * dependency it would turn a once-per-booking callback into a loop.
     */
    const settledCallback = useRef(onSettled)

    // Kept current in its own effect rather than assigned during render,
    // and declared first so it has already updated when the effect below
    // runs on the same commit.
    useEffect(() => {
      settledCallback.current = onSettled
    })

    useEffect(() => {
      if (stage === 'settled') settledCallback.current?.()
    }, [stage])

    const settled = stage === 'settled'

    return (
      <div
        ref={ref}
        className={cx(
          'deck-booking-celebration',
          `deck-booking-celebration--${stage}`,
          className,
        )}
        {...props}
      >
        <span className="deck-booking-celebration__mark" aria-hidden="true">
          {settled ? null : (
            <>
              <span className="deck-booking-celebration__ring" />
              <span className="deck-booking-celebration__ring deck-booking-celebration__ring--late" />
              {PARTICLES.map((particle, index) => (
                <span
                  key={index}
                  className={cx(
                    'deck-booking-celebration__particle',
                    `deck-booking-celebration__particle--${particle.tone}`,
                    !particle.glyph && 'deck-booking-celebration__particle--dot',
                  )}
                  style={
                    {
                      '--deck-celebration-dx': `${particle.dx}em`,
                      '--deck-celebration-dy': `${particle.dy}em`,
                      '--deck-celebration-delay': `${particle.delay}`,
                      '--deck-celebration-spin': `${particle.spin}turn`,
                    } as CSSProperties
                  }
                >
                  {particle.glyph}
                </span>
              ))}
            </>
          )}
          <span className="deck-booking-celebration__check">{PlateCheck}</span>
        </span>

        {/*
          One live region for the whole component. It carries the working
          message first and the real confirmation second, so a screen reader
          hears the outcome rather than a checkmark appearing silently.
        */}
        <div role="status" aria-live="polite" className="deck-booking-celebration__status">
          {settled ? (
            <Stack gap={8} align="center">
              <Heading level={2} size="lg">
                {headline}
              </Heading>
              {caption ? <Text tone="muted">{caption}</Text> : null}
            </Stack>
          ) : (
            <span className="deck-visually-hidden">{pendingLabel}</span>
          )}
        </div>

        {settled && summary ? (
          <div className="deck-booking-celebration__summary">{summary}</div>
        ) : null}
      </div>
    )
  },
)
