import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { ShareSheet } from './ShareSheet'
import type { ShareSheetProps } from './ShareSheet'

/**
 * A stand-in matrix. `QRCode` draws the plate and never generates a code —
 * Deck has no QR library, and adding one would be the first runtime
 * dependency in `src/components`. Real codes are generated upstream.
 */
const SampleMatrix = () => (
  <svg viewBox="0 0 21 21" aria-hidden="true">
    <rect width="21" height="21" fill="#fff" />
    <path
      d="M0 0h7v7H0zM2 2h3v3H2zM14 0h7v7h-7zM16 2h3v3h-3zM0 14h7v7H0zM2 16h3v3H2zM9 0h1v1H9zM9 2h1v3H9zM11 1h1v2h-1zM13 9h1v1h-1zM9 9h2v1H9zM9 11h1v2H9zM11 12h2v1h-2zM15 9h1v2h-1zM17 10h2v1h-2zM19 12h1v2h-1zM9 15h1v2H9zM11 16h2v1h-2zM14 15h1v1h-1zM16 17h1v2h-1zM18 15h2v1h-2zM13 19h3v1h-3zM17 13h1v1h-1z"
      fill="#1a1a1a"
    />
  </svg>
)

const meta = {
  component: ShareSheet,
  title: 'Build/Organisms/ShareSheet',
  tags: ['organism'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: () => {},
    value: 'meetcard.io/ben@meetcard',
    children: <SampleMatrix />,
    onDownloadQr: () => {},
    onShareLinkedIn: () => {},
  },
} satisfies Meta<typeof ShareSheet>

export default meta
type Story = StoryObj<typeof meta>

/** Sharing a person's card — the most common of the four surfaces. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const dialog = canvasElement.ownerDocument.querySelector('dialog')
    await expect(dialog).toHaveAttribute('open')

    const ui = within(dialog as HTMLElement)
    await waitFor(() => expect(ui.getByText(/Share this card/)).toBeVisible())

    // The link reaches someone who cannot scan, via the code's own name.
    await expect(
      ui.getByRole('img', { name: 'QR code for meetcard.io/ben@meetcard' }),
    ).toBeVisible()
  },
}

/**
 * An event. The only surface that changes the noun — a company profile and a
 * booking flow both still say "card".
 */
export const Event: Story = {
  args: {
    subject: 'event',
    value: 'meetcard.io/events/boulder-startup-week-2026-05-04',
  },
  play: async ({ canvasElement }) => {
    const ui = within(
      canvasElement.ownerDocument.querySelector('dialog') as HTMLElement,
    )
    await waitFor(() => expect(ui.getByText(/Share this event/)).toBeVisible())

    // A long link must stay inside the field rather than widen the dialog.
    const field = ui.getByLabelText('Share link') as HTMLInputElement
    await expect(field.scrollWidth).toBeGreaterThan(0)
  },
}

/** Both actions are optional — with neither handled, the row is absent. */
export const LinkOnly: Story = {
  args: { onDownloadQr: undefined, onShareLinkedIn: undefined },
  play: async ({ canvasElement }) => {
    const ui = within(
      canvasElement.ownerDocument.querySelector('dialog') as HTMLElement,
    )
    // waitFor, not a bare expect: the sheet animates in, so the field is in
    // the DOM before it is visible.
    await waitFor(() => expect(ui.getByLabelText('Share link')).toBeVisible())
    await expect(ui.queryByRole('button', { name: 'QR' })).toBeNull()
    await expect(ui.queryByRole('button', { name: 'LinkedIn' })).toBeNull()
  },
}

function TriggerHarness(args: ShareSheetProps) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ padding: 'var(--deck-space-32)' }}>
      <Button onClick={() => setOpen(true)}>Share card</Button>
      <ShareSheet {...args} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

/** Opened from a trigger, as a surface actually uses it. */
export const FromTrigger: Story = {
  args: { open: false },
  render: (args) => <TriggerHarness {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share card' }))

    const dialog = canvasElement.ownerDocument.querySelector('dialog')
    await waitFor(() => expect(dialog).toHaveAttribute('open'))
  },
}
