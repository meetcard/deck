import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { PlanCard } from './PlanCard'

const meta = {
  component: PlanCard,
  title: 'Build/Organisms/PlanCard',
  tags: ['organism'],
  args: {
    name: 'Pro',
    description: 'For professionals who network seriously.',
    price: '$8',
    period: '/mo',
    features: [
      'Unlimited cards',
      'Unlimited connections',
      'CRM integrations',
      'Custom domain',
      'Advanced analytics',
    ],
    action: <Button size="sm">Choose Pro</Button>,
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <PlanCard {...args} />
    </div>
  ),
} satisfies Meta<typeof PlanCard>

export default meta
type Story = StoryObj<typeof meta>

/** A plan you could move to. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('$8')).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
  },
}

/**
 * The plan you are on. Marked with a badge as well as a border, and its
 * action says what it does — you do not "choose" the plan you already have.
 */
export const Current: Story = {
  args: {
    name: 'Team',
    description: 'For teams networking at events together.',
    price: '$9',
    period: '/mo per seat',
    note: 'Starting at $9/mo per seat, 3-seat minimum.',
    current: true,
    features: [
      'Everything in Pro',
      '500 connections per seat',
      '10 events per month',
      'Team analytics',
      'Shared company branding',
    ],
    action: (
      <Button size="sm" variant="secondary">
        Manage plan
      </Button>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Current')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Manage plan' }),
    ).toBeVisible()
  },
}

/** The free one. A price of nothing is still a price and still lines up. */
export const Free: Story = {
  args: {
    name: 'Solo',
    description: 'For getting started with your digital business card.',
    price: '$0',
    period: 'forever',
    features: [
      '1 card',
      '100 connections',
      'Unlimited card exchanges',
      'Basic analytics',
    ],
    action: (
      <Button size="sm" variant="secondary">
        Choose Solo
      </Button>
    ),
  },
}
