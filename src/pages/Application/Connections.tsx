import { useMemo, useState } from 'react'
import { CalendarDays, Handshake, Mail, MapPin, Share2 } from 'lucide-react'
import { Button } from '../../components/Button/Button'
import { CardIndex } from '../../components/CardIndex/CardIndex'
import { CardPile } from '../../components/CardPile/CardPile'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { EventTimeline } from '../../components/EventTimeline/EventTimeline'
import type { TimelineEvent } from '../../components/EventTimeline/EventTimeline'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { PersonCard } from '../../components/PersonCard/PersonCard'
import { PrivateNote } from '../../components/PrivateNote/PrivateNote'
import type { ConnectionFeeling } from '../../components/PrivateNote/PrivateNote'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import './Connections.css'

/* Lucide dropped its brand marks, so LinkedIn is drawn here — Lucide's own
   retired glyph, kept to its conventions: the 24-unit grid, 2px strokes and
   round joins of the icons beside it, and no fill, so it sits in the row as
   an outline rather than a solid chip.

   `IconButton` normalises every icon to 1em, which is right for a row of
   them and a touch too generous for this one: the mark is drawn nearly edge
   to edge in its box where Mail and Share2 leave a margin, so at the same
   box size it reads larger than either. 15/16 is the ratio the glyph ships
   with elsewhere, written in `em` so it holds at every `IconButton` size
   rather than pinning the icon to one. */
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

/* ---- Model ------------------------------------------------------------- */

export interface Connection {
  /** Stable key — the person's card slug. */
  slug: string
  /** Which event you met at — an `id` from the timeline's events. */
  eventId: string
  name: string
  tagline?: string
  title?: string
  company?: string
  location?: string
  avatarSrc?: string
  /** What you wrote on the back of their card, if anything. */
  note?: string
  feeling?: ConnectionFeeling
}

/*
 * The events these cards came from. Dated either side of the line's "today"
 * so the sample shows all three of a timeline's states at once — one behind,
 * one selected, one still ahead — which is also what the mockups show.
 */
const EVENTS: TimelineEvent[] = [
  {
    id: 'saastr-annual',
    name: 'SaaStr Annual',
    date: '2027-09-09',
    location: 'San Francisco, CA',
  },
  {
    id: 'founders-dinner',
    name: 'Founders Dinner',
    date: '2027-11-12',
    location: 'Denver, CO',
  },
  {
    id: 'revops-summit',
    name: 'RevOps Summit',
    date: '2028-01-22',
    location: 'Chicago, IL',
  },
]

const INITIAL: Connection[] = [
  {
    slug: 'ben@meetcard',
    eventId: 'founders-dinner',
    name: 'Ben Ackles',
    tagline: 'What a lovable guy',
    title: 'Builder',
    company: 'MeetCard',
    location: 'Boulder, Colorado',
    note: 'Met at the Front Range meetup — wants to talk about the deck metaphor.',
    feeling: 'hot',
  },
  {
    slug: 'grace@sextant',
    eventId: 'founders-dinner',
    name: 'Grace Okafor',
    tagline: 'Ask me about supply chains.',
    title: 'Head of Operations',
    company: 'Sextant',
    location: 'Denver, Colorado',
  },
  {
    slug: 'mika@ply',
    eventId: 'founders-dinner',
    name: 'Mika Tanaka',
    tagline: 'Always three prototypes deep.',
    title: 'Principal Engineer',
    company: 'Ply',
    location: 'Seattle, Washington',
  },
  {
    slug: 'renee@harborlight',
    eventId: 'saastr-annual',
    name: 'Renée Ashford',
    tagline: 'Pricing is a product.',
    title: 'VP Revenue',
    company: 'Harborlight',
    location: 'San Francisco, California',
    note: 'Wants the deck demo before their Q1 planning.',
  },
  {
    slug: 'devon@northbound',
    eventId: 'saastr-annual',
    name: 'Devon Iyer',
    tagline: 'Runs on conference coffee.',
    title: 'Founder',
    company: 'Northbound',
    location: 'Austin, Texas',
  },
]

/**
 * The event the page opens on: the latest one that has actually happened,
 * since that is where the newest cards are. If every event is still ahead —
 * a new account with its calendar filled in and nobody met yet — the first
 * is as good a place to stand as any.
 */
function mostRecentPast(events: TimelineEvent[], today: string): string {
  const past = events.filter((event) => event.date <= today)
  return (past.length > 0 ? past[past.length - 1] : events[0])?.id ?? ''
}

/** Parsed as local noon so a UTC offset can't roll the date over a boundary. */
function formatDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
}

/** "Head of Operations at Sextant" — one line, whichever halves exist. */
function describe(card: Connection): string | undefined {
  if (card.title && card.company) return `${card.title} at ${card.company}`
  return card.title ?? card.company
}

/* ---- Page -------------------------------------------------------------- */

export interface ConnectionsProps {
  /** Seeds the page. Notes stay local — Deck has no data layer. */
  connections?: Connection[]
  /** The events on the line beside the pile, oldest first. */
  events?: TimelineEvent[]
  /** Which event the page opens on. Defaults to the most recent past one. */
  defaultEventId?: string
  /** ISO date the timeline is read from. Pinned in stories and tests. */
  today?: string
}

/**
 * Connections — the cards other people have handed you.
 *
 * One pile, not a grid of tiles. These arrived as objects, a few at a time,
 * and a pile is the only presentation that keeps that true: it says how many
 * without listing them, and it hands you the most recent one face up. A grid
 * would turn a stack of cards from a week of meeting people into a directory.
 *
 * The pile decides its own orientation — portrait on a phone, landscape from
 * `sm` up — so this page only says what is in it.
 *
 * Beside it, the events those cards came from. Cards arrive in bursts — a
 * conference, a dinner — and "where did I meet this person" is the question
 * people actually use to find one again, so the timeline is the index and
 * the pile is what it opens. Selecting an event puts that event's cards on
 * the desk; an event nobody has been to yet has an empty desk, which is the
 * honest answer rather than a hidden one.
 *
 * Under the pile, everyone else in it. A pile hands you one card at a time,
 * and without a contents page the third person you met is three swipes away
 * with nothing to say they are there at all.
 *
 * The page has one shape at every width and two arrangements of it: on a
 * phone the timeline is a row of dots above the desk, and from `lg` it is a
 * rail beside it, where a screen wide enough for a pile has width to spare
 * on either side.
 *
 * Nothing persists. Notes written here live for as long as the page does.
 */
export function Connections({
  connections = INITIAL,
  events = EVENTS,
  defaultEventId,
  /* The sample data lives in 2027, so the line needs a present to be read
     from or every event on it is still to come. A caller bringing real
     events brings its own today with them. */
  today = '2027-12-01',
}: ConnectionsProps) {
  const [cards, setCards] = useState<Connection[]>(connections)
  const [index, setIndex] = useState(0)
  /** Which card is turned over, by slug — at most one at a time. */
  const [flipped, setFlipped] = useState<string | null>(null)
  const [eventId, setEventId] = useState(
    () => defaultEventId ?? mostRecentPast(events, today),
  )

  const update = (slug: string, patch: Partial<Connection>) =>
    setCards((all) =>
      all.map((card) => (card.slug === slug ? { ...card, ...patch } : card)),
    )

  const event = events.find((candidate) => candidate.id === eventId)
  const pile = useMemo(
    () => cards.filter((card) => card.eventId === eventId),
    [cards, eventId],
  )
  /* The pile wraps its own index, so a page reading back into the array has
     to wrap too or it reads off the end after the last card. */
  const active = pile.length > 0 ? pile[index % pile.length] : undefined

  /* Moving along the line puts a different pile on the desk, so the pile
     starts at its top card and nothing is left turned over from the last
     one — a note you opened on one event's card has no business hanging
     over another's. */
  function selectEvent(next: string) {
    setEventId(next)
    setIndex(0)
    setFlipped(null)
  }

  return (
    <div className="connections">
      <Stack gap={24} className="connections__container">
        <Heading level={1} size="xl" family="serif">
          Connections
        </Heading>

        <div className="connections__layout">
          {/* The line stays with the top of the page — it is the index for
              what's beside it, and an index that floats in the middle of the
              page is no longer indexing anything. */}
          <div className="connections__rail">
            <EventTimeline
              events={events}
              value={eventId}
              onValueChange={selectEvent}
              today={today}
              label="Where we met"
              orientation="responsive"
            />
          </div>

          <div className="connections__desk">
            {/*
              Which event this desk belongs to, said again at the width where
              the rail is a column of small type off to the left and your eye
              is on the pile. Below `lg` the timeline sits directly above the
              pile and names the event itself, so this would be the same
              words twice — `display: none` rather than a clip, since a
              screen reader would hear the duplication a sighted reader sees.
            */}
            {event ? (
              <div className="connections__event" aria-hidden="true">
                <Text size="xs" tone="brand" className="connections__eyebrow">
                  {event.name}
                </Text>
                <Text size="sm" tone="muted" className="connections__event-meta">
                  <span className="connections__fact">
                    <CalendarDays aria-hidden="true" focusable="false" />
                    {formatDate(event.date)}
                  </span>
                  {event.location ? (
                    <span className="connections__fact">
                      <MapPin aria-hidden="true" focusable="false" />
                      {event.location}
                    </span>
                  ) : null}
                  <span className="connections__fact">
                    {pile.length} {pile.length === 1 ? 'card' : 'cards'}
                  </span>
                </Text>
              </div>
            ) : null}

            <Stack gap={12}>
              <div className="connections__section-heading">
                {/* A real `h2`: it heads the section, and without it the page
                    jumps from its `h1` to `PersonCard`'s `h3` and skips a
                    level. Sized down to read as an eyebrow. */}
                <Heading
                  level={2}
                  size="xs"
                  tone="muted"
                  className="connections__eyebrow"
                >
                  Who we met
                </Heading>
                {pile.length > 1 ? (
                  <Text size="sm" tone="muted">
                    {(index % pile.length) + 1} / {pile.length}
                  </Text>
                ) : null}
              </div>

              {pile.length === 0 ? (
                <EmptyState
                  className="connections__empty"
                  title="No cards from this event"
                  description={
                    event
                      ? `Cards you collect at ${event.name} will land here.`
                      : 'Cards you collect will land here.'
                  }
                />
              ) : (
                <CardPile
                  /* Named for the event, so a screen reader hears which pile
                     moved when the line does. The `key` remounts it: a new
                     pile is a new set of cards, not the same one re-sorted,
                     and it should arrive squared up rather than mid-swipe
                     from the last event. */
                  key={eventId}
                  label={event ? `Cards from ${event.name}` : 'Recent connections'}
                  activeIndex={index}
                  onActiveIndexChange={setIndex}
                  className="connections__pile"
                >
                  {pile.map((card) => (
                    <PersonCard
                      key={card.slug}
                      name={card.name}
                      avatarSrc={card.avatarSrc}
                      tagline={card.tagline}
                      title={card.title}
                      company={card.company}
                      location={card.location}
                      privateNote={{
                        hasContent: Boolean(card.note || card.feeling),
                      }}
                      flipped={flipped === card.slug}
                      onFlippedChange={(next) =>
                        setFlipped(next ? card.slug : null)
                      }
                      back={
                        <PrivateNote
                          value={card.note ?? ''}
                          onValueChange={(note) => update(card.slug, { note })}
                          feeling={card.feeling}
                          onFeelingChange={(feeling) =>
                            update(card.slug, { feeling })
                          }
                          onHide={() => setFlipped(null)}
                        />
                      }
                      contactActions={
                        <>
                          <IconButton
                            label={`Email ${card.name}`}
                            icon={<Mail />}
                            size="sm"
                            round
                          />
                          <IconButton
                            label={`${card.name} on LinkedIn`}
                            icon={<LinkedInIcon />}
                            size="sm"
                            round
                          />
                          <IconButton
                            label={`Share ${card.name}'s card`}
                            icon={<Share2 />}
                            size="sm"
                            round
                          />
                        </>
                      }
                      footer={
                        <>
                          <Button size="sm" iconStart={<CalendarDays />}>
                            Book with me
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            iconStart={<Handshake />}
                          >
                            Exchange cards
                          </Button>
                        </>
                      }
                    />
                  ))}
                </CardPile>
              )}
            </Stack>

            {/* The contents page for the pile. Only worth drawing once there
                is more than one card in it — a one-row index of the card you
                are already looking at is furniture. */}
            {pile.length > 1 ? (
              <Stack gap={12}>
                <Heading
                  level={2}
                  size="xs"
                  tone="muted"
                  className="connections__eyebrow"
                >
                  Everyone from this event
                </Heading>
                <CardIndex
                  label={
                    event
                      ? `Everyone from ${event.name}`
                      : 'Everyone from this event'
                  }
                  value={active?.slug}
                  onValueChange={(slug) =>
                    setIndex(pile.findIndex((card) => card.slug === slug))
                  }
                  items={pile.map((card) => ({
                    id: card.slug,
                    name: card.name,
                    detail: describe(card),
                    avatarSrc: card.avatarSrc,
                  }))}
                />
              </Stack>
            ) : null}
          </div>
        </div>
      </Stack>
    </div>
  )
}
