import { useMemo, useState } from 'react'
import { CalendarPlus, MapPin, Users } from 'lucide-react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { EventRow } from '../../components/EventRow/EventRow'
import type { EventAttendance } from '../../components/EventRow/EventRow'
import { Heading } from '../../components/Heading/Heading'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import './Events.css'

/* ---- Model ------------------------------------------------------------- */

export interface AppEvent {
  slug: string
  name: string
  /** ISO 8601 date. */
  date: string
  /** Start time, already phrased — "9:00 AM". */
  time: string
  venue: string
  /** City and state, for the featured card's fuller address. */
  city?: string
  attendance: EventAttendance
  /** People you already know who are going. */
  going?: string[]
}

const EVENTS: AppEvent[] = [
  {
    slug: 'revops-summit',
    name: 'RevOps Summit',
    date: '2027-05-18',
    time: '9:00 AM',
    venue: 'Austin Convention Center',
    city: 'Austin, Texas',
    attendance: 'attending',
    going: ['Hannah Davis', 'Marcus Lee', 'Priya Shah'],
  },
  {
    slug: 'boulder-climate',
    name: 'Boulder Climate Happy Hour',
    date: '2027-06-16',
    time: '5:30 PM',
    venue: 'Rayback Collective',
    city: 'Boulder, Colorado',
    attendance: 'hosting',
    going: ['Hannah Davis'],
  },
  {
    slug: 'saastr-annual',
    name: 'SaaStr Annual',
    date: '2027-09-09',
    time: '10:00 AM',
    venue: 'Moscone West',
    city: 'San Francisco, California',
    attendance: 'speaking',
  },
  {
    slug: 'founders-dinner',
    name: 'Founders Dinner',
    date: '2027-11-02',
    time: '7:00 PM',
    venue: 'The Wayfarer',
    city: 'Denver, Colorado',
    attendance: 'hosting',
  },
  {
    slug: 'frontend-denver',
    name: 'Frontend Denver',
    date: '2027-02-11',
    time: '6:00 PM',
    venue: 'Industry RiNo',
    city: 'Denver, Colorado',
    attendance: 'attending',
  },
  {
    slug: 'saas-north',
    name: 'SaaS North',
    date: '2026-11-19',
    time: '9:30 AM',
    venue: 'Shaw Centre',
    city: 'Ottawa, Ontario',
    attendance: 'attending',
  },
]

/**
 * Days between two dates, floored. Used only to decide whether an event is
 * close enough to badge, so a whole-day resolution is the right one.
 */
function daysUntil(date: string, today: string): number {
  const ms =
    new Date(`${date}T12:00:00`).getTime() -
    new Date(`${today}T12:00:00`).getTime()
  return Math.floor(ms / 86_400_000)
}

/* ---- Page --------------------------------------------------------------- */

export interface EventsProps {
  events?: AppEvent[]
  /** ISO date the page reads "upcoming" from. Pinned in stories and tests. */
  today?: string
  /** Which list opens first. */
  defaultTab?: 'upcoming' | 'past'
}

/**
 * Your events — the ones you are going to, hosting, or speaking at.
 *
 * Distinct from the public events index: this is a personal calendar, so it
 * is ordered by what you have to do next rather than by what is popular, and
 * every row says what you are to the event. Hosting a dinner and being in the
 * audience are the same date and completely different weeks.
 *
 * The next event is lifted out into a featured card. On a list where every
 * row looks alike, the one that matters this week is the one that should not
 * — and it is where the people you already know are worth naming, because
 * that is what decides whether you actually go.
 *
 * Past events keep their attendance badge. "I spoke at that" is the reason
 * anyone scrolls back.
 */
export function Events({
  events = EVENTS,
  /* The sample data lives in 2027; the list needs a present to be split
     around or everything is upcoming. */
  today = '2027-05-04',
  defaultTab = 'upcoming',
}: EventsProps) {
  const [tab, setTab] = useState<'upcoming' | 'past'>(defaultTab)

  const { upcoming, past } = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
    return {
      upcoming: sorted.filter((event) => event.date >= today),
      /* Newest first: the thing you want from a past list is almost always
         the most recent one, not the oldest. */
      past: sorted.filter((event) => event.date < today).reverse(),
    }
  }, [events, today])

  const featured = upcoming[0]
  const list = tab === 'upcoming' ? upcoming : past

  return (
    <div className="events">
      <Stack gap={24} className="events__container">
        <div className="events__header">
          <Heading level={1} size="xl" family="serif">
            Events
          </Heading>
          <Button iconStart={<CalendarPlus aria-hidden="true" />}>
            Add event
          </Button>
        </div>

        {featured ? (
          <Card as="section" aria-labelledby="events-featured" className="events__featured">
            <Stack gap={12}>
              <div className="events__featured-eyebrow">
                <Text size="xs" tone="muted" className="events__eyebrow">
                  Happening next
                </Text>
                {daysUntil(featured.date, today) <= 21 ? (
                  <Badge tone="warning" size="sm">
                    In {daysUntil(featured.date, today)} days
                  </Badge>
                ) : null}
              </div>

              <Heading id="events-featured" level={2} size="lg" family="serif">
                {featured.name}
              </Heading>

              <Stack gap={4}>
                <Text size="sm" tone="muted">
                  {new Date(`${featured.date}T12:00:00`).toLocaleDateString(
                    undefined,
                    {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    },
                  )}{' '}
                  · {featured.time}
                </Text>
                <Text size="sm" tone="muted" className="events__venue">
                  <MapPin aria-hidden="true" className="events__icon" />
                  {featured.venue}
                  {featured.city ? `, ${featured.city}` : null}
                </Text>
              </Stack>

              {featured.going && featured.going.length > 0 ? (
                <div className="events__going">
                  <span className="events__avatars">
                    {featured.going.map((person) => (
                      /* Decorative — the sentence beside them names everyone,
                         so announcing each avatar would say it all twice. */
                      <Avatar key={person} name={person} size="sm" decorative />
                    ))}
                  </span>
                  <Text size="sm" tone="muted">
                    <Users aria-hidden="true" className="events__icon" />
                    {featured.going.length === 1
                      ? `${featured.going[0]} is going`
                      : `${featured.going.slice(0, -1).join(', ')} and ${
                          featured.going[featured.going.length - 1]
                        } are going`}
                  </Text>
                </div>
              ) : null}
            </Stack>
          </Card>
        ) : null}

        <div className="events__toolbar">
          <ChoiceGroup
            label="Which events"
            hideLabel
            options={[
              { value: 'upcoming', label: `Upcoming (${upcoming.length})` },
              { value: 'past', label: `Past (${past.length})` },
            ]}
            value={tab}
            onChange={(next) => setTab(next as 'upcoming' | 'past')}
          />
        </div>

        <Card as="section" aria-labelledby="events-list-heading">
          <Heading
            id="events-list-heading"
            level={2}
            size="xs"
            className="deck-visually-hidden"
          >
            {tab === 'upcoming' ? 'Upcoming events' : 'Past events'}
          </Heading>

          {list.length === 0 ? (
            <EmptyState
              title={
                tab === 'upcoming' ? 'Nothing coming up' : 'No past events'
              }
              description={
                tab === 'upcoming'
                  ? 'Add an event and the cards you collect there will file themselves under it.'
                  : 'Events you have been to will be listed here.'
              }
              actions={
                tab === 'upcoming' ? (
                  <Button iconStart={<CalendarPlus aria-hidden="true" />}>
                    Add event
                  </Button>
                ) : undefined
              }
            />
          ) : (
            list.map((event) => (
              <EventRow
                key={event.slug}
                name={event.name}
                date={event.date}
                time={event.time}
                venue={event.venue}
                attendance={event.attendance}
                showWeekday
                soon={
                  tab === 'upcoming' && daysUntil(event.date, today) <= 21
                }
                href={`/events/${event.slug}`}
              />
            ))
          )}
        </Card>
      </Stack>
    </div>
  )
}
