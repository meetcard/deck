import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { EventHero } from './EventHero'

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
  component: EventHero,
  title: 'Build/Organisms/EventHero',
  tags: ['organism'],
  args: {
    name: 'RevOps Summit',
    coverSrc: COVER,
    level: 1,
  },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <EventHero {...args} />
    </div>
  ),
} satisfies Meta<typeof EventHero>

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
    const image = canvasElement.querySelector('.deck-event-hero__image')!
    await expect(image).toHaveAttribute('alt', '')
    await expect(
      canvasElement.querySelector('.deck-event-hero__backdrop'),
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
 * Phone. The frame stays landscape here, deliberately: a portrait crop spends
 * most of a small screen on blurred picture above the words, and the words
 * are what a header is for. The ratio is a floor, so the content that does
 * not fit pushes the hero taller instead of being cut off.
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
  render: (args) => <EventHero {...args} />,
  play: async ({ canvasElement }) => {
    const hero = canvasElement.querySelector<HTMLElement>('.deck-event-hero')!
    // Wider than it is tall, at 375px — and taller than 7:4 because the
    // content asked for the room.
    await expect(hero.offsetWidth).toBeGreaterThan(hero.offsetHeight)
    await expect(hero.offsetHeight).toBeGreaterThan(
      (hero.offsetWidth * 4) / 7 - 1,
    )
    /* Nothing clipped: the frame grew to hold the content exactly.
       Measured on the content rather than the hero, because the hero's own
       scrollable area includes the backdrop — which is scaled past the
       frame on purpose, so the blur has pixels to reach for at the edges. */
    const content = canvasElement.querySelector<HTMLElement>(
      '.deck-event-hero__content',
    )!
    await expect(content.scrollHeight).toBeLessThanOrEqual(
      content.clientHeight + 1,
    )
    await expect(hero.clientHeight).toBe(content.offsetHeight)
  },
}
