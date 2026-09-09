import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlanCard } from './PlanCard'

describe('PlanCard', () => {
  it('states the price and what it is per', () => {
    render(
      <PlanCard name="Pro" price="$8" period="/mo" features={['Unlimited cards']} />,
    )
    expect(screen.getByText('$8')).toBeVisible()
    expect(screen.getByText('/mo')).toBeVisible()
  })

  it('lists what the plan includes', () => {
    render(
      <PlanCard
        name="Pro"
        price="$8"
        features={['Unlimited cards', 'CRM integrations']}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('CRM integrations')).toBeVisible()
  })

  // Which plan you are on is the most important thing on the screen, so it
  // is said in a word and not only drawn as a border.
  it('marks the current plan in words', () => {
    render(<PlanCard name="Team" price="$9" features={[]} current />)
    expect(screen.getByText('Current')).toBeVisible()
  })

  it('says nothing about being current when it is not', () => {
    render(<PlanCard name="Solo" price="$0" features={[]} />)
    expect(screen.queryByText('Current')).not.toBeInTheDocument()
  })

  it('names the plan at the level the page asks for', () => {
    render(<PlanCard name="Solo" price="$0" features={[]} level={2} />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Solo' }),
    ).toBeInTheDocument()
  })
})
