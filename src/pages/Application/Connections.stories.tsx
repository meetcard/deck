import type { Meta, StoryObj } from '@storybook/react-vite'
import { Connections } from './Connections'

const meta = {
  component: Connections,
  title: 'Experience/Application/Connections',
  tags: ['page'],
} satisfies Meta<typeof Connections>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
