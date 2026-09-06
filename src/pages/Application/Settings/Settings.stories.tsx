import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { AppShell } from '../AppShell'
import { Settings } from './Settings'

const meta = {
  component: Settings,
  title: 'Experience/Application/Settings',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Settings>

export default meta
type Story = StoryObj<typeof meta>

/**
 * How you appear on your card, and the rules behind the booking button on it.
 * The longest section, and deliberately one screen — it is all the same object.
 */
export const Profile: Story = {
  args: { section: 'profile' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Your identity' }),
    ).toBeVisible()
    // The preview is the section's argument: rules rendered as their outcome.
    await expect(canvas.getByText('Mon, Sep 7')).toBeVisible()
  },
}

/** Sign-in, providers, sessions, and the two doors out — export and delete. */
export const Account: Story = {
  args: { section: 'account' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Delete account' }),
    ).toBeVisible()
  },
}

/** Which alerts arrive, and how. The cadence nests under what it paces. */
export const Notifications: Story = {
  args: { section: 'notifications' },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('radio', { name: 'Weekly' })).toBeChecked()

    /* Turning the reminder off takes its cadence with it — there is nothing
       left to pace. Reached by role, because "Follow-up reminders" is also
       the group's heading right above the row. */
    await userEvent.click(
      canvas.getByRole('switch', { name: 'Follow-up reminders' }),
    )
    await expect(
      canvas.queryByRole('radio', { name: 'Weekly' }),
    ).not.toBeInTheDocument()
  },
}

/** Plan, usage, seats, payment, invoices. */
export const Billing: Story = {
  args: { section: 'billing' },
  play: async ({ canvas, userEvent }) => {
    // The price moves with the seats, because the price is what is being
    // decided — not the count.
    await expect(canvas.getByText('6 seats · $54/month')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Add a seat' }))
    await expect(canvas.getByText('7 seats · $63/month')).toBeVisible()
  },
}

/** The company behind the business card, and where team bookings go. */
export const Company: Story = {
  args: { section: 'company' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Company settings' }),
    ).toBeVisible()
  },
}

/**
 * No save bar. Connecting a service is an OAuth round trip that has already
 * happened by the time the row changes.
 */
export const Integrations: Story = {
  args: { section: 'integrations' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Connect Salesforce' }),
    )
    await expect(
      canvas.getByRole('button', { name: 'Disconnect Salesforce' }),
    ).toBeVisible()
  },
}

/** Invitations sit in the roster, because a seat is spent when one goes out. */
export const Team: Story = {
  args: { section: 'team' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('5 of 10 seats used')).toBeVisible()
    // The pending invitation is in the roster, not filed below it.
    await expect(canvas.getByText('dana@meetcard.io')).toBeVisible()
    await expect(canvas.getByText('Invited')).toBeVisible()
  },
}

/** Moving between sections. Each one remounts, so no draft leaks into the next. */
export const SwitchingSections: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Team' }))
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Team' }),
    ).toBeVisible()
  },
}

/** The page in the shell it actually lives in. */
export const InTheShell: Story = {
  render: () => (
    <AppShell currentId="/settings">
      <Settings />
    </AppShell>
  ),
}
