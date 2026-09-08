import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  QrCode,
  Users,
} from 'lucide-react'
import { AvatarGroup } from '../../components/AvatarGroup/AvatarGroup'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { EventHero } from '../../components/EventHero/EventHero'
import { EventSchedule } from '../../components/EventSchedule/EventSchedule'
import { Heading } from '../../components/Heading/Heading'
import { Link } from '../../components/Link/Link'
import { RsvpControl } from '../../components/RsvpControl/RsvpControl'
import type {
  RsvpCounts,
  RsvpStatus,
} from '../../components/RsvpControl/RsvpControl'
import { ShareSheet } from '../../components/ShareSheet/ShareSheet'
import { Stack } from '../../components/Stack/Stack'
import { Tag } from '../../components/Tag/Tag'
import { Text } from '../../components/Text/Text'
import {
  EVENTS,
  TODAY,
  daysUntil,
  formatLongDate,
  type AppEvent,
} from './eventFixtures'
import './EventDetail.css'

const SOON_DAYS = 21

const ATTENDANCE_LABEL: Record<AppEvent['attendance'], string> = {
  attending: 'Attending',
  hosting: 'Hosting',
  speaking: 'Speaking',
  invited: 'Invited',
}

/* ---- Page --------------------------------------------------------------- */

export interface EventDetailProps {
  /** Which event to show, by slug. Stands in for the route parameter. */
  slug?: string
  events?: AppEvent[]
  /** ISO date the page reads "upcoming" from. Pinned in stories and tests. */
  today?: string
  /** Where the RSVP starts. */
  defaultRsvp?: RsvpStatus
  /** The tally the RSVP moves. */
  defaultCounts?: RsvpCounts
}

/**
 * One event, in full: what it is, when and where, and what you got out of it.
 *
 * The hero carries everything you would check on a phone in a lobby — the
 * name, the date, the room, and whether you said you were coming — because
 * that is what this page is opened for on the day. Everything a person reads
 * once, before deciding, is below it.
 *
 * The last section is the event's point. An event in MeetCard is not a
 * calendar entry, it is where a handful of cards came from, so the page ends
 * on the people: who you already know that is going, before it happens, and
 * whose cards you left with, after. Those are two different facts and the
 * page says which one it is showing rather than printing "cards exchanged"
 * over an event three weeks away.
 *
 * Nothing persists. An RSVP made here lives for as long as the page does.
 */
export function EventDetail({
  slug = 'revops-summit',
  events = EVENTS,
  today = TODAY,
  defaultRsvp = 'yes',
  defaultCounts = { yes: 421, maybe: 18, no: 4 },
}: EventDetailProps) {
  const event = useMemo(
    () => events.find((candidate) => candidate.slug === slug),
    [events, slug],
  )

  const [rsvp, setRsvp] = useState<RsvpStatus | undefined>(defaultRsvp)
  const [counts, setCounts] = useState<RsvpCounts>(defaultCounts)
  const [sharing, setSharing] = useState(false)

  /* The tally moves with the answer, so a person sees their own choice in
     the same numbers everyone else sees rather than in a separate line. */
  function changeRsvp(next: RsvpStatus) {
    setCounts((previous) => {
      const updated = { ...previous }
      if (rsvp) updated[rsvp] -= 1
      updated[next] += 1
      return updated
    })
    setRsvp(next)
  }

  if (!event) {
    return (
      <div className="event-detail">
        <Stack gap={24} className="event-detail__container">
          <EmptyState
            title="No such event"
            description="It may have been deleted, or the link may be wrong."
            actions={
              <Text>
                <Link href="/events">Back to events</Link>
              </Text>
            }
          />
        </Stack>
      </div>
    )
  }

  const past = event.date < today
  const soon = !past && daysUntil(event.date, today) <= SOON_DAYS
  /* Before the date, people you know who are going; after it, whose cards
     you came away with. Same faces, different fact. */
  const names = (past ? event.exchanged : event.going) ?? []
  const people = names.map((name) => ({ name }))

  return (
    <div className="event-detail">
      <Stack gap={24} className="event-detail__container">
        <div className="event-detail__topbar">
          <Link href="/events" tone="muted" underline="hover">
            <ArrowLeft aria-hidden="true" className="event-detail__icon" />
            Events
          </Link>
          {/* Only where it is yours to edit. An edit link on someone else's
              conference is a control that cannot do what it offers. */}
          {event.attendance === 'hosting' ? (
            <Link
              href={`/events/${event.slug}/edit`}
              tone="muted"
              underline="hover"
            >
              <Pencil aria-hidden="true" className="event-detail__icon" />
              Edit event
            </Link>
          ) : null}
        </div>

        <EventHero
          level={1}
          name={event.name}
          coverSrc={event.coverSrc}
          host={event.host}
          badges={
            <>
              <Badge tone="neutral" size="sm">
                {ATTENDANCE_LABEL[event.attendance]}
              </Badge>
              {soon ? (
                <Badge tone="warning" size="sm">
                  Soon
                </Badge>
              ) : null}
              {past ? (
                <Badge tone="neutral" size="sm">
                  Past
                </Badge>
              ) : null}
            </>
          }
          facts={[
            {
              icon: <CalendarDays />,
              title: formatLongDate(event.date),
              detail: event.endTime
                ? `${event.time} – ${event.endTime}`
                : event.time,
            },
            {
              icon: <MapPin />,
              title: event.venue,
              detail: event.address ?? event.city,
            },
          ]}
        >
          <div className="event-detail__actions">
            <Button
              variant="secondary"
              size="sm"
              iconStart={<QrCode aria-hidden="true" />}
              onClick={() => setSharing(true)}
            >
              Share
            </Button>
            {people.length > 0 ? (
              <AvatarGroup
                people={people}
                max={3}
                size="sm"
                label={past ? 'Cards exchanged here' : 'People you know going'}
              />
            ) : null}
          </div>

          {/* An event you have already been to does not ask whether you are
              coming. */}
          {!past ? (
            <RsvpControl
              label="Are you attending?"
              value={rsvp}
              onChange={changeRsvp}
              counts={counts}
              className="event-detail__rsvp"
            />
          ) : null}
        </EventHero>

        {event.about && event.about.length > 0 ? (
          <Card as="section" aria-labelledby="event-about">
            <Stack gap={12}>
              <Heading
                id="event-about"
                level={2}
                size="xs"
                tone="brand"
                className="event-detail__eyebrow"
              >
                About
              </Heading>
              {event.about.map((paragraph) => (
                <Text key={paragraph} tone="muted">
                  {paragraph}
                </Text>
              ))}
              {typeof event.expected === 'number' ? (
                <Text size="sm" tone="muted" className="event-detail__expected">
                  <Users aria-hidden="true" className="event-detail__icon" />
                  {event.expected.toLocaleString()} expected
                </Text>
              ) : null}
            </Stack>
          </Card>
        ) : null}

        {event.schedule && event.schedule.length > 0 ? (
          <Card as="section" aria-labelledby="event-schedule">
            <Stack gap={12}>
              <Heading
                id="event-schedule"
                level={2}
                size="xs"
                tone="brand"
                className="event-detail__eyebrow"
              >
                Schedule
              </Heading>
              <EventSchedule
                entries={event.schedule}
                label={`Schedule for ${event.name}`}
              />
            </Stack>
          </Card>
        ) : null}

        <Card as="section" aria-labelledby="event-people">
          <Stack gap={12}>
            <Heading
              id="event-people"
              level={2}
              size="xs"
              tone="brand"
              className="event-detail__eyebrow"
            >
              {past ? 'Cards exchanged' : 'Who you know'}
            </Heading>

            {people.length === 0 ? (
              <Text tone="muted">
                {past
                  ? 'You did not collect any cards here.'
                  : 'Nobody you have a card from is going yet.'}
              </Text>
            ) : (
              <>
                <div className="event-detail__people">
                  <AvatarGroup
                    people={people}
                    size="md"
                    label={
                      past
                        ? `Cards exchanged at ${event.name}`
                        : `People you know going to ${event.name}`
                    }
                  />
                  <Text size="sm" tone="muted">
                    {past
                      ? `${people.length} ${people.length === 1 ? 'card' : 'cards'} exchanged`
                      : `${people.length} going`}
                  </Text>
                </div>

                {/* The names in full, under the faces that abbreviate them —
                    a stack of initials is a count, not a guest list. */}
                <ul className="event-detail__names">
                  {people.map((person) => (
                    <li key={person.name}>
                      <Tag>{person.name}</Tag>
                    </li>
                  ))}
                </ul>

                {past ? (
                  <Text size="sm">
                    <Link href="/connections">
                      Open the stack in Connections
                    </Link>
                  </Text>
                ) : (
                  <Text size="sm" tone="muted">
                    Cards you collect here will file themselves under this
                    event.
                  </Text>
                )}
              </>
            )}
          </Stack>
        </Card>
      </Stack>

      <ShareSheet
        open={sharing}
        onClose={() => setSharing(false)}
        value={`meetcard.io/events/${event.slug}`}
      />
    </div>
  )
}
