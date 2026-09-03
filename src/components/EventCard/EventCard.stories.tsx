import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { AvatarStack } from '../AvatarStack/AvatarStack'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
import { EventCard } from './EventCard'

const meta = {
  component: EventCard,
  title: 'Build/Organisms/EventCard',
  tags: ['organism'],
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

/**
 * The card standing on its own, for a grid. Room for the hour, the host, and
 * a footer of whoever you came away with — none of which fits in a row.
 */
export const Tile: Story = {
  args: {
    layout: 'tile',
    time: '9:00 AM',
    location: 'Austin Convention Center',
    host: 'Hannah Davis',
    eyebrow: 'Attending',
    status: 'upcoming',
    footer: (
      <AvatarStack
        people={[
          { name: 'Hannah Davis' },
          { name: 'Marcus Lee' },
          { name: 'Priya Shah' },
          { name: 'Diego Romero' },
          { name: 'Lena Fox' },
        ]}
        caption="5 cards exchanged"
      />
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <EventCard {...args} />
    </div>
  ),
}

/** Tiles in the grid they are drawn for. They stretch to a shared height. */
export const TileGrid: Story = {
  args: { layout: 'tile' },
  render: (args) => (
    <Stack
      as="ul"
      direction="row"
      gap={12}
      wrap
      style={{ maxWidth: 760, listStyle: 'none', margin: 0, padding: 0 }}
    >
      <li style={{ flex: '1 1 300px' }}>
        <EventCard
          {...args}
          eyebrow="Attending"
          status="upcoming"
          time="9:00 AM"
          host="Hannah Davis"
          location="Austin Convention Center"
          footer={
            <AvatarStack
              people={[{ name: 'Hannah Davis' }, { name: 'Marcus Lee' }]}
              caption="5 cards exchanged"
            />
          }
        />
      </li>
      <li style={{ flex: '1 1 300px' }}>
        <EventCard
          {...args}
          name="Boulder Climate Happy Hour, Rayback Collective"
          startDate="2027-06-16"
          time="5:30 PM"
          location="Rayback Collective"
          host="Hannah Davis"
          eyebrow="Hosting"
          footer={
            <AvatarStack
              people={[{ name: 'Mira Okafor' }, { name: 'Theo Marsh' }]}
              caption="4 cards exchanged"
            />
          }
        />
      </li>
    </Stack>
  ),
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
