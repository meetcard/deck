import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventAgenda } from './EventAgenda'
import type { AgendaEvent } from './EventAgenda'

const MAY: AgendaEvent = {
  id: 'revops',
  name: 'RevOps Summit',
  date: '2027-05-18',
  time: '9:00 AM',
  href: '/events/revops',
}

const MAY_LATER: AgendaEvent = {
  id: 'after-hours',
  name: 'RevOps After Hours',
  date: '2027-05-18',
  time: '7:00 PM',
}

const JUNE: AgendaEvent = {
  id: 'climate',
  name: 'Boulder Climate Happy Hour',
  date: '2027-06-16',
  time: '5:30 PM',
}

describe('EventAgenda', () => {
  it('gathers events sharing a date under one day heading', () => {
    render(<EventAgenda events={[MAY, MAY_LATER, JUNE]} />)

    // Two May events, one May heading.
    expect(screen.getAllByText(/May 1[78]/)).toHaveLength(1)
    expect(screen.getByText('RevOps Summit')).toBeInTheDocument()
    expect(screen.getByText('RevOps After Hours')).toBeInTheDocument()
  })

  it('keeps the callers order rather than sorting', () => {
    render(<EventAgenda events={[JUNE, MAY]} />)

    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
    expect(names).toEqual(['Boulder Climate Happy Hour', 'RevOps Summit'])
  })

  it('links only the name, so the row is not one giant tab stop', () => {
    render(<EventAgenda events={[MAY]} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName('RevOps Summit')
  })

  it('leaves the name as text when there is no href', () => {
    render(<EventAgenda events={[JUNE]} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('puts the machine-readable date on the day heading', () => {
    render(<EventAgenda events={[MAY]} />)
    expect(screen.getByText(/May 1[78]/).closest('time')).toHaveAttribute(
      'dateTime',
      '2027-05-18',
    )
  })

  it('counts exchanged cards in the singular for exactly one', () => {
    render(
      <EventAgenda
        events={[{ ...MAY, exchangedCount: 1, attendees: [{ name: 'Lena Fox' }] }]}
      />,
    )
    expect(screen.getByText('1 card exchanged')).toBeInTheDocument()
  })

  it('names the stack for the event it belongs to', () => {
    render(
      <EventAgenda
        events={[{ ...MAY, attendees: [{ name: 'Lena Fox' }] }]}
      />,
    )

    const stack = screen.getByRole('list', {
      name: 'Cards exchanged at RevOps Summit',
    })
    expect(within(stack).getByRole('img', { name: 'Lena Fox' })).toBeInTheDocument()
  })
})
