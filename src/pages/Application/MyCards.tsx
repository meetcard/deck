import { useMemo, useState } from 'react'
import {
  Calendar,
  Handshake,
  Mail,
  MessageSquare,
  Phone,
  Plus,
} from 'lucide-react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { CardPile } from '../../components/CardPile/CardPile'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { Input } from '../../components/Input/Input'
import { PersonCard } from '../../components/PersonCard/PersonCard'
import type { CardTheme } from '../../components/PersonCard/PersonCard'
import { Select } from '../../components/Select/Select'
import { Sheet } from '../../components/Sheet/Sheet'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import { cx } from '../../lib/cx'
import { sampleQrMatrixSvg } from '../../components/QRCode/sampleQrMatrix'
import './MyCards.css'

/* Deck encodes nothing — `QRCode` draws a plate around a matrix you supply.
   This is the sample one the QRCode stories use, so the page shows a real
   code rather than a grey square pretending to be one. */
const SampleQr = () => (
  <span
    style={{ display: 'block', width: '100%', height: '100%' }}
    dangerouslySetInnerHTML={{ __html: sampleQrMatrixSvg }}
  />
)

/* Lucide has no LinkedIn glyph — it is a trademark, and Lucide ships none.
   Traced to match the set it sits with, in `em` so it holds at whatever size
   the card gives it. Same drawing as the one on Connections. */
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

/**
 * Which of your cards this is.
 *
 * `kind` rather than `variant`: the system already spends `variant` on visual
 * treatment (Button, Badge, ChoiceGroup), and this is not that — it is which
 * of your selves you are handing over.
 */
export type MyCardKind = 'Business' | 'Personal'

export interface MyCard {
  /** Stable key, and the card's public slug — "ben@meetcard". */
  slug: string
  kind: MyCardKind
  name: string
  tagline?: string
  /**
   * Role. `PersonCard` and `ContactCard` both call this `title`; only
   * `Exchange` says `role`, and that disagreement should not spread.
   */
  title?: string
  company?: string
  location?: string
}

const KINDS: MyCardKind[] = ['Business', 'Personal']

/*
 * A palette per kind of card, not per person.
 *
 * The work card carries the brand you work under; the personal one is
 * deliberately quieter, a warm graphite that reads as the same object off duty
 * rather than as a second company. In the product these come from whatever the
 * card is branded with — a company's colours, uploaded with its mark — and the
 * page only has to hand them to the card.
 */
const THEMES: Record<MyCardKind, CardTheme> = {
  Business: { primary: '#2E6E5B', accent: '#C66A4A' },
  Personal: { primary: '#3A3F3D', accent: '#9A8F82' },
}

/** Alex Rivera is the signed-in person everywhere else in the shell. */
const INITIAL: MyCard[] = [
  {
    slug: 'alex@northwind',
    kind: 'Business',
    name: 'Alex Rivera',
    tagline: "Let's find the overlap.",
    title: 'Design Lead',
    company: 'Northwind Studio',
    location: 'Boulder, Colorado',
  },
  {
    slug: 'alex',
    kind: 'Personal',
    name: 'Alex Rivera',
    tagline: 'Off the clock.',
    title: 'Personal profile',
    location: 'Boulder, Colorado',
  },
]

const linkFor = (card: MyCard) => `meetcard.io/${card.slug}`

/* The line a recipient reads before deciding to follow the link. Who, and
   what they do — the same two facts the card leads with. */
const summaryFor = (card: MyCard) =>
  [card.name, [card.title, card.company].filter(Boolean).join(' at ')]
    .filter(Boolean)
    .join(', ')

/*
 * The company behind the work card, reachable from its name.
 *
 * Its own link and its own snapshot: sharing from here hands over the
 * company, not the person who happens to be showing it.
 */
const COMPANY = {
  name: 'Northwind Studio',
  headline: 'Meet people. Remember them.',
  description:
    'Northwind turns in-person introductions into durable professional relationships — one card, one conversation at a time.',
  website: 'northwind.studio',
  location: 'Boulder, CO',
  linkedInHref: 'https://www.linkedin.com/company/northwind-studio',
  people: [
    { name: 'Alex Rivera' },
    { name: 'Priya Nair' },
    { name: 'Tom Okonkwo' },
  ],
  peopleTotal: 12,
  share: {
    value: 'meetcard.io/@northwind',
    summary: 'Northwind Studio',
    qr: <SampleQr />,
    onDownloadQr: () => {},
    onShareLinkedIn: () => {},
  },
}

/* ---- Page -------------------------------------------------------------- */

export interface MyCardsProps {
  /** Seeds the page. Edits stay local — Deck has no data layer. */
  cards?: MyCard[]
}

/**
 * My cards — how you appear when you share.
 *
 * The pile is the point: these are objects you hand over, so they are shown as
 * the artifact rather than as rows in a settings form. Editing sits directly
 * beneath the card it changes and updates it as you type, because the question
 * a person actually has here is "what will they see", and answering it in a
 * separate preview pane is answering it late.
 *
 * Nothing persists. Deck has no data layer, and a page that pretended
 * otherwise would be documenting a promise the system cannot keep.
 *
 * Two deviations from the product's own screen, both deliberate:
 *
 * - The "All cards" rows select the card in the pile rather than linking to
 *   `/cards/<slug>`. That route does not exist here, and a dead link is worse
 *   than a working selection.
 * - No portrait/landscape toggle. Orientation is not a property of a card
 *   here; the pile picks it from the space it has — portrait on a phone,
 *   landscape from `sm` up — and both are the same 3.5x2in object turned.
 *   A control that let you pin one would be offering a choice the room has
 *   already made.
 */
export function MyCards({ cards: seed = INITIAL }: MyCardsProps) {
  const [cards, setCards] = useState<MyCard[]>(seed)
  const [index, setIndex] = useState(0)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [draftKind, setDraftKind] = useState<MyCardKind>('Business')
  const [draftName, setDraftName] = useState('')

  const active = cards[index] ?? cards[0]

  const update = (field: keyof MyCard, value: string) =>
    setCards((all) =>
      all.map((card, i) => (i === index ? { ...card, [field]: value } : card)),
    )

  const create = () => {
    const name = draftName.trim() || 'New card'
    const next: MyCard = {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      kind: draftKind,
      name,
    }
    setCards((all) => [...all, next])
    // Land on what was just made, which is the only reason the pile needs a
    // controlled index at all.
    setIndex(cards.length)
    setCreating(false)
    setDraftName('')
    setEditing(true)
  }

  const fields = useMemo(
    () =>
      [
        { key: 'name', label: 'Name' },
        { key: 'tagline', label: 'Tagline' },
        { key: 'title', label: 'Title' },
        { key: 'company', label: 'Company' },
        { key: 'location', label: 'Location' },
      ] as const,
    [],
  )

  return (
    <div className="my-cards">
      <Stack gap={32} className="my-cards__container">
        <div className="my-cards__top">
          <Stack gap={4}>
            <Heading level={1} size="xl" family="serif">
              My cards
            </Heading>
            <Text tone="muted">How you appear when you share.</Text>
          </Stack>
          <Button iconStart={<Plus />} onClick={() => setCreating(true)}>
            New
          </Button>
        </div>

        <Stack gap={12}>
          <div className="my-cards__section-heading">
            <Heading
              level={2}
              size="xs"
              className="my-cards__eyebrow my-cards__eyebrow--brand"
            >
              Your cards
            </Heading>
          </div>

          <CardPile
            label="Your cards"
            activeIndex={index}
            onActiveIndexChange={setIndex}
            className="my-cards__pile"
          >
            {cards.map((card) => (
              <PersonCard
                key={card.slug}
                name={card.name}
                kind={card.kind}
                theme={THEMES[card.kind]}
                tagline={card.tagline}
                title={card.title}
                company={card.company}
                location={card.location}
                /* The pencil is on the card because the card is the thing it
                   edits, and the editor opens directly beneath it. */
                onEdit={() => setEditing((open) => !open)}
                editLabel={editing ? 'Close card editor' : 'Edit card'}
                /* No Share here. The card carries its own, because sharing
                   turns the card over and only the card can do that. */
                contactActions={
                  <>
                    <IconButton label={`Call ${card.name}`} icon={<Phone />} round />
                    <IconButton
                      label={`Message ${card.name}`}
                      icon={<MessageSquare />}
                      round
                    />
                    <IconButton label={`Email ${card.name}`} icon={<Mail />} round />
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
                  card.company === COMPANY.name ? COMPANY : undefined
                }
                footer={
                  <>
                    <Button iconStart={<Calendar />}>Book a time</Button>
                    {/* Disabled, and honestly so: exchanging cards takes two
                        people, and this is your own card in your own hand. */}
                    <Button variant="secondary" iconStart={<Handshake />} disabled>
                      Exchange cards
                    </Button>
                  </>
                }
              />
            ))}
          </CardPile>
        </Stack>

        {editing ? (
          <Stack gap={16} className="my-cards__editor">
            <Text size="xs" tone="muted" className="my-cards__eyebrow">
              Edit card details
            </Text>
            <div className="my-cards__fields">
              {fields.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  value={active[field.key] ?? ''}
                  onChange={(event) => update(field.key, event.target.value)}
                />
              ))}
            </div>
            <Text size="sm" tone="muted">
              {linkFor(active)} · changes save as you type
            </Text>
          </Stack>
        ) : null}

        <Stack gap={12}>
          <Heading level={2} size="xs" className="my-cards__eyebrow">
            All cards
          </Heading>
          <ul className="my-cards__list">
            {cards.map((card, i) => (
              <li key={card.slug}>
                {/*
                  A button, not a link. The product routes to /cards/<slug>;
                  there is no such route here, and moving the pile is both
                  honest and more useful than a href that goes nowhere.
                */}
                <button
                  type="button"
                  className={cx(
                    'my-cards__row',
                    i === index && 'my-cards__row--active',
                  )}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => setIndex(i)}
                >
                  <Avatar name={card.name} size="sm" decorative />
                  <span className="my-cards__row-text">
                    <span className="my-cards__row-name">
                      <Text as="span" weight="medium">
                        {card.name}
                      </Text>
                      <Badge tone="neutral">{card.kind}</Badge>
                    </span>
                    <Text as="span" size="sm" tone="muted">
                      {[card.title, card.company].filter(Boolean).join(' at ') ||
                        linkFor(card)}
                    </Text>
                  </span>
                  {/* The row for the card on top of the pile says so in
                      words. It is the one row whose state a colour alone
                      would have to carry, and "Showing" is shorter than any
                      legend explaining a highlight. */}
                  {i === index ? (
                    <span className="my-cards__row-showing">Showing</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </Stack>
      </Stack>

      {/* Only a kind and a name. Everything else is a field on the card you
          are about to be looking at, so asking for it twice is asking twice. */}
      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="New card"
        description="You can fill in the rest on the card itself."
        footer={
          <Button fullWidth onClick={create}>
            Create card
          </Button>
        }
      >
        <Stack gap={16}>
          <Select
            label="Kind"
            value={draftKind}
            onChange={(event) => setDraftKind(event.target.value as MyCardKind)}
            options={KINDS.map((kind) => ({ value: kind, label: kind }))}
          />
          <Input
            label="Name"
            value={draftName}
            placeholder="Alex Rivera"
            onChange={(event) => setDraftName(event.target.value)}
          />
        </Stack>
      </Sheet>
    </div>
  )
}
