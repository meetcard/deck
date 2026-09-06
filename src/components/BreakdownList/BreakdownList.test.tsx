import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BreakdownList } from './BreakdownList'

const items = [
  { label: 'QR', value: 631, meta: '37%' },
  { label: 'LinkedIn', value: 388, meta: '23%' },
  { label: 'Direct', value: 88, meta: '5%' },
]

const ratios = () =>
  [...document.querySelectorAll('.deck-breakdown-list__row')].map((row) =>
    Number((row as HTMLElement).style.getPropertyValue('--deck-breakdown-ratio')),
  )

describe('BreakdownList', () => {
  it('names the list for assistive tech', () => {
    render(<BreakdownList label="Traffic sources" items={items} />)
    expect(
      screen.getByRole('list', { name: 'Traffic sources' }),
    ).toBeInTheDocument()
  })

  // The bar is a second reading of a figure that is already text, which is
  // what lets the list stand in for a table view.
  it('writes every figure as text', () => {
    render(<BreakdownList label="Traffic sources" items={items} />)
    expect(screen.getByText('631')).toBeVisible()
    expect(screen.getByText('388')).toBeVisible()
    expect(screen.getByText('37%')).toBeVisible()
  })

  it('scales bars to the largest row by default', () => {
    render(<BreakdownList label="Traffic sources" items={items} />)
    const [first, second] = ratios()
    expect(first).toBe(1)
    expect(second).toBeCloseTo(388 / 631, 5)
  })

  it('scales bars to the sum when asked for share of total', () => {
    render(<BreakdownList label="Traffic sources" items={items} scale="total" />)
    const total = 631 + 388 + 88
    expect(ratios()[0]).toBeCloseTo(631 / total, 5)
  })

  // A real state: a card shared today with nothing measured yet.
  it('renders flat bars rather than NaN when every value is zero', () => {
    render(
      <BreakdownList
        label="Traffic sources"
        items={[
          { label: 'QR', value: 0 },
          { label: 'Direct', value: 0 },
        ]}
      />,
    )
    expect(ratios()).toEqual([0, 0])
  })

  it('renders nothing but an empty list when given no items', () => {
    render(<BreakdownList label="Traffic sources" items={[]} />)
    expect(screen.getByRole('list', { name: 'Traffic sources' })).toBeEmptyDOMElement()
  })

  it('formats values in the viewer locale by default', () => {
    render(<BreakdownList label="Views" items={[{ label: 'QR', value: 1684 }]} />)
    expect(screen.getByText((1684).toLocaleString())).toBeVisible()
  })

  it('lets a row carry its own unit', () => {
    render(
      <BreakdownList
        label="Links"
        items={[{ label: 'Book a time', value: 298, valueLabel: '298 clicks' }]}
      />,
    )
    expect(screen.getByText('298 clicks')).toBeVisible()
  })
})
