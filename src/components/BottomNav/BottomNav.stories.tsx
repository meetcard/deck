import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Mark } from '../../foundations/brand'
import { AppBar } from '../AppBar/AppBar'
import { Avatar } from '../Avatar/Avatar'
import { EmptyState } from '../EmptyState/EmptyState'
import { IconButton } from '../IconButton/IconButton'
import { BottomNav } from './BottomNav'

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

/** The four destinations from the app shell, at their real routes. */
const destinations = [
  { id: '/', href: '/', label: 'Dashboard', icon: <Icon d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z" /> },
  { id: '/connections', href: '/connections', label: 'Connections', icon: <Icon d="M4 19v-1a4 4 0 014-4h2a4 4 0 014 4v1M9 10a3 3 0 100-6 3 3 0 000 6zM17 11a3 3 0 100-6" />, badge: 3 },
  { id: '/events', href: '/events', label: 'Events', icon: <Icon d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" /> },
  { id: '/me', href: '/me', label: 'Me', icon: <Icon d="M5 20v-1a5 5 0 015-5h4a5 5 0 015 5v1M12 11a4 4 0 100-8 4 4 0 000 8z" /> },
]

const exchangeIcon = <Icon d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3z" />

const meta = {
  component: BottomNav,
  title: 'Build/Organisms/BottomNav',
  tags: ['organism'],
  args: { items: destinations, currentId: '/' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BottomNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: /Dashboard/ }),
    ).toHaveAttribute('aria-current', 'page')
  },
}

/**
 * The full PWA shell: header, scrolling content, and the bar with its
 * elevated Exchange action.
 */
export const InAppShell: Story = {
  render: function Render(args) {
    const [current, setCurrent] = useState('/connections')
    const [exchanges, setExchanges] = useState(0)

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '520px',
          border: '1px solid var(--deck-color-border-default)',
          borderRadius: 'var(--deck-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <AppBar
          brand={<Mark style={{ height: 24, width: 24 }} />}
          actions={
            <IconButton
              label="Me"
              variant="ghost"
              icon={<Avatar name="Ada Lovelace" size="xs" decorative />}
            />
          }
        />

        <div style={{ flex: 1, overflow: 'auto' }}>
          <EmptyState
            title={current}
            description={
              exchanges > 0
                ? `Exchange opened ${exchanges} time${exchanges === 1 ? '' : 's'}.`
                : 'Tap a destination, or use the elevated Exchange action.'
            }
          />
        </div>

        <BottomNav
          {...args}
          currentId={current}
          onSelect={setCurrent}
          centerAction={{
            label: 'Exchange',
            icon: exchangeIcon,
            onClick: () => setExchanges((n) => n + 1),
          }}
        />
      </div>
    )
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Exchange' }))
    await expect(
      await canvas.findByText(/Exchange opened 1 time/),
    ).toBeVisible()
  },
}

/** A count on a destination, e.g. pending follow-ups. */
export const WithBadge: Story = {
  args: { currentId: '/connections' },
  play: async ({ canvas }) => {
    // The count is spelled out for assistive tech, not left as a bare number.
    await expect(
      canvas.getByRole('link', { name: /Connections, 3 pending/ }),
    ).toBeVisible()
  },
}
