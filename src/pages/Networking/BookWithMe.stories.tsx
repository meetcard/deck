import type { Meta, StoryObj } from '@storybook/react-vite'
import { BookWithMe } from './BookWithMe'

const meta = {
  component: BookWithMe,
  title: 'App/Networking/Book with Me',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BookWithMe>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
