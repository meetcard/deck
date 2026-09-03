import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventHero, EventHeroPanel } from './EventHero'

describe('EventHero', () => {
  it('renders the name at the requested heading level', () => {
    render(<EventHero name="RevOps Summit" level={1} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeInTheDocument()
  })

  it('links the name when given an href', () => {
    render(<EventHero name="RevOps Summit" href="/events/revops" />)
    expect(screen.getByRole('link', { name: 'RevOps Summit' })).toHaveAttribute(
      'href',
      '/events/revops',
    )
  })

  it('promotes the eyebrow to a heading when asked', () => {
    render(<EventHero name="RevOps Summit" eyebrow="Events" eyebrowAs="h1" />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Events' }),
    ).toBeInTheDocument()
  })

  it('leaves the cover out of the accessibility tree', () => {
    render(<EventHero name="RevOps Summit" coverSrc="/cover.jpg" />)
    // The picture says nothing the name and date do not; describing it would
    // only put "stock photo of a stage" between a screen reader and the event.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

describe('EventHeroPanel', () => {
  it('is a link when given an href, and plain otherwise', () => {
    const { rerender } = render(<EventHeroPanel title="Boulder Climate" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    rerender(<EventHeroPanel title="Boulder Climate" href="/events/climate" />)
    expect(screen.getByRole('link', { name: /Boulder Climate/ })).toHaveAttribute(
      'href',
      '/events/climate',
    )
  })
})
