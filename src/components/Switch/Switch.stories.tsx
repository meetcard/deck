import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Switch } from './Switch'

const meta = {
  component: Switch,
  title: 'Build/Atoms/Switch',
  tags: ['atom'],
  args: { label: 'Discoverable by email', onChange: fn() },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch', {
      name: 'Discoverable by email',
    })
    await userEvent.click(toggle)
    await expect(toggle).toBeChecked()
  },
}

export const On: Story = {
  args: { defaultChecked: true },
}

/**
 * Use a Switch when the change applies immediately. If it only takes effect
 * on submit, use a Checkbox instead.
 */
export const WithDescription: Story = {
  args: {
    description:
      'People who already have your email can find your card instantly.',
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const DisabledOn: Story = {
  args: { disabled: true, defaultChecked: true },
}
