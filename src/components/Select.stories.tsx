import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Select } from './Select'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

const meta = {
  component: Select,
  tags: ['ai-generated'],
  args: {
    options,
    onChange: fn(),
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const select = canvas.getByRole('combobox')
    await userEvent.selectOptions(select, 'banana')
    await expect(select).toHaveValue('banana')
    await expect(args.onChange).toHaveBeenCalledOnce()
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox')).toBeDisabled()
  },
}
