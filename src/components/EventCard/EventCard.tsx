import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { Card, type CardProps } from '../Card/Card'
import { Heading } from '../Heading/Heading'
import { Link } from '../Link/Link'
import { Text } from '../Text/Text'
import './EventCard.css'

/**
 * `row` is a line in a list that happens to sit on a card — dense, and right
 * when events are one of several things stacked down a page. `tile` is the
 * card doing what a card does: standing on its own in a grid, with room for
 * the host, the hour, and whoever you met there.
 */
export type EventCardLayout = 'row' | 'tile'

export interface EventCardProps extends Omit<CardProps, 'children' | 'title'> {
  name: string
  /** ISO 8601 date, e.g. "2027-05-18". Rendered in the viewer's locale. */
  startDate: string
  /** ISO 8601 end date for multi-day events. */
  endDate?: string
  /**
   * The clock time as it should read — "9:00 AM". A display string, not a
   * parsed value: an event starts at nine in the morning where it is, and
   * re-deriving that from an instant would move it for a reader elsewhere.
   * `tile` only — a row has no line to spare for it.
   */
  time?: string
  /** Venue or city, e.g. "Moscone Center, San Francisco". */
  location?: string
  /** Who is putting it on. `tile` only. */
  host?: string
  hostAvatarSrc?: string
  /** Public event URL — `meetcard.io/events/{slug}-{YYYY-MM-DD}`. */
  href?: string
  /** Connections captured at this event. */
  connectionCount?: number
  /** Lifecycle state. Drives the status pill. */
  status?: 'upcoming' | 'live' | 'past'
  /**
   * A caps line above the name, in the brand — your part in this one,
   * "Attending" or "Hosting". `tile` only, where there is a line for it above
   * the name; in a row it would compete with the name it sits beside.
   */
  eyebrow?: ReactNode
  /** A divided strip along the foot — an `AvatarStack`, usually. `tile` only. */
  footer?: ReactNode
  layout?: EventCardLayout
  /**
   * The trailing slot: the end of the row, or the top corner of a tile,
   * alongside the status pill. Controls usually — but anything the caller
   * wants pinned there, including a second badge carrying a nudge the
   * lifecycle `status` has no word for.
   */
  actions?: ReactNode
}

const STATUS_LABEL = {
  upcoming: 'Upcoming',
  live: 'Happening now',
  past: 'Past',
} as const

const STATUS_TONE = {
  upcoming: 'brand',
  live: 'success',
  past: 'neutral',
} as const

/** Parsed as local noon so a UTC offset can't roll the date over a boundary. */
function parseISODate(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

function formatRange(start: string, end?: string): string {
  const startDate = parseISODate(start)
  if (Number.isNaN(startDate.getTime())) return start

  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
  if (!end) return startDate.toLocaleDateString(undefined, opts)

  const endDate = parseISODate(end)
  if (Number.isNaN(endDate.getTime())) {
    return startDate.toLocaleDateString(undefined, opts)
  }

  // Same month: "May 18–20, 2027". Otherwise both dates in full.
  const sameMonth =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth()

  if (sameMonth) {
    const month = startDate.toLocaleDateString(undefined, { month: 'short' })
    return `${month} ${startDate.getDate()}–${endDate.getDate()}, ${endDate.getFullYear()}`
  }

  return `${startDate.toLocaleDateString(undefined, opts)} – ${endDate.toLocaleDateString(undefined, opts)}`
}

/* Punctuation for the tile's fact lines rather than icons the caller picks,
   and drawn here because the published bundle carries no icon set. Lucide's
   conventions: the 24 grid, 2px strokes, round joins, no fill. */
const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
} as const

const CalendarIcon = () => (
  <svg {...svgProps}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

const PinIcon = () => (
  <svg {...svgProps}>
    <path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

/**
 * An event as a card — for the public event page, a company's events
 * listing, and the app's Events destination.
 *
 * Two layouts of the same facts. `row` is the default and is what a list of
 * events on a page wants; `tile` is for a grid, where each card is on its own
 * and can carry the hour, the host, and a footer of the faces you came away
 * with. Reach for `EventAgenda` instead when the run of days matters more
 * than any one event does.
 *
 * The date renders in the viewer's locale but is wrapped in a `<time>` with
 * the machine-readable value, so the real date survives translation.
 *
 * @example
 * <EventCard name="RevOps Summit" startDate="2027-05-18"
 *   location="San Francisco" status="upcoming" connectionCount={42} />
 *
 * @example
 * <EventCard layout="tile" name="RevOps Summit" startDate="2027-05-18"
 *   time="9:00 AM" host="Hannah Davis" eyebrow="Attending"
 *   footer={<AvatarStack people={people} caption="5 cards exchanged" />} />
 */
export const EventCard = forwardRef<HTMLElement, EventCardProps>(
  function EventCard(
    {
      name,
      startDate,
      endDate,
      time,
      location,
      host,
      hostAvatarSrc,
      href,
      connectionCount,
      status,
      eyebrow,
      footer,
      layout = 'row',
      actions,
      className,
      ...cardProps
    },
    ref,
  ) {
    const title = href ? (
      <Link href={href} tone="default" underline="hover">
        {name}
      </Link>
    ) : (
      name
    )

    const dateLine = (
      <>
        <time dateTime={startDate}>{formatRange(startDate, endDate)}</time>
        {time ? ` · ${time}` : ''}
      </>
    )

    const captured =
      typeof connectionCount === 'number' ? (
        <Text size="xs" tone="muted">
          {connectionCount} connection{connectionCount === 1 ? '' : 's'} captured
        </Text>
      ) : null

    const statusBadge = status ? (
      <Badge tone={STATUS_TONE[status]} size="sm" dot={status === 'live'}>
        {STATUS_LABEL[status]}
      </Badge>
    ) : null

    return (
      <Card
        ref={ref}
        as="article"
        interactive={Boolean(href)}
        className={cx(
          'deck-event-card',
          `deck-event-card--${layout}`,
          className,
        )}
        {...cardProps}
      >
        {layout === 'tile' ? (
          <div className="deck-event-card__tile">
            {eyebrow || statusBadge || actions ? (
              <div className="deck-event-card__tile-top">
                {eyebrow ? (
                  <p className="deck-event-card__eyebrow">{eyebrow}</p>
                ) : null}
                <div className="deck-event-card__tile-aside">
                  {statusBadge}
                  {actions}
                </div>
              </div>
            ) : null}

            <Heading level={3} size="lg">
              {title}
            </Heading>

            <div className="deck-event-card__facts">
              <p className="deck-event-card__fact">
                <span className="deck-event-card__fact-icon" aria-hidden="true">
                  <CalendarIcon />
                </span>
                <span>{dateLine}</span>
              </p>

              {location ? (
                <p className="deck-event-card__fact">
                  <span className="deck-event-card__fact-icon" aria-hidden="true">
                    <PinIcon />
                  </span>
                  <span>{location}</span>
                </p>
              ) : null}

              {host ? (
                <p className="deck-event-card__fact">
                  <Avatar
                    name={host}
                    src={hostAvatarSrc}
                    size="xs"
                    decorative
                  />
                  <span>By {host}</span>
                </p>
              ) : null}
            </div>

            {captured}

            {footer ? (
              <div className="deck-event-card__footer">{footer}</div>
            ) : null}
          </div>
        ) : (
          <div className="deck-event-card__row">
            <div className="deck-event-card__body">
              <div className="deck-event-card__heading">
                <Heading level={3} size="sm" truncate>
                  {title}
                </Heading>
                {statusBadge}
              </div>

              <Text size="sm" tone="muted">
                {dateLine}
                {location ? ` · ${location}` : ''}
              </Text>

              {captured}
            </div>

            {actions ? (
              <div className="deck-event-card__actions">{actions}</div>
            ) : null}
          </div>
        )}
      </Card>
    )
  },
)
