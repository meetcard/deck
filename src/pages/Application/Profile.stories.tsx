import type { Meta, StoryObj } from '@storybook/react-vite'
import { Profile } from './Profile'

const meta = {
  component: Profile,
  title: 'Experience/Application/Profile',
  tags: ['page'],
} satisfies Meta<typeof Profile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
