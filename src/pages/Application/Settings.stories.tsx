import type { Meta, StoryObj } from '@storybook/react-vite'
import { Settings } from './Settings'

const meta = {
  component: Settings,
  title: 'App/Application/Settings',
  tags: ['page'],
} satisfies Meta<typeof Settings>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
