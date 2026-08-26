import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('is labelled and toggles on click', async () => {
    const onChange = vi.fn()
    render(<Checkbox label="Add to CRM" onChange={onChange} />)

    const checkbox = screen.getByRole('checkbox', { name: 'Add to CRM' })
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('toggles with the space key', async () => {
    render(<Checkbox label="Add to CRM" />)

    await userEvent.tab()
    expect(screen.getByRole('checkbox')).toHaveFocus()

    await userEvent.keyboard(' ')
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('toggles when the label text is clicked', async () => {
    render(<Checkbox label="Add to CRM" />)

    await userEvent.click(screen.getByText('Add to CRM'))

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  describe('indeterminate', () => {
    // `indeterminate` is a DOM property with no HTML attribute, so it is easy
    // to set on the React element and have it silently do nothing.
    it('sets the DOM property and announces "mixed"', () => {
      render(<Checkbox label="Select all" indeterminate />)

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.indeterminate).toBe(true)
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('clears the DOM property when turned off', () => {
      const { rerender } = render(
        <Checkbox label="Select all" indeterminate />,
      )
      rerender(<Checkbox label="Select all" indeterminate={false} />)

      expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(
        false,
      )
    })
  })

  it('describes itself with the error message', () => {
    render(<Checkbox label="I agree" error="You must accept to continue" />)

    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription(
      'You must accept to continue',
    )
    expect(screen.getByRole('alert')).toBeVisible()
  })

  it('does not toggle when disabled', async () => {
    render(<Checkbox label="Add to CRM" disabled />)

    await userEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('forwards a ref to the input', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Checkbox ref={ref} label="Add to CRM" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
