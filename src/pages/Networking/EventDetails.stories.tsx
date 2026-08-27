import type { Meta, StoryObj } from '@storybook/react-vite'
import { EventDetails } from './EventDetails'

const meta = {
  component: EventDetails,
  title: 'Experience/Networking/Event Details',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EventDetails>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
