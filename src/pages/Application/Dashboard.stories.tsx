import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { AppShell } from './AppShell'
import { Dashboard } from './Dashboard'

const meta = {
  component: Dashboard,
  title: 'Experience/Application/Dashboard',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Dashboard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Good afternoon,' }),
    ).toBeVisible()
    await expect(canvas.getByText('3 due')).toBeVisible()
  },
}

/**
 * The greeting reads from the clock it is given, not the one in the room —
 * otherwise this page is a different screenshot depending on when CI runs.
 */
export const Morning: Story = {
  args: { now: new Date('2027-05-04T08:15:00') },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Good morning,' }),
    ).toBeVisible()
  },
}

export const Evening: Story = {
  args: { now: new Date('2027-05-04T20:40:00') },
}

/**
 * Every row's action says the same word, so the announced name carries the
 * person — three buttons called "Follow up" name nobody.
 */
export const ClearingAFollowUp: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Follow up with Marcus Liu' }),
    )

    await expect(canvas.getByText('2 due')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Follow up with Marcus Liu' }),
    ).not.toBeInTheDocument()
  },
}

/** Nobody waiting. The card, the numbers and the lists are all still there. */
export const NothingDue: Story = {
  args: { followUps: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Nobody is waiting on you')).toBeVisible()
  },
}

/** A new account: the card exists, nothing has happened to it yet. */
export const NewAccount: Story = {
  args: { followUps: [], recent: [], events: [] },
}

/** The page in the shell it actually lives in. */
export const InTheShell: Story = {
  render: () => (
    <AppShell currentId="/">
      <Dashboard />
    </AppShell>
  ),
}
