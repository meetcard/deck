import type { Meta, StoryObj } from '@storybook/react-vite'
import { LeadCapture } from './LeadCapture'

const meta = {
  component: LeadCapture,
  title: 'App/Networking/Lead Capture',
  tags: ['page'],
} satisfies Meta<typeof LeadCapture>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
