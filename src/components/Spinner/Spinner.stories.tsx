import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Spinner } from './Spinner'

const meta = {
  component: Spinner,
  title: 'Build/Atoms/Spinner',
  tags: ['atom'],
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading')
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={16} align="center">
      <Spinner {...args} size="sm" label="Loading small" />
      <Spinner {...args} size="md" label="Loading medium" />
      <Spinner {...args} size="lg" label="Loading large" />
    </Stack>
  ),
}

export const WithContextLabel: Story = {
  args: { label: 'Syncing to CRM' },
}

/**
 * When visible text already describes the wait, silence the spinner so a
 * screen reader doesn't announce it twice.
 */
export const Silent: Story = {
  args: { label: null },
  render: (args) => (
    <Stack direction="row" gap={8} align="center">
      <Spinner {...args} size="sm" />
      <span>Syncing to CRM…</span>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument()
  },
}
