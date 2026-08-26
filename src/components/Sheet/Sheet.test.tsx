import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { Sheet } from './Sheet'

// jsdom does not implement the native dialog modal methods.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ) {
      this.open = true
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(
      this: HTMLDialogElement,
    ) {
      this.open = false
      this.dispatchEvent(new Event('close'))
    }
  }
})

function Harness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Exchange
      </button>
      <Sheet
        open={open}
        title="Exchange"
        onClose={() => {
          setOpen(false)
          onClose?.()
        }}
      >
        <button type="button">Show my card</button>
      </Sheet>
    </>
  )
}

describe('Sheet', () => {
  it('is closed until opened', () => {
    render(<Harness />)
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute(
      'open',
    )
  })

  it('opens as a modal dialog', async () => {
    render(<Harness />)

    await userEvent.click(screen.getByRole('button', { name: 'Exchange' }))

    expect(screen.getByRole('dialog')).toHaveAttribute('open')
  })

  // The title is the dialog's accessible name — without it a screen reader
  // announces an unnamed dialog.
  it('is named by its title', async () => {
    render(<Harness />)

    await userEvent.click(screen.getByRole('button', { name: 'Exchange' }))

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Exchange')
  })

  it('closes via the close control', async () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: 'Exchange' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('keeps a hidden title available to assistive tech', async () => {
    render(
      <Sheet open title="Scan to connect" hideTitle onClose={vi.fn()}>
        <p>content</p>
      </Sheet>,
    )

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Scan to connect')
  })

  it('links its description for assistive tech', () => {
    render(
      <Sheet
        open
        title="Exchange"
        description="Share your card or scan one."
        onClose={vi.fn()}
      >
        <p>content</p>
      </Sheet>,
    )

    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
      'Share your card or scan one.',
    )
  })
})
