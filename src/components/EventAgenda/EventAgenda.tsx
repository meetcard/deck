import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { AvatarStack } from '../AvatarStack/AvatarStack'
import type { AvatarStackPerson } from '../AvatarStack/AvatarStack'
import { Badge } from '../Badge/Badge'
import { Link } from '../Link/Link'
import type { CardTheme } from '../PersonCard/PersonCard'
import './EventAgenda.css'

export interface AgendaEvent {
  /** Stable key, typically the event slug. */
  id: string
  name: string
  /** ISO 8601 `YYYY-MM-DD`. Groups the event under a day. */
  date: string
  /**
   * The clock time as it should read — "9:00 AM". A string rather than a
   * parsed value: an event happens at nine in the morning *where it is*, and
   * re-deriving that from an instant would move a Denver happy hour to a
   * reader in Berlin.
   */
  time?: string
  location?: string
  /** Who is putting it on. */
  host?: string
  hostAvatarSrc?: string
  /** The event's page. Without one the name is plain text. */
  href?: string
  /** Thumbnail. Without one the row paints `theme`. */
  coverSrc?: string
  /** The colours this event is branded with. */
  theme?: CardTheme
  /** Your part in it — "Attending", "Hosting", "Speaking". */
  involvement?: ReactNode
  /** A nudge on the row — "Soon", "Today". */
  flag?: ReactNode
  /** Whose cards you came away with. */
  attendees?: AvatarStackPerson[]
  /** Cards traded here. Drives the line beside the faces. */
  exchangedCount?: number
}

export interface EventAgendaProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /**
   * The events, in the order they should read. Left in the caller's order
   * rather than sorted here — an agenda that silently reorders its own input
   * hides a bug in whatever produced it. Consecutive events on the same date
   * are gathered under one day heading.
   */
  events: AgendaEvent[]
  /** Names the list. Defaults to "Events". */
  label?: string
  /** Heading level for each event's name. */
  level?: 2 | 3 | 4
  locale?: string
}

const DAY_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
const WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'long' }

/** Parsed as local noon so a UTC offset can't roll the date over a boundary. */
function parseISODate(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions,
  locale?: string,
): string {
  const parsed = parseISODate(date)
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString(locale, options)
}

/**
 * Runs of events sharing a date, in the order they arrived. Consecutive
 * rather than global grouping, so a caller's ordering survives: if two May 18
 * events sit either side of a June one, that is what the caller asked for and
 * hiding it would be a lie about their data.
 */
function groupByDay(events: AgendaEvent[]): AgendaEvent[][] {
  const days: AgendaEvent[][] = []
  for (const event of events) {
    const current = days[days.length - 1]
    if (current && current[0].date === event.date) current.push(event)
    else days.push([event])
  }
  return days
}

/* Punctuation for the meta line rather than an icon the caller chooses —
   the same call `EventTimeline` makes about its globe. Lucide's conventions:
   the 24 grid, 2px strokes, round joins, no fill. */
const PinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

/**
 * Your events as a day-by-day agenda.
 *
 * The counterpart to `EventCard`: a card is one event standing on its own,
 * this is the run of them, and the run has a shape a stack of cards cannot
 * show — the days themselves. Dates head the list rather than repeating on
 * every row, a time gutter runs down the left so mornings line up with
 * mornings, and each row carries the faces you came away with, because on
 * this page an event is mostly a container for the cards you got there.
 *
 * Rows are not wholly clickable. The name is the link; everything else is
 * text about it. A row-sized hit area sounds friendlier and produces a single
 * enormous tab stop that reads its own contents aloud as a link name.
 *
 * @example
 * <EventAgenda
 *   events={[
 *     { id: 'revops', name: 'RevOps Summit', date: '2027-05-18',
 *       time: '9:00 AM', location: 'Austin Convention Center',
 *       host: 'Hannah Davis', involvement: 'Attending', exchangedCount: 5 },
 *   ]}
 * />
 */
export function EventAgenda({
  events,
  label = 'Events',
  level = 3,
  locale,
  className,
  ...props
}: EventAgendaProps) {
  const Name = `h${level}` as const
  const days = groupByDay(events)

  return (
    <ul
      className={cx('deck-event-agenda', className)}
      aria-label={label}
      {...props}
    >
      {days.map((day) => (
        <li key={`${day[0].date}-${day[0].id}`} className="deck-event-agenda__day">
          <div className="deck-event-agenda__day-heading">
            <time className="deck-event-agenda__date" dateTime={day[0].date}>
              {formatDate(day[0].date, DAY_FORMAT, locale)}
            </time>
            <span className="deck-event-agenda__weekday">
              {formatDate(day[0].date, WEEKDAY_FORMAT, locale)}
            </span>
          </div>

          <ul className="deck-event-agenda__events">
            {day.map((event) => (
              <li
                key={event.id}
                className="deck-event-agenda__event"
                style={
                  {
                    ...(event.theme?.primary
                      ? { '--deck-event-agenda-brand': event.theme.primary }
                      : null),
                    ...(event.theme?.accent
                      ? { '--deck-event-agenda-accent': event.theme.accent }
                      : null),
                  } as CSSProperties
                }
              >
                {event.time ? (
                  <span className="deck-event-agenda__time">{event.time}</span>
                ) : null}

                {/* Decorative. The thumbnail is the event's colour at
                    postage-stamp size; the name beside it is the content. */}
                <span className="deck-event-agenda__cover" aria-hidden="true">
                  {event.coverSrc ? (
                    <img
                      className="deck-event-agenda__cover-photo"
                      src={event.coverSrc}
                      alt=""
                    />
                  ) : null}
                </span>

                <span className="deck-event-agenda__body">
                  <Name className="deck-event-agenda__name">
                    {event.href ? (
                      <Link href={event.href} tone="default" underline="hover">
                        {event.name}
                      </Link>
                    ) : (
                      event.name
                    )}
                  </Name>

                  {event.host || event.location ? (
                    <span className="deck-event-agenda__meta">
                      {event.host ? (
                        <span className="deck-event-agenda__fact">
                          <Avatar
                            name={event.host}
                            src={event.hostAvatarSrc}
                            size="xs"
                            decorative
                          />
                          By {event.host}
                        </span>
                      ) : null}
                      {event.location ? (
                        <span className="deck-event-agenda__fact">
                          <span
                            className="deck-event-agenda__fact-icon"
                            aria-hidden="true"
                          >
                            <PinIcon />
                          </span>
                          {event.location}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </span>

                {event.flag || event.involvement ? (
                  <span className="deck-event-agenda__badges">
                    {event.flag ? (
                      <Badge tone="brand" size="sm">
                        {event.flag}
                      </Badge>
                    ) : null}
                    {event.involvement ? (
                      <Badge tone="neutral" size="sm">
                        {event.involvement}
                      </Badge>
                    ) : null}
                  </span>
                ) : null}

                {event.attendees && event.attendees.length > 0 ? (
                  <AvatarStack
                    className="deck-event-agenda__stack"
                    people={event.attendees}
                    size="sm"
                    label={`Cards exchanged at ${event.name}`}
                    caption={
                      typeof event.exchangedCount === 'number'
                        ? `${event.exchangedCount} ${
                            event.exchangedCount === 1 ? 'card' : 'cards'
                          } exchanged`
                        : undefined
                    }
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
