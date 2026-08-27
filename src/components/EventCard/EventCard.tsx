import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Badge } from '../Badge/Badge'
import { Card, type CardProps } from '../Card/Card'
import { Heading } from '../Heading/Heading'
import { Link } from '../Link/Link'
import { Text } from '../Text/Text'
import './EventCard.css'

export interface EventCardProps extends Omit<CardProps, 'children' | 'title'> {
  name: string
  /** ISO 8601 date, e.g. "2027-05-18". Rendered in the viewer's locale. */
  startDate: string
  /** ISO 8601 end date for multi-day events. */
  endDate?: string
  /** Venue or city, e.g. "Moscone Center, San Francisco". */
  location?: string
  /** Public event URL — `meetcard.io/events/{slug}-{YYYY-MM-DD}`. */
  href?: string
  /** Connections captured at this event. */
  connectionCount?: number
  /** Lifecycle state. Drives the status pill. */
  status?: 'upcoming' | 'live' | 'past'
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

/**
 * An event as a card — for the public event page, a company's events
 * listing, and the app's Events destination.
 *
 * The date renders in the viewer's locale but is wrapped in a `<time>` with
 * the machine-readable value, so the real date survives translation.
 *
 * @example
 * <EventCard name="RevOps Summit" startDate="2027-05-18"
 *   location="San Francisco" status="upcoming" connectionCount={42} />
 */
export const EventCard = forwardRef<HTMLElement, EventCardProps>(
  function EventCard(
    {
      name,
      startDate,
      endDate,
      location,
      href,
      connectionCount,
      status,
      actions,
      className,
      ...cardProps
    },
    ref,
  ) {
    return (
      <Card
        ref={ref}
        as="article"
        interactive={Boolean(href)}
        className={cx('deck-event-card', className)}
        {...cardProps}
      >
        <div className="deck-event-card__row">
          <div className="deck-event-card__body">
            <div className="deck-event-card__heading">
              <Heading level={3} size="sm" truncate>
                {href ? (
                  <Link href={href} tone="default" underline="hover">
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </Heading>
              {status ? (
                <Badge tone={STATUS_TONE[status]} size="sm" dot={status === 'live'}>
                  {STATUS_LABEL[status]}
                </Badge>
              ) : null}
            </div>

            <Text size="sm" tone="muted">
              <time dateTime={startDate}>{formatRange(startDate, endDate)}</time>
              {location ? ` · ${location}` : ''}
            </Text>

            {typeof connectionCount === 'number' ? (
              <Text size="xs" tone="muted">
                {connectionCount} connection{connectionCount === 1 ? '' : 's'}{' '}
                captured
              </Text>
            ) : null}
          </div>

          {actions ? (
            <div className="deck-event-card__actions">{actions}</div>
          ) : null}
        </div>
      </Card>
    )
  },
)
