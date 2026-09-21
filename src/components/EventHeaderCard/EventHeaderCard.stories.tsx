import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { EventHeaderCard } from './EventHeaderCard'

/*
 * A deliberately *pale* stand-in for a cover photo. Drawn rather than
 * fetched, so the story is deterministic in Chromatic and offline — and
 * light, because a bright picture is the hard case for a scrim: if paper
 * still reads against this, it reads against anything.
 */
const COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    /* Written with real `#`s: the whole string is encoded once on the way
       into the data URI, so pre-escaping them here would encode the escape
       and every fill would fall back to black. */
    `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="320">
       <rect width="560" height="320" fill="#fdfbf7"/>
       <circle cx="150" cy="90" r="130" fill="#ffe9c7"/>
       <circle cx="430" cy="240" r="170" fill="#dbeee4"/>
       <rect x="240" y="40" width="120" height="240" fill="#fff6e0"/>
     </svg>`,
  )

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5 1.5v3M11 1.5v3" strokeLinecap="round" />
  </svg>
)

const PinIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M8 14.5S13 9.9 13 6.5a5 5 0 0 0-10 0c0 3.4 5 8 5 8Z" strokeLinejoin="round" />
    <circle cx="8" cy="6.5" r="1.8" />
  </svg>
)

const meta = {
  component: EventHeaderCard,
  title: 'Build/Organisms/EventHeaderCard',
  tags: ['organism'],
  args: {
    name: 'RevOps Summit',
    coverSrc: COVER,
    level: 1,
  },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <EventHeaderCard {...args} />
    </div>
  ),
} satisfies Meta<typeof EventHeaderCard>

export default meta
type Story = StoryObj<typeof meta>

/** The whole thing: what you are to it, who runs it, when and where. */
export const Default: Story = {
  args: {
    badges: (
      <>
        <Badge tone="success" size="sm">
          Attending
        </Badge>
        <Badge tone="warning" size="sm">
          Soon
        </Badge>
      </>
    ),
    host: { name: 'Hannah Davis', detail: 'Community Lead, RevOps Collective' },
    facts: [
      {
        icon: <CalendarIcon />,
        title: 'Tuesday, May 18, 2027',
        detail: '9:00 AM – 4:30 PM',
      },
      {
        icon: <PinIcon />,
        title: 'Austin Convention Center',
        detail: '500 E Cesar Chavez St, Austin, Texas',
      },
    ],
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeVisible()

    // The picture is a backdrop, not content — it says nothing a reader
    // needs, and the name beside it says everything.
    const image = canvasElement.querySelector('.deck-event-header-card__image')!
    await expect(image).toHaveAttribute('alt', '')
    await expect(
      canvasElement.querySelector('.deck-event-header-card__backdrop'),
    ).toHaveAttribute('aria-hidden', 'true')
  },
}

/**
 * Bare. Most events are entered in twenty seconds with no picture at all, so
 * this is the common case rather than the fallback: the brand under the same
 * scrim, and a hero that is quieter rather than broken.
 */
export const WithoutACover: Story = {
  args: {
    coverSrc: undefined,
    facts: [{ icon: <CalendarIcon />, title: 'Tuesday, May 18, 2027' }],
  },
}

/**
 * As a featured event on a list page: `level={2}`, a link on the name, and
 * whatever the page wants to hang underneath.
 */
export const Featured: Story = {
  args: {
    level: 2,
    href: '/events/revops-summit',
    badges: (
      <Badge tone="brand" size="sm">
        Happening next
      </Badge>
    ),
    facts: [
      { icon: <CalendarIcon />, title: 'Tuesday, May 18, 2027', detail: '9:00 AM' },
    ],
    children: <Button size="sm">Add to calendar</Button>,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'RevOps Summit' }),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'RevOps Summit' })).toHaveAttribute(
      'href',
      '/events/revops-summit',
    )
  },
}

/**
 * Phone. The header is a card, so it stands up here like every other card:
 * a fixed 1:1.75 box. The host's own title drops out, the name clamps, and
 * anything still too long scrolls inside the card rather than growing it.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  args: {
    badges: <Badge tone="success" size="sm">Attending</Badge>,
    host: { name: 'Hannah Davis', detail: 'Community Lead, RevOps Collective' },
    facts: [
      { icon: <CalendarIcon />, title: 'Tuesday, May 18, 2027', detail: '9:00 AM – 4:30 PM' },
      { icon: <PinIcon />, title: 'Austin Convention Center' },
    ],
  },
  render: (args) => <EventHeaderCard {...args} />,
  play: async ({ canvasElement }) => {
    const hero = canvasElement.querySelector<HTMLElement>('.deck-event-header-card')!
    const content = canvasElement.querySelector<HTMLElement>(
      '.deck-event-header-card__content',
    )!

    // Stood up on a phone, like every other card.
    await expect(hero).toHaveAttribute('data-card-orientation', 'portrait')

    // Exactly 4:7 — a fixed box, not a floor the content can push past.
    const ratio = hero.offsetWidth / hero.offsetHeight
    await expect(ratio).toBeGreaterThan(0.56)
    await expect(ratio).toBeLessThan(0.58)

    // The content gives, the card does not: never taller than the box.
    await expect(content.offsetHeight).toBeLessThanOrEqual(hero.clientHeight)
  },
}
