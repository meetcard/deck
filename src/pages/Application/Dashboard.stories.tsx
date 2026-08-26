import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dashboard } from './Dashboard'

const meta = {
  component: Dashboard,
  title: 'Experience/Application/Dashboard',
  tags: ['page'],
} satisfies Meta<typeof Dashboard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
