import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Avatar } from './Avatar'

const photo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%232e6e5b"/><circle cx="40" cy="32" r="14" fill="%23faf8f4"/><path d="M12 80c0-18 12-28 28-28s28 10 28 28z" fill="%23faf8f4"/></svg>`,
  )

const meta = {
  component: Avatar,
  args: { name: 'Ada Lovelace' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

/** With no image, initials are derived from the name. */
export const Initials: Story = {
  play: async ({ canvas }) => {
    const avatar = canvas.getByRole('img', { name: 'Ada Lovelace' })
    await expect(avatar).toHaveTextContent('AL')
  },
}

export const WithPhoto: Story = {
  args: { src: photo },
}

/**
 * A broken image URL falls back to initials rather than a broken-image icon.
 */
export const BrokenImageFallsBack: Story = {
  args: { src: 'https://example.invalid/missing.png' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('AL', {}, { timeout: 3000 }),
    ).toBeVisible()
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={12} align="center">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar {...args} key={size} size={size} />
      ))}
    </Stack>
  ),
}

/** `rounded` reads as a logo; `circle` reads as a person. */
export const Shapes: Story = {
  render: (args) => (
    <Stack direction="row" gap={12} align="center">
      <Avatar {...args} shape="circle" />
      <Avatar {...args} name="MeetCard" shape="rounded" />
    </Stack>
  ),
}

/**
 * Inside a card the name is usually already rendered as text, so the avatar
 * is marked decorative to avoid a screen reader announcing it twice.
 */
export const Decorative: Story = {
  args: { decorative: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument()
  },
}
