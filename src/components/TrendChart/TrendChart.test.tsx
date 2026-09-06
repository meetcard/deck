import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TrendChart } from './TrendChart'

const points = [
  { label: 'W1', value: 312, fullLabel: 'Week 1' },
  { label: 'W2', value: 517, fullLabel: 'Week 2' },
  { label: 'W3', value: 427, fullLabel: 'Week 3' },
]

const ratios = () =>
  [...document.querySelectorAll('.deck-trend-chart__column')].map((column) =>
    Number((column as HTMLElement).style.getPropertyValue('--deck-trend-ratio')),
  )

describe('TrendChart', () => {
  it('names the chart for assistive tech', () => {
    render(<TrendChart label="Views over time" points={points} />)
    expect(screen.getByRole('list', { name: 'Views over time' })).toBeInTheDocument()
  })

  // Nothing is locked inside the drawing: each column states its own reading.
  it('gives every column a spoken reading', () => {
    render(<TrendChart label="Views over time" unit="views" points={points} />)
    expect(screen.getByText('Week 1: 312 views')).toBeInTheDocument()
    expect(screen.getByText('Week 2: 517 views')).toBeInTheDocument()
  })

  it('falls back to the tick label when there is no long form', () => {
    render(
      <TrendChart label="Views" unit="views" points={[{ label: 'W1', value: 12 }]} />,
    )
    expect(screen.getByText('W1: 12 views')).toBeInTheDocument()
  })

  it('scales columns to the tallest point', () => {
    render(<TrendChart label="Views over time" points={points} />)
    const [first, second, third] = ratios()
    expect(second).toBe(1)
    expect(first).toBeCloseTo(312 / 517, 5)
    expect(third).toBeCloseTo(427 / 517, 5)
  })

  it('labels the peak and the most recent column', () => {
    render(<TrendChart label="Views over time" points={points} />)
    const labelled = document.querySelectorAll(
      '.deck-trend-chart__column--labelled',
    )
    expect(labelled).toHaveLength(2)
  })

  // A run that ends on its high point is one column, not two labels stacked.
  it('collapses the labels when the peak is also the most recent', () => {
    render(
      <TrendChart
        label="Views over time"
        points={[
          { label: 'W1', value: 100 },
          { label: 'W2', value: 300 },
        ]}
      />,
    )
    expect(
      document.querySelectorAll('.deck-trend-chart__column--labelled'),
    ).toHaveLength(1)
  })

  it('draws a flat baseline rather than NaN when nothing was measured', () => {
    render(
      <TrendChart
        label="Views over time"
        points={[
          { label: 'W1', value: 0 },
          { label: 'W2', value: 0 },
        ]}
      />,
    )
    expect(ratios()).toEqual([0, 0])
  })

  // Ticks and readouts restate text that is already announced above them.
  it('hides the drawing from assistive tech', () => {
    render(<TrendChart label="Views over time" points={points} />)
    const plot = document.querySelector('.deck-trend-chart__plot')
    expect(plot).toHaveAttribute('aria-hidden', 'true')
  })
})
