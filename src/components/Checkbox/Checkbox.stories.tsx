import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Checkbox } from './Checkbox'

const meta = {
  component: Checkbox,
  title: 'Build/Atoms/Checkbox',
  tags: ['atom'],
  args: { label: 'Add to CRM', onChange: fn() },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Add to CRM' })
    await expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
  },
}

/** Checked by default — an option most people keep. */
export const Checked: Story = {
  args: { defaultChecked: true },
}

/** The mixed state for a "select all" that only covers part of a list. */
export const Indeterminate: Story = {
  args: { label: 'Select all', indeterminate: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'mixed',
    )
  },
}

/** With a description, when the label alone leaves the consequence unclear. */
export const WithDescription: Story = {
  args: {
    description: 'Syncs this contact to your connected CRM within a minute.',
  },
}

/** In error. The message is announced, not only drawn in red. */
export const WithError: Story = {
  args: { error: 'You must accept to continue', label: 'I agree to the terms' },
}

/**
 * Disabled, unchecked and checked — a setting that exists but cannot be
 * changed here.
 */
export const Disabled: Story = {
  render: (args) => (
    <Stack gap={12}>
      <Checkbox {...args} disabled />
      <Checkbox {...args} disabled defaultChecked label="Add to CRM (locked)" />
    </Stack>
  ),
}
