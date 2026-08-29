import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { findOpenDialog } from '../../test/dialog'
import { AccountSheet, AccountSheetRow } from './AccountSheet'
import type { AccountCard } from './AccountSheet'

const iconProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** Stands in for the composition layer's own icon set. */
const BriefcaseIcon = (
  <svg {...iconProps} aria-hidden="true">
    <rect x="1.5" y="4.5" width="13" height="9" rx="2" />
    <path d="M5.5 4.5V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5" />
  </svg>
)

/*
 * No `href`s. Deck has no router, so a story that handed these rows real
 * addresses would be a story you can click into a 404 — see `AsLinks` for the
 * routed form, which is what a real app passes.
 */
const cards: AccountCard[] = [
  {
    id: 'personal',
    label: 'Personal card',
    link: 'meetcard.io/ben',
  },
  {
    id: 'business',
    label: 'Business card',
    link: 'meetcard.io/ben@meetcard',
    icon: BriefcaseIcon,
    isDefault: true,
  },
]

const meta = {
  component: AccountSheet,
  title: 'Build/Organisms/AccountSheet',
  tags: ['organism'],
  args: {
    name: 'Ben Ackles',
    handle: '/ben',
    cards,
    onSelectCard: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof AccountSheet>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Open, as it arrives from the avatar in the app bar: who you are signed in
 * as, the cards you can hand over with the links that tell them apart, and
 * the way into settings.
 */
export const Default: Story = {
  args: { open: true },
  play: async ({ canvasElement }) => {
    const dialog = await findOpenDialog(canvasElement)
    const panel = within(dialog)

    await expect(dialog).toHaveAccessibleName('Account')
    await expect(panel.getByText('Ben Ackles')).toBeVisible()

    // The link is on the row, not behind it — it is what distinguishes one
    // card from the other.
    await expect(panel.getByText('meetcard.io/ben@meetcard')).toBeVisible()
    await expect(
      panel.getByRole('button', { name: /Business card/ }),
    ).toHaveTextContent('Default')

    // Buttons, not links: nothing here is routed, so nothing here claims to
    // be an address.
    await expect(panel.queryByRole('link')).not.toBeInTheDocument()
  },
}

/**
 * With routing. Given an `href` a row becomes a real link — openable in a new
 * tab, copyable, and announced as a link — which is what an app with routes
 * should pass. The rows above are buttons only because Deck has nowhere to
 * send them.
 *
 * `/settings/profile` is the product's own destination: this entry point
 * comes from a person's own face, so the section about them is the one they
 * meant, rather than a settings index.
 */
export const AsLinks: Story = {
  args: {
    open: true,
    settingsHref: '/settings/profile',
    cards: cards.map((card) => ({
      ...card,
      href: `/cards/${card.link?.replace('meetcard.io/', '')}`,
    })),
  },
  play: async ({ canvasElement }) => {
    const panel = within(await findOpenDialog(canvasElement))

    await expect(
      panel.getByRole('link', { name: /Personal card/ }),
    ).toHaveAttribute('href', '/cards/ben')
    await expect(panel.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings/profile',
    )
  },
}

/**
 * From the control that opens it. The drawer is a real modal — focus moves
 * into it, Escape closes it, and the page behind is inert — because it is a
 * native `<dialog>` rather than a positioned `<div>`.
 */
export const FromTheAppBar: Story = {
  args: { open: false },
  render: function FromTheAppBarStory(args) {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Account</Button>
        <AccountSheet {...args} open={open} onClose={() => setOpen(false)} />
      </>
    )
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Account' }))

    const dialog = await findOpenDialog(canvasElement)
    await expect(
      within(dialog).getByRole('button', { name: /Personal card/ }),
    ).toBeVisible()
  },
}

/**
 * Phone. The drawer keeps its edge at every width rather than becoming a
 * bottom sheet — it is a list of destinations hanging off a control in the
 * top-right corner, and a panel that flew to the bottom would leave the thing
 * that opened it behind. The sliver of page at the start edge is what says
 * this is over the app rather than a screen the app navigated to.
 */
export const Mobile: Story = {
  args: { open: true },
  // Same pairing as SettingsNav: the global drives the local runner, and
  // Chromatic ignores it, so the width is stated for each. Both say 375px.
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvasElement }) => {
    const dialog = await findOpenDialog(canvasElement)
    await expect(
      within(dialog).getByText('meetcard.io/ben@meetcard'),
    ).toBeVisible()
  },
}

/**
 * A new account, before any card exists. The card section drops out entirely
 * rather than showing an empty heading, and Settings stays — it is the one
 * row that is always reachable.
 */
export const NoCards: Story = {
  args: { open: true, cards: [] },
  play: async ({ canvasElement }) => {
    const dialog = await findOpenDialog(canvasElement)
    const panel = within(dialog)

    await expect(panel.queryByText('My cards')).not.toBeInTheDocument()
    await expect(panel.getByRole('button', { name: 'Settings' })).toBeVisible()
  },
}

/**
 * Extra rows go after Settings, as `<li>`s. Signing out lives at the foot
 * because it is the one action here you cannot undo by pressing back.
 */
export const WithSignOut: Story = {
  args: {
    open: true,
    children: (
      <li>
        <AccountSheetRow label="Sign out" onClick={fn()} />
      </li>
    ),
  },
  play: async ({ canvasElement }) => {
    const dialog = await findOpenDialog(canvasElement)
    await expect(
      within(dialog).getByRole('button', { name: 'Sign out' }),
    ).toBeVisible()
  },
}
