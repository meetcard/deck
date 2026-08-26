import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { IconButton } from './IconButton'

const MoreIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="3" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="13" cy="8" r="1.5" fill="currentColor" />
  </svg>
)

const meta = {
  component: IconButton,
  tags: ['atom'],
  args: {
    label: 'More actions',
    icon: <MoreIcon />,
    onClick: fn(),
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

/** The `label` prop is the accessible name — the icon itself is hidden. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'More actions' }),
    ).toBeVisible()
  },
}

export const Variants: Story = {
  render: (args) => (
    <Stack direction="row" gap={8} align="center">
      <IconButton {...args} variant="ghost" />
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="primary" />
      <IconButton {...args} variant="destructive" />
    </Stack>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={8} align="center">
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
    </Stack>
  ),
}

/** Round suits avatar overlays and floating actions. */
export const Round: Story = {
  args: { round: true, variant: 'secondary' },
}

export const Disabled: Story = {
  args: { disabled: true },
}
