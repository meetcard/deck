import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'
import { PersonCard } from './PersonCard'

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

const ShareIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="12" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="4" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.7 7 10.3 5M5.7 9l4.6 2" stroke="currentColor" strokeWidth="1.3" />
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
    <IconButton label="Share card" icon={<ShareIcon />} size="sm" round />
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
  tags: ['organism'],
  args: {
    name: 'Ben Ackles',
    title: 'Builder',
    company: 'MeetCard',
    location: 'Boulder, Colorado',
    tagline: 'What a lovable guy',
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
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

/** A long name still fits — it truncates rather than breaking the layout. */
export const LongName: Story = {
  args: {
    name: 'Augusta Ada King-Noel, Countess of Lovelace',
    title: 'Head of Strategic Partnerships and Developer Relations',
  },
}
