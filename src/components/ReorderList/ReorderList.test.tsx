import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReorderList } from './ReorderList'

const items = [
  { id: 'book', label: 'Book a time', content: <span>Book a time</span> },
  { id: 'site', label: 'Website', content: <span>Website</span> },
  { id: 'save', label: 'Save contact', content: <span>Save contact</span> },
]

describe('ReorderList', () => {
  it('names the list for assistive tech', () => {
    render(
      <ReorderList items={items} label="Calls to action" onReorder={vi.fn()} />,
    )
    expect(
      screen.getByRole('list', { name: 'Calls to action' }),
    ).toBeInTheDocument()
  })

  // The whole point: a grip you can only drag does not exist for anyone
  // using a keyboard.
  it('moves a row down with the arrow keys', async () => {
    const onReorder = vi.fn()
    render(
      <ReorderList items={items} label="Calls to action" onReorder={onReorder} />,
    )

    const handle = screen.getByRole('button', { name: 'Reorder Book a time' })
    handle.focus()
    await userEvent.keyboard('{ArrowDown}')

    expect(onReorder).toHaveBeenCalledWith(['site', 'book', 'save'])
  })

  it('moves a row up with the arrow keys', async () => {
    const onReorder = vi.fn()
    render(
      <ReorderList items={items} label="Calls to action" onReorder={onReorder} />,
    )

    screen.getByRole('button', { name: 'Reorder Website' }).focus()
    await userEvent.keyboard('{ArrowUp}')

    expect(onReorder).toHaveBeenCalledWith(['site', 'book', 'save'])
  })

  it('does not move the top row up or the bottom row down', async () => {
    const onReorder = vi.fn()
    render(
      <ReorderList items={items} label="Calls to action" onReorder={onReorder} />,
    )

    screen.getByRole('button', { name: 'Reorder Book a time' }).focus()
    await userEvent.keyboard('{ArrowUp}')
    screen.getByRole('button', { name: 'Reorder Save contact' }).focus()
    await userEvent.keyboard('{ArrowDown}')

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('announces where the row landed', async () => {
    const onReorder = vi.fn()
    render(
      <ReorderList items={items} label="Calls to action" onReorder={onReorder} />,
    )

    screen.getByRole('button', { name: 'Reorder Book a time' }).focus()
    await userEvent.keyboard('{ArrowDown}')

    expect(screen.getByText('Book a time, position 2 of 3')).toBeInTheDocument()
  })

  // The handle says what it does; how to do it without a mouse is said with
  // it rather than left to be discovered.
  it('describes the keyboard gesture on the handle', () => {
    render(
      <ReorderList items={items} label="Calls to action" onReorder={vi.fn()} />,
    )

    const handle = screen.getByRole('button', { name: 'Reorder Book a time' })
    const hint = document.getElementById(handle.getAttribute('aria-describedby')!)
    expect(hint).toHaveTextContent(
      'Press the up and down arrow keys to move this row.',
    )
  })
})
