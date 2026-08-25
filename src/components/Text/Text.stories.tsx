import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '../Stack/Stack'
import { Text } from './Text'

const meta = {
  component: Text,
  args: { children: 'Capture every connection, activate every relationship.' },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The full Body ramp, 20/30 down to 12/18. */
export const Sizes: Story = {
  render: (args) => (
    <Stack gap={12}>
      <Text {...args} size="xl" />
      <Text {...args} size="lg" />
      <Text {...args} size="md" />
      <Text {...args} size="sm" />
      <Text {...args} size="xs" />
    </Stack>
  ),
}

/** Semantic tones. Never communicate meaning with color alone. */
export const Tones: Story = {
  render: (args) => (
    <Stack gap={8}>
      <Text {...args} tone="default">
        default — primary reading color
      </Text>
      <Text {...args} tone="muted">
        muted — secondary and supporting copy
      </Text>
      <Text {...args} tone="brand">
        brand — Signal Green emphasis
      </Text>
      <Text {...args} tone="display">
        display — warm Clay accent
      </Text>
      <Text {...args} tone="error">
        error — validation and failure messages
      </Text>
      <Text {...args} tone="disabled">
        disabled — inert content
      </Text>
    </Stack>
  ),
}

/** Clamps to one line. Useful in cards where names can be arbitrarily long. */
export const Truncated: Story = {
  args: { truncate: true },
  render: (args) => (
    <div style={{ maxWidth: 260 }}>
      <Text {...args} />
    </div>
  ),
}
