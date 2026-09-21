import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { FeaturedEventCard } from './FeaturedEventCard'

const COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="320">
       <rect width="560" height="320" fill="#fdfbf7"/>
       <circle cx="150" cy="90" r="130" fill="#ffe9c7"/>
       <circle cx="430" cy="240" r="170" fill="#dbeee4"/>
       <rect x="240" y="40" width="120" height="240" fill="#fff6e0"/>
     </svg>`,
  )

const ClockIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
  </svg>
)

const PinIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 9.8 8 14 8 14Z" />
    <circle cx="8" cy="6.5" r="1.75" />
  </svg>
)

const meta = {
  component: FeaturedEventCard,
  title: 'Build/Organisms/FeaturedEventCard',
  tags: ['organism'],
  args: {
    name: 'RevOps Summit',
    coverSrc: COVER,
    badges: (
      <>
        <Badge size="sm">Happening next</Badge>
        <Badge tone="success" size="sm">
          Attending
        </Badge>
      </>
    ),
    facts: [
      { icon: <ClockIcon />, text: 'Tuesday, May 18, 2027 · 9:00 AM' },
      { icon: <PinIcon />, text: 'Austin Convention Center, Austin, Texas' },
    ],
    upNext: {
      label: 'Up next · Jun 16',
      name: 'Boulder Climate Happy Hour',
      detail: '5:30 PM · Rayback Collective',
      trailing: <Avatar name="Hannah Davis" size="sm" decorative />,
    },
  },
} satisfies Meta<typeof FeaturedEventCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The top of the calendar: what is happening next, and — on the strip along
 * the foot — what is after that.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { name: 'RevOps Summit' }),
    ).toBeVisible()
    await expect(canvas.getByText('Boulder Climate Happy Hour')).toBeVisible()

    const card = canvasElement.querySelector<HTMLElement>('.deck-featured-event')!
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
  },
}

/**
 * Without the strip — a calendar with nothing after this one. The card ends
 * on its facts rather than leaving an empty shelf.
 */
export const NothingAfterThis: Story = {
  args: { upNext: undefined },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('.deck-featured-event__next'),
    ).toBeNull()
  },
}

/** Linked, so the name leads to the event's own page. */
export const Linked: Story = {
  args: { href: '/events/revops-summit' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'RevOps Summit' }),
    ).toHaveAttribute('href', '/events/revops-summit')
  },
}

/**
 * On a phone. Stood up, and the strip still holds the foot — everything
 * above it takes the squeeze instead.
 */
export const OnAPhone: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('.deck-featured-event')!
    await expect(card).toHaveAttribute('data-card-orientation', 'portrait')

    const strip = canvasElement.querySelector<HTMLElement>(
      '.deck-featured-event__next',
    )!
    const cardBox = card.getBoundingClientRect()
    const stripBox = strip.getBoundingClientRect()
    await expect(Math.abs(stripBox.bottom - cardBox.bottom)).toBeLessThan(2)
  },
}

/**
 * A name long enough to need the room. It clamps at two lines rather than
 * pushing the facts off the card.
 */
export const ALongName: Story = {
  args: {
    name: 'The Annual RevOps, Partnerships and Community Leaders Summit',
  },
}
