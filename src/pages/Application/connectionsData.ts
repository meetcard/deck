import type { TimelineEvent } from '../../components/EventTimeline/EventTimeline'
import type { CardTheme } from '../../components/PersonCard/PersonCard'
import type { ConnectionFeeling } from '../../components/PrivateNote/PrivateNote'

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
  /**
   * The colours their card is branded with. Someone else's card is the one
   * place a palette is not yours to choose, so the page carries whatever came
   * with the card rather than tinting everyone the same green.
   */
  theme?: CardTheme
  /** What you wrote on the back of their card, if anything. */
  note?: string
  feeling?: ConnectionFeeling
  /**
   * How long ago the card arrived, as it should read — "2h", "Yesterday".
   * A display string rather than a timestamp: the pile is ordered by arrival
   * and nothing here needs to do arithmetic on it, and a fixture that carried
   * real instants would go stale the day after it was written.
   */
  arrived?: string
}

/*
 * The events these cards came from. Dated either side of the line's "today"
 * so the sample shows all three of a timeline's states at once — one behind,
 * one selected, one still ahead — which is also what the mockups show.
 */
export const CONNECTION_EVENTS: TimelineEvent[] = [
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

/**
 * The cards other people have handed you.
 *
 * Newest first, which is the order a pile is in and the order the dashboard
 * reads the top of. One fixture rather than one per screen: the dashboard
 * summarises this pile, so a second copy of it would be a summary of
 * something else.
 */
export const APP_CONNECTIONS: Connection[] = [
  {
    slug: 'ben@meetcard',
    theme: { primary: '#2E6E5B', accent: '#C66A4A' },
    eventId: 'founders-dinner',
    name: 'Ben Ackles',
    tagline: 'What a lovable guy',
    title: 'Builder',
    company: 'MeetCard',
    location: 'Boulder, Colorado',
    note: 'Met at the Front Range meetup — wants to talk about the deck metaphor.',
    feeling: 'hot',
    arrived: '2h',
  },
  {
    slug: 'grace@sextant',
    theme: { primary: '#2F4858', accent: '#E0A458' },
    eventId: 'founders-dinner',
    name: 'Grace Okafor',
    tagline: 'Ask me about supply chains.',
    title: 'Head of Operations',
    company: 'Sextant',
    location: 'Denver, Colorado',
    arrived: 'Yesterday',
  },
  {
    slug: 'mika@ply',
    theme: { primary: '#4A3B5C', accent: '#C9A227' },
    eventId: 'founders-dinner',
    name: 'Mika Tanaka',
    tagline: 'Always three prototypes deep.',
    title: 'Principal Engineer',
    company: 'Ply',
    location: 'Seattle, Washington',
    arrived: 'Mon',
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
    arrived: 'Sep 9',
  },
  {
    slug: 'devon@northbound',
    eventId: 'saastr-annual',
    name: 'Devon Iyer',
    tagline: 'Runs on conference coffee.',
    title: 'Founder',
    company: 'Northbound',
    location: 'Austin, Texas',
    arrived: 'Sep 9',
  },
]

/** The day these screens are read from, so the timeline has a present. */
export const CONNECTIONS_TODAY = '2027-12-01'

/** The event a connection came from, by id. */
export function eventFor(
  connection: Connection,
  events: TimelineEvent[] = CONNECTION_EVENTS,
): TimelineEvent | undefined {
  return events.find((event) => event.id === connection.eventId)
}
