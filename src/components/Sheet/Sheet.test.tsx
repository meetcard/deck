import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sheet } from './Sheet'


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

  it('forwards a ref to the dialog element', () => {
    const ref = { current: null as HTMLDialogElement | null }
    render(
      <Sheet ref={ref} open title="Exchange" onClose={vi.fn()}>
        <p>content</p>
      </Sheet>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDialogElement)
  })

  describe('backdrop dismissal', () => {
    // A click landing directly on the <dialog> (not a descendant) is the
    // backdrop — clicking it should close the sheet by default.
    it('dismisses when the backdrop itself is clicked', async () => {
      const onClose = vi.fn()
      render(
        <Sheet open title="Exchange" onClose={onClose}>
          <p>content</p>
        </Sheet>,
      )

      await userEvent.click(screen.getByRole('dialog'))

      expect(onClose).toHaveBeenCalled()
    })

    it('does not dismiss on backdrop click when disabled', async () => {
      const onClose = vi.fn()
      render(
        <Sheet
          open
          title="Exchange"
          onClose={onClose}
          dismissOnBackdrop={false}
        >
          <p>content</p>
        </Sheet>,
      )

      await userEvent.click(screen.getByRole('dialog'))

      expect(onClose).not.toHaveBeenCalled()
    })

    it('does not dismiss when a click lands on the panel content', async () => {
      const onClose = vi.fn()
      render(
        <Sheet open title="Exchange" onClose={onClose}>
          <button type="button">Show my card</button>
        </Sheet>,
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Show my card' }),
      )

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
