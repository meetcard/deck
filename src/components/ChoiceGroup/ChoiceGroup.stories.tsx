import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChoiceGroup } from './ChoiceGroup'

const meta = {
  component: ChoiceGroup,
  tags: ['molecule'],
  args: {
    label: 'What are you looking to discuss?',
    options: [
      { value: 'sales', label: 'Sales inquiry' },
      { value: 'demo', label: 'Product demo' },
      { value: 'partnership', label: 'Partnership' },
    ],
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return <ChoiceGroup {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof ChoiceGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Pills: Story = {}

export const Selected: Story = {
  args: { value: 'demo' },
}

/** Tiles suit comparable options that each carry a supporting line. */
export const Tiles: Story = {
  args: {
    label: 'How long do you need?',
    variant: 'tile',
    options: [
      { value: '15', label: '15 min', description: 'Quick question' },
      { value: '30', label: '30 min', description: 'Most popular' },
      { value: '45', label: '45 min', description: 'Deep dive' },
    ],
  },
}

/**
 * A `hint` explains what the choice sets in motion, and appears only once
 * that option is selected.
 */
export const WithRoutingHint: Story = {
  args: {
    required: true,
    options: [
      { value: 'sales', label: 'Sales inquiry', hint: 'Routes to Priya Shah.' },
      { value: 'demo', label: 'Product demo', hint: 'Routes to Marcus Lee.' },
      {
        value: 'partnership',
        label: 'Partnership',
        hint: '2 people can help with this.',
      },
    ],
  },
}

export const WithError: Story = {
  args: { required: true, error: 'Pick a topic to continue.' },
}

export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: 'sales', label: 'Sales inquiry' },
      { value: 'demo', label: 'Product demo' },
      { value: 'support', label: 'Support', disabled: true },
    ],
  },
}
