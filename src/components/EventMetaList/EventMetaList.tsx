import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './EventMetaList.css'

export interface EventMetaItem {
  /** Decorative — the label carries the meaning. */
  icon?: ReactNode
  /** e.g. "Date". Rendered upper-cased via CSS — pass natural case. */
  label: string
  value: ReactNode
}

export interface EventMetaListProps {
  items: EventMetaItem[]
  className?: string
}

/**
 * A row of read-only facts about an event — date, time, location, attendee
 * count — each as its own small card.
 *
 * A list rather than a description list: an icon sits alongside the
 * label/value pair, and `<dl>`'s content model doesn't allow a sibling
 * element next to the `dt`/`dd` pair inside its wrapping `div` (the same
 * reason `BookingSummary` uses one). Unlike `BookingSummary`, these items
 * are display-only with no edit affordance — this is a fact sheet for a
 * page a visitor lands on, not a recap of choices they're still mid-flow
 * on.
 *
 * @example
 * <EventMetaList
 *   items={[
 *     { icon: <CalendarIcon />, label: 'Dates', value: 'May 4–8, 2026' },
 *     { icon: <PinIcon />, label: 'Location', value: 'Boulder, Colorado' },
 *   ]}
 * />
 */
export function EventMetaList({ items, className }: EventMetaListProps) {
  return (
    <ul className={cx('deck-event-meta-list', className)}>
      {items.map((item, index) => (
        <li key={index} className="deck-event-meta-list__item">
          {item.icon && (
            <span className="deck-event-meta-list__icon" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className="deck-event-meta-list__text">
            <span className="deck-event-meta-list__label">{item.label}</span>
            <span className="deck-event-meta-list__value">{item.value}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
