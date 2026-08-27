import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { EmptyState } from './EmptyState'

const CardsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3" y="7" width="14" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 5h12a2 2 0 012 2v9" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const meta = {
  component: EmptyState,
  title: 'Build/Molecules/EmptyState',
  tags: ['molecule'],
  args: {
    title: 'No connections yet',
    description: 'Scan a card or share yours to start building your deck.',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'No connections yet' }),
    ).toBeVisible()
  },
}

/** Every empty state should point at the next action. */
export const WithAction: Story = {
  args: {
    media: <CardsIcon />,
    actions: <Button>Exchange a card</Button>,
  },
}

/** Compact variant, for empty states nested inside a panel or a search list. */
export const Small: Story = {
  args: {
    size: 'sm',
    title: 'No matches',
    description: 'Try a different name, company, or tag.',
  },
}

export const NoResults: Story = {
  args: {
    title: 'No events yet',
    description: 'Events you attend or manage will appear here.',
    media: <CardsIcon />,
    actions: (
      <>
        <Button size="sm">Create an event</Button>
        <Button size="sm" variant="ghost">
          Browse events
        </Button>
      </>
    ),
  },
}
