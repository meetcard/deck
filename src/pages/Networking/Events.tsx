import { useMemo, useState } from 'react'
import { EventCalendar } from '../../components/EventCalendar/EventCalendar'
import type { EventCalendarMarkedDate } from '../../components/EventCalendar/EventCalendar'
import { EventCard } from '../../components/EventCard/EventCard'
import { Heading } from '../../components/Heading/Heading'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import './Events.css'

/* ---- Demo data -------------------------------------------------------- */

interface EventListing {
  slug: string
  name: string
  startDate: string
  endDate?: string
  location: string
  connectionCount: number
  status: 'upcoming' | 'past'
}

const EVENTS: EventListing[] = [
  {
    slug: 'sprints-spirits-2026-07-21',
    name: 'Sprints & Spirits: Colorado Product Happy Hour',
    startDate: '2026-07-21',
    location: 'Number Thirty Eight, Denver, CO',
    connectionCount: 1,
    status: 'past',
  },
  {
    slug: 'boulder-startup-week-2026-05-04',
    name: 'Boulder Startup Week 2026',
    startDate: '2026-05-04',
    endDate: '2026-05-08',
    location: 'Boulder, Colorado',
    connectionCount: 1,
    status: 'past',
  },
]

const ICON = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5 1.5v3M11 1.5v3" strokeLinecap="round" />
  </svg>
)

/**
 * Public events index — a calendar highlighting event days, a preview
 * panel for whatever date is selected, and the full past/upcoming lists
 * below. Selecting a marked date is a shortcut into the same list, not a
 * separate view — there's exactly one source of truth for "what happened
 * on that day."
 */
export function Events() {
  const [month, setMonth] = useState('2026-07')
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const markedDates: EventCalendarMarkedDate[] = useMemo(
    () => EVENTS.map((e) => ({ date: e.startDate, status: e.status })),
    [],
  )

  const selectedEvent = EVENTS.find((e) => e.startDate === selected)
  const pastEvents = EVENTS.filter((e) => e.status === 'past')
  const upcomingEvents = EVENTS.filter((e) => e.status === 'upcoming')

  return (
    <div className="deck-events">
      <Stack gap={32} className="deck-events__container">
        <Stack gap={4}>
          <Text size="xs" tone="muted" className="deck-events__eyebrow">
            MeetCard
          </Text>
          <Heading level={1} size="xl" family="serif">
            Events calendar
          </Heading>
        </Stack>

        <div className="deck-events__top">
          <EventCalendar
            month={month}
            onMonthChange={setMonth}
            value={selected}
            onChange={setSelected}
            today="2026-07-21"
            markedDates={markedDates}
          />

          <div className="deck-events__preview">
            {selectedEvent ? (
              <EventCard
                name={selectedEvent.name}
                startDate={selectedEvent.startDate}
                endDate={selectedEvent.endDate}
                location={selectedEvent.location}
                connectionCount={selectedEvent.connectionCount}
                status={selectedEvent.status}
                href={`/events/${selectedEvent.slug}`}
              />
            ) : (
              <Stack
                align="center"
                justify="center"
                gap={8}
                className="deck-events__empty"
              >
                <span className="deck-events__empty-icon" aria-hidden="true">
                  {ICON}
                </span>
                <Text size="sm" tone="muted">
                  Pick a highlighted date to see events, or browse below.
                </Text>
              </Stack>
            )}
          </div>
        </div>

        {upcomingEvents.length > 0 && (
          <Stack gap={12}>
            <div className="deck-events__section-heading">
              <Heading level={2} size="sm">
                Upcoming events
              </Heading>
              <Text size="sm" tone="muted">
                {upcomingEvents.length}
              </Text>
            </div>
            <Stack gap={8}>
              {upcomingEvents.map((e) => (
                <EventCard
                  key={e.slug}
                  name={e.name}
                  startDate={e.startDate}
                  endDate={e.endDate}
                  location={e.location}
                  connectionCount={e.connectionCount}
                  status={e.status}
                  href={`/events/${e.slug}`}
                />
              ))}
            </Stack>
          </Stack>
        )}

        <Stack gap={12}>
          <div className="deck-events__section-heading">
            <Heading level={2} size="sm">
              Past events
            </Heading>
            <Text size="sm" tone="muted">
              {pastEvents.length}
            </Text>
          </div>
          <Stack gap={8}>
            {pastEvents.map((e) => (
              <EventCard
                key={e.slug}
                name={e.name}
                startDate={e.startDate}
                endDate={e.endDate}
                location={e.location}
                connectionCount={e.connectionCount}
                status={e.status}
                href={`/events/${e.slug}`}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </div>
  )
}
