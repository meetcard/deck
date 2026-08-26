import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UsageMeter } from './UsageMeter'

describe('UsageMeter', () => {
  it('exposes a meter with its ARIA value range', () => {
    render(<UsageMeter label="Connections" value={42} max={100} />)

    const meter = screen.getByRole('meter', { name: 'Connections' })
    expect(meter).toHaveAttribute('aria-valuenow', '42')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
    expect(meter).toHaveAttribute('aria-valuetext', '42 of 100')
  })

  it('stays quiet below the warning threshold', () => {
    render(<UsageMeter label="Connections" value={10} max={100} />)
    expect(screen.queryByText(/Approaching limit/)).not.toBeInTheDocument()
    expect(screen.queryByText('Limit reached')).not.toBeInTheDocument()
  })

  // The level must be readable as text — a colored bar alone fails WCAG 1.4.1.
  it('states the level in text when approaching the cap', () => {
    render(<UsageMeter label="Connections" value={92} max={100} />)
    expect(screen.getByText(/Approaching limit — 92 of 100 used/)).toBeVisible()
  })

  it('states when the cap is reached', () => {
    render(<UsageMeter label="Connections" value={100} max={100} />)
    expect(screen.getByText('Limit reached')).toBeVisible()
  })

  it('honours a custom warning threshold', () => {
    render(<UsageMeter label="Connections" value={55} max={100} warnAt={0.5} />)
    expect(screen.getByText(/Approaching limit/)).toBeVisible()
  })

  it('clamps overflow rather than overrunning the track', () => {
    render(<UsageMeter label="Connections" value={140} max={100} />)

    const fill = document.querySelector('.deck-usage-meter__fill')
    expect(fill?.parentElement).toHaveClass('deck-usage-meter__track--full')
    // aria-valuenow still reports the true figure.
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '140')
  })

  it('supports a custom readout format', () => {
    render(
      <UsageMeter
        label="Seats"
        value={3}
        max={5}
        formatValue={(v, m) => `${v}/${m} seats`}
      />,
    )
    expect(screen.getByText('3/5 seats')).toBeVisible()
  })

  it('does not divide by zero when max is 0', () => {
    render(<UsageMeter label="Connections" value={0} max={0} />)
    expect(screen.getByRole('meter')).toBeInTheDocument()
  })
})
