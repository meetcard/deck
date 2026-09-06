import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { AppShell } from './AppShell'
import { Analytics } from './Analytics'

const meta = {
  component: Analytics,
  title: 'Experience/Application/Analytics',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Analytics>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Analytics' }),
    ).toBeVisible()
    // The funnel's arithmetic is derived from the period, not transcribed.
    await expect(canvas.getByText(/44% of views/)).toBeVisible()
  },
}

/**
 * Changing the range changes the counts everywhere at once — the tiles, the
 * funnel, the buckets on the trend, and every breakdown derived from the
 * period's view total.
 */
export const ChangingTheRange: Story = {
  play: async ({ canvas, userEvent }) => {
    /* The period's view total shows up twice by design — once as the
       headline tile, once as the top of the funnel it feeds — so this
       asserts both rather than pretending the figure is unique. */
    await expect(canvas.getAllByText('1,684')).toHaveLength(2)
    await expect(canvas.getByText('Week 3: 517 views')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('radio', { name: '7 days' }))
    await expect(canvas.getAllByText('412')).toHaveLength(2)

    // The series re-buckets with the span: days over a week, months over 90.
    await expect(canvas.getByText('Thursday: 94 views')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('radio', { name: '90 days' }))
    await expect(canvas.getByText('April: 1,522 views')).toBeInTheDocument()
  },
}

/**
 * Pinning is a toggle, not a link, so it reports its state. The accessible
 * name says which way it will go — eight buttons all called "Pin" name
 * nothing.
 */
export const PinningASection: Story = {
  play: async ({ canvas, userEvent }) => {
    const pin = canvas.getByRole('button', {
      name: 'Pin Audience to dashboard',
    })
    await expect(pin).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(pin)
    await expect(
      canvas.getByRole('button', { name: 'Unpin Audience from dashboard' }),
    ).toHaveAttribute('aria-pressed', 'true')
  },
}

/** The page in the shell it actually lives in. */
export const InTheShell: Story = {
  render: () => (
    <AppShell currentId="/">
      <Analytics />
    </AppShell>
  ),
}
