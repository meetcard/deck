import { useState } from 'react'
import { AttendeeList } from '../../components/AttendeeList/AttendeeList'
import type { EventAttendee } from '../../components/AttendeeList/AttendeeList'
import { Badge } from '../../components/Badge/Badge'
import { Card } from '../../components/Card/Card'
import { EventMetaList } from '../../components/EventMetaList/EventMetaList'
import { Heading } from '../../components/Heading/Heading'
import { Link } from '../../components/Link/Link'
import { RsvpControl } from '../../components/RsvpControl/RsvpControl'
import type { RsvpCounts, RsvpStatus } from '../../components/RsvpControl/RsvpControl'
import { Stack } from '../../components/Stack/Stack'
import { Tag } from '../../components/Tag/Tag'
import { Text } from '../../components/Text/Text'
import './EventDetails.css'

/* ---- Demo data -------------------------------------------------------- */

const ATTENDEES: EventAttendee[] = [
  {
    name: 'Ben Ackles',
    role: 'Product Marketing',
    company: 'MeetCard',
    companyHref: '/companies/meetcard',
    href: '/ben',
  },
]

const COMPANIES = [{ name: 'MeetCard', href: '/companies/meetcard' }]

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5 1.5v3M11 1.5v3" strokeLinecap="round" />
  </svg>
)

const PinIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M8 14.5S13 9.9 13 6.5a5 5 0 0 0-10 0c0 3.4 5 8 5 8Z" strokeLinejoin="round" />
    <circle cx="8" cy="6.5" r="1.8" />
  </svg>
)

const PeopleIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="6" cy="6" r="2.3" />
    <path d="M1.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" strokeLinecap="round" />
    <path d="M10.5 3.6a2.3 2.3 0 0 1 0 4.6M14.5 14c0-2.1-1.6-3.5-3.5-3.9" strokeLinecap="round" />
  </svg>
)

/**
 * Public event detail page — the destination `EventCard`/`Events` link to.
 * RSVP status feeds directly into the meta strip's attendee count and the
 * tally under the control, so a person sees their own choice reflected in
 * the same numbers everyone else sees.
 */
export function EventDetails() {
  const [rsvp, setRsvp] = useState<RsvpStatus | undefined>('yes')
  const [counts, setCounts] = useState<RsvpCounts>({ yes: 1, maybe: 0, no: 0 })

  function handleRsvpChange(next: RsvpStatus) {
    setCounts((prev) => {
      const updated = { ...prev }
      if (rsvp) updated[rsvp] -= 1
      updated[next] += 1
      return updated
    })
    setRsvp(next)
  }

  return (
    <div className="deck-event-details">
      <Stack gap={24} className="deck-event-details__container">
        <Card padding={24}>
          <Stack gap={16}>
            <Stack gap={8}>
              <Badge tone="brand" size="sm" className="deck-event-details__eyebrow">
                Upcoming event
              </Badge>
              <Heading level={1} size="xl" family="serif">
                Boulder Startup Week 2026
              </Heading>
              <Text tone="muted">
                Building free, kick-ass programming for the entrepreneurial community.
              </Text>
            </Stack>

            <EventMetaList
              items={[
                { icon: <CalendarIcon />, label: 'Dates', value: 'May 4–8, 2026' },
                { icon: <PinIcon />, label: 'Location', value: 'Boulder, Colorado' },
                {
                  icon: <PeopleIcon />,
                  label: 'Attendees',
                  value: `${counts.yes} attending`,
                },
              ]}
            />

            <RsvpControl value={rsvp} onChange={handleRsvpChange} counts={counts} />
          </Stack>
        </Card>

        <Card padding={24}>
          <Stack gap={8}>
            <Heading level={2} size="sm">
              About the event
            </Heading>
            <Text tone="muted">
              Boulder Startup Week is a five-day, community-built celebration of
              everything that makes Boulder one of the best places in the world to
              start and grow a company. Hundreds of free sessions across founders,
              engineering, design, product, sales, and community — all organized by
              local operators.
            </Text>
          </Stack>
        </Card>

        <Card padding={24}>
          <Stack gap={12}>
            <div className="deck-event-details__section-heading">
              <Heading level={2} size="sm">
                Who's attending
              </Heading>
              <Text size="sm" tone="muted">
                {ATTENDEES.length} attending
              </Text>
            </div>
            <AttendeeList attendees={ATTENDEES} />
          </Stack>
        </Card>

        <Card padding={24}>
          <Stack gap={12}>
            <Heading level={2} size="sm">
              Companies represented
            </Heading>
            <div className="deck-event-details__chips">
              {COMPANIES.map((c) => (
                <Tag key={c.name}>
                  <Link href={c.href} tone="default" underline="hover">
                    {c.name}
                  </Link>
                </Tag>
              ))}
            </div>
          </Stack>
        </Card>
      </Stack>
    </div>
  )
}
