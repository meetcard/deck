import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { FollowUpList } from './FollowUpList'

const meta = {
  component: FollowUpList,
  title: 'Build/Molecules/FollowUpList',
  tags: ['molecule'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FollowUpList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      {
        id: 'priya',
        name: 'Priya Shah',
        reason: 'Met at RevOps',
        since: '2 days ago',
        href: '/connections',
      },
      {
        id: 'marcus',
        name: 'Marcus Liu',
        reason: 'Promised an intro',
        since: 'Yesterday',
        href: '/connections',
      },
      {
        id: 'hannah',
        name: 'Hannah Davis',
        reason: 'Wants to book a time',
        href: '/connections',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The count is derived, not passed — it cannot disagree with the rows.
    await expect(canvas.getByText('3 due')).toBeInTheDocument()

    // Three actions with the same visible word, told apart by name.
    await expect(
      canvas.getByRole('link', { name: 'Follow up with Marcus Liu' }),
    ).toBeInTheDocument()
  },
}

/**
 * With no route to send someone to, the row's action is a real button and
 * the caller handles it in place.
 */
export const FollowsUpInPlace: Story = {
  args: {
    items: [
      {
        id: 'priya',
        name: 'Priya Shah',
        reason: 'Met at RevOps',
        since: '2 days ago',
        onFollowUp: fn(),
      },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Follow up with Priya Shah' }),
    )
    await expect(args.items[0].onFollowUp).toHaveBeenCalled()
  },
}

/** A row with nothing to say about why is still a row worth clearing. */
export const WithoutContext: Story = {
  args: {
    items: [{ id: 'hannah', name: 'Hannah Davis', href: '/connections' }],
  },
}

/** Nothing due. The panel says so rather than disappearing, so the space
 *  a dashboard reserves for it does not collapse from under the reader. */
export const Empty: Story = {
  args: {
    items: [],
  },
}
