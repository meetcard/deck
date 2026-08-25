import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import heroImg from '../assets/hero.png'
import { Avatar } from './Avatar'

const meta = {
  component: Avatar,
  tags: ['ai-generated'],
  args: {
    name: 'Ben Ackles',
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Initials: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Ben Ackles' })).toHaveTextContent('BA')
  },
}

export const WithImage: Story = {
  args: {
    src: heroImg,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Ben Ackles' })).toHaveAttribute('src', heroImg)
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}
