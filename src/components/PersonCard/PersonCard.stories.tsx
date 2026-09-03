import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'
import { PrivateNote } from '../PrivateNote/PrivateNote'
import type { ConnectionFeeling } from '../PrivateNote/PrivateNote'
import { sampleQrMatrixSvg } from '../QRCode/sampleQrMatrix'
import { PersonCard } from './PersonCard'

/* Deck encodes nothing — the matrix is supplied. This is the real code the
   QRCode stories use. */
const Matrix = () => (
  <span
    style={{ display: 'block', width: '100%', height: '100%' }}
    dangerouslySetInnerHTML={{ __html: sampleQrMatrixSvg }}
  />
)

const EmailIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect
      x="2"
      y="3.5"
      width="12"
      height="9"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M2.5 4.5 8 9l5.5-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" />
    <text x="4.5" y="11.5" fontSize="7" fontWeight="700" fill="var(--deck-color-background-elevated)">
      in
    </text>
  </svg>
)

/* The card's own Share wears a QR code — see `cardIcons.tsx` for why. A
   caller's own share control should say the same thing, so this matches. */
const QrCodeIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <path d="M9 9h2v2" />
    <path d="M13.5 9h.01" />
    <path d="M13.5 12v1.5H12" />
    <path d="M9 13.5h.01" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path d="M2 6.5h12M5.5 2v2.5M10.5 2v2.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)

const HandshakeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M2 6.5 5 4l2.5 2-1.2 1.2a1 1 0 0 0 1.4 1.4L10 6l4 3-2 2-1.5-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const contactActions = (
  <>
    <IconButton label="Email Ben" icon={<EmailIcon />} size="sm" round />
    <IconButton
      label="Ben on LinkedIn"
      icon={<LinkedInIcon />}
      size="sm"
      round
    />
    <IconButton label="Share card" icon={<QrCodeIcon />} size="sm" round />
  </>
)

const footer = (
  <>
    <Button iconStart={<CalendarIcon />}>Book with me</Button>
    <Button variant="secondary" iconStart={<HandshakeIcon />}>
      Exchange cards
    </Button>
  </>
)

const meta = {
  component: PersonCard,
  title: 'Build/Organisms/PersonCard',
  tags: ['organism'],
  args: {
    name: 'Ben Ackles',
    title: 'Builder',
    company: 'MeetCard',
    location: 'Boulder, Colorado',
    tagline: 'What a lovable guy',
  },
  render: (args) => (
    /* Wider than the card used to be shown at. The card scales as one object
       now, so the frame it is given is the only thing deciding how large it
       is — and at 420px the type on it is the size of type on a real card
       held at arm's length, which is not how anyone reviews a design. */
    <div style={{ maxWidth: 640 }}>
      <PersonCard {...args} />
    </div>
  ),
} satisfies Meta<typeof PersonCard>

export default meta
type Story = StoryObj<typeof meta>

/** The full card, as handed over during an introduction. */
export const Default: Story = {
  args: { contactActions, footer },
}

/** Just the essentials — name and eyebrow are the only required fields. */
export const Minimal: Story = {
  args: { title: undefined, company: undefined, location: undefined, tagline: undefined },
}

export const WithCompanyLink: Story = {
  args: {
    contactActions,
    footer,
    companyHref: '/companies/meetcard',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'MeetCard' }),
    ).toHaveAttribute('href', '/companies/meetcard')
  },
}

export const WithPrivateNote: Story = {
  args: {
    contactActions,
    footer,
    privateNote: { hasContent: true },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /Your private note/ }),
    ).toBeVisible()
  },
}

/**
 * A card carries its own colours, and everything on it follows: the wash, the
 * glass, and the brand the primary button's label is set in. The buttons here
 * are ordinary `Button`s — they read the card's palette because they are on
 * it, not because they were told they would be.
 */
export const Branded: Story = {
  args: {
    contactActions,
    footer,
    kind: 'Business',
    theme: { primary: '#2E6E5B', accent: '#C66A4A' },
  },
}

/** The same card, another company's colours. */
export const BrandedElsewhere: Story = {
  args: {
    ...Branded.args,
    name: 'Sam Ellery',
    title: 'CEO',
    company: 'Trail & Co',
    tagline: 'Runs long, talks fast',
    theme: { primary: '#3B4A6B', accent: '#E0A458' },
  },
}

/**
 * The owner's own card. The chip says which of your selves this is — the one
 * thing on the card the person you hand it to never sees — and the pencil
 * edits the thing it sits on.
 */
export const YourOwnCard: Story = {
  args: {
    contactActions,
    footer,
    kind: 'Personal',
    theme: { primary: '#3A3F3D', accent: '#9A8F82' },
    onEdit: () => {},
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Edit card' }),
    ).toBeVisible()
  },
}

/**
 * The same object stood on its short edge. Orientation is not the card's own
 * decision — an ancestor declares it, and `CardPile` does so from the room it
 * has. Nothing is added or removed, only read straight down.
 */
export const Portrait: Story = {
  args: { contactActions, footer, kind: 'Business' },
  render: (args) => (
    <div data-card-orientation="portrait" style={{ maxWidth: 360 }}>
      <PersonCard {...args} />
    </div>
  ),
}

const share = {
  value: 'meetcard.io/ben@meetcard',
  summary: 'Ben Ackles, Builder at MeetCard',
  qr: <Matrix />,
  onDownloadQr: () => {},
  onShareLinkedIn: () => {},
}

const companyProfile = {
  name: 'MeetCard',
  headline: 'Meet people. Remember them.',
  description:
    'MeetCard turns in-person introductions into durable professional connections.',
  website: 'meetcard.io',
  location: 'Boulder, CO',
  linkedInHref: 'https://www.linkedin.com/company/meetcard',
  people: [{ name: 'Ben Ackles' }, { name: 'Ada Lovelace' }, { name: 'Grace Hopper' }],
  peopleTotal: 12,
  share: {
    value: 'meetcard.io/@meetcard',
    summary: 'MeetCard',
    qr: <Matrix />,
    onDownloadQr: () => {},
    onShareLinkedIn: () => {},
  },
}

/**
 * Sharing is the card doing something, so it happens on the card. Not a
 * dialog: a panel over the top would put the thing being shared behind the
 * thing describing it.
 */
export const Sharing: Story = {
  args: { contactActions, footer, kind: 'Business', share, view: 'share' },
}

/**
 * The company behind the card, reached from its name. You wondered who they
 * work for while holding their card, so the answer is on it.
 */
export const TheCompany: Story = {
  args: {
    contactActions,
    footer,
    companyProfile,
    view: 'company',
  },
}

/** Sharing from the company hands over the company, not the person. */
export const SharingTheCompany: Story = {
  args: { ...TheCompany.args, share, view: 'company-share' },
}

/** A long name still fits — it truncates rather than breaking the layout. */
export const LongName: Story = {
  args: {
    name: 'Augusta Ada King-Noel, Countess of Lovelace',
    title: 'Head of Strategic Partnerships and Developer Relations',
  },
}

function FlipHarness() {
  const [flipped, setFlipped] = useState(false)
  const [feeling, setFeeling] = useState<ConnectionFeeling>()
  const [note, setNote] = useState('')

  return (
    <PersonCard
      name="Ben Ackles"
      eyebrow="Verified professional"
      tagline="What a lovable guy"
      title="Builder"
      company="MeetCard"
      location="Boulder, Colorado"
      privateNote={{ hasContent: Boolean(feeling || note) }}
      contactActions={
        <>
          <IconButton size="sm" round label="Email" icon={<EmailIcon />} />
          <IconButton size="sm" round label="LinkedIn" icon={<LinkedInIcon />} />
          <IconButton size="sm" round label="Share" icon={<QrCodeIcon />} />
        </>
      }
      footer={
        <>
          <Button size="sm">Book with me</Button>
          <Button size="sm" variant="secondary">
            Exchange cards
          </Button>
        </>
      }
      flipped={flipped}
      onFlippedChange={setFlipped}
      back={
        <PrivateNote
          feeling={feeling}
          onFeelingChange={setFeeling}
          value={note}
          onValueChange={setNote}
          onHide={() => setFlipped(false)}
        />
      }
    />
  )
}

/**
 * A card has two sides. Opening the private note turns this one over, because
 * what you write about someone belongs on the back of their card rather than
 * in a panel somewhere else — and the dot on the front tells you there is
 * something written there without showing it.
 */
export const NoteOnTheBack: Story = {
  render: () => <FlipHarness />,
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole('button', { name: /Your private note/ })
    await expect(control).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(control)

    await waitFor(async () => {
      await expect(
        canvas.getByRole('heading', { name: 'How did this connection feel?' }),
      ).toBeVisible()
    })

    // Turning back leaves the card as it was.
    await userEvent.click(canvas.getByRole('button', { name: 'Hide' }))
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: /Your private note/ }),
      ).toHaveAttribute('aria-expanded', 'false')
    })
  },
}
