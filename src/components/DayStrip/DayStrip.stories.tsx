import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DayStrip } from './DayStrip'

const meta = {
  component: DayStrip,
  title: 'Build/Molecules/DayStrip',
  tags: ['molecule'],
  args: {
    today: '2026-09-01',
    timeZone: 'America/Denver',
    days: [
      { date: '2026-09-01', slotCount: 2 },
      { date: '2026-09-02', slotCount: 6 },
      { date: '2026-09-03', slotCount: 9 },
      { date: '2026-09-04', slotCount: 4 },
      { date: '2026-09-05', slotCount: 0 },
      { date: '2026-09-08', slotCount: 7 },
      { date: '2026-09-09', slotCount: 1 },
    ],
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return <DayStrip {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof DayStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: { value: '2026-09-03' },
}

/** Days with no openings are disabled rather than left as a dead end. */
export const FullyBooked: Story = {
  args: {
    days: [
      { date: '2026-09-01', slotCount: 0 },
      { date: '2026-09-02', slotCount: 0 },
      { date: '2026-09-03', slotCount: 3 },
    ],
  },
}

/** The month is re-labelled wherever the strip crosses a boundary. */
export const AcrossMonths: Story = {
  args: {
    today: '2026-08-30',
    days: [
      { date: '2026-08-30', slotCount: 3 },
      { date: '2026-08-31', slotCount: 5 },
      { date: '2026-09-01', slotCount: 2 },
      { date: '2026-09-02', slotCount: 8 },
    ],
  },
}
