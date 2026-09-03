import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import coverImage from '../../assets/hero.png'
import { Avatar } from '../Avatar/Avatar'
import { AvatarStack } from '../AvatarStack/AvatarStack'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'
import { sampleQrMatrixSvg } from '../QRCode/sampleQrMatrix'
import { EventHero, EventHeroPanel } from './EventHero'

/* Deck encodes nothing — the matrix is supplied. This is the real code the
   QRCode stories use. */
const Matrix = () => (
  <span
    style={{ display: 'block', width: '100%', height: '100%' }}
    dangerouslySetInnerHTML={{ __html: sampleQrMatrixSvg }}
  />
)

/* Drawn here rather than imported, for the reason every icon in
   `src/components` is: the published bundle carries no icon set. Lucide's
   conventions — the 24 grid, 2px strokes, round joins, no fill. */
const svg = (children: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
)

const ClockIcon = () =>
  svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>,
  )

const PinIcon = () =>
  svg(
    <>
      <path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>,
  )

const PencilIcon = () =>
  svg(
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>,
  )

const ATTENDEES = [
  { name: 'Hannah Davis' },
  { name: 'Marcus Lee' },
  { name: 'Priya Shah' },
  { name: 'Diego Romero' },
  { name: 'Lena Fox' },
]

const meta = {
  component: EventHero,
  title: 'Build/Organisms/EventHero',
  tags: ['organism'],
  args: {
    name: 'RevOps Summit',
    theme: { primary: '#2E6E5B', accent: '#C66A4A' },
  },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <EventHero {...args} />
    </div>
  ),
} satisfies Meta<typeof EventHero>

export default meta
type Story = StoryObj<typeof meta>

/**
 * With no cover photograph the hero paints the event's own colour, so an
 * event nobody has uploaded a picture for is still an object rather than a
 * grey box.
 */
export const Default: Story = {
  args: {
    eyebrow: 'Events',
    badges: (
      <>
        <Badge variant="subtle">Happening next</Badge>
        <Badge tone="brand" variant="solid">
          Attending
        </Badge>
      </>
    ),
    children: (
      <EventHeroPanel
        icon={<ClockIcon />}
        title="Tuesday, May 18, 2027"
        description="9:00 AM – 4:30 PM"
      />
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'RevOps Summit' }),
    ).toBeVisible()
  },
}

/**
 * The index's featured event. Its caps line is the page's own title, so it is
 * the `h1` — leaving one featured event's name as the only `h1` on a list of
 * events reads oddly out loud.
 */
export const AsAnIndexHeader: Story = {
  args: {
    eyebrow: 'Events',
    eyebrowAs: 'h1',
    href: '/events/revops',
    badges: <Badge variant="subtle">Happening next</Badge>,
    children: (
      <EventHeroPanel
        href="/events/climate"
        eyebrow="Up next · Jun 16"
        title="Boulder Climate Happy Hour"
        description="5:30 PM · Rayback Collective"
        trailing={<Avatar name="Hannah Davis" size="xs" decorative />}
      />
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Events' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'RevOps Summit' }),
    ).toHaveAttribute('href', '/events/revops')
  },
}

/**
 * The event's own page. Two facts as panels, the actions beneath them, and
 * the owner's pencil in the corner.
 *
 * Everything under the name is an ordinary Deck component — the hero
 * re-points the colour tokens, so nothing here knows it is on glass.
 */
export const AsAnEventPage: Story = {
  args: {
    level: 1,
    badges: (
      <>
        <Badge variant="subtle">Attending</Badge>
        <Badge tone="brand" variant="solid">
          Soon
        </Badge>
      </>
    ),
    action: (
      <IconButton
        label="Edit event"
        variant="secondary"
        size="sm"
        round
        icon={<PencilIcon />}
      />
    ),
    children: (
      <>
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <EventHeroPanel
            icon={<ClockIcon />}
            title="Tuesday, May 18, 2027"
            description="9:00 AM – 4:30 PM"
          />
          <EventHeroPanel
            icon={<PinIcon />}
            title="Austin Convention Center"
            description="500 E Cesar Chavez St, Austin, Texas"
          />
        </div>
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}
        >
          <Button variant="secondary" size="sm">
            Add to calendar
          </Button>
          <Button variant="secondary" size="sm">
            Share
          </Button>
          <AvatarStack people={ATTENDEES} max={3} size="sm" />
        </div>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeVisible()
  },
}

const share = {
  value: 'meetcard.io/events/revops',
  summary: 'Tuesday, May 18, 2027 · Austin Convention Center',
  qr: <Matrix />,
  onDownloadQr: () => {},
}

/**
 * The hero turned over to be scanned.
 *
 * Not a dialog. The event is the thing being handed across, so it happens on
 * the event — same cover, same colours, its code where its details were. The
 * name stays put, so you can see what you are about to hand over.
 *
 * The control that opens this belongs to the page (an event page puts Share
 * next to Add to calendar), so the caller drives `view`. The hero owns the
 * way back out.
 */
export const Sharing: Story = {
  args: {
    ...AsAnEventPage.args,
    share,
    defaultView: 'share',
  },
  play: async ({ canvas }) => {
    // The event is still named while its code is showing.
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeVisible()
    // Someone who cannot scan still reaches the destination.
    await expect(
      canvas.getByRole('img', { name: 'QR code for meetcard.io/events/revops' }),
    ).toBeVisible()
    await expect(canvas.getByLabelText('Share link')).toHaveValue(
      'meetcard.io/events/revops',
    )
    // The pencil stands down; the corner is the way back out. Asserted
    // rather than clicked, so this story stays a picture of the share face
    // — turning back is covered in `EventHero.test.tsx`.
    await expect(
      canvas.getByRole('button', { name: 'Close share' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Edit event' })).toBeNull()
  },
}

/** With a cover under it — the code keeps its own light plate to stay scannable. */
export const SharingOverACover: Story = {
  args: { ...Sharing.args, coverSrc: coverImage },
}

/**
 * With a cover, and deliberately the least flattering one available: a mostly
 * white image, which is the case the wash has to survive. axe will not judge
 * text over a picture, so this story is where the eye checks what the numbers
 * at the top of `EventHero.css` claim.
 */
export const WithACover: Story = {
  args: {
    ...Default.args,
    coverSrc: coverImage,
  },
}

/** A different palette, to show the wash is the event's and not Deck's. */
export const AnotherPalette: Story = {
  args: {
    ...Default.args,
    name: 'Founders Dinner',
    theme: { primary: '#4A3B5C', accent: '#C9A227' },
    children: (
      <EventHeroPanel
        icon={<PinIcon />}
        title="The Wayfarer"
        description="Denver, Colorado"
      />
    ),
  },
}

/**
 * Phone. The frame stays landscape — turning it portrait spends most of a
 * small screen on blurred photograph above the words.
 */
export const Mobile: Story = {
  args: AsAnIndexHeader.args,
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
}
