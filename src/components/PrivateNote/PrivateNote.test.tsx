import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PrivateNote } from './PrivateNote'

describe('PrivateNote', () => {
  it('is a labelled region', () => {
    render(<PrivateNote />)
    expect(
      screen.getByRole('region', { name: 'How did this connection feel?' }),
    ).toBeInTheDocument()
  })

  // The promise about where the note lives is the thing that makes people
  // willing to write one, so it is asserted rather than assumed.
  it('states where the note stays', () => {
    render(<PrivateNote />)
    expect(screen.getByText(/Private to you/)).toBeInTheDocument()
    expect(screen.getByText(/This device only/)).toBeInTheDocument()
  })

  it('offers the three feelings as a single choice', () => {
    render(<PrivateNote />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    expect(radios.every((r) => !(r as HTMLInputElement).checked)).toBe(true)
  })

  it('reports a chosen feeling', async () => {
    const onFeelingChange = vi.fn()
    render(<PrivateNote onFeelingChange={onFeelingChange} />)

    await userEvent.click(screen.getByRole('radio', { name: /Cold/ }))

    expect(onFeelingChange).toHaveBeenCalledWith('cold')
  })

  it('reports the note as it is typed', async () => {
    const onValueChange = vi.fn()
    render(<PrivateNote onValueChange={onValueChange} value="" />)

    await userEvent.type(
      screen.getByRole('textbox', { name: 'How do you remember them?' }),
      'Hi',
    )

    expect(onValueChange).toHaveBeenCalled()
  })

  it('omits the hide control when there is nowhere to go back to', () => {
    render(<PrivateNote />)
    expect(screen.queryByRole('button', { name: 'Hide' })).toBeNull()
  })

  it('hides on request', async () => {
    const onHide = vi.fn()
    render(<PrivateNote onHide={onHide} />)

    await userEvent.click(screen.getByRole('button', { name: 'Hide' }))

    expect(onHide).toHaveBeenCalledOnce()
  })
})
