import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Select } from './Select'

const options = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'event', label: 'Event' },
]

const meta = {
  component: Select,
  tags: ['molecule'],
  args: {
    label: 'Card type',
    options,
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Select {...args} />
    </div>
  ),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const select = canvas.getByLabelText('Card type')
    await userEvent.selectOptions(select, 'personal')
    await expect(select).toHaveValue('personal')
    await expect(args.onChange).toHaveBeenCalled()
  },
}

/** A placeholder gives an empty select a meaningful initial state. */
export const WithPlaceholder: Story = {
  args: { placeholder: 'Choose a type…', defaultValue: '' },
}

export const WithDescription: Story = {
  args: { description: 'Determines which details are shared by default.' },
}

export const WithError: Story = {
  args: { error: 'Choose a card type to continue' },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Card type')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithDisabledOption: Story = {
  args: {
    options: [...options, { value: 'team', label: 'Team (Pro only)', disabled: true }],
  },
}

/**
 * Regression guard. The chevron is a real `<svg>`, not a CSS
 * `background-image` — if it were, axe could not resolve the control's
 * background color and would report an inconclusive contrast result.
 */
export const ChevronIsNotABackgroundImage: Story = {
  play: async ({ canvas }) => {
    const select = canvas.getByLabelText('Card type')
    await expect(getComputedStyle(select).backgroundImage).toBe('none')
  },
}
