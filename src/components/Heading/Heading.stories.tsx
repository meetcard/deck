import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Heading } from './Heading'

const meta = {
  component: Heading,
  args: { children: 'Your network is your net worth.' },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** In-page hierarchy: the Heading ramp, 24/32 down to 14/20. */
export const HeadingScale: Story = {
  render: (args) => (
    <Stack gap={12}>
      <Heading {...args} size="xl" />
      <Heading {...args} size="lg" />
      <Heading {...args} size="md" />
      <Heading {...args} size="sm" />
      <Heading {...args} size="xs" />
    </Stack>
  ),
}

/** Hero moments: the Display ramp. Use at most one per viewport. */
export const DisplayScale: Story = {
  args: { children: 'MeetCard' },
  render: (args) => (
    <Stack gap={12}>
      <Heading {...args} size="display-lg" />
      <Heading {...args} size="display-md" />
      <Heading {...args} size="display-sm" />
    </Stack>
  ),
}

/**
 * Rank and size are independent: `level` keeps the document outline correct
 * for screen readers while `size` controls appearance.
 */
export const RankSeparateFromSize: Story = {
  args: { level: 4, size: 'display-sm', children: 'Visually large, rank 4' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 4 }),
    ).toBeVisible()
  },
}
