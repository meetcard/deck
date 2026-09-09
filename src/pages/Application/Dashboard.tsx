import { useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Handshake,
  Mail,
  Share2,
} from 'lucide-react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { EventRow } from '../../components/EventRow/EventRow'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { Link } from '../../components/Link/Link'
import { PersonCard } from '../../components/PersonCard/PersonCard'
import { Stack } from '../../components/Stack/Stack'
import { StatTile } from '../../components/StatTile/StatTile'
import { Text } from '../../components/Text/Text'
import './Dashboard.css'

/* ---- Model ------------------------------------------------------------- */

export interface FollowUp {
  /** Stable key — the person's card slug. */
  slug: string
  name: string
  /** Why they are on the list: "Met at RevOps", "Promised an intro". */
  reason: string
  /** How long it has been waiting, already phrased: "2 days ago". */
  waitingFor: string
  avatarSrc?: string
}

export interface RecentConnection {
  slug: string
  name: string
  /** "Head of Product @ MeetCard" — the line as it reads on their card. */
  role: string
  /** Relative, already phrased: "2h", "Yesterday", "Mon". */
  when: string
  avatarSrc?: string
}

export interface UpcomingEvent {
  slug: string
  name: string
  /** ISO 8601 date. Rendered in the viewer's locale. */
  date: string
  /** Start time, already phrased: "9:00 AM". */
  time: string
  venue: string
}

const FOLLOW_UPS: FollowUp[] = [
  {
    slug: 'priya@northwind',
    name: 'Priya Shah',
    reason: 'Met at RevOps',
    waitingFor: '2 days ago',
  },
  {
    slug: 'marcus@loop',
    name: 'Marcus Liu',
    reason: 'Promised an intro',
    waitingFor: 'Yesterday',
  },
  {
    slug: 'hannah@meetcard',
    name: 'Hannah Davis',
    reason: 'Wants to book a time',
    waitingFor: 'Today',
  },
]

const RECENT: RecentConnection[] = [
  {
    slug: 'ben@meetcard',
    name: 'Ben Ackles',
    role: 'Head of Product @ MeetCard',
    when: '2h',
  },
  {
    slug: 'priya@northwind',
    name: 'Priya Shah',
    role: 'VP Sales @ Northwind',
    when: 'Yesterday',
  },
  {
    slug: 'marcus@loop',
    name: 'Marcus Liu',
    role: 'Founder @ Loop CRM',
    when: 'Mon',
  },
]

const EVENTS: UpcomingEvent[] = [
  {
    slug: 'revops-summit',
    name: 'RevOps Summit',
    date: '2027-05-18',
    time: '9:00 AM',
    venue: 'Austin Convention Center',
  },
  {
    slug: 'boulder-climate',
    name: 'Boulder Climate Happy Hour',
    date: '2027-06-16',
    time: '5:30 PM',
    venue: 'Rayback Collective',
  },
  {
    slug: 'saastr-annual',
    name: 'SaaStr Annual',
    date: '2027-09-09',
    time: '10:00 AM',
    venue: 'Moscone West',
  },
]

/**
 * Morning, afternoon or evening, from the hour on the clock.
 *
 * Taken from a passed-in `now` rather than read here, so stories and tests
 * are not a different page depending on when they run — the same reason
 * `Connections` takes its own `today`.
 */
function greeting(now: Date): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/* ---- Section ------------------------------------------------------------ */

function SectionHeader({
  id,
  title,
  action,
}: {
  id: string
  title: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="dashboard__section-header">
      <Heading id={id} level={2} size="sm">
        {title}
      </Heading>
      {action ? (
        <Link href={action.href} underline="hover">
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}

/* ---- Page --------------------------------------------------------------- */

export interface DashboardProps {
  followUps?: FollowUp[]
  recent?: RecentConnection[]
  events?: UpcomingEvent[]
  /** The clock the greeting is read from. Pinned in stories and tests. */
  now?: Date
}

/**
 * The screen you land on: your own card, who is waiting on you, and how the
 * card is doing.
 *
 * It leads with the card itself rather than a chart, because the card is the
 * product and the first question on opening the app is "what does mine look
 * like right now". The numbers come after, and they are only the three that
 * would make someone change something — the rest live in Analytics, one link
 * away, so the dashboard stays a page you can read rather than one you have
 * to study.
 *
 * Follow-ups sit above the metrics for the same reason. A count going up is
 * information; a person waiting two days for a reply is a task, and tasks
 * outrank information on a home screen.
 *
 * Clearing a follow-up is local and instant. Deck has no data layer, so
 * nothing here persists.
 */
export function Dashboard({
  followUps = FOLLOW_UPS,
  recent = RECENT,
  events = EVENTS,
  /* Fixed rather than `new Date()`, so the greeting does not make this page
     render differently in CI at 6am than it does at a desk after lunch. */
  now = new Date('2027-05-04T14:30:00'),
}: DashboardProps) {
  const [pending, setPending] = useState(followUps)

  const clear = (slug: string) =>
    setPending((all) => all.filter((person) => person.slug !== slug))

  return (
    <div className="dashboard">
      <Stack gap={24} className="dashboard__container">
        <Stack gap={2}>
          <Heading level={1} size="xl" family="serif">
            {greeting(now)},
          </Heading>
          <Text tone="muted">Ready to make it memorable.</Text>
        </Stack>

        {/* The card's own section heading. Hidden, because the card says
            what it is by being a card — but a real `h2` all the same, since
            `PersonCard` names itself with an `h3` and without this the page
            steps from its `h1` straight to a level three. Same reason
            `Connections` carries one above its pile. */}
        <Heading level={2} size="xs" className="deck-visually-hidden">
          Your card
        </Heading>

        {/* Your own card, face up. Not a summary of it — the thing itself,
            so "what are people seeing" is answered by looking. */}
        <PersonCard
          name="Ben Ackles"
          eyebrow="Meet"
          tagline="What a lovable guy"
          title="Builder"
          company="MeetCard"
          location="Boulder, Colorado"
          className="dashboard__card"
          contactActions={
            <IconButton label="Share your card" icon={<Share2 />} size="sm" round />
          }
          footer={
            <>
              <Button size="sm" iconStart={<CalendarDays />}>
                Book a time
              </Button>
              <Button size="sm" variant="secondary" iconStart={<Handshake />}>
                Exchange cards
              </Button>
            </>
          }
        />

        <Card as="section" aria-labelledby="dashboard-follow-up">
          <div className="dashboard__section-header">
            <div className="dashboard__section-heading">
              <Heading id="dashboard-follow-up" level={2} size="sm">
                Follow-up
              </Heading>
              {pending.length > 0 ? (
                <Badge tone="warning" size="sm">
                  {pending.length} due
                </Badge>
              ) : null}
            </div>
          </div>

          {pending.length === 0 ? (
            <EmptyState
              title="Nobody is waiting on you"
              description="Cards you collect will show up here when it's time to reply."
            />
          ) : (
            <ul className="dashboard__list">
              {pending.map((person) => (
                <li key={person.slug} className="dashboard__row">
                  <Avatar name={person.name} src={person.avatarSrc} size="sm" decorative />
                  <div className="dashboard__row-text">
                    <span className="dashboard__row-name">{person.name}</span>
                    <span className="dashboard__row-meta">
                      {person.reason} · {person.waitingFor}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    iconStart={<Mail />}
                    onClick={() => clear(person.slug)}
                  >
                    {/* The visible word is the same on every row, so the
                        announced name carries the person it belongs to. */}
                    <span className="deck-visually-hidden">
                      Follow up with {person.name}
                    </span>
                    <span aria-hidden="true">Follow up</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="dashboard__stats">
          <StatTile
            label="Profile views"
            value="1,684"
            caption="last 30 days"
            trend={{ direction: 'up', label: '12%' }}
            positiveDirection="up"
          />
          <StatTile
            label="Contacts saved"
            value="254"
            caption="last 30 days"
            trend={{ direction: 'up', label: '7%' }}
            positiveDirection="up"
          />
          <StatTile
            label="Meetings booked"
            value="43"
            caption="last 30 days"
            trend={{ direction: 'up', label: '15%' }}
            positiveDirection="up"
          />
        </div>

        <Link href="/analytics" className="dashboard__analytics-link">
          View advanced analytics
          <ArrowRight aria-hidden="true" className="dashboard__link-icon" />
        </Link>

        <Card as="section" aria-labelledby="dashboard-recent">
          <SectionHeader
            id="dashboard-recent"
            title="Recent connections"
            action={{ label: 'View all', href: '/connections' }}
          />
          <ul className="dashboard__list">
            {recent.map((person) => (
              <li key={person.slug} className="dashboard__row">
                <Avatar name={person.name} src={person.avatarSrc} size="sm" decorative />
                <div className="dashboard__row-text">
                  <span className="dashboard__row-name">{person.name}</span>
                  <span className="dashboard__row-meta">{person.role}</span>
                </div>
                <span className="dashboard__row-when">{person.when}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card as="section" aria-labelledby="dashboard-events">
          <SectionHeader
            id="dashboard-events"
            title="Upcoming events"
            action={{ label: 'View all', href: '/events' }}
          />
          <ul className="dashboard__list">
            {events.map((event) => (
              <li key={event.slug}>
                <EventRow
                  name={event.name}
                  date={event.date}
                  time={event.time}
                  venue={event.venue}
                  href={`/events/${event.slug}`}
                />
              </li>
            ))}
          </ul>
        </Card>
      </Stack>
    </div>
  )
}
