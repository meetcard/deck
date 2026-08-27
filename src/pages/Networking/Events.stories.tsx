import type { Meta, StoryObj } from '@storybook/react-vite'
import { Events } from './Events'

const meta = {
  component: Events,
  title: 'Experience/Networking/Events',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Events>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
