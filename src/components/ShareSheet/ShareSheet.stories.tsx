import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { sampleQrMatrixSvg } from '../QRCode/sampleQrMatrix'
import { ShareSheet } from './ShareSheet'
import type { ShareSheetProps } from './ShareSheet'

/** A real code. Deck encodes nothing — see `sampleQrMatrix`. */
const Matrix = () => (
  <span
    style={{ display: 'block', width: '100%', height: '100%' }}
    dangerouslySetInnerHTML={{ __html: sampleQrMatrixSvg }}
  />
)

/**
 * Every story opens from a trigger rather than rendering open.
 *
 * `Sheet` is a native `<dialog>` opened with `showModal`, so several open at
 * once stack in the top layer and cover each other — which is exactly what
 * the docs page did when the stories defaulted to `open`.
 */
function Harness({ label, ...args }: ShareSheetProps & { label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ padding: 'var(--deck-space-32)' }}>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <ShareSheet {...args} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

const meta = {
  component: ShareSheet,
  title: 'Build/Organisms/ShareSheet',
  tags: ['organism'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: false,
    onClose: fn(),
    value: 'meetcard.io/ben@meetcard',
    children: <Matrix />,
    onDownloadQr: fn(),
    onShareLinkedIn: fn(),
  },
} satisfies Meta<typeof ShareSheet>

export default meta
type Story = StoryObj<typeof meta>

const openIt = async (
  canvas: ReturnType<typeof within>,
  canvasElement: HTMLElement,
  userEvent: { click: (el: Element) => Promise<void> },
  label: string,
) => {
  await userEvent.click(canvas.getByRole('button', { name: label }))
  const dialog = canvasElement.ownerDocument.querySelector('dialog')
  await waitFor(() => expect(dialog).toHaveAttribute('open'))
  return within(dialog as HTMLElement)
}

/** Sharing a person's card — the most common of the four surfaces. */
export const Default: Story = {
  render: (args) => <Harness {...args} label="Share card" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const ui = await openIt(canvas, canvasElement, userEvent, 'Share card')

    await waitFor(() => expect(ui.getByText(/Share this card/)).toBeVisible())
    // The link reaches someone who cannot scan, via the code's own name.
    await expect(
      ui.getByRole('img', { name: 'QR code for meetcard.io/ben@meetcard' }),
    ).toBeVisible()
    await expect(ui.getByLabelText('Share link')).toHaveValue(
      'meetcard.io/ben@meetcard',
    )
  },
}

/**
 * An event — the only surface that changes the noun. A company profile and a
 * booking flow both still say "card".
 */
export const Event: Story = {
  args: {
    subject: 'event',
    value: 'meetcard.io/events/boulder-startup-week-2026-05-04',
  },
  render: (args) => <Harness {...args} label="Share event" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const ui = await openIt(canvas, canvasElement, userEvent, 'Share event')

    await waitFor(() => expect(ui.getByText(/Share this event/)).toBeVisible())

    // A long link stays inside its field rather than widening the dialog.
    const field = ui.getByLabelText('Share link')
    const dialog = canvasElement.ownerDocument.querySelector('dialog')!
    await expect(field.getBoundingClientRect().right).toBeLessThanOrEqual(
      dialog.getBoundingClientRect().right,
    )
  },
}

/** Both actions are optional — with neither handled, the row is absent. */
export const LinkOnly: Story = {
  args: { onDownloadQr: undefined, onShareLinkedIn: undefined },
  render: (args) => <Harness {...args} label="Share card" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const ui = await openIt(canvas, canvasElement, userEvent, 'Share card')

    await waitFor(() =>
      expect(ui.getByLabelText('Share link')).toBeVisible(),
    )
    await expect(ui.queryByRole('button', { name: 'QR' })).toBeNull()
    await expect(ui.queryByRole('button', { name: 'LinkedIn' })).toBeNull()
  },
}
