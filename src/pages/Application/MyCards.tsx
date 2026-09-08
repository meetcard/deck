import { useMemo, useState } from 'react'
import { Pencil, Plus, QrCode } from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { CardIndex } from '../../components/CardIndex/CardIndex'
import { CardPile } from '../../components/CardPile/CardPile'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { Input } from '../../components/Input/Input'
import { PersonCard } from '../../components/PersonCard/PersonCard'
import { Select } from '../../components/Select/Select'
import { ShareSheet } from '../../components/ShareSheet/ShareSheet'
import { Sheet } from '../../components/Sheet/Sheet'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import './MyCards.css'

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

/* ---- Page -------------------------------------------------------------- */

export interface MyCardsProps {
  /** Seeds the page. Edits stay local — Deck has no data layer. */
  cards?: MyCard[]
  /** Opens the share sheet on mount, for stories. */
  shareOpen?: boolean
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
 * The list under the pile is `CardIndex`, the same component the Connections
 * pile is indexed with. Both pages ask one question — which of these is on
 * top, and how do I get to another — and answering it twice is how two lists
 * end up disagreeing about what "current" looks like.
 *
 * Three deviations from the product's own screen, all deliberate:
 *
 * - The "All cards" rows select the card in the pile rather than linking to
 *   `/cards/<slug>`. That route does not exist here, and a dead link is worse
 *   than a working selection.
 * - Every row's edit control is visible, where the product reveals it on
 *   hover. Hover does not exist on a phone, and a control that appears only
 *   for a mouse is a control half the people using this cannot find.
 * - No portrait/landscape toggle. Orientation is not a property of a card
 *   here; the pile picks it from the space it has — portrait on a phone,
 *   landscape from `sm` up — and both are the same 3.5x2in object turned.
 *   A control that let you pin one would be offering a choice the room has
 *   already made.
 */
export function MyCards({ cards: seed = INITIAL, shareOpen = false }: MyCardsProps) {
  const [cards, setCards] = useState<MyCard[]>(seed)
  const [index, setIndex] = useState(0)
  const [editing, setEditing] = useState(false)
  const [sharing, setSharing] = useState(shareOpen)
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
              tone="brand"
              className="my-cards__eyebrow"
            >
              Your cards
            </Heading>
            <Text size="sm" tone="muted">
              {index + 1} / {cards.length}
            </Text>
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
                eyebrow={card.kind}
                name={card.name}
                tagline={card.tagline}
                title={card.title}
                company={card.company}
                location={card.location}
                footer={
                  <>
                    <Button size="sm" iconStart={<QrCode />} onClick={() => setSharing(true)}>
                      Share card
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      iconStart={<Pencil />}
                      aria-expanded={editing}
                      onClick={() => setEditing((open) => !open)}
                    >
                      Edit card
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
          <Heading
            level={2}
            size="xs"
            tone="muted"
            className="my-cards__eyebrow"
          >
            All cards
          </Heading>

          {/*
            The same component the Connections pile is indexed with. Both
            pages ask the same question — which of these is on top, and how
            do I get to another one — and answering it twice is how two lists
            end up disagreeing about what "current" looks like.

            Selecting a row moves the pile rather than following a link: the
            product routes to /cards/<slug>, there is no such route here, and
            a dead href is worse than a working selection.
          */}
          <CardIndex
            layout="rows"
            label="All cards"
            value={active?.slug}
            onValueChange={(slug) =>
              setIndex(cards.findIndex((card) => card.slug === slug))
            }
            items={cards.map((card) => ({
              id: card.slug,
              name: card.name,
              badge: <Badge tone="neutral" size="sm">{card.kind}</Badge>,
              detail:
                [card.title, card.company].filter(Boolean).join(' at ') ||
                linkFor(card),
              /* Edit *this* card, not whichever is showing — so the row
                 brings its card to the top on the way to the editor. */
              action: (
                <IconButton
                  label={`Edit ${card.kind.toLowerCase()} card`}
                  icon={<Pencil />}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIndex(cards.findIndex((one) => one.slug === card.slug))
                    setEditing(true)
                  }}
                />
              ),
            }))}
          />
        </Stack>
      </Stack>

      <ShareSheet
        open={sharing}
        onClose={() => setSharing(false)}
        value={linkFor(active)}
      />

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
