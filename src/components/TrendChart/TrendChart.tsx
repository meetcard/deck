import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './TrendChart.css'

export interface TrendPoint {
  /** The period, short enough to sit under a column — "W1", "Mar", "Tue". */
  label: string
  value: number
  /** The period spelled out for assistive tech, e.g. "Week 1, Mar 3–9". */
  fullLabel?: string
}

export interface TrendChartProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Points in time order, oldest first. */
  points: TrendPoint[]
  /** Names the chart for assistive tech, e.g. "Profile views over time". */
  label: string
  /** What is being counted, for the spoken reading — "views", "scans". */
  unit?: string
  formatValue?: (value: number) => string
}

const format = (value: number) => value.toLocaleString()

/**
 * One measure over time, as columns.
 *
 * Deliberately small: a shape-of-the-trend chart for a dashboard panel, not
 * an explorable plot. It draws one series, because two measures on one set of
 * axes is the mistake this component exists to make unavailable — a second
 * measure gets a second chart.
 *
 * Columns rather than a line, since the periods are discrete buckets: a week
 * is a total, not a reading taken at a moment, and a line between two totals
 * draws values that were never measured.
 *
 * Every column carries its full reading as text for screen readers, and the
 * tallest and the most recent are labelled on the cap — the two a reader
 * actually looks for. Hovering or focusing a column shows the rest, so no
 * value is only available by measuring a bar against nothing.
 *
 * @example
 * <TrendChart label="Profile views over time" unit="views" points={[
 *   { label: 'W1', value: 312 }, { label: 'W2', value: 428 },
 * ]} />
 */
export const TrendChart = forwardRef<HTMLUListElement, TrendChartProps>(
  function TrendChart(
    { points, label, unit = '', formatValue = format, className, ...props },
    ref,
  ) {
    const values = points.map((point) => Math.max(point.value, 0))
    const peak = Math.max(...values, 0)
    /* Which columns get a cap label. Both indexes can be the same column —
       a run that ends on its high point — and a Set collapses that for free. */
    const labelled = new Set<number>([
      values.indexOf(peak),
      points.length - 1,
    ])

    return (
      <ul
        ref={ref}
        className={cx('deck-trend-chart', className)}
        aria-label={label}
        {...props}
      >
        {points.map((point, index) => {
          const value = values[index] ?? 0
          /* An all-zero series would divide by zero. Flat columns at the
             baseline are the honest picture of a week with no traffic. */
          const ratio = peak > 0 ? value / peak : 0
          const reading = `${point.fullLabel ?? point.label}: ${formatValue(
            point.value,
          )}${unit ? ` ${unit}` : ''}`

          return (
            <li
              key={point.label + String(index)}
              className={cx(
                'deck-trend-chart__column',
                labelled.has(index) && 'deck-trend-chart__column--labelled',
              )}
              style={{ '--deck-trend-ratio': String(ratio) } as CSSProperties}
            >
              {/* The whole reading, once, for anything that speaks the page.
                  Everything below it is a second rendering of this text and
                  is hidden, so a column is never announced three times. */}
              <span className="deck-visually-hidden">{reading}</span>

              <div className="deck-trend-chart__plot" aria-hidden="true">
                <span className="deck-trend-chart__readout">
                  {formatValue(point.value)}
                </span>
                <div className="deck-trend-chart__bar" />
              </div>

              <span className="deck-trend-chart__tick" aria-hidden="true">
                {point.label}
              </span>
            </li>
          )
        })}
      </ul>
    )
  },
)
