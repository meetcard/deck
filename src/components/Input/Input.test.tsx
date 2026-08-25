import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('associates the label with the control', () => {
    render(<Input label="Work email" />)
    expect(screen.getByLabelText('Work email')).toBeVisible()
  })

  it('keeps the label available when visually hidden', () => {
    render(<Input label="Search your deck" hideLabel />)
    expect(screen.getByLabelText('Search your deck')).toBeVisible()
  })

  it('accepts typed input', async () => {
    const onChange = vi.fn()
    render(<Input label="Work email" onChange={onChange} />)

    await userEvent.type(screen.getByLabelText('Work email'), 'ada@')

    expect(screen.getByLabelText('Work email')).toHaveValue('ada@')
    expect(onChange).toHaveBeenCalled()
  })

  describe('error state', () => {
    it('marks the control invalid and describes it', () => {
      render(<Input label="Work email" error="Enter a valid address" />)

      const input = screen.getByLabelText('Work email')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAccessibleDescription('Enter a valid address')
    })

    // Errors appear after a failed submit, so they must be announced rather
    // than silently rendered.
    it('announces the message', () => {
      render(<Input label="Work email" error="Enter a valid address" />)
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Enter a valid address',
      )
    })

    it('is not invalid without an error', () => {
      render(<Input label="Work email" />)
      expect(screen.getByLabelText('Work email')).not.toHaveAttribute(
        'aria-invalid',
      )
    })
  })

  it('describes the control with both description and error', () => {
    render(
      <Input
        label="Work email"
        description="Used to match connections"
        error="Enter a valid address"
      />,
    )

    expect(screen.getByLabelText('Work email')).toHaveAccessibleDescription(
      'Used to match connections Enter a valid address',
    )
  })

  it('does not type into a disabled input', async () => {
    render(<Input label="Work email" disabled />)

    await userEvent.type(screen.getByLabelText('Work email'), 'ada')

    expect(screen.getByLabelText('Work email')).toHaveValue('')
  })
})
