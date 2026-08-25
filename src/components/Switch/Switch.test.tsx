import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './Switch'

describe('Switch', () => {
  // role="switch" is what distinguishes an immediate toggle from a checkbox
  // that only applies on submit.
  it('announces as a switch, not a checkbox', () => {
    render(<Switch label="Discoverable by email" />)

    expect(
      screen.getByRole('switch', { name: 'Discoverable by email' }),
    ).toBeVisible()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('toggles on click', async () => {
    const onChange = vi.fn()
    render(<Switch label="Discoverable by email" onChange={onChange} />)

    const toggle = screen.getByRole('switch')
    expect(toggle).not.toBeChecked()

    await userEvent.click(toggle)

    expect(toggle).toBeChecked()
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('toggles with the space key', async () => {
    render(<Switch label="Discoverable by email" />)

    await userEvent.tab()
    expect(screen.getByRole('switch')).toHaveFocus()

    await userEvent.keyboard(' ')

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('toggles when the label is clicked', async () => {
    render(<Switch label="Discoverable by email" />)

    await userEvent.click(screen.getByText('Discoverable by email'))

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('links its description for assistive tech', () => {
    render(
      <Switch
        label="Discoverable by email"
        description="People who have your email can find your card."
      />,
    )

    expect(screen.getByRole('switch')).toHaveAccessibleDescription(
      'People who have your email can find your card.',
    )
  })

  it('does not toggle when disabled', async () => {
    render(<Switch label="Discoverable by email" disabled />)

    await userEvent.click(screen.getByRole('switch'))

    expect(screen.getByRole('switch')).not.toBeChecked()
  })
})
