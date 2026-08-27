import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimeSlotPicker } from './TimeSlotPicker'

const meta = {
  component: TimeSlotPicker,
  title: 'Build/Molecules/TimeSlotPicker',
  tags: ['molecule'],
  args: {
    timeZone: 'America/Denver',
    slots: [
      { time: '09:00' },
      { time: '09:30' },
      { time: '10:00', taken: true },
      { time: '10:30' },
      { time: '11:00' },
      { time: '13:00' },
      { time: '14:00' },
      { time: '14:30', taken: true },
      { time: '15:30' },
      { time: '17:00' },
      { time: '17:30' },
    ],
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return <TimeSlotPicker {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof TimeSlotPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: { value: '09:30' },
}

/** Periods with no slots are omitted, so a morning-only day shows one group. */
export const MorningOnly: Story = {
  args: {
    slots: [{ time: '08:00' }, { time: '08:30' }, { time: '09:00' }],
  },
}
