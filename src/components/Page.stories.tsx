import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Page } from './Page'

const meta = {
  component: Page,
  tags: ['ai-generated'],
  args: {
    title: 'deck',
    children: 'Page content goes here.',
  },
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LoginFlow: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Log in' }))
    await expect(canvas.getByRole('button', { name: 'Log out' })).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Log out' }))
    await expect(canvas.getByRole('button', { name: 'Log in' })).toBeVisible()
  },
}
