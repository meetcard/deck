import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from './AppShell'

const meta = {
  component: AppShell,
  title: 'Experience/Application/App Shell',
  tags: ['page'],
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
