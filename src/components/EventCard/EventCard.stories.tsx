import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
import { EventCard } from './EventCard'

const meta = {
  component: EventCard,
  args: {
    name: 'RevOps Summit',
    startDate: '2027-05-18',
    location: 'Moscone Center, San Francisco',
  },
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <EventCard {...args} />
    </div>
  ),
} satisfies Meta<typeof EventCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // The machine-readable date survives locale formatting.
    await expect(canvas.getByText(/2027/).closest('time')).toHaveAttribute(
      'dateTime',
      '2027-05-18',
    )
  },
}

export const MultiDay: Story = {
  args: { endDate: '2027-05-20' },
}

export const Upcoming: Story = {
  args: { status: 'upcoming' },
}

/** A dot supplements color so "live" is not signalled by hue alone. */
export const Live: Story = {
  args: { status: 'live', connectionCount: 12 },
}

export const Past: Story = {
  args: { status: 'past', connectionCount: 42 },
}

export const Linked: Story = {
  args: {
    href: '/events/revops-summit-2027-05-18',
    status: 'upcoming',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'RevOps Summit' }),
    ).toHaveAttribute('href', '/events/revops-summit-2027-05-18')
  },
}

export const WithActions: Story = {
  args: {
    status: 'upcoming',
    actions: (
      <Button size="sm" variant="secondary">
        Join
      </Button>
    ),
  },
}

/** The Events destination in the app. */
export const InAList: Story = {
  render: (args) => (
    <Stack as="ul" gap={12} style={{ maxWidth: 440 }}>
      <li>
        <EventCard {...args} status="live" connectionCount={12} />
      </li>
      <li>
        <EventCard
          {...args}
          name="SaaSConf"
          startDate="2027-06-02"
          endDate="2027-06-04"
          location="Austin, TX"
          status="upcoming"
        />
      </li>
      <li>
        <EventCard
          {...args}
          name="Field Marketing Meetup"
          startDate="2026-11-12"
          location="London, UK"
          status="past"
          connectionCount={8}
        />
      </li>
    </Stack>
  ),
}
