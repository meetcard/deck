import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BookingCelebration } from './BookingCelebration'

describe('BookingCelebration', () => {
  it('lands on the confirmation once the sequence finishes', async () => {
    render(<BookingCelebration caption="An invite is on its way." />)

    // The headline does not exist until the beats have played, so the live
    // region has to carry something in the meantime.
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Confirming your booking')

    await waitFor(
      () => expect(screen.getByRole('heading', { level: 2 })).toBeVisible(),
      { timeout: 3000 },
    )
    expect(screen.getByText('An invite is on its way.')).toBeVisible()
  })

  it('renders the confirmation immediately when animation is skipped', () => {
    render(<BookingCelebration skipAnimation />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('You’re booked.')
  })

  it('fires onSettled once, not on every render', async () => {
    const onSettled = vi.fn()
    const { rerender } = render(<BookingCelebration skipAnimation onSettled={onSettled} />)

    rerender(<BookingCelebration skipAnimation onSettled={onSettled} />)
    rerender(<BookingCelebration skipAnimation onSettled={() => onSettled()} />)

    await waitFor(() => expect(onSettled).toHaveBeenCalledOnce())
  })

  it('keeps the animated decoration out of the accessibility tree', () => {
    const { container } = render(<BookingCelebration />)

    const mark = container.querySelector('.deck-booking-celebration__mark')
    expect(mark).toHaveAttribute('aria-hidden', 'true')
    // Particles exist while animating, and all of them sit inside the
    // hidden mark rather than alongside it.
    expect(container.querySelectorAll('.deck-booking-celebration__particle')).toHaveLength(8)
  })

  it('starts settled under prefers-reduced-motion', () => {
    // Skipped rather than shortened: Deck collapses durations to 0ms in this
    // mode, which would flash every beat in a single frame.
    // Assigned rather than spied on: jsdom does not implement `matchMedia` at
    // all, which is why the component calls it optionally in the first place.
    const original = window.matchMedia
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList)

    try {
      render(<BookingCelebration />)

      expect(screen.getByRole('heading', { level: 2 })).toBeVisible()
      expect(
        document.querySelectorAll('.deck-booking-celebration__particle'),
      ).toHaveLength(0)
    } finally {
      window.matchMedia = original
    }
  })

  it('forwards a ref and passes through the caller’s className', () => {
    const ref = { current: null as HTMLDivElement | null }
    const { container } = render(
      <BookingCelebration ref={ref} skipAnimation className="custom" />,
    )

    expect(ref.current).toBe(container.firstChild)
    expect(container.firstChild).toHaveClass('deck-booking-celebration', 'custom')
  })
})
