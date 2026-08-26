import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BottomNav } from './BottomNav'

const items = [
  { id: '/', label: 'Dashboard', icon: <svg />, href: '/' },
  { id: '/connections', label: 'Connections', icon: <svg />, href: '/connections', badge: 3 },
  { id: '/events', label: 'Events', icon: <svg />, href: '/events' },
  { id: '/me', label: 'Me', icon: <svg />, href: '/me' },
]

describe('BottomNav', () => {
  it('renders a labelled navigation landmark', () => {
    render(<BottomNav items={items} currentId="/" />)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  // The active destination must be announced, not just colored.
  it('marks the current destination with aria-current', () => {
    render(<BottomNav items={items} currentId="/connections" />)

    expect(
      screen.getByRole('link', { name: /Connections/ }),
    ).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Dashboard/ })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('spells out a badge count in the accessible name', () => {
    render(<BottomNav items={items} currentId="/" />)
    expect(
      screen.getByRole('link', { name: 'Connections, 3 pending' }),
    ).toBeVisible()
  })

  // href decides the element, so the markup stays navigable and shareable;
  // onSelect fires as well, letting a router intercept the click.
  it('keeps destinations as links even when onSelect is supplied', async () => {
    const onSelect = vi.fn()
    render(<BottomNav items={items} currentId="/" onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('link', { name: /Events/ }))

    expect(onSelect).toHaveBeenCalledWith('/events')
  })

  it('renders a destination without href as a button', async () => {
    const onSelect = vi.fn()
    render(
      <BottomNav
        items={[{ id: '/capture', label: 'Capture', icon: <svg /> }]}
        currentId="/"
        onSelect={onSelect}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Capture' }))

    expect(onSelect).toHaveBeenCalledWith('/capture')
  })

  describe('center action', () => {
    // Exchange is an action, not a destination — it must not carry
    // aria-current or sit in the destination list semantics.
    it('is a button with an accessible name', async () => {
      const onClick = vi.fn()
      render(
        <BottomNav
          items={items}
          currentId="/"
          centerAction={{ label: 'Exchange', icon: <svg />, onClick }}
        />,
      )

      const button = screen.getByRole('button', { name: 'Exchange' })
      expect(button).not.toHaveAttribute('aria-current')

      await userEvent.click(button)
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('sits between the destinations', () => {
      render(
        <BottomNav
          items={items}
          currentId="/"
          centerAction={{ label: 'Exchange', icon: <svg />, onClick: vi.fn() }}
        />,
      )

      // Read the visible label element rather than textContent, which would
      // also pick up the badge count rendered inside the icon.
      const names = screen
        .getAllByRole('listitem')
        .map((li) =>
          li
            .querySelector(
              '.deck-bottom-nav__label, .deck-bottom-nav__center-label',
            )
            ?.textContent?.trim(),
        )

      expect(names).toEqual([
        'Dashboard',
        'Connections',
        'Exchange',
        'Events',
        'Me',
      ])
    })
  })
})
