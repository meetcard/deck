import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Input } from './Input'

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle
      cx="7"
      cy="7"
      r="4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M10.5 10.5L14 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const meta = {
  component: Input,
  tags: ['molecule'],
  args: {
    label: 'Work email',
    placeholder: 'ada@meetcard.com',
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Input {...args} />
    </div>
  ),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('Work email')
    await userEvent.type(input, 'ada@meetcard.com')
    await expect(input).toHaveValue('ada@meetcard.com')
  },
}

/** Descriptions are wired up with `aria-describedby` automatically. */
export const WithDescription: Story = {
  args: {
    description: 'We only use this to match you with existing connections.',
  },
}

/**
 * An error sets `aria-invalid` and is announced via `role="alert"`, so the
 * failure reaches screen reader users, not just sighted ones.
 */
export const WithError: Story = {
  args: { error: 'Enter a valid work email address', defaultValue: 'ada@' },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Work email')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Enter a valid work email address',
    )
  },
}

export const Required: Story = {
  args: { required: true },
}

export const WithIcon: Story = {
  args: { label: 'Search your deck', iconStart: <SearchIcon />, placeholder: 'Search' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'ada@meetcard.com' },
}

/** Visually hidden label — still fully announced. Use sparingly. */
export const HiddenLabel: Story = {
  args: { hideLabel: true, label: 'Search your deck', placeholder: 'Search' },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Search your deck')).toBeVisible()
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={12} style={{ maxWidth: 320 }}>
      <Input {...args} size="sm" label="Small" />
      <Input {...args} size="md" label="Medium" />
      <Input {...args} size="lg" label="Large" />
    </Stack>
  ),
}
