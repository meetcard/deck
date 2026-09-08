import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventRow } from './EventRow'

describe('EventRow', () => {
  // Announced as a date, not as "May" followed by "18".
  it('gives the date leaf one readable name', () => {
    render(<EventRow name="RevOps Summit" date="2027-05-18" />)
    expect(screen.getByRole('img', { name: 'May 18' })).toBeInTheDocument()
  })

  // An ISO date parsed as UTC lands a day earlier west of Greenwich, which
  // would print the wrong number on the leaf.
  it('does not slip a day in western time zones', () => {
    render(<EventRow name="Founders Dinner" date="2027-11-02" />)
    expect(screen.getByRole('img', { name: 'November 2' })).toBeInTheDocument()
  })

  it('states your relationship to the event in words', () => {
    const { rerender } = render(
      <EventRow name="SaaStr" date="2027-09-09" attendance="speaking" />,
    )
    expect(screen.getByText('Speaking')).toBeVisible()

    rerender(<EventRow name="SaaStr" date="2027-09-09" attendance="hosting" />)
    expect(screen.getByText('Hosting')).toBeVisible()
  })

  it('says nothing about attendance when there is nothing to say', () => {
    render(<EventRow name="SaaStr" date="2027-09-09" />)
    expect(screen.queryByText('Attending')).not.toBeInTheDocument()
  })

  it('marks the one that is close', () => {
    render(<EventRow name="RevOps Summit" date="2027-05-18" soon />)
    expect(screen.getByText('Soon')).toBeVisible()
  })

  it('joins time and venue into one meta line', () => {
    render(
      <EventRow
        name="RevOps Summit"
        date="2027-05-18"
        time="9:00 AM"
        venue="Austin Convention Center"
      />,
    )
    expect(screen.getByText('9:00 AM · Austin Convention Center')).toBeVisible()
  })

  it('adds the weekday when asked', () => {
    render(
      <EventRow name="RevOps Summit" date="2027-05-18" time="9:00 AM" showWeekday />,
    )
    expect(screen.getByText('Tuesday · 9:00 AM')).toBeVisible()
  })

  it('names the host in the meta line', () => {
    render(
      <EventRow
        name="RevOps Summit"
        date="2027-05-18"
        host={{ name: 'Hannah Davis' }}
      />,
    )
    expect(screen.getByText(/By Hannah Davis/)).toBeVisible()
  })

  it('says what you came away with', () => {
    render(
      <EventRow
        name="RevOps Summit"
        date="2027-05-18"
        people={[{ name: 'Hannah Davis' }, { name: 'Marcus Lee' }]}
      />,
    )
    expect(screen.getByText('2 cards exchanged')).toBeVisible()
    expect(
      screen.getByRole('list', { name: 'Cards exchanged at RevOps Summit' }),
    ).toBeInTheDocument()
  })

  // The faces are a sample. A conference where you met forty people shows
  // five of them and still says forty.
  // The same faces mean two different things either side of the date, and
  // an event three weeks out cannot have produced a card yet.
  it('says who is going rather than what was exchanged, when asked', () => {
    render(
      <EventRow
        name="RevOps Summit"
        date="2027-05-18"
        peopleRelation="going"
        people={[{ name: 'Hannah Davis' }, { name: 'Marcus Lee' }]}
      />,
    )
    expect(screen.getByText('2 going')).toBeVisible()
    expect(
      screen.getByRole('list', { name: 'Going to RevOps Summit' }),
    ).toBeInTheDocument()
  })

  it('counts every card, not just the faces it can fit', () => {
    render(
      <EventRow
        name="SaaStr"
        date="2027-09-09"
        people={[{ name: 'Ada Chen' }]}
        peopleCount={40}
      />,
    )
    expect(screen.getByText('40 cards exchanged')).toBeVisible()
  })

  it('counts without faces when there is nobody to show', () => {
    render(<EventRow name="SaaStr" date="2027-09-09" peopleCount={1} />)
    expect(screen.getByText('1 card exchanged')).toBeVisible()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  // The cover is how you recognise an event you have seen before; the name
  // beside it is what says which one it is.
  it('keeps the cover thumbnail out of the accessibility tree', () => {
    const { container } = render(
      <EventRow name="SaaStr" date="2027-09-09" coverSrc="/cover.jpg" />,
    )
    expect(container.querySelector('.deck-event-row__cover')).toHaveAttribute(
      'alt',
      '',
    )
  })

  it('links the name when there is somewhere to go', () => {
    render(
      <EventRow name="RevOps Summit" date="2027-05-18" href="/events/revops" />,
    )
    expect(screen.getByRole('link', { name: 'RevOps Summit' })).toHaveAttribute(
      'href',
      '/events/revops',
    )
  })
})
