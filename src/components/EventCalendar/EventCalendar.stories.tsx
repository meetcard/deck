import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EventCalendar } from './EventCalendar'

const meta = {
  component: EventCalendar,
  title: 'Build/Molecules/EventCalendar',
  tags: ['molecule'],
  args: {
    month: '2026-07',
    today: '2026-07-21',
    markedDates: [
      { date: '2026-07-21', status: 'past' },
      { date: '2026-08-04', status: 'upcoming' },
    ],
  },
  render: function Render(args) {
    const [month, setMonth] = useState(args.month)
    const [value, setValue] = useState(args.value)
    return (
      <EventCalendar
        {...args}
        month={month}
        onMonthChange={setMonth}
        value={value}
        onChange={setValue}
      />
    )
  },
} satisfies Meta<typeof EventCalendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: { value: '2026-07-21' },
}

/** Days without an event are disabled — the grid filters, it doesn't invite a dead click. */
export const NoEventsThisMonth: Story = {
  args: {
    markedDates: [{ date: '2026-08-04', status: 'upcoming' }],
  },
}

export const ManyMarkedDates: Story = {
  args: {
    markedDates: [
      { date: '2026-07-02', status: 'past' },
      { date: '2026-07-08', status: 'past' },
      { date: '2026-07-14', status: 'past' },
      { date: '2026-07-21', status: 'past' },
      { date: '2026-07-24', status: 'upcoming' },
      { date: '2026-07-28', status: 'upcoming' },
    ],
  },
}
