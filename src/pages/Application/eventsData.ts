import type { AvatarStackPerson } from '../../components/AvatarStack/AvatarStack'
import type { EventScheduleSlot } from '../../components/EventSchedule/EventSchedule'
import type { CardTheme } from '../../components/PersonCard/PersonCard'

/**
 * Your part in an event.
 *
 * A closed set rather than free text, because the three read differently on
 * the page — hosting is a responsibility, speaking is a commitment, attending
 * is neither — and because a list you can filter needs values it can compare.
 */
export type EventInvolvement = 'Attending' | 'Hosting' | 'Speaking'

export interface AppEvent {
  /** Stable key, and the event's own path segment. */
  slug: string
  name: string
  /** ISO 8601 `YYYY-MM-DD`. */
  date: string
  /**
   * Clock times as they should read. Strings, not instants: a happy hour at
   * 5:30 in Boulder is at 5:30 for everyone reading about it.
   */
  time: string
  endTime?: string
  venue: string
  address?: string
  city?: string
  host: string
  hostRole?: string
  involvement: EventInvolvement
  /** Whether it has happened yet. Drives which tab it lands in. */
  status: 'upcoming' | 'past'
  /** The colours the event is branded with — its cover, its thumbnail. */
  theme: CardTheme
  /** Paragraphs. Kept as an array so the page never parses prose. */
  description?: string[]
  expected?: number
  schedule?: EventScheduleSlot[]
  /** Whose cards you came away with. */
  attendees: AvatarStackPerson[]
}

/**
 * The demo events these three screens share.
 *
 * One fixture rather than three, for the reason `AppShell` gives about the
 * signed-in person: an index, a detail page and a form that disagreed about
 * what an event is would be documenting a product that does not exist.
 *
 * Upcoming first and in date order, past most-recent-first — which is the
 * order each tab reads in, and `EventAgenda` renders what it is handed
 * rather than sorting behind the caller's back.
 *
 * Nothing persists. Deck has no data layer.
 */
export const APP_EVENTS: AppEvent[] = [
  {
    slug: 'revops',
    name: 'RevOps Summit',
    date: '2027-05-18',
    time: '9:00 AM',
    endTime: '4:30 PM',
    venue: 'Austin Convention Center',
    address: '500 E Cesar Chavez St',
    city: 'Austin, Texas',
    host: 'Hannah Davis',
    hostRole: 'Community Lead, RevOps Collective',
    involvement: 'Attending',
    status: 'upcoming',
    theme: { primary: '#2E6E5B', accent: '#C66A4A' },
    description: [
      'A full day of operators trading the unglamorous details: routing rules, attribution models, and the spreadsheets nobody admits to running the business on.',
      'Bring cards — the hallway track is the real program.',
    ],
    expected: 420,
    schedule: [
      { time: '9:00 AM', title: 'Doors and coffee' },
      { time: '10:00 AM', title: 'Keynote: Pipeline you can trust' },
      { time: '12:30 PM', title: 'Lunch and card exchange' },
      { time: '2:00 PM', title: 'Breakouts' },
      { time: '4:30 PM', title: 'Closing reception' },
    ],
    attendees: [
      { name: 'Hannah Davis' },
      { name: 'Marcus Lee' },
      { name: 'Priya Shah' },
      { name: 'Diego Romero' },
      { name: 'Lena Fox' },
    ],
  },
  {
    slug: 'climate',
    name: 'Boulder Climate Happy Hour',
    date: '2027-06-16',
    time: '5:30 PM',
    endTime: '8:00 PM',
    venue: 'Rayback Collective',
    address: '2775 Valmont Rd',
    city: 'Boulder, Colorado',
    host: 'Hannah Davis',
    hostRole: 'Community Lead, RevOps Collective',
    involvement: 'Hosting',
    status: 'upcoming',
    theme: { primary: '#3F5E4E', accent: '#E0A458' },
    description: [
      'Drinks on the patio with the people building climate software in the Front Range. No panel, no badge scanner, no agenda past the first round.',
    ],
    expected: 60,
    schedule: [
      { time: '5:30 PM', title: 'Doors' },
      { time: '6:30 PM', title: 'Introductions, two minutes each' },
      { time: '7:00 PM', title: 'Back to the patio' },
    ],
    attendees: [
      { name: 'Mira Okafor' },
      { name: 'Theo Marsh' },
      { name: 'June Park' },
      { name: 'Sam Ortiz' },
    ],
  },
  {
    slug: 'saastr',
    name: 'SaaStr Annual',
    date: '2027-09-09',
    time: '10:00 AM',
    endTime: '6:00 PM',
    venue: 'Moscone West',
    address: '800 Howard St',
    city: 'San Francisco, California',
    host: 'SaaStr',
    involvement: 'Speaking',
    status: 'upcoming',
    theme: { primary: '#2F4858', accent: '#7FA9C4' },
    description: [
      'Three days, four halls, and more lanyards than anyone needs. Find me at the design systems session on Thursday afternoon.',
    ],
    expected: 12000,
    schedule: [
      { time: '10:00 AM', title: 'Doors' },
      { time: '2:00 PM', title: 'Talk: Cards, not contacts', description: 'Hall C' },
      { time: '5:00 PM', title: 'Expo floor close' },
    ],
    attendees: [
      { name: 'Ada Chen' },
      { name: 'Omar Haddad' },
      { name: 'Nia Quinn' },
      { name: 'Ana Blum' },
      { name: 'Dev Patel' },
    ],
  },
  {
    slug: 'founders-dinner',
    name: 'Founders Dinner',
    date: '2027-11-02',
    time: '7:00 PM',
    endTime: '10:00 PM',
    venue: 'The Wayfarer',
    address: '1435 Market St',
    city: 'Denver, Colorado',
    host: 'Alex Rivera',
    hostRole: 'Design Lead, Northwind Studio',
    involvement: 'Hosting',
    status: 'upcoming',
    theme: { primary: '#4A3B5C', accent: '#C9A227' },
    description: [
      'Twelve seats, one long table, and a rule against pitching until the plates are cleared.',
    ],
    expected: 12,
    schedule: [
      { time: '7:00 PM', title: 'Drinks' },
      { time: '7:45 PM', title: 'Sit down' },
      { time: '9:30 PM', title: 'Coffee and cards' },
    ],
    attendees: [
      { name: 'Alex Rivera' },
      { name: 'Pia Rossi' },
      { name: 'Marcus Lee' },
    ],
  },
  {
    slug: 'design-week',
    name: 'Denver Design Week Mixer',
    date: '2027-03-04',
    time: '6:00 PM',
    endTime: '9:00 PM',
    venue: 'Union Hall',
    address: '1750 Wewatta St',
    city: 'Denver, Colorado',
    host: 'AIGA Colorado',
    involvement: 'Attending',
    status: 'past',
    theme: { primary: '#5C3B3B', accent: '#E0A458' },
    description: [
      'The opening night mixer for Denver Design Week — busiest room of the year, and the best one for meeting people you will actually see again.',
    ],
    expected: 300,
    attendees: [
      { name: 'Sam Ortiz' },
      { name: 'Pia Rossi' },
      { name: 'Ana Blum' },
      { name: 'Marcus Lee' },
      { name: 'Dev Patel' },
      { name: 'Rosa Lim' },
      { name: 'Kit Vance' },
    ],
  },
  {
    slug: 'product-camp',
    name: 'Product Camp Rockies',
    date: '2027-02-11',
    time: '8:30 AM',
    endTime: '3:00 PM',
    venue: 'Galvanize Platte',
    address: '1644 Platte St',
    city: 'Denver, Colorado',
    host: 'Ada Chen',
    hostRole: 'Organizer',
    involvement: 'Speaking',
    status: 'past',
    theme: { primary: '#35506B', accent: '#7FA9C4' },
    description: [
      'An unconference — the schedule gets written on a wall at 8:30 and nobody knows what they are going to until they do.',
    ],
    expected: 140,
    schedule: [
      { time: '8:30 AM', title: 'Session pitches' },
      { time: '9:30 AM', title: 'Round one' },
      { time: '1:00 PM', title: 'Round three' },
    ],
    attendees: [
      { name: 'Ada Chen' },
      { name: 'Alex Rivera' },
      { name: 'Lena Fox' },
      { name: 'Omar Haddad' },
    ],
  },
]

/** The day these screens are read from, so "Soon" and the tabs mean something. */
export const TODAY = '2027-05-04'

/** Long-form date — "Tuesday, May 18, 2027". */
export function formatFullDate(date: string, locale?: string): string {
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
}

/** Short-form date — "May 18". */
export function formatShortDate(date: string, locale?: string): string {
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

/**
 * Whether an event is close enough to be worth flagging. Two weeks, because
 * that is roughly when a conference stops being a plan and starts being a
 * thing you need to pack for.
 */
export function isSoon(date: string, today: string): boolean {
  const start = new Date(`${today}T12:00:00`).getTime()
  const when = new Date(`${date}T12:00:00`).getTime()
  if (Number.isNaN(start) || Number.isNaN(when)) return false
  const days = (when - start) / 86_400_000
  return days >= 0 && days <= 14
}

/** Venue and city as one line — "Austin Convention Center, Austin, Texas". */
export function formatPlace(event: AppEvent): string {
  return [event.venue, event.city].filter(Boolean).join(', ')
}
