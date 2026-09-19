import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '../Stack/Stack'
import { Badge } from './Badge'

const tones = ['neutral', 'brand', 'success', 'warning', 'error'] as const

const meta = {
  component: Badge,
  title: 'Build/Atoms/Badge',
  tags: ['atom'],
  args: { children: 'Connected' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Default emphasis — tinted background, readable text. */
export const Subtle: Story = {
  render: (args) => (
    <Stack direction="row" gap={8} wrap>
      {tones.map((tone) => (
        <Badge {...args} key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </Stack>
  ),
}

/** Solid, for the one status on a surface that has to be seen first. */
export const Solid: Story = {
  render: (args) => (
    <Stack direction="row" gap={8} wrap>
      {tones.map((tone) => (
        <Badge {...args} key={tone} tone={tone} variant="solid">
          {tone}
        </Badge>
      ))}
    </Stack>
  ),
}

/** Outline, for descriptive labels that should recede — a tag, not a state. */
export const Outline: Story = {
  render: (args) => (
    <Stack direction="row" gap={8} wrap>
      {tones.map((tone) => (
        <Badge {...args} key={tone} tone={tone} variant="outline">
          {tone}
        </Badge>
      ))}
    </Stack>
  ),
}

/** A dot adds a non-color cue to the status, which color alone cannot carry. */
export const WithDot: Story = {
  args: { dot: true, tone: 'success' },
}

/** `sm` sits inline with body text; `md` stands on its own. */
export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={8} align="center">
      <Badge {...args} size="sm">
        Small
      </Badge>
      <Badge {...args} size="md">
        Medium
      </Badge>
    </Stack>
  ),
}
