import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor, within } from 'storybook/test'
import { Mark } from '../../foundations/brand'
import { Button } from '../Button/Button'
import { CopyField } from '../CopyField/CopyField'
import { QRCode } from '../QRCode/QRCode'
import { Sheet } from './Sheet'

const QrIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M2 2h4v4H2zM10 2h4v4h-4zM2 10h4v4H2zM10 10h2v2h-2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const LinkIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6.5 9.5l3-3M6.8 4.7 8 3.5a2.5 2.5 0 1 1 3.5 3.5L10.3 8.2M9.2 11.3 8 12.5a2.5 2.5 0 1 1-3.5-3.5L5.7 7.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8 2v8m0 0-3-3m3 3 3-3M3 13.5h10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M4.5 6.5v6M4.5 3.8a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8ZM7.5 6.5v6M7.5 9c0-1.4.9-2.5 2.25-2.5S12 7.6 12 9v3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/** A stand-in matrix. Real codes come from Dub.co against metcard.io. */
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
  component: Sheet,
  tags: ['organism'],
  args: { title: 'Exchange', onClose: fn(), open: false },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The Exchange sheet: showing your card and scanning someone else's, together
 * under one control because they are two halves of the same moment.
 */
export const Exchange: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>Exchange</Button>
        <Sheet
          {...args}
          open={open}
          onClose={() => {
            setOpen(false)
            args.onClose()
          }}
          description="Share your card or scan someone else's."
        >
          <Button fullWidth iconStart={<QrIcon />}>
            Show my card
          </Button>
          <Button fullWidth variant="secondary">
            Scan a card
          </Button>
        </Sheet>
      </div>
    )
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Exchange' }))

    // <dialog> renders in the top layer; query the whole document.
    const doc = canvasElement.ownerDocument
    const dialog = await doc.querySelector('dialog')
    await expect(dialog).toHaveAttribute('open')
    await expect(
      doc.querySelector('.deck-sheet__title')?.textContent,
    ).toBe('Exchange')
  },
}

/** Escape closes the sheet — behaviour inherited from native `<dialog>`. */
export const ClosesOnEscape: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24 }}>
        <Sheet {...args} open={open} onClose={() => setOpen(false)}>
          <Button fullWidth>Show my card</Button>
        </Sheet>
        {!open ? <p>Sheet closed</p> : null}
      </div>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    // Pressing Escape on a modal <dialog> fires `cancel`. We dispatch that
    // event directly: it is exactly what the browser does, and it exercises
    // our handler without depending on the runner's focus model.
    const dialog = canvasElement.ownerDocument.querySelector('dialog')
    dialog?.dispatchEvent(new Event('cancel', { cancelable: true }))

    await expect(await canvas.findByText('Sheet closed')).toBeVisible()
  },
}

/** Centered placement, for confirmations rather than thumb-reachable actions. */
export const Centered: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>Delete card</Button>
        <Sheet
          {...args}
          title="Delete this card?"
          description="This cannot be undone."
          placement="center"
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </>
          }
        />
      </div>
    )
  },
}

/** Holding the card up to be scanned — the highest-frequency moment. */
export const ShowMyCard: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>Show my card</Button>
        <Sheet
          {...args}
          title="Scan to connect"
          hideTitle
          open={open}
          onClose={() => setOpen(false)}
        >
          <QRCode
            value="https://metcard.io/ben"
            size="lg"
            caption="Scan to save my card"
          >
            <SampleMatrix />
          </QRCode>
        </Sheet>
      </div>
    )
  },
}

/**
 * Ports the Lovable prototype's "Share this card" dialog — a QR code
 * carrying the MeetCard mark as its center overlay (`QRCode`'s `logo` prop),
 * a copyable short link (`CopyField`), and quick actions to download the
 * code or share to LinkedIn. Deliberately a composition rather than a
 * single rigid component: `ShareEvent` below reaches for the same three
 * pieces but drops the LinkedIn action, which a fixed-prop component would
 * make far more awkward than just not rendering a `Button`.
 */
export const ShareCard: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>Share this card</Button>
        <Sheet
          {...args}
          title="Share this card"
          description="Scan the code or share the short link."
          placement="center"
          open={open}
          onClose={() => setOpen(false)}
        >
          <QRCode
            value="meetcard.io/ben@meetcard"
            showValue={false}
            size="lg"
            logo={<Mark />}
          >
            <SampleMatrix />
          </QRCode>
          <CopyField
            label="Shareable link"
            value="meetcard.io/ben@meetcard"
            icon={<LinkIcon />}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" fullWidth iconStart={<DownloadIcon />}>
              QR
            </Button>
            <Button variant="secondary" fullWidth iconStart={<LinkedInIcon />}>
              LinkedIn
            </Button>
          </div>
        </Sheet>
      </div>
    )
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share this card' }))

    const doc = canvasElement.ownerDocument
    const dialog = doc.querySelector('dialog')
    await expect(dialog).toHaveAttribute('open')

    // Retries until the entrance animation clears opacity: 0 — the element
    // is in the DOM immediately, but not yet visible.
    await waitFor(() => {
      expect(
        within(dialog as HTMLElement).getByRole('img', { name: /QR code/ }),
      ).toBeVisible()
    })
  },
}

/** Same composition, different context: an event has no LinkedIn share. */
export const ShareEvent: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>Share this event</Button>
        <Sheet
          {...args}
          title="Share this event"
          description="Scan the code or share the short link."
          placement="center"
          open={open}
          onClose={() => setOpen(false)}
        >
          <QRCode
            value="meetcard.io/events/boulder-startup-week-2026-05-04"
            showValue={false}
            size="lg"
            logo={<Mark />}
          >
            <SampleMatrix />
          </QRCode>
          <CopyField
            label="Shareable link"
            value="meetcard.io/events/boulder-startup-week-2026-05-04"
            icon={<LinkIcon />}
          />
          <Button variant="secondary" fullWidth iconStart={<DownloadIcon />}>
            QR
          </Button>
        </Sheet>
      </div>
    )
  },
}
