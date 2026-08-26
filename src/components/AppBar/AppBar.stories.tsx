import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Mark } from '../../foundations/brand'
import { Avatar } from '../Avatar/Avatar'
import { IconButton } from '../IconButton/IconButton'
import { AppBar } from './AppBar'

const meta = {
  component: AppBar,
  args: {
    brand: <Mark style={{ height: 24, width: 24 }} />,
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
