import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Header } from './Header'

const meta = {
  component: Header,
  tags: ['ai-generated'],
  args: {
    title: 'deck',
    onLogin: fn(),
    onLogout: fn(),
    onSignUp: fn(),
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const LoggedOut: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Log in' }))
    await expect(args.onLogin).toHaveBeenCalledOnce()
  },
}

export const LoggedIn: Story = {
  args: {
    user: { name: 'Ben Ackles' },
  },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('img', { name: 'Ben Ackles' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Log out' }))
    await expect(args.onLogout).toHaveBeenCalledOnce()
  },
}
