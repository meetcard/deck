import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
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

/** The full sequence: plate, pulse, burst, cascade, then the confirmation. */
export const Default: Story = {}

/**
 * The state the animation lands on, and the whole component when motion is
 * off. This is what `prefers-reduced-motion` and `skipAnimation` render — one
 * design, started at the end, rather than a separate static variant.
 */
export const Settled: Story = {
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
 * The beats are decorative, so the outcome has to be spoken. The live region
 * carries a working message first and the confirmation second.
 */
export const AnnouncesTheOutcome: Story = {
  args: { onSettled: fn() },
  play: async ({ canvas, args }) => {
    const status = canvas.getByRole('status')
    await expect(status).toHaveTextContent('Confirming your booking')

    // Assert once it has settled rather than at a fixed offset into the
    // sequence — a timing race is what made earlier story runs flaky. The
    // beats total 1.2s, which outruns `waitFor`'s default second.
    await waitFor(() => expect(args.onSettled).toHaveBeenCalled(), { timeout: 4000 })
    await expect(status).toHaveTextContent('You’re booked.')
    await expect(
      canvas.getByRole('heading', { name: 'You’re booked.' }),
    ).toBeVisible()
  },
}

/** The burst is decoration: none of it reaches the accessibility tree. */
export const BurstIsDecorative: Story = {
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector('.deck-booking-celebration__mark')
    await expect(mark).toHaveAttribute('aria-hidden', 'true')
  },
}
