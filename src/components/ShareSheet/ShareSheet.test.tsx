import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ShareSheet } from './ShareSheet'

const value = 'meetcard.io/ben@meetcard'

describe('ShareSheet', () => {
  it('names itself after the subject', () => {
    render(<ShareSheet open onClose={() => {}} value={value} />)
    expect(screen.getByRole('dialog', { name: /Share this card/ })).toBeInTheDocument()
  })

  // The noun is the only thing that varies between surfaces; an event says
  // "event" where a card, a company profile and a booking all say "card".
  it('takes a different subject', () => {
    render(<ShareSheet open onClose={() => {}} value={value} subject="event" />)
    expect(
      screen.getByRole('dialog', { name: /Share this event/ }),
    ).toBeInTheDocument()
  })

  // Someone who cannot scan the code still needs the destination.
  it('carries the link in the code’s accessible name', () => {
    render(<ShareSheet open onClose={() => {}} value={value} />)
    expect(
      screen.getByRole('img', { name: `QR code for ${value}` }),
    ).toBeInTheDocument()
  })

  it('offers the link as copyable text', () => {
    render(<ShareSheet open onClose={() => {}} value={value} />)
    expect(screen.getByLabelText('Share link')).toHaveValue(value)
  })

  describe('actions', () => {
    it('omits each one unless it is handled', () => {
      render(<ShareSheet open onClose={() => {}} value={value} />)
      expect(screen.queryByRole('button', { name: 'QR' })).toBeNull()
      expect(screen.queryByRole('button', { name: 'LinkedIn' })).toBeNull()
    })

    it('calls back when used', async () => {
      const onDownloadQr = vi.fn()
      const onShareLinkedIn = vi.fn()
      render(
        <ShareSheet
          open
          onClose={() => {}}
          value={value}
          onDownloadQr={onDownloadQr}
          onShareLinkedIn={onShareLinkedIn}
        />,
      )

      await userEvent.click(screen.getByRole('button', { name: 'QR' }))
      await userEvent.click(screen.getByRole('button', { name: 'LinkedIn' }))

      expect(onDownloadQr).toHaveBeenCalledOnce()
      expect(onShareLinkedIn).toHaveBeenCalledOnce()
    })
  })

  it('renders nothing while closed', () => {
    render(<ShareSheet open={false} onClose={() => {}} value={value} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
