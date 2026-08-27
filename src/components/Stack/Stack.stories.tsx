import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from '../Card/Card'
import { Text } from '../Text/Text'
import { Stack } from './Stack'

const Box = ({ label }: { label: string }) => (
  <Card padding={12} elevation="none" surface="subtle">
    <Text size="sm">{label}</Text>
  </Card>
)

const meta = {
  component: Stack,
  title: 'Build/Atoms/Stack',
  tags: ['atom'],
  args: { gap: 12 },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

export const Column: Story = {
  render: (args) => (
    <Stack {...args}>
      <Box label="First" />
      <Box label="Second" />
      <Box label="Third" />
    </Stack>
  ),
}

export const Row: Story = {
  args: { direction: 'row' },
  render: (args) => (
    <Stack {...args}>
      <Box label="First" />
      <Box label="Second" />
      <Box label="Third" />
    </Stack>
  ),
}

/** Gap accepts any Deck space step, so rhythm stays token-bound. */
export const GapScale: Story = {
  render: () => (
    <Stack gap={24}>
      {([4, 8, 16, 32] as const).map((gap) => (
        <Stack key={gap} direction="row" gap={gap} align="center">
          <Text size="xs" tone="muted" style={{ width: 48 }}>
            {gap}px
          </Text>
          <Box label="A" />
          <Box label="B" />
          <Box label="C" />
        </Stack>
      ))}
    </Stack>
  ),
}

/** Renders as a real list when the content is one. */
export const AsList: Story = {
  args: { as: 'ul', gap: 8 },
  render: (args) => (
    <Stack {...args}>
      <li>
        <Box label="List item one" />
      </li>
      <li>
        <Box label="List item two" />
      </li>
    </Stack>
  ),
}
