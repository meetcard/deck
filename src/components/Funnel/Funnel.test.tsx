import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Funnel } from './Funnel'

const stages = [
  { label: 'Profile views', value: 1684 },
  { label: 'Link clicks', value: 742 },
  { label: 'Contacts saved', value: 254 },
]

const ratios = () =>
  [...document.querySelectorAll('.deck-funnel__stage')].map((stage) =>
    Number((stage as HTMLElement).style.getPropertyValue('--deck-funnel-ratio')),
  )

describe('Funnel', () => {
  it('names the funnel for assistive tech', () => {
    render(<Funnel label="Conversion funnel" stages={stages} />)
    expect(
      screen.getByRole('list', { name: 'Conversion funnel' }),
    ).toBeInTheDocument()
  })

  // Derived here so the arithmetic can never drift from the printed counts.
  it('measures each stage against the one before it', () => {
    render(<Funnel label="Conversion funnel" unit="views" stages={stages} />)
    expect(screen.getByText(/44% from previous/)).toBeVisible()
    expect(screen.getByText(/34% from previous/)).toBeVisible()
  })

  it('measures each stage against the top of the funnel', () => {
    render(<Funnel label="Conversion funnel" unit="views" stages={stages} />)
    expect(screen.getByText(/44% of views/)).toBeVisible()
    expect(screen.getByText(/15% of views/)).toBeVisible()
  })

  it('says the first stage is the starting point rather than 100% of itself', () => {
    render(<Funnel label="Conversion funnel" stages={stages} />)
    expect(screen.getByText(/starting point/)).toBeVisible()
  })

  it('scales the bars to the first stage', () => {
    render(<Funnel label="Conversion funnel" stages={stages} />)
    const [first, second] = ratios()
    expect(first).toBe(1)
    expect(second).toBeCloseTo(742 / 1684, 5)
  })

  // Dividing by an empty stage would print Infinity; it says so instead.
  it('does not divide by an empty previous stage', () => {
    render(
      <Funnel
        label="Conversion funnel"
        stages={[
          { label: 'Profile views', value: 0 },
          { label: 'Link clicks', value: 0 },
        ]}
      />,
    )
    expect(screen.getByText(/no previous stage to compare/)).toBeVisible()
    expect(screen.queryByText(/Infinity|NaN/)).not.toBeInTheDocument()
  })

  it('writes every count as text beside its bar', () => {
    render(<Funnel label="Conversion funnel" stages={stages} />)
    expect(screen.getByText((1684).toLocaleString())).toBeVisible()
    expect(screen.getByText((742).toLocaleString())).toBeVisible()
  })

  it('names what the top of the funnel counts', () => {
    render(<Funnel label="Conversion funnel" unit="scans" stages={stages} />)
    expect(screen.getByText(/44% of scans/)).toBeVisible()
  })
})
