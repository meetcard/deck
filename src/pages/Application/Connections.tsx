import { useMemo, useState } from 'react'
import { CalendarDays, Handshake, Mail } from 'lucide-react'
import { Button } from '../../components/Button/Button'
import { CardPile } from '../../components/CardPile/CardPile'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { EventTimeline } from '../../components/EventTimeline/EventTimeline'
import type { TimelineEvent } from '../../components/EventTimeline/EventTimeline'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { PersonCard } from '../../components/PersonCard/PersonCard'
import { PrivateNote } from '../../components/PrivateNote/PrivateNote'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import { summaryFor } from './cardsData'
import {
  APP_CONNECTIONS,
  CONNECTIONS_TODAY,
  CONNECTION_EVENTS,
} from './connectionsData'
import type { Connection } from './connectionsData'
import { SampleQr } from './SampleQr'
import './Connections.css'

/* Lucide dropped its brand marks, so LinkedIn is drawn here — Lucide's own
   retired glyph, kept to its conventions: the 24-unit grid, 2px strokes and
   round joins of the icons beside it, and no fill, so it sits in the row as
   an outline rather than a solid chip.

   `IconButton` normalises every icon to 1em, which is right for a row of
   them and a touch too generous for this one: the mark is drawn nearly edge
   to edge in its box where Mail and QrCode leave a margin, so at the same
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

/* ---- Page -------------------------------------------------------------- */

export interface ConnectionsProps {
  /** Seeds the page. Notes stay local — Deck has no data layer. */
  connections?: Connection[]
  /** The events on the line above the pile, oldest first. */
  events?: TimelineEvent[]
  /** Which event the page opens on. Defaults to the most recent past one. */
  defaultEventId?: string
  /** ISO date the timeline is read from. Pinned in stories and tests. */
  today?: string
}

/**
 * Recent connections — the cards other people have handed you.
 *
 * One pile, not a grid of tiles. These arrived as objects, a few at a time,
 * and a pile is the only presentation that keeps that true: it says how many
 * without listing them, and it hands you the most recent one face up. A grid
 * would turn a stack of cards from a week of meeting people into a directory.
 *
 * The pile decides its own orientation — portrait on a phone, landscape from
 * `sm` up — so this page only says what is in it.
 *
 * Above it, the events those cards came from. Cards arrive in bursts — a
 * conference, a dinner — and "where did I meet this person" is the question
 * people actually use to find one again, so the timeline is the index and
 * the pile is what it opens. Selecting an event puts that event's cards on
 * the desk; an event nobody has been to yet has an empty desk, which is the
 * honest answer rather than a hidden one.
 *
 * Nothing persists. Notes written here live for as long as the page does.
 */
export function Connections({
  connections = APP_CONNECTIONS,
  events = CONNECTION_EVENTS,
  defaultEventId,
  /* The sample data lives in 2027, so the line needs a present to be read
     from or every event on it is still to come. A caller bringing real
     events brings its own today with them. */
  today = CONNECTIONS_TODAY,
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
        <Stack gap={4}>
          <Heading level={1} size="xl" family="serif">
            Recent connections
          </Heading>
          {/*
            The event's name is in a span of its own because a phone drops
            it: down there the timeline collapses to dots and names the
            selected event in a card immediately below this line, so saying
            it here too is the same words twice, and it costs a second line
            of a sentence that already wraps. On a wider screen there is no
            such card — the name under the dot is small and off to one side
            — so the sentence carries it.
          */}
          <Text tone="muted">
            {pile.length > 0 ? (
              <>
                You have dropped {pile.length}{' '}
                {pile.length === 1 ? 'card' : 'cards'} onto your workspace deck
                {event ? (
                  <span className="connections__from"> from {event.name}</span>
                ) : null}
                .
              </>
            ) : (
              <>
                Nothing on the desk
                <span className="connections__from">
                  {' '}
                  from {event?.name ?? 'this event'}
                </span>{' '}
                yet.
              </>
            )}
          </Text>
        </Stack>

        <EventTimeline
          events={events}
          value={eventId}
          onValueChange={selectEvent}
          today={today}
          className="connections__timeline"
        />

        {/* The pile's own section heading. Hidden, because the page has
            already said what this is and the mockup has nothing there — but
            a real `h2` all the same, since without it the page jumps from
            its `h1` to `PersonCard`'s `h3` and skips a level. */}
        <Heading level={2} size="xs" className="deck-visually-hidden">
          The pile
        </Heading>

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
            /* Named for the event, so a screen reader hears which pile moved
               when the line does. The `key` remounts it: a new pile is a new
               set of cards, not the same one re-sorted, and it should arrive
               squared up rather than mid-swipe from the last event. */
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
                theme={card.theme}
                tagline={card.tagline}
                title={card.title}
                company={card.company}
                location={card.location}
                privateNote={{ hasContent: Boolean(card.note || card.feeling) }}
                flipped={flipped === card.slug}
                onFlippedChange={(next) =>
                  setFlipped(next ? card.slug : null)
                }
                back={
                  <PrivateNote
                    value={card.note ?? ''}
                    onValueChange={(note) => update(card.slug, { note })}
                    feeling={card.feeling}
                    onFeelingChange={(feeling) => update(card.slug, { feeling })}
                    onHide={() => setFlipped(null)}
                  />
                }
                /* No Share among these. The card carries its own, because
                   sharing turns the card over and only the card can do
                   that — same as on My cards. */
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
                  </>
                }
                share={{
                  value: `meetcard.io/${card.slug}`,
                  summary: summaryFor(card),
                  qr: <SampleQr />,
                  onDownloadQr: () => {},
                  onShareLinkedIn: () => {},
                }}
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
    </div>
  )
}
