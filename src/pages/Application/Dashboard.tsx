import { Calendar, Handshake, Mail, MessageSquare, Phone } from 'lucide-react'
import { Button } from '../../components/Button/Button'
import { FollowUpList } from '../../components/FollowUpList/FollowUpList'
import type { FollowUpItem } from '../../components/FollowUpList/FollowUpList'
import { EventCard } from '../../components/EventCard/EventCard'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { Link } from '../../components/Link/Link'
import { PersonCard } from '../../components/PersonCard/PersonCard'
import { PersonList } from '../../components/PersonList/PersonList'
import { Stack } from '../../components/Stack/Stack'
import { StatTile } from '../../components/StatTile/StatTile'
import { Text } from '../../components/Text/Text'
import {
  CARD_THEMES,
  MY_CARDS,
  NORTHWIND,
  linkFor,
  summaryFor,
} from './cardsData'
import type { MyCard } from './cardsData'
import { APP_CONNECTIONS } from './connectionsData'
import type { Connection } from './connectionsData'
import { APP_EVENTS, TODAY } from './eventsData'
import type { AppEvent } from './eventsData'
import { SampleQr } from './SampleQr'
import './Dashboard.css'

/* Lucide has no LinkedIn glyph — it is a trademark, and Lucide ships none.
   The same drawing My cards and Connections use, in `em` so it holds at
   whatever size the card gives it. */
const LinkedInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '0.9375em', height: '0.9375em' }}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

/**
 * Who is owed something.
 *
 * Three of the people in `APP_CONNECTIONS`, because a queue that named
 * someone who is not in your pile would be a task about a stranger. The
 * reasons are written rather than derived: "promised an intro" is a thing you
 * remember, not a field the product could compute.
 */
const FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'grace@sextant',
    name: 'Grace Okafor',
    reason: 'Met at Founders Dinner',
    since: 'Yesterday',
    href: '/connections',
  },
  {
    id: 'renee@harborlight',
    name: 'Renée Ashford',
    reason: 'Wants a demo',
    since: '3 weeks ago',
    href: '/connections',
  },
  {
    id: 'devon@northbound',
    name: 'Devon Iyer',
    reason: 'Promised an intro',
    href: '/connections',
  },
]

/**
 * The hour the greeting is read at, in the reader's own day. Midday and six
 * are where the words change, which is roughly where they change in English.
 */
function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export interface DashboardProps {
  /** The card you hand over. Defaults to the Business one on My cards. */
  card?: MyCard
  /** The pile, newest first. The top of it is what the page shows. */
  connections?: Connection[]
  /** Your calendar. Only the upcoming ones reach the page. */
  events?: AppEvent[]
  /** Who is owed something. Its length is the count on the panel. */
  followUps?: FollowUpItem[]
  /** The day the page is read from. Pinned in stories and tests. */
  today?: string
  /**
   * The hour the greeting is read at, 0–23. Defaults to the actual clock —
   * pin it in a story, or a visual snapshot changes wording at noon.
   */
  hour?: number
  /** How many rows each summary panel shows. */
  limit?: number
}

/**
 * The dashboard — your card, your queue, and the two lists worth a glance.
 *
 * It opens with the card itself rather than with numbers. The product's
 * subject is an object you hand to people, and the first thing a person wants
 * to know on opening it is what that object currently says about them; a row
 * of metrics above the fold would be a report about a card you cannot see.
 *
 * Beside it, the only part of the page that asks for something. `FollowUpList`
 * is the one module in the brand's own colour, because everything else here
 * reports and it requests — and the requests are the reason to have opened the
 * app rather than closed it.
 *
 * Underneath, two summaries that are deliberately *not* the pages they point
 * at. Connections is a pile of cards and Events is an agenda; here they are
 * three rows each and a way through. A dashboard that reproduced either would
 * be a second copy of a screen that already exists, and the "View all" links
 * would have nothing left to offer.
 *
 * Two deliberate departures from the product's own screen:
 *
 * - **Two stat tiles, not three.** The third was "This week +12", which is
 *   not a metric of its own but the change in the first — and `StatTile`
 *   already carries change as a `trend` on the figure it belongs to. There is
 *   no honest trend to show from a fixture with no history, so rather than
 *   invent one the tile is gone.
 * - **No pencil on the card.** Editing lives on My cards, one rail item away,
 *   and `PersonCard`'s pencil is a callback rather than a route. A control
 *   that opened nothing would be worse than the trip.
 *
 * Every figure on the page is counted from what the page was handed, so the
 * dashboard cannot claim 154 connections over a pile of five.
 */
export function Dashboard({
  card = MY_CARDS[0],
  connections = APP_CONNECTIONS,
  events = APP_EVENTS,
  followUps = FOLLOW_UPS,
  today = TODAY,
  hour = new Date().getHours(),
  limit = 3,
}: DashboardProps) {
  const upcoming = events.filter(
    (event) => event.status === 'upcoming' && event.date >= today,
  )

  return (
    <div className="dashboard">
      <Stack gap={24} className="dashboard__container">
        <Stack gap={4} as="header">
          <Text size="sm" tone="muted">
            {greetingFor(hour)},
          </Text>
          <Heading level={1} size="xl" family="serif">
            Ready to make it memorable.
          </Heading>
        </Stack>

        <div className="dashboard__lead">
          <div className="dashboard__card">
            {/* Hidden, because the card says whose it is at a size nobody
                can miss — but a real `h2` all the same, or the page jumps
                from its `h1` to `PersonCard`'s `h3`. */}
            <Heading level={2} size="xs" className="deck-visually-hidden">
              Your card
            </Heading>

            <PersonCard
              name={card.name}
              kind={card.kind}
              theme={CARD_THEMES[card.kind]}
              tagline={card.tagline}
              title={card.title}
              company={card.company}
              location={card.location}
              contactActions={
                <>
                  <IconButton
                    label={`Call ${card.name}`}
                    icon={<Phone />}
                    round
                  />
                  <IconButton
                    label={`Message ${card.name}`}
                    icon={<MessageSquare />}
                    round
                  />
                  <IconButton
                    label={`Email ${card.name}`}
                    icon={<Mail />}
                    round
                  />
                  <IconButton
                    label={`${card.name} on LinkedIn`}
                    icon={<LinkedInIcon />}
                    round
                  />
                </>
              }
              share={{
                value: linkFor(card),
                summary: summaryFor(card),
                qr: <SampleQr />,
                onDownloadQr: () => {},
                onShareLinkedIn: () => {},
              }}
              companyProfile={
                card.company === NORTHWIND.name ? NORTHWIND : undefined
              }
              footer={
                <>
                  <Button iconStart={<Calendar />}>Book a time</Button>
                  {/* Disabled, and honestly so — the same call My cards
                      makes: exchanging takes two people, and this is your
                      own card in your own hand. */}
                  <Button variant="secondary" iconStart={<Handshake />} disabled>
                    Exchange cards
                  </Button>
                </>
              }
            />
          </div>

          <Stack gap={12} className="dashboard__side">
            <div className="dashboard__stats">
              <StatTile
                label="Connections"
                value={connections.length}
                caption="cards collected"
              />
              <StatTile
                label="Events"
                value={upcoming.length}
                caption="coming up"
              />
            </div>

            <FollowUpList level={2} items={followUps} />
          </Stack>
        </div>

        <div className="dashboard__panels">
          <Stack gap={12}>
            <div className="dashboard__panel-heading">
              <Heading level={2} size="sm">
                Recent connections
              </Heading>
              {/* Two "View all"s on one page would be two links a screen
                  reader cannot tell apart, so each says what it opens and
                  the eye reads the heading beside it for the rest. */}
              <Link href="/connections" underline="hover">
                View all<span className="deck-visually-hidden"> connections</span>
              </Link>
            </div>

            <PersonList
              label="Recent connections"
              people={connections.slice(0, limit).map((connection) => ({
                name: connection.name,
                avatarSrc: connection.avatarSrc,
                role: connection.title,
                company: connection.company,
                meta: connection.arrived,
                /* No `href`. A card is read in the pile and there is no
                   per-card route, so three rows linking to the same page
                   would be three ways to do what "View all" already does —
                   and each would take a tab stop to say so. */
              }))}
            />
          </Stack>

          <Stack gap={12}>
            <div className="dashboard__panel-heading">
              <Heading level={2} size="sm">
                Upcoming events
              </Heading>
              <Link href="/events" underline="hover">
                View all<span className="deck-visually-hidden"> events</span>
              </Link>
            </div>

            <ul className="dashboard__events" aria-label="Upcoming events">
              {upcoming.slice(0, limit).map((event) => (
                <li key={event.slug}>
                  {/* Tighter than a `Card`'s own padding, so a row here
                      stands the same height as a row of people opposite. On
                      the Events page these have a column to themselves and
                      keep the default. */}
                  <EventCard
                    layout="row"
                    padding={12}
                    name={event.name}
                    startDate={event.date}
                    location={event.venue}
                    href={`/events/${event.slug}`}
                  />
                </li>
              ))}
            </ul>
          </Stack>
        </div>
      </Stack>
    </div>
  )
}
