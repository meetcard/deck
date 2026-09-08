import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventSchedule } from './EventSchedule'

const entries = [
  { time: '9:00 AM', title: 'Doors and coffee' },
  { time: '10:00 AM', title: 'Keynote' },
]

describe('EventSchedule', () => {
  // The pairing is the point: a real `dl` reads a time together with what
  // happens then, where a list of rows leaves it to source order.
  it('pairs each time with its session', () => {
    const { container } = render(<EventSchedule entries={entries} />)

    const rows = container.querySelectorAll('.deck-event-schedule__row')
    expect(rows).toHaveLength(2)
    expect(rows[0].querySelector('dt')).toHaveTextContent('9:00 AM')
    expect(rows[0].querySelector('dd')).toHaveTextContent('Doors and coffee')
  })

  it('names the schedule for assistive tech', () => {
    const { container } = render(
      <EventSchedule entries={entries} label="Schedule for RevOps Summit" />,
    )
    expect(container.querySelector('dl')).toHaveAttribute(
      'aria-label',
      'Schedule for RevOps Summit',
    )
  })

  it('keeps the order it was given', () => {
    render(<EventSchedule entries={[...entries].reverse()} />)
    const times = screen.getAllByText(/AM$/).map((el) => el.textContent)
    expect(times).toEqual(['10:00 AM', '9:00 AM'])
  })
})
