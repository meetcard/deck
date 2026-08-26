import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventCard } from './EventCard'

describe('EventCard', () => {
  it('renders the name as plain text when there is no href', () => {
    render(<EventCard name="RevOps Summit" startDate="2027-05-18" />)

    expect(screen.getByText('RevOps Summit')).toBeVisible()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders the name as a link when href is given', () => {
    render(
      <EventCard
        name="RevOps Summit"
        startDate="2027-05-18"
        href="/events/revops-summit-2027-05-18"
      />,
    )

    expect(
      screen.getByRole('link', { name: 'RevOps Summit' }),
    ).toHaveAttribute('href', '/events/revops-summit-2027-05-18')
  })

  describe('date formatting', () => {
    it('falls back to the raw string for an unparseable start date', () => {
      render(<EventCard name="TBD Summit" startDate="not-a-date" />)
      expect(screen.getByText('not-a-date')).toBeInTheDocument()
    })

    it('falls back to the formatted start date for an unparseable end date', () => {
      render(
        <EventCard
          name="RevOps Summit"
          startDate="2027-05-18"
          endDate="not-a-date"
        />,
      )
      // "May 17" vs "May 18" depends on the runner's timezone (the date
      // string parses as UTC midnight); the day itself isn't the point here
      // — that it fell back to a formatted date at all, rather than showing
      // the raw "not-a-date" string, is.
      expect(screen.getByText(/May 1[78], 2027/)).toBeInTheDocument()
    })

    it('sets the machine-readable dateTime to the raw start date', () => {
      render(<EventCard name="RevOps Summit" startDate="2027-05-18" />)
      expect(
        screen.getByText(/May 1[78], 2027/).closest('time'),
      ).toHaveAttribute('dateTime', '2027-05-18')
    })

    it('spells out both dates in full when a range crosses months', () => {
      render(
        <EventCard
          name="RevOps Summit"
          startDate="2027-05-30"
          endDate="2027-06-02"
        />,
      )
      // Two full "Month Day, Year" dates joined by an en dash, rather than
      // the shared-month "May 18–20, 2027" contraction.
      expect(screen.getByText(/2027.*–.*2027/)).toBeInTheDocument()
    })
  })

  describe('connection count', () => {
    it('uses the singular for exactly one connection', () => {
      render(
        <EventCard
          name="RevOps Summit"
          startDate="2027-05-18"
          connectionCount={1}
        />,
      )
      expect(screen.getByText('1 connection captured')).toBeInTheDocument()
    })

    it('uses the plural otherwise', () => {
      render(
        <EventCard
          name="RevOps Summit"
          startDate="2027-05-18"
          connectionCount={12}
        />,
      )
      expect(screen.getByText('12 connections captured')).toBeInTheDocument()
    })

    it('omits the line entirely when not given', () => {
      render(<EventCard name="RevOps Summit" startDate="2027-05-18" />)
      expect(screen.queryByText(/captured/)).not.toBeInTheDocument()
    })
  })

  it('forwards a ref to the card element', () => {
    const ref = { current: null as HTMLElement | null }
    render(<EventCard ref={ref} name="RevOps Summit" startDate="2027-05-18" />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })
})
