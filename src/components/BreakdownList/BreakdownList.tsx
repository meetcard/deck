import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './BreakdownList.css'

export interface BreakdownItem {
  /** Stable key. Defaults to `label` when omitted. */
  id?: string
  /** The dimension's value — "QR", "Safari", "United States". */
  label: ReactNode
  /** The measure. Compared against the other rows to size the bar. */
  value: number
  /** Overrides the formatted figure, e.g. "631 views". */
  valueLabel?: ReactNode
  /** A second figure for the row — a share, a rate, a conversion. */
  meta?: ReactNode
  /** A small mark before the label: a channel glyph, a flag. */
  icon?: ReactNode
}

export interface BreakdownListProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Rows, in the order they should read. Not sorted for you. */
  items: BreakdownItem[]
  /** Names the list for assistive tech, e.g. "Where engagement comes from". */
  label: string
  /**
   * What the bars are drawn against. `max` scales to the largest row, so the
   * leader always fills the track and differences between the rest are easy
   * to see. `total` scales to the sum, so a bar's length *is* its share of
   * the whole. Use `total` only when the rows genuinely partition something.
   */
  scale?: 'max' | 'total'
  /** Formats `value`. Defaults to the viewer's locale grouping. */
  formatValue?: (value: number) => string
}

const format = (value: number) => value.toLocaleString()

/**
 * A ranked breakdown: one row per value of a dimension, each with a bar
 * showing how it compares.
 *
 * This is the workhorse of the analytics screen — traffic sources, locations,
 * devices, browsers, link performance all answer the same question, so they
 * are one component rather than five layouts.
 *
 * The figure is written beside every row, so the bar is a second reading of
 * a number that is already there rather than the only way to get it. That
 * also makes the list its own table view: nothing is locked inside the chart.
 *
 * Rows are rendered in the order given. Sorting is the caller's call, because
 * "top locations" and "the funnel in order" are both legitimate.
 *
 * @example
 * <BreakdownList label="Where engagement comes from" items={[
 *   { label: 'QR', value: 631, meta: '37%' },
 *   { label: 'LinkedIn', value: 388, meta: '23%' },
 * ]} />
 */
export const BreakdownList = forwardRef<HTMLUListElement, BreakdownListProps>(
  function BreakdownList(
    { items, label, scale = 'max', formatValue = format, className, ...props },
    ref,
  ) {
    /* Guard the empty and all-zero cases before dividing: a list of rows that
       are all zero is a real state (a card shared today, nothing measured
       yet) and it should render flat bars, not `NaN`. */
    const values = items.map((item) => Math.max(item.value, 0))
    const basis =
      scale === 'total'
        ? values.reduce((sum, value) => sum + value, 0)
        : Math.max(...values, 0)

    return (
      /* A list rather than a `<dl>`, for the reason `EventMetaList` gives:
         the bar is a third element beside the label and the figure, and
         `<dl>`'s content model allows only `dt`/`dd` inside its wrapping
         `div`. A named list also announces its own length, which is the
         thing worth hearing before a run of rows. */
      <ul
        ref={ref}
        className={cx('deck-breakdown-list', className)}
        aria-label={label}
        {...props}
      >
        {items.map((item, index) => {
          const value = values[index] ?? 0
          const ratio = basis > 0 ? value / basis : 0

          return (
            <li
              key={item.id ?? index}
              className="deck-breakdown-list__row"
              style={{ '--deck-breakdown-ratio': String(ratio) } as CSSProperties}
            >
              <span className="deck-breakdown-list__label">
                {item.icon ? (
                  <span className="deck-breakdown-list__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                <span className="deck-breakdown-list__label-text">
                  {item.label}
                </span>
              </span>

              <span className="deck-breakdown-list__figures">
                <span className="deck-breakdown-list__value">
                  {item.valueLabel ?? formatValue(item.value)}
                </span>
                {item.meta ? (
                  <span className="deck-breakdown-list__meta">{item.meta}</span>
                ) : null}
              </span>

              {/* The bar restates the figures beside it, so it is decorative
                  in the strict sense — hidden rather than given a role and a
                  duplicate accessible name. */}
              <div className="deck-breakdown-list__track" aria-hidden="true">
                <div className="deck-breakdown-list__bar" />
              </div>
            </li>
          )
        })}
      </ul>
    )
  },
)
