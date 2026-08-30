import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { PasswordInput } from './PasswordInput'

const meta = {
  component: PasswordInput,
  title: 'Build/Molecules/PasswordInput',
  tags: ['molecule'],
  args: {
    label: 'Password',
    placeholder: '••••••••',
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <PasswordInput {...args} />
    </div>
  ),
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

/** Signing in: masked, and `autocomplete="current-password"` so a manager fills. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('Password')
    await userEvent.type(input, 'correct horse battery staple')
    await expect(input).toHaveAttribute('type', 'password')
  },
}

/**
 * The reveal swaps the input `type` in place, so the value — and anything a
 * password manager filled — survives the toggle.
 */
export const Revealed: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('Password')
    await userEvent.type(input, 'correct horse battery staple')
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }))

    await expect(input).toHaveAttribute('type', 'text')
    await expect(input).toHaveValue('correct horse battery staple')
    await expect(
      canvas.getByRole('button', { name: 'Hide password' }),
    ).toBeVisible()
  },
}

/**
 * Signing up. `purpose="new"` is what prompts a password manager to offer a
 * generated password rather than an existing one.
 */
export const NewPassword: Story = {
  args: {
    purpose: 'new',
    description: 'At least 12 characters.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
  },
}

export const WithError: Story = {
  args: { error: "That password doesn't match our records." },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeVisible()
  },
}

/**
 * For fields filled on a shared or projected screen, where putting the
 * password on screen is the wrong default.
 */
export const WithoutReveal: Story = {
  args: { revealable: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div
      style={{ display: 'grid', gap: 16, maxWidth: 320 }}
    >
      <PasswordInput {...args} size="sm" label="Small" />
      <PasswordInput {...args} size="md" label="Medium" />
      <PasswordInput {...args} size="lg" label="Large" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, value: 'hunter2' },
}
