import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { AvatarGroup, type AvatarGroupPerson } from '../AvatarGroup/AvatarGroup'
import { Badge } from '../Badge/Badge'
import './EventRow.css'

export type EventAttendance = 'attending' | 'hosting' | 'speaking' | 'invited'

/** What the faces on a row are to the event. */
export type EventPeopleRelation = 'exchanged' | 'going'

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
  /**
   * The event's cover, as a thumbnail. Decorative: it is how you recognise
   * an event you have seen before, and the name beside it is what says
   * which one this is. Dropped below `sm`, where the name needs the width
   * more than the picture does.
   */
  coverSrc?: string
  /** Who is putting it on, named in the meta line. */
  host?: { name: string; avatarSrc?: string }
  /** The people attached to this event, shown as faces. */
  people?: AvatarGroupPerson[]
  /**
   * How many people in total, when that is more than the faces shown — a
   * conference where you met forty shows five of them and says forty.
   * Defaults to however many `people` were given.
   */
  peopleCount?: number
  /**
   * What those people are to the event. `exchanged` is whose cards you came
   * away with; `going` is who you already know that will be there.
   *
   * They are the same faces in the same place and they are not the same
   * fact: an event three weeks out cannot have produced a card yet, and a
   * row that says it did is the list lying about the past.
   */
  peopleRelation?: EventPeopleRelation
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
 * A row can also carry the people attached to it — whose cards you left
 * with, or who you already know that is going. That is the answer to the
 * only question anyone asks of an event either side of the date, and it is
 * why a list of events is worth scrolling at all. Which of the two it is
 * has to be said (`peopleRelation`), because the faces look identical and
 * the facts are not interchangeable.
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
      coverSrc,
      host,
      people,
      peopleCount,
      peopleRelation = 'exchanged',
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

    const meta = [showWeekday ? weekday : null, time, venue]
      .filter(Boolean)
      .join(' · ')

    /* The faces are a sample; the count is the fact. A conference where you
       met forty people shows five of them and says forty. */
    const headcount = peopleCount ?? people?.length ?? 0

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

        {/* Decorative, and dropped below `sm` by CSS rather than by a media
            query in JS — it is the same row either way, with one fewer
            thing in it. */}
        {coverSrc ? (
          <img className="deck-event-row__cover" src={coverSrc} alt="" />
        ) : null}

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

          {meta || host ? (
            <p className="deck-event-row__meta">
              {/* The written half stays one string: it is one sentence of
                  facts, and splitting it into spans would put a separator
                  in CSS where a screen reader cannot hear it. */}
              {meta ? <span>{meta}</span> : null}
              {host ? (
                <span className="deck-event-row__host">
                  <Avatar
                    name={host.name}
                    src={host.avatarSrc}
                    size="xs"
                    decorative
                  />
                  By {host.name}
                </span>
              ) : null}
            </p>
          ) : null}

          {headcount > 0 ? (
            <div className="deck-event-row__people">
              {people && people.length > 0 ? (
                <AvatarGroup
                  people={people}
                  max={4}
                  size="sm"
                  label={
                    peopleRelation === 'going'
                      ? `Going to ${name}`
                      : `Cards exchanged at ${name}`
                  }
                />
              ) : null}
              <span className="deck-event-row__people-count">
                {peopleRelation === 'going'
                  ? `${headcount} going`
                  : `${headcount} ${headcount === 1 ? 'card' : 'cards'} exchanged`}
              </span>
            </div>
          ) : null}
        </div>

        {actions ? (
          <div className="deck-event-row__actions">{actions}</div>
        ) : null}
      </div>
    )
  },
)
