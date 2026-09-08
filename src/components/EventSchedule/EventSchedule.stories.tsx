import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { EventSchedule } from './EventSchedule'

const entries = [
  { time: '9:00 AM', title: 'Doors and coffee' },
  { time: '10:00 AM', title: 'Keynote: Pipeline you can trust' },
  { time: '12:30 PM', title: 'Lunch and card exchange' },
  { time: '2:00 PM', title: 'Breakouts' },
  { time: '4:30 PM', title: 'Closing reception' },
]

const meta = {
  component: EventSchedule,
  title: 'Build/Molecules/EventSchedule',
  tags: ['molecule'],
  args: { entries, label: 'Schedule for RevOps Summit' },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <EventSchedule {...args} />
    </div>
  ),
} satisfies Meta<typeof EventSchedule>

export default meta
type Story = StoryObj<typeof meta>

/** A conference day, read down its left edge. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Doors and coffee')).toBeVisible()

    // A time and its session are one pair, not two loose strings.
    const rows = canvasElement.querySelectorAll('.deck-event-schedule__row')
    await expect(rows).toHaveLength(5)
    await expect(rows[0].querySelector('dt')).toHaveTextContent('9:00 AM')
    await expect(rows[0].querySelector('dd')).toHaveTextContent(
      'Doors and coffee',
    )
  },
}

/** An evening with two things in it is still a schedule. */
export const ShortEvening: Story = {
  args: {
    entries: [
      { time: '7:00 PM', title: 'Drinks' },
      { time: '8:00 PM', title: 'Dinner, six to a table' },
    ],
  },
}

/** Long session names wrap in their own column; the times stay put. */
export const LongSessionNames: Story = {
  args: {
    entries: [
      {
        time: '10:00 AM',
        title:
          'Keynote: Pipeline you can trust, and the seven spreadsheets nobody admits to running the business on',
      },
      { time: '11:30 AM', title: 'Panel' },
    ],
  },
}
