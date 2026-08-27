import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { Link } from './Link'

const meta = {
  component: Link,
  title: 'Build/Atoms/Link',
  tags: ['atom'],
  args: { children: 'Back to your deck', href: '#' },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: (args) => (
    <Stack gap={8}>
      <Link {...args} tone="brand">
        brand
      </Link>
      <Link {...args} tone="default">
        default
      </Link>
      <Link {...args} tone="muted">
        muted
      </Link>
    </Stack>
  ),
}

/** `always` is clearer for standalone links; `hover` keeps prose calm. */
export const Underline: Story = {
  render: (args) => (
    <Stack gap={8}>
      <Link {...args} underline="hover">
        underline on hover
      </Link>
      <Link {...args} underline="always">
        always underlined
      </Link>
    </Stack>
  ),
}

export const InProse: Story = {
  render: (args) => (
    <Text style={{ maxWidth: 420 }}>
      Every connection you make is saved to your deck. You can{' '}
      <Link {...args}>review them</Link>{' '}
      at any time.
    </Text>
  ),
}

/**
 * External links get safe `rel`, open in a new tab, and append a visually
 * hidden note so the behaviour is announced rather than merely implied.
 */
export const External: Story = {
  args: { external: true, href: 'https://example.com', children: 'meetcard.com' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    // Exact name, as a real browser computes it.
    await expect(link).toHaveAccessibleName('meetcard.com (opens in a new tab)')
  },
}
