import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { BookingSummary } from '../BookingSummary/BookingSummary'
import { BookingCelebration } from './BookingCelebration'

const summaryItems = [
  { label: 'Thursday, September 3', detail: '2:00 PM · 30 min' },
  { label: 'Video call', detail: 'Link sent with your confirmation' },
  { label: 'Ben Ackles', detail: 'MeetCard' },
]

const meta = {
  component: BookingCelebration,
  title: 'Build/Organisms/BookingCelebration',
  tags: ['organism'],
  args: {
    caption: 'A calendar invite is on its way to ben@meetcard.com.',
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <BookingCelebration {...args} />
    </div>
  ),
} satisfies Meta<typeof BookingCelebration>

export default meta
type Story = StoryObj<typeof meta>

/** The confirmation, with the confetti popping over it. */
export const Default: Story = {}

/**
 * Without the confetti — what `skipAnimation` and `prefers-reduced-motion`
 * both render. The pieces are the only difference from `Default`: the
 * confirmation underneath is the same screen, not a static substitute.
 */
export const NoConfetti: Story = {
  args: { skipAnimation: true },
}

/** With the recap of what was actually booked, as the flow shows it. */
export const WithSummary: Story = {
  args: {
    skipAnimation: true,
    summary: <BookingSummary items={summaryItems} />,
  },
}

/** A custom headline, for surfaces that book something other than a meeting. */
export const CustomHeadline: Story = {
  args: {
    skipAnimation: true,
    headline: 'Your table is held.',
    caption: 'We’ll text you if anything changes.',
  },
}

/**
 * The booking is done before this renders, so the outcome is readable
 * immediately and the live region carries it — no working message, and
 * nothing to wait for.
 */
export const AnnouncesTheOutcome: Story = {
  play: async ({ canvas }) => {
    const status = canvas.getByRole('status')
    await expect(status).toHaveTextContent('You’re booked.')
    await expect(status).not.toHaveTextContent(/confirming/i)
    await expect(canvas.getByRole('heading', { name: 'You’re booked.' })).toBeVisible()
  },
}

/** The confetti is decoration: none of it reaches the accessibility tree. */
export const ConfettiIsDecorative: Story = {
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector('.deck-booking-celebration__mark')
    await expect(mark).toHaveAttribute('aria-hidden', 'true')
  },
}
