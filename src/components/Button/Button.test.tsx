import type { FormEvent } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('calls onClick when activated with the mouse', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Share card</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Share card' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is reachable and activatable by keyboard', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Share card</Button>)

    await userEvent.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Share card
      </Button>,
    )

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  // Guards the deliberate default: a Button inside a form must not submit
  // it unless the caller opts in.
  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Share card</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('can opt into submitting a form', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Save</Button>
      </form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('keeps icons out of the accessible name', () => {
    render(
      <Button iconStart={<svg data-testid="icon" />}>Add to CRM</Button>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleName('Add to CRM')
  })

  it('forwards a ref to the underlying button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>Share card</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
