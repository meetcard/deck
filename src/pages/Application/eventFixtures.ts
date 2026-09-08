import type { EventAttendance } from '../../components/EventRow/EventRow'

/**
 * The events both Application screens describe — the list and the detail
 * page — kept in one place so the two cannot disagree about what RevOps
 * Summit is. Deck has no data layer; a real app passes its own.
 */
export interface AppEvent {
  slug: string
  name: string
  /** ISO 8601 date. */
  date: string
  /** Start time, already phrased — "9:00 AM". */
  time: string
  /** End time, where the event has one. */
  endTime?: string
  venue: string
  /** City and state, for the list's fuller line. */
  city?: string
  /** Street address, for the detail page's place tile. */
  address?: string
  attendance: EventAttendance
  coverSrc?: string
  host?: { name: string; detail?: string }
  /** People you already know who are going. */
  going?: string[]
  /** People whose cards you came away with. */
  exchanged?: string[]
  /** What it is, in the organiser's words. */
  about?: string[]
  /** How many the organiser expects. */
  expected?: number
  schedule?: { time: string; title: string }[]
}

/**
 * A stand-in for a cover photograph, drawn rather than fetched so the
 * screens are deterministic in Chromatic and work offline. Deliberately
 * pale: a bright picture is the hard case for the hero's scrim.
 */
function demoCover(base: string, a: string, b: string): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="320">` +
        `<rect width="560" height="320" fill="${base}"/>` +
        `<circle cx="150" cy="90" r="140" fill="${a}"/>` +
        `<circle cx="440" cy="250" r="170" fill="${b}"/>` +
        `<rect x="250" y="30" width="110" height="260" fill="${a}" opacity="0.6"/>` +
        `</svg>`,
    )
  )
}

const COVERS = {
  revops: demoCover('#fdfbf7', '#ffe9c7', '#dbeee4'),
  climate: demoCover('#f7fbf9', '#d8ece1', '#eef3d9'),
  saastr: demoCover('#fbf8fd', '#e6dcf2', '#ffe4d6'),
}

/** The sample data lives in 2027, so the list needs a present to split around. */
export const TODAY = '2027-05-04'

export const EVENTS: AppEvent[] = [
  {
    slug: 'revops-summit',
    name: 'RevOps Summit',
    date: '2027-05-18',
    time: '9:00 AM',
    endTime: '4:30 PM',
    venue: 'Austin Convention Center',
    city: 'Austin, Texas',
    address: '500 E Cesar Chavez St, Austin, Texas',
    attendance: 'attending',
    coverSrc: COVERS.revops,
    host: { name: 'Hannah Davis', detail: 'Community Lead, RevOps Collective' },
    going: ['Hannah Davis', 'Marcus Lee', 'Priya Shah'],
    expected: 420,
    about: [
      'A full day of operators trading the unglamorous details: routing rules, attribution models, and the spreadsheets nobody admits to running the business on.',
      'Bring cards — the hallway track is the real program.',
    ],
    schedule: [
      { time: '9:00 AM', title: 'Doors and coffee' },
      { time: '10:00 AM', title: 'Keynote: Pipeline you can trust' },
      { time: '12:30 PM', title: 'Lunch and card exchange' },
      { time: '2:00 PM', title: 'Breakouts' },
      { time: '4:30 PM', title: 'Closing reception' },
    ],
  },
  {
    slug: 'boulder-climate',
    name: 'Boulder Climate Happy Hour',
    date: '2027-06-16',
    time: '5:30 PM',
    venue: 'Rayback Collective',
    city: 'Boulder, Colorado',
    address: '2775 Valmont Rd, Boulder, Colorado',
    attendance: 'hosting',
    coverSrc: COVERS.climate,
    host: { name: 'Alex Rivera', detail: 'Design Lead, Northwind Studio' },
    going: ['Hannah Davis'],
    expected: 60,
    about: [
      'Drinks on the patio with the people building climate tools in the Front Range. No panel, no slides.',
    ],
  },
  {
    slug: 'saastr-annual',
    name: 'SaaStr Annual',
    date: '2027-09-09',
    time: '10:00 AM',
    endTime: '6:00 PM',
    venue: 'Moscone West',
    city: 'San Francisco, California',
    address: '800 Howard St, San Francisco, California',
    attendance: 'speaking',
    coverSrc: COVERS.saastr,
    host: { name: 'SaaStr', detail: 'Conference' },
    expected: 12_000,
    about: [
      'The big one. Three halls, a thousand conversations, and a badge scanner you will want to leave in your bag.',
    ],
    schedule: [
      { time: '10:00 AM', title: 'Opening remarks' },
      { time: '11:30 AM', title: 'Panel: What operators actually measure' },
      { time: '2:00 PM', title: 'Your session: Designing for the handshake' },
    ],
  },
  {
    slug: 'founders-dinner',
    name: 'Founders Dinner',
    date: '2027-11-02',
    time: '7:00 PM',
    venue: 'The Wayfarer',
    city: 'Denver, Colorado',
    address: '1600 15th St, Denver, Colorado',
    attendance: 'hosting',
    host: { name: 'Alex Rivera', detail: 'Design Lead, Northwind Studio' },
    expected: 12,
    about: ['Six to a table, one long conversation, no name badges.'],
  },
  {
    slug: 'frontend-denver',
    name: 'Frontend Denver',
    date: '2027-02-11',
    time: '6:00 PM',
    venue: 'Industry RiNo',
    city: 'Denver, Colorado',
    address: '3001 Brighton Blvd, Denver, Colorado',
    attendance: 'attending',
    host: { name: 'Mira Okafor', detail: 'Organiser' },
    exchanged: ['Mira Okafor', 'Theo Marsh', 'June Park', 'Sam Ortiz'],
    about: ['Two talks and a long hallway track.'],
  },
  {
    slug: 'saas-north',
    name: 'SaaS North',
    date: '2026-11-19',
    time: '9:30 AM',
    endTime: '5:00 PM',
    venue: 'Shaw Centre',
    city: 'Ottawa, Ontario',
    address: '55 Colonel By Dr, Ottawa, Ontario',
    attendance: 'attending',
    host: { name: 'SaaS North', detail: 'Conference' },
    exchanged: [
      'Ada Chen',
      'Owen Hale',
      'Nora Quinn',
      'Arlo Bennett',
      'Dev Patel',
    ],
    about: ['Canada’s SaaS conference, in the cold.'],
  },
]

/** Parsed as local noon so a UTC offset can't roll the date over a boundary. */
export function parseISODate(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

/**
 * Days between two dates, floored. Used only to decide whether an event is
 * close enough to badge, so a whole-day resolution is the right one.
 */
export function daysUntil(date: string, today: string): number {
  const ms = parseISODate(date).getTime() - parseISODate(today).getTime()
  return Math.floor(ms / 86_400_000)
}

/** "Tuesday, May 18, 2027" in the viewer's locale. */
export function formatLongDate(date: string): string {
  return parseISODate(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
