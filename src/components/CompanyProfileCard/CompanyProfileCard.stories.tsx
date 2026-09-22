import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { IconButton } from '../IconButton/IconButton'
import { CompanyProfileCard } from './CompanyProfileCard'

const COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="320">
       <rect width="560" height="320" fill="#dbeee4"/>
       <path d="M0 210 L120 90 L210 170 L300 60 L420 180 L560 110 L560 320 L0 320 Z" fill="#a9cdb9"/>
       <rect y="240" width="560" height="80" fill="#6f9d7f"/>
     </svg>`,
  )

/** A wordmark in the shape of a real one: white, wide, and transparent. */
const WORDMARK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="48" viewBox="0 0 184 48">
       <rect x="2" y="8" width="22" height="32" rx="4" fill="#faf8f4" opacity="0.7"/>
       <rect x="12" y="4" width="22" height="32" rx="4" fill="#faf8f4"/>
       <text x="44" y="33" font-family="Inter, sans-serif" font-size="24" font-weight="600" fill="#faf8f4">MeetCard</text>
     </svg>`,
  )

const icon = (d: string) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Globe = () => icon('M8 1.75a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5ZM1.75 8h12.5M8 1.75c1.8 2 1.8 10.5 0 12.5M8 1.75c-1.8 2-1.8 10.5 0 12.5')
const Pin = () => icon('M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 9.8 8 14 8 14Z')
const In = () => icon('M3 6.5v6M3 3.5v.01M6.5 12.5v-6M6.5 9c0-1.5 1-2.5 2.5-2.5S11.5 7.5 11.5 9v3.5')
const Qr = () => icon('M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h1.5M13.5 9.5v4M9.5 13.5h2')
const Back = () => icon('M10 3.5 5.5 8l4.5 4.5')
const Expand = () => icon('M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9')

const PEOPLE = [
  { name: 'Hannah Davis' },
  { name: 'Marcus Chen' },
  { name: 'Priya Raman' },
  ...Array.from({ length: 9 }, (_, i) => ({ name: `Colleague ${i + 1}` })),
]

const meta = {
  component: CompanyProfileCard,
  title: 'Build/Organisms/CompanyProfileCard',
  tags: ['organism'],
  args: {
    name: 'MeetCard',
    logoSrc: WORDMARK,
    coverSrc: COVER,
    tagline: 'Meet people. Remember them.',
    description:
      'MeetCard turns in-person introductions into durable professional connections.',
    links: [
      { icon: <Globe />, label: 'meetcard.io', href: 'https://meetcard.io' },
      { icon: <Pin />, label: 'Boulder, CO' },
      {
        icon: <In />,
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/meetcard',
        iconOnly: true,
      },
      { icon: <Qr />, label: 'Share' },
    ],
    people: PEOPLE,
    actions: (
      <>
        <IconButton label="Back" icon={<Back />} variant="secondary" size="sm" />
        <IconButton label="Expand card" icon={<Expand />} variant="secondary" size="sm" />
      </>
    ),
  },
} satisfies Meta<typeof CompanyProfileCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A company speaking for itself, as its own card. Reach for it where a
 * person's company-branded card turns over, or when someone opens the
 * company from it — `CompanyCard` is the company in a list.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    // The name is the heading, even when the wordmark is what shows.
    await expect(canvas.getByRole('heading', { name: 'MeetCard' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'LinkedIn' })).toBeVisible()

    const card = canvasElement.querySelector<HTMLElement>('.deck-company-profile-card')!
    await expect(card).toHaveAttribute('data-card-orientation', 'landscape')
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
  },
}

/**
 * On a phone the card stands up and the wordmark heads it — the same card,
 * turned, as every other card in Deck.
 */
export const OnAPhone: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('.deck-company-profile-card')!
    await expect(card).toHaveAttribute('data-card-orientation', 'portrait')
    const ratio = card.offsetHeight / card.offsetWidth
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
  },
}

/**
 * A small card, and what gives: the sentence goes first, then the faces.
 * The box keeps its shape and nothing spills past its edge.
 */
export const Small: Story = {
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 400 }}>
        <Story />
      </div>
    ),
  ],
  args: { orientation: 'landscape' },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('.deck-company-profile-card')!
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)

    const body = canvasElement.querySelector<HTMLElement>('.deck-company-profile-card__body')!
    await expect(body.scrollHeight).toBeLessThanOrEqual(body.clientHeight + 1)
  },
}

/**
 * Without a wordmark or a cover — the name set in type, over the brand
 * under the same scrim. Quieter, not broken.
 */
export const WithoutImages: Story = {
  args: { logoSrc: undefined, coverSrc: undefined },
}

/**
 * Just the name and the tagline — every other row is optional, and the card
 * is the same size without them.
 */
export const Minimal: Story = {
  args: {
    description: undefined,
    links: undefined,
    people: undefined,
    actions: undefined,
  },
}
