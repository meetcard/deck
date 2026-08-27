import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Textarea } from './Textarea'

const meta = {
  component: Textarea,
  title: 'Build/Molecules/Textarea',
  tags: ['molecule'],
  args: {
    label: 'Meeting notes',
    placeholder: 'What did you talk about?',
    onChange: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Textarea {...args} />
    </div>
  ),
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByLabelText('Meeting notes')
    await userEvent.type(field, 'Follow up about the partnership.')
    await expect(field).toHaveValue('Follow up about the partnership.')
  },
}

export const WithDescription: Story = {
  args: { description: 'Only visible to you.' },
}

export const WithError: Story = {
  args: { error: 'Notes cannot be longer than 500 characters' },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Meeting notes')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  },
}

/** Fixed height, for dense layouts where a resize handle would disrupt flow. */
export const NotResizable: Story = {
  args: { resize: 'none' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Met at SaaSConf.' },
}
