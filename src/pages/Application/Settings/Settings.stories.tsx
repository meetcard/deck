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

/**
 * The two buttons on the card, in the order the card shows them.
 *
 * Reordered with the keyboard here, which is the path that has to work: the
 * product's own screen offers dragging and nothing else, and a grip you can
 * only drag is a control that does not exist for anyone using a keyboard.
 */
export const ReorderingCallsToAction: Story = {
  args: { section: 'profile' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const list = canvasElement.querySelector('.deck-reorder-list')!
    const order = () =>
      [...list.querySelectorAll<HTMLInputElement>(
        '.settings__cta-label input',
      )].map((input) => input.value)

    await expect(order()).toEqual(['Book a time', 'Website'])

    const handle = canvas.getByRole('button', { name: 'Reorder Website' })
    handle.focus()
    await userEvent.keyboard('{ArrowUp}')

    await expect(order()).toEqual(['Website', 'Book a time'])
    // Focus rode along with the row, so a second press moves the same one.
    await expect(handle).toHaveFocus()
  },
}

/**
 * The booking button's position is yours; what it says and where it points
 * are not — those are set in Book with, and two places to edit one button is
 * how they come to disagree. So its fields are read-only and its handle is
 * not: where a button sits on your card is your decision even when its
 * wording is not.
 */
export const TheBookingButtonIsManagedElsewhere: Story = {
  args: { section: 'profile' },
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByText('Your booking button is managed above in Book with.'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('textbox', { name: 'Book a time button label' }),
    ).toHaveAttribute('readonly')

    // Read-only wording, movable row: where it sits on the card is still
    // yours to decide.
    const handle = canvas.getByRole('button', { name: 'Reorder Book a time' })
    handle.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(handle).toHaveFocus()
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

/**
 * Every plan side by side — the screen Billing's "Compare plans" opens, and
 * a route of its own in the product (`/settings/billing/plans`).
 */
export const ComparingPlans: Story = {
  args: { section: 'billing' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'View plans' }))

    await expect(
      await canvas.findByRole('heading', { level: 2, name: 'Available plans' }),
    ).toBeVisible()

    // The plan you are on keeps its place in the row, marked — a comparison
    // that hid it would be missing the column you compare the others against.
    await expect(canvas.getByText('Current')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Manage plan' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Choose Pro' }),
    ).toBeVisible()

    // And the way back, because this is one level down rather than a
    // destination on the nav.
    await expect(canvas.getByRole('link', { name: /Billing/ })).toBeVisible()
  },
}

/**
 * Prices move with the billing period rather than being listed twice — the
 * question here is which plan, and two price columns is two questions.
 */
export const PlansByTheYear: Story = {
  args: { section: 'billing' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'View plans' }))
    await expect(await canvas.findByText('$8')).toBeVisible()

    await userEvent.click(canvas.getByRole('radio', { name: /Yearly/ }))

    // 17% off $8 is $6.64, and the free plan is still free.
    await expect(canvas.getByText('$6.64')).toBeVisible()
    await expect(canvas.getByText('$0')).toBeVisible()
    await expect(
      canvas.getByText('Prices shown per month, billed annually.'),
    ).toBeVisible()
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
