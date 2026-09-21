import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeaturedEventsHeaderCard } from './FeaturedEventsHeaderCard'

describe('FeaturedEventsHeaderCard', () => {
  it('names the event at the level the page asks for', () => {
    render(<FeaturedEventsHeaderCard name="RevOps Summit" level={1} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeInTheDocument()
  })

  it('lists when and where', () => {
    render(
      <FeaturedEventsHeaderCard
        name="RevOps Summit"
        facts={[{ text: 'Tuesday, May 18, 2027' }, { text: 'Austin, Texas' }]}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Austin, Texas')).toBeVisible()
  })

  // What is on after this is the question a calendar answers.
  it('shows the event after this one', () => {
    render(
      <FeaturedEventsHeaderCard
        name="RevOps Summit"
        upNext={{ label: 'Up next · Jun 16', name: 'Boulder Climate Happy Hour' }}
      />,
    )
    expect(screen.getByText('Up next · Jun 16')).toBeVisible()
    expect(screen.getByText('Boulder Climate Happy Hour')).toBeVisible()
  })

  it('ends on its facts when there is nothing after this', () => {
    const { container } = render(<FeaturedEventsHeaderCard name="RevOps Summit" />)
    expect(container.querySelector('.deck-featured-events-header-card__next')).toBeNull()
  })

  it('links the name when given a destination', () => {
    render(<FeaturedEventsHeaderCard name="RevOps Summit" href="/events/revops" />)
    expect(screen.getByRole('link', { name: 'RevOps Summit' })).toHaveAttribute(
      'href',
      '/events/revops',
    )
  })
})
