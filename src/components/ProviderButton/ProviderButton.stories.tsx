import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { ProviderButton } from './ProviderButton'

const meta = {
  component: ProviderButton,
  title: 'Build/Atoms/ProviderButton',
  tags: ['atom'],
  args: {
    provider: 'google',
    onClick: fn(),
  },
} satisfies Meta<typeof ProviderButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Continue with Google' }),
    ).toBeVisible()
  },
}

/**
 * The row as it appears under a sign-in form. Icon-only keeps four providers
 * on one line at 375px, and each still announces "Continue with …".
 */
export const Row: Story = {
  render: (args) => (
    <Stack direction="row" gap={12} justify="center">
      <ProviderButton {...args} provider="google" />
      <ProviderButton {...args} provider="linkedin" />
      <ProviderButton {...args} provider="microsoft" />
      <ProviderButton {...args} provider="github" />
    </Stack>
  ),
  play: async ({ canvas }) => {
    for (const name of ['Google', 'LinkedIn', 'Microsoft', 'GitHub']) {
      await expect(
        canvas.getByRole('button', { name: `Continue with ${name}` }),
      ).toBeVisible()
    }
  },
}

/**
 * With visible text, for surfaces with room for it — a settings page
 * connecting accounts, or a single-provider sign-in.
 */
export const Labelled: Story = {
  render: (args) => (
    <Stack gap={12} style={{ maxWidth: 320 }}>
      <ProviderButton {...args} provider="google" fullWidth>
        Continue with Google
      </ProviderButton>
      <ProviderButton {...args} provider="linkedin" fullWidth>
        Continue with LinkedIn
      </ProviderButton>
      <ProviderButton {...args} provider="microsoft" fullWidth>
        Continue with Microsoft
      </ProviderButton>
      <ProviderButton {...args} provider="github" fullWidth>
        Continue with GitHub
      </ProviderButton>
    </Stack>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={12} align="center">
      <ProviderButton {...args} size="sm" />
      <ProviderButton {...args} size="md" />
      <ProviderButton {...args} size="lg" />
    </Stack>
  ),
}

/** While a redirect is in flight, so the row can't be pressed twice. */
export const Disabled: Story = {
  render: (args) => (
    <Stack direction="row" gap={12} justify="center">
      <ProviderButton {...args} provider="google" disabled />
      <ProviderButton {...args} provider="linkedin" disabled />
      <ProviderButton {...args} provider="microsoft" disabled />
      <ProviderButton {...args} provider="github" disabled />
    </Stack>
  ),
}
