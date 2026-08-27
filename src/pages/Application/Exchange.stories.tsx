import type { Meta, StoryObj } from '@storybook/react-vite'
import { Exchange } from './Exchange'

const meta = {
  component: Exchange,
  title: 'Experience/Application/Exchange',
  tags: ['page'],
} satisfies Meta<typeof Exchange>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
