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

/**
 * A row from the events list, carrying everything the list is scrolled for:
 * who put it on, what it looked like, and who you came away with.
 */
export const WithHostAndCards: Story = {
  args: {
    showWeekday: true,
    href: '/events/revops-summit',
    host: { name: 'Hannah Davis' },
    people: [
      { name: 'Hannah Davis' },
      { name: 'Marcus Lee' },
      { name: 'Priya Shah' },
      { name: 'Diego Romero' },
      { name: 'Lena Fox' },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/By Hannah Davis/)).toBeVisible()
    await expect(canvas.getByText('5 cards exchanged')).toBeVisible()
  },
}

/**
 * A conference where you met more people than a row can show. The faces are
 * a sample; the count is the fact.
 */
export const MoreCardsThanFaces: Story = {
  args: {
    name: 'SaaStr Annual',
    date: '2027-09-09',
    venue: 'Moscone West',
    attendance: 'speaking',
    peopleCount: 41,
    people: [
      { name: 'Ada Chen' },
      { name: 'Owen Hale' },
      { name: 'Nora Quinn' },
      { name: 'Arlo Bennett' },
      { name: 'Dev Patel' },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('41 cards exchanged')).toBeVisible()
    // Four faces and a spoken remainder, not five faces and a lie.
    await expect(canvas.getByText('and 1 more')).toBeInTheDocument()
  },
}
