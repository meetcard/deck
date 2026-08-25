import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Autocomplete, type AutocompleteProps } from './Autocomplete'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

function AutocompleteHarness(props: AutocompleteProps) {
  const [value, setValue] = useState(props.value)
  return (
    <Autocomplete
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next)
        props.onChange(next)
      }}
    />
  )
}

const meta = {
  component: Autocomplete,
  tags: ['ai-generated'],
  args: {
    options,
    value: '',
    onChange: fn(),
    onSelect: fn(),
    placeholder: 'Search fruit…',
  },
  render: (args) => <AutocompleteHarness {...args} />,
} satisfies Meta<typeof Autocomplete>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole('combobox')
    await userEvent.type(input, 'ap')
    await expect(canvas.getByRole('listbox')).toBeVisible()
    await expect(canvas.getAllByRole('option')).toHaveLength(2)

    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect(input).toHaveValue('Apple')
    await expect(args.onSelect).toHaveBeenCalledWith(options[0])
  },
}

export const NoMatches: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox')
    await userEvent.type(input, 'zzz')
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}
