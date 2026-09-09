import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '../Button/Button'
import { MemberRow } from './MemberRow'

describe('MemberRow', () => {
  it('treats a member as active unless told otherwise', () => {
    render(<MemberRow name="Sam Oyelaran" email="sam@meetcard.io" />)
    expect(screen.getByText('Active')).toBeVisible()
  })

  // Status is words, never a tone on its own.
  it('states each status in text', () => {
    const { rerender } = render(<MemberRow name="Dana" status="invited" />)
    expect(screen.getByText('Invited')).toBeVisible()

    rerender(<MemberRow name="Dana" status="suspended" />)
    expect(screen.getByText('Suspended')).toBeVisible()
  })

  it('marks the signed-in person', () => {
    render(<MemberRow name="Ben Ackles" isYou />)
    expect(screen.getByText('You')).toBeVisible()
  })

  it('leaves the badge off everyone else', () => {
    render(<MemberRow name="Sam Oyelaran" />)
    expect(screen.queryByText('You')).not.toBeInTheDocument()
  })

  // The name is text on the row already; announcing the avatar repeats it.
  it('keeps the avatar out of the accessibility tree', () => {
    render(<MemberRow name="Sam Oyelaran" avatarSrc="/sam.png" />)
    expect(screen.queryByRole('img', { name: 'Sam Oyelaran' })).not.toBeInTheDocument()
  })

  it('renders its role control and actions', () => {
    render(
      <MemberRow
        name="Sam Oyelaran"
        role={<span>Admin</span>}
        actions={<Button>Remove</Button>}
      />,
    )
    expect(screen.getByText('Admin')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })
})
