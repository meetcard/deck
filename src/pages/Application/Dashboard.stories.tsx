import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { AppShell } from './AppShell'
import { Dashboard } from './Dashboard'

const meta = {
  component: Dashboard,
  title: 'Experience/Application/Dashboard',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
  /* The greeting reads off the clock, so every story pins it. Without this a
     Chromatic snapshot taken at 11:59 and one taken at 12:01 are a visual
     change nobody made. */
  args: { hour: 14 },
} satisfies Meta<typeof Dashboard>

export default meta
type Story = StoryObj<typeof meta>

/** The page as it opens: your card, what you owe, and the two short lists. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', {
        level: 1,
        name: 'Ready to make it memorable.',
      }),
    ).toBeVisible()

    // The card is the subject of the page, not an illustration on it.
    await expect(
      canvas.getByRole('heading', { name: 'Alex Rivera' }),
    ).toBeVisible()

    /* Every figure is counted from what the page was handed — five cards in
       the pile is five on the tile, not a rounder number that reads better. */
    await expect(canvas.getByText('Connections')).toBeVisible()
    await expect(canvas.getByText('5')).toBeVisible()

    // The queue's count comes from its own rows.
    await expect(canvas.getByText('3 due')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Follow up with Grace Okafor' }),
    ).toBeVisible()

    // Both summaries offer the page they are a summary of.
    await expect(canvas.getByRole('link', { name: 'View all connections' })).toBeVisible()
  },
}

/**
 * Sharing turns the card over rather than raising a dialog — the same card
 * the dashboard opened with, showing its code.
 */
export const SharingTheCard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share' }))

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Share link')).toHaveValue(
        'meetcard.io/alex@northwind',
      )
    })
  },
}

/**
 * Nobody waiting. The panel stays and says so, rather than vanishing and
 * letting the column jump — an empty queue is news, and good news.
 */
export const NothingDue: Story = {
  args: { followUps: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Nobody is waiting on you.')).toBeVisible()
    await expect(canvas.queryByText(/due$/)).not.toBeInTheDocument()
  },
}

/**
 * Phone. One column, and the order is the priority: the card, then what you
 * owe, then the lists.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', {
        level: 1,
        name: 'Ready to make it memorable.',
      }),
    ).toBeVisible()
  },
}

/** In the shell it renders under, at the rail's home destination. */
export const InAppShell: Story = {
  render: (args) => (
    <AppShell currentId="/">
      <Dashboard {...args} />
    </AppShell>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}
