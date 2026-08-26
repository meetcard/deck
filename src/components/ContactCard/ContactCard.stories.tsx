import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { ContactCard } from './ContactCard'

const details = [
  {
    label: 'Email',
    value: 'ada@meetcard.com',
    href: 'mailto:ada@meetcard.com',
  },
  { label: 'Phone', value: '+44 20 7946 0958', href: 'tel:+442079460958' },
  { label: 'Location', value: 'London, UK' },
]

const meta = {
  component: ContactCard,
  tags: ['organism'],
  args: {
    name: 'Ada Lovelace',
    title: 'Head of Partnerships',
    company: 'MeetCard',
    details,
  },
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <ContactCard {...args} />
    </div>
  ),
} satisfies Meta<typeof ContactCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Where and when you met — the context that makes a contact useful later. */
export const WithMetAt: Story = {
  args: { metAt: 'Met at SaaSConf · 12 June' },
}

export const NeedsFollowUp: Story = {
  args: {
    metAt: 'Met at SaaSConf · 12 June',
    status: { label: 'Follow up', tone: 'warning' },
  },
}

/** Email and phone are actionable; plain values stay as text. */
export const ActionableDetails: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'ada@meetcard.com' }),
    ).toHaveAttribute('href', 'mailto:ada@meetcard.com')
    await expect(canvas.getByText('London, UK')).toBeVisible()
  },
}

export const WithActions: Story = {
  args: {
    status: { label: 'Follow up', tone: 'warning' },
    actions: (
      <>
        <Button size="sm">Send message</Button>
        <Button size="sm" variant="ghost">
          Snooze
        </Button>
      </>
    ),
  },
}

/** Details are optional — the identity block stands on its own. */
export const WithoutDetails: Story = {
  args: { details: undefined },
}
