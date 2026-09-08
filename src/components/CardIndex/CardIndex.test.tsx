import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CardIndex } from './CardIndex'

const items = [
  { id: 'sam', name: 'Sam Ellery', detail: 'CEO at Trail & Co' },
  { id: 'omar', name: 'Omar Whitfield', detail: 'Operating Partner at Halden Group' },
]

describe('CardIndex', () => {
  it('names the list for assistive tech', () => {
    render(<CardIndex items={items} label="Everyone from Founders Dinner" />)
    expect(
      screen.getByRole('list', { name: 'Everyone from Founders Dinner' }),
    ).toBeInTheDocument()
  })

  it('reports the id of the card that should come to the top', async () => {
    const onValueChange = vi.fn()
    render(<CardIndex items={items} layout="rows" onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('button', { name: /Omar Whitfield/ }))
    expect(onValueChange).toHaveBeenCalledWith('omar')
  })

  // The card on top is marked rather than filtered out, so the list holds
  // still while you flip through the pile.
  it('marks the current card without removing it', () => {
    render(<CardIndex items={items} value="sam" layout="rows" />)

    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(screen.getByRole('button', { name: /Sam Ellery/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(
      screen.getByRole('button', { name: /Omar Whitfield/ }),
    ).not.toHaveAttribute('aria-current')
  })

  // A strip is faces and names; a title hidden in CSS would still be in the
  // markup, and still announced.
  it('leaves titles out of the strip entirely', () => {
    render(<CardIndex items={items} layout="strip" />)

    expect(screen.getByRole('button', { name: 'Sam Ellery' })).toBeInTheDocument()
    expect(screen.queryByText('CEO at Trail & Co')).not.toBeInTheDocument()
  })

  // Colour is not the only carrier: the row that is showing says so.
  it('marks the current row in words as well as in a tint', () => {
    render(<CardIndex items={items} value="sam" layout="rows" />)
    expect(screen.getByText('Showing')).toBeVisible()
  })

  it('takes whatever word the page uses for the marker', () => {
    render(
      <CardIndex items={items} value="sam" layout="rows" currentLabel="On top" />,
    )
    expect(screen.getByText('On top')).toBeVisible()
    expect(screen.queryByText('Showing')).not.toBeInTheDocument()
  })

  // A button inside a button is not a thing a browser will render, so a row
  // that both selects and edits needs the two as siblings.
  it('keeps a row action outside the button that selects the row', () => {
    render(
      <CardIndex
        layout="rows"
        items={[
          { ...items[0], action: <button type="button">Edit Sam</button> },
        ]}
      />,
    )
    const edit = screen.getByRole('button', { name: 'Edit Sam' })
    const select = screen.getByRole('button', { name: /Sam Ellery/ })
    expect(select.contains(edit)).toBe(false)
  })

  // A 4.5rem cell has room for a face and a name and nothing else.
  it('leaves badges and actions out of the strip', () => {
    render(
      <CardIndex
        layout="strip"
        items={[
          {
            ...items[0],
            badge: <span>Business</span>,
            action: <button type="button">Edit Sam</button>,
          },
        ]}
      />,
    )
    expect(screen.queryByText('Business')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit Sam' }),
    ).not.toBeInTheDocument()
  })

  // Nothing to measure the viewport with, so the layout that survives any
  // width is the one that renders.
  it('falls back to the strip where the width cannot be read', () => {
    render(<CardIndex items={items} />)
    expect(screen.getByRole('list')).toHaveAttribute('data-layout', 'strip')
  })
})
