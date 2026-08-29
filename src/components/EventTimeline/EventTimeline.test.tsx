import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EventTimeline } from './EventTimeline'

// The two layouts — the line from `sm` up, the dots on a phone — are CSS,
// and are pinned in EventTimeline.stories.tsx where a real browser can
// answer for them (see CONTRIBUTING).

const events = [
  {
    id: 'saastr-annual',
    name: 'SaaStr Annual',
    date: '2027-09-09',
    location: 'San Francisco, CA',
  },
  {
    id: 'founders-dinner',
    name: 'Founders Dinner',
    date: '2027-11-12',
    location: 'Denver, CO',
  },
  { id: 'revops-summit', name: 'RevOps Summit', date: '2028-01-22' },
]

const today = '2027-12-01'

describe('EventTimeline', () => {
  it('renders a labelled group with one radio per event', () => {
    render(<EventTimeline events={events} today={today} />)

    expect(
      screen.getByRole('group', { name: 'Event timeline' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('selects the first event when no selection is given', () => {
    render(<EventTimeline events={events} today={today} />)
    expect(screen.getByRole('radio', { name: /SaaStr Annual/ })).toBeChecked()
  })

  it('starts on `defaultValue` and moves itself from there', async () => {
    const user = userEvent.setup()
    render(
      <EventTimeline
        events={events}
        today={today}
        defaultValue="founders-dinner"
      />,
    )

    expect(screen.getByRole('radio', { name: /Founders Dinner/ })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: /RevOps Summit/ }))
    expect(screen.getByRole('radio', { name: /RevOps Summit/ })).toBeChecked()
  })

  it('reports the event picked', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <EventTimeline
        events={events}
        today={today}
        defaultValue="saastr-annual"
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Founders Dinner/ }))
    expect(onValueChange).toHaveBeenCalledWith('founders-dinner')
  })

  it('stays where the caller puts it when controlled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <EventTimeline
        events={events}
        today={today}
        value="saastr-annual"
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Founders Dinner/ }))

    // It asked; the answer never came back as a prop, so it did not move.
    expect(onValueChange).toHaveBeenCalledWith('founders-dinner')
    expect(screen.getByRole('radio', { name: /SaaStr Annual/ })).toBeChecked()
  })

  it('says whether an event has happened, in text', () => {
    render(<EventTimeline events={events} today={today} />)

    expect(
      screen.getByRole('radio', { name: /SaaStr Annual\s*\(past\)/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: /RevOps Summit\s*\(still to come\)/ }),
    ).toBeInTheDocument()
  })

  it('reads the line from `today`, so the same event can be either', () => {
    const { rerender } = render(
      <EventTimeline events={events} today="2027-10-01" />,
    )
    expect(
      screen.getByRole('radio', { name: /Founders Dinner\s*\(still to come\)/ }),
    ).toBeInTheDocument()

    rerender(<EventTimeline events={events} today="2027-12-01" />)
    expect(
      screen.getByRole('radio', { name: /Founders Dinner\s*\(past\)/ }),
    ).toBeInTheDocument()
  })

  it('keeps the machine-readable date beside the rendered one', () => {
    render(<EventTimeline events={events} today={today} locale="en-US" />)

    const [saastr] = screen.getAllByText('September 9, 2027')
    expect(saastr.closest('time')).toHaveAttribute('datetime', '2027-09-09')
  })

  it('renders nothing but the group when there are no events', () => {
    render(<EventTimeline events={[]} today={today} />)

    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })
})
