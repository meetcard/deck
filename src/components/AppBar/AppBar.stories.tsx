import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Avatar } from '../Avatar/Avatar'
import { IconButton } from '../IconButton/IconButton'
import { AppBar } from './AppBar'

const Brand = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect width="24" height="24" rx="6" fill="var(--deck-color-action-primary)" />
    <path
      d="M7 16V8l5 5 5-5v8"
      fill="none"
      stroke="var(--deck-color-action-primary-text)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const meta = {
  component: AppBar,
  args: {
    brand: <Brand />,
    actions: (
      <IconButton
        label="Me"
        variant="ghost"
        icon={<Avatar name="Ada Lovelace" size="xs" decorative />}
      />
    ),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppBar>

export default meta
type Story = StoryObj<typeof meta>

/** The mark at the left, account access at the right. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Me' })).toBeVisible()
  },
}

export const WithTitle: Story = {
  args: { title: 'Connections' },
}

/** Company is reached through "Me" rather than the bottom bar — it is
 *  conditional, so it is not a peer of the primary destinations. */
export const TitleOnly: Story = {
  args: { brand: undefined, title: 'Settings' },
}
