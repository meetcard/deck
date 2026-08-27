import type { Meta, StoryObj } from '@storybook/react-vite'
import { Activity } from './Activity'

const meta = {
  component: Activity,
  title: 'Experience/Application/Activity',
  tags: ['page'],
} satisfies Meta<typeof Activity>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
