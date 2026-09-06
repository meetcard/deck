import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Badge } from '../Badge/Badge'
import './EventRow.css'

export type EventAttendance = 'attending' | 'hosting' | 'speaking' | 'invited'

export interface EventRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  name: string
  /** ISO 8601 date, e.g. "2027-05-18". Rendered in the viewer's locale. */
  date: string
  /** Start time, already phrased — "9:00 AM". Deck does no time formatting. */
  time?: string
  venue?: string
  /** Your relationship to the event, not its lifecycle state. */
  attendance?: EventAttendance
  /**
   * Marks the next one up. The list is already in date order, so this is
   * doing something the order cannot: saying which one is close enough to
   * need packing for.
   */
  soon?: boolean
  /** Makes the name a link to the event. */
  href?: string
  /** Show the weekday under the date. Off in tight lists. */
  showWeekday?: boolean
  actions?: ReactNode
}

const ATTENDANCE: Record<
  EventAttendance,
  { label: string; tone: 'success' | 'brand' | 'neutral' }
> = {
  attending: { label: 'Attending', tone: 'success' },
  hosting: { label: 'Hosting', tone: 'brand' },
  speaking: { label: 'Speaking', tone: 'brand' },
  invited: { label: 'Invited', tone: 'neutral' },
}

/**
 * One event in a list: when it is, what it is, where, and what you are to it.
 *
 * The date is a torn-off calendar leaf rather than a line of prose, because
 * a column of them can be scanned down — which is the only thing anyone does
 * with a list of events. It is announced as one readable date, so a screen
 * reader hears "18 May" and not "May" then "18".
 *
 * `attendance` is your relationship to the event, deliberately not its
 * lifecycle. Whether a conference is upcoming or past is already carried by
 * the list it is in and the date on the left; whether you are speaking at it
 * is not, and it is the thing that changes what you do next.
 *
 * @example
 * <EventRow name="RevOps Summit" date="2027-05-18" time="9:00 AM"
 *   venue="Austin Convention Center" attendance="attending" soon />
 */
export const EventRow = forwardRef<HTMLDivElement, EventRowProps>(
  function EventRow(
    {
      name,
      date,
      time,
      venue,
      attendance,
      soon,
      href,
      showWeekday = false,
      actions,
      className,
      ...props
    },
    ref,
  ) {
    /* Midday rather than midnight: an ISO date parsed as UTC lands on the
       previous day for anyone west of Greenwich, which would print the
       wrong number on the leaf. */
    const when = new Date(`${date}T12:00:00`)
    const month = when.toLocaleDateString(undefined, { month: 'short' })
    const day = when.toLocaleDateString(undefined, { day: 'numeric' })
    const weekday = when.toLocaleDateString(undefined, { weekday: 'long' })
    const spoken = when.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
    })

    const meta = [time, venue].filter(Boolean).join(' · ')

    return (
      <div ref={ref} className={cx('deck-event-row', className)} {...props}>
        {/* One accessible name on the wrapper, with the two halves hidden,
            so it is announced as a date rather than two loose fragments. */}
        <span className="deck-event-row__date" role="img" aria-label={spoken}>
          <span className="deck-event-row__month" aria-hidden="true">
            {month}
          </span>
          <span className="deck-event-row__day" aria-hidden="true">
            {day}
          </span>
        </span>

        <div className="deck-event-row__body">
          <div className="deck-event-row__heading">
            <span className="deck-event-row__name">
              {href ? (
                <a href={href} className="deck-event-row__link">
                  {name}
                </a>
              ) : (
                name
              )}
            </span>
            {soon ? (
              <Badge tone="warning" size="sm">
                Soon
              </Badge>
            ) : null}
            {attendance ? (
              <Badge tone={ATTENDANCE[attendance].tone} size="sm">
                {ATTENDANCE[attendance].label}
              </Badge>
            ) : null}
          </div>

          {showWeekday || meta ? (
            <p className="deck-event-row__meta">
              {[showWeekday ? weekday : null, meta].filter(Boolean).join(' · ')}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="deck-event-row__actions">{actions}</div>
        ) : null}
      </div>
    )
  },
)
