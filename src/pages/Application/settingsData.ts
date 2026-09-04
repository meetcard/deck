/**
 * The one account every Settings panel describes.
 *
 * Alex Rivera at Northwind Studio, the same person `AppShell` puts in the
 * avatar and `MyCards` puts on the pile. The panels agree with each other by
 * reading from here rather than each inventing a plausible person: a Settings
 * area where Profile and Team disagree about your own email is worse than one
 * with no data at all, because it looks like it works.
 *
 * Nothing here persists. Deck has no data layer — every panel seeds local
 * state from these and forgets it when the page goes away.
 */

/** The sections the nav offers, and the routes the product uses for them. */
export type SettingsSectionId =
  | '/settings/profile'
  | '/settings/account'
  | '/settings/notifications'
  | '/settings/billing'
  | '/settings/billing/plans'
  | '/settings/company'
  | '/settings/integrations'
  | '/settings/team'

export const SETTINGS_SECTION_IDS: readonly SettingsSectionId[] = [
  '/settings/profile',
  '/settings/account',
  '/settings/notifications',
  '/settings/billing',
  '/settings/billing/plans',
  '/settings/company',
  '/settings/integrations',
  '/settings/team',
]

export const isSettingsSectionId = (
  value: string | null,
): value is SettingsSectionId =>
  SETTINGS_SECTION_IDS.includes(value as SettingsSectionId)

/* ---- The signed-in person ---------------------------------------------- */

export const ACCOUNT = {
  firstName: 'Alex',
  lastName: 'Rivera',
  name: 'Alex Rivera',
  email: 'alex@northwind.studio',
  phone: '+1 (720) 555-0142',
  website: 'northwind.studio',
  bio: "Let's find the overlap.",
  location: 'Boulder, Colorado',
  linkedin: 'in/alexrivera',
  github: 'alexrivera',
  timeZone: 'America/Denver',
}

/** The company Alex's business card is branded with. */
export const COMPANY = {
  name: 'Northwind Studio',
  slug: 'northwind',
  website: 'northwind.studio',
  linkedin: 'company/northwind-studio',
  description:
    'Northwind Studio designs the systems behind products people trust.',
  role: 'Design Lead',
  department: 'Design',
  workEmail: 'alex@northwind.studio',
  /* The same pair `MyCards` brands the Business card with. A company's
     colours live in one place or they drift. */
  primary: '#2E6E5B',
  primaryName: 'Signal Green',
  accent: '#C66A4A',
  accentName: 'Warm Clay',
}

/* ---- Cards -------------------------------------------------------------- */

export interface SettingsCard {
  /** Stable key, and the card's public slug. */
  id: 'business' | 'personal'
  label: string
  slug: string
  tagline: string
  title: string
  workplace: string
  location: string
  /** Why this card's URL is shaped the way it is. */
  slugHint: string
}

export const CARDS: SettingsCard[] = [
  {
    id: 'business',
    label: 'Business',
    slug: 'alex@northwind',
    tagline: "Let's find the overlap.",
    title: 'Design Lead',
    workplace: COMPANY.name,
    location: ACCOUNT.location,
    slugHint: 'Business cards use the name@company format.',
  },
  {
    id: 'personal',
    label: 'Personal',
    slug: 'alex',
    tagline: 'Off the clock.',
    title: 'Personal profile',
    workplace: '',
    location: ACCOUNT.location,
    slugHint: 'Personal cards are just your handle.',
  },
]

/* ---- Team --------------------------------------------------------------- */

export type TeamRole = 'Admin' | 'Member'

export interface TeamMember {
  id: string
  /** Absent while an invitation is outstanding — there is no name yet. */
  name?: string
  email: string
  role: TeamRole
  status: 'Active' | 'Invited'
  /** The signed-in person, marked "You" in the list. */
  isYou?: boolean
  /** Which calendar their bookings land on, if they have enabled one. */
  calendar?: 'Google Calendar' | 'Outlook Calendar'
}

export const TEAM: TeamMember[] = [
  {
    id: 'alex',
    name: ACCOUNT.name,
    email: ACCOUNT.email,
    role: 'Admin',
    status: 'Active',
    isYou: true,
    calendar: 'Google Calendar',
  },
  {
    id: 'sam',
    name: 'Sam Oyelaran',
    email: 'sam@northwind.studio',
    role: 'Admin',
    status: 'Active',
    calendar: 'Outlook Calendar',
  },
  {
    id: 'prisha',
    name: 'Prisha Nair',
    email: 'prisha@northwind.studio',
    role: 'Member',
    status: 'Active',
    calendar: 'Google Calendar',
  },
  {
    id: 'maya',
    name: 'Maya Sorensen',
    email: 'maya@northwind.studio',
    role: 'Member',
    status: 'Active',
  },
  {
    id: 'dana',
    email: 'dana@northwind.studio',
    role: 'Member',
    status: 'Invited',
  },
]

/**
 * Seats bought — which is not the same as seats filled. How many are in use
 * is `TEAM.length`, and deriving it rather than storing it is what keeps
 * Billing and Team from disagreeing about the same number.
 */
export const SEATS = { total: 10, pricePerSeat: 9, minimum: 3 }
