import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RsvpControl, type RsvpStatus } from './RsvpControl'

const meta = {
  component: RsvpControl,
  tags: ['molecule'],
  args: {
    counts: { yes: 12, maybe: 3, no: 1 },
  },
  render: function Render(args) {
    const [value, setValue] = useState<RsvpStatus | undefined>(args.value)
    return <RsvpControl {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof RsvpControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Attending: Story = {
  args: { value: 'yes' },
}

export const NoResponsesYet: Story = {
  args: { counts: { yes: 0, maybe: 0, no: 0 } },
}
