import type { CardCompanyProfile, CardTheme } from '../../components/PersonCard/PersonCard'
import { SampleQr } from './SampleQr'

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

export const CARD_KINDS: MyCardKind[] = ['Business', 'Personal']

/*
 * A palette per kind of card, not per person.
 *
 * The work card carries the brand you work under; the personal one is
 * deliberately quieter, a warm graphite that reads as the same object off duty
 * rather than as a second company. In the product these come from whatever the
 * card is branded with — a company's colours, uploaded with its mark — and the
 * page only has to hand them to the card.
 */
export const CARD_THEMES: Record<MyCardKind, CardTheme> = {
  Business: { primary: '#2E6E5B', accent: '#C66A4A' },
  Personal: { primary: '#3A3F3D', accent: '#9A8F82' },
}

/**
 * The signed-in person's own cards.
 *
 * Alex Rivera is who `AppShell` says is signed in, and these are the two slugs
 * the account drawer lists. One fixture rather than one per screen, for the
 * reason `eventsData` gives about events: a dashboard, a card editor and a
 * drawer that disagreed about who you are would be documenting a product that
 * does not exist.
 *
 * The Business card is first because it is the default — the one the dashboard
 * shows and the one the drawer marks.
 */
export const MY_CARDS: MyCard[] = [
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

export const linkFor = (card: Pick<MyCard, 'slug'>) => `meetcard.io/${card.slug}`

/**
 * The line a recipient reads before deciding to follow the link. Who, and
 * what they do — the same two facts the card leads with.
 *
 * Structural rather than typed to one card: your cards and other people's are
 * different models with the same three fields, and the summary is about the
 * fields.
 */
export const summaryFor = (card: {
  name: string
  title?: string
  company?: string
}) =>
  [card.name, [card.title, card.company].filter(Boolean).join(' at ')]
    .filter(Boolean)
    .join(', ')

/**
 * The company behind the work card, reachable from its name.
 *
 * Its own link and its own snapshot: sharing from here hands over the company,
 * not the person who happens to be showing it.
 */
export const NORTHWIND: CardCompanyProfile = {
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
