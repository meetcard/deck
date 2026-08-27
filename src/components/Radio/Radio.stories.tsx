import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Radio, RadioGroup } from './Radio'

const meta = {
  component: RadioGroup,
  title: 'Build/Atoms/Radio',
  tags: ['atom'],
  subcomponents: { Radio },
  args: {
    label: 'Card visibility',
    // Overridden by each story's `render`; present so the required
    // `children` prop is satisfied for the docs table.
    children: <Radio value="link" label="Anyone with the link" />,
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Controlled usage — `RadioGroup` distributes `name` and `value` to options. */
export const Default: Story = {
  args: { onChange: fn() },
  render: function Render(args) {
    const [value, setValue] = useState('link')
    return (
      <RadioGroup
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next)
          args.onChange?.(next)
        }}
      >
        <Radio value="link" label="Anyone with the link" />
        <Radio value="connections" label="My connections" />
        <Radio value="private" label="Only me" />
      </RadioGroup>
    )
  },
  play: async ({ canvas, userEvent }) => {
    const option = canvas.getByRole('radio', { name: 'Only me' })
    await userEvent.click(option)
    await expect(option).toBeChecked()
    await expect(
      canvas.getByRole('radio', { name: 'Anyone with the link' }),
    ).not.toBeChecked()
  },
}

export const WithDescriptions: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio
        value="link"
        label="Anyone with the link"
        description="Best for conferences and open networking."
      />
      <Radio
        value="private"
        label="Only me"
        description="Your card stays hidden until you share it directly."
      />
    </RadioGroup>
  ),
}

export const WithError: Story = {
  args: { error: 'Choose who can see your card' },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="link" label="Anyone with the link" />
      <Radio value="private" label="Only me" />
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, value: 'link' },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="link" label="Anyone with the link" />
      <Radio value="private" label="Only me" />
    </RadioGroup>
  ),
}
