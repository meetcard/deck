import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { SettingsNav } from './SettingsNav'
import type { SettingsNavProps } from './SettingsNav'

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/** MeetCard's own settings, split the way the product splits them. */
const groups = [
  {
    label: 'User',
    items: [
      { id: '/settings/profile', href: '/settings/profile', label: 'Profile', icon: <Icon d="M12 13a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0" /> },
      { id: '/settings/account', href: '/settings/account', label: 'Account', icon: <Icon d="M3 6h18v12H3zM3 10h18M7 14h4" /> },
      { id: '/settings/notifications', href: '/settings/notifications', label: 'Notifications', icon: <Icon d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10.3 21a2 2 0 003.4 0" /> },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: '/settings/billing', href: '/settings/billing', label: 'Billing', icon: <Icon d="M2 7h20v11H2zM2 11h20" /> },
      { id: '/settings/company', href: '/settings/company', label: 'Company', icon: <Icon d="M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 9h4a1 1 0 011 1v11M8 8h3M8 12h3M8 16h3" /> },
      { id: '/settings/customization', href: '/settings/customization', label: 'Customization', icon: <Icon d="M12 3a9 9 0 100 18h1.5a2 2 0 001.6-3.2 2 2 0 011.6-3.2H19a2 2 0 002-2A9 9 0 0012 3zM7.5 10.5v.01M12 7.5v.01M16.5 10.5v.01" /> },
      { id: '/settings/integrations', href: '/settings/integrations', label: 'Integrations', icon: <Icon d="M9 3v6M15 3v6M6 9h12v4a6 6 0 01-12 0zM12 19v2" /> },
      { id: '/settings/team', href: '/settings/team', label: 'Team', icon: <Icon d="M4 19v-1a4 4 0 014-4h2a4 4 0 014 4v1M9 10a3 3 0 100-6 3 3 0 000 6zM17 11a3 3 0 100-6" /> },
    ],
  },
]

function Harness(args: SettingsNavProps) {
  const [current, setCurrent] = useState(args.currentId ?? '/settings/profile')
  return (
    <div
      style={{ padding: 'var(--deck-space-24)' }}
      /*
       * The items are real links, and `SettingsNav` does not preventDefault —
       * that is left to a router, deliberately, so the markup stays navigable
       * and shareable. There is no router here, so a click in the browser
       * test runner follows the href and navigates the whole page away, which
       * surfaces as the test browser closing mid-run. Swallowing it at the
       * wrapper keeps the links honest and the story self-contained.
       */
      onClick={(event) => event.preventDefault()}
    >
      <SettingsNav {...args} currentId={current} onSelect={setCurrent} />
    </div>
  )
}

const meta = {
  component: SettingsNav,
  title: 'Build/Organisms/SettingsNav',
  tags: ['organism'],
  parameters: { layout: 'fullscreen' },
  args: { groups, currentId: '/settings/profile' },
  render: (args) => <Harness {...args} />,
} satisfies Meta<typeof SettingsNav>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop. The list shows every section at once, so the current one stays
 * visible while you read the panel beside it.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Settings' }),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    // The select is present but not shown — the swap is real, not a render
    // of both. `getByLabelText` finds hidden nodes, so check layout directly.
    const select = canvasElement.querySelector('.deck-settings-nav__select-view')
    await expect(getComputedStyle(select as Element).display).toBe('none')
  },
}

/** Choosing a section moves the fill and the announcement together. */
export const Switching: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Billing' }))

    await expect(canvas.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(
      canvas.getByRole('link', { name: 'Profile' }),
    ).not.toHaveAttribute('aria-current')
  },
}

/**
 * Phone. Eight destinations stacked above the content would push the content
 * off the screen, so the list becomes the platform's own picker — with the
 * groups intact as `<optgroup>`s.
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobileS' } },
  play: async ({ canvas, canvasElement }) => {
    const list = canvasElement.querySelector('.deck-settings-nav__list-view')
    await expect(getComputedStyle(list as Element).display).toBe('none')

    const select = canvas.getByLabelText('Select settings option')
    await expect(select).toBeVisible()
    await expect(
      within(select).getAllByRole('group').map((g) => g.getAttribute('label')),
    ).toEqual(['User', 'Admin'])
  },
}

/** The breakpoint's own value — 768px is the first width that gets the list. */
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Settings' }),
    ).toBeVisible()
  },
}
