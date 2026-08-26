import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './BookingSummary.css'

export interface BookingSummaryItem {
  /** Small leading glyph. Decorative — the text carries the meaning. */
  icon?: ReactNode
  /** Primary line, e.g. "Thursday, September 3". */
  label: ReactNode
  /** Supporting line, e.g. "9:30 AM · 30 min". */
  detail?: ReactNode
  /** Lets a person jump back to the step that set this. */
  onEdit?: () => void
  /** Accessible name for the edit control, e.g. "Change date and time". */
  editLabel?: string
}

export interface BookingSummaryProps {
  items: BookingSummaryItem[]
  /** Accessible name for the summary region. */
  label?: string
  className?: string
}

/**
 * Recap of what a person has chosen so far in a booking flow.
 *
 * Carries the decisions forward so the details form and the confirmation
 * both restate the booking rather than assuming it was memorised. Items can
 * expose an edit control, which is what keeps the recap from being a dead
 * end — the flow stays correctable at the point the mistake is noticed.
 *
 * @example
 * <BookingSummary
 *   items={[
 *     { label: 'Thursday, September 3', detail: '9:30 AM · 30 min', onEdit: back },
 *     { label: 'Video call', detail: 'Link sent with your confirmation' },
 *   ]}
 * />
 */
export function BookingSummary({
  items,
  label = 'Booking summary',
  className,
}: BookingSummaryProps) {
  /*
   * A list rather than a description list: each row is a value with a
   * supporting line ("Thursday, September 3" / "9:30 AM · 30 min"), not a
   * term defining a definition, and `dt`/`dd` cannot nest deeply enough to
   * carry the icon and edit control alongside them.
   */
  return (
    <ul className={cx('deck-booking-summary', className)} aria-label={label}>
      {items.map((item, index) => (
        <li key={index} className="deck-booking-summary__row">
          {item.icon && (
            <span className="deck-booking-summary__icon" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className="deck-booking-summary__text">
            <span className="deck-booking-summary__label">{item.label}</span>
            {item.detail && (
              <span className="deck-booking-summary__detail">{item.detail}</span>
            )}
          </span>
          {item.onEdit && (
            <button
              type="button"
              className="deck-booking-summary__edit"
              onClick={item.onEdit}
            >
              Edit
              <span className="deck-visually-hidden">
                {item.editLabel ? ` — ${item.editLabel}` : ''}
              </span>
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
