import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Button } from '../Button/Button'
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
            <svg viewBox="0 0 21 21" aria-hidden="true">
              <rect width="21" height="21" fill="#fff" />
              <path
                d="M0 0h7v7H0zM2 2h3v3H2zM14 0h7v7h-7zM16 2h3v3h-3zM0 14h7v7H0zM2 16h3v3H2zM9 0h1v1H9zM9 2h1v3H9zM11 1h1v2h-1zM13 9h1v1h-1zM9 9h2v1H9zM9 11h1v2H9zM11 12h2v1h-2zM15 9h1v2h-1zM17 10h2v1h-2zM19 12h1v2h-1zM9 15h1v2H9zM11 16h2v1h-2zM14 15h1v1h-1zM16 17h1v2h-1zM18 15h2v1h-2zM13 19h3v1h-3zM17 13h1v1h-1z"
                fill="#1a1a1a"
              />
            </svg>
          </QRCode>
        </Sheet>
      </div>
    )
  },
}
