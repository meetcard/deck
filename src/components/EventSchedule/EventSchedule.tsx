import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './EventSchedule.css'

export interface EventScheduleEntry {
  /** Already phrased — "9:00 AM". Deck does no time formatting. */
  time: string
  /** What happens then. */
  title: ReactNode
}

export interface EventScheduleProps
  extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  /** In the order they happen. Left in the caller's order rather than sorted
   * here: a schedule that silently reorders itself hides a bug in whatever
   * produced it. */
  entries: EventScheduleEntry[]
  /** Accessible name, e.g. "Schedule for RevOps Summit". */
  label?: string
}

/**
 * The running order of a day — what happens, and when.
 *
 * A real description list, which most of Deck's lists are not: here the time
 * genuinely is the term and the session is what it means, so `dt`/`dd` is
 * the honest markup rather than a `ul` of rows that happen to start with a
 * number. It also gives assistive tech the pairing for free — a time and its
 * session are read together instead of as two loose strings.
 *
 * Times share a column of their own so the day can be scanned down the left
 * edge, which is the only thing anyone does with an agenda they have already
 * read once.
 *
 * @example
 * <EventSchedule
 *   label="Schedule"
 *   entries={[
 *     { time: '9:00 AM', title: 'Doors and coffee' },
 *     { time: '10:00 AM', title: 'Keynote: Pipeline you can trust' },
 *   ]}
 * />
 */
export const EventSchedule = forwardRef<HTMLDListElement, EventScheduleProps>(
  function EventSchedule(
    { entries, label = 'Schedule', className, ...props },
    ref,
  ) {
    return (
      <dl
        ref={ref}
        className={cx('deck-event-schedule', className)}
        aria-label={label}
        {...props}
      >
        {entries.map((entry, index) => (
          /* The wrapping `div` is what `dl` allows and what a row needs:
             without it there is nothing to draw a rule under, and the
             `dt`/`dd` pairing is left implied by source order alone. */
          <div key={index} className="deck-event-schedule__row">
            <dt className="deck-event-schedule__time">{entry.time}</dt>
            <dd className="deck-event-schedule__title">{entry.title}</dd>
          </div>
        ))}
      </dl>
    )
  },
)
