import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { AppShell } from './AppShell'
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
 * Profile — where Settings opens. How you appear on the card people are
 * handed, from the photo down to who is allowed to see any of it.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Settings' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Your identity' }),
    ).toBeVisible()
    // The nav says where you are, and says it in the accessibility tree
    // rather than only in the fill.
    await expect(canvas.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/**
 * Editing the card at the top edits the card below it — the segmented control
 * swaps which of your two cards every field underneath is about.
 */
export const SwitchingCards: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByLabelText('Card URL')).toHaveValue(
      'alex@northwind',
    )

    await userEvent.click(canvas.getByRole('radio', { name: 'Personal' }))

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Card URL')).toHaveValue('alex')
    })
    // The company cross-link belongs to the business card only — a personal
    // card inherits nothing from a company.
    await expect(
      canvas.queryByText('Cover image & brand colours'),
    ).not.toBeInTheDocument()
  },
}

/**
 * The embed snippet is generated, not stored: switching the display rewrites
 * the line you would paste, so what is on screen is always what would run.
 */
export const EmbeddingTheBooker: Story = {
  play: async ({ canvas, userEvent }) => {
    // The person's own handle, so the widget opens the booker their card does.
    await expect(
      canvas.getByText(/meetcard-book type="person" handle="alex@northwind"/, {
        selector: 'code',
      }),
    ).toBeVisible()

    await userEvent.click(canvas.getByRole('radio', { name: 'Button' }))

    await waitFor(async () => {
      await expect(
        canvas.getByText(/display="button"/, { selector: 'code' }),
      ).toBeVisible()
    })

    /* The control names itself for what it does, and there is only one of it
       on the panel — copying is not tested here, because a clipboard write is
       the browser's business and not the panel's. */
    await expect(
      canvas.getByRole('button', { name: 'Copy embed code' }),
    ).toBeVisible()
  },
}

/**
 * The nav is real links, and the page intercepts them the way a router would.
 * Choosing a section swaps the panel without leaving the page.
 */
export const Navigating: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Team' }))

    await waitFor(async () => {
      await expect(
        canvas.getByRole('heading', { level: 2, name: 'Team' }),
      ).toBeVisible()
    })
    await expect(canvas.getByRole('link', { name: 'Team' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/** Sign-in credentials, connected providers, sessions, and the way out. */
export const Account: Story = {
  args: { section: '/settings/account' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Account & security' }),
    ).toBeVisible()
  },
}

/**
 * Taking away the last way into an account is a lockout, not a setting — so
 * the last connected provider says so instead of offering the button.
 */
export const TheLastWayIn: Story = {
  args: { section: '/settings/account' },
  play: async ({ canvas, userEvent }) => {
    // Google and GitHub both start connected; disconnecting one leaves the
    // other as the only way in.
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Disconnect' })[0],
    )

    await waitFor(async () => {
      await expect(
        canvas.getByText(/your only way in, so it can't be disconnected/),
      ).toBeVisible()
    })
  },
}

/** Which alerts you get, and how they reach you. */
export const Notifications: Story = {
  args: { section: '/settings/notifications' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Notification preferences' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('switch', { name: 'Follow-up reminders' }),
    ).toBeChecked()
  },
}

/** The plan, what it has been used for, and what it costs. */
export const Billing: Story = {
  args: { section: '/settings/billing' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Plan, usage & payments' }),
    ).toBeVisible()
  },
}

/**
 * The seat stepper buys seats; it does not fill them. Its floor is the number
 * of people already on the team, since dropping below that would sign someone
 * out of an account they are using.
 */
export const SeatsHaveAFloor: Story = {
  args: { section: '/settings/billing' },
  play: async ({ canvas, userEvent }) => {
    // Ten bought, five filled — five presses reach the floor. Re-queried each
    // time: the row re-renders, so a reference captured once goes stale.
    for (let press = 0; press < 5; press += 1) {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Remove seat' }),
      )
    }

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Remove seat' }),
      ).toBeDisabled()
    })
    await expect(canvas.getByText('5 seats · $45/month')).toBeVisible()
  },
}

/**
 * Plans is Billing's one sub-page — reached from it, left by the breadcrumb,
 * and deliberately not a ninth entry in the nav.
 */
export const Plans: Story = {
  args: { section: '/settings/billing/plans' },
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Available plans' }),
    ).toBeVisible()
    // Billing stays lit, because Plans is inside it. Scoped to the nav —
    // the breadcrumb has a "Billing" link of its own.
    const nav = within(canvas.getByRole('navigation', { name: 'Settings' }))
    await expect(nav.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await userEvent.click(canvas.getByRole('radio', { name: 'Yearly' }))
    await waitFor(async () => {
      await expect(canvas.getByText('$6.67')).toBeVisible()
    })
  },
}

/** The brand every teammate's business card inherits. */
export const Company: Story = {
  args: { section: '/settings/company' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Company settings' }),
    ).toBeVisible()

    /* The same band as Profile's, about the team's booker rather than one
       person's — `company`, not `handle`, and the identifier the company's
       own share link carries. */
    await expect(
      canvas.getByText(/meetcard-book type="team" company="@northwind"/, {
        selector: 'code',
      }),
    ).toBeVisible()
  },
}

/** The systems MeetCard hands work off to, grouped by what they are for. */
export const Integrations: Story = {
  args: { section: '/settings/integrations' },
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Connected tools' }),
    ).toBeVisible()

    const connect = canvas.getAllByRole('button', { name: 'Connect' })[0]
    await userEvent.click(connect)

    await waitFor(async () => {
      await expect(canvas.getByText('Salesforce')).toBeVisible()
    })
  },
}

/** Who is on the account, what they can do, and what it costs in seats. */
export const Team: Story = {
  args: { section: '/settings/team' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Team' }),
    ).toBeVisible()
    // An invitation holds a seat from the moment it is sent, so it is in the
    // list rather than in a pending tray the count would contradict.
    await expect(canvas.getByText('Invitation pending')).toBeVisible()
  },
}

/** Inviting takes a seat, and the panel says which one before you send it. */
export const InvitingATeammate: Story = {
  args: { section: '/settings/team' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Invite member' }))

    const email = await canvas.findByLabelText('Work email')
    await userEvent.type(email, 'noor@northwind.studio')
    await userEvent.click(canvas.getByRole('button', { name: 'Send invitation' }))

    await waitFor(async () => {
      await expect(canvas.getByText('Invitation sent')).toBeVisible()
    })
    await expect(canvas.getByText('6 of 10 seats used')).toBeVisible()
  },
}

/** In the shell it renders under, at the rail's `/settings` destination. */
export const InAppShell: Story = {
  render: (args) => (
    <AppShell currentId="/settings">
      <Settings {...args} />
    </AppShell>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Settings' }),
    ).toHaveAttribute('aria-current', 'page')
  },
}

/**
 * Phone. Eight destinations stacked above the panel would push the panel off
 * the screen, so `SettingsNav` becomes the platform's own picker.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Select settings option')).toBeVisible()
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Your identity' }),
    ).toBeVisible()
  },
}
