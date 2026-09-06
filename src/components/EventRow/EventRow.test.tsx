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
