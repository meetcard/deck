import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BookingCelebration } from './BookingCelebration'

describe('BookingCelebration', () => {
  // The whole point of the component: booking is already done by the time it
  // renders, so nothing about the outcome waits on a timer.
  it('shows the confirmation in the first render, not on a timer', () => {
    render(<BookingCelebration caption="An invite is on its way." />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('You’re booked.')
    expect(screen.getByText('An invite is on its way.')).toBeVisible()
  })

  // A working message here would describe work that is not happening.
  it('announces the outcome rather than a pending state', () => {
    render(<BookingCelebration caption="An invite is on its way." />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('You’re booked.')
    expect(status).not.toHaveTextContent(/confirming/i)
  })

  it('renders the summary alongside the confirmation', () => {
    render(<BookingCelebration summary={<p>Thursday, September 3</p>} />)

    expect(screen.getByText('Thursday, September 3')).toBeVisible()
  })

  it('keeps the confetti out of the accessibility tree', () => {
    const { container } = render(<BookingCelebration />)

    const mark = container.querySelector('.deck-booking-celebration__mark')
    expect(mark).toHaveAttribute('aria-hidden', 'true')
    // Every piece sits inside the hidden mark rather than alongside it.
    expect(mark?.querySelectorAll('.deck-booking-celebration__particle')).toHaveLength(12)
  })

  // `skipAnimation` drops the decoration from a finished screen; it does not
  // fast-forward to a different one.
  it('drops the confetti but keeps the confirmation when animation is skipped', () => {
    const { container } = render(<BookingCelebration caption="An invite is on its way." />)
    const decorated = container.innerHTML

    const { container: plain } = render(<BookingCelebration skipAnimation caption="An invite is on its way." />)

    expect(plain.querySelectorAll('.deck-booking-celebration__particle')).toHaveLength(0)
    expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('You’re booked.')
    // The confirmation markup is the same either way — the pieces are the
    // only difference between the two.
    expect(decorated).toContain('deck-booking-celebration__check')
    expect(plain.innerHTML).toContain('deck-booking-celebration__check')
  })

  it('holds no state that could re-render the confirmation away', () => {
    const { rerender } = render(<BookingCelebration />)

    rerender(<BookingCelebration />)
    rerender(<BookingCelebration headline="Your table is held." />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Your table is held.')
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
