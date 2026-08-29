import { useState } from 'react'
import { CalendarDays, Handshake, Mail, Share2 } from 'lucide-react'
import { Button } from '../../components/Button/Button'
import { CardPile } from '../../components/CardPile/CardPile'
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

const INITIAL: Connection[] = [
  {
    slug: 'ben@meetcard',
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
    name: 'Grace Okafor',
    tagline: 'Ask me about supply chains.',
    title: 'Head of Operations',
    company: 'Sextant',
    location: 'Denver, Colorado',
  },
  {
    slug: 'mika@ply',
    name: 'Mika Tanaka',
    tagline: 'Always three prototypes deep.',
    title: 'Principal Engineer',
    company: 'Ply',
    location: 'Seattle, Washington',
  },
]

/* ---- Page -------------------------------------------------------------- */

export interface ConnectionsProps {
  /** Seeds the page. Notes stay local — Deck has no data layer. */
  connections?: Connection[]
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
 * Nothing persists. Notes written here live for as long as the page does.
 */
export function Connections({ connections = INITIAL }: ConnectionsProps) {
  const [cards, setCards] = useState<Connection[]>(connections)
  const [index, setIndex] = useState(0)
  /** Which card is turned over, by slug — at most one at a time. */
  const [flipped, setFlipped] = useState<string | null>(null)

  const update = (slug: string, patch: Partial<Connection>) =>
    setCards((all) =>
      all.map((card) => (card.slug === slug ? { ...card, ...patch } : card)),
    )

  return (
    <div className="connections">
      <Stack gap={24} className="connections__container">
        <Stack gap={4}>
          <Heading level={1} size="xl" family="serif">
            Recent connections
          </Heading>
          <Text tone="muted">
            You have dropped {cards.length}{' '}
            {cards.length === 1 ? 'card' : 'cards'} onto your workspace deck.
          </Text>
        </Stack>

        {/* The pile's own section heading. Hidden, because the page has
            already said what this is and the mockup has nothing there — but
            a real `h2` all the same, since without it the page jumps from
            its `h1` to `PersonCard`'s `h3` and skips a level. */}
        <Heading level={2} size="xs" className="deck-visually-hidden">
          The pile
        </Heading>

        <CardPile
          label="Recent connections"
          activeIndex={index}
          onActiveIndexChange={setIndex}
          className="connections__pile"
        >
          {cards.map((card) => (
            <PersonCard
              key={card.slug}
              name={card.name}
              avatarSrc={card.avatarSrc}
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
      </Stack>
    </div>
  )
}
