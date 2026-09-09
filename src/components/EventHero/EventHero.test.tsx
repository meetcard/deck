import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventHero } from './EventHero'

describe('EventHero', () => {
  it('puts the name at the level the page asks for', () => {
    render(<EventHero name="RevOps Summit" level={1} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeInTheDocument()
  })

  it('links the name when the event has somewhere to go', () => {
    render(<EventHero name="RevOps Summit" href="/events/revops" />)
    expect(screen.getByRole('link', { name: 'RevOps Summit' })).toHaveAttribute(
      'href',
      '/events/revops',
    )
  })

  // The cover is a backdrop. It says nothing the name does not, and an
  // announced one would just be noise between the badges and the title.
  it('keeps the cover out of the accessibility tree', () => {
    const { container } = render(
      <EventHero name="RevOps Summit" coverSrc="/cover.jpg" />,
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('.deck-event-hero__image')).toHaveAttribute(
      'alt',
      '',
    )
  })

  it('renders a hero without a cover rather than an empty frame', () => {
    const { container } = render(<EventHero name="Founders Dinner" />)
    expect(container.querySelector('.deck-event-hero__image')).toBeNull()
    expect(container.querySelector('.deck-event-hero__scrim')).not.toBeNull()
  })

  it('lists the facts of the thing', () => {
    render(
      <EventHero
        name="RevOps Summit"
        facts={[
          { title: 'Tuesday, May 18, 2027', detail: '9:00 AM – 4:30 PM' },
          { title: 'Austin Convention Center' },
        ]}
      />,
    )
    expect(screen.getByText('Tuesday, May 18, 2027')).toBeVisible()
    expect(screen.getByText('9:00 AM – 4:30 PM')).toBeVisible()
    expect(screen.getByText('Austin Convention Center')).toBeVisible()
  })

  it('names the host', () => {
    render(
      <EventHero
        name="RevOps Summit"
        host={{ name: 'Hannah Davis', detail: 'Community Lead' }}
      />,
    )
    expect(screen.getByText('Hannah Davis')).toBeVisible()
    expect(screen.getByText(/Community Lead/)).toBeVisible()
  })
})
