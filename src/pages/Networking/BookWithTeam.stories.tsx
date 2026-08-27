import type { Meta, StoryObj } from '@storybook/react-vite'
import { BookWithTeam } from './BookWithTeam'

const meta = {
  component: BookWithTeam,
  title: 'Experience/Networking/Book with Team',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BookWithTeam>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
