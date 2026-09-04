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

  // The note is closed until it is wanted: the back of a card should read as
  // something written on, not as a form waiting to be filled in.
  it('keeps the field closed until asked', () => {
    render(<PrivateNote />)
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(
      screen.getByRole('button', { name: /Add a note/ }),
    ).toBeInTheDocument()
  })

  it('shows what is written on the closed field', () => {
    render(<PrivateNote value="Wants an intro to Priya." />)
    expect(
      screen.getByRole('button', { name: /Edit note: Wants an intro to Priya/ }),
    ).toBeInTheDocument()
  })

  it('opens the editor on the closed field, focused', async () => {
    render(<PrivateNote />)

    await userEvent.click(screen.getByRole('button', { name: /Add a note/ }))

    const field = screen.getByRole('textbox', {
      name: 'How do you remember them?',
    })
    expect(field).toHaveFocus()
  })

  // Typing is not saving. The whole point of opening a field with a Save in
  // it is that you can close it again without having changed anything.
  it('reports the note only on save', async () => {
    const onValueChange = vi.fn()
    render(<PrivateNote onValueChange={onValueChange} value="" />)

    await userEvent.click(screen.getByRole('button', { name: /Add a note/ }))
    await userEvent.type(screen.getByRole('textbox'), 'Hi')
    expect(onValueChange).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('Hi')
  })

  it('throws the draft away on cancel', async () => {
    const onValueChange = vi.fn()
    render(<PrivateNote onValueChange={onValueChange} value="Original" />)

    await userEvent.click(screen.getByRole('button', { name: /Edit note/ }))
    await userEvent.type(screen.getByRole('textbox'), ' and more')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onValueChange).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: /Edit note: Original/ }),
    ).toBeInTheDocument()
  })

  // Reopening after a cancel must offer the saved note, not the abandoned
  // draft — otherwise "cancel" only hid it.
  it('reopens on the saved note, not the abandoned draft', async () => {
    render(<PrivateNote value="Original" />)

    await userEvent.click(screen.getByRole('button', { name: /Edit note/ }))
    await userEvent.type(screen.getByRole('textbox'), ' and more')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await userEvent.click(screen.getByRole('button', { name: /Edit note/ }))

    expect(screen.getByRole('textbox')).toHaveValue('Original')
  })

  // The heading gives up its pixels to Cancel and Save on a card back that
  // has none spare. It must not give up its meaning with them: it still names
  // the region, and a screen reader still hears the question.
  it('keeps the region named while the editor is open', async () => {
    render(<PrivateNote />)

    await userEvent.click(screen.getByRole('button', { name: /Add a note/ }))

    expect(
      screen.getByRole('region', { name: 'How did this connection feel?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'How did this connection feel?' }),
    ).toBeInTheDocument()
  })

  it('cancels on Escape', async () => {
    const onValueChange = vi.fn()
    render(<PrivateNote onValueChange={onValueChange} value="" />)

    await userEvent.click(screen.getByRole('button', { name: /Add a note/ }))
    await userEvent.type(screen.getByRole('textbox'), 'Hi{Escape}')

    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('has nothing to save until something changes', async () => {
    render(<PrivateNote value="Original" />)

    await userEvent.click(screen.getByRole('button', { name: /Edit note/ }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    await userEvent.type(screen.getByRole('textbox'), '!')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  // Closing the editor should put the cursor back on the control that opened
  // it, rather than dropping focus to the top of the page.
  it('returns focus to the field it came from', async () => {
    render(<PrivateNote value="Original" />)

    await userEvent.click(screen.getByRole('button', { name: /Edit note/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('button', { name: /Edit note/ })).toHaveFocus()
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
