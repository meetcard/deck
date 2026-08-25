import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IconButton } from './IconButton'

const Icon = () => <svg data-testid="icon" />

describe('IconButton', () => {
  // The whole reason `label` is required: an icon-only control is otherwise
  // announced as an unnamed "button".
  it('uses the label as its accessible name', () => {
    render(<IconButton label="Share card" icon={<Icon />} />)
    expect(screen.getByRole('button')).toHaveAccessibleName('Share card')
  })

  it('hides the icon from assistive tech', () => {
    render(<IconButton label="Share card" icon={<Icon />} />)
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('activates on click', async () => {
    const onClick = vi.fn()
    render(<IconButton label="Share card" icon={<Icon />} onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: 'Share card' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('defaults to type="button"', () => {
    render(<IconButton label="Share card" icon={<Icon />} />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
