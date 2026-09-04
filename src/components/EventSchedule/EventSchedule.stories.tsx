import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { EventSchedule } from './EventSchedule'

const meta = {
  component: EventSchedule,
  title: 'Build/Molecules/EventSchedule',
  tags: ['molecule'],
  args: {
    slots: [
      { time: '9:00 AM', title: 'Doors and coffee' },
      { time: '10:00 AM', title: 'Keynote: Pipeline you can trust' },
      { time: '12:30 PM', title: 'Lunch and card exchange' },
      { time: '2:00 PM', title: 'Breakouts' },
      { time: '4:30 PM', title: 'Closing reception' },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <EventSchedule {...args} />
    </div>
  ),
} satisfies Meta<typeof EventSchedule>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // An ordered list, because the sequence is the content.
    await expect(canvas.getByRole('list', { name: 'Schedule' })).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
  },
}

/** A second line, when the room or the speaker matters. */
export const WithDetail: Story = {
  args: {
    slots: [
      {
        time: '10:00 AM',
        title: 'Keynote: Pipeline you can trust',
        description: 'Main hall · Hannah Davis',
      },
      {
        time: '2:00 PM',
        title: 'Breakouts',
        description: 'Rooms 3A–3D',
      },
    ],
  },
}

/** One slot is still a schedule. */
export const SingleSlot: Story = {
  args: { slots: [{ time: '5:30 PM', title: 'Doors' }] },
}
