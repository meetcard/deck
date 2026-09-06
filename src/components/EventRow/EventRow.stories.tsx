import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { EventRow } from './EventRow'

const meta = {
  component: EventRow,
  title: 'Build/Molecules/EventRow',
  tags: ['molecule'],
  args: {
    name: 'RevOps Summit',
    date: '2027-05-18',
    time: '9:00 AM',
    venue: 'Austin Convention Center',
    attendance: 'attending',
  },
  render: (args) => (
    <Card style={{ maxWidth: 620 }}>
      <EventRow {...args} />
    </Card>
  ),
} satisfies Meta<typeof EventRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // The leaf is announced as one date, not two loose fragments.
    await expect(canvas.getByRole('img', { name: 'May 18' })).toBeInTheDocument()
  },
}

/**
 * The list is already in date order, so "Soon" is doing what the order
 * cannot: saying which one is close enough to need packing for.
 */
export const Soon: Story = {
  args: { soon: true },
}

/** Your relationship to the event — not whether it has happened. */
export const Attendance: Story = {
  render: () => (
    <Card style={{ maxWidth: 620 }}>
      <EventRow
        name="RevOps Summit"
        date="2027-05-18"
        time="9:00 AM"
        venue="Austin Convention Center"
        attendance="attending"
        showWeekday
      />
      <EventRow
        name="Boulder Climate Happy Hour"
        date="2027-06-16"
        time="5:30 PM"
        venue="Rayback Collective"
        attendance="hosting"
        showWeekday
      />
      <EventRow
        name="SaaStr Annual"
        date="2027-09-09"
        time="10:00 AM"
        venue="Moscone West"
        attendance="speaking"
        showWeekday
      />
      <EventRow
        name="Founders Dinner"
        date="2027-11-02"
        time="7:00 PM"
        venue="The Wayfarer"
        attendance="invited"
        showWeekday
      />
    </Card>
  ),
}

/** With somewhere to go and something to do. */
export const Linked: Story = {
  args: {
    href: '/events/revops-summit',
    actions: (
      <Button size="sm" variant="secondary">
        Edit
      </Button>
    ),
  },
}

/** The compact form a dashboard uses — no weekday, no attendance. */
export const Compact: Story = {
  args: { attendance: undefined },
}
