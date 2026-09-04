import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { Divider } from './Divider'

const meta = {
  component: Divider,
  title: 'Build/Atoms/Divider',
  tags: ['atom'],
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: (args) => (
    <Stack gap={12}>
      <Text>Above the rule</Text>
      <Divider {...args} />
      <Text>Below the rule</Text>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    )
  },
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Stack direction="row" gap={12} align="center">
      <Text>Left</Text>
      <Divider {...args} />
      <Text>Right</Text>
    </Stack>
  ),
}

/** Hidden from assistive tech when the grouping is already conveyed. */
export const Decorative: Story = {
  args: { decorative: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('separator')).not.toBeInTheDocument()
  },
}

export const Strong: Story = {
  args: { strong: true },
}

/**
 * A caption set into the rule, for the "OR" between a form and the row of
 * SSO providers beside it. Renders `<div role="separator">` rather than
 * `<hr>` — a void element has nowhere to put the words.
 */
export const Labelled: Story = {
  args: { label: 'OR' },
  render: (args) => (
    <Stack gap={12}>
      <Text>Sign in with your email</Text>
      <Divider {...args} />
      <Text>Sign in with a provider</Text>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const separator = canvas.getByRole('separator')
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    await expect(separator).toHaveTextContent('OR')
  },
}

/** A caption needs a horizontal rule; `vertical` ignores it. */
export const LabelledVerticalFallsBack: Story = {
  args: { label: 'OR', orientation: 'vertical' },
  render: (args) => (
    <Stack direction="row" gap={12} align="center">
      <Text>Left</Text>
      <Divider {...args} />
      <Text>Right</Text>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toBeEmptyDOMElement()
  },
}
