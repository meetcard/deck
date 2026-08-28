import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { SideNav } from './SideNav'

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

/** The desktop destinations from the app shell, at their real routes. */
const destinations = [
  { id: '/', href: '/', label: 'Dashboard', icon: <Icon d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z" /> },
  { id: '/cards', href: '/cards', label: 'My cards', icon: <Icon d="M3 6h18v12H3zM3 10h18M7 14h4" /> },
  { id: '/connections', href: '/connections', label: 'Connections', icon: <Icon d="M4 19v-1a4 4 0 014-4h2a4 4 0 014 4v1M9 10a3 3 0 100-6 3 3 0 000 6zM17 11a3 3 0 100-6" /> },
  { id: '/events', href: '/events', label: 'Events', icon: <Icon d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" /> },
]

const settings = [
  { id: '/settings', href: '/settings', label: 'Settings', icon: <Icon d="M4 6h16M4 12h16M4 18h16M9 4v4M15 10v4M9 16v4" /> },
]

const meta = {
  component: SideNav,
  title: 'Build/Organisms/SideNav',
  tags: ['organism'],
  parameters: { layout: 'fullscreen' },
  args: { items: destinations, currentId: '/' },
  // The rail is full-height by design; give it something to fill.
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '520px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SideNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/**
 * Settings pinned to the foot. It shares the rail's landmark rather than
 * forming a second one — the assertion below is what keeps it that way.
 */
export const WithPinnedFooter: Story = {
  args: { footerItems: settings, currentId: '/connections' },
  play: async ({ canvas, canvasElement }) => {
    const nav = canvas.getByRole('navigation', { name: 'Global' })
    await expect(
      within(nav).getByRole('link', { name: 'Settings' }),
    ).toBeVisible()
    await expect(
      within(canvasElement).getAllByRole('navigation'),
    ).toHaveLength(1)
  },
}

/** A count trails the label, where the rail has room for it. */
export const WithBadge: Story = {
  args: {
    items: destinations.map((d) =>
      d.id === '/connections' ? { ...d, badge: 3 } : d,
    ),
    footerItems: settings,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Connections, 3 pending' }),
    ).toBeVisible()
  },
}
