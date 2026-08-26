import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './StatTile.css'

export type TrendDirection = 'up' | 'down' | 'flat'

export interface StatTileProps extends HTMLAttributes<HTMLDivElement> {
  /** What is being measured, e.g. "Connections captured". */
  label: ReactNode
  /** The headline figure. Pre-formatted by the caller. */
  value: ReactNode
  /** Period or qualifier, e.g. "last 30 days". */
  caption?: ReactNode
  /**
   * Change versus the previous period. `direction` carries the meaning for
   * screen readers and via an arrow glyph, so it never rests on color alone.
   */
  trend?: { direction: TrendDirection; label: string }
  /**
   * Whether a rise is good. Follow-up completion rising is good; sync
   * failures rising is not — so the tone cannot be inferred from direction.
   */
  positiveDirection?: TrendDirection
}

const ARROW: Record<TrendDirection, string> = {
  up: 'M8 3.5v9M4.5 7L8 3.5 11.5 7',
  down: 'M8 12.5v-9M4.5 9L8 12.5 11.5 9',
  flat: 'M3.5 8h9',
}

const DIRECTION_WORD: Record<TrendDirection, string> = {
  up: 'Up',
  down: 'Down',
  flat: 'No change',
}

/**
 * A single headline metric.
 *
 * Used on the dashboard for at-a-glance figures and on the analytics page as
 * the summary row above the drill-down.
 *
 * @example
 * <StatTile label="Connections captured" value="1,284"
 *   caption="last 30 days"
 *   trend={{ direction: 'up', label: '12% vs. previous 30 days' }} />
 */
export const StatTile = forwardRef<HTMLDivElement, StatTileProps>(
  function StatTile(
    {
      label,
      value,
      caption,
      trend,
      positiveDirection = 'up',
      className,
      ...props
    },
    ref,
  ) {
    const tone = !trend
      ? null
      : trend.direction === 'flat'
        ? 'neutral'
        : trend.direction === positiveDirection
          ? 'positive'
          : 'negative'

    return (
      <div ref={ref} className={cx('deck-stat-tile', className)} {...props}>
        <p className="deck-stat-tile__label">{label}</p>
        <p className="deck-stat-tile__value">{value}</p>

        {trend || caption ? (
          <div className="deck-stat-tile__footer">
            {trend ? (
              <span
                className={cx(
                  'deck-stat-tile__trend',
                  `deck-stat-tile__trend--${tone}`,
                )}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    d={ARROW[trend.direction]}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* The arrow is decorative; the direction is spelled out so
                    the trend is not conveyed by color or shape alone. */}
                <span className="deck-visually-hidden">
                  {DIRECTION_WORD[trend.direction]}:{' '}
                </span>
                {trend.label}
              </span>
            ) : null}

            {caption ? (
              <span className="deck-stat-tile__caption">{caption}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  },
)
